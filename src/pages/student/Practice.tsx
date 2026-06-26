import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Flame,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";
import {
  buildEnglishAccessKey,
  getEnglishPathway,
} from "@/lib/englishPathways";
import {
  buildLanguageAccessKey,
  NON_ENGLISH_LANGUAGE_PATHWAYS,
  parseLanguageAccessKey,
} from "@/lib/languagePathways";

const DAILY_GOAL = 30;

const TARGET_LANGUAGES = ["English", "Japanese", "Chinese"];

const EXPLANATION_LANGUAGES = ["English", "Chinese", "Japanese"];
const EXPLANATION_LANGUAGE_LABELS: Record<string, string> = {
  English: "English",
  Chinese: "中文",
  Japanese: "日本語",
};

const READING_SKILLS = new Set([
  "Reading",
  "Reading Comprehension",
  "Main Idea",
  "Inference",
  "Detail Questions",
  "Literature",
  "Informational Text",
]);

const PASSAGE_TEXT_SIZE_KEY = "luna-practice-passage-text-size";

const PASSAGE_TEXT_CLASSES = {
  Small: {
    passage: "text-base leading-8",
    question: "text-lg leading-8",
  },
  Normal: {
    passage: "text-lg leading-9",
    question: "text-xl leading-9",
  },
  Large: {
    passage: "text-xl leading-10",
    question: "text-2xl leading-10",
  },
} as const;

type PassageTextSize = keyof typeof PASSAGE_TEXT_CLASSES;

const SKILLS_BY_LANGUAGE: Record<string, string[]> = {
  English: ["Mix"],
  Japanese: ["Mix", ...NON_ENGLISH_LANGUAGE_PATHWAYS.Japanese.skills],
  Chinese: ["Mix", ...NON_ENGLISH_LANGUAGE_PATHWAYS.Chinese.skills],
};

type PracticeAccess = {
  key: string;
  targetLanguage: string;
  pathway: string;
  level: string;
  label: string;
};

const shuffleArray = (array: any[]) => {
  return [...array].sort(() => Math.random() - 0.5);
};

const languageSuffix = (language: string) =>
  language === "Chinese" ? "zh" : language === "Japanese" ? "ja" : "en";

const localizedField = (q: any, base: string, language: string) => {
  if (!q) return "";

  const suffix = languageSuffix(language);

  return q[`${base}_${suffix}`] || q[base] || q[`${base}_en`] || "";
};

const sortByOrder = (items: string[], order: string[]) => {
  const orderMap = new Map(order.map((item, index) => [item, index]));

  return [...items].sort((a, b) => {
    const aIndex = orderMap.has(a) ? orderMap.get(a)! : Number.MAX_SAFE_INTEGER;
    const bIndex = orderMap.has(b) ? orderMap.get(b)! : Number.MAX_SAFE_INTEGER;

    if (aIndex !== bIndex) return aIndex - bIndex;
    return a.localeCompare(b);
  });
};

const isReadingQuestion = (question: any) =>
  Boolean(question?.passage) && READING_SKILLS.has(question?.skill || "");

