import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
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
      });

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
      setErrorMsg(err.message || "Failed to generate flashcards.");
    } finally {
      setLoading(false);
    }
  };

  const nextCard = () => {
    setCurrentIndex((prev) => {
      if (prev + 1 >= cards.length) return 0;
      return prev + 1;
    });

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
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-accent">
            Luna Flashcards
          </p>

          <h1 className="mt-2 font-serif text-3xl text-primary sm:text-4xl">
            AI Vocabulary Practice
          </h1>

          <p className="mt-3 max-w-2xl text-muted-foreground">
            Paste your own word list, choose a helper language, and let Luna create
            smart flashcards with meanings, examples, memory hints, and mini quizzes.
          </p>
        </div>

        {errorMsg && (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-red-700">
            {errorMsg}
          </div>
        )}

        <div className="rounded-[1.6rem] border bg-card p-5 shadow-soft sm:rounded-[2rem] sm:p-6">
          <h2 className="text-xl font-bold text-primary">Create Flashcards</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <select
              value={wordLanguage}
              onChange={(e) => setWordLanguage(e.target.value)}
              className="min-h-11 rounded-2xl border bg-white px-4 py-3"
            >
              {languageOptions.map((lang) => (
                <option key={lang}>{lang}</option>
              ))}
            </select>

            <select
              value={helperLanguage}
              onChange={(e) => setHelperLanguage(e.target.value)}
              className="min-h-11 rounded-2xl border bg-white px-4 py-3"
            >
              {languageOptions.map((lang) => (
                <option key={lang}>{lang}</option>
              ))}
            </select>

            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="min-h-11 rounded-2xl border bg-white px-4 py-3"
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
            className="mt-4 min-h-40 w-full rounded-2xl border bg-white px-4 py-3 text-sm font-semibold text-primary outline-none"
          />

          <div className="mt-4 rounded-2xl bg-secondary/60 px-4 py-3 text-sm font-bold text-primary">
            {words.length} words detected
          </div>

          <Button
            onClick={generateFlashcards}
            disabled={loading}
            className="mt-5 h-12 w-full rounded-2xl"
          >
            <Wand2 className="mr-2 h-4 w-4" />
            {loading ? "Generating..." : "Generate Flashcards"}
          </Button>
        </div>

        {cards.length > 0 && currentCard && (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[2rem] border bg-card p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-accent">
                    Card {currentIndex + 1} / {cards.length}
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-primary">
                    Tap to flip
                  </h2>
                </div>

                <div className="rounded-2xl bg-secondary px-4 py-2 text-sm font-bold text-primary">
                  Review: {wrongCards.length}
                </div>
              </div>

              <button
                onClick={() => setFlipped((prev) => !prev)}
                className="mt-6 min-h-[320px] w-full rounded-[2rem] border bg-white p-8 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
              >
                {!flipped ? (
                  <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
                    <Brain className="mb-5 h-12 w-12 text-accent" />
                    <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                      Word
                    </p>
                    <h3 className="mt-4 text-5xl font-bold text-primary">
                      {currentCard.word}
                    </h3>
                    <p className="mt-6 text-muted-foreground">
                      Click the card to reveal the answer.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                        Meaning
                      </p>
                      <h3 className="mt-2 text-3xl font-bold text-primary">
                        {currentCard.meaning}
                      </h3>
                    </div>

                    {currentCard.pronunciation && (
                      <div className="rounded-2xl bg-secondary p-4">
                        <p className="text-sm font-bold text-muted-foreground">
                          Pronunciation
                        </p>
                        <p className="mt-1 font-bold text-primary">
                          {currentCard.pronunciation}
                        </p>
                      </div>
                    )}

                    {currentCard.example && (
                      <div className="rounded-2xl bg-secondary p-4">
                        <p className="text-sm font-bold text-muted-foreground">
                          Example
                        </p>
                        <p className="mt-1 text-primary">
                          {currentCard.example}
                        </p>
                      </div>
                    )}

                    {currentCard.memoryHint && (
                      <div className="rounded-2xl border bg-[#FFFDF6] p-4">
                        <p className="text-sm font-bold text-muted-foreground">
                          Memory Hint
                        </p>
                        <p className="mt-1 text-primary">
                          {currentCard.memoryHint}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </button>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <Button
                  onClick={() => markCard("know")}
                  className="h-12 rounded-2xl bg-[#082A55]"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  I know it
                </Button>

                <Button
                  variant="outline"
                  onClick={() => markCard("unsure")}
                  className="h-12 rounded-2xl bg-white"
                >
                  Not sure
                </Button>

                <Button
                  variant="destructive"
                  onClick={() => markCard("forgot")}
                  className="h-12 rounded-2xl"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  I forgot
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              {isQuizTurn && (
                <div className="rounded-[2rem] border bg-card p-6 shadow-soft">
                  <p className="text-sm font-bold uppercase tracking-widest text-accent">
                    Mini Quiz
                  </p>

                  <h2 className="mt-2 text-xl font-bold text-primary">
                    {currentCard.quizQuestion}
                  </h2>

                  <div className="mt-5 space-y-3">
                    {currentCard.quizOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => setSelectedAnswer(option)}
                        className={`w-full rounded-2xl border px-4 py-3 text-left font-semibold transition ${
                          selectedAnswer === option
                            ? "border-primary bg-secondary text-primary"
                            : "bg-white text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>

                  <Button
                    onClick={checkQuiz}
                    disabled={!selectedAnswer}
                    className="mt-5 h-12 w-full rounded-2xl"
                  >
                    Check Answer
                  </Button>

                  {showQuizResult && (
                    <div
                      className={`mt-4 rounded-2xl p-4 font-bold ${
                        selectedAnswer === currentCard.answer
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {selectedAnswer === currentCard.answer
                        ? "Correct! Great job."
                        : `Not quite. Correct answer: ${currentCard.answer}`}
                    </div>
                  )}
                </div>
              )}

              <div className="rounded-[2rem] border bg-card p-6 shadow-soft">
                <p className="text-sm font-bold uppercase tracking-widest text-accent">
                  Progress
                </p>

                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl bg-secondary p-4">
                    <p className="text-sm text-muted-foreground">
                      Current deck
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {cards.length} cards
                    </p>
                  </div>

                  <div className="rounded-2xl bg-secondary p-4">
                    <p className="text-sm text-muted-foreground">
                      Need review
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {wrongCards.length} cards
                    </p>
                  </div>
                </div>

                <Button
                  onClick={restartWrongCards}
                  disabled={wrongCards.length === 0}
                  variant="outline"
                  className="mt-5 h-12 w-full rounded-2xl bg-white"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Review Wrong Cards
                </Button>

                <div className="mt-5 rounded-2xl bg-[#FFFDF6] p-4">
                  <Sparkles className="mb-2 h-5 w-5 text-accent" />
                  <p className="text-sm text-muted-foreground">
                    Quiz appears every 5 cards. Words marked “Not sure” or “I
                    forgot” will be saved for review.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

