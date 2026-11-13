# Project memory

## Product intent & audience

- App includes user authentication (sign-up/accounts) and a leads feature, suggesting a CRM, lead-generation, or customer-management tool.
- Built with Vite + React.

## Brand personality & voice

- Tone is helpful, direct, and explanatory; clarifies misunderstandings plainly without being blunt.

## Visual design & UX direction

- No specific visual, layout, or component decisions inferred yet.

## Decisions, constraints & rationale

- Database is Bolt-managed Supabase (not a separate user-owned Supabase project). App is wired correctly via private `SUPABASE_URL` / key settings.
- Switching to a user-owned Supabase project replaces the current database; existing accounts and leads do not migrate automatically.
- Database can be "claimed" into a user's own Supabase account via Bolt's database settings → Advanced to retain data while gaining management access.
- Connecting an external Supabase project requires a Pro or Teams plan.

## Open questions & assumptions

- Whether the database connection/sign-up error has recurred or is resolved.
- Whether the user intends to claim the Bolt-managed database or switch to their own Supabase project.
- Exact app feature scope beyond accounts and leads is not yet confirmed.

---

## Notes carried over from the stage3-leadkeep branch


## Product intent & audience

- Vite + React web app offering AI-generated quotes
- Freemium model: limited free usage; unlimited quotes unlocked via paid subscription
- Subscriptions managed through Whop

## Brand personality & voice

- Not yet inferred

## Visual design & UX direction

- Not yet inferred

## Decisions, constraints & rationale

- Payment provider switched from Paystack to Whop per user preference
- Paystack integration code left in place as-is (not removed)
- Database subscription logic now keyed to Whop plans to gate unlimited AI quotes
- Whop webhook endpoint exists in code but is not yet enabled
- Whop secret key not yet configured; required before webhooks can process upgrades

## Open questions & assumptions

- Whop webhook receiver needs activation and secret key insertion before payments can upgrade users
- Whether to eventually remove Paystack code or keep as fallback is undecided
- Specific Whop plan IDs and tier mapping not yet documented
- UI/UX details, styling, and component patterns not yet established in memory