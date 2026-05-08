import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Footer from "@/components/Footer";


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
      console.error("Student fetch error:", studentError);
      alert(studentError.message);
      return;
    }

    const { data: tutorData, error: tutorError } = await supabase
      .from("profiles")
      .select("id, name, role, is_active")
      .eq("role", "tutor")
      .order("created_at", { ascending: false });

    if (tutorError) {
      console.error("Tutor fetch error:", tutorError);
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

    if (error) {
      console.error("Tutor-student links fetch error:", error);
      return;
    }

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
      console.error(error);
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
      console.error(error);
      alert("Failed to load student access");
      return;
    }

    setSelectedGrades(data?.map((item) => item.grade) || []);
  };

  const toggleGrade = (grade: string) => {
    if (selectedGrades.includes(grade)) {
      setSelectedGrades(selectedGrades.filter((g) => g !== grade));
    } else {
      setSelectedGrades([...selectedGrades, grade]);
    }
  };

  const saveAccess = async () => {
    if (!selectedStudent) return;

    const { error: deleteError } = await supabase
      .from("student_grade_access")
      .delete()
      .eq("student_id", selectedStudent.id);

    if (deleteError) {
      console.error(deleteError);
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
        console.error(insertError);
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
      console.error(error);
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
      console.error(error);
      alert("Failed to update answer visibility");
      return;
    }

    alert(
      canViewAnswers
        ? "Student can now view answers."
        : "Student can no longer view answers."
    );

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
      console.error(error);
      alert(
        "Failed to connect tutor and student. This connection may already exist."
      );
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
      console.error(error);
      alert("Failed to remove connection");
      return;
    }

    fetchLinks();
  };

  const getStudentName = (id: string) => {
    return students.find((s) => s.id === id)?.name || "Unknown student";
  };

  const getTutorName = (id: string) => {
    return tutors.find((t) => t.id === id)?.name || "Unknown tutor";
  };

  if (selectedStudent) {
    return (
      <div className="min-h-screen bg-background">
        

        <div className="px-6 py-20">
          <div className="mx-auto max-w-4xl space-y-8">
            <Button variant="outline" onClick={() => setSelectedStudent(null)}>
              ← Back
            </Button>

            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-accent">
                Student Access
              </p>
              <h1 className="font-serif text-5xl text-primary">
                {selectedStudent.name}
              </h1>
              <p className="mt-3 text-muted-foreground">
                Choose which grade levels this student can access.
              </p>
            </div>

            <Card className="space-y-6 p-6">
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {GRADES.map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => toggleGrade(grade)}
                    className={`rounded-lg border p-4 text-center transition ${
                      selectedGrades.includes(grade)
                        ? "bg-yellow-400 text-black"
                        : "bg-card hover:bg-secondary"
                    }`}
                  >
                    {grade}
                  </button>
                ))}
              </div>

              <Button className="h-12 w-full" onClick={saveAccess}>
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

      <div className="px-6 py-20">
        <div className="mx-auto max-w-7xl space-y-10">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-accent">
              Admin Configure
            </p>

            <h1 className="font-serif text-5xl text-primary">
              Admin Configure
            </h1>

            <p className="mt-3 text-muted-foreground">
              Manage invite codes, students, tutors, access, and tutor-student
              connections.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant={activeTab === "student" ? "default" : "outline"}
              onClick={() => setActiveTab("student")}
            >
              Student
            </Button>

            <Button
              variant={activeTab === "tutor" ? "default" : "outline"}
              onClick={() => setActiveTab("tutor")}
            >
              Tutor
            </Button>

            <Button
              variant={activeTab === "connect" ? "default" : "outline"}
              onClick={() => setActiveTab("connect")}
            >
              Connect Tutor to Student
            </Button>
          </div>

          {activeTab === "student" && (
            <>
              <Card className="space-y-4 p-6">
                <h2 className="text-xl font-semibold text-primary">
                  Student Invite Code
                </h2>
                <p className="text-sm text-muted-foreground">
                  Generate a one-time registration code for a student.
                </p>

                <Button onClick={() => generateInviteCode("student")}>
                  Generate Student Code
                </Button>

                {studentCode && (
                  <div className="rounded-xl border bg-secondary p-4">
                    <p className="text-sm text-muted-foreground">Latest code</p>
                    <p className="mt-1 text-2xl font-bold tracking-widest">
                      {studentCode}
                    </p>
                    <Button
                      className="mt-3"
                      variant="outline"
                      onClick={() => copyCode(studentCode)}
                    >
                      Copy Code
                    </Button>
                  </div>
                )}
              </Card>

              <div>
                <h2 className="mb-4 text-2xl font-semibold text-primary">
                  Student Management
                </h2>

                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {students.map((student) => (
                    <Card key={student.id} className="space-y-4 p-6">
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
                        className="w-full"
                        onClick={() => openAssign(student)}
                      >
                        Assign Student Access
                      </Button>

                      <Button
                        variant={
                          student.can_view_answers ? "outline" : "secondary"
                        }
                        className="w-full"
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
                        variant={
                          student.is_active === false
                            ? "outline"
                            : "destructive"
                        }
                        className="w-full"
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
                  <Card className="p-8 text-center text-muted-foreground">
                    No students found.
                  </Card>
                )}
              </div>
            </>
          )}

          {activeTab === "tutor" && (
            <>
              <Card className="space-y-4 p-6">
                <h2 className="text-xl font-semibold text-primary">
                  Tutor Invite Code
                </h2>
                <p className="text-sm text-muted-foreground">
                  Generate a one-time registration code for a tutor.
                </p>

                <Button onClick={() => generateInviteCode("tutor")}>
                  Generate Tutor Code
                </Button>

                {tutorCode && (
                  <div className="rounded-xl border bg-secondary p-4">
                    <p className="text-sm text-muted-foreground">Latest code</p>
                    <p className="mt-1 text-2xl font-bold tracking-widest">
                      {tutorCode}
                    </p>
                    <Button
                      className="mt-3"
                      variant="outline"
                      onClick={() => copyCode(tutorCode)}
                    >
                      Copy Code
                    </Button>
                  </div>
                )}
              </Card>

              <div>
                <h2 className="mb-4 text-2xl font-semibold text-primary">
                  Tutor Management
                </h2>

                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {tutors.map((tutor) => {
                    const tutorLinks = links.filter(
                      (l) => l.tutor_id === tutor.id
                    );

                    return (
                      <Card key={tutor.id} className="space-y-4 p-6">
                        <div>
                          <h3 className="text-xl font-semibold text-primary">
                            {tutor.name}
                          </h3>
                          <p className="text-sm capitalize text-muted-foreground">
                            {tutor.role} ·{" "}
                            {tutor.is_active === false
                              ? "Inactive"
                              : "Active"}
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
                          variant={
                            tutor.is_active === false
                              ? "outline"
                              : "destructive"
                          }
                          className="w-full"
                          onClick={() =>
                            updateUserStatus(
                              tutor.id,
                              tutor.is_active === false
                            )
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
                  <Card className="p-8 text-center text-muted-foreground">
                    No tutors found.
                  </Card>
                )}
              </div>
            </>
          )}

          {activeTab === "connect" && (
            <Card className="space-y-5 p-6">
              <h2 className="text-2xl font-semibold text-primary">
                Connect Tutor to Student
              </h2>

              <p className="text-sm text-muted-foreground">
                Assign which students each tutor can manage.
              </p>

              <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
                <select
                  className="rounded-lg border p-3"
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
                  className="rounded-lg border p-3"
                  value={selectedStudentIdForTutor}
                  onChange={(e) =>
                    setSelectedStudentIdForTutor(e.target.value)
                  }
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

                <Button onClick={connectTutorStudent}>Connect</Button>
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
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <p className="text-sm">
                        <strong>{getTutorName(link.tutor_id)}</strong> manages{" "}
                        <strong>{getStudentName(link.student_id)}</strong>
                      </p>

                      <Button
                        variant="outline"
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

export default AdminAssign;