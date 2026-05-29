import { useEffect, useMemo, useState } from "react";
import {
  Zap,
  Sparkles,
  Brain,
  Flame,
  Crown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";


type Pair = {
  pair_id?: number;
  left: string;
  right: string;
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

const shuffle = <T,>(array: T[]) => [...array].sort(() => Math.random() - 0.5);

const grades = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"];

const FALLBACK_IMAGE =
  "https://images.pexels.com/photos/256417/pexels-photo-256417.jpeg";

const getNextGrade = (currentGrade: string) => {
  const index = grades.indexOf(currentGrade);
  return grades[index + 1] || null;
};

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



export default function MemoryFlip() {
  const [languagePair, setLanguagePair] = useState("zh_en");
  const [grade, setGrade] = useState("Grade 1");
  const [difficulty, setDifficulty] = useState("Easy");
  const [unlockedDifficulty, setUnlockedDifficulty] = useState("Easy");
  const [gradeCleared, setGradeCleared] = useState(false);
  const [nextReviewAt, setNextReviewAt] = useState<string | null>(null);

  const [activeGrade, setActiveGrade] = useState("Grade 1");
  const [cards, setCards] = useState<Card[]>([]);
  const [playedPairs, setPlayedPairs] = useState<PlayedPair[]>([]);
  const [masteryPool, setMasteryPool] = useState<PlayedPair[]>([]);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [moves, setMoves] = useState(0);
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [timeUp, setTimeUp] = useState(false);
  const [historySaved, setHistorySaved] = useState(false);

  const [gameStarted, setGameStarted] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showMasteryTest, setShowMasteryTest] = useState(false);
  const [masteryQuestions, setMasteryQuestions] = useState<any[]>([]);
  const [masteryIndex, setMasteryIndex] = useState(0);
  const [masteryCorrect, setMasteryCorrect] = useState(0);
  const [level, setLevel] = useState(1);
  const pairCount = getPairCountByDifficulty(difficulty);

  const [secondsLeft, setSecondsLeft] = useState(
    getTimeLimit(pairCount, difficulty)
  );


  const matchedCount = useMemo(
    () => cards.filter((card) => card.matched).length / 2,
    [cards]
  );

  const totalPairs = cards.length / 2;
  const isWin = totalPairs > 0 && matchedCount === totalPairs;
  const isGameEnded = isWin || timeUp;


  useEffect(() => {
    if (loading || errorMsg || isGameEnded) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeUp(true);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, errorMsg, isGameEnded]);

  useEffect(() => {
    loadProgress();

  }, [languagePair, grade]);

  const findGameQuestion = async (
    selectedLanguagePair: string,
    selectedGrade: string,
    selectedDifficulty: string,
    selectedPairCount: number
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    let currentGrade: string | null = selectedGrade;

    while (currentGrade) {
      const { data, error } = await supabase
        .from("game_questions")
        .select("*")
        .eq("game_type", "memory_flip")
        .eq("language_pair", selectedLanguagePair)
        .eq("grade", currentGrade)
        .eq("difficulty", selectedDifficulty)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        let recentPairKeys: string[] = [];

        if (user) {
          const { data: recentHistory } = await supabase
            .from("student_game_pair_history")
            .select("pair_key")
            .eq("student_id", user.id)
            .eq("game_type", "memory_flip")
            .eq("language_pair", selectedLanguagePair)
            .eq("grade", currentGrade)
            .eq("difficulty", selectedDifficulty)
            .gte("last_seen_at", sevenDaysAgo.toISOString());

          recentPairKeys = recentHistory?.map((item) => item.pair_key) || [];
        }

        const allAvailablePairs = data.flatMap((questionSet) => {
          const pairs: Pair[] = questionSet.question_data?.pairs || [];

          return pairs
            .map((pair) => {
              const pairKey = `${selectedLanguagePair}_${currentGrade}_${selectedDifficulty}_${pair.left}_${pair.right}`;

              return {
                ...pair,
                pairKey,
                questionSet,
              };
            })
            .filter((pair) => !recentPairKeys.includes(pair.pairKey));
        });

        if (allAvailablePairs.length >= selectedPairCount) {
          return {
            pairs: shuffle(allAvailablePairs).slice(0, selectedPairCount),
            usedGrade: currentGrade,
          };
        }
      }

      currentGrade = getNextGrade(currentGrade);
    }

    return {
      pairs: [],
      usedGrade: null,
    };
  };

  const preloadImages = (imageUrls: string[]) => {
    imageUrls.forEach((url) => {
      if (!url) return;

      const img = new Image();
      img.src = url;
    });
  };

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
      setGradeCleared(false);
      setNextReviewAt(null);
      return;
    }

    const currentUnlockedDifficulty = data.unlocked_difficulty || "Easy";

    setUnlockedDifficulty(currentUnlockedDifficulty);

    setDifficulty((prev) => prev || "Easy");

    setGradeCleared(data.grade_cleared || false);
    setNextReviewAt(data.next_review_at || null);
  };

  const startGame = async () => {

    if (isReviewLocked) {
      alert(`You already cleared this grade! Come back after ${reviewDateText} to review again.`);
      return;
    }

    setGameStarted(true);
    setMasteryPool([]);
    setLevel(1);

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
    setErrorMsg("");
    setTimeUp(false);


    const { pairs: rawPairs, usedGrade } = await findGameQuestion(
      selectedLanguagePair,
      selectedGrade,
      selectedDifficulty,
      selectedPairCount
    );

    const imageKeywords = rawPairs
      .map((pair: any) => pair.image_keyword)
      .filter(Boolean);

    const { data: approvedImages } = await supabase
      .from("vocab_images")
      .select("keyword, image_url, status")
      .in("keyword", imageKeywords)
      .eq("status", "approved");

    const approvedImageMap = new Map(
      (approvedImages || []).map((img) => [img.keyword, img.image_url])
    );

    const pairs = rawPairs
      .map((pair: any) => ({
        ...pair,
        image_url: approvedImageMap.get(pair.image_keyword) || null,
      }))
      .filter((pair: any) => pair.image_url);

    if (!pairs.length || !usedGrade) {
      setCards([]);
      setActiveGrade(selectedGrade);
      setPlayedPairs([]);
      setErrorMsg(
        `Hapiko noticed that you have completed all available ${grade} ${difficulty} vocabulary for now. You can try the next difficulty, or come back next week for review.`
      );
      setLoading(false);
      return;
    }


    const currentPlayedPairs: PlayedPair[] = pairs.map((pair) => ({
      pairKey: pair.pairKey,
      left: pair.left,
      right: pair.right,
      imageKeyword: pair.image_keyword,
    }));


    const newCards: Card[] = shuffle(
      pairs.flatMap((pair, index) => {
        const pairKey = `${selectedLanguagePair}_${usedGrade || selectedGrade}_${selectedDifficulty}_${pair.left}_${pair.right}`;

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

    const imageUrls = pairs
      .map((pair) => pair.image_url)
      .filter(Boolean) as string[];

    preloadImages(imageUrls);

    setActiveGrade(usedGrade || selectedGrade);
    setPlayedPairs(currentPlayedPairs);
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
    setHistorySaved(false);
    setSecondsLeft(getTimeLimit(selectedPairCount, selectedDifficulty));
    setLoading(false);
  };

  const saveHistory = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || playedPairs.length === 0 || historySaved) return;

    const payload = playedPairs.map((pair) => ({
      student_id: user.id,
      game_type: "memory_flip",
      language_pair: languagePair,
      grade: activeGrade,
      difficulty,
      pair_key: pair.pairKey,
      left_text: pair.left,
      right_text: pair.right,
      image_keyword: pair.imageKeyword || null,
      last_seen_at: new Date().toISOString(),
    }));

    await supabase.from("student_game_pair_history").upsert(payload, {
      onConflict:
        "student_id,game_type,language_pair,grade,difficulty,pair_key",
    });
    setHistorySaved(true);
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
    let isGradeCleared = existingProgress?.grade_cleared || false;
    let clearedAtValue = existingProgress?.cleared_at || null;
    let nextReviewAtValue = existingProgress?.next_review_at || null;

    if (passed) {
      if (difficulty === "Easy") nextDifficulty = "Medium";
      else if (difficulty === "Medium") nextDifficulty = "Hard";
      else if (difficulty === "Hard") nextDifficulty = "Advanced";
      else if (difficulty === "Advanced") {
        isGradeCleared = true;
        clearedAtValue = new Date().toISOString();

        const reviewDate = new Date();
        reviewDate.setDate(reviewDate.getDate() + 7);
        nextReviewAtValue = reviewDate.toISOString();
      }
    }

    await supabase.from("student_memory_flip_progress").upsert(
      {
        student_id: user.id,
        language_pair: languagePair,
        grade,
        unlocked_difficulty: nextDifficulty,
        highest_level: Math.max(existingProgress?.highest_level || 1, levelReached),
        mastery_passed: passed || existingProgress?.mastery_passed || false,
        grade_cleared: isGradeCleared,
        cleared_at: clearedAtValue,
        next_review_at: nextReviewAtValue,
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
    setGradeCleared(isGradeCleared);
    setNextReviewAt(nextReviewAtValue);
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
      await saveProgress({
        passed: true,
        levelReached: level,
      });

      if (difficulty === "Easy") {
        setUnlockedDifficulty("Medium");
        setDifficulty("Medium");
        alert("Medium unlocked!");
      } else if (difficulty === "Medium") {
        setUnlockedDifficulty("Hard");
        setDifficulty("Hard");
        alert("Hard unlocked!");
      } else if (difficulty === "Hard") {
        setUnlockedDifficulty("Advanced");
        setDifficulty("Advanced");
        alert("Advanced unlocked!");
      } else {
        setGradeCleared(true);
        alert("Grade Cleared!");
      }

      setLevel(1);
      setCombo(0);
      setScore(0);
      setMoves(0);
      setMasteryPool([]);
      setGameStarted(false);
    } else {
      alert("Mastery test failed. Try this difficulty again.");

      await saveProgress({
        passed: false,
        levelReached: level,
      });

      setLevel(1);
      setMasteryPool([]);

      await loadGame({
        selectedLanguagePair: languagePair,
        selectedGrade: grade,
        selectedDifficulty: difficulty,
        selectedPairCount: getPairCountByDifficulty(difficulty),
      });
    }
  };

  useEffect(() => {
    if (!isWin || showResultModal || showMasteryTest) return;

    saveHistory();

    if (level >= 5) {
      generateMasteryTest();
    } else {
      setShowResultModal(true);
    }
  }, [isWin]);


  const generateMasteryTest = async () => {
    const shuffled = shuffle(masteryPool);
    const selected = shuffled.slice(0, 5);

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
    setMasteryIndex(0);
    setMasteryCorrect(0);
    setShowMasteryTest(true);
  };

  const leaveArcade = () => {
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
  };

  const flipCard = (card: Card) => {
    if (isGameEnded) return;
    if (card.flipped || card.matched) return;
    if (selectedCards.length >= 2) return;

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


  const isReviewLocked =
    gradeCleared &&
    nextReviewAt &&
    new Date(nextReviewAt).getTime() > Date.now();

  const reviewDateText = nextReviewAt
    ? new Date(nextReviewAt).toLocaleDateString()
    : "";


  const languageLabel =
    languagePair === "zh_en"
      ? "Chinese ↔ English"
      : languagePair === "zh_ja"
        ? "Chinese ↔ Japanese"
        : "English ↔ Japanese";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#071426]">
      {/* BACKGROUND */}
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
                Mastery Test
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
          {/* HERO */}
          {!gameStarted && (
            <>
              {/* HERO */}
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
                      Match vocabulary cards, clear harder challenges,
                      and unlock advanced memory stages with Hapiko.
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
                      animate={{
                        y: [0, -12, 0],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                      }}
                      src="/mascot/hapiko-step-2.png"
                      alt="Hapiko"
                      className="relative z-10 h-[320px] object-contain drop-shadow-[0_20px_60px_rgba(139,92,246,0.5)]"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {!gameStarted && (
            <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
              {/* SELECTORS */}
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

              {/* DIFFICULTY */}
              <div className="mt-8 grid gap-4 lg:grid-cols-4">
                {[
                  {
                    key: "Easy",
                    icon: Brain,
                    pairs: 6,
                    color:
                      difficulty === "Easy"
                        ? "border-[#52bd7f] bg-[#52bd7f]/20"
                        : "border-white/10 bg-white/5",
                  },
                  {
                    key: "Medium",
                    icon: Zap,
                    pairs: 8,
                    color:
                      difficulty === "Medium"
                        ? "border-[#3B82F6] bg-[#3B82F6]/20"
                        : "border-white/10 bg-white/5",
                  },
                  {
                    key: "Hard",
                    icon: Flame,
                    pairs: 10,
                    color:
                      difficulty === "Hard"
                        ? "border-[#F97316] bg-[#F97316]/20"
                        : "border-white/10 bg-white/5",
                  },
                  {
                    key: "Advanced",
                    icon: Crown,
                    pairs: 12,
                    color:
                      difficulty === "Advanced"
                        ? "border-[#EAB308] bg-[#EAB308]/20"
                        : "border-white/10 bg-white/5",
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  const locked =
                    (item.key === "Medium" &&
                      unlockedDifficulty === "Easy") ||
                    (item.key === "Hard" &&
                      !["Hard", "Advanced"].includes(unlockedDifficulty)) ||
                    (item.key === "Advanced" &&
                      unlockedDifficulty !== "Advanced");

                  return (
                    <button
                      key={item.key}
                      disabled={locked}
                      onClick={() => setDifficulty(item.key)}
                      className={`
                      relative overflow-hidden rounded-[2rem] border p-6 text-left transition-all duration-300
                      ${item.color}
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

              {/* START */}
              <button
                onClick={startGame}
                disabled={!!isReviewLocked}
                className={`mt-8 flex h-16 w-full items-center justify-center rounded-[2rem] text-lg font-black text-white shadow-[0_15px_50px_rgba(99,102,241,0.45)] transition ${isReviewLocked
                  ? "cursor-not-allowed bg-slate-600 opacity-50"
                  : "bg-gradient-to-r from-[#8B5CF6] to-[#2563EB] hover:scale-[1.01]"
                  }`}
              >
                {isReviewLocked
                  ? `REVIEW AVAILABLE AFTER ${reviewDateText}`
                  : `START ${difficulty.toUpperCase()} CHALLENGE`}
              </button>
            </div>
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
                    Challenge Cleared
                  </p>

                  <h2 className="mt-3 text-4xl font-black text-white">
                    Great Job!
                  </h2>

                  <p className="mt-4 text-slate-300">
                    You completed challenge {level} / 5 for {difficulty}.
                  </p>

                  <p className="mt-3 text-3xl">
                    {"⭐".repeat(stars)}
                  </p>

                  <div className="mt-8 grid gap-3">
                    <button
                      onClick={async () => {
                        const nextLevel = level + 1;

                        setShowResultModal(false);

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
                      NEXT CHALLENGE
                    </button>

                    <button
                      onClick={() => {
                        setShowResultModal(false);
                        setGameStarted(false);
                      }}
                      className="h-14 rounded-2xl border border-white/10 bg-white/5 font-black text-white"
                    >
                      Exit Game
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* GAME */}
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
                    Round {level} / 5
                  </p>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#2563EB] transition-all duration-500"
                    style={{ width: `${(level / 5) * 100}%` }}
                  />
                </div>
              </div>
              {/* HUD */}
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
                  className={`
                  rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl
                  ${secondsLeft <= 10 ? "animate-pulse border-red-400" : ""}
                `}
                >
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Timer
                  </p>

                  <p
                    className={`
                    mt-2 text-3xl font-black
                    ${secondsLeft <= 10 ? "text-red-400" : "text-white"}
                  `}
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
                    Stage Completed
                  </h2>

                  <p className="mt-3 text-slate-300">
                    {errorMsg}
                  </p>

                  <button
                    onClick={leaveArcade}
                    className="mt-6 h-12 rounded-2xl bg-white px-6 font-black text-[#071426]"
                  >
                    Back to Arcade
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
                    Hapiko believes you can clear this stage next time.
                  </p>

                  <button
                    onClick={leaveArcade}
                    className="mt-6 h-12 rounded-2xl bg-white px-6 font-black text-[#071426]"
                  >
                    Return to Arcade
                  </button>
                </div>
              )}

              {/* CARDS */}
              {!loading && !errorMsg && !timeUp && (
                <div
                  className={`
                grid gap-3
                grid-cols-3
                sm:grid-cols-4
                ${difficulty === "Hard" ? "lg:grid-cols-5" : ""}
                ${difficulty === "Advanced" ? "lg:grid-cols-6" : ""}
                ${difficulty === "Easy" || difficulty === "Medium" ? "lg:grid-cols-4" : ""}
              `}
                >
                  {cards.map((card) => {
                    const visible = card.flipped || card.matched;

                    return (
                      <motion.button
                        whileHover={{
                          y: -6,
                        }}
                        whileTap={{
                          scale: 0.97,
                        }}
                        key={card.id}
                        onClick={() => flipCard(card)}
                        className={`
                      relative overflow-hidden rounded-[2rem] border transition-all duration-300
                      h-[115px] sm:h-[125px] lg:h-[135px]
                      ${visible
                            ? "border-white/10 bg-white/10 backdrop-blur-xl"
                            : "border-[#1E2F4A] bg-gradient-to-br from-[#12243A] to-[#091423]"
                          }
                      ${card.matched
                            ? "border-[#FACC15] shadow-[0_0_40px_rgba(250,204,21,0.35)]"
                            : ""
                          }
                    `}
                      >
                        {!visible && (
                          <>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_50%)]" />

                            <div className="flex h-full items-center justify-center">
                              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
                                <Brain className="h-8 w-8 text-[#C4B5FD]" />
                              </div>
                            </div>
                          </>
                        )}

                        {visible && (
                          <div className="flex h-full flex-col items-center justify-center p-4">
                            <img
                              src={card.imageUrl || FALLBACK_IMAGE}
                              alt={card.text}
                              className="h-12 w-12 rounded-xl object-cover shadow-lg sm:h-14 sm:w-14"
                              onError={(e) => {
                                e.currentTarget.src = FALLBACK_IMAGE;
                              }}
                            />

                            <p className="mt-2 text-center text-xs font-black text-white sm:text-sm">
                              {card.text}
                            </p>

                            {card.matched && (
                              <div className="mt-3 rounded-full bg-[#FACC15]/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-[#FACC15]">
                                Matched
                              </div>
                            )}
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