const buildPracticeItems = (questionRows: any[]) => {
  const grouped = new Map<string, any>();
  const items: any[] = [];

  questionRows.forEach((question) => {
    if (!isReadingQuestion(question)) {
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

  return items;
};

const Practice = () => {
  const [allowedGrades, setAllowedGrades] = useState<string[]>([]);
  const [accessOptions, setAccessOptions] = useState<PracticeAccess[]>([]);
  const [canViewAnswers, setCanViewAnswers] = useState(false);

  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedPathway, setSelectedPathway] = useState("Legacy Grade");
  const [selectedPathwayVariant, setSelectedPathwayVariant] = useState("All");
  const [selectedSkill, setSelectedSkill] = useState("Mix");
  const [selectedTargetLanguage, setSelectedTargetLanguage] = useState("English");
  const [selectedExplanationLanguage, setSelectedExplanationLanguage] = useState("English");

  const [questions, setQuestions] = useState<any[]>([]);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [practiceNotice, setPracticeNotice] = useState("");
  const [questionNotice, setQuestionNotice] = useState("");
  const [startBlockedReason, setStartBlockedReason] = useState("");
  const [passageTextSize, setPassageTextSize] = useState<PassageTextSize>(() => {
    if (typeof window === "undefined") return "Normal";

    const saved = window.localStorage.getItem(PASSAGE_TEXT_SIZE_KEY);

    return saved === "Small" || saved === "Normal" || saved === "Large"
      ? saved
      : "Normal";
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [selectedGroupAnswers, setSelectedGroupAnswers] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [passageExpanded, setPassageExpanded] = useState(false);

  const [attemptedCount, setAttemptedCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    window.localStorage.setItem(PASSAGE_TEXT_SIZE_KEY, passageTextSize);
  }, [passageTextSize]);

  const fetchStats = async (userId: string) => {
    const { data } = await supabase
      .from("attempts")
      .select("id, is_correct")
      .eq("user_id", userId);

    const attempts = data || [];

    setAttemptedCount(attempts.length);
    setCorrectCount(attempts.filter((a) => a.is_correct).length);
  };

  useEffect(() => {
    const fetchAccess = async () => {
      setLoading(true);

      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("can_view_answers")
        .eq("id", user.id)
        .maybeSingle();

      setCanViewAnswers(profileData?.can_view_answers === true);

      let { data, error } = await supabase
        .from("student_grade_access")
        .select("grade, target_language, pathway, level")
        .eq("student_id", user.id);

      if (error) {
        const fallback = await supabase
          .from("student_grade_access")
          .select("grade")
          .eq("student_id", user.id);

        data = fallback.data;
        error = fallback.error;
      }

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      const mappedAccess: PracticeAccess[] = (data || []).map((item: any) => {
        const parsed = parseLanguageAccessKey(item.grade || "");
        const pathway = item.pathway || parsed?.pathway || "Legacy Grade";
        const level = item.level || parsed?.level || item.grade;
        const targetLanguage = item.target_language || parsed?.targetLanguage || "English";

        return {
          key:
            targetLanguage === "English" && pathway !== "Legacy Grade"
              ? buildEnglishAccessKey(pathway, level)
              : buildLanguageAccessKey(targetLanguage as any, pathway, level),
          targetLanguage,
          pathway,
          level,
          label: pathway === "Legacy Grade" ? level : `${pathway} ${level}`,
        };
      });
      const grades = mappedAccess
        .filter((item) => item.targetLanguage !== "English" || item.pathway !== "Legacy Grade")
        .map((item) => item.level)
        .filter(Boolean);
      setAllowedGrades(grades);
      setAccessOptions(mappedAccess);

      if (mappedAccess.length > 0) {
        const firstEnglishPathway =
          mappedAccess.find((item) => item.targetLanguage === "English" && item.pathway !== "Legacy Grade") ||
          mappedAccess.find((item) => item.targetLanguage !== "English");

        if (firstEnglishPathway) {
          setSelectedTargetLanguage(firstEnglishPathway.targetLanguage || "English");
          setSelectedPathway(firstEnglishPathway.pathway || "");
          setSelectedGrade(firstEnglishPathway.level || firstEnglishPathway.label);
        }
      }

      await fetchStats(user.id);

      setLoading(false);
    };

    fetchAccess();
  }, []);

  useEffect(() => {
    const englishPathway = getEnglishPathway(selectedPathway);
    const skills =
      selectedTargetLanguage === "English" && selectedPathway !== "Legacy Grade"
        ? ["Mix", ...englishPathway.skills]
        : SKILLS_BY_LANGUAGE[selectedTargetLanguage] || SKILLS_BY_LANGUAGE.English;

    if (!skills.includes(selectedSkill)) {
      setSelectedSkill("Mix");
    }
  }, [selectedPathway, selectedSkill, selectedTargetLanguage]);

  const englishAccessOptions = useMemo(
    () => accessOptions.filter((item) => item.targetLanguage === "English" && item.pathway !== "Legacy Grade"),
    [accessOptions]
  );

  const selectedLanguageAccessOptions = useMemo(
    () =>
      accessOptions.filter(
        (item) => item.targetLanguage === selectedTargetLanguage && item.pathway !== "Legacy Grade"
      ),
    [accessOptions, selectedTargetLanguage]
  );

  const availableTargetLanguages = useMemo(() => {
    const languages = Array.from(
      new Set(
        accessOptions
          .filter((item) => item.targetLanguage !== "English")
          .map((item) => item.targetLanguage)
          .filter(Boolean)
      )
    );

    if (englishAccessOptions.length > 0) languages.unshift("English");

    return languages;
  }, [accessOptions, englishAccessOptions]);

  const availableEnglishPathways = useMemo(() => {
    const pathways = Array.from(new Set(englishAccessOptions.map((item) => item.pathway || "Legacy Grade")));
    const order = [
      "MAP",
      "WIDA",
      "CAT4",
      "AEIS",
      "O-Level English",
      "TOEFL",
      "IELTS",
    ];
    return sortByOrder(pathways, order);
  }, [englishAccessOptions]);

  const availablePathways = useMemo(
    () => {
      const pathways = Array.from(new Set(selectedLanguageAccessOptions.map((item) => item.pathway).filter(Boolean)));
      const order =
        selectedTargetLanguage === "Japanese"
          ? ["JLPT"]
          : selectedTargetLanguage === "Chinese"
            ? ["HSK"]
            : availableEnglishPathways;

      return sortByOrder(pathways, order);
    },
    [availableEnglishPathways, selectedLanguageAccessOptions, selectedTargetLanguage]
  );

  const availableEnglishLevels = useMemo(
    () =>
      sortByOrder(
        englishAccessOptions
        .filter((item) => (item.pathway || "Legacy Grade") === selectedPathway)
        .map((item) => item.level)
        .filter(Boolean),
        getEnglishPathway(selectedPathway).levels
      ),
    [englishAccessOptions, selectedPathway]
  );

  const englishPathwayConfig = getEnglishPathway(selectedPathway);
  const nonEnglishPathwayConfig =
    selectedTargetLanguage === "Japanese"
      ? NON_ENGLISH_LANGUAGE_PATHWAYS.Japanese
      : selectedTargetLanguage === "Chinese"
        ? NON_ENGLISH_LANGUAGE_PATHWAYS.Chinese
        : null;
  const practiceSkillOptions =
    selectedTargetLanguage === "English" && selectedPathway !== "Legacy Grade"
      ? ["Mix", ...englishPathwayConfig.skills]
      : SKILLS_BY_LANGUAGE[selectedTargetLanguage] || SKILLS_BY_LANGUAGE.English;
  const practiceVariantOptions =
    selectedTargetLanguage === "English" && selectedPathway !== "Legacy Grade"
      ? englishPathwayConfig.variants || []
      : [];
  const selectedLevelOptions =
    selectedTargetLanguage === "English" && selectedPathway !== "Legacy Grade"
      ? availableEnglishLevels
      : sortByOrder(
          selectedLanguageAccessOptions
            .filter((item) => item.pathway === selectedPathway)
            .map((item) => item.level)
            .filter(Boolean),
          nonEnglishPathwayConfig?.levels || []
        );

  useEffect(() => {
    setStartBlockedReason("");
    setPracticeNotice("");
  }, [
    selectedTargetLanguage,
    selectedPathway,
    selectedGrade,
    selectedPathwayVariant,
    selectedSkill,
  ]);

  useEffect(() => {
    if (selectedTargetLanguage !== "English") {
      const firstPathway = availablePathways[0] || "";
      const currentPathway = availablePathways.includes(selectedPathway) ? selectedPathway : firstPathway;
      const levels = selectedLanguageAccessOptions
        .filter((item) => item.pathway === currentPathway)
        .map((item) => item.level)
        .filter(Boolean);

      if (currentPathway !== selectedPathway) {
        setSelectedPathway(currentPathway);
      }

      if (levels.length > 0 && !levels.includes(selectedGrade)) {
        setSelectedGrade(levels[0]);
      }

      setSelectedPathwayVariant("All");
      return;
    }

    if (availableEnglishPathways.length === 0) {
      setSelectedPathway("");
      setSelectedGrade("");
      return;
    }

    if (!availableEnglishPathways.includes(selectedPathway)) {
      setSelectedPathway(availableEnglishPathways[0]);
      return;
    }

    if (availableEnglishLevels.length > 0 && !availableEnglishLevels.includes(selectedGrade)) {
      setSelectedGrade(availableEnglishLevels[0]);
    }

    if (
      practiceVariantOptions.length > 0 &&
      selectedPathwayVariant !== "All" &&
      !practiceVariantOptions.includes(selectedPathwayVariant)
    ) {
      setSelectedPathwayVariant("All");
    }
  }, [
    availableEnglishLevels,
    availableEnglishPathways,
    availablePathways,
    selectedGrade,
    selectedLanguageAccessOptions,
    selectedPathway,
    selectedPathwayVariant,
    selectedTargetLanguage,
    practiceVariantOptions,
  ]);

  const questionDisplayLanguage = selectedTargetLanguage;

  const getCorrectAnswerText = (q: any, language = questionDisplayLanguage) => {
    if (!q) return "";

    if (q.correct_answer === "option_a") return localizedField(q, "option_a", language);
    if (q.correct_answer === "option_b") return localizedField(q, "option_b", language);
    if (q.correct_answer === "option_c") return localizedField(q, "option_c", language);
    if (q.correct_answer === "option_d") return localizedField(q, "option_d", language);

    return q.correct_answer;
  };

  const current = questions[currentIndex];
  const isReadingGroup = current?.type === "reading_group";
  const currentQuestionList = isReadingGroup ? current.questions || [] : current ? [current] : [];

  useEffect(() => {
    setPassageExpanded(false);
  }, [currentIndex, current?.id]);

  const currentQuestionText =
    localizedField(current, "question", questionDisplayLanguage) || current?.question_text || "";

  const textSizeClasses = PASSAGE_TEXT_CLASSES[passageTextSize];
  const showTextSizeControl =
    Boolean(current?.passage) || currentQuestionText.length > 160 || isReadingGroup;
  const showPassageToggle =
    Boolean(current?.passage) &&
    (String(current.passage).length > 700 ||
      String(current.passage).trim().split(/\s+/).filter(Boolean).length > 120);

  const correctText = useMemo(
    () => getCorrectAnswerText(current, questionDisplayLanguage),
    [current, questionDisplayLanguage]
  );

  const getExplanationText = (question: any) => {
    if (!question) return "";

    const suffix = languageSuffix(selectedExplanationLanguage);

    return (
      question[`explanation_${suffix}`] ||
      question.explanation_en ||
      question.explanation ||
      ""
    );
  };

  const isCurrentQuestionCorrect = (question: any) => {
    const chosen = isReadingGroup ? selectedGroupAnswers[question.id] : selected;
    return chosen === getCorrectAnswerText(question, questionDisplayLanguage);
  };

  const isCorrect =
    currentQuestionList.length > 0 &&
    currentQuestionList.every((question: any) => isCurrentQuestionCorrect(question));

  const accuracy =
    attemptedCount === 0
      ? 0
      : Math.round((correctCount / attemptedCount) * 100);

  const sessionProgress =
    questions.length === 0
      ? 0
      : Math.round(((currentIndex + 1) / questions.length) * 100);

  const logPracticeQueryDebug = (payload: Record<string, unknown>) => {
    if (!import.meta.env.DEV) return;
    console.info("[Practice query]", payload);
  };

  const fetchMatchingQuestionsForSetup = async () => {
    let query = supabase
      .from("questions")
      .select("*")
      .eq("status", "approved")
      .limit(200);

    query =
      selectedTargetLanguage === "English"
        ? query.or("target_language.eq.English,target_language.is.null")
        : query.eq("target_language", selectedTargetLanguage);

    if (selectedPathway && selectedPathway !== "Legacy Grade") {
      query = query.eq("pathway", selectedPathway).eq("level", selectedGrade);

      if (
        selectedTargetLanguage === "English" &&
        selectedPathwayVariant !== "All" &&
        practiceVariantOptions.length > 0
      ) {
        query = query.eq("pathway_variant", selectedPathwayVariant);
      }
    } else {
      query = query.eq("grade", selectedGrade);
    }

    if (selectedSkill !== "Mix") {
      query = query.eq("skill", selectedSkill);
    }

    let { data, error } = await query;

    if (
      selectedTargetLanguage === "English" &&
      selectedPathway !== "Legacy Grade" &&
      (error || !data || data.length === 0)
    ) {
      let fallbackQuery = supabase
        .from("questions")
        .select("*")
        .or("target_language.eq.English,target_language.is.null")
        .eq("status", "approved")
        .eq("exam_type", selectedPathway)
        .eq("grade", selectedGrade)
        .limit(200);

      if (selectedSkill !== "Mix") {
        fallbackQuery = fallbackQuery.eq("skill", selectedSkill);
      }

      const fallback = await fallbackQuery;
      data = fallback.data;
      error = fallback.error;
    }

    const matchingRows = data || [];

    logPracticeQueryDebug({
      selectedTargetLanguage,
      selectedPathway,
      selectedLevel: selectedGrade,
      selectedSkill,
      selectedPathwayVariant,
      matchingRowCount: matchingRows.length,
      finalAvailableQuestionCount: matchingRows.length,
      mixSkillBypassesSkillFilter: selectedSkill === "Mix",
    });

    return { data: matchingRows, error };
  };

  const fetchCompletedCorrectIds = async (userId: string, questionIds: string[]) => {
    if (questionIds.length === 0) return new Set<string>();

    const { data, error } = await supabase
      .from("attempts")
      .select("question_id")
      .eq("user_id", userId)
      .eq("is_correct", true)
      .in("question_id", questionIds);

    if (error) throw error;

    return new Set((data || []).map((attempt) => attempt.question_id));
  };

  const startPractice = async () => {
    setPracticeNotice("");

    if (!selectedGrade || (selectedTargetLanguage === "English" && !selectedPathway)) {
      setPracticeNotice("Please select an assigned pathway before starting practice.");
      return;
    }

    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await fetchMatchingQuestionsForSetup();

    if (error) {
      console.error(error);
      setPracticeNotice("Failed to load questions. Please try again.");
      setLoading(false);
      return;
    }

    const questionIds = (data || []).map((question) => question.id).filter(Boolean);
    let completedCorrectIds = new Set<string>();

    try {
      completedCorrectIds = await fetchCompletedCorrectIds(user.id, questionIds);
    } catch (attemptError) {
      console.error(attemptError);
      setPracticeNotice("Failed to load your practice progress. Please try again.");
      setLoading(false);
      return;
    }

    const availableQuestions = (data || []).filter(
      (q) => !completedCorrectIds.has(q.id)
    );

    logPracticeQueryDebug({
      selectedTargetLanguage,
      selectedPathway,
      selectedLevel: selectedGrade,
      selectedSkill,
      matchingQuestionCount: (data || []).length,
      completedCorrectCount: completedCorrectIds.size,
      finalAvailableQuestionCount: availableQuestions.length,
    });

    const practiceItems = buildPracticeItems(availableQuestions);
    const randomQuestions = shuffleArray(practiceItems).slice(0, 20);

    if (randomQuestions.length === 0) {
      const reason =
        "No practice questions available yet. Try another pathway, level, or skill — or ask your tutor/admin to assign more practice.";

      setPracticeNotice(
        reason
      );
      setStartBlockedReason(reason);
      setQuestions([]);
      setStarted(false);
      setLoading(false);
      return;
    }

    setQuestions(randomQuestions);
    setCurrentIndex(0);
    setSelected("");
    setSelectedGroupAnswers({});
    setShowFeedback(false);
    setPracticeNotice("");
    setStartBlockedReason("");
    setStarted(true);
    setLoading(false);
  };

  const resetProgress = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) return;

    setLoading(true);

    const { data: matchingQuestions, error: questionsError } =
      await fetchMatchingQuestionsForSetup();

    if (questionsError) {
      console.error(questionsError);
      setPracticeNotice("We could not find this practice setup. Please try again.");
      setLoading(false);
      return;
    }

    const questionIds = (matchingQuestions || [])
      .map((question) => question.id)
      .filter(Boolean);

    if (questionIds.length === 0) {
      setPracticeNotice("No approved questions match this practice setup yet.");
      setStartBlockedReason("No approved questions match this practice setup yet.");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("attempts")
      .delete()
      .eq("user_id", user.id)
      .in("question_id", questionIds);

    if (error) {
      console.error(error);
      setPracticeNotice("We could not reset your practice progress. Please try again.");
      setLoading(false);
      return;
    }

    let remainingCompletedCorrectIds = new Set<string>();

    try {
      remainingCompletedCorrectIds = await fetchCompletedCorrectIds(user.id, questionIds);
    } catch (attemptError) {
      console.error(attemptError);
    }

    setQuestions([]);
    setStarted(false);
    setCurrentIndex(0);
    setSelected("");
    setSelectedGroupAnswers({});
    setShowFeedback(false);
    await fetchStats(user.id);

    const availableAfterReset = matchingQuestions.filter(
      (question) => !remainingCompletedCorrectIds.has(question.id)
    );

    if (availableAfterReset.length > 0) {
      setPracticeNotice("Practice progress has been reset. Correct questions may appear again.");
      setStartBlockedReason("");
    } else {
      const reason =
        "No practice questions are available after reset. Please try another setup or ask your tutor/admin to assign more practice.";
      setPracticeNotice(reason);
      setStartBlockedReason(reason);
    }

    setLoading(false);
  };

  const handleSubmit = () => {
    const allAnswered = isReadingGroup
      ? currentQuestionList.every((question: any) => selectedGroupAnswers[question.id])
      : Boolean(selected);

    if (!allAnswered) {
      setQuestionNotice(
        isReadingGroup
          ? "Please answer every question for this passage before submitting."
          : "Please choose an answer before submitting."
      );
      return;
    }

    setQuestionNotice("");
    setShowFeedback(true);
  };

  const handleNext = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user || !current) return;

    const attemptsPayload = currentQuestionList.map((question: any) => ({
      user_id: user.id,
      question_id: question.id,
      selected_answer: isReadingGroup ? selectedGroupAnswers[question.id] : selected,
      is_correct: isCurrentQuestionCorrect(question),
    }));

    await supabase.from("attempts").insert(attemptsPayload);

    await fetchStats(user.id);

    setSelected("");
    setSelectedGroupAnswers({});
    setShowFeedback(false);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setPracticeNotice("Practice completed. Nice work.");
      setStarted(false);
      setQuestions([]);
      setCurrentIndex(0);
    }
  };

  if (loading) {
    return (
      <Shell>
        <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-6 text-center shadow-[0_25px_80px_rgba(66,56,120,0.12)] sm:rounded-[2.5rem] sm:p-10">
          <div className="mx-auto mb-5 h-14 w-14 animate-spin rounded-full border-4 border-[#eee9ff] border-t-[#8d73ff]" />
          <p className="font-poppins text-xl font-black text-primary">
            Loading practice...
          </p>
        </div>
      </Shell>
    );
  }

  if (allowedGrades.length === 0) {
    return (
      <Shell>
        <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-6 text-center shadow-[0_25px_80px_rgba(66,56,120,0.12)] sm:rounded-[2.5rem] sm:p-10">
          <h1 className="font-poppins text-3xl font-black text-primary">
            No Practice Access Yet
          </h1>

          <p className="mt-3 text-primary/60">
            Your account does not have any assigned language pathway access yet. Please contact admin.
          </p>
        </div>
      </Shell>
    );
  }

  if (!started) {
    return (
      <Shell>
        <div className="mx-auto max-w-[1180px] space-y-8">
          {/* HERO */}
          <section className="relative overflow-hidden rounded-[2rem] border border-[#eee8ff] bg-white p-5 shadow-[0_35px_120px_rgba(66,56,120,0.10)] sm:rounded-[3rem] sm:p-10">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#f0eaff]" />
            <div className="absolute bottom-[-80px] left-[-80px] h-56 w-56 rounded-full bg-[#fff1bd]/70" />

            <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-end">
              <div>
                <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]">
                  <Sparkles className="h-5 w-5" />
                  Practice Studio
                </p>

                <h1 className="mt-5 font-poppins text-[2.35rem] font-black leading-[1.04] tracking-[-0.025em] text-primary min-[390px]:text-[2.7rem] sm:text-[4.8rem] sm:leading-[0.95] lg:text-[5.5rem]">
                  Choose.
                  <br />
                  Practise.
                  <br />
                  Improve.
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-8 text-primary/60 sm:text-lg">
                  Select your learning language, assigned pathway, and skill focus.
                  Luna will show questions in the language you are learning.
                </p>
              </div>

              <motion.div
                whileHover={{ y: -8, rotate: 1.5 }}
                className="relative rounded-[1.6rem] bg-[#fbfaff] p-5 shadow-[0_18px_55px_rgba(66,56,120,0.09)] sm:rounded-[2.2rem] sm:p-6"
              >
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8d73ff]">
                  Your Progress
                </p>

                <div className="mt-5 space-y-4">
                  <MiniMetric label="Attempted" value={attemptedCount} />
                  <MiniMetric label="Correct" value={correctCount} />
                  <MiniMetric label="Accuracy" value={`${accuracy}%`} />
                </div>
              </motion.div>
            </div>
          </section>

          {/* STATS */}
          <div data-guide="practice-setup" className="grid gap-4 md:grid-cols-3">
            <StatCard
              index={0}
              icon={<BookOpen className="h-6 w-6" />}
              title="Attempted"
              value={attemptedCount}
            />

            <StatCard
              index={1}
              icon={<CheckCircle2 className="h-6 w-6" />}
              title="Correct"
              value={correctCount}
            />

            <StatCard
              index={2}
              icon={<BarChart3 className="h-6 w-6" />}
              title="Accuracy"
              value={`${accuracy}%`}
            />
          </div>

          {/* SETUP CARD */}
          <section
            data-guide="practice-actions"
            className="rounded-[2rem] bg-white p-5 shadow-[0_25px_80px_rgba(66,56,120,0.10)] sm:rounded-[2.5rem] sm:p-9"
          >
            <div className="mb-8">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#8d73ff]">
                Setup
              </p>

              <h2 className="mt-3 font-poppins text-3xl font-black text-primary">
                Build your practice set.
              </h2>

              <p className="mt-3 text-sm leading-7 text-primary/55">
                Mix different skills or focus on one weak area for targeted improvement.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
              <SelectInput
                label="Learn"
                value={selectedTargetLanguage}
                onChange={(value) => {
                  setSelectedTargetLanguage(value);

                  const nextAccessOptions = accessOptions.filter(
                    (item) => item.targetLanguage === value && item.pathway !== "Legacy Grade"
                  );
                  const nextPathway =
                    value === "English"
                      ? availableEnglishPathways[0] || ""
                      : nextAccessOptions[0]?.pathway || "";
                  const nextLevel =
                    value === "English"
                      ? englishAccessOptions.find((item) => item.pathway === nextPathway)?.level || ""
                      : nextAccessOptions.find((item) => item.pathway === nextPathway)?.level || "";

                  if (nextPathway) {
                    setSelectedPathway(nextPathway);
                    setSelectedGrade(nextLevel);
                    setSelectedPathwayVariant("All");
                  }
                }}
                options={availableTargetLanguages}
              />

              {selectedPathway && selectedPathway !== "Legacy Grade" && (
                <SelectInput
                  label="Pathway"
                  value={selectedPathway}
                  onChange={(value) => {
                    const nextLevel =
                      selectedLanguageAccessOptions.find((item) => item.pathway === value)?.level ||
                      selectedGrade;

                    setSelectedPathway(value);
                    setSelectedGrade(nextLevel);
                    setSelectedPathwayVariant("All");
                  }}
                  options={availablePathways}
                />
              )}

              <SelectInput
                label={
                  selectedTargetLanguage === "English" && selectedPathway !== "Legacy Grade"
                    ? englishPathwayConfig.levelLabel
                    : nonEnglishPathwayConfig?.levelLabel || "Level"
                }
                value={selectedGrade}
                onChange={setSelectedGrade}
                options={selectedLevelOptions}
              />

              {practiceVariantOptions.length > 0 && (
                <SelectInput
                  label={englishPathwayConfig.variantLabel || "Variant"}
                  value={selectedPathwayVariant}
                  onChange={setSelectedPathwayVariant}
                  options={["All", ...practiceVariantOptions]}
                />
              )}

              <SelectInput
                label={
                  selectedTargetLanguage === "English" && selectedPathway !== "Legacy Grade"
                    ? englishPathwayConfig.skillLabel
                    : nonEnglishPathwayConfig?.skillLabel || "Question Type"
                }
                value={selectedSkill}
                onChange={setSelectedSkill}
                options={practiceSkillOptions}
              />
            </div>

            {practiceNotice && (
              <div className="mt-6 rounded-2xl border border-[#eee8ff] bg-[#fbfaff] px-4 py-3 text-sm font-semibold leading-6 text-primary/65">
                {practiceNotice}
              </div>
            )}

            <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto]">
              <Button
                type="button"
                className="group h-14 w-full rounded-2xl bg-primary text-base font-black shadow-[0_18px_45px_rgba(10,36,84,0.20)]"
                onClick={startPractice}
                disabled={Boolean(startBlockedReason)}
              >
                Start Practice
                <ArrowRight className="ml-2 h-5 w-5 transition group-hover:translate-x-1" />
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-14 w-full rounded-2xl border-primary/10 bg-white px-7 font-black text-primary transition hover:-translate-y-1 hover:bg-[#f6f1ff]"
                  >
                    <RotateCcw className="mr-2 h-5 w-5" />
                    Reset Progress
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent className="mx-4 max-w-md rounded-[2rem] border-white/80 bg-white p-6 shadow-[0_30px_90px_rgba(10,36,84,0.25)]">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-poppins text-2xl font-black text-primary">
                      Reset practice progress?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-sm leading-7 text-primary/60">
                      This will clear your saved answers for this practice setup. Correct questions may appear again.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter className="gap-2 sm:gap-3 sm:space-x-0">
                    <AlertDialogCancel className="h-12 rounded-2xl">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="h-12 rounded-2xl bg-primary px-6 font-black text-primary-foreground"
                      onClick={resetProgress}
                    >
                      Reset Progress
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </section>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mx-auto max-w-[900px] space-y-6">
        {/* COMPACT PROGRESS */}
        <section className="rounded-[1.6rem] border border-[#eee8ff] bg-white/92 px-4 py-3 shadow-[0_14px_45px_rgba(66,56,120,0.08)] sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-primary">
                {[
                  selectedTargetLanguage === "English" && selectedPathway !== "Legacy Grade"
                    ? selectedPathway
                    : selectedTargetLanguage,
                  selectedGrade,
                  current?.pathway_variant,
                  selectedSkill,
                  current?.category,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <p className="mt-1 text-xs font-bold text-primary/45">
                {isReadingGroup ? "Reading set" : "Question"} {currentIndex + 1} / {questions.length}
              </p>
            </div>

            <div className="w-full sm:w-[220px]">
              <div className="mb-1 flex justify-between text-[11px] font-black uppercase tracking-[0.14em] text-primary/40">
                <span>Progress</span>
                <span>{sessionProgress}%</span>
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-[#eee9ff]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(sessionProgress, 8)}%` }}
                  transition={{ duration: 0.6 }}
                  className="h-full rounded-full bg-[#8d73ff]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* QUESTION CARD */}
        <AnimatePresence mode="wait">
          <motion.section
            key={current?.id || currentIndex}
            initial={{ opacity: 0, y: 30, rotate: -0.8 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, y: -20, rotate: 0.8 }}
            transition={{ duration: 0.35 }}
            className="relative overflow-hidden rounded-[2rem] bg-white p-5 shadow-[0_30px_90px_rgba(66,56,120,0.13)] sm:rounded-[2.8rem] sm:p-8"
          >
	            <div className="absolute -right-14 -top-14 h-44 w-44 rounded-full bg-[#f0eaff]" />

	            <div className="relative z-10">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[1.35rem] border border-[#eee8ff] bg-[#fbfaff] px-4 py-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-primary/45">
                    {showTextSizeControl ? "Reading size" : "Practice"}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-primary/50">
                    Questions display in {questionDisplayLanguage}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2">
                  {showTextSizeControl && (
                    <div className="flex rounded-full bg-white p-1 shadow-[0_10px_28px_rgba(66,56,120,0.08)]">
                      {(["Small", "Normal", "Large"] as PassageTextSize[]).map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setPassageTextSize(size)}
                          className={`min-h-10 rounded-full px-4 text-sm font-black transition ${
                            passageTextSize === size
                              ? "bg-primary text-white shadow-[0_10px_24px_rgba(10,36,84,0.18)]"
                              : "text-primary/55 hover:bg-[#f6f1ff] hover:text-primary"
                          }`}
                        >
                          {size === "Small" ? "A-" : size === "Normal" ? "A" : "A+"}
                        </button>
                      ))}
                    </div>
                  )}

                  {!showFeedback && (
                    <Button
                      type="button"
                      className="h-11 rounded-2xl bg-primary px-5 text-sm font-black shadow-[0_12px_30px_rgba(10,36,84,0.16)]"
                      onClick={handleSubmit}
                    >
                      Submit
                    </Button>
                  )}
                </div>
              </div>

	              {current?.passage && (
                <div className="mb-7 rounded-[1.5rem] bg-[#fbfaff] p-4 sm:rounded-[2rem] sm:p-5">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-[#8d73ff]">
                      Passage
                    </p>

                    {showPassageToggle && (
                      <button
                        type="button"
                        onClick={() => setPassageExpanded((currentValue) => !currentValue)}
                        className="rounded-full bg-white px-4 py-2 text-xs font-black text-primary/65 shadow-[0_10px_24px_rgba(66,56,120,0.08)] transition hover:text-primary"
                      >
                        {passageExpanded ? "Collapse passage" : "Expand passage"}
                      </button>
                    )}
                  </div>

                  <div className={passageExpanded ? "" : "max-h-[34vh] overflow-y-auto pr-1"}>
                    <p className={`whitespace-pre-line text-primary/70 ${textSizeClasses.passage}`}>
                      {current.passage}
                    </p>
                  </div>
                </div>
	              )}

              <div className="mb-5 flex flex-wrap gap-2 text-xs">
                {[
                  current.target_language || selectedTargetLanguage,
                  current.exam_type,
                  current.grade,
                  current.skill,
                  current.difficulty,
                ].map(
                  (tag) =>
                    tag && (
                      <span
                        key={tag}
                        className="rounded-full bg-[#f6f1ff] px-3 py-1 font-bold text-[#8d73ff]"
                      >
                        {tag}
                      </span>
                    )
                )}
              </div>

	              <div className="space-y-6">
	                {currentQuestionList.map((question: any, questionIndex: number) => {
	                  const questionText =
	                    localizedField(question, "question", questionDisplayLanguage) ||
	                    question.question_text;
	                  const chosenAnswer = isReadingGroup
	                    ? selectedGroupAnswers[question.id]
	                    : selected;
	                  const correctAnswerText = getCorrectAnswerText(question, questionDisplayLanguage);

	                  return (
	                    <div
	                      key={question.id || questionIndex}
	                      className={isReadingGroup ? "rounded-[1.5rem] border border-[#eee8ff] bg-white/75 p-4 sm:p-5" : ""}
	                    >
	                      {isReadingGroup && (
	                        <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[#8d73ff]">
	                          Question {questionIndex + 1} of {currentQuestionList.length}
	                        </p>
	                      )}

	                      <p className={`mb-5 font-black text-primary ${textSizeClasses.question}`}>
	                        {questionText}
	                      </p>

	                      <div className="space-y-3">
	                        {[
	                          localizedField(question, "option_a", questionDisplayLanguage),
	                          localizedField(question, "option_b", questionDisplayLanguage),
	                          localizedField(question, "option_c", questionDisplayLanguage),
	                          localizedField(question, "option_d", questionDisplayLanguage),
	                        ].map((opt, i) => {
	                          const isSelected = chosenAnswer === opt;
	                          const isCorrectOption = opt === correctAnswerText;

	                          let buttonClass =
	                            "group w-full rounded-2xl border border-primary/10 bg-[#fbfaff] px-5 py-4 text-left text-sm font-semibold leading-7 text-primary transition hover:-translate-y-1 hover:border-[#8d73ff]/40 hover:bg-[#f6f1ff] sm:text-base";

	                          if (!showFeedback && isSelected) {
	                            buttonClass =
	                              "group w-full rounded-2xl border border-[#8d73ff] bg-[#f6f1ff] px-5 py-4 text-left text-sm font-black leading-7 text-primary shadow-[0_12px_30px_rgba(141,115,255,0.15)] transition sm:text-base";
	                          }

	                          if (showFeedback && isSelected && isCorrectOption) {
	                            buttonClass =
	                              "group w-full rounded-2xl border border-green-300 bg-green-50 px-5 py-4 text-left text-sm font-black leading-7 text-green-800 transition sm:text-base";
	                          }

	                          if (showFeedback && isSelected && !isCorrectOption) {
	                            buttonClass =
	                              "group w-full rounded-2xl border border-red-300 bg-red-50 px-5 py-4 text-left text-sm font-black leading-7 text-red-800 transition sm:text-base";
	                          }

	                          if (
	                            showFeedback &&
	                            canViewAnswers &&
	                            isCorrectOption &&
	                            !isSelected
	                          ) {
	                            buttonClass =
	                              "group w-full rounded-2xl border border-green-300 bg-green-50 px-5 py-4 text-left text-sm font-black leading-7 text-green-800 transition sm:text-base";
	                          }

	                          return (
	                            <motion.button
	                              type="button"
	                              key={i}
	                              whileTap={{ scale: 0.99 }}
	                              onClick={() => {
	                                if (showFeedback) return;

	                                if (isReadingGroup) {
	                                  setSelectedGroupAnswers((currentAnswers) => ({
	                                    ...currentAnswers,
	                                    [question.id]: opt,
	                                  }));
	                                } else {
	                                  setSelected(opt);
	                                }

	                                setQuestionNotice("");
	                              }}
	                              className={buttonClass}
	                            >
	                              <span className="mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white font-black text-[#8d73ff]">
	                                {String.fromCharCode(65 + i)}
	                              </span>
	                              {opt}
	                            </motion.button>
	                          );
	                        })}
	                      </div>
	                    </div>
	                  );
	                })}
	              </div>
	            </div>
          </motion.section>
        </AnimatePresence>

        {questionNotice && (
          <div className="rounded-2xl border border-[#eee8ff] bg-white px-5 py-4 text-sm font-bold leading-6 text-primary/65 shadow-[0_12px_35px_rgba(66,56,120,0.07)]">
            {questionNotice}
          </div>
        )}

        {/* FEEDBACK */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12 }}
              className={`rounded-[2rem] p-5 shadow-[0_18px_55px_rgba(66,56,120,0.08)] ${
                isCorrect
                  ? "border border-green-200 bg-green-50 text-green-800"
                  : "border border-red-200 bg-red-50 text-red-800"
              }`}
            >
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <CheckCircle2 className="mt-1 h-6 w-6 shrink-0" />
                ) : (
                  <XCircle className="mt-1 h-6 w-6 shrink-0" />
                )}

	                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <p className="font-poppins text-xl font-black">
                      {isCorrect ? "Correct!" : isReadingGroup ? "Review your answers" : "Incorrect"}
                    </p>

                    {canViewAnswers && (
                      <div className="flex shrink-0 rounded-full bg-white/70 p-1 shadow-[0_10px_24px_rgba(66,56,120,0.08)]">
                        {EXPLANATION_LANGUAGES.map((language) => (
                          <button
                            key={language}
                            type="button"
                            onClick={() => setSelectedExplanationLanguage(language)}
                            className={`min-h-9 rounded-full px-3 text-xs font-black transition ${
                              selectedExplanationLanguage === language
                                ? "bg-primary text-white"
                                : "text-primary/60 hover:bg-white hover:text-primary"
                            }`}
                          >
                            {EXPLANATION_LANGUAGE_LABELS[language]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

	                  {canViewAnswers && isReadingGroup ? (
	                    <div className="mt-3 space-y-3">
	                      {currentQuestionList.map((question: any, index: number) => {
	                        const explanation = getExplanationText(question);
	                        const answerText = getCorrectAnswerText(question, questionDisplayLanguage);
	                        const questionCorrect = isCurrentQuestionCorrect(question);

	                        return (
	                          <div
	                            key={question.id || index}
	                            className="rounded-2xl bg-white/70 px-4 py-3 text-sm leading-6"
	                          >
	                            <p className="font-black">
	                              Q{index + 1}: {questionCorrect ? "Correct" : "Correct answer"}{" "}
	                              {!questionCorrect && <strong>{answerText}</strong>}
	                            </p>
	                            {explanation && (
	                              <p className="mt-1 opacity-85">{explanation}</p>
	                            )}
	                          </div>
	                        );
	                      })}
	                    </div>
	                  ) : (
	                    <>
	                      {!isCorrect && canViewAnswers && (
	                        <p className="mt-2 text-sm leading-6">
	                          Correct answer: <strong>{correctText}</strong>
	                        </p>
	                      )}

	                      {canViewAnswers &&
	                        getExplanationText(current) && (
	                        <p className="mt-3 text-sm leading-6">
	                          {getExplanationText(current)}
	                        </p>
	                      )}
	                    </>
	                  )}
	                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ACTION */}
        {showFeedback ? (
          <Button
            type="button"
            className="group h-14 w-full rounded-2xl bg-[#8d73ff] text-base font-black shadow-[0_18px_45px_rgba(141,115,255,0.35)]"
            onClick={handleNext}
          >
            Next
            <ArrowRight className="ml-2 h-5 w-5 transition group-hover:translate-x-1" />
          </Button>
        ) : (
          <Button
            type="button"
            className="h-14 w-full rounded-2xl bg-primary text-base font-black shadow-[0_18px_45px_rgba(10,36,84,0.20)]"
            onClick={handleSubmit}
          >
            Submit
          </Button>
        )}
      </div>
    </Shell>
  );
};

const Shell = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen overflow-hidden bg-[#fbfaff] px-4 py-6 sm:px-6 sm:py-14">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_15%,#f0eaff_0%,transparent_28%),radial-gradient(circle_at_85%_75%,#fff1bd_0%,transparent_30%)]" />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

const MiniMetric = ({ label, value }: { label: string; value: any }) => {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white p-4">
      <span className="text-sm font-bold text-primary/55">{label}</span>
      <span className="font-poppins text-xl font-black text-primary">
        {value}
      </span>
    </div>
  );
};

const StatCard = ({
  icon,
  title,
  value,
  index,
}: {
  icon: React.ReactNode;
  title: string;
  value: any;
  index: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -8, rotate: index % 2 === 0 ? -1.5 : 1.5 }}
      className="rounded-[2.2rem] bg-white p-6 shadow-[0_18px_55px_rgba(66,56,120,0.08)]"
    >
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f6f1ff] text-[#8d73ff]">
        {icon}
      </div>

      <p className="mb-1 text-sm font-bold text-primary/50">{title}</p>

      <h3 className="font-poppins text-4xl font-black text-primary">
        {value}
      </h3>
    </motion.div>
  );
};

const SelectInput = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) => {
  const safeOptions = options.filter(Boolean);

  return (
    <div>
      <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-primary/45">
        {label}
      </label>

      <Select
        value={value}
        onValueChange={onChange}
        disabled={safeOptions.length === 0}
      >
        <SelectTrigger className="h-14 rounded-2xl border-primary/10 bg-[#fbfaff] px-5 text-base font-bold text-primary shadow-none transition focus:ring-4 focus:ring-[#8d73ff]/10">
          <SelectValue placeholder={`Select ${label}`} />
        </SelectTrigger>

        <SelectContent className="z-[10000] rounded-2xl border-primary/10 bg-white p-2 shadow-[0_22px_70px_rgba(66,56,120,0.16)]">
          {safeOptions.map((item) => (
            <SelectItem
              key={item}
              value={item}
              className="rounded-xl py-3 pl-9 pr-3 text-sm font-semibold text-primary focus:bg-[#f6f1ff] focus:text-primary"
            >
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default Practice;
