import { useState } from "react";

const exams = ["Singapore Math", "UK Curriculum", "MAP", "CAT4", "Math Foundation"];

const grades = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"];

const skills = [
  "Number",
  "Addition & Subtraction",
  "Multiplication & Division",
  "Fractions",
  "Decimals",
  "Geometry",
  "Measurement",
  "Word Problems",
  "Data Handling",
  "Patterns",
];

const difficulties = ["Easy", "Medium", "Hard"];

export default function MathGenerator() {
  const [exam, setExam] = useState("Singapore Math");
  const [grade, setGrade] = useState("Grade 5");
  const [skill, setSkill] = useState("Word Problems");
  const [difficulty, setDifficulty] = useState("Medium");
  const [prompt, setPrompt] = useState("");

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-accent">
            Math Generator
          </p>

          <h1 className="mt-2 font-serif text-3xl text-primary sm:text-5xl">
            Math Question Generator
          </h1>

          <p className="mt-3 max-w-3xl text-muted-foreground">
            Generate topic-based math questions by curriculum, grade, skill, and difficulty.
          </p>
        </div>

        <div className="rounded-[1.6rem] border bg-card p-5 shadow-soft sm:rounded-[2rem] sm:p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <select
              value={exam}
              onChange={(e) => setExam(e.target.value)}
              className="min-h-11 rounded-2xl border bg-background px-4 py-3 text-primary"
            >
              {exams.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="min-h-11 rounded-2xl border bg-background px-4 py-3 text-primary"
            >
              {grades.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <select
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="min-h-11 rounded-2xl border bg-background px-4 py-3 text-primary"
            >
              {skills.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="min-h-11 rounded-2xl border bg-background px-4 py-3 text-primary"
            >
              {difficulties.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Optional prompt, e.g. make it Singapore Math style, include bar model questions, or focus on fractions word problems..."
            className="mt-5 min-h-32 w-full rounded-2xl border bg-background px-4 py-3 text-primary outline-none"
          />

          <button className="mt-5 w-full rounded-2xl bg-primary px-6 py-4 font-bold text-primary-foreground transition hover:opacity-90">
            Generate Math Questions
          </button>
        </div>
      </div>
    </div>
  );
}
