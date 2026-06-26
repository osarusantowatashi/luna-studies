import { useEffect, useMemo, useRef, useState } from "react";
import {
  Zap,
  Sparkles,
  Brain,
  Flame,
  Gem,
  Crown,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Maximize2,
  Minimize2,
  Car,
  Search,
  Headphones,
  Blocks,
  XCircle,
  Trophy,
  CheckCircle2,
  Star,
  Timer,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ArcadeLoadingScreen from "@/components/games/ArcadeLoadingScreen";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import {
  clearGameSession,
  loadGameSession,
  saveGameSession,
} from "@/lib/arcadeResume";
import {
  GameVocabularyItem,
  loadGameVocabularyItems,
} from "@/lib/gameVocabulary";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Pair = {
  pair_id?: number;
  left: string;
  right: string;
  vocab_word?: string;
  image_keyword?: string;
  image_url?: string;
};

type Card = {
  id: string;
  pairId: number;
  pairKey: string;
  text: string;
  imageKeyword?: string;
  imageUrl?: string;
  flipped: boolean;
  matched: boolean;
};

type PlayedPair = {
  pairKey: string;
  left: string;
  right: string;
  imageKeyword?: string;
};

type GameDemoProps = {
  demoMode?: boolean;
  fixedGrade?: string;
  fixedDifficulty?: string;
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

const shuffle = <T,>(array: T[]) => [...array].sort(() => Math.random() - 0.5);

const grades = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"];
const difficultyOrder = ["Easy", "Medium", "Hard", "Advanced"];

const FALLBACK_IMAGE =
  "https://images.pexels.com/photos/256417/pexels-photo-256417.jpeg";
const MEMORY_FLIP_GAME_KEY = "memory_flip";
const MEMORY_FLIP_MASTERY_PASS_RATE = 0.8;
const getPassMarkPercent = (rate: number) => Math.round(rate * 100);

const getTimeLimit = (pairCount: number, difficulty: string) => {
  if (difficulty === "Easy") return pairCount * 18;
  if (difficulty === "Medium") return pairCount * 14;
  return pairCount * 10;
};

const getPairCountByDifficulty = (difficulty: string) => {
  if (difficulty === "Easy") return 6;
  if (difficulty === "Medium") return 8;
  if (difficulty === "Hard") return 10;
  return 12;
};

const getHighestDifficulty = (first?: string | null, second?: string | null) => {
  const firstDifficulty = first || "Easy";
  const secondDifficulty = second || "Easy";

  return difficultyOrder.indexOf(firstDifficulty) >=
    difficultyOrder.indexOf(secondDifficulty)
    ? firstDifficulty
    : secondDifficulty;
};

const buildMemoryFlipPairsFromVocabulary = ({
  items,
  languagePair,
  grade,
}: {
  items: GameVocabularyItem[];
  languagePair: string;
  grade: string;
}) =>
  items
    .map((item, index): (Pair & { pairKey: string; questionSet: any }) | null => {
      const en = String(item.en || "").trim();
      const zh = String(item.zh || "").trim();
      const ja = String(item.ja || "").trim();
      const imageUrl = String(item.image_url || "").trim();
      const imageKeyword = String(item.image_keyword || item.en || "").trim();

      if (!en || !zh || !ja || !imageUrl) return null;

      const [left, right] =
        languagePair === "zh_ja"
          ? [zh, ja]
          : languagePair === "en_ja"
            ? [en, ja]
            : [en, zh];

      return {
        pair_id: index + 1,
        left,
        right,
        vocab_word: en,
        image_keyword: imageKeyword,
        image_url: imageUrl,
        pairKey: `${languagePair}_${grade}_${left}_${right}`,
        questionSet: {
          source: "shared_vocabulary",
          id: item.id,
          grade,
          language_pair: languagePair,
        },
      };
    })
    .filter(Boolean) as (Pair & { pairKey: string; questionSet: any })[];

const getCardGridClass = (cardCount: number) => {
  if (cardCount <= 12) return "grid-cols-3 sm:grid-cols-4";
  if (cardCount <= 16) return "grid-cols-4";
  if (cardCount <= 20) return "grid-cols-4 gap-1 sm:grid-cols-5 sm:gap-1.5";
  return "grid-cols-4 gap-1 sm:grid-cols-6 sm:gap-1.5";
};

const getCardSizeClass = (cardCount: number) => {
  if (cardCount <= 12) {
    return "h-[92px] w-[92px] min-[390px]:h-[108px] min-[390px]:w-[108px] sm:h-[148px] sm:w-[148px] lg:h-[158px] lg:w-[158px]";
  }

  if (cardCount <= 20) {
    return "h-[68px] w-[68px] min-[390px]:h-[82px] min-[390px]:w-[82px] sm:h-[116px] sm:w-[116px] lg:h-[124px] lg:w-[124px] xl:h-[132px] xl:w-[132px]";
  }

  return "h-[62px] w-[62px] min-[390px]:h-[76px] min-[390px]:w-[76px] sm:h-[102px] sm:w-[102px] lg:h-[110px] lg:w-[110px] xl:h-[118px] xl:w-[118px]";
};

const getCardImageClass = (cardCount: number) => {
  if (cardCount <= 12) return "h-[58px] w-[58px] min-[390px]:h-[68px] min-[390px]:w-[68px] sm:h-[92px] sm:w-[92px]";
  if (cardCount <= 20) return "h-[40px] w-[40px] min-[390px]:h-[50px] min-[390px]:w-[50px] sm:h-[70px] sm:w-[70px] lg:h-[76px] lg:w-[76px]";
  return "h-[34px] w-[34px] min-[390px]:h-[42px] min-[390px]:w-[42px] sm:h-[58px] sm:w-[58px] lg:h-[64px] lg:w-[64px]";
};

const getCardTextClass = (cardCount: number) => {
  if (cardCount <= 12) return "text-[13px] sm:text-[15px]";
  if (cardCount <= 20) return "text-[11px] min-[390px]:text-[12px] sm:text-[15px]";
  return "text-[10px] min-[390px]:text-[11px] sm:text-[15px]";
};

const MemoryCardImage = ({
  src,
  alt,
  className,
}: {
  src?: string;
  alt: string;
  className: string;
}) => {
  const [displaySrc, setDisplaySrc] = useState(FALLBACK_IMAGE);

  useEffect(() => {
    if (!src) {
      setDisplaySrc(FALLBACK_IMAGE);
      return;
    }

    setDisplaySrc(src);
  }, [src]);

  return (
    <img
      src={displaySrc}
      alt={alt}
      className={className}
      onError={(event) => {
        event.currentTarget.src = FALLBACK_IMAGE;
      }}
    />
  );
};

type ArcadeDropdownProps = {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  isLight: boolean;
  unlockedDifficulty: string;
  lockedOptions?: string[];
};

const ArcadeDropdown = ({
  value,
  options,
  onChange,
  isLight,
  unlockedDifficulty,
  lockedOptions = [],
}: ArcadeDropdownProps) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handleMouseDown = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [open]);

  return (
    <div
      ref={dropdownRef}
      className="relative"
    >
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          setOpen((prev) => !prev);
        }}
        className={`flex h-14 w-full items-center justify-between rounded-[1.4rem] border px-5 text-sm font-black outline-none transition ${isLight
          ? "border-[#eee8ff] bg-white text-primary shadow-[0_8px_25px_rgba(66,56,120,0.06)]"
          : "border-white/10 bg-[#0D1B2E] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          }`}
      >
        <span>{value}</span>
        <span className="text-xs opacity-60">▾</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 8, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            className={`absolute left-0 right-0 top-full z-[9999] mt-2 max-h-[260px] overflow-y-auto rounded-[1.4rem] border p-2 ${isLight
              ? "border-[#eee8ff] bg-white shadow-[0_18px_45px_rgba(66,56,120,0.15)]"
              : "border-white/10 bg-[#0D1B2E] shadow-[0_18px_45px_rgba(0,0,0,0.45)]"
              }`}
          >
            {options.map((option) => {
              const diffName = option.split(" · ")[0];
              const difficultyOrder = ["Easy", "Medium", "Hard", "Advanced"];

              const locked =
                lockedOptions.includes(option) ||
                difficultyOrder.includes(diffName) &&
                difficultyOrder.indexOf(diffName) >
                difficultyOrder.indexOf(unlockedDifficulty);

              const active = value === option || option.startsWith(`${value} ·`);

              return (
                <button
                  key={option}
                  type="button"
                  disabled={locked}
                  onClick={(event) => {
                    event.preventDefault();

                    if (locked) return;

                    onChange(option);
                    setOpen(false);
                  }}
                  className={`flex min-h-11 w-full items-center rounded-[1rem] px-4 py-3 text-left text-sm font-black transition ${locked
                    ? isLight
                      ? "cursor-not-allowed bg-[#faf8ff] text-primary/75"
                      : "cursor-not-allowed bg-white/[0.06] text-white/75"
                    : active
                      ? "bg-[#8B5CF6]/20 text-[#C4B5FD]"
                      : isLight
                        ? "text-primary hover:bg-[#faf8ff]"
                        : "text-white hover:bg-white/10"
                    }`}
                >
                  <div className="flex w-full items-center justify-between gap-3">
                    <span>{option}</span>

                    {locked && (
                      <span className="text-[10px] font-black uppercase opacity-70">
                        Locked
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function MemoryFlip({
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

  const [languagePair, setLanguagePair] = useState("zh_en");
  const [grade, setGrade] = useState(fixedGrade);
  const [difficulty, setDifficulty] = useState(fixedDifficulty);
  const [unlockedDifficulty, setUnlockedDifficulty] = useState("Easy");
  const [vocabularyPairCount, setVocabularyPairCount] = useState(0);
  const [vocabularyLoading, setVocabularyLoading] = useState(false);

  const [cards, setCards] = useState<Card[]>([]);
  const [masteryPool, setMasteryPool] = useState<PlayedPair[]>([]);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [flipLocked, setFlipLocked] = useState(false);
  const [wrongPairIds, setWrongPairIds] = useState<string[]>([]);
  const [comboPop, setComboPop] = useState<number | null>(null);

  const [moves, setMoves] = useState(0);
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [timeUp, setTimeUp] = useState(false);

  const [gameStarted, setGameStarted] = useState(false);
  const [savedSession, setSavedSession] = useState<any | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showMasteryTest, setShowMasteryTest] = useState(false);
  const [masteryQuestions, setMasteryQuestions] = useState<any[]>([]);
  const [masteryTotal, setMasteryTotal] = useState(10);
  const [masteryIndex, setMasteryIndex] = useState(0);
  const [masteryCorrect, setMasteryCorrect] = useState(0);
  const [masteryResult, setMasteryResult] = useState<{
    passed: boolean;
    correct: number;
    nextDifficulty: "Medium" | "Hard" | "Advanced" | null;
  } | null>(null);
  const [level, setLevel] = useState(1);

  const [answerFeedback, setAnswerFeedback] = useState<{
    type: "correct" | "wrong";
    correctAnswer?: string;
  } | null>(null);

  const [masteryAnswerLocked, setMasteryAnswerLocked] = useState(false);

  const [soundOn, setSoundOn] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">(
    () => (localStorage.getItem("arcade_theme") as "dark" | "light") || "dark"
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobileFullscreen, setIsMobileFullscreen] = useState(false);

  const gameWindowRef = useRef<HTMLDivElement | null>(null);
  const loadRequestRef = useRef(0);

  const pairCount = getPairCountByDifficulty(difficulty);

  const [secondsLeft, setSecondsLeft] = useState(
    getTimeLimit(pairCount, difficulty)
  );

  const isLight = theme === "light";
  const menuSelectedClass = isLight
    ? "border-[#6D28D9] bg-[#EDE9FE] text-[#3B0764] shadow-[0_10px_28px_rgba(109,40,217,0.18)]"
    : "border-[#A78BFA] bg-[#7C3AED]/35 text-white shadow-[0_10px_28px_rgba(124,58,237,0.25)]";
  const menuSelectedCardClass = isLight
    ? "border-[#6D28D9] bg-[#EDE9FE] shadow-[0_16px_42px_rgba(109,40,217,0.18)]"
    : "border-[#A78BFA] bg-[#7C3AED]/30 shadow-[0_16px_42px_rgba(124,58,237,0.24)]";

  const fullscreenActive = isFullscreen || isMobileFullscreen;
  const showPageChrome = !fullscreenActive && !demoMode;
  const publicLang =
    typeof window !== "undefined" && window.location.pathname.startsWith("/zh")
      ? "zh"
      : typeof window !== "undefined" && window.location.pathname.startsWith("/ja")
        ? "ja"
        : "en";

  const themeClass = {
    page: isLight ? "bg-white" : "bg-[#071426]",
    topBar: isLight
      ? "border-[#eee8ff] bg-white text-primary shadow-[0_18px_55px_rgba(66,56,120,0.08)]"
      : "border-white/10 bg-white/5 text-white backdrop-blur-xl",
    button: isLight
      ? "border-[#eee8ff] bg-white text-primary shadow-[0_8px_25px_rgba(66,56,120,0.08)] hover:bg-[#faf8ff]"
      : "border-white/10 bg-white/5 text-white hover:bg-white/10",
    gameWindow: isLight
      ? "border-[#eee8ff] bg-white shadow-[0_25px_80px_rgba(66,56,120,0.10)]"
      : "border-white/10 bg-[#071426] shadow-[0_30px_100px_rgba(0,0,0,0.45)]",
    panel: isLight
      ? "border-[#eee8ff] bg-white shadow-[0_18px_55px_rgba(66,56,120,0.08)]"
      : "border-white/10 bg-white/5 backdrop-blur-xl",
    softPanel: isLight
      ? "border-[#eee8ff] bg-[#faf8ff]"
      : "border-white/10 bg-white/5",
    title: isLight ? "text-primary" : "text-white",
    text: isLight ? "text-primary/60" : "text-slate-300",
    muted: isLight ? "text-primary/45" : "text-slate-400",
    hudBox: isLight ? "bg-[#faf8ff]" : "bg-black/20",
    cardFront: isLight
      ? "border-[#eee8ff] bg-white shadow-[0_12px_30px_rgba(66,56,120,0.10)]"
      : "border-white/10 bg-white/10 backdrop-blur-xl",
    cardBack: isLight
      ? "border-[#C4B5FD]/80 bg-gradient-to-br from-[#F5F3FF] via-[#EDE9FE] to-[#DDD6FE]"
      : "border-[#C4B5FD]/60 bg-gradient-to-br from-[#1E1B4B] via-[#312E81] to-[#4C1D95] shadow-[inset_0_2px_0_rgba(255,255,255,0.16)]",
  };

  useEffect(() => {
    localStorage.setItem("arcade_theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!demoMode) return;
    onDemoFullscreenChange?.(fullscreenActive);
  }, [demoMode, fullscreenActive, onDemoFullscreenChange]);

  const languageLabel =
    languagePair === "zh_en"
      ? "Chinese ↔ English"
      : languagePair === "zh_ja"
        ? "Chinese ↔ Japanese"
        : "English ↔ Japanese";

  const moreGames = [
    { title: "Memory Flip", icon: Brain, available: true, current: true, status: "Available", path: "/memory-flip" },
    { title: "Word Search", icon: Search, available: true, current: false, status: "Available", path: "/word-search" },
    { title: "Letter Match", icon: Gem, available: true, current: false, status: "Available", path: "/letter-match" },
    { title: "Word Drive", icon: Car, available: false, current: false, status: "Coming Soon", path: "#" },
    { title: "Grammar Runner", icon: Flame, available: false, current: false, status: "Coming Soon", path: "#" },
    { title: "Listening Challenge", icon: Headphones, available: false, current: false, status: "Coming Soon", path: "#" },
    { title: "CAT4 Patterns", icon: Blocks, available: false, current: false, status: "Coming Soon", path: "#" },
  ];

  const soundMap = useMemo(() => {
    return {
      flip: new Audio("/sounds/card-flip.mp3"),
      match: new Audio("/sounds/success.mp3"),
      correct: new Audio("/sounds/success.mp3"),
      wrong: new Audio("/sounds/time-up.mp3"),
      stage: new Audio("/sounds/mastery-test.mp3"),
      timeUp: new Audio("/sounds/time-up.mp3"),
    };
  }, []);

  const playGameSound = (sound: keyof typeof soundMap, volume = 0.45) => {
    if (!soundOn) return;

    const audio = soundMap[sound];
    audio.pause();
    audio.currentTime = 0;
    audio.volume = volume;
    audio.play().catch(() => { });
  };

  const matchedCount = useMemo(
    () => cards.filter((card) => card.matched).length / 2,
    [cards]
  );

  const totalPairs = cards.length / 2;
  const isWin = !loading && totalPairs > 0 && matchedCount === totalPairs;
  const isGameEnded = isWin || timeUp;

  useEffect(() => {
    if (!gameStarted || loading || errorMsg || isGameEnded || showMasteryTest) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          playGameSound("timeUp", 0.45);
          setTimeUp(true);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, loading, errorMsg, isGameEnded, showMasteryTest]);

  useEffect(() => {
    if (demoMode) {
      setLanguagePair("zh_en");
      setGrade("Grade 1");
      setDifficulty("Easy");
      setUnlockedDifficulty("Easy");
      loadVocabularyPool();
      return;
    }

    loadProgress();
    loadVocabularyPool();
  }, [languagePair, grade, demoMode, fixedGrade, fixedDifficulty]);

  useEffect(() => {
    if (demoMode || disableResume) return;

    setSavedSession(loadGameSession(MEMORY_FLIP_GAME_KEY));
  }, [demoMode, disableResume]);

  useEffect(() => {
    if (!isWin || showResultModal || showMasteryTest) return;

    if (demoMode) {
      playGameSound("stage", 0.25);
      onDemoComplete?.();
      setShowResultModal(true);
      return;
    }

    if (level >= 5) {
      generateMasteryTest();
    } else {
      playGameSound("stage", 0.25);
      const nextLevel = level + 1;

      setCards([]);
      setSelectedCards([]);
      setLoading(true);
      setLevel(nextLevel);

      void loadGame({
        selectedLanguagePair: languagePair,
        selectedGrade: grade,
        selectedDifficulty: difficulty,
        selectedPairCount: getPairCountByDifficulty(difficulty),
      });
    }
  }, [isWin, showResultModal, showMasteryTest, level, languagePair, grade, difficulty]);

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
    if (!masteryResult) return;

    const previousOverflow = document.body.style.overflow;
    const previousPosition = document.body.style.position;
    const previousWidth = document.body.style.width;
    const previousRootOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.body.style.position = "relative";
    document.body.style.width = "100%";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.position = previousPosition;
      document.body.style.width = previousWidth;
      document.documentElement.style.overflow = previousRootOverflow;
    };
  }, [masteryResult]);

  const toggleFullscreen = async () => {
    if (demoMode) return;
    if (!gameWindowRef.current) return;

    const isMobile =
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
      window.innerWidth < 768;

    if (isMobileFullscreen || isMobile) {
      setIsMobileFullscreen((prev) => !prev);
      return;
    }

    if (!document.fullscreenElement) {
      await gameWindowRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  const findGameQuestion = async (
    selectedLanguagePair: string,
    selectedGrade: string,
    minimumPairs = 1
  ) => {
    if (!demoMode) {
      const { items } = await loadGameVocabularyItems({
        supabase,
        grade: selectedGrade,
      });
      const sharedPairs = shuffle(
        buildMemoryFlipPairsFromVocabulary({
          items,
          languagePair: selectedLanguagePair,
          grade: selectedGrade,
        })
      );

      if (sharedPairs.length >= minimumPairs) {
        return {
          pairs: sharedPairs,
          usedGrade: selectedGrade,
        };
      }
    }

    // TODO: Temporary legacy fallback until shared vocabulary is fully approved live.
    const questionTable = demoMode ? "public_demo_questions" : "game_questions";
    const buildQuery = (language: string) =>
      supabase
        .from(questionTable)
        .select("*")
        .eq("game_type", "memory_flip")
        .eq("language_pair", language)
        .eq("grade", demoMode ? "Grade 1" : selectedGrade);

    let query = buildQuery(selectedLanguagePair);

    if (!demoMode) {
      query = query.order("created_at", { ascending: false });
    }

    let { data, error } = await query;

    if (demoMode && (!data || data.length === 0) && selectedLanguagePair !== "zh_en") {
      const fallbackResult = await buildQuery("zh_en");
      data = fallbackResult.data;
      error = fallbackResult.error;
    }

    if (!error && data && data.length > 0) {
      const allAvailablePairs = data.flatMap((questionSet) => {
        const pairs: Pair[] = questionSet.question_data?.pairs || [];
        const questionLanguagePair =
          questionSet.language_pair || selectedLanguagePair;

        return pairs.map((pair) => {
          const pairKey = `${questionLanguagePair}_${selectedGrade}_${pair.left}_${pair.right}`;

          return {
            ...pair,
            pairKey,
            questionSet,
          };
        });
      });

      if (allAvailablePairs.length > 0) {
        return {
          pairs: demoMode ? allAvailablePairs : shuffle(allAvailablePairs),
          usedGrade: selectedGrade,
        };
      }
    }

    return {
      pairs: [],
      usedGrade: null,
    };
  };

  const preloadImages = async (imageUrls: string[]) => {
    await Promise.all(
      imageUrls.map(
        (url) =>
          new Promise<void>((resolve) => {
            if (!url) {
              resolve();
              return;
            }

            let resolved = false;
            const finish = () => {
              if (resolved) return;
              resolved = true;
              clearTimeout(timeout);
              resolve();
            };
            const timeout = setTimeout(finish, 6000);
            const img = new Image();
            img.src = url;
            img.onload = finish;
            img.onerror = finish;
          })
      )
    );
  };

  const loadVocabularyPool = async () => {
    setVocabularyLoading(true);

    const questionTable = demoMode ? "public_demo_questions" : "game_questions";
    const queryGrade = demoMode ? "Grade 1" : grade;

    if (!demoMode) {
      const { items } = await loadGameVocabularyItems({
        supabase,
        grade: queryGrade,
      });
      const sharedPairs = buildMemoryFlipPairsFromVocabulary({
        items,
        languagePair,
        grade: queryGrade,
      });

      if (sharedPairs.length > 0) {
        setVocabularyPairCount(sharedPairs.length);
        setVocabularyLoading(false);
        return;
      }
    }

    // TODO: Temporary legacy fallback until shared vocabulary is fully approved live.
    const buildQuery = (selectedLanguagePair: string) =>
      supabase
        .from(questionTable)
        .select("language_pair, question_data")
        .eq("game_type", "memory_flip")
        .eq("language_pair", selectedLanguagePair)
        .eq("grade", queryGrade);

    let query = buildQuery(languagePair);

    let { data } = await query;

    if (demoMode && (!data || data.length === 0) && languagePair !== "zh_en") {
      const fallbackResult = await buildQuery("zh_en");
      data = fallbackResult.data;
    }

    const allPairs =
      data?.flatMap((set) => set.question_data?.pairs || []) || [];

    setVocabularyPairCount(demoMode ? Math.min(allPairs.length, maxDemoPairs) : allPairs.length);
    setVocabularyLoading(false);
  };

  const loadProgress = async () => {
    if (demoMode) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("student_memory_flip_progress")
      .select("unlocked_difficulty")
      .eq("student_id", user.id)
      .eq("language_pair", languagePair)
      .eq("grade", grade)
      .maybeSingle();

    if (!data) {
      setUnlockedDifficulty("Easy");
      setDifficulty("Easy");
      return;
    }

    const currentUnlockedDifficulty = data.unlocked_difficulty || "Easy";

    setUnlockedDifficulty(currentUnlockedDifficulty);
    const difficultyOrder = ["Easy", "Medium", "Hard", "Advanced"];

    setDifficulty((prev) => {
      const prevIndex = difficultyOrder.indexOf(prev);
      const unlockedIndex = difficultyOrder.indexOf(currentUnlockedDifficulty);

      if (prevIndex > unlockedIndex) {
        return currentUnlockedDifficulty;
      }

      return prev || "Easy";
    });
  };

  const clearSavedSession = () => {
    clearGameSession(MEMORY_FLIP_GAME_KEY);
    setSavedSession(null);
  };

  const saveCurrentSession = () => {
    if (demoMode || disableResume) return;

    if (
      !gameStarted ||
      cards.length === 0 ||
      isGameEnded ||
      showMasteryTest ||
      showResultModal
    ) {
      return;
    }

    const session = {
      languagePair,
      grade,
      difficulty,
      unlockedDifficulty,
      cards,
      masteryPool,
      moves,
      combo,
      score,
      secondsLeft,
      level,
    };

    saveGameSession(MEMORY_FLIP_GAME_KEY, session);
    setSavedSession(session);
  };

  const resumeSavedSession = async () => {
    if (demoMode || disableResume) return;

    if (!savedSession) return;

    const resumeRequestId = loadRequestRef.current + 1;
    loadRequestRef.current = resumeRequestId;
    const restoredCards = savedSession.cards || [];

    setLanguagePair(savedSession.languagePair || "zh_en");
    setGrade(savedSession.grade || "Grade 1");
    setDifficulty(savedSession.difficulty || "Easy");
    setUnlockedDifficulty(savedSession.unlockedDifficulty || "Easy");
    setCards(restoredCards);
    setMasteryPool(savedSession.masteryPool || []);
    setSelectedCards([]);
    setMoves(savedSession.moves || 0);
    setCombo(savedSession.combo || 0);
    setScore(savedSession.score || 0);
    setSecondsLeft(
      savedSession.secondsLeft ||
      getTimeLimit(
        getPairCountByDifficulty(savedSession.difficulty || "Easy"),
        savedSession.difficulty || "Easy"
      )
    );
    setLevel(savedSession.level || 1);
    setErrorMsg("");
    setTimeUp(false);
    setLoading(true);
    setShowResultModal(false);
    setShowMasteryTest(false);
    setGameStarted(true);

    if (!demoMode) {
      const isMobile =
        /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
        window.innerWidth < 768;

      if (isMobile) {
        setIsMobileFullscreen(true);
      } else {
        try {
          await gameWindowRef.current?.requestFullscreen();
        } catch {
          // Browsers can block fullscreen unless the gesture is accepted.
        }
      }
    }

    await preloadImages(
      restoredCards.map((card: Card) => card.imageUrl).filter(Boolean) as string[]
    );

    if (loadRequestRef.current !== resumeRequestId) return;

    setLoading(false);
    clearSavedSession();
  };

  const startGame = async () => {
    if (vocabularyLoading || loading) return;

    if (!demoMode && !disableResume) {
      clearSavedSession();
    }

    if (!demoMode) {
      const isMobile =
        /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
        window.innerWidth < 768;

      if (isMobile) {
        setIsMobileFullscreen(true);
      } else {
        try {
          await gameWindowRef.current?.requestFullscreen();
        } catch {
          // Browsers can block fullscreen unless the gesture is accepted.
        }
      }
    }

    setGameStarted(true);
    setMasteryPool([]);
    setLevel(1);

    await loadGame({
      selectedLanguagePair: demoMode ? "zh_en" : languagePair,
      selectedGrade: demoMode ? "Grade 1" : grade,
      selectedDifficulty: demoMode ? "Easy" : difficulty,
      selectedPairCount: getPairCountByDifficulty(demoMode ? "Easy" : difficulty),
    });
  };

  const loadGame = async ({
    selectedLanguagePair = languagePair,
    selectedGrade = grade,
    selectedDifficulty = difficulty,
    selectedPairCount = getPairCountByDifficulty(selectedDifficulty),
  } = {}) => {
    const loadRequestId = loadRequestRef.current + 1;
    loadRequestRef.current = loadRequestId;
    const isCurrentLoad = () => loadRequestRef.current === loadRequestId;

    setLoading(true);
    setCards([]);
    setSelectedCards([]);
    setErrorMsg("");
    setTimeUp(false);
    setShowResultModal(false);
    setMasteryResult(null);

    const { pairs: rawPairs, usedGrade } = await findGameQuestion(
      selectedLanguagePair,
      selectedGrade,
      selectedPairCount
    );

    if (!isCurrentLoad()) return;

    const approvedImageMap = new Map<string, string>();
    const reserveCount = demoMode
      ? Math.min(rawPairs.length, maxDemoPairs)
      : Math.min(rawPairs.length, selectedPairCount * 3);
    const selectedRawPairs = rawPairs.slice(0, reserveCount);
    const missingImageLookupValues = Array.from(
      new Set(
        selectedRawPairs
          .filter((pair: any) => !pair.image_url)
          .flatMap((pair: any) => [
            pair.image_keyword,
            pair.vocab_word,
            pair.left,
            pair.right,
          ])
          .flatMap((value) => {
            const trimmed = String(value || "").trim();

            if (!trimmed) return [];

            const lower = trimmed.toLowerCase();
            return lower === trimmed ? [trimmed] : [trimmed, lower];
          })
      )
    );

    if (missingImageLookupValues.length > 0) {
      const imageColumns = ["keyword", "vocab_word", "left_text", "right_text"];
      const imageResults = await Promise.all(
        imageColumns.map((column) =>
          supabase
            .from("vocab_images")
            .select("keyword, vocab_word, left_text, right_text, image_url, status")
            .eq("status", "approved")
            .in(column, missingImageLookupValues)
        )
      );

      if (!isCurrentLoad()) return;

      imageResults.forEach(({ data }) => {
        (data || []).forEach((img) => {
          [img.keyword, img.vocab_word, img.left_text, img.right_text].forEach((value) => {
            if (value) {
              approvedImageMap.set(String(value).trim().toLowerCase(), img.image_url);
            }
          });
        });
      });
    }

    const pairs = selectedRawPairs
      .map((pair: any) => {
        if (pair.image_url && !demoMode) {
          return pair;
        }

        const candidates = [
          pair.image_keyword,
          pair.vocab_word,
          pair.left,
          pair.right,
        ].map((v) => String(v || "").trim().toLowerCase());

        return {
          ...pair,
          image_url:
            pair.image_url ||
            candidates.map((key) => approvedImageMap.get(key)).find(Boolean) ||
            null,
        };
      })
      .filter((pair: any) => pair.image_url)
      .slice(0, selectedPairCount);

    if (pairs.length < selectedPairCount || !usedGrade) {
      setCards([]);
      setErrorMsg(
        `Not enough approved ${selectedGrade} ${selectedDifficulty} vocabulary pairs yet. Please ask admin to approve or generate more pairs.`
      );
      setLoading(false);
      return;
    }

    const currentPlayedPairs: PlayedPair[] = pairs.map((pair: any) => ({
      pairKey: pair.pairKey,
      left: pair.left,
      right: pair.right,
      imageKeyword: pair.image_keyword,
    }));

    const newCards: Card[] = shuffle(
      pairs.flatMap((pair: any, index: number) => {
        const pairKey = `${selectedLanguagePair}_${usedGrade || selectedGrade}_${pair.left}_${pair.right}`;

        return [
          {
            id: `${index}-left`,
            pairId: index,
            pairKey,
            text: pair.left,
            imageKeyword: pair.image_keyword,
            imageUrl: pair.image_url,
            flipped: false,
            matched: false,
          },
          {
            id: `${index}-right`,
            pairId: index,
            pairKey,
            text: pair.right,
            imageKeyword: pair.image_keyword,
            imageUrl: pair.image_url,
            flipped: false,
            matched: false,
          },
        ];
      })
    );

    const imageUrls = pairs.map((pair: any) => pair.image_url).filter(Boolean) as string[];

    await preloadImages(imageUrls);

    if (!isCurrentLoad()) return;

    setMasteryPool((prev) => {
      const map = new Map(prev.map((pair) => [pair.pairKey, pair]));

      currentPlayedPairs.forEach((pair) => {
        map.set(pair.pairKey, pair);
      });

      return Array.from(map.values());
    });
    setCards(newCards);
    setSelectedCards([]);
    setMoves(0);
    setCombo(0);
    setScore(0);
    setSecondsLeft(getTimeLimit(selectedPairCount, selectedDifficulty));
    setLoading(false);
  };

  const saveProgress = async ({
    passed,
    levelReached,
  }: {
    passed: boolean;
    levelReached: number;
  }) => {
    if (demoMode || disableProgressSaving) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: existingProgress } = await supabase
      .from("student_memory_flip_progress")
      .select("unlocked_difficulty, highest_level, total_wins, total_losses, streak")
      .eq("student_id", user.id)
      .eq("language_pair", languagePair)
      .eq("grade", grade)
      .maybeSingle();

    const storedUnlocked = existingProgress?.unlocked_difficulty || unlockedDifficulty;
    let earnedDifficulty: "Medium" | "Hard" | "Advanced" | null = null;

    if (passed && !disableUnlocking) {
      if (difficulty === "Easy") earnedDifficulty = "Medium";
      else if (difficulty === "Medium") earnedDifficulty = "Hard";
      else if (difficulty === "Hard") earnedDifficulty = "Advanced";
    }

    const nextDifficulty = getHighestDifficulty(storedUnlocked, earnedDifficulty);

    await supabase.from("student_memory_flip_progress").upsert(
      {
        student_id: user.id,
        language_pair: languagePair,
        grade,
        unlocked_difficulty: nextDifficulty,
        highest_level: Math.max(existingProgress?.highest_level || 1, levelReached),
        total_wins: (existingProgress?.total_wins || 0) + (passed ? 1 : 0),
        total_losses: (existingProgress?.total_losses || 0) + (passed ? 0 : 1),
        streak: passed ? (existingProgress?.streak || 0) + 1 : 0,
        last_played_at: new Date().toISOString(),
      },
      {
        onConflict: "student_id,language_pair,grade",
      }
    );

    setUnlockedDifficulty(nextDifficulty);
  };

  const submitMasteryAnswer = async (answer: string) => {
    if (masteryAnswerLocked) return;

    const current = masteryQuestions[masteryIndex];
    const isCorrect = answer === current.correctAnswer;

    const totalQuestions = masteryQuestions.length || masteryTotal || 10;
    const nextCorrect = isCorrect ? masteryCorrect + 1 : masteryCorrect;
    const isLastQuestion = masteryIndex >= totalQuestions - 1;

    setMasteryAnswerLocked(true);

    if (isCorrect) {
      playGameSound("correct", 0.25);
      setAnswerFeedback({ type: "correct" });
    } else {
      playGameSound("wrong", 0.38);
      setAnswerFeedback({
        type: "wrong",
        correctAnswer: current.correctAnswer,
      });
    }

    window.setTimeout(async () => {
      setAnswerFeedback(null);
      setMasteryAnswerLocked(false);

      if (!isLastQuestion) {
        setMasteryCorrect(nextCorrect);
        setMasteryIndex((prev) => prev + 1);
        return;
      }

      setAnswerFeedback(null);
      setMasteryAnswerLocked(false);
      setShowMasteryTest(false);
      setShowResultModal(false);
      setGameStarted(false);
      setCards([]);
      setSelectedCards([]);

      const passed = nextCorrect / totalQuestions >= MEMORY_FLIP_MASTERY_PASS_RATE;
      let earnedDifficulty: "Medium" | "Hard" | "Advanced" | null = null;

      if (difficulty === "Easy") earnedDifficulty = "Medium";
      else if (difficulty === "Medium") earnedDifficulty = "Hard";
      else if (difficulty === "Hard") earnedDifficulty = "Advanced";

      const nextDifficulty =
        earnedDifficulty &&
          difficultyOrder.indexOf(earnedDifficulty) > difficultyOrder.indexOf(unlockedDifficulty)
          ? earnedDifficulty
          : null;

      if (passed) {
        playGameSound("stage", 0.25);

        setUnlockedDifficulty((current) => getHighestDifficulty(current, nextDifficulty));
      } else {
        playGameSound("wrong", 0.25);
      }

      setLevel(1);
      setCombo(0);
      setScore(0);
      setMoves(0);
      setMasteryCorrect(0);
      setTimeUp(false);
      setLoading(false);
      clearSavedSession();
      setMasteryResult({
        passed,
        correct: nextCorrect,
        nextDifficulty,
      });

      await saveProgress({
        passed,
        levelReached: level,
      });
    }, isCorrect ? 700 : 1000);
  };

  const generateMasteryTest = async () => {
    const shuffled = shuffle(masteryPool);
    const selected = shuffled.slice(0, 10);

    const questions = selected.map((pair) => {
      const wrongAnswers = shuffle(
        masteryPool
          .filter((p) => p.right !== pair.right)
          .map((p) => p.right)
      ).slice(0, 3);

      return {
        question: pair.left,
        imageKeyword: pair.imageKeyword,
        correctAnswer: pair.right,
        options: shuffle([pair.right, ...wrongAnswers]),
      };
    });

    setMasteryQuestions(questions);
    setMasteryTotal(questions.length || 10);
    setMasteryIndex(0);
    setMasteryCorrect(0);
    setGameStarted(false);
    setSelectedCards([]);
    setShowMasteryTest(true);
  };

  const leaveArcade = async () => {
    loadRequestRef.current += 1;
    saveCurrentSession();
    setShowResultModal(false);
    setGameStarted(false);
    setCards([]);
    setSelectedCards([]);
    setMoves(0);
    setCombo(0);
    setScore(0);
    setLevel(1);
    setErrorMsg("");
    setLoading(false);
    setTimeUp(false);
    setIsMobileFullscreen(false);

    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        // Leaving the game should still work if the browser refuses this call.
      }
    }
  };

  const flipCard = (card: Card) => {
    if (isGameEnded) return;
    if (flipLocked) return;
    if (card.flipped || card.matched) return;
    if (selectedCards.length >= 2) return;

    setFlipLocked(true);
    setTimeout(() => setFlipLocked(false), 140);

    const willBeSecondCard = selectedCards.length === 1;
    const firstSelectedCard = selectedCards[0];
    const willMatch =
      willBeSecondCard && firstSelectedCard?.pairId === card.pairId;

    if (!willMatch) {
      playGameSound("flip", 0.40);
    }

    const flippedCard = { ...card, flipped: true };

    setCards((prev) =>
      prev.map((item) => (item.id === card.id ? flippedCard : item))
    );

    const newSelected = [...selectedCards, flippedCard];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setMoves((prev) => prev + 1);

      const [first, second] = newSelected;

      if (first.pairId === second.pairId) {
        playGameSound("match", 0.25);
        const newCombo = combo + 1;

        setCombo(newCombo);
        setScore((prev) => prev + 100 + newCombo * 20);
        setComboPop(newCombo);
        setTimeout(() => setComboPop(null), 700);

        setTimeout(() => {
          setCards((prev) =>
            prev.map((item) =>
              item.pairId === first.pairId
                ? { ...item, matched: true, flipped: true }
                : item
            )
          );
          setSelectedCards([]);
        }, 450);
      } else {
        setCombo(0);
        setWrongPairIds([first.id, second.id]);

        setTimeout(() => {
          setWrongPairIds([]);
          setCards((prev) =>
            prev.map((item) =>
              item.id === first.id || item.id === second.id
                ? { ...item, flipped: false }
                : item
            )
          );
          setSelectedCards([]);
        }, 850);
      }
    }
  };

  return (
    <div className={demoMode ? `relative overflow-hidden bg-transparent ${demoFullscreenActive ? "h-full min-h-0" : ""}` : `relative min-h-screen overflow-hidden ${themeClass.page}`}>
      <style>
        {`
          @keyframes letter-match-confetti {
            0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
            20% { opacity: 1; }
            100% { transform: translateY(190px) rotate(260deg); opacity: 0; }
          }
        `}
      </style>
      {!demoMode && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {isLight ? (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,#f0eaff_0%,transparent_28%),radial-gradient(circle_at_85%_75%,#fff1bd_0%,transparent_30%)]" />
          ) : (
            <>
              <div className="absolute left-[-120px] top-[-120px] h-[340px] w-[340px] rounded-full bg-[#8B5CF6]/20 blur-3xl" />
              <div className="absolute bottom-[-140px] right-[-100px] h-[380px] w-[380px] rounded-full bg-[#2563EB]/20 blur-3xl" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_35%)]" />
            </>
          )}
        </div>
      )}

      <AnimatePresence>
        {masteryResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center overflow-hidden overscroll-none bg-[#1E0B4B]/85 px-4 py-4 backdrop-blur-md"
          >
            {masteryResult.passed &&
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
            <motion.div
              initial={{ scale: 0.9, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-h-[calc(100dvh-2rem)] w-full max-w-lg rounded-[2rem] border-4 border-[#C4B5FD] bg-gradient-to-b from-[#312E81] via-[#7C3AED] to-[#DB2777] p-1 text-center shadow-[0_34px_110px_rgba(124,58,237,0.55)] sm:rounded-[2.5rem]"
            >
              <div className="relative rounded-[1.7rem] bg-[#180B3D]/92 p-6 sm:rounded-[2.2rem] sm:p-8">
                <div className={`relative mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 ${masteryResult.passed ? "border-[#FDE68A] bg-[#FACC15]" : "border-[#FDA4AF] bg-[#FB7185]"} shadow-[0_18px_60px_rgba(250,204,21,0.4)]`}>
                  {masteryResult.passed ? (
                    <Trophy className="h-14 w-14 text-[#78350F]" />
                  ) : (
                    <Star className="h-14 w-14 text-white" />
                  )}
                </div>

                <p className="relative mt-5 text-sm font-black uppercase tracking-[0.25em] text-[#C4B5FD]">
                  Luna Memory Arcade
                </p>

                <h2 className="relative mt-3 text-4xl font-black leading-tight text-white sm:text-5xl">
                  {masteryResult.passed ? "Passed" : "Failed"}
                </h2>

                <p className="relative mt-4 text-base font-bold text-white/85">
                  Mastery Result: {masteryResult.correct}/{masteryTotal} correct
                </p>

                {masteryResult.passed && masteryResult.nextDifficulty && (
                  <div className="relative mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-sm font-black text-white">
                    <Sparkles className="h-4 w-4 text-[#FDE68A]" />
                    {masteryResult.nextDifficulty} unlocked
                  </div>
                )}

                <div className="relative mt-8 grid gap-3">
                  <button
                    onClick={async () => {
                      if (masteryResult.passed) {
                        const nextDifficulty = masteryResult.nextDifficulty;

                        setMasteryResult(null);
                        setGameStarted(false);
                        setShowMasteryTest(false);
                        setShowResultModal(false);
                        setMasteryQuestions([]);
                        setCards([]);
                        setSelectedCards([]);
                        setLevel(1);

                        if (nextDifficulty) {
                          setUnlockedDifficulty((current) =>
                            getHighestDifficulty(current, nextDifficulty)
                          );
                          setDifficulty(nextDifficulty);
                        }

                        return;
                      }

                      setMasteryResult(null);
                      setShowMasteryTest(true);
                      setMasteryIndex(0);
                      setMasteryCorrect(0);
                      setMasteryAnswerLocked(false);
                    }}
                    className="h-14 rounded-2xl border-2 border-white/30 bg-gradient-to-r from-[#8B5CF6] via-[#DB2777] to-[#FB7185] font-black text-white shadow-[0_14px_35px_rgba(124,58,237,0.4)] transition hover:scale-[1.02]"
                  >
                    {masteryResult.passed ? "CONTINUE" : "RETRY MASTERY TEST"}
                  </button>

                  <button
                    onClick={async () => {
                      setMasteryResult(null);
                      setShowMasteryTest(false);
                      setShowResultModal(false);
                      await leaveArcade();
                      await loadProgress();
                    }}
                    className="h-14 rounded-2xl border-2 border-white/15 bg-white/10 font-black text-white transition hover:bg-white/15"
                  >
                    BACK TO MENU
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      <AnimatePresence>
        {answerFeedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.08 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-[#180B3D]/62 px-4 backdrop-blur-sm"
          >
            <div className={`w-full max-w-sm rounded-[2rem] border-4 p-6 text-center shadow-[0_28px_90px_rgba(0,0,0,0.45)] ${answerFeedback.type === "correct"
              ? "border-emerald-200 bg-gradient-to-b from-emerald-400 to-emerald-600"
              : "border-[#FDA4AF] bg-gradient-to-b from-[#FB7185] to-[#BE185D]"
              }`}
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/45 bg-white/20">
                {answerFeedback.type === "correct" ? (
                  <CheckCircle2 className="h-9 w-9 text-white" />
                ) : (
                  <XCircle className="h-9 w-9 text-white" />
                )}
              </div>

              <h2 className="mt-4 text-3xl font-black text-white">
                {answerFeedback.type === "correct" ? "Correct!" : "Incorrect"}
              </h2>

              {answerFeedback.type === "wrong" && (
                <>
                  <p className="mt-2 text-sm font-black uppercase tracking-[0.18em] text-white/80">
                    Correct answer
                  </p>
                  <p className="mt-2 text-3xl font-black tracking-wide text-white">
                    {answerFeedback.correctAnswer}
                  </p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={demoMode && demoFullscreenActive ? "relative z-10 h-full min-h-0 w-full overflow-hidden p-0" : "relative z-10 mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8"}>
        {showPageChrome && (
          <div className={`mb-4 flex flex-wrap items-center justify-between gap-2 rounded-[1.2rem] border px-3 py-3 sm:gap-3 sm:rounded-[1.5rem] sm:px-5 sm:py-4 ${themeClass.topBar}`}>
            <button
              onClick={() => navigate("/games")}
              className={`rounded-xl border px-4 py-2 text-sm font-black ${themeClass.button}`}
            >
              ← Back to Games Arcade
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setSoundOn((prev) => !prev)}
                className={`flex h-11 w-11 items-center justify-center rounded-xl border text-sm font-black ${themeClass.button}`}
                title={soundOn ? "Sound On" : "Sound Off"}
              >
                {soundOn ? (
                  <Volume2 className="h-5 w-5" />
                ) : (
                  <VolumeX className="h-5 w-5" />
                )}
              </button>

              <button
                onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
                className={`flex h-11 w-11 items-center justify-center rounded-xl border text-sm font-black ${themeClass.button}`}
                title={theme === "dark" ? "Dark Mode" : "Light Mode"}
              >
                {theme === "dark" ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </button>

              {!hideStudentIdentity && (
                <div className={`rounded-xl border px-4 py-2 text-sm font-black ${themeClass.button}`}>
                  Michael
                </div>
              )}
            </div>
          </div>
        )}

        <div
          ref={gameWindowRef}
          className={`relative ${gameStarted || showMasteryTest ? "overflow-hidden" : "overflow-visible"} ${isMobileFullscreen
            ? "fixed inset-0 z-[250] mb-0 h-[100dvh] overflow-y-auto rounded-none p-0"
            : demoMode
              ? demoFullscreenActive
                ? "mb-0 h-full min-h-0 overflow-hidden border-0 bg-transparent p-0 shadow-none"
                : "mb-0 border-0 bg-transparent p-0 shadow-none"
              : gameStarted || showMasteryTest
                ? "mb-8 overflow-hidden rounded-[2rem] p-0"
                : "mb-8 rounded-[1.6rem] p-3 sm:rounded-[2.5rem] sm:p-4"
            } ${!isMobileFullscreen && !demoMode && !gameStarted && !showMasteryTest
              ? `border ${themeClass.gameWindow}`
              : ""
            }`}
        >
          <div className={demoMode && demoFullscreenActive ? "h-full min-h-0 overflow-hidden" : fullscreenActive ? "min-h-[100dvh]" : "min-h-[520px] sm:min-h-[640px]"}>
            {!demoMode && !gameStarted && (
              <button
                onClick={toggleFullscreen}
                className="absolute right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white backdrop-blur-xl hover:bg-white/10"
                title={fullscreenActive ? "Exit Fullscreen" : "Fullscreen"}
              >
                {fullscreenActive ? (
                  <Minimize2 className="h-5 w-5" />
                ) : (
                  <Maximize2 className="h-5 w-5" />
                )}
              </button>
            )}

            {showMasteryTest && masteryQuestions[masteryIndex] ? (
              <div className={`relative flex flex-col overflow-hidden bg-gradient-to-br from-[#312E81] via-[#7C3AED] to-[#DB2777] ${demoMode && demoFullscreenActive ? "h-full min-h-0 p-2" : fullscreenActive ? "min-h-[calc(100dvh-0.5rem)] p-2" : "p-2 sm:p-4"}`}>
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.22),transparent_24%),radial-gradient(circle_at_82%_72%,rgba(250,204,21,0.18),transparent_30%)]" />
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#C4B5FD]">
                      Luna Memory Arcade
                    </p>
                    <p className="mt-1 text-sm font-black text-white drop-shadow">
                      {languageLabel} · {grade} · {difficulty}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="rounded-xl border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-black text-white shadow-[0_8px_20px_rgba(0,0,0,0.16)] backdrop-blur sm:text-sm">
                      Mastery Test
                    </div>
                    <button
                      onClick={leaveArcade}
                      className="rounded-xl border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-black text-white shadow-[0_8px_20px_rgba(0,0,0,0.16)] backdrop-blur transition hover:bg-white/25 sm:text-sm"
                    >
                      Exit Game
                    </button>
                    {!demoMode && (
                      <button
                        type="button"
                        onClick={toggleFullscreen}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/25 bg-white/15 text-white shadow-[0_8px_20px_rgba(0,0,0,0.16)] backdrop-blur transition hover:bg-white/25"
                        title={fullscreenActive ? "Exit Fullscreen" : "Fullscreen"}
                      >
                        {fullscreenActive ? (
                          <Minimize2 className="h-4 w-4" />
                        ) : (
                          <Maximize2 className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="relative z-10 my-3 h-4 overflow-hidden rounded-full border border-white/25 bg-black/25">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] via-[#DB2777] to-[#FB7185] transition-all duration-500"
                    style={{ width: `${((masteryIndex + 1) / masteryQuestions.length) * 100}%` }}
                  />
                </div>

                <div className="relative z-10 mb-3 grid grid-cols-2 gap-1.5 sm:gap-2">
                  {[
                    ["Question", `${masteryIndex + 1}/${masteryQuestions.length}`],
                    ["Correct", `${masteryCorrect}/${masteryQuestions.length}`],
                  ].map(([label, value]) => (
                    <div key={label} className="relative overflow-hidden rounded-2xl border-2 border-white/30 bg-gradient-to-b from-white/25 to-white/10 px-2 py-2 text-center shadow-[0_10px_24px_rgba(0,0,0,0.2)]">
                      <div className="absolute inset-x-2 top-1 h-3 rounded-full bg-white/25 blur-sm" />
                      <p className="relative text-[9px] font-black uppercase tracking-widest text-white/80">
                        {label}
                      </p>
                      <p className="relative mt-0.5 text-sm font-black text-white drop-shadow sm:text-lg">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center">
                  <div className="w-full max-w-4xl rounded-[1.6rem] border-4 border-[#C4B5FD] bg-gradient-to-br from-[#312E81]/95 via-[#7C3AED]/90 to-[#DB2777]/90 p-5 text-center shadow-[inset_0_8px_30px_rgba(255,255,255,0.12),0_18px_55px_rgba(124,58,237,0.35)] sm:p-8">
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-[#C4B5FD]">
                      Mastery Test
                    </p>
                    <h1 className="mt-2 text-3xl font-black text-white sm:text-5xl">
                      Match the Meaning
                    </h1>
                    <p className="mt-3 text-sm font-bold text-white/75">
                      Choose the matching meaning.
                    </p>

                    <div className="mx-auto mt-6 max-w-2xl p-2">
                      <p className="text-3xl font-black text-white sm:text-5xl">
                        {masteryQuestions[masteryIndex].question}
                      </p>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4">
                      {masteryQuestions[masteryIndex].options.map((option: string) => (
                        <button
                          key={option}
                          onClick={() => submitMasteryAnswer(option)}
                          disabled={masteryAnswerLocked}
                          className="min-h-[62px] rounded-[1.5rem] border-2 border-white/25 bg-white/10 px-5 text-base font-black text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)] transition hover:-translate-y-1 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-70 sm:min-h-[72px] sm:text-lg"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : !gameStarted ? (
              vocabularyLoading ? (
                <ArcadeLoadingScreen
                  isLight={isLight}
                  className="min-h-[420px]"
                />
              ) : (
                <>
                  <div className="overflow-visible p-5 sm:p-6">
                    <div className="grid gap-6 lg:grid-cols-[1.1fr_320px]">
                      <div>
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#8B5CF6]/35 bg-[#8B5CF6]/10 px-3 py-1.5">
                          <Sparkles className="h-4 w-4 text-[#C4B5FD]" />
                          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#C4B5FD]">
                            Luna Memory Arcade
                          </span>
                        </div>

                        <h1 className={`text-4xl font-black leading-tight sm:text-5xl ${themeClass.title}`}>
                          Memory Flip
                        </h1>
                        <p className={`mt-3 max-w-2xl text-sm leading-7 sm:text-base ${themeClass.text}`}>
                          Match vocabulary cards, build recall, and practise vocabulary through quick memory challenges.
                        </p>

                        <div className={`mt-4 inline-flex max-w-xl items-center gap-2 rounded-full border px-3 py-2 ${themeClass.softPanel}`}>
                          <p className={`text-xs font-bold leading-5 ${themeClass.text}`}>
                            <span className="text-sm">🏆</span>{" "}
                            Match vocabulary pairs through 5 rounds, then pass the final check to unlock the next difficulty.
                          </p>
                        </div>
                      </div>

                      <div className={`rounded-[1.5rem] border p-4 ${themeClass.softPanel}`}>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#C4B5FD]">
                          Vocabulary Pool
                        </p>
                        <p className={`mt-3 text-3xl font-black ${themeClass.title}`}>
                          {vocabularyPairCount}
                        </p>
                        <p className={`mt-1 text-sm font-bold ${themeClass.text}`}>
                          vocabulary pairs available
                        </p>
                        <p className={`mt-2 text-xs font-black ${themeClass.muted}`}>
                          Final check pass mark: {getPassMarkPercent(MEMORY_FLIP_MASTERY_PASS_RATE)}%
                        </p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <span className={`mb-2 block text-xs font-black uppercase tracking-[0.18em] ${themeClass.muted}`}>
                        Language
                      </span>
                      <div className="grid gap-2 sm:grid-cols-3">
                        {[
                          { label: "Chinese ↔ English", value: "zh_en" },
                          { label: "Chinese ↔ Japanese", value: "zh_ja" },
                          { label: "English ↔ Japanese", value: "en_ja" },
                        ].map((item) => {
                          const locked = demoMode && item.value !== "zh_en";
                          const active = languagePair === item.value;

                          return (
                            <button
                              key={item.value}
                              disabled={locked}
                              onClick={() => {
                                if (!locked) setLanguagePair(item.value);
                              }}
                              className={`h-12 rounded-2xl border px-3 text-sm font-black transition ${active
                                ? menuSelectedClass
                                : locked
                                  ? isLight
                                    ? "cursor-not-allowed border-[#eee8ff] bg-[#faf8ff] text-primary/35"
                                    : "cursor-not-allowed border-white/10 bg-white/5 text-white/35"
                                  : themeClass.button
                                }`}
                            >
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-6">
                      <span className={`mb-2 block text-xs font-black uppercase tracking-[0.18em] ${themeClass.muted}`}>
                        Grade
                      </span>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                        {grades.map((item) => {
                          const locked = demoMode && item !== "Grade 1";

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
                                  : themeClass.button
                                }`}
                            >
                              {item}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {savedSession && !demoMode && !disableResume && (
                      <div className={`mt-5 rounded-[1.5rem] border p-4 ${themeClass.softPanel}`}>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className={`text-sm font-black ${themeClass.title}`}>
                              Resume unfinished Memory Flip?
                            </p>
                            <p className={`mt-1 text-xs font-bold ${themeClass.text}`}>
                              {savedSession.grade} · {savedSession.difficulty} · Round {savedSession.level}/5
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
                              className={`h-11 rounded-xl border px-4 text-sm font-black ${themeClass.button}`}
                            >
                              START OVER
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-6 sm:hidden">
                      <p className={`mb-2 text-xs font-black uppercase tracking-[0.18em] ${themeClass.muted}`}>
                        Difficulty
                      </p>

                      <Select
                        value={difficulty}
                        onValueChange={setDifficulty}
                      >
                        <SelectTrigger
                          className={`h-12 w-full rounded-2xl px-4 text-sm font-black shadow-sm transition focus:ring-4 focus:ring-[#8d73ff]/10 ${isLight
                            ? "border-[#eee8ff] bg-white text-primary"
                            : "border-white/10 bg-[#0D1B2E] text-white"
                            }`}
                        >
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent className="z-[10000] rounded-2xl border-primary/10 bg-white p-2 shadow-[0_22px_70px_rgba(66,56,120,0.16)]">
                          {["Easy", "Medium", "Hard", "Advanced"].map((item) => {
                            const difficultyOrder = ["Easy", "Medium", "Hard", "Advanced"];
                            const locked =
                              difficultyOrder.indexOf(item) >
                              difficultyOrder.indexOf(unlockedDifficulty);

                            return (
                              <SelectItem
                                key={item}
                                value={item}
                                disabled={locked}
                                className="rounded-xl py-3 pl-9 pr-3 text-sm font-semibold text-primary focus:bg-[#f6f1ff] focus:text-primary"
                              >
                                {item} · {getPairCountByDifficulty(item)} pairs
                                {locked ? " · Locked" : ""}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="mt-6 hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4">
                      {[
                        { key: "Easy", icon: Brain, pairs: 6, active: difficulty === "Easy" },
                        { key: "Medium", icon: Zap, pairs: 8, active: difficulty === "Medium" },
                        { key: "Hard", icon: Flame, pairs: 10, active: difficulty === "Hard" },
                        { key: "Advanced", icon: Crown, pairs: 12, active: difficulty === "Advanced" },
                      ].map((item) => {
                        const Icon = item.icon;

                        const difficultyOrder = ["Easy", "Medium", "Hard", "Advanced"];

                        const locked =
                          difficultyOrder.indexOf(item.key) >
                          difficultyOrder.indexOf(unlockedDifficulty);

                        return (
                          <button
                            key={item.key}
                            disabled={locked}
                            onClick={() => {
                              setDifficulty(item.key);
                            }}
                            className={`relative min-h-[88px] overflow-hidden rounded-[1.25rem] border p-3 text-left transition-all duration-300 active:scale-95 sm:min-h-[150px] sm:rounded-[1.45rem] sm:p-5 ${item.active
                              ? menuSelectedCardClass
                              : isLight
                                ? "border-[#eee8ff] bg-white hover:bg-[#faf8ff]"
                                : "border-white/10 bg-white/[0.07] hover:bg-white/10"
                              } ${locked ? "opacity-65" : "hover:-translate-y-1"}`}
                          >
                            <div className="absolute right-4 top-4">
                              <Icon className={`h-5 w-5 sm:h-7 sm:w-7 ${item.active ? (isLight ? "text-[#4C1D95]" : "text-white") : isLight ? "text-primary" : "text-white"}`} />
                            </div>

                            <p className={`text-[11px] font-black uppercase tracking-widest sm:text-sm ${item.active ? (isLight ? "text-[#4C1D95]" : "text-white") : themeClass.muted}`}>
                              {item.key}
                            </p>

                            <h3 className={`mt-2 text-2xl font-black sm:mt-4 sm:text-4xl ${item.active ? (isLight ? "text-[#3B0764]" : "text-white") : themeClass.title}`}>
                              {item.pairs}
                            </h3>

                            <p className={`mt-0.5 text-xs font-bold sm:mt-1 sm:text-sm ${item.active ? (isLight ? "text-[#4C1D95]" : "text-white/85") : themeClass.muted}`}>
                              Matching Pairs
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
                      disabled={vocabularyLoading || loading}
                      className="mt-6 flex h-14 w-full items-center justify-center rounded-[1.6rem] bg-gradient-to-r from-[#8B5CF6] to-[#2563EB] text-base font-black text-white shadow-[0_15px_50px_rgba(99,102,241,0.45)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {vocabularyLoading
                        ? "CHECKING VOCABULARY..."
                        : loading
                          ? "PREPARING MEMORY FLIP..."
                          : `START ${difficulty.toUpperCase()} MEMORY FLIP`}
                    </button>
                  </div>
                </>
              )
            ) : null}

            <AnimatePresence>
              {showResultModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="w-full max-w-md rounded-[2.5rem] border border-white/10 bg-[#0D1B2E] p-8 text-center shadow-[0_30px_100px_rgba(0,0,0,0.6)]"
                  >
                    <Trophy className="mx-auto h-20 w-20 text-[#FACC15]" />

                    <p className="mt-4 text-sm font-black uppercase tracking-[0.25em] text-[#C4B5FD]">
                      {demoMode ? "Luna Arcade Demo" : "Round Cleared"}
                    </p>

                    <h2 className="mt-3 text-4xl font-black text-white">
                      Great Job!
                    </h2>

                    <p className="mt-4 text-slate-300">
                      {demoMode
                        ? "You completed the Luna Arcade demo."
                        : `You completed challenge ${level} / 5 for ${difficulty}.`}
                    </p>

                    <div className="mt-8 grid gap-3">
                      <button
                        onClick={async () => {
                          if (demoMode) {
                            setShowResultModal(false);
                            setCards([]);
                            setSelectedCards([]);
                            setLoading(true);
                            setLevel(1);
                            await loadGame({
                              selectedLanguagePair: "zh_en",
                              selectedGrade: "Grade 1",
                              selectedDifficulty: "Easy",
                              selectedPairCount: getPairCountByDifficulty("Easy"),
                            });
                            return;
                          }

                          const nextLevel = level + 1;

                          setShowResultModal(false);
                          setCards([]);
                          setSelectedCards([]);
                          setLoading(true);

                          if (nextLevel > 5) {
                            generateMasteryTest();
                            return;
                          }

                          setLevel(nextLevel);

                          await loadGame({
                            selectedLanguagePair: languagePair,
                            selectedGrade: grade,
                            selectedDifficulty: difficulty,
                            selectedPairCount: getPairCountByDifficulty(difficulty),
                          });
                        }}
                        className="h-14 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#2563EB] font-black text-white"
                      >
                        {demoMode ? "Play Again" : "NEXT ROUND"}
                      </button>

                      {demoMode && (
                        <button
                          onClick={async () => {
                            setShowResultModal(false);
                            await leaveArcade();
                            onRequestSwitchGame?.("word");
                          }}
                          className="h-14 rounded-2xl border border-white/10 bg-white/5 font-black text-white"
                        >
                          Try Word Search
                        </button>
                      )}

                      <button
                        onClick={async () => {
                          if (demoMode) {
                            setShowResultModal(false);
                            await leaveArcade();
                            navigate(`/${publicLang}/enquiry`);
                            return;
                          }

                          await leaveArcade();
                        }}
                        className="h-14 rounded-2xl border border-white/10 bg-white/5 font-black text-white"
                      >
                        {demoMode ? "Book Consultation" : "Exit Game"}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {gameStarted && (
              <div
                className={`relative overflow-x-hidden overflow-y-auto overscroll-contain rounded-[2rem] bg-gradient-to-br from-[#1E1B4B] via-[#312E81] to-[#6D28D9] p-2 sm:p-4 ${demoMode && demoFullscreenActive ? "flex h-full min-h-0 flex-col" : fullscreenActive ? "min-h-[100dvh]" : "min-h-[720px]"
                  }`}
                style={{
                  paddingBottom:
                    fullscreenActive || (demoMode && demoFullscreenActive)
                      ? "max(1rem, env(safe-area-inset-bottom))"
                      : undefined,
                }}
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(196,181,253,0.28),transparent_24%),radial-gradient(circle_at_82%_72%,rgba(250,204,21,0.14),transparent_30%)]" />
                <div className={`relative z-10 ${demoMode && demoFullscreenActive ? "flex min-h-0 flex-1 flex-col" : fullscreenActive ? "flex min-h-[100dvh] flex-col" : ""}`}>
                  <div className="relative mb-3 overflow-hidden rounded-[1.7rem] border-4 border-[#FDE68A]/75 bg-[#3B0764]/45 p-3 shadow-[inset_0_8px_24px_rgba(0,0,0,0.22)] sm:p-4">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.22),transparent_24%),radial-gradient(circle_at_82%_72%,rgba(250,204,21,0.18),transparent_30%)]" />
                    <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FDE68A]">
                          Memory Flip
                        </p>

                        <p className="mt-0.5 text-xs font-black text-white drop-shadow sm:text-sm">
                          {languageLabel} · {grade} · {difficulty}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="rounded-xl border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-black text-white shadow-[0_8px_20px_rgba(0,0,0,0.16)] backdrop-blur sm:text-sm">
                          Round {level}/5
                        </div>

                        <button
                          onClick={leaveArcade}
                          className="rounded-xl border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-black text-white shadow-[0_8px_20px_rgba(0,0,0,0.16)] backdrop-blur transition hover:bg-white/25 sm:text-sm"
                        >
                          Exit Game
                        </button>

                        {!demoMode && (
                          <button
                            type="button"
                            onClick={toggleFullscreen}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/25 bg-white/15 text-white shadow-[0_8px_20px_rgba(0,0,0,0.16)] backdrop-blur transition hover:bg-white/25"
                            title={fullscreenActive ? "Exit Fullscreen" : "Fullscreen"}
                          >
                            {fullscreenActive ? (
                              <Minimize2 className="h-4 w-4" />
                            ) : (
                              <Maximize2 className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="relative z-10 mt-3 h-2 overflow-hidden rounded-full border border-white/20 bg-black/20">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] via-[#DB2777] to-[#FB7185] transition-all duration-500"
                        style={{ width: `${(level / 5) * 100}%` }}
                      />
                    </div>

                    <div className="relative z-10 mt-3 grid grid-cols-4 gap-1.5 sm:gap-2">
                      {[
                        ["Score", score, themeClass.title],
                        ["Moves", moves, themeClass.title],
                        ["Combo", `x${combo}`, "text-[#FACC15]"],
                        ["Time", `${secondsLeft}s`, secondsLeft <= 10 ? "text-red-400" : themeClass.title],
                      ].map(([label, value, valueClass]) => (
                        <div
                          key={label}
                          className={`relative overflow-hidden rounded-2xl border-2 border-white/30 bg-gradient-to-b from-white/25 to-white/10 px-2 py-2 text-center shadow-[0_10px_24px_rgba(0,0,0,0.2)] ${label === "Time" && secondsLeft <= 10 ? "animate-pulse ring-2 ring-red-200" : ""
                            }`}
                        >
                          <div className="absolute inset-x-2 top-1 h-3 rounded-full bg-white/25 blur-sm" />
                          <p className="relative text-[9px] font-black uppercase tracking-widest text-white/80">
                            {label}
                          </p>

                          <p className={`relative mt-0.5 text-base font-black drop-shadow sm:text-xl ${label === "Time" && secondsLeft <= 10 ? "text-red-100" : valueClass === "text-[#FACC15]" ? "text-[#FACC15]" : "text-white"}`}>
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {loading && (
                    <ArcadeLoadingScreen
                      isLight={isLight}
                      className="mb-6"
                    />
                  )}

                  {errorMsg && !loading && (
                    <div className="flex flex-1 flex-col items-center justify-center rounded-[2rem] border border-[#FACC15]/30 bg-[#FACC15]/10 p-8 text-center">
                      <Brain className="mx-auto h-16 w-16 text-[#FACC15]" />

                      <h2 className={`mt-4 text-2xl font-black ${themeClass.title}`}>
                        Memory Flip Paused
                      </h2>

                      <p className={`mt-3 ${themeClass.text}`}>
                        {errorMsg}
                      </p>

                      <button
                        onClick={leaveArcade}
                        className={`mt-6 h-12 rounded-2xl px-6 font-black ${themeClass.button}`}
                      >
                        Back to Memory Flip Menu
                      </button>
                    </div>
                  )}

                  {timeUp && (
                    <div className="flex flex-1 flex-col items-center justify-center rounded-[2rem] border border-red-400/30 bg-red-500/10 p-8 text-center">
                      <Timer className="mx-auto h-16 w-16 text-red-200" />

                      <h2 className={`mt-4 text-3xl font-black ${themeClass.title}`}>
                        Time's Up!
                      </h2>

                      <p className={`mt-3 ${themeClass.text}`}>
                        Try again when you are ready.
                      </p>

                      <button
                        onClick={leaveArcade}
                        className={`mt-6 h-12 rounded-2xl px-6 font-black ${themeClass.button}`}
                      >
                        Back to Memory Flip Menu
                      </button>
                    </div>
                  )}

                  {!loading && !errorMsg && !timeUp && (
                    <div className={`relative mx-auto flex w-full max-w-[980px] items-center justify-center overflow-visible ${demoMode && demoFullscreenActive ? "min-h-0 flex-1 py-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]" : fullscreenActive ? "min-h-[calc(100dvh-220px)] py-4 pb-[max(2rem,env(safe-area-inset-bottom))] sm:py-6" : "min-h-[520px] py-6 sm:min-h-[600px]"}`}>
                      <AnimatePresence>
                        {comboPop && comboPop >= 2 && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.6, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.2, y: -20 }}
                            className="pointer-events-none absolute left-0 right-0 top-0 z-20 text-center text-4xl font-black text-[#FACC15] drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
                          >
                            COMBO x{comboPop}!
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className={`grid justify-center gap-3 sm:gap-5 ${getCardGridClass(cards.length)}`}>
                        {cards.map((card) => {
                          const visible = card.flipped || card.matched;

                          return (
                            <motion.button
                              animate={
                                wrongPairIds.includes(card.id)
                                  ? { x: [0, -8, 8, -6, 6, 0] }
                                  : card.matched
                                    ? { scale: [1, 1.08, 1], boxShadow: "0 0 28px rgba(16,185,129,0.55)" }
                                    : { x: 0, scale: 1 }
                              }
                              transition={{ duration: 0.35 }}
                              whileHover={!card.matched ? { y: -6 } : {}}
                              whileTap={!card.matched ? { scale: 0.97 } : {}}
                              key={card.id}
                              onClick={() => flipCard(card)}
                              className={`relative justify-self-center overflow-visible rounded-[1.6rem] border-none bg-transparent active:scale-95 [perspective:900px] ${getCardSizeClass(cards.length)}`}
                            >
                              <motion.div
                                animate={{ rotateY: visible ? 180 : 0 }}
                                transition={{ duration: 0.45, ease: "easeInOut" }}
                                className="relative h-full w-full [transform-style:preserve-3d]"
                              >
                                <div
                                  className={`absolute inset-0 flex items-center justify-center rounded-[1.6rem] border [backface-visibility:hidden] ${themeClass.cardBack}`}
                                >
                                  <div className="absolute inset-0 rounded-[1.6rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_50%)]" />

                                  <div className="relative h-[68px] w-[68px] rounded-[1.2rem] border-[6px] border-white bg-[#F6C65B] shadow-[0_8px_0_rgba(0,0,0,0.18)]" />
                                </div>

                                <div
                                  className={`absolute inset-0 rounded-[1.6rem] border [backface-visibility:hidden] [transform:rotateY(180deg)] ${themeClass.cardFront} ${card.matched ? "border-emerald-400 bg-emerald-500/15 opacity-90" : ""}`}
                                >
                                  <div className="flex h-full flex-col items-center justify-between p-2 sm:p-3">
                                    <MemoryCardImage
                                      src={card.imageUrl}
                                      alt={card.text}
                                      className={`rounded-[1.2rem] object-cover shadow-lg ${getCardImageClass(cards.length)}`}
                                    />

                                    <div className="mt-1.5 flex min-h-[30px] w-full items-center justify-center rounded-xl bg-white/90 px-1.5 sm:mt-2 sm:min-h-[38px] sm:px-2">
                                      <p className={`line-clamp-2 text-center font-black leading-tight text-[#0f172a] ${getCardTextClass(cards.length)}`}>
                                        {card.text}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {showPageChrome && (
          <div className={`rounded-[2rem] border p-5 ${themeClass.panel}`}>
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

                    <p className={`text-sm font-black ${themeClass.title}`}>
                      {game.title}
                    </p>

                    <p className={`mt-1 text-xs font-bold ${themeClass.muted}`}>
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
