import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Blocks,
  Brain,
  Car,
  Check,
  CheckCircle2,
  Flame,
  Gem,
  Headphones,
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
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ArcadeLoadingScreen from "@/components/games/ArcadeLoadingScreen";
import { supabase } from "@/lib/supabase";
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
  left?: string;
  right?: string;
  vocab_word?: string;
  image_keyword?: string;
  image_url?: string;
};

type PuzzleWord = {
  word: string;
  cells: string[];
};

type Cell = {
  id: string;
  row: number;
  col: number;
  letter: string;
};

type FinalQuestion = {
  clueDisplay: string;
  sentenceHint: string;
  correctChunk: string;
  correctAnswer: string;
  options: string[];
};

type FinalResult = {
  passed: boolean;
  correct: number;
  nextDifficulty: "Medium" | "Hard" | "Advanced" | null;
};

type SavedWordSearchSession = {
  grade: string;
  difficulty: string;
  unlockedDifficulty: string;
  cells: Cell[];
  puzzleWords: PuzzleWord[];
  foundWords: string[];
  masteryPool: string[];
  score: number;
  secondsLeft: number;
  level: number;
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

const grades = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"];
const difficultyOrder = ["Easy", "Medium", "Hard", "Advanced"];
const WORD_SEARCH_FINAL_PASS_RATE = 0.8;
const getPassMarkPercent = (rate: number) => Math.round(rate * 100);
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const easyDirections = [
  [0, 1],
  [1, 0],
];
const mediumDirections = [
  [0, 1],
  [1, 0],
  [1, 1],
];
const allDirections = [
  [0, 1],
  [1, 0],
  [1, 1],
  [-1, 1],
  [0, -1],
  [-1, 0],
  [-1, -1],
  [1, -1],
];
const difficulties = [
  {
    key: "Easy",
    words: 5,
    size: 6,
    seconds: 210,
    minLength: 3,
    maxLength: 6,
    directions: easyDirections,
  },
  {
    key: "Medium",
    words: 6,
    size: 8,
    seconds: 240,
    minLength: 3,
    maxLength: 8,
    directions: mediumDirections,
  },
  {
    key: "Hard",
    words: 8,
    size: 10,
    seconds: 300,
    minLength: 4,
    maxLength: 10,
    directions: allDirections,
  },
  {
    key: "Advanced",
    words: 10,
    size: 12,
    seconds: 360,
    minLength: 5,
    maxLength: 12,
    directions: allDirections,
  },
];
const WORD_SEARCH_GAME_KEY = "word_search";

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

const cleanEnglishWord = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z]/g, "")
    .toUpperCase();

const getEnglishWordFromPair = (pair: Pair) =>
  [pair.vocab_word, pair.left, pair.right]
    .map((value) => cleanEnglishWord(String(value || "")))
    .find((word) => word.length >= 3 && word.length <= 12) || "";

const buildWordSearchEntriesFromVocabulary = (items: GameVocabularyItem[]) =>
  items
    .map((item) => {
      const word = cleanEnglishWord(String(item.en || ""));
      const imageUrl = String(item.image_url || "").trim();

      if (!word || !imageUrl) return null;

      return {
        word,
        imageUrl,
        lookupValues: [item.image_keyword, item.en, item.zh, item.ja]
          .map((value) => String(value || "").trim())
          .filter(Boolean),
      };
    })
    .filter(Boolean) as Array<{
      word: string;
      imageUrl: string;
      lookupValues: string[];
    }>;

const cellId = (row: number, col: number) => `${row}-${col}`;

const parseCellId = (id: string) => {
  const [row, col] = id.split("-").map(Number);
  return { row, col };
};

const getDifficultyConfig = (difficulty: string) =>
  difficulties.find((item) => item.key === difficulty) || difficulties[0];

const getNextDifficulty = (difficulty: string) => {
  if (difficulty === "Easy") return "Medium";
  if (difficulty === "Medium") return "Hard";
  if (difficulty === "Hard") return "Advanced";
  return null;
};

const getHighestDifficulty = (first?: string | null, second?: string | null) => {
  const firstDifficulty = first || "Easy";
  const secondDifficulty = second || "Easy";

  return difficultyOrder.indexOf(firstDifficulty) >=
    difficultyOrder.indexOf(secondDifficulty)
    ? firstDifficulty
    : secondDifficulty;
};

const getGridMaxWidth = (size: number) => {
  if (size <= 6) return "min(84vw, 390px)";
  if (size <= 8) return "min(88vw, 500px)";
  if (size <= 10) return "min(90vw, 590px)";
  return "min(92vw, 660px)";
};

const getGridLetterClass = (size: number) => {
  if (size <= 6) return "text-lg sm:text-2xl";
  if (size <= 8) return "text-base sm:text-xl";
  if (size <= 10) return "text-sm sm:text-lg";
  return "text-xs sm:text-base";
};

const getMissingChunkWindow = (word: string) => {
  const chunkLength = word.length <= 5 ? 1 : 2;
  const start = Math.max(1, Math.floor((word.length - chunkLength) / 2));

  return { start, chunkLength };
};

const makeChunkOption = (word: string, chunkLength: number) => {
  if (word.length <= chunkLength + 2) return "";

  const start = Math.max(1, Math.floor((word.length - chunkLength) / 2));
  return word.slice(start, start + chunkLength);
};

const sentenceHintTemplates: Record<string, (maskedWord: string) => string> = {
  APPLE: (word) => `She eats an ${word} every day.`,
  BALL: (word) => `The child kicks the ${word}.`,
  BIRD: (word) => `The ${word} is flying in the sky.`,
  BOOK: (word) => `Please read the ${word}.`,
  BREAD: (word) => `He eats ${word} for breakfast.`,
  CAT: (word) => `The ${word} sleeps on the sofa.`,
  CHAIR: (word) => `Please sit on the ${word}.`,
  DOG: (word) => `The ${word} runs in the park.`,
  DOOR: (word) => `Please open the ${word}.`,
  FISH: (word) => `The ${word} swims in the water.`,
  FLOWER: (word) => `The ${word} grows in the garden.`,
  HOUSE: (word) => `They live in a small ${word}.`,
  MILK: (word) => `She drinks ${word} in the morning.`,
  PENCIL: (word) => `Please use a ${word} to write.`,
  PIANO: (word) => `John is playing the ${word}.`,
  RABBIT: (word) => `The ${word} is running in the garden.`,
  SCHOOL: (word) => `We go to ${word} to learn.`,
  TABLE: (word) => `The plate is on the ${word}.`,
  TEACHER: (word) => `The ${word} writes on the board.`,
  TREE: (word) => `The ${word} has green leaves.`,
  WATER: (word) => `Please drink some ${word}.`,
  WINDOW: (word) => `Look out the ${word}.`,
};

const makeSentenceHint = (word: string, maskedWord: string) => {
  const lowerMaskedWord = maskedWord.toLowerCase();
  const template = sentenceHintTemplates[word];

  if (template) return template(lowerMaskedWord);
  if (word.endsWith("ING")) return `He is ${lowerMaskedWord} after school.`;
  if (word.endsWith("ED")) return `She ${lowerMaskedWord} it yesterday.`;

  return `Complete the word: ${lowerMaskedWord}.`;
};

const makeFinalQuestion = (
  word: string,
  sourceWords: string[]
): FinalQuestion => {
  const { start, chunkLength } = getMissingChunkWindow(word);
  const correctChunk = word.slice(start, start + chunkLength);
  const maskedWord = `${word.slice(0, start)}${"_".repeat(chunkLength)}${word.slice(
    start + chunkLength
  )}`;
  const chunkFallbacks =
    chunkLength === 1
      ? ["A", "E", "I", "O", "U", "N", "R", "S", "T", "L"]
      : ["AN", "ON", "EN", "UN", "ER", "AR", "IN", "OR", "ST", "CH", "TH"];
  const wrongChunks = shuffle(
    Array.from(
      new Set(
        sourceWords
          .filter((item) => item !== word)
          .map((item) => makeChunkOption(item, chunkLength))
          .concat(chunkFallbacks)
          .filter((item) => item && item !== correctChunk && item.length === chunkLength)
      )
    )
  ).slice(0, 3);

  return {
    clueDisplay: maskedWord.split("").join(" "),
    sentenceHint: makeSentenceHint(word, maskedWord),
    correctChunk,
    correctAnswer: word,
    options: shuffle([correctChunk, ...wrongChunks]).slice(0, 4),
  };
};

