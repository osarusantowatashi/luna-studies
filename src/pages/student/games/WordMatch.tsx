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
  Maximize2,
  Minimize2,
  Moon,
  Search,
  Sun,
  Timer,
  Trophy,
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
};

type Tile = {
  id: string;
  row: number;
  col: number;
  letter: string;
};

type DifficultyKey = "Easy" | "Medium" | "Hard" | "Advanced";

type DifficultyConfig = {
  key: DifficultyKey;
  seconds: number;
  bonus: number;
  target: number;
};

type GameResult = {
  success: boolean;
  cleared: number;
  target: number;
  nextDifficulty: "Medium" | "Hard" | "Advanced" | null;
  advancedComplete?: boolean;
};

type SavedWordMatchSession = {
  grade: string;
  difficulty: DifficultyKey;
  unlockedDifficulty: DifficultyKey;
  board: string[][];
  score: number;
  secondsLeft: number;
  clearedWords: string[];
  wordsCleared: string[];
  targetWords: number;
};

type BoardQuality = {
  uniqueSolvableWords: Set<string>;
  possibleSwapKeys: Set<string>;
};

const WORD_MATCH_GAME_KEY = "word_match";
const grades = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"];
const difficultyOrder: DifficultyKey[] = ["Easy", "Medium", "Hard", "Advanced"];
const difficulties: DifficultyConfig[] = [
  { key: "Easy", seconds: 180, bonus: 8, target: 15 },
  { key: "Medium", seconds: 150, bonus: 6, target: 20 },
  { key: "Hard", seconds: 120, bonus: 5, target: 25 },
  { key: "Advanced", seconds: 90, bonus: 4, target: 30 },
];
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const boardSize = 7;

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
    .find((word) => word.length === 5) || "";

const getDifficultyConfig = (difficulty: string) =>
  difficulties.find((item) => item.key === difficulty) || difficulties[0];

const getNextDifficulty = (difficulty: string) => {
  if (difficulty === "Easy") return "Medium";
  if (difficulty === "Medium") return "Hard";
  if (difficulty === "Hard") return "Advanced";
  return null;
};

const randomLetter = () => alphabet[Math.floor(Math.random() * alphabet.length)];

const createRandomBoard = () =>
  Array.from({ length: boardSize }, () =>
    Array.from({ length: boardSize }, () => randomLetter())
  );

const cloneBoard = (board: string[][]) => board.map((row) => [...row]);

const boardToTiles = (board: string[][]): Tile[] =>
  board.flatMap((row, rowIndex) =>
    row.map((letter, colIndex) => ({
      id: `${rowIndex}-${colIndex}`,
      row: rowIndex,
      col: colIndex,
      letter,
    }))
  );

const parseTileId = (id: string) => {
  const [row, col] = id.split("-").map(Number);
  return { row, col };
};

const areAdjacent = (firstId: string, secondId: string) => {
  const first = parseTileId(firstId);
  const second = parseTileId(secondId);
  return Math.abs(first.row - second.row) + Math.abs(first.col - second.col) === 1;
};

const swapOnBoard = (board: string[][], firstId: string, secondId: string) => {
  const next = cloneBoard(board);
  const first = parseTileId(firstId);
  const second = parseTileId(secondId);
  const temp = next[first.row][first.col];
  next[first.row][first.col] = next[second.row][second.col];
  next[second.row][second.col] = temp;
  return next;
};

const findMatches = (board: string[][], validWords: Set<string>) => {
  const matches: { word: string; cells: string[] }[] = [];
  const seen = new Set<string>();

  for (let row = 0; row < boardSize; row += 1) {
    for (let col = 0; col <= boardSize - 5; col += 1) {
      const cells = Array.from({ length: 5 }, (_, index) => `${row}-${col + index}`);
      const word = cells.map((id) => {
        const { row: tileRow, col: tileCol } = parseTileId(id);
        return board[tileRow][tileCol];
      }).join("");

      if (validWords.has(word) && !seen.has(cells.join("|"))) {
        seen.add(cells.join("|"));
        matches.push({ word, cells });
      }
    }
  }

  for (let col = 0; col < boardSize; col += 1) {
    for (let row = 0; row <= boardSize - 5; row += 1) {
      const cells = Array.from({ length: 5 }, (_, index) => `${row + index}-${col}`);
      const word = cells.map((id) => {
        const { row: tileRow, col: tileCol } = parseTileId(id);
        return board[tileRow][tileCol];
      }).join("");

      if (validWords.has(word) && !seen.has(cells.join("|"))) {
        seen.add(cells.join("|"));
        matches.push({ word, cells });
      }
    }
  }

  return matches;
};

const dropAndFill = (board: string[][], clearCells: Set<string>) => {
  const next = cloneBoard(board);

  clearCells.forEach((id) => {
    const { row, col } = parseTileId(id);
    next[row][col] = "";
  });

  for (let col = 0; col < boardSize; col += 1) {
    const remaining: string[] = [];

    for (let row = boardSize - 1; row >= 0; row -= 1) {
      if (next[row][col]) remaining.push(next[row][col]);
    }

    for (let row = boardSize - 1; row >= 0; row -= 1) {
      next[row][col] = remaining.shift() || randomLetter();
    }
  }

  return next;
};

