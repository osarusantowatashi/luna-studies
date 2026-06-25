import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { calculateLessonPackageBalance } from "@/lib/lessonPackageHours";
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  RotateCcw,
} from "lucide-react";

type LessonStatus =
  | "pending"
  | "completed"
  | "student_absent"
  | "reschedule_requested";

type Lesson = {
  id: string;
  tutor_id: string;
  student_id: string;
  lesson_date: string;
  lesson_time?: string | null;
  rescheduled_date?: string | null;
  hours: number;
  lesson_contents?: string | null;
  additional_remarks?: string | null;
  status: LessonStatus;
};

export default function AdminLessons() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);

  const [editingPackageId, setEditingPackageId] = useState("");
  const [packagePurchasedAt, setPackagePurchasedAt] = useState("");
  const [links, setLinks] = useState<any[]>([]);
  const [selectedTutor, setSelectedTutor] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [packages, setPackages] = useState<any[]>([]);
  const [showAddPackage, setShowAddPackage] = useState(false);
  const [packageStudentId, setPackageStudentId] = useState("");
  const [packageHours, setPackageHours] = useState("");
  const [packageName, setPackageName] = useState("");
  const [showPackageDetails, setShowPackageDetails] = useState(false);
  const [showLessonTable, setShowLessonTable] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [calendarMonth, setCalendarMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );


  useEffect(() => {
    fetchProfiles();
    fetchLessons();
    fetchLinks();
    fetchPackages();
  }, []);

  const addPackage = async () => {
    if (!packageStudentId) {
      alert("Please select a student.");
      return;
    }

    if (!packageHours || Number(packageHours) <= 0) {
      alert("Please enter package hours.");
      return;
    }

    const { error } = await supabase.from("student_packages").insert({
      student_id: packageStudentId,
      package_hours: Number(packageHours),
      package_name: packageName.trim() || null,
      purchased_at: packagePurchasedAt || new Date().toISOString().slice(0, 10),
      is_active: true,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setShowAddPackage(false);
    setPackageStudentId("");
    setPackageHours("");
    setPackageName("");
    fetchPackages();
  };

  const startAddPackage = (studentId = "", suggestedHours = "") => {
    setEditingPackageId("");
    setPackageStudentId(studentId);
    setPackageHours(suggestedHours);
    setPackageName("");
    setPackagePurchasedAt(new Date().toISOString().slice(0, 10));
    setShowAddPackage(true);
  };

  const getPackageBalanceAfterChange = (
    studentId: string,
    packageId: string,
    nextPackageHours?: number
  ) => {
    const adjustedPackages =
      typeof nextPackageHours === "number"
        ? packages.map((pkg) =>
            pkg.id === packageId
              ? { ...pkg, package_hours: nextPackageHours }
              : pkg
          )
        : packages.filter((pkg) => pkg.id !== packageId);

    return calculateLessonPackageBalance(adjustedPackages, lessons, studentId);
  };

  const updatePackage = async () => {
    if (!editingPackageId) return;

    if (!packageHours || Number(packageHours) <= 0) {
      alert("Please enter package hours.");
      return;
    }

    const nextPackageHours = Number(packageHours);
    const balanceAfterChange = getPackageBalanceAfterChange(
      packageStudentId,
      editingPackageId,
      nextPackageHours
    );

    if (balanceAfterChange.remainingHours < 0) {
      alert(
        `This package cannot be reduced because the student already has ${balanceAfterChange.allocatedLessonHours.toFixed(
          1
        )}h scheduled. Add or keep at least ${balanceAfterChange.allocatedLessonHours.toFixed(
          1
        )}h purchased before saving.`
      );
      return;
    }

    const { error } = await supabase
      .from("student_packages")
      .update({
        package_hours: nextPackageHours,
        package_name: packageName.trim() || null,
        purchased_at:
          packagePurchasedAt || new Date().toISOString().slice(0, 10),
      })
      .eq("id", editingPackageId);

    if (error) {
      alert(error.message);
      return;
    }

    setShowAddPackage(false);
    setEditingPackageId("");
    setPackageStudentId("");
    setPackageHours("");
    setPackageName("");
    setPackagePurchasedAt("");
    fetchPackages();
  };

  const deletePackage = async (pkg: any, studentId: string) => {
    const balanceAfterDelete = getPackageBalanceAfterChange(studentId, pkg.id);

    if (balanceAfterDelete.remainingHours < 0) {
      alert(
        `This package cannot be deleted because the student already has ${balanceAfterDelete.allocatedLessonHours.toFixed(
          1
        )}h scheduled. Add another package or adjust lessons before deleting this package.`
      );
      return;
    }

    const confirmed = window.confirm("Delete this package?");

    if (!confirmed) return;

    const { error } = await supabase
      .from("student_packages")
      .delete()
      .eq("id", pkg.id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchPackages();
  };

  const fetchPackages = async () => {
    const { data, error } = await supabase
      .from("student_packages")
      .select("*");

    if (error) {
      console.error("Package fetch error:", error);
      return;
    }

    setPackages(data || []);
  };

  const fetchLinks = async () => {
    const { data, error } = await supabase
      .from("tutor_student_links")
      .select("tutor_id, student_id");

    if (error) {
      console.error("Links fetch error:", error);
      return;
    }

    setLinks(data || []);
  };
  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, role");

    if (error) {
      console.error(error);
      return;
    }

    setProfiles(data || []);
  };



  const fetchLessons = async () => {
    const { data, error } = await supabase
      .from("tutor_lessons")
      .select("*")
      .order("lesson_date", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setLessons(data || []);
  };

  const tutors = profiles.filter((p) => p.role === "tutor");
  const allStudents = profiles.filter((p) => p.role === "student");

  const students =
    selectedTutor === "all"
      ? allStudents
      : allStudents.filter((student) =>
        links.some(
          (link) =>
            link.tutor_id === selectedTutor &&
            link.student_id === student.id
        )
      );

  const getProfileName = (id: string) => {
    const profile = profiles.find((p) => p.id === id);
    return profile?.name || id;
  };

  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      const tutorMatch =
        selectedTutor === "all" ||
        lesson.tutor_id === selectedTutor;

      const studentMatch =
        selectedStudent === "all" ||
        lesson.student_id === selectedStudent;

      const statusMatch =
        selectedStatus === "all" ||
        lesson.status === selectedStatus;

      const lessonDate = getLessonDateKey(lesson);
      const fromMatch = !dateFrom || lessonDate >= dateFrom;
      const toMatch = !dateTo || lessonDate <= dateTo;

      return tutorMatch && studentMatch && statusMatch && fromMatch && toMatch;
    });
  }, [lessons, selectedTutor, selectedStudent, selectedStatus, dateFrom, dateTo]);

  const sortedLessons = [...filteredLessons].sort((a, b) => {
    const isDoneA =
      a.status === "completed" ||
      a.status === "student_absent";

    const isDoneB =
      b.status === "completed" ||
      b.status === "student_absent";

    if (isDoneA !== isDoneB) {
      return isDoneA ? 1 : -1;
    }

    const dateA =
      a.rescheduled_date || a.lesson_date;

    const dateB =
      b.rescheduled_date || b.lesson_date;

    return (
      new Date(dateA).getTime() -
      new Date(dateB).getTime()
    );
  });

  const totalHours = filteredLessons.reduce(
    (sum, lesson) => sum + Number(lesson.hours || 0),
    0
  );
  const completed = filteredLessons.filter(
    (lesson) =>
      lesson.status === "completed" ||
      lesson.status === "student_absent"
  ).length;

  const pending = filteredLessons.filter(
    (lesson) =>
      lesson.status === "pending" ||
      lesson.status === "reschedule_requested"
  ).length;

  const rescheduled = filteredLessons.filter(
    (lesson) =>
      lesson.status === "reschedule_requested"
  ).length;

  const lessonsByDate = useMemo(() => {
    return filteredLessons.reduce<Record<string, Lesson[]>>((acc, lesson) => {
      const dateKey = getLessonDateKey(lesson);
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(lesson);
      return acc;
    }, {});
  }, [filteredLessons]);

  const selectedDayLessons = useMemo(() => {
    return [...(lessonsByDate[selectedDate] || [])].sort(
      (a, b) =>
        new Date(getLessonDisplayDate(a)).getTime() -
        new Date(getLessonDisplayDate(b)).getTime()
    );
  }, [lessonsByDate, selectedDate]);

  const studentSummaries = useMemo(() => {
    const today = toDateKey(new Date());

    return allStudents
      .map((student) => {
        const studentPackages = packages.filter(
          (pkg) => pkg.student_id === student.id
        );
        const balance = calculateLessonPackageBalance(
          packages,
          lessons,
          student.id
        );
        const nextLesson = lessons
          .filter(
            (lesson) =>
              lesson.student_id === student.id &&
              getLessonDateKey(lesson) >= today &&
              (lesson.status === "pending" ||
                lesson.status === "reschedule_requested")
          )
          .sort((a, b) =>
            getLessonDateKey(a).localeCompare(getLessonDateKey(b))
          )[0];

        return {
          student,
          studentPackages,
          balance,
          nextLesson,
          tutorName: nextLesson ? getProfileName(nextLesson.tutor_id) : "-",
          isLow: balance.remainingHours > 0 && balance.remainingHours <= 2,
          isOut: balance.remainingHours <= 0,
          packageShortfallHours: Math.max(0, -balance.remainingHours),
          hasPackage: studentPackages.length > 0,
        };
      })
      .filter((summary) => {
        if (selectedStudent !== "all" && summary.student.id !== selectedStudent) {
          return false;
        }

        if (selectedTutor !== "all") {
          const linkedToTutor = links.some(
            (link) =>
              link.tutor_id === selectedTutor &&
              link.student_id === summary.student.id
          );
          const hasFilteredLesson = filteredLessons.some(
            (lesson) => lesson.student_id === summary.student.id
          );

          return linkedToTutor || hasFilteredLesson;
        }

        return summary.hasPackage || filteredLessons.some(
          (lesson) => lesson.student_id === summary.student.id
        );
      })
      .sort((a, b) => {
        if (a.isOut !== b.isOut) return a.isOut ? -1 : 1;
        if (a.isLow !== b.isLow) return a.isLow ? -1 : 1;
        return String(a.student.name || "").localeCompare(
          String(b.student.name || "")
        );
      });
  }, [allStudents, packages, lessons, selectedStudent, selectedTutor, links, filteredLessons]);

  const balanceByStudentId = useMemo(() => {
    return new Map(
      studentSummaries.map((summary) => [summary.student.id, summary.balance])
    );
  }, [studentSummaries]);

  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const start = new Date(firstDay);
    start.setDate(firstDay.getDate() - firstDay.getDay());

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const dateKey = toDateKey(date);

      return {
        date,
        dateKey,
        isCurrentMonth: date.getMonth() === month,
        isToday: dateKey === toDateKey(new Date()),
        isSelected: dateKey === selectedDate,
        lessons: lessonsByDate[dateKey] || [],
      };
    });
  }, [calendarMonth, lessonsByDate, selectedDate]);

  const monthLabel = calendarMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const goToMonth = (direction: number) => {
    setCalendarMonth(
      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + direction, 1)
    );
  };


  return (


    <div className="min-h-screen bg-[#f7f9fc] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-[2rem] border border-[#dbe5f0] bg-white p-5 shadow-sm sm:rounded-[32px] sm:p-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[3px] text-[#f7c600]">
            Admin Lessons
          </p>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-serif text-3xl leading-tight text-[#0b234a] sm:text-5xl">
                Calendar Workspace
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                Manage lessons by month, inspect a selected day, and keep package
                balances visible without jumping between separate blocks.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const today = new Date();
                setSelectedDate(toDateKey(today));
                setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
              }}
              className="min-h-11 rounded-2xl border border-[#dbe5f0] bg-[#f8fbff] px-5 py-3 text-sm font-semibold text-[#0b234a] transition hover:border-[#0b234a]/30"
            >
              Today
            </button>
          </div>
        </div>

        {/* FILTERS */}
        <div className="mb-6 rounded-[2rem] border border-[#dbe5f0] bg-white p-4 shadow-sm sm:rounded-[28px] sm:p-5">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Tutor
              <select
                value={selectedTutor}
                onChange={(e) => {
                  setSelectedTutor(e.target.value);
                  setSelectedStudent("all");
                }}
                className="min-h-11 w-full rounded-2xl border border-[#dbe5f0] bg-white px-4 py-3 text-base font-semibold normal-case tracking-normal text-[#0b234a] outline-none transition focus:border-[#0b234a] focus:ring-4 focus:ring-[#0b234a]/10"
              >
                <option value="all">All Tutors</option>

                {tutors.map((tutor) => (
                  <option key={tutor.id} value={tutor.id}>
                    {tutor.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Student
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="min-h-11 w-full rounded-2xl border border-[#dbe5f0] bg-white px-4 py-3 text-base font-semibold normal-case tracking-normal text-[#0b234a] outline-none transition focus:border-[#0b234a] focus:ring-4 focus:ring-[#0b234a]/10"
              >
                <option value="all">All Students</option>

                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Status
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="min-h-11 w-full rounded-2xl border border-[#dbe5f0] bg-white px-4 py-3 text-base font-semibold normal-case tracking-normal text-[#0b234a] outline-none transition focus:border-[#0b234a] focus:ring-4 focus:ring-[#0b234a]/10"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="student_absent">Student Absent</option>
                <option value="reschedule_requested">Rescheduled</option>
              </select>
            </label>

            <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              From
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="min-h-11 w-full rounded-2xl border border-[#dbe5f0] bg-white px-4 py-3 text-base font-semibold normal-case tracking-normal text-[#0b234a] outline-none transition focus:border-[#0b234a] focus:ring-4 focus:ring-[#0b234a]/10"
              />
            </label>

            <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              To
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="min-h-11 w-full rounded-2xl border border-[#dbe5f0] bg-white px-4 py-3 text-base font-semibold normal-case tracking-normal text-[#0b234a] outline-none transition focus:border-[#0b234a] focus:ring-4 focus:ring-[#0b234a]/10"
              />
            </label>
          </div>
        </div>

        {/* STATS */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

          <StatCard
            icon={<Calendar size={22} />}
            title="Lessons"
            value={filteredLessons.length}
          />

          <StatCard
            icon={<Clock size={22} />}
            title="Hours"
            value={totalHours}
          />

          <StatCard
            icon={<CheckCircle2 size={22} />}
            title="Completed"
            value={completed}
          />

          <StatCard
            icon={<Clock size={22} />}
            title="Pending"
            value={pending}
          />

          <StatCard
            icon={<RotateCcw size={22} />}
            title="Rescheduled"
            value={rescheduled}
          />

        </div>

        {/* CALENDAR WORKSPACE */}
        <div className="mb-8">
          <section className="rounded-[2rem] border border-[#dbe5f0] bg-white p-4 shadow-sm sm:rounded-[28px] sm:p-6">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[3px] text-[#f7c600]">
                  Calendar
                </p>
                <h2 className="mt-1 font-serif text-2xl text-[#0b234a] sm:text-4xl">
                  {monthLabel}
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:flex">
                <button
                  type="button"
                  onClick={() => goToMonth(-1)}
                  className="flex min-h-11 items-center justify-center rounded-2xl border border-[#dbe5f0] bg-[#f8fbff] px-4 text-[#0b234a]"
                  aria-label="Previous month"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => goToMonth(1)}
                  className="flex min-h-11 items-center justify-center rounded-2xl border border-[#dbe5f0] bg-[#f8fbff] px-4 text-[#0b234a]"
                  aria-label="Next month"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:gap-2 sm:text-xs">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {calendarDays.map((day) => (
                <button
                  key={day.dateKey}
                  type="button"
                  onClick={() => setSelectedDate(day.dateKey)}
                  className={`relative min-h-[4.25rem] rounded-2xl border p-2 text-left transition sm:min-h-[6.25rem] sm:p-3 ${day.isSelected
                    ? "border-[#0b234a] bg-[#0b234a] text-white shadow-[0_14px_34px_rgba(11,35,74,0.18)]"
                    : day.isToday
                      ? "border-[#f7c600]/70 bg-[#fff9df]"
                      : day.lessons.length
                        ? "border-[#dbe5f0] bg-[#f8fbff]"
                        : "border-[#eef4fb] bg-white"
                    } ${day.isCurrentMonth ? "" : "opacity-45"}`}
                >
                  <span className="text-sm font-bold sm:text-base">
                    {day.date.getDate()}
                  </span>

                  {day.lessons.length > 0 && (
                    <span
                      className={`absolute bottom-2 left-2 right-2 rounded-full px-2 py-1 text-center text-[10px] font-bold sm:text-xs ${day.isSelected
                        ? "bg-white/18 text-white"
                        : "bg-[#8d73ff]/10 text-[#0b234a]"
                        }`}
                    >
                      <span className="sm:hidden">{day.lessons.length}</span>
                      <span className="hidden sm:inline">
                        {day.lessons.length} lesson{day.lessons.length > 1 ? "s" : ""}
                      </span>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* SELECTED DAY WORKSPACE */}
        <section className="mb-8 rounded-[2rem] border border-[#dbe5f0] bg-white p-5 shadow-sm sm:rounded-[28px] sm:p-6">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
            <p className="text-sm font-semibold uppercase tracking-[3px] text-[#f7c600]">
                Day Workspace
            </p>
              <h2 className="mt-1 font-serif text-2xl text-[#0b234a] sm:text-4xl">
              {formatDate(selectedDate)}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
                {selectedDayLessons.length} filtered lesson
                {selectedDayLessons.length === 1 ? "" : "s"} on this date.
            </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center sm:min-w-[360px]">
              <MetricPill
                label="Lessons"
                value={String(selectedDayLessons.length)}
              />
              <MetricPill
                label="Hours"
                value={`${selectedDayLessons
                  .reduce((sum, lesson) => sum + Number(lesson.hours || 0), 0)
                  .toFixed(1)}h`}
              />
              <MetricPill
                label="Students"
                value={String(
                  new Set(selectedDayLessons.map((lesson) => lesson.student_id)).size
                )}
              />
            </div>
          </div>

          {selectedDayLessons.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#dbe5f0] bg-[#f8fbff] p-6 text-sm text-slate-500">
              No lessons match the current filters for this date.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[#eef4fb]">
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[980px] text-left text-sm">
                  <thead className="bg-[#f8fbff] text-xs uppercase tracking-[0.12em] text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Tutor</th>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Hours</th>
                      <th className="min-w-[150px] px-4 py-3">Status</th>
                      <th className="min-w-[190px] px-4 py-3">Package availability</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef4fb]">
                    {selectedDayLessons.map((lesson) => {
                      const balance = balanceByStudentId.get(lesson.student_id);

                      return (
                        <tr key={lesson.id} className="align-top">
                          <td className="px-4 py-3 font-semibold text-[#0b234a]">
                            {formatLessonTime(lesson)}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {getProfileName(lesson.student_id)}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {getProfileName(lesson.tutor_id)}
                          </td>
                          <td className="max-w-[260px] px-4 py-3 text-slate-600">
                            {lesson.lesson_contents || "-"}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {Number(lesson.hours || 0).toFixed(1)}h
                          </td>
                          <td className="min-w-[150px] px-4 py-3">
                            <StatusBadge status={lesson.status} />
                          </td>
                          <td className="min-w-[190px] px-4 py-3 text-slate-600">
                            {balance
                              ? getPackageAvailabilityText(balance.remainingHours)
                              : "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-3 p-3 lg:hidden">
                {selectedDayLessons.map((lesson) => (
                  <CompactLessonCard
                    key={lesson.id}
                    lesson={lesson}
                    getProfileName={getProfileName}
                    packageAvailability={
                      balanceByStudentId.get(lesson.student_id)?.remainingHours
                    }
                    onSelectDay={() => setSelectedDate(getLessonDateKey(lesson))}
                    hideSelectAction
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* STUDENT PACKAGE SUMMARY */}
        <div className="mb-8 rounded-[2rem] border border-[#dbe5f0] bg-white p-5 shadow-sm sm:rounded-[28px] sm:p-6">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[3px] text-[#f7c600]">
                Student Overview
              </p>

              <h2 className="font-serif text-2xl text-[#0b234a] sm:text-4xl">
                Package Availability
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Scan purchased, scheduled, and available hours before assigning more lessons.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => startAddPackage()}
                className="min-h-11 rounded-2xl bg-[#0b234a] px-5 py-3 font-semibold text-white"
              >
                Add Package
              </button>

              <button
                type="button"
                onClick={() => setShowPackageDetails(!showPackageDetails)}
                className="min-h-11 rounded-2xl border border-[#dbe5f0] bg-[#f8fbff] px-5 py-3 font-semibold text-[#0b234a]"
              >
                {showPackageDetails ? "Hide Package Details" : "Show Package Details"}
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#eef4fb]">
            <div className="hidden grid-cols-[1.15fr_0.75fr_0.8fr_0.8fr_1.15fr_0.8fr_1.2fr] gap-3 bg-[#f8fbff] px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-400 lg:grid">
              <span>Student</span>
              <span>Purchased</span>
              <span>Scheduled</span>
              <span>Available</span>
              <span>Next Lesson</span>
              <span>Tutor</span>
              <span>Warning</span>
            </div>

            <div className="divide-y divide-[#eef4fb]">
              {studentSummaries.length === 0 ? (
                <div className="p-5 text-sm text-slate-500">
                  No student package data matches the current filters.
                </div>
              ) : (
                studentSummaries.map((summary) => (
                  <div key={summary.student.id} className="bg-white p-4">
                    <div className="grid gap-3 lg:grid-cols-[1.15fr_0.75fr_0.8fr_0.8fr_1.15fr_0.8fr_1.2fr] lg:items-center">
                      <div>
                        <p className="font-semibold text-[#0b234a]">
                          {summary.student.name || summary.student.id}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {summary.studentPackages.length} package(s)
                        </p>
                      </div>

                      <SummaryMetric
                        label="Purchased"
                        value={`${summary.balance.totalPackageHours.toFixed(1)}h`}
                      />
                      <SummaryMetric
                        label="Scheduled"
                        value={`${summary.balance.allocatedLessonHours.toFixed(1)}h`}
                      />
                      <SummaryMetric
                        label="Available"
                        value={`${getDisplayAvailableHours(summary.balance.remainingHours).toFixed(1)}h`}
                      />

                      <div className="text-sm text-slate-600">
                        <span className="font-semibold text-[#0b234a] lg:hidden">
                          Next:{" "}
                        </span>
                        {summary.nextLesson
                          ? `${formatDate(getLessonDateKey(summary.nextLesson))} · ${formatLessonTime(summary.nextLesson)}`
                          : "No upcoming lesson"}
                      </div>

                      <div className="text-sm text-slate-600">
                        <span className="font-semibold text-[#0b234a] lg:hidden">
                          Tutor:{" "}
                        </span>
                        {summary.tutorName}
                      </div>

                      <div>
                        {summary.isOut ? (
                          <PackageWarningAction
                            label={
                              summary.packageShortfallHours > 0
                                ? `Needs +${summary.packageShortfallHours.toFixed(1)}h package`
                                : "0h available"
                            }
                            tone="red"
                            actionLabel={
                              summary.packageShortfallHours > 0 ? "Add hours" : undefined
                            }
                            onAction={() =>
                              startAddPackage(
                                summary.student.id,
                                summary.packageShortfallHours.toFixed(1)
                              )
                            }
                          />
                        ) : summary.isLow ? (
                          <WarningPill tone="orange" label="Low hours" />
                        ) : !summary.hasPackage ? (
                          <PackageWarningAction
                            label="No package"
                            tone="red"
                            actionLabel="Add package"
                            onAction={() => startAddPackage(summary.student.id)}
                          />
                        ) : (
                          <WarningPill tone="slate" label="OK" />
                        )}
                      </div>
                    </div>

                    {showPackageDetails && summary.studentPackages.length > 0 && (
                      <div className="mt-4 grid gap-2">
                        {summary.studentPackages.map((pkg) => (
                          <PackageDetailRow
                            key={pkg.id}
                            pkg={pkg}
                            onEdit={() => {
                              setEditingPackageId(pkg.id);
                              setPackageStudentId(summary.student.id);
                              setPackageHours(String(pkg.package_hours || ""));
                              setPackageName(pkg.package_name || "");
                              setPackagePurchasedAt(pkg.purchased_at || "");
                              setShowAddPackage(true);
                            }}
                            onDelete={async () => {
                              await deletePackage(pkg, summary.student.id);
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* SECONDARY TABLE */}
        <div className="rounded-[2rem] border border-[#dbe5f0] bg-white p-5 shadow-sm sm:rounded-[28px] sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[3px] text-[#f7c600]">
                Secondary Table
              </p>
              <h2 className="mt-1 font-serif text-2xl text-[#0b234a] sm:text-4xl">
                Filtered Lessons
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Compact table for audit and export-style scanning.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowLessonTable(!showLessonTable)}
              className="min-h-11 rounded-2xl border border-[#dbe5f0] bg-[#f8fbff] px-5 py-3 font-semibold text-[#0b234a]"
            >
              {showLessonTable ? "Hide Table" : `Show Table (${sortedLessons.length})`}
            </button>
          </div>

          {showLessonTable && (
            <div className="mt-5 overflow-hidden rounded-2xl border border-[#eef4fb]">
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1160px] text-left text-sm">
                  <thead className="bg-[#f8fbff] text-xs uppercase tracking-[0.12em] text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Tutor</th>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Hours</th>
                      <th className="min-w-[150px] px-4 py-3">Status</th>
                      <th className="min-w-[190px] px-4 py-3">Package availability</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef4fb]">
                    {sortedLessons.map((lesson) => {
                      const balance = balanceByStudentId.get(lesson.student_id);

                      return (
                        <tr key={lesson.id} className="align-top">
                          <td className="px-4 py-3 font-semibold text-[#0b234a]">
                            {formatDate(getLessonDateKey(lesson))}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {formatLessonTime(lesson)}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {getProfileName(lesson.student_id)}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {getProfileName(lesson.tutor_id)}
                          </td>
                          <td className="max-w-[220px] px-4 py-3 text-slate-600">
                            {lesson.lesson_contents || "-"}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {Number(lesson.hours || 0).toFixed(1)}h
                          </td>
                          <td className="min-w-[150px] px-4 py-3">
                            <StatusBadge status={lesson.status} />
                          </td>
                          <td className="min-w-[190px] px-4 py-3 text-slate-600">
                            {balance
                              ? getPackageAvailabilityText(balance.remainingHours)
                              : "-"}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => setSelectedDate(getLessonDateKey(lesson))}
                              className="min-h-10 rounded-xl border border-[#dbe5f0] px-3 text-sm font-semibold text-[#0b234a]"
                            >
                              Select day
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-3 p-3 lg:hidden">
                {sortedLessons.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#dbe5f0] bg-[#f8fbff] p-5 text-sm text-slate-500">
                    No lessons match the current filters.
                  </div>
                ) : (
                  sortedLessons.map((lesson) => (
                    <CompactLessonCard
                      key={lesson.id}
                      lesson={lesson}
                      getProfileName={getProfileName}
                      packageAvailability={
                        balanceByStudentId.get(lesson.student_id)?.remainingHours
                      }
                      onSelectDay={() => setSelectedDate(getLessonDateKey(lesson))}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>


      </div>

      {showAddPackage && (
        <Modal
          onClose={() => {
            setShowAddPackage(false);
            setEditingPackageId("");
            setPackageStudentId("");
            setPackageHours("");
            setPackageName("");
            setPackagePurchasedAt("");
          }}
        >
          <h2 className="mb-2 font-serif text-2xl text-[#0b234a] sm:text-4xl">
            {editingPackageId ? "Edit Student Package" : "Add Student Package"}
          </h2>

          <p className="text-slate-500 mb-6">
            {editingPackageId
              ? "Update purchased package hours without reducing below scheduled lessons."
              : "Input the lesson package purchased by a student."}
          </p>

          <select
            value={packageStudentId}
            onChange={(e) => setPackageStudentId(e.target.value)}
            disabled={Boolean(editingPackageId)}
            className="mb-4 w-full rounded-2xl border border-[#dbe5f0] bg-white px-4 py-3 text-base outline-none transition focus:border-[#0b234a] focus:ring-4 focus:ring-[#0b234a]/10 disabled:bg-slate-50 disabled:text-slate-400"
          >
            <option value="">Select student</option>
            {allStudents.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name || student.id}
              </option>
            ))}
          </select>

          <input
            type="number"
            step="0.5"
            min="0"
            inputMode="decimal"
            value={packageHours}
            onChange={(e) => setPackageHours(e.target.value)}
            placeholder="Package hours, e.g. 10"
            className="mb-4 w-full rounded-2xl border border-[#dbe5f0] bg-white px-4 py-3 text-base outline-none transition focus:border-[#0b234a] focus:ring-4 focus:ring-[#0b234a]/10"
          />
          <input
            type="date"
            value={packagePurchasedAt}
            onChange={(e) => setPackagePurchasedAt(e.target.value)}
            className="mb-4 w-full rounded-2xl border border-[#dbe5f0] bg-white px-4 py-3 text-base outline-none transition focus:border-[#0b234a] focus:ring-4 focus:ring-[#0b234a]/10"
          />

          <input
            value={packageName}
            onChange={(e) => setPackageName(e.target.value)}
            placeholder="Package name optional"
            className="w-full rounded-2xl border border-[#dbe5f0] bg-white px-4 py-3 text-base outline-none transition focus:border-[#0b234a] focus:ring-4 focus:ring-[#0b234a]/10"
          />

          <button
            type="button"
            onClick={editingPackageId ? updatePackage : addPackage}
            className="mt-6 w-full rounded-2xl bg-[#0b234a] py-4 font-semibold text-white"
          >
            {editingPackageId ? "Update Package" : "Save package"}
          </button>
        </Modal>
      )}
    </div>


  );
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getLessonDisplayDate(lesson: Lesson) {
  return lesson.status === "reschedule_requested" && lesson.rescheduled_date
    ? lesson.rescheduled_date
    : lesson.lesson_date;
}

function getLessonDateKey(lesson: Lesson) {
  return getLessonDisplayDate(lesson).slice(0, 10);
}

function formatDate(dateKey: string) {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatLessonTime(lesson: Lesson) {
  if (!lesson.lesson_time) return "No time";
  return lesson.lesson_time.slice(0, 5);
}

function getDisplayAvailableHours(remainingHours: number) {
  return Math.max(0, remainingHours);
}

function getPackageAvailabilityText(remainingHours: number) {
  if (remainingHours < 0) {
    return `0.0h available · needs +${Math.abs(remainingHours).toFixed(1)}h package`;
  }

  return `${remainingHours.toFixed(1)}h available`;
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#f8fbff] px-2 py-2">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-[#0b234a]">
        {value}
      </p>
    </div>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#f8fbff] px-3 py-2 lg:bg-transparent lg:px-0 lg:py-0">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 lg:hidden">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-[#0b234a] lg:mt-0">
        {value}
      </p>
    </div>
  );
}

function WarningPill({
  tone,
  label,
}: {
  tone: "red" | "orange" | "slate";
  label: string;
}) {
  const styles = {
    red: "bg-red-50 text-red-700 border-red-100",
    orange: "bg-orange-50 text-orange-700 border-orange-100",
    slate: "bg-slate-50 text-slate-500 border-slate-100",
  };

  return (
    <span
      className={`inline-flex max-w-full rounded-full border px-3 py-1.5 text-xs font-semibold leading-snug ${styles[tone]}`}
    >
      {label}
    </span>
  );
}

function PackageWarningAction({
  tone,
  label,
  actionLabel,
  onAction,
}: {
  tone: "red" | "orange" | "slate";
  label: string;
  actionLabel?: string;
  onAction: () => void;
}) {
  return (
    <div className="flex flex-col items-start gap-2">
      <WarningPill tone={tone} label={label} />
      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="min-h-9 rounded-xl border border-[#dbe5f0] bg-white px-3 text-xs font-semibold text-[#0b234a] transition hover:border-[#0b234a]/30"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function PackageDetailRow({
  pkg,
  onEdit,
  onDelete,
}: {
  pkg: any;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-[#f8fbff] p-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
      <span>
        <span className="font-semibold text-[#0b234a]">
          {pkg.package_name || "Package"}
        </span>{" "}
        · {Number(pkg.package_hours).toFixed(2)}h · {pkg.purchased_at || "No date"}
      </span>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="min-h-10 rounded-xl border border-[#dbe5f0] px-3 text-sm font-semibold text-[#0b234a]"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="min-h-10 rounded-xl border border-red-100 px-3 text-sm font-semibold text-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function CompactLessonCard({
  lesson,
  getProfileName,
  packageAvailability,
  onSelectDay,
  hideSelectAction = false,
}: {
  lesson: Lesson;
  getProfileName: (id: string) => string;
  packageAvailability?: number;
  onSelectDay: () => void;
  hideSelectAction?: boolean;
}) {
  return (
    <article className="rounded-2xl border border-[#dbe5f0] bg-white p-4">
      <div className="flex flex-col gap-3 min-[390px]:flex-row min-[390px]:items-start min-[390px]:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#0b234a]">
            {formatDate(getLessonDateKey(lesson))} · {formatLessonTime(lesson)}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {getProfileName(lesson.student_id)} · {getProfileName(lesson.tutor_id)}
          </p>
        </div>
        <div className="shrink-0">
          <StatusBadge status={lesson.status} />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-600">
        <MetricPill label="Hours" value={`${Number(lesson.hours || 0).toFixed(1)}h`} />
        <MetricPill
          label="Available"
          value={
            typeof packageAvailability === "number"
              ? `${getDisplayAvailableHours(packageAvailability).toFixed(1)}h`
              : "-"
          }
        />
      </div>

      {typeof packageAvailability === "number" && packageAvailability < 0 && (
        <p className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          Needs +{Math.abs(packageAvailability).toFixed(1)}h package
        </p>
      )}

      {lesson.lesson_contents && (
        <p className="mt-3 rounded-xl bg-[#f8fbff] px-3 py-2 text-sm text-slate-600">
          {lesson.lesson_contents}
        </p>
      )}

      {!hideSelectAction && (
        <button
          type="button"
          onClick={onSelectDay}
          className="mt-3 min-h-10 w-full rounded-xl border border-[#dbe5f0] text-sm font-semibold text-[#0b234a]"
        >
          Select day
        </button>
      )}
    </article>
  );
}

function Modal({ children, onClose }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4">
      <div className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-y-auto rounded-[1.6rem] bg-white p-5 shadow-xl sm:rounded-[32px] sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500 hover:text-slate-700 sm:right-5 sm:top-5"
        >
          ×
        </button>

        {children}
      </div>
    </div>
  );
}

function StatCard({ icon, title, value }: any) {
  return (
    <div className="rounded-[2rem] border border-[#dbe5f0] bg-white p-5 sm:rounded-[28px] sm:p-7">
      <div className="w-14 h-14 rounded-2xl bg-[#fff7d6] flex items-center justify-center text-[#0b234a] mb-5">
        {icon}
      </div>

      <p className="text-slate-500 mb-1">
        {title}
      </p>

      <h3 className="text-3xl font-serif text-[#0b234a] sm:text-5xl">
        {value}
      </h3>

    </div>
  );
}

function StatusBadge({ status }: any) {
  const styles: any = {
    pending: "bg-slate-100 text-slate-600",
    completed: "bg-green-100 text-green-700",
    student_absent:
      "bg-orange-100 text-orange-700",
    reschedule_requested:
      "bg-blue-100 text-blue-700",
  };

  const labels: any = {
    pending: "Pending",
    completed: "Completed",
    student_absent: "Student Absent",
    reschedule_requested:
      "Rescheduled",
  };

  return (
    <span
      className={`inline-flex w-fit max-w-full items-center whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold sm:px-4 sm:py-2 sm:text-sm ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
