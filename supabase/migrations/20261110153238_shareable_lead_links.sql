/*
# Shareable lead links

Makes each owner's questionnaire links real, saved records that work on any device,
and lets new leads appear in the owner's dashboard instantly.

1. New Tables
- `business_profiles` - one row per owner, shown on the public questionnaire
  - `user_id` (uuid, primary key, defaults to the signed-in user)
  - `name`, `trade`, `city`, `phone`, `email`, `currency` (text)
  - `created_at`, `updated_at`
- `lead_links` - an owner's shareable questionnaire links
  - `id` (uuid, primary key)
  - `user_id` (uuid, defaults to the signed-in user)
  - `slug` (text, unique, random 10-character code used in the public URL)
  - `source` (text, the tag stamped on each lead, e.g. "Facebook Ad")
  - `created_at`

2. Modified Tables
- `leads`: added to the realtime publication so dashboards update live.
- `leads`: new index on (link_id, created_at) for the spam limit below.

3. Security
- RLS on both new tables; owners can only see and change their own rows.
- `public_lead_form(slug)`: callable without sign-in. Returns only the link's
  source, the business name/trade/city and service names. Nothing else.
- `submit_lead_via_link(...)`: callable without sign-in. Owner and source are
  taken from the link itself, never from the visitor. Fields are trimmed and
  clipped, status is always 'new', and each link accepts at most 20
  submissions per 10 minutes.
- The older `submit_lead` / `public_service_names` functions (which trusted a
  visitor-supplied owner id) are removed.

4. Notes
1. Existing leads are untouched.
2. Links are deleted only by their owner; leads keep their source text.
*/

CREATE TABLE IF NOT EXISTS business_profiles (
  user_id uuid PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  trade text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  currency text NOT NULL DEFAULT 'R',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON business_profiles TO authenticated;

DROP POLICY IF EXISTS "select_own_profile" ON business_profiles;
CREATE POLICY "select_own_profile" ON business_profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_profile" ON business_profiles;
CREATE POLICY "insert_own_profile" ON business_profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_profile" ON business_profiles;
CREATE POLICY "update_own_profile" ON business_profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS lead_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE DEFAULT left(replace(gen_random_uuid()::text, '-', ''), 10),
  source text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lead_links_slug_format CHECK (slug ~ '^[a-z0-9]{6,32}$')
);

CREATE INDEX IF NOT EXISTS lead_links_user_id_idx ON lead_links (user_id, created_at DESC);

ALTER TABLE lead_links ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, DELETE ON lead_links TO authenticated;
GRANT UPDATE (source) ON lead_links TO authenticated;

DROP POLICY IF EXISTS "select_own_links" ON lead_links;
CREATE POLICY "select_own_links" ON lead_links FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_links" ON lead_links;
CREATE POLICY "insert_own_links" ON lead_links FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_links" ON lead_links;
CREATE POLICY "update_own_links" ON lead_links FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_links" ON lead_links;
CREATE POLICY "delete_own_links" ON lead_links FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS leads_link_created_idx ON leads (link_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.public_lead_form(p_slug text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT jsonb_build_object(
    'source', l.source,
    'business', jsonb_build_object(
      'name', coalesce(p.name, ''),
      'trade', coalesce(p.trade, ''),
      'city', coalesce(p.city, '')
    ),
    'services', coalesce(
      (SELECT jsonb_agg(s.name ORDER BY s.created_at DESC)
         FROM services s
        WHERE s.user_id = l.user_id AND length(trim(s.name)) > 0),
      '[]'::jsonb
    )
  )
  FROM lead_links l
  LEFT JOIN business_profiles p ON p.user_id = l.user_id
  WHERE l.slug = p_slug;
$$;

CREATE OR REPLACE FUNCTION public.submit_lead_via_link(
  p_slug text,
  p_name text,
  p_phone text,
  p_email text,
  p_address text,
  p_answers jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  link lead_links%ROWTYPE;
  new_id uuid;
  clean jsonb;
BEGIN
  SELECT * INTO link FROM lead_links WHERE slug = p_slug;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'This link is not active' USING ERRCODE = 'P0001';
  END IF;
  IF length(trim(coalesce(p_name, ''))) = 0 OR length(trim(coalesce(p_phone, ''))) < 7 THEN
    RAISE EXCEPTION 'Name and phone are required' USING ERRCODE = 'P0001';
  END IF;
  IF (SELECT count(*) FROM leads
       WHERE link_id = link.slug AND created_at > now() - interval '10 minutes') >= 20 THEN
    RAISE EXCEPTION 'Too many requests, try again shortly' USING ERRCODE = 'P0001';
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
    link.user_id,
    link.slug,
    left(coalesce(nullif(trim(link.source), ''), 'Lead link'), 120),
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

REVOKE EXECUTE ON FUNCTION public.public_lead_form(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.public_lead_form(text) TO anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.submit_lead_via_link(text, text, text, text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_lead_via_link(text, text, text, text, text, jsonb) TO anon, authenticated;

DROP FUNCTION IF EXISTS public.submit_lead(uuid, text, text, text, text, text, text, jsonb);
DROP FUNCTION IF EXISTS public.public_service_names(uuid);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
     WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'leads'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
  END IF;
END $$;
