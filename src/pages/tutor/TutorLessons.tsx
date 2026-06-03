// ==========================================
// src/pages/TutorLessons.tsx
// ==========================================

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  X,
  Sparkles,
  NotebookText,
  RotateCcw,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

type LessonStatus =
  | "pending"
  | "completed"
  | "student_absent"
  | "reschedule_requested";

type Lesson = {
  id: string;
  tutor_id?: string;
  student_id: string;
  lesson_date: string;
  lesson_time?: string | null;
  hours: number;
  rescheduled_date?: string | null;
  reschedule_reason?: string | null;
  lesson_contents?: string | null;
  additional_remarks?: string | null;
  status: LessonStatus;
  checked_off_at?: string | null;
};

export default function TutorLessons() {
  const [students, setStudents] = useState<any[]>([]);
  const [filterStudentId, setFilterStudentId] = useState("all");
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduledDate, setRescheduledDate] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");

  const [lessonDate, setLessonDate] = useState("");
  const [hours, setHours] = useState("");
  const [lessonContents, setLessonContents] = useState("");
  const [additionalRemarks, setAdditionalRemarks] = useState("");
  const [checkoffNote, setCheckoffNote] = useState("");

  const [lessonTime, setLessonTime] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    fetchAssignedStudents();
    fetchLessons();
  }, []);

  const fetchAssignedStudents = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error("User error:", userError);
      return;
    }

    const tutor = userData.user;
    if (!tutor) return;

    const { data: links, error: linkError } = await supabase
      .from("tutor_student_links")
      .select("student_id")
      .eq("tutor_id", tutor.id);

    if (linkError) {
      console.error("Link error:", linkError);
      alert(linkError.message);
      return;
    }

    const studentIds = links?.map((link) => link.student_id) || [];

    if (studentIds.length === 0) {
      setStudents([]);
      setSelectedStudentId("");
      return;
    }

    const { data: studentData, error: studentError } = await supabase
      .from("profiles")
      .select("id, name, is_active")
      .in("id", studentIds)
      .eq("role", "student");

    if (studentError) {
      console.error("Student fetch error:", studentError);
      alert(studentError.message);
      return;
    }

    setStudents(studentData || []);

    if (studentData && studentData.length > 0) {
      setSelectedStudentId(studentData[0].id);
    }
  };

  const fetchLessons = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const tutor = userData.user;
    if (!tutor) return;

    const { data, error } = await supabase
      .from("tutor_lessons")
      .select("*")
      .eq("tutor_id", tutor.id)
      .order("lesson_date", { ascending: true });

    if (error) {
      console.error("Lesson fetch error:", error);
      alert(error.message);
      return;
    }

    setLessons(data || []);
  };

  const addLesson = async () => {
    if (!selectedStudentId) {
      alert("Please select a student.");
      return;
    }

    if (!lessonDate) {
      alert("Please select a lesson date.");
      return;
    }

    if (!hours || Number(hours) <= 0) {
      alert("Please enter number of hours.");
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const tutor = userData.user;
    if (!tutor) return;

    const { error } = await supabase.from("tutor_lessons").insert({
      tutor_id: tutor.id,
      student_id: selectedStudentId,
      lesson_date: lessonDate,
      lesson_time: lessonTime || null,
      hours: Number(hours),
      lesson_contents: lessonContents.trim() || null,
      additional_remarks: additionalRemarks.trim() || null,
      status: "pending",
    });

    if (error) {
      console.error("Add lesson error:", error);
      alert(error.message);
      return;
    }

    setShowAdd(false);
    setLessonDate("");
    setLessonTime("");
    setHours("");
    setLessonContents("");
    setAdditionalRemarks("");
    fetchLessons();
  };

  const checkOffLesson = async (lessonId: string, newStatus: LessonStatus) => {
    const { error } = await supabase
      .from("tutor_lessons")
      .update({
        status: newStatus,
        checkoff_note: checkoffNote.trim() || null,
        checked_off_at: new Date().toISOString(),
      })
      .eq("id", lessonId);

    if (error) {
      console.error("Check-off error:", error);
      alert(error.message);
      return;
    }

    setLessons((prev) =>
      prev.map((lesson) =>
        lesson.id === lessonId
          ? {
            ...lesson,
            status: newStatus,
            checked_off_at: new Date().toISOString(),
          }
          : lesson
      )
    );

    setSelectedLesson(null);
    setCheckoffNote("");
  };

  const submitReschedule = async () => {
    if (!selectedLesson || !rescheduledDate) {
      alert("Please select a new date.");
      return;
    }

    const { error } = await supabase
      .from("tutor_lessons")
      .update({
        status: "reschedule_requested",
        rescheduled_date: rescheduledDate,
        reschedule_reason: rescheduleReason.trim() || null,
        checked_off_at: new Date().toISOString(),
      })
      .eq("id", selectedLesson.id);

    if (error) {
      alert(error.message);
      return;
    }

    setLessons((prev) =>
      prev.map((lesson) =>
        lesson.id === selectedLesson.id
          ? {
            ...lesson,
            status: "reschedule_requested",
            rescheduled_date: rescheduledDate,
            reschedule_reason: rescheduleReason,
          }
          : lesson
      )
    );

    setSelectedLesson(null);
    setShowReschedule(false);
    setRescheduledDate("");
    setRescheduleReason("");
  };

  const getStudentName = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    return student?.name || studentId;
  };

  const formatLessonTime = (time?: string | null) => {
    if (!time) return "No time";
    return time.slice(0, 5);
  };

  const filteredLessons =
    filterStudentId === "all"
      ? lessons
      : lessons.filter((lesson) => lesson.student_id === filterStudentId);

  const pendingLessonsOnSelectedDate = filteredLessons.filter((lesson) => {
    const displayDate =
      lesson.status === "reschedule_requested" && lesson.rescheduled_date
        ? lesson.rescheduled_date
        : lesson.lesson_date;

    return displayDate === lessonDate && lesson.status === "pending";
  });

  const totalHours = filteredLessons.reduce(
    (sum, lesson) => sum + Number(lesson.hours || 0),
    0
  );

  const completed = filteredLessons.filter(
    (lesson) => lesson.status === "completed" || lesson.status === "student_absent"
  ).length;

  const pending = filteredLessons.filter(
    (lesson) =>
      lesson.status === "pending" || lesson.status === "reschedule_requested"
  ).length;

  const monthStart = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  );

  const monthEnd = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  );

  const calendarDays = Array.from({ length: monthEnd.getDate() }, (_, i) => {
    const day = i + 1;

    const yyyy = currentMonth.getFullYear();
    const mm = String(currentMonth.getMonth() + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
  });

  const selectedDateLessons = selectedDate
    ? filteredLessons.filter((lesson) => {
      const displayDate =
        lesson.status === "reschedule_requested" && lesson.rescheduled_date
          ? lesson.rescheduled_date
          : lesson.lesson_date;

      return displayDate === selectedDate;
    })
    : [];

  return (
    <div className="min-h-screen overflow-hidden bg-[#fbfaff] px-4 py-8 sm:px-6 sm:py-14">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_15%,#f0eaff_0%,transparent_28%),radial-gradient(circle_at_85%_75%,#fff1bd_0%,transparent_30%)]" />

      <div className="relative z-10 mx-auto max-w-[1350px] space-y-8">
        {/* HERO */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[3rem] bg-white/95 p-7 shadow-[0_28px_90px_rgba(66,56,120,0.13)] backdrop-blur-xl sm:p-10"
        >
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#f0eaff]" />
          <div className="absolute bottom-[-80px] left-[-80px] h-56 w-56 rounded-full bg-[#fff1bd]/70" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-end">
            <div>
              <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]">
                <Sparkles className="h-5 w-5" />
                Tutor Lessons
              </p>

              <h1 className="mt-5 font-poppins text-[3.2rem] font-black leading-[0.95] tracking-[-0.045em] text-primary sm:text-[4.8rem] lg:text-[5.6rem]">
                Schedule.
                <br />
                Check off.
                <br />
                Stay aligned.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-primary/60 sm:text-lg">
                Add confirmed lessons, track completed sessions, request reschedules,
                and keep monthly records beautifully organised.
              </p>
            </div>

            <motion.div
              whileHover={{ y: -8, rotate: 1.5 }}
              className="relative rounded-[2.2rem] bg-[#fbfaff] p-6 shadow-[0_18px_55px_rgba(66,56,120,0.09)]"
            >
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8d73ff]">
                Today’s control panel
              </p>

              <div className="mt-5 space-y-4">
                <MiniMetric label="Pending" value={pending} />
                <MiniMetric label="Completed" value={completed} />
                <MiniMetric label="Total Hours" value={totalHours} />
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* STATS */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            index={0}
            icon={<Calendar size={22} />}
            title="Total Lessons"
            value={filteredLessons.length}
          />
          <StatCard
            index={1}
            icon={<Clock size={22} />}
            title="Total Hours"
            value={totalHours}
          />
          <StatCard
            index={2}
            icon={<CheckCircle2 size={22} />}
            title="Completed"
            value={completed}
          />
          <StatCard
            index={3}
            icon={<Clock size={22} />}
            title="Pending"
            value={pending}
          />
        </div>

        {/* CONTROL BAR */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          className="sticky top-4 z-30 rounded-[2.2rem] bg-white/85 p-4 shadow-[0_20px_70px_rgba(66,56,120,0.12)] backdrop-blur-xl"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <p className="text-sm font-black text-primary">
                Filter by Student
              </p>

              <select
                value={filterStudentId}
                onChange={(e) => setFilterStudentId(e.target.value)}
                className="h-12 w-full rounded-2xl border border-primary/10 bg-[#fbfaff] px-4 text-base outline-none transition focus:border-[#8d73ff] focus:ring-4 focus:ring-[#8d73ff]/10 sm:w-[260px]"
              >
                <option value="all">All Students</option>

                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 font-black text-white shadow-[0_18px_45px_rgba(10,36,84,0.20)] transition hover:-translate-y-1 sm:w-auto"
            >
              <Plus size={18} />
              Add Lesson
              <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </button>
          </div>
        </motion.div>

        {/* CALENDAR */}
        <div className="rounded-[2.5rem] bg-white/95 p-5 shadow-[0_18px_55px_rgba(66,56,120,0.08)] backdrop-blur-xl sm:p-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#8d73ff]">
                Lesson Calendar
              </p>

              <h2 className="mt-2 font-poppins text-3xl font-black text-primary">
                {currentMonth.toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setCurrentMonth(
                    new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
                  )
                }
                className="h-11 rounded-2xl border border-primary/10 bg-[#fbfaff] px-5 font-black text-primary transition hover:bg-[#f6f1ff]"
              >
                Prev
              </button>

              <button
                type="button"
                onClick={() =>
                  setCurrentMonth(
                    new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
                  )
                }
                className="h-11 rounded-2xl border border-primary/10 bg-[#fbfaff] px-5 font-black text-primary transition hover:bg-[#f6f1ff]"
              >
                Next
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="py-2 text-xs font-black uppercase tracking-widest text-primary/40"
              >
                {day}
              </div>
            ))}

            {Array.from({ length: monthStart.getDay() }).map((_, index) => (
              <div key={`empty-${index}`} />
            ))}

            {calendarDays.map((date) => {
              const dayLessons = filteredLessons.filter((lesson) => {
                const displayDate =
                  lesson.status === "reschedule_requested" && lesson.rescheduled_date
                    ? lesson.rescheduled_date
                    : lesson.lesson_date;

                return displayDate === date;
              });

              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => setSelectedDate(date)}
                  className="min-h-[130px] rounded-[1.5rem] border border-primary/10 bg-[#fbfaff] p-3 text-left transition hover:-translate-y-1 hover:bg-[#f6f1ff]"
                >
                  <p className="mb-2 text-sm font-black text-primary">
                    {Number(date.split("-")[2])}
                  </p>

                  <div className="space-y-1">
                    {dayLessons.slice(0, 3).map((lesson) => (
                      <div
                        key={lesson.id}
                        className={`rounded-xl border px-2 py-1 shadow-sm ${getStatusPreviewClass(
                          lesson.status
                        )}`}
                      >
                        <p className="truncate text-xs font-black text-primary">
                          {getStudentName(lesson.student_id)}
                        </p>

                        <p className="truncate text-[11px] font-bold text-primary/45">
                          {formatLessonTime(lesson.lesson_time)} · {lesson.status}
                        </p>
                      </div>
                    ))}

                    {dayLessons.length > 3 && (
                      <p className="text-[11px] font-black text-[#8d73ff]">
                        +{dayLessons.length - 3} more
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence>

        {selectedDate && (
          <Modal onClose={() => setSelectedDate(null)}>
            <ModalHeader
              label="Daily Schedule"
              title={selectedDate}
              description={`${selectedDateLessons.length} lesson(s) scheduled`}
            />

            <div className="mt-7 space-y-4">
              {selectedDateLessons.length === 0 ? (
                <div className="rounded-2xl bg-[#fbfaff] p-6 text-center">
                  <p className="font-black text-primary">No lessons on this date.</p>
                </div>
              ) : (
                selectedDateLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="rounded-[1.5rem] border border-primary/10 bg-[#fbfaff] p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-poppins text-xl font-black text-primary">
                          {getStudentName(lesson.student_id)}
                        </p>

                        <p className="mt-1 text-sm font-bold text-primary/50">
                          {formatLessonTime(lesson.lesson_time)} · {lesson.hours} hour(s)
                        </p>
                      </div>

                      <StatusBadge status={lesson.status} />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {lesson.lesson_contents && (
                        <InfoChip icon={<NotebookText size={15} />}>
                          {lesson.lesson_contents}
                        </InfoChip>
                      )}

                      {lesson.additional_remarks && (
                        <InfoChip icon={<AlertCircle size={15} />}>
                          {lesson.additional_remarks}
                        </InfoChip>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDate(null);
                        setSelectedLesson(lesson);
                      }}
                      className="mt-5 h-12 w-full rounded-2xl bg-[#8d73ff] font-black text-white shadow-[0_14px_35px_rgba(141,115,255,0.25)] transition hover:-translate-y-1"
                    >
                      {lesson.status === "pending" ? "Check Off" : "View / Update"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </Modal>
        )}
        {showAdd && (
          <Modal onClose={() => setShowAdd(false)}>
            <ModalHeader
              label="New Lesson"
              title="Add Lesson"
              description="Add a confirmed lesson timing."
            />

            <div className="mt-7 space-y-4">
              <SelectInput
                label="Student"
                value={selectedStudentId}
                onChange={setSelectedStudentId}
              >
                {students.length === 0 && (
                  <option value="">No assigned students</option>
                )}

                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name || student.id}
                    {student.is_active === false ? " (Inactive)" : ""}
                  </option>
                ))}
              </SelectInput>

              <div>
                <DateInput
                  label="Lesson Date"
                  value={lessonDate}
                  onChange={setLessonDate}
                />

                {lessonDate && (
                  <div className="mt-3 rounded-2xl border border-[#8d73ff]/15 bg-[#f6f1ff] p-4">
                    <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[#8d73ff]">
                      Pending lessons on this date
                    </p>

                    {pendingLessonsOnSelectedDate.length === 0 ? (
                      <p className="text-sm font-bold text-primary/45">
                        No pending lessons on this date.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {pendingLessonsOnSelectedDate.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm"
                          >
                            <p className="font-black text-primary">
                              {getStudentName(lesson.student_id)}
                            </p>

                            <p className="text-sm font-bold text-primary/45">
                              {formatLessonTime(lesson.lesson_time)} · Pending
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <p className="mb-2 text-sm font-black text-primary">Lesson Time</p>

                <input
                  type="time"
                  value={lessonTime}
                  onChange={(e) => setLessonTime(e.target.value)}
                  className="h-13 w-full rounded-2xl border border-primary/10 bg-[#fbfaff] px-4 text-base text-primary outline-none transition focus:border-[#8d73ff] focus:ring-4 focus:ring-[#8d73ff]/10"
                />
              </div>
              <NumberInput
                label="Number of Hours"
                placeholder="1.5"
                value={hours}
                onChange={setHours}
              />

              <TextAreaInput
                label="Lesson Contents"
                placeholder="Reading comprehension, grammar review, MAP vocabulary..."
                optional
                value={lessonContents}
                onChange={setLessonContents}
              />

              <TextAreaInput
                label="Additional Remarks"
                placeholder="Any extra notes for admin..."
                optional
                value={additionalRemarks}
                onChange={setAdditionalRemarks}
              />
            </div>

            <button
              type="button"
              className="mt-7 h-14 w-full rounded-2xl bg-primary font-black text-white shadow-[0_18px_45px_rgba(10,36,84,0.20)] transition hover:-translate-y-1"
              onClick={addLesson}
            >
              Save Lesson
            </button>
          </Modal>
        )}

        {selectedLesson && !showReschedule && (
          <Modal onClose={() => setSelectedLesson(null)}>
            <ModalHeader
              label="Lesson Check-off"
              title="Check Off Lesson"
              description={`${getStudentName(selectedLesson.student_id)} · ${selectedLesson.lesson_date
                } · ${selectedLesson.hours} hour(s)`}
            />

            <div className="mt-7 space-y-3">
              <ActionChoice
                tone="green"
                title="Completed"
                text="The lesson was completed successfully."
                onClick={() => checkOffLesson(selectedLesson.id, "completed")}
              />

              <ActionChoice
                tone="orange"
                title="Student Absent"
                text="The student did not attend this lesson."
                onClick={() =>
                  checkOffLesson(selectedLesson.id, "student_absent")
                }
              />

              <ActionChoice
                tone="blue"
                title="Reschedule Lesson"
                text="Request a new lesson date."
                onClick={() => setShowReschedule(true)}
              />
            </div>

            <textarea
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="Optional check-off note..."
              value={checkoffNote}
              onChange={(e) => setCheckoffNote(e.target.value)}
              className="mt-5 min-h-28 w-full resize-none rounded-2xl border border-primary/10 bg-[#fbfaff] p-4 text-base outline-none transition focus:border-[#8d73ff] focus:ring-4 focus:ring-[#8d73ff]/10"
            />
          </Modal>
        )}

        {showReschedule && selectedLesson && (
          <Modal onClose={() => setShowReschedule(false)}>
            <ModalHeader
              label="Reschedule"
              title="Reschedule Lesson"
              description={`${getStudentName(
                selectedLesson.student_id
              )} · Original Date: ${selectedLesson.lesson_date}`}
            />

            <div className="mt-7">
              <InlineDatePicker
                label="New Lesson Date"
                value={rescheduledDate}
                onChange={setRescheduledDate}
              />

              <div className="mt-4">
                <TextAreaInput
                  label="Reschedule Reason"
                  placeholder="Reason for rescheduling..."
                  optional
                  value={rescheduleReason}
                  onChange={setRescheduleReason}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={submitReschedule}
              className="mt-7 h-14 w-full rounded-2xl bg-primary font-black text-white shadow-[0_18px_45px_rgba(10,36,84,0.20)] transition hover:-translate-y-1"
            >
              Submit Reschedule
            </button>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white p-4">
      <span className="text-sm font-bold text-primary/55">{label}</span>
      <span className="font-poppins text-xl font-black text-primary">
        {value}
      </span>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  index,
}: {
  icon: React.ReactNode;
  title: string;
  value: any;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -8, rotate: index % 2 === 0 ? -1.5 : 1.5 }}
      className="rounded-[2.2rem] bg-white/95 p-6 shadow-[0_18px_55px_rgba(66,56,120,0.08)] backdrop-blur-xl"
    >
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff6da] text-primary">
        {icon}
      </div>

      <p className="mb-1 text-sm font-bold text-primary/50">{title}</p>

      <h3 className="font-poppins text-4xl font-black text-primary">
        {value}
      </h3>
    </motion.div>
  );
}

function getStatusPreviewClass(status: LessonStatus) {
  const styles: Record<LessonStatus, string> = {
    pending: "bg-[#f6f1ff] text-[#8d73ff] border-[#e7dcff]",
    completed: "bg-green-50 text-green-700 border-green-200",
    student_absent: "bg-orange-50 text-orange-700 border-orange-200",
    reschedule_requested: "bg-blue-50 text-blue-700 border-blue-200",
  };

  return styles[status];
}

function StatusBadge({ status }: { status: LessonStatus }) {
  const styles: Record<LessonStatus, string> = {
    pending: "bg-[#f6f1ff] text-[#8d73ff]",
    completed: "bg-green-100 text-green-700",
    student_absent: "bg-orange-100 text-orange-700",
    reschedule_requested: "bg-blue-100 text-blue-700",
  };

  const labels: Record<LessonStatus, string> = {
    pending: "Pending",
    completed: "Completed",
    student_absent: "Student Absent",
    reschedule_requested: "Reschedule Requested",
  };

  return (
    <span className={`rounded-full px-4 py-2 text-sm font-black ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function DatePill({ date }: { date: string }) {
  return (
    <span className="rounded-full bg-[#f6f1ff] px-4 py-2 text-sm font-black text-[#8d73ff]">
      {date}
    </span>
  );
}

function InfoChip({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-[#fbfaff] px-4 py-2 text-sm font-semibold text-primary/70">
      {icon}
      {children}
    </span>
  );
}

function Modal({ children, onClose }: any) {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 p-3 backdrop-blur-md sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96, rotate: -1 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, y: 30, scale: 0.96 }}
        transition={{ duration: 0.35 }}
        className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[2.5rem] bg-white p-6 shadow-[0_35px_110px_rgba(0,0,0,0.28)] sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-[#f6f1ff] text-primary transition hover:scale-110 hover:bg-[#ebe1ff]"
        >
          <X className="h-5 w-5" />
        </button>

        {children}
      </motion.div>
    </motion.div>
  );
}

function ModalHeader({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div className="pr-12">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#8d73ff]">
        {label}
      </p>

      <h2 className="mt-3 font-poppins text-3xl font-black leading-tight text-primary sm:text-4xl">
        {title}
      </h2>

      <p className="mt-3 text-sm leading-7 text-primary/55">{description}</p>
    </div>
  );
}

function SelectInput({ label, value, onChange, children }: any) {
  return (
    <div>
      <p className="mb-2 text-sm font-black text-primary">{label}</p>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-13 w-full rounded-2xl border border-primary/10 bg-[#fbfaff] px-4 text-base outline-none transition focus:border-[#8d73ff] focus:ring-4 focus:ring-[#8d73ff]/10"
      >
        {children}
      </select>
    </div>
  );
}

function DateInput({ label, value, onChange }: any) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(
    value ? new Date(value) : new Date()
  );

  const monthStart = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const monthEnd = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0);

  const calendarDays = Array.from({ length: monthEnd.getDate() }, (_, index) => {
    const day = index + 1;
    const yyyy = viewMonth.getFullYear();
    const mm = String(viewMonth.getMonth() + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });

  const displayText = value
  ? value.split("-").reverse().join("/")
  : "Select date";

  return (
    <div className="relative">
      <p className="mb-2 text-sm font-black text-primary">{label}</p>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-13 w-full items-center justify-between rounded-2xl border border-primary/10 bg-[#fbfaff] px-4 text-base font-bold text-primary outline-none transition hover:bg-[#f6f1ff] focus:border-[#8d73ff] focus:ring-4 focus:ring-[#8d73ff]/10"
      >
        <span>{displayText}</span>
        <Calendar className="h-5 w-5 text-[#8d73ff]" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 8, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            className="absolute left-0 right-0 top-full z-[10000] rounded-[1.7rem] border border-primary/10 bg-white p-4 shadow-[0_24px_70px_rgba(66,56,120,0.18)]"
          >
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() =>
                  setViewMonth(
                    new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1)
                  )
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f6f1ff] text-primary"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <p className="font-poppins text-lg font-black text-primary">
                {viewMonth.toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </p>

              <button
                type="button"
                onClick={() =>
                  setViewMonth(
                    new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1)
                  )
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f6f1ff] text-primary"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                <div
                  key={`${day}-${index}`}
                  className="py-2 text-xs font-black text-primary/35"
                >
                  {day}
                </div>
              ))}

              {Array.from({ length: monthStart.getDay() }).map((_, index) => (
                <div key={`empty-${index}`} />
              ))}

              {calendarDays.map((date) => {
                const selected = date === value;

                return (
                  <button
                    key={date}
                    type="button"
                    onClick={() => {
                      onChange(date);
                      setOpen(false);
                    }}
                    className={`h-10 rounded-xl text-sm font-black transition ${selected
                      ? "bg-[#8d73ff] text-white shadow-[0_10px_25px_rgba(141,115,255,0.35)]"
                      : "text-primary hover:bg-[#f6f1ff]"
                      }`}
                  >
                    {Number(date.split("-")[2])}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InlineDatePicker({ label, value, onChange }: any) {
  const [viewMonth, setViewMonth] = useState(
    value ? new Date(value) : new Date()
  );

  const monthStart = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const monthEnd = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0);

  const calendarDays = Array.from({ length: monthEnd.getDate() }, (_, index) => {
    const day = index + 1;
    const yyyy = viewMonth.getFullYear();
    const mm = String(viewMonth.getMonth() + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });

  return (
    <div>
      <p className="mb-3 text-sm font-black text-primary">{label}</p>

      <div className="rounded-[2rem] border border-primary/10 bg-[#fbfaff] p-4">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() =>
              setViewMonth(
                new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1)
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f6f1ff] text-primary"
          >
            ‹
          </button>

          <p className="font-poppins text-lg font-black text-primary">
            {viewMonth.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </p>

          <button
            type="button"
            onClick={() =>
              setViewMonth(
                new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1)
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f6f1ff] text-primary"
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
            <div
              key={`${day}-${index}`}
              className="py-2 text-xs font-black text-primary/35"
            >
              {day}
            </div>
          ))}

          {Array.from({ length: monthStart.getDay() }).map((_, index) => (
            <div key={`empty-${index}`} />
          ))}

          {calendarDays.map((date) => {
            const selected = date === value;

            return (
              <button
                key={date}
                type="button"
                onClick={() => onChange(date)}
                className={`h-10 rounded-xl text-sm font-black transition ${selected
                  ? "bg-[#8d73ff] text-white shadow-[0_10px_25px_rgba(141,115,255,0.35)]"
                  : "text-primary hover:bg-[#f6f1ff]"
                  }`}
              >
                {Number(date.split("-")[2])}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function NumberInput({ label, placeholder, value, onChange }: any) {
  return (
    <div>
      <p className="mb-2 text-sm font-black text-primary">{label}</p>

      <input
        type="number"
        inputMode="decimal"
        step="0.25"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-13 w-full rounded-2xl border border-primary/10 bg-[#fbfaff] px-4 text-base outline-none transition focus:border-[#8d73ff] focus:ring-4 focus:ring-[#8d73ff]/10"
      />
    </div>
  );
}

function TextAreaInput({
  label,
  placeholder,
  optional,
  value,
  onChange,
}: any) {
  return (
    <div>
      <p className="mb-2 text-sm font-black text-primary">
        {label}
        {optional && (
          <span className="ml-2 text-xs font-normal text-primary/35">
            Optional
          </span>
        )}
      </p>

      <textarea
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-28 w-full resize-none rounded-2xl border border-primary/10 bg-[#fbfaff] px-4 py-3 text-base outline-none transition focus:border-[#8d73ff] focus:ring-4 focus:ring-[#8d73ff]/10"
      />
    </div>
  );
}

function ActionChoice({
  tone,
  title,
  text,
  onClick,
}: {
  tone: "green" | "orange" | "blue";
  title: string;
  text: string;
  onClick: () => void;
}) {
  const tones = {
    green: "border-green-200 bg-green-50 text-green-700",
    orange: "border-orange-200 bg-orange-50 text-orange-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full rounded-2xl border p-5 text-left transition hover:-translate-y-1 ${tones[tone]}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-black">{title}</p>
          <p className="mt-1 text-sm opacity-75">{text}</p>
        </div>

        <ChevronRight className="h-5 w-5 transition group-hover:translate-x-1" />
      </div>
    </button>
  );
}