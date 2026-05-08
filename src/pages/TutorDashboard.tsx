import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

const TIME_FILTERS = [
  { label: "All", value: "all" },
  { label: "Past 24h", value: "24h" },
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
];

const TutorDashboard = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const [attempts, setAttempts] = useState<any[]>([]);
  const [accuracy, setAccuracy] = useState(0);
  const [total, setTotal] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [stats, setStats] = useState<any>({});

  const [feedbackText, setFeedbackText] = useState("");
  const [latestFeedback, setLatestFeedback] = useState<any | null>(null);

  const [timeFilter, setTimeFilter] = useState("7d");
  const [gradeFilter, setGradeFilter] = useState("All");
  const [skillFilter, setSkillFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");

  useEffect(() => {
    fetchAssignedStudents();
  }, []);

  useEffect(() => {
    if (selectedStudentId) {
      fetchStudentAttempts(selectedStudentId);
      fetchLatestFeedback(selectedStudentId);
    }
  }, [selectedStudentId]);

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

    if (!links || links.length === 0) {
      setStudents([]);
      setSelectedStudentId("");
      return;
    }

    const studentIds = links.map((link) => link.student_id);

    const { data: studentData, error: studentError } = await supabase
      .from("profiles")
      .select("id, name, role, is_active")
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
    } else {
      setSelectedStudentId("");
    }
  };

  const fetchStudentAttempts = async (studentId: string) => {
    const { data, error } = await supabase
      .from("attempts")
      .select("*, questions(*)")
      .eq("user_id", studentId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert("Failed to load student attempts.");
      return;
    }

    const allAttempts = data || [];
    setAttempts(allAttempts);

    const correct = allAttempts.filter((a) => a.is_correct).length;
    const wrong = allAttempts.length - correct;

    setTotal(allAttempts.length);
    setMistakes(wrong);
    setAccuracy(
      allAttempts.length === 0
        ? 0
        : Math.round((correct / allAttempts.length) * 100)
    );

    const skillCount: any = {};
    allAttempts.forEach((a) => {
      if (!a.is_correct) {
        const skill = a.questions?.skill || "Other";
        skillCount[skill] = (skillCount[skill] || 0) + 1;
      }
    });

    setStats(skillCount);
  };

  const fetchLatestFeedback = async (studentId: string) => {
    const { data: userData } = await supabase.auth.getUser();
    const tutor = userData.user;
    if (!tutor) return;

    const { data, error } = await supabase
      .from("tutor_feedback")
      .select("*")
      .eq("tutor_id", tutor.id)
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Feedback fetch error:", error);
      return;
    }

    setLatestFeedback(data || null);
  };

  const submitFeedback = async () => {
    if (!selectedStudentId) {
      alert("Please select a student first.");
      return;
    }

    if (!feedbackText.trim()) {
      alert("Please write feedback first.");
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const tutor = userData.user;
    if (!tutor) return;

    const { error } = await supabase.from("tutor_feedback").insert({
      tutor_id: tutor.id,
      student_id: selectedStudentId,
      message: feedbackText.trim(),
    });

    if (error) {
      console.error(error);
      alert("Failed to post feedback.");
      return;
    }

    alert("Feedback posted.");
    setFeedbackText("");
    fetchLatestFeedback(selectedStudentId);
  };

  const getCorrectAnswerText = (q: any) => {
    if (!q) return "";
    if (q.correct_answer === "option_a") return q.option_a;
    if (q.correct_answer === "option_b") return q.option_b;
    if (q.correct_answer === "option_c") return q.option_c;
    if (q.correct_answer === "option_d") return q.option_d;
    return q.correct_answer;
  };

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  const grades = useMemo(() => {
    return [
      "All",
      ...new Set(
        attempts.map((a) => a.questions?.grade).filter(Boolean)
      ),
    ];
  }, [attempts]);

  const skills = useMemo(() => {
    return [
      "All",
      ...new Set(
        attempts.map((a) => a.questions?.skill).filter(Boolean)
      ),
    ];
  }, [attempts]);

  const difficulties = useMemo(() => {
    return [
      "All",
      ...new Set(
        attempts.map((a) => a.questions?.difficulty).filter(Boolean)
      ),
    ];
  }, [attempts]);

  const filteredAttempts = useMemo(() => {
    const now = new Date();

    return attempts.filter((attempt) => {
      const q = attempt.questions;

      const matchesGrade =
        gradeFilter === "All" || q?.grade === gradeFilter;

      const matchesSkill =
        skillFilter === "All" || q?.skill === skillFilter;

      const matchesDifficulty =
        difficultyFilter === "All" || q?.difficulty === difficultyFilter;

      let matchesTime = true;

      if (timeFilter !== "all") {
        const attemptDate = new Date(attempt.created_at);
        const diffHours =
          (now.getTime() - attemptDate.getTime()) / (1000 * 60 * 60);

        if (timeFilter === "24h") matchesTime = diffHours <= 24;
        if (timeFilter === "7d") matchesTime = diffHours <= 24 * 7;
        if (timeFilter === "30d") matchesTime = diffHours <= 24 * 30;
      }

      return (
        matchesGrade &&
        matchesSkill &&
        matchesDifficulty &&
        matchesTime
      );
    });
  }, [attempts, gradeFilter, skillFilter, difficultyFilter, timeFilter]);

  const filteredWrongAttempts = filteredAttempts.filter((a) => !a.is_correct);

  const weakestSkill =
    Object.entries(stats).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] ||
    "practice";

  return (
    <div className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-3xl border bg-card p-8 shadow-soft">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-accent">
            Tutor Dashboard
          </p>

          <h1 className="font-serif text-5xl text-primary">
            Student Mistake Review
          </h1>

          <p className="mt-3 max-w-2xl text-muted-foreground">
            Review assigned students, check mistakes, and post feedback to their dashboard.
          </p>
        </div>

        <div className="rounded-3xl border bg-card p-6 shadow-soft">
          <label className="mb-2 block text-sm font-semibold text-primary">
            Select Student
          </label>

          <select
            className="w-full rounded-xl border bg-white p-3"
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
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

          {students.length === 0 && (
            <p className="mt-3 text-sm text-muted-foreground">
              No students assigned yet. Admin needs to connect students to this tutor.
            </p>
          )}
        </div>

        {selectedStudent && (
          <>
            <div className="grid gap-5 md:grid-cols-4">
              <div className="rounded-2xl border bg-card p-6 shadow-soft">
                <p className="text-sm text-muted-foreground">Student</p>
                <p className="mt-3 text-2xl font-bold text-primary">
                  {selectedStudent.name}
                </p>
              </div>

              <div className="rounded-2xl border bg-card p-6 shadow-soft">
                <p className="text-sm text-muted-foreground">Total Attempts</p>
                <p className="mt-3 text-4xl font-bold text-primary">{total}</p>
              </div>

              <div className="rounded-2xl border bg-card p-6 shadow-soft">
                <p className="text-sm text-muted-foreground">Accuracy</p>
                <p className="mt-3 text-4xl font-bold text-primary">
                  {accuracy}%
                </p>
              </div>

              <div className="rounded-2xl border bg-card p-6 shadow-soft">
                <p className="text-sm text-muted-foreground">Mistakes</p>
                <p className="mt-3 text-4xl font-bold text-red-600">
                  {mistakes}
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border bg-card p-7 shadow-soft">
                <h2 className="font-serif text-3xl text-primary">
                  Weak Areas
                </h2>

                <div className="mt-6 space-y-4">
                  {Object.keys(stats).length === 0 ? (
                    <p className="text-muted-foreground">
                      No weak areas yet.
                    </p>
                  ) : (
                    Object.entries(stats).map(([skill, count]: any) => (
                      <div key={skill}>
                        <div className="mb-2 flex justify-between text-sm">
                          <span className="font-medium">{skill}</span>
                          <span>{count} mistakes</span>
                        </div>

                        <div className="h-2 rounded-full bg-secondary">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{
                              width: `${Math.min(Number(count) * 20, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-3xl border bg-card p-7 shadow-soft">
                <h2 className="font-serif text-3xl text-primary">
                  Tutor Feedback
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  Write feedback that will appear on the student's dashboard.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setFeedbackText(
                        `Please focus more on ${weakestSkill}. Review your mistakes carefully before moving to new questions.`
                      )
                    }
                  >
                    Weak Area Template
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() =>
                      setFeedbackText(
                        "Good effort. Please continue practising regularly and review your incorrect answers before the next lesson."
                      )
                    }
                  >
                    General Template
                  </Button>
                </div>

                <textarea
                  className="mt-5 min-h-[140px] w-full rounded-2xl border bg-white p-4 text-sm outline-none"
                  placeholder="Write feedback for this student..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                />

                <Button className="mt-4 w-full" onClick={submitFeedback}>
                  Post Feedback
                </Button>

                {latestFeedback && (
                  <div className="mt-5 rounded-2xl bg-secondary/60 p-5">
                    <p className="text-sm font-semibold text-primary">
                      Latest Feedback
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {latestFeedback.message}
                    </p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Posted on{" "}
                      {new Date(latestFeedback.created_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border bg-card p-7 shadow-soft">
              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="font-serif text-3xl text-primary">
                    Mistake List
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Only incorrect attempts are shown here.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <select
                    className="rounded-xl border bg-white p-3 text-sm"
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                  >
                    {TIME_FILTERS.map((filter) => (
                      <option key={filter.value} value={filter.value}>
                        {filter.label}
                      </option>
                    ))}
                  </select>

                  <select
                    className="rounded-xl border bg-white p-3 text-sm"
                    value={gradeFilter}
                    onChange={(e) => setGradeFilter(e.target.value)}
                  >
                    {grades.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>

                  <select
                    className="rounded-xl border bg-white p-3 text-sm"
                    value={skillFilter}
                    onChange={(e) => setSkillFilter(e.target.value)}
                  >
                    {skills.map((skill) => (
                      <option key={skill} value={skill}>
                        {skill}
                      </option>
                    ))}
                  </select>

                  <select
                    className="rounded-xl border bg-white p-3 text-sm"
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                  >
                    {difficulties.map((difficulty) => (
                      <option key={difficulty} value={difficulty}>
                        {difficulty}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4 text-sm text-muted-foreground">
                Showing {filteredWrongAttempts.length} mistakes from{" "}
                {filteredAttempts.length} filtered attempts.
              </div>

              <div className="space-y-5">
                {filteredWrongAttempts.length === 0 ? (
                  <p className="text-muted-foreground">
                    No mistakes found for this filter.
                  </p>
                ) : (
                  filteredWrongAttempts.slice(0, 5).map((attempt, index) => {
                    const q = attempt.questions;
                    const correctText = getCorrectAnswerText(q);

                    return (
                      <div
                        key={attempt.id}
                        className="rounded-2xl border bg-background p-5"
                      >
                        <div className="mb-3 flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full bg-secondary px-3 py-1">
                            {q?.exam_type}
                          </span>
                          <span className="rounded-full bg-secondary px-3 py-1">
                            {q?.grade}
                          </span>
                          <span className="rounded-full bg-secondary px-3 py-1">
                            {q?.skill}
                          </span>
                          <span className="rounded-full bg-secondary px-3 py-1">
                            {q?.difficulty}
                          </span>
                          <span className="rounded-full bg-secondary px-3 py-1">
                            {new Date(attempt.created_at).toLocaleString()}
                          </span>
                        </div>

                        {q?.passage && (
                          <div className="mb-4 rounded-xl border bg-white p-4">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">
                              Passage
                            </p>
                            <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">
                              {q.passage}
                            </p>
                          </div>
                        )}

                        <p className="font-semibold text-primary">
                          {index + 1}. {q?.question_text}
                        </p>

                        <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                          <p>A. {q?.option_a}</p>
                          <p>B. {q?.option_b}</p>
                          <p>C. {q?.option_c}</p>
                          <p>D. {q?.option_d}</p>
                        </div>

                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            Student answer: {attempt.selected_answer}
                          </div>

                          <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                            Correct answer: {correctText}
                          </div>
                        </div>

                        {q?.explanation && (
                          <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            Explanation: {q.explanation}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
    
  );
};

export default TutorDashboard;