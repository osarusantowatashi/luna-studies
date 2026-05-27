import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Check, X, Wand2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function AdminMemoryFlip() {
  const [grade, setGrade] = useState("Grade 1");
  const [difficulty, setDifficulty] = useState("Easy");
  const [pairCount, setPairCount] = useState("8");
  const [languagePair, setLanguagePair] = useState("zh_en");

  const [images, setImages] = useState<any[]>([]);
  const [status, setStatus] = useState("needs_review");
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [keywordDrafts, setKeywordDrafts] = useState<Record<string, string>>({});

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error("Please log in again as admin.");
    return session.access_token;
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
          pairCount: Number(pairCount),
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

  const loadImages = async () => {
    setImageLoading(true);
    setErrorMsg("");

    try {
      const token = await getToken();

      const res = await fetch(`${API_URL}/api/admin/vocab-images?status=${status}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load images.");

      setImages(data.images || []);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load images.");
    } finally {
      setImageLoading(false);
    }
  };

  const action = async (id: string, type: "approve" | "reject" | "regenerate") => {
    setErrorMsg("");

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
    }
  };

  const changeKeyword = async (id: string) => {
    const keyword = keywordDrafts[id]?.trim();
    if (!keyword) return;

    setErrorMsg("");

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
    }
  };

  useEffect(() => {
    loadImages();
  }, [status]);

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
            Generate Memory Flip pairs and approve LUNA vocabulary images before they become permanent.
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
            </select>

            <select value={pairCount} onChange={(e) => setPairCount(e.target.value)} className="rounded-2xl border bg-white px-4 py-3">
              <option value="6">6 pairs</option>
              <option value="8">8 pairs</option>
              <option value="10">10 pairs</option>
              <option value="12">12 pairs</option>
            </select>
          </div>

          <Button onClick={generate} disabled={loading} className="mt-5 h-12 w-full rounded-2xl">
            <Wand2 className="mr-2 h-4 w-4" />
            {loading ? "Generating..." : "Generate Memory Flip"}
          </Button>
        </div>

        <div className="rounded-[2rem] border bg-card p-6 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-bold text-primary">Image Review</h2>

            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-2xl border bg-white px-4 py-3">
              <option value="needs_review">Needs Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
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
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((item) => (
                <div key={item.id} className="rounded-[1.5rem] border bg-white p-4 shadow-sm">
                  <img src={item.image_url} alt={item.keyword} className="h-48 w-full rounded-2xl object-cover" />

                  <div className="mt-4">
                    <p className="text-lg font-bold text-primary">{item.keyword}</p>
                    <p className="text-xs text-muted-foreground">
                      Status: {item.status} · Generated: {item.generation_count}/2
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <Button onClick={() => action(item.id, "approve")} className="rounded-xl">
                      <Check className="h-4 w-4" />
                    </Button>

                    <Button variant="outline" onClick={() => action(item.id, "regenerate")} className="rounded-xl" disabled={item.generation_count >= 2}>
                      <RefreshCcw className="h-4 w-4" />
                    </Button>

                    <Button variant="destructive" onClick={() => action(item.id, "reject")} className="rounded-xl">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <input
                      value={keywordDrafts[item.id] || ""}
                      onChange={(e) =>
                        setKeywordDrafts((prev) => ({
                          ...prev,
                          [item.id]: e.target.value,
                        }))
                      }
                      placeholder="Change keyword"
                      className="min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm"
                    />

                    <Button variant="outline" onClick={() => changeKeyword(item.id)} className="rounded-xl">
                      Change
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}