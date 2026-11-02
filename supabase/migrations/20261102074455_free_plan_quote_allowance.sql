/*
# Free plan AI quote allowance

Adds a simple subscription plan per account and a monthly allowance of AI-written
quotes. Free accounts get 5 AI quotes per calendar month (UTC); Pro accounts are
unlimited. Leads and lead links are never limited.

1. New Tables
- `account_plans` - one row per account that has a paid plan
  - `user_id` (uuid, primary key, references auth.users)
  - `plan` (text, 'free' or 'pro')
  - `updated_at` (timestamptz)
  Accounts without a row are on the Free plan.
- `quote_usage` - one row per AI quote written
  - `id` (uuid, primary key)
  - `user_id` (uuid, owner, defaults to auth.uid())
  - `lead_id` (uuid, the lead the quote was for; kept null if the lead is deleted)
  - `status` (text, 'pending' while the quote is being written, 'used' once delivered)
  - `created_at` (timestamptz)

2. Functions
- `quote_allowance()` - SECURITY INVOKER, returns { plan, used, limit } for the caller.
- `claim_quote_credit(p_lead_id)` - SECURITY DEFINER, atomically checks the allowance
  and reserves one credit (pending). Returns { allowed, claim, plan, used, limit }.
- `confirm_quote_credit(p_claim)` - SECURITY DEFINER, marks a pending claim as used.
- `release_quote_credit(p_claim)` - SECURITY DEFINER, gives back a pending claim when
  quote writing failed.

3. Security
- RLS enabled on both tables. Users can only SELECT their own rows.
- Users get SELECT only: they cannot change their plan or erase usage.
  Plans are changed only by the payment system / admins.
- All writes go through the functions above, which act only on auth.uid()'s rows.
- Functions are revoked from PUBLIC/anon and granted to authenticated only.

4. Notes
1. Pending claims older than 5 minutes stop counting, so a crashed request cannot
   permanently consume a credit.
2. A per-user advisory lock prevents parallel requests from exceeding the limit.
*/

CREATE TABLE IF NOT EXISTS account_plans (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE account_plans ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON account_plans FROM anon, authenticated;
GRANT SELECT ON account_plans TO authenticated;

DROP POLICY IF EXISTS "select_own_plan" ON account_plans;
CREATE POLICY "select_own_plan" ON account_plans FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS quote_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'used')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS quote_usage_user_created_idx ON quote_usage (user_id, created_at);

ALTER TABLE quote_usage ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON quote_usage FROM anon, authenticated;
GRANT SELECT ON quote_usage TO authenticated;

DROP POLICY IF EXISTS "select_own_quote_usage" ON quote_usage;
CREATE POLICY "select_own_quote_usage" ON quote_usage FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION quote_allowance()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'plan', coalesce((SELECT plan FROM account_plans WHERE user_id = auth.uid()), 'free'),
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

  SELECT plan INTO v_plan FROM account_plans WHERE user_id = v_uid;
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

CREATE OR REPLACE FUNCTION confirm_quote_credit(p_claim uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE quote_usage SET status = 'used'
  WHERE id = p_claim AND user_id = auth.uid() AND status = 'pending';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count = 1;
END;
$$;

REVOKE EXECUTE ON FUNCTION confirm_quote_credit(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION confirm_quote_credit(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION release_quote_credit(p_claim uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM quote_usage
  WHERE id = p_claim AND user_id = auth.uid() AND status = 'pending';
END;
$$;

REVOKE EXECUTE ON FUNCTION release_quote_credit(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION release_quote_credit(uuid) TO authenticated;
