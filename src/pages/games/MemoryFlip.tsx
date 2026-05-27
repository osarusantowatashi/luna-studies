import { useEffect, useMemo, useState } from "react";
import { RotateCcw, Trophy, Zap, Clock, MousePointerClick } from "lucide-react";
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

const getPairCountByLevel = (level: number) => {
  if (level === 1) return 6;
  if (level === 2) return 8;
  if (level === 3) return 10;
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
  const pairCount = getPairCountByLevel(level);

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

    setDifficulty(currentUnlockedDifficulty);

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
      selectedPairCount: getPairCountByLevel(1),
    });
  };

  const loadGame = async ({
    selectedLanguagePair = languagePair,
    selectedGrade = grade,
    selectedDifficulty = difficulty,
    selectedPairCount = pairCount,
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
        "No new Memory Flip questions available. Please ask admin to generate more game questions."
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

    let nextDifficulty = difficulty;
    let isGradeCleared = existingProgress?.grade_cleared || false;
    let clearedAtValue = existingProgress?.cleared_at || null;
    let nextReviewAtValue = existingProgress?.next_review_at || null;

    if (passed) {
      if (difficulty === "Easy") {
        nextDifficulty = "Medium";
      } else if (difficulty === "Medium") {
        nextDifficulty = "Hard";
      } else if (difficulty === "Hard") {
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
  };

  useEffect(() => {
    if (isWin) {

      saveHistory();

      if (level >= 4) {
        setShowResultModal(false);
        generateMasteryTest();
      } else {
        setShowResultModal(true);
      }
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
      }

      else if (difficulty === "Medium") {
        setUnlockedDifficulty("Hard");
      }

      else if (difficulty === "Hard") {
        setGradeCleared(true);
      }

      if (difficulty === "Hard") {
        alert("Grade Cleared!");
      } else {
        alert("New difficulty unlocked!");
      }

      setLevel(1);
      setCombo(0);
      setScore(0);
      setMoves(0);


      setGameStarted(false);
    } else {
      alert("FAIL");
      setMasteryPool([]);
      await saveProgress({
        passed: false,
        levelReached: level,
      });

      setLevel(1);

      await loadGame({
        selectedLanguagePair: languagePair,
        selectedGrade: grade,
        selectedDifficulty: difficulty,
        selectedPairCount: getPairCountByLevel(1),
      });
    }
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
  const levelStages = [
    {
      level: 1,
      title: "Warm Up",
      pairs: 6,
      icon: "🌱",
    },
    {
      level: 2,
      title: "Memory Boost",
      pairs: 8,
      icon: "⚡",
    },
    {
      level: 3,
      title: "Speed Match",
      pairs: 10,
      icon: "🔥",
    },
    {
      level: 4,
      title: "Master Gate",
      pairs: 12,
      icon: "👑",
    },
  ];
  return (
    <div className="min-h-screen bg-[#F6F8FC] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#8d73ff]">
              Luna Learning Arcade
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-tight text-[#082A55] sm:text-5xl">
              Memory Flip
            </h1>

            <p className="mt-3 max-w-xl text-slate-500">
              Choose your level, beat the timer, and match the correct language pairs.
            </p>
          </div>

          {gameStarted && (
            <button
              onClick={() =>
                loadGame({
                  selectedLanguagePair: languagePair,
                  selectedGrade: grade,
                  selectedDifficulty: difficulty,
                  selectedPairCount: pairCount,
                })
              }
              className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#082A55] px-6 text-sm font-bold text-white shadow-lg transition hover:bg-[#123A70]"
            >
              <RotateCcw className="h-4 w-4" />
              Retry Challenge
            </button>
          )}
        </div>

        {!gameStarted && (
          <div className="mb-8 rounded-[2.5rem] border border-[#DDE7F5] bg-white p-8 shadow-[0_20px_60px_rgba(8,42,85,0.08)]">
            <div className="mb-8 flex flex-col items-center gap-4 text-center">
              <img
                src="/mascot/hapiko-step-2.png"
                alt="Hapiko"
                className="h-24 w-24 object-contain"
              />

              <div>
                <h2 className="text-3xl font-black text-[#082A55]">
                  Ready for your Memory Challenge?
                </h2>

                <p className="mt-2 text-slate-500">
                  Match the word pairs, clear 4 levels, then Hapiko will give you a mastery test.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">

              <select
                value={languagePair}
                onChange={(e) => {
                  setLanguagePair(e.target.value);
                  setLevel(1);

                }}
                className="h-14 rounded-2xl border border-[#D8E3F2] bg-[#F8FAFF] px-4 text-sm font-black text-[#082A55]"
              >
                <option value="zh_en">Chinese ↔ English</option>
                <option value="zh_ja">Chinese ↔ Japanese</option>
                <option value="en_ja">English ↔ Japanese</option>
              </select>

              <select

                value={grade}

                onChange={(e) => {

                  setGrade(e.target.value);

                  setLevel(1);



                }}
                className="h-14 rounded-2xl border border-[#D8E3F2] bg-[#F8FAFF] px-4 text-sm font-black text-[#082A55]"
              >
                {grades.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                    {grade === item && gradeCleared ? " ✅" : ""}
                  </option>
                ))}
              </select>

              <div className="flex h-14 items-center justify-center rounded-2xl border border-[#D8E3F2] bg-[#EEF3FF] px-4 text-sm font-black text-[#082A55]">
                Current Difficulty:
                <span className="ml-2 text-[#8d73ff]">
                  {unlockedDifficulty}
                </span>
              </div>


            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3">

              <div className="rounded-full bg-[#EEF3FF] px-5 py-2 font-bold text-[#082A55]">
                {languageLabel}
              </div>

              <div className="rounded-full bg-[#FFF7E3] px-5 py-2 font-bold text-[#082A55]">
                {grade}
              </div>

              <div className="rounded-full bg-[#F1EEFF] px-5 py-2 font-bold text-[#082A55]">
                {difficulty}
              </div>

              <div className="rounded-full bg-[#EFFFF6] px-5 py-2 font-bold text-[#082A55]">
                {pairCount} Pairs
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center">
                {levelStages.map((stage, index) => {
                  const isCurrent = level === stage.level;
                  const isUnlocked = stage.level <= level;

                  return (
                    <div
                      key={stage.level}
                      className="flex items-center"
                    >
                      <div
                        className={`
          relative rounded-[2rem] border p-5 text-center transition-all duration-300
          w-[170px]
          ${isCurrent
                            ? "border-[#8d73ff] bg-[#F1EEFF] shadow-[0_10px_40px_rgba(141,115,255,0.35)] scale-[1.05]"
                            : isUnlocked
                              ? "border-[#DDE7F5] bg-white"
                              : "border-slate-200 bg-slate-50 opacity-50"
                          }
        `}
                      >
                        {isCurrent && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#8d73ff] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                            Current
                          </div>
                        )}

                        <div className="text-5xl">
                          {stage.icon}
                        </div>

                        <p className="mt-4 text-sm font-black text-[#082A55]">
                          Level {stage.level}
                        </p>

                        <p className="mt-1 text-xs font-bold text-slate-500">
                          {stage.title}
                        </p>

                        <div className="mt-4 rounded-full bg-white px-3 py-1 text-xs font-black text-[#8d73ff]">
                          {stage.pairs} pairs
                        </div>
                      </div>

                      {index < levelStages.length - 1 && (
                        <div className="hidden sm:flex w-12 items-center justify-center">
                          <div
                            className={`
              h-1 w-full rounded-full
              ${stage.level < level
                                ? "bg-[#8d73ff]"
                                : "bg-slate-200"
                              }
            `}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>


            </div>

            {gradeCleared && (
              <div className="mt-6 rounded-3xl border border-[#52bd7f] bg-[#f0fff6] p-4 text-center">
                <p className="text-lg font-black text-[#16824b]">
                  Grade Cleared ✅
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {isReviewLocked
                    ? `Hapiko will review this grade with you again after ${reviewDateText}.`
                    : "Review is ready! Hapiko can test your memory again."}
                </p>
              </div>
            )}
            <button
              onClick={startGame}
              disabled={!!isReviewLocked}
              className={`mt-8 flex h-16 w-full items-center justify-center rounded-[1.8rem] text-lg font-black text-white shadow-xl transition ${isReviewLocked
                  ? "cursor-not-allowed bg-slate-300"
                  : "bg-[#082A55] hover:scale-[1.01] hover:bg-[#123A70]"
                }`}
            >
              {gradeCleared ? "START REVIEW" : `START LEVEL ${level}`}
            </button>
          </div>
        )}
        {gameStarted && (
          <>
            {showMasteryTest && masteryQuestions[masteryIndex] && (

              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

                <div className="w-full max-w-xl rounded-[2rem] bg-white p-8 shadow-2xl">

                  <img
                    src="/mascot/hapiko-step-2.png"
                    alt="Hapiko"
                    className="mx-auto h-28 w-28 object-contain"
                  />

                  <h2 className="mt-4 text-center text-3xl font-black text-[#082A55]">
                    Mastery Test
                  </h2>

                  <p className="mt-2 text-center text-slate-500">
                    Hapiko is testing your memory!
                  </p>

                  <div className="mt-8">

                    <div className="rounded-3xl bg-[#F8FAFF] p-6 text-center">

                      <p className="text-4xl font-black text-[#082A55]">
                        {masteryQuestions[masteryIndex].question}
                      </p>

                    </div>

                    <div className="mt-6 grid gap-4">

                      {masteryQuestions[masteryIndex].options.map((option: string) => (

                        <button
                          key={option}
                          onClick={() => submitMasteryAnswer(option)}
                          className="rounded-2xl border border-[#D8E3F2] bg-white p-4 text-lg font-bold text-[#082A55] transition hover:bg-[#EEF3FF]"
                        >
                          {option}
                        </button>

                      ))}

                    </div>

                  </div>

                </div>

              </div>
            )}
            {showResultModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                <div className="w-full max-w-md rounded-[2rem] bg-white p-7 text-center shadow-2xl">
                  <img
                    src="/mascot/hapiko-step-2.png"
                    alt="Hapiko"
                    className="mx-auto h-28 w-28 object-contain"
                  />

                  <h2 className="mt-4 text-2xl font-black text-[#082A55]">
                    Great job!
                  </h2>

                  <p className="mt-3 text-slate-500">
                    You completed Level {level}. Ready for the next challenge?
                  </p>

                  <button
                    onClick={async () => {

                      const nextLevel = Math.min(level + 1, 4);

                      setShowResultModal(false);

                      setLevel(nextLevel);

                      await loadGame({
                        selectedLanguagePair: languagePair,
                        selectedGrade: grade,
                        selectedDifficulty: difficulty,
                        selectedPairCount: getPairCountByLevel(nextLevel),
                      });
                    }}
                    className="mt-6 h-14 w-full rounded-2xl bg-[#082A55] font-black text-white"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="rounded-[2rem] bg-white p-10 text-center text-lg font-bold text-[#082A55] shadow-sm">
                Loading Memory Flip...
              </div>
            ) : errorMsg ? (
              <div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 text-center">
                <h2 className="text-2xl font-black text-[#082A55]">
                  No Questions Yet
                </h2>
                <p className="mt-3 text-red-600">{errorMsg}</p>
              </div>
            ) : (
              <>
                <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-3xl bg-white p-4 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Score
                    </p>
                    <p className="mt-1 text-2xl font-black text-[#082A55]">
                      {score}
                    </p>
                  </div>

                  <div className="rounded-3xl bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                      <MousePointerClick className="h-4 w-4 text-[#8d73ff]" />
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        Moves
                      </p>
                    </div>
                    <p className="mt-1 text-2xl font-black text-[#082A55]">
                      {moves}
                    </p>
                  </div>

                  <div
                    className={`rounded-3xl bg-white p-4 shadow-sm ${secondsLeft <= 10 ? "ring-2 ring-red-300" : ""
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#52bd7f]" />
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        Time Left
                      </p>
                    </div>
                    <p
                      className={`mt-1 text-2xl font-black ${secondsLeft <= 10 ? "text-red-500" : "text-[#082A55]"
                        }`}
                    >
                      {secondsLeft}s
                    </p>
                  </div>

                  <div className="rounded-3xl bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        Combo
                      </p>
                    </div>
                    <p className="mt-1 text-2xl font-black text-[#082A55]">
                      x{combo}
                    </p>
                  </div>
                </div>

                {(isWin || timeUp) && !showResultModal && !showMasteryTest && (
                  <div className="mb-6 rounded-[2rem] border border-[#E8D8B5] bg-white p-6 text-center shadow-sm">
                    <Trophy className="mx-auto h-10 w-10 text-[#F6C65B]" />

                    <h2 className="mt-3 text-2xl font-black text-[#082A55]">
                      {isWin ? "Great Job!" : "Time's Up!"}
                    </h2>

                    <p className="mt-2 text-slate-500">
                      Final Score: {score} · Moves: {moves}
                    </p>

                    {isWin && <p className="mt-3 text-2xl">{"⭐".repeat(stars)}</p>}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {cards.map((card) => {
                    const visible = card.flipped || card.matched;

                    return (
                      <button
                        key={card.id}
                        onClick={() => flipCard(card)}
                        className={`
                      relative h-[120px] rounded-[28px] border text-xl font-black shadow-sm transition-all duration-300 sm:h-[145px]
                      ${visible
                            ? "scale-[1.02] border-[#E8D8B5] bg-white text-[#082A55]"
                            : "border-[#082A55] bg-[#082A55] text-white hover:-translate-y-1"
                          }
                      ${card.matched
                            ? "border-[#52bd7f] bg-[#f0fff6] text-[#16824b]"
                            : ""
                          }
                    `}
                      >
                        {visible ? (
                          <div className="flex flex-col items-center justify-center gap-2">
                            <img
                              src={card.imageUrl || FALLBACK_IMAGE}
                              alt={card.text}
                              className="h-20 w-20 rounded-2xl object-contain bg-white"
                              onError={(e) => {
                                e.currentTarget.src = FALLBACK_IMAGE;
                              }}
                            />

                            <span className="text-center text-lg sm:text-xl">
                              {card.text}
                            </span>
                          </div>
                        ) : (
                          <span className="text-3xl">?</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

      </div>
    </div>
  );
}