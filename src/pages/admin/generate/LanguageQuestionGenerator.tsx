import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { apiUrl } from "@/lib/api";
import { ENGLISH_PATHWAY_KEYS, getEnglishPathway } from "@/lib/englishPathways";
import { NON_ENGLISH_LANGUAGE_PATHWAYS } from "@/lib/languagePathways";

const PROMPT_LANGUAGES = ["English", "Chinese", "Japanese"] as const;

const READING_SKILLS = new Set([
  "Reading",
  "Reading Comprehension",
  "Main Idea",
  "Inference",
  "Detail Questions",
  "Literature",
  "Informational Text",
]);

const languageSuffix = (language: string) =>
  language === "Chinese" ? "zh" : language === "Japanese" ? "ja" : "en";

const LANGUAGE_CONFIG = {
  English: {
    label: "English",
    examTypes: ENGLISH_PATHWAY_KEYS,
    skills: getEnglishPathway("MAP").skills,
    defaultExam: "MAP",
    defaultGrade: "Grade 5",
    focus:
      "Pathway-specific English practice for MAP, WIDA, CAT4, AEIS, O-Level English, TOEFL, and IELTS.",
  },
  Japanese: {
    label: "Japanese",
    examTypes: ["JLPT"],
    skills: NON_ENGLISH_LANGUAGE_PATHWAYS.Japanese.skills,
    defaultExam: "JLPT",
    defaultGrade: "N5",
    focus: NON_ENGLISH_LANGUAGE_PATHWAYS.Japanese.focus,
  },
  Chinese: {
    label: "Chinese",
    examTypes: ["HSK"],
    skills: NON_ENGLISH_LANGUAGE_PATHWAYS.Chinese.skills,
    defaultExam: "HSK",
    defaultGrade: "HSK 1",
    focus: NON_ENGLISH_LANGUAGE_PATHWAYS.Chinese.focus,
  },
} as const;

type TargetLanguage = keyof typeof LANGUAGE_CONFIG;

type LanguageQuestionGeneratorProps = {
  targetLanguage?: TargetLanguage;
};

const toInsertPayload = (q: any, targetLanguage: TargetLanguage, category: string) => ({
  exam_type: q.exam_type,
  grade: q.grade,
  skill: q.skill,
  difficulty: q.difficulty,
  target_language: targetLanguage,
  pathway: q.pathway || q.exam_type || null,
  level: q.level || q.grade || null,
  level_label: q.level_label || null,
  pathway_variant: q.pathway_variant || null,
  variant_label: q.variant_label || null,
  difficulty_label: q.difficulty_label || null,
  category: category || null,
  status: "needs_review",
  passage: q.passage || null,
  question_text: q.question_en || q.question_text,
  question_en: q.question_en || q.question_text,
  question_zh: q.question_zh || q.question_text,
  question_ja: q.question_ja || q.question_text,
  option_a: q.option_a_en || q.option_a,
  option_b: q.option_b_en || q.option_b,
  option_c: q.option_c_en || q.option_c,
  option_d: q.option_d_en || q.option_d,
  option_a_en: q.option_a_en || q.option_a,
  option_a_zh: q.option_a_zh || q.option_a,
  option_a_ja: q.option_a_ja || q.option_a,
  option_b_en: q.option_b_en || q.option_b,
  option_b_zh: q.option_b_zh || q.option_b,
  option_b_ja: q.option_b_ja || q.option_b,
  option_c_en: q.option_c_en || q.option_c,
  option_c_zh: q.option_c_zh || q.option_c,
  option_c_ja: q.option_c_ja || q.option_c,
  option_d_en: q.option_d_en || q.option_d,
  option_d_zh: q.option_d_zh || q.option_d,
  option_d_ja: q.option_d_ja || q.option_d,
  correct_answer: q.correct_answer,
  explanation: q.explanation_en || q.explanation,
  explanation_en: q.explanation_en || q.explanation,
  explanation_zh: q.explanation_zh || q.explanation,
  explanation_ja: q.explanation_ja || q.explanation,
});

