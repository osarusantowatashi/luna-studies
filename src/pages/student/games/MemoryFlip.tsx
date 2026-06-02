import { useEffect, useMemo, useState } from "react";
import { Zap, Sparkles, Brain, Flame, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

type Pair = {
  pair_id?: number;
  left: string;
  right: string;
  image_keyword?: string;
  image_url?: string;
  vocab_word?: string;
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

const shuffle = <T,>(array: T[]) => [...array].sort(() => Math.random() - 0.5);

const grades = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"];

const difficulties = ["Easy", "Medium", "Hard", "Advanced"];

const FALLBACK_IMAGE =
  "https://images.pexels.com/photos/256417/pexels-photo-256417.jpeg";

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

const getCardGridClass = (cardCount: number) => {
  if (cardCount <= 12) return "grid-cols-3 sm:grid-cols-4";
  if (cardCount <= 16) return "grid-cols-4";
  if (cardCount <= 20) return "grid-cols-4 sm:grid-cols-5";
  return "grid-cols-4 sm:grid-cols-6";
};

export default function MemoryFlip() {
  const navigate = useNavigate();

  const [languagePair, setLanguagePair] = useState("zh_en");
  const [grade, setGrade] = useState("Grade 1");
  const [difficulty, setDifficulty] = useState("Easy");
  const [unlockedDifficulty, setUnlockedDifficulty] = useState("Easy");

  const [activeGrade, setActiveGrade] = useState("Grade 1");
  const [cards, setCards] = useState<Card[]>([]);
  const [playedPairs, setPlayedPairs] = useState<PlayedPair[]>([]);
  const [testPool, setTestPool] = useState<PlayedPair[]>([]);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);

  const [moves, setMoves] = useState(0);
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [timeUp, setTimeUp] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

  const [showMasteryTest, setShowMasteryTest] = useState(false);
  const [masteryQuestions, setMasteryQuestions] = useState<any[]>([]);
  const [masteryIndex, setMasteryIndex] = useState(0);
  const [masteryCorrect, setMasteryCorrect] = useState(0);

  const pairCount = getPairCountByDifficulty(difficulty);
  const [secondsLeft, setSecondsLeft] = useState(getTimeLimit(pairCount, difficulty));

  const matchedCount = useMemo(
    () => cards.filter((card) => card.matched).length / 2,
    [cards]
  );

  const totalPairs = cards.length / 2;
  const isWin = !loading && totalPairs > 0 && matchedCount === totalPairs;
  const isGameEnded = isWin || timeUp;

  const languageLabel =
    languagePair === "zh_en"
      ? "Chinese ↔ English"
      : languagePair === "zh_ja"
        ? "Chinese ↔ Japanese"
        : "English ↔ Japanese";

  const playSound = (src: string, volume = 0.45) => {
    const audio = new Audio(src);
    audio.volume = volume;
    audio.play().catch(() => {});
  };

  const canUseDifficulty = (target: string) => {
    const unlockedIndex = difficulties.indexOf(unlockedDifficulty);
    const targetIndex = difficulties.indexOf(target);
    return targetIndex <= unlockedIndex;
  };

  useEffect(() => {
    loadProgress();
  }, [languagePair, grade]);

  useEffect(() => {
    if (!gameStarted || loading || errorMsg || isGameEnded || showMasteryTest) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          playSound("/sounds/time-up.mp3", 0.45);
          setTimeUp(true);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, loading, errorMsg, isGameEnded, showMasteryTest]);

  useEffect(() => {
    if (!isWin || showResultModal || showMasteryTest) return;

    if (level >= 5) {
      generateMasteryTest();
    } else {
      playSound("/sounds/success.mp3", 0.45);
      setShowResultModal(true);
    }
  }, [isWin, showResultModal, showMasteryTest, level]);

  const loadProgress = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("student_memory_flip_progress")
      .select("*")
      .eq("student_id", user.id)
      .eq("language_pair", languagePair)
      .eq("grade", grade)
      .maybeSingle();

    if (!data) {
      setUnlockedDifficulty("Easy");
      setDifficulty("Easy");
      return;
    }

    const currentUnlocked = data.unlocked_difficulty || "Easy";
    setUnlockedDifficulty(currentUnlocked);
    setDifficulty(currentUnlocked);
  };

  const findGameQuestion = async (
    selectedLanguagePair: string,
    selectedGrade: string,
    selectedDifficulty: string
  ) => {
    const { data, error } = await supabase
      .from("game_questions")
      .select("*")
      .eq("game_type", "memory_flip")
      .eq("language_pair", selectedLanguagePair)
      .eq("grade", selectedGrade)
      .eq("difficulty", selectedDifficulty)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return {
        pairs: [],
        usedGrade: selectedGrade,
      };
    }

    const allPairs = data.flatMap((questionSet) => {
      const pairs: Pair[] = questionSet.question_data?.pairs || [];

      return pairs.map((pair) => {
        const pairKey = `${selectedLanguagePair}_${selectedGrade}_${selectedDifficulty}_${pair.left}_${pair.right}`;

        return {
          ...pair,
          pairKey,
        };
      });
    });

    return {
      pairs: shuffle(allPairs),
      usedGrade: selectedGrade,
    };
  };

  const preloadImages = (imageUrls: string[]) => {
    imageUrls.forEach((url) => {
      if (!url) return;
      const img = new Image();
      img.src = url;
    });
  };

  const startGame = async () => {
    setGameStarted(true);
    setLevel(1);
    setTestPool([]);

    await loadGame({
      selectedLanguagePair: languagePair,
      selectedGrade: grade,
      selectedDifficulty: difficulty,
      selectedPairCount: getPairCountByDifficulty(difficulty),
    });
  };

  const loadGame = async ({
    selectedLanguagePair = languagePair,
    selectedGrade = grade,
    selectedDifficulty = difficulty,
    selectedPairCount = getPairCountByDifficulty(selectedDifficulty),
  } = {}) => {
    setLoading(true);
    setCards([]);
    setSelectedCards([]);
    setErrorMsg("");
    setTimeUp(false);
    setShowResultModal(false);

    const { pairs: rawPairs, usedGrade } = await findGameQuestion(
      selectedLanguagePair,
      selectedGrade,
      selectedDifficulty
    );

    if (!rawPairs || rawPairs.length < selectedPairCount) {
      setCards([]);
      setPlayedPairs([]);
      setErrorMsg(
        `Not enough ${selectedGrade} ${selectedDifficulty} Memory Flip pairs yet. Please ask admin to generate more pairs.`
      );
      setLoading(false);
      return;
    }

    const selectedPairs = rawPairs.slice(0, selectedPairCount);

    const pairs = selectedPairs.map((pair: any) => ({
      ...pair,
      image_url: pair.image_url || FALLBACK_IMAGE,
    }));

    const currentPlayedPairs: PlayedPair[] = pairs.map((pair: any) => ({
      pairKey: pair.pairKey,
      left: pair.left,
      right: pair.right,
      imageKeyword: pair.image_keyword,
    }));

    const newCards: Card[] = shuffle(
      pairs.flatMap((pair: any, index: number) => {
        const pairKey =
          pair.pairKey ||
          `${selectedLanguagePair}_${usedGrade || selectedGrade}_${selectedDifficulty}_${pair.left}_${pair.right}`;

        return [
          {
            id: `${index}-left`,
            pairId: index,
            pairKey,
            text: pair.left,
            imageKeyword: pair.image_keyword,
            imageUrl: pair.image_url || FALLBACK_IMAGE,
            flipped: false,
            matched: false,
          },
          {
            id: `${index}-right`,
            pairId: index,
            pairKey,
            text: pair.right,
            imageKeyword: pair.image_keyword,
            imageUrl: pair.image_url || FALLBACK_IMAGE,
            flipped: false,
            matched: false,
          },
        ];
      })
    );

    preloadImages(pairs.map((pair: any) => pair.image_url || FALLBACK_IMAGE));

    setActiveGrade(usedGrade || selectedGrade);
    setPlayedPairs(currentPlayedPairs);
    setTestPool((prev) => {
      const map = new Map(prev.map((pair) => [pair.pairKey, pair]));
      currentPlayedPairs.forEach((pair) => map.set(pair.pairKey, pair));
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
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: existingProgress } = await supabase
      .from("student_memory_flip_progress")
      .select("*")
      .eq("student_id", user.id)
      .eq("language_pair", languagePair)
      .eq("grade", grade)
      .maybeSingle();

    let nextDifficulty = existingProgress?.unlocked_difficulty || unlockedDifficulty;

    if (passed) {
      if (difficulty === "Easy") nextDifficulty = "Medium";
      else if (difficulty === "Medium") nextDifficulty = "Hard";
      else if (difficulty === "Hard") nextDifficulty = "Advanced";
      else nextDifficulty = "Advanced";
    }

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

  const generateMasteryTest = () => {
    const pool = testPool.length >= 5 ? testPool : playedPairs;
    const selected = shuffle(pool).slice(0, 5);

    if (selected.length < 5) {
      setErrorMsg("Not enough pairs for the final test. Please restart this difficulty.");
      return;
    }

    const questions = selected.map((pair) => {
      const wrongAnswers = shuffle(
        pool.filter((p) => p.right !== pair.right).map((p) => p.right)
      ).slice(0, 3);

      return {
        question: pair.left,
        imageKeyword: pair.imageKeyword,
        correctAnswer: pair.right,
        options: shuffle([pair.right, ...wrongAnswers]),
      };
    });

    setMasteryQuestions(questions);
    setMasteryIndex(0);
    setMasteryCorrect(0);
    setShowMasteryTest(true);
  };

  const submitMasteryAnswer = async (answer: string) => {
    const current = masteryQuestions[masteryIndex];
    const isCorrect = answer === current.correctAnswer;

    const nextCorrect = isCorrect ? masteryCorrect + 1 : masteryCorrect;
    const isLastQuestion = masteryIndex >= masteryQuestions.length - 1;

    if (!isLastQuestion) {
      setMasteryCorrect(nextCorrect);
      setMasteryIndex((prev) => prev + 1);
      return;
    }

    setShowMasteryTest(false);
    setShowResultModal(false);

    if (nextCorrect >= 4) {
      playSound("/sounds/success.mp3", 0.6);

      await saveProgress({
        passed: true,
        levelReached: level,
      });

      if (difficulty === "Easy") {
        setDifficulty("Medium");
        alert("Medium unlocked!");
      } else if (difficulty === "Medium") {
        setDifficulty("Hard");
        alert("Hard unlocked!");
      } else if (difficulty === "Hard") {
        setDifficulty("Advanced");
        alert("Advanced unlocked!");
      } else {
        alert("Advanced cleared! You can replay this level anytime.");
      }

      setLevel(1);
      setCombo(0);
      setScore(0);
      setMoves(0);
      setTestPool([]);
      setGameStarted(false);
    } else {
      alert("Final test failed. Try this difficulty again.");

      await saveProgress({
        passed: false,
        levelReached: level,
      });

      setLevel(1);
      setTestPool([]);

      await loadGame({
        selectedLanguagePair: languagePair,
        selectedGrade: grade,
        selectedDifficulty: difficulty,
        selectedPairCount: getPairCountByDifficulty(difficulty),
      });
    }
  };

  const leaveArcade = () => {
    setShowResultModal(false);
    setShowMasteryTest(false);
    setGameStarted(false);
    setCards([]);
    setSelectedCards([]);
    setMoves(0);
    setCombo(0);
    setScore(0);
    setLevel(1);
    setTestPool([]);
    setErrorMsg("");
    setLoading(false);
    setTimeUp(false);
  };

  const flipCard = (card: Card) => {
    if (isGameEnded) return;
    if (card.flipped || card.matched) return;
    if (selectedCards.length >= 2) return;

    playSound("/sounds/card-flip.mp3", 0.25);

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
        playSound("/sounds/mastery-test.mp3", 0.35);

        const newCombo = combo + 1;
        setCombo(newCombo);
        setScore((prev) => prev + 100 + newCombo * 20);

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

        setTimeout(() => {
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

  const stars = useMemo(() => {
    if (!isWin) return 0;
    if (moves <= totalPairs + 4 && secondsLeft > 10) return 3;
    if (moves <= totalPairs + 8) return 2;
    return 1;
  }, [isWin, moves, totalPairs, secondsLeft]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#071426]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[-120px] top-[-120px] h-[340px] w-[340px] rounded-full bg-[#8B5CF6]/20 blur-3xl" />
        <div className="absolute bottom-[-140px] right-[-100px] h-[380px] w-[380px] rounded-full bg-[#2563EB]/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_35%)]" />
      </div>

      {showMasteryTest && masteryQuestions[masteryIndex] && (
        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
          <div className="w-full max-w-3xl rounded-[2.8rem] border border-white/10 bg-white/5 p-8 shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="text-center">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#C4B5FD]">
                Final Test
              </p>

              <h1 className="mt-3 text-4xl font-black text-white sm:text-5xl">
                Final Check
              </h1>

              <p className="mt-3 text-slate-300">
                Question {masteryIndex + 1} / {masteryQuestions.length}
              </p>
            </div>

            <div className="mt-8 rounded-[2rem] border border-white/10 bg-[#0D1B2E] p-8 text-center">
              <p className="text-4xl font-black text-white">
                {masteryQuestions[masteryIndex].question}
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {masteryQuestions[masteryIndex].options.map((option: string) => (
                <button
                  key={option}
                  onClick={() => submitMasteryAnswer(option)}
                  className="min-h-[72px] rounded-[1.5rem] border border-white/10 bg-white/5 px-5 text-lg font-black text-white transition hover:-translate-y-1 hover:bg-[#8B5CF6]/20"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {!showMasteryTest && (
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6">
          {!gameStarted && (
            <button
              onClick={() => navigate("/games")}
              className="mb-5 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white hover:bg-white/10"
            >
              ← Back to Games Arcade
            </button>
          )}

          {!gameStarted && (
            <>
              <div className="mb-8 overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl">
                <div className="grid gap-8 p-8 lg:grid-cols-[1.2fr_420px] lg:p-10">
                  <div>
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#8B5CF6]/40 bg-[#8B5CF6]/10 px-4 py-2">
                      <Sparkles className="h-4 w-4 text-[#C4B5FD]" />

                      <span className="text-xs font-black uppercase tracking-[0.2em] text-[#C4B5FD]">
                        Luna Memory Arcade
                      </span>
                    </div>

                    <h1 className="max-w-2xl text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl">
                      Train Memory.
                      <br />
                      Master Vocabulary.
                    </h1>

                    <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
                      Match vocabulary cards, clear 5 stages, pass the final test,
                      and unlock the next difficulty.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-3">
                      <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                          Language
                        </p>
                        <p className="mt-1 text-sm font-bold text-white">
                          {languageLabel}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                          Grade
                        </p>
                        <p className="mt-1 text-sm font-bold text-white">
                          {grade}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                          Difficulty
                        </p>
                        <p className="mt-1 text-sm font-bold text-[#C4B5FD]">
                          {difficulty}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="relative hidden items-center justify-center lg:flex">
                    <div className="absolute h-[300px] w-[300px] rounded-full bg-[#8B5CF6]/30 blur-3xl" />

                    <motion.img
                      animate={{ y: [0, -12, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      src="/mascot/hapiko-step-2.png"
                      alt="Hapiko"
                      className="relative z-10 h-[320px] object-contain drop-shadow-[0_20px_60px_rgba(139,92,246,0.5)]"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
                <div className="grid gap-4 lg:grid-cols-3">
                  <select
                    value={languagePair}
                    onChange={(e) => setLanguagePair(e.target.value)}
                    className="h-16 rounded-3xl border border-white/10 bg-[#0D1B2E] px-5 text-sm font-black text-white outline-none"
                  >
                    <option value="zh_en">Chinese ↔ English</option>
                    <option value="zh_ja">Chinese ↔ Japanese</option>
                    <option value="en_ja">English ↔ Japanese</option>
                  </select>

                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="h-16 rounded-3xl border border-white/10 bg-[#0D1B2E] px-5 text-sm font-black text-white outline-none"
                  >
                    {grades.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>

                  <div className="flex h-16 items-center justify-center rounded-3xl border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-5 text-sm font-black text-[#C4B5FD]">
                    Current Difficulty: {difficulty}
                  </div>
                </div>

                <div className="mt-8 grid gap-4 lg:grid-cols-4">
                  {[
                    { key: "Easy", icon: Brain, pairs: 6, color: "border-[#52bd7f] bg-[#52bd7f]/20" },
                    { key: "Medium", icon: Zap, pairs: 8, color: "border-[#3B82F6] bg-[#3B82F6]/20" },
                    { key: "Hard", icon: Flame, pairs: 10, color: "border-[#F97316] bg-[#F97316]/20" },
                    { key: "Advanced", icon: Crown, pairs: 12, color: "border-[#EAB308] bg-[#EAB308]/20" },
                  ].map((item) => {
                    const Icon = item.icon;
                    const locked = !canUseDifficulty(item.key);
                    const active = difficulty === item.key;

                    return (
                      <button
                        key={item.key}
                        disabled={locked}
                        onClick={() => setDifficulty(item.key)}
                        className={`
                          relative overflow-hidden rounded-[2rem] border p-6 text-left transition-all duration-300
                          ${active ? item.color : "border-white/10 bg-white/5"}
                          ${locked ? "opacity-40 grayscale" : "hover:-translate-y-1"}
                        `}
                      >
                        <div className="absolute right-4 top-4">
                          <Icon className="h-6 w-6 text-white" />
                        </div>

                        <p className="text-sm font-black uppercase tracking-widest text-slate-300">
                          {item.key}
                        </p>

                        <h3 className="mt-3 text-3xl font-black text-white">
                          {item.pairs}
                        </h3>

                        <p className="mt-1 text-sm text-slate-400">
                          Matching Pairs
                        </p>

                        {locked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-white">
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
                  className="mt-8 flex h-16 w-full items-center justify-center rounded-[2rem] bg-gradient-to-r from-[#8B5CF6] to-[#2563EB] text-lg font-black text-white shadow-[0_15px_50px_rgba(99,102,241,0.45)] transition hover:scale-[1.01]"
                >
                  START {difficulty.toUpperCase()} CHALLENGE
                </button>
              </div>
            </>
          )}

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
                  <img
                    src="/mascot/hapiko-step-2.png"
                    alt="Hapiko"
                    className="mx-auto h-32 w-32 object-contain"
                  />

                  <p className="mt-4 text-sm font-black uppercase tracking-[0.25em] text-[#C4B5FD]">
                    Stage Cleared
                  </p>

                  <h2 className="mt-3 text-4xl font-black text-white">
                    Great Job!
                  </h2>

                  <p className="mt-4 text-slate-300">
                    You completed stage {level} / 5 for {difficulty}.
                  </p>

                  <p className="mt-3 text-3xl">
                    {"⭐".repeat(stars)}
                  </p>

                  <div className="mt-8 grid gap-3">
                    <button
                      onClick={async () => {
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
                      NEXT STAGE
                    </button>

                    <button
                      onClick={leaveArcade}
                      className="h-14 rounded-2xl border border-white/10 bg-white/5 font-black text-white"
                    >
                      Exit Game
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {gameStarted && (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-[#C4B5FD]">
                    Luna Memory Arcade
                  </p>

                  <p className="mt-1 text-sm font-bold text-white">
                    {languageLabel} · {grade} · {difficulty}
                  </p>
                </div>

                <button
                  onClick={leaveArcade}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-black text-white"
                >
                  Exit
                </button>
              </div>

              <div className="mb-6 rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-[#C4B5FD]">
                    {difficulty} Challenge
                  </p>

                  <p className="text-sm font-black text-white">
                    Stage {level} / 5
                  </p>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#2563EB] transition-all duration-500"
                    style={{ width: `${(level / 5) * 100}%` }}
                  />
                </div>
              </div>

              <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Score
                  </p>
                  <p className="mt-2 text-3xl font-black text-white">
                    {score}
                  </p>
                </div>

                <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Moves
                  </p>
                  <p className="mt-2 text-3xl font-black text-white">
                    {moves}
                  </p>
                </div>

                <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Combo
                  </p>
                  <p className="mt-2 text-3xl font-black text-[#FACC15]">
                    x{combo}
                  </p>
                </div>

                <div
                  className={`rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl ${
                    secondsLeft <= 10 ? "animate-pulse border-red-400" : ""
                  }`}
                >
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Timer
                  </p>

                  <p
                    className={`mt-2 text-3xl font-black ${
                      secondsLeft <= 10 ? "text-red-400" : "text-white"
                    }`}
                  >
                    {secondsLeft}s
                  </p>
                </div>
              </div>

              {loading && (
                <div className="mb-6 rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center text-lg font-black text-white">
                  Loading Memory Flip...
                </div>
              )}

              {errorMsg && !loading && (
                <div className="mb-6 rounded-[2rem] border border-[#FACC15]/30 bg-[#FACC15]/10 p-8 text-center">
                  <img
                    src="/mascot/hapiko-step-2.png"
                    alt="Hapiko"
                    className="mx-auto h-24 w-24 object-contain"
                  />

                  <h2 className="mt-4 text-2xl font-black text-white">
                    Not Enough Pairs
                  </h2>

                  <p className="mt-3 text-slate-300">
                    {errorMsg}
                  </p>

                  <button
                    onClick={leaveArcade}
                    className="mt-6 h-12 rounded-2xl bg-white px-6 font-black text-[#071426]"
                  >
                    Back to Memory Flip Menu
                  </button>
                </div>
              )}

              {timeUp && (
                <div className="mb-6 rounded-[2rem] border border-red-400/30 bg-red-500/10 p-8 text-center">
                  <img
                    src="/mascot/hapiko-step-2.png"
                    alt="Hapiko"
                    className="mx-auto h-24 w-24 object-contain"
                  />

                  <h2 className="mt-4 text-3xl font-black text-white">
                    Time's Up!
                  </h2>

                  <p className="mt-3 text-slate-300">
                    Try this stage again.
                  </p>

                  <button
                    onClick={leaveArcade}
                    className="mt-6 h-12 rounded-2xl bg-white px-6 font-black text-[#071426]"
                  >
                    Back to Memory Flip Menu
                  </button>
                </div>
              )}

              {!loading && !errorMsg && !timeUp && (
                <div
                  className={`mx-auto grid max-w-5xl justify-center gap-2 sm:gap-3 ${getCardGridClass(
                    cards.length
                  )}`}
                >
                  {cards.map((card) => {
                    const visible = card.flipped || card.matched;

                    return (
                      <motion.button
                        whileHover={{ y: -6 }}
                        whileTap={{ scale: 0.97 }}
                        key={card.id}
                        onClick={() => flipCard(card)}
                        className={`
                          relative overflow-hidden rounded-[2rem] border transition-all duration-300
                          h-[96px] w-[118px] justify-self-center sm:h-[110px] sm:w-[132px] lg:h-[118px] lg:w-[140px]
                          ${
                            visible
                              ? "border-white/10 bg-white/10 backdrop-blur-xl"
                              : "border-[#1E2F4A] bg-gradient-to-br from-[#12243A] to-[#091423]"
                          }
                          ${
                            card.matched
                              ? "border-emerald-400 bg-emerald-500/15 opacity-80"
                              : ""
                          }
                        `}
                      >
                        {!visible && (
                          <>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_50%)]" />

                            <div className="flex h-full items-center justify-center">
                              <div className="h-[68px] w-[68px] rounded-[1.2rem] border-[6px] border-white bg-[#F6C65B] shadow-[0_8px_0_rgba(0,0,0,0.18)]" />
                            </div>
                          </>
                        )}

                        {visible && (
                          <div className="flex h-full flex-col items-center justify-center p-4">
                            <img
                              src={card.imageUrl || FALLBACK_IMAGE}
                              alt={card.text}
                              className="h-16 w-16 rounded-2xl object-cover shadow-lg sm:h-20 sm:w-20"
                              onError={(e) => {
                                e.currentTarget.src = FALLBACK_IMAGE;
                              }}
                            />

                            <p className="mt-2 text-center text-sm font-black text-white sm:text-base">
                              {card.text}
                            </p>
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}