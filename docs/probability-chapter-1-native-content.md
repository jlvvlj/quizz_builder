# Chapter 1 native lesson content

Chapter 1 now displays text, key-point sections, proofs, worked examples, and figure captions as HTML paragraphs and KaTeX mathematics. The source images and extraction inventory remain available in the repository for auditing; they are no longer used as text content in the lesson UI. The duplicate screenshot appendices have been removed. Examples are expanded in the lesson flow.

## Source and coverage

Source: the user-provided `Introduction to Probability (1).pdf`, Chapter 1.

- 7 previously image-only mathematical passages.
- All 13 boxed key-point sections.
- All 30 worked examples.
- All 16 figure captions, including the derivations inside them.
- 165 native display equations across these 66 assets.
- The existing native introductions and 46 native mathematical passages are retained.

`src/data/probability-chapter-1-native.md` is the reviewed transcription. `@@` introduces an asset ID, blank lines separate paragraphs, and `$$` introduces one display equation in TeX. Rebuild its JSON with:

```sh
node scripts/build-native-probability-content.cjs
```

The builder checks that every text asset and figure caption has a native rendering. `probability-chapter-1-diagrams.json` contains the diagram-only height in PDF coordinates: the top of the printed caption minus a five-point gap. The SVG viewport excludes captions, and only formula regions within the diagram are explorable. The original artwork is not modified.

## Transcription decisions and corrections

Prose wording is retained, with line wrapping, line-end hyphenation, and mathematical typesetting normalized. Redundant asset headings are supplied by the lesson UI. Inline binomial notation is represented by C(n, k); display equations use the standard stacked binomial notation. Page artifacts and footnote markers are omitted.

Corrections to apparent source errors are explicit here rather than silently described as exact facsimiles:

- Probability Laws additivity derivation: the repeated A₂ in the grouped union is A₃.
- Example 1.14: the stated behind-to-up-to-date probability is 0.6, and behind-to-behind is 0.4. The printed calculation swaps these. The native calculation follows the statement: P(U₂)=0.76, P(B₂)=0.24, P(U₃)=0.752. A short lesson note states which transition probabilities are used.
- Example 1.17(a): use Aᵢ and Bⱼ consistently in the joint probability.
- Example 1.22: use approximation signs for rounded results and retain 0.75×0.95=0.7125 exactly.
- Example 1.29: the distinguishable T labels are T₁, T₂, T₃.
- Figure 1.9: the depicted identity is the multiplication rule; the general intersection ends at Aₙ, not A₃.
- Correct the missing “be” in the Independence definition and “calculation” spelling.

## Validation

`node scripts/test-native-probability.cjs` checks complete asset coverage and compares the mathematical token sequence and fraction/subscript/superscript/operator-limit structure of all 165 equations before and after coloring. Existing notation tests continue to cover the previously native passages and original diagram annotations.

All 27 lesson routes were loaded in the browser at 320 CSS pixels: no KaTeX errors, no page-level horizontal overflow, and no non-figure source images in any lesson. All 66 native assets were present. The conditional-probability proof and key-point section were also inspected at desktop width; show/hide and above/below pointers work on the new equations.
