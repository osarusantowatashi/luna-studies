import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { apiUrl } from "@/lib/api";
import { getEnglishPathway } from "@/lib/englishPathways";
import { NON_ENGLISH_LANGUAGE_PATHWAYS } from "@/lib/languagePathways";

const TARGET_LANGUAGES = ["English", "Japanese", "Chinese"] as const;
const PROMPT_LANGUAGES = ["English", "Chinese", "Japanese"] as const;
const PAGE_SIZES = [25, 50, 100];

type TargetLanguage = (typeof TARGET_LANGUAGES)[number];

type LanguageQuestionBankProps = {
  targetLanguage?: TargetLanguage;
};

const languageSuffix = (language: string) =>
  language === "Chinese" ? "zh" : language === "Japanese" ? "ja" : "en";

const localizedField = (q: any, base: string, language: string) => {
  const suffix = languageSuffix(language);

  return q?.[`${base}_${suffix}`] || q?.[base] || q?.[`${base}_en`] || "";
};

const getCorrectAnswerText = (q: any, language: string) => {
  if (q?.correct_answer === "option_a") return localizedField(q, "option_a", language);
  if (q?.correct_answer === "option_b") return localizedField(q, "option_b", language);
  if (q?.correct_answer === "option_c") return localizedField(q, "option_c", language);
  if (q?.correct_answer === "option_d") return localizedField(q, "option_d", language);
  return q?.correct_answer || "";
};

const formatDate = (value?: string) => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const formatQuestionTags = (q: any) =>
  [
    q.pathway || q.exam_type || q.target_language,
    q.level || q.grade,
    q.pathway_variant,
    q.skill,
    q.category,
  ].filter(Boolean);

