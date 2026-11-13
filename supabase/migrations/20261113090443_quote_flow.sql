/*
  # Quote links, simple links, customer quote page (batch 3C)

  NOT YET APPLIED. Run once, after 20261113100000_branding_gate.sql. Additive and safe to re-run.
  The app keeps working without it (the new link types and quote page simply stay off).

  1. business_profiles: logo tick boxes (quote, form), quote style, quote background, quote validity days.
  2. lead_links: kind (questionnaire | simple | quote), service, landing headline/intro/image/video, button text, auto-send.
  3. leads: service name, private quote token, quote state, sent/viewed/accepted/expiry/emailed times.
  4. public_lead_form: also returns the link kind + landing details (keeps every earlier field).
  5. submit_landing_request: customer submits a simple or quote link (consent + honeypot + rate limit).
     Quote links build the quote from the owner's saved service price. Fixed prices go out at once if auto-send
     is on; ranges / "from" / unclear prices are held as 'review' so the owner checks them first.
  6. view_quote (marks viewed) and accept_quote: the private customer quote page.
*/

-- 1. Profile options ---------------------------------------------------------------------------
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS logo_on_quote boolean NOT NULL DEFAULT true;
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS logo_on_form boolean NOT NULL DEFAULT true;
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS quote_style text NOT NULL DEFAULT 'clean';
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS quote_bg_path text NOT NULL DEFAULT '';
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS quote_valid_days integer NOT NULL DEFAULT 14;

