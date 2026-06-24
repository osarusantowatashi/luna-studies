import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

const RedoMistakes = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    const allMistakes = JSON.parse(localStorage.getItem("mistakes") || "[]");
    const student = JSON.parse(localStorage.getItem("current_student") || "{}");

    const studentMistakes = allMistakes.filter(
      (m: any) => m.student_id === student.id
    );

    setQuestions(studentMistakes);
  }, []);

  if (questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center text-muted-foreground">
        No mistakes to redo 🎉
      </div>
    );
  }

  const current = questions[currentIndex];

  const getCorrectAnswerText = (q: any) => {
    if (q.correct_answer === "option_a") return q.option_a;
    if (q.correct_answer === "option_b") return q.option_b;
    if (q.correct_answer === "option_c") return q.option_c;
    if (q.correct_answer === "option_d") return q.option_d;
    return q.correct_answer;
  };

  const correctText = getCorrectAnswerText(current);

  const handleSubmit = () => {
    if (!selected) {
      alert("Please select an answer first");
      return;
    }

    setShowFeedback(true);
  };

  const handleNext = () => {
    setSelected("");
    setShowFeedback(false);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      alert("Mistake redo finished!");
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-xl space-y-6">
        <h1 className="font-serif text-3xl text-primary sm:text-4xl">
          Redo Mistakes
        </h1>

        <p className="text-muted-foreground">
          Question {currentIndex + 1} / {questions.length}
        </p>

        <div className="rounded-2xl border bg-card p-5 shadow-soft sm:p-6">
          <p className="mb-4 text-base font-medium leading-7 sm:text-lg">
            {current.question_text}
          </p>

          {[
            current.option_a,
            current.option_b,
            current.option_c,
            current.option_d,
          ].map((opt, i) => (
            <button
              key={i}
              onClick={() => !showFeedback && setSelected(opt)}
              className={`mb-2 min-h-11 w-full rounded-xl border p-3 text-left transition ${
                showFeedback && opt === correctText
                  ? "border-green-500 bg-green-100 text-green-800"
                  : showFeedback && selected === opt && selected !== correctText
                  ? "border-red-500 bg-red-100 text-red-800"
                  : selected === opt
                  ? "bg-primary text-white"
                  : ""
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        {showFeedback && (
          <div className="rounded-2xl bg-secondary p-4">
            <p className="font-semibold text-primary">
              Correct answer: {correctText}
            </p>
            <p className="mt-2 text-muted-foreground">
              {current.explanation}
            </p>
          </div>
        )}

        {showFeedback ? (
          <Button className="min-h-11 w-full rounded-2xl" onClick={handleNext}>
            Next Question
          </Button>
        ) : (
          <Button className="min-h-11 w-full rounded-2xl" onClick={handleSubmit}>
            Submit
          </Button>
        )}
      </div>
    </div>
  );
};

export default RedoMistakes;
