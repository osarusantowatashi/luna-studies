// ==========================================
// CREATE FILE:
// src/pages/TutorLessons.tsx
// ==========================================
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";

const [students, setStudents] = useState<any[]>([]);
const [selectedStudentId, setSelectedStudentId] = useState("");
useEffect(() => {
  const fetchAssignedStudents = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) return;

    const { data, error } = await supabase
      .from("student_tutors")
      .select(`
        student_id,
        students (
          id,
          name,
          grade,
          is_active
        )
      `)
      .eq("tutor_id", user.id);

    if (error) {
      console.error("Failed to fetch assigned students:", error);
      return;
    }

    const assignedStudents =
      data?.map((item: any) => item.students).filter(Boolean) || [];

    setStudents(assignedStudents);
  };

  fetchAssignedStudents();
}, []);
const initialLessons = [
  {
    id: 1,
    student: "Ryan Ng",
    grade: "G5",
    time: "4:00 PM - 5:30 PM",
    subject: "Math",
    topic: "Fractions",
    status: "pending",
  },
  {
    id: 2,
    student: "Evelyn Tan",
    grade: "G6",
    time: "5:30 PM - 7:00 PM",
    subject: "English",
    topic: "Reading Comprehension",
    status: "completed",
  },
  {
    id: 3,
    student: "Brendan Lim",
    grade: "G3",
    time: "7:00 PM - 8:00 PM",
    subject: "Chinese",
    topic: "说明文练习",
    status: "pending",
  },
];

