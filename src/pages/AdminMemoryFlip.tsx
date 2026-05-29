import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Wand2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const statusLabel: Record<string, string> = {
  needs_review: "Needs Review",
  approved: "Approved",
  rejected: "Rejected",
};
const pairCountByDifficulty: Record<string, number> = {

  Easy: 6,

  Medium: 8,

  Hard: 10,

  Advanced: 12,

};

export default function AdminMemoryFlip() {
  const [grade, setGrade] = useState("Grade 1");
  const [difficulty, setDifficulty] = useState("Easy");
  const pairCount = pairCountByDifficulty[difficulty];
  const [languagePair, setLanguagePair] = useState("zh_en");


  const [images, setImages] = useState<any[]>([]);
  const [status, setStatus] = useState("needs_review");
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [keywordDrafts, setKeywordDrafts] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const PAGE_SIZE = 18;

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error("Please log in again as admin.");
    return session.access_token;
  };

  const loadImages = async ({
    nextPage = 0,
    append = false,
    searchText = search,
  } = {}) => {
    setImageLoading(true);
    setErrorMsg("");

    try {
      const token = await getToken();

      const params = new URLSearchParams({
        status,
        page: String(nextPage),
        limit: String(PAGE_SIZE),
        search: searchText.trim(),
      });

      const res = await fetch(`${API_URL}/api/admin/vocab-images?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load images.");

      const newImages = data.images || [];

      setImages((prev) => (append ? [...prev, ...newImages] : newImages));

      if (!append) {
        setSelectedIds([]);
      }

      setPage(nextPage);
      setHasMore(newImages.length === PAGE_SIZE);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load images.");
    } finally {
      setImageLoading(false);
    }
  };

  const generate = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const token = await getToken();

      const res = await fetch(`${API_URL}/api/generate-game-questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gameType: "memory_flip",
          examType: "English Foundation",
          grade,
          skill: "Vocabulary",
          difficulty,
          pairCount,
          languagePair,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate.");

      await loadImages();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to generate.");
    } finally {
      setLoading(false);
    }
  };

  const action = async (id: string, type: "approve" | "reject" | "regenerate") => {
    setErrorMsg("");
    setBusyId(id);

    try {
      const token = await getToken();

      const res = await fetch(`${API_URL}/api/admin/vocab-images/${id}/${type}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed.");

      await loadImages();
    } catch (err: any) {
      setErrorMsg(err.message || "Action failed.");
    } finally {
      setBusyId(null);
    }
  };

  const changeKeyword = async (id: string) => {
    const keyword = keywordDrafts[id]?.trim();
    if (!keyword) return;

    setErrorMsg("");
    setBusyId(id);

    try {
      const token = await getToken();

      const res = await fetch(`${API_URL}/api/admin/vocab-images/${id}/change-keyword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ keyword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change keyword.");

      setKeywordDrafts((prev) => ({ ...prev, [id]: "" }));
      await loadImages();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to change keyword.");
    } finally {
      setBusyId(null);
    }
  };


  const bulkAction = async (
    type: "bulk-approve" | "bulk-reject"
  ) => {
    if (selectedIds.length === 0) return;

    setErrorMsg("");

    try {
      const token = await getToken();

      const res = await fetch(
        `${API_URL}/api/admin/vocab-images/${type}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ids: selectedIds,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Bulk action failed.");
      }

      setImages((prev) =>
        prev.filter((img) => !selectedIds.includes(img.id))
      );

      setSelectedIds([]);

    } catch (err: any) {
      setErrorMsg(err.message || "Bulk action failed.");
    }
  };

  useEffect(() => {
    loadImages({
      nextPage: 0,
      append: false,
      searchText: search,
    });
  }, [status, search]);

  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-accent">
            Memory Flip
          </p>

          <h1 className="mt-2 font-serif text-4xl text-primary">
            Generate & Review
          </h1>

          <p className="mt-3 text-muted-foreground">
            Generate Memory Flip pairs and review LUNA vocabulary images before approval.
          </p>
        </div>

        {errorMsg && (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-red-700">
            {errorMsg}
          </div>
        )}

        <div className="rounded-[2rem] border bg-card p-6 shadow-soft">
          <h2 className="text-xl font-bold text-primary">Generate Questions</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-4">
            <select value={languagePair} onChange={(e) => setLanguagePair(e.target.value)} className="rounded-2xl border bg-white px-4 py-3">
              <option value="zh_en">中英 Chinese ↔ English</option>
              <option value="zh_ja">中日 Chinese ↔ Japanese</option>
              <option value="en_ja">英日 English ↔ Japanese</option>
            </select>

            <select value={grade} onChange={(e) => setGrade(e.target.value)} className="rounded-2xl border bg-white px-4 py-3">
              <option>Grade 1</option>
              <option>Grade 2</option>
              <option>Grade 3</option>
              <option>Grade 4</option>
              <option>Grade 5</option>
              <option>Grade 6</option>
            </select>

            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="rounded-2xl border bg-white px-4 py-3">
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
              <option>Advanced</option>
            </select>

            <div className="rounded-2xl border bg-secondary/60 px-4 py-3 text-sm font-bold text-primary">
              {pairCount} pairs
            </div>
          </div>

          <Button onClick={generate} disabled={loading} className="mt-5 h-12 w-full rounded-2xl">
            <Wand2 className="mr-2 h-4 w-4" />
            {loading ? "Generating..." : "Generate Memory Flip"}
          </Button>
        </div>

        <div className="rounded-[2rem] border bg-card p-6 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-primary">Image Review</h2>

              <div className="mt-3 flex gap-2">
                <Button
                  onClick={() => bulkAction("bulk-approve")}
                  disabled={selectedIds.length === 0}
                >
                  Approve Selected ({selectedIds.length})
                </Button>

                <Button
                  variant="destructive"
                  onClick={() => bulkAction("bulk-reject")}
                  disabled={selectedIds.length === 0}
                >
                  Reject Selected ({selectedIds.length})
                </Button>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Approve good images. Regenerate weak images. Reject unusable ones.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by keyword..."
                className="h-12 rounded-2xl border bg-white px-4 text-sm font-semibold text-primary outline-none"
              />

              <Button
                variant="outline"
                onClick={() =>
                  loadImages({
                    nextPage: 0,
                    append: false,
                    searchText: search,
                  })
                }
                disabled={imageLoading}
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh
              </Button>

              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(0);
                }}
                className="rounded-2xl border bg-white px-4 py-3"
              >
                <option value="needs_review">Needs Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {imageLoading ? (
            <div className="mt-6 rounded-2xl bg-secondary p-8 text-center font-bold text-primary">
              Loading images...
            </div>
          ) : images.length === 0 ? (
            <div className="mt-6 rounded-2xl bg-secondary p-8 text-center text-muted-foreground">
              No images found.
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {images.map((item) => {
                  const isBusy = busyId === item.id;
                  const canRegenerate = Number(item.generation_count || 0) < 2;

                  return (
                    <div
                      key={item.id}
                      className="relative rounded-[1.5rem] border bg-white p-4 shadow-sm"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds((prev) => [...prev, item.id]);
                          } else {
                            setSelectedIds((prev) =>
                              prev.filter((x) => x !== item.id)
                            );
                          }
                        }}
                        className="absolute left-3 top-3 h-5 w-5"
                      />

                      <img
                        src={item.image_url}
                        alt={item.keyword}
                        className="h-48 w-full rounded-2xl object-contain bg-[#FAFAFA]"
                      />

                      <div className="mt-4 space-y-1">
                        <p className="text-lg font-bold text-primary">
                          {item.left_text && item.right_text
                            ? `${item.left_text} ↔ ${item.right_text}`
                            : item.vocab_word || item.keyword}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Image keyword: <span className="font-semibold text-primary">{item.keyword}</span>
                        </p>

                        <p className="text-sm text-muted-foreground">
                          Type: <span className="font-semibold text-primary">{item.image_type || "object"}</span>
                        </p>

                        <p className="text-sm text-muted-foreground">
                          Status: <span className="font-semibold text-primary">{statusLabel[item.status] || item.status}</span>
                        </p>

                        <p className="text-sm text-muted-foreground">
                          Generated: <span className="font-semibold text-primary">{item.generation_count || 0} / 2</span>
                        </p>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-2">
                        <Button
                          onClick={() => action(item.id, "approve")}
                          disabled={isBusy}
                          className="rounded-xl bg-[#082A55]"
                        >
                          Approve
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => action(item.id, "regenerate")}
                          className="rounded-xl"
                          disabled={isBusy || !canRegenerate}
                        >
                          {canRegenerate ? "Regenerate Image" : "Generation Limit Reached"}
                        </Button>

                        <Button
                          variant="destructive"
                          onClick={() => action(item.id, "reject")}
                          className="rounded-xl"
                          disabled={isBusy}
                        >
                          Reject
                        </Button>
                      </div>

                      <div className="mt-4 rounded-2xl bg-secondary p-3">
                        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          Change Keyword
                        </p>

                        <div className="flex gap-2">
                          <input
                            value={keywordDrafts[item.id] || ""}
                            onChange={(e) =>
                              setKeywordDrafts((prev) => ({
                                ...prev,
                                [item.id]: e.target.value,
                              }))
                            }
                            placeholder="e.g. red color swatch"
                            className="min-w-0 flex-1 rounded-xl border bg-white px-3 py-2 text-sm"
                          />

                          <Button
                            variant="outline"
                            onClick={() => changeKeyword(item.id)}
                            className="rounded-xl bg-white"
                            disabled={isBusy}
                          >
                            Change
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {hasMore && (
                <Button
                  onClick={() =>
                    loadImages({
                      nextPage: page + 1,
                      append: true,
                      searchText: search,
                    })
                  }
                  disabled={imageLoading}
                  className="mt-6 h-12 w-full rounded-2xl bg-[#082A55]"
                >
                  {imageLoading ? "Loading..." : "Load More"}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}