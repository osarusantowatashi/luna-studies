-- Admin-facing metadata explaining why generated questions match a pathway/level.
-- Student practice ignores these fields.

alter table public.questions
  add column if not exists estimated_cefr text,
  add column if not exists difficulty_rationale text,
  add column if not exists question_type text,
  add column if not exists why_this_matches_level text;

create index if not exists idx_questions_question_type
  on public.questions(question_type);
