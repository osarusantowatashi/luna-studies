import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";


const AdminQuestions = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [gradeFilter, setGradeFilter] = useState("All");
  const [skillFilter, setSkillFilter] = useState("All");
  const [search, setSearch] = useState("");

  const fetchQuestions = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert("Failed to load questions.");
      setLoading(false);
      return;
    }

    setQuestions(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const getCorrectAnswerText = (q: any) => {
    if (q.correct_answer === "option_a") return q.option_a;
    if (q.correct_answer === "option_b") return q.option_b;
    if (q.correct_answer === "option_c") return q.option_c;
    if (q.correct_answer === "option_d") return q.option_d;
    return q.correct_answer;
  };

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesGrade = gradeFilter === "All" || q.grade === gradeFilter;
      const matchesSkill = skillFilter === "All" || q.skill === skillFilter;

      const searchText = `${q.question_text || ""} ${q.passage || ""} ${q.explanation || ""
        }`.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());

      return matchesGrade && matchesSkill && matchesSearch;
    });
  }, [questions, gradeFilter, skillFilter, search]);

  const groupedByGrade = useMemo(() => {
    const grouped: any = {};

    filteredQuestions.forEach((q) => {
      const grade = q.grade || "Uncategorized Grade";
      const skill = q.skill || "Uncategorized Skill";

      if (!grouped[grade]) grouped[grade] = {};
      if (!grouped[grade][skill]) grouped[grade][skill] = [];

      grouped[grade][skill].push(q);
    });

    return grouped;
  }, [filteredQuestions]);

  const grades = ["All", ...new Set(questions.map((q) => q.grade).filter(Boolean))];
  const skills = ["All", ...new Set(questions.map((q) => q.skill).filter(Boolean))];

  return (
    <div className="min-h-screen bg-background">

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-16">
        <div className="mb-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-accent">
            Admin
          </p>

          <h1 className="font-serif text-3xl text-primary sm:text-5xl">
            Question Bank
          </h1>

          <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
            View saved questions by grade, skill, exam type, and difficulty.
          </p>
        </div>

        <div className="mb-8 rounded-[1.8rem] border bg-card p-5 shadow-soft sm:rounded-2xl">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Grade
              </label>
              <select
                className="w-full rounded-2xl border bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
              >
                {grades.map((grade) => (
                  <option key={grade}>{grade}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Skill
              </label>
              <select
                className="w-full rounded-2xl border bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
              >
                {skills.map((skill) => (
                  <option key={skill}>{skill}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Search
              </label>
              <input
                type="search"
                className="w-full rounded-2xl border bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                placeholder="Search question, passage, or explanation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredQuestions.length} / {questions.length} questions
            </p>

            <Button
              type="button"
              variant="outline"
              className="w-full rounded-2xl sm:w-auto"
              onClick={fetchQuestions}
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </div>

        {Object.keys(groupedByGrade).length === 0 ? (
          <div className="rounded-[1.8rem] border bg-card p-6 text-center text-sm leading-7 text-muted-foreground sm:p-10 sm:text-base">
            No questions found.
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedByGrade).map(([grade, skillsGroup]: any) => (
              <div key={grade}>
                <h2 className="mb-5 font-serif text-2xl text-primary sm:text-4xl">
                  {grade}
                </h2>

                <div className="space-y-8">
                  {Object.entries(skillsGroup).map(([skill, qs]: any) => (
                    <div
                      key={skill}
                      className="rounded-[1.8rem] border bg-card p-5 shadow-soft sm:rounded-3xl sm:p-6"
                    >
                      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="font-serif text-xl text-primary sm:text-2xl">
                          {skill}
                        </h3>

                        <span className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
                          {qs.length} questions
                        </span>
                      </div>

                      <div className="space-y-5">
                        {qs.map((q: any, index: number) => (
                          <div
                            key={q.id}
                            className="rounded-2xl border bg-background p-4 sm:p-5"
                          >
                            <div className="mb-4 flex flex-wrap gap-2 text-xs">
                              <span className="rounded-full bg-secondary px-3 py-1">
                                {q.exam_type}
                              </span>
                              <span className="rounded-full bg-secondary px-3 py-1">
                                {q.difficulty}
                              </span>
                            </div>

                            {q.passage && (
                              <div className="mb-5 max-h-[45vh] overflow-y-auto rounded-2xl border bg-white p-4 sm:p-5">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">
                                  Reading Passage
                                </p>
                                <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
                                  {q.passage}
                                </p>
                              </div>
                            )}

                            <p className="text-base font-semibold leading-7 text-primary">
                              {index + 1}. {q.question_text}
                            </p>

                            <div className="mt-4 grid gap-3 text-sm leading-7 md:grid-cols-2">
                              <p>A. {q.option_a}</p>
                              <p>B. {q.option_b}</p>
                              <p>C. {q.option_c}</p>
                              <p>D. {q.option_d}</p>
                            </div>

                            <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm leading-7 text-green-700">
                              Correct: {getCorrectAnswerText(q)}
                            </div>

                            {q.explanation && (
                              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                                {q.explanation}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminQuestions;