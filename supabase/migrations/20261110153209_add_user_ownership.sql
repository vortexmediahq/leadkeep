/*
# Per-user ownership for LeakKeep data

Adds sign-in ownership so each account sees only its own leads, services and quote style,
while customers (who never sign in) can still send a request through a business's share link.

1. Modified Tables
- `services`: new `user_id` (uuid, defaults to the signed-in user, references auth.users)
- `quote_templates`: new `user_id` (same), plus a unique index so each user has one quote style
- `leads`: new `user_id` (same) - the business that owns the lead

Existing rows created before sign-in have no owner (user_id is null). They are kept but are
not visible to any account.

2. Security
- Removed the previous "everyone can read/write" policies and revoked all table access from `anon`.
- `authenticated` users get owner-only SELECT/INSERT/UPDATE (and DELETE on services) via auth.uid() = user_id.
- New function `submit_lead(...)` (SECURITY DEFINER, callable by anon + authenticated):
  inserts a lead for the business identified by `p_owner`. It verifies the owner account exists,
  trims and length-limits every field, and always sets status to 'new' with no quote.
- New function `public_service_names(p_owner)` (SECURITY DEFINER, callable by anon + authenticated):
  returns only the service names of that business so the public form can list them.
  No prices, notes or other data are exposed.

3. Important notes
1. Customers never need an account; the share link carries the business's account id.
2. Anyone with a share link can submit a request to that business (the purpose of the link),
   but cannot read any leads.
*/

ALTER TABLE services ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE quote_templates ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS services_user_id_idx ON services (user_id);
CREATE INDEX IF NOT EXISTS leads_user_id_idx ON leads (user_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS quote_templates_user_id_key ON quote_templates (user_id);

DROP POLICY IF EXISTS "public_select_services" ON services;
DROP POLICY IF EXISTS "public_insert_services" ON services;
DROP POLICY IF EXISTS "public_update_services" ON services;
DROP POLICY IF EXISTS "public_delete_services" ON services;
DROP POLICY IF EXISTS "public_select_quote_templates" ON quote_templates;
DROP POLICY IF EXISTS "public_insert_quote_templates" ON quote_templates;
DROP POLICY IF EXISTS "public_update_quote_templates" ON quote_templates;
DROP POLICY IF EXISTS "public_select_leads" ON leads;
DROP POLICY IF EXISTS "public_insert_leads" ON leads;
DROP POLICY IF EXISTS "public_update_leads" ON leads;

REVOKE ALL ON services, quote_templates, leads FROM anon;
REVOKE ALL ON services, quote_templates, leads FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON services TO authenticated;
GRANT SELECT, INSERT, UPDATE ON quote_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE ON leads TO authenticated;

DROP POLICY IF EXISTS "select_own_services" ON services;
CREATE POLICY "select_own_services" ON services FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_services" ON services;
CREATE POLICY "insert_own_services" ON services FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_services" ON services;
CREATE POLICY "update_own_services" ON services FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_services" ON services;
CREATE POLICY "delete_own_services" ON services FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "select_own_quote_templates" ON quote_templates;
CREATE POLICY "select_own_quote_templates" ON quote_templates FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_quote_templates" ON quote_templates;
CREATE POLICY "insert_own_quote_templates" ON quote_templates FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_quote_templates" ON quote_templates;
CREATE POLICY "update_own_quote_templates" ON quote_templates FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "select_own_leads" ON leads;
CREATE POLICY "select_own_leads" ON leads FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_leads" ON leads;
CREATE POLICY "insert_own_leads" ON leads FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_leads" ON leads;
CREATE POLICY "update_own_leads" ON leads FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.submit_lead(
  p_owner uuid,
  p_link_id text,
  p_source text,
  p_name text,
  p_phone text,
  p_email text,
  p_address text,
  p_answers jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  new_id uuid;
  clean jsonb;
BEGIN
  IF p_owner IS NULL OR NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_owner) THEN
    RAISE EXCEPTION 'This link is not active' USING ERRCODE = 'P0001';
  END IF;
  IF length(trim(coalesce(p_name, ''))) = 0 OR length(trim(coalesce(p_phone, ''))) < 7 THEN
    RAISE EXCEPTION 'Name and phone are required' USING ERRCODE = 'P0001';
  END IF;

  clean := jsonb_build_object(
    'jobType', left(coalesce(p_answers->>'jobType', ''), 200),
    'description', left(coalesce(p_answers->>'description', ''), 4000),
    'urgency', left(coalesce(p_answers->>'urgency', ''), 60),
    'preferredTime', left(coalesce(p_answers->>'preferredTime', ''), 60),
    'propertyType', left(coalesce(p_answers->>'propertyType', ''), 60),
    'budget', left(coalesce(p_answers->>'budget', ''), 200),
    'accessNotes', left(coalesce(p_answers->>'accessNotes', ''), 1000)
  );

  INSERT INTO leads (user_id, link_id, source, customer_name, phone, email, address, answers, status)
  VALUES (
    p_owner,
    left(trim(coalesce(p_link_id, '')), 120),
    left(trim(coalesce(p_source, '')), 120),
    left(trim(p_name), 200),
    left(trim(p_phone), 40),
    left(trim(coalesce(p_email, '')), 200),
    left(trim(coalesce(p_address, '')), 300),
    clean,
    'new'
  )
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.public_service_names(p_owner uuid)
RETURNS SETOF text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT name FROM services
  WHERE user_id = p_owner AND length(trim(name)) > 0
  ORDER BY created_at DESC
  LIMIT 100;
$$;

REVOKE EXECUTE ON FUNCTION public.submit_lead(uuid, text, text, text, text, text, text, jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.public_service_names(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_lead(uuid, text, text, text, text, text, text, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.public_service_names(uuid) TO anon, authenticated;
