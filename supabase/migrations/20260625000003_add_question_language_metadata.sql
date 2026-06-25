-- Add target-language metadata for the permanent multilingual question-bank workflow.
-- target_language = the language the student is learning.
-- Prompt language is stored as multilingual fields on the same row.

alter table public.questions
  add column if not exists target_language text not null default 'English';

create index if not exists idx_questions_target_language
  on public.questions(target_language);
