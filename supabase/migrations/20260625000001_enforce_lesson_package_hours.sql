-- Enforce student package hour limits at the database layer.
-- Allocated hours include scheduled/pending lessons, completed lessons,
-- student-absent lessons, and reschedule-requested lessons.

create or replace function public.enforce_student_package_hours()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  package_total numeric := 0;
  allocated_other numeric := 0;
  requested_hours numeric := 0;
begin
  if new.status is null or new.status not in (
    'pending',
    'completed',
    'student_absent',
    'reschedule_requested'
  ) then
    return new;
  end if;

  requested_hours := coalesce(new.hours, 0);

  select coalesce(sum(coalesce(package_hours, 0)), 0)
    into package_total
  from public.student_packages
  where student_id = new.student_id
    and coalesce(is_active, true) = true;

  select coalesce(sum(coalesce(hours, 0)), 0)
    into allocated_other
  from public.tutor_lessons
  where student_id = new.student_id
    and (new.id is null or id <> new.id)
    and status in (
      'pending',
      'completed',
      'student_absent',
      'reschedule_requested'
    );

  if allocated_other + requested_hours > package_total + 0.0001 then
    raise exception
      'This student does not have enough remaining package hours. Please ask admin to add a new package before assigning more lessons.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_student_package_hours_trigger on public.tutor_lessons;

create trigger enforce_student_package_hours_trigger
before insert or update of student_id, hours, status
on public.tutor_lessons
for each row
execute function public.enforce_student_package_hours();
