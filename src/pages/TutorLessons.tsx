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

  const filteredLessons =
    filterStudentId === "all"
      ? lessons
      : lessons.filter((lesson) => lesson.student_id === filterStudentId);

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

  const sortedLessons = useMemo(() => {
    return [...filteredLessons].sort((a, b) => {
      const isDoneA = a.status === "completed" || a.status === "student_absent";
      const isDoneB = b.status === "completed" || b.status === "student_absent";

      if (isDoneA !== isDoneB) return isDoneA ? 1 : -1;

      const dateA = a.rescheduled_date || a.lesson_date;
      const dateB = b.rescheduled_date || b.lesson_date;

      return new Date(dateA).getTime() - new Date(dateB).getTime();
    });
  }, [filteredLessons]);

  return (
    <div className="min-h-screen overflow-hidden bg-[#fbfaff] px-4 py-8 sm:px-6 sm:py-14">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_15%,#f0eaff_0%,transparent_28%),radial-gradient(circle_at_85%_75%,#fff1bd_0%,transparent_30%)]" />

      <div className="relative z-10 mx-auto max-w-[1350px] space-y-8">
        {/* HERO */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: [0, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
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

        {/* LESSON TIMELINE */}
        <div className="space-y-5">
          {lessons.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[2.2rem] bg-white/95 p-10 text-center shadow-[0_18px_55px_rgba(66,56,120,0.08)] backdrop-blur-xl"
            >
              <p className="font-poppins text-2xl font-black text-primary">
                No lessons added yet.
              </p>
              <p className="mt-2 text-sm text-primary/55">
                Add your first lesson to start monthly tracking.
              </p>
            </motion.div>
          ) : (
            sortedLessons.map((lesson, index) => {
              const isDone =
                lesson.status === "completed" ||
                lesson.status === "student_absent";

              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 35 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.25 }}
                  transition={{ duration: 0.45, delay: index * 0.04 }}
                  whileHover={{
                    y: -7,
                    rotate: index % 2 === 0 ? -0.6 : 0.6,
                  }}
                  className={`group relative overflow-hidden rounded-[2.4rem] bg-white/95 p-6 shadow-[0_18px_55px_rgba(66,56,120,0.08)] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_25px_70px_rgba(141,115,255,0.18)] ${
                    isDone ? "opacity-75" : ""
                  }`}
                >
                  <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#f0eaff]" />

                  <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div>
                      <div className="mb-4 flex flex-wrap items-center gap-2">
                        <DatePill
                          date={
                            lesson.status === "reschedule_requested" &&
                            lesson.rescheduled_date
                              ? lesson.rescheduled_date
                              : lesson.lesson_date
                          }
                        />

                        <span className="rounded-full bg-[#fff6da] px-4 py-2 text-sm font-black text-[#d4a100]">
                          {lesson.hours} hour(s)
                        </span>

                        <StatusBadge status={lesson.status} />
                      </div>

                      <h3 className="font-poppins text-2xl font-black text-primary sm:text-3xl">
                        {getStudentName(lesson.student_id)}
                      </h3>

                      <div className="mt-4 flex flex-wrap gap-3">
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

                        {lesson.status === "reschedule_requested" &&
                          lesson.rescheduled_date && (
                            <InfoChip icon={<RotateCcw size={15} />}>
                              Rescheduled: {lesson.lesson_date} →{" "}
                              {lesson.rescheduled_date}
                            </InfoChip>
                          )}
                      </div>
                    </div>

                    <div className="flex lg:justify-end">
                      {lesson.status === "pending" ? (
                        <button
                          type="button"
                          onClick={() => setSelectedLesson(lesson)}
                          className="group/btn flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#8d73ff] px-7 font-black text-white shadow-[0_16px_40px_rgba(141,115,255,0.28)] transition hover:-translate-y-1 sm:w-auto"
                        >
                          Check Off
                          <ChevronRight className="h-4 w-4 transition group-hover/btn:translate-x-1" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedLesson(lesson)}
                          className="flex h-13 w-full items-center justify-center rounded-2xl border border-primary/10 bg-white px-7 font-black text-primary transition hover:-translate-y-1 hover:bg-[#f6f1ff] sm:w-auto"
                        >
                          View / Update
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      <AnimatePresence>
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

              <DateInput
                label="Lesson Date"
                value={lessonDate}
                onChange={setLessonDate}
              />

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
              description={`${getStudentName(selectedLesson.student_id)} · ${
                selectedLesson.lesson_date
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
              <DateInput
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
  return (
    <div>
      <p className="mb-2 text-sm font-black text-primary">{label}</p>

      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-13 w-full rounded-2xl border border-primary/10 bg-[#fbfaff] px-4 text-base text-primary outline-none transition focus:border-[#8d73ff] focus:ring-4 focus:ring-[#8d73ff]/10"
      />
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