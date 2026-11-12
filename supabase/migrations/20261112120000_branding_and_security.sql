/*
  # Branding, login events, and account deletion (batch 2)

  Additive and idempotent. The app keeps working if this has not been applied yet
  (branding falls back to LeadKeep defaults; security notices stay empty).

  1. business_profiles: logo_path, primary_color, accent_color, font,
     show_on_quote, show_on_form.
  2. Storage bucket `brand-assets` (public read, owner-only write in their folder).
  3. public_lead_form also returns branding when show_on_form is true
     (logo path, colours, font). Name/trade/city and questionnaires are unchanged.
  4. login_events + failed_logins, with record_sign_in / record_failed_login /
     unseen_login_events / mark_login_events_seen.
  5. delete_my_account() removes the signed-in user's auth row (app data cascades).
*/

-- 1. Branding columns
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS logo_path text NOT NULL DEFAULT '';
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS primary_color text NOT NULL DEFAULT '';
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS accent_color text NOT NULL DEFAULT '';
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS font text NOT NULL DEFAULT 'sans';
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS show_on_quote boolean NOT NULL DEFAULT true;
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS show_on_form boolean NOT NULL DEFAULT true;

DO $$
BEGIN
  ALTER TABLE business_profiles
    ADD CONSTRAINT business_profiles_logo_path_len CHECK (length(logo_path) <= 300);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE business_profiles
    ADD CONSTRAINT business_profiles_primary_color_hex
    CHECK (primary_color = '' OR primary_color ~ '^#[0-9A-Fa-f]{6}$');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE business_profiles
    ADD CONSTRAINT business_profiles_accent_color_hex
    CHECK (accent_color = '' OR accent_color ~ '^#[0-9A-Fa-f]{6}$');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE business_profiles
    ADD CONSTRAINT business_profiles_font_ok
    CHECK (font IN ('sans', 'serif', 'system'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Logo storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'brand-assets',
  'brand-assets',
  true,
  2097152,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_read_brand_assets" ON storage.objects;
CREATE POLICY "public_read_brand_assets" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'brand-assets');

DROP POLICY IF EXISTS "owners_insert_brand_assets" ON storage.objects;
CREATE POLICY "owners_insert_brand_assets" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'brand-assets'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

DROP POLICY IF EXISTS "owners_update_brand_assets" ON storage.objects;
CREATE POLICY "owners_update_brand_assets" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'brand-assets'
    AND split_part(name, '/', 1) = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'brand-assets'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

DROP POLICY IF EXISTS "owners_delete_brand_assets" ON storage.objects;
CREATE POLICY "owners_delete_brand_assets" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'brand-assets'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

-- 3. Public form also returns branding (keeps questionnaire + business name fields)
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
    ),
    'questionnaire', CASE WHEN q.id IS NULL THEN NULL ELSE
      jsonb_build_object('name', q.name, 'intro', q.intro, 'questions', q.questions) END,
    'branding', CASE
      WHEN p.user_id IS NULL OR coalesce(p.show_on_form, true) = false THEN NULL
      ELSE jsonb_build_object(
        'logo_path', coalesce(p.logo_path, ''),
        'primary_color', coalesce(p.primary_color, ''),
        'accent_color', coalesce(p.accent_color, ''),
        'font', coalesce(p.font, 'sans')
      )
    END
  )
  FROM lead_links l
  LEFT JOIN business_profiles p ON p.user_id = l.user_id
  LEFT JOIN questionnaires q ON q.id = l.questionnaire_id AND q.user_id = l.user_id
  WHERE l.slug = p_slug;
$$;

REVOKE EXECUTE ON FUNCTION public.public_lead_form(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.public_lead_form(text) TO anon, authenticated;

-- 4. Login events
CREATE TABLE IF NOT EXISTS login_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('sign_in', 'unusual')),
  reason text NOT NULL DEFAULT '' CHECK (reason IN ('', 'new_device', 'new_location', 'failed_logins')),
  device_label text NOT NULL DEFAULT '' CHECK (length(device_label) <= 120),
  device_hash text NOT NULL DEFAULT '' CHECK (length(device_hash) <= 128),
  timezone text NOT NULL DEFAULT '' CHECK (length(timezone) <= 80),
  created_at timestamptz NOT NULL DEFAULT now(),
  seen_at timestamptz
);

CREATE INDEX IF NOT EXISTS login_events_user_idx ON login_events (user_id, created_at DESC);

ALTER TABLE login_events ENABLE ROW LEVEL SECURITY;
GRANT SELECT, UPDATE (seen_at) ON login_events TO authenticated;

DROP POLICY IF EXISTS "select_own_login_events" ON login_events;
CREATE POLICY "select_own_login_events" ON login_events
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_login_events" ON login_events;
CREATE POLICY "update_own_login_events" ON login_events
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS failed_logins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_hash text NOT NULL CHECK (length(email_hash) = 64),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS failed_logins_hash_idx ON failed_logins (email_hash, created_at DESC);

ALTER TABLE failed_logins ENABLE ROW LEVEL SECURITY;
-- No policies: only security-definer functions may write or read this table.

