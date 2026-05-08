import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import Footer from "@/components/Footer";

const GenerateQuestions = () => {
  const [examType, setExamType] = useState("MAP");
  const [grade, setGrade] = useState("Grade 5");
  const [skill, setSkill] = useState("Vocabulary");
  const [difficulty, setDifficulty] = useState("Medium");
  const [questionCount, setQuestionCount] = useState("5");
  const [extraPrompt, setExtraPrompt] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleGenerate = async () => {
    console.log("Generate button clicked");
    console.log("SKILL RECEIVED:", skill);

    setLoading(true);
    
    setErrorMsg("");
    setQuestions([]);

    const topic = `
Exam Type: ${examType}
Grade: ${grade}
Skill: ${skill}
Difficulty: ${difficulty}
Number of questions: ${questionCount}
Extra instructions: ${extraPrompt}
`;
    try {
      const res = await fetch("http://localhost:3001/api/generate-questions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    examType,
    grade,
    skill,
    difficulty,
    questionCount,
    extraPrompt,
  }),
});

const rawText = await res.text();
console.log("RAW BACKEND RESPONSE:", rawText);

if (!res.ok) {
  throw new Error(`Backend error ${res.status}: ${rawText}`);
}

const data = JSON.parse(rawText);

      if (!data.text) {
        setErrorMsg("No data returned from server: " + JSON.stringify(data));
        return;
      }

      let text = data.text;
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();

      const parsed = JSON.parse(text);

let categorised: any[] = [];

