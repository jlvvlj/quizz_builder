import type { NextApiRequest, NextApiResponse } from 'next'
import updateMarkedStatus from '@/pages/api/progress/update-marked-status'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { wordId, markedAs, quizType } = req.body ?? {}
    req.body = {
        content: 'words',
        itemId: wordId,
        markedAs,
        quizType: quizType ?? 'multiple_choice',
    }
    return updateMarkedStatus(req, res)
}