const LanguageQuestionBank = ({ targetLanguage: initialTargetLanguage = "English" }: LanguageQuestionBankProps) => {
  const [targetLanguage, setTargetLanguage] = useState<TargetLanguage>(initialTargetLanguage);
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);
  const [draft, setDraft] = useState<any | null>(null);
  const [gradeFilter, setGradeFilter] = useState("All");
  const [pathwayFilter, setPathwayFilter] = useState("All");
  const [skillFilter, setSkillFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("approved");
  const [previewPromptLanguage, setPreviewPromptLanguage] = useState("English");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [migrationLoading, setMigrationLoading] = useState(false);
  const [migrationPreview, setMigrationPreview] = useState<any | null>(null);
  const [useAiMigration, setUseAiMigration] = useState(false);

  useEffect(() => {
    setPage(0);
  }, [categoryFilter, gradeFilter, pageSize, pathwayFilter, search, skillFilter, statusFilter, targetLanguage]);

  const fetchQuestions = async () => {
    setLoading(true);
    setErrorMsg("");

    const from = page * pageSize;
    const to = from + pageSize - 1;
    const cleanSearch = search.trim().replace(/[%(),]/g, "");

    let query = supabase
      .from("questions")
      .select("*", { count: "exact" })
      .order("updated_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .range(from, to);

    query =
      targetLanguage === "English"
        ? query.or("target_language.eq.English,target_language.is.null")
        : query.eq("target_language", targetLanguage);

    if (gradeFilter !== "All") query = query.eq("level", gradeFilter);
    if (pathwayFilter !== "All") query = query.eq("pathway", pathwayFilter);
    if (skillFilter !== "All") query = query.eq("skill", skillFilter);
    if (categoryFilter.trim()) query = query.ilike("category", `%${categoryFilter.trim()}%`);
    if (statusFilter !== "All") query = query.eq("status", statusFilter);
    if (cleanSearch) {
      query = query.or(
        [
          `question_text.ilike.%${cleanSearch}%`,
          `question_en.ilike.%${cleanSearch}%`,
          `question_zh.ilike.%${cleanSearch}%`,
          `question_ja.ilike.%${cleanSearch}%`,
          `option_a_en.ilike.%${cleanSearch}%`,
          `option_a_zh.ilike.%${cleanSearch}%`,
          `option_a_ja.ilike.%${cleanSearch}%`,
          `explanation_en.ilike.%${cleanSearch}%`,
          `explanation_zh.ilike.%${cleanSearch}%`,
          `explanation_ja.ilike.%${cleanSearch}%`,
        ].join(",")
      );
    }

    const { data, error, count } = await query;

    if (error) {
      console.error(error);
      setErrorMsg(error.message);
      setQuestions([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }

    setQuestions(data || []);
    setTotalCount(count || 0);
    setLoading(false);
  };

  useEffect(() => {
    fetchQuestions();
  }, [categoryFilter, gradeFilter, page, pageSize, pathwayFilter, search, skillFilter, statusFilter, targetLanguage]);

  const pathwayOptions = useMemo(() => {
    if (targetLanguage === "English") {
      return ["All", ...Array.from(new Set(questions.map((q) => q.pathway || q.exam_type).filter(Boolean))).sort()];
    }

    const fixedPathway =
      targetLanguage === "Japanese"
        ? NON_ENGLISH_LANGUAGE_PATHWAYS.Japanese.pathway
        : NON_ENGLISH_LANGUAGE_PATHWAYS.Chinese.pathway;

    return ["All", fixedPathway];
  }, [questions, targetLanguage]);

  const levelOptions = useMemo(() => {
    if (targetLanguage === "Japanese") return ["All", ...NON_ENGLISH_LANGUAGE_PATHWAYS.Japanese.levels];
    if (targetLanguage === "Chinese") return ["All", ...NON_ENGLISH_LANGUAGE_PATHWAYS.Chinese.levels];

    const selectedPathway = pathwayFilter !== "All" ? pathwayFilter : questions[0]?.pathway;
    const config = selectedPathway ? getEnglishPathway(selectedPathway) : null;

    if (config) return ["All", ...config.levels];

    return ["All", ...Array.from(new Set(questions.map((q) => q.level || q.grade).filter(Boolean))).sort()];
  }, [pathwayFilter, questions, targetLanguage]);

  const skills = useMemo(
    () => {
      if (targetLanguage === "Japanese") return ["All", ...NON_ENGLISH_LANGUAGE_PATHWAYS.Japanese.skills];
      if (targetLanguage === "Chinese") return ["All", ...NON_ENGLISH_LANGUAGE_PATHWAYS.Chinese.skills];
      if (pathwayFilter !== "All") return ["All", ...getEnglishPathway(pathwayFilter).skills];

      return ["All", ...Array.from(new Set(questions.map((q) => q.skill).filter(Boolean))).sort()];
    },
    [pathwayFilter, questions, targetLanguage]
  );

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const openQuestion = (question: any) => {
    setSelectedQuestion(question);
    setDraft({ ...question });
  };

  const updateDraft = (field: string, value: string) => {
    setDraft((current: any) => ({ ...(current || {}), [field]: value }));
  };

  const saveDraft = async () => {
    if (!selectedQuestion || !draft) return;

    setSaving(true);

    const fields = [
      "question_en",
      "question_zh",
      "question_ja",
      "option_a_en",
      "option_a_zh",
      "option_a_ja",
      "option_b_en",
      "option_b_zh",
      "option_b_ja",
      "option_c_en",
      "option_c_zh",
      "option_c_ja",
      "option_d_en",
      "option_d_zh",
      "option_d_ja",
      "explanation_en",
      "explanation_zh",
      "explanation_ja",
      "category",
      "status",
      "pathway",
      "level",
      "level_label",
      "pathway_variant",
      "variant_label",
      "difficulty_label",
    ];

    const payload = fields.reduce((acc: Record<string, any>, field) => {
      acc[field] = draft[field] || null;
      return acc;
    }, {});

    payload.question_text = draft.question_en || draft.question_text || null;
    payload.option_a = draft.option_a_en || draft.option_a || null;
    payload.option_b = draft.option_b_en || draft.option_b || null;
    payload.option_c = draft.option_c_en || draft.option_c || null;
    payload.option_d = draft.option_d_en || draft.option_d || null;
    payload.explanation = draft.explanation_en || draft.explanation || null;
    payload.updated_at = new Date().toISOString();

    const { error } = await supabase.from("questions").update(payload).eq("id", selectedQuestion.id);

    setSaving(false);

    if (error) {
      alert(`Failed to save question: ${error.message}`);
      return;
    }

    setSelectedQuestion(null);
    setDraft(null);
    fetchQuestions();
  };

  const getAdminToken = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error("Please log in again as admin.");
    }

    return session.access_token;
  };

  const runLegacyPreview = async () => {
    setMigrationLoading(true);

    try {
      const token = await getAdminToken();
      const res = await fetch(apiUrl("/api/admin/questions/legacy-english-migration/preview"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ useAiClassification: useAiMigration }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Preview failed.");

      setMigrationPreview(data);
    } catch (err: any) {
      alert(err.message || "Preview failed.");
    } finally {
      setMigrationLoading(false);
    }
  };

  const applyLegacyMigration = async () => {
    if (!confirm("Apply legacy English pathway migration? This will not regenerate or delete questions.")) {
      return;
    }

    setMigrationLoading(true);

    try {
      const token = await getAdminToken();
      const res = await fetch(apiUrl("/api/admin/questions/legacy-english-migration/apply"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          useAiClassification: useAiMigration,
          applyNeedsReview: false,
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Apply failed.");

      setMigrationPreview(data);
      fetchQuestions();
    } catch (err: any) {
      alert(err.message || "Apply failed.");
    } finally {
      setMigrationLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-accent">
            Language Questions
          </p>

          <h1 className="mt-2 font-serif text-3xl text-primary sm:text-5xl">
            Language Question Bank
          </h1>

          <p className="mt-3 max-w-3xl text-muted-foreground">
            Manage multilingual language-learning questions from one place. Target
            language is controlled by tabs; prompt language only changes the preview.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 rounded-[1.4rem] border bg-card p-2 shadow-soft">
          {TARGET_LANGUAGES.map((language) => (
            <button
              key={language}
              type="button"
              onClick={() => setTargetLanguage(language)}
              className={`min-h-11 rounded-2xl px-5 text-sm font-black transition ${
                targetLanguage === language
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-primary/65 hover:bg-secondary"
              }`}
            >
              {language}
            </button>
          ))}
        </div>

        <div className="rounded-[1.6rem] border bg-card p-4 shadow-soft sm:p-5">
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-7">
            <select
              value={pathwayFilter}
              onChange={(e) => setPathwayFilter(e.target.value)}
              className="min-h-11 rounded-2xl border bg-white px-4 py-3"
            >
              {pathwayOptions.map((pathway) => (
                <option key={pathway}>{pathway}</option>
              ))}
            </select>

            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="min-h-11 rounded-2xl border bg-white px-4 py-3"
            >
              {levelOptions.map((level) => (
                <option key={level}>{level}</option>
              ))}
            </select>

            <select
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="min-h-11 rounded-2xl border bg-white px-4 py-3"
            >
              {skills.map((skill) => (
                <option key={skill}>{skill}</option>
              ))}
            </select>

            <input
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              placeholder="Category"
              className="min-h-11 rounded-2xl border bg-white px-4 py-3"
            />

            <select
              value={previewPromptLanguage}
              onChange={(e) => setPreviewPromptLanguage(e.target.value)}
              className="min-h-11 rounded-2xl border bg-white px-4 py-3"
            >
              {PROMPT_LANGUAGES.map((language) => (
                <option key={language}>{language}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="min-h-11 rounded-2xl border bg-white px-4 py-3"
            >
              <option>All</option>
              <option value="approved">Approved</option>
              <option value="needs_review">Needs Review</option>
              <option value="rejected">Rejected</option>
            </select>

            <input
              type="search"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="min-h-11 rounded-2xl border bg-white px-4 py-3"
            />
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {loading
                ? "Loading questions..."
                : `${totalCount} ${targetLanguage} questions · previewing ${previewPromptLanguage}`}
            </p>

            <div className="flex flex-wrap gap-2">
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="min-h-11 rounded-2xl border bg-white px-4 py-2 text-sm"
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size} / page
                  </option>
                ))}
              </select>

              <Button variant="outline" className="min-h-11 rounded-2xl" onClick={fetchQuestions}>
                Refresh
              </Button>
            </div>
          </div>

          {errorMsg && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {errorMsg}
            </div>
          )}
        </div>

        {targetLanguage === "English" && (
          <section className="rounded-[1.6rem] border bg-card p-4 shadow-soft sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-accent">
                  Legacy Migration
                </p>
                <h2 className="mt-2 text-xl font-bold text-primary">
                  Reclassify old English questions into pathways
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                  Preview first, then apply. This preserves existing questions and only
                  fills pathway, level, skill, category, and review status fields.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="flex min-h-11 items-center gap-2 rounded-2xl border bg-white px-4 text-sm font-semibold text-primary/70">
                  <input
                    type="checkbox"
                    checked={useAiMigration}
                    onChange={(e) => setUseAiMigration(e.target.checked)}
                  />
                  Use AI for uncertain items
                </label>

                <Button
                  variant="outline"
                  className="min-h-11 rounded-2xl"
                  onClick={runLegacyPreview}
                  disabled={migrationLoading}
                >
                  Preview
                </Button>

                <Button
                  className="min-h-11 rounded-2xl"
                  onClick={applyLegacyMigration}
                  disabled={migrationLoading || !migrationPreview}
                >
                  Apply
                </Button>
              </div>
            </div>

            {migrationPreview && (
              <div className="mt-5 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                  {[
                    ["Old English", migrationPreview.total_old_english_questions_found],
                    ["NULL Pathway", migrationPreview.null_pathway_questions_found],
                    ["NULL → MAP", migrationPreview.null_pathway_mapped_count ?? migrationPreview.null_pathway_updated_count],
                    ["Mapped", migrationPreview.confidently_mapped_count ?? migrationPreview.updated_count],
                    ["Needs Review", migrationPreview.needs_ai_or_review_count ?? migrationPreview.skipped_count],
                    ["Cannot Map", migrationPreview.cannot_map_count ?? migrationPreview.failed_count],
                    ["AI Used", migrationPreview.ai_classification_used ? "Yes" : "No"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl bg-secondary/45 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-primary/45">
                        {label}
                      </p>
                      <p className="mt-2 text-2xl font-black text-primary">{value ?? 0}</p>
                    </div>
                  ))}
                </div>

                {migrationPreview.samples && (
                  <div className="max-h-[520px] overflow-y-auto rounded-2xl border bg-white">
                    {migrationPreview.samples.map((item: any) => (
                      <div key={item.id} className="border-b p-4 last:border-b-0">
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-primary/40">
                          Current: {item.exam_type || "-"} · {item.grade || "-"} · {item.skill || "-"}
                        </p>

                        <div className="mt-3 grid gap-4 lg:grid-cols-2">
                          <div className="rounded-2xl bg-secondary/35 p-4">
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-primary/45">
                              Old question_text
                            </p>
                            <p className="mt-2 text-sm font-semibold leading-6 text-primary">
                              {item.migration_preview?.old_question_text || "No question text"}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-white p-4 ring-1 ring-primary/10">
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-primary/45">
                              Proposed question_en
                            </p>
                            <p className="mt-2 text-sm font-semibold leading-6 text-primary">
                              {item.migration_preview?.proposed_question_en || "No English question"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
                          {Object.entries(item.migration_preview?.proposed_options_en || {}).map(
                            ([key, value]) => (
                              <div key={key} className="rounded-xl bg-[#fbfaff] p-3">
                                <p className="font-black uppercase tracking-[0.12em] text-primary/40">
                                  {key.replace("_en", "").replace("_", " ")}
                                </p>
                                <p className="mt-1 font-semibold leading-5 text-primary/75">
                                  {String(value || "-")}
                                </p>
                              </div>
                            )
                          )}
                        </div>

                        <div className="mt-3 grid gap-3 text-xs md:grid-cols-2">
                          <div className="rounded-xl bg-green-50 p-3 text-green-800">
                            <p className="font-black uppercase tracking-[0.12em]">
                              Correct answer
                            </p>
                            <p className="mt-1 font-semibold">
                              {item.migration_preview?.correct_answer || "-"}
                            </p>
                          </div>

                          <div className="rounded-xl bg-secondary/35 p-3">
                            <p className="font-black uppercase tracking-[0.12em] text-primary/40">
                              Explanation EN
                            </p>
                            <p className="mt-1 font-semibold leading-5 text-primary/70">
                              {item.migration_preview?.proposed_explanation_en || "-"}
                            </p>
                          </div>
                        </div>

                        {item.migration_preview?.passage && (
                          <div className="mt-3 rounded-xl bg-[#fbfaff] p-3 text-xs">
                            <p className="font-black uppercase tracking-[0.12em] text-primary/40">
                              Passage preserved
                            </p>
                            <p className="mt-1 line-clamp-4 leading-5 text-primary/70">
                              {item.migration_preview.passage}
                            </p>
                          </div>
                        )}

                        <p className="mt-3 text-xs font-bold leading-5 text-primary/70">
                          Proposed: {item.migration_preview?.proposed_pathway || "-"} ·{" "}
                          {item.migration_preview?.proposed_level || "-"} ·{" "}
                          {item.migration_preview?.proposed_skill || "-"} ·{" "}
                          {item.migration_preview?.proposed_category || "-"} ·{" "}
                          {item.migration_preview?.proposed_status || "-"} (
                          {Math.round((item.classification?.confidence || 0) * 100)}%)
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        <div className="hidden overflow-hidden rounded-[1.6rem] border bg-card shadow-soft lg:block">
          <div className="grid grid-cols-[72px_minmax(0,1.6fr)_120px_120px_120px_120px_110px_100px] gap-4 border-b bg-secondary/40 px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-primary/55">
            <span>Image</span>
            <span>Question Preview</span>
            <span>Target</span>
            <span>Grade</span>
            <span>Skill</span>
            <span>Category</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {questions.map((q) => (
            <div
              key={q.id}
              className="grid grid-cols-[72px_minmax(0,1.6fr)_120px_120px_120px_120px_110px_100px] gap-4 border-b px-5 py-4 text-sm last:border-b-0"
            >
              <div className="h-12 w-12 overflow-hidden rounded-2xl bg-secondary">
                {q.image_url ? (
                  <img src={q.image_url} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>

              <div className="min-w-0">
                <p className="line-clamp-2 font-semibold leading-6 text-primary">
                  {localizedField(q, "question", previewPromptLanguage) || q.question_text}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Updated {formatDate(q.updated_at || q.created_at)}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {formatQuestionTags(q).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold text-primary/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <p className="font-semibold text-primary/75">{q.target_language || "English"}</p>
              <p className="text-primary/70">{q.grade || "-"}</p>
              <p className="text-primary/70">{q.skill || "-"}</p>
              <p className="text-primary/70">{q.category || "-"}</p>
              <span className="h-fit rounded-full bg-secondary px-3 py-1 text-xs font-bold text-primary/70">
                {q.status || "approved"}
              </span>
              <Button variant="outline" className="h-10 rounded-2xl" onClick={() => openQuestion(q)}>
                View
              </Button>
            </div>
          ))}
        </div>

        <div className="space-y-4 lg:hidden">
          {questions.map((q) => (
            <button
              type="button"
              key={q.id}
              onClick={() => openQuestion(q)}
              className="w-full rounded-[1.6rem] border bg-card p-5 text-left shadow-soft"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-2xl bg-secondary">
                  {q.image_url ? (
                    <img src={q.image_url} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>

                <div>
                  <p className="font-bold text-primary">{q.grade || "-"}</p>
                  <p className="text-xs text-muted-foreground">{q.skill || "-"} · {q.status || "approved"}</p>
                </div>
              </div>

              <div className="mb-3 flex flex-wrap gap-1.5">
                {formatQuestionTags(q).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold text-primary/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <p className="text-sm font-semibold leading-6 text-primary">
                {localizedField(q, "question", previewPromptLanguage) || q.question_text}
              </p>
            </button>
          ))}
        </div>

        {!loading && questions.length === 0 && (
          <div className="rounded-[1.6rem] border bg-card p-8 text-center text-muted-foreground shadow-soft">
            No matching questions found.
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page + 1} / {totalPages}
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-2xl"
              disabled={page === 0}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              className="rounded-2xl"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {selectedQuestion && draft && (
        <div className="fixed inset-0 z-50 bg-primary/30 backdrop-blur-sm">
          <div className="ml-auto flex h-full w-full max-w-3xl flex-col overflow-y-auto bg-white shadow-elegant">
            <div className="sticky top-0 z-10 border-b bg-white/95 p-5 backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-accent">
                    Question Detail
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-primary">
                    {[draft.target_language || targetLanguage, draft.pathway, draft.level || draft.grade]
                      .filter(Boolean)
                      .join(" · ")}
                  </h2>
                </div>

                <Button
                  variant="outline"
                  className="rounded-2xl"
                  onClick={() => {
                    setSelectedQuestion(null);
                    setDraft(null);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>

            <div className="space-y-6 p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  value={draft.category || ""}
                  onChange={(e) => updateDraft("category", e.target.value)}
                  placeholder="Category"
                  className="min-h-11 rounded-2xl border bg-white px-4 py-3"
                />
                <select
                  value={draft.status || "approved"}
                  onChange={(e) => updateDraft("status", e.target.value)}
                  className="min-h-11 rounded-2xl border bg-white px-4 py-3"
                >
                  <option value="approved">Approved</option>
                  <option value="needs_review">Needs Review</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {draft.passage && (
                <section className="rounded-[1.5rem] border bg-[#fbfaff] p-4">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
                    Passage
                  </p>
                  <p className="mt-3 max-h-[280px] overflow-y-auto whitespace-pre-line text-sm leading-7 text-primary/70">
                    {draft.passage}
                  </p>
                </section>
              )}

              {PROMPT_LANGUAGES.map((language) => {
                const suffix = languageSuffix(language);

                return (
                  <section key={language} className="rounded-[1.5rem] border bg-[#fbfaff] p-4">
                    <h3 className="mb-4 text-lg font-bold text-primary">{language}</h3>

                    <label className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                      Question
                    </label>
                    <textarea
                      value={draft[`question_${suffix}`] || ""}
                      onChange={(e) => updateDraft(`question_${suffix}`, e.target.value)}
                      className="mt-2 min-h-24 w-full rounded-2xl border bg-white px-4 py-3 text-sm leading-6"
                    />

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {["a", "b", "c", "d"].map((option) => (
                        <label key={option} className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                          Option {option.toUpperCase()}
                          <input
                            value={draft[`option_${option}_${suffix}`] || ""}
                            onChange={(e) => updateDraft(`option_${option}_${suffix}`, e.target.value)}
                            className="mt-2 min-h-11 w-full rounded-2xl border bg-white px-4 py-3 text-sm normal-case tracking-normal text-primary"
                          />
                        </label>
                      ))}
                    </div>

                    <label className="mt-4 block text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                      Explanation
                    </label>
                    <textarea
                      value={draft[`explanation_${suffix}`] || ""}
                      onChange={(e) => updateDraft(`explanation_${suffix}`, e.target.value)}
                      className="mt-2 min-h-24 w-full rounded-2xl border bg-white px-4 py-3 text-sm leading-6"
                    />
                  </section>
                );
              })}
            </div>

            <div className="sticky bottom-0 border-t bg-white/95 p-5 backdrop-blur">
              <Button className="h-12 w-full rounded-2xl" onClick={saveDraft} disabled={saving}>
                {saving ? "Saving..." : "Save Question"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageQuestionBank;
