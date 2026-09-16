# Chapter 1 formula presentation QA

Final result: passed

Compared the two supplied references and the implemented Set Operations screen together in the final browser comparison. Scope is the formula treatment inside the existing lesson pages.

## Visual checks

- Reference 1: matching outlines, curved connectors anchored to actual formula elements, and concise definitions. The implementation recalculates connectors when the formula scrolls or its layout changes.
- Reference 2: cream formula surface, mathematical serif typography, consistent semantic colors, and matching symbol chips. The existing lesson navigation and surrounding dark page remain intact.
- Native fractions, powers, indexed unions/intersections, and binomial notation render correctly. Original excerpt mathematics retains its source typesetting and gains glyph-aligned colors and explanations.
- Expanded annotations show three definitions at a time. Symbol chips expose every remaining element without crossing a large number of pointers.
- Source formula crops exclude neighboring prose. Checked the Probability Axioms card, original figure, native conditional-probability fraction, and union formula.

## Interaction and viewport checks

- All 27 lesson routes loaded with zero KaTeX error nodes.
- All 27 routes checked at approximately 390 CSS pixels. Long-expression overflow found in Algebra of Sets and k-permutations was corrected and both pages rechecked (scroll width equals viewport width).
- Default browser viewport also inspected. Temporary viewport override reset.
- Show/hide, selecting another group of symbols, opening inline complement notation, original-excerpt exploration, and Escape to close were exercised in the browser.
- Definitions use text and outlines in addition to color. Dialogs use Radix focus management; controls have labels and keyboard focus styles.

## Automated checks

- Production build: passed (existing unrelated hook warnings remain).
- Formula tests: 462 expressions, 2,801 original-source regions; source-character preservation, fraction rendering, powers, combinations, contextual bars, and absence of unresolved PDF character IDs.
- Independent PDF coverage: 5,852 mathematical variable/operator glyphs annotated across 242 excerpts (grouping delimiters and punctuation are excluded from the coverage count).
- Existing source validation: 27 lessons, 53 explanatory passages, 13 cards, 16 figures, 30 examples; no clipped source excerpts or orphan image assets.
- `git diff --check`: passed.

No unresolved visual blockers for this change.

## Annotation layout correction

- Recompared the hand-drawn reference with the conditional-probability formula in the browser. Definitions are now plain colored, italic labels with transparent backgrounds and zero borders, positioned above and below the expression.
- Curved pointers connect each label to its highlighted element. Alternating symbol groups reverse the above/below arrangement.
- Checked both native typeset mathematics and original extracted mathematics at the default viewport and 389 CSS pixels. Narrow expressions scroll inside their formula area without page overflow; pointers to offscreen symbols are hidden.
- Verified symbol-group selection and show/hide. The temporary viewport override was reset.
- TypeScript and the 462-expression/2,801-region formula suite passed after the layout change. The PDF coverage and complete route checks above are from the preceding implementation; extraction data is unchanged.
