# Chapter 1: subsection extraction

Source: `Introduction to Probability (1).pdf`, sections 1.1–1.7 (printed pp. 3–49; PDF pp. 8–54).

## Structure

Twenty named subsections become twenty lesson items. Sections 1.4 and 1.7 have no named subsections; each is one lesson under its exact section heading. The five sections with subsections each begin with an Intro lesson containing all material before the first named subsection. These introductions are included in the 27-lesson count.

| Section | Exact lesson heading | Cards | Figures | Examples |
|---|---|---|---|---|
| 1.1 | Intro | 0 | 0 | 0 |
| 1.1 | Set Operations | 0 | 1 | 0 |
| 1.1 | The Algebra of Sets | 0 | 0 | 0 |
| 1.2 | Intro | 1 | 1 | 0 |
| 1.2 | Sample Spaces and Events | 0 | 0 | 0 |
| 1.2 | Choosing an Appropriate Sample Space | 0 | 0 | 1 |
| 1.2 | Sequential Models | 0 | 1 | 0 |
| 1.2 | Probability Laws | 1 | 0 | 0 |
| 1.2 | Discrete Models | 2 | 1 | 2 |
| 1.2 | Continuous Models | 0 | 1 | 2 |
| 1.2 | Properties of Probability Laws | 1 | 1 | 0 |
| 1.2 | Models and Reality | 0 | 0 | 0 |
| 1.3 | Intro | 0 | 0 | 0 |
| 1.3 | Conditional Probabilities Specify a Probability Law | 1 | 1 | 3 |
| 1.3 | Using Conditional Probability for Modeling | 1 | 4 | 3 |
| 1.4 | TOTAL PROBABILITY THEOREM AND BAYES’ RULE | 2 | 2 | 5 |
| 1.5 | Intro | 0 | 0 | 1 |
| 1.5 | Conditional Independence | 1 | 0 | 2 |
| 1.5 | Independence of a Collection of Events | 1 | 0 | 2 |
| 1.5 | Reliability | 0 | 1 | 1 |
| 1.5 | Independent Trials and the Binomial Probabilities | 0 | 1 | 1 |
| 1.6 | Intro | 0 | 0 | 0 |
| 1.6 | The Counting Principle | 1 | 1 | 2 |
| 1.6 | k-permutations | 0 | 0 | 2 |
| 1.6 | Combinations | 0 | 0 | 1 |
| 1.6 | Partitions | 1 | 0 | 2 |
| 1.7 | SUMMARY AND DISCUSSION | 0 | 0 | 0 |

## Extraction rules

- Opening paragraphs are transcribed verbatim. Line wrapping, ligatures, subscripts, set symbols, and fraction layout are normalized for HTML; the unmodified original paragraph image is available alongside every transcription. A display equation or list belonging to the paragraph stays with it.
- Each lesson now includes the full original paragraphs containing inline mathematics or introducing displayed formulas, plus the lead-ins needed for the following cards/examples. There are 53 additional contextual passages. Forty-six have readable HTML transcriptions; seven longer derivations use their complete original image layout directly. Whitespace, ligatures, Unicode math glyphs, linear fractions, and C(n, k) for a stacked binomial coefficient are normalized in HTML; every unmodified original remains available.
- Passages, cards, figures, and examples follow source order, keeping formula introductions beside their statements. The separate unexplained formula list is no longer rendered. Editorial summaries remain available as Key ideas.
- Mathematical footnotes stay with the subsection they explain: the events footnote with Sample Spaces and Events, and the length/integral footnote with Continuous Models.
- Boxed statements, all numbered figures with their complete captions, and all numbered examples with solutions are original lossless PDF-region images. Multipage examples retain every part in reading order.
- The complete original passage is also available so all intermediate derivations, inline formulas, and footnotes remain inspectable.
- The inventory has 13 boxed statements, Figures 1.1–1.16, and Examples 1.1–1.30, without gaps or duplicate assignments.
- Floated figures follow their subject: Figure 1.5 belongs to Continuous Models, Figure 1.6 to Properties of Probability Laws, and Figure 1.11 to Using Conditional Probability for Modeling. Figure 1.2 belongs to the 1.2 introduction; Example 1.17 belongs to the 1.5 introduction.
- Figure 1.9 has a misleading original caption naming the total probability theorem. Its original image is preserved; a short note identifies the multiplication rule actually illustrated.

## Regeneration and validation

The PDF is not stored in the repository. Supply its path locally; the generated data records its SHA-256.

```sh
python3 scripts/extract-probability-chapter-one.py --pdf /path/to/Introduction-to-Probability.pdf
python3 scripts/validate-probability-chapter-one.py --pdf /path/to/Introduction-to-Probability.pdf
```

Both scripts require `pdfplumber` and its rendering dependencies; validation also uses Pillow. The extraction manifest records exact headings, reviewed crop coordinates in PDF points, paragraph transcriptions, summaries, formulas, and asset ownership. The generated inventory records dimensions and source locations for every image. Validation checks the PDF hash, heading presence, inventory completeness, rectangle bounds, image dimensions, clipped glyphs, and orphan assets. It also checks that every mathematical glyph in each source range is covered by an opening, contextual passage, card, figure, or example, and that the Sets intro contains the full membership and finite-set explanations.

## App integration

Chapter 1 uses `/steps?section=section_2` and `/lesson?section=section_2&deck=probability-chapter-1&item=<subsection-id>`. Its home card shows 7 sections and 27 lessons. Legacy Chapter 1 lesson links with only `step` open the new outline, rather than presenting an unrelated subsection. The old custom Chapter 1 lesson data is retired. Chapter 2, the existing quiz data, and quiz routes are unchanged.

### Interactive formula presentation

Chapter 1 now uses `FormulaExplorer` for displayed equations and inline notation.
Display equations use KaTeX, semantic colors, and a show/hide control. The expanded
view connects highlighted symbols to short definitions with measured curved paths.
Symbol chips reveal further groups of definitions; inline notation opens the same
keyboard-accessible explorer.

Original cards, examples, and figures retain their exact artwork. A generated
`formulaRegions` layer locates and colors the original mathematical glyphs and
opens a focused explanation when selected. Fraction bars join numerator and
denominator regions. Custom PDF glyph codes and overprinted non-membership signs
are normalized only in annotation labels, never in the source artwork.
`extract-probability-chapter-one.py` regenerates this layer automatically by calling
`extract-formula-annotations.py`.

Validation commands:

```sh
node scripts/test-formula-notation.cjs
python3 scripts/validate-formula-coverage.py --pdf '/path/to/Introduction to Probability (1).pdf'
python3 scripts/validate-probability-chapter-one.py --pdf '/path/to/Introduction to Probability (1).pdf'
```
