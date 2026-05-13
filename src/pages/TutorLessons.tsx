// ==========================================
// src/pages/TutorLessons.tsx
// ==========================================

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  X,
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
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduledDate, setRescheduledDate] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

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
    const { data: userData, error: userError } =
      await supabase.auth.getUser();

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

  const checkOffLesson = async (
    lessonId: string,
    newStatus: LessonStatus
  ) => {
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
      : lessons.filter(
        (lesson) => lesson.student_id === filterStudentId
      );
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

  const sortedLessons = [...filteredLessons].sort((a, b) => {
    const isDoneA =
      a.status === "completed" || a.status === "student_absent";
    const isDoneB =
      b.status === "completed" || b.status === "student_absent";

    // completed / absent lessons go bottom
    if (isDoneA !== isDoneB) return isDoneA ? 1 : -1;

    // use rescheduled date first if it exists
    const dateA = a.rescheduled_date || a.lesson_date;
    const dateB = b.rescheduled_date || b.lesson_date;

    return new Date(dateA).getTime() - new Date(dateB).getTime();
  });

  return (
    <div className="min-h-screen bg-[#f7f9fc] px-4 py-8 sm:px-6 sm:py-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 rounded-[1.8rem] border border-[#dbe5f0] bg-white p-5 sm:rounded-[32px] sm:p-10">
          <p className="text-[#f7c600] uppercase tracking-[3px] font-semibold text-sm mb-4">
            Tutor Lessons
          </p>

          <h1 className="font-serif text-3xl leading-tight text-[#0b234a] sm:text-5xl lg:text-6xl">
            Lesson Schedule &
            <br />
            Check-off
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-500 sm:text-lg sm:leading-relaxed">
            Add lessons, record completed sessions, and keep monthly tracking
            accurate.
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Calendar size={22} />}
            title="Total Lessons"
            value={filteredLessons.length}
          />
          <StatCard
            icon={<Clock size={22} />}
            title="Total Hours"
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
        </div>
        <div className="mb-8 grid gap-3 sm:flex sm:items-center sm:gap-4">
          <p className="text-sm font-semibold text-[#0b234a]">
            Filter by Student
          </p>

          <select
            value={filterStudentId}
            onChange={(e) => setFilterStudentId(e.target.value)}
            className="w-full rounded-2xl border border-[#dbe5f0] bg-white px-4 py-3 text-base outline-none transition focus:border-[#0b234a] focus:ring-4 focus:ring-[#0b234a]/10 sm:w-auto"
          >
            <option value="all">All Students</option>

            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-8 grid gap-3 sm:flex sm:flex-wrap">
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0b234a] px-6 py-4 font-semibold text-white sm:w-auto"
          >
            <Plus size={18} />
            Add Lesson
          </button>
        </div>

        <div className="space-y-5">
          {lessons.length === 0 ? (
         <div className="rounded-[1.8rem] border border-[#dbe5f0] bg-white p-5 text-sm leading-7 text-slate-500 sm:rounded-[28px] sm:p-8 sm:text-base">
              No lessons added yet.
            </div>
          ) : (
            sortedLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="flex flex-col gap-5 rounded-[1.8rem] border border-[#dbe5f0] bg-white p-5 sm:p-6 lg:flex-row lg:justify-between"
              >
                <div>
                  <p className="text-sm text-[#f7c600] font-semibold mb-2">
                    {lesson.status === "reschedule_requested" &&
                      lesson.rescheduled_date
                      ? lesson.rescheduled_date
                      : lesson.lesson_date}{" "}
                    · {lesson.hours} hour(s)
                  </p>
                  <h3 className="text-2xl font-semibold text-[#0b234a]">
                    {getStudentName(lesson.student_id)}
                  </h3>

                  <div className="flex gap-3 mt-4 flex-wrap">
                    {lesson.lesson_contents && (
                      <span className="bg-[#eef4fb] px-4 py-2 rounded-full text-sm text-[#0b234a]">
                        {lesson.lesson_contents}
                      </span>
                    )}

                    {lesson.additional_remarks && (
                      <span className="bg-[#fff7d6] px-4 py-2 rounded-full text-sm text-[#0b234a]">
                        {lesson.additional_remarks}
                      </span>
                    )}
                    {lesson.status === "reschedule_requested" && lesson.rescheduled_date && (
                      <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm">
                        Rescheduled: {lesson.lesson_date} → {lesson.rescheduled_date}
                      </span>
                    )}

                    <StatusBadge status={lesson.status} />
                  </div>
                </div>

                <div className="flex items-center lg:justify-end">
                  {lesson.status === "pending" ? (
                    <button
                      type="button"
                      onClick={() => setSelectedLesson(lesson)}
                      className="w-full rounded-2xl bg-[#f7c600] px-6 py-4 font-semibold text-[#0b234a] sm:w-auto"
                    >
                      Check Off
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelectedLesson(lesson)}
                      className="w-full rounded-2xl border border-[#dbe5f0] bg-white px-6 py-4 font-semibold text-[#0b234a] sm:w-auto"
                    >
                      View / Update
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showAdd && (
        <Modal onClose={() => setShowAdd(false)}>
          <h2 className="mb-2 pr-10 font-serif text-3xl text-[#0b234a] sm:text-4xl">
            Add Lesson
          </h2>

          <p className="text-slate-500 mb-6">
            Add a confirmed lesson timing.
          </p>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-[#0b234a] mb-2">
                Student
              </p>

              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full rounded-2xl border border-[#dbe5f0] bg-white px-4 py-3 text-base outline-none transition focus:border-[#0b234a] focus:ring-4 focus:ring-[#0b234a]/10"
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
              </select>
            </div>

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
           className="mt-6 w-full rounded-2xl bg-[#0b234a] py-4 font-semibold text-white"
            onClick={addLesson}
          >
            Save Lesson
          </button>
        </Modal>
      )}


      {selectedLesson && !showReschedule && (
        <Modal onClose={() => setSelectedLesson(null)}>
          <h2 className="mb-2 pr-10 font-serif text-3xl text-[#0b234a] sm:text-4xl">
            Check Off Lesson
          </h2>

          <p className="text-slate-500 mb-6">
            {getStudentName(selectedLesson.student_id)} ·{" "}
            {selectedLesson.lesson_date} · {selectedLesson.hours} hour(s)
          </p>

          <div className="space-y-3 mb-5">
            <button
              type="button"
              onClick={() => checkOffLesson(selectedLesson.id, "completed")}
              className="w-full text-left px-5 py-4 rounded-2xl border border-green-300 bg-green-50 text-green-700"
            >
              Completed
            </button>

            <button
              type="button"
              onClick={() =>
                checkOffLesson(selectedLesson.id, "student_absent")
              }
              className="w-full text-left px-5 py-4 rounded-2xl border border-orange-300 bg-orange-50 text-orange-700"
            >
              Student Absent
            </button>

            <button
              type="button"
              onClick={() => {
                setShowReschedule(true);
              }}
              className="w-full text-left px-5 py-4 rounded-2xl border border-blue-300 bg-blue-50 text-blue-700"
            >
              Reschedule Lesson
            </button>
          </div>

          <textarea
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="Optional check-off note..."
            value={checkoffNote}
            onChange={(e) => setCheckoffNote(e.target.value)}
            className="min-h-28 w-full resize-none rounded-2xl border border-[#dbe5f0] p-4 text-base outline-none transition focus:border-[#0b234a] focus:ring-4 focus:ring-[#0b234a]/10"
          />
        </Modal>
      )}
      {showReschedule && selectedLesson && (
        <Modal onClose={() => setShowReschedule(false)}>
          <h2 className="mb-2 pr-10 font-serif text-3xl text-[#0b234a] sm:text-4xl">
            Reschedule Lesson
          </h2>

          <p className="text-slate-500 mb-6">
            {getStudentName(selectedLesson.student_id)} · Original Date:{" "}
            {selectedLesson.lesson_date}
          </p>

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

          <button
            type="button"
            onClick={submitReschedule}
            className="w-full mt-6 bg-[#0b234a] text-white py-4 rounded-2xl font-semibold"
          >
            Submit Reschedule
          </button>
        </Modal>)}
    </div>
  );
}


function StatCard({ icon, title, value }: any) {
  return (
    <div className="rounded-[1.8rem] border border-[#dbe5f0] bg-white p-5 sm:rounded-[28px] sm:p-7">
      <div className="w-14 h-14 rounded-2xl bg-[#fff7d6] flex items-center justify-center text-[#0b234a] mb-5">
        {icon}
      </div>

      <p className="text-slate-500 mb-1">{title}</p>

      <h3 className="font-serif text-3xl text-[#0b234a] sm:text-5xl">{value}</h3>
    </div>
  );
}

function StatusBadge({ status }: { status: LessonStatus }) {
  const styles: Record<LessonStatus, string> = {
    pending: "bg-slate-100 text-slate-600",
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
    <span className={`px-4 py-2 rounded-full text-sm ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function DateInput({ label, value, onChange }: any) {
  return (
    <div>
      <p className="text-sm font-semibold text-[#0b234a] mb-2">{label}</p>

      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-[#dbe5f0] bg-white px-4 py-3 text-base text-[#0b234a] outline-none transition focus:border-[#0b234a] focus:ring-4 focus:ring-[#0b234a]/10"
      />
    </div>
  );
}

function NumberInput({ label, placeholder, value, onChange }: any) {
  return (
    <div>
      <p className="text-sm font-semibold text-[#0b234a] mb-2">{label}</p>

      <input
        type="number"
        inputMode="decimal"
        step="0.25"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-[#dbe5f0] bg-white px-4 py-3 text-base outline-none transition focus:border-[#0b234a] focus:ring-4 focus:ring-[#0b234a]/10"
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
      <p className="text-sm font-semibold text-[#0b234a] mb-2">
        {label}
        {optional && (
          <span className="ml-2 text-xs font-normal text-slate-400">
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
        className="min-h-28 w-full resize-none rounded-2xl border border-[#dbe5f0] px-4 py-3 text-base outline-none transition focus:border-[#0b234a] focus:ring-4 focus:ring-[#0b234a]/10"
      />
    </div>
  );
}

function Modal({ children, onClose }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-3 backdrop-blur-sm sm:p-4">
      <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-[1.8rem] bg-white p-5 shadow-[0_30px_100px_rgba(0,0,0,0.25)] sm:rounded-[32px] sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
        >
          <X />
        </button>

        {children}
      </div>
    </div>
  );

}