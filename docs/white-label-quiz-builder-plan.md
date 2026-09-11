# Plan: extract a generic, white-label quiz builder from this codebase

## Context

This repo is a **code-only snapshot of jalingo** (the Japanese learning app),
committed here specifically as the starting point for this pivot (single
commit: "Initial snapshot: quizz_builder app (copied from jalingo, code
only)"). No production data lives here, and the original jalingo app is
untouched elsewhere. That means we're free to aggressively strip this copy
down — nothing here is live.

Goal: turn this into a content-agnostic quiz engine — any question/answer
pairs, any language, any domain — that a tenant can white-label. Everything
below is scoped to "keep only what a generic engine needs."

## What we keep and adapt (generic infrastructure)

- **Auth** — `users` table, `src/pages/api/auth/*` (login, signup, logout,
  me, forgot-password, reset-password, google), `src/middleware.ts`,
  `src/components/auth/auth-ui.tsx`. None of this is Japanese-specific.
  Trim only the handful of `users` columns that are jalingo-flavored
  (e.g. `show_phrase`); keep generic prefs (`session_size`, `auto_advance`,
  `audio_auto_play`, `dark_mode`, `large_text`, `daily_reminders`,
  `weekly_progress`).
- **UI shell** — `AppLayout.tsx`, `sidebar.tsx`, `SettingsContext.tsx`,
  `settings_modal.tsx`, `src/components/ui/*` (button, card, select, sheet,
  table, input, continuous-tabs), `LoadingState.tsx`, `TabNavigation.tsx`,
  `QuizModePills.tsx`, `SuccessRateGroups.tsx`, `DifficultyGroups.tsx` —
  confirmed generic, no content coupling.
- **Quiz engine skeleton** — `src/pages/quizz.tsx` has the right bones
  (phase state machine, batching, per-card timer, `+10/-20` scoring,
  advance/continue flow) but Japanese logic is interleaved throughout
  (furigana rendering, kana typing targets, on'yomi/hiragana MC-option
  swapping, kanji sheet popouts). We **rewrite a new, smaller generic
  component informed by this skeleton**, not a copy — pulling out the
  state machine and dropping the Japanese branches. `quiz-mode.ts`
  (multiple-choice vs typing toggle, localStorage-backed) is reused as-is.
- **Generic typing matcher** — `EnglishTypingAnswer.tsx` is already
  language-agnostic (letter/digit matching, comma/semicolon-separated
  accepted alternates, parenthetical-hint stripping). This becomes the
  *only* typing-answer component; the Japanese `TypingAnswer.tsx`
  (romaji/kana matching) is dropped.
- **Progress math** — `src/utils/step-progress.ts` is pure, generic math
  (clamp + average → progress/mastered count). Reused as-is.
- **Shared quiz UI** — `QuizFeedbackBanner`, `QuizTransitionScreens`,
  `SaveErrorScreen` — generic, content-free.
- **Dashboard/streaks shell** — `dashboard.tsx`, `StreakSection.tsx`,
  `StatusCounts.tsx`, `InProgressSteps.tsx`, and the `user_daily_activity`
  table — generic once repointed at the new generic progress table.

## What's new (doesn't exist yet)

- **Schema** (new Supabase migration, additive):
  - `quizzes` — id, owner_id, title, description, is_public, branding
    (jsonb: name/logo/accent color — v1 can be a single theme var).
  - `quiz_items` — id, quiz_id, question, answer, accepted_answers text[],
    metadata jsonb (room for future fields without a migration), position.
  - `quiz_progress` — user_id, item_id, progress_status, progress,
    last_reviewed. Same shape as the old `user_progress`, just keyed to
    `quiz_items` instead of `words10k`.
  - `user_daily_activity` carries over unchanged for streaks.
- **Content + session APIs** — no in-app builder *UI* (no create/edit-quiz
  screen), but content is authored through an **API**, not raw DB writes
  (direct SQL for every quiz would be impractical): `POST/GET /api/quizzes`,
  `GET/PUT/DELETE /api/quizzes/[id]`, `POST /api/quizzes/[id]/items` —
  callable from a script, an admin tool, or a future UI. Plus the
  session/progress endpoints that mirror the old generic pattern
  (`/api/session/init`, `/api/progress/get-batch`, `/api/progress/save`)
  but pointed at `quiz_items` / `quiz_progress` instead of `words10k` /
  `user_progress`.

