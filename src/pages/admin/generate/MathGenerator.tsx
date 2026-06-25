import { useState } from "react";

const grades = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"];

export default function MathGenerator() {
  const [grade, setGrade] = useState("Grade 1");
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState("10");
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
            Generate simple Singapore Math questions by grade, topic, and count.
            Curriculum-specific material can be added later when source topics are ready.
          </p>
        </div>

        <div className="rounded-[1.6rem] border bg-card p-5 shadow-soft sm:rounded-[2rem] sm:p-6">
          <div className="grid gap-4 md:grid-cols-[180px_1fr_180px]">
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="min-h-11 rounded-2xl border bg-background px-4 py-3 text-primary"
            >
              {grades.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Topic, e.g. fractions, bar models, multiplication"
              className="min-h-11 rounded-2xl border bg-background px-4 py-3 text-primary"
            />

            <select
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className="min-h-11 rounded-2xl border bg-background px-4 py-3 text-primary"
            >
              <option value="5">5 questions</option>
              <option value="10">10 questions</option>
              <option value="15">15 questions</option>
              <option value="20">20 questions</option>
            </select>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Optional notes, e.g. Singapore Math style, include bar model questions, focus on word problems..."
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
