alter table public.student_grade_access
  add column if not exists target_language text not null default 'English',
  add column if not exists pathway text,
  add column if not exists level text;

create index if not exists idx_student_grade_access_pathway
  on public.student_grade_access(student_id, target_language, pathway, level);

alter table public.questions
  add column if not exists pathway text,
  add column if not exists level text,
  add column if not exists level_label text,
  add column if not exists pathway_variant text,
  add column if not exists variant_label text,
  add column if not exists difficulty_label text;

create index if not exists idx_questions_pathway_access
  on public.questions(target_language, pathway, level);

create index if not exists idx_questions_pathway_variant
  on public.questions(pathway, pathway_variant);

update public.student_grade_access
set
  target_language = coalesce(nullif(target_language, ''), 'English'),
  level = coalesce(level, grade)
where pathway is null
   or level is null
   or target_language is null
   or target_language = '';
