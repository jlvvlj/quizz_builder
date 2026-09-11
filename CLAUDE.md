# Project rules

Follow AGENTS.md for isolated worktrees and PR state checks.

## Architecture

Read README.md and docs/api.md. This is now a generic quiz application.
Custom bcrypt authentication uses the builder_users table and opaque quiz_session
cookies backed by hashed, expiring builder_app_sessions records. Never trust a
plain user ID cookie. All database operations are server-only and require the
current user's access/ownership checks.

Do not add silent fallbacks or mock data to mask failed database calls. Report
errors and fix their cause. Optional UI placeholders are fine.

## Verification

Run npm run lint, npx tsc --noEmit and npm run build. Load the actual app in a
browser for UI changes. Use the disposable account documented in README.md for
local verification. npm run test:integration creates and cleans up only its own
temporary records against the configured quiz project.

Never change Jalingo's database or restored prototype tables as part of generic
quiz work without a specific request. The new app uses builder_ tables.

Before pushing, check the branch PR state. Do not push to merged/closed PRs.
After pushing, inspect mergeability and CI checks; report pending/failing checks
accurately. Do not claim production readiness from local checks alone.