if (Array.isArray(parsed)) {
  // normal questions
  categorised = parsed.map((q: any) => ({
    ...q,
    type: "normal",
    exam_type: examType,
    grade,
    skill,
    difficulty,
    id: Date.now() + Math.random(),
  }));
} else if (parsed.type === "reading") {
  categorised = [
    {
      ...parsed,
      exam_type: examType,
      grade,
      skill,
      difficulty,
      id: Date.now(),
    },
  ];
}
      setQuestions(categorised);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to generate questions.");
    } finally {
      setLoading(false);
    }
  };
  


  const saveQuestion = async (q: any) => {
  let payload;

  if (q.type === "reading") {
    payload = q.questions.map((subQ: any) => ({
      exam_type: q.exam_type,
      grade: q.grade,
      skill: q.skill,
      difficulty: q.difficulty,
      passage: q.passage,
      question_text: subQ.question_text,
      option_a: subQ.option_a,
      option_b: subQ.option_b,
      option_c: subQ.option_c,
      option_d: subQ.option_d,
      correct_answer: subQ.correct_answer,
      explanation: subQ.explanation,
    }));
  } else {
    payload = [
      {
        exam_type: q.exam_type,
        grade: q.grade,
        skill: q.skill,
        difficulty: q.difficulty,
        passage: q.passage || null,
        question_text: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
      },
    ];
  }

  const { error } = await supabase.from("questions").insert(payload);

  if (error) {
    console.error("SAVE ERROR:", error);
    alert("Failed to save question: " + error.message);
    return;
  }

  alert("Saved to database!");
};

  const saveAllQuestions = async () => {
  const cleaned = questions.flatMap((q) => {
    if (q.type === "reading") {
      return q.questions.map((subQ: any) => ({
        exam_type: q.exam_type,
        grade: q.grade,
        skill: q.skill,
        difficulty: q.difficulty,
        passage: q.passage,
        question_text: subQ.question_text,
        option_a: subQ.option_a,
        option_b: subQ.option_b,
        option_c: subQ.option_c,
        option_d: subQ.option_d,
        correct_answer: subQ.correct_answer,
        explanation: subQ.explanation,
      }));
    }

    return {
      exam_type: q.exam_type,
      grade: q.grade,
      skill: q.skill,
      difficulty: q.difficulty,
      passage: q.passage || null,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
    };
  });

  const { error } = await supabase.from("questions").insert(cleaned);

  if (error) {
    console.error("SAVE ERROR:", error);
    alert("Failed to save questions: " + error.message);
    return;
  }

  alert(`${cleaned.length} questions saved to database!`);
};
  const getCorrectAnswerText = (q: any) => {
    if (q.correct_answer === "option_a") return q.option_a;
    if (q.correct_answer === "option_b") return q.option_b;
    if (q.correct_answer === "option_c") return q.option_c;
    if (q.correct_answer === "option_d") return q.option_d;
    return q.correct_answer;
  };

  return (
    <div className="min-h-screen bg-background px-6 py-20">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-accent">
            Question Bank Builder
          </p>
          <h1 className="font-serif text-5xl text-primary">
            AI Question Generator
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Generate categorised questions by exam, grade, skill, and difficulty.
            These categories will later control what each student can access.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-soft">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <select
              className="rounded-lg border p-3"
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
            >
              <option>MAP</option>
              <option>WIDA</option>
              <option>CAT4</option>
              <option>AEIS</option>
              <option>TOEFL</option>
              <option>IELTS</option>
              <option>English Foundation</option>
              <option>Japanese</option>
              <option>Math</option>
            </select>

            <select
              className="rounded-lg border p-3"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            >
              <option>Grade 1</option>
              <option>Grade 2</option>
              <option>Grade 3</option>
              <option>Grade 4</option>
              <option>Grade 5</option>
              <option>Grade 6</option>
              <option>Grade 7</option>
              <option>Grade 8</option>
              <option>Grade 9</option>
              <option>Grade 10</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>

            <select
              className="rounded-lg border p-3"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
            >
              <option>Vocabulary</option>
              <option>Reading Comprehension</option>
              <option>Main Idea</option>
              <option>Inference</option>
              <option>Detail Questions</option>
              <option>Grammar</option>
              <option>Math Problem Solving</option>
            </select>

            <select
              className="rounded-lg border p-3"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
              <option>Advanced</option>
            </select>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-[160px_1fr]">
            <select
              className="rounded-lg border p-3"
              value={questionCount}
              onChange={(e) => setQuestionCount(e.target.value)}
            >
              <option value="3">3 questions</option>
              <option value="5">5 questions</option>
              <option value="10">10 questions</option>
              <option value="15">15 questions</option>
            </select>

            <input
              className="rounded-lg border p-3"
              placeholder="Extra prompt, e.g. make it MAP style, use short passages, focus on animal vocabulary..."
              value={extraPrompt}
              onChange={(e) => setExtraPrompt(e.target.value)}
            />
          </div>

          <Button
            className="mt-5 h-12 w-full"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Questions"}
          </Button>
        </div>

        {errorMsg && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
            {errorMsg}
          </div>
        )}

        {questions.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Generated {questions.length} questions
            </p>

            <Button onClick={saveAllQuestions}>
              Save All Questions
            </Button>
          </div>
        )}

        <div className="grid gap-6">
         {questions.map((q, i) => {
  if (q.type === "reading") {
    return (
      <div key={q.id} className="rounded-xl border bg-card p-6 shadow-soft">
        
        {/* PASSAGE */}
        <p className="mb-4 text-sm text-muted-foreground">
          Passage:
        </p>
        <p className="mb-6 leading-relaxed">{q.passage}</p>

        {/* QUESTIONS */}
        {q.questions.map((subQ: any, idx: number) => (
          <div key={idx} className="mb-6 border-t pt-4">
            <p className="font-semibold">
              {idx + 1}. {subQ.question_text}
            </p>

            <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
              <p>A. {subQ.option_a}</p>
              <p>B. {subQ.option_b}</p>
              <p>C. {subQ.option_c}</p>
              <p>D. {subQ.option_d}</p>
            </div>

            <p className="mt-2 text-sm text-green-700">
              Correct: {getCorrectAnswerText(subQ)}
            </p>

            <p className="text-sm text-muted-foreground">
              {subQ.explanation}
            </p>
          </div>
        ))}

      </div>
    );
  }

  // NORMAL QUESTION
  return (
    <div key={q.id || i} className="rounded-xl border bg-card p-6 shadow-soft">
      {q.passage && (
  <div className="mb-5 rounded-xl border bg-white p-5">
    <p className="mb-2 text-sm font-semibold text-muted-foreground">
      Read the paragraph.
    </p>
    <p className="leading-7 text-muted-foreground">
      {q.passage}
    </p>
  </div>
)}
      <p className="font-semibold">
        {i + 1}. {q.question_text}
      </p>

      <div className="mt-4 grid gap-2 text-sm md:grid-cols-2">
        <p>A. {q.option_a}</p>
        <p>B. {q.option_b}</p>
        <p>C. {q.option_c}</p>
        <p>D. {q.option_d}</p>
      </div>

      <p className="mt-4 text-sm text-green-700">
        Correct: {getCorrectAnswerText(q)}
      </p>

      <p className="mt-2 text-sm text-muted-foreground">
        {q.explanation}
      </p>

      <Button className="mt-4" onClick={() => saveQuestion(q)}>
        Approve & Save
      </Button>
    </div>
  );
})}
        </div>
      </div>
    </div>
  );
};

export default GenerateQuestions;