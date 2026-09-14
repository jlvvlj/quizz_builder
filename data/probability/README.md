# Probability course content

`questions.json` is the reviewed source for the first probability course, based on the chapter **Sample Space and Probability** from Bertsekas and Tsitsiklis. It contains 102 four-choice questions:

- 38 notation questions
- 8 questions in each of the eight concept steps

Each question includes a stable source ID, four authored choices, the correct answer, an explanation, and its source PDF page. The app stores prompts in the existing `japanese_word` field and answers in `english` so the existing quiz and progress system can be reused without replacing its interaction model.

The checked-in data migration is generated from this JSON:

```sh
node data/probability/generate-sql.mjs supabase/migrations/20260914023541_probability_chapter_one_questions.sql
```

`import.mjs` can reapply the JSON directly to a configured development project and verifies that all 102 questions were saved with four choices. Normal deployments should use the Supabase migrations.
