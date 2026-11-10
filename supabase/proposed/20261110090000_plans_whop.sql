/*
  # Plans, free-plan lead gate and Whop billing (stage 3)

  Applied as a migration on 2026-11-10, after stage 2's 20261105090000_alerts_feedback.sql
  (this file re-creates the small admin helper from it just in case, so it is safe either way).
  The app keeps working without it: until it is applied nobody is limited and the pricing page
  simply shows the plans.

  What it adds
  1. account_entitlements: one row per paying (or early-access) owner: tier free|care|growth,
     founding flag, optional full_access_until (early testers), Whop ids, renewal date.
  2. whop_variants: which Whop plan id means which tier and whether it is the founding price.
  3. whop_events: a log of every Whop webhook (also stops the same event being applied twice).
  4. my_entitlements(): what the app reads. Admins (you) always get everything.
  5. founding_spots_left(): 20 minus founding members so far, shown on the pricing page.
  6. apply_whop_membership(): called only by the whop-webhook edge function (service role).
  7. quote_allowance() / claim_quote_credit(): AI quotes now follow the plan (Free none; Care,
     Growth, testers and admins unlimited). Replaces the stage-0 "5 free quotes" rule.

  Safe to re-run.
*/

-- 0. Admin helper (same as stage 2) -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS app_admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE app_admins ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_leadkeep_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp
AS $$ SELECT EXISTS (SELECT 1 FROM app_admins WHERE user_id = auth.uid()) $$;
REVOKE ALL ON FUNCTION public.is_leadkeep_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_leadkeep_admin() TO authenticated;

-- 1. Entitlements --------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS account_entitlements (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tier text NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'care', 'growth')),
  founding boolean NOT NULL DEFAULT false,
  founding_claimed_at timestamptz,
  full_access_until timestamptz,
  status text NOT NULL DEFAULT 'none' CHECK (status IN ('active', 'cancelling', 'attention', 'none')),
  period_end timestamptz,
  whop_membership_id text,
  whop_user_id text,
  whop_plan_id text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE account_entitlements ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON account_entitlements FROM anon, authenticated;
GRANT SELECT ON account_entitlements TO authenticated;
DROP POLICY IF EXISTS "select_own_entitlements" ON account_entitlements;
CREATE POLICY "select_own_entitlements" ON account_entitlements FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS whop_variants (
  plan_id text PRIMARY KEY,
  tier text NOT NULL CHECK (tier IN ('care', 'growth')),
  founding boolean NOT NULL DEFAULT false
);
ALTER TABLE whop_variants ENABLE ROW LEVEL SECURITY; -- no policies: SQL editor / service role only

INSERT INTO whop_variants (plan_id, tier, founding) VALUES
  ('plan_8tnneDa1AiqYi', 'care',   false), -- Care $49/mo
  ('plan_83fVGMKdf3J9r', 'care',   true),  -- Founding Care $29/mo
  ('plan_0bF14CSmRXbQg', 'growth', false), -- Growth $99/mo
  ('plan_GV13tzo4oC1Ph', 'growth', true)   -- Founding Growth $69/mo
ON CONFLICT (plan_id) DO UPDATE SET tier = EXCLUDED.tier, founding = EXCLUDED.founding;

