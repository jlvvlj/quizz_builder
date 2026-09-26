ALTER TABLE public.learning_decks ADD COLUMN IF NOT EXISTS question_format text NOT NULL DEFAULT 'vocabulary' CHECK (question_format IN ('vocabulary','multiple_choice'));
ALTER TABLE public.words10k ADD COLUMN IF NOT EXISTS authored_options jsonb;
ALTER TABLE public.words10k ADD COLUMN IF NOT EXISTS explanation text;
ALTER TABLE public.words10k ADD COLUMN IF NOT EXISTS source_id text;
ALTER TABLE public.words10k ADD COLUMN IF NOT EXISTS source_page integer;
ALTER TABLE public.words10k ADD COLUMN IF NOT EXISTS step_title text;
CREATE UNIQUE INDEX IF NOT EXISTS words10k_deck_source_idx ON public.words10k(deck_id, source_id);
ALTER TABLE public.words10k ADD CONSTRAINT authored_options_four CHECK (authored_options IS NULL OR (jsonb_typeof(authored_options)='array' AND jsonb_array_length(authored_options)=4 AND authored_options @> jsonb_build_array(english)));