CREATE OR REPLACE FUNCTION public.record_sign_in(
  p_device_hash text,
  p_device_label text,
  p_timezone text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  uid uuid := auth.uid();
  hash text := left(trim(coalesce(p_device_hash, '')), 128);
  label text := left(trim(coalesce(p_device_label, '')), 120);
  tz text := left(trim(coalesce(p_timezone, '')), 80);
  known boolean := false;
  prior boolean := false;
  last_tz text;
  unusual_ids uuid[] := '{}';
  sign_in_id uuid;
  unusual_id uuid;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not signed in' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO login_events (user_id, kind, device_label, device_hash, timezone)
  VALUES (uid, 'sign_in', label, hash, tz)
  RETURNING id INTO sign_in_id;

  SELECT EXISTS (
    SELECT 1 FROM login_events
    WHERE user_id = uid AND kind = 'sign_in' AND id <> sign_in_id
  ) INTO prior;

  -- A brand-new account's first sign-in is not unusual.
  IF prior AND hash <> '' THEN
    SELECT EXISTS (
      SELECT 1 FROM login_events
      WHERE user_id = uid AND kind = 'sign_in' AND device_hash = hash AND id <> sign_in_id
    ) INTO known;

    IF NOT known THEN
      INSERT INTO login_events (user_id, kind, reason, device_label, device_hash, timezone)
      VALUES (uid, 'unusual', 'new_device', label, hash, tz)
      RETURNING id INTO unusual_id;
      unusual_ids := array_append(unusual_ids, unusual_id);
    END IF;
  END IF;

  IF prior AND tz <> '' THEN
    SELECT timezone INTO last_tz
    FROM login_events
    WHERE user_id = uid AND kind = 'sign_in' AND id <> sign_in_id AND timezone <> ''
    ORDER BY created_at DESC
    LIMIT 1;

    IF last_tz IS NOT NULL AND last_tz <> tz THEN
      INSERT INTO login_events (user_id, kind, reason, device_label, device_hash, timezone)
      VALUES (uid, 'unusual', 'new_location', label, hash, tz)
      RETURNING id INTO unusual_id;
      unusual_ids := array_append(unusual_ids, unusual_id);
    END IF;
  END IF;

  RETURN jsonb_build_object('unusual_ids', to_jsonb(unusual_ids));
END;
$$;

CREATE OR REPLACE FUNCTION public.record_failed_login(p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  hash text;
  recent int;
  uid uuid;
BEGIN
  IF p_email IS NULL OR position('@' IN p_email) = 0 THEN
    RETURN;
  END IF;

  hash := encode(extensions.digest(convert_to(lower(trim(p_email)), 'UTF8'), 'sha256'), 'hex');

  -- Simple rate limit so this cannot be used to flood the table.
  IF (SELECT count(*) FROM failed_logins WHERE email_hash = hash AND created_at > now() - interval '1 hour') >= 20 THEN
    RETURN;
  END IF;

  INSERT INTO failed_logins (email_hash) VALUES (hash);
  DELETE FROM failed_logins WHERE created_at < now() - interval '2 days';

  SELECT count(*) INTO recent
  FROM failed_logins
  WHERE email_hash = hash AND created_at > now() - interval '15 minutes';

  IF recent < 5 THEN
    RETURN;
  END IF;

  SELECT id INTO uid FROM auth.users WHERE lower(email) = lower(trim(p_email)) LIMIT 1;
  IF uid IS NULL THEN
    RETURN;
  END IF;

  -- One notice per 15-minute burst, not one per extra failed attempt.
  IF EXISTS (
    SELECT 1 FROM login_events
    WHERE user_id = uid AND kind = 'unusual' AND reason = 'failed_logins'
      AND created_at > now() - interval '15 minutes'
  ) THEN
    RETURN;
  END IF;

  INSERT INTO login_events (user_id, kind, reason)
  VALUES (uid, 'unusual', 'failed_logins');
END;
$$;

CREATE OR REPLACE FUNCTION public.unseen_login_events()
RETURNS SETOF login_events
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT * FROM login_events
  WHERE user_id = auth.uid() AND kind = 'unusual' AND seen_at IS NULL
  ORDER BY created_at DESC
  LIMIT 20;
$$;

CREATE OR REPLACE FUNCTION public.mark_login_events_seen()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  UPDATE login_events
     SET seen_at = now()
   WHERE user_id = auth.uid() AND kind = 'unusual' AND seen_at IS NULL;
$$;

REVOKE ALL ON FUNCTION public.record_sign_in(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_sign_in(text, text, text) TO authenticated;
REVOKE ALL ON FUNCTION public.record_failed_login(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_failed_login(text) TO anon, authenticated;
REVOKE ALL ON FUNCTION public.unseen_login_events() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unseen_login_events() TO authenticated;
REVOKE ALL ON FUNCTION public.mark_login_events_seen() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_login_events_seen() TO authenticated;

-- 5. Account deletion (app rows cascade from auth.users)
CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not signed in' USING ERRCODE = 'P0001';
  END IF;
  DELETE FROM storage.objects
  WHERE bucket_id = 'brand-assets' AND split_part(name, '/', 1) = uid::text;
  DELETE FROM auth.users WHERE id = uid;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_my_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;