## What gets deleted (Japanese-only, not needed by a generic engine)

- **Pages**: all `kanji_*.tsx`, `words_core.tsx`, `words_tubelex_steps.tsx`,
  `homophone_quiz.tsx`, `bykanjiquizz.tsx`, `anime.tsx`, `anime/[id].tsx`,
  `custom.tsx`, `kanji_session*.tsx`. `jalingo.tsx` is replaced by a new
  generic landing/dashboard page.
- **API routes**: all of `api/anime/*`, `api/kanji/*`, `api/custom/*`,
  `api/words/*`, and the kanji/tubelex/primitives-specific variants under
  `api/progress/*` and `api/dashboard/*`.
- **Utils/components**: `furigana.tsx`, `romaji.ts`, `sentence.ts`,
  `kanji-freq-window.ts`, `kanji-primitives.ts`, `kanjiFrequencySource.ts`,
  `tubelex-window.ts`, `server/tokenize.ts`, `server/youtube-transcript.ts`,
  `server/reconcile.ts`, `kanji_quizzcard.tsx`, `KanjiCard.tsx`,
  `KanjiMnemonic.tsx`, `KanjiSheet.tsx`, `WordAnalysis.tsx`,
  `TypingLangPills.tsx`, `TypingAnswer.tsx` (Japanese one), `anime-client.ts`.
  `ContentPills.tsx` and `StepsPage.tsx` need trimming (currently branch on
  `kanji_freq`/`words_tubelex`), not full deletion.
- **Dependencies**: `kuromoji`, `cheerio`, `msedge-tts`, `better-sqlite3`
  (and the `data/*.db` files) — all only used by the tokenizer/YouTube/Anki
  legacy paths above.
- **Supabase tables** (separate, explicit, confirmed step — see below):
  `words10k*`, `kanji*`, `core_tubelex_ranked`, `words_tubelex_progress`,
  `homophone_words`, `anime*`, `custom_deck*`.

Note: `src/utils/cards.ts` looks generic by name but its types/comments are
literally Japanese-shaped ("Japanese word", `exampleSentence.japanese`) —
it's legacy and not reused; the new generic fetch pattern is built fresh
against `quiz_items`/`quiz_progress`.

## Sequencing

0. Set up a worktree per this repo's own rules (`AGENTS.md`/`CLAUDE.md`
   mandate a dedicated worktree per coding session — never edit the main
   checkout directly).
1. Additive migration: `quizzes`, `quiz_items`, `quiz_progress`. Nothing
   existing touched yet.
2. Build the generic quiz-taking engine (new component, MC + typing modes)
   against the new schema, behind a new route (e.g. `/quiz/[id]`).
3. Build the quiz/content APIs (create/edit quiz, manage items) — no
   builder UI, just the endpoints.
4. Repoint dashboard/session/results/settings pages at the generic schema;
   replace the jalingo-branded home page with a generic landing/dashboard.
5. Delete the Japanese-specific pages/APIs/utils/components/deps listed
   above, and drop the now-unused Supabase tables — as its **own**
   reviewable step, since dropping tables is irreversible.
6. White-label theming pass (app name/logo/accent color) — scope tbd, see
   open questions.
7. Verify end-to-end locally against the new schema, open a PR.

## Open questions (your call before/while I implement)

1. **Audio support** — `audio.ts`/`audioCache.ts`/`audioUrl.ts` are
   mechanically generic (play a URL) but only ever wired to Japanese
   word/sentence audio today. Drop entirely for v1, or keep an optional
   "attach audio URL to a quiz item" hook?
2. **White-label depth for v1** — a single re-themeable instance (one
   deployment, one brand config), or true multi-tenant (many owners, each
   with their own quizzes and branding, same deployment)? This changes the
   `quizzes`/`branding` shape.
3. **Table drops (step 5)** — I'll implement steps 1–4 first and come back
   to you before actually dropping any Supabase table, since that's
   irreversible.
