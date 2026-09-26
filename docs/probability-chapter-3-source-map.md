# Chapter 3: native lessons and source map

Source: user-supplied `Introduction to Probability (1).pdf`, PDF pages 99–150 (printed Chapter 3 pages 1–52). The input hash is recorded in `src/data/probability-chapter-3-source.json` and matches the file used for Chapter 2.

## Structure

The seven section headings are preserved. The eleven bold subsection headings printed at the text margin are lesson items; sections 3.1, 3.3, 3.5, and 3.6 have Intro items for the material that precedes their first subsection. Sections 3.2, 3.4, and 3.7 print no subsection heading and each remain one lesson. Titles inside the boxed statements (for example *Summary of PDF Properties*, *Properties of a CDF*) are boxed key points, not subsections, and stay inside their lesson. Total: **19 lessons**.

| Section | Lessons | PDF pages |
|---|---|---|
| 3.1 Continuous Random Variables and PDFs | Intro; Expectation; Exponential Random Variable | 100–108 |
| 3.2 Cumulative Distribution Functions | Cumulative Distribution Functions | 109–113 |
| 3.3 Normal Random Variables | Intro; The Standard Normal Random Variable | 114–118 |
| 3.4 Conditioning on an Event | Conditioning on an Event | 118–123 |
| 3.5 Multiple Continuous Random Variables | Intro; Expectation; Conditioning One Random Variable on Another; Inference and the Continuous Bayes' Rule; Independence; Joint CDFs; More than Two Random Variables | 124–137 |
| 3.6 Derived Distributions | Intro; The Linear Case; The Monotonic Case; Functions of Two Random Variables | 138–149 |
| 3.7 Summary and Discussion | Summary and Discussion | 150 |

## Inventory

- **29 numbered examples**, Example 3.1 through Example 3.29, plus the continuation of Example 3.22 on printed page 47.
- **25 figures**, Figure 3.1 through Figure 3.26. Figure 3.12 is absent in the supplied PDF: the numbering jumps from 3.11 to 3.13, and is retained, exactly as Chapter 2 retains its jump from 2.5 to 2.7.
- **12 boxed statements**: Summary of PDF Properties; Expectation of a Continuous Random Variable and its Properties; Properties of a CDF; Normality is Preserved by Linear Transformations; CDF Calculation of the Normal Random Variable; Conditional PDF and Expectation Given an Event; Summary of Facts About Multiple Continuous Random Variables; Independence of Continuous Random Variables; Calculation of the PDF of a Function Y = g(X) of a Continuous Random Variable X; The PDF of a Linear Function of a Random Variable; PDF Formula for a Monotonic Function of a Continuous Random Variable; Summary of Results for Special Random Variables.

The section, subsection, boxed-statement, example, and figure inventory above is read off the PDF itself — section heads and subsection heads are the bold 10pt lines at the text margin, boxed-statement titles are the bold lines indented inside a box frame, and figure frames are the rectangles drawn around the artwork.

## Source corrections and clarifications

- PDF p. 35: Example 3.18 names the posterior as `f_{X|X}(x|y)`; it is `f_{X|Y}(x|y)`, the conditional PDF of the parameter given the observed lifetime.
- PDF p. 38: the joint CDF paragraph says the PDF "can be recovered from the PDF by differentiating"; it is recovered from the CDF.
- Editorial cross-references to figures, exercises, the theoretical problems, and later chapters of the book are removed where the referenced material is not part of this course; references to Chapters 1 and 2 and to the sections of Chapter 3 are kept, since those lessons exist here.

## Content and presentation

The reviewed manuscript is `src/data/probability-chapter-3-native.md`; its builder creates typed JSON blocks. Every source paragraph of the chapter body is transcribed, in order: definitions and formula introductions, explanatory prose, derivations, footnotes, all 29 numbered examples with their solutions, the 12 boxed statements, and all 25 figures with their native captions. Editorial references to the book, chapters, and exercises are removed and notation is normalized to TeX; the wording of the retained prose follows the source.

Only diagram artwork is rasterized. Paragraphs, captions, cards, cases, integrals, fractions, and derivations are HTML/KaTeX, sharing the existing colored notation, hover definitions, and explanation toggle. Chapter 3 adds definitions for PDFs, CDFs, the normal and standard normal, conditional PDFs, joint PDFs, and derived distributions.

Everyday examples are deliberately not part of this pass; they are added after the transcription is reviewed.

## Navigation and the deck

Chapter 3 uses `/steps?section=section_4` and `/lesson?section=section_4&deck=probability-chapter-3&item=<id>`, alongside chapter 1 at `section_2` and chapter 2 at `section_3`.

Sections and steps are not declared in code: `/api/catalog` builds them from the deck rows in `public.words10k`, so a chapter is only reachable once that table holds rows carrying its section and step names. `supabase/migrations/20260920090000_add_general_random_variables_deck.sql` therefore creates the `probability-chapter-3` deck and its 82 questions across eight steps, generated from `data/probability/chapter-3/questions.json`:

| Step | Title | Questions |
|---|---|---|
| step_1 | Notation | 16 |
| step_2 | Continuous random variables and PDFs | 8 |
| step_3 | Expectation and the exponential | 8 |
| step_4 | Cumulative distribution functions | 8 |
| step_5 | Normal random variables | 10 |
| step_6 | Conditioning on an event | 8 |
| step_7 | Multiple continuous random variables | 14 |
| step_8 | Derived distributions | 10 |

The table name and its `japanese_word` / `english` columns are inherited from the vocabulary app this quiz app was built from; the question text lives in `japanese_word` and the answer in `english`, exactly as chapters 1 and 2 already do. Renaming the table and columns is pending.

Regenerate the migration with `node data/probability/chapter-3/generate-sql.mjs <output.sql>`, or upsert straight into the database with `node data/probability/chapter-3/import.mjs`, which refuses any question that does not have four distinct choices including the correct one.

## Notation

Chapter 3 introduces integrals, densities, and distribution functions to the notation model. `\\int`, `\\iint`, and `\\iiint` are hoverable terms whose explanation reads their limits as the region being accumulated over — the whole real line, an interval from `a` to `b`, everything up to `x`, a set `B`, or a region such as `(x,y) ∈ B` — rather than as a summation index. The `d` of a differential is treated as part of `dx` and is not explained as a quantity of its own. Densities (`f_X`, `f_{X,Y}`, `f_{X|Y}`), distribution functions (`F_X`, `F_{X,Y}`, `Φ`), the normal parameters `μ` and `σ`, the exponential parameter `λ`, and the small interval `δ` all have chapter-3 definitions, and the content test fails if any expression in the chapter falls back to a definition written for another chapter.

Sized absolute values and evaluation bars are authored as `\\left\\lvert … \\right\\rvert` and `\\Big\\rvert`, not as `\\left|` or `\\Big|`: the term annotator inserts its marker between the sizing command and a bare `|`, which KaTeX rejects.

## Rebuild and verify

```sh
python3 scripts/build-probability-chapter-three.py --pdf '/path/to/Introduction to Probability (1).pdf'
node scripts/test-probability-chapter-three.cjs
npx tsc --noEmit
npm run build
```

The builder crops actual diagrams using the figure frames printed in the PDF; omit `--pdf` to rebuild only the native data.
