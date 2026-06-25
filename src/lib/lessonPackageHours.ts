import { supabase } from "@/lib/supabase";

export const PACKAGE_ALLOCATED_LESSON_STATUSES = [
  "pending",
  "completed",
  "student_absent",
  "reschedule_requested",
] as const;

export type PackageAllocatedLessonStatus =
  (typeof PACKAGE_ALLOCATED_LESSON_STATUSES)[number];

type PackageLike = {
  student_id?: string;
  package_hours?: number | string | null;
  is_active?: boolean | null;
};

type LessonLike = {
  id?: string;
  student_id?: string;
  hours?: number | string | null;
  status?: string | null;
};

export type LessonPackageBalance = {
  totalPackageHours: number;
  allocatedLessonHours: number;
  remainingHours: number;
};

export const insufficientPackageHoursMessage =
  "This student does not have enough remaining package hours. Please ask admin to add a new package before assigning more lessons.";

export function isAllocatedLessonStatus(status?: string | null) {
  return PACKAGE_ALLOCATED_LESSON_STATUSES.includes(
    status as PackageAllocatedLessonStatus
  );
}

export function calculateLessonPackageBalance(
  packages: PackageLike[],
  lessons: LessonLike[],
  studentId: string,
  options: { excludeLessonId?: string; proposedHours?: number } = {}
): LessonPackageBalance {
  const totalPackageHours = packages
    .filter((pkg) => pkg.student_id === studentId && pkg.is_active !== false)
    .reduce((sum, pkg) => sum + Number(pkg.package_hours || 0), 0);

  const allocatedLessonHours = lessons
    .filter(
      (lesson) =>
        lesson.student_id === studentId &&
        lesson.id !== options.excludeLessonId &&
        isAllocatedLessonStatus(lesson.status)
    )
    .reduce((sum, lesson) => sum + Number(lesson.hours || 0), 0);

  const totalAllocatedHours =
    allocatedLessonHours + Number(options.proposedHours || 0);

  return {
    totalPackageHours,
    allocatedLessonHours: totalAllocatedHours,
    remainingHours: totalPackageHours - totalAllocatedHours,
  };
}

export async function getStudentLessonPackageBalance(
  studentId: string,
  options: { excludeLessonId?: string; proposedHours?: number } = {}
) {
  const { data: packages, error: packageError } = await supabase
    .from("student_packages")
    .select("student_id, package_hours, is_active")
    .eq("student_id", studentId);

  if (packageError) {
    throw packageError;
  }

  const { data: lessons, error: lessonError } = await supabase
    .from("tutor_lessons")
    .select("id, student_id, hours, status")
    .eq("student_id", studentId);

  if (lessonError) {
    throw lessonError;
  }

  return calculateLessonPackageBalance(
    packages || [],
    lessons || [],
    studentId,
    options
  );
}

export async function validateStudentPackageHours(
  studentId: string,
  requestedHours: number,
  options: { excludeLessonId?: string } = {}
) {
  const balance = await getStudentLessonPackageBalance(studentId, {
    excludeLessonId: options.excludeLessonId,
    proposedHours: requestedHours,
  });

  return {
    ok: balance.remainingHours >= -0.0001,
    balance,
    message: insufficientPackageHoursMessage,
  };
}
