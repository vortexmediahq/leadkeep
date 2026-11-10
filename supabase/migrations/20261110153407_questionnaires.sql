/*
  # Questionnaires (stage 1)

  Applied as a migration on 2026-11-10.
  The app keeps working without it: links fall back to the default questionnaire
  and answers are still saved inside the lead's description.

  1. New table `questionnaires` (owner-only, RLS on).
  2. New column `lead_links.questionnaire_id` (nullable; set null if the questionnaire is deleted).
  3. `public_lead_form` also returns the link's questionnaire (name, intro, questions).
  4. `submit_lead_via_link` also keeps `responses` (array of {question, answer}).
*/

CREATE TABLE IF NOT EXISTS questionnaires (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '' CHECK (length(name) <= 120),
  intro text NOT NULL DEFAULT '' CHECK (length(intro) <= 600),
  questions jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(questions) = 'array'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS questionnaires_user_idx ON questionnaires (user_id, updated_at DESC);

ALTER TABLE questionnaires ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON questionnaires TO authenticated;

DROP POLICY IF EXISTS "select_own_questionnaires" ON questionnaires;
CREATE POLICY "select_own_questionnaires" ON questionnaires FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_questionnaires" ON questionnaires;
CREATE POLICY "insert_own_questionnaires" ON questionnaires FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_questionnaires" ON questionnaires;
CREATE POLICY "update_own_questionnaires" ON questionnaires FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_questionnaires" ON questionnaires;
CREATE POLICY "delete_own_questionnaires" ON questionnaires FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

ALTER TABLE lead_links
  ADD COLUMN IF NOT EXISTS questionnaire_id uuid REFERENCES questionnaires(id) ON DELETE SET NULL;
GRANT UPDATE (source, questionnaire_id) ON lead_links TO authenticated;

-- A link may only point at the owner's own questionnaire.
CREATE OR REPLACE FUNCTION public.check_link_questionnaire()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.questionnaire_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM questionnaires q WHERE q.id = NEW.questionnaire_id AND q.user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'Questionnaire not found' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS lead_links_questionnaire_owner ON lead_links;
CREATE TRIGGER lead_links_questionnaire_owner
  BEFORE INSERT OR UPDATE OF questionnaire_id ON lead_links
  FOR EACH ROW EXECUTE FUNCTION public.check_link_questionnaire();

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
      jsonb_build_object('name', q.name, 'intro', q.intro, 'questions', q.questions) END
  )
  FROM lead_links l
  LEFT JOIN business_profiles p ON p.user_id = l.user_id
  LEFT JOIN questionnaires q ON q.id = l.questionnaire_id AND q.user_id = l.user_id
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
  responses jsonb;
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

  SELECT coalesce(jsonb_agg(jsonb_build_object(
           'question', left(coalesce(r->>'question', ''), 300),
           'answer', left(coalesce(r->>'answer', ''), 2000))), '[]'::jsonb)
    INTO responses
    FROM (
      SELECT r FROM jsonb_array_elements(
        CASE WHEN jsonb_typeof(p_answers->'responses') = 'array' THEN p_answers->'responses' ELSE '[]'::jsonb END
      ) AS r
      LIMIT 30
    ) limited;

  clean := jsonb_build_object(
    'jobType', left(coalesce(p_answers->>'jobType', ''), 200),
    'description', left(coalesce(p_answers->>'description', ''), 4000),
    'urgency', left(coalesce(p_answers->>'urgency', ''), 60),
    'preferredTime', left(coalesce(p_answers->>'preferredTime', ''), 60),
    'propertyType', left(coalesce(p_answers->>'propertyType', ''), 60),
    'budget', left(coalesce(p_answers->>'budget', ''), 200),
    'accessNotes', left(coalesce(p_answers->>'accessNotes', ''), 1000),
    'responses', responses
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
