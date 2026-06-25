import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Blocks,
  Brain,
  Car,
  CheckCircle2,
  Flame,
  Gem,
  Headphones,
  ImageIcon,
  Maximize2,
  Minimize2,
  Moon,
  Search,
  Sparkles,
  Star,
  Sun,
  Timer,
  Trophy,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ArcadeLoadingScreen from "@/components/games/ArcadeLoadingScreen";
import {
  clearGameSession,
  loadGameSession,
  saveGameSession,
} from "@/lib/arcadeResume";
import { supabase } from "@/lib/supabase";
import {
  GameVocabularyItem,
  loadGameVocabularyItems,
} from "@/lib/gameVocabulary";

type Pair = {
  left?: string;
  right?: string;
  vocab_word?: string;
  image_keyword?: string;
  image_url?: string;
};

type DifficultyKey = "Easy" | "Medium" | "Hard" | "Advanced";
type GameMode = "practice" | "test";

type DifficultyConfig = {
  key: DifficultyKey;
  seconds: number;
  practiceTarget: number;
  testTarget: number;
};

type VocabItem = {
  id: string;
  word: string;
  imageUrl: string;
  imageKeyword?: string;
};

type BankLetter = {
  id: string;
  letter: string;
};

type GameResult = {
  passed: boolean;
  testCorrect: number;
  testTarget: number;
  nextDifficulty: DifficultyKey | null;
};

type SavedLetterMatchSession = {
  grade: string;
  difficulty: DifficultyKey;
  unlockedDifficulty: DifficultyKey;
  mode: GameMode;
  score: number;
  progress: number;
  secondsLeft: number;
  currentItem: VocabItem | null;
  revealedPositions: number[];
  letterBank: BankLetter[];
  placedLetters: Record<number, BankLetter>;
  testCorrect: number;
  missedThisQuestion: boolean;
  recentWords: string[];
  lastWord: string;
  practiceItems?: VocabItem[];
  testItems?: VocabItem[];
};

type AnswerFeedback = {
  correct: boolean;
  word: string;
};

type GameDemoProps = {
  demoMode?: boolean;
  fixedGrade?: string;
  fixedDifficulty?: DifficultyKey;
  maxDemoPairs?: number;
  demoFullscreenActive?: boolean;
  hideStudentIdentity?: boolean;
  disableProgressSaving?: boolean;
  disableUnlocking?: boolean;
  disableResume?: boolean;
  onDemoComplete?: () => void;
  onDemoFullscreenChange?: (active: boolean) => void;
  onRequestSwitchGame?: (game: "memory" | "word" | "letter") => void;
};

const LETTER_MATCH_GAME_KEY = "letter_match";
const grades = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"];
const difficultyOrder: DifficultyKey[] = ["Easy", "Medium", "Hard", "Advanced"];
const difficulties: DifficultyConfig[] = [
  { key: "Easy", seconds: 180, practiceTarget: 10, testTarget: 5 },
  { key: "Medium", seconds: 150, practiceTarget: 15, testTarget: 7 },
  { key: "Hard", seconds: 120, practiceTarget: 20, testTarget: 10 },
  { key: "Advanced", seconds: 90, practiceTarget: 25, testTarget: 12 },
];
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

const cleanEnglishWord = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z]/g, "")
    .toUpperCase();

const getEnglishWordFromPair = (pair: Pair) =>
  [pair.right, pair.vocab_word, pair.left]
    .map((value) => cleanEnglishWord(String(value || "")))
    .find((word) => word.length >= 3 && word.length <= 10) || "";

const buildLetterMatchItemsFromVocabulary = (items: GameVocabularyItem[]) =>
  items
    .map((item): VocabItem | null => {
      const word = cleanEnglishWord(String(item.en || ""));
      const imageUrl = String(item.image_url || "").trim();
      const imageKeyword = String(item.image_keyword || item.en || "").trim();

      if (word.length < 3 || word.length > 10 || !imageUrl) return null;

      return {
        id: `shared-${item.id}`,
        word,
        imageUrl,
        imageKeyword,
      };
    })
    .filter(Boolean) as VocabItem[];

const getDifficultyConfig = (difficulty: DifficultyKey) =>
  difficulties.find((item) => item.key === difficulty) || difficulties[0];

const getNextDifficulty = (difficulty: DifficultyKey): DifficultyKey | null => {
  if (difficulty === "Easy") return "Medium";
  if (difficulty === "Medium") return "Hard";
  if (difficulty === "Hard") return "Advanced";
  return null;
};

const isDifficultyUnlocked = (
  difficulty: DifficultyKey,
  unlockedDifficulty: DifficultyKey
) =>
  difficultyOrder.indexOf(difficulty) <=
  difficultyOrder.indexOf(unlockedDifficulty);

const getHighestDifficulty = (
  first?: DifficultyKey | null,
  second?: DifficultyKey | null
) => {
  const firstDifficulty = first || "Easy";
  const secondDifficulty = second || "Easy";

  return difficultyOrder.indexOf(firstDifficulty) >=
    difficultyOrder.indexOf(secondDifficulty)
    ? firstDifficulty
    : secondDifficulty;
};

const randomLetter = () => alphabet[Math.floor(Math.random() * alphabet.length)];

const getRevealPositions = (
  word: string,
  difficulty: DifficultyKey,
  mode: GameMode
) => {
  const indexes = Array.from({ length: word.length }, (_, index) => index);

  if (mode === "test") {
    return new Set<number>();
  }

  if (difficulty === "Easy") {
    const revealCount = Math.min(word.length - 1, Math.max(1, Math.floor(word.length * 0.65)));
    return new Set([0, ...shuffle(indexes.slice(1)).slice(0, revealCount - 1)]);
  }

  if (difficulty === "Medium") {
    const revealCount = Math.min(word.length - 1, Math.max(1, Math.floor(word.length * 0.4)));
    return new Set([0, ...shuffle(indexes.slice(1)).slice(0, revealCount - 1)]);
  }

  const revealCount = Math.max(1, word.length - 8);
  return new Set([0, ...shuffle(indexes.slice(1)).slice(0, revealCount - 1)]);
};

const buildLetterBank = (
  word: string,
  revealPositions: Set<number>,
  mode: GameMode
) => {
  const missingLetters = word
    .split("")
    .filter((_, index) => !revealPositions.has(index));
  const targetSize = mode === "test" ? 10 : 8;
  const distractorCount = Math.max(0, targetSize - missingLetters.length);
  const distractors = Array.from({ length: distractorCount }, () => randomLetter());

  return shuffle([...missingLetters, ...distractors]).slice(0, targetSize).map((letter, index) => ({
    id: `${letter}-${index}-${Math.random().toString(36).slice(2)}`,
    letter,
  }));
};

const getVocabImageKey = (item: any) =>
  String(item?.keyword || item?.image_keyword || item?.vocab_word || item?.right_text || item?.left_text || "")
    .trim()
    .toLowerCase();

const preloadVocabImages = (items: VocabItem[]) => {
  if (typeof Image === "undefined") return;

  items.forEach((item) => {
    if (!item.imageUrl) return;

    const image = new Image();
    image.src = item.imageUrl;
  });
};

