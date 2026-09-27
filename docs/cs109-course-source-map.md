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

### Everyday stories

Part 1 has 177 everyday stories across 37 lessons, drawn from the five running scenarios — Meridian Air, Tally, the Forecast Market, the Warm Intro and One Cell — which were copied from the book course and adapted. They belong to this course alone: `src/data/cs109-part-1-everyday.md` holds them, each headed by its lesson, scenario and title; `scripts/build-cs109-everyday.cjs` builds `src/data/cs109-everyday.json`; nothing refers to the book course's story files, and the Part 1 test fails if anything does.

Each story was checked against the exact lesson it sits in rather than assumed to fit:

- Copied stories are rewritten in this course's notation and wording: `S` for the sample space, "section" and "part" rather than "chapter" and "book", `P(E | F)`, and events joined by "and" and "or".
- Where one book story combined two ideas that this course teaches in separate lessons, it was split. The book's total-probability-and-Bayes stories became a law-of-total-probability story and a Bayes story, with the two-case versions in the law of total probability's Intro and in Bayes' Intro, and the three-case versions in the lessons on many background events and on Bayes with the general law.
- Stories were rewritten where the book version did not demonstrate the lesson's point: the Forecast Market's inclusion–exclusion story used two events that cannot both happen, and now uses "A wins" and "turnout exceeds 60%", which can; One Cell's "expressed the reporter at some point" was called an event of a sample space it is not a subset of, and now says a finer sample space is needed.
- Lessons with no book counterpart got new stories: simulating probability, probability from datasets, the provable identities, mutually exclusive events, "or" with mutually exclusive events, the conditional paradigm, "and" with independent events, De Morgan's law for "and", very small probabilities in logs, more than k heads, counting with "or" in the mutually exclusive case, and bucketing.
- Each scenario keeps one set of numbers across lessons, so a reader can follow it: Meridian Air's late inbound gives 85 percent on time overall, 45 percent given a late inbound, and an 11 percent chance of a late inbound given an on-time departure. Every figure was recomputed.
- Two figures in the book course's own stories are wrong, and are correct here: twenty independent \$0.62 contracts end with nine or fewer paying out with probability about 9 percent, not 12; and 20²⁰ has twenty-seven digits, not twenty-six.

Story arithmetic is typeset and explained like lesson math, and it is held to the same rule: every term resolves to a definition written for this course.

Lessons without stories, and why:

- Short prefaces whose idea arrives in the next lesson: the Intros of 1.1, 1.4, 1.9, 1.10, 1.11, 1.12 and 1.14, and 1.13's "Counting with Or".
- Lessons that restate or extend a result their neighbours already illustrate: inclusion–exclusion with three and with n events, conditioning on multiple events, the alternative definition of independence, its symmetry, independence and complements, how to establish independence, the properties of logarithms, products becoming addition, logs being negative, the Warmups, and counting with "or" in the general case.
- The Applications section, whose lessons are themselves worked applications.
- Bayes' Intro carries Meridian Air, Tally and the Forecast Market; the Warm Intro and One Cell appear in the two lessons that follow, where their noisy tests match the mammogram and the natural-frequency view.

## Rebuild and verify

```sh
python3 scripts/fetch-cs109-reader.py      # refresh the snapshot; commit only on purpose
python3 scripts/build-cs109-course.py
node scripts/test-cs109-reader.cjs
npx tsc --noEmit
```
