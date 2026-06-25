import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Image, Languages, Sparkles } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const grades = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"];
const languageOptions = [
  { key: "en", label: "English" },
  { key: "zh", label: "Chinese" },
  { key: "ja", label: "Japanese" },
];

type VocabularyItem = {
  id: string;
  en: string;
  zh?: string;
  ja?: string;
  image_keyword: string;
  image_type?: string;
  image_url?: string;
  grade: string;
  category?: string;
  status?: string;
  created_at?: string;
};

type GenerationSummary = {
  requested_count?: number;
  generated_count?: number;
  inserted_count?: number;
  skipped_duplicate_count?: number;
  skipped_duplicates?: Array<{
    en?: string;
    image_keyword?: string;
    reason?: string;
  }>;
  existing_conflict_count?: number;
};

export default function SharedVocabularyGenerator() {
  const [grade, setGrade] = useState("Grade 1");
  const [category, setCategory] = useState("food");
  const [count, setCount] = useState("12");
  const [targetLanguages, setTargetLanguages] = useState(["en", "zh", "ja"]);
  const [generateImages, setGenerateImages] = useState(true);
  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [reviewItems, setReviewItems] = useState<VocabularyItem[]>([]);
  const [batchId, setBatchId] = useState("");
  const [summary, setSummary] = useState<GenerationSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const getToken = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error("Please log in again as admin.");
    }

    return session.access_token;
  };

  const toggleLanguage = (language: string) => {
    setTargetLanguages((current) => {
      if (current.includes(language)) {
        const next = current.filter((item) => item !== language);
        return next.length > 0 ? next : current;
      }

      return [...current, language];
    });
  };

  const loadReviewQueue = async () => {
    setReviewLoading(true);

    try {
      const token = await getToken();
      const params = new URLSearchParams({
        status: "needs_review",
        page: "1",
        pageSize: "50",
      });

      const res = await fetch(`${API_URL}/api/admin/game-vocabulary/items?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load review queue.");
      }

      setReviewItems(data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setReviewLoading(false);
    }
  };

  useEffect(() => {
    loadReviewQueue();
  }, []);

  const generate = async () => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    setItems([]);
    setBatchId("");
    setSummary(null);

    try {
      const token = await getToken();

      const res = await fetch(`${API_URL}/api/admin/game-vocabulary/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          grade,
          category,
          count: Number(count),
          targetLanguages,
          generateImages,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate shared vocabulary.");
      }

      setItems(data.items || []);
      setBatchId(data.batchId || "");
      setSummary({
        requested_count: data.requested_count,
        generated_count: data.generated_count,
        inserted_count: data.inserted_count,
        skipped_duplicate_count: data.skipped_duplicate_count,
        skipped_duplicates: data.skipped_duplicates || [],
        existing_conflict_count: data.existing_conflict_count,
      });
      setSuccessMsg(
        `Inserted ${data.inserted_count || data.generated_count || 0} item(s) into review.`
      );
      await loadReviewQueue();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to generate shared vocabulary.");
    } finally {
      setLoading(false);
    }
  };

  const updateReviewStatus = async (itemId: string, status: "approved" | "rejected") => {
    setActionLoadingId(itemId);

    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/admin/game-vocabulary/items/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Failed to mark item ${status}.`);
      }

      setReviewItems((current) => current.filter((item) => item.id !== itemId));
      setItems((current) => current.filter((item) => item.id !== itemId));
    } catch (err: any) {
      setErrorMsg(err.message || `Failed to mark item ${status}.`);
    } finally {
      setActionLoadingId("");
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border bg-card p-5 shadow-soft sm:p-8">
          <p className="text-sm font-bold uppercase tracking-widest text-accent">
            Shared Vocabulary Inbox
          </p>

          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-serif text-3xl text-primary sm:text-5xl">
                Generate & Review
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
                Generate reusable vocabulary, review new items, then approve them into
                the Game Question Bank.
              </p>
            </div>

            <div className="rounded-2xl border bg-secondary/40 px-4 py-3 text-sm text-primary">
              <span className="font-bold">Lifecycle:</span> Generate → Review → Library
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[390px_minmax(0,1fr)]">
          <div className="rounded-[2rem] border bg-card p-5 shadow-soft sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-accent">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-primary">Generator inputs</h2>
                <p className="text-sm text-muted-foreground">Grade + topic + count</p>
              </div>
            </div>

            <div className="space-y-4">
              <Field label="Grade">
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="min-h-11 w-full rounded-2xl border bg-white px-4 py-3"
                >
                  {grades.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </Field>

              <Field label="Topic / category">
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="food, animals, school, nature..."
                  className="min-h-11 w-full rounded-2xl border bg-white px-4 py-3"
                />
              </Field>

              <Field label="Item count">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  className="min-h-11 w-full rounded-2xl border bg-white px-4 py-3"
                />
              </Field>

              <Field label="Target languages">
                <div className="grid gap-2">
                  {languageOptions.map((language) => (
                    <label
                      key={language.key}
                      className="flex min-h-11 cursor-pointer items-center gap-3 rounded-2xl border bg-white px-4 py-3 text-sm font-semibold text-primary"
                    >
                      <input
                        type="checkbox"
                        checked={targetLanguages.includes(language.key)}
                        onChange={() => toggleLanguage(language.key)}
                      />
                      {language.label}
                    </label>
                  ))}
                </div>
              </Field>

              <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-2xl border bg-white px-4 py-3 text-sm font-semibold text-primary">
                <input
                  type="checkbox"
                  checked={generateImages}
                  onChange={(e) => setGenerateImages(e.target.checked)}
                />
                Generate missing images
              </label>

              <Button
                onClick={generate}
                disabled={loading}
                className="h-12 w-full rounded-2xl"
              >
                {loading ? "Generating..." : "Generate Vocabulary"}
              </Button>

              {errorMsg && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                  {successMsg}
                  {batchId && (
                    <span className="mt-1 block text-xs text-green-700/70">
                      Batch: {batchId}
                    </span>
                  )}
                </div>
              )}

              {summary && (
                <div className="grid gap-2 rounded-2xl border bg-background p-4 text-sm">
                  <SummaryRow label="Requested" value={summary.requested_count || 0} />
                  <SummaryRow label="Generated" value={summary.generated_count || 0} />
                  <SummaryRow label="Inserted" value={summary.inserted_count || 0} />
                  <SummaryRow
                    label="Skipped duplicates"
                    value={summary.skipped_duplicate_count || 0}
                  />
                  <SummaryRow
                    label="Existing conflicts"
                    value={summary.existing_conflict_count || 0}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border bg-card p-5 shadow-soft sm:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-accent">
                  Review Queue
                </p>
                <h2 className="mt-1 text-2xl font-bold text-primary">
                  Needs review
                </h2>
              </div>

              <Button
                variant="outline"
                onClick={loadReviewQueue}
                disabled={reviewLoading}
                className="h-11 rounded-2xl"
              >
                {reviewLoading ? "Refreshing..." : "Refresh"}
              </Button>
            </div>

            {reviewItems.length === 0 ? (
              <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed bg-background p-8 text-center text-muted-foreground">
                <Image className="mb-4 h-10 w-10 text-accent" />
                No items waiting for review.
              </div>
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {reviewItems.map((item) => (
                  <VocabularyReviewCard
                    key={item.id}
                    item={item}
                    actionLoading={actionLoadingId === item.id}
                    onApprove={() => updateReviewStatus(item.id, "approved")}
                    onReject={() => updateReviewStatus(item.id, "rejected")}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {items.length > 0 && (
          <section className="rounded-[2rem] border bg-card p-5 shadow-soft sm:p-6">
            <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-primary">
              <Languages className="h-4 w-4" />
              Newly generated this session
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <VocabularyReviewCard
                  key={item.id}
                  item={item}
                  actionLoading={actionLoadingId === item.id}
                  onApprove={() => updateReviewStatus(item.id, "approved")}
                  onReject={() => updateReviewStatus(item.id, "rejected")}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
      {label}
      {children}
    </label>
  );
}

function VocabularyReviewCard({
  item,
  actionLoading,
  onApprove,
  onReject,
}: {
  item: VocabularyItem;
  actionLoading: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-[1.5rem] border bg-background">
      {item.image_url ? (
        <img
          src={item.image_url}
          alt={item.image_keyword}
          className="h-40 w-full bg-white object-cover"
        />
      ) : (
        <div className="flex h-40 items-center justify-center bg-secondary/40 text-sm font-semibold text-muted-foreground">
          No image generated
        </div>
      )}

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-primary">{item.en}</h3>
            <p className="text-sm text-muted-foreground">
              Image keyword: {item.image_keyword}
            </p>
          </div>

          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-primary">
            {item.status || "needs_review"}
          </span>
        </div>

        <div className="grid gap-2 text-sm">
          <LanguageRow label="English" value={item.en} />
          <LanguageRow label="Chinese" value={item.zh || "-"} />
          <LanguageRow label="Japanese" value={item.ja || "-"} />
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
          <span className="rounded-full bg-white px-3 py-1">{item.grade}</span>
          <span className="rounded-full bg-white px-3 py-1">
            {item.category || "-"}
          </span>
          <span className="rounded-full bg-white px-3 py-1">
            {item.image_type || "object"}
          </span>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            onClick={onApprove}
            disabled={actionLoading}
            className="h-11 rounded-2xl"
          >
            Approve
          </Button>
          <Button
            variant="outline"
            onClick={onReject}
            disabled={actionLoading}
            className="h-11 rounded-2xl"
          >
            Reject
          </Button>
        </div>
      </div>
    </article>
  );
}

function LanguageRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2">
      <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <span className="text-right font-semibold text-primary">{value}</span>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-semibold text-muted-foreground">{label}</span>
      <span className="font-bold text-primary">{value}</span>
    </div>
  );
}