export default function LetterMatch({
  demoMode = false,
  fixedGrade = "Grade 1",
  fixedDifficulty = "Easy",
  maxDemoPairs = 50,
  demoFullscreenActive = false,
  hideStudentIdentity = false,
  disableProgressSaving = false,
  disableUnlocking = false,
  disableResume = false,
  onDemoComplete,
  onDemoFullscreenChange,
  onRequestSwitchGame,
}: GameDemoProps = {}) {
  const navigate = useNavigate();
  const arcadeRef = useRef<HTMLDivElement | null>(null);

  const [soundOn, setSoundOn] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">(
    () => (localStorage.getItem("arcade_theme") as "dark" | "light") || "dark"
  );
  const [grade, setGrade] = useState(fixedGrade);
  const [difficulty, setDifficulty] = useState<DifficultyKey>(fixedDifficulty);
  const [unlockedDifficulty, setUnlockedDifficulty] = useState<DifficultyKey>("Easy");
  const [vocabulary, setVocabulary] = useState<VocabItem[]>([]);
  const [vocabularyLoading, setVocabularyLoading] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [mode, setMode] = useState<GameMode>("practice");
  const [currentItem, setCurrentItem] = useState<VocabItem | null>(null);
  const [revealedPositions, setRevealedPositions] = useState<Set<number>>(new Set());
  const [letterBank, setLetterBank] = useState<BankLetter[]>([]);
  const [placedLetters, setPlacedLetters] = useState<Record<number, BankLetter>>({});
  const [activeBankLetterId, setActiveBankLetterId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const [testCorrect, setTestCorrect] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(getDifficultyConfig(difficulty).seconds);
  const [lastWord, setLastWord] = useState("");
  const [recentWords, setRecentWords] = useState<string[]>([]);
  const [practiceItems, setPracticeItems] = useState<VocabItem[]>([]);
  const [testItems, setTestItems] = useState<VocabItem[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [answerFeedback, setAnswerFeedback] = useState<AnswerFeedback | null>(null);
  const [floatingScore, setFloatingScore] = useState<number | null>(null);
  const [missedThisQuestion, setMissedThisQuestion] = useState(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [showDemoResult, setShowDemoResult] = useState(false);
  const [savedSession, setSavedSession] = useState<SavedLetterMatchSession | null>(null);
  const [showResumeConfirm, setShowResumeConfirm] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobileFullscreen, setIsMobileFullscreen] = useState(false);

  const config = getDifficultyConfig(difficulty);
  const scopeKey = `english:${LETTER_MATCH_GAME_KEY}:${grade}`;
  const isLight = theme === "light";
  const fullscreenActive = isFullscreen || isMobileFullscreen;
  const visualFullscreenActive = fullscreenActive || (demoMode && demoFullscreenActive);
  const gameModeActive = gameStarted || !!gameResult;
  const gameplayFrameActive = gameStarted;
  const showPageChrome = !fullscreenActive && !demoMode;
  const publicLang =
    typeof window !== "undefined" && window.location.pathname.startsWith("/zh")
      ? "zh"
      : typeof window !== "undefined" && window.location.pathname.startsWith("/ja")
        ? "ja"
        : "en";
  const menuSelectedClass = isLight
    ? "border-[#6D28D9] bg-[#EDE9FE] text-[#3B0764] shadow-[0_10px_28px_rgba(109,40,217,0.18)]"
    : "border-[#A78BFA] bg-[#7C3AED]/35 text-white shadow-[0_10px_28px_rgba(124,58,237,0.25)]";
  const menuSelectedCardClass = isLight
    ? "border-[#6D28D9] bg-[#EDE9FE] shadow-[0_16px_42px_rgba(109,40,217,0.18)]"
    : "border-[#A78BFA] bg-[#7C3AED]/30 shadow-[0_16px_42px_rgba(124,58,237,0.24)]";
  const modeTarget = mode === "practice" ? config.practiceTarget : config.testTarget;
  const expired = gameStarted && secondsLeft <= 0;
  const progressPercent = Math.min(100, (progress / modeTarget) * 100);
  const lowTime = secondsLeft <= 20;
  const availableBankLetters = letterBank.filter(
    (letter) =>
      !Object.values(placedLetters).some((placed) => placed.id === letter.id)
  );
  const missingPositions = useMemo(
    () =>
      currentItem
        ? currentItem.word
          .split("")
          .map((_, index) => index)
          .filter((index) => !revealedPositions.has(index))
        : [],
    [currentItem, revealedPositions]
  );
  const currentAnswer = currentItem
    ? currentItem.word
      .split("")
      .map((letter, index) =>
        revealedPositions.has(index) ? letter : placedLetters[index]?.letter || ""
      )
      .join("")
    : "";
  const allBlanksFilled =
    !!currentItem &&
    missingPositions.length > 0 &&
    missingPositions.every((index) => placedLetters[index]);

  const soundMap = useMemo(() => {
    if (typeof Audio === "undefined") return null;

    return {
      correct: new Audio("/sounds/success.mp3"),
      wrong: new Audio("/sounds/time-up.mp3"),
      stage: new Audio("/sounds/mastery-test.mp3"),
      timeUp: new Audio("/sounds/time-up.mp3"),
    };
  }, []);

  const stopAllSounds = () => {
    if (!soundMap) return;

    Object.values(soundMap).forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
      audio.loop = false;
    });
  };

  const playGameSound = (sound: "correct" | "wrong" | "stage" | "timeUp", volume = 0.45) => {
    if (!soundOn) return;
    const audio = soundMap?.[sound];
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    audio.loop = false;
    audio.volume = volume;
    void audio.play().catch(() => { });
  };

  const palette = {
    page: isLight ? "bg-white" : "bg-[#071426]",
    panel: isLight
      ? "border-[#eee8ff] bg-white shadow-[0_18px_55px_rgba(66,56,120,0.08)]"
      : "border-white/10 bg-white/5 backdrop-blur-xl",
    soft: isLight ? "border-[#eee8ff] bg-[#faf8ff]" : "border-white/10 bg-white/5",
    title: isLight ? "text-primary" : "text-white",
    text: isLight ? "text-primary/60" : "text-slate-300",
    muted: isLight ? "text-primary/45" : "text-slate-400",
    button: isLight
      ? "border-[#eee8ff] bg-white text-primary shadow-[0_8px_25px_rgba(66,56,120,0.08)] hover:bg-[#faf8ff]"
      : "border-white/10 bg-white/5 text-white hover:bg-white/10",
    gameWindow: isLight
      ? "border-[#eee8ff] bg-white shadow-[0_25px_80px_rgba(66,56,120,0.10)]"
      : "border-white/10 bg-[#071426] shadow-[0_30px_100px_rgba(0,0,0,0.45)]",
  };

  const moreGames = [
    { title: "Memory Flip", icon: Brain, available: true, current: false, status: "Available", path: "/memory-flip" },
    { title: "Word Search", icon: Search, available: true, current: false, status: "Available", path: "/word-search" },
    { title: "Letter Match", icon: Gem, available: true, current: true, status: "Available", path: "/letter-match" },
    { title: "Word Drive", icon: Car, available: false, current: false, status: "Coming Soon", path: "#" },
    { title: "Grammar Runner", icon: Flame, available: false, current: false, status: "Coming Soon", path: "#" },
    { title: "Listening Challenge", icon: Headphones, available: false, current: false, status: "Coming Soon", path: "#" },
    { title: "CAT4 Patterns", icon: Blocks, available: false, current: false, status: "Coming Soon", path: "#" },
  ];

  const loadProgress = async () => {
    if (demoMode) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("student_game_progress")
      .select("unlocked_difficulty")
      .eq("student_id", user.id)
      .eq("game_key", LETTER_MATCH_GAME_KEY)
      .eq("scope_key", scopeKey)
      .maybeSingle();

    if (error) {
      setUnlockedDifficulty("Easy");
      setDifficulty("Easy");
      return;
    }

    const nextUnlocked = (data?.unlocked_difficulty || "Easy") as DifficultyKey;
    setUnlockedDifficulty(nextUnlocked);
    setDifficulty((current) =>
      isDifficultyUnlocked(current, nextUnlocked) ? current : nextUnlocked
    );
  };

  const saveProgress = async ({
    passed,
    finalScore,
    finalCorrect,
  }: {
    passed: boolean;
    finalScore: number;
    finalCorrect: number;
  }) => {
    if (demoMode || disableProgressSaving) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: existingProgress, error } = await supabase
      .from("student_game_progress")
      .select("unlocked_difficulty, total_plays, total_wins, total_losses, total_score, best_score, current_streak, best_streak, last_won_at, last_lost_at")
      .eq("student_id", user.id)
      .eq("game_key", LETTER_MATCH_GAME_KEY)
      .eq("scope_key", scopeKey)
      .maybeSingle();

    if (error) return;

    const storedUnlocked = (existingProgress?.unlocked_difficulty || unlockedDifficulty) as DifficultyKey;
    const earnedDifficulty = passed && !disableUnlocking ? getNextDifficulty(difficulty) : null;
    const nextDifficulty = getHighestDifficulty(storedUnlocked, earnedDifficulty);
    const nextStreak = passed ? (existingProgress?.current_streak || 0) + 1 : 0;

    await supabase.from("student_game_progress").upsert(
      {
        student_id: user.id,
        game_key: LETTER_MATCH_GAME_KEY,
        scope_key: scopeKey,
        scope: { language: "English", grade },
        unlocked_difficulty: nextDifficulty,
        current_difficulty: difficulty,
        total_plays: (existingProgress?.total_plays || 0) + 1,
        total_wins: (existingProgress?.total_wins || 0) + (passed ? 1 : 0),
        total_losses: (existingProgress?.total_losses || 0) + (passed ? 0 : 1),
        total_score: (existingProgress?.total_score || 0) + finalScore,
        best_score: Math.max(existingProgress?.best_score || 0, finalScore),
        current_streak: nextStreak,
        best_streak: Math.max(existingProgress?.best_streak || 0, nextStreak),
        last_played_at: new Date().toISOString(),
        last_won_at: passed ? new Date().toISOString() : existingProgress?.last_won_at,
        last_lost_at: passed ? existingProgress?.last_lost_at : new Date().toISOString(),
        stats: {
          final_test_correct: finalCorrect,
          final_test_target: config.testTarget,
          practice_target: config.practiceTarget,
        },
      },
      {
        onConflict: "student_id,game_key,scope_key",
      }
    );

    setUnlockedDifficulty((current) =>
      getHighestDifficulty(current, nextDifficulty as DifficultyKey | null)
    );
  };

  const loadVocabulary = async () => {
    setVocabularyLoading(true);
    setErrorMsg("");

    if (!demoMode) {
      const { items } = await loadGameVocabularyItems({
        supabase,
        grade,
      });
      const sharedVocabulary = buildLetterMatchItemsFromVocabulary(items);

      if (sharedVocabulary.length >= 3) {
        setVocabulary(sharedVocabulary);
        setVocabularyLoading(false);
        return;
      }
    }

    // TODO: Temporary legacy fallback until shared vocabulary is fully approved live.
    const questionTable = demoMode ? "public_demo_questions" : "game_questions";
    let query = supabase
      .from(questionTable)
      .select("language_pair, question_data")
      .eq("game_type", "memory_flip")
      .eq("grade", demoMode ? "Grade 1" : grade);

    if (demoMode) {
      query = query.eq("language_pair", "zh_en");
    } else {
      query = query.in("language_pair", ["zh_en", "en_ja"]).order("created_at", { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      setVocabulary([]);
      setVocabularyLoading(false);
      setErrorMsg("Could not load Letter Match vocabulary yet.");
      return;
    }

    const rawItems = (data || [])
      .flatMap((set: any) => {
        const pairs: Pair[] = set.question_data?.pairs || [];
        return pairs.map((pair, index) => {
          const word = getEnglishWordFromPair(pair);
          const imageKeyword = String(pair.image_keyword || pair.right || pair.vocab_word || "").trim();

          return {
            id: `${set.language_pair || "pair"}-${word}-${index}-${imageKeyword}`,
            word,
            imageUrl: pair.image_url || "",
            imageKeyword,
          };
        });
      })
      .filter((item) => item.word.length >= 3);

    const imageMap = new Map<string, string>();
    const missingImageTerms = Array.from(
      new Set(
        rawItems
          .filter((item) => !item.imageUrl)
          .flatMap((item) => [item.word, item.imageKeyword])
          .filter(Boolean)
          .map((term) => String(term).toLowerCase())
      )
    );

    if (missingImageTerms.length > 0) {
      const { data: imageRows } = await supabase
        .from("vocab_images")
        .select("keyword, image_keyword, vocab_word, left_text, right_text, image_url, status")
        .eq("status", "approved");

      (imageRows || []).forEach((row: any) => {
        const imageUrl = row.image_url;
        if (!imageUrl) return;

        [
          getVocabImageKey(row),
          cleanEnglishWord(String(row.vocab_word || "")).toLowerCase(),
          cleanEnglishWord(String(row.right_text || "")).toLowerCase(),
          cleanEnglishWord(String(row.left_text || "")).toLowerCase(),
        ]
          .filter(Boolean)
          .forEach((key) => imageMap.set(key, imageUrl));
      });
    }

    const deduped = Array.from(
      new Map(
        rawItems.map((item) => {
          const key = item.word.toLowerCase();
          const fallbackImage =
            imageMap.get(key) ||
            imageMap.get(String(item.imageKeyword || "").toLowerCase()) ||
            "";

          return [
            item.word,
            {
              ...item,
              imageUrl: item.imageUrl || fallbackImage,
            },
          ];
        })
      ).values()
    );

    setVocabulary(demoMode ? deduped.slice(0, maxDemoPairs) : deduped);
    setVocabularyLoading(false);
  };

  useEffect(() => {
    if (demoMode) {
      setGrade(fixedGrade);
      setDifficulty(fixedDifficulty);
      setUnlockedDifficulty(fixedDifficulty);
      return;
    }

    loadProgress();
  }, [grade, demoMode, fixedGrade, fixedDifficulty]);

  useEffect(() => {
    loadVocabulary();
  }, [grade, demoMode, maxDemoPairs]);

  useEffect(() => {
    localStorage.setItem("arcade_theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!demoMode) return;
    onDemoFullscreenChange?.(fullscreenActive);
  }, [demoMode, fullscreenActive, onDemoFullscreenChange]);

  useEffect(() => () => stopAllSounds(), [soundMap]);

  useEffect(() => {
    if (demoMode || disableResume) return;

    setSavedSession(loadGameSession<SavedLetterMatchSession>(LETTER_MATCH_GAME_KEY));
  }, [demoMode, disableResume]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (!gameStarted || gameResult || mode === "test") return;

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [gameResult, gameStarted, mode]);

  useEffect(() => {
    if (!expired || gameResult) return;

    playGameSound("timeUp", 0.35);
    setGameStarted(false);
    const finalCorrect = mode === "test" ? testCorrect : 0;
    stopAllSounds();
    setGameResult({
      passed: false,
      testCorrect: finalCorrect,
      testTarget: config.testTarget,
      nextDifficulty: null,
    });
    clearSavedSession();
    saveProgress({
      passed: false,
      finalScore: score,
      finalCorrect,
    });
  }, [config.testTarget, expired, gameResult, mode, score, testCorrect]);

  useEffect(() => {
    if (!gameStarted) return;
    if (mode === "test") return;
    if (!allBlanksFilled || feedback || !currentItem) return;

    if (currentAnswer === currentItem.word) {
      handleCorrectAnswer();
      return;
    }

    handleWrongAnswer();
  }, [allBlanksFilled, currentAnswer, currentItem, feedback, gameStarted, mode]);

  const enterGameMode = async () => {
    if (demoMode) return;

    const isMobile =
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
      window.innerWidth < 768;

    if (isMobile) {
      setIsMobileFullscreen(true);
      return;
    }

    try {
      await arcadeRef.current?.requestFullscreen();
    } catch {
      // Browsers can block fullscreen; the game still works without it.
    }
  };

  const clearSavedSession = () => {
    clearGameSession(LETTER_MATCH_GAME_KEY);
    setSavedSession(null);
  };

  const saveCurrentSession = () => {
    if (demoMode || disableResume) return;

    if (!gameStarted || loading || gameResult || !currentItem) return;

    const session: SavedLetterMatchSession = {
      grade,
      difficulty,
      unlockedDifficulty,
      mode,
      score,
      progress,
      secondsLeft,
      currentItem,
      revealedPositions: Array.from(revealedPositions),
      letterBank,
      placedLetters,
      testCorrect,
      missedThisQuestion,
      recentWords,
      lastWord,
      practiceItems,
      testItems,
    };

    saveGameSession(LETTER_MATCH_GAME_KEY, session);
    setSavedSession(session);
  };

  const resumeSavedSession = async () => {
    if (!savedSession) return;

    setShowResumeConfirm(false);
    setGrade(savedSession.grade);
    setDifficulty(savedSession.difficulty);
    setUnlockedDifficulty(savedSession.unlockedDifficulty);
    setMode(savedSession.mode);
    setScore(savedSession.score);
    setProgress(savedSession.progress);
    setSecondsLeft(savedSession.secondsLeft);
    setCurrentItem(savedSession.currentItem);
    setRevealedPositions(new Set(savedSession.revealedPositions || []));
    setLetterBank(savedSession.letterBank || []);
    setPlacedLetters(savedSession.placedLetters || {});
    setTestCorrect(savedSession.testCorrect || 0);
    setMissedThisQuestion(!!savedSession.missedThisQuestion);
    setRecentWords(savedSession.recentWords || []);
    setLastWord(savedSession.lastWord || "");
    setPracticeItems(savedSession.practiceItems || []);
    setTestItems(savedSession.testItems || []);
    setErrorMsg("");
    setFeedback(null);
    setAnswerFeedback(null);
    setFloatingScore(null);
    setLoading(false);
    setGameResult(null);
    await enterGameMode();
    setGameStarted(true);
    clearSavedSession();
  };

  const toggleFullscreen = async () => {
    const isMobile =
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
      window.innerWidth < 768;

    if (isMobile) {
      setIsMobileFullscreen((current) => !current);
      return;
    }

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await arcadeRef.current?.requestFullscreen();
      }
    } catch {
      // Fullscreen is a nice-to-have control.
    }
  };

  const exitGameMode = async () => {
    setIsMobileFullscreen(false);

    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        // Returning to the menu should continue even if fullscreen refuses.
      }
    }
  };

  const loadQuestion = (item: VocabItem, nextMode: GameMode) => {
    const revealPositions = getRevealPositions(item.word, difficulty, nextMode);
    setCurrentItem(item);
    setRevealedPositions(revealPositions);
    setLetterBank(buildLetterBank(item.word, revealPositions, nextMode));
    setPlacedLetters({});
    setActiveBankLetterId(null);
    setFeedback(null);
    setAnswerFeedback(null);
    setFloatingScore(null);
    setMissedThisQuestion(false);
  };

  const buildRound = (items = vocabulary, nextMode: GameMode = mode) => {
    const pool = items.length > 0 ? items : vocabulary;
    if (pool.length === 0) return;

    const completedWords = new Set(practiceItems.map((item) => item.word));
    const freshPool =
      nextMode === "practice"
        ? pool.filter((item) => !completedWords.has(item.word))
        : pool;
    const sourcePool = freshPool.length > 0 ? freshPool : pool;
    const item = shuffle(sourcePool)[0];

    loadQuestion(item, nextMode);
  };

  const startGame = async () => {
    if (vocabularyLoading) return;

    if (!demoMode && !disableResume && savedSession) {
      setShowResumeConfirm(true);
      return;
    }

    await startNewGame();
  };

  const startNewGame = async () => {
    if (vocabularyLoading) return;

    stopAllSounds();
    setShowResumeConfirm(false);
    if (!demoMode && !disableResume) {
      clearSavedSession();
    }
    setGameResult(null);
    setShowDemoResult(false);
    setErrorMsg("");

    if (vocabulary.length < 3) {
      setErrorMsg(`Not enough ${grade} image vocabulary is ready for Letter Match yet.`);
      return;
    }

    await enterGameMode();
    setLoading(true);
    setMode("practice");
    setScore(0);
    setProgress(0);
    setTestCorrect(0);
    setSecondsLeft(config.seconds);
    setLastWord("");
    setRecentWords([]);
    setPracticeItems([]);
    setTestItems([]);
    setAnswerFeedback(null);

    if (demoMode) {
      const firstItem = shuffle(vocabulary)[0];

      if (firstItem) {
        loadQuestion(firstItem, "practice");
      }

      setLoading(false);
      setGameStarted(true);
      return;
    }

    setGameStarted(true);

    window.setTimeout(() => {
      buildRound(vocabulary, "practice");
      setLoading(false);
    }, 250);
  };

  const startFinalTest = (completedItems = practiceItems) => {
    if (demoMode) return;

    const sourceItems = completedItems.length > 0 ? completedItems : practiceItems;
    const selectedItems = shuffle(sourceItems).slice(0, config.testTarget);

    if (selectedItems.length === 0) return;

    playGameSound("stage", 0.32);
    setMode("test");
    setProgress(0);
    setTestCorrect(0);
    setTestItems(selectedItems);
    setSecondsLeft(Math.max(75, config.testTarget * 14));
    preloadVocabImages(selectedItems);
    loadQuestion(selectedItems[0], "test");
  };

  const finishTest = (correctCount: number, finalScore: number) => {
    const passed = correctCount / config.testTarget >= 0.8;
    const earnedDifficulty = passed && !disableUnlocking ? getNextDifficulty(difficulty) : null;
    const nextDifficulty =
      earnedDifficulty &&
        difficultyOrder.indexOf(earnedDifficulty) > difficultyOrder.indexOf(unlockedDifficulty)
        ? earnedDifficulty
        : null;

    setAnswerFeedback(null);
    setFeedback(null);
    setFloatingScore(null);
    setActiveBankLetterId(null);
    stopAllSounds();
    setGameResult({
      passed,
      testCorrect: correctCount,
      testTarget: config.testTarget,
      nextDifficulty,
    });
    if (!demoMode && !disableResume) {
      clearSavedSession();
    }
    playGameSound(passed ? "stage" : "timeUp", passed ? 0.35 : 0.25);

    if (!demoMode && !disableUnlocking) {
      setUnlockedDifficulty((current) => getHighestDifficulty(current, nextDifficulty));
    }
    if (demoMode) {
      onDemoComplete?.();
    }

    saveProgress({
      passed,
      finalScore,
      finalCorrect: correctCount,
    });
  };

  const resetToMenu = async () => {
    stopAllSounds();
    saveCurrentSession();
    setGameStarted(false);
    setLoading(false);
    setErrorMsg("");
    setGameResult(null);
    setShowDemoResult(false);
    setMode("practice");
    setProgress(0);
    setTestCorrect(0);
    setCurrentItem(null);
    setPlacedLetters({});
    setActiveBankLetterId(null);
    setFeedback(null);
    setAnswerFeedback(null);
    setPracticeItems([]);
    setTestItems([]);
    setShowResumeConfirm(false);
    await exitGameMode();
  };

  const retryTest = async () => {
    setGameResult(null);
    await enterGameMode();
    setGameStarted(true);
    setMode("test");
    setProgress(0);
    setTestCorrect(0);
    setAnswerFeedback(null);
    setSecondsLeft(Math.max(75, config.testTarget * 14));
    startFinalTest(practiceItems);
  };

  const handleCorrectAnswer = () => {
    if (!currentItem || mode !== "practice") return;

    const awardedScore = currentItem.word.length * 100;
    const nextScore = score + awardedScore;
    const nextPracticeItems = [...practiceItems, currentItem];
    const nextProgress = nextPracticeItems.length;

    setScore(nextScore);
    setProgress(nextProgress);
    setFeedback("correct");
    setFloatingScore(awardedScore);
    setLastWord(currentItem.word);
    setRecentWords((current) => [currentItem.word, ...current].slice(0, 12));
    setPracticeItems(nextPracticeItems);
    playGameSound("correct", 0.28);

    const completedWords = new Set(nextPracticeItems.map((item) => item.word));
    const freshPool = vocabulary.filter((item) => !completedWords.has(item.word));
    const sourcePool = freshPool.length > 0 ? freshPool : vocabulary;
    const nextItem = shuffle(sourcePool)[0];

    if (nextItem) {
      preloadVocabImages([nextItem]);
    }

    window.setTimeout(() => {
      if (nextProgress >= config.practiceTarget) {
        if (demoMode) {
          setAnswerFeedback(null);
          setFeedback(null);
          setFloatingScore(null);
          setActiveBankLetterId(null);
          stopAllSounds();
          setGameStarted(false);
          setShowDemoResult(true);
          playGameSound("stage", 0.25);
          onDemoComplete?.();
          return;
        }

        startFinalTest(nextPracticeItems);
        return;
      }

      if (nextItem) {
        loadQuestion(nextItem, "practice");
      }
    }, 1150);
  };

  const handleWrongAnswer = () => {
    setFeedback("wrong");
    setMissedThisQuestion(true);
    playGameSound("wrong", 0.25);

    window.setTimeout(() => {
      setPlacedLetters({});
      setActiveBankLetterId(null);
      setFeedback(null);
    }, 850);
  };

  const checkCurrentSpelling = () => {
    if (!currentItem || mode !== "test" || feedback || answerFeedback || !allBlanksFilled) return;

    const correct = currentAnswer === currentItem.word;
    const awardedScore = correct ? currentItem.word.length * 160 : 0;
    const nextScore = score + awardedScore;
    const nextCorrect = correct ? testCorrect + 1 : testCorrect;
    const nextProgress = progress + 1;

    setScore(nextScore);
    setTestCorrect(nextCorrect);
    setFeedback(correct ? "correct" : "wrong");
    setAnswerFeedback({ correct, word: currentItem.word });
    setFloatingScore(correct ? awardedScore : null);
    setLastWord(currentItem.word);
    setRecentWords((current) => [currentItem.word, ...current].slice(0, 12));
    playGameSound(correct ? "correct" : "wrong", correct ? 0.28 : 0.25);

    const nextItem = testItems[nextProgress];
    if (nextItem) {
      preloadVocabImages([nextItem]);
    }

    window.setTimeout(() => {
      if (nextProgress >= config.testTarget) {
        setProgress(nextProgress);
        setAnswerFeedback(null);
        setFeedback(null);
        setFloatingScore(null);
        setActiveBankLetterId(null);

        window.setTimeout(() => {
          finishTest(nextCorrect, nextScore);
        }, 80);
        return;
      }

      setProgress(nextProgress);

      if (nextItem) {
        loadQuestion(nextItem, "test");
      }
    }, correct ? 700 : 1000);
  };

  const placeLetter = (position: number, letter: BankLetter) => {
    if (feedback) return;

    setPlacedLetters((current) => ({
      ...current,
      [position]: letter,
    }));
    setActiveBankLetterId(null);
  };

  const handleBankLetterClick = (letter: BankLetter) => {
    if (feedback) return;

    const openPosition = missingPositions.find((index) => !placedLetters[index]);

    if (activeBankLetterId === letter.id) {
      setActiveBankLetterId(null);
      return;
    }

    if (openPosition !== undefined) {
      placeLetter(openPosition, letter);
      return;
    }

    setActiveBankLetterId(letter.id);
  };

  const handleSlotClick = (position: number) => {
    if (revealedPositions.has(position) || feedback) return;

    if (placedLetters[position]) {
      setPlacedLetters((current) => {
        const next = { ...current };
        delete next[position];
        return next;
      });
      return;
    }

    const selectedLetter = availableBankLetters.find(
      (letter) => letter.id === activeBankLetterId
    );

    if (selectedLetter) {
      placeLetter(position, selectedLetter);
    }
  };

  const handleDropOnSlot = (position: number, letterId: string) => {
    const letter = availableBankLetters.find((item) => item.id === letterId);
    if (letter) placeLetter(position, letter);
  };

  const renderGradeButton = (item: string) => {
    const locked = demoMode && item !== fixedGrade;

    return (
      <button
        key={item}
        disabled={locked}
        onClick={() => {
          if (!demoMode) setGrade(item);
        }}
        className={`h-12 rounded-2xl border text-sm font-black transition ${grade === item
          ? menuSelectedClass
          : locked
            ? isLight
              ? "cursor-not-allowed border-[#eee8ff] bg-[#faf8ff] text-primary/35"
              : "cursor-not-allowed border-white/10 bg-white/5 text-white/35"
            : palette.button
          }`}
      >
        {item}
      </button>
    );
  };

  return (
    <div className={demoMode ? `relative overflow-hidden bg-transparent ${demoFullscreenActive ? "h-full min-h-0" : ""}` : `relative min-h-screen overflow-hidden ${palette.page}`}>
      <style>
        {`
          @keyframes letter-match-pop {
            0%, 100% { transform: scale(1); }
            42% { transform: scale(1.09) rotate(2deg); }
            70% { transform: scale(0.98); }
          }

          @keyframes letter-match-shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-8px) rotate(-1deg); }
            45% { transform: translateX(8px) rotate(1deg); }
            70% { transform: translateX(-4px); }
          }

          @keyframes letter-match-slide {
            0% { transform: translateY(18px) scale(0.98); opacity: 0.3; }
            100% { transform: translateY(0) scale(1); opacity: 1; }
          }

          @keyframes letter-match-float-score {
            0% { transform: translate(-50%, 10px) scale(0.9); opacity: 0; }
            30% { opacity: 1; }
            100% { transform: translate(-50%, -70px) scale(1.2); opacity: 0; }
          }

          @keyframes letter-match-confetti {
            0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
            20% { opacity: 1; }
            100% { transform: translateY(190px) rotate(260deg); opacity: 0; }
          }

          @keyframes letter-match-timer {
            0%, 100% { transform: scale(1); box-shadow: 0 12px 28px rgba(239, 68, 68, 0.28); }
            50% { transform: scale(1.05); box-shadow: 0 16px 42px rgba(239, 68, 68, 0.5); }
          }
        `}
      </style>

      {!demoMode && <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {isLight ? (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,#f0eaff_0%,transparent_28%),radial-gradient(circle_at_85%_75%,#fff1bd_0%,transparent_30%)]" />
        ) : (
          <>
            <div className="absolute left-[-120px] top-[-120px] h-[340px] w-[340px] rounded-full bg-[#8B5CF6]/20 blur-3xl" />
            <div className="absolute bottom-[-140px] right-[-100px] h-[380px] w-[380px] rounded-full bg-[#2563EB]/20 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_35%)]" />
          </>
        )}
      </div>}

      <div className={demoMode && demoFullscreenActive ? "relative z-10 h-full min-h-0 w-full overflow-y-auto p-0" : "relative z-10 mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8"}>
        {showPageChrome && (
          <div className={`mb-4 flex flex-wrap items-center justify-between gap-2 rounded-[1.2rem] border px-3 py-3 sm:rounded-[1.5rem] sm:px-5 sm:py-4 ${palette.panel}`}>
            <button
              onClick={async () => {
                saveCurrentSession();
                await exitGameMode();
                navigate("/games");
              }}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-black ${palette.button}`}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Games Arcade
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSoundOn((current) => !current)}
                className={`flex h-11 w-11 items-center justify-center rounded-xl border ${palette.button}`}
                title={soundOn ? "Sound On" : "Sound Off"}
              >
                {soundOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </button>

              <button
                onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
                className={`flex h-11 w-11 items-center justify-center rounded-xl border ${palette.button}`}
                title={theme === "dark" ? "Dark Mode" : "Light Mode"}
              >
                {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>

              {!hideStudentIdentity && (
                <div className={`rounded-xl border px-4 py-2 text-sm font-black ${palette.button}`}>
                  Michael
                </div>
              )}
            </div>
          </div>
        )}

        <div
          ref={arcadeRef}
          className={`relative ${gameplayFrameActive ? "overflow-hidden" : "overflow-visible"} ${!demoMode && !gameplayFrameActive ? `border ${palette.gameWindow}` : ""} ${isMobileFullscreen
            ? `fixed inset-0 z-[250] h-[100dvh] overflow-y-auto rounded-none ${gameplayFrameActive ? "p-0" : "p-2 sm:p-3"}`
            : demoMode
              ? demoFullscreenActive
                ? "mb-0 h-full min-h-0 overflow-y-auto border-0 bg-transparent p-0 shadow-none"
                : "mb-0 border-0 bg-transparent p-0 shadow-none"
            : gameplayFrameActive
              ? "mb-8 rounded-[1.6rem] p-0 sm:rounded-[2.5rem]"
              : "mb-8 rounded-[1.6rem] p-3 sm:rounded-[2.5rem] sm:p-4"
            }`}
        >
          <div className={`relative z-10 ${demoMode && demoFullscreenActive ? "h-full min-h-0 overflow-y-auto" : fullscreenActive ? "min-h-[100dvh]" : "min-h-[520px] sm:min-h-[620px]"}`}>
            {!demoMode && gameModeActive && !gameStarted && (
              <button
                type="button"
                onClick={toggleFullscreen}
                className="absolute right-3 top-3 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white backdrop-blur-xl hover:bg-white/10"
                title={fullscreenActive ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {fullscreenActive ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              </button>
            )}

            {demoMode && showDemoResult && (
              <div className="fixed inset-0 z-[190] flex items-center justify-center bg-black/70 px-4">
                <div className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-[2rem] border border-white/10 bg-[#0D1B2E] p-6 text-center shadow-[0_30px_100px_rgba(0,0,0,0.6)] sm:rounded-[2.5rem] sm:p-8">
                  <Trophy className="mx-auto h-16 w-16 text-[#FACC15] sm:h-20 sm:w-20" />

                  <p className="mt-4 text-sm font-black uppercase tracking-[0.25em] text-[#C4B5FD]">
                    Luna Arcade Demo
                  </p>

                  <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
                    Great Job!
                  </h2>

                  <p className="mt-4 text-slate-300">
                    You completed the Luna Arcade demo.
                  </p>

                  <div className="mt-6 grid gap-3 sm:mt-8">
                    <button
                      onClick={async () => {
                        setShowDemoResult(false);
                        await startNewGame();
                      }}
                      className="h-14 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#2563EB] font-black text-white"
                    >
                      Play Again
                    </button>

                    <button
                      onClick={async () => {
                        setShowDemoResult(false);
                        await resetToMenu();
                        onRequestSwitchGame?.("word");
                      }}
                      className="h-14 rounded-2xl border border-white/10 bg-white/5 font-black text-white"
                    >
                      Try Word Search
                    </button>

                    <button
                      onClick={async () => {
                        setShowDemoResult(false);
                        await resetToMenu();
                        navigate(`/${publicLang}/enquiry`);
                      }}
                      className="h-14 rounded-2xl border border-white/10 bg-white/5 font-black text-white"
                    >
                      Book Consultation
                    </button>
                  </div>
                </div>
              </div>
            )}

            {gameResult && (
              <div className="fixed inset-0 z-[160] flex items-center justify-center overflow-hidden bg-[#1E0B4B]/85 px-4 py-4 backdrop-blur-md">
                {gameResult.passed &&
                  Array.from({ length: 18 }, (_, index) => (
                    <span
                      key={index}
                      className="pointer-events-none absolute h-3 w-2 rounded-full"
                      style={{
                        left: `${8 + ((index * 17) % 84)}%`,
                        top: `${-8 - (index % 5) * 8}px`,
                        background: ["#FACC15", "#FB7185", "#38BDF8", "#34D399", "#A78BFA"][index % 5],
                        animation: `letter-match-confetti ${2.2 + (index % 4) * 0.35}s ease-in ${index * 0.08}s infinite`,
                      }}
                    />
                  ))}
                <div className="relative max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-[2rem] border-4 border-[#FDE68A] bg-gradient-to-b from-[#7C3AED] via-[#DB2777] to-[#FB923C] p-1 text-center shadow-[0_34px_110px_rgba(124,58,237,0.55)] sm:rounded-[2.5rem]">
                  <div className="relative rounded-[1.7rem] bg-[#180B3D]/92 p-6 sm:rounded-[2.2rem] sm:p-8">
                    <div className={`relative mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 ${gameResult.passed ? "border-[#FDE68A] bg-[#FACC15]" : "border-[#FDA4AF] bg-[#FB7185]"} shadow-[0_18px_60px_rgba(250,204,21,0.4)]`}>
                      {gameResult.passed ? (
                        <Trophy className="h-14 w-14 text-[#78350F]" />
                      ) : (
                        <Star className="h-14 w-14 text-white" />
                      )}
                    </div>
                    <p className="relative mt-5 text-sm font-black uppercase tracking-[0.25em] text-[#FDE68A]">
                      Letter Match
                    </p>
                    <h2 className="relative mt-3 text-4xl font-black leading-tight text-white sm:text-5xl">
                      {gameResult.passed ? "Passed" : "Failed"}
                    </h2>
                    <p className="relative mt-4 text-base font-bold text-white/85">
                      Mastery Result: {gameResult.testCorrect}/{gameResult.testTarget} correct
                    </p>
                    {gameResult.passed && gameResult.nextDifficulty && (
                      <div className="relative mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-sm font-black text-white">
                        <Sparkles className="h-4 w-4 text-[#FDE68A]" />
                        {gameResult.nextDifficulty} unlocked
                      </div>
                    )}

                    <div className="relative mt-8 grid gap-3">
                      {gameResult.passed ? (
                        <button
                          onClick={async () => {
                            setGameResult(null);

                            if (gameResult.nextDifficulty) {
                              setDifficulty(gameResult.nextDifficulty);
                            }

                            await resetToMenu();
                          }}
                          className="h-14 rounded-2xl border-2 border-white/30 bg-gradient-to-r from-[#FACC15] via-[#FB923C] to-[#FB7185] font-black text-white shadow-[0_14px_35px_rgba(251,146,60,0.4)] transition hover:scale-[1.02]"
                        >
                          CONTINUE
                        </button>
                      ) : (
                        <button
                          onClick={retryTest}
                          className="h-14 rounded-2xl border-2 border-white/30 bg-gradient-to-r from-[#FACC15] via-[#FB923C] to-[#FB7185] font-black text-white shadow-[0_14px_35px_rgba(251,146,60,0.4)] transition hover:scale-[1.02]"
                        >
                          RETRY FINAL TEST
                        </button>
                      )}

                      <button
                        onClick={resetToMenu}
                        className="h-14 rounded-2xl border-2 border-white/15 bg-white/10 font-black text-white transition hover:bg-white/15"
                      >
                        BACK TO MENU
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showResumeConfirm && savedSession && (
              <div className="fixed inset-0 z-[170] flex items-center justify-center bg-black/75 px-4">
                <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0D1B2E] p-6 text-center shadow-[0_30px_100px_rgba(0,0,0,0.6)]">
                  <Trophy className="mx-auto h-14 w-14 text-[#FACC15]" />
                  <h2 className="mt-4 text-3xl font-black text-white">
                    Resume unfinished Letter Match?
                  </h2>
                  <p className="mt-3 text-sm font-bold leading-6 text-slate-300">
                    {savedSession.grade} · {savedSession.difficulty} · {savedSession.mode === "practice" ? "Practice" : "Final Test"} · {savedSession.progress}/{savedSession.mode === "practice" ? getDifficultyConfig(savedSession.difficulty).practiceTarget : getDifficultyConfig(savedSession.difficulty).testTarget}
                  </p>

                  <div className="mt-6 grid gap-3">
                    <button
                      onClick={resumeSavedSession}
                      className="h-12 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#2563EB] font-black text-white"
                    >
                      RESUME
                    </button>
                    <button
                      onClick={startNewGame}
                      className="h-12 rounded-2xl border border-white/10 bg-white/5 font-black text-white"
                    >
                      START OVER
                    </button>
                    <button
                      onClick={() => setShowResumeConfirm(false)}
                      className="h-12 rounded-2xl border border-white/10 bg-transparent font-black text-slate-300"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!gameStarted ? (
              vocabularyLoading ? (
                <ArcadeLoadingScreen isLight={isLight} className="min-h-[420px]" />
              ) : (
                <div className="overflow-visible p-5 sm:p-6">
                  <div className="grid gap-6 lg:grid-cols-[1.1fr_320px]">
                    <div>
                      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#8B5CF6]/35 bg-[#8B5CF6]/10 px-3 py-1.5">
                        <Gem className="h-4 w-4 text-[#C4B5FD]" />
                        <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#C4B5FD]">
                          Luna Word Arcade
                        </span>
                      </div>

                      <h1 className={`text-4xl font-black leading-tight sm:text-5xl ${palette.title}`}>
                        Letter Match
                      </h1>
                      <div className={`mt-4 inline-flex max-w-xl items-center gap-2 rounded-full border px-3 py-2 ${palette.soft}`}>
                        <p className={`text-xs font-bold leading-5 ${palette.text}`}>
                          <span className="text-sm">🏆</span>{" "}
                          Practice picture spelling words, then pass the final mastery test to unlock the next difficulty.
                        </p>
                      </div>
                    </div>

                    <div className={`rounded-[1.5rem] border p-4 ${palette.soft}`}>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#C4B5FD]">
                        Vocabulary Pool
                      </p>
                      <p className={`mt-3 text-3xl font-black ${palette.title}`}>
                        {vocabulary.length}
                      </p>
                      <p className={`mt-1 text-sm font-bold ${palette.text}`}>
                        {grade} image words loaded
                      </p>
                      <p className={`mt-2 text-xs font-black ${palette.muted}`}>
                        Final test pass mark: 80%
                      </p>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="mt-5 rounded-[1.4rem] border border-[#FDE68A] bg-[#FACC15]/90 p-4 text-sm font-black text-[#78350F]">
                      {errorMsg}
                    </div>
                  )}

                  {savedSession && (
                    <div className={`mt-5 rounded-[1.5rem] border p-4 ${palette.soft}`}>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className={`text-sm font-black ${palette.title}`}>
                            Resume unfinished Letter Match?
                          </p>
                          <p className={`mt-1 text-xs font-bold ${palette.text}`}>
                            {savedSession.grade} · {savedSession.difficulty} · {savedSession.mode === "practice" ? "Practice" : "Final Test"} · {savedSession.progress}/{savedSession.mode === "practice" ? getDifficultyConfig(savedSession.difficulty).practiceTarget : getDifficultyConfig(savedSession.difficulty).testTarget}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={resumeSavedSession}
                            className="h-11 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#2563EB] px-4 text-sm font-black text-white"
                          >
                            RESUME
                          </button>
                          <button
                            onClick={clearSavedSession}
                            className={`h-11 rounded-xl border px-4 text-sm font-black ${palette.button}`}
                          >
                            START OVER
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6">
                    <span className={`mb-2 block text-xs font-black uppercase tracking-[0.18em] ${palette.muted}`}>
                      Language
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {["English", "Japanese", "Chinese"].map((language) => {
                        const active = language === "English";

                        return (
                          <button
                            key={language}
                            disabled={!active}
                            className={`h-12 rounded-2xl border text-sm font-black transition ${active
                              ? menuSelectedClass
                              : "cursor-not-allowed border-white/10 bg-white/5 text-white/35"
                              }`}
                          >
                            {language}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-6">
                    <span className={`mb-2 block text-xs font-black uppercase tracking-[0.18em] ${palette.muted}`}>
                      Grade
                    </span>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                      {grades.map(renderGradeButton)}
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {difficulties.map((item) => {
                      const active = item.key === difficulty;
                      const locked = !isDifficultyUnlocked(item.key, unlockedDifficulty);

                      return (
                        <button
                          key={item.key}
                          disabled={locked}
                          onClick={() => {
                            if (!demoMode) setDifficulty(item.key);
                          }}
                          className={`relative overflow-hidden rounded-[1.2rem] border p-4 text-left transition ${active
                            ? menuSelectedCardClass
                            : palette.soft
                            } ${locked ? "opacity-65" : "hover:-translate-y-1"}`}
                        >
                          <p className={`text-xs font-black uppercase tracking-widest ${active ? (isLight ? "text-[#4C1D95]" : "text-white") : palette.muted}`}>
                            {item.key}
                          </p>
                          <p className={`mt-2 text-3xl font-black ${active ? (isLight ? "text-[#3B0764]" : "text-white") : palette.title}`}>{item.practiceTarget}</p>
                          <p className={`text-sm font-bold ${active ? (isLight ? "text-[#4C1D95]" : "text-white/85") : palette.text}`}>practice words</p>
                          <p className={`mt-1 text-xs font-black ${active ? (isLight ? "text-[#4C1D95]" : "text-white/80") : palette.muted}`}>
                            Final test: {item.testTarget}
                          </p>
                          {locked && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                              <span className="rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-white">
                                Locked
                              </span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={startGame}
                    disabled={vocabularyLoading || vocabulary.length < 3}
                    className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-[1.6rem] bg-gradient-to-r from-[#8B5CF6] to-[#2563EB] text-base font-black text-white shadow-[0_15px_50px_rgba(99,102,241,0.45)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    START {difficulty.toUpperCase()} LETTER MATCH
                  </button>
                </div>
              )
            ) : mode === "test" && currentItem ? (
              <div className={`relative mx-auto flex w-full max-w-[1500px] flex-col overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#5B21B6] via-[#BE185D] to-[#F97316] ${demoMode ? "sm:rounded-[2.5rem]" : ""} ${demoMode && demoFullscreenActive ? "h-full min-h-0 p-2" : fullscreenActive ? "min-h-[calc(100dvh-0.5rem)] p-2" : "min-h-[520px] p-2 sm:min-h-[620px] sm:p-4"}`}>
                {answerFeedback && !gameResult && (
                  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#180B3D]/62 px-4 backdrop-blur-sm">
                    <div className={`w-full max-w-sm rounded-[2rem] border-4 p-6 text-center shadow-[0_28px_90px_rgba(0,0,0,0.45)] ${answerFeedback.correct
                      ? "border-emerald-200 bg-gradient-to-b from-emerald-400 to-emerald-600"
                      : "border-[#FDA4AF] bg-gradient-to-b from-[#FB7185] to-[#BE185D]"
                      }`}
                    >
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/45 bg-white/20">
                        {answerFeedback.correct ? (
                          <CheckCircle2 className="h-9 w-9 text-white" />
                        ) : (
                          <Star className="h-9 w-9 text-white" />
                        )}
                      </div>
                      <h2 className="mt-4 text-3xl font-black text-white">
                        {answerFeedback.correct ? "Correct!" : "Incorrect"}
                      </h2>
                      <p className="mt-2 text-sm font-black uppercase tracking-[0.18em] text-white/80">
                        The word is
                      </p>
                      <p className="mt-2 text-4xl font-black tracking-wide text-white">
                        {answerFeedback.word}
                      </p>
                    </div>
                  </div>
                )}
                <div className={`relative z-10 flex flex-wrap items-center justify-between gap-2 ${fullscreenActive ? "mb-2" : "mb-3"}`}>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#FDE68A]">
                      Candy Letter Match
                    </p>
                    <p className="mt-1 text-sm font-black text-white drop-shadow">
                      English · {grade} · {difficulty}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="rounded-xl border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-black text-white shadow-[0_8px_20px_rgba(0,0,0,0.16)] backdrop-blur sm:text-sm">
                      Mastery Test
                    </div>
                    <button
                      onClick={resetToMenu}
                      className="rounded-xl border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-black text-white shadow-[0_8px_20px_rgba(0,0,0,0.16)] backdrop-blur transition hover:bg-white/25 sm:text-sm"
                    >
                      Exit Game
                    </button>
                    {!demoMode && (
                      <button
                        type="button"
                        onClick={toggleFullscreen}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/25 bg-white/15 text-white shadow-[0_8px_20px_rgba(0,0,0,0.16)] backdrop-blur transition hover:bg-white/25"
                        title={fullscreenActive ? "Exit Fullscreen" : "Enter Fullscreen"}
                      >
                        {fullscreenActive ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="relative z-10 mb-3 h-4 overflow-hidden rounded-full border border-white/25 bg-black/25">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] via-[#DB2777] to-[#FB923C] transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className={`relative z-10 grid grid-cols-2 gap-1.5 sm:gap-2 ${fullscreenActive ? "mb-2" : "mb-3"}`}>
                  {[
                    { label: "Question", value: `${Math.min(progress + 1, modeTarget)}/${modeTarget}`, Icon: Star },
                    { label: "Correct", value: `${testCorrect}/${config.testTarget}`, Icon: Trophy },
                  ].map(({ label, value, Icon }) => (
                    <div
                      key={label}
                      className={`relative overflow-hidden rounded-2xl border-2 px-2 text-center shadow-[0_10px_24px_rgba(0,0,0,0.2)] ${label === "Time" && lowTime
                        ? "border-red-200 bg-gradient-to-b from-red-400 to-rose-600 animate-[letter-match-timer_0.9s_ease-in-out_infinite]"
                        : "border-white/35 bg-gradient-to-b from-white/30 to-white/10"
                        } ${fullscreenActive ? "py-1.5" : "py-2"}`}
                    >
                      <div className="relative flex items-center justify-center gap-1">
                        <Icon className="h-3.5 w-3.5 text-[#FDE68A]" />
                        <p className="text-[8px] font-black uppercase tracking-widest text-white/80 sm:text-[9px]">
                          {label}
                        </p>
                      </div>
                      <p className="relative mt-0.5 text-sm font-black text-white drop-shadow sm:text-lg">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center">
                  <div className={`relative w-full max-w-4xl overflow-hidden rounded-[1.6rem] border-4 border-[#FDE68A] bg-gradient-to-br from-[#7C3AED]/95 via-[#DB2777]/90 to-[#FB923C]/90 shadow-[inset_0_8px_30px_rgba(255,255,255,0.12),0_18px_55px_rgba(190,24,93,0.35)] ${fullscreenActive ? "p-3" : "p-4 sm:p-5"} ${feedback === "wrong" ? "animate-[letter-match-shake_0.55s_ease-in-out]" : ""}`}>
                    <div className="text-center">
                      <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FDE68A]">
                        Mastery Test
                      </p>
                      <h1 className={`${fullscreenActive ? "mt-1 text-2xl sm:text-3xl" : "mt-2 text-3xl sm:text-5xl"} font-black text-white`}>
                        Spell the Whole Word
                      </h1>
                      <p className={`${fullscreenActive ? "mt-1" : "mt-2"} text-sm font-bold text-white/75`}>
                        Question {Math.min(progress + 1, modeTarget)} / {modeTarget}
                      </p>
                    </div>

                    <div className={`relative mx-auto flex aspect-square w-full items-center justify-center overflow-hidden rounded-[2rem] border-4 border-white/35 bg-white shadow-[0_18px_45px_rgba(0,0,0,0.18)] ${fullscreenActive ? "mt-3 max-w-[170px] sm:max-w-[210px]" : "mt-5 max-w-[260px]"} ${feedback === "correct" ? "animate-[letter-match-pop_0.7s_ease-in-out]" : ""}`}>
                      {currentItem.imageUrl ? (
                        <img
                          src={currentItem.imageUrl}
                          alt={currentItem.imageKeyword || currentItem.word}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#FDE68A] via-[#FDBA74] to-[#FB7185] text-center">
                          <ImageIcon className="h-12 w-12 text-[#7C2D12]/70" />
                          <p className="mt-3 text-6xl font-black text-[#7C2D12]">
                            {currentItem.word[0]}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className={`${fullscreenActive ? "mt-3 gap-1.5" : "mt-5 gap-2 sm:gap-3"} flex flex-wrap justify-center`}>
                      {currentItem.word.split("").map((letter, index) => {
                        const revealed = revealedPositions.has(index);
                        const placedLetter = placedLetters[index];

                        return (
                          <button
                            key={`${letter}-${index}`}
                            type="button"
                            onClick={() => handleSlotClick(index)}
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={(event) => {
                              event.preventDefault();
                              handleDropOnSlot(index, event.dataTransfer.getData("text/plain"));
                            }}
                            className={`flex items-center justify-center rounded-2xl border-4 font-black transition ${fullscreenActive ? "h-11 min-w-[2.5rem] px-2 text-2xl sm:h-12 sm:min-w-[3rem]" : "h-14 min-w-[3rem] px-3 text-3xl sm:h-16 sm:min-w-[4rem] sm:text-4xl"} ${revealed
                              ? "border-[#FDE68A] bg-[#FACC15] text-[#78350F] shadow-[0_8px_0_rgba(120,53,15,0.3)]"
                              : placedLetter
                                ? "border-white bg-gradient-to-b from-[#93C5FD] to-[#2563EB] text-white shadow-[0_8px_0_rgba(30,64,175,0.35)]"
                                : "border-white/45 bg-white/15 text-white/45 shadow-[inset_0_2px_0_rgba(255,255,255,0.2)]"
                              }`}
                          >
                            {revealed ? letter : placedLetter?.letter || ""}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={checkCurrentSpelling}
                      disabled={!allBlanksFilled || !!feedback || !!answerFeedback}
                      className={`mx-auto flex w-full max-w-sm items-center justify-center rounded-2xl border-2 border-white/30 bg-gradient-to-r from-[#FACC15] via-[#FB923C] to-[#FB7185] px-5 text-base font-black text-white shadow-[0_14px_35px_rgba(251,146,60,0.36)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-55 ${fullscreenActive ? "mt-3 h-12" : "mt-5 h-14 py-3"}`}
                    >
                      SUBMIT ANSWER
                    </button>

                    <div className={`${fullscreenActive ? "mt-3" : "mt-5"}`}>
                      <p className={`${fullscreenActive ? "mb-2" : "mb-3"} text-xs font-black uppercase tracking-[0.2em] text-[#FDE68A]`}>
                        Letter Bank
                      </p>
                      <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
                        {letterBank.map((letter) => {
                          const used = !availableBankLetters.some((item) => item.id === letter.id);
                          const active = activeBankLetterId === letter.id;

                          return (
                            <button
                              key={letter.id}
                              type="button"
                              draggable={!used}
                              disabled={used || !!feedback}
                              onClick={() => handleBankLetterClick(letter)}
                              onDragStart={(event) => {
                                event.dataTransfer.setData("text/plain", letter.id);
                              }}
                              className={`${fullscreenActive ? "h-11 text-xl sm:h-12 sm:text-2xl" : "h-14 text-2xl sm:h-16 sm:text-3xl"} rounded-2xl border-4 font-black transition ${used
                                ? "border-white/10 bg-white/10 text-white/25"
                                : active
                                  ? "border-[#FDE68A] bg-[#FACC15] text-[#78350F] shadow-[0_0_0_4px_rgba(250,204,21,0.24),0_9px_0_rgba(120,53,15,0.28)]"
                                  : "border-white/45 bg-gradient-to-b from-[#FDE68A] via-[#FDBA74] to-[#FB7185] text-[#3B0764] shadow-[0_8px_0_rgba(120,53,15,0.28)] hover:-translate-y-1"
                                }`}
                            >
                              {letter.letter}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`relative flex flex-col bg-gradient-to-br from-[#5B21B6] via-[#BE185D] to-[#F97316] ${demoMode ? "rounded-[2rem] sm:rounded-[2.5rem]" : ""} ${demoMode && demoFullscreenActive ? "h-full max-h-[100dvh] min-h-0 overflow-y-auto p-3" : fullscreenActive ? "min-h-[calc(100dvh-0.5rem)] overflow-hidden p-2" : "min-h-[520px] overflow-hidden p-2 sm:min-h-[620px] sm:p-4"}`}>
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.24),transparent_24%),radial-gradient(circle_at_80%_70%,rgba(250,204,21,0.2),transparent_28%)]" />

                <div className={`relative z-10 shrink-0 rounded-[2rem] border-4 border-[#A78BFA] bg-gradient-to-r from-[#7C3AED]/80 via-[#DB2777]/70 to-[#FB923C]/70 shadow-[0_18px_55px_rgba(124,58,237,0.45)] ${demoMode && demoFullscreenActive ? "mb-2 p-3" : "mb-4 p-4"}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.25em] text-[#FDE68A]">
                        Letter Match
                      </p>
                      <p className="mt-1 text-sm font-black text-white drop-shadow">
                        English · {grade} · {difficulty}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="rounded-xl border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-black text-white shadow-[0_8px_20px_rgba(0,0,0,0.16)] backdrop-blur sm:text-sm">
                        {mode === "practice" ? "Practice" : "Mastery Test"}
                      </div>
                      <button onClick={resetToMenu} className="rounded-xl border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-black text-white shadow-[0_8px_20px_rgba(0,0,0,0.16)] backdrop-blur transition hover:bg-white/25 sm:text-sm">
                        Exit Game
                      </button>
                      {!demoMode && (
                        <button type="button" onClick={toggleFullscreen} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/25 bg-white/15 text-white shadow-[0_8px_20px_rgba(0,0,0,0.16)] backdrop-blur transition hover:bg-white/25">
                          {fullscreenActive ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 h-3 overflow-hidden rounded-full border border-white/20 bg-black/25">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#FACC15] via-[#FB7185] to-[#A78BFA] transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[
                      { label: "Score", value: score, Icon: Gem },
                      { label: "Correct", value: `${progress}/${config.practiceTarget}`, Icon: Trophy },
                      { label: "Time", value: `${secondsLeft}s`, Icon: Timer },
                    ].map(({ label, value, Icon }) => (
                      <div
                        key={label}
                        className={`relative overflow-hidden rounded-2xl border-2 px-2 py-2 text-center shadow-[0_10px_24px_rgba(0,0,0,0.2)] ${label === "Time" && lowTime
                          ? "border-red-200 bg-gradient-to-b from-red-400 to-rose-600 animate-[letter-match-timer_0.9s_ease-in-out_infinite]"
                          : "border-white/35 bg-gradient-to-b from-white/30 to-white/10"
                          }`}
                      >
                        <div className="relative flex items-center justify-center gap-1">
                          <Icon className="h-3.5 w-3.5 text-[#FDE68A]" />
                          <p className="text-[8px] font-black uppercase tracking-widest text-white/80 sm:text-[9px]">
                            {label}
                          </p>
                        </div>
                        <p className="relative mt-0.5 text-sm font-black text-white drop-shadow sm:text-lg">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {loading || !currentItem ? (
                  <div className="relative z-10 overflow-hidden rounded-[1.5rem] border-2 border-white/25 bg-[#1E0B4B]/70">
                    <ArcadeLoadingScreen isLight={false} />
                  </div>
                ) : (
                  <div className={`relative z-10 min-h-0 flex-1 ${demoMode && demoFullscreenActive ? "flex flex-col gap-2 overflow-visible" : `grid items-start ${visualFullscreenActive ? "gap-3" : "gap-4"}`}`}>
                    <div className={`relative overflow-visible ${demoMode && demoFullscreenActive ? "flex min-h-0 flex-1 items-center justify-center p-2" : "p-3"} ${feedback === "wrong" ? "animate-[letter-match-shake_0.55s_ease-in-out]" : "animate-[letter-match-slide_0.35s_ease-out]"}`}>
                      {feedback === "correct" &&
                        Array.from({ length: 16 }, (_, index) => (
                          <span
                            key={index}
                            className="pointer-events-none absolute h-3 w-2 rounded-full"
                            style={{
                              left: `${8 + ((index * 19) % 84)}%`,
                              top: `${-8 - (index % 4) * 8}px`,
                              background: ["#FACC15", "#FB7185", "#38BDF8", "#34D399", "#A78BFA"][index % 5],
                              animation: `letter-match-confetti ${1.8 + (index % 4) * 0.25}s ease-in ${index * 0.05}s`,
                            }}
                          />
                        ))}
                      {floatingScore && (
                        <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 rounded-full border-2 border-white/40 bg-emerald-400 px-5 py-2 text-xl font-black text-white shadow-[0_12px_30px_rgba(52,211,153,0.35)] animate-[letter-match-float-score_1s_ease-out_forwards]">
                          +{floatingScore}
                        </div>
                      )}

                      <div className={`mx-auto flex max-w-3xl flex-col items-center ${demoMode && demoFullscreenActive ? "" : "pt-4"}`}>
                        <div className={`relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[2rem] border-4 border-white/35 bg-white shadow-[0_18px_45px_rgba(0,0,0,0.18)] ${demoMode && demoFullscreenActive ? "max-w-[220px]" : "max-w-[280px]"} ${feedback === "correct" ? "animate-[letter-match-pop_0.7s_ease-in-out]" : ""}`}>
                          {currentItem.imageUrl ? (
                            <img
                              src={currentItem.imageUrl}
                              alt={currentItem.imageKeyword || currentItem.word}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#FDE68A] via-[#FDBA74] to-[#FB7185] text-center">
                              <ImageIcon className="h-12 w-12 text-[#7C2D12]/70" />
                              <p className="mt-3 text-6xl font-black text-[#7C2D12]">
                                {currentItem.word[0]}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className={`flex flex-wrap justify-center ${demoMode && demoFullscreenActive ? "mt-3 gap-2" : "mt-5 gap-2 sm:gap-3"}`}>
                          {currentItem.word.split("").map((letter, index) => {
                            const revealed = revealedPositions.has(index);
                            const placedLetter = placedLetters[index];

                            return (
                              <button
                                key={`${letter}-${index}`}
                                type="button"
                                onClick={() => handleSlotClick(index)}
                                onDragOver={(event) => event.preventDefault()}
                                onDrop={(event) => {
                                  event.preventDefault();
                                  handleDropOnSlot(index, event.dataTransfer.getData("text/plain"));
                                }}
                                className={`flex items-center justify-center rounded-2xl border-4 font-black transition ${demoMode && demoFullscreenActive ? "h-11 min-w-[2.8rem] px-2 text-2xl sm:h-12 sm:min-w-[3rem]" : "h-14 min-w-[3rem] px-3 text-3xl sm:h-16 sm:min-w-[4rem] sm:text-4xl"} ${revealed
                                  ? "border-[#FDE68A] bg-[#FACC15] text-[#78350F] shadow-[0_8px_0_rgba(120,53,15,0.3)]"
                                  : placedLetter
                                    ? "border-white bg-gradient-to-b from-[#93C5FD] to-[#2563EB] text-white shadow-[0_8px_0_rgba(30,64,175,0.35)]"
                                    : "border-white/45 bg-white/15 text-white/45 shadow-[inset_0_2px_0_rgba(255,255,255,0.2)]"
                                  }`}
                              >
                                {revealed ? letter : placedLetter?.letter || ""}
                              </button>
                            );
                          })}
                        </div>

                      </div>
                    </div>



                    <div className={demoMode && demoFullscreenActive ? "w-full shrink-0" : "w-full"}>
                      <div className={`rounded-[1.5rem] border-4 border-[#FDE68A]/75 bg-[#3B0764]/45 shadow-[inset_0_8px_24px_rgba(0,0,0,0.22)] ${demoMode && demoFullscreenActive ? "shrink-0 p-2" : "p-3"}`}>
                        <p className={`${demoMode && demoFullscreenActive ? "mb-2" : "mb-3"} text-xs font-black uppercase tracking-[0.2em] text-[#FDE68A]`}>
                          Letter Bank
                        </p>

                        <div className={`grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 ${demoMode && demoFullscreenActive ? "gap-1.5" : "gap-2"}`}>
                          {letterBank.map((letter) => {
                            const used = !availableBankLetters.some((item) => item.id === letter.id);
                            const active = activeBankLetterId === letter.id;

                            return (
                              <button
                                key={letter.id}
                                type="button"
                                draggable={!used}
                                disabled={used || !!feedback}
                                onClick={() => handleBankLetterClick(letter)}
                                onDragStart={(event) => {
                                  event.dataTransfer.setData("text/plain", letter.id);
                                }}
                                className={`${demoMode && demoFullscreenActive ? "h-11 text-xl sm:h-12 sm:text-2xl" : "h-14 text-2xl sm:h-16 sm:text-3xl"} rounded-2xl border-4 font-black transition ${used
                                  ? "border-white/10 bg-white/10 text-white/25"
                                  : active
                                    ? "border-[#FDE68A] bg-[#FACC15] text-[#78350F] shadow-[0_0_0_4px_rgba(250,204,21,0.24),0_9px_0_rgba(120,53,15,0.28)]"
                                    : "border-white/45 bg-gradient-to-b from-[#FDE68A] via-[#FDBA74] to-[#FB7185] text-[#3B0764] shadow-[0_8px_0_rgba(120,53,15,0.28)] hover:-translate-y-1"
                                  }`}
                              >
                                {letter.letter}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className={`mt-3 rounded-[1.5rem] border-4 border-[#FDE68A]/75 bg-[#3B0764]/45 p-3 shadow-[inset_0_8px_24px_rgba(0,0,0,0.22)] ${demoMode && demoFullscreenActive ? "max-h-[110px] shrink-0 overflow-y-auto" : ""}`}>
                        <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/70">
                          Correct History
                        </p>

                        {recentWords.length === 0 ? (
                          <p className="text-sm font-bold text-white/65">
                            No completed words yet.
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {recentWords.slice(0, 20).map((word, index) => (
                              <div
                                key={`${word}-${index}`}
                                className="flex shrink-0 items-center gap-2 rounded-full border border-emerald-200/40 bg-emerald-400/15 px-3 py-2 text-sm font-black tracking-wide text-emerald-100"
                              >
                                {word}
                                <CheckCircle2 className="h-4 w-4 text-emerald-200" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {showPageChrome && (
          <div className={`mt-8 rounded-[2rem] border p-5 ${palette.panel}`}>
            <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-[#C4B5FD]">
              More Games
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-7">
              {moreGames.map((game) => {
                const Icon = game.icon;

                return (
                  <button
                    key={game.title}
                    disabled={!game.available}
                    onClick={() => {
                      if (game.available && !game.current) {
                        navigate(game.path);
                      }
                    }}
                    className={`rounded-[1.3rem] border p-3 text-left transition sm:rounded-[1.5rem] sm:p-4 ${game.current
                      ? "border-[#8B5CF6]/50 bg-[#8B5CF6]/20 hover:-translate-y-1"
                      : game.available
                        ? isLight
                          ? "border-[#eee8ff] bg-white hover:-translate-y-1 hover:bg-[#faf8ff]"
                          : "border-white/10 bg-white/[0.07] hover:-translate-y-1 hover:bg-white/10"
                        : isLight
                          ? "border-[#eee8ff] bg-[#faf8ff] opacity-60"
                          : "border-white/10 bg-white/5 opacity-50"
                      }`}
                  >
                    <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-2xl ${isLight ? "bg-[#f6f1ff]" : "bg-white/10"}`}>
                      <Icon className={`h-6 w-6 ${isLight ? "text-primary" : "text-white"}`} />
                    </div>

                    <p className={`text-sm font-black ${palette.title}`}>
                      {game.title}
                    </p>

                    <p className={`mt-1 text-xs font-bold ${palette.muted}`}>
                      {game.status}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
