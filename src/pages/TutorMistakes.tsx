import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 10;

const TutorMistakes = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [attempts, setAttempts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [timeFilter, setTimeFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedStudentId) fetchAttempts();
  }, [selectedStudentId]);

  useEffect(() => {
    applyFilters();
  }, [attempts, timeFilter]);

  const fetchStudents = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const tutor = userData.user;
    if (!tutor) return;

    const { data: links } = await supabase
      .from("tutor_student_links")
      .select("student_id")
      .eq("tutor_id", tutor.id);


    if (!links || links.length === 0) return;

    const ids = links.map((l) => l.student_id);

    const { data: studentData } = await supabase
      .from("profiles")
      .select("id, name")
      .in("id", ids);

    setStudents(studentData || []);

    if (studentData?.length) {
      setSelectedStudentId(studentData[0].id);
    }
  };

  const fetchAttempts = async () => {
    const { data } = await supabase
      .from("attempts")
      .select("*, questions(*)")
      .eq("user_id", selectedStudentId)
      .eq("is_correct", false)
      .order("created_at", { ascending: false });

    setAttempts(data || []);
    setPage(1);
  };

  const applyFilters = () => {
    let data = [...attempts];

    if (timeFilter !== "all") {
      const now = new Date();

      data = data.filter((a) => {
        const created = new Date(a.created_at);
        const diff =
          (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);

        if (timeFilter === "24h") return diff <= 1;
        if (timeFilter === "7d") return diff <= 7;
        if (timeFilter === "30d") return diff <= 30;
        return true;
      });
    }

    setFiltered(data);
  };

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const getCorrectAnswerText = (q: any) => {
    if (!q) return "No correct answer recorded";

    const key = String(q.correct_answer || "")
      .trim()
      .toLowerCase()
      .replace(".", "");

    const answerMap: any = {
      option_a: q.option_a,
      a: q.option_a,
      optiona: q.option_a,

      option_b: q.option_b,
      b: q.option_b,
      optionb: q.option_b,

      option_c: q.option_c,
      c: q.option_c,
      optionc: q.option_c,

      option_d: q.option_d,
      d: q.option_d,
      optiond: q.option_d,
    };

    return answerMap[key] || q.correct_answer || "No correct answer recorded";
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-[1.8rem] border bg-card p-5 shadow-soft sm:rounded-3xl sm:p-8">
          <p className="text-sm uppercase tracking-widest text-accent">
            Tutor Review
          </p>
          <h1 className="font-serif text-3xl text-primary sm:text-5xl">
            Student Mistakes
          </h1>
          <p className="mt-2 text-muted-foreground">
            Review all mistakes from your assigned students.
          </p>
        </div>

        {/* Student Select */}
        <div className="rounded-[1.8rem] border bg-card p-5 shadow-soft sm:rounded-2xl sm:p-6">
          <label className="text-sm font-semibold">Select Student</label>

          <select
            className="mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}

          > {students.length === 0 && (
            <option value="">No assigned students</option>
          )}
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filters */}
        <div className="grid gap-3 sm:flex sm:flex-wrap">
          {["all", "24h", "7d", "30d"].map((f) => (
            <Button
              type="button"
              key={f}
              className="w-full rounded-2xl sm:w-auto"
              variant={timeFilter === f ? "default" : "outline"}
              onClick={() => {
                setTimeFilter(f);
                setPage(1);
              }}
            >
              {f}
            </Button>
          ))}
        </div>

        {/* Mistakes */}
        <div className="space-y-6">
          {paginated.length === 0 ? (
            <div className="rounded-[1.8rem] border bg-card p-6 text-center text-sm leading-7 text-muted-foreground shadow-soft">
              No mistakes found.
            </div>
          ) : (
            paginated.map((a, i) => {
              const q = a.questions;

              return (
                <div
                  key={a.id}
                  className="rounded-[1.8rem] border bg-card p-5 shadow-soft sm:rounded-2xl sm:p-6"
                >
                  <div className="mb-3 flex flex-wrap gap-2 text-xs">
                    <span className="bg-secondary px-3 py-1 rounded-full">
                      {q?.grade}
                    </span>
                    <span className="bg-secondary px-3 py-1 rounded-full">
                      {q?.skill}
                    </span>
                    <span className="bg-secondary px-3 py-1 rounded-full">
                      {q?.difficulty}
                    </span>
                    <span className="bg-secondary px-3 py-1 rounded-full">
                      {new Date(a.created_at).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-base font-semibold leading-7 text-primary">
                    {i + 1}. {q?.question_text}
                  </p>

                  <div className="mt-3 grid gap-3 text-sm leading-7 md:grid-cols-2">
                    <p>A. {q?.option_a}</p>
                    <p>B. {q?.option_b}</p>
                    <p>C. {q?.option_c}</p>
                    <p>D. {q?.option_d}</p>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-7 text-red-700">
                      Student: {a.selected_answer}
                    </div>

                    <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm leading-7 text-green-700">
                      Correct: {getCorrectAnswerText(q)}
                    </div>
                  </div>

                  {q?.explanation && (
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      {q.explanation}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Prev
            </Button>

            <span className="px-4 py-2">
              {page} / {totalPages}
            </span>

            <Button
              type="button"
              variant="outline"
              className="rounded-2xl"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorMistakes;