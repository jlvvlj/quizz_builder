# French 500 — Japanese prompts, French answers

This is a data-only addition to the original application. No files under `src/`,
styles, dependencies, or app configuration differ from the original snapshot.

The 500 pairs are loaded in the separate `quizz` Supabase project
(`fruozdtzduszjrbutzwa`), in the original app's `words10k` table:

- `japanese_word`: Japanese prompt, including short grammar cues when needed
- `english`: French answer (the original field name is deliberately preserved)
- `japanese_reading`: empty, so French answers are not shown as reading hints
- `section_1`, `step_1` through `step_5`: 100 words per step

For French typing, use the existing Latin-letter answer mode, currently labelled
English, and the existing forward direction. No labels or interactions were
changed. French accents are retained. Audio fields are empty.

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

## Verification and remaining connection blocker

Database verified: 500 rows, 500 unique French answers, five steps.
The previous rewrite is reverted. Its separate builder_* tables are retained but
are not used by this original application.

The restored project does not contain the original users, user_progress, or
user_daily_activity tables. The original code queries users (including password
hashes) through an anon client. No anonymous account access has been enabled.
Consequently original login/progress cannot yet be verified end-to-end against
this restored project. Connecting these safely requires separate, explicitly
approved backend work; the UI and quiz engine must remain unchanged.
