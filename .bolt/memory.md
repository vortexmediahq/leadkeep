# Project memory

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