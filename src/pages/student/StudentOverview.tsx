import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Flame,
  MessageCircle,
  Sparkles,
  Target,
  Calendar,
} from "lucide-react";

const DAILY_GOAL = 30;

const StudentOverview = () => {
  type Attempt = {
    created_at: string;
    is_correct: boolean;
    questions?: {
      skill?: string;
    };
  };

  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [accuracy, setAccuracy] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [stats, setStats] = useState<any>({});
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [todayCount, setTodayCount] = useState(0);

  const [nextLesson, setNextLesson] = useState<any | null>(null);
  const [lessonTutorName, setLessonTutorName] = useState("Tutor");

  const [latestFeedback, setLatestFeedback] = useState<any | null>(null);
  const [feedbackTutorName, setFeedbackTutorName] = useState("Tutor");

  const calculateStreak = (attempts: any[]) => {
    if (!attempts.length) return 0;

    const dates = attempts.map((a) => new Date(a.created_at).toDateString());

    const uniqueDates = [...new Set(dates)].sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    let streak = 0;
    const today = new Date();

    for (const d of uniqueDates) {
      const date = new Date(d);
      const diff = Math.floor(
        (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diff === streak) streak++;
      else break;
    }

    return streak;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: lessonData, error: lessonError } = await supabase
        .from("tutor_lessons")
        .select("*")
        .eq("student_id", user.id)
        .in("status", ["pending", "reschedule_requested"])
        .order("lesson_date", { ascending: true });

      if (lessonError) {
        console.error("Next lesson error:", lessonError);
      }

      console.log("CURRENT STUDENT ID:", user.id);
      console.log("LESSON DATA:", lessonData);
      console.log("LESSON ERROR:", lessonError);

      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);

      const upcomingLessons = (lessonData || []).filter((lesson) => {
        const effectiveDate = lesson.rescheduled_date || lesson.lesson_date;
        const lessonDate = new Date(effectiveDate);
        lessonDate.setHours(0, 0, 0, 0);

        return lessonDate >= todayDate;
      });

      const next = upcomingLessons.sort((a, b) => {
        const dateA = new Date(a.rescheduled_date || a.lesson_date).getTime();
        const dateB = new Date(b.rescheduled_date || b.lesson_date).getTime();

        return dateA - dateB;
      })[0];

      setNextLesson(next || null);

      if (next?.tutor_id) {
        const { data: tutorProfile } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", next.tutor_id)
          .maybeSingle();

        setLessonTutorName(tutorProfile?.name || "Tutor");
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .maybeSingle();

      setName(profile?.name || "Luna");

      const { data: attemptData } = await supabase
        .from("attempts")
        .select("*, questions(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const allAttempts = attemptData || [];
      setAttempts(allAttempts);

      const correct = allAttempts.filter((a) => a.is_correct).length;
      const wrong = allAttempts.length - correct;

      setMistakes(wrong);

      setAccuracy(
        allAttempts.length === 0
          ? 0
          : Math.round((correct / allAttempts.length) * 100)
      );

      setStreak(calculateStreak(allAttempts));

      const todayString = new Date().toDateString();

      const todayAttempts = allAttempts.filter(
        (a) => new Date(a.created_at).toDateString() === todayString
      );

      setTodayCount(todayAttempts.length);

      const skillCount: any = {};

      allAttempts.forEach((a) => {
        if (!a.is_correct) {
          const skill = a.questions?.skill || "Other";
          skillCount[skill] = (skillCount[skill] || 0) + 1;
        }
      });

      setStats(skillCount);

      const { data: feedback } = await supabase
        .from("tutor_feedback")
        .select("*")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setLatestFeedback(feedback || null);

      if (feedback?.tutor_id) {
        const { data: tutorProfile } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", feedback.tutor_id)
          .maybeSingle();

        setFeedbackTutorName(tutorProfile?.name || "Tutor");
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const weakestSkill =
    Object.entries(stats).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] ||
    "Keep practising";

  const dailyProgress = Math.min(
    Math.round((todayCount / DAILY_GOAL) * 100),
    100
  );

  return (
    <div className="min-h-screen overflow-hidden bg-[#fbfaff] px-4 py-6 sm:px-6 sm:py-14">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_15%,#f0eaff_0%,transparent_28%),radial-gradient(circle_at_85%_75%,#fff1bd_0%,transparent_30%)]" />

      <div className="relative z-10 mx-auto max-w-[1200px] space-y-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-[#eee8ff] bg-white p-5 shadow-[0_35px_120px_rgba(66,56,120,0.10)] sm:rounded-[3rem] sm:p-10">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#f0eaff]" />
          <div className="absolute bottom-[-80px] left-[-80px] h-56 w-56 rounded-full bg-[#fff1bd]/70" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-end">
            <div>
              <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]">
                <Sparkles className="h-5 w-5" />
                Student Dashboard
              </p>

              <h1 className="mt-5 font-poppins text-[2.35rem] font-black leading-[1.04] tracking-[-0.025em] text-primary min-[390px]:text-[2.7rem] sm:text-[4.8rem] sm:leading-[0.95] lg:text-[5.4rem]">
                {loading ? (
                  <span className="block h-24 w-72 animate-pulse rounded-[2rem] bg-[#f6f1ff]" />
                ) : (
                  <>
                    Welcome back,
                    <br />
                    {name}.
                  </>
                )}
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-primary/60 sm:text-lg">
                Track your learning progress, review weak areas, and keep your
                daily practice streak alive.
              </p>
            </div>

            <motion.div
              whileHover={{ y: -8, rotate: 1.5 }}
              className="relative rounded-[1.6rem] bg-[#fbfaff] p-5 shadow-[0_18px_55px_rgba(66,56,120,0.09)] sm:rounded-[2.2rem] sm:p-6"
            >
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8d73ff]">
                Today’s Goal
              </p>

              <div className="mt-5">
                <div className="mb-3 flex items-end justify-between">
                  <p className="font-poppins text-4xl font-black text-primary">
                    {todayCount}
                    <span className="text-lg text-primary/40">
                      {" "}
                      / {DAILY_GOAL}
                    </span>
                  </p>

                  <p className="text-sm font-bold text-[#8d73ff]">
                    {dailyProgress}%
                  </p>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-[#eee9ff]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(dailyProgress, 8)}%` }}
                    transition={{ duration: 0.9 }}
                    className="h-full rounded-full bg-[#8d73ff]"
                  />
                </div>

                <p className="mt-3 text-sm leading-6 text-primary/55">
                  Complete 30 questions today to reach your daily target.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <motion.section
          initial={{ opacity: 0, x: -35 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false }}
          whileHover={{ y: -6, rotate: -0.5 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-white p-7 shadow-[0_22px_65px_rgba(66,56,120,0.10)]"
        >
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#f0eaff]" />

          <div className="relative z-10">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-[#8d73ff]">
                  Next Lesson
                </p>

                {nextLesson ? (
                  <h2 className="mt-3 font-poppins text-3xl font-black text-primary">
                    {nextLesson.rescheduled_date || nextLesson.lesson_date}
                  </h2>
                ) : (
                  <h2 className="mt-3 font-poppins text-3xl font-black text-primary">
                    No upcoming lesson
                  </h2>
                )}
              </div>

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f6f1ff] text-[#8d73ff]">
                <Calendar className="h-6 w-6" />
              </div>
            </div>

            {nextLesson ? (
              <>
                <p className="mt-3 text-sm leading-7 text-primary/60">
                  With {lessonTutorName} · {nextLesson.hours} hour(s)
                </p>

                {nextLesson.lesson_contents && (
                  <div className="mt-5 rounded-2xl bg-[#fbfaff] p-4 text-sm font-semibold text-primary/70">
                    {nextLesson.lesson_contents}
                  </div>
                )}

                {nextLesson.status === "reschedule_requested" && (
                  <div className="mt-4 rounded-2xl bg-blue-50 p-4 text-sm font-semibold text-blue-700">
                    Reschedule requested: {nextLesson.lesson_date} →{" "}
                    {nextLesson.rescheduled_date}
                  </div>
                )}
              </>
            ) : (
              <p className="mt-3 text-sm leading-7 text-primary/60">
                Your next lesson will appear here once your tutor adds it.
              </p>
            )}
          </div>
        </motion.section>

        <div data-guide="overview-stats" className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Overall Accuracy",
              value: `${accuracy}%`,
              icon: BarChart3,
              tone: "purple",
            },
            {
              title: "Study Streak",
              value: streak,
              icon: Flame,
              tone: "yellow",
            },
            {
              title: "Questions Solved",
              value: attempts.length,
              icon: BookOpen,
              tone: "purple",
            },
          ].map((item, i) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -8, rotate: i % 2 === 0 ? -1.5 : 1.5 }}
                className="rounded-[2.2rem] bg-white/95 p-6 shadow-[0_18px_55px_rgba(66,56,120,0.08)] backdrop-blur-xl"
              >
                <div
                  className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${
                    item.tone === "yellow"
                      ? "bg-[#fff6da] text-[#d4a100]"
                      : "bg-[#f6f1ff] text-[#8d73ff]"
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </div>

                <p className="mb-1 text-sm font-bold text-primary/50">
                  {item.title}
                </p>

                <h3 className="font-poppins text-4xl font-black text-primary">
                  {loading ? "—" : item.value}
                </h3>
              </motion.div>
            );
          })}
        </div>

        <div
          data-guide="overview-practice-feedback"
          className="grid gap-6 lg:grid-cols-[1fr_0.9fr]"
        >
          <motion.section
            initial={{ opacity: 0, x: -35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            className="rounded-[2.5rem] bg-white/95 p-7 shadow-[0_22px_65px_rgba(66,56,120,0.10)] backdrop-blur-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-[#8d73ff]">
                  Recommended Practice
                </p>

                <h2 className="mt-3 font-poppins text-3xl font-black text-primary">
                  Focus on {weakestSkill}
                </h2>
              </div>

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f6f1ff] text-[#8d73ff]">
                <Target className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-7 space-y-6">
              <ProgressRow
                title="Daily Practice Goal"
                value={`${todayCount} / ${DAILY_GOAL}`}
                percent={dailyProgress}
                color="bg-[#8d73ff]"
              />

              <ProgressRow
                title="Overall Accuracy"
                value={`${accuracy}%`}
                percent={accuracy}
                color="bg-[#ffd84d]"
              />
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/practice" className="flex-1">
                <Button className="group h-14 w-full rounded-2xl bg-primary text-base font-black shadow-[0_18px_45px_rgba(10,36,84,0.20)]">
                  Practice
                  <ArrowRight className="ml-2 h-5 w-5 transition group-hover:translate-x-1" />
                </Button>
              </Link>

              <Link to="/mistakes" className="flex-1">
                <Button
                  variant="outline"
                  className="h-14 w-full rounded-2xl border-primary/10 bg-white text-base font-black text-primary transition hover:-translate-y-1 hover:bg-[#f6f1ff]"
                >
                  View Mistakes
                </Button>
              </Link>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, x: 35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            whileHover={{ y: -6, rotate: 0.7 }}
            className="relative overflow-hidden rounded-[2.5rem] bg-white/95 p-7 shadow-[0_22px_65px_rgba(66,56,120,0.10)] backdrop-blur-xl"
          >
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#f0eaff]" />

            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.22em] text-[#8d73ff]">
                    Tutor Feedback
                  </p>

                  <h2 className="mt-3 font-poppins text-3xl font-black text-primary">
                    Latest message
                  </h2>
                </div>

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#fff6da] text-[#d4a100]">
                  <MessageCircle className="h-6 w-6" />
                </div>
              </div>

              {latestFeedback ? (
                <>
                  <p className="mt-7 text-base leading-8 text-primary/65">
                    “{latestFeedback.message}”
                  </p>

                  <div className="mt-7 rounded-2xl bg-[#fbfaff] p-5">
                    <p className="font-poppins text-lg font-black text-primary">
                      {feedbackTutorName}
                    </p>

                    <p className="mt-1 text-sm text-primary/45">
                      {new Date(latestFeedback.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <p className="mt-7 text-base leading-8 text-primary/65">
                    No tutor feedback yet.
                  </p>

                  <div className="mt-7 rounded-2xl bg-[#fbfaff] p-5">
                    <p className="font-poppins text-lg font-black text-primary">
                      Luna Studies
                    </p>

                    <p className="mt-1 text-sm text-primary/45">
                      Keep practising regularly.
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.section>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          className="flex flex-col gap-3 rounded-[2.2rem] bg-white/80 p-4 shadow-[0_18px_55px_rgba(66,56,120,0.08)] backdrop-blur-xl sm:flex-row sm:justify-center"
        >
          <Link to="/practice" className="w-full sm:w-auto">
            <Button className="h-13 w-full rounded-2xl bg-[#8d73ff] px-8 font-black sm:w-auto">
              Practice
            </Button>
          </Link>

          <Link to="/mistakes" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="h-13 w-full rounded-2xl border-primary/10 bg-white px-8 font-black text-primary transition hover:-translate-y-1 hover:bg-[#f6f1ff] sm:w-auto"
            >
              View Mistakes
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

const ProgressRow = ({
  title,
  value,
  percent,
  color,
}: {
  title: string;
  value: string;
  percent: number;
  color: string;
}) => {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-4">
        <p className="font-bold text-primary">{title}</p>

        <p className="font-poppins text-lg font-black text-primary">{value}</p>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-[#eee9ff]">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${Math.max(percent, 8)}%` }}
          viewport={{ once: false }}
          transition={{ duration: 0.8 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
};

export default StudentOverview;
