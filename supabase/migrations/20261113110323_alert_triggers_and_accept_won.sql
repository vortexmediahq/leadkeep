/*
  Alerts + accepted quotes (one migration).

  1. New-lead and unusual-login emails: database triggers call the deployed edge functions
     new-lead-alert and unusual-login-alert through pg_net. No secret is needed: the functions do not trust the
     request, they read the real, recent record from the database before they send anything.
     A failed call never blocks a lead or a login (errors are swallowed with a warning).
  2. accept_quote now also marks the lead Won (unless the owner already marked it Lost). Existing accepted
     quotes still sitting on New / Contacted / Quoted are moved to Won once.
  Safe to run more than once.
*/

DO $$ BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_net not available here: alert emails stay off until it is enabled (%).', SQLERRM;
END $$;

CREATE OR REPLACE FUNCTION public.notify_edge_function()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, net, pg_temp
AS $$
BEGIN
  BEGIN
    PERFORM net.http_post(
      url := 'https://ncaiajkflxjhnsvhviue.supabase.co/functions/v1/' || TG_ARGV[0],
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

DROP TRIGGER IF EXISTS notify_new_lead ON public.leads;
CREATE TRIGGER notify_new_lead
  AFTER INSERT ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.notify_edge_function('new-lead-alert');

DROP TRIGGER IF EXISTS notify_unusual_login ON public.login_events;
CREATE TRIGGER notify_unusual_login
  AFTER INSERT ON public.login_events
  FOR EACH ROW WHEN (NEW.kind = 'unusual')
  EXECUTE FUNCTION public.notify_edge_function('unusual-login-alert');

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
     SET quote_state = 'accepted',
         quote_accepted_at = now(),
         status = CASE WHEN status = 'lost' THEN status ELSE 'won' END
   WHERE quote_token = p_token
     AND quote_state IN ('sent', 'viewed')
     AND (quote_expires_at IS NULL OR quote_expires_at >= now());
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n > 0;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.accept_quote(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_quote(text) TO anon, authenticated;

UPDATE leads SET status = 'won' WHERE quote_state = 'accepted' AND status IN ('new', 'contacted', 'quoted');

-- 3. Quote style: instructions and starter hints are never pasted into a quote -------------------
-- "Close with ..." / "Tell customers about ..." are instructions for the writer, not words for a customer.
CREATE OR REPLACE FUNCTION public.quote_style_literal(t text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $f$
  SELECT CASE
    WHEN trim(coalesce(t, '')) = '' THEN ''
    WHEN trim(t) ~* '^(tell|close|end|finish|sign|start|open|begin|write|mention|say|use|add|include|keep|make|always|never|explain|state|list|put)\M' THEN ''
    WHEN t ILIKE '%terms here%' THEN ''
    ELSE trim(t)
  END
$f$;

-- Blank the starter hints that older accounts saved, and tidy quotes that already copied them.
UPDATE quote_templates SET warranty = '' WHERE trim(warranty) = 'Tell customers about any guarantee, refund or cancellation terms here.';
UPDATE quote_templates SET extra = '' WHERE trim(extra) = 'Close with the business name and one line: we will confirm the details by phone.';
UPDATE leads SET quote = replace(replace(quote,
    E'\nWarranty: Tell customers about any guarantee, refund or cancellation terms here.', ''),
    E'\n\nClose with the business name and one line: we will confirm the details by phone.', '')
  WHERE quote LIKE '%Tell customers about any guarantee%' OR quote LIKE '%Close with the business name and one line%';

-- Same quote builder as before; only the warranty and closing lines now go through quote_style_literal().
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
    || CASE WHEN tpl.id IS NOT NULL AND length(public.quote_style_literal(tpl.warranty)) > 0 THEN E'\nWarranty: ' || public.quote_style_literal(tpl.warranty) ELSE '' END
    || E'\n\nThis quote is valid for ' || v_days || ' days.'
    || CASE WHEN tpl.id IS NOT NULL AND length(public.quote_style_literal(tpl.extra)) > 0 THEN E'\n\n' || public.quote_style_literal(tpl.extra) ELSE '' END;

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