const getMatchKey = (match: { word: string; cells: string[] }) =>
  `${match.word}:${match.cells.join("|")}`;

const getAdjacentCellIds = (row: number, col: number) =>
  [
    row > 0 ? `${row - 1}-${col}` : null,
    row + 1 < boardSize ? `${row + 1}-${col}` : null,
    col > 0 ? `${row}-${col - 1}` : null,
    col + 1 < boardSize ? `${row}-${col + 1}` : null,
  ].filter(Boolean) as string[];

const getRandomDecoyLetter = (correctLetter: string) => {
  let letter = randomLetter();

  while (letter === correctLetter) {
    letter = randomLetter();
  }

  return letter;
};

const getNearMatchCount = (difficulty: string) => {
  if (difficulty === "Easy") return 2;
  if (difficulty === "Medium") return 3;
  if (difficulty === "Hard") return 4;
  return 5;
};

const plantNearMatchWord = (
  board: string[][],
  words: string[],
  reservedCells: Set<string>,
  reservedWords: Set<string>
) => {
  if (words.length === 0) return false;

  for (let attempt = 0; attempt < 120; attempt += 1) {
    const candidateWords = words.filter((word) => !reservedWords.has(word));
    const sourceWords = candidateWords.length > 0 ? candidateWords : words;
    const word = sourceWords[Math.floor(Math.random() * sourceWords.length)];
    const horizontal = Math.random() > 0.5;
    const startRow = horizontal
      ? Math.floor(Math.random() * boardSize)
      : Math.floor(Math.random() * (boardSize - 4));
    const startCol = horizontal
      ? Math.floor(Math.random() * (boardSize - 4))
      : Math.floor(Math.random() * boardSize);
    const wordCells = Array.from({ length: 5 }, (_, index) => ({
      row: startRow + (horizontal ? 0 : index),
      col: startCol + (horizontal ? index : 0),
      letter: word[index],
    }));
    const wordCellIds = new Set(wordCells.map((cell) => `${cell.row}-${cell.col}`));
    const missingIndex = Math.floor(Math.random() * wordCells.length);
    const missingCell = wordCells[missingIndex];
    const swapCandidates = shuffle(
      getAdjacentCellIds(missingCell.row, missingCell.col).filter(
        (id) => !wordCellIds.has(id) && !reservedCells.has(id)
      )
    );

    if (swapCandidates.length === 0) continue;

    const affectedCellIds = [
      ...wordCells.map((cell) => `${cell.row}-${cell.col}`),
      swapCandidates[0],
    ];

    if (affectedCellIds.some((id) => reservedCells.has(id))) {
      continue;
    }

    wordCells.forEach((cell, index) => {
      board[cell.row][cell.col] =
        index === missingIndex ? getRandomDecoyLetter(cell.letter) : cell.letter;
    });

    const sourceCell = parseTileId(swapCandidates[0]);
    board[sourceCell.row][sourceCell.col] = missingCell.letter;

    affectedCellIds.forEach((id) => reservedCells.add(id));
    reservedWords.add(word);
    return true;
  }

  return false;
};

const analyzeBoardQuality = (board: string[][], validWords: Set<string>): BoardQuality => {
  const existingMatchKeys = new Set(
    findMatches(board, validWords).map(getMatchKey)
  );
  const possibleSwapKeys = new Set<string>();
  const uniqueSolvableWords = new Set<string>();

  for (let row = 0; row < boardSize; row += 1) {
    for (let col = 0; col < boardSize; col += 1) {
      const current = `${row}-${col}`;
      const neighbors = [
        col + 1 < boardSize ? `${row}-${col + 1}` : null,
        row + 1 < boardSize ? `${row + 1}-${col}` : null,
      ].filter(Boolean) as string[];

      neighbors.forEach((neighbor) => {
        if (board[row][col] === board[parseTileId(neighbor).row][parseTileId(neighbor).col]) {
          return;
        }

        findMatches(swapOnBoard(board, current, neighbor), validWords).forEach(
          (match) => {
            if (
              !existingMatchKeys.has(getMatchKey(match)) &&
              (match.cells.includes(current) || match.cells.includes(neighbor))
            ) {
              possibleSwapKeys.add(`${current}<->${neighbor}:${getMatchKey(match)}`);
              uniqueSolvableWords.add(match.word);
            }
          }
        );
      });
    }
  }

  return { uniqueSolvableWords, possibleSwapKeys };
};

const hasPossibleSwap = (board: string[][], validWords: Set<string>) => {
  return analyzeBoardQuality(board, validWords).uniqueSolvableWords.size > 0;
};

const isValidSpawnBoard = (
  board: string[][],
  validWords: Set<string>,
  minimumUniqueWords: number
) => {
  const quality = analyzeBoardQuality(board, validWords);

  return (
    findMatches(board, validWords).length === 0 &&
    quality.uniqueSolvableWords.size >= minimumUniqueWords
  );
};