const buildSelectionLine = (startId: string, endId: string) => {
  const start = parseCellId(startId);
  const end = parseCellId(endId);
  const rowDelta = end.row - start.row;
  const colDelta = end.col - start.col;

  if (rowDelta !== 0 && colDelta !== 0 && Math.abs(rowDelta) !== Math.abs(colDelta)) {
    return [startId];
  }

  const steps = Math.max(Math.abs(rowDelta), Math.abs(colDelta));
  const rowStep = Math.sign(rowDelta);
  const colStep = Math.sign(colDelta);
  const cells: string[] = [];

  for (let index = 0; index <= steps; index += 1) {
    cells.push(cellId(start.row + rowStep * index, start.col + colStep * index));
  }

  return cells;
};

const createBlankGrid = (size: number) =>
  Array.from({ length: size }, () => Array.from({ length: size }, () => ""));

const wordFits = (
  grid: string[][],
  word: string,
  row: number,
  col: number,
  rowStep: number,
  colStep: number
) => {
  for (let index = 0; index < word.length; index += 1) {
    const nextRow = row + rowStep * index;
    const nextCol = col + colStep * index;

    if (
      nextRow < 0 ||
      nextRow >= grid.length ||
      nextCol < 0 ||
      nextCol >= grid.length
    ) {
      return false;
    }

    const existing = grid[nextRow][nextCol];

    if (existing && existing !== word[index]) return false;
  }

  return true;
};

const placeWord = (
  grid: string[][],
  word: string,
  directions: number[][]
): PuzzleWord | null => {
  for (let attempt = 0; attempt < 220; attempt += 1) {
    const [rowStep, colStep] = directions[Math.floor(Math.random() * directions.length)];
    const row = Math.floor(Math.random() * grid.length);
    const col = Math.floor(Math.random() * grid.length);

    if (!wordFits(grid, word, row, col, rowStep, colStep)) continue;

    const cells: string[] = [];

    for (let index = 0; index < word.length; index += 1) {
      const nextRow = row + rowStep * index;
      const nextCol = col + colStep * index;
      grid[nextRow][nextCol] = word[index];
      cells.push(cellId(nextRow, nextCol));
    }

    return { word, cells };
  }

  return null;
};

const createPuzzle = (wordList: string[], size: number, directions: number[][]) => {
  const grid = createBlankGrid(size);
  const placedWords: PuzzleWord[] = [];

  wordList.forEach((word) => {
    const placed = placeWord(grid, word, directions);

    if (placed) placedWords.push(placed);
  });

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (!grid[row][col]) {
        grid[row][col] = alphabet[Math.floor(Math.random() * alphabet.length)];
      }
    }
  }

  return {
    cells: grid.flatMap((line, row) =>
      line.map((letter, col) => ({
        id: cellId(row, col),
        row,
        col,
        letter,
      }))
    ),
    placedWords,
  };
};

const buildFittingPuzzle = (
  eligibleWords: string[],
  wordCount: number,
  size: number,
  directions: number[][],
  attempts = 160
) => {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const chosenWords = shuffle(eligibleWords).slice(0, wordCount);
    const puzzle = createPuzzle(chosenWords, size, directions);

    if (puzzle.placedWords.length >= wordCount) {
      return puzzle;
    }
  }

  return null;
};

