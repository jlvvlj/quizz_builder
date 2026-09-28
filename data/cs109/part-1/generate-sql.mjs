import { readFileSync, writeFileSync } from 'node:fs'

const outputPath = process.argv[2]

if (!outputPath) {
  throw new Error('Usage: node data/cs109/part-1/generate-sql.mjs <output.sql>')
}

const deck = JSON.parse(readFileSync(new URL('./deck.json', import.meta.url), 'utf8'))
const course = JSON.parse(readFileSync(new URL('./questions.json', import.meta.url), 'utf8'))
const stepTitles = new Map(course.steps.map(step => [step.number, step.title]))
const quote = value => `'${String(value).replaceAll("'", "''")}'`

// The reader is a website, not a PDF, so its questions have no source page.
const values = course.questions.map(question => `(
  ${quote(deck.id)},
  ${quote(question.id)},
  NULL,
  ${quote(deck.section)},
  'step_${Number(question.step)}',
  ${quote(stepTitles.get(question.step))},
  ${quote(question.question)},
  ${quote(question.correct_answer)},
  ${quote(JSON.stringify(question.options))}::jsonb,
  ${quote(question.explanation)}
)`).join(',\n')

const sql = `INSERT INTO public.learning_decks (
  id, title, description, question_label, answer_label, question_format
) VALUES (
  ${quote(deck.id)},
  ${quote(deck.title)},
  ${quote(deck.description)},
  ${quote(deck.question_label)},
  ${quote(deck.answer_label)},
  ${quote(deck.question_format)}
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  question_label = EXCLUDED.question_label,
  answer_label = EXCLUDED.answer_label,
  question_format = EXCLUDED.question_format;

INSERT INTO public.words10k (
  deck_id,
  source_id,
  source_page,
  section,
  step,
  step_title,
  japanese_word,
  english,
  authored_options,
  explanation
) VALUES
${values}
ON CONFLICT (deck_id, source_id) DO UPDATE SET
  source_page = EXCLUDED.source_page,
  section = EXCLUDED.section,
  step = EXCLUDED.step,
  step_title = EXCLUDED.step_title,
  japanese_word = EXCLUDED.japanese_word,
  english = EXCLUDED.english,
  authored_options = EXCLUDED.authored_options,
  explanation = EXCLUDED.explanation;
`

writeFileSync(outputPath, sql)
console.log(`Wrote ${course.questions.length} questions to ${outputPath}`)
