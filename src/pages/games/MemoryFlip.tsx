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

export default function MemoryFlip() {
  const [languagePair, setLanguagePair] = useState("zh_en");
  const [grade, setGrade] = useState("Grade 1");
  const [difficulty, setDifficulty] = useState("Easy");
  const [pairCount, setPairCount] = useState(8);

  const [activeGrade, setActiveGrade] = useState("Grade 1");
  const [cards, setCards] = useState<Card[]>([]);
  const [playedPairs, setPlayedPairs] = useState<PlayedPair[]>([]);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [moves, setMoves] = useState(0);
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(getTimeLimit(8, "Easy"));
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [timeUp, setTimeUp] = useState(false);
  const [historySaved, setHistorySaved] = useState(false);

  
  const matchedCount = useMemo(
    () => cards.filter((card) => card.matched).length / 2,
    [cards]
  );

  const totalPairs = cards.length / 2;
  const isWin = totalPairs > 0 && matchedCount === totalPairs;
  const isGameEnded = isWin || timeUp;

  useEffect(() => {
    loadGame({
      selectedLanguagePair: languagePair,
      selectedGrade: grade,
      selectedDifficulty: difficulty,
      selectedPairCount: pairCount,
    });
  }, [languagePair, grade, difficulty, pairCount]);

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

  const findGameQuestion = async (
    selectedLanguagePair: string,
    selectedGrade: string,
    selectedDifficulty: string,
    selectedPairCount: number
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

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
            .gte("last_seen_at", fourteenDaysAgo.toISOString());

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

    setActiveGrade(usedGrade || selectedGrade);
    setPlayedPairs(currentPlayedPairs);
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
  
  useEffect(() => {
    if (isWin) {
      saveHistory();
    }
  }, [isWin]);

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

  const languageLabel =
    languagePair === "zh_en"
      ? "Chinese ↔ English"
      : languagePair === "zh_ja"
        ? "Chinese ↔ Japanese"
        : "English ↔ Japanese";

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
            New Game
          </button>
        </div>

        <div className="mb-6 rounded-[2rem] border bg-white p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-4">
            <select
              value={languagePair}
              onChange={(e) => setLanguagePair(e.target.value)}
              className="rounded-2xl border bg-white px-4 py-3 text-sm font-bold text-[#082A55]"
            >
              <option value="zh_en">中英 Chinese ↔ English</option>
              <option value="zh_ja">中日 Chinese ↔ Japanese</option>
              <option value="en_ja">英日 English ↔ Japanese</option>
            </select>

            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="rounded-2xl border bg-white px-4 py-3 text-sm font-bold text-[#082A55]"
            >
              {grades.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="rounded-2xl border bg-white px-4 py-3 text-sm font-bold text-[#082A55]"
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>

            <select
              value={pairCount}
              onChange={(e) => setPairCount(Number(e.target.value))}
              className="rounded-2xl border bg-white px-4 py-3 text-sm font-bold text-[#082A55]"
            >
              <option value={6}>6 pairs</option>
              <option value={8}>8 pairs</option>
              <option value={10}>10 pairs</option>
              <option value={12}>12 pairs</option>
            </select>
          </div>

          <p className="mt-3 text-sm text-slate-500">
            Current mode:{" "}
            <span className="font-bold text-[#082A55]">{languageLabel}</span>
            {" · "}
            Selected: <span className="font-bold">{grade}</span>
            {" · "}
            Playing: <span className="font-bold">{activeGrade}</span>
            {activeGrade !== grade && " (auto advanced)"}
          </p>
        </div>

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

            {(isWin || timeUp) && (
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
                          className="h-20 w-20 rounded-2xl object-cover"
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
      </div>
    </div>
  );
}