import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

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
  <div className="min-h-screen overflow-hidden bg-[#fbfaff] px-4 py-6 sm:px-6 sm:py-12">
    <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_15%,#f0eaff_0%,transparent_28%),radial-gradient(circle_at_85%_75%,#fff1bd_0%,transparent_28%)]" />

    <div className="relative z-10 mx-auto max-w-[1350px] space-y-6 sm:space-y-8">
      {/* HERO */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="overflow-hidden rounded-[2rem] bg-white/90 p-5 shadow-[0_25px_80px_rgba(66,56,120,0.12)] backdrop-blur-xl sm:rounded-[3rem] sm:p-10"
      >
        <p className="text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]">
          Tutor Dashboard
        </p>

        <h1 className="mt-4 font-poppins text-3xl font-black leading-tight text-primary min-[390px]:text-4xl sm:text-6xl">
          Student mistake<br />
          review center.
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-8 text-primary/60">
          Review student performance, identify weak areas, and send clear feedback after practice.
        </p>
      </motion.div>

      {/* STUDENT SELECT */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-[1.7rem] bg-white/90 p-5 shadow-[0_18px_55px_rgba(66,56,120,0.09)] backdrop-blur-xl sm:rounded-[2.2rem] sm:p-6"
      >
        <label className="mb-3 block text-sm font-black text-primary">
          Select Student
        </label>

        <select
          className="h-14 w-full rounded-2xl border border-primary/10 bg-[#fbfaff] px-5 text-base outline-none transition focus:border-[#8d73ff] focus:ring-4 focus:ring-[#8d73ff]/10"
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
        >
          {students.length === 0 && <option value="">No assigned students</option>}

          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name || student.id}
              {student.is_active === false ? " (Inactive)" : ""}
            </option>
          ))}
        </select>
      </motion.div>

      {selectedStudent && (
        <>
          {/* STATS */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Student", selectedStudent.name],
              ["Total Attempts", total],
              ["Accuracy", `${accuracy}%`],
              ["Mistakes", mistakes],
            ].map(([label, value], i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -8, rotate: i % 2 === 0 ? -1.5 : 1.5 }}
                className="rounded-[1.6rem] bg-white/95 p-5 shadow-[0_18px_55px_rgba(66,56,120,0.09)] backdrop-blur-xl sm:rounded-[2rem] sm:p-6"
              >
                <p className="text-sm font-bold text-primary/45">{label}</p>
                <p
                  className={`mt-3 font-poppins text-3xl font-black ${
                    label === "Mistakes" ? "text-red-500" : "text-primary"
                  }`}
                >
                  {value}
                </p>
              </motion.div>
            ))}
          </div>

          {/* WEAK AREAS + FEEDBACK */}
          <div className="grid gap-6 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -35 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              className="rounded-[1.8rem] bg-white/95 p-5 shadow-[0_22px_65px_rgba(66,56,120,0.10)] backdrop-blur-xl sm:rounded-[2.5rem] sm:p-7"
            >
              <h2 className="font-poppins text-2xl font-black text-primary sm:text-3xl">
                Weak Areas
              </h2>

              <div className="mt-7 space-y-5">
                {Object.keys(stats).length === 0 ? (
                  <p className="text-primary/50">No weak areas yet.</p>
                ) : (
                  Object.entries(stats).map(([skill, count]: any, i) => (
                    <div key={skill}>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="font-bold text-primary">{skill}</span>
                        <span className="text-primary/50">{count} mistakes</span>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-[#eee9ff]">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{
                            width: `${Math.min(Number(count) * 20, 100)}%`,
                          }}
                          viewport={{ once: false }}
                          transition={{ duration: 0.8, delay: i * 0.08 }}
                          className="h-full rounded-full bg-[#8d73ff]"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 35 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              className="rounded-[1.8rem] bg-white/95 p-5 shadow-[0_22px_65px_rgba(66,56,120,0.10)] backdrop-blur-xl sm:rounded-[2.5rem] sm:p-7"
            >
              <h2 className="font-poppins text-2xl font-black text-primary sm:text-3xl">
                Tutor Feedback
              </h2>

              <p className="mt-2 text-sm text-primary/55">
                Write feedback that will appear on the student dashboard.
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button
                  variant="outline"
                  className="min-h-11 rounded-2xl"
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
                  className="min-h-11 rounded-2xl"
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
                className="mt-5 min-h-[150px] w-full resize-none rounded-[1.6rem] border border-primary/10 bg-[#fbfaff] px-5 py-4 outline-none transition focus:border-[#8d73ff] focus:ring-4 focus:ring-[#8d73ff]/10"
                placeholder="Write feedback for this student..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
              />

              <Button
                className="mt-4 min-h-11 w-full rounded-2xl bg-[#8d73ff] py-3 font-bold"
                onClick={submitFeedback}
              >
                Post Feedback
              </Button>

              {latestFeedback && (
                <div className="mt-5 rounded-2xl bg-[#fbfaff] p-5">
                  <p className="text-sm font-black text-primary">
                    Latest Feedback
                  </p>
                  <p className="mt-2 text-sm leading-7 text-primary/60">
                    {latestFeedback.message}
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* MISTAKE LIST */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            className="rounded-[1.8rem] bg-white/95 p-5 shadow-[0_25px_80px_rgba(66,56,120,0.10)] backdrop-blur-xl sm:rounded-[2.5rem] sm:p-7"
          >
            <div className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h2 className="font-poppins text-2xl font-black text-primary sm:text-3xl">
                  Mistake List
                </h2>
                <p className="mt-2 text-sm text-primary/55">
                  Showing {filteredWrongAttempts.length} mistakes from{" "}
                  {filteredAttempts.length} filtered attempts.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  [timeFilter, setTimeFilter, TIME_FILTERS.map((f) => [f.value, f.label])],
                  [gradeFilter, setGradeFilter, grades.map((g) => [g, g])],
                  [skillFilter, setSkillFilter, skills.map((s) => [s, s])],
                  [difficultyFilter, setDifficultyFilter, difficulties.map((d) => [d, d])],
                ].map(([value, setter, options]: any, i) => (
                  <select
                    key={i}
                    className="h-12 rounded-2xl border border-primary/10 bg-[#fbfaff] px-4 text-sm outline-none focus:border-[#8d73ff] focus:ring-4 focus:ring-[#8d73ff]/10"
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                  >
                    {options.map(([v, label]: any) => (
                      <option key={v} value={v}>
                        {label}
                      </option>
                    ))}
                  </select>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              {filteredWrongAttempts.length === 0 ? (
                <p className="text-primary/50">No mistakes found for this filter.</p>
              ) : (
                filteredWrongAttempts.slice(0, 5).map((attempt, index) => {
                  const q = attempt.questions;
                  const correctText = getCorrectAnswerText(q);

                  return (
                    <motion.div
                      key={attempt.id}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false }}
                      transition={{ delay: index * 0.06 }}
                      whileHover={{ y: -5 }}
                      className="rounded-[2rem] bg-[#fbfaff] p-5 shadow-[0_12px_35px_rgba(66,56,120,0.06)]"
                    >
                      <div className="mb-4 flex flex-wrap gap-2 text-xs">
                        {[q?.exam_type, q?.grade, q?.skill, q?.difficulty].map(
                          (tag) =>
                            tag && (
                              <span
                                key={tag}
                                className="rounded-full bg-white px-3 py-1 font-bold text-primary/60"
                              >
                                {tag}
                              </span>
                            )
                        )}
                      </div>

                      <p className="font-bold leading-7 text-primary">
                        {index + 1}. {q?.question_text}
                      </p>

                      <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                        <p>A. {q?.option_a}</p>
                        <p>B. {q?.option_b}</p>
                        <p>C. {q?.option_c}</p>
                        <p>D. {q?.option_d}</p>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
                          Student answer: {attempt.selected_answer}
                        </div>

                        <div className="rounded-2xl bg-green-50 p-4 text-sm text-green-700">
                          Correct answer: {correctText}
                        </div>
                      </div>

                      {q?.explanation && (
                        <p className="mt-4 text-sm leading-7 text-primary/55">
                          Explanation: {q.explanation}
                        </p>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </div>
  </div>
);
};

export default TutorDashboard;
