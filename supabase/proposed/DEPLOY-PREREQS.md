# Before the payment webhook and email alerts can go live (nothing here is deployed)

Code is ready in `supabase/proposed/functions/`: `whop-webhook`, `new-lead-alert`, `unusual-login-alert`.

## Berlize provides
1. **Resend account** (free): resend.com, then an API key. -> secret `RESEND_API_KEY`.
2. **A sending domain verified in Resend** (adds 3 DNS records at the domain host), e.g. `mail.<her domain>`. -> secret `ALERT_FROM_EMAIL`, e.g. `LeadKeep <alerts@mail.<her domain>>`.
3. **The app's web address** once published. -> secret `APP_URL` (used for "Open the lead" buttons).
4. **Whop webhook signing secret:** Whop > Developer > Webhooks > Create. URL `https://<project>.supabase.co/functions/v1/whop-webhook`, API v1, events membership.activated / membership.updated (/ deactivated if offered). -> secret `WHOP_WEBHOOK_SECRET`.
5. **Supabase (Bolt's project):** the stage 3 plans SQL already applied (it is), the batch 2 SQL, and `20261113100000_branding_gate.sql`.
6. Supabase Pro before real customers (backups, no pausing).

## Avery does (after her OK)
- Create the three functions (whop-webhook with "Verify JWT" off), add the secrets above.
- Database > Webhooks: `leads` INSERT -> new-lead-alert; `login_events` INSERT -> unusual-login-alert.
- Send a Whop test event and one test lead; check `whop_events` and the inbox.
`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided automatically.
