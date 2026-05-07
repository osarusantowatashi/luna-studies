import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Calendar,
  CheckCircle2,
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
  rescheduled_date?: string | null;
  hours: number;
  lesson_contents?: string | null;
  additional_remarks?: string | null;
  status: LessonStatus;
};

export default function AdminLessons() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);

  const [selectedTutor, setSelectedTutor] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    fetchProfiles();
    fetchLessons();
  }, []);

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
  const students = profiles.filter((p) => p.role === "student");

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

      return tutorMatch && studentMatch && statusMatch;
    });
  }, [lessons, selectedTutor, selectedStudent, selectedStatus]);

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

  return (
    <div className="min-h-screen bg-[#f7f9fc] px-6 py-10">
      <div className="max-w-7xl mx-auto">

        <div className="bg-white rounded-[32px] border border-[#dbe5f0] p-10 mb-8">
          <p className="text-[#f7c600] uppercase tracking-[3px] font-semibold text-sm mb-4">
            Admin Lessons
          </p>

          <h1 className="font-serif text-6xl text-[#0b234a] leading-tight">
            Lesson Management
          </h1>

          <p className="text-slate-500 mt-5 text-lg">
            Monitor tutors, students, attendance,
            and rescheduling activity.
          </p>
        </div>

        {/* FILTERS */}
        <div className="bg-white border border-[#dbe5f0] rounded-[28px] p-6 mb-8 flex flex-wrap gap-4">

          <select
            value={selectedTutor}
            onChange={(e) =>
              setSelectedTutor(e.target.value)
            }
            className="border border-[#dbe5f0] rounded-2xl px-4 py-3 bg-white outline-none"
          >
            <option value="all">All Tutors</option>

            {tutors.map((tutor) => (
              <option
                key={tutor.id}
                value={tutor.id}
              >
                {tutor.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStudent}
            onChange={(e) =>
              setSelectedStudent(e.target.value)
            }
            className="border border-[#dbe5f0] rounded-2xl px-4 py-3 bg-white outline-none"
          >
            <option value="all">All Students</option>

            {students.map((student) => (
              <option
                key={student.id}
                value={student.id}
              >
                {student.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) =>
              setSelectedStatus(e.target.value)
            }
            className="border border-[#dbe5f0] rounded-2xl px-4 py-3 bg-white outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="student_absent">
              Student Absent
            </option>
            <option value="reschedule_requested">
              Rescheduled
            </option>
          </select>

        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">

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

        {/* LESSONS */}
        <div className="space-y-5">

          {sortedLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-white border border-[#dbe5f0] rounded-[28px] p-6"
            >

              <div className="flex flex-col lg:flex-row justify-between gap-6">

                <div>

                  <p className="text-sm text-[#f7c600] font-semibold mb-2">
                    {lesson.status ===
                      "reschedule_requested" &&
                    lesson.rescheduled_date
                      ? lesson.rescheduled_date
                      : lesson.lesson_date}{" "}
                    · {lesson.hours} hour(s)
                  </p>

                  <h3 className="text-2xl font-semibold text-[#0b234a]">
                    {getProfileName(lesson.student_id)}
                  </h3>

                  <p className="text-slate-500 mt-1">
                    Tutor:{" "}
                    {getProfileName(lesson.tutor_id)}
                  </p>

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

                    {lesson.status ===
                      "reschedule_requested" &&
                      lesson.rescheduled_date && (
                      <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm">
                        Rescheduled:{" "}
                        {lesson.lesson_date} →{" "}
                        {lesson.rescheduled_date}
                      </span>
                    )}

                    <StatusBadge
                      status={lesson.status}
                    />

                  </div>

                </div>

              </div>

            </div>
          ))}

        </div>

      </div>
    </div>
  );
}

function StatCard({ icon, title, value }: any) {
  return (
    <div className="bg-white border border-[#dbe5f0] rounded-[28px] p-7">
      <div className="w-14 h-14 rounded-2xl bg-[#fff7d6] flex items-center justify-center text-[#0b234a] mb-5">
        {icon}
      </div>

      <p className="text-slate-500 mb-1">
        {title}
      </p>

      <h3 className="text-5xl font-serif text-[#0b234a]">
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
      className={`px-4 py-2 rounded-full text-sm ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}