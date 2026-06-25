-- Prevent package edits/deletes from making a student's scheduled lesson hours
-- exceed their active purchased package hours.

create or replace function public.assert_student_package_balance(student_to_check uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  package_total numeric := 0;
  allocated_total numeric := 0;
begin
  select coalesce(sum(coalesce(package_hours, 0)), 0)
    into package_total
  from public.student_packages
  where student_id = student_to_check
    and coalesce(is_active, true) = true;

  select coalesce(sum(coalesce(hours, 0)), 0)
    into allocated_total
  from public.tutor_lessons
  where student_id = student_to_check
    and status in (
      'pending',
      'completed',
      'student_absent',
      'reschedule_requested'
    );

  if package_total + 0.0001 < allocated_total then
    raise exception
      'This package change would make scheduled lesson hours exceed purchased package hours. Add package hours or adjust lessons first.'
      using errcode = 'P0001';
  end if;
end;
$$;

create or replace function public.enforce_student_package_balance()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op in ('UPDATE', 'DELETE') then
    perform public.assert_student_package_balance(old.student_id);
  end if;

  if tg_op = 'UPDATE' and new.student_id is distinct from old.student_id then
    perform public.assert_student_package_balance(new.student_id);
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists enforce_student_package_balance_trigger on public.student_packages;

create trigger enforce_student_package_balance_trigger
after update of student_id, package_hours, is_active or delete
on public.student_packages
for each row
execute function public.enforce_student_package_balance();