const createSafeRandomBoard = (validWords: Set<string>) => {
  for (let attempt = 0; attempt < 300; attempt += 1) {
    const board = createRandomBoard();

    if (findMatches(board, validWords).length === 0) {
      return board;
    }
  }

  const filler =
    alphabet.split("").find((letter) => !validWords.has(letter.repeat(5))) || "Z";

  return Array.from({ length: boardSize }, (_, row) =>
    Array.from({ length: boardSize }, () => filler)
  );
};

const logBoardQuality = (
  difficulty: string,
  plantedNearMatches: number,
  board: string[][],
  validWords: Set<string>
) => {
  if (!import.meta.env.DEV) return;

  const quality = analyzeBoardQuality(board, validWords);

  console.info("[WordMatch] Board quality", {
    difficulty,
    plantedNearMatches,
    uniqueSolvableWords: quality.uniqueSolvableWords.size,
    possibleSwapOpportunities: quality.possibleSwapKeys.size,
  });
};

const createGuaranteedSingleMoveBoard = (
  words: string[],
  validWords: Set<string>,
  difficulty: string
) => {
  let fallbackWords = shuffle(words);

  while (fallbackWords.length > 0) {
    for (const word of fallbackWords) {
      const board = createSafeRandomBoard(validWords);
      const missingIndex = 2;
      const sourceRow = 1;
      const sourceCol = missingIndex;

      for (let index = 0; index < word.length; index += 1) {
        board[0][index] =
          index === missingIndex ? getRandomDecoyLetter(word[index]) : word[index];
      }

      board[sourceRow][sourceCol] = word[missingIndex];

      if (
        findMatches(board, validWords).length === 0 &&
        hasPossibleSwap(board, validWords)
      ) {
        logBoardQuality(difficulty, 1, board, validWords);
        return board;
      }
    }

    fallbackWords = shuffle(fallbackWords);
  }

  while (true) {
    fallbackWords = shuffle(words);

    for (const word of fallbackWords) {
      const board = createSafeRandomBoard(validWords);
      const missingIndex = 2;
      const sourceRow = 1;
      const sourceCol = missingIndex;

      for (let index = 0; index < word.length; index += 1) {
        board[0][index] =
          index === missingIndex ? getRandomDecoyLetter(word[index]) : word[index];
      }

      board[sourceRow][sourceCol] = word[missingIndex];

      if (
        findMatches(board, validWords).length === 0 &&
        hasPossibleSwap(board, validWords)
      ) {
        logBoardQuality(difficulty, 1, board, validWords);
        return board;
      }
    }
  }
};

const createPlayableBoard = (
  words: string[],
  validWords: Set<string>,
  difficulty: string
) => {
  const targetNearMatches = Math.max(
    1,
    Math.min(getNearMatchCount(difficulty), words.length)
  );

  for (let targetCount = targetNearMatches; targetCount >= 1; targetCount -= 1) {
    for (let attempt = 0; attempt < 220; attempt += 1) {
      const board = createSafeRandomBoard(validWords);
      const reservedCells = new Set<string>();
      const reservedWords = new Set<string>();
      let plantedCount = 0;

      for (
        let plantAttempt = 0;
        plantAttempt < targetCount * 100 && plantedCount < targetCount;
        plantAttempt += 1
      ) {
        if (plantNearMatchWord(board, words, reservedCells, reservedWords)) {
          plantedCount += 1;
        }
      }

      if (
        plantedCount >= targetCount &&
        isValidSpawnBoard(board, validWords, targetCount)
      ) {
        logBoardQuality(difficulty, plantedCount, board, validWords);
        return board;
      }
    }
  }

  for (let attempt = 0; attempt < 5000; attempt += 1) {
    const board = createSafeRandomBoard(validWords);
    const reservedCells = new Set<string>();
    const reservedWords = new Set<string>();

    if (
      plantNearMatchWord(board, words, reservedCells, reservedWords) &&
      isValidSpawnBoard(board, validWords, 1)
    ) {
      logBoardQuality(difficulty, 1, board, validWords);
      return board;
    }
  }

  return createGuaranteedSingleMoveBoard(words, validWords, difficulty);
};

