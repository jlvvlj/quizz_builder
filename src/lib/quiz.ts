export interface QuizItem {
  id: string; question: string; answer: string; accepted_answers: string[];
  explanation: string; position: number;
}
export interface Question { id: string; question: string; options: string[] }
export interface Answer { item_id: string; submitted_answer: string; correct: boolean; answer: string; explanation: string; progress: number }
export interface PracticeSession {
  id: string; quiz_id: string; title: string; mode: 'typing' | 'multiple_choice';
  questions: Question[]; answers: Answer[]; completed_at: string | null;
}
// Preserve mathematical symbols, punctuation and diacritics: "-1" is not "1".
// Additional spellings belong in accepted_answers, not language-specific code.
export function normalizeAnswer(answer: string) {
  return answer.normalize('NFKC').trim().replace(/\s+/gu, ' ').toLowerCase();
}
export function isCorrect(answer: string, item: Pick<QuizItem, 'answer' | 'accepted_answers'>) {
  return [item.answer, ...item.accepted_answers].some(value => normalizeAnswer(value) === normalizeAnswer(answer));
}
