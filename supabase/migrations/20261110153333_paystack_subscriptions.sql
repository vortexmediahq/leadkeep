/*
# Paystack subscriptions

Stores the Paystack subscription behind each Pro account so payments can switch
Pro on and off automatically.

1. Modified Tables
- `account_plans` (new columns)
  - `status` (text) - 'active', 'non_renewing' (cancelled, runs to end of period),
    'attention' (last payment failed), 'cancelled'
  - `current_period_end` (timestamptz) - when the paid period ends / next charge date
  - `customer_code` (text, unique) - Paystack customer id
  - `subscription_code` (text) - Paystack subscription id
  - `email_token` (text) - Paystack token used to manage the subscription

2. New Tables
- `payment_events` - log of processed Paystack notifications so each one is
  applied once.
  - `id` (text, primary key), `event` (text), `received_at` (timestamptz)

3. Functions
- `user_id_for_email(p_email)` - SECURITY DEFINER, maps a paying customer's email to
  their account. Callable only by the server (service_role).
- `quote_allowance()` and `claim_quote_credit()` updated: Pro counts only while the
  paid period (plus a 3-day renewal grace) has not ended.

4. Security
- Signed-in users can still only read their own plan row, and only the columns
  `user_id, plan, status, current_period_end, updated_at`. Paystack codes and tokens
  are hidden from the browser.
- No user can write plans or payment events; only the server (service_role) can.
- `payment_events` has RLS enabled with no policies (server only).
*/

ALTER TABLE account_plans ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';
ALTER TABLE account_plans ADD COLUMN IF NOT EXISTS current_period_end timestamptz;
ALTER TABLE account_plans ADD COLUMN IF NOT EXISTS customer_code text;
ALTER TABLE account_plans ADD COLUMN IF NOT EXISTS subscription_code text;
ALTER TABLE account_plans ADD COLUMN IF NOT EXISTS email_token text;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'account_plans_status_check') THEN
    ALTER TABLE account_plans ADD CONSTRAINT account_plans_status_check
      CHECK (status IN ('active', 'non_renewing', 'attention', 'cancelled'));
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS account_plans_customer_code_idx
  ON account_plans (customer_code) WHERE customer_code IS NOT NULL;

REVOKE ALL ON account_plans FROM anon, authenticated;
GRANT SELECT (user_id, plan, status, current_period_end, updated_at) ON account_plans TO authenticated;
GRANT SELECT, INSERT, UPDATE ON account_plans TO service_role;

CREATE TABLE IF NOT EXISTS payment_events (
  id text PRIMARY KEY,
  event text NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON payment_events FROM anon, authenticated;
GRANT SELECT, INSERT ON payment_events TO service_role;

CREATE OR REPLACE FUNCTION user_id_for_email(p_email text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT id FROM auth.users WHERE lower(email) = lower(p_email) LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION user_id_for_email(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION user_id_for_email(text) TO service_role;

CREATE OR REPLACE FUNCTION quote_allowance()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'plan', coalesce((
      SELECT CASE
        WHEN plan = 'pro' AND (current_period_end IS NULL OR current_period_end + interval '3 days' > now())
        THEN 'pro' ELSE 'free' END
      FROM account_plans WHERE user_id = auth.uid()
    ), 'free'),
    'status', (SELECT status FROM account_plans WHERE user_id = auth.uid()),
    'periodEnd', (SELECT current_period_end FROM account_plans WHERE user_id = auth.uid()),
    'used', (
      SELECT count(*) FROM quote_usage
      WHERE user_id = auth.uid()
        AND created_at >= date_trunc('month', now())
        AND (status = 'used' OR created_at > now() - interval '5 minutes')
    ),
    'limit', 5
  );
$$;

REVOKE EXECUTE ON FUNCTION quote_allowance() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION quote_allowance() TO authenticated;

CREATE OR REPLACE FUNCTION claim_quote_credit(p_lead_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_plan text;
  v_used integer;
  v_limit integer := 5;
  v_claim uuid;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'auth');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM leads WHERE id = p_lead_id AND user_id = v_uid) THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'lead');
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended('quote_credit:' || v_uid::text, 0));

  SELECT CASE
      WHEN plan = 'pro' AND (current_period_end IS NULL OR current_period_end + interval '3 days' > now())
      THEN 'pro' ELSE 'free' END
    INTO v_plan
  FROM account_plans WHERE user_id = v_uid;
  v_plan := coalesce(v_plan, 'free');

  SELECT count(*) INTO v_used FROM quote_usage
  WHERE user_id = v_uid
    AND created_at >= date_trunc('month', now())
    AND (status = 'used' OR created_at > now() - interval '5 minutes');

  IF v_plan = 'free' AND v_used >= v_limit THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'limit', 'plan', v_plan, 'used', v_used, 'limit', v_limit);
  END IF;

  INSERT INTO quote_usage (user_id, lead_id, status)
  VALUES (v_uid, p_lead_id, 'pending')
  RETURNING id INTO v_claim;

  RETURN jsonb_build_object('allowed', true, 'claim', v_claim, 'plan', v_plan, 'used', v_used + 1, 'limit', v_limit);
END;
$$;

REVOKE EXECUTE ON FUNCTION claim_quote_credit(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION claim_quote_credit(uuid) TO authenticated;