const LanguageQuestionGenerator = ({ targetLanguage: fixedTargetLanguage }: LanguageQuestionGeneratorProps) => {
  const [selectedTargetLanguage, setSelectedTargetLanguage] = useState<TargetLanguage>(
    fixedTargetLanguage || "English"
  );
  const targetLanguage = fixedTargetLanguage || selectedTargetLanguage;
  const config = LANGUAGE_CONFIG[targetLanguage];

  const [examType, setExamType] = useState(config.defaultExam);
  const [grade, setGrade] = useState(config.defaultGrade);
  const [skill, setSkill] = useState(config.skills[0]);
  const [difficulty, setDifficulty] = useState("Medium");
  const [pathwayVariant, setPathwayVariant] = useState("");
  const [category, setCategory] = useState("");
  const [questionCount, setQuestionCount] = useState("5");
  const [extraPrompt, setExtraPrompt] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [previewEditing, setPreviewEditing] = useState(false);
  const [draft, setDraft] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const title = fixedTargetLanguage
    ? `${config.label} Question Generator`
    : "Language Question Generator";
  const englishPathway = getEnglishPathway(examType);
  const nonEnglishPathway =
    targetLanguage === "Japanese"
      ? NON_ENGLISH_LANGUAGE_PATHWAYS.Japanese
      : targetLanguage === "Chinese"
        ? NON_ENGLISH_LANGUAGE_PATHWAYS.Chinese
        : null;
  const activeSkills = targetLanguage === "English" ? englishPathway.skills : config.skills;
  const activeLevels = targetLanguage === "English" ? englishPathway.levels : nonEnglishPathway?.levels || [];
  const activeDifficultyOptions =
    targetLanguage === "English"
      ? englishPathway.difficulties || []
      : [];
  const activeVariants = targetLanguage === "English" ? englishPathway.variants || [] : [];
  const isReadingGenerator = READING_SKILLS.has(skill);

  useEffect(() => {
    setExamType(config.defaultExam);
    setGrade(config.defaultGrade);
    setSkill(config.skills[0]);
    setDifficulty(targetLanguage === "English" ? getEnglishPathway(config.defaultExam).difficulties?.[0] || "" : "");
    setPathwayVariant("");
  }, [targetLanguage]);

  useEffect(() => {
    if (targetLanguage !== "English") return;

    const nextPathway = getEnglishPathway(examType);

    setGrade((current) => (nextPathway.levels.includes(current) ? current : nextPathway.levels[0]));
    setSkill((current) => (nextPathway.skills.includes(current) ? current : nextPathway.skills[0]));
    setDifficulty((current) =>
      nextPathway.difficulties?.includes(current)
        ? current
        : nextPathway.difficulties?.[0] || ""
    );
    setPathwayVariant((current) =>
      nextPathway.variants?.includes(current)
        ? current
        : nextPathway.variants?.[0] || ""
    );
  }, [examType, targetLanguage]);

  const languageSummary = useMemo(
    () => `Learning ${targetLanguage}; English, Chinese, and Japanese prompts are generated together.`,
    [targetLanguage]
  );

  const buildPayload = (q: any) => {
    if (q.type === "reading" && Array.isArray(q.questions)) {
      return q.questions.map((subQ: any) =>
        toInsertPayload(
          {
            ...subQ,
            exam_type: q.exam_type,
            grade: q.grade,
            skill: q.skill,
            difficulty: q.difficulty,
            pathway: q.pathway,
            level: q.level,
            level_label: q.level_label,
            pathway_variant: q.pathway_variant,
            variant_label: q.variant_label,
            difficulty_label: q.difficulty_label,
            passage: q.passage,
          },
          targetLanguage,
          category
        )
      );
    }

    return [toInsertPayload(q, targetLanguage, category)];
  };

  const loadReviewQueue = async () => {
    setReviewLoading(true);
    setErrorMsg("");

    let query = supabase
      .from("questions")
      .select("*")
      .eq("status", "needs_review")
      .order("created_at", { ascending: false })
      .limit(50);

    query =
      targetLanguage === "English"
        ? query.or("target_language.eq.English,target_language.is.null")
        : query.eq("target_language", targetLanguage);

    const { data, error } = await query;

    if (error) {
      console.error(error);
      setErrorMsg(error.message);
      setQuestions([]);
    } else {
      setQuestions(data || []);
    }

    setReviewLoading(false);
  };

  useEffect(() => {
    loadReviewQueue();
  }, [targetLanguage]);

  const formatTags = (q: any) =>
    [
      q.pathway || q.exam_type || targetLanguage,
      q.level || q.grade,
      q.pathway_variant,
      q.skill,
      q.category,
    ].filter(Boolean);

  const updateReviewStatus = async (questionId: string, status: "approved" | "rejected") => {
    const { error } = await supabase
      .from("questions")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", questionId);

    if (error) {
      console.error("REVIEW UPDATE ERROR:", error);
      setErrorMsg(`Failed to mark question ${status}: ${error.message}`);
      return;
    }

    setQuestions((current) =>
      current
        .map((item) =>
          item.id === questionId
            ? { ...item, status, updated_at: new Date().toISOString() }
            : item
        )
        .filter((item) => {
          const isReadingRow = item.passage && READING_SKILLS.has(item.skill || "");
          return isReadingRow || item.status === "needs_review";
        })
    );
    if (editingQuestion?.id === questionId) {
      setEditingQuestion(null);
      setDraft(null);
    }
  };

  const openEdit = (question: any) => {
    setEditingQuestion(question);
    setDraft({ ...question });
    setPreviewEditing(false);
  };

  const updateDraft = (field: string, value: string) => {
    setDraft((current: any) => ({ ...(current || {}), [field]: value }));
  };

  const saveDraft = async () => {
    if (!editingQuestion || !draft) return;

    setSavingDraft(true);

    const payload = {
      question_text: draft.question_en || draft.question_text || null,
      question_en: draft.question_en || null,
      question_zh: draft.question_zh || null,
      question_ja: draft.question_ja || null,
      option_a: draft.option_a_en || draft.option_a || null,
      option_b: draft.option_b_en || draft.option_b || null,
      option_c: draft.option_c_en || draft.option_c || null,
      option_d: draft.option_d_en || draft.option_d || null,
      option_a_en: draft.option_a_en || null,
      option_a_zh: draft.option_a_zh || null,
      option_a_ja: draft.option_a_ja || null,
      option_b_en: draft.option_b_en || null,
      option_b_zh: draft.option_b_zh || null,
      option_b_ja: draft.option_b_ja || null,
      option_c_en: draft.option_c_en || null,
      option_c_zh: draft.option_c_zh || null,
      option_c_ja: draft.option_c_ja || null,
      option_d_en: draft.option_d_en || null,
      option_d_zh: draft.option_d_zh || null,
      option_d_ja: draft.option_d_ja || null,
      explanation: draft.explanation_en || draft.explanation || null,
      explanation_en: draft.explanation_en || null,
      explanation_zh: draft.explanation_zh || null,
      explanation_ja: draft.explanation_ja || null,
      category: draft.category || null,
      passage: draft.passage || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("questions")
      .update(payload)
      .eq("id", editingQuestion.id)
      .select("*")
      .single();

    setSavingDraft(false);

    if (error) {
      setErrorMsg(`Failed to save edits: ${error.message}`);
      return;
    }

    setQuestions((current) => current.map((item) => (item.id === data.id ? data : item)));
    setEditingQuestion(null);
    setDraft(null);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("You must be logged in to generate questions.");
      }

      const res = await fetch(apiUrl("/api/generate-questions"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          examType,
          grade,
          skill,
          difficulty,
          category,
          questionCount,
          extraPrompt,
          targetLanguage,
          pathway: examType,
          level: grade,
          pathwayVariant: targetLanguage === "English" ? pathwayVariant : undefined,
          levelLabel: targetLanguage === "English" ? englishPathway.levelLabel : nonEnglishPathway?.levelLabel || "Level",
          variantLabel: targetLanguage === "English" ? englishPathway.variantLabel || null : null,
          skillLabel: targetLanguage === "English" ? englishPathway.skillLabel : nonEnglishPathway?.skillLabel || "Skill",
          difficultyLabel:
            targetLanguage === "English" ? englishPathway.difficultyLabel || null : "Difficulty",
        }),
      });

      const rawText = await res.text();

      if (!res.ok) {
        let serverMessage = rawText;

        try {
          const errorBody = JSON.parse(rawText);
          serverMessage = errorBody.error || errorBody.message || rawText;
        } catch {
          serverMessage = rawText;
        }

        throw new Error(serverMessage || `Backend error ${res.status}`);
      }

      const data = JSON.parse(rawText);

      if (!data.text) {
        setErrorMsg("No data returned from server: " + JSON.stringify(data));
        return;
      }

      const text = data.text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(text);

      const categorised = Array.isArray(parsed)
        ? parsed.map((q: any) => ({
            ...q,
            type: "normal",
            exam_type: examType,
            grade,
            skill,
            difficulty,
            target_language: targetLanguage,
            pathway: examType,
            level: grade,
            level_label: targetLanguage === "English" ? englishPathway.levelLabel : nonEnglishPathway?.levelLabel,
            pathway_variant: targetLanguage === "English" ? pathwayVariant || null : undefined,
            variant_label: targetLanguage === "English" ? englishPathway.variantLabel || null : undefined,
            difficulty_label:
              targetLanguage === "English" ? englishPathway.difficultyLabel || null : undefined,
            id: Date.now() + Math.random(),
          }))
        : parsed.type === "reading"
          ? [
              {
                ...parsed,
                exam_type: examType,
                grade,
                skill,
                difficulty,
                target_language: targetLanguage,
                pathway: examType,
                level: grade,
                level_label: targetLanguage === "English" ? englishPathway.levelLabel : nonEnglishPathway?.levelLabel,
                pathway_variant: targetLanguage === "English" ? pathwayVariant || null : undefined,
                variant_label: targetLanguage === "English" ? englishPathway.variantLabel || null : undefined,
                difficulty_label:
                  targetLanguage === "English" ? englishPathway.difficultyLabel || null : undefined,
                id: Date.now(),
              },
            ]
          : [];

      const payload = categorised.flatMap(buildPayload);

      if (payload.length === 0) {
        throw new Error("No valid questions were generated.");
      }

      const { data: savedQuestions, error: saveError } = await supabase
        .from("questions")
        .insert(payload)
        .select("*");

      if (saveError) {
        throw new Error(`Generated questions could not be saved: ${saveError.message}`);
      }

      setQuestions((current) => [...(savedQuestions || []), ...current]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to generate questions.");
    } finally {
      setLoading(false);
    }
  };

  const getCorrectAnswerText = (q: any) => {
    if (q.correct_answer === "option_a") return q.option_a_en || q.option_a;
    if (q.correct_answer === "option_b") return q.option_b_en || q.option_b;
    if (q.correct_answer === "option_c") return q.option_c_en || q.option_c;
    if (q.correct_answer === "option_d") return q.option_d_en || q.option_d;
    return q.correct_answer;
  };

  const reviewItems = useMemo(() => {
    const grouped = new Map<string, any>();
    const items: any[] = [];

    questions.forEach((question) => {
      const isReadingRow =
        question.passage && READING_SKILLS.has(question.skill || "");

      if (!isReadingRow) {
        items.push(question);
        return;
      }

      const key = [
        question.target_language,
        question.pathway || question.exam_type,
        question.level || question.grade,
        question.skill,
        question.category,
        question.passage,
      ].join("::");

      if (!grouped.has(key)) {
        const group = {
          ...question,
          id: `reading-${question.id}`,
          type: "reading_group",
          questions: [],
        };
        grouped.set(key, group);
        items.push(group);
      }

      grouped.get(key).questions.push(question);
    });

    return items.filter((item) => {
      if (item.type === "reading_group") {
        return item.questions.some((question: any) => (question.status || "needs_review") === "needs_review");
      }

      return (item.status || "needs_review") === "needs_review";
    });
  }, [questions]);

  const updateReviewGroupStatus = async (questionIds: string[], status: "approved" | "rejected") => {
    const { error } = await supabase
      .from("questions")
      .update({ status, updated_at: new Date().toISOString() })
      .in("id", questionIds);

    if (error) {
      console.error("REVIEW GROUP UPDATE ERROR:", error);
      setErrorMsg(`Failed to mark reading set ${status}: ${error.message}`);
      return;
    }

    setQuestions((current) =>
      current
        .map((item) =>
          questionIds.includes(item.id)
            ? { ...item, status, updated_at: new Date().toISOString() }
            : item
        )
        .filter((item) => item.status === "needs_review")
    );
  };

  const getReadingSetStatus = (readingQuestions: any[]) => {
    const statuses = readingQuestions.map((question) => question.status || "needs_review");

    if (statuses.every((status) => status === "approved")) return "all approved";
    if (statuses.every((status) => status === "rejected")) return "all rejected";
    if (statuses.includes("approved") || statuses.includes("rejected")) return "partially reviewed";
    return "needs_review";
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-accent">
            Question Bank Builder
          </p>
          <h1 className="font-serif text-3xl text-primary sm:text-5xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            Generate target-language learning questions for {targetLanguage}. Each
            saved question stores English, Chinese, and Japanese prompt versions in
            one synchronized record.
          </p>
        </div>

        <div className="rounded-[1.8rem] border bg-card p-5 shadow-soft sm:p-6">
          <div className="mb-5 rounded-2xl border bg-secondary/45 px-4 py-3 text-sm font-semibold text-primary">
            {languageSummary}
            <span className="mt-1 block text-xs font-medium leading-6 text-primary/55">
              Focus: {config.focus}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <select
              className="w-full rounded-2xl border bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              value={targetLanguage}
              onChange={(e) => setSelectedTargetLanguage(e.target.value as TargetLanguage)}
              disabled={Boolean(fixedTargetLanguage)}
            >
              {Object.keys(LANGUAGE_CONFIG).map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <select
              className="w-full rounded-2xl border bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
            >
              {config.examTypes.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <select
              className="w-full rounded-2xl border bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            >
              {activeLevels.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <select
              className="w-full rounded-2xl border bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
            >
              {activeSkills.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            {activeDifficultyOptions.length > 0 ? (
              <select
                className="w-full rounded-2xl border bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                {activeDifficultyOptions.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            ) : (
              <div className="rounded-2xl border bg-secondary/45 px-4 py-3 text-sm font-semibold leading-6 text-primary/60">
                No separate difficulty field for {examType}
              </div>
            )}

	            {activeVariants.length > 0 && (
	              <select
                className="w-full rounded-2xl border bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                value={pathwayVariant}
                onChange={(e) => setPathwayVariant(e.target.value)}
              >
                {activeVariants.map((item) => (
                  <option key={item}>{item}</option>
                ))}
	              </select>
	            )}
	          </div>

	          {isReadingGenerator && (
	            <div className="mt-4 rounded-2xl border border-[#eee8ff] bg-[#fbfaff] px-4 py-3 text-sm font-semibold leading-6 text-primary/65">
	              Reading generation is passage-first: Luna creates one shared passage and automatically limits it to 1–3 mixed comprehension questions based on the selected level.
	            </div>
	          )}

	          {targetLanguage === "English" && (
            <div className="mt-4 grid gap-3 rounded-2xl border bg-[#fbfaff] p-4 text-sm text-primary/65 sm:grid-cols-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-primary/40">
                  {englishPathway.levelLabel}
                </p>
                <p className="mt-1 font-semibold text-primary">{grade}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-primary/40">
                  {englishPathway.skillLabel}
                </p>
                <p className="mt-1 font-semibold text-primary">{skill}</p>
              </div>
              {englishPathway.variantLabel && (
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-primary/40">
                    {englishPathway.variantLabel}
                  </p>
                  <p className="mt-1 font-semibold text-primary">{pathwayVariant || "-"}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-primary/40">
                  {englishPathway.difficultyLabel || "Exam Focus"}
                </p>
                <p className="mt-1 font-semibold text-primary">{difficulty || examType}</p>
              </div>
            </div>
          )}

          <div className="mt-4 grid gap-4 md:grid-cols-[180px_1fr]">
            <select
              className="w-full rounded-2xl border bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              value={questionCount}
              onChange={(e) => setQuestionCount(e.target.value)}
            >
              <option value="3">3 questions</option>
              <option value="5">5 questions</option>
              <option value="10">10 questions</option>
              <option value="15">15 questions</option>
            </select>

            <input
              className="w-full rounded-2xl border bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              placeholder={
                targetLanguage === "English"
                  ? englishPathway.topicPlaceholder
                  : "Category, e.g. Animals, School Life, JLPT N5, HSK 1..."
              }
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <input
            className="mt-4 w-full rounded-2xl border bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            placeholder="Extra prompt, e.g. use school vocabulary, daily conversation, short passages..."
              value={extraPrompt}
              onChange={(e) => setExtraPrompt(e.target.value)}
          />

          <Button
            type="button"
            className="mt-5 h-12 w-full rounded-2xl"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? "Generating..." : `Generate ${targetLanguage} Questions`}
          </Button>
        </div>

        {errorMsg && (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm leading-7 text-red-700">
            {errorMsg}
          </div>
        )}

        {questions.length > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-primary">Review Queue</p>
              <p className="text-sm text-muted-foreground">
                {questions.length} questions waiting for approval. Approved items move to the Language Question Bank.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full rounded-2xl sm:w-auto"
              onClick={loadReviewQueue}
              disabled={reviewLoading}
            >
              {reviewLoading ? "Refreshing..." : "Refresh Queue"}
            </Button>
          </div>
        )}

        {!reviewLoading && questions.length === 0 && (
          <div className="rounded-[1.8rem] border bg-card p-8 text-center text-muted-foreground shadow-soft">
            No {targetLanguage} questions waiting for review.
          </div>
        )}

        <div className="grid gap-6">
          {reviewItems.map((q, i) => {
            if (q.type === "reading" || q.type === "reading_group") {
              const readingQuestions = q.questions || [];
              const questionIds = readingQuestions.map((item: any) => item.id).filter(Boolean);
              const setStatus = getReadingSetStatus(readingQuestions);

              return (
                <div key={q.id} className="rounded-[1.8rem] border bg-card p-5 shadow-soft sm:p-6">
                  <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex flex-wrap gap-2 text-xs font-bold text-primary/60">
                      {formatTags(q).map((tag) => (
                        <span key={tag} className="rounded-full bg-secondary px-3 py-1">
                          {tag}
                        </span>
                      ))}
                      <span className="rounded-full bg-secondary px-3 py-1">EN / ZH / JA prompts</span>
                      <span
                        className={`rounded-full px-3 py-1 ${
                          setStatus === "partially reviewed"
                            ? "bg-blue-100 text-blue-800"
                            : setStatus === "all approved"
                              ? "bg-green-100 text-green-800"
                              : setStatus === "all rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {setStatus}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        type="button"
                        className="w-full rounded-2xl sm:w-auto"
                        onClick={() => updateReviewGroupStatus(questionIds, "approved")}
                        disabled={questionIds.length === 0}
                      >
                        Approve All
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full rounded-2xl border-red-200 text-red-700 sm:w-auto"
                        onClick={() => updateReviewGroupStatus(questionIds, "rejected")}
                        disabled={questionIds.length === 0}
                      >
                        Reject All
                      </Button>
                    </div>
                  </div>

                  <p className="mb-4 text-sm text-muted-foreground">Passage:</p>
                  <p className="mb-6 max-h-[45vh] overflow-y-auto whitespace-pre-line rounded-2xl border bg-white p-4 text-sm leading-7 text-muted-foreground sm:p-5">
                    {q.passage}
                  </p>

                  {readingQuestions.map((subQ: any, idx: number) => (
                    <div key={idx} className="mb-6 border-t pt-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-primary/60">
                              Question {idx + 1}
                            </span>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${
                                (subQ.status || "needs_review") === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : (subQ.status || "needs_review") === "rejected"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {subQ.status || "needs_review"}
                            </span>
                          </div>
                          <p className="font-semibold">
                            {subQ.question_en || subQ.question_text}
                          </p>
                        </div>
                        {subQ.id && (
                          <div className="flex flex-col gap-2 sm:flex-row">
                            <Button
                              type="button"
                              variant="outline"
                              className="h-10 rounded-2xl sm:w-auto"
                              onClick={() => openEdit(subQ)}
                            >
                              Preview
                            </Button>
                            {(subQ.status || "needs_review") === "needs_review" && (
                              <>
                                <Button
                                  type="button"
                                  className="h-10 rounded-2xl sm:w-auto"
                                  onClick={() => updateReviewStatus(subQ.id, "approved")}
                                >
                                  Approve
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="h-10 rounded-2xl border-red-200 text-red-700 sm:w-auto"
                                  onClick={() => updateReviewStatus(subQ.id, "rejected")}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="mt-3 grid gap-3 text-sm leading-7 md:grid-cols-2">
                        <p>A. {subQ.option_a_en || subQ.option_a}</p>
                        <p>B. {subQ.option_b_en || subQ.option_b}</p>
                        <p>C. {subQ.option_c_en || subQ.option_c}</p>
                        <p>D. {subQ.option_d_en || subQ.option_d}</p>
                      </div>

                      <p className="mt-2 text-sm text-green-700">
                        Correct: {getCorrectAnswerText(subQ)}
                      </p>

                      <p className="text-sm text-muted-foreground">{subQ.explanation_en || subQ.explanation}</p>
                    </div>
                  ))}

                </div>
              );
            }

            return (
              <div key={q.id || i} className="rounded-[1.8rem] border bg-card p-5 shadow-soft sm:p-6">
                <div className="mb-4 flex flex-wrap gap-2 text-xs font-bold text-primary/60">
                  {formatTags(q).map((tag) => (
                    <span key={tag} className="rounded-full bg-secondary px-3 py-1">
                      {tag}
                    </span>
                  ))}
                  <span className="rounded-full bg-secondary px-3 py-1">EN / ZH / JA prompts</span>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800">
                    {q.status || "needs_review"}
                  </span>
                </div>

                {q.passage && (
                  <div className="mb-5 max-h-[45vh] overflow-y-auto rounded-2xl border bg-white p-4 sm:p-5">
                    <p className="mb-2 text-sm font-semibold text-muted-foreground">Read the paragraph.</p>
                    <p className="leading-7 text-muted-foreground">{q.passage}</p>
                  </div>
                )}

                <p className="font-semibold">
                  {i + 1}. {q.question_en || q.question_text}
                </p>

                <div className="mt-3 grid gap-3 text-sm leading-7 md:grid-cols-2">
                  <p>A. {q.option_a_en || q.option_a}</p>
                  <p>B. {q.option_b_en || q.option_b}</p>
                  <p>C. {q.option_c_en || q.option_c}</p>
                  <p>D. {q.option_d_en || q.option_d}</p>
                </div>

                <p className="mt-4 text-sm text-green-700">Correct: {getCorrectAnswerText(q)}</p>
                <p className="mt-2 text-sm text-muted-foreground">{q.explanation_en || q.explanation}</p>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-2xl sm:w-auto"
                    onClick={() => openEdit(q)}
                  >
                    Preview
                  </Button>
                  <Button
                    type="button"
                    className="w-full rounded-2xl sm:w-auto"
                    onClick={() => updateReviewStatus(q.id, "approved")}
                  >
                    Approve
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-2xl border-red-200 text-red-700 sm:w-auto"
                    onClick={() => updateReviewStatus(q.id, "rejected")}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {editingQuestion && draft && (
        <div className="fixed inset-0 z-50 bg-primary/30 backdrop-blur-sm">
          <div className="ml-auto flex h-full w-full max-w-3xl flex-col overflow-y-auto bg-white shadow-elegant">
            <div className="sticky top-0 z-10 border-b bg-white/95 p-5 backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-accent">
                    Review Question
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-primary">
                    {formatTags(draft).join(" · ") || "Language Question"}
                  </h2>
                </div>

                <Button
                  variant="outline"
                  className="rounded-2xl"
                  onClick={() => {
                    setEditingQuestion(null);
                    setDraft(null);
                    setPreviewEditing(false);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>

            <div className="space-y-6 p-5">
              <input
                value={draft.category || ""}
                onChange={(e) => updateDraft("category", e.target.value)}
                placeholder="Category"
                readOnly={!previewEditing}
                className="min-h-11 w-full rounded-2xl border bg-white px-4 py-3"
              />

              {draft.passage !== null && draft.passage !== undefined && (
                <section className="rounded-[1.5rem] border bg-[#fbfaff] p-4">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
                    Passage
                  </p>
                  <textarea
                    value={draft.passage || ""}
                    onChange={(e) => updateDraft("passage", e.target.value)}
                    readOnly={!previewEditing}
                    className="mt-2 min-h-28 w-full rounded-2xl border bg-white px-4 py-3 text-sm leading-6"
                  />
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
                      readOnly={!previewEditing}
                      className="mt-2 min-h-24 w-full rounded-2xl border bg-white px-4 py-3 text-sm leading-6"
                    />

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {["a", "b", "c", "d"].map((option) => (
                        <label
                          key={option}
                          className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground"
                        >
                          Option {option.toUpperCase()}
                          <input
                            value={draft[`option_${option}_${suffix}`] || ""}
                            onChange={(e) => updateDraft(`option_${option}_${suffix}`, e.target.value)}
                            readOnly={!previewEditing}
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
                      readOnly={!previewEditing}
                      className="mt-2 min-h-24 w-full rounded-2xl border bg-white px-4 py-3 text-sm leading-6"
                    />
                  </section>
                );
              })}
            </div>

            <div className="sticky bottom-0 border-t bg-white/95 p-5 backdrop-blur">
              <div className="grid gap-2 sm:grid-cols-3">
                <Button
                  variant="outline"
                  className="h-12 rounded-2xl"
                  onClick={previewEditing ? saveDraft : () => setPreviewEditing(true)}
                  disabled={savingDraft}
                >
                  {savingDraft ? "Saving..." : previewEditing ? "Save Edits" : "Edit"}
                </Button>
                <Button
                  className="h-12 rounded-2xl"
                  onClick={() => updateReviewStatus(editingQuestion.id, "approved")}
                >
                  Approve
                </Button>
                <Button
                  variant="outline"
                  className="h-12 rounded-2xl border-red-200 text-red-700"
                  onClick={() => updateReviewStatus(editingQuestion.id, "rejected")}
                >
                  Reject
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageQuestionGenerator;
