import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

const mockQuestions = [
  {
    id: 1,
    level: "Beginner",
    skill: "Hiragana",
    difficulty: "Easy",
    question_text: "Which hiragana makes the sound 'ka'?",
    answer: "か",
    explanation: "か is pronounced as 'ka'.",
  },
  {
    id: 2,
    level: "Beginner",
    skill: "Vocabulary",
    difficulty: "Easy",
    question_text: "What does ありがとう mean?",
    answer: "Thank you",
    explanation: "ありがとう is a common Japanese expression for thanks.",
  },
];

export default function JapaneseQuestionBank() {
  const [questions] = useState(mockQuestions);
  const [levelFilter, setLevelFilter] = useState("All");
  const [skillFilter, setSkillFilter] = useState("All");
  const [search, setSearch] = useState("");

  const levels = ["All", ...new Set(questions.map((q) => q.level))];
  const skills = ["All", ...new Set(questions.map((q) => q.skill))];

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesLevel = levelFilter === "All" || q.level === levelFilter;
      const matchesSkill = skillFilter === "All" || q.skill === skillFilter;

      const searchText = `${q.question_text} ${q.answer} ${q.explanation}`.toLowerCase();
      const matchesSearch = searchText.includes(search.toLowerCase());

      return matchesLevel && matchesSkill && matchesSearch;
    });
  }, [questions, levelFilter, skillFilter, search]);

  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-accent">
            Language Bank
          </p>

          <h1 className="mt-2 font-serif text-4xl text-primary sm:text-5xl">
            Japanese Question Bank
          </h1>

          <p className="mt-3 max-w-3xl text-muted-foreground">
            Review saved Japanese questions by level, skill, and difficulty.
          </p>
        </div>

        <div className="rounded-[2rem] border bg-card p-5 shadow-soft">
          <div className="grid gap-4 md:grid-cols-4">
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="rounded-2xl border bg-white px-4 py-3"
            >
              {levels.map((level) => (
                <option key={level}>{level}</option>
              ))}
            </select>

            <select
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="rounded-2xl border bg-white px-4 py-3"
            >
              {skills.map((skill) => (
                <option key={skill}>{skill}</option>
              ))}
            </select>

            <input
              type="search"
              placeholder="Search Japanese questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-2xl border bg-white px-4 py-3 md:col-span-2"
            />
          </div>

          <div className="mt-5 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredQuestions.length} / {questions.length} questions
            </p>

            <Button variant="outline" className="rounded-2xl">
              Refresh
            </Button>
          </div>
        </div>

        <div className="space-y-5">
          {filteredQuestions.map((q, index) => (
            <div key={q.id} className="rounded-[2rem] border bg-card p-5 shadow-soft">
              <div className="mb-4 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-secondary px-3 py-1">{q.level}</span>
                <span className="rounded-full bg-secondary px-3 py-1">{q.skill}</span>
                <span className="rounded-full bg-secondary px-3 py-1">{q.difficulty}</span>
              </div>

              <p className="text-base font-semibold leading-7 text-primary">
                {index + 1}. {q.question_text}
              </p>

              <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                Answer: {q.answer}
              </div>

              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {q.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}