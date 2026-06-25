-- CMS metadata for the admin Question Bank.

alter table public.questions
  add column if not exists category text,
  add column if not exists status text not null default 'approved',
  add column if not exists image_url text,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_questions_category
  on public.questions(category);

create index if not exists idx_questions_status
  on public.questions(status);

create index if not exists idx_questions_updated_at
  on public.questions(updated_at desc);
