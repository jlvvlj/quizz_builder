# Chapter 2: native lessons and source map

Source: user-supplied `Introduction to Probability (1).pdf`, PDF pages 56–98 (printed Chapter 2 pages 2–44). The input hash is recorded in `src/data/probability-chapter-2-source.json`.

## Structure

The eight section headings are preserved. The twelve named subsections are lesson items; sections 2.2, 2.5, 2.6, and 2.7 have Intro items for material before their first subsection. Sections 2.1, 2.3, 2.4, and 2.8 have no separate unboxed subsection headings and each remain one lesson. Total: **20 lessons**. In particular, **Expectation** and **Variance** are boxed statements, not invented subsections.

| Section | Lessons | PDF pages |
|---|---|---|
| 2.1 Basic Concepts | Basic Concepts | 56–58 |
| 2.2 Probability Mass Functions | Intro; The Bernoulli Random Variable; The Binomial Random Variable; The Geometric Random Variable; The Poisson Random Variable | 58–63 |
| 2.3 Functions of Random Variables | Functions of Random Variables | 63–65 |
| 2.4 Expectation, Mean, and Variance | Expectation, Mean, and Variance | 65–76 |
| 2.5 Joint PMFs of Multiple Random Variables | Intro; Functions of Multiple Random Variables; More than Two Random Variables | 76–80 |
| 2.6 Conditioning | Intro; Conditioning a Random Variable on an Event; Conditioning one Random Variable on Another; Conditional Expectation | 80–89 |
| 2.7 Independence | Intro; Independence of a Random Variable from an Event; Independence of Random Variables; Independence of Several Random Variables | 90–96 |
| 2.8 Summary and Discussion | Summary and Discussion | 96–98 |

## Content and presentation

The reviewed manuscript is `src/data/probability-chapter-2-native.md`; its builder creates typed JSON blocks. It includes source definitions and formula introductions, explanatory paragraphs, derivations, the expectation-existence footnote, all 19 numbered examples and their solutions, 13 boxed statements, and 14 figures with native captions. Figure 2.6 is absent in the supplied PDF: numbering jumps from 2.5 to 2.7, and is retained. Figure 2.2 is assigned to the introductory PMF material that explains it, rather than to the Bernoulli subsection interrupted by its page float. Figure 2.11 similarly accompanies the marginal-PMF explanation.

Opening explanations and mathematical prose use the source wording where practical; editorial references to the book/chapters/exercises have been removed, notation normalized to TeX, and some exposition and example wording condensed. This is a reviewed lesson adaptation, not a byte-for-byte transcription of every source paragraph. Added everyday examples are explicitly titled and come after the source explanation. Each lesson also has a concise Key ideas summary.

Only diagram artwork is rasterized. Paragraphs, captions, cards, cases, sums, fractions, and derivations are HTML/KaTeX. Boxed statements have a distinct dark background; standalone equations are unboxed. Both display and inline math share the existing colored notation, hover definitions, and explanation toggle. Chapter 2 adds definitions for expectation, variance, Poisson parameters, PMFs, and random variables.

## Source corrections and clarifications

- PDF p. 76: the expanded joint-event notation must end in `Y=y`, not `Y=x`.
- PDF p. 78: Figure 2.11's printed caption gives marginal values inconsistent with its diagram. The displayed table sums to `p_X(2)=6/20` and `p_Y(2)=7/20`; the native caption uses those values.
- PDF p. 83: Example 2.11 uses `p_X(x)p_{Y|X}(y|x)` in the questions-first construction; the example states this order consistently.
- PDF p. 91: repaired the missing parenthesis in `P(A)>0`.
- PDF p. 93: functions are consistently named `g` and `h` in the independence summary.
- PDF p. 96: the zero outcome of the Bernoulli simulation indicator has probability `1-P(A)`, not zero.
- PDF p. 97: the three-variable chain rule starts with `p_Z(z)`, not `p_Y(y)`.
- A logarithm requires positive input; the temperature transformation example states that domain.
- The quiz scheduling ratio comparison specifies probabilities less than one before division by `1-p`.
- Conditional expectation given a value is only defined on positive-probability conditioning values.

## Navigation and integration

Chapter 2 uses `/steps?section=section_3` and `/lesson?section=section_3&deck=probability-chapter-2&item=<id>`. Chapter 1 continues to use section_2. Chapter and lesson dropdowns, a complete expandable contents map with a current-page marker, and previous/next links are shared by both chapters. Old step-only lesson URLs lead to the new chapter outline. Existing quiz topics remain available under Practice quizzes; quiz content, progress, and database schema are unchanged.

## Rebuild and verify

```sh
python3 scripts/build-probability-chapter-two.py --pdf '/path/to/Introduction to Probability (1).pdf'
node scripts/test-probability-chapter-two.cjs
node scripts/test-native-probability.cjs
node scripts/test-formula-notation.cjs
npx tsc --noEmit
npm run build
```

The builder crops actual diagrams using reviewed PDF coordinates; omit `--pdf` to rebuild only the native data. The content test checks structure, closed card boundaries, example/figure/card inventories, asset existence, source corrections, term definitions, and mathematical token/structure preservation under color annotation for every inline and displayed expression. These automated comparisons validate rendering against the authored transcription, not an independent OCR verification of the PDF.
