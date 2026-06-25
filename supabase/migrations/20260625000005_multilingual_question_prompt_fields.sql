-- One question row now stores all prompt-language versions.
-- target_language decides the learning content.
-- question_en/question_zh/question_ja decide how the same question is shown.

alter table public.questions
  add column if not exists question_en text,
  add column if not exists question_zh text,
  add column if not exists question_ja text,
  add column if not exists option_a_en text,
  add column if not exists option_a_zh text,
  add column if not exists option_a_ja text,
  add column if not exists option_b_en text,
  add column if not exists option_b_zh text,
  add column if not exists option_b_ja text,
  add column if not exists option_c_en text,
  add column if not exists option_c_zh text,
  add column if not exists option_c_ja text,
  add column if not exists option_d_en text,
  add column if not exists option_d_zh text,
  add column if not exists option_d_ja text,
  add column if not exists explanation_en text,
  add column if not exists explanation_zh text,
  add column if not exists explanation_ja text;

update public.questions
set
  question_en = coalesce(
    question_en,
    case when coalesce(prompt_language, 'English') = 'English' then question_text end
  ),
  question_zh = coalesce(
    question_zh,
    case when prompt_language = 'Chinese' then question_text end
  ),
  question_ja = coalesce(
    question_ja,
    case when prompt_language = 'Japanese' then question_text end
  ),
  option_a_en = coalesce(
    option_a_en,
    case when coalesce(prompt_language, 'English') = 'English' then option_a end
  ),
  option_a_zh = coalesce(
    option_a_zh,
    case when prompt_language = 'Chinese' then option_a end
  ),
  option_a_ja = coalesce(
    option_a_ja,
    case when prompt_language = 'Japanese' then option_a end
  ),
  option_b_en = coalesce(
    option_b_en,
    case when coalesce(prompt_language, 'English') = 'English' then option_b end
  ),
  option_b_zh = coalesce(
    option_b_zh,
    case when prompt_language = 'Chinese' then option_b end
  ),
  option_b_ja = coalesce(
    option_b_ja,
    case when prompt_language = 'Japanese' then option_b end
  ),
  option_c_en = coalesce(
    option_c_en,
    case when coalesce(prompt_language, 'English') = 'English' then option_c end
  ),
  option_c_zh = coalesce(
    option_c_zh,
    case when prompt_language = 'Chinese' then option_c end
  ),
  option_c_ja = coalesce(
    option_c_ja,
    case when prompt_language = 'Japanese' then option_c end
  ),
  option_d_en = coalesce(
    option_d_en,
    case when coalesce(prompt_language, 'English') = 'English' then option_d end
  ),
  option_d_zh = coalesce(
    option_d_zh,
    case when prompt_language = 'Chinese' then option_d end
  ),
  option_d_ja = coalesce(
    option_d_ja,
    case when prompt_language = 'Japanese' then option_d end
  ),
  explanation_en = coalesce(
    explanation_en,
    case when coalesce(prompt_language, 'English') = 'English' then explanation end
  ),
  explanation_zh = coalesce(
    explanation_zh,
    case when prompt_language = 'Chinese' then explanation end
  ),
  explanation_ja = coalesce(
    explanation_ja,
    case when prompt_language = 'Japanese' then explanation end
  );
