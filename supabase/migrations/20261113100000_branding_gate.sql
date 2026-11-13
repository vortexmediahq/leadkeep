/*
  # Branding only on Care / Growth (batch 3A)

  NOT YET APPLIED. Run once, AFTER 20261112120000_branding_and_security.sql and the plans update
  (20261110153508_plans_whop.sql), which this uses. Safe to re-run. Removes no data.

  What it does: the public enquiry form returns the owner's logo and colours only when the owner's plan
  includes branding (Care, Growth, early testers, admins). On Free the form shows LeadKeep's default look.
  Saved branding is kept, so upgrading brings it straight back.
*/

CREATE OR REPLACE FUNCTION public.owner_has_branding(p_user uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v account_entitlements%ROWTYPE;
BEGIN
  IF p_user IS NULL THEN RETURN false; END IF;
  IF EXISTS (SELECT 1 FROM app_admins WHERE user_id = p_user) THEN RETURN true; END IF;
  SELECT * INTO v FROM account_entitlements WHERE user_id = p_user;
  IF NOT FOUND THEN RETURN false; END IF;
  IF v.full_access_until IS NOT NULL AND v.full_access_until > now() THEN RETURN true; END IF;
  RETURN v.tier IN ('care', 'growth');
END;
$$;

REVOKE ALL ON FUNCTION public.owner_has_branding(uuid) FROM PUBLIC, anon, authenticated;

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
      WHEN NOT public.owner_has_branding(l.user_id) THEN NULL
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