export default function TutorLessons() {
  const [lessons, setLessons] = useState(initialLessons);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  const completed = lessons.filter(
    (lesson) => lesson.status === "completed"
  ).length;

  const pending = lessons.filter(
    (lesson) => lesson.status === "pending"
  ).length;

  const checkOffLesson = (id: number) => {
    setLessons((prev) =>
      prev.map((lesson) =>
        lesson.id === id
          ? { ...lesson, status: "completed" }
          : lesson
      )
    );

    setSelectedLesson(null);
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] px-6 py-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-[32px] border border-[#dbe5f0] p-10 mb-8">
          <p className="text-[#f7c600] uppercase tracking-[3px] font-semibold text-sm mb-4">
            Tutor Lessons
          </p>

          <h1 className="font-serif text-6xl text-[#0b234a] leading-tight">
            Lesson Schedule &
            <br />
            Check-off
          </h1>

          <p className="text-slate-500 mt-5 text-lg max-w-2xl">
            Add lessons, record completed sessions,
            and keep monthly tracking accurate.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          <StatCard
            icon={<Calendar size={22} />}
            title="Today's Lessons"
            value={lessons.length}
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

        {/* Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">

          <button
            onClick={() => setShowAdd(true)}
            className="bg-[#0b234a] text-white px-6 py-4 rounded-2xl font-semibold flex items-center gap-2"
          >
            <Plus size={18} />
            Add Lesson
          </button>

          <button className="bg-white border border-[#dbe5f0] text-[#0b234a] px-6 py-4 rounded-2xl font-semibold flex items-center gap-2">
            <Copy size={18} />
            Copy Last Week
          </button>

          <button className="bg-white border border-[#dbe5f0] text-[#0b234a] px-6 py-4 rounded-2xl font-semibold flex items-center gap-2">
            <RotateCcw size={18} />
            Reschedule Request
          </button>

        </div>

        {/* Lessons */}
        <div className="space-y-5">

          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-white border border-[#dbe5f0] rounded-[28px] p-6 flex flex-col lg:flex-row justify-between gap-6"
            >

              <div>
                <p className="text-sm text-[#f7c600] font-semibold mb-2">
                  {lesson.time}
                </p>

                <h3 className="text-2xl font-semibold text-[#0b234a]">
                  {lesson.student}
                  <span className="text-slate-400 ml-2 text-lg">
                    ({lesson.grade})
                  </span>
                </h3>

                <div className="flex gap-3 mt-4 flex-wrap">

                  <span className="bg-[#eef4fb] px-4 py-2 rounded-full text-sm text-[#0b234a]">
                    {lesson.subject}
                  </span>

                  <span className="bg-[#eef4fb] px-4 py-2 rounded-full text-sm text-[#0b234a]">
                    {lesson.topic}
                  </span>

                </div>
              </div>

              <div className="flex items-center">

                {lesson.status === "completed" ? (
                  <div className="bg-green-100 text-green-700 px-5 py-3 rounded-2xl font-semibold">
                    Completed
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedLesson(lesson)}
                    className="bg-[#f7c600] text-[#0b234a] px-6 py-4 rounded-2xl font-semibold"
                  >
                    Check Off
                  </button>
                )}

              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Lesson Modal */}
      {showAdd && (
        <Modal onClose={() => setShowAdd(false)}>

          <h2 className="font-serif text-4xl text-[#0b234a] mb-2">
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
    className="w-full border border-[#dbe5f0] rounded-2xl px-4 py-4 outline-none bg-white"
  >
    <option value="">Select student</option>

    {students.map((student) => (
      <option key={student.id} value={student.id}>
        {student.name || student.id}
        {student.grade ? ` (${student.grade})` : ""}
        {student.is_active === false ? " - Inactive" : ""}
      </option>
    ))}
  </select>
</div>
            <Input label="Date" placeholder="May 10, 2025" />
            <Input label="Start Time" placeholder="4:00 PM" />
            <Input label="End Time" placeholder="5:30 PM" />
            <Input label="Subject" placeholder="Math" />
            <Input label="Topic" placeholder="Fractions" />

          </div>

          <button
            className="w-full mt-6 bg-[#0b234a] text-white py-4 rounded-2xl font-semibold"
            onClick={() => setShowAdd(false)}
          >
            Save Lesson
          </button>

        </Modal>
      )}

      {/* Check Off Modal */}
      {selectedLesson && (
        <Modal onClose={() => setSelectedLesson(null)}>

          <h2 className="font-serif text-4xl text-[#0b234a] mb-2">
            Check Off Lesson
          </h2>

          <p className="text-slate-500 mb-6">
            {selectedLesson.student} · {selectedLesson.time}
          </p>

          <div className="space-y-3 mb-5">

            <Option text="Completed" active />
            <Option text="Student Absent" />
            <Option text="Rescheduled" />

          </div>

          <textarea
            placeholder="Optional notes..."
            className="w-full border border-[#dbe5f0] rounded-2xl p-4 min-h-28 outline-none"
          />

          <button
            onClick={() => checkOffLesson(selectedLesson.id)}
            className="w-full mt-5 bg-[#f7c600] text-[#0b234a] py-4 rounded-2xl font-semibold"
          >
            Submit
          </button>

        </Modal>
      )}
    </div>
  );
}

// ==========================================
// COMPONENTS
// ==========================================

function StatCard({ icon, title, value }: any) {
  return (
    <div className="bg-white border border-[#dbe5f0] rounded-[28px] p-7">
      <div className="w-14 h-14 rounded-2xl bg-[#fff7d6] flex items-center justify-center text-[#0b234a] mb-5">
        {icon}
      </div>

      <p className="text-slate-500 mb-1">{title}</p>

      <h3 className="text-5xl font-serif text-[#0b234a]">
        {value}
      </h3>
    </div>
  );
}

function Input({ label, placeholder }: any) {
  return (
    <div>
      <p className="text-sm font-semibold text-[#0b234a] mb-2">
        {label}
      </p>

      <input
        placeholder={placeholder}
        className="w-full border border-[#dbe5f0] rounded-2xl px-4 py-4 outline-none"
      />
    </div>
  );
}

function Option({ text, active }: any) {
  return (
    <button
      className={`w-full text-left px-5 py-4 rounded-2xl border ${
        active
          ? "border-green-300 bg-green-50 text-green-700"
          : "border-[#dbe5f0]"
      }`}
    >
      {text}
    </button>
  );
}

function Modal({ children, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[32px] p-8 w-full max-w-lg relative">

        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400"
        >
          <X />
        </button>

        {children}
      </div>
    </div>
  );
}