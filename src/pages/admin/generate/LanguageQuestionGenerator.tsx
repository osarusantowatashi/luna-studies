import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { ENGLISH_PATHWAY_KEYS, getEnglishPathway } from "@/lib/englishPathways";

const GRADES = [
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Beginner",
  "Intermediate",
  "Advanced",
];

const DIFFICULTIES = ["Easy", "Medium", "Hard", "Advanced"];

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
    examTypes: ["Japanese", "JLPT Foundation", "Japanese Foundation"],
    skills: ["Hiragana", "Katakana", "Vocabulary", "Grammar", "Reading", "Sentence Writing"],
    defaultExam: "Japanese",
    defaultGrade: "Beginner",
    focus:
      "JLPT-style learning, hiragana, katakana, kanji, vocabulary, grammar, particles, reading, and sentence patterns.",
  },
  Chinese: {
    label: "Chinese",
    examTypes: ["Chinese", "Mandarin Foundation", "Chinese Foundation"],
    skills: ["Pinyin", "Characters", "Vocabulary", "Grammar", "Reading", "Sentence Writing"],
    defaultExam: "Chinese",
    defaultGrade: "Beginner",
    focus:
      "Chinese vocabulary, pinyin, characters, reading, sentence structure, and HSK-style learning when selected.",
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
  status: "approved",
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
  const [errorMsg, setErrorMsg] = useState("");

  const title = fixedTargetLanguage
    ? `${config.label} Question Generator`
    : "Language Question Generator";
  const englishPathway = getEnglishPathway(examType);
  const activeSkills = targetLanguage === "English" ? englishPathway.skills : config.skills;
  const activeLevels = targetLanguage === "English" ? englishPathway.levels : GRADES;
  const activeDifficultyOptions =
    targetLanguage === "English"
      ? englishPathway.difficulties || []
      : DIFFICULTIES;
  const activeVariants = targetLanguage === "English" ? englishPathway.variants || [] : [];

  useEffect(() => {
    setExamType(config.defaultExam);
    setGrade(config.defaultGrade);
    setSkill(config.skills[0]);
    setDifficulty(targetLanguage === "English" ? getEnglishPathway(config.defaultExam).difficulties?.[0] || "" : "Medium");
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

  const handleGenerate = async () => {
    setLoading(true);
    setErrorMsg("");
    setQuestions([]);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("You must be logged in to generate questions.");
      }

      const res = await fetch("http://localhost:3001/api/generate-questions", {
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
          pathway: targetLanguage === "English" ? examType : undefined,
          level: targetLanguage === "English" ? grade : undefined,
          pathwayVariant: targetLanguage === "English" ? pathwayVariant : undefined,
          levelLabel: targetLanguage === "English" ? englishPathway.levelLabel : "Grade / Level",
          variantLabel: targetLanguage === "English" ? englishPathway.variantLabel || null : null,
          skillLabel: targetLanguage === "English" ? englishPathway.skillLabel : "Skill",
          difficultyLabel:
            targetLanguage === "English" ? englishPathway.difficultyLabel || null : "Difficulty",
        }),
      });

      const rawText = await res.text();

      if (!res.ok) {
        throw new Error(`Backend error ${res.status}: ${rawText}`);
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
            pathway: targetLanguage === "English" ? examType : undefined,
            level: targetLanguage === "English" ? grade : undefined,
            level_label: targetLanguage === "English" ? englishPathway.levelLabel : undefined,
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
                pathway: targetLanguage === "English" ? examType : undefined,
                level: targetLanguage === "English" ? grade : undefined,
                level_label: targetLanguage === "English" ? englishPathway.levelLabel : undefined,
                pathway_variant: targetLanguage === "English" ? pathwayVariant || null : undefined,
                variant_label: targetLanguage === "English" ? englishPathway.variantLabel || null : undefined,
                difficulty_label:
                  targetLanguage === "English" ? englishPathway.difficultyLabel || null : undefined,
                id: Date.now(),
              },
            ]
          : [];

      setQuestions(categorised);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to generate questions.");
    } finally {
      setLoading(false);
    }
  };

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

  const saveQuestion = async (q: any) => {
    const { error } = await supabase.from("questions").insert(buildPayload(q));

    if (error) {
      console.error("SAVE ERROR:", error);
      alert("Failed to save question: " + error.message);
      return;
    }

    alert("Saved to database!");
  };

  const saveAllQuestions = async () => {
    const cleaned = questions.flatMap(buildPayload);
    const { error } = await supabase.from("questions").insert(cleaned);

    if (error) {
      console.error("SAVE ERROR:", error);
      alert("Failed to save questions: " + error.message);
      return;
    }

    alert(`${cleaned.length} questions saved to database!`);
  };

  const getCorrectAnswerText = (q: any) => {
    if (q.correct_answer === "option_a") return q.option_a_en || q.option_a;
    if (q.correct_answer === "option_b") return q.option_b_en || q.option_b;
    if (q.correct_answer === "option_c") return q.option_c_en || q.option_c;
    if (q.correct_answer === "option_d") return q.option_d_en || q.option_d;
    return q.correct_answer;
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
            <p className="text-muted-foreground">Generated {questions.length} question groups</p>

            <Button type="button" className="w-full rounded-2xl sm:w-auto" onClick={saveAllQuestions}>
              Save All Questions
            </Button>
          </div>
        )}

        <div className="grid gap-6">
          {questions.map((q, i) => {
            if (q.type === "reading") {
              return (
                <div key={q.id} className="rounded-[1.8rem] border bg-card p-5 shadow-soft sm:p-6">
                  <div className="mb-4 flex flex-wrap gap-2 text-xs font-bold text-primary/60">
                    <span className="rounded-full bg-secondary px-3 py-1">Learning {targetLanguage}</span>
                    <span className="rounded-full bg-secondary px-3 py-1">EN / ZH / JA prompts</span>
                  </div>

                  <p className="mb-4 text-sm text-muted-foreground">Passage:</p>
                  <p className="mb-6 max-h-[45vh] overflow-y-auto whitespace-pre-line rounded-2xl border bg-white p-4 text-sm leading-7 text-muted-foreground sm:p-5">
                    {q.passage}
                  </p>

                  {q.questions.map((subQ: any, idx: number) => (
                    <div key={idx} className="mb-6 border-t pt-4">
                      <p className="font-semibold">
                        {idx + 1}. {subQ.question_en || subQ.question_text}
                      </p>

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

                  <Button type="button" className="mt-2 w-full rounded-2xl sm:w-auto" onClick={() => saveQuestion(q)}>
                    Approve & Save
                  </Button>
                </div>
              );
            }

            return (
              <div key={q.id || i} className="rounded-[1.8rem] border bg-card p-5 shadow-soft sm:p-6">
                <div className="mb-4 flex flex-wrap gap-2 text-xs font-bold text-primary/60">
                  <span className="rounded-full bg-secondary px-3 py-1">Learning {targetLanguage}</span>
                  <span className="rounded-full bg-secondary px-3 py-1">EN / ZH / JA prompts</span>
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

                <Button type="button" className="mt-4 w-full rounded-2xl sm:w-auto" onClick={() => saveQuestion(q)}>
                  Approve & Save
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LanguageQuestionGenerator;
