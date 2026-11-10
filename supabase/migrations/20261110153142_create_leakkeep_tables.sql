/*
# LeakKeep core tables: services, quote_templates, leads

Moves LeakKeep's data out of the browser and into the database so it persists
across reloads and devices.

1. New Tables
- `services` - the price list quotes are based on
  - `id` (uuid, primary key)
  - `name` (text) - service name
  - `description` (text) - what the visit includes
  - `price` (text) - a price or price range, e.g. "R650-R1,800"
  - `notes` (text) - call-out fees, exclusions, parts
  - `created_at`, `updated_at` (timestamptz)
- `quote_templates` - the owner's preferred quote style (the app uses the most recent row)
  - `id` (uuid, primary key)
  - `tone`, `structure`, `payment_terms`, `warranty`, `extra` (text) - template text sections
  - `created_at`, `updated_at` (timestamptz)
- `leads` - customer requests from the public questionnaire
  - `id` (uuid, primary key)
  - `link_id` (text) - which share link the request came through
  - `source` (text) - e.g. "Facebook Ad"
  - `customer_name`, `phone`, `email`, `address` (text) - contact info
  - `answers` (jsonb) - questionnaire answers (jobType, description, urgency,
    preferredTime, propertyType, budget, accessNotes)
  - `status` (text) - one of new, contacted, quoted, won, lost
  - `quote` (text, nullable), `quote_updated_at` (timestamptz, nullable)
  - `created_at` (timestamptz)

2. Security
- RLS enabled on all three tables.
- The app has no sign-in, so the `anon` and `authenticated` roles get
  SELECT/INSERT/UPDATE/DELETE with `USING (true)` policies: the data is
  intentionally shared by everyone using this single-business app.

3. Important notes
1. Because there is no sign-in, anyone holding the app's public key can read
   and change these rows, including customer contact details. Adding owner
   sign-in is the recommended next step.
2. `status` is constrained to the five pipeline values.
*/

CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  price text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quote_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tone text NOT NULL DEFAULT '',
  structure text NOT NULL DEFAULT '',
  payment_terms text NOT NULL DEFAULT '',
  warranty text NOT NULL DEFAULT '',
  extra text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT '',
  customer_name text NOT NULL,
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','quoted','won','lost')),
  quote text,
  quote_updated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS services_created_at_idx ON services (created_at DESC);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON services TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON quote_templates TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON leads TO anon, authenticated;

DROP POLICY IF EXISTS "public_select_services" ON services;
CREATE POLICY "public_select_services" ON services FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_services" ON services;
CREATE POLICY "public_insert_services" ON services FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_services" ON services;
CREATE POLICY "public_update_services" ON services FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_delete_services" ON services;
CREATE POLICY "public_delete_services" ON services FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_select_quote_templates" ON quote_templates;
CREATE POLICY "public_select_quote_templates" ON quote_templates FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_quote_templates" ON quote_templates;
CREATE POLICY "public_insert_quote_templates" ON quote_templates FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_quote_templates" ON quote_templates;
CREATE POLICY "public_update_quote_templates" ON quote_templates FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_select_leads" ON leads;
CREATE POLICY "public_select_leads" ON leads FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_leads" ON leads;
CREATE POLICY "public_insert_leads" ON leads FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_leads" ON leads;
CREATE POLICY "public_update_leads" ON leads FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