DO $$ BEGIN
  ALTER TABLE business_profiles ADD CONSTRAINT business_profiles_quote_style_ok CHECK (quote_style IN ('clean', 'bold', 'classic'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE business_profiles ADD CONSTRAINT business_profiles_quote_days_ok CHECK (quote_valid_days BETWEEN 1 AND 90);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE business_profiles ADD CONSTRAINT business_profiles_quote_bg_len CHECK (length(quote_bg_path) <= 300);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Link kinds --------------------------------------------------------------------------------
ALTER TABLE lead_links ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'questionnaire';
ALTER TABLE lead_links ADD COLUMN IF NOT EXISTS service_id uuid REFERENCES services(id) ON DELETE SET NULL;
ALTER TABLE lead_links ADD COLUMN IF NOT EXISTS headline text NOT NULL DEFAULT '';
ALTER TABLE lead_links ADD COLUMN IF NOT EXISTS intro text NOT NULL DEFAULT '';
ALTER TABLE lead_links ADD COLUMN IF NOT EXISTS media_path text NOT NULL DEFAULT '';
ALTER TABLE lead_links ADD COLUMN IF NOT EXISTS media_url text NOT NULL DEFAULT '';
ALTER TABLE lead_links ADD COLUMN IF NOT EXISTS cta_text text NOT NULL DEFAULT '';
ALTER TABLE lead_links ADD COLUMN IF NOT EXISTS auto_send boolean NOT NULL DEFAULT true;

DO $$ BEGIN
  ALTER TABLE lead_links ADD CONSTRAINT lead_links_kind_ok CHECK (kind IN ('questionnaire', 'simple', 'quote'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE lead_links ADD CONSTRAINT lead_links_landing_len CHECK (
    length(headline) <= 120 AND length(intro) <= 600 AND length(media_path) <= 300
    AND length(media_url) <= 300 AND length(cta_text) <= 40);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

GRANT UPDATE (headline, intro, media_path, media_url, cta_text, auto_send, service_id) ON public.lead_links TO authenticated;

-- A quote link may only point at one of the owner's own services.
CREATE OR REPLACE FUNCTION public.check_link_service()
RETURNS trigger LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
  IF NEW.service_id IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM services s WHERE s.id = NEW.service_id AND s.user_id = NEW.user_id) THEN
    RAISE EXCEPTION 'That service is not yours' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS lead_links_check_service ON lead_links;
CREATE TRIGGER lead_links_check_service BEFORE INSERT OR UPDATE OF service_id ON lead_links
  FOR EACH ROW EXECUTE FUNCTION public.check_link_service();

-- 3. Quote tracking on leads -------------------------------------------------------------------
ALTER TABLE leads ADD COLUMN IF NOT EXISTS service_name text NOT NULL DEFAULT '';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS quote_token text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS quote_state text NOT NULL DEFAULT '';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS quote_sent_at timestamptz;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS quote_viewed_at timestamptz;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS quote_accepted_at timestamptz;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS quote_expires_at timestamptz;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS quote_emailed_at timestamptz;

DO $$ BEGIN
  ALTER TABLE leads ADD CONSTRAINT leads_quote_state_ok CHECK (quote_state IN ('', 'review', 'sent', 'viewed', 'accepted'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE leads ADD CONSTRAINT leads_quote_token_format CHECK (quote_token IS NULL OR quote_token ~ '^[a-z0-9]{24,64}$');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE UNIQUE INDEX IF NOT EXISTS leads_quote_token_key ON leads (quote_token) WHERE quote_token IS NOT NULL;

-- 4. Public link details -----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.public_lead_form(p_slug text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT jsonb_build_object(
    'source', l.source,
    'kind', l.kind,
    'landing', jsonb_build_object(
      'headline', l.headline,
      'intro', l.intro,
      'media_path', l.media_path,
      'media_url', l.media_url,
      'cta_text', l.cta_text,
      'service_name', coalesce(sv.name, '')
    ),
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
      WHEN NOT public.owner_has_branding(l.user_id) THEN NULL
      ELSE jsonb_build_object(
        'logo_path', CASE WHEN coalesce(p.logo_on_form, true) THEN coalesce(p.logo_path, '') ELSE '' END,
        'primary_color', coalesce(p.primary_color, ''),
        'accent_color', coalesce(p.accent_color, ''),
        'font', coalesce(p.font, 'sans')
      )
    END
  )
  FROM lead_links l
  LEFT JOIN business_profiles p ON p.user_id = l.user_id
  LEFT JOIN services sv ON sv.id = l.service_id AND sv.user_id = l.user_id
  LEFT JOIN questionnaires q ON q.id = l.questionnaire_id AND q.user_id = l.user_id
  WHERE l.slug = p_slug;
$$;

REVOKE EXECUTE ON FUNCTION public.public_lead_form(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.public_lead_form(text) TO anon, authenticated;

-- 5. Customer submits a simple or quote link ---------------------------------------------------
CREATE OR REPLACE FUNCTION public.submit_landing_request(
  p_slug text,
  p_name text,
  p_email text,
  p_phone text,
  p_website text,
  p_consent boolean
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  link lead_links%ROWTYPE;
  prof business_profiles%ROWTYPE;
  tpl quote_templates%ROWTYPE;
  svc services%ROWTYPE;
  v_name text := left(trim(coalesce(p_name, '')), 200);
  v_email text := left(trim(coalesce(p_email, '')), 200);
  v_phone text := left(trim(coalesce(p_phone, '')), 40);
  fixed boolean := false;
  v_state text := '';
  v_token text;
  v_text text := '';
  v_days integer := 14;
  v_currency text;
  new_id uuid;
  v_source text;
BEGIN
  -- Honeypot: real people never fill the hidden "website" box. Pretend it worked, store nothing.
  IF length(trim(coalesce(p_website, ''))) > 0 THEN
    RETURN jsonb_build_object('ok', true, 'state', '', 'token', NULL, 'lead_id', NULL);
  END IF;

  SELECT * INTO link FROM lead_links WHERE slug = p_slug;
  IF NOT FOUND OR link.kind NOT IN ('simple', 'quote') THEN
    RAISE EXCEPTION 'This link is not active' USING ERRCODE = 'P0001';
  END IF;
  IF p_consent IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Please tick the box so we can reply to you' USING ERRCODE = 'P0001';
  END IF;
  IF length(v_name) = 0 THEN
    RAISE EXCEPTION 'Name is required' USING ERRCODE = 'P0001';
  END IF;
  IF v_email <> '' AND v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' THEN
    RAISE EXCEPTION 'Check your email address' USING ERRCODE = 'P0001';
  END IF;
  IF link.kind = 'quote' AND v_email = '' THEN
    RAISE EXCEPTION 'Email is required to send your quote' USING ERRCODE = 'P0001';
  END IF;
  IF link.kind = 'simple' AND v_email = '' AND length(v_phone) < 7 THEN
    RAISE EXCEPTION 'Add an email or a phone number' USING ERRCODE = 'P0001';
  END IF;
  IF (SELECT count(*) FROM leads
       WHERE link_id = link.slug AND created_at > now() - interval '10 minutes') >= 20 THEN
    RAISE EXCEPTION 'Too many requests, try again shortly' USING ERRCODE = 'P0001';
  END IF;

  SELECT * INTO prof FROM business_profiles WHERE user_id = link.user_id;

  IF link.kind = 'simple' THEN
    INSERT INTO leads (user_id, link_id, source, customer_name, phone, email, address, answers, status)
    VALUES (
      link.user_id, link.slug,
      left(coalesce(nullif(trim(link.source), ''), 'Lead link'), 120),
      v_name, v_phone, v_email, '',
      jsonb_build_object(
        'jobType', left(coalesce(nullif(trim(link.headline), ''), 'Enquiry'), 200),
        'description', left('Asked: ' || coalesce(nullif(trim(link.cta_text), ''), 'Send me more info'), 4000),
        'responses', '[]'::jsonb),
      'new')
    RETURNING id INTO new_id;
    RETURN jsonb_build_object('ok', true, 'state', '', 'token', NULL, 'lead_id', new_id);
  END IF;

  -- Quote link
  SELECT * INTO svc FROM services WHERE id = link.service_id AND user_id = link.user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'This quote link is not active' USING ERRCODE = 'P0001';
  END IF;
  SELECT * INTO tpl FROM quote_templates WHERE user_id = link.user_id ORDER BY updated_at DESC LIMIT 1;
  v_days := coalesce(prof.quote_valid_days, 14);
  v_currency := coalesce(nullif(trim(prof.currency), ''), 'R');

  -- A clear single price (like R650 or $1,200) can go out by itself. Ranges, "from" and unclear prices wait.
  fixed := trim(coalesce(svc.price, '')) ~ '^[A-Za-z$€£]{0,3} ?[0-9][0-9 ,.]*$';
  v_state := CASE WHEN link.auto_send AND fixed THEN 'sent' ELSE 'review' END;
  v_token := left(replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''), 40);

  v_text := 'Quote for ' || v_name || E'\n\n'
    || coalesce(nullif(trim(prof.name), ''), 'Our business')
    || CASE WHEN length(trim(coalesce(prof.phone, '') || coalesce(prof.email, ''))) > 0
         THEN E'\n' || concat_ws(' · ', nullif(trim(prof.phone), ''), nullif(trim(prof.email), '')) ELSE '' END
    || E'\n\nService: ' || svc.name
    || CASE WHEN length(trim(coalesce(svc.description, ''))) > 0 THEN E'\n' || trim(svc.description) ELSE '' END
    || E'\n\nPrice: ' || CASE WHEN length(trim(coalesce(svc.price, ''))) > 0 THEN trim(svc.price) ELSE 'We will confirm the price with you' END
    || CASE WHEN length(trim(coalesce(svc.notes, ''))) > 0 THEN E'\n' || trim(svc.notes) ELSE '' END
    || CASE WHEN tpl.id IS NOT NULL AND length(trim(coalesce(tpl.payment_terms, ''))) > 0 THEN E'\n\nPayment terms: ' || trim(tpl.payment_terms) ELSE '' END
    || CASE WHEN tpl.id IS NOT NULL AND length(trim(coalesce(tpl.warranty, ''))) > 0 THEN E'\nWarranty: ' || trim(tpl.warranty) ELSE '' END
    || E'\n\nThis quote is valid for ' || v_days || ' days.'
    || CASE WHEN tpl.id IS NOT NULL AND length(trim(coalesce(tpl.extra, ''))) > 0 THEN E'\n\n' || trim(tpl.extra) ELSE '' END;

  v_source := left(concat_ws(' – ', nullif(trim(link.source), ''), svc.name), 120);

  INSERT INTO leads (
    user_id, link_id, source, customer_name, phone, email, address, answers, status,
    quote, quote_updated_at, service_name, quote_token, quote_state, quote_sent_at, quote_expires_at
  )
  VALUES (
    link.user_id, link.slug, v_source, v_name, v_phone, v_email, '',
    jsonb_build_object(
      'jobType', left(svc.name, 200),
      'description', left('Asked for a quote on ' || svc.name, 4000),
      'responses', '[]'::jsonb),
    CASE WHEN v_state = 'sent' THEN 'quoted' ELSE 'new' END,
    left(v_text, 8000), now(), left(svc.name, 200), v_token, v_state,
    CASE WHEN v_state = 'sent' THEN now() END,
    CASE WHEN v_state = 'sent' THEN now() + make_interval(days => v_days) END
  )
  RETURNING id INTO new_id;

  RETURN jsonb_build_object(
    'ok', true, 'state', v_state,
    'token', CASE WHEN v_state = 'sent' THEN v_token END,
    'lead_id', new_id);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.submit_landing_request(text, text, text, text, text, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_landing_request(text, text, text, text, text, boolean) TO anon, authenticated;

-- 6. Private customer quote page ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.view_quote(p_token text, p_track boolean DEFAULT true)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  l leads%ROWTYPE;
  p business_profiles%ROWTYPE;
  v_expired boolean;
  v_brand boolean;
BEGIN
  IF p_token IS NULL OR p_token !~ '^[a-z0-9]{24,64}$' THEN RETURN NULL; END IF;
  SELECT * INTO l FROM leads WHERE quote_token = p_token AND quote_state IN ('sent', 'viewed', 'accepted');
  IF NOT FOUND THEN RETURN NULL; END IF;
  SELECT * INTO p FROM business_profiles WHERE user_id = l.user_id;
  v_expired := l.quote_expires_at IS NOT NULL AND l.quote_expires_at < now() AND l.quote_state <> 'accepted';

  IF p_track AND l.quote_state = 'sent' AND NOT v_expired THEN
    UPDATE leads SET quote_state = 'viewed', quote_viewed_at = now() WHERE id = l.id;
    l.quote_state := 'viewed';
  END IF;

  v_brand := coalesce(p.show_on_quote, true) AND public.owner_has_branding(l.user_id);
  RETURN jsonb_build_object(
    'text', coalesce(l.quote, ''),
    'customer', l.customer_name,
    'service', l.service_name,
    'state', l.quote_state,
    'expired', v_expired,
    'expires_at', l.quote_expires_at,
    'accepted_at', l.quote_accepted_at,
    'business', jsonb_build_object('name', coalesce(p.name, ''), 'phone', coalesce(p.phone, ''), 'email', coalesce(p.email, '')),
    'style', CASE WHEN v_brand THEN coalesce(p.quote_style, 'clean') ELSE 'clean' END,
    'background_path', CASE WHEN v_brand THEN coalesce(p.quote_bg_path, '') ELSE '' END,
    'branding', CASE WHEN NOT v_brand THEN NULL ELSE jsonb_build_object(
      'logo_path', CASE WHEN coalesce(p.logo_on_quote, true) THEN coalesce(p.logo_path, '') ELSE '' END,
      'primary_color', coalesce(p.primary_color, ''),
      'accent_color', coalesce(p.accent_color, ''),
      'font', coalesce(p.font, 'sans')) END
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.accept_quote(p_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  n integer;
BEGIN
  IF p_token IS NULL OR p_token !~ '^[a-z0-9]{24,64}$' THEN RETURN false; END IF;
  UPDATE leads
     SET quote_state = 'accepted', quote_accepted_at = now()
   WHERE quote_token = p_token
     AND quote_state IN ('sent', 'viewed')
     AND (quote_expires_at IS NULL OR quote_expires_at >= now());
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n > 0;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.view_quote(text, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.view_quote(text, boolean) TO anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.accept_quote(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_quote(text) TO anon, authenticated;
