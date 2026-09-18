-- Adapt the ORIGINAL app's data contract. Private data is server-only.
create table public.users (
 id uuid primary key default gen_random_uuid(), email text unique not null,
 password_hash text not null, auth_provider text not null default 'email', created_at timestamptz default now(),
 session_size integer not null default 7 check(session_size between 1 and 100), auto_advance boolean default true,
 audio_auto_play boolean default false, play_correct_answer_audio boolean default false,
 show_phrase boolean default false, dark_mode boolean default true, large_text boolean default false,
 daily_reminders boolean default false, weekly_progress boolean default false, current_session integer default 1,
 quiz_direction text default 'forward' check(quiz_direction in ('forward','reverse')),
 show_furigana boolean default false, timer_duration integer default 10 check(timer_duration between 1 and 120),
 answer_choices integer default 3 check(answer_choices between 2 and 6), kanji_frequency_source text default 'default'
);
create table public.app_sessions (
 token_hash text primary key, user_id uuid not null references public.users(id) on delete cascade,
 expires_at timestamptz not null
);
create index original_app_sessions_user_idx on public.app_sessions(user_id);
create index original_app_sessions_expiry_idx on public.app_sessions(expires_at);
create table public.user_progress (
 user_id uuid not null references public.users(id) on delete cascade,
 word_id bigint not null references public.words10k(id) on delete cascade,
 quiz_type text not null default 'multiple_choice' check(quiz_type in ('multiple_choice','typing')),
 progress numeric default 0 check(progress between 0 and 100),
 time_to_answer numeric default 0 check(time_to_answer>=0), total_misses integer default 0 check(total_misses>=0),
 correct_answers integer default 0 check(correct_answers>=0), progress_status text default 'new',
 marked_as text, last_reviewed timestamptz, primary key(user_id,word_id,quiz_type)
);
create index user_progress_word_idx on public.user_progress(word_id);
create table public.user_daily_activity (
 user_id uuid not null references public.users(id) on delete cascade,
 day date not null, words_practiced integer default 0,
 time_spent_seconds integer default 0, primary key(user_id,day)
);
create table public.learning_decks (
 id text primary key, title text not null, description text not null default '',
 question_label text not null default 'Question',answer_label text not null default 'Answer'
);
alter table public.words10k add column deck_id text references public.learning_decks(id);
create index words10k_deck_idx on public.words10k(deck_id);
insert into public.learning_decks(id,title,description,question_label,answer_label) values
 ('french-500','French · 500 common words','Read the Japanese prompt and recall the French word. Frequency-ranked word forms, including articles and conjugations.','Japanese','French');
update public.words10k set deck_id='french-500' where frequency_rank between 1 and 500;
alter table public.users enable row level security;
alter table public.app_sessions enable row level security;
alter table public.user_progress enable row level security;
alter table public.user_daily_activity enable row level security;
alter table public.learning_decks enable row level security;
revoke all on public.users,public.app_sessions,public.user_progress,public.user_daily_activity,public.learning_decks from anon,authenticated;
grant all on public.users,public.app_sessions,public.user_progress,public.user_daily_activity,public.learning_decks to service_role;
-- Session increment stays atomic; only the verified API can call it.
create function public.increment_app_session(p_user uuid) returns integer language sql security invoker set search_path=public as $$
 update public.users set current_session=current_session+1 where id=p_user returning current_session;
$$;
revoke all on function public.increment_app_session(uuid) from public,anon,authenticated;
grant execute on function public.increment_app_session(uuid) to service_role;
