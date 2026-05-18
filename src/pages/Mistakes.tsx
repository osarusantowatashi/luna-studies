import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const Mistakes = () => {
  const [mistakes, setMistakes] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [canViewAnswers, setCanViewAnswers] = useState(false);

  useEffect(() => {
    fetchMistakes();
  }, []);

  const fetchMistakes = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("can_view_answers")
      .eq("id", user.id)
      .maybeSingle();

    setCanViewAnswers(profile?.can_view_answers === true);

    const { data, error } = await supabase
      .from("attempts")
      .select("*, questions(*)")
      .eq("user_id", user.id)
      .eq("is_correct", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    const mistakeData = data || [];
    setMistakes(mistakeData);

    const skillCount: any = {};

    mistakeData.forEach((m: any) => {
      const skill = m.questions?.skill || "Other";
      skillCount[skill] = (skillCount[skill] || 0) + 1;
    });

    setStats(skillCount);
  };

  const getCorrectAnswerText = (question: any) => {
    if (!question) return "";

    if (question.correct_answer === "option_a") return question.option_a;
    if (question.correct_answer === "option_b") return question.option_b;
    if (question.correct_answer === "option_c") return question.option_c;
    if (question.correct_answer === "option_d") return question.option_d;

    return question.correct_answer;
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 sm:py-16">
      <div data-guide="mistakes-review" className="mx-auto max-w-4xl space-y-6">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-accent">
            Student Review
          </p>

          <h1 className="font-serif text-3xl text-primary sm:text-4xl">Mistake Review</h1>

          <p className="mt-3 text-muted-foreground">
            Review the questions you answered incorrectly.
          </p>
        </div>

        <div className="rounded-[1.8rem] border bg-card p-5 shadow-soft sm:rounded-2xl sm:p-6">
          <h2 className="mb-3 font-semibold text-primary">Weak Areas</h2>

          {Object.keys(stats).length === 0 ? (
            <p className="text-sm text-muted-foreground">No weak areas yet.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {Object.entries(stats).map(([skill, count]: any) => (
                <div
                  key={skill}
                  className="rounded-full bg-secondary px-4 py-2 text-sm"
                >
                  {skill}: {count}
                </div>
              ))}
            </div>
          )}
        </div>

        {!canViewAnswers && (
          <div className="rounded-[1.8rem] border bg-secondary/50 p-4 text-sm leading-7 text-muted-foreground">
            Answers are hidden for now. Your tutor will review these questions
            with you during the lesson.
          </div>
        )}

        {mistakes.length === 0 ? (
          <div className="rounded-[1.8rem] border bg-card p-6 text-center text-sm leading-7 text-muted-foreground shadow-soft sm:p-8 sm:text-base">
            No mistakes yet. Practice more to see results.
          </div>
        ) : (
          <div className="space-y-5">
            {mistakes.map((attempt, i) => {
              const question = attempt.questions;
              const correctText = getCorrectAnswerText(question);

              return (
                <div
                  key={attempt.id || i}
                  className="rounded-[1.8rem] border border-border bg-card p-5 shadow-soft sm:rounded-2xl sm:p-6"
                >
                  <div className="mb-4 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-secondary px-3 py-1">
                      {question?.exam_type}
                    </span>

                    <span className="rounded-full bg-secondary px-3 py-1">
                      {question?.grade}
                    </span>

                    <span className="rounded-full bg-secondary px-3 py-1">
                      {question?.skill}
                    </span>

                    <span className="rounded-full bg-secondary px-3 py-1">
                      {question?.difficulty}
                    </span>

                    <span className="rounded-full bg-secondary px-3 py-1">
                      Attempted on{" "}
                      {new Date(attempt.created_at).toLocaleString()}
                    </span>
                  </div>

                  {question?.passage && (
                    <div className="mb-5 max-h-[45vh] overflow-y-auto rounded-2xl border bg-white p-4 sm:p-5">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">
                        Passage
                      </p>

                      <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
                        {question.passage}
                      </p>
                    </div>
                  )}

                  <p className="mb-4 text-base font-semibold leading-7 text-primary sm:text-lg sm:leading-8">
                    {i + 1}. {question?.question_text}
                  </p>

                  <div className="mb-4 grid gap-3 text-sm leading-7 md:grid-cols-2">
                    <p>A. {question?.option_a}</p>
                    <p>B. {question?.option_b}</p>
                    <p>C. {question?.option_c}</p>
                    <p>D. {question?.option_d}</p>
                  </div>

                  <div
                    className={
                      canViewAnswers
                        ? "grid gap-3 sm:grid-cols-2"
                        : "grid gap-3"
                    }
                  >
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-7 text-red-700">
                      Student answer:{" "}
                      {attempt.selected_answer || "No answer recorded"}
                    </div>

                    {canViewAnswers && (
                      <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm leading-7 text-green-700">
                        Correct answer: {correctText}
                      </div>
                    )}
                  </div>

                  {canViewAnswers && question?.explanation && (
                    <p className="mt-4 text-sm leading-7 text-muted-foreground">
                      Explanation: {question.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default Mistakes;