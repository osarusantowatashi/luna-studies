-- Compatibility cleanup for early local installs of question language metadata.
-- prompt_language is deprecated for new records; multilingual prompt text lives
-- in question_en/question_zh/question_ja and related option/explanation fields.

alter table public.questions
  add column if not exists prompt_language text not null default 'English';

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'questions'
      and column_name = 'instruction_language'
  ) then
    execute '
      update public.questions
      set prompt_language = instruction_language
      where prompt_language is null
        or prompt_language = ''''
        or prompt_language = ''English''
    ';
  end if;
end $$;

drop index if exists idx_questions_instruction_language;

create index if not exists idx_questions_prompt_language
  on public.questions(prompt_language);

create index if not exists idx_questions_language_pair
  on public.questions(target_language, prompt_language);
