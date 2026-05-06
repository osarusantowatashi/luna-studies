import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

const DAILY_GOAL = 30;

const StudentOverview = () => {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [accuracy, setAccuracy] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [stats, setStats] = useState<any>({});
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [todayCount, setTodayCount] = useState(0);

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

      const today = new Date().toDateString();
      const todayAttempts = allAttempts.filter(
        (a) => new Date(a.created_at).toDateString() === today
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
    <div className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-[2rem] border bg-card p-8 shadow-elegant">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="font-serif text-4xl font-semibold text-primary">
                {loading ? "Loading..." : `Welcome back, ${name} 👋`}
              </h1>

              <p className="mt-2 text-lg text-muted-foreground">
                Here’s your study overview
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-2xl">
              🌙
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border p-6">
              <p className="text-sm font-semibold text-muted-foreground">
                Overall Accuracy
              </p>
              <p className="mt-4 text-5xl font-bold text-primary">
                {accuracy}%
              </p>
            </div>

            <div className="rounded-2xl border p-6">
              <p className="text-sm font-semibold text-muted-foreground">
                Study Streak
              </p>
              <p className="mt-4 text-5xl font-bold text-yellow-500">
                {streak}
              </p>
            </div>

            <div className="rounded-2xl border p-6">
              <p className="text-sm font-semibold text-muted-foreground">
                Questions Solved
              </p>
              <p className="mt-4 text-5xl font-bold text-primary">
                {attempts.length}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border p-7">
              <h2 className="font-serif text-2xl font-semibold text-primary">
                Recommended Practice
              </h2>

              <div className="mt-6 space-y-6">
                <div>
                  <div className="mb-2 flex justify-between text-lg font-medium">
                    <span>Daily Practice Goal</span>
                    <span>
                      {todayCount} / {DAILY_GOAL}
                    </span>
                  </div>

                  <div className="h-3 rounded-full bg-secondary">
                    <div
                      className="h-3 rounded-full bg-primary"
                      style={{ width: `${Math.max(dailyProgress, 8)}%` }}
                    />
                  </div>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Complete 30 questions today to reach your daily target.
                  </p>
                </div>

                <div>
                  <div className="mb-2 flex justify-between text-lg font-medium">
                    <span>Overall Accuracy</span>
                    <span>{accuracy}%</span>
                  </div>

                  <div className="h-3 rounded-full bg-secondary">
                    <div
                      className="h-3 rounded-full bg-yellow-400"
                      style={{ width: `${Math.max(accuracy, 8)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <a href="/practice">
                  <Button>Practice</Button>
                </a>

                <a href="/mistakes">
                  <Button variant="outline">View Mistakes</Button>
                </a>
              </div>
            </div>

            <div className="rounded-2xl border p-7">
              <h2 className="font-serif text-2xl font-semibold text-primary">
                Recent Tutor Feedback
              </h2>

              {latestFeedback ? (
                <>
                  <p className="mt-6 text-lg leading-8 text-muted-foreground">
                    {latestFeedback.message}
                  </p>

                  <p className="mt-6 text-lg font-semibold text-primary">
                    — {feedbackTutorName}
                  </p>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {new Date(latestFeedback.created_at).toLocaleDateString()}
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-6 text-lg leading-8 text-muted-foreground">
                    No tutor feedback yet.
                  </p>

                  <p className="mt-6 text-lg font-semibold text-primary">
                    — Luna Studies
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <a href="/practice">
            <Button className="px-8">Practice</Button>
          </a>

          <a href="/mistakes">
            <Button variant="outline" className="px-8">
              View Mistakes
            </Button>
          </a>

          <a href="/redo-mistakes">
            <Button variant="outline" className="px-8">
              Redo Mistakes
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default StudentOverview;