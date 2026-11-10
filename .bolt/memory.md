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