import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const grades = ["All", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"];
const statuses = ["approved", "needs_review", "rejected", "All"];
const pageSizes = [25, 50, 100];

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

type DuplicateGroup = {
  id: string;
  reasons: string[];
  duplicate_keys: string[];
  kept_item: VocabularyItem;
  duplicate_items: VocabularyItem[];
};

export default function MemoryFlipBank() {
  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [gradeFilter, setGradeFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("approved");
  const [search, setSearch] = useState("");

  const [duplicateLoading, setDuplicateLoading] = useState(false);
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [duplicateMessage, setDuplicateMessage] = useState("");
  const [editingItem, setEditingItem] = useState<VocabularyItem | null>(null);
  const [editDraft, setEditDraft] = useState({
    en: "",
    zh: "",
    ja: "",
    image_keyword: "",
    grade: "",
    category: "",
  });

  const getToken = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error("Please log in again as admin.");
    }

    return session.access_token;
  };

  const fetchItems = async (nextPage = page) => {
    setLoading(true);
    setErrorMsg("");

    try {
      const token = await getToken();
      const params = new URLSearchParams({
        page: String(nextPage),
        pageSize: String(pageSize),
        status: statusFilter,
        grade: gradeFilter,
        category: categoryFilter || "All",
        search,
      });

      const res = await fetch(`${API_URL}/api/admin/game-vocabulary/items?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load shared vocabulary bank.");
      }

      setItems(data.items || []);
      setPage(data.page || nextPage);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load shared vocabulary bank.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(1);
  }, [pageSize, gradeFilter, categoryFilter, statusFilter]);

  const updateItem = async (itemId: string, payload: Partial<VocabularyItem>) => {
    setActionLoadingId(itemId);
    setErrorMsg("");

    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/admin/game-vocabulary/items/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update vocabulary item.");
      }

      fetchItems(page);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update vocabulary item.");
    } finally {
      setActionLoadingId("");
    }
  };

  const startEdit = (item: VocabularyItem) => {
    setEditingItem(item);
    setEditDraft({
      en: item.en || "",
      zh: item.zh || "",
      ja: item.ja || "",
      image_keyword: item.image_keyword || "",
      grade: item.grade || "",
      category: item.category || "",
    });
  };

  const saveEdit = async () => {
    if (!editingItem) return;

    await updateItem(editingItem.id, editDraft);
    setEditingItem(null);
  };

  const checkDuplicates = async () => {
    setDuplicateLoading(true);
    setDuplicateMessage("");

    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/admin/game-vocabulary/duplicates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ apply: false }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to check duplicates.");
      }

      setDuplicateGroups(data.duplicate_groups || []);
      setDuplicateMessage(
        `Found ${data.duplicate_groups_found || 0} duplicate group(s).`
      );
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to check duplicates.");
    } finally {
      setDuplicateLoading(false);
    }
  };

  const markDuplicate = async (itemId: string, duplicateOf: string) => {
    setActionLoadingId(itemId);

    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/admin/game-vocabulary/items/${itemId}/mark-duplicate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          duplicateOf,
          reason: "manual_duplicate_review",
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to mark duplicate.");
      }

      await checkDuplicates();
      await fetchItems(page);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to mark duplicate.");
    } finally {
      setActionLoadingId("");
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-accent">
            Games
          </p>

          <h1 className="font-serif text-3xl text-primary sm:text-5xl">
            Game Question Bank
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
            Manage approved shared vocabulary that powers Memory Flip, Word Search,
            Letter Match, and future games.
          </p>
        </div>

        <section className="rounded-[1.8rem] border bg-card p-5 shadow-soft sm:p-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            <Field label="Grade">
              <select
                className="min-h-11 w-full rounded-2xl border bg-white px-4 py-3"
                value={gradeFilter}
                onChange={(e) => {
                  setGradeFilter(e.target.value);
                  setPage(1);
                }}
              >
                {grades.map((grade) => (
                  <option key={grade}>{grade}</option>
                ))}
              </select>
            </Field>

            <Field label="Category">
              <input
                className="min-h-11 w-full rounded-2xl border bg-white px-4 py-3"
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                placeholder="All categories"
              />
            </Field>

            <Field label="Status">
              <select
                className="min-h-11 w-full rounded-2xl border bg-white px-4 py-3"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                {statuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </Field>

            <Field label="Page size">
              <select
                className="min-h-11 w-full rounded-2xl border bg-white px-4 py-3"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
              >
                {pageSizes.map((size) => (
                  <option key={size}>{size}</option>
                ))}
              </select>
            </Field>

            <Field label="Search">
              <input
                className="min-h-11 w-full rounded-2xl border bg-white px-4 py-3"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") fetchItems(1);
                }}
                placeholder="EN, ZH, JA, keyword"
              />
            </Field>

            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                className="h-12 w-full rounded-2xl"
                onClick={() => fetchItems(1)}
                disabled={loading}
              >
                {loading ? "Loading..." : "Apply"}
              </Button>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing page {page} of {totalPages} · {total} total item(s)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="h-10 rounded-xl"
                disabled={page <= 1 || loading}
                onClick={() => fetchItems(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                className="h-10 rounded-xl"
                disabled={page >= totalPages || loading}
                onClick={() => fetchItems(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>

          {errorMsg && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {errorMsg}
            </div>
          )}
        </section>

        {editingItem && (
          <section className="rounded-[1.8rem] border bg-card p-5 shadow-soft sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-accent">
                  Edit Vocabulary
                </p>
                <h2 className="mt-1 text-2xl font-bold text-primary">
                  {editingItem.en}
                </h2>
              </div>
              <Button
                variant="outline"
                onClick={() => setEditingItem(null)}
                className="h-10 rounded-xl"
              >
                Cancel
              </Button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Field label="English">
                <input
                  value={editDraft.en}
                  onChange={(e) => setEditDraft((current) => ({ ...current, en: e.target.value }))}
                  className="min-h-11 w-full rounded-2xl border bg-white px-4 py-3"
                />
              </Field>
              <Field label="Chinese">
                <input
                  value={editDraft.zh}
                  onChange={(e) => setEditDraft((current) => ({ ...current, zh: e.target.value }))}
                  className="min-h-11 w-full rounded-2xl border bg-white px-4 py-3"
                />
              </Field>
              <Field label="Japanese">
                <input
                  value={editDraft.ja}
                  onChange={(e) => setEditDraft((current) => ({ ...current, ja: e.target.value }))}
                  className="min-h-11 w-full rounded-2xl border bg-white px-4 py-3"
                />
              </Field>
              <Field label="Image keyword">
                <input
                  value={editDraft.image_keyword}
                  onChange={(e) => setEditDraft((current) => ({ ...current, image_keyword: e.target.value }))}
                  className="min-h-11 w-full rounded-2xl border bg-white px-4 py-3"
                />
              </Field>
              <Field label="Grade">
                <select
                  value={editDraft.grade}
                  onChange={(e) => setEditDraft((current) => ({ ...current, grade: e.target.value }))}
                  className="min-h-11 w-full rounded-2xl border bg-white px-4 py-3"
                >
                  {grades.filter((grade) => grade !== "All").map((grade) => (
                    <option key={grade}>{grade}</option>
                  ))}
                </select>
              </Field>
              <Field label="Category">
                <input
                  value={editDraft.category}
                  onChange={(e) => setEditDraft((current) => ({ ...current, category: e.target.value }))}
                  className="min-h-11 w-full rounded-2xl border bg-white px-4 py-3"
                />
              </Field>
            </div>

            <Button
              onClick={saveEdit}
              disabled={actionLoadingId === editingItem.id}
              className="mt-5 h-12 rounded-2xl px-8"
            >
              Save changes
            </Button>
          </section>
        )}

        <section className="rounded-[1.8rem] border bg-card p-5 shadow-soft sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-accent">
                Library Integrity
              </p>
              <h2 className="mt-1 text-2xl font-bold text-primary">
                Duplicate audit
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
                Preview duplicate groups, then decide manually. No bulk cleanup is
                available from this screen.
              </p>
            </div>

            <Button
              variant="outline"
              onClick={checkDuplicates}
              disabled={duplicateLoading}
              className="h-12 rounded-2xl"
            >
              {duplicateLoading ? "Checking..." : "Check Duplicates"}
            </Button>
          </div>

          {duplicateMessage && (
            <div className="mt-4 rounded-2xl border bg-background p-4 text-sm font-semibold text-primary">
              {duplicateMessage}
            </div>
          )}

          {duplicateGroups.length > 0 && (
            <div className="mt-5 grid gap-4">
              {duplicateGroups.map((group) => (
                <article
                  key={group.id}
                  className="rounded-[1.5rem] border bg-background p-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-bold text-primary">
                        {group.duplicate_keys.join(" · ")}
                      </h3>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        {group.reasons.join(", ")}
                      </p>
                    </div>
                    <span className="w-fit rounded-full bg-secondary px-3 py-1 text-xs font-bold text-primary">
                      Manual review
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1.2fr]">
                    <VocabularyMiniCard title="Suggested keeper" item={group.kept_item} />
                    <div className="grid gap-3">
                      {group.duplicate_items.map((item) => (
                        <VocabularyMiniCard
                          key={item.id}
                          title="Possible duplicate"
                          item={item}
                          action={
                            <Button
                              variant="outline"
                              onClick={() => markDuplicate(item.id, group.kept_item.id)}
                              disabled={actionLoadingId === item.id}
                              className="h-10 rounded-xl"
                            >
                              Mark as duplicate
                            </Button>
                          }
                        />
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="hidden overflow-hidden rounded-[1.8rem] border bg-card shadow-soft lg:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/50 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Image</th>
                  <th className="px-4 py-3">Vocabulary</th>
                  <th className="px-4 py-3">Translations</th>
                  <th className="px-4 py-3">Grade</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t align-top">
                    <td className="px-4 py-3">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.image_keyword}
                          className="h-14 w-14 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-xl bg-secondary" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-primary">{item.en}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.image_keyword}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p>ZH: {item.zh || "-"}</p>
                      <p className="mt-1">JA: {item.ja || "-"}</p>
                    </td>
                    <td className="px-4 py-3">{item.grade}</td>
                    <td className="px-4 py-3">{item.category || "-"}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={item.status || ""} />
                    </td>
                    <td className="px-4 py-3">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <ItemActions
                        item={item}
                        disabled={actionLoadingId === item.id}
                        onEdit={() => startEdit(item)}
                        onReject={() => updateItem(item.id, { status: "rejected" })}
                        onRestore={() => updateItem(item.id, { status: "approved" })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 lg:hidden">
            {items.map((item) => (
              <VocabularyMobileCard
                key={item.id}
                item={item}
                disabled={actionLoadingId === item.id}
                onEdit={() => startEdit(item)}
                onReject={() => updateItem(item.id, { status: "rejected" })}
                onRestore={() => updateItem(item.id, { status: "approved" })}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
      {label}
      {children}
    </label>
  );
}

function StatusPill({ status }: { status: string }) {
  const style =
    status === "approved"
      ? "bg-green-100 text-green-700"
      : status === "rejected"
        ? "bg-red-100 text-red-700"
        : "bg-secondary text-primary";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${style}`}>
      {status || "-"}
    </span>
  );
}

function ItemActions({
  item,
  disabled,
  onEdit,
  onReject,
  onRestore,
}: {
  item: VocabularyItem;
  disabled: boolean;
  onEdit: () => void;
  onReject: () => void;
  onRestore: () => void;
}) {
  if (item.status === "rejected") {
    return (
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" disabled={disabled} onClick={onEdit}>
          Edit
        </Button>
        <Button variant="outline" disabled={disabled} onClick={onRestore}>
          Restore
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" disabled={disabled} onClick={onEdit}>
        Edit
      </Button>
      <Button variant="outline" disabled={disabled} onClick={onReject}>
        Reject
      </Button>
    </div>
  );
}

function VocabularyMobileCard({
  item,
  disabled,
  onEdit,
  onReject,
  onRestore,
}: {
  item: VocabularyItem;
  disabled: boolean;
  onEdit: () => void;
  onReject: () => void;
  onRestore: () => void;
}) {
  return (
    <article className="rounded-[1.5rem] border bg-card p-4 shadow-soft">
      <div className="flex gap-3">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.image_keyword}
            className="h-20 w-20 shrink-0 rounded-2xl object-cover"
          />
        ) : (
          <div className="h-20 w-20 shrink-0 rounded-2xl bg-secondary" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-primary">{item.en}</h3>
            <StatusPill status={item.status || ""} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{item.image_keyword}</p>
          <p className="mt-2 text-sm text-primary/70">
            ZH: {item.zh || "-"} · JA: {item.ja || "-"}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {item.grade} · {item.category || "-"}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <ItemActions
          item={item}
          disabled={disabled}
          onEdit={onEdit}
          onReject={onReject}
          onRestore={onRestore}
        />
      </div>
    </article>
  );
}

function VocabularyMiniCard({
  title,
  item,
  action,
}: {
  title: string;
  item: VocabularyItem;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="flex items-start gap-3">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.image_keyword || item.en || title}
            className="h-14 w-14 shrink-0 rounded-2xl bg-secondary object-cover"
          />
        ) : (
          <div className="h-14 w-14 shrink-0 rounded-2xl bg-secondary" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
            {title}
          </p>
          <h4 className="mt-1 truncate font-bold text-primary">{item.en}</h4>
          <p className="mt-1 text-xs text-muted-foreground">
            {item.image_keyword} · {item.grade} · {item.status}
          </p>
          <p className="mt-2 text-sm text-primary/70">
            ZH: {item.zh || "-"} · JA: {item.ja || "-"}
          </p>
          {action && <div className="mt-3">{action}</div>}
        </div>
      </div>
    </div>
  );
}
