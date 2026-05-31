import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

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
          (now.getTime() - created.getTime()) /
          (1000 * 60 * 60 * 24);

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

    return (
      answerMap[key] ||
      q.correct_answer ||
      "No correct answer recorded"
    );
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#fbfaff] px-4 py-8 sm:px-6 sm:py-14">
      {/* background glow */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_15%,#f0eaff_0%,transparent_28%),radial-gradient(circle_at_85%_75%,#fff1bd_0%,transparent_30%)]" />

      <div className="relative z-10 mx-auto max-w-6xl space-y-8">

        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{
            opacity: 1,
            y: [0, -4, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative overflow-hidden rounded-[3rem] bg-white/92 p-7 shadow-[0_25px_80px_rgba(66,56,120,0.12)] backdrop-blur-xl sm:p-10"
        >
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#f0eaff]" />

          <div className="relative z-10">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]">
              Tutor Review
            </p>

            <h1 className="mt-4 font-poppins text-4xl font-black leading-[0.95] text-primary sm:text-6xl">
              Student
              <br />
              mistakes.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-primary/60">
              Review incorrect answers, identify weak areas,
              and guide students more effectively.
            </p>
          </div>
        </motion.div>

        {/* STUDENT SELECT */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ y: -4 }}
          className="rounded-[2.2rem] bg-white/95 p-6 shadow-[0_18px_55px_rgba(66,56,120,0.08)] backdrop-blur-xl"
        >
          <label className="text-sm font-semibold text-primary">
            Select Student
          </label>

          <select
            className="mt-3 h-14 w-full rounded-2xl border border-primary/10 bg-[#fbfaff] px-5 text-base outline-none transition focus:border-[#8d73ff] focus:ring-4 focus:ring-[#8d73ff]/10"
            value={selectedStudentId}
            onChange={(e) =>
              setSelectedStudentId(e.target.value)
            }
          >
            {students.length === 0 && (
              <option value="">
                No assigned students
              </option>
            )}

            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </motion.div>

        {/* FILTERS */}
        <div className="flex flex-wrap gap-3">
          {["all", "24h", "7d", "30d"].map((f) => (
            <Button
              type="button"
              key={f}
              className={`rounded-2xl px-6 font-bold transition-all duration-300 ${
                timeFilter === f
                  ? "bg-[#8d73ff] text-white shadow-[0_12px_30px_rgba(141,115,255,0.35)]"
                  : "border-primary/10 bg-white text-primary hover:-translate-y-1 hover:bg-[#f6f1ff]"
              }`}
              variant={
                timeFilter === f ? "default" : "outline"
              }
              onClick={() => {
                setTimeFilter(f);
                setPage(1);
              }}
            >
              {f}
            </Button>
          ))}
        </div>

        {/* MISTAKES */}
        <div className="space-y-6">
          {paginated.length === 0 ? (
            <div className="rounded-[2.2rem] bg-white/95 p-10 text-center shadow-[0_18px_55px_rgba(66,56,120,0.08)]">
              <p className="text-sm leading-7 text-muted-foreground">
                No mistakes found.
              </p>
            </div>
          ) : (
            paginated.map((a, i) => {
              const q = a.questions;

              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{
                    duration: 0.45,
                    delay: i * 0.04,
                  }}
                  whileHover={{
                    y: -6,
                    rotate:
                      i % 2 === 0 ? -0.6 : 0.6,
                  }}
                  className="
                    group
                    relative
                    overflow-hidden
                    rounded-[2.2rem]
                    bg-white/95
                    p-6
                    shadow-[0_18px_55px_rgba(66,56,120,0.08)]
                    transition-all
                    duration-300
                    hover:shadow-[0_25px_70px_rgba(141,115,255,0.18)]
                    backdrop-blur-xl
                  "
                >
                  {/* glow */}
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#f0eaff]" />

                  <div className="relative z-10">

                    {/* tags */}
                    <div className="mb-4 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-[#f6f1ff] px-3 py-1 font-semibold text-[#8d73ff]">
                        {q?.grade}
                      </span>

                      <span className="rounded-full bg-[#f6f1ff] px-3 py-1 font-semibold text-[#8d73ff]">
                        {q?.skill}
                      </span>

                      <span className="rounded-full bg-[#f6f1ff] px-3 py-1 font-semibold text-[#8d73ff]">
                        {q?.difficulty}
                      </span>

                      <span className="rounded-full bg-[#f6f1ff] px-3 py-1 font-semibold text-[#8d73ff]">
                        {new Date(
                          a.created_at
                        ).toLocaleString()}
                      </span>
                    </div>

                    {/* question */}
                    <p className="max-w-4xl text-base font-semibold leading-7 text-primary">
                      {i + 1}. {q?.question_text}
                    </p>

                    {/* options */}
                    <div className="mt-4 grid gap-3 text-sm leading-7 md:grid-cols-2">

                      <p className="rounded-2xl bg-[#fbfaff] p-4">
                        A. {q?.option_a}
                      </p>

                      <p className="rounded-2xl bg-[#fbfaff] p-4">
                        B. {q?.option_b}
                      </p>

                      <p className="rounded-2xl bg-[#fbfaff] p-4">
                        C. {q?.option_c}
                      </p>

                      <p className="rounded-2xl bg-[#fbfaff] p-4">
                        D. {q?.option_d}
                      </p>
                    </div>

                    {/* answers */}
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">

                      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-7 text-red-700">
                        Student:
                        <div className="mt-1 font-semibold">
                          {a.selected_answer}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm leading-7 text-green-700">
                        Correct:
                        <div className="mt-1 font-semibold">
                          {getCorrectAnswerText(q)}
                        </div>
                      </div>
                    </div>

                    {/* explanation */}
                    {q?.explanation && (
                      <div className="mt-4 rounded-2xl bg-[#fbfaff] p-4">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8d73ff]">
                          Explanation
                        </p>

                        <p className="mt-2 text-sm leading-7 text-primary/60">
                          {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-4">

            <Button
              type="button"
              variant="outline"
              className="rounded-2xl border-primary/10 bg-white px-6 transition-all hover:-translate-y-1 hover:bg-[#f6f1ff]"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Prev
            </Button>

            <div className="rounded-2xl bg-white px-5 py-3 text-sm font-bold shadow-[0_10px_30px_rgba(66,56,120,0.06)]">
              {page} / {totalPages}
            </div>

            <Button
              type="button"
              variant="outline"
              className="rounded-2xl border-primary/10 bg-white px-6 transition-all hover:-translate-y-1 hover:bg-[#f6f1ff]"
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