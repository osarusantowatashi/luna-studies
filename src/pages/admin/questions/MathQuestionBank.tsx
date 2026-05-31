import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

const mockQuestions = [
  {
    id: 1,
    curriculum: "Singapore Math",
    grade: "Grade 4",
    topic: "Fractions",
    difficulty: "Medium",
    question_text: "A cake is cut into 8 equal pieces. Mia eats 3 pieces. What fraction is left?",
    answer: "5/8",
    explanation: "8 pieces minus 3 pieces leaves 5 pieces, so the fraction left is 5/8.",
  },
  {
    id: 2,
    curriculum: "UK Curriculum",
    grade: "Year 5",
    topic: "Word Problems",
    difficulty: "Medium",
    question_text: "A book costs £7. Tom buys 4 books. How much does he pay?",
    answer: "£28",
    explanation: "7 × 4 = 28.",
  },
];

export default function MathQuestionBank() {
  const [questions] = useState(mockQuestions);
  const [gradeFilter, setGradeFilter] = useState("All");
  const [topicFilter, setTopicFilter] = useState("All");
  const [search, setSearch] = useState("");

  const grades = ["All", ...new Set(questions.map((q) => q.grade))];
  const topics = ["All", ...new Set(questions.map((q) => q.topic))];

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesGrade = gradeFilter === "All" || q.grade === gradeFilter;
      const matchesTopic = topicFilter === "All" || q.topic === topicFilter;

      const searchText = `${q.question_text} ${q.answer} ${q.explanation}`.toLowerCase();
      const matchesSearch = searchText.includes(search.toLowerCase());

      return matchesGrade && matchesTopic && matchesSearch;
    });
  }, [questions, gradeFilter, topicFilter, search]);

  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-accent">
            Math Bank
          </p>

          <h1 className="mt-2 font-serif text-4xl text-primary sm:text-5xl">
            Math Question Bank
          </h1>

          <p className="mt-3 max-w-3xl text-muted-foreground">
            Review saved Math questions by curriculum, grade, topic, and difficulty.
          </p>
        </div>

        <div className="rounded-[2rem] border bg-card p-5 shadow-soft">
          <div className="grid gap-4 md:grid-cols-4">
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="rounded-2xl border bg-white px-4 py-3"
            >
              {grades.map((grade) => (
                <option key={grade}>{grade}</option>
              ))}
            </select>

            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="rounded-2xl border bg-white px-4 py-3"
            >
              {topics.map((topic) => (
                <option key={topic}>{topic}</option>
              ))}
            </select>

            <input
              type="search"
              placeholder="Search Math questions..."
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
                <span className="rounded-full bg-secondary px-3 py-1">{q.curriculum}</span>
                <span className="rounded-full bg-secondary px-3 py-1">{q.grade}</span>
                <span className="rounded-full bg-secondary px-3 py-1">{q.topic}</span>
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