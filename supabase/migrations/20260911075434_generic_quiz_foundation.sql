-- Restored prototype tables (quiz_topics/quiz_items/quiz_progress) and data remain intact.
-- Custom application authentication: only the Next.js server accesses these
-- tables. Browser roles receive no table grants; every API verifies a session.
create table public.builder_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email)),
  password_hash text not null,
  session_size integer not null default 20 check (session_size between 1 and 100),
  created_at timestamptz not null default now()
);
create table public.builder_app_sessions (
  token_hash text primary key,
  user_id uuid not null references public.builder_users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index app_sessions_user_id_idx on public.builder_app_sessions(user_id);
create index app_sessions_expiry_idx on public.builder_app_sessions(expires_at);
create table public.builder_quizzes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.builder_users(id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 160),
  description text not null default '',
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);
create index quizzes_owner_idx on public.builder_quizzes(owner_id);
create index quizzes_public_idx on public.builder_quizzes(created_at) where is_public;
create table public.builder_quiz_items (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.builder_quizzes(id) on delete cascade,
  question text not null check (length(trim(question)) between 1 and 4000),
  answer text not null check (length(trim(answer)) between 1 and 2000),
  accepted_answers text[] not null default '{}',
  explanation text not null default '',
  metadata jsonb not null default '{}',
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now()
);
create index quiz_items_quiz_position_idx on public.builder_quiz_items(quiz_id, position, id);
create table public.builder_quiz_progress (
  user_id uuid not null references public.builder_users(id) on delete cascade,
  item_id uuid not null references public.builder_quiz_items(id) on delete cascade,
  progress integer not null default 0 check (progress between 0 and 100),
  attempts integer not null default 0,
  correct_count integer not null default 0,
  last_reviewed timestamptz not null default now(),
  primary key (user_id, item_id)
);
create index quiz_progress_item_idx on public.builder_quiz_progress(item_id);
create table public.builder_user_daily_activity (
  user_id uuid not null references public.builder_users(id) on delete cascade,
  activity_date date not null default (now() at time zone 'utc')::date,
  answers integer not null default 0,
  primary key (user_id, activity_date)
);
create table public.builder_quiz_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.builder_users(id) on delete cascade,
  quiz_id uuid not null references public.builder_quizzes(id) on delete cascade,
  mode text not null check (mode in ('typing', 'multiple_choice')),
  -- Immutable snapshot keeps in-flight sessions consistent across content edits.
  questions jsonb not null check (jsonb_typeof(questions) = 'array' and jsonb_array_length(questions) > 0),
  answers jsonb not null default '[]',
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index quiz_sessions_user_idx on public.builder_quiz_sessions(user_id, created_at desc);
create index quiz_sessions_quiz_idx on public.builder_quiz_sessions(quiz_id);

alter table public.builder_users enable row level security;
alter table public.builder_app_sessions enable row level security;
alter table public.builder_quizzes enable row level security;
alter table public.builder_quiz_items enable row level security;
alter table public.builder_quiz_progress enable row level security;
alter table public.builder_user_daily_activity enable row level security;
alter table public.builder_quiz_sessions enable row level security;
revoke all on public.builder_users, public.builder_app_sessions, public.builder_quizzes, public.builder_quiz_items,
  public.builder_quiz_progress, public.builder_user_daily_activity, public.builder_quiz_sessions from anon, authenticated;
grant select, insert, update, delete on public.builder_users, public.builder_app_sessions, public.builder_quizzes,
  public.builder_quiz_items, public.builder_quiz_progress, public.builder_user_daily_activity, public.builder_quiz_sessions to service_role;

-- Session lock makes answer retries idempotent and progress updates atomic.
-- Correctness is computed by the trusted API, never accepted from the client.
create function public.record_quiz_answer(p_user uuid, p_session uuid, p_item uuid,
  p_answer text, p_correct boolean)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  s public.builder_quiz_sessions%rowtype;
  q jsonb;
  existing jsonb;
  result jsonb;
  updated_progress integer;
begin
  select * into s from public.builder_quiz_sessions where id=p_session and user_id=p_user for update;
  if not found then raise exception 'Session not found'; end if;
  if not exists(select 1 from public.builder_quizzes where id=s.quiz_id and (owner_id=p_user or is_public)) then
    raise exception 'Quiz access revoked';
  end if;
  select value into existing from jsonb_array_elements(s.answers) where value->>'item_id'=p_item::text;
  if existing is not null then return existing; end if;
  q := s.questions->jsonb_array_length(s.answers);
  if q is null or q->>'id' <> p_item::text then raise exception 'Answer the current question first'; end if;
  if not exists(select 1 from public.builder_quiz_items where id=p_item and quiz_id=s.quiz_id) then
    raise exception 'Question was removed; start a new session';
  end if;
  insert into public.builder_quiz_progress(user_id,item_id,progress,attempts,correct_count)
    values(p_user,p_item,case when p_correct then 10 else 0 end,1,case when p_correct then 1 else 0 end)
    on conflict(user_id,item_id) do update set
      progress=greatest(0,least(100,builder_quiz_progress.progress + case when p_correct then 10 else -20 end)),
      attempts=builder_quiz_progress.attempts+1,
      correct_count=builder_quiz_progress.correct_count+case when p_correct then 1 else 0 end,
      last_reviewed=now()
    returning progress into updated_progress;
  result := jsonb_build_object('item_id',p_item,'submitted_answer',p_answer,'correct',p_correct,
    'answer',q->>'answer','explanation',q->>'explanation','progress',updated_progress);
  update public.builder_quiz_sessions set answers=answers || jsonb_build_array(result),
    completed_at=case when jsonb_array_length(answers)+1=jsonb_array_length(questions) then now() else null end
    where id=p_session;
  insert into public.builder_user_daily_activity(user_id,answers) values(p_user,1)
    on conflict(user_id,activity_date) do update set answers=builder_user_daily_activity.answers+1;
  return result;
end;
$$;
revoke all on function public.record_quiz_answer(uuid,uuid,uuid,text,boolean) from public, anon, authenticated;
grant execute on function public.record_quiz_answer(uuid,uuid,uuid,text,boolean) to service_role;
