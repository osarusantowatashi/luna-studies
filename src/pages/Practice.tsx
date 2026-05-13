import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";


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
    attemptedCount === 0 ? 0 : Math.round((correctCount / attemptedCount) * 100);

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
      <div className="min-h-screen px-4 py-8 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-3xl rounded-[1.8rem] border bg-white/80 p-5 text-center shadow-xl sm:rounded-3xl sm:p-10">
        <p className="text-sm text-muted-foreground sm:text-base">Loading practice...</p>
        </div>
      </div>
    );
  }

  if (allowedGrades.length === 0) {
    return (
      <div className="min-h-screen px-4 py-8 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-3xl rounded-[1.8rem] border bg-white/80 p-5 text-center shadow-xl sm:rounded-3xl sm:p-10">
        <h1 className="font-serif text-2xl text-primary sm:text-3xl">
            No Practice Access Yet
          </h1>
          <p className="mt-3 text-muted-foreground">
            Your account does not have any grade access yet. Please contact admin.
          </p>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen px-4 py-8 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="rounded-[1.8rem] border bg-white/80 p-5 shadow-xl backdrop-blur sm:rounded-[2rem] sm:p-8">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-accent">
              Practice Setup
            </p>
            <h1 className="font-serif text-3xl text-primary sm:text-4xl">
              Choose your practice
            </h1>
            <p className="mt-3 text-muted-foreground">
              Select your grade, difficulty, and question type before starting.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border bg-secondary/40 p-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Attempted
                </p>
                <p className="mt-2 text-3xl font-bold text-primary">
                  {attemptedCount}
                </p>
              </div>

              <div className="rounded-2xl border bg-secondary/40 p-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Correct
                </p>
                <p className="mt-2 text-3xl font-bold text-primary">
                  {correctCount}
                </p>
              </div>

              <div className="rounded-2xl border bg-secondary/40 p-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Accuracy
                </p>
                <p className="mt-2 text-3xl font-bold text-primary">
                  {accuracy}%
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.8rem] border bg-white/80 p-5 shadow-xl backdrop-blur sm:rounded-[2rem] sm:p-8">
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Grade
                </label>
                <select
                  className="w-full rounded-2xl border bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                >
                  {allowedGrades.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Difficulty
                </label>
                <select
                  className="w-full rounded-2xl border bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                >
                  {DIFFICULTIES.map((difficulty) => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Question Type
                </label>
                <select
                  className="w-full rounded-2xl border bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                >
                  {SKILLS.map((skill) => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto]">
              <Button 
              type="button"
              className="h-12 w-full rounded-2xl" onClick={startPractice}>
                Start Practice
              </Button>

              <Button
              type="button"
                variant="outline"
                className="h-12 w-full rounded-2xl"
                onClick={resetProgress}
              >
                Reset Progress
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            {selectedGrade} · {selectedDifficulty} · {selectedSkill}
          </p>

          <h1 className="mt-2 font-serif text-3xl text-primary sm:text-4xl">Practice</h1>

          <p className="mt-3 text-muted-foreground">
            Question {currentIndex + 1} / {questions.length}
          </p>
        </div>

        <div className="rounded-[1.8rem] border bg-white/80 p-5 shadow-xl backdrop-blur sm:rounded-[2rem] sm:p-8">
          {current?.passage && (
            <div className="mb-6 max-h-[45vh] overflow-y-auto rounded-2xl border bg-secondary/40 p-4 sm:p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">
                Passage
              </p>
              <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
                {current.passage}
              </p>
            </div>
          )}

          <p className="mb-3 text-base font-semibold leading-7 text-primary sm:text-lg sm:leading-8">
            {current.question_text}
          </p>

          <div className="mb-6 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-secondary px-3 py-1">
              {current.exam_type}
            </span>
            <span className="rounded-full bg-secondary px-3 py-1">
              {current.grade}
            </span>
            <span className="rounded-full bg-secondary px-3 py-1">
              {current.skill}
            </span>
            <span className="rounded-full bg-secondary px-3 py-1">
              {current.difficulty}
            </span>
          </div>

          <div className="space-y-3">
            {[current.option_a, current.option_b, current.option_c, current.option_d].map(
              (opt, i) => {
                const isSelected = selected === opt;
                const isCorrectOption = opt === correctText;

                let buttonClass =
                  "w-full rounded-2xl border bg-white px-4 py-4 text-left text-sm leading-7 transition sm:text-base";

                if (!showFeedback && isSelected) {
                  buttonClass += " bg-yellow-100 border-yellow-300";
                }

                if (showFeedback && isSelected && isCorrectOption) {
                  buttonClass += " bg-green-100 border-green-400 text-green-800";
                }

                if (showFeedback && isSelected && !isCorrectOption) {
                  buttonClass += " bg-red-100 border-red-400 text-red-800";
                }

                if (
                  showFeedback &&
                  canViewAnswers &&
                  isCorrectOption &&
                  !isSelected
                ) {
                  buttonClass += " bg-green-100 border-green-400 text-green-800";
                }

                return (
                  <button
                    type="button"
                    key={i}
                    onClick={() => !showFeedback && setSelected(opt)}
                    className={buttonClass}
                  >
                    {opt}
                  </button>
                );
              }
            )}
          </div>
        </div>

        {showFeedback && (
          <div
          className={`rounded-2xl border p-4 text-sm leading-7 sm:p-5 ${
              isCorrect
                ? "border-green-300 bg-green-50 text-green-800"
                : "border-red-300 bg-red-50 text-red-800"
            }`}
          >
            <p className="text-lg font-semibold">
              {isCorrect ? "Correct!" : "Incorrect"}
            </p>

            {!isCorrect && canViewAnswers && (
              <p className="mt-2 text-sm">
                Correct answer: <strong>{correctText}</strong>
              </p>
            )}

            {canViewAnswers && current.explanation && (
              <p className="mt-3 text-sm leading-6">
                {current.explanation}
              </p>
            )}
          </div>
        )}

        {showFeedback ? (
          <Button 
          type="button"
          className="h-12 w-full rounded-2xl" onClick={handleNext}>
            Next
          </Button>
        ) : (
          <Button 
          type="button"
          className="h-12 w-full rounded-2xl" onClick={handleSubmit}>
            Submit
          </Button>
        )}
      </div>
    
    </div>
  );
};

export default Practice;