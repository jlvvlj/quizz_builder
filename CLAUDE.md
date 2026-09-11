# Project rules

## No silent fallbacks

Fallbacks are an anti-pattern in this project. Do not add one without first surfacing the situation and asking which path the user wants. This covers: silently switching to source B when source A errors or returns empty, try/catch that swallows a failure and substitutes a default, "graceful degradation" that hides a missing migration / env var / broken upstream, and backwards-compat shims that paper over a state the system shouldn't be in.

When something feels like it calls for a fallback, stop and lay out the options explicitly:
1. Fix the root cause (apply the migration, set the env, repair the data).
2. Change the contract or the data source.
3. Take the fallback and document why.

Let the user pick.

A few exceptions are fine if explicitly justified: pure-UI placeholders, retry/backoff for transient network errors, genuinely optional data nobody depends on. When in doubt, ask.

## Always work in a worktree

Multiple sessions can share one checkout, so two sessions in the same folder
edit the same files on the same branch and their work gets mixed together. To
avoid this, **always work in a worktree** at the start of a coding task: use
the `EnterWorktree` tool to create an isolated directory like
`.claude/worktrees/<name>/` on its own branch. Your other sessions stay
untouched, so each session commits only its own files and gets its own clean
PR.

## Verifying the app locally (test account + worktree setup)

To verify any UI change you must actually load the running app — not a mock.
Two things bite every time, so follow this exactly.

### App login is NOT Supabase Auth

The app has its own `users` table (bcrypt `password_hash`, `auth_provider`)
and sets a plain `userId` cookie. `POST /api/auth/login` and
`POST /api/auth/signup` are the only ways in. A user created through Supabase
Auth (`auth.users`, admin API, etc.) **cannot** log in — don't waste time on it.

**Shared local test account** (throwaway, no real data — intentionally
documented here so any session can sign in without asking):

- Email: `claude-verify@example.com`
- Password: `JalingoTest123!`

Authenticate by hitting the endpoint directly (sets the `userId` cookie):

```sh
curl -s -X POST http://localhost:<port>/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"claude-verify@example.com","password":"JalingoTest123!"}' -c cookies.txt
```

If login returns `401 Invalid email or password`, the row was removed —
recreate it by POSTing the **same** credentials to `/api/auth/signup`, which
also sets the cookie. In a browser/preview, the login form posts to
`/api/auth/login`; if you fill inputs programmatically, set the value via the
native setter **and** dispatch a real `input` event or React ignores it —
easier to just POST the endpoint with `credentials: 'include'`.

### A fresh worktree has no deps and no env

`git worktree add` does not copy `node_modules` or `.env.local`. Before
starting the dev server in a worktree:

```sh
cp <repo-root>/.env.local .env.local   # Supabase URL + keys; without it every data call fails
npm install                             # else e.g. `motion/react` 500s the page
```

### Reaching the words session page

`/session_preview` needs `section`/`step` query params in the form
`section_<N>` / `step_<N>` (not bare numbers). `section_1` / `step_1` has
words:

```
/session_preview?section=section_1&step=step_1
```

A brand-new account works (all words start as `new`). Test multi-column vs
single-column layouts at **desktop width (≥768px)** — mobile collapses every
`md:grid-cols-*` grid to one column regardless, so it proves nothing.

## Never push follow-up commits to a merged PR's branch

After any PR is merged or closed, that branch is **done**. Do not push more
commits to it — they will land orphaned, with no PR tracking them and no
path to `main`.

Before pushing commits during a session, verify the PR state:

```sh
gh pr view <branch> --json state,url
# or
gh pr list --head <branch> --state all
```

Then branch on the result:

- `state: OPEN` → push to the existing branch; the commits join the open PR.
- `state: MERGED` or `CLOSED` → **stop**. Do not push to that branch.
  1. `git fetch origin main`
  2. `git switch -c <new-branch> origin/main`
  3. Cherry-pick or re-apply the new commits there.
  4. Push the new branch and open a fresh PR with `gh pr create`.
  5. Report the new PR URL.

When the user asks for a follow-up tweak after a PR was already created
earlier in the same session, **assume by default that the previous PR may
have been merged** and verify before committing. Never silently reuse a
branch whose PR is no longer open. Never claim "pushed, PR updated" when
the commits are actually orphaned.

## Always check PR mergeability + deployment status before saying it's ready

Do not tell the user a change is "done", "ready", "works", "ready to test",
or "ready to merge" until **both** of these have actually been checked on the
PR: (1) the **deployment/CI status** is green, and (2) the PR is **mergeable**
(no conflicts with the base branch). A green deploy on a PR that conflicts with
`main` is **not** mergeable — "ready to merge" is false until both are true.

A green local `tsc --noEmit` is **not** sufficient — `next build` / Vercel also
run ESLint and other checks that the typecheck does not (e.g. an `eslint-disable`
for a rule not in the config fails the Vercel build but passes `tsc`).

After every push, before any "all good" / "ready to test" / "ready to merge"
claim:

```sh
gh pr view <n> --json state,mergeable,statusCheckRollup
gh pr checks <n>
```

**Deployment / CI (`statusCheckRollup`):**
- Checks **PENDING** → say so and poll; do not preemptively declare success.
- Any check **FAILURE/ERROR** → pull logs (`npx vercel inspect <dpl> --logs`),
  fix the root cause, push, re-verify.

**Merge conflicts (`mergeable`):**
- `MERGEABLE` → clear to merge (once CI is also green).
- `CONFLICTING` → **stop**, say so explicitly; the PR cannot be merged as-is.
  Resolve it: `git fetch origin <base>` then `git merge origin/<base>` (or
  rebase) in the worktree, fix the conflicts, re-run `tsc`/lint, push, and
  re-verify both signals. Never claim "ready to merge" while CONFLICTING.
- `UNKNOWN` → GitHub is still computing it; poll until it resolves to
  MERGEABLE or CONFLICTING before reporting.

Report "ready" only once the deployment is green **and** the PR is mergeable,
and state what green does and does not prove (a successful build ≠ verified
runtime behavior — e.g. serverless file bundling, env, external APIs).

## The quiz engine is NOT words-only — it serves words AND kanji

`src/pages/quizz.tsx` is one shared engine driving **three** content types,
selected by the `content` query param: words (default), `kanji_freq` (the
frequency-kanji quiz), and `sentences`. Both words and kanji support **both**
quiz modes (multiple-choice and typing); sentences are typing-only (always type
the reading).

When you add or change quiz behaviour, **assume it must cover kanji too** unless
there's a clear reason not to — do not scope a change to "words" and forget the
kanji path. Concretely:

- The kanji quiz reaches the same engine via `content=kanji_freq`; cards are
  built by `fetchKanjiFreqSessionCards` (`buildKanjiFreqCards` in
  `src/utils/supabase-client.ts`), not the words builders. A change to the words
  card shape usually needs the mirror change there.
- On the session pages (`session_preview_results.tsx`), `contentMode` is only
  `'words'` vs `'sentences'` — the kanji quiz still has `contentMode === 'words'`
  (it's flagged separately by `isKanji` / the URL param). So gates written as
  `contentMode === 'words'` already include kanji; an `!isKanji` guard in the
  engine is what scopes something to words-only.
- For kanji, the "Japanese" answer is the **on'yomi reading**; for words it's the
  hiragana reading. English is the meaning/translation in both.