CREATE TABLE IF NOT EXISTS whop_events (
  event_id text PRIMARY KEY,
  type text NOT NULL DEFAULT '',
  outcome text NOT NULL DEFAULT 'received',
  user_id uuid,
  email text NOT NULL DEFAULT '',
  membership_id text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE whop_events ENABLE ROW LEVEL SECURITY; -- no policies: read it in the SQL editor

-- 2. What each owner gets ------------------------------------------------------------------------
-- The plan that applies right now: admins and early testers get everything.
CREATE OR REPLACE FUNCTION public.entitlement_tier(p_user uuid)
RETURNS text LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp
AS $$
DECLARE
  v account_entitlements%ROWTYPE;
BEGIN
  -- Signed-in users may only ask about themselves. The service role (auth.uid() is null) may ask about anyone.
  IF auth.uid() IS NOT NULL AND auth.uid() <> p_user THEN RETURN NULL; END IF;
  IF EXISTS (SELECT 1 FROM app_admins WHERE user_id = p_user) THEN RETURN 'growth'; END IF;
  SELECT * INTO v FROM account_entitlements WHERE user_id = p_user;
  IF NOT FOUND THEN RETURN 'free'; END IF;
  IF v.full_access_until IS NOT NULL AND v.full_access_until > now() THEN RETURN 'growth'; END IF;
  RETURN v.tier;
END;
$$;
REVOKE ALL ON FUNCTION public.entitlement_tier(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.entitlement_tier(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.my_entitlements()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp
AS $$
  SELECT jsonb_build_object(
    'tier', coalesce(e.tier, 'free'),
    'founding', coalesce(e.founding, false),
    'admin', EXISTS (SELECT 1 FROM app_admins WHERE user_id = auth.uid()),
    'fullAccessUntil', e.full_access_until,
    'status', coalesce(e.status, 'none'),
    'periodEnd', e.period_end
  )
  FROM (SELECT auth.uid() AS uid) me
  LEFT JOIN account_entitlements e ON e.user_id = me.uid
$$;
REVOKE ALL ON FUNCTION public.my_entitlements() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_entitlements() TO authenticated;

CREATE OR REPLACE FUNCTION public.founding_spots_left()
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp
AS $$ SELECT greatest(0, 20 - count(*))::integer FROM account_entitlements WHERE founding_claimed_at IS NOT NULL $$;
REVOKE ALL ON FUNCTION public.founding_spots_left() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.founding_spots_left() TO authenticated;

-- 3. Whop webhook -> plan (service role only) -----------------------------------------------------
CREATE OR REPLACE FUNCTION public.apply_whop_membership(
  p_event_id text,
  p_event_type text,
  p_membership_id text,
  p_plan_id text,
  p_valid boolean,
  p_cancelling boolean,
  p_past_due boolean,
  p_period_end timestamptz,
  p_email text,
  p_user_id uuid,
  p_whop_user_id text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $$
DECLARE
  v_inserted integer;
  v_user uuid;
  v_variant whop_variants%ROWTYPE;
  v_existing account_entitlements%ROWTYPE;
  v_outcome text;
  v_status text;
BEGIN
  INSERT INTO whop_events (event_id, type, membership_id, email)
  VALUES (p_event_id, coalesce(p_event_type, ''), coalesce(p_membership_id, ''), lower(coalesce(p_email, '')))
  ON CONFLICT (event_id) DO NOTHING;
  GET DIAGNOSTICS v_inserted = ROW_COUNT;
  IF v_inserted = 0 THEN RETURN jsonb_build_object('outcome', 'duplicate'); END IF;

  -- Who is it? The user id passed in checkout metadata wins; otherwise match the login email.
  IF p_user_id IS NOT NULL THEN
    SELECT id INTO v_user FROM auth.users WHERE id = p_user_id;
  END IF;
  IF v_user IS NULL AND coalesce(p_email, '') <> '' THEN
    SELECT id INTO v_user FROM auth.users WHERE lower(email) = lower(btrim(p_email)) ORDER BY created_at LIMIT 1;
  END IF;
  IF v_user IS NULL THEN
    v_outcome := 'unmatched'; -- nothing changed: look at whop_events and fix by hand
    UPDATE whop_events SET outcome = v_outcome WHERE event_id = p_event_id;
    RETURN jsonb_build_object('outcome', v_outcome);
  END IF;

  SELECT * INTO v_variant FROM whop_variants WHERE plan_id = p_plan_id;
  IF NOT FOUND THEN
    v_outcome := 'unknown_plan';
    UPDATE whop_events SET outcome = v_outcome, user_id = v_user WHERE event_id = p_event_id;
    RETURN jsonb_build_object('outcome', v_outcome);
  END IF;

  SELECT * INTO v_existing FROM account_entitlements WHERE user_id = v_user;

  IF p_valid THEN
    v_status := CASE WHEN p_past_due THEN 'attention' WHEN p_cancelling THEN 'cancelling' ELSE 'active' END;
    INSERT INTO account_entitlements AS e (
      user_id, tier, founding, founding_claimed_at, status, period_end,
      whop_membership_id, whop_user_id, whop_plan_id, updated_at
    ) VALUES (
      v_user, v_variant.tier, v_variant.founding, CASE WHEN v_variant.founding THEN now() END, v_status, p_period_end,
      p_membership_id, p_whop_user_id, p_plan_id, now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      tier = EXCLUDED.tier,
      founding = e.founding OR EXCLUDED.founding,
      founding_claimed_at = coalesce(e.founding_claimed_at, EXCLUDED.founding_claimed_at),
      status = EXCLUDED.status,
      period_end = EXCLUDED.period_end,
      whop_membership_id = EXCLUDED.whop_membership_id,
      whop_user_id = coalesce(EXCLUDED.whop_user_id, e.whop_user_id),
      whop_plan_id = EXCLUDED.whop_plan_id,
      updated_at = now();
    v_outcome := CASE
      WHEN v_variant.founding AND coalesce(v_existing.founding_claimed_at IS NULL, true)
           AND (SELECT count(*) FROM account_entitlements WHERE founding_claimed_at IS NOT NULL) > 20
        THEN 'activated_over_founding_cap' -- they paid the founding price; honour it, but you may want to know
      ELSE 'activated'
    END;
  ELSE
    -- Ignore an old, ended membership if the owner already has a different, newer one.
    IF v_existing.whop_membership_id IS NOT NULL AND v_existing.whop_membership_id <> coalesce(p_membership_id, '') THEN
      v_outcome := 'ignored_old_membership';
    ELSE
      UPDATE account_entitlements
         SET tier = 'free', status = 'none', period_end = NULL, updated_at = now()
       WHERE user_id = v_user; -- founding flag stays: the spot is used and they keep the price if they return within a year
      v_outcome := 'downgraded'; -- leads are never deleted; extra ones just go back to hidden
    END IF;
  END IF;

  UPDATE whop_events SET outcome = v_outcome, user_id = v_user WHERE event_id = p_event_id;
  RETURN jsonb_build_object('outcome', v_outcome, 'user_id', v_user);
END;
$$;
REVOKE ALL ON FUNCTION public.apply_whop_membership(text, text, text, text, boolean, boolean, boolean, timestamptz, text, uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_whop_membership(text, text, text, text, boolean, boolean, boolean, timestamptz, text, uuid, text) TO service_role;

-- 4. AI quotes follow the plan ---------------------------------------------------------------------
-- Same shapes as before so the app keeps working: plan 'pro' = unlimited (Care, Growth, testers, admins).
CREATE OR REPLACE FUNCTION quote_allowance()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'plan', CASE WHEN public.entitlement_tier(auth.uid()) = 'free' THEN 'free' ELSE 'pro' END,
    'used', (
      SELECT count(*) FROM quote_usage
      WHERE user_id = auth.uid()
        AND created_at >= date_trunc('month', now())
        AND (status = 'used' OR created_at > now() - interval '5 minutes')
    ),
    'limit', 0
  );
$$;

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
  v_limit integer := 0; -- Free has no AI quotes
  v_claim uuid;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'auth');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM leads WHERE id = p_lead_id AND user_id = v_uid) THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'lead');
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended('quote_credit:' || v_uid::text, 0));

  v_plan := CASE WHEN public.entitlement_tier(v_uid) = 'free' THEN 'free' ELSE 'pro' END;

  SELECT count(*) INTO v_used FROM quote_usage
  WHERE user_id = v_uid
    AND created_at >= date_trunc('month', now())
    AND (status = 'used' OR created_at > now() - interval '5 minutes');

  IF v_plan = 'free' THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'limit', 'plan', v_plan, 'used', v_used, 'limit', v_limit);
  END IF;

  INSERT INTO quote_usage (user_id, lead_id, status)
  VALUES (v_uid, p_lead_id, 'pending')
  RETURNING id INTO v_claim;

  RETURN jsonb_build_object('allowed', true, 'claim', v_claim, 'plan', v_plan, 'used', v_used + 1, 'limit', v_limit);
END;
$$;

-- 5. Do these by hand ------------------------------------------------------------------------------
-- Make Berlize the owner (full access, always), using the email she logs in with:
-- INSERT INTO app_admins (user_id) SELECT id FROM auth.users WHERE email = 'YOUR-LOGIN-EMAIL' ON CONFLICT DO NOTHING;
--
-- Give a tester full access until the end of 30 Nov 2026 (South Africa time). Repeat per tester email:
-- INSERT INTO account_entitlements (user_id, full_access_until)
--   SELECT id, '2026-11-30 23:59:59+02' FROM auth.users WHERE email = 'TESTER-EMAIL'
--   ON CONFLICT (user_id) DO UPDATE SET full_access_until = EXCLUDED.full_access_until;
--
-- Check recent Whop payments and anything that didn't match an account:
-- SELECT * FROM whop_events ORDER BY created_at DESC LIMIT 50;
-- SELECT * FROM whop_events WHERE outcome IN ('unmatched', 'unknown_plan', 'activated_over_founding_cap');
