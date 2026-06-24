import { useState } from "react";

const grades = ["Beginner", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"];

const skills = [
  "Hiragana",
  "Katakana",
  "Vocabulary",
  "Grammar",
  "Reading",
  "Sentence Writing",
];

const difficulties = ["Easy", "Medium", "Hard"];

export default function JapaneseGenerator() {
  const [grade, setGrade] = useState("Beginner");
  const [skill, setSkill] = useState("Vocabulary");
  const [difficulty, setDifficulty] = useState("Medium");
  const [prompt, setPrompt] = useState("");

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-accent">
            Language Generator
          </p>

          <h1 className="mt-2 font-serif text-3xl text-primary sm:text-5xl">
            Japanese Question Generator
          </h1>

          <p className="mt-3 max-w-3xl text-muted-foreground">
            Generate Japanese learning questions by level, skill, and difficulty.
          </p>
        </div>

        <div className="rounded-[1.6rem] border bg-card p-5 shadow-soft sm:rounded-[2rem] sm:p-6">
          <div className="grid gap-4 md:grid-cols-3">
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
            placeholder="Optional prompt, e.g. focus on daily conversation, school vocabulary, or JLPT-style grammar..."
            className="mt-5 min-h-32 w-full rounded-2xl border bg-background px-4 py-3 text-primary outline-none"
          />

          <button className="mt-5 min-h-11 w-full rounded-2xl bg-primary px-6 py-3 font-bold text-primary-foreground transition hover:opacity-90">
            Generate Japanese Questions
          </button>
        </div>
      </div>
    </div>
  );
}
