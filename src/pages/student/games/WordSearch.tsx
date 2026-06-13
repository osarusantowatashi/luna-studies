import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, Moon, Search, Sun, Timer, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

type Pair = {
  left?: string;
  right?: string;
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

const grades = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"];
const difficulties = [
  { key: "Easy", words: 6, size: 10, seconds: 180 },
  { key: "Medium", words: 8, size: 12, seconds: 240 },
  { key: "Hard", words: 10, size: 14, seconds: 300 },
  { key: "Advanced", words: 12, size: 15, seconds: 360 },
];
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const directions = [
  [0, 1],
  [1, 0],
  [1, 1],
  [-1, 1],
  [0, -1],
  [-1, 0],
  [-1, -1],
  [1, -1],
];

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

const placeWord = (grid: string[][], word: string): PuzzleWord | null => {
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

const createPuzzle = (wordList: string[], size: number) => {
  const grid = createBlankGrid(size);
  const placedWords: PuzzleWord[] = [];

  wordList.forEach((word) => {
    const placed = placeWord(grid, word);

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
  const [grade, setGrade] = useState("Grade 1");
  const [difficulty, setDifficulty] = useState("Easy");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [cells, setCells] = useState<Cell[]>([]);
  const [puzzleWords, setPuzzleWords] = useState<PuzzleWord[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selectedCells, setSelectedCells] = useState<string[]>([]);
  const [selectionStart, setSelectionStart] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [score, setScore] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(getDifficultyConfig(difficulty).seconds);

  const config = getDifficultyConfig(difficulty);
  const isLight = theme === "light";
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
    boardCell: isLight
      ? "border-[#eee8ff] bg-white text-primary"
      : "border-white/10 bg-white/10 text-white",
  };

  useEffect(() => {
    const loadWords = async () => {
      const { data, error } = await supabase
        .from("game_questions")
        .select("language_pair, question_data")
        .eq("game_type", "memory_flip")
        .eq("grade", grade)
        .in("language_pair", ["zh_en", "en_ja"]);

      if (error) {
        setAvailableWords([]);
        return;
      }

      const words = Array.from(
        new Set(
          (data || [])
            .flatMap((set: any) => {
              const pairs: Pair[] = set.question_data?.pairs || [];

              if (set.language_pair !== "zh_en" && set.language_pair !== "en_ja") {
                return [];
              }

              return pairs.map((pair) =>
                set.language_pair === "zh_en" ? pair.right || "" : pair.left || ""
              );
            })
            .map(cleanEnglishWord)
            .filter((word) => word.length >= 3 && word.length <= 12)
        )
      );

      setAvailableWords(words);
    };

    loadWords();
  }, [grade]);

  useEffect(() => {
    if (!gameStarted || complete || expired) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [complete, expired, gameStarted]);

  const startGame = () => {
    setLoading(true);
    setErrorMsg("");
    setScore(0);
    setFoundWords([]);
    setSelectedCells([]);
    setSelectionStart(null);
    setSecondsLeft(config.seconds);

    if (availableWords.length < config.words) {
      setCells([]);
      setPuzzleWords([]);
      setGameStarted(true);
      setErrorMsg(`Not enough English words for ${grade} ${difficulty} yet.`);
      setLoading(false);
      return;
    }

    const chosenWords = shuffle(availableWords).slice(0, config.words);
    const puzzle = createPuzzle(chosenWords, config.size);

    if (puzzle.placedWords.length < config.words) {
      setErrorMsg("This puzzle could not fit all selected words. Try again.");
      setLoading(false);
      return;
    }

    setCells(puzzle.cells);
    setPuzzleWords(puzzle.placedWords);
    setGameStarted(true);
    setLoading(false);
  };

  const resetToMenu = () => {
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
    setSecondsLeft(config.seconds);
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

  const renderSelect = (
    label: string,
    value: string,
    options: { label: string; value: string }[] | string[],
    onChange: (value: string) => void
  ) => (
    <label className="block">
      <span className={`mb-2 block text-xs font-black uppercase tracking-[0.18em] ${palette.muted}`}>
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`h-12 w-full rounded-2xl border px-4 text-sm font-black outline-none ${isLight
          ? "border-[#eee8ff] bg-white text-primary"
          : "border-white/10 bg-[#0D1B2E] text-white"
          }`}
      >
        {options.map((option) => {
          const normalized =
            typeof option === "string" ? { label: option, value: option } : option;

          return (
            <option key={normalized.value} value={normalized.value}>
              {normalized.label}
            </option>
          );
        })}
      </select>
    </label>
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
        <div className={`mb-4 flex flex-wrap items-center justify-between gap-2 rounded-[1.2rem] border px-3 py-3 sm:rounded-[1.5rem] sm:px-5 sm:py-4 ${palette.panel}`}>
          <button
            onClick={() => navigate("/games")}
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

        {!gameStarted ? (
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

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
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
              {renderSelect("Grade", grade, grades, setGrade)}
              {renderSelect("Difficulty", difficulty, difficulties.map((item) => item.key), setDifficulty)}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {difficulties.map((item) => {
                const active = item.key === difficulty;

                return (
                  <button
                    key={item.key}
                    onClick={() => setDifficulty(item.key)}
                    className={`rounded-[1.4rem] border p-4 text-left transition hover:-translate-y-1 ${active
                      ? "border-[#8B5CF6] bg-[#8B5CF6]/20"
                      : palette.soft
                      }`}
                  >
                    <p className={`text-xs font-black uppercase tracking-widest ${palette.muted}`}>
                      {item.key}
                    </p>
                    <p className={`mt-2 text-3xl font-black ${palette.title}`}>{item.words}</p>
                    <p className={`text-sm font-bold ${palette.text}`}>Hidden words</p>
                  </button>
                );
              })}
            </div>

            <button
              onClick={startGame}
              className="mt-6 flex h-14 w-full items-center justify-center rounded-[1.6rem] bg-gradient-to-r from-[#8B5CF6] to-[#2563EB] text-base font-black text-white shadow-[0_15px_50px_rgba(99,102,241,0.45)] transition hover:scale-[1.01]"
            >
              START {difficulty.toUpperCase()} WORD SEARCH
            </button>
          </div>
        ) : (
          <div className={`rounded-[2rem] border p-3 sm:p-5 ${palette.panel}`}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#C4B5FD]">
                  Word Search
                </p>
                <p className={`mt-1 text-sm font-bold ${palette.title}`}>
                  English · {grade} · {difficulty}
                </p>
              </div>

              <button
                onClick={resetToMenu}
                className={`rounded-xl border px-4 py-2 text-sm font-black ${palette.button}`}
              >
                Exit
              </button>
            </div>

            <div className="mb-4 grid grid-cols-4 gap-2">
              {[
                ["Score", score],
                ["Found", `${foundWords.length}/${puzzleWords.length}`],
                ["Words", puzzleWords.length],
                ["Time", `${secondsLeft}s`],
              ].map(([label, value]) => (
                <div key={label} className={`rounded-xl px-2 py-2 text-center ${palette.soft}`}>
                  <p className={`text-[9px] font-black uppercase tracking-widest ${palette.muted}`}>
                    {label}
                  </p>
                  <p className={`mt-1 text-base font-black sm:text-xl ${label === "Time" && secondsLeft <= 20 ? "text-red-400" : palette.title}`}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {loading && (
              <div className={`rounded-[1.5rem] border p-8 text-center font-black ${palette.soft} ${palette.title}`}>
                Building puzzle...
              </div>
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
              <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
                <div className={`rounded-[1.5rem] border p-3 sm:p-4 ${palette.soft}`}>
                  <div
                    className="mx-auto grid touch-none select-none gap-1"
                    style={{
                      gridTemplateColumns: `repeat(${config.size}, minmax(0, 1fr))`,
                      maxWidth: "min(92vw, 640px)",
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
                          className={`aspect-square rounded-lg border text-[11px] font-black sm:text-base ${found
                            ? "border-emerald-400 bg-emerald-500 text-white"
                            : selected
                              ? "border-[#FACC15] bg-[#FACC15] text-[#0f172a]"
                              : palette.boardCell
                            }`}
                        >
                          {cell.letter}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className={`rounded-[1.5rem] border p-4 ${palette.soft}`}>
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

                  {(complete || expired) && (
                    <div className={`mt-5 rounded-2xl border p-4 text-center ${palette.soft}`}>
                      <Trophy className="mx-auto h-10 w-10 text-[#FACC15]" />
                      <h2 className={`mt-3 text-2xl font-black ${palette.title}`}>
                        {complete ? "Puzzle Cleared!" : "Time's Up!"}
                      </h2>
                      <p className={`mt-2 text-sm font-bold ${palette.text}`}>Score: {score}</p>
                      <button
                        onClick={startGame}
                        className="mt-4 h-12 w-full rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#2563EB] font-black text-white"
                      >
                        PLAY AGAIN
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
  );
}
