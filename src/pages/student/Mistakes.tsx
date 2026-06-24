import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  EyeOff,
  Sparkles,
  Target,
  XCircle,
} from "lucide-react";

const Mistakes = () => {
  const [mistakes, setMistakes] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [canViewAnswers, setCanViewAnswers] = useState(false);

  useEffect(() => {
    fetchMistakes();
  }, []);

  const fetchMistakes = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("can_view_answers")
      .eq("id", user.id)
      .maybeSingle();

    setCanViewAnswers(profile?.can_view_answers === true);

    const { data, error } = await supabase
      .from("attempts")
      .select("*, questions(*)")
      .eq("user_id", user.id)
      .eq("is_correct", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    const mistakeData = data || [];
    setMistakes(mistakeData);

    const skillCount: any = {};

    mistakeData.forEach((m: any) => {
      const skill = m.questions?.skill || "Other";
      skillCount[skill] = (skillCount[skill] || 0) + 1;
    });

    setStats(skillCount);
  };

  const getCorrectAnswerText = (question: any) => {
    if (!question) return "";

    if (question.correct_answer === "option_a") return question.option_a;
    if (question.correct_answer === "option_b") return question.option_b;
    if (question.correct_answer === "option_c") return question.option_c;
    if (question.correct_answer === "option_d") return question.option_d;

    return question.correct_answer;
  };

  const strongestWeakArea =
    Object.entries(stats).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] ||
    "Keep practising";

  return (
    <div className="min-h-screen overflow-hidden bg-[#fbfaff] px-4 py-6 sm:px-6 sm:py-14">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_15%,#f0eaff_0%,transparent_28%),radial-gradient(circle_at_85%_75%,#fff1bd_0%,transparent_30%)]" />

      <div
        data-guide="mistakes-review"
        className="relative z-10 mx-auto max-w-[1100px] space-y-8"
      >
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[2rem] border border-[#eee8ff] bg-white p-5 shadow-[0_35px_120px_rgba(66,56,120,0.10)] sm:rounded-[3rem] sm:p-10">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#f0eaff]" />
          <div className="absolute bottom-[-80px] left-[-80px] h-56 w-56 rounded-full bg-[#fff1bd]/70" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_0.7fr] lg:items-end">
            <div>
              <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]">
                <Sparkles className="h-5 w-5" />
                Student Review
              </p>

              <h1 className="mt-5 font-poppins text-[2.35rem] font-black leading-[1.04] tracking-[-0.025em] text-primary min-[390px]:text-[2.7rem] sm:text-[4.8rem] sm:leading-[0.95] lg:text-[5.4rem]">
                Mistakes
                <br />
                become maps.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-primary/60 sm:text-lg">
                Review incorrect answers, spot weak areas, and turn every mistake
                into your next improvement path.
              </p>
            </div>

            <motion.div
              whileHover={{ y: -8, rotate: 1.5 }}
              className="rounded-[1.6rem] bg-[#fbfaff] p-5 shadow-[0_18px_55px_rgba(66,56,120,0.09)] sm:rounded-[2.2rem] sm:p-6"
            >
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8d73ff]">
                Current Focus
              </p>

              <div className="mt-5 flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f6f1ff] text-[#8d73ff]">
                  <Target className="h-6 w-6" />
                </div>

                <div>
                  <p className="font-poppins text-2xl font-black text-primary">
                    {strongestWeakArea}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-primary/55">
                    This is your most frequent mistake area right now.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* WEAK AREAS */}
        <motion.section
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          className="rounded-[2rem] bg-white p-5 shadow-[0_25px_80px_rgba(66,56,120,0.10)] sm:rounded-[2.5rem] sm:p-7"
        >
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#8d73ff]">
                Weak Areas
              </p>

              <h2 className="mt-3 font-poppins text-3xl font-black text-primary">
                What to review next
              </h2>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff6da] text-[#d4a100]">
              <AlertCircle className="h-6 w-6" />
            </div>
          </div>

          {Object.keys(stats).length === 0 ? (
            <p className="text-sm text-primary/55">No weak areas yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {Object.entries(stats).map(([skill, count]: any, i) => (
                <motion.div
                  key={skill}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -5, rotate: i % 2 === 0 ? -0.8 : 0.8 }}
                  className="rounded-[2rem] bg-[#fbfaff] p-5"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="font-poppins text-lg font-black text-primary">
                      {skill}
                    </p>

                    <span className="rounded-full bg-[#f6f1ff] px-3 py-1 text-sm font-black text-[#8d73ff]">
                      {count}
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-[#eee9ff]">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{
                        width: `${Math.min(Number(count) * 18, 100)}%`,
                      }}
                      viewport={{ once: false }}
                      transition={{ duration: 0.8, delay: i * 0.06 }}
                      className="h-full rounded-full bg-[#8d73ff]"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* ANSWERS HIDDEN NOTICE */}
        {!canViewAnswers && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            className="flex gap-4 rounded-[2rem] bg-white/90 p-5 shadow-[0_18px_55px_rgba(66,56,120,0.08)]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f6f1ff] text-[#8d73ff]">
              <EyeOff className="h-5 w-5" />
            </div>

            <div>
              <p className="font-poppins text-lg font-black text-primary">
                Answers are hidden for now.
              </p>
              <p className="mt-1 text-sm leading-7 text-primary/55">
                Your tutor will review these questions with you during the lesson.
              </p>
            </div>
          </motion.div>
        )}

        {/* MISTAKES */}
        {mistakes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2.5rem] bg-white p-10 text-center shadow-[0_25px_80px_rgba(66,56,120,0.10)]"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f6f1ff] text-[#8d73ff]">
              <CheckCircle2 className="h-7 w-7" />
            </div>

            <h2 className="mt-5 font-poppins text-2xl font-black text-primary">
              No mistakes yet.
            </h2>

            <p className="mt-2 text-sm leading-7 text-primary/55">
              Practice more to see your review list here.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {mistakes.map((attempt, i) => {
                const question = attempt.questions;
                const correctText = getCorrectAnswerText(question);

                return (
                  <motion.div
                    key={attempt.id || i}
                    initial={{ opacity: 0, y: 28, rotate: i % 2 === 0 ? -0.6 : 0.6 }}
                    whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                    viewport={{ once: false, amount: 0.18 }}
                    transition={{ duration: 0.45, delay: i * 0.035 }}
                    whileHover={{
                      y: -7,
                      rotate: i % 2 === 0 ? -0.5 : 0.5,
                    }}
                    className="group relative overflow-hidden rounded-[2rem] bg-white p-5 shadow-[0_22px_70px_rgba(66,56,120,0.10)] transition-all duration-300 hover:shadow-[0_30px_90px_rgba(141,115,255,0.18)] sm:rounded-[2.5rem] sm:p-7"
                  >
                    <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#f0eaff]" />

                    <div className="relative z-10">
                      <div className="mb-5 flex flex-wrap gap-2 text-xs">
                        {[
                          question?.exam_type,
                          question?.grade,
                          question?.skill,
                          question?.difficulty,
                          `Attempted ${new Date(attempt.created_at).toLocaleString()}`,
                        ].map(
                          (tag) =>
                            tag && (
                              <span
                                key={tag}
                                className="rounded-full bg-[#f6f1ff] px-3 py-1 font-bold text-[#8d73ff]"
                              >
                                {tag}
                              </span>
                            )
                        )}
                      </div>

                      {question?.passage && (
                        <div className="mb-6 max-h-[45vh] overflow-y-auto rounded-[1.5rem] bg-[#fbfaff] p-4 sm:rounded-[2rem] sm:p-5">
                          <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-[#8d73ff]">
                            Passage
                          </p>

                          <p className="whitespace-pre-line text-sm leading-7 text-primary/60">
                            {question.passage}
                          </p>
                        </div>
                      )}

                      <p className="mb-5 text-base font-black leading-8 text-primary sm:text-lg">
                        {i + 1}. {question?.question_text}
                      </p>

                      <div className="mb-5 grid gap-3 text-sm leading-7 md:grid-cols-2">
                        <OptionCard label="A" text={question?.option_a} />
                        <OptionCard label="B" text={question?.option_b} />
                        <OptionCard label="C" text={question?.option_c} />
                        <OptionCard label="D" text={question?.option_d} />
                      </div>

                      <div
                        className={
                          canViewAnswers
                            ? "grid gap-3 sm:grid-cols-2"
                            : "grid gap-3"
                        }
                      >
                        <AnswerBox
                          tone="red"
                          title="Student answer"
                          text={attempt.selected_answer || "No answer recorded"}
                        />

                        {canViewAnswers && (
                          <AnswerBox
                            tone="green"
                            title="Correct answer"
                            text={correctText}
                          />
                        )}
                      </div>

                      {canViewAnswers && question?.explanation && (
                        <div className="mt-5 rounded-[2rem] bg-[#fbfaff] p-5">
                          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#8d73ff]">
                            Explanation
                          </p>

                          <p className="mt-3 text-sm leading-7 text-primary/60">
                            {question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

function OptionCard({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-2xl bg-[#fbfaff] p-4 text-sm leading-7 text-primary/70">
      <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white font-black text-[#8d73ff]">
        {label}
      </span>
      {text}
    </div>
  );
}

function AnswerBox({
  tone,
  title,
  text,
}: {
  tone: "red" | "green";
  title: string;
  text: string;
}) {
  const styles =
    tone === "red"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-green-200 bg-green-50 text-green-700";

  const Icon = tone === "red" ? XCircle : CheckCircle2;

  return (
    <div className={`rounded-2xl border p-4 text-sm leading-7 ${styles}`}>
      <div className="mb-2 flex items-center gap-2 font-black">
        <Icon className="h-5 w-5" />
        {title}
      </div>
      <p>{text}</p>
    </div>
  );
}

export default Mistakes;
