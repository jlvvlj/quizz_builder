# French 500 — Japanese prompts, French answers

The original quiz interface and learning flow are retained. Navigation and deck
counts now use the available content, and accounts/settings/progress are stored
in private Supabase tables behind verified server sessions.

The 500 pairs are loaded in the separate `quizz` Supabase project
(`fruozdtzduszjrbutzwa`), in the original app's `words10k` table:

- `japanese_word`: Japanese prompt, including short grammar cues when needed
- `english`: French answer (the original field name is deliberately preserved)
- `japanese_reading`: empty, so French answers are not shown as reading hints
- `section_1`, `step_1` through `step_5`: 100 words per step

Use Typing or Multiple choice in the existing session preview. The default
direction is Japanese question to French answer. French accents are retained;
audio fields are empty and audio is disabled by default.

## Source and selection

Frequency ranking: Hermit Dave, FrequencyWords, French OpenSubtitles 2018:
https://github.com/hermitdave/FrequencyWords/blob/master/content/2018/fr/fr_50k.txt

Source content license: CC BY-SA 4.0:
https://creativecommons.org/licenses/by-sa/4.0/
The adapted dataset in this directory is distributed under the same license.
Japanese prompts were newly authored for this dataset, not copied translations.

These are 500 frequency-ranked word forms, including conjugations, articles,
interjections and common abbreviations; they are not 500 dictionary lemmas.
Subtitle frequency is one measure of commonness, not a universal ranking.
Entries ending in apostrophes, punctuation-only tokens, and selected tokenization
artifacts/inverted multiword forms were skipped. Specifically excluded:
ca, ii, hey, ok, est-ce, avez-vous, est-il, as-tu, a-t-il, vas-y.
The source rank and count are preserved in questions.json for reproducibility.
The final selected word is travailler. Each answer has its own Japanese cue.

## Running and verification

Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and the server-only
SUPABASE_SERVICE_ROLE_KEY in .env.local. Run npm ci, then npm run dev.
The connect_existing_quiz migration provides the original account/settings and
progress contracts, opaque expiring sessions, and deck metadata. Its private
tables intentionally deny anon/authenticated access; only server routes access
them after session verification. Vocabulary remains publicly readable.

There are 500 unique French answers in five steps of 100. Catalog counts come
from rows, including partial steps. Session size remains configurable. The old
builder_* tables are retained but unused.

Run node tests/existing-app.mjs against a running local app (default port 3016,
override TEST_BASE_URL). This creates and cleans up disposable accounts and checks
login, isolation, catalog, settings, progress, quiz modes, activity and logout.
TypeScript, lint and the production build also pass with inherited lint warnings.
