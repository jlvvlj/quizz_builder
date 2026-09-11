# Quizz

A content-agnostic quiz application derived from Jalingo. Create content through
an HTTP API and practise it in the browser with multiple-choice or typed answers.

## Local development

Requires Node 20.9+ (Node 22 recommended). Copy `.env.example` to `.env.local`
and configure the separate quiz Supabase project. The server key must remain
server-only; it must never use a `NEXT_PUBLIC_` name.

```sh
npm ci
npm run dev -- --hostname 127.0.0.1 --port 3015
```

The local environment currently targets project `fruozdtzduszjrbutzwa` (`quizz`).
Use `scripts/create-pr-worktree.sh <branch> [path]` for a fresh coding session.

## Database

The restored project already contained `quiz_topics`, `quiz_items`, and
`quiz_progress`, including 2 topics, 1 item and 2 progress records. They are
preserved, with no schema or data edits. The new application uses:

- `builder_users`: email/password accounts and practice preferences
- `builder_app_sessions`: SHA-256 hashes of opaque session tokens
- `builder_quizzes`: owned quizzes with optional visibility to signed-in learners
- `builder_quiz_items`: questions, canonical answers, explicit accepted answers,
  explanations, ordering and optional metadata
- `builder_quiz_progress`: per-learner, per-question mastery and attempt counts
- `builder_quiz_sessions`: immutable question snapshots and submitted answers
- `builder_user_daily_activity`: practice activity by UTC date

Apply the SQL migration in `supabase/migrations/` to a new project before use.
The migration has already been applied to `quizz` through Supabase MCP.

All new tables have RLS enabled and no browser-role privileges. This application
uses custom bcrypt login, not Supabase Auth. Every API verifies a random,
expiring session token and checks ownership/access; only the server uses the
service key. RLS intentionally denies direct anon/authenticated access rather
than adding permissive policies for custom user IDs. The answer-recording RPC
is SECURITY INVOKER and executable only by service_role.

A correct answer adds 10 mastery points; an incorrect or revealed answer removes
20, clamped to 0–100. Answer requests are ordered and idempotent within a session.
Session snapshots preserve the current question wording when content is edited.
Deleted questions invalidate that session's affected question with an explicit
error. Library mastery is the average across every item, with unseen items at 0.

## Content API

All content endpoints require a session cookie from `/api/auth/login` or signup.
No in-app authoring UI is included. See [API examples](docs/api.md).

```sh
node scripts/seed-demo.mjs
```

This optional local-only script creates three public sample quizzes through the
API. It uses the disposable test account `claude-verify@example.com` with password
`JalingoTest123!`; do not use that account for sensitive data or a public launch.
Samples are visible to signed-in learners; only their owner can edit them.

## Verification

```sh
npm run lint
npx tsc --noEmit
npm run build
npm run test:integration  # local dev server running, .env.local present
```

Integration tests create two temporary users and their content, verify access
isolation, forged cookies, answer secrecy, replay safety, typing aliases,
multiple choice, scoring, persistence, visibility changes and logout, then delete
only their own temporary users (and cascaded test data).

## Current scope

Working foundation: email signup/login/logout, quiz library and search, session
resume, results/review, mastery, UTC streaks, session-size preference, quiz/item
CRUD API, and per-deployment name/accent branding. The old Japanese pages,
content APIs, tokenizer and dependencies have been removed from this copy.

Before a public launch: add password reset and email verification/delivery,
auth endpoint abuse protection, account management, deployment configuration and
monitoring. Google sign-in, audio attachments, per-tenant branding and advanced
learning scheduling are deferred. No production deployment is configured by this
change. Original Jalingo and its database are not part of this implementation.