export default function WordSearch({
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
  void hideStudentIdentity;
  const arcadeRef = useRef<HTMLDivElement | null>(null);
  const buildRequestRef = useRef(0);
  const [grade, setGrade] = useState(fixedGrade);
  const [difficulty, setDifficulty] = useState(fixedDifficulty);
  const [unlockedDifficulty, setUnlockedDifficulty] = useState("Easy");
  const [theme, setTheme] = useState<"dark" | "light">(
    () => (localStorage.getItem("arcade_theme") as "dark" | "light") || "dark"
  );
  const [soundOn, setSoundOn] = useState(true);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [wordImageMap, setWordImageMap] = useState<Record<string, string>>({});
  const [cells, setCells] = useState<Cell[]>([]);
  const [puzzleWords, setPuzzleWords] = useState<PuzzleWord[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [masteryPool, setMasteryPool] = useState<string[]>([]);
  const [selectedCells, setSelectedCells] = useState<string[]>([]);
  const [selectionStart, setSelectionStart] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vocabularyLoading, setVocabularyLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [score, setScore] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(getDifficultyConfig(difficulty).seconds);
  const [level, setLevel] = useState(1);
  const [showRoundResult, setShowRoundResult] = useState(false);
  const [showDemoResult, setShowDemoResult] = useState(false);
  const [showFinalTest, setShowFinalTest] = useState(false);
  const [finalQuestions, setFinalQuestions] = useState<FinalQuestion[]>([]);
  const [finalIndex, setFinalIndex] = useState(0);
  const [finalCorrect, setFinalCorrect] = useState(0);
  const [finalFeedback, setFinalFeedback] = useState<{
    type: "correct" | "wrong";
    correctAnswer?: string;
  } | null>(null);
  const [finalAnswerLocked, setFinalAnswerLocked] = useState(false);
  const [finalResult, setFinalResult] = useState<FinalResult | null>(null);
  const [savedSession, setSavedSession] = useState<SavedWordSearchSession | null>(null);
  const [openDropdown, setOpenDropdown] = useState<"grade" | "difficulty" | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobileFullscreen, setIsMobileFullscreen] = useState(false);
  const [showResumeConfirm, setShowResumeConfirm] = useState(false);

  const config = getDifficultyConfig(difficulty);
  const isLight = theme === "light";
  const fullscreenActive = isFullscreen || isMobileFullscreen;
  const visualFullscreenActive = fullscreenActive || (demoMode && demoFullscreenActive);
  const gameModeActive = gameStarted || showFinalTest || !!finalResult;
  const gameplayFrameActive = gameStarted || showFinalTest;
  const showPageChrome = !fullscreenActive && !demoMode;
  const publicLang =
    typeof window !== "undefined" && window.location.pathname.startsWith("/zh")
      ? "zh"
      : typeof window !== "undefined" && window.location.pathname.startsWith("/ja")
        ? "ja"
        : "en";
  const eligibleWordCount = availableWords.filter(
    (word) => word.length >= config.minLength && word.length <= config.maxLength
  ).length;
  const foundSet = useMemo(() => new Set(foundWords), [foundWords]);
  const roundProgressPercent = puzzleWords.length
    ? Math.min(100, (foundWords.length / puzzleWords.length) * 100)
    : 0;
  const selectedSet = useMemo(() => new Set(selectedCells), [selectedCells]);
  const foundCellSet = useMemo(
    () =>
      new Set(
        puzzleWords
          .filter((item) => foundSet.has(item.word))
          .flatMap((item) => item.cells)
      ),
    [foundSet, puzzleWords]
  );
  const wordLookup = useMemo(
    () => new Map(puzzleWords.map((item) => [item.word, item])),
    [puzzleWords]
  );
  const complete = gameStarted && puzzleWords.length > 0 && foundWords.length === puzzleWords.length;
  const expired = gameStarted && secondsLeft <= 0 && !complete;
  const menuSelectedClass = isLight
    ? "border-[#6D28D9] bg-[#EDE9FE] text-[#3B0764] shadow-[0_10px_28px_rgba(109,40,217,0.18)]"
    : "border-[#A78BFA] bg-[#7C3AED]/35 text-white shadow-[0_10px_28px_rgba(124,58,237,0.25)]";
  const menuSelectedCardClass = isLight
    ? "border-[#6D28D9] bg-[#EDE9FE] shadow-[0_16px_42px_rgba(109,40,217,0.18)]"
    : "border-[#A78BFA] bg-[#7C3AED]/30 shadow-[0_16px_42px_rgba(124,58,237,0.24)]";

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
    hudBox: isLight ? "border border-[#eee8ff] bg-[#faf8ff]" : "border border-white/10 bg-black/20",
    boardCell: isLight
      ? "border-[#eee8ff] bg-gradient-to-br from-white to-[#f6f1ff] text-primary shadow-[0_8px_22px_rgba(66,56,120,0.08)]"
      : "border-white/10 bg-gradient-to-br from-white/[0.14] to-white/[0.06] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
  };

  useEffect(() => {
    localStorage.setItem("arcade_theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!demoMode) return;
    onDemoFullscreenChange?.(fullscreenActive);
  }, [demoMode, fullscreenActive, onDemoFullscreenChange]);

  const moreGames = [
    { title: "Memory Flip", icon: Brain, available: true, current: false, status: "Available", path: "/memory-flip" },
    { title: "Word Search", icon: Search, available: true, current: true, status: "Available", path: "/word-search" },
    { title: "Letter Match", icon: Gem, available: true, current: false, status: "Available", path: "/letter-match" },
    { title: "Word Drive", icon: Car, available: false, current: false, status: "Coming Soon", path: "#" },
    { title: "Grammar Runner", icon: Flame, available: false, current: false, status: "Coming Soon", path: "#" },
    { title: "Listening Challenge", icon: Headphones, available: false, current: false, status: "Coming Soon", path: "#" },
    { title: "CAT4 Patterns", icon: Blocks, available: false, current: false, status: "Coming Soon", path: "#" },
  ];

  const soundMap = useMemo(() => {
    return {
      correct: new Audio("/sounds/success.mp3"),
      stage: new Audio("/sounds/mastery-test.mp3"),
      wrong: new Audio("/sounds/time-up.mp3"),
      timeUp: new Audio("/sounds/time-up.mp3"),
    };
  }, []);

  const playGameSound = useCallback((sound: keyof typeof soundMap, volume = 0.45) => {
    if (!soundOn) return;

    const audio = soundMap[sound];
    audio.pause();
    audio.currentTime = 0;
    audio.volume = volume;
    audio.play().catch(() => { });
  }, [soundMap, soundOn]);

  const scopeKey = `english:${grade}`;

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
      .eq("game_key", "word_search")
      .eq("scope_key", scopeKey)
      .maybeSingle();

    if (error) {
      setUnlockedDifficulty("Easy");
      setDifficulty("Easy");
      return;
    }

    const currentUnlockedDifficulty = data?.unlocked_difficulty || "Easy";
    const unlockedIndex = difficultyOrder.indexOf(currentUnlockedDifficulty);

    setUnlockedDifficulty(currentUnlockedDifficulty);
    setDifficulty((current) => {
      if (difficultyOrder.indexOf(current) > unlockedIndex) {
        return currentUnlockedDifficulty;
      }

      return current || "Easy";
    });
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

    const { data: existingProgress, error } = await supabase
      .from("student_game_progress")
      .select("unlocked_difficulty, highest_level, total_plays, total_wins, total_losses, total_score, best_score, current_streak, best_streak, last_won_at, last_lost_at")
      .eq("student_id", user.id)
      .eq("game_key", "word_search")
      .eq("scope_key", scopeKey)
      .maybeSingle();

    if (error) return;

    const storedUnlocked = existingProgress?.unlocked_difficulty || unlockedDifficulty;
    const earnedDifficulty = passed && !disableUnlocking ? getNextDifficulty(difficulty) : null;
    const nextDifficulty = getHighestDifficulty(storedUnlocked, earnedDifficulty);
    const nextStreak = passed ? (existingProgress?.current_streak || 0) + 1 : 0;

    await supabase.from("student_game_progress").upsert(
      {
        student_id: user.id,
        game_key: "word_search",
        scope_key: scopeKey,
        scope: { language: "English", grade },
        unlocked_difficulty: nextDifficulty,
        current_difficulty: difficulty,
        highest_level: Math.max(existingProgress?.highest_level || 1, levelReached),
        total_plays: (existingProgress?.total_plays || 0) + 1,
        total_wins: (existingProgress?.total_wins || 0) + (passed ? 1 : 0),
        total_losses: (existingProgress?.total_losses || 0) + (passed ? 0 : 1),
        total_score: (existingProgress?.total_score || 0) + score,
        best_score: Math.max(existingProgress?.best_score || 0, score),
        current_streak: nextStreak,
        best_streak: Math.max(existingProgress?.best_streak || 0, nextStreak),
        last_played_at: new Date().toISOString(),
        last_won_at: passed ? new Date().toISOString() : existingProgress?.last_won_at,
        last_lost_at: passed ? existingProgress?.last_lost_at : new Date().toISOString(),
        stats: {
          last_correct: finalCorrect,
          last_level_reached: levelReached,
          last_words_found: foundWords.length,
        },
      },
      {
        onConflict: "student_id,game_key,scope_key",
      }
    );

    setUnlockedDifficulty(nextDifficulty);
  };

  useEffect(() => {
    if (demoMode) {
      setGrade("Grade 1");
      setDifficulty("Easy");
      setUnlockedDifficulty("Easy");
      return;
    }

    loadProgress();
  }, [grade, demoMode, fixedGrade, fixedDifficulty]);

  useEffect(() => {
    if (demoMode || disableResume) return;

    setSavedSession(loadGameSession<SavedWordSearchSession>(WORD_SEARCH_GAME_KEY));
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
    if (!finalResult) return;

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
  }, [finalResult]);

  useEffect(() => {
    let active = true;

    const loadWords = async () => {
      setVocabularyLoading(true);

      if (!demoMode) {
        const { items } = await loadGameVocabularyItems({
          supabase,
          grade,
        });
        const maxWordLength = Math.max(...difficulties.map((item) => item.maxLength));
        const minWordLength = Math.min(...difficulties.map((item) => item.minLength));
        const sharedEntries = buildWordSearchEntriesFromVocabulary(items).filter(
          (entry) =>
            entry.word.length >= minWordLength &&
            entry.word.length <= maxWordLength
        );
        const sharedWords = Array.from(
          new Set(sharedEntries.map((entry) => entry.word))
        );

        if (sharedWords.length >= Math.max(...difficulties.map((item) => item.words))) {
          const nextWordImageMap: Record<string, string> = {};

          sharedEntries.forEach((entry) => {
            if (!nextWordImageMap[entry.word] && entry.imageUrl) {
              nextWordImageMap[entry.word] = entry.imageUrl;
            }
          });

          if (!active) return;

          setAvailableWords(sharedWords);
          setWordImageMap(nextWordImageMap);
          setVocabularyLoading(false);
          return;
        }
      }

      // TODO: Temporary legacy fallback until shared vocabulary is fully approved live.
      const questionTable = demoMode ? "public_demo_questions" : "game_questions";
      const queryGrade = demoMode ? "Grade 1" : grade;
      let query = supabase
        .from(questionTable)
        .select("language_pair, question_data")
        .eq("game_type", "memory_flip")
        .eq("grade", queryGrade);

      if (demoMode) {
        query = query.eq("language_pair", "zh_en");
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (!active) return;

      if (error) {
        setAvailableWords([]);
        setWordImageMap({});
        setVocabularyLoading(false);
        return;
      }

      const rawEnglishEntries = (data || []).flatMap((set: any) => {
        const pairs: Pair[] = set.question_data?.pairs || [];

        if (set.language_pair === "zh_en") {
          return pairs.map((pair) => ({
            word: getEnglishWordFromPair(pair),
            imageUrl: pair.image_url || "",
            lookupValues: [pair.image_keyword, pair.vocab_word, pair.left, pair.right],
          }));
        }

        if (set.language_pair === "en_ja") {
          return pairs.map((pair) => ({
            word: getEnglishWordFromPair(pair),
            imageUrl: pair.image_url || "",
            lookupValues: [pair.image_keyword, pair.vocab_word, pair.left, pair.right],
          }));
        }

        return [];
      });
      const maxWordLength = Math.max(...difficulties.map((item) => item.maxLength));
      const minWordLength = Math.min(...difficulties.map((item) => item.minLength));
      const cleanedEntries = rawEnglishEntries
        .map((entry) => ({
          ...entry,
          word: cleanEnglishWord(String(entry.word || "")),
          lookupValues: entry.lookupValues
            .map((value) => String(value || "").trim())
            .filter(Boolean),
        }))
        .filter(
          (entry) =>
            entry.word.length >= minWordLength &&
            entry.word.length <= maxWordLength
        );
      const directImageMap = new Map<string, string>();

      cleanedEntries.forEach((entry) => {
        if (entry.imageUrl && !directImageMap.has(entry.word)) {
          directImageMap.set(entry.word, entry.imageUrl);
        }
      });

      const missingImageLookupValues = Array.from(
        new Set(
          cleanedEntries
            .filter((entry) => !directImageMap.has(entry.word))
            .flatMap((entry) => entry.lookupValues)
            .flatMap((value) => {
              const lower = value.toLowerCase();
              return lower === value ? [value] : [value, lower];
            })
        )
      );
      const approvedImageMap = new Map<string, string>();

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

        if (!active) return;

        imageResults.forEach(({ data: imageData }) => {
          (imageData || []).forEach((image) => {
            [image.keyword, image.vocab_word, image.left_text, image.right_text].forEach(
              (value) => {
                if (value && image.image_url) {
                  approvedImageMap.set(String(value).trim().toLowerCase(), image.image_url);
                }
              }
            );
          });
        });
      }

      const words = Array.from(
        new Set(cleanedEntries.map((entry) => entry.word))
      );
      const nextWordImageMap: Record<string, string> = {};

      cleanedEntries.forEach((entry) => {
        if (nextWordImageMap[entry.word]) return;

        const approvedImageUrl = entry.lookupValues
          .map((value) => approvedImageMap.get(value.toLowerCase()))
          .find(Boolean);

        const imageUrl = directImageMap.get(entry.word) || approvedImageUrl;

        if (imageUrl) {
          nextWordImageMap[entry.word] = imageUrl;
        }
      });

      const demoWords = words.slice(0, maxDemoPairs);

      setAvailableWords(demoMode ? demoWords : words);
      setWordImageMap(nextWordImageMap);
      setVocabularyLoading(false);
    };

    loadWords();

    return () => {
      active = false;
    };
  }, [grade, demoMode, maxDemoPairs]);

  useEffect(() => {
    if (!gameStarted || complete || expired) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          playGameSound("timeUp", 0.45);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [complete, expired, gameStarted, playGameSound]);

  useEffect(() => {
    if (!complete || showFinalTest || finalResult) return;

    const completedRoundWords = puzzleWords.map((item) => item.word);
    setMasteryPool((current) =>
      Array.from(new Set([...current, ...completedRoundWords]))
    );

    if (demoMode) {
      playGameSound("stage", 0.25);
      onDemoComplete?.();
      setGameStarted(false);
      setShowDemoResult(true);
      return;
    }

    if (level >= 5) {
      playGameSound("stage", 0.25);
      generateFinalTest();
    } else {
      playGameSound("stage", 0.25);
      window.setTimeout(() => {
        buildRound(level + 1);
      }, 650);
    }
  }, [complete, showFinalTest, finalResult, level, demoMode, onDemoComplete, playGameSound, puzzleWords]);

  const clearSavedSession = () => {
    clearGameSession(WORD_SEARCH_GAME_KEY);
    setSavedSession(null);
  };

  const saveCurrentSession = () => {
    if (demoMode || disableResume) return;

    if (!gameStarted || puzzleWords.length === 0 || complete || expired || showFinalTest) return;

    const session: SavedWordSearchSession = {
      grade,
      difficulty,
      unlockedDifficulty,
      cells,
      puzzleWords,
      foundWords,
      masteryPool,
      score,
      secondsLeft,
      level,
    };

    saveGameSession(WORD_SEARCH_GAME_KEY, session);
    setSavedSession(session);
  };

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
      // Fullscreen can be blocked by the browser; gameplay should still start.
    }
  };

  const toggleFullscreen = async () => {
    if (demoMode) return;

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
      // Browsers can refuse fullscreen requests; the toggle should fail softly.
    }
  };

  const exitGameMode = async () => {
    setIsMobileFullscreen(false);

    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        // Exiting the menu should still work if the browser refuses this call.
      }
    }
  };

  const buildRound = (roundLevel: number) => {
    if (vocabularyLoading) return;

    const buildRequestId = buildRequestRef.current + 1;
    buildRequestRef.current = buildRequestId;
    setLoading(true);
    setErrorMsg("");
    setFoundWords([]);
    setSelectedCells([]);
    setSelectionStart(null);
    setDragging(false);
    setShowRoundResult(false);
    setSecondsLeft(config.seconds);
    setGameStarted(true);

    window.setTimeout(() => {
      if (buildRequestRef.current !== buildRequestId) return;

      const eligibleWords = availableWords.filter(
        (word) => word.length >= config.minLength && word.length <= config.maxLength
      );

      if (eligibleWords.length < config.words) {
        setCells([]);
        setPuzzleWords([]);
        setErrorMsg(`Not enough English words for ${grade} ${difficulty} yet.`);
        setLoading(false);
        return;
      }

      const puzzle = buildFittingPuzzle(
        eligibleWords,
        config.words,
        config.size,
        config.directions
      );

      if (!puzzle) {
        setCells([]);
        setPuzzleWords([]);
        setErrorMsg(`Not enough English words for ${grade} ${difficulty} yet.`);
        setLoading(false);
        return;
      }

      setCells(puzzle.cells);
      setPuzzleWords(puzzle.placedWords);
      setLevel(roundLevel);
      setLoading(false);
    }, 220);
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

    setShowResumeConfirm(false);
    if (!demoMode && !disableResume) {
      clearSavedSession();
    }
    setScore(0);
    setShowDemoResult(false);
    setFinalResult(null);
    setShowFinalTest(false);
    setFinalQuestions([]);
    setFinalIndex(0);
    setFinalCorrect(0);
    setMasteryPool([]);
    await enterGameMode();
    buildRound(1);
  };

  const startNextChallenge = () => {
    if (demoMode) {
      buildRound(1);
      return;
    }

    buildRound(level + 1);
  };

  const resumeSavedSession = async () => {
    if (demoMode || disableResume) return;

    if (!savedSession) return;

    setShowResumeConfirm(false);
    setGrade(savedSession.grade);
    setDifficulty(savedSession.difficulty);
    setUnlockedDifficulty(savedSession.unlockedDifficulty);
    setCells(savedSession.cells);
    setPuzzleWords(savedSession.puzzleWords);
    setFoundWords(savedSession.foundWords);
    setMasteryPool(savedSession.masteryPool || []);
    setSelectedCells([]);
    setSelectionStart(null);
    setDragging(false);
    setScore(savedSession.score);
    setSecondsLeft(savedSession.secondsLeft);
    setLevel(savedSession.level);
    setErrorMsg("");
    setLoading(false);
    setShowRoundResult(false);
    setShowDemoResult(false);
    setShowFinalTest(false);
    setFinalResult(null);
    await enterGameMode();
    setGameStarted(true);
    clearSavedSession();
  };

  const resetToMenu = async () => {
    buildRequestRef.current += 1;
    saveCurrentSession();
    setGameStarted(false);
    setCells([]);
    setPuzzleWords([]);
    setFoundWords([]);
    setMasteryPool([]);
    setSelectedCells([]);
    setSelectionStart(null);
    setDragging(false);
    setErrorMsg("");
    setLoading(false);
    setScore(0);
    setLevel(1);
    setShowRoundResult(false);
    setShowDemoResult(false);
    setShowFinalTest(false);
    setFinalQuestions([]);
    setFinalIndex(0);
    setFinalCorrect(0);
    setFinalResult(null);
    setShowResumeConfirm(false);
    setSecondsLeft(config.seconds);
    await exitGameMode();
  };

  const generateFinalTest = () => {
    const sourceWords = shuffle(
      Array.from(new Set([...masteryPool, ...puzzleWords.map((item) => item.word)]))
    );

    if (sourceWords.length === 0) return;

    const selectedWords = Array.from(
      { length: 10 },
      (_, index) => sourceWords[index % sourceWords.length]
    );

    const questions = selectedWords.map((word) => makeFinalQuestion(word, sourceWords));

    setFinalQuestions(questions);
    setFinalIndex(0);
    setFinalCorrect(0);
    setShowRoundResult(false);
    setShowFinalTest(true);
    setGameStarted(false);
    setCells([]);
    setPuzzleWords([]);
    setFoundWords([]);
    setSelectedCells([]);
  };

  const submitFinalAnswer = (answer: string) => {
    if (finalAnswerLocked || !finalQuestions[finalIndex]) return;

    const current = finalQuestions[finalIndex];
    const correct = answer === current.correctChunk;
    const nextCorrect = correct ? finalCorrect + 1 : finalCorrect;
    const isLastQuestion = finalIndex >= finalQuestions.length - 1;

    setFinalAnswerLocked(true);
    setFinalFeedback({
      type: correct ? "correct" : "wrong",
      correctAnswer: correct ? undefined : current.correctChunk,
    });

    if (correct) {
      playGameSound("correct", 0.25);
    } else {
      playGameSound("wrong", 0.38);
    }

    window.setTimeout(async () => {
      setFinalFeedback(null);
      setFinalAnswerLocked(false);

      if (!isLastQuestion) {
        setFinalCorrect(nextCorrect);
        setFinalIndex((currentIndex) => currentIndex + 1);
        return;
      }

      const passed = nextCorrect / finalQuestions.length >= WORD_SEARCH_FINAL_PASS_RATE;
      const earnedDifficulty = getNextDifficulty(difficulty);
      const nextDifficulty =
        earnedDifficulty &&
          difficultyOrder.indexOf(earnedDifficulty) > difficultyOrder.indexOf(unlockedDifficulty)
          ? earnedDifficulty
          : null;

      if (passed) {
        playGameSound("stage", 0.25);
      }

      if (!demoMode && !disableResume) {
        clearSavedSession();
      }

      if (passed && !disableUnlocking) {
        setUnlockedDifficulty((current) => getHighestDifficulty(current, nextDifficulty));
      }

      setLevel(1);
      setFinalResult({
        passed,
        correct: nextCorrect,
        nextDifficulty: disableUnlocking ? null : nextDifficulty,
      });
      await saveProgress({
        passed,
        levelReached: level,
      });
    }, correct ? 700 : 1000);
  };

  const updateSelection = (endId: string) => {
    if (!selectionStart) return;
    setSelectedCells(buildSelectionLine(selectionStart, endId));
  };

  const finishSelection = () => {
    if (selectedCells.length === 0) {
      setDragging(false);
      setSelectionStart(null);
      return;
    }

    const selectedWord = selectedCells
      .map((id) => {
        const cell = cells.find((item) => item.id === id);
        return cell?.letter || "";
      })
      .join("");
    const reversedWord = selectedWord.split("").reverse().join("");
    const match = wordLookup.get(selectedWord) || wordLookup.get(reversedWord);

    if (match && !foundSet.has(match.word)) {
      playGameSound("correct", 0.25);
      setFoundWords((current) => [...current, match.word]);
      setScore((current) => current + match.word.length * 10 + secondsLeft);
    }

    setSelectedCells([]);
    setSelectionStart(null);
    setDragging(false);
  };

  const handleBoardMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;

    const target = document.elementFromPoint(event.clientX, event.clientY);
    const cellElement = target?.closest("[data-word-search-cell]") as HTMLElement | null;
    const id = cellElement?.dataset.wordSearchCell;

    if (id) updateSelection(id);
  };

  const renderArcadeDropdown = (
    label: string,
    id: "grade" | "difficulty",
    value: string,
    options: string[],
    onChange: (value: string) => void,
    lockedOptions: string[] = []
  ) => (
    <div className="relative">
      <span className={`mb-2 block text-xs font-black uppercase tracking-[0.18em] ${palette.muted}`}>
        {label}
      </span>

      <button
        type="button"
        onClick={() => setOpenDropdown((current) => (current === id ? null : id))}
        className={`flex h-12 w-full items-center justify-between rounded-2xl border px-4 text-sm font-black outline-none transition ${isLight
          ? "border-[#eee8ff] bg-white text-primary"
          : "border-white/10 bg-[#0D1B2E] text-white"
          }`}
      >
        <span>{value}</span>
        <span className="text-xs opacity-60">▾</span>
      </button>

      {openDropdown === id && (
        <div
          className={`absolute left-0 right-0 top-full z-[9999] mt-2 max-h-[260px] overflow-y-auto rounded-[1.4rem] border p-2 ${isLight
            ? "border-[#eee8ff] bg-white shadow-[0_18px_45px_rgba(66,56,120,0.15)]"
            : "border-white/10 bg-[#0D1B2E] shadow-[0_18px_45px_rgba(0,0,0,0.45)]"
            }`}
        >
          {options.map((option) => {
            const diffName = option.split(" · ")[0];

            const locked =
              lockedOptions.includes(option) ||
              id === "difficulty" &&
              difficultyOrder.indexOf(diffName) >
              difficultyOrder.indexOf(unlockedDifficulty);

            const active =
              value === option || option.startsWith(`${value} ·`);

            return (
              <button
                key={option}
                type="button"
                disabled={locked}
                onClick={() => {
                  if (locked) return;
                  onChange(option);
                  setOpenDropdown(null);
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
        </div>
      )}
    </div>
  );

  return (
    <div className={demoMode ? `relative overflow-hidden bg-transparent ${demoFullscreenActive ? "h-full min-h-0" : ""}` : `relative min-h-screen overflow-hidden ${palette.page}`}>
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
              <div className={`absolute left-[-120px] top-[-120px] h-[340px] w-[340px] rounded-full blur-3xl ${gameModeActive ? "bg-[#34D399]/20" : "bg-[#8B5CF6]/20"}`} />
              <div className="absolute bottom-[-140px] right-[-100px] h-[380px] w-[380px] rounded-full bg-[#2563EB]/20 blur-3xl" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_35%)]" />
            </>
          )}
        </div>
      )}

      <div className={demoMode && demoFullscreenActive ? "relative z-10 h-full min-h-0 w-full overflow-y-auto p-0" : "relative z-10 mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8"}>
        {showPageChrome && (
          <div className={`mb-4 flex flex-wrap items-center justify-between gap-2 rounded-[1.2rem] border px-3 py-3 sm:rounded-[1.5rem] sm:px-5 sm:py-4 ${palette.panel}`}>
            <button
              onClick={async () => {
                if (gameStarted) saveCurrentSession();
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

              <div className={`rounded-xl border px-4 py-2 text-sm font-black ${palette.button}`}>
                Michael
              </div>
            </div>
          </div>
        )}

        <div
          ref={arcadeRef}
          className={`relative ${gameplayFrameActive ? "overflow-hidden" : "overflow-visible"} ${isMobileFullscreen
            ? `fixed inset-0 z-[250] h-[100dvh] overflow-y-auto rounded-none ${gameplayFrameActive ? "p-0" : "p-2 sm:p-3"}`
            : demoMode
              ? demoFullscreenActive
                ? "mb-0 h-full min-h-0 overflow-y-auto border-0 bg-transparent p-0 shadow-none"
                : "mb-0 border-0 bg-transparent p-0 shadow-none"
              : gameplayFrameActive
                ? "mb-8 rounded-[1.6rem] p-0 sm:rounded-[2.5rem]"
                : "mb-8 rounded-[1.6rem] p-3 sm:rounded-[2.5rem] sm:p-4"
            } ${!isMobileFullscreen && !demoMode && !gameplayFrameActive ? `border ${palette.gameWindow}` : ""}`}
        >
          <div className={`relative z-10 ${demoMode && demoFullscreenActive ? "h-full min-h-0 overflow-y-auto" : fullscreenActive ? "min-h-[100dvh]" : "min-h-[520px] sm:min-h-[620px]"}`}>
            {!demoMode && gameModeActive && !gameStarted && (
              <button
                type="button"
                onClick={toggleFullscreen}
                className="absolute right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white backdrop-blur-xl hover:bg-white/10"
                title={fullscreenActive ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {fullscreenActive ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              </button>
            )}

            {showResumeConfirm && savedSession && (
              <div className="fixed inset-0 z-[180] flex items-center justify-center bg-black/75 px-4">
                <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0D1B2E] p-6 text-center shadow-[0_30px_100px_rgba(0,0,0,0.6)]">
                  <Trophy className="mx-auto h-14 w-14 text-[#FACC15]" />
                  <h2 className="mt-4 text-3xl font-black text-white">
                    Resume unfinished game?
                  </h2>
                  <p className="mt-3 text-sm font-bold leading-6 text-slate-300">
                    You have an unfinished session: {savedSession.grade} · {savedSession.difficulty} · Round {savedSession.level}/5
                  </p>

                  <div className="mt-6 grid gap-3">
                    <button
                      onClick={resumeSavedSession}
                      className="h-12 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#2563EB] font-black text-white"
                    >
                      RESUME SAVED GAME
                    </button>
                    <button
                      onClick={startNewGame}
                      className="h-12 rounded-2xl border border-white/10 bg-white/5 font-black text-white"
                    >
                      START NEW GAME
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

            {demoMode && showDemoResult && (
              <div className="fixed inset-0 z-[190] flex items-center justify-center bg-black/70 px-4">
                <div className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-[2rem] border border-white/10 bg-[#0D1B2E] p-6 text-center shadow-[0_30px_100px_rgba(0,0,0,0.6)] sm:rounded-[2.5rem] sm:p-8">
                  <Trophy className="mx-auto h-16 w-16 text-[#FACC15] sm:h-20 sm:w-20" />

                  <p className="mt-4 text-sm font-black uppercase tracking-[0.25em] text-[#A7F3D0]">
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
                      onClick={() => {
                        setShowDemoResult(false);
                        setScore(0);
                        setMasteryPool([]);
                        buildRound(1);
                      }}
                      className="h-14 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#2563EB] font-black text-white"
                    >
                      Play Again
                    </button>

                    <button
                      onClick={async () => {
                        setShowDemoResult(false);
                        await resetToMenu();
                        onRequestSwitchGame?.("memory");
                      }}
                      className="h-14 rounded-2xl border border-white/10 bg-white/5 font-black text-white"
                    >
                      Try Memory Flip
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

            {finalFeedback && !finalResult && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#022C22]/62 px-4 backdrop-blur-sm">
                <div className={`w-full max-w-sm rounded-[1.7rem] border-4 p-5 text-center shadow-[0_28px_90px_rgba(0,0,0,0.45)] sm:rounded-[2rem] sm:p-6 ${finalFeedback.type === "correct"
                  ? "border-emerald-200 bg-gradient-to-b from-emerald-400 to-emerald-600"
                  : "border-[#FDA4AF] bg-gradient-to-b from-[#FB7185] to-[#BE185D]"
                  }`}
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/45 bg-white/20">
                    {finalFeedback.type === "correct" ? (
                      <CheckCircle2 className="h-9 w-9 text-white" />
                    ) : (
                      <XCircle className="h-9 w-9 text-white" />
                    )}
                  </div>
                  <h2 className="mt-4 text-2xl font-black text-white sm:text-3xl">
                    {finalFeedback.type === "correct" ? "Correct!" : "Incorrect"}
                  </h2>
                  {finalFeedback.correctAnswer && (
                    <>
                      <p className="mt-2 text-sm font-black uppercase tracking-[0.18em] text-white/80">
                        Correct answer
                      </p>
                      <p className="mt-2 break-words text-2xl font-black tracking-wide text-white sm:text-3xl">
                        {finalFeedback.correctAnswer}
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            {finalResult && (
              <div className="fixed inset-0 z-[160] flex items-center justify-center overflow-hidden overscroll-none bg-[#022C22]/85 px-4 py-4 backdrop-blur-md">
                {finalResult.passed &&
                  Array.from({ length: 18 }, (_, index) => (
                    <span
                      key={index}
                      className="pointer-events-none absolute h-3 w-2 rounded-full"
                      style={{
                        left: `${8 + ((index * 17) % 84)}%`,
                        top: `${-8 - (index % 5) * 8}px`,
                        background: ["#A7F3D0", "#34D399", "#38BDF8", "#FACC15", "#60A5FA"][index % 5],
                        animation: `letter-match-confetti ${2.2 + (index % 4) * 0.35}s ease-in ${index * 0.08}s infinite`,
                      }}
                    />
                  ))}
                <div className="relative max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-[2rem] border-4 border-[#A7F3D0] bg-gradient-to-b from-[#064E3B] via-[#0F766E] to-[#1D4ED8] p-1 text-center shadow-[0_34px_110px_rgba(15,118,110,0.55)] sm:rounded-[2.5rem]">
                  <div className="relative rounded-[1.7rem] bg-[#022C22]/92 p-6 sm:rounded-[2.2rem] sm:p-8">
                    <div className={`relative mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 ${finalResult.passed ? "border-[#FDE68A] bg-[#FACC15]" : "border-[#FDA4AF] bg-[#FB7185]"} shadow-[0_18px_60px_rgba(250,204,21,0.35)]`}>
                      {finalResult.passed ? (
                        <Trophy className="h-14 w-14 text-[#78350F]" />
                      ) : (
                        <Star className="h-14 w-14 text-white" />
                      )}
                    </div>
                    <p className="mt-5 text-sm font-black uppercase tracking-[0.25em] text-[#A7F3D0]">
                      Luna Explorer Arcade
                    </p>
                    <h2 className="mt-3 text-4xl font-black leading-tight text-white sm:text-5xl">
                      {finalResult.passed ? "Passed" : "Failed"}
                    </h2>
                    <p className="mt-4 text-base font-bold text-white/85">
                      Mastery Result: {finalResult.correct}/{finalQuestions.length || 10} correct
                    </p>
                    {finalResult.passed && finalResult.nextDifficulty && (
                      <div className="relative mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-sm font-black text-white">
                        <Sparkles className="h-4 w-4 text-[#FDE68A]" />
                        {finalResult.nextDifficulty} unlocked
                      </div>
                    )}

                    <div className="mt-8 grid gap-3">
                      <button
                        onClick={async () => {
                          if (finalResult.passed) {
                            const nextDifficulty = finalResult.nextDifficulty;

                            setFinalResult(null);
                            setShowFinalTest(false);
                            setFinalQuestions([]);
                            setGameStarted(false);
                            await exitGameMode();

                            if (nextDifficulty && !disableUnlocking) {
                              setDifficulty(nextDifficulty);
                              setUnlockedDifficulty((current) =>
                                getHighestDifficulty(current, nextDifficulty)
                              );
                            }

                            return;
                          }

                          setFinalResult(null);
                          setShowFinalTest(true);
                          setFinalIndex(0);
                          setFinalCorrect(0);
                          setFinalAnswerLocked(false);
                        }}
                        className="h-14 rounded-2xl border-2 border-white/30 bg-gradient-to-r from-[#34D399] via-[#0F766E] to-[#1D4ED8] font-black text-white shadow-[0_14px_35px_rgba(15,118,110,0.4)] transition hover:scale-[1.02]"
                      >
                        {finalResult.passed ? "CONTINUE" : "RETRY MASTERY TEST"}
                      </button>

                      <button
                        onClick={async () => {
                          setFinalResult(null);
                          setShowFinalTest(false);
                          setFinalQuestions([]);
                          clearSavedSession();
                          await resetToMenu();
                        }}
                        className="h-14 rounded-2xl border-2 border-white/15 bg-white/10 font-black text-white transition hover:bg-white/15"
                      >
                        BACK TO MENU
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showFinalTest && finalQuestions[finalIndex] ? (
              <div className={`relative mx-auto flex w-full max-w-[1500px] flex-col overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#064E3B] via-[#0F766E] to-[#1D4ED8] ${demoMode && demoFullscreenActive ? "h-full min-h-0 p-2 sm:p-3" : fullscreenActive ? "min-h-[calc(100dvh-1.5rem)] p-4" : "min-h-[520px] p-2 sm:min-h-[620px] sm:p-4"}`}>
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(167,243,208,0.26),transparent_24%),radial-gradient(circle_at_82%_72%,rgba(250,204,21,0.18),transparent_30%)]" />
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#A7F3D0]">
                      Luna Explorer Arcade
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

                <div className="relative z-10 my-3 h-4 overflow-hidden rounded-full border border-white/25 bg-black/25">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#34D399] via-[#0F766E] to-[#1D4ED8] transition-all duration-500"
                    style={{ width: `${((finalIndex + 1) / finalQuestions.length) * 100}%` }}
                  />
                </div>

                <div className="relative z-10 mb-3 grid grid-cols-2 gap-1.5 sm:gap-2">
                  {[
                    ["Question", `${finalIndex + 1}/${finalQuestions.length}`],
                    ["Correct", `${finalCorrect}/${finalQuestions.length}`],
                  ].map(([label, value]) => (
                    <div key={label} className="relative overflow-hidden rounded-2xl border-2 border-white/35 bg-gradient-to-b from-white/30 to-white/10 px-2 py-2 text-center shadow-[0_10px_24px_rgba(0,0,0,0.2)]">
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
                  <div className="w-full max-w-4xl rounded-[1.6rem] border-4 border-[#A7F3D0] bg-[#022C22]/78 p-5 text-center shadow-[inset_0_8px_30px_rgba(0,0,0,0.28),0_18px_55px_rgba(8,47,73,0.35)] sm:p-8">
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-[#A7F3D0]">
                      Mastery Test
                    </p>
                    <h1 className="mt-2 text-3xl font-black text-white sm:text-5xl">
                      Choose the Correct Word
                    </h1>

                    <div className="mx-auto mt-6 max-w-2xl p-2">
                      <p className="text-4xl font-black tracking-widest text-white sm:text-5xl">
                        {finalQuestions[finalIndex].clueDisplay}
                      </p>
                      <p className="mt-4 text-sm font-bold text-white/75 sm:text-base">
                        {finalQuestions[finalIndex].sentenceHint}
                      </p>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4">
                      {finalQuestions[finalIndex].options.map((option) => (
                        <button
                          key={option}
                          onClick={() => submitFinalAnswer(option)}
                          disabled={finalAnswerLocked}
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
                <div className="overflow-visible p-5 sm:p-6">
                  <div className="grid gap-6 lg:grid-cols-[1.1fr_320px]">
                    <div>
                      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#8B5CF6]/35 bg-[#8B5CF6]/10 px-3 py-1.5">
                        <Search className="h-4 w-4 text-[#C4B5FD]" />
                        <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#C4B5FD]">
                          Luna Word Arcade
                        </span>
                      </div>

                      <h1 className={`text-4xl font-black leading-tight sm:text-5xl ${palette.title}`}>
                        Word Search
                      </h1>
                      <p className={`mt-3 max-w-2xl text-sm leading-7 sm:text-base ${palette.text}`}>
                        Find English vocabulary hidden across the grid. Words can run forwards,
                        backwards, vertically, horizontally, or diagonally.
                      </p>

                      <div className={`mt-4 inline-flex max-w-xl items-center gap-2 rounded-full border px-3 py-2 ${palette.soft}`}>
                        <p className={`text-xs font-bold leading-5 ${palette.text}`}>
                          <span className="text-sm">🏆</span>{" "}
                          Find all hidden words in each round. After the required rounds, complete the final spell check to unlock the next difficulty.
                        </p>
                      </div>
                    </div>

                    <div className={`rounded-[1.5rem] border p-4 ${palette.soft}`}>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#C4B5FD]">
                        Vocabulary Pool
                      </p>
                      <p className={`mt-3 text-3xl font-black ${palette.title}`}>
                        {availableWords.length}
                      </p>
                      <p className={`mt-1 text-sm font-bold ${palette.text}`}>
                        English words available
                      </p>
                      <p className={`mt-2 text-xs font-black ${palette.muted}`}>
                        {eligibleWordCount} eligible for {difficulty}
                      </p>
                      <p className={`mt-2 text-xs font-black ${palette.muted}`}>
                        Final check pass mark: {getPassMarkPercent(WORD_SEARCH_FINAL_PASS_RATE)}%
                      </p>
                    </div>
                  </div>

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
                              : isLight
                                ? "cursor-not-allowed border-[#eee8ff] bg-[#faf8ff] text-primary/35"
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
                                : palette.button
                              }`}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {savedSession && !demoMode && !disableResume && (
                    <div className={`mt-5 rounded-[1.5rem] border p-4 ${palette.soft}`}>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className={`text-sm font-black ${palette.title}`}>
                            Resume unfinished Word Search?
                          </p>
                          <p className={`mt-1 text-xs font-bold ${palette.text}`}>
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
                            className={`h-11 rounded-xl border px-4 text-sm font-black ${palette.button}`}
                          >
                            CLEAR SAVE
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 sm:hidden">
                    <span className={`mb-2 block text-xs font-black uppercase tracking-[0.18em] ${palette.muted}`}>
                      Difficulty
                    </span>

                    <Select
                      value={difficulty}
                      onValueChange={(nextDifficulty) => {
                        if (demoMode) return;

                        const locked =
                          difficultyOrder.indexOf(nextDifficulty) >
                          difficultyOrder.indexOf(unlockedDifficulty);

                        if (locked) return;

                        setDifficulty(nextDifficulty);
                      }}
                      disabled={demoMode}
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
                        {difficulties.map((item) => {
                          const locked =
                            difficultyOrder.indexOf(item.key) >
                            difficultyOrder.indexOf(unlockedDifficulty);

                          return (
                            <SelectItem
                              key={item.key}
                              value={item.key}
                              disabled={locked}
                              className="rounded-xl py-3 pl-9 pr-3 text-sm font-semibold text-primary focus:bg-[#f6f1ff] focus:text-primary"
                            >
                              {item.key} · {item.words} words{locked ? " · Locked" : ""}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="mt-6 hidden gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-4">
                    {difficulties.map((item) => {
                      const active = item.key === difficulty;
                      const locked =
                        difficultyOrder.indexOf(item.key) >
                        difficultyOrder.indexOf(unlockedDifficulty);

                      return (
                        <button
                          key={item.key}
                          disabled={locked}
                          onClick={() => {
                            if (!demoMode) setDifficulty(item.key);
                          }}
                          className={`relative overflow-hidden rounded-[1.2rem] border p-3 text-left transition sm:rounded-[1.4rem] sm:p-4 ${active
                            ? menuSelectedCardClass
                            : palette.soft
                            } ${locked ? "opacity-65" : "hover:-translate-y-1"}`}
                        >
                          <p className={`text-[11px] font-black uppercase tracking-widest sm:text-xs ${active ? (isLight ? "text-[#4C1D95]" : "text-white") : palette.muted}`}>
                            {item.key}
                          </p>
                          <p className={`mt-1 text-2xl font-black sm:mt-2 sm:text-3xl ${active ? (isLight ? "text-[#3B0764]" : "text-white") : palette.title}`}>{item.words}</p>
                          <p className={`text-xs font-bold sm:text-sm ${active ? (isLight ? "text-[#4C1D95]" : "text-white/85") : palette.text}`}>Hidden words</p>
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
                    disabled={vocabularyLoading}
                    className="mt-6 flex h-14 w-full items-center justify-center rounded-[1.6rem] bg-gradient-to-r from-[#8B5CF6] to-[#2563EB] text-base font-black text-white shadow-[0_15px_50px_rgba(99,102,241,0.45)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {vocabularyLoading ? "LOADING VOCABULARY..." : `START ${difficulty.toUpperCase()} WORD SEARCH`}
                  </button>
                </div>
              )
            ) : (
              <div className={`relative mx-auto flex w-full max-w-[1500px] flex-col rounded-[2rem] bg-gradient-to-br from-[#064E3B] via-[#0F766E] to-[#1D4ED8] ${demoMode && demoFullscreenActive ? "h-full max-h-[100dvh] min-h-0 overflow-y-auto p-3" : fullscreenActive ? "min-h-[calc(100dvh-1.5rem)] overflow-hidden p-4" : "min-h-[520px] overflow-hidden p-2 sm:min-h-[620px] sm:p-4"}`}>
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(167,243,208,0.26),transparent_24%),radial-gradient(circle_at_82%_72%,rgba(250,204,21,0.18),transparent_30%)]" />
                <div className={`relative z-10 shrink-0 rounded-[2rem] border-4 border-[#A7F3D0] bg-gradient-to-r from-[#064E3B]/85 via-[#0F766E]/75 to-[#1D4ED8]/75 shadow-[0_18px_55px_rgba(15,118,110,0.45)] ${demoMode && demoFullscreenActive ? "mb-2 p-3" : "mb-4 p-4"}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.25em] text-[#A7F3D0]">
                        Explorer Word Hunt
                      </p>
                      <p className="mt-1 text-sm font-black text-white drop-shadow">
                        English · {grade} · {difficulty}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="rounded-xl border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-black text-white shadow-[0_8px_20px_rgba(0,0,0,0.16)] backdrop-blur sm:text-sm">
                        Round {level}/5
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
                        >
                          {fullscreenActive ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 h-3 overflow-hidden rounded-full border border-white/20 bg-black/25">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#A7F3D0] via-[#34D399] to-[#38BDF8] transition-all duration-500"
                      style={{ width: `${roundProgressPercent}%` }}
                    />
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[
                      ["Score", score],
                      ["Found", `${foundWords.length}/${puzzleWords.length}`],
                      ["Time", `${secondsLeft}s`],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className={`relative overflow-hidden rounded-2xl border-2 border-white/35 bg-gradient-to-b from-white/30 to-white/10 px-2 py-2 text-center shadow-[0_10px_24px_rgba(0,0,0,0.2)] ${label === "Time" && secondsLeft <= 20 ? "animate-pulse ring-2 ring-red-200" : ""
                          }`}
                      >
                        <p className="relative text-[9px] font-black uppercase tracking-widest text-white/80">
                          {label}
                        </p>
                        <p className={`relative mt-0.5 text-sm font-black drop-shadow sm:text-lg ${label === "Time" && secondsLeft <= 20 ? "text-red-100" : "text-white"
                          }`}>
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {loading && (
                  <ArcadeLoadingScreen isLight={isLight} />
                )}

                {errorMsg && !loading && (
                  <div className="rounded-[1.5rem] border border-[#FACC15]/30 bg-[#FACC15]/10 p-8 text-center">
                    <p className={`font-bold ${palette.text}`}>{errorMsg}</p>
                    <button
                      onClick={resetToMenu}
                      className={`mt-5 rounded-xl border px-5 py-3 font-black ${palette.button}`}
                    >
                      Back to Menu
                    </button>
                  </div>
                )}

                {!loading && !errorMsg && (
                  <div className={`relative z-10 grid min-h-0 flex-1 items-start ${demoMode && demoFullscreenActive ? "gap-3 overflow-visible lg:grid-cols-[minmax(0,1fr)_340px]" : `lg:grid-cols-[minmax(0,1fr)_360px] ${visualFullscreenActive ? "gap-2 lg:gap-3" : "gap-4"}`}`}>
                    <div className="relative overflow-visible p-0">
                      <div
                        className="relative mx-auto grid touch-none select-none gap-1 rounded-[1.2rem] border border-white/10 bg-white/10 p-2 shadow-[inset_0_10px_28px_rgba(0,0,0,0.35)]"
                        style={{
                          gridTemplateColumns: `repeat(${config.size}, minmax(0, 1fr))`,
                          width: demoMode && demoFullscreenActive
                            ? "min(42vw, calc(100dvh - 300px), 620px)"
                            : visualFullscreenActive
                              ? "min(46vw, calc(100dvh - 180px), 720px)"
                            : "100%",
                          maxWidth: demoMode && demoFullscreenActive
                            ? "620px"
                            : visualFullscreenActive
                              ? "720px"
                              : getGridMaxWidth(config.size),
                        }}
                        onPointerMove={handleBoardMove}
                        onPointerUp={finishSelection}
                        onPointerCancel={finishSelection}
                        onPointerLeave={() => {
                          if (dragging) finishSelection();
                        }}
                      >
                        {cells.map((cell) => {
                          const found = foundCellSet.has(cell.id);
                          const selected = selectedSet.has(cell.id);

                          return (
                            <button
                              key={cell.id}
                              data-word-search-cell={cell.id}
                              onPointerDown={(event) => {
                                event.preventDefault();
                                event.currentTarget.setPointerCapture(event.pointerId);
                                setDragging(true);
                                setSelectionStart(cell.id);
                                setSelectedCells([cell.id]);
                              }}
                              onPointerEnter={() => {
                                if (dragging) updateSelection(cell.id);
                              }}
                              className={`aspect-square rounded-lg border font-black leading-none transition ${getGridLetterClass(config.size)} ${found
                                ? "border-emerald-400 bg-emerald-500 text-white shadow-[0_0_18px_rgba(16,185,129,0.45)]"
                                : selected
                                  ? "border-[#FACC15] bg-[#FACC15] text-[#0f172a] shadow-[0_0_18px_rgba(250,204,21,0.45)]"
                                  : palette.boardCell
                                }`}
                            >
                              {cell.letter}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className={`rounded-[1.5rem] border border-white/20 bg-white/10 text-white backdrop-blur ${demoMode && demoFullscreenActive ? "max-h-full min-h-0 overflow-y-auto p-3" : "p-3 sm:p-4"}`}>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#A7F3D0]">
                          Mission Words
                        </p>
                        <Timer className="h-4 w-4 text-[#FACC15]" />
                      </div>

                      <div className="mt-4 grid gap-2">
                        {puzzleWords.map((item) => {
                          const found = foundSet.has(item.word);

                          return (
                            <div
                              key={item.word}
                              className={`flex items-center justify-between rounded-xl border px-3 py-2 ${found
                                ? "border-emerald-400 bg-emerald-500/15"
                                : "border-white/20 bg-white/10"
                                }`}
                            >
                              <span className={`font-black tracking-wide ${found ? "text-emerald-300 line-through" : "text-white"}`}>
                                {item.word}
                              </span>
                              {found && <Check className="h-4 w-4 text-emerald-400" />}
                            </div>
                          );
                        })}
                      </div>

                      {expired && (
                        <div className={`mt-5 rounded-2xl border p-4 text-center ${palette.soft}`}>
                          <Trophy className="mx-auto h-10 w-10 text-[#FACC15]" />
                          <h2 className={`mt-3 text-2xl font-black ${palette.title}`}>
                            Time's Up!
                          </h2>
                          <p className={`mt-2 text-sm font-bold ${palette.text}`}>Score: {score}</p>
                          <button
                            onClick={startGame}
                            disabled={vocabularyLoading}
                            className="mt-4 h-12 w-full rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#2563EB] font-black text-white disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {vocabularyLoading ? "LOADING VOCABULARY..." : "PLAY AGAIN"}
                          </button>
                        </div>
                      )}
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
