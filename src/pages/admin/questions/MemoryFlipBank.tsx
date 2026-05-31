import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

const MemoryFlipBank = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [gradeFilter, setGradeFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [languageFilter, setLanguageFilter] = useState("All");

  const fetchItems = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("game_questions")
      .select("*")
      .eq("game_type", "memory_flip")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert("Failed to load Memory Flip bank.");
      setLoading(false);
      return;
    }

    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const grades = ["All", ...new Set(items.map((x) => x.grade).filter(Boolean))];
  const difficulties = ["All", ...new Set(items.map((x) => x.difficulty).filter(Boolean))];
  const languages = ["All", ...new Set(items.map((x) => x.language_pair).filter(Boolean))];

  const filteredItems = useMemo(() => {
    return items.filter((x) => {
      const matchesGrade = gradeFilter === "All" || x.grade === gradeFilter;
      const matchesDifficulty =
        difficultyFilter === "All" || x.difficulty === difficultyFilter;
      const matchesLanguage =
        languageFilter === "All" || x.language_pair === languageFilter;

      return matchesGrade && matchesDifficulty && matchesLanguage;
    });
  }, [items, gradeFilter, difficultyFilter, languageFilter]);

  const getPairs = (item: any) => item.question_data?.pairs || [];

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-accent">
            Games
          </p>

          <h1 className="font-serif text-3xl text-primary sm:text-5xl">
            Memory Flip Bank
          </h1>

          <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
            Review saved Memory Flip word pairs by grade, difficulty, and language pair.
          </p>
        </div>

        <div className="rounded-[1.8rem] border bg-card p-5 shadow-soft sm:p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Grade
              </label>
              <select
                className="w-full rounded-2xl border bg-white px-4 py-3"
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
                Difficulty
              </label>
              <select
                className="w-full rounded-2xl border bg-white px-4 py-3"
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
              >
                {difficulties.map((difficulty) => (
                  <option key={difficulty}>{difficulty}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Language Pair
              </label>
              <select
                className="w-full rounded-2xl border bg-white px-4 py-3"
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
              >
                {languages.map((language) => (
                  <option key={language}>{language}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                className="h-12 w-full rounded-2xl"
                onClick={fetchItems}
                disabled={loading}
              >
                {loading ? "Loading..." : "Refresh"}
              </Button>
            </div>
          </div>

          <p className="mt-5 text-sm text-muted-foreground">
            Showing {filteredItems.length} / {items.length} sets
          </p>
        </div>

        {filteredItems.length === 0 ? (
          <div className="rounded-[1.8rem] border bg-card p-10 text-center text-muted-foreground">
            No Memory Flip sets found.
          </div>
        ) : (
          <div className="space-y-6">
            {filteredItems.map((item) => {
              const pairs = getPairs(item);

              return (
                <div
                  key={item.id}
                  className="rounded-[2rem] border bg-card p-5 shadow-soft sm:p-6"
                >
                  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-primary">
                        {item.grade} · {item.language_pair} · {item.difficulty}
                      </h2>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {pairs.length} pairs
                      </p>
                    </div>

                    <span className="rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-primary">
                      {item.game_type}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {pairs.map((pair: any, index: number) => (
                      <div
                        key={index}
                        className="rounded-2xl border bg-background p-4"
                      >
                        {pair.image_url && (
                          <img
                            src={pair.image_url}
                            alt={pair.image_keyword || pair.left}
                            className="mb-3 h-24 w-full rounded-xl object-cover"
                          />
                        )}

                        <p className="font-semibold text-primary">
                          {pair.left} ↔ {pair.right}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Image: {pair.image_keyword || "-"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryFlipBank;