/*
  # Fresh LeadKeep project (Vortex Supabase account): alert URL + advisor fixes (24 Nov 2026)

  Additive and safe to re-run. Removes no data and no policies.

  1. Alert triggers call this project's edge functions (jzzmghlsbbkiyrabkzrq) instead of the old,
     paused project. Earlier migration files are left exactly as they were.
  2. Security advisor: functions that need a signed-in user are no longer callable by signed-out
     visitors (anon). Public form / quote functions stay public on purpose:
     public_lead_form, submit_lead_via_link, submit_landing_request, view_quote, accept_quote,
     record_failed_login.
  3. Security advisor: quote_style_literal gets a fixed search_path.
  4. Performance advisor: row rules read the login once per query ((select auth.uid())) instead of
     once per row. Same meaning, faster on big tables.
  5. Performance advisor: indexes on four foreign keys.
*/

-- 1. Alerts point at this project ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_edge_function()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, net, pg_temp
AS $$
BEGIN
  BEGIN
    PERFORM net.http_post(
      url := 'https://jzzmghlsbbkiyrabkzrq.supabase.co/functions/v1/' || TG_ARGV[0],
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := jsonb_build_object('type', TG_OP, 'table', TG_TABLE_NAME, 'schema', TG_TABLE_SCHEMA, 'record', to_jsonb(NEW))
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'notify_edge_function(%) failed: %', TG_ARGV[0], SQLERRM;
  END;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.notify_edge_function() FROM PUBLIC, anon, authenticated;

-- 2. Signed-in-only functions: no anon access ---------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.delete_my_account() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.record_sign_in(text, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.unseen_login_events() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.mark_login_events_seen() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_leadkeep_admin() FROM PUBLIC, anon;
-- Trigger function: never needs to be called through the API.
REVOKE EXECUTE ON FUNCTION public.check_link_questionnaire() FROM PUBLIC, anon, authenticated;

-- 3. Fixed search_path ----------------------------------------------------------------------------
ALTER FUNCTION public.quote_style_literal(text) SET search_path = public, pg_temp;

-- 4. (select auth.uid()) in row rules ---------------------------------------------------------------
DO $$
DECLARE
  r record;
  new_qual text;
  new_check text;
  stmt text;
BEGIN
  FOR r IN
    SELECT tablename, policyname, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (qual ~ '(?<!SELECT )auth\.uid\(\)' OR with_check ~ '(?<!SELECT )auth\.uid\(\)')
  LOOP
    new_qual := regexp_replace(r.qual, '(?<!SELECT )auth\.uid\(\)', '(SELECT auth.uid())', 'g');
    new_check := regexp_replace(r.with_check, '(?<!SELECT )auth\.uid\(\)', '(SELECT auth.uid())', 'g');
    stmt := format('ALTER POLICY %I ON public.%I', r.policyname, r.tablename);
    IF new_qual IS NOT NULL THEN stmt := stmt || ' USING (' || new_qual || ')'; END IF;
    IF new_check IS NOT NULL THEN stmt := stmt || ' WITH CHECK (' || new_check || ')'; END IF;
    EXECUTE stmt;
  END LOOP;
END $$;

-- 5. Foreign-key indexes ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS feedback_user_id_idx ON public.feedback (user_id);
CREATE INDEX IF NOT EXISTS lead_links_questionnaire_id_idx ON public.lead_links (questionnaire_id);
CREATE INDEX IF NOT EXISTS lead_links_service_id_idx ON public.lead_links (service_id);
CREATE INDEX IF NOT EXISTS quote_usage_lead_id_idx ON public.quote_usage (lead_id);