export default function WordMatch() {
  const navigate = useNavigate();
  const arcadeRef = useRef<HTMLDivElement | null>(null);
  const cascadeRequestRef = useRef(0);
  const reshuffleInProgressRef = useRef(false);
  const lastDeadBoardRef = useRef("");
  const [grade, setGrade] = useState("Grade 1");
  const [difficulty, setDifficulty] = useState<DifficultyKey>("Easy");
  const [unlockedDifficulty, setUnlockedDifficulty] = useState<DifficultyKey>("Easy");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [board, setBoard] = useState<string[][]>(createRandomBoard);
  const [selectedTile, setSelectedTile] = useState<string | null>(null);
  const [invalidMoveTiles, setInvalidMoveTiles] = useState<Set<string>>(new Set());
  const [clearingCells, setClearingCells] = useState<Set<string>>(new Set());
  const [clearedWords, setClearedWords] = useState<string[]>([]);
  const [wordsCleared, setWordsCleared] = useState<string[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vocabularyLoading, setVocabularyLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [score, setScore] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(getDifficultyConfig(difficulty).seconds);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [savedSession, setSavedSession] = useState<SavedWordMatchSession | null>(null);
  const [openDropdown, setOpenDropdown] = useState<"grade" | "difficulty" | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobileFullscreen, setIsMobileFullscreen] = useState(false);
  const [showResumeConfirm, setShowResumeConfirm] = useState(false);
  const [reshuffleNotice, setReshuffleNotice] = useState(false);
  const [advancedEndlessMode, setAdvancedEndlessMode] = useState(false);

  const config = getDifficultyConfig(difficulty);
  const isLight = theme === "light";
  const fullscreenActive = isFullscreen || isMobileFullscreen;
  const gameModeActive = gameStarted || !!gameResult;
  const complete =
    gameStarted &&
    !advancedEndlessMode &&
    wordsCleared.length >= config.target;
  const expired = gameStarted && secondsLeft <= 0 && !complete;
  const validWordSet = useMemo(() => new Set(availableWords), [availableWords]);
  const tiles = useMemo(() => boardToTiles(board), [board]);

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
    tile: isLight
      ? "border-[#eee8ff] bg-gradient-to-br from-white to-[#f6f1ff] text-primary shadow-[0_8px_22px_rgba(66,56,120,0.08)]"
      : "border-white/10 bg-gradient-to-br from-white/[0.14] to-white/[0.06] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
  };

  const moreGames = [
    { title: "Memory Flip", icon: Brain, available: true, current: false, status: "Available", path: "/memory-flip" },
    { title: "Word Search", icon: Search, available: true, current: false, status: "Available", path: "/word-search" },
    { title: "Word Match", icon: Gem, available: true, current: true, status: "Available", path: "/word-match" },
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
      .eq("game_key", "word_match")
      .eq("scope_key", scopeKey)
      .maybeSingle();

    if (error) {
      setUnlockedDifficulty("Easy");
      setDifficulty("Easy");
      return;
    }

    const currentUnlockedDifficulty = (data?.unlocked_difficulty || "Easy") as DifficultyKey;
    const unlockedIndex = difficultyOrder.indexOf(currentUnlockedDifficulty);

    setUnlockedDifficulty(currentUnlockedDifficulty);
    setDifficulty((current) => {
      if (difficultyOrder.indexOf(current) > unlockedIndex) {
        return currentUnlockedDifficulty;
      }

      return current || "Easy";
    });
  };

  const saveProgress = async ({ passed }: { passed: boolean }) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: existingProgress, error } = await supabase
      .from("student_game_progress")
      .select("unlocked_difficulty, total_plays, total_wins, total_losses, total_score, best_score, current_streak, best_streak, last_won_at, last_lost_at")
      .eq("student_id", user.id)
      .eq("game_key", "word_match")
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
        game_key: "word_match",
        scope_key: scopeKey,
        scope: { language: "English", grade },
        unlocked_difficulty: nextDifficulty,
        current_difficulty: difficulty,
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
          last_words_cleared: wordsCleared.length,
          target_words: config.target,
        },
      },
      {
        onConflict: "student_id,game_key,scope_key",
      }
    );

    if (nextDifficulty) {
      setUnlockedDifficulty(nextDifficulty as DifficultyKey);
    }
  };

  useEffect(() => {
    loadProgress();
  }, [grade]);

  useEffect(() => {
    setSavedSession(loadGameSession<SavedWordMatchSession>(WORD_MATCH_GAME_KEY));
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
    if (!gameResult) return;

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
  }, [gameResult]);

  useEffect(() => {
    let active = true;

    const loadWords = async () => {
      setVocabularyLoading(true);

      const { data, error } = await supabase
        .from("game_questions")
        .select("language_pair, question_data")
        .eq("game_type", "memory_flip")
        .eq("grade", grade)
        .in("language_pair", ["zh_en", "en_ja"])
        .order("created_at", { ascending: false });

      if (!active) return;

      if (error) {
        setAvailableWords([]);
        setVocabularyLoading(false);
        return;
      }

      const words = Array.from(
        new Set(
          (data || [])
            .flatMap((set: any) => {
              const pairs: Pair[] = set.question_data?.pairs || [];
              return pairs.map(getEnglishWordFromPair);
            })
            .filter((word: string) => word.length === 5)
        )
      );

      setAvailableWords(words);
      setVocabularyLoading(false);
    };

    loadWords();

    return () => {
      active = false;
    };
  }, [grade]);

  useEffect(() => {
    if (!gameStarted || complete || expired || gameResult) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [complete, expired, gameResult, gameStarted]);

  useEffect(() => {
    if (!complete || gameResult) return;

    const nextDifficulty = getNextDifficulty(difficulty);

    const advancedComplete = difficulty === "Advanced" && !nextDifficulty;

    if (!advancedComplete) {
      setGameStarted(false);
    }

    setGameResult({
      success: true,
      cleared: wordsCleared.length,
      target: config.target,
      nextDifficulty,
      advancedComplete,
    });

    if (nextDifficulty) {
      setUnlockedDifficulty(nextDifficulty);
    }

    clearSavedSession();
    saveProgress({
      passed: true,
    });
  }, [complete, config.target, difficulty, gameResult, wordsCleared.length]);

  useEffect(() => {
    if (!expired || gameResult) return;

    setGameStarted(false);
    setGameResult({
      success: false,
      cleared: wordsCleared.length,
      target: config.target,
      nextDifficulty: null,
    });

    clearSavedSession();
    saveProgress({
      passed: false,
    });
  }, [config.target, expired, gameResult, wordsCleared.length]);

  const clearSavedSession = () => {
    clearGameSession(WORD_MATCH_GAME_KEY);
    setSavedSession(null);
  };

  const saveCurrentSession = () => {
    if (!gameStarted || complete || expired) return;

    const session: SavedWordMatchSession = {
      grade,
      difficulty,
      unlockedDifficulty,
      board,
      score,
      secondsLeft,
      clearedWords,
      wordsCleared,
      targetWords: config.target,
    };

    saveGameSession(WORD_MATCH_GAME_KEY, session);
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

  const showNoMovesNotice = () => {
    setReshuffleNotice(true);
    window.setTimeout(() => setReshuffleNotice(false), 1200);
  };

  const buildPlayableBoard = () =>
    createPlayableBoard(availableWords, validWordSet, difficulty);

  const ensurePlayableBoard = (sourceBoard: string[][]) => {
    if (hasPossibleSwap(sourceBoard, validWordSet)) return sourceBoard;

    showNoMovesNotice();
    return buildPlayableBoard();
  };

  useEffect(() => {
    if (
      !gameStarted ||
      loading ||
      complete ||
      expired ||
      gameResult ||
      availableWords.length === 0
    ) {
      return;
    }

    if (findMatches(board, validWordSet).length > 0 || hasPossibleSwap(board, validWordSet)) {
      return;
    }

    const boardSignature = board.flat().join("");

    if (
      reshuffleInProgressRef.current ||
      lastDeadBoardRef.current === boardSignature
    ) {
      return;
    }

    reshuffleInProgressRef.current = true;
    lastDeadBoardRef.current = boardSignature;
    showNoMovesNotice();
    setBoard(buildPlayableBoard());
    window.setTimeout(() => {
      reshuffleInProgressRef.current = false;
    }, 250);
  }, [
    availableWords,
    board,
    complete,
    difficulty,
    expired,
    gameResult,
    gameStarted,
    loading,
    validWordSet,
  ]);

  const resolveBoard = async (startBoard: string[][]) => {
    const requestId = cascadeRequestRef.current + 1;
    cascadeRequestRef.current = requestId;
    let currentBoard = startBoard;
    let cascadeCount = 0;
    const allWords: string[] = [];

    setLoading(true);

    while (cascadeCount < 8) {
      const matches = findMatches(currentBoard, validWordSet);

      if (matches.length === 0) break;

      const cellsToClear = new Set(matches.flatMap((match) => match.cells));
      const wordsFound = matches.map((match) => match.word);

      allWords.push(...wordsFound);
      setClearingCells(cellsToClear);

      await new Promise((resolve) => window.setTimeout(resolve, 220));

      if (cascadeRequestRef.current !== requestId) return;

      currentBoard = dropAndFill(currentBoard, cellsToClear);
      setBoard(currentBoard);
      setClearingCells(new Set());
      cascadeCount += 1;

      await new Promise((resolve) => window.setTimeout(resolve, 120));

      if (cascadeRequestRef.current !== requestId) return;
    }

    if (allWords.length > 0) {
      setClearedWords((current) => [...current, ...allWords]);
      setWordsCleared((current) => [...current, ...allWords]);
      setScore((current) => current + allWords.reduce((sum, word) => sum + word.length * 40, 0));
      setSecondsLeft((current) => current + allWords.length * config.bonus);
    }

    const playableBoard = ensurePlayableBoard(currentBoard);
    setBoard(playableBoard);
    setSelectedTile(null);
    setLoading(false);
  };

  const startTimedGame = (resetScore = false) => {
    if (vocabularyLoading) return;

    cascadeRequestRef.current += 1;
    setLoading(true);
    setErrorMsg("");
    setSelectedTile(null);
    setInvalidMoveTiles(new Set());
    setClearingCells(new Set());
    setSecondsLeft(config.seconds);
    setGameStarted(true);

    if (resetScore) {
      setScore(0);
      setClearedWords([]);
    }

    window.setTimeout(() => {
      if (availableWords.length < 8) {
        setErrorMsg(`Not enough 5-letter Luna vocabulary words for ${grade} yet.`);
        setLoading(false);
        return;
      }

      setBoard(buildPlayableBoard());
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
    setGameResult(null);
    await enterGameMode();
    startTimedGame(true);
  };

  const resumeSavedSession = async () => {
    if (!savedSession) return;

    setShowResumeConfirm(false);
    setGrade(savedSession.grade);
    setDifficulty(savedSession.difficulty);
    setUnlockedDifficulty(savedSession.unlockedDifficulty);
    setBoard(savedSession.board);
    setScore(savedSession.score);
    setSecondsLeft(savedSession.secondsLeft);
    setClearedWords(savedSession.clearedWords || []);
    setWordsCleared(savedSession.wordsCleared || []);
    setSelectedTile(null);
    setClearingCells(new Set());
    setErrorMsg("");
    setLoading(false);
    setGameResult(null);
    await enterGameMode();
    setGameStarted(true);
    clearSavedSession();
  };

  const resetToMenu = async () => {
    cascadeRequestRef.current += 1;
    saveCurrentSession();
    setGameStarted(false);
    setSelectedTile(null);
    setClearingCells(new Set());
    setErrorMsg("");
    setLoading(false);
    setScore(0);
    setGameResult(null);
    setAdvancedEndlessMode(false);
    setShowResumeConfirm(false);
    setSecondsLeft(config.seconds);
    await exitGameMode();
  };

  const handleTileClick = (tileId: string) => {
    if (!gameStarted || loading || complete || expired) return;

    if (!selectedTile) {
      setSelectedTile(tileId);
      return;
    }

    if (selectedTile === tileId) {
      setSelectedTile(null);
      return;
    }

    if (!areAdjacent(selectedTile, tileId)) {
      setSelectedTile(tileId);
      return;
    }

    const swapped = swapOnBoard(board, selectedTile, tileId);
    const matches = findMatches(swapped, validWordSet);

    if (matches.length === 0) {
      setBoard(swapped);
      setSelectedTile(null);
      setInvalidMoveTiles(new Set([selectedTile, tileId]));
      setTimeout(() => {
        setBoard(board);
        setInvalidMoveTiles(new Set());
      }, 220);
      return;
    }

    setBoard(swapped);
    setSelectedTile(null);
    resolveBoard(swapped);
  };

  const renderArcadeDropdown = (
    label: string,
    id: "grade" | "difficulty",
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
              id === "difficulty" &&
              difficultyOrder.indexOf(diffName as DifficultyKey) >
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
                  ? "cursor-not-allowed opacity-45"
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
    <div className={`relative min-h-screen overflow-hidden ${palette.page}`}>
      <style>
        {`
          @keyframes word-match-invalid-move {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            50% { transform: translateX(5px); }
            75% { transform: translateX(-3px); }
          }
        `}
      </style>
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
        {!fullscreenActive && (
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
          className={`relative overflow-visible border ${palette.gameWindow} ${isMobileFullscreen
            ? "fixed inset-0 z-[250] h-[100dvh] overflow-y-auto rounded-none p-2 sm:p-3"
            : "mb-8 rounded-[1.6rem] p-3 sm:rounded-[2.5rem] sm:p-4"
            }`}
        >
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
                    You have an unfinished session: {savedSession.grade} · {savedSession.difficulty} · {savedSession.wordsCleared?.length || 0}/{savedSession.targetWords} words
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

            {gameResult && (
              <div className="fixed inset-0 z-[160] flex items-center justify-center overflow-hidden overscroll-none bg-black/75 px-4 py-4">
                <div className="max-h-[calc(100dvh-2rem)] w-full max-w-lg rounded-[2.5rem] border border-white/10 bg-[#0D1B2E] p-6 text-center shadow-[0_30px_100px_rgba(0,0,0,0.6)] sm:p-8">
                  <Trophy className="mx-auto h-20 w-20 text-[#FACC15]" />
                  <p className="mt-5 text-sm font-black uppercase tracking-[0.25em] text-[#C4B5FD]">
                    Word Match
                  </p>
                  <h2 className="mt-3 text-4xl font-black text-white">
                    {gameResult.success
                      ? gameResult.nextDifficulty
                        ? "Difficulty unlocked."
                        : "Advanced Complete!"
                      : "Try again."}
                  </h2>
                  <p className="mt-4 text-slate-300">
                    {gameResult.success && !gameResult.nextDifficulty
                      ? "You cleared 30 words and completed the highest difficulty."
                      : gameResult.success
                        ? `You cleared ${gameResult.cleared} words!`
                        : `You cleared ${gameResult.cleared} / ${gameResult.target} words.`}
                  </p>
                  {gameResult.success && !gameResult.nextDifficulty && (
                    <p className="mt-3 text-sm font-bold text-slate-400">
                      You cleared 30 words. Keep going and challenge your best score.
                    </p>
                  )}

                  <div className="mt-8 grid gap-3">
                    <button
                      onClick={async () => {
                        if (gameResult.success) {
                          const nextDifficulty = gameResult.nextDifficulty;

                          setGameResult(null);

                          if (nextDifficulty) {
                            setGameStarted(false);
                            await exitGameMode();
                            setDifficulty(nextDifficulty);
                            setUnlockedDifficulty(nextDifficulty);
                          } else {
                            setAdvancedEndlessMode(true);

                            setGameResult(null);
                            setSelectedTile(null);
                            setInvalidMoveTiles(new Set());
                            setClearingCells(new Set());

                            return;
                          }

                          return;
                        }

                        setGameResult(null);
                        startTimedGame(true);
                      }}
                      className="h-14 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#2563EB] font-black text-white"
                    >
                      {gameResult.success
                        ? gameResult.nextDifficulty
                          ? `GO TO ${gameResult.nextDifficulty.toUpperCase()}`
                          : "CONTINUE"
                        : "RETRY"}
                    </button>

                    <button
                      onClick={async () => {
                        setGameResult(null);
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

            {!gameStarted ? (
              vocabularyLoading ? (
                <ArcadeLoadingScreen
                  isLight={isLight}
                  className="min-h-[420px]"
                />
              ) : (
                <div className={`overflow-visible rounded-[2rem] border p-5 sm:p-6 ${palette.panel}`}>
                  <div className="grid gap-6 lg:grid-cols-[1.1fr_320px]">
                    <div>
                      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#8B5CF6]/35 bg-[#8B5CF6]/10 px-3 py-1.5">
                        <Gem className="h-4 w-4 text-[#C4B5FD]" />
                        <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#C4B5FD]">
                          Luna Word Arcade
                        </span>
                      </div>

                      <h1 className={`text-4xl font-black leading-tight sm:text-5xl ${palette.title}`}>
                        Word Match
                      </h1>
                      <p className={`mt-3 max-w-2xl text-sm leading-7 sm:text-base ${palette.text}`}>
                        Swap adjacent letters to form 5-letter Luna vocabulary words. Matched words disappear, letters drop, and new letters fill the board.
                      </p>

                      <div className={`mt-4 inline-flex max-w-xl items-center gap-2 rounded-full border px-3 py-2 ${palette.soft}`}>
                        <p className={`text-xs font-bold leading-5 ${palette.text}`}>
                          <span className="text-sm">🏆</span>{" "}
                          Clear {config.target} words before time runs out to unlock the next difficulty
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
                        5-letter Luna words available
                      </p>
                      <p className={`mt-2 text-xs font-black ${palette.muted}`}>
                        Luna Vocab Mode only
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 lg:grid-cols-2">
                    <div className="block">
                      <span className={`mb-2 block text-xs font-black uppercase tracking-[0.18em] ${palette.muted}`}>
                        MODE
                      </span>
                      <div className={`flex h-12 w-full items-center rounded-2xl border px-4 text-sm font-black ${isLight
                        ? "border-[#eee8ff] bg-white text-primary"
                        : "border-white/10 bg-[#0D1B2E] text-white"
                        }`}
                      >
                        Luna Vocab · 5-letter words
                      </div>
                    </div>
                    {renderArcadeDropdown("Grade", "grade", grade, grades, setGrade)}
                  </div>

                  {savedSession && (
                    <div className={`mt-5 rounded-[1.5rem] border p-4 ${palette.soft}`}>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className={`text-sm font-black ${palette.title}`}>
                            Resume unfinished Word Match?
                          </p>
                          <p className={`mt-1 text-xs font-bold ${palette.text}`}>
                            {savedSession.grade} · {savedSession.difficulty} · {savedSession.wordsCleared?.length || 0}/{savedSession.targetWords} words
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

                    <select
                      value={difficulty}
                      onChange={(event) => {
                        const nextDifficulty = event.target.value as DifficultyKey;
                        const locked =
                          difficultyOrder.indexOf(nextDifficulty) >
                          difficultyOrder.indexOf(unlockedDifficulty);

                        if (locked) return;

                        setDifficulty(nextDifficulty);
                      }}
                      className={`h-12 w-full rounded-2xl border px-4 text-sm font-black outline-none ${isLight
                        ? "border-[#eee8ff] bg-white text-primary"
                        : "border-white/10 bg-[#0D1B2E] text-white"
                        }`}
                    >
                      {difficulties.map((item) => {
                        const locked =
                          difficultyOrder.indexOf(item.key) >
                          difficultyOrder.indexOf(unlockedDifficulty);

                        return (
                          <option key={item.key} value={item.key} disabled={locked}>
                            {item.key} · {item.seconds}s · +{item.bonus}s{locked ? " · Locked" : ""}
                          </option>
                        );
                      })}
                    </select>
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
                          onClick={() => setDifficulty(item.key)}
                          className={`relative overflow-hidden rounded-[1.2rem] border p-3 text-left transition sm:rounded-[1.4rem] sm:p-4 ${active
                            ? "border-[#8B5CF6] bg-[#8B5CF6]/20"
                            : palette.soft
                            } ${locked ? "opacity-65" : "hover:-translate-y-1"}`}
                        >
                          <p className={`text-[11px] font-black uppercase tracking-widest sm:text-xs ${palette.muted}`}>
                            {item.key}
                          </p>
                          <p className={`mt-1 text-2xl font-black sm:mt-2 sm:text-3xl ${palette.title}`}>{item.seconds}s</p>
                          <p className={`text-xs font-bold sm:text-sm ${palette.text}`}>+{item.bonus}s per word</p>
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
                    {vocabularyLoading ? "LOADING VOCABULARY..." : `START ${difficulty.toUpperCase()} WORD MATCH`}
                  </button>
                </div>
              )
            ) : (
              <div className={`flex flex-col rounded-[1.5rem] border ${palette.panel} ${fullscreenActive ? "min-h-[calc(100dvh-0.5rem)] p-2" : "p-2 sm:p-4"}`}>
                <div className={`flex flex-wrap items-center justify-between gap-2 pr-12 ${fullscreenActive ? "mb-1" : "mb-2"}`}>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#C4B5FD]">
                      Word Match
                    </p>
                    <p className={`mt-1 text-sm font-bold ${palette.title}`}>
                      Luna Vocab · {grade} · {difficulty}
                    </p>
                  </div>

                  <button
                    onClick={resetToMenu}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-black sm:text-sm ${palette.button}`}
                  >
                    Exit
                  </button>
                </div>

                <div className={`grid grid-cols-4 gap-1.5 sm:gap-2 ${fullscreenActive ? "mb-2" : "mb-3"}`}>
                  {[
                    ["Score", score],
                    ["Words", `${wordsCleared.length}/${config.target}`],
                    ["Target", config.target],
                    ["Time", `${secondsLeft}s`],
                  ].map(([label, value]) => (
                    <div key={label} className={`rounded-xl px-2 text-center ${palette.hudBox} ${fullscreenActive ? "py-1.5" : "py-2"}`}>
                      <p className={`text-[9px] font-black uppercase tracking-widest ${palette.muted}`}>
                        {label}
                      </p>
                      <p className={`mt-0.5 text-sm font-black sm:text-lg ${label === "Time" && secondsLeft <= 20 ? "text-red-400" : palette.title}`}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                {reshuffleNotice && (
                  <div className="mb-3 rounded-2xl border border-[#FACC15]/30 bg-[#FACC15]/10 px-4 py-3 text-center">
                    <p className="text-sm font-black text-[#FACC15]">
                      No moves left. Board reshuffled.
                    </p>
                  </div>
                )}

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
                  <div className={`grid min-h-0 flex-1 items-start lg:grid-cols-[minmax(0,1fr)_280px] ${fullscreenActive ? "gap-2 lg:gap-3" : "gap-4"}`}>
                    <div className={`rounded-[1.5rem] border p-2 sm:p-3 ${palette.soft}`}>
                      <div
                        className="mx-auto grid touch-none select-none gap-1 rounded-[1.2rem]"
                        style={{
                          gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
                          width: fullscreenActive
                            ? "min(100%, calc(100dvh - 205px), 620px)"
                            : "100%",
                          maxWidth: "min(90vw, 620px)",
                        }}
                      >
                        {tiles.map((tile) => {
                          const selected = selectedTile === tile.id;
                          const clearing = clearingCells.has(tile.id);
                          const invalid = invalidMoveTiles.has(tile.id);

                          return (
                            <button
                              key={tile.id}
                              onClick={() => handleTileClick(tile.id)}
                              className={`aspect-square rounded-lg border font-black leading-none transition text-lg sm:text-2xl ${invalid ? "animate-[word-match-invalid-move_0.22s_ease-in-out] border-red-400 bg-red-500/20 text-red-100" : clearing
                                ? "border-emerald-400 bg-emerald-500 text-white opacity-40"
                                : selected
                                  ? "border-[#FACC15] bg-[#FACC15] text-[#0f172a] shadow-[0_0_18px_rgba(250,204,21,0.45)]"
                                  : palette.tile
                                }`}
                            >
                              {tile.letter}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className={`rounded-[1.5rem] border p-3 sm:p-4 ${palette.soft}`}>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#C4B5FD]">
                          Cleared Words
                        </p>
                        <Timer className={`h-4 w-4 ${palette.muted}`} />
                      </div>

                      <div className="mt-4 grid gap-2">
                        {wordsCleared.length === 0 ? (
                          <p className={`rounded-xl border px-3 py-3 text-sm font-bold ${palette.text} ${palette.soft}`}>
                            Swap adjacent letters to make a 5-letter Luna vocab word.
                          </p>
                        ) : (
                          wordsCleared.map((word, index) => (
                            <div
                              key={`${word}-${index}`}
                              className="flex items-center justify-between rounded-xl border border-emerald-400 bg-emerald-500/15 px-3 py-2"
                            >
                              <span className="font-black tracking-wide text-emerald-400">
                                {word}
                              </span>
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            </div>
                          ))
                        )}
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

        {!fullscreenActive && (
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
