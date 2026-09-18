# Probability course content

`questions.json` is the reviewed source for the first probability course, based on the chapter **Sample Space and Probability** from Bertsekas and Tsitsiklis. It contains 102 four-choice questions:

- 38 notation questions
- 8 questions in each of the eight concept steps

Each question includes a stable source ID, four authored choices, the correct answer, an explanation, and its source PDF page. The app stores prompts in the existing `japanese_word` field and answers in `english` so the existing quiz and progress system can be reused without replacing its interaction model.

The checked-in data migration is generated from this JSON:

```sh
node data/probability/generate-sql.mjs supabase/migrations/20260914031438_streamline_probability_copy.sql
```

`import.mjs` can reapply the JSON directly to a configured development project and verifies that all 102 questions were saved with four choices. Normal deployments should use the Supabase migrations.

## Discrete Random Variables

`chapter-2/questions.json` contains the reviewed second probability deck. It has 80 four-choice questions in eight steps:

- notation
- random variables and PMFs
- standard discrete distributions
- functions of random variables
- expectation, mean, and variance
- joint PMFs and multiple variables
- conditioning and conditional expectation
- independence, sums, and estimation

Generate its migration with:

```sh
node data/probability/chapter-2/generate-sql.mjs supabase/migrations/<generated-name>.sql
```

`chapter-2/import.mjs` can reapply and verify the deck directly against the configured development project.
