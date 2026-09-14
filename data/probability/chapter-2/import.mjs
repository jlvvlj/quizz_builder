import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter(line => line.includes('=') && !line.startsWith('#'))
    .map(line => {
      const separator = line.indexOf('=')
      return [
        line.slice(0, separator),
        line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, ''),
      ]
    }),
)

const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const course = JSON.parse(readFileSync(new URL('./questions.json', import.meta.url), 'utf8'))
const deckId = 'probability-chapter-2'
const section = 'section_3'

const { error: deckError } = await db.from('learning_decks').upsert({
  id: deckId,
  title: 'Probability · Discrete Random Variables',
  description: 'Learn discrete random variables, probability mass functions, standard distributions, transformations, expectation, variance, conditioning and independence.',
  question_label: 'Question',
  answer_label: 'Answer',
  question_format: 'multiple_choice',
})

if (deckError) throw deckError

const stepTitles = new Map(course.steps.map(step => [step.number, step.title]))
const rows = course.questions.map(question => ({
  deck_id: deckId,
  source_id: question.id,
  source_page: question.source_pdf_page,
  section,
  step: `step_${question.step}`,
  step_title: stepTitles.get(question.step),
  japanese_word: question.question,
  english: question.correct_answer,
  authored_options: question.options,
  explanation: question.explanation,
}))

for (const question of rows) {
  if (
    new Set(question.authored_options).size !== 4
    || !question.authored_options.includes(question.english)
  ) {
    throw new Error(`Invalid choices for ${question.source_id}`)
  }
}

const saved = await db
  .from('words10k')
  .upsert(rows, { onConflict: 'deck_id,source_id' })
  .select('id,source_id,japanese_word,english,authored_options,step')

if (saved.error) throw saved.error
if (saved.data.length !== course.questions.length) throw new Error('Incomplete import')

const { count, error: countError } = await db
  .from('words10k')
  .select('*', { count: 'exact', head: true })
  .eq('deck_id', deckId)

if (countError) throw countError
if (count !== course.questions.length) {
  throw new Error(`Expected ${course.questions.length} deck items, found ${count}`)
}

console.log(`Verified ${saved.data.length} imported questions with four choices each.`)

