/*
# Lock down lead link tables for signed-out visitors

1. Security
- Revoke every privilege the `anon` role picked up by default on
  `business_profiles` and `lead_links`. Signed-out visitors reach these only
  through `public_lead_form` and `submit_lead_via_link`.
- Re-state the intended `authenticated` grants (no table-wide UPDATE on
  `lead_links`; only the `source` column may be renamed).

2. Notes
1. Row-level policies already hid all rows from anon; this removes table access too.
*/

REVOKE ALL ON public.business_profiles FROM anon;
REVOKE ALL ON public.lead_links FROM anon;

REVOKE ALL ON public.lead_links FROM authenticated;
GRANT SELECT, INSERT, DELETE ON public.lead_links TO authenticated;
GRANT UPDATE (source) ON public.lead_links TO authenticated;

REVOKE ALL ON public.business_profiles FROM authenticated;
GRANT SELECT, INSERT, UPDATE ON public.business_profiles TO authenticated;
