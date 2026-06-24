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
  const [showCompletedPackages, setShowCompletedPackages] = useState(false);


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

  const updatePackage = async () => {
    if (!editingPackageId) return;

    if (!packageHours || Number(packageHours) <= 0) {
      alert("Please enter package hours.");
      return;
    }

    const { error } = await supabase
      .from("student_packages")
      .update({
        package_hours: Number(packageHours),
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

  const totalHours = filteredLessons
    .filter(
      (lesson) =>
        lesson.status === "completed" ||
        lesson.status === "student_absent"
    )
    .reduce(
      (sum, lesson) =>
        sum + Number(lesson.hours || 0),
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


    <div className="min-h-screen bg-[#f7f9fc] px-4 py-6 sm:px-6 sm:py-10">
      <div className="max-w-7xl mx-auto">

        <div className="mb-8 rounded-[2rem] border border-[#dbe5f0] bg-white p-5 sm:rounded-[32px] sm:p-10">
          <p className="text-[#f7c600] uppercase tracking-[3px] font-semibold text-sm mb-4">
            Admin Lessons
          </p>

          <h1 className="font-serif text-3xl leading-tight text-[#0b234a] sm:text-6xl">
            Lesson Management
          </h1>

          <p className="mt-4 text-sm leading-7 text-slate-500 sm:mt-5 sm:text-lg">
            Monitor tutors, students, attendance,
            and rescheduling activity.
          </p>
        </div>

        {/* FILTERS */}
        <div className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-[#dbe5f0] bg-white p-5 sm:flex-row sm:flex-wrap sm:rounded-[28px] sm:p-6">

          <select
            value={selectedTutor}
            onChange={(e) => {
              setSelectedTutor(e.target.value);
              setSelectedStudent("all");
            }}
           className="w-full rounded-2xl border border-[#dbe5f0] bg-white px-4 py-3 text-base outline-none transition focus:border-[#0b234a] focus:ring-4 focus:ring-[#0b234a]/10 sm:w-auto"
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
            className="w-full rounded-2xl border border-[#dbe5f0] bg-white px-4 py-3 outline-none sm:w-auto"
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
            className="w-full rounded-2xl border border-[#dbe5f0] bg-white px-4 py-3 outline-none sm:w-auto"
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
        {/* PACKAGE OVERVIEW */}
        <div className="mb-8 rounded-[2rem] border border-[#dbe5f0] bg-white p-5 sm:rounded-[28px] sm:p-6">

          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[#f7c600] uppercase tracking-[3px] font-semibold text-sm mb-2">
                Student Packages
              </p>

              <h2 className="text-3xl font-serif text-[#0b234a]">
                Remaining Hours
              </h2>

            </div>

            <button
              type="button"
              onClick={() => setShowAddPackage(true)}
              className="min-h-11 w-full rounded-2xl bg-[#0b234a] px-5 py-3 font-semibold text-white sm:w-auto"
            >
              Add Package
            </button>

            <button
              type="button"
              onClick={() => setShowCompletedPackages(!showCompletedPackages)}
              className="min-h-11 w-full rounded-2xl bg-[#0b234a] px-5 py-3 font-semibold text-white sm:w-auto"
            >
              {showCompletedPackages ? "Hide Completed" : "Show Completed Packages"}
            </button>
          </div>


          <div className="space-y-4">

            {allStudents.map((student) => {
              const studentPackages = packages.filter(
                (pkg) => pkg.student_id === student.id
              );
              const purchasedHours = studentPackages.reduce(
                (sum, pkg) => sum + Number(pkg.package_hours || 0),
                0
              );

              if (studentPackages.length === 0) return null;

              const deletePackage = async (packageId: string) => {
                const confirmed = window.confirm(
                  "Delete this package?"
                );

                if (!confirmed) return;

                const { error } = await supabase
                  .from("student_packages")
                  .delete()
                  .eq("id", packageId);

                if (error) {
                  alert(error.message);
                  return;
                }

                fetchPackages();
              };
              const usedHours = lessons
                .filter(
                  (lesson) =>
                    lesson.student_id === student.id &&
                    (lesson.status === "completed" ||
                      lesson.status === "student_absent")
                )
                .reduce(
                  (sum, lesson) => sum + Number(lesson.hours || 0),
                  0
                );

              const remaining = purchasedHours - usedHours;

              const isLow = remaining > 0 && remaining <= 2;
              const isFinished = remaining <= 0;

              if (!showCompletedPackages && isFinished) return null;

              return (
                <div
                  key={student.id}
                  className={`flex flex-col gap-5 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${isFinished
                    ? "border-slate-200 bg-slate-50 opacity-70"
                    : isLow
                      ? "border-orange-200 bg-orange-50"
                      : "border-[#eef4fb]"
                    }`}
                >
                  <div>
                    <p className="font-semibold text-[#0b234a] text-lg">
                      {student.name}
                    </p>

                    <div className="text-sm text-slate-500">
                      <p>{studentPackages.length} package(s)</p>

                      <div className="mt-2 space-y-1">
                        {studentPackages.map((pkg) => (
                          <div key={pkg.id} className="text-xs text-slate-500">
                            {Number(pkg.package_hours).toFixed(2)}h ·{" "}
                            {pkg.purchased_at || "No date"} ·{" "}
                            {pkg.package_name || "Package"}

                            <button
                              type="button"
                              onClick={() => {
                                setEditingPackageId(pkg.id);
                                setPackageStudentId(student.id);
                                setPackageHours(String(pkg.package_hours || ""));
                                setPackageName(pkg.package_name || "");
                                setPackagePurchasedAt(pkg.purchased_at || "");
                                setShowAddPackage(true);
                              }}
                              className="ml-2 text-[#0b234a] underline"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => deletePackage(pkg.id)}
                              className="ml-2 text-red-500 underline"
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-1">

                    <p className="text-sm text-slate-500">
                      Purchased:{" "}
                      <span className="font-semibold text-[#0b234a]">
                        {purchasedHours.toFixed(2)}h
                      </span>
                    </p>

                    <p className="text-sm text-slate-500">
                      Used:{" "}
                      <span className="font-semibold text-[#0b234a]">
                        {usedHours.toFixed(2)}h
                      </span>
                    </p>

                    <p className="text-lg font-serif text-[#0b234a]">
                      Remaining: {remaining.toFixed(2)}h
                    </p>
                    {isLow && (
                      <p className="mt-1 text-sm font-semibold text-orange-600">
                        ⚠ Low balance
                      </p>
                    )}

                    {isFinished && (
                      <p className="mt-1 text-sm font-semibold text-red-600">
                        Package finished
                      </p>
                    )}
                  </div>

                </div>

              );
            })}

          </div>
        </div>

        {/* STATS */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 sm:gap-6">

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
              className="rounded-[2rem] border border-[#dbe5f0] bg-white p-5 sm:rounded-[28px] sm:p-6"
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

                  <h3 className="text-xl font-semibold text-[#0b234a] sm:text-2xl">
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

      {showAddPackage && (
        <Modal onClose={() => setShowAddPackage(false)}>
          <h2 className="mb-2 font-serif text-2xl text-[#0b234a] sm:text-4xl">
            Add Student Package
          </h2>

          <p className="text-slate-500 mb-6">
            Input the lesson package purchased by a student.
          </p>

          <select
            value={packageStudentId}
            onChange={(e) => setPackageStudentId(e.target.value)}
           className="mb-4 w-full rounded-2xl border border-[#dbe5f0] bg-white px-4 py-3 text-base outline-none transition focus:border-[#0b234a] focus:ring-4 focus:ring-[#0b234a]/10"
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
      className={`px-4 py-2 rounded-full text-sm ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
