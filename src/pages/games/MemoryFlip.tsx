import { useEffect, useMemo, useState } from "react";
import { RotateCcw, Trophy, Zap, Clock, MousePointerClick } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Pair = {
  left: string;
  right: string;
};

type Card = {
  id: string;
  pairId: number;
  text: string;
  flipped: boolean;
  matched: boolean;
};

const shuffle = <T,>(array: T[]) => [...array].sort(() => Math.random() - 0.5);

export default function MemoryFlip() {
  const [languagePair, setLanguagePair] = useState("zh_en");
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [moves, setMoves] = useState(0);
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const matchedCount = useMemo(
    () => cards.filter((card) => card.matched).length / 2,
    [cards]
  );

  const totalPairs = cards.length / 2;
  const isWin = totalPairs > 0 && matchedCount === totalPairs;

  useEffect(() => {
    loadGame(languagePair);
  }, [languagePair]);

  useEffect(() => {
    if (loading || isWin || errorMsg) return;

    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, isWin, errorMsg]);

  const loadGame = async (selectedLanguagePair = languagePair) => {
    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase
      .from("game_questions")
      .select("*")
      .eq("game_type", "memory_flip")
      .eq("language_pair", selectedLanguagePair)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      setCards([]);
      setErrorMsg(
        "No Memory Flip questions found for this language pair. Please ask admin to generate game questions first."
      );
      setLoading(false);
      return;
    }

    const pairs: Pair[] = data.question_data?.pairs || [];

    if (!pairs.length) {
      setCards([]);
      setErrorMsg("This game question has no pairs.");
      setLoading(false);
      return;
    }

    const newCards: Card[] = shuffle(
      pairs.flatMap((pair, index) => [
        {
          id: `${index}-left`,
          pairId: index,
          text: pair.left,
          flipped: false,
          matched: false,
        },
        {
          id: `${index}-right`,
          pairId: index,
          text: pair.right,
          flipped: false,
          matched: false,
        },
      ])
    );

    setCards(newCards);
    setSelectedCards([]);
    setMoves(0);
    setCombo(0);
    setScore(0);
    setSeconds(0);
    setLoading(false);
  };

  const flipCard = (card: Card) => {
    if (isWin) return;
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
    if (moves <= totalPairs + 4) return 3;
    if (moves <= totalPairs + 8) return 2;
    return 1;
  }, [isWin, moves, totalPairs]);

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
              Choose two languages and match the correct pairs.
            </p>
          </div>

          <button
            onClick={() => loadGame(languagePair)}
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#082A55] px-6 text-sm font-bold text-white shadow-lg transition hover:bg-[#123A70]"
          >
            <RotateCcw className="h-4 w-4" />
            New Game
          </button>
        </div>

        <div className="mb-6 rounded-[2rem] border bg-white p-4 shadow-sm">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
            Choose Language Pair
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { value: "zh_en", label: "中英 Chinese ↔ English" },
              { value: "zh_ja", label: "中日 Chinese ↔ Japanese" },
              { value: "en_ja", label: "英日 English ↔ Japanese" },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setLanguagePair(item.value)}
                className={`rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                  languagePair === item.value
                    ? "border-[#082A55] bg-[#082A55] text-white"
                    : "border-slate-200 bg-white text-[#082A55] hover:bg-slate-50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <p className="mt-3 text-sm text-slate-500">
            Current mode:{" "}
            <span className="font-bold text-[#082A55]">{languageLabel}</span>
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

              <div className="rounded-3xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#52bd7f]" />
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Time
                  </p>
                </div>
                <p className="mt-1 text-2xl font-black text-[#082A55]">
                  {seconds}s
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

            {isWin && (
              <div className="mb-6 rounded-[2rem] border border-[#E8D8B5] bg-white p-6 text-center shadow-sm">
                <Trophy className="mx-auto h-10 w-10 text-[#F6C65B]" />

                <h2 className="mt-3 text-2xl font-black text-[#082A55]">
                  Great Job!
                </h2>

                <p className="mt-2 text-slate-500">
                  Final Score: {score} · Moves: {moves} · Time: {seconds}s
                </p>

                <p className="mt-3 text-2xl">{"⭐".repeat(stars)}</p>
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
                      ${
                        visible
                          ? "scale-[1.02] border-[#E8D8B5] bg-white text-[#082A55]"
                          : "border-[#082A55] bg-[#082A55] text-white hover:-translate-y-1"
                      }
                      ${
                        card.matched
                          ? "border-[#52bd7f] bg-[#f0fff6] text-[#16824b]"
                          : ""
                      }
                    `}
                  >
                    {visible ? (
                      <span>{card.text}</span>
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