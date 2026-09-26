# CS109 course: source map and structure

A second probability course, built on the same lesson app as the Bertsekas & Tsitsiklis chapters, from Stanford CS109's course reader *Probability for Computer Science* (spring 2026 edition): https://probabilitycoders.stanford.edu/spr26/probability.

This document covers the base structure only. No lessons, quizzes, or everyday examples exist yet for any part; Part 1 is the next step.

## The source

The reader is a single-page app that renders chapters stored in a public Firestore database (project `probabilityforcs`, book `cs109-spr26`, published version). There is no PDF. `scripts/fetch-cs109-reader.py` reads the same documents the site renders — the outline and every chapter it lists — and stores them as plain JSON:

- `data/cs109/source/manifest.json` — outline, titles, fetch time, and a SHA-256 per chapter file, so a rebuild can tell whether the snapshot changed.
- `data/cs109/source/chapters/<id>.json` — one ProseMirror document per chapter, 103 in all.

The course is built from this snapshot, never from the live site, the same way the Bertsekas chapters are built from one fixed PDF. Two outline entries have no chapter document: *Beam Search* (a Part 1 application the site renders as a custom page) and *Deep Learning* (an unpublished draft).

Each interactive demo in the reader is a whole React program written for the site. Those programs are the site's code rather than course content, and this app builds its own interactive figures, so the snapshot keeps each demo only as a placeholder with a hash and byte size of its source, at the position it occupies in the chapter.

## Structure in the app

The home screen now groups decks by course. *Introduction to Probability* holds the three Bertsekas chapters; *Probability for Computer Scientists* holds the five reader parts; anything else (the French vocabulary deck) sits under *Other decks*. A part with no lessons yet shows as a dashed card linking to `/course?id=cs109`, a full outline of the course listing every part's chapters and applications.

Each numbered part of the reader is one deck, as each book chapter is one deck in the Bertsekas course:

| Part | Title | Deck | Catalog section | Chapters | Applications |
|---|---|---|---|---|---|
| 1 | Core Probability | `cs109-part-1` | section_5 | 14 | 10 |
| 2 | Random Variables | `cs109-part-2` | section_6 | 14 | 9 |
| 3 | Probabilistic Models | `cs109-part-3` | section_7 | 10 | 11 |
| 4 | Uncertainty Theory | `cs109-part-4` | section_8 | 8 | 4 |
| 5 | Machine Learning | `cs109-part-5` | section_9 | 10 | 3 |

The catalog sections are reserved, not created: a part appears in the catalog, and becomes clickable, once its deck rows are seeded — exactly as chapters 1–3 did. The *Reference* part (notation, distribution and calculus references, calculators, Python, a language-model tool) and the *Drafts* part are not decks.

`scripts/build-cs109-course.py` turns the manifest into `src/data/cs109-course.json`, which `src/utils/courses.ts` reads. Outline titles carry inline HTML for emphasis; `Probability of <b>or</b>` becomes `Probability of “or”`.

## How reader content will map onto lessons

The reader's documents use a small set of node types, which map onto the block kinds the Bertsekas chapters already use:

| Reader node | Count | Lesson block |
|---|---|---|
| `paragraph` with `math_inline` | 2,079 / 2,480 | paragraph with inline `$…$` |
| `block-tex` | 553 | formula |
| `heading` | 294 | heading; also the lesson boundaries within a chapter |
| `borderedBox`, `purpleBox` | 209 / 88 | key-point card — definitions, theorems, worked problems |
| `kindImage` | 57 | figure, downloaded and served from `public/cs109/` |
| `interactive-demo` | 131 | an interactive figure of this app's own, where one fits |
| `codeBlock` (Python) | 63 | **new** code block kind; the Bertsekas chapters have none |
| lists, `blockquote`, `horizontalRule` | — | paragraphs |

The reader writes its math with its own KaTeX macros (`\P`, `\E`, `\Var`, `\Bin`, `\Poi`, `\and`, `\or`, `\c`, …). `scripts/cs109_reader.py` expands them into standard TeX at build time using the reader's own definitions, except that `\P` becomes a plain `P` so the notation layer recognizes probability calls the same way it does in the Bertsekas chapters. `scripts/test-cs109-reader.cjs` renders every one of the reader's 3,033 expressions through KaTeX after expansion; all of them render.

## Part 1: Core Probability — proposed plan, pending confirmation

Chapters, in reader order: Probability · Equally Likely Outcomes · Axioms of Probability · Probability of “or” · Conditional Probability · Law of Total Probability · Bayes' Theorem · Independence · Probability of “and” · De Morgan's Law · Log Probabilities · Many Coin Flips · Counting · Combinatorics.

Applications: Bacteria Evolution · Google Rain Prediction · Random Walks · Binomial with Different Probs · Netflix Genres · Poker · Beam Search · Serendipity · Monty Hall · Router Example.

Proposed, following the Bertsekas chapters:

- Each reader chapter is a section of the Part 1 outline; its headings are the lessons, with an Intro lesson for any material before the first heading, the way Bertsekas subsections became lessons. Applications form one further section, one lesson each.
- Paragraphs, boxes, formulas, figures, and code are transcribed in order, as chapter 3 was.
- Interactive figures come from this app's registry (`src/components/interactive/`). `SetTheory`, `ChanceEvents`, `ConditionalProbability`, and `Counting` already cover much of Part 1, and `RandomVariables`, `DiscreteDistributions`, `Expectation`, and `Variance` much of Part 2. The reader's simulations — dice rolls converging on a probability, many coin flips — would be new figures.
- Quiz questions are seeded into the deck at section_5, as for chapters 1–3.

### Everyday scenarios

The five running scenarios of the Bertsekas course — an airline route, a SaaS growth engine, a forecast market, a warm-intro campaign, and stochastic gene expression — cover the same base topics as Part 1, and most Part 1 chapters have an existing counterpart unit that carries all five of them:

| Part 1 chapter | Existing scenario unit |
|---|---|
| Probability | `c1-sample-spaces-and-events`, `c1-models-introduction` |
| Equally Likely Outcomes | `c1-discrete-models` |
| Axioms of Probability | `c1-probability-laws`, `c1-properties-of-probability-laws` |
| Probability of “or” | `c1-properties-of-probability-laws`, `c1-set-operations` |
| Conditional Probability | `c1-conditioning-introduction`, `c1-conditional-probability-law` |
| Law of Total Probability | `c1-total-probability-and-bayes` |
| Bayes' Theorem | `c1-total-probability-and-bayes` |
| Independence | `c1-independence-introduction`, `c1-independence-of-events`, `c1-conditional-independence` |
| Probability of “and” | `c1-sequential-models`, `c1-independent-trials` |
| De Morgan's Law | `c1-algebra-of-sets` |
| Counting | `c1-counting-introduction`, `c1-counting-principle` |
| Combinatorics | `c1-k-permutations`, `c1-combinations`, `c1-partitions` |
| Log Probabilities | — |
| Many Coin Flips | `c1-independent-trials` (in part) |

Log Probabilities and most of Many Coin Flips have no counterpart and would need new scenario blocks. Whether reused blocks are shared with the Bertsekas course or copied into Part 1's own manifest is a decision for Part 1.

## Rebuild and verify

```sh
python3 scripts/fetch-cs109-reader.py      # refresh the snapshot; commit only on purpose
python3 scripts/build-cs109-course.py
node scripts/test-cs109-reader.cjs
npx tsc --noEmit
```
