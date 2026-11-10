/*
  # New-lead alerts + feedback (stage 2)

  Applied as a migration on 2026-11-10. The app keeps working without it
  (alert choice is kept on the device; feedback shows "couldn't send yet").

  1. alert_settings: one row per owner. channel = 'app' | 'email' | 'both' (default 'both'),
     last_seen_at = when they last opened the bell.
  2. app_admins: who may read all feedback. Add Berlize with the line at the bottom.
  3. feedback: owners insert + read their own; admins read all.
  4. is_leadkeep_admin(): lets the app show the admin view.
*/

CREATE TABLE IF NOT EXISTS alert_settings (
  user_id uuid PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  channel text NOT NULL DEFAULT 'both' CHECK (channel IN ('app', 'email', 'both')),
  last_seen_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE alert_settings ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON alert_settings TO authenticated;
DROP POLICY IF EXISTS "own_alert_settings" ON alert_settings;
CREATE POLICY "own_alert_settings" ON alert_settings FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS app_admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE app_admins ENABLE ROW LEVEL SECURITY; -- no policies: only the service role / SQL editor can change it

CREATE OR REPLACE FUNCTION public.is_leadkeep_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp
AS $$ SELECT EXISTS (SELECT 1 FROM app_admins WHERE user_id = auth.uid()) $$;
REVOKE ALL ON FUNCTION public.is_leadkeep_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_leadkeep_admin() TO authenticated;

CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'other' CHECK (kind IN ('idea', 'problem', 'praise', 'other')),
  message text NOT NULL CHECK (length(btrim(message)) BETWEEN 3 AND 2000),
  page text NOT NULL DEFAULT '' CHECK (length(page) <= 200),
  email text NOT NULL DEFAULT '' CHECK (length(email) <= 200),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS feedback_created_idx ON feedback (created_at DESC);
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON feedback TO authenticated;
DROP POLICY IF EXISTS "insert_own_feedback" ON feedback;
CREATE POLICY "insert_own_feedback" ON feedback FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "read_own_or_admin_feedback" ON feedback;
CREATE POLICY "read_own_or_admin_feedback" ON feedback FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_leadkeep_admin());

-- Make Berlize the admin (replace the email with the one she logs in with):
-- INSERT INTO app_admins (user_id) SELECT id FROM auth.users WHERE email = 'YOUR-LOGIN-EMAIL' ON CONFLICT DO NOTHING;
