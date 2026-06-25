import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Wand2,
  XCircle,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

type Flashcard = {
  word: string;
  meaning: string;
  pronunciation?: string;
  example?: string;
  memoryHint?: string;
  quizQuestion: string;
  quizOptions: string[];
  answer: string;
};

const languageOptions = [
  "English",
  "Chinese",
  "Japanese",
  "Korean",
  "French",
  "Spanish",
];

const difficultyOptions = ["Easy", "Medium", "Hard", "Advanced"];

export default function FlashcardGame() {
  const [wordsText, setWordsText] = useState("");
  const [wordLanguage, setWordLanguage] = useState("English");
  const [helperLanguage, setHelperLanguage] = useState("Chinese");
  const [difficulty, setDifficulty] = useState("Easy");

  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [wrongCards, setWrongCards] = useState<Flashcard[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showQuizResult, setShowQuizResult] = useState(false);

  const [deckName, setDeckName] = useState("");
const [saving, setSaving] = useState(false);
const [saveMsg, setSaveMsg] = useState("");
  const words = useMemo(
    () =>
      wordsText
        .split(/\n|,|，/)
        .map((w) => w.trim())
        .filter(Boolean),
    [wordsText]
  );

  const currentCard = cards[currentIndex];
  const isQuizTurn = cards.length > 0 && (currentIndex + 1) % 5 === 0;

  const generateFlashcards = async () => {
    if (words.length === 0) {
      setErrorMsg("Please enter at least one word.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const res = await fetch(`${API_URL}/api/generate-flashcards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          words,
          wordLanguage,
          helperLanguage,
          difficulty,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate flashcards.");
      }

      setCards(data.cards || []);
      setCurrentIndex(0);
      setFlipped(false);
      setWrongCards([]);
      setSelectedAnswer("");
      setShowQuizResult(false);
    } catch (err: any) {
      setErrorMsg(
        err.name === "AbortError"
          ? "Generation took too long. Please try fewer words."
          : err.message || "Failed to generate flashcards."
      );
    } finally {
      setLoading(false);
    }
  };

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1 >= cards.length ? 0 : prev + 1));
    setFlipped(false);
    setSelectedAnswer("");
    setShowQuizResult(false);
  };

  const markCard = (type: "know" | "unsure" | "forgot") => {
    if (!currentCard) return;

    if (type === "forgot" || type === "unsure") {
      setWrongCards((prev) => [...prev, currentCard]);
    }

    nextCard();
  };

  const checkQuiz = () => {
    if (!selectedAnswer || !currentCard) return;

    setShowQuizResult(true);

    if (selectedAnswer !== currentCard.answer) {
      setWrongCards((prev) => [...prev, currentCard]);
    }
  };

  const saveDeck = async () => {
  if (!deckName.trim()) {
    setErrorMsg("Please name your deck before saving.");
    return;
  }

  if (cards.length === 0) {
    setErrorMsg("Please generate flashcards first.");
    return;
  }

  setSaving(true);
  setErrorMsg("");
  setSaveMsg("");

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Please log in before saving your deck.");
    }

    const { error } = await supabase.from("flashcard_decks").insert({
      user_id: user.id,
      deck_name: deckName.trim(),
      word_language: wordLanguage,
      helper_language: helperLanguage,
      difficulty,
      cards,
    });

    if (error) throw error;

    setSaveMsg("Deck saved successfully.");
  } catch (err: any) {
    setErrorMsg(err.message || "Failed to save deck.");
  } finally {
    setSaving(false);
  }
};

  const restartWrongCards = () => {
    if (wrongCards.length === 0) return;

    setCards(wrongCards);
    setCurrentIndex(0);
    setFlipped(false);
    setSelectedAnswer("");
    setShowQuizResult(false);
    setWrongCards([]);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-white px-4 py-6 sm:px-6 sm:py-14">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_15%,#f0eaff_0%,transparent_28%),radial-gradient(circle_at_85%_75%,#fff1bd_0%,transparent_30%)]" />

      <div className="relative z-10 mx-auto max-w-[1180px] space-y-8">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[2rem] border border-[#eee8ff] bg-white p-5 shadow-[0_25px_80px_rgba(66,56,120,0.10)] sm:rounded-[3rem] sm:p-8">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#f0eaff]" />
          <div className="absolute bottom-[-80px] left-[-80px] h-56 w-56 rounded-full bg-[#fff1bd]/70" />

          <div className="relative z-10">
            <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]">
              <Sparkles className="h-5 w-5" />
              Luna Flashcards
            </p>

            <h1 className="mt-4 font-poppins text-[2.35rem] font-black leading-[1.04] tracking-[-0.025em] text-primary min-[390px]:text-[2.7rem] sm:text-[4rem] sm:leading-[0.95] lg:text-[4.6rem]">
              Paste.
              <br />
              Flip.
              <br />
              Remember.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-primary/60 sm:text-lg">
              Create smart bilingual flashcards from your own word list, then
              practise with flip cards, memory hints, and mini quizzes.
            </p>
          </div>
        </section>

        {errorMsg && (
          <div className="rounded-[1.6rem] border border-red-200 bg-red-50 p-5 font-bold text-red-700 shadow-[0_18px_55px_rgba(66,56,120,0.08)]">
            {errorMsg}
          </div>
        )}

        {/* CREATE */}
        <section className="rounded-[2rem] bg-white p-5 shadow-[0_25px_80px_rgba(66,56,120,0.10)] sm:rounded-[2.8rem] sm:p-8">
          <div className="mb-6">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#8d73ff]">
              Create deck
            </p>

            <h2 className="mt-3 font-poppins text-3xl font-black text-primary">
              Turn any word list into practice.
            </h2>

            <p className="mt-3 text-sm leading-7 text-primary/55">
              Choose the word language and helper language, then Luna will
              generate meanings, examples, hints, and quiz questions.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <select
              value={wordLanguage}
              onChange={(e) => setWordLanguage(e.target.value)}
              className="min-h-12 rounded-2xl border border-[#eee8ff] bg-white px-4 py-3 font-bold text-primary outline-none"
            >
              {languageOptions.map((lang) => (
                <option key={lang}>{lang}</option>
              ))}
            </select>

            <select
              value={helperLanguage}
              onChange={(e) => setHelperLanguage(e.target.value)}
              className="min-h-12 rounded-2xl border border-[#eee8ff] bg-white px-4 py-3 font-bold text-primary outline-none"
            >
              {languageOptions.map((lang) => (
                <option key={lang}>{lang}</option>
              ))}
            </select>

            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="min-h-12 rounded-2xl border border-[#eee8ff] bg-white px-4 py-3 font-bold text-primary outline-none"
            >
              {difficultyOptions.map((level) => (
                <option key={level}>{level}</option>
              ))}
            </select>
          </div>

          <textarea
            value={wordsText}
            onChange={(e) => setWordsText(e.target.value)}
            placeholder={"Enter words here...\nsincere\nenormous\nborrow"}
            className="mt-5 min-h-44 w-full rounded-[1.5rem] border border-[#eee8ff] bg-white px-5 py-4 text-base font-bold leading-8 text-primary outline-none transition focus:border-[#8d73ff]"
          />

          <div className="mt-5 rounded-2xl bg-[#f6f1ff] px-5 py-4 text-sm font-black text-primary">
            {words.length} words detected
          </div>

          <Button
            onClick={generateFlashcards}
            disabled={loading}
            className="mt-5 h-14 w-full rounded-2xl bg-primary text-sm font-black text-white hover:bg-[#123A70]"
          >
            <Wand2 className="mr-2 h-5 w-5" />
            {loading ? "Generating..." : "Generate Flashcards"}
          </Button>
        </section>

        {cards.length > 0 && (
  <div className="mt-5 rounded-[1.5rem] bg-[#f6f1ff] p-4">
    <p className="text-sm font-black uppercase tracking-[0.22em] text-[#8d73ff]">
      Save Deck
    </p>

    <div className="mt-3 flex flex-col gap-3 sm:flex-row">
      <input
        value={deckName}
        onChange={(e) => setDeckName(e.target.value)}
        placeholder="Name this deck, e.g. IELTS Week 1"
        className="h-12 flex-1 rounded-2xl border border-[#eee8ff] bg-white px-4 font-bold text-primary outline-none"
      />

      <Button
        onClick={saveDeck}
        disabled={saving}
        className="h-12 rounded-2xl bg-primary px-6 font-black text-white hover:bg-[#123A70]"
      >
        {saving ? "Saving..." : "Save Deck"}
      </Button>
    </div>

    {saveMsg && (
      <p className="mt-3 text-sm font-bold text-green-700">{saveMsg}</p>
    )}
  </div>
)}

        {/* GAME */}
        {cards.length > 0 && currentCard && (
          <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            {/* CARD */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[2rem] bg-white p-5 shadow-[0_25px_80px_rgba(66,56,120,0.10)] sm:rounded-[2.8rem] sm:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.22em] text-[#8d73ff]">
                    Card {currentIndex + 1} / {cards.length}
                  </p>

                  <h2 className="mt-3 font-poppins text-3xl font-black text-primary">
                    Tap the card to flip.
                  </h2>
                </div>

                <div className="rounded-full bg-[#fff1bd] px-4 py-2 text-sm font-black text-primary">
                  Review {wrongCards.length}
                </div>
              </div>

              <motion.button
                onClick={() => setFlipped((prev) => !prev)}
                whileHover={{ y: -8, rotate: currentIndex % 2 === 0 ? -1 : 1 }}
                className="group mt-7 min-h-[360px] w-full overflow-hidden rounded-[2rem] bg-white text-left shadow-[0_18px_55px_rgba(66,56,120,0.10)] transition"
              >
                {!flipped ? (
                  <div className="relative flex min-h-[360px] flex-col items-center justify-center overflow-hidden bg-[#f6f1ff] p-8 text-center">
                    <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#fff1bd]" />
                    <div className="absolute -bottom-16 -left-16 h-44 w-44 rounded-full bg-[#f0eaff]" />

                    <Brain className="relative z-10 mb-5 h-14 w-14 text-[#8d73ff]" />

                    <p className="relative z-10 text-sm font-black uppercase tracking-[0.25em] text-primary/45">
                      Word
                    </p>

                    <h3 className="relative z-10 mt-5 font-poppins text-5xl font-black text-primary sm:text-6xl">
                      {currentCard.word}
                    </h3>

                    <p className="relative z-10 mt-8 text-sm font-bold text-primary/55">
                      Click to reveal the meaning.
                    </p>
                  </div>
                ) : (
                  <div className="min-h-[360px] space-y-5 bg-white p-7">
                    <div>
                      <p className="text-sm font-black uppercase tracking-[0.22em] text-[#8d73ff]">
                        Meaning
                      </p>

                      <h3 className="mt-3 font-poppins text-4xl font-black text-primary">
                        {currentCard.meaning}
                      </h3>
                    </div>

                    {currentCard.pronunciation && (
                      <div className="rounded-2xl bg-[#f6f1ff] p-4">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-primary/45">
                          Pronunciation
                        </p>
                        <p className="mt-1 font-bold text-primary">
                          {currentCard.pronunciation}
                        </p>
                      </div>
                    )}

                    {currentCard.example && (
                      <div className="rounded-2xl bg-[#fff1bd]/60 p-4">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-primary/45">
                          Example
                        </p>
                        <p className="mt-1 leading-7 text-primary">
                          {currentCard.example}
                        </p>
                      </div>
                    )}

                    {currentCard.memoryHint && (
                      <div className="rounded-2xl border border-[#eee8ff] bg-white p-4">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-primary/45">
                          Memory Hint
                        </p>
                        <p className="mt-1 leading-7 text-primary">
                          {currentCard.memoryHint}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </motion.button>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <Button
                  onClick={() => markCard("know")}
                  className="h-13 rounded-2xl bg-primary font-black text-white hover:bg-[#123A70]"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  I know it
                </Button>

                <Button
                  variant="outline"
                  onClick={() => markCard("unsure")}
                  className="h-13 rounded-2xl border-[#eee8ff] bg-white font-black text-primary"
                >
                  Not sure
                </Button>

                <Button
                  variant="destructive"
                  onClick={() => markCard("forgot")}
                  className="h-13 rounded-2xl font-black"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  I forgot
                </Button>
              </div>
            </motion.div>

            {/* SIDE PANEL */}
            <div className="space-y-6">
              {isQuizTurn && (
                <motion.div
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[2rem] bg-white p-5 shadow-[0_25px_80px_rgba(66,56,120,0.10)] sm:rounded-[2.8rem] sm:p-6"
                >
                  <p className="text-sm font-black uppercase tracking-[0.22em] text-[#8d73ff]">
                    Mini Quiz
                  </p>

                  <h2 className="mt-3 font-poppins text-2xl font-black text-primary">
                    {currentCard.quizQuestion}
                  </h2>

                  <div className="mt-5 space-y-3">
                    {currentCard.quizOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => setSelectedAnswer(option)}
                        className={`w-full rounded-2xl px-4 py-3 text-left font-black transition ${
                          selectedAnswer === option
                            ? "bg-[#8d73ff] text-white"
                            : "bg-[#f6f1ff] text-primary hover:bg-[#eee8ff]"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>

                  <Button
                    onClick={checkQuiz}
                    disabled={!selectedAnswer}
                    className="mt-5 h-12 w-full rounded-2xl bg-primary font-black text-white hover:bg-[#123A70]"
                  >
                    Check Answer
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                  {showQuizResult && (
                    <div
                      className={`mt-4 rounded-2xl p-4 font-black ${
                        selectedAnswer === currentCard.answer
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {selectedAnswer === currentCard.answer
                        ? "Correct! Great job."
                        : `Not quite. Correct answer: ${currentCard.answer}`}
                    </div>
                  )}
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[2rem] bg-white p-5 shadow-[0_25px_80px_rgba(66,56,120,0.10)] sm:rounded-[2.8rem] sm:p-6"
              >
                <p className="text-sm font-black uppercase tracking-[0.22em] text-[#8d73ff]">
                  Progress
                </p>

                <div className="mt-5 grid gap-3">
                  <div className="rounded-2xl bg-[#f6f1ff] p-4">
                    <p className="text-sm font-bold text-primary/50">
                      Current deck
                    </p>
                    <p className="mt-1 font-poppins text-3xl font-black text-primary">
                      {cards.length}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#fff1bd]/70 p-4">
                    <p className="text-sm font-bold text-primary/50">
                      Need review
                    </p>
                    <p className="mt-1 font-poppins text-3xl font-black text-primary">
                      {wrongCards.length}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={restartWrongCards}
                  disabled={wrongCards.length === 0}
                  variant="outline"
                  className="mt-5 h-12 w-full rounded-2xl border-[#eee8ff] bg-white font-black text-primary"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Review Wrong Cards
                </Button>

                <div className="mt-5 rounded-2xl bg-[#f6f1ff] p-4">
                  <Sparkles className="mb-2 h-5 w-5 text-[#8d73ff]" />
                  <p className="text-sm font-bold leading-6 text-primary/55">
                    Mini quiz appears every 5 cards. Words marked “Not sure” or
                    “I forgot” will be saved for review.
                  </p>
                </div>
              </motion.div>
              {cards.length > 0 && (
  <section className="rounded-[2rem] bg-white p-5 shadow-[0_25px_80px_rgba(66,56,120,0.10)] sm:rounded-[2.8rem] sm:p-6">
    <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.22em] text-[#8d73ff]">
      <Sparkles className="h-4 w-4" />
      Save Deck
    </p>

    <h2 className="mt-3 font-poppins text-2xl font-black text-primary">
      Keep this deck for later.
    </h2>

    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
      <input
        value={deckName}
        onChange={(e) => setDeckName(e.target.value)}
        placeholder="Name this deck, e.g. IELTS Week 1"
        className="h-13 flex-1 rounded-2xl border border-[#eee8ff] bg-[#faf8ff] px-5 font-bold text-primary outline-none transition focus:border-[#8d73ff]"
      />

      <Button
        onClick={saveDeck}
        disabled={saving}
        className="h-13 rounded-2xl bg-primary px-7 font-black text-white hover:bg-[#123A70]"
      >
        {saving ? "Saving..." : "Save Deck"}
      </Button>
    </div>

    {saveMsg && (
      <p className="mt-3 rounded-2xl bg-green-100 px-4 py-3 text-sm font-black text-green-700">
        {saveMsg}
      </p>
    )}
  </section>
)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
