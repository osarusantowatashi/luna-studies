import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Blocks,
  Brain,
  Car,
  Check,
  CheckCircle2,
  Flame,
  Headphones,
  Maximize2,
  Minimize2,
  Moon,
  Search,
  Sun,
  Timer,
  Trophy,
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
  hintImageUrl?: string;
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
  score: number;
  secondsLeft: number;
  level: number;
};

const grades = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"];
const difficultyOrder = ["Easy", "Medium", "Hard", "Advanced"];
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
  sourceWords: string[],
  imageMap: Record<string, string> = {}
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
    hintImageUrl: imageMap[word],
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

export default function WordSearch() {
  const navigate = useNavigate();
  const arcadeRef = useRef<HTMLDivElement | null>(null);
  const buildRequestRef = useRef(0);
  const [grade, setGrade] = useState("Grade 1");
  const [difficulty, setDifficulty] = useState("Easy");
  const [unlockedDifficulty, setUnlockedDifficulty] = useState("Easy");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [wordImageMap, setWordImageMap] = useState<Record<string, string>>({});
  const [cells, setCells] = useState<Cell[]>([]);
  const [puzzleWords, setPuzzleWords] = useState<PuzzleWord[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
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
  const [openDropdown, setOpenDropdown] = useState<"grade" | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobileFullscreen, setIsMobileFullscreen] = useState(false);
  const [showResumeConfirm, setShowResumeConfirm] = useState(false);

  const config = getDifficultyConfig(difficulty);
  const isLight = theme === "light";
  const fullscreenActive = isFullscreen || isMobileFullscreen;
  const gameModeActive = gameStarted || showFinalTest || !!finalResult;
  const showPageChrome = !fullscreenActive;
  const foundSet = useMemo(() => new Set(foundWords), [foundWords]);
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
      ? "border-[#eee8ff] bg-white/92 shadow-[0_24px_80px_rgba(66,56,120,0.12)]"
      : "border-white/10 bg-[#071426]/95 shadow-[0_24px_90px_rgba(0,0,0,0.48)] backdrop-blur-2xl",
    hudBox: isLight ? "border border-[#eee8ff] bg-[#faf8ff]" : "border border-white/10 bg-black/20",
    boardCell: isLight
      ? "border-[#eee8ff] bg-gradient-to-br from-white to-[#f6f1ff] text-primary shadow-[0_8px_22px_rgba(66,56,120,0.08)]"
      : "border-white/10 bg-gradient-to-br from-white/[0.14] to-white/[0.06] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
  };

  const moreGames = [
    { title: "Memory Flip", icon: Brain, available: true, current: false, status: "Available", path: "/memory-flip" },
    { title: "Word Search", icon: Search, available: true, current: true, status: "Available", path: "/word-search" },
    { title: "Word Drive", icon: Car, available: false, current: false, status: "Coming Soon", path: "#" },
    { title: "Grammar Runner", icon: Flame, available: false, current: false, status: "Coming Soon", path: "#" },
    { title: "Listening Challenge", icon: Headphones, available: false, current: false, status: "Coming Soon", path: "#" },
    { title: "CAT4 Patterns", icon: Blocks, available: false, current: false, status: "Coming Soon", path: "#" },
  ];

  const scopeKey = `english:${grade}`;

  const loadProgress = async () => {
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

    const nextDifficulty = passed
      ? getNextDifficulty(difficulty) || existingProgress?.unlocked_difficulty || unlockedDifficulty
      : existingProgress?.unlocked_difficulty || unlockedDifficulty;
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
    loadProgress();
  }, [grade]);

  useEffect(() => {
    setSavedSession(loadGameSession<SavedWordSearchSession>(WORD_SEARCH_GAME_KEY));
  }, []);

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

      const { data, error } = await supabase
        .from("game_questions")
        .select("language_pair, question_data")
        .eq("game_type", "memory_flip")
        .eq("grade", grade)
        .order("created_at", { ascending: false });

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
            word: pair.left || pair.vocab_word || "",
            imageUrl: pair.image_url || "",
            lookupValues: [pair.image_keyword, pair.vocab_word, pair.left, pair.right],
          }));
        }

        if (set.language_pair === "en_ja") {
          return pairs.map((pair) => ({
            word: pair.left || pair.vocab_word || "",
            imageUrl: pair.image_url || "",
            lookupValues: [pair.image_keyword, pair.vocab_word, pair.left, pair.right],
          }));
        }

        return [];
      });
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
            entry.word.length >= config.minLength &&
            entry.word.length <= config.maxLength
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

      setAvailableWords(words);
      setWordImageMap(nextWordImageMap);
      setVocabularyLoading(false);
    };

    loadWords();

    return () => {
      active = false;
    };
  }, [grade, config.minLength, config.maxLength]);

  useEffect(() => {
    if (!gameStarted || complete || expired) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [complete, expired, gameStarted]);

  useEffect(() => {
    if (!complete || showRoundResult || showFinalTest || finalResult) return;

    if (level >= 5) {
      generateFinalTest();
    } else {
      setShowRoundResult(true);
    }
  }, [complete, showRoundResult, showFinalTest, finalResult, level]);

  const clearSavedSession = () => {
    clearGameSession(WORD_SEARCH_GAME_KEY);
    setSavedSession(null);
  };

  const saveCurrentSession = () => {
    if (!gameStarted || puzzleWords.length === 0 || complete || expired || showFinalTest) return;

    const session: SavedWordSearchSession = {
      grade,
      difficulty,
      unlockedDifficulty,
      cells,
      puzzleWords,
      foundWords,
      score,
      secondsLeft,
      level,
    };

    saveGameSession(WORD_SEARCH_GAME_KEY, session);
    setSavedSession(session);
  };

  const enterGameMode = async () => {
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

      const chosenWords = shuffle(eligibleWords).slice(0, config.words);
      const puzzle = createPuzzle(chosenWords, config.size, config.directions);

      if (puzzle.placedWords.length < config.words) {
        setErrorMsg("This puzzle could not fit all selected words. Try again.");
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

    if (savedSession) {
      setShowResumeConfirm(true);
      return;
    }

    await startNewGame();
  };

  const startNewGame = async () => {
    if (vocabularyLoading) return;

    setShowResumeConfirm(false);
    clearSavedSession();
    setScore(0);
    setFinalResult(null);
    setShowFinalTest(false);
    setFinalQuestions([]);
    setFinalIndex(0);
    setFinalCorrect(0);
    await enterGameMode();
    buildRound(1);
  };

  const startNextChallenge = () => {
    buildRound(level + 1);
  };

  const resumeSavedSession = async () => {
    if (!savedSession) return;

    setShowResumeConfirm(false);
    setGrade(savedSession.grade);
    setDifficulty(savedSession.difficulty);
    setUnlockedDifficulty(savedSession.unlockedDifficulty);
    setCells(savedSession.cells);
    setPuzzleWords(savedSession.puzzleWords);
    setFoundWords(savedSession.foundWords);
    setSelectedCells([]);
    setSelectionStart(null);
    setDragging(false);
    setScore(savedSession.score);
    setSecondsLeft(savedSession.secondsLeft);
    setLevel(savedSession.level);
    setErrorMsg("");
    setLoading(false);
    setShowRoundResult(false);
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
    setSelectedCells([]);
    setSelectionStart(null);
    setDragging(false);
    setErrorMsg("");
    setLoading(false);
    setScore(0);
    setLevel(1);
    setShowRoundResult(false);
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
    const sourceWords = availableWords.length > 0 ? shuffle(availableWords) : puzzleWords.map((item) => item.word);

    if (sourceWords.length === 0) return;

    const selectedWords = Array.from(
      { length: 10 },
      (_, index) => sourceWords[index % sourceWords.length]
    );

    const questions = selectedWords.map((word) =>
      makeFinalQuestion(word, sourceWords, wordImageMap)
    );

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

    if (isLastQuestion) {
      setShowFinalTest(false);
    }

    setTimeout(async () => {
      setFinalFeedback(null);
      setFinalAnswerLocked(false);

      if (!isLastQuestion) {
        setFinalCorrect(nextCorrect);
        setFinalIndex((currentIndex) => currentIndex + 1);
        return;
      }

      const passed = nextCorrect >= 6;
      const nextDifficulty = getNextDifficulty(difficulty);

      clearSavedSession();

      if (passed && nextDifficulty) {
        setUnlockedDifficulty(nextDifficulty);
      }

      await saveProgress({
        passed,
        levelReached: level,
      });

      setShowFinalTest(false);
      setFinalQuestions([]);
      setFinalIndex(0);
      setFinalCorrect(0);
      setLevel(1);
      setFinalResult({
        passed,
        correct: nextCorrect,
        nextDifficulty,
      });
    }, 450);
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
    id: "grade",
    value: string,
    options: string[],
    onChange: (value: string) => void
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
        <span className="text-xs opacity-60">v</span>
      </button>

      {openDropdown === id && (
        <div className={`absolute left-0 right-0 top-full z-50 mt-2 max-h-[210px] overflow-y-auto rounded-[1.4rem] border p-2 ${isLight
          ? "border-[#eee8ff] bg-white shadow-[0_18px_45px_rgba(66,56,120,0.15)]"
          : "border-white/10 bg-[#0D1B2E] shadow-[0_18px_45px_rgba(0,0,0,0.45)]"
          }`}
        >
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setOpenDropdown(null);
              }}
              className={`flex h-11 w-full items-center rounded-[1rem] px-4 text-left text-sm font-black transition ${value === option
                ? "bg-[#8B5CF6]/20 text-[#C4B5FD]"
                : isLight
                  ? "text-primary hover:bg-[#faf8ff]"
                  : "text-white hover:bg-white/10"
                }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className={`relative min-h-screen overflow-hidden ${palette.page}`}>
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

      <div className="relative z-10 mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8">
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

          <button
            onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
            className={`flex h-11 w-11 items-center justify-center rounded-xl border ${palette.button}`}
            title={theme === "dark" ? "Dark Mode" : "Light Mode"}
          >
            {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
          </div>
        )}

        <div
          ref={arcadeRef}
          className={`relative overflow-hidden border ${palette.gameWindow} ${isMobileFullscreen
            ? "fixed inset-0 z-[250] h-[100dvh] overflow-y-auto rounded-none p-2 sm:p-3"
            : "mb-8 rounded-[1.6rem] p-3 sm:rounded-[2.5rem] sm:p-4"
            }`}
        >
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            {isLight ? (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,#f0eaff_0%,transparent_28%),radial-gradient(circle_at_85%_75%,#fff1bd_0%,transparent_30%)]" />
            ) : (
              <>
                <div className="absolute left-[-120px] top-[-120px] h-[320px] w-[320px] rounded-full bg-[#8B5CF6]/20 blur-3xl" />
                <div className="absolute bottom-[-140px] right-[-100px] h-[360px] w-[360px] rounded-full bg-[#2563EB]/20 blur-3xl" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_35%)]" />
              </>
            )}
          </div>

          <div className={`relative z-10 ${fullscreenActive ? "min-h-[100dvh]" : "min-h-[520px] sm:min-h-[620px]"}`}>
            {gameModeActive && (
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

        {finalFeedback && (
          <div className={`fixed inset-0 z-[200] flex items-center justify-center px-4 ${finalFeedback.type === "correct" ? "bg-emerald-500/85" : "bg-red-500/85"}`}>
            <div className="text-center text-white">
              {finalFeedback.type === "correct" ? (
                <CheckCircle2 className="mx-auto h-24 w-24" />
              ) : (
                <XCircle className="mx-auto h-24 w-24" />
              )}
              <h2 className="mt-6 text-5xl font-black">
                {finalFeedback.type === "correct" ? "Correct!" : "Incorrect"}
              </h2>
              {finalFeedback.correctAnswer && (
                <p className="mt-4 text-2xl font-black">
                  Correct answer: {finalFeedback.correctAnswer}
                </p>
              )}
            </div>
          </div>
        )}

        {finalResult && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center overflow-hidden overscroll-none bg-black/75 px-4 py-4">
            <div className="max-h-[calc(100dvh-2rem)] w-full max-w-lg rounded-[2.5rem] border border-white/10 bg-[#0D1B2E] p-6 text-center shadow-[0_30px_100px_rgba(0,0,0,0.6)] sm:p-8">
              <Trophy className="mx-auto h-20 w-20 text-[#FACC15]" />
              <p className="mt-5 text-sm font-black uppercase tracking-[0.25em] text-[#C4B5FD]">
                Final Test
              </p>
              <h2 className="mt-3 text-4xl font-black text-white">
                {finalResult.passed ? "You Passed!" : "Try Again!"}
              </h2>
              <p className="mt-4 text-slate-300">{finalResult.correct} / 10 Correct</p>

              <div className="mt-8 grid gap-3">
                <button
                  onClick={async () => {
                    if (finalResult.passed) {
                      const nextDifficulty = finalResult.nextDifficulty;

                      setFinalResult(null);
                      setGameStarted(false);
                      await exitGameMode();

                      if (nextDifficulty) {
                        setDifficulty(nextDifficulty);
                        setUnlockedDifficulty(nextDifficulty);
                      }

                      return;
                    }

                    setFinalResult(null);
                    setScore(0);
                    buildRound(1);
                  }}
                  className="h-14 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#2563EB] font-black text-white"
                >
                  {finalResult.passed
                    ? finalResult.nextDifficulty
                      ? `GO TO ${finalResult.nextDifficulty.toUpperCase()}`
                      : "BACK TO MENU"
                    : "RETRY"}
                </button>

                <button
                  onClick={async () => {
                    setFinalResult(null);
                    clearSavedSession();
                    await resetToMenu();
                  }}
                  className="h-14 rounded-2xl border border-white/10 bg-white/5 font-black text-white"
                >
                  BACK TO MENU
                </button>
              </div>
            </div>
          </div>
        )}

        {showRoundResult && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 px-4">
            <div className="w-full max-w-md rounded-[2.5rem] border border-white/10 bg-[#0D1B2E] p-8 text-center shadow-[0_30px_100px_rgba(0,0,0,0.6)]">
              <Trophy className="mx-auto h-16 w-16 text-[#FACC15]" />
              <p className="mt-5 text-sm font-black uppercase tracking-[0.25em] text-[#C4B5FD]">
                Puzzle Cleared
              </p>
              <h2 className="mt-3 text-4xl font-black text-white">Great Job!</h2>
              <p className="mt-4 text-slate-300">
                You completed round {level} / 5 for {difficulty}.
              </p>
              <p className="mt-2 text-sm font-bold text-slate-300">Score: {score}</p>
              <button
                onClick={startNextChallenge}
                className="mt-8 h-14 w-full rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#2563EB] font-black text-white"
              >
                NEXT CHALLENGE
              </button>
            </div>
          </div>
        )}

        {showFinalTest && finalQuestions[finalIndex] ? (
          <div className={`rounded-[2rem] border p-5 sm:p-8 ${palette.panel}`}>
            <div className="text-center">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#C4B5FD]">
                Final Test
              </p>
              <h1 className={`mt-3 text-4xl font-black sm:text-5xl ${palette.title}`}>
                Spell Check
              </h1>
              <p className={`mt-3 ${palette.text}`}>
                Question {finalIndex + 1} / {finalQuestions.length}
              </p>
            </div>

            <div className={`mt-8 rounded-[2rem] border p-8 text-center ${palette.soft}`}>
              <p className={`text-4xl font-black tracking-widest sm:text-5xl ${palette.title}`}>
                {finalQuestions[finalIndex].clueDisplay}
              </p>
              {finalQuestions[finalIndex].hintImageUrl && (
                <img
                  src={finalQuestions[finalIndex].hintImageUrl}
                  alt="Vocabulary hint"
                  className="mx-auto mt-5 h-32 w-32 rounded-[1.5rem] object-cover shadow-[0_16px_40px_rgba(0,0,0,0.22)] sm:h-40 sm:w-40"
                />
              )}
              <p className={`mt-4 text-sm font-bold sm:text-base ${palette.text}`}>
                {finalQuestions[finalIndex].sentenceHint}
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {finalQuestions[finalIndex].options.map((option) => (
                <button
                  key={option}
                  onClick={() => submitFinalAnswer(option)}
                  className={`min-h-[72px] rounded-[1.5rem] border px-5 text-lg font-black transition hover:-translate-y-1 ${isLight
                    ? "border-[#eee8ff] bg-white text-primary hover:bg-[#faf8ff]"
                    : "border-white/10 bg-white/5 text-white hover:bg-[#8B5CF6]/20"
                    }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ) : !gameStarted ? (
          <div className={`rounded-[2rem] border p-5 sm:p-6 ${palette.panel}`}>
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
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div className="block">
                <span className={`mb-2 block text-xs font-black uppercase tracking-[0.18em] ${palette.muted}`}>
                  LANGUAGE
                </span>
                <div className={`flex h-12 w-full items-center rounded-2xl border px-4 text-sm font-black ${isLight
                  ? "border-[#eee8ff] bg-white text-primary"
                  : "border-white/10 bg-[#0D1B2E] text-white"
                  }`}
                >
                  English
                </div>
              </div>
              {renderArcadeDropdown("Grade", "grade", grade, grades, setGrade)}
            </div>

            {savedSession && (
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

            <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {difficulties.map((item) => {
                const active = item.key === difficulty;
                const locked =
                  difficultyOrder.indexOf(item.key) >
                  difficultyOrder.indexOf(unlockedDifficulty);

                return (
                  <button
                    key={item.key}
                    disabled={locked}
                    onClick={() => setDifficulty(item.key)}
                    className={`relative overflow-hidden rounded-[1.2rem] border p-3 text-left transition sm:rounded-[1.4rem] sm:p-4 ${active
                      ? "border-[#8B5CF6] bg-[#8B5CF6]/20"
                      : palette.soft
                      } ${locked ? "opacity-65" : "hover:-translate-y-1"}`}
                  >
                    <p className={`text-[11px] font-black uppercase tracking-widest sm:text-xs ${palette.muted}`}>
                      {item.key}
                    </p>
                    <p className={`mt-1 text-2xl font-black sm:mt-2 sm:text-3xl ${palette.title}`}>{item.words}</p>
                    <p className={`text-xs font-bold sm:text-sm ${palette.text}`}>Hidden words</p>
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
        ) : (
          <div className={`flex flex-col rounded-[1.5rem] border p-2 sm:p-4 ${palette.panel} ${fullscreenActive ? "min-h-[calc(100dvh-1rem)]" : ""}`}>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 pr-12">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#C4B5FD]">
                  Word Search
                </p>
                <p className={`mt-1 text-sm font-bold ${palette.title}`}>
                  English · {grade} · {difficulty}
                </p>
              </div>
            </div>

            <div className="mb-3 grid grid-cols-4 gap-1.5 sm:gap-2">
              {[
                ["Score", score],
                ["Found", `${foundWords.length}/${puzzleWords.length}`],
                ["Round", `${level}/5`],
                ["Time", `${secondsLeft}s`],
              ].map(([label, value]) => (
                <div key={label} className={`rounded-xl px-2 py-2 text-center ${palette.hudBox}`}>
                  <p className={`text-[9px] font-black uppercase tracking-widest ${palette.muted}`}>
                    {label}
                  </p>
                  <p className={`mt-0.5 text-sm font-black sm:text-lg ${label === "Time" && secondsLeft <= 20 ? "text-red-400" : palette.title}`}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {loading && (
              <ArcadeLoadingScreen
                title="Preparing Word Search..."
                subtitle="Building puzzle"
                icon={Search}
                progress={loading ? 76 : 100}
                isLight={isLight}
              />
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
              <div className="grid flex-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                <div className={`rounded-[1.5rem] border p-2 sm:p-3 ${palette.soft}`}>
                  <div
                    className="mx-auto grid touch-none select-none gap-1 rounded-[1.2rem]"
                    style={{
                      gridTemplateColumns: `repeat(${config.size}, minmax(0, 1fr))`,
                      maxWidth: getGridMaxWidth(config.size),
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

                <div className={`rounded-[1.5rem] border p-3 sm:p-4 ${palette.soft}`}>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#C4B5FD]">
                      Word List
                    </p>
                    <Timer className={`h-4 w-4 ${palette.muted}`} />
                  </div>

                  <div className="mt-4 grid gap-2">
                    {puzzleWords.map((item) => {
                      const found = foundSet.has(item.word);

                      return (
                        <div
                          key={item.word}
                          className={`flex items-center justify-between rounded-xl border px-3 py-2 ${found
                            ? "border-emerald-400 bg-emerald-500/15"
                            : isLight
                              ? "border-[#eee8ff] bg-white"
                              : "border-white/10 bg-black/15"
                            }`}
                        >
                          <span className={`font-black tracking-wide ${found ? "text-emerald-400 line-through" : palette.title}`}>
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

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-6">
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
