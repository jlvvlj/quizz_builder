# Quiz content API

Requests below target a local preview. Keep your cookie file private.

```sh
curl -c /tmp/quizz-cookies.txt http://127.0.0.1:3015/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"claude-verify@example.com","password":"JalingoTest123!"}'

curl -b /tmp/quizz-cookies.txt http://127.0.0.1:3015/api/quizzes \
  -H 'Content-Type: application/json' \
  -d '{"title":"Astronomy","description":"Our solar system","is_public":false}'
```

Take `quiz.id` from the response and replace `<quiz-id>` below:

```sh
curl -b /tmp/quizz-cookies.txt http://127.0.0.1:3015/api/quizzes/<quiz-id>/items \
  -H 'Content-Type: application/json' \
  -d '{"items":[{"question":"Which planet is known as the Red Planet?","answer":"Mars","position":0},{"question":"Which planet is closest to the Sun?","answer":"Mercury","position":1}]}'
```

| Endpoint | Methods | Body or behavior |
| --- | --- | --- |
| `/api/auth/signup` | POST | `email`, `password` (8+ characters, <=72 UTF-8 bytes) |
| `/api/auth/login` | POST | `email`, `password`; sets HttpOnly cookie |
| `/api/auth/logout` | POST | Revokes the current session |
| `/api/auth/me` | GET, PATCH | PATCH `session_size` (1–100) |
| `/api/quizzes?offset=0` | GET | Up to 100 accessible quizzes, `total`, `offset` |
| `/api/quizzes` | POST | `title`, optional `description`, `is_public` |
| `/api/quizzes/<id>` | GET, PUT, DELETE | Only owner may edit/delete; deletion cascades to its practice data |
| `/api/quizzes/<id>/items?offset=0` | GET | Owner only; page of 100 items with `total`, `offset` |
| `/api/quizzes/<id>/items` | POST | Owner only; `items` array of 1–100 questions |
| `/api/quizzes/<id>/items/<item-id>` | PUT, DELETE | Owner only; partial field edits or deletion |
| `/api/sessions` | POST | `quiz_id`, `mode`: `typing` or `multiple_choice` |
| `/api/sessions/<id>` | GET | Own session; no unsubmitted answers included |
| `/api/sessions/<id>/answers` | POST | `item_id`, `answer`; empty answer means reveal/incorrect |
| `/api/activity` | GET | Own daily activity and latest 5 unfinished sessions |

Item fields: required `question`, `answer`; optional `accepted_answers` (array of
explicit alternatives), `explanation`, `position` (non-negative integer),
`metadata` (JSON object). Default position is the index within the posted batch;
supply positions when appending if a particular order is required.

Typed answers normalize Unicode width, case and whitespace. Punctuation,
mathematical signs and diacritics remain meaningful: `-1` is not accepted as `1`.
Multiple choice uses distinct canonical answers from the quiz as distractors;
if no distractor exists, the API returns 422 and asks the learner to select
another mode or add content. Answers are graded on the server. Only the first
submission for a session item counts, including concurrent/retried requests.

Visibility: private quizzes are owner-only. `is_public: true` makes a quiz
available to other signed-in users for practice; its answer-editing API remains
owner-only. This is simple content sharing, not per-tenant white-label hosting.

Common errors: 400 invalid data, 401 missing/expired session, 403 cross-origin
write, 404 inaccessible/missing resource, 409 answer submitted out of sequence,
422 quiz cannot be practised in the requested mode. Database errors are logged
server-side and returned as explicit 500 errors; no mock data is substituted.
