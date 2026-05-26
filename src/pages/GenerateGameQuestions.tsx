import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function GenerateGameQuestions() {
  const [grade, setGrade] = useState("Grade 1");
  const [difficulty, setDifficulty] = useState("Easy");
  const [pairCount, setPairCount] = useState("8");
  const [languagePair, setLanguagePair] = useState("zh_en");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const generate = async () => {
    setLoading(true);
    setErrorMsg("");
    setResult(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch(`${API_URL}/api/generate-game-questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          gameType: "memory_flip",
          examType: "English Foundation",
          grade,
          skill: "Vocabulary",
          difficulty,
          pairCount: Number(pairCount),
          languagePair,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate game questions.");
      }

      setResult(data.gameQuestion);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to generate game questions.");
    } finally {
      setLoading(false);
    }
  };

  const languageLabel =
    languagePair === "zh_en"
      ? "Chinese ↔ English"
      : languagePair === "zh_ja"
        ? "Chinese ↔ Japanese"
        : "English ↔ Japanese";

  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-accent">
            Luna Learning Arcade
          </p>

          <h1 className="mt-2 font-serif text-4xl text-primary">
            Generate Game Questions
          </h1>

          <p className="mt-3 text-muted-foreground">
            Generate Memory Flip language pairs using OpenAI and save them into Supabase.
            Students will only read from Supabase.
          </p>
        </div>

        <div className="rounded-[2rem] border bg-card p-6 shadow-soft">
          <div className="grid gap-4 sm:grid-cols-4">
            <select
              value={languagePair}
              onChange={(e) => setLanguagePair(e.target.value)}
              className="rounded-2xl border bg-white px-4 py-3"
            >
              <option value="zh_en">中英 Chinese ↔ English</option>
              <option value="zh_ja">中日 Chinese ↔ Japanese</option>
              <option value="en_ja">英日 English ↔ Japanese</option>
            </select>

            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="rounded-2xl border bg-white px-4 py-3"
            >
              <option>Grade 1</option>
              <option>Grade 2</option>
              <option>Grade 3</option>
              <option>Grade 4</option>
              <option>Grade 5</option>
              <option>Grade 6</option>
            </select>

            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="rounded-2xl border bg-white px-4 py-3"
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>

            <select
              value={pairCount}
              onChange={(e) => setPairCount(e.target.value)}
              className="rounded-2xl border bg-white px-4 py-3"
            >
              <option value="6">6 pairs</option>
              <option value="8">8 pairs</option>
              <option value="10">10 pairs</option>
              <option value="12">12 pairs</option>
            </select>
          </div>

          <div className="mt-4 rounded-2xl bg-secondary/60 p-4 text-sm text-muted-foreground">
            Current setup: <span className="font-semibold text-primary">{languageLabel}</span> · {grade} · {difficulty} · {pairCount} pairs
          </div>

          <Button
            onClick={generate}
            disabled={loading}
            className="mt-5 h-12 w-full rounded-2xl"
          >
            {loading ? "Generating..." : "Generate Memory Flip Questions"}
          </Button>
        </div>

        {errorMsg && (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-red-700">
            {errorMsg}
          </div>
        )}

        {result && (
          <div className="rounded-[2rem] border bg-white p-6 shadow-soft">
            <h2 className="text-xl font-bold text-primary">
              Generated Successfully
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Saved into Supabase game_questions.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-widest text-slate-400">
                  Language
                </p>
                <p className="font-semibold text-primary">
                  {result.language_pair}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-widest text-slate-400">
                  Grade
                </p>
                <p className="font-semibold text-primary">
                  {result.grade}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-widest text-slate-400">
                  Difficulty
                </p>
                <p className="font-semibold text-primary">
                  {result.difficulty}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {result.question_data?.pairs?.map((pair: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4"
                >
                  {pair.image_url && (
                    <img
                      src={pair.image_url}
                      alt={pair.image_keyword || pair.left}
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                  )}

                  <div>
                    <p className="font-semibold text-primary">
                      {pair.left} ↔ {pair.right}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Image: {pair.image_keyword || "-"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}