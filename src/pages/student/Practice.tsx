import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Flame,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";

const DAILY_GOAL = 30;

const DIFFICULTIES = ["Easy", "Medium", "Hard", "Advanced"];

const SKILLS = [
  "Mix",
  "Vocabulary",
  "Reading Comprehension",
  "Main Idea",
  "Inference",
  "Detail Questions",
  "Grammar",
  "Math Problem Solving",
];

const shuffleArray = (array: any[]) => {
  return [...array].sort(() => Math.random() - 0.5);
};

const Practice = () => {
  const [allowedGrades, setAllowedGrades] = useState<string[]>([]);
  const [canViewAnswers, setCanViewAnswers] = useState(false);

  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Medium");
  const [selectedSkill, setSelectedSkill] = useState("Mix");

  const [questions, setQuestions] = useState<any[]>([]);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);

  const [attemptedCount, setAttemptedCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const fetchStats = async (userId: string) => {
    const { data } = await supabase
      .from("attempts")
      .select("id, is_correct")
      .eq("user_id", userId);

    const attempts = data || [];

    setAttemptedCount(attempts.length);
    setCorrectCount(attempts.filter((a) => a.is_correct).length);
  };

  useEffect(() => {
    const fetchAccess = async () => {
      setLoading(true);

      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("can_view_answers")
        .eq("id", user.id)
        .maybeSingle();

      setCanViewAnswers(profileData?.can_view_answers === true);

      const { data, error } = await supabase
        .from("student_grade_access")
        .select("grade")
        .eq("student_id", user.id);

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      const grades = data?.map((item) => item.grade) || [];
      setAllowedGrades(grades);

      if (grades.length > 0) setSelectedGrade(grades[0]);

      await fetchStats(user.id);

      setLoading(false);
    };

    fetchAccess();
  }, []);

  const getCorrectAnswerText = (q: any) => {
    if (!q) return "";

    if (q.correct_answer === "option_a") return q.option_a;
    if (q.correct_answer === "option_b") return q.option_b;
    if (q.correct_answer === "option_c") return q.option_c;
    if (q.correct_answer === "option_d") return q.option_d;

    return q.correct_answer;
  };

  const current = questions[currentIndex];

  const correctText = useMemo(() => getCorrectAnswerText(current), [current]);

  const isCorrect = selected === correctText;

  const accuracy =
    attemptedCount === 0
      ? 0
      : Math.round((correctCount / attemptedCount) * 100);

  const sessionProgress =
    questions.length === 0
      ? 0
      : Math.round(((currentIndex + 1) / questions.length) * 100);

  const startPractice = async () => {
    if (!selectedGrade) {
      alert("Please select a grade.");
      return;
    }

    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: correctAttempts } = await supabase
      .from("attempts")
      .select("question_id")
      .eq("user_id", user.id)
      .eq("is_correct", true);

    const completedCorrectIds = new Set(
      (correctAttempts || []).map((a) => a.question_id)
    );

    let query = supabase
      .from("questions")
      .select("*")
      .eq("grade", selectedGrade)
      .eq("difficulty", selectedDifficulty)
      .limit(200);

    if (selectedSkill !== "Mix") {
      query = query.eq("skill", selectedSkill);
    }

    const { data, error } = await query;

    if (error) {
      console.error(error);
      alert("Failed to load questions.");
      setLoading(false);
      return;
    }

    const availableQuestions = (data || []).filter(
      (q) => !completedCorrectIds.has(q.id)
    );

    const randomQuestions = shuffleArray(availableQuestions).slice(0, 20);

    if (randomQuestions.length === 0) {
      alert("No new questions available. You can reset progress to practise again.");
      setQuestions([]);
      setStarted(false);
      setLoading(false);
      return;
    }

    setQuestions(randomQuestions);
    setCurrentIndex(0);
    setSelected("");
    setShowFeedback(false);
    setStarted(true);
    setLoading(false);
  };

  const resetProgress = async () => {
    if (!confirm("Reset all practice records? Correct questions will appear again.")) {
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) return;

    const { error } = await supabase
      .from("attempts")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      alert("Failed to reset progress.");
      console.error(error);
      return;
    }

    setQuestions([]);
    setStarted(false);
    setCurrentIndex(0);
    setSelected("");
    setShowFeedback(false);
    setAttemptedCount(0);
    setCorrectCount(0);

    alert("Practice progress reset.");
  };

  const handleSubmit = () => {
    if (!selected) {
      alert("Please select an answer.");
      return;
    }

    setShowFeedback(true);
  };

  const handleNext = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user || !current) return;

    await supabase.from("attempts").insert({
      user_id: user.id,
      question_id: current.id,
      selected_answer: selected,
      is_correct: isCorrect,
    });

    await fetchStats(user.id);

    setSelected("");
    setShowFeedback(false);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      alert("Practice completed!");
      setStarted(false);
      setQuestions([]);
      setCurrentIndex(0);
    }
  };

  if (loading) {
    return (
      <Shell>
        <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-6 text-center shadow-[0_25px_80px_rgba(66,56,120,0.12)] sm:rounded-[2.5rem] sm:p-10">
          <div className="mx-auto mb-5 h-14 w-14 animate-spin rounded-full border-4 border-[#eee9ff] border-t-[#8d73ff]" />
          <p className="font-poppins text-xl font-black text-primary">
            Loading practice...
          </p>
        </div>
      </Shell>
    );
  }

  if (allowedGrades.length === 0) {
    return (
      <Shell>
        <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-6 text-center shadow-[0_25px_80px_rgba(66,56,120,0.12)] sm:rounded-[2.5rem] sm:p-10">
          <h1 className="font-poppins text-3xl font-black text-primary">
            No Practice Access Yet
          </h1>

          <p className="mt-3 text-primary/60">
            Your account does not have any grade access yet. Please contact admin.
          </p>
        </div>
      </Shell>
    );
  }

  if (!started) {
    return (
      <Shell>
        <div className="mx-auto max-w-[1180px] space-y-8">
          {/* HERO */}
          <section className="relative overflow-hidden rounded-[2rem] border border-[#eee8ff] bg-white p-5 shadow-[0_35px_120px_rgba(66,56,120,0.10)] sm:rounded-[3rem] sm:p-10">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#f0eaff]" />
            <div className="absolute bottom-[-80px] left-[-80px] h-56 w-56 rounded-full bg-[#fff1bd]/70" />

            <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-end">
              <div>
                <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]">
                  <Sparkles className="h-5 w-5" />
                  Practice Studio
                </p>

                <h1 className="mt-5 font-poppins text-[2.35rem] font-black leading-[1.04] tracking-[-0.025em] text-primary min-[390px]:text-[2.7rem] sm:text-[4.8rem] sm:leading-[0.95] lg:text-[5.5rem]">
                  Choose.
                  <br />
                  Practise.
                  <br />
                  Improve.
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-8 text-primary/60 sm:text-lg">
                  Select your grade, difficulty, and skill focus. Luna will give you a fresh practice set matched to your access.
                </p>
              </div>

              <motion.div
                whileHover={{ y: -8, rotate: 1.5 }}
                className="relative rounded-[1.6rem] bg-[#fbfaff] p-5 shadow-[0_18px_55px_rgba(66,56,120,0.09)] sm:rounded-[2.2rem] sm:p-6"
              >
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8d73ff]">
                  Your Progress
                </p>

                <div className="mt-5 space-y-4">
                  <MiniMetric label="Attempted" value={attemptedCount} />
                  <MiniMetric label="Correct" value={correctCount} />
                  <MiniMetric label="Accuracy" value={`${accuracy}%`} />
                </div>
              </motion.div>
            </div>
          </section>

          {/* STATS */}
          <div data-guide="practice-setup" className="grid gap-4 md:grid-cols-3">
            <StatCard
              index={0}
              icon={<BookOpen className="h-6 w-6" />}
              title="Attempted"
              value={attemptedCount}
            />

            <StatCard
              index={1}
              icon={<CheckCircle2 className="h-6 w-6" />}
              title="Correct"
              value={correctCount}
            />

            <StatCard
              index={2}
              icon={<BarChart3 className="h-6 w-6" />}
              title="Accuracy"
              value={`${accuracy}%`}
            />
          </div>

          {/* SETUP CARD */}
          <section
            data-guide="practice-actions"
            className="rounded-[2rem] bg-white p-5 shadow-[0_25px_80px_rgba(66,56,120,0.10)] sm:rounded-[2.5rem] sm:p-9"
          >
            <div className="mb-8">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#8d73ff]">
                Setup
              </p>

              <h2 className="mt-3 font-poppins text-3xl font-black text-primary">
                Build your practice set.
              </h2>

              <p className="mt-3 text-sm leading-7 text-primary/55">
                Mix different skills or focus on one weak area for targeted improvement.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <SelectInput
                label="Grade"
                value={selectedGrade}
                onChange={setSelectedGrade}
                options={allowedGrades}
              />

              <SelectInput
                label="Difficulty"
                value={selectedDifficulty}
                onChange={setSelectedDifficulty}
                options={DIFFICULTIES}
              />

              <SelectInput
                label="Question Type"
                value={selectedSkill}
                onChange={setSelectedSkill}
                options={SKILLS}
              />
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto]">
              <Button
                type="button"
                className="group h-14 w-full rounded-2xl bg-primary text-base font-black shadow-[0_18px_45px_rgba(10,36,84,0.20)]"
                onClick={startPractice}
              >
                Start Practice
                <ArrowRight className="ml-2 h-5 w-5 transition group-hover:translate-x-1" />
              </Button>

              <Button
                type="button"
                variant="outline"
                className="h-14 w-full rounded-2xl border-primary/10 bg-white px-7 font-black text-primary transition hover:-translate-y-1 hover:bg-[#f6f1ff]"
                onClick={resetProgress}
              >
                <RotateCcw className="mr-2 h-5 w-5" />
                Reset Progress
              </Button>
            </div>
          </section>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mx-auto max-w-[900px] space-y-6">
        {/* TOP BAR */}
        <section className="rounded-[2rem] bg-white p-5 shadow-[0_25px_80px_rgba(66,56,120,0.10)] sm:rounded-[2.5rem] sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#8d73ff]">
                {selectedGrade} · {selectedDifficulty} · {selectedSkill}
              </p>

              <h1 className="mt-3 font-poppins text-3xl font-black text-primary sm:text-4xl">
                Practice
              </h1>

              <p className="mt-2 text-primary/55">
                Question {currentIndex + 1} / {questions.length}
              </p>
            </div>

            <div className="w-full sm:min-w-[180px]">
              <div className="mb-2 flex justify-between text-xs font-bold text-primary/50">
                <span>Session</span>
                <span>{sessionProgress}%</span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-[#eee9ff]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(sessionProgress, 8)}%` }}
                  transition={{ duration: 0.6 }}
                  className="h-full rounded-full bg-[#8d73ff]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* QUESTION CARD */}
        <AnimatePresence mode="wait">
          <motion.section
            key={current?.id || currentIndex}
            initial={{ opacity: 0, y: 30, rotate: -0.8 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, y: -20, rotate: 0.8 }}
            transition={{ duration: 0.35 }}
            className="relative overflow-hidden rounded-[2rem] bg-white p-5 shadow-[0_30px_90px_rgba(66,56,120,0.13)] sm:rounded-[2.8rem] sm:p-8"
          >
            <div className="absolute -right-14 -top-14 h-44 w-44 rounded-full bg-[#f0eaff]" />

            <div className="relative z-10">
              {current?.passage && (
                <div className="mb-7 max-h-[45vh] overflow-y-auto rounded-[1.5rem] bg-[#fbfaff] p-4 sm:rounded-[2rem] sm:p-5">
                  <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-[#8d73ff]">
                    Passage
                  </p>

                  <p className="whitespace-pre-line text-sm leading-7 text-primary/60">
                    {current.passage}
                  </p>
                </div>
              )}

              <div className="mb-5 flex flex-wrap gap-2 text-xs">
                {[current.exam_type, current.grade, current.skill, current.difficulty].map(
                  (tag) =>
                    tag && (
                      <span
                        key={tag}
                        className="rounded-full bg-[#f6f1ff] px-3 py-1 font-bold text-[#8d73ff]"
                      >
                        {tag}
                      </span>
                    )
                )}
              </div>

              <p className="mb-6 text-lg font-black leading-8 text-primary sm:text-xl">
                {current.question_text}
              </p>

              <div className="space-y-3">
                {[current.option_a, current.option_b, current.option_c, current.option_d].map(
                  (opt, i) => {
                    const isSelected = selected === opt;
                    const isCorrectOption = opt === correctText;

                    let buttonClass =
                      "group w-full rounded-2xl border border-primary/10 bg-[#fbfaff] px-5 py-4 text-left text-sm font-semibold leading-7 text-primary transition hover:-translate-y-1 hover:border-[#8d73ff]/40 hover:bg-[#f6f1ff] sm:text-base";

                    if (!showFeedback && isSelected) {
                      buttonClass =
                        "group w-full rounded-2xl border border-[#8d73ff] bg-[#f6f1ff] px-5 py-4 text-left text-sm font-black leading-7 text-primary shadow-[0_12px_30px_rgba(141,115,255,0.15)] transition sm:text-base";
                    }

                    if (showFeedback && isSelected && isCorrectOption) {
                      buttonClass =
                        "group w-full rounded-2xl border border-green-300 bg-green-50 px-5 py-4 text-left text-sm font-black leading-7 text-green-800 transition sm:text-base";
                    }

                    if (showFeedback && isSelected && !isCorrectOption) {
                      buttonClass =
                        "group w-full rounded-2xl border border-red-300 bg-red-50 px-5 py-4 text-left text-sm font-black leading-7 text-red-800 transition sm:text-base";
                    }

                    if (
                      showFeedback &&
                      canViewAnswers &&
                      isCorrectOption &&
                      !isSelected
                    ) {
                      buttonClass =
                        "group w-full rounded-2xl border border-green-300 bg-green-50 px-5 py-4 text-left text-sm font-black leading-7 text-green-800 transition sm:text-base";
                    }

                    return (
                      <motion.button
                        type="button"
                        key={i}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => !showFeedback && setSelected(opt)}
                        className={buttonClass}
                      >
                        <span className="mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white font-black text-[#8d73ff]">
                          {String.fromCharCode(65 + i)}
                        </span>
                        {opt}
                      </motion.button>
                    );
                  }
                )}
              </div>
            </div>
          </motion.section>
        </AnimatePresence>

        {/* FEEDBACK */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12 }}
              className={`rounded-[2rem] p-5 shadow-[0_18px_55px_rgba(66,56,120,0.08)] ${
                isCorrect
                  ? "border border-green-200 bg-green-50 text-green-800"
                  : "border border-red-200 bg-red-50 text-red-800"
              }`}
            >
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <CheckCircle2 className="mt-1 h-6 w-6 shrink-0" />
                ) : (
                  <XCircle className="mt-1 h-6 w-6 shrink-0" />
                )}

                <div>
                  <p className="font-poppins text-xl font-black">
                    {isCorrect ? "Correct!" : "Incorrect"}
                  </p>

                  {!isCorrect && canViewAnswers && (
                    <p className="mt-2 text-sm leading-6">
                      Correct answer: <strong>{correctText}</strong>
                    </p>
                  )}

                  {canViewAnswers && current.explanation && (
                    <p className="mt-3 text-sm leading-6">
                      {current.explanation}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ACTION */}
        {showFeedback ? (
          <Button
            type="button"
            className="group h-14 w-full rounded-2xl bg-[#8d73ff] text-base font-black shadow-[0_18px_45px_rgba(141,115,255,0.35)]"
            onClick={handleNext}
          >
            Next
            <ArrowRight className="ml-2 h-5 w-5 transition group-hover:translate-x-1" />
          </Button>
        ) : (
          <Button
            type="button"
            className="h-14 w-full rounded-2xl bg-primary text-base font-black shadow-[0_18px_45px_rgba(10,36,84,0.20)]"
            onClick={handleSubmit}
          >
            Submit
          </Button>
        )}
      </div>
    </Shell>
  );
};

const Shell = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen overflow-hidden bg-[#fbfaff] px-4 py-6 sm:px-6 sm:py-14">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_15%,#f0eaff_0%,transparent_28%),radial-gradient(circle_at_85%_75%,#fff1bd_0%,transparent_30%)]" />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

const MiniMetric = ({ label, value }: { label: string; value: any }) => {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white p-4">
      <span className="text-sm font-bold text-primary/55">{label}</span>
      <span className="font-poppins text-xl font-black text-primary">
        {value}
      </span>
    </div>
  );
};

const StatCard = ({
  icon,
  title,
  value,
  index,
}: {
  icon: React.ReactNode;
  title: string;
  value: any;
  index: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -8, rotate: index % 2 === 0 ? -1.5 : 1.5 }}
      className="rounded-[2.2rem] bg-white p-6 shadow-[0_18px_55px_rgba(66,56,120,0.08)]"
    >
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f6f1ff] text-[#8d73ff]">
        {icon}
      </div>

      <p className="mb-1 text-sm font-bold text-primary/50">{title}</p>

      <h3 className="font-poppins text-4xl font-black text-primary">
        {value}
      </h3>
    </motion.div>
  );
};

const SelectInput = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) => {
  return (
    <div>
      <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-primary/45">
        {label}
      </label>

      <select
        className="h-14 w-full rounded-2xl border border-primary/10 bg-[#fbfaff] px-5 text-base outline-none transition focus:border-[#8d73ff] focus:ring-4 focus:ring-[#8d73ff]/10"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Practice;
