import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const GRADES = [
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Beginner",
  "Intermediate",
  "Advanced",
];

const AdminAssign = () => {
  const [activeTab, setActiveTab] = useState<"student" | "tutor" | "connect">(
    "student"
  );

  const [students, setStudents] = useState<any[]>([]);
  const [tutors, setTutors] = useState<any[]>([]);

  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);

  const [selectedTutorId, setSelectedTutorId] = useState("");
  const [selectedStudentIdForTutor, setSelectedStudentIdForTutor] =
    useState("");
  const [links, setLinks] = useState<any[]>([]);

  const [studentCode, setStudentCode] = useState("");
  const [tutorCode, setTutorCode] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchLinks();
  }, []);

  const fetchUsers = async () => {
    const { data: studentData, error: studentError } = await supabase
      .from("profiles")
      .select("id, name, role, is_active, can_view_answers")
      .eq("role", "student")
      .order("created_at", { ascending: false });

    if (studentError) {
      alert(studentError.message);
      return;
    }

    const { data: tutorData, error: tutorError } = await supabase
      .from("profiles")
      .select("id, name, role, is_active")
      .eq("role", "tutor")
      .order("created_at", { ascending: false });

    if (tutorError) {
      alert(tutorError.message);
      return;
    }

    setStudents(studentData || []);
    setTutors(tutorData || []);
  };

  const fetchLinks = async () => {
    const { data, error } = await supabase
      .from("tutor_student_links")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return;

    setLinks(data || []);
  };

  const generateInviteCode = async (role: "student" | "tutor") => {
    const newCode = `LUNA-${Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()}`;

    const { error } = await supabase.from("invite_codes").insert({
      code: newCode,
      role,
      used: false,
      is_active: true,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    if (error) {
      alert("Failed to generate invite code");
      return;
    }

    if (role === "student") setStudentCode(newCode);
    if (role === "tutor") setTutorCode(newCode);

    alert(`${role} invite code created: ${newCode}`);
  };

  const copyCode = async (code: string) => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    alert("Code copied");
  };

  const openAssign = async (student: any) => {
    setSelectedStudent(student);

    const { data, error } = await supabase
      .from("student_grade_access")
      .select("grade")
      .eq("student_id", student.id);

    if (error) {
      alert("Failed to load student access");
      return;
    }

    setSelectedGrades(data?.map((item) => item.grade) || []);
  };

  const toggleGrade = (grade: string) => {
    setSelectedGrades((prev) =>
      prev.includes(grade)
        ? prev.filter((g) => g !== grade)
        : [...prev, grade]
    );
  };

  const saveAccess = async () => {
    if (!selectedStudent) return;

    const { error: deleteError } = await supabase
      .from("student_grade_access")
      .delete()
      .eq("student_id", selectedStudent.id);

    if (deleteError) {
      alert("Failed to clear old access");
      return;
    }

    if (selectedGrades.length > 0) {
      const payload = selectedGrades.map((grade) => ({
        student_id: selectedStudent.id,
        grade,
      }));

      const { error: insertError } = await supabase
        .from("student_grade_access")
        .insert(payload);

      if (insertError) {
        alert("Failed to save access");
        return;
      }
    }

    alert("Student access saved");
    setSelectedStudent(null);
    setSelectedGrades([]);
  };

  const updateUserStatus = async (userId: string, nextStatus: boolean) => {
    const action = nextStatus ? "enable" : "disable";

    if (!confirm(`Are you sure you want to ${action} this account?`)) return;

    const { error } = await supabase
      .from("profiles")
      .update({ is_active: nextStatus })
      .eq("id", userId);

    if (error) {
      alert(`Failed to ${action} user`);
      return;
    }

    await fetchUsers();
  };

  const updateAnswerVisibility = async (
    userId: string,
    canViewAnswers: boolean
  ) => {
    const { error } = await supabase
      .from("profiles")
      .update({ can_view_answers: canViewAnswers })
      .eq("id", userId);

    if (error) {
      alert("Failed to update answer visibility");
      return;
    }

    await fetchUsers();
  };

  const connectTutorStudent = async () => {
    if (!selectedTutorId || !selectedStudentIdForTutor) {
      alert("Select tutor and student first");
      return;
    }

    const { error } = await supabase.from("tutor_student_links").insert({
      tutor_id: selectedTutorId,
      student_id: selectedStudentIdForTutor,
    });

    if (error) {
      alert("Failed to connect tutor and student. This connection may already exist.");
      return;
    }

    alert("Tutor connected to student");
    setSelectedTutorId("");
    setSelectedStudentIdForTutor("");
    fetchLinks();
  };

  const removeTutorStudentLink = async (linkId: string) => {
    if (!confirm("Remove this tutor-student connection?")) return;

    const { error } = await supabase
      .from("tutor_student_links")
      .delete()
      .eq("id", linkId);

    if (error) {
      alert("Failed to remove connection");
      return;
    }

    fetchLinks();
  };

  const getStudentName = (id: string) =>
    students.find((s) => s.id === id)?.name || "Unknown student";

  const getTutorName = (id: string) =>
    tutors.find((t) => t.id === id)?.name || "Unknown tutor";

  if (selectedStudent) {
    return (
      <div className="min-h-screen bg-background">
        <div className="px-4 py-8 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-4xl space-y-8">
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl"
              onClick={() => setSelectedStudent(null)}
            >
              ← Back
            </Button>

            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-accent">
                Student Access
              </p>

              <h1 className="font-serif text-3xl text-primary sm:text-5xl">
                {selectedStudent.name}
              </h1>

              <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                Choose which grade levels this student can access.
              </p>
            </div>

            <Card className="space-y-6 rounded-[1.8rem] p-5 sm:p-6">
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {GRADES.map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => toggleGrade(grade)}
                    className={`rounded-2xl border p-4 text-center text-sm transition ${
                      selectedGrades.includes(grade)
                        ? "bg-yellow-400 text-black"
                        : "bg-card hover:bg-secondary"
                    }`}
                  >
                    {grade}
                  </button>
                ))}
              </div>

              <Button
                type="button"
                className="h-12 w-full rounded-2xl"
                onClick={saveAccess}
              >
                Save Access
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-8 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-7xl space-y-10">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-accent">
              Admin Configure
            </p>

            <h1 className="font-serif text-3xl text-primary sm:text-5xl">
              Admin Configure
            </h1>

            <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
              Manage invite codes, students, tutors, access, and tutor-student
              connections.
            </p>
          </div>

          <div className="grid gap-3 sm:flex sm:flex-wrap">
            <Button
              type="button"
              className="w-full rounded-2xl sm:w-auto"
              variant={activeTab === "student" ? "default" : "outline"}
              onClick={() => setActiveTab("student")}
            >
              Student
            </Button>

            <Button
              type="button"
              className="w-full rounded-2xl sm:w-auto"
              variant={activeTab === "tutor" ? "default" : "outline"}
              onClick={() => setActiveTab("tutor")}
            >
              Tutor
            </Button>

            <Button
              type="button"
              className="w-full rounded-2xl sm:w-auto"
              variant={activeTab === "connect" ? "default" : "outline"}
              onClick={() => setActiveTab("connect")}
            >
              Connect Tutor to Student
            </Button>
          </div>

          {activeTab === "student" && (
            <>
              <InviteCodeCard
                title="Student Invite Code"
                description="Generate a one-time registration code for a student."
                code={studentCode}
                onGenerate={() => generateInviteCode("student")}
                onCopy={() => copyCode(studentCode)}
              />

              <div>
                <h2 className="mb-4 text-xl font-semibold text-primary sm:text-2xl">
                  Student Management
                </h2>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
                  {students.map((student) => (
                    <Card
                      key={student.id}
                      className="space-y-4 rounded-[1.8rem] p-5 sm:p-6"
                    >
                      <div>
                        <h3 className="text-xl font-semibold text-primary">
                          {student.name}
                        </h3>

                        <p className="text-sm capitalize text-muted-foreground">
                          Student ·{" "}
                          {student.is_active === false ? "Inactive" : "Active"}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          Answer View:{" "}
                          <span
                            className={
                              student.can_view_answers
                                ? "font-semibold text-green-700"
                                : "font-semibold text-red-700"
                            }
                          >
                            {student.can_view_answers ? "Enabled" : "Disabled"}
                          </span>
                        </p>
                      </div>

                      <Button
                        type="button"
                        className="w-full rounded-2xl"
                        onClick={() => openAssign(student)}
                      >
                        Assign Student Access
                      </Button>

                      <Button
                        type="button"
                        variant={student.can_view_answers ? "outline" : "secondary"}
                        className="w-full rounded-2xl"
                        onClick={() =>
                          updateAnswerVisibility(
                            student.id,
                            !student.can_view_answers
                          )
                        }
                      >
                        {student.can_view_answers
                          ? "Disable Answer View"
                          : "Enable Answer View"}
                      </Button>

                      <Button
                        type="button"
                        variant={
                          student.is_active === false ? "outline" : "destructive"
                        }
                        className="w-full rounded-2xl"
                        onClick={() =>
                          updateUserStatus(
                            student.id,
                            student.is_active === false
                          )
                        }
                      >
                        {student.is_active === false
                          ? "Enable Student"
                          : "Disable Student"}
                      </Button>
                    </Card>
                  ))}
                </div>

                {students.length === 0 && (
                  <Card className="rounded-[1.8rem] p-6 text-center text-sm leading-7 text-muted-foreground sm:p-8 sm:text-base">
                    No students found.
                  </Card>
                )}
              </div>
            </>
          )}

          {activeTab === "tutor" && (
            <>
              <InviteCodeCard
                title="Tutor Invite Code"
                description="Generate a one-time registration code for a tutor."
                code={tutorCode}
                onGenerate={() => generateInviteCode("tutor")}
                onCopy={() => copyCode(tutorCode)}
              />

              <div>
                <h2 className="mb-4 text-xl font-semibold text-primary sm:text-2xl">
                  Tutor Management
                </h2>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
                  {tutors.map((tutor) => {
                    const tutorLinks = links.filter(
                      (l) => l.tutor_id === tutor.id
                    );

                    return (
                      <Card
                        key={tutor.id}
                        className="space-y-4 rounded-[1.8rem] p-5 sm:p-6"
                      >
                        <div>
                          <h3 className="text-xl font-semibold text-primary">
                            {tutor.name}
                          </h3>

                          <p className="text-sm capitalize text-muted-foreground">
                            {tutor.role} ·{" "}
                            {tutor.is_active === false ? "Inactive" : "Active"}
                          </p>
                        </div>

                        <div>
                          <p className="mb-2 text-sm font-semibold">
                            Connected Students
                          </p>

                          {tutorLinks.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              No students connected.
                            </p>
                          ) : (
                            <div className="space-y-1">
                              {tutorLinks.map((link) => (
                                <p key={link.id} className="text-sm">
                                  - {getStudentName(link.student_id)}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>

                        <Button
                          type="button"
                          variant={
                            tutor.is_active === false ? "outline" : "destructive"
                          }
                          className="w-full rounded-2xl"
                          onClick={() =>
                            updateUserStatus(tutor.id, tutor.is_active === false)
                          }
                        >
                          {tutor.is_active === false
                            ? "Enable Tutor"
                            : "Disable Tutor"}
                        </Button>
                      </Card>
                    );
                  })}
                </div>

                {tutors.length === 0 && (
                  <Card className="rounded-[1.8rem] p-6 text-center text-sm leading-7 text-muted-foreground sm:p-8 sm:text-base">
                    No tutors found.
                  </Card>
                )}
              </div>
            </>
          )}

          {activeTab === "connect" && (
            <Card className="space-y-5 rounded-[1.8rem] p-5 sm:p-6">
              <h2 className="text-xl font-semibold text-primary sm:text-2xl">
                Connect Tutor to Student
              </h2>

              <p className="text-sm text-muted-foreground">
                Assign which students each tutor can manage.
              </p>

              <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
                <select
                  className="w-full rounded-2xl border bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  value={selectedTutorId}
                  onChange={(e) => setSelectedTutorId(e.target.value)}
                >
                  <option value="">Select Tutor</option>
                  {tutors
                    .filter((t) => t.is_active !== false)
                    .map((tutor) => (
                      <option key={tutor.id} value={tutor.id}>
                        {tutor.name}
                      </option>
                    ))}
                </select>

                <select
                  className="w-full rounded-2xl border bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  value={selectedStudentIdForTutor}
                  onChange={(e) => setSelectedStudentIdForTutor(e.target.value)}
                >
                  <option value="">Select Student</option>
                  {students
                    .filter((s) => s.is_active !== false)
                    .map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name}
                      </option>
                    ))}
                </select>

                <Button
                  type="button"
                  className="h-12 w-full rounded-2xl lg:w-auto"
                  onClick={connectTutorStudent}
                >
                  Connect
                </Button>
              </div>

              <div className="space-y-2">
                {links.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No tutor-student connections yet.
                  </p>
                ) : (
                  links.map((link) => (
                    <div
                      key={link.id}
                      className="flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <p className="text-sm leading-7">
                        <strong>{getTutorName(link.tutor_id)}</strong> manages{" "}
                        <strong>{getStudentName(link.student_id)}</strong>
                      </p>

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full rounded-2xl sm:w-auto"
                        onClick={() => removeTutorStudentLink(link.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

function InviteCodeCard({
  title,
  description,
  code,
  onGenerate,
  onCopy,
}: {
  title: string;
  description: string;
  code: string;
  onGenerate: () => void;
  onCopy: () => void;
}) {
  return (
    <Card className="space-y-4 rounded-[1.8rem] p-5 sm:p-6">
      <h2 className="text-xl font-semibold text-primary">{title}</h2>

      <p className="text-sm text-muted-foreground">{description}</p>

      <Button
        type="button"
        className="w-full rounded-2xl sm:w-auto"
        onClick={onGenerate}
      >
        Generate Code
      </Button>

      {code && (
        <div className="rounded-2xl border bg-secondary p-4">
          <p className="text-sm text-muted-foreground">Latest code</p>

          <p className="mt-1 break-all text-xl font-bold tracking-widest sm:text-2xl">
            {code}
          </p>

          <Button
            type="button"
            className="mt-3 w-full rounded-2xl sm:w-auto"
            variant="outline"
            onClick={onCopy}
          >
            Copy Code
          </Button>
        </div>
      )}
    </Card>
  );
}

export default AdminAssign;