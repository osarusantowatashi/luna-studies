import { Link } from "react-router-dom";
import { BookOpen, Calculator, Gamepad2, ArrowRight, Languages } from "lucide-react";

const QuestionBankHome = () => {
  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-10">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-accent">
            Luna Question Bank
          </p>

          <h1 className="mt-2 font-serif text-4xl text-primary sm:text-5xl">
            Question Bank Management
          </h1>

          <p className="mt-3 max-w-3xl text-muted-foreground">
            Review saved language questions, Math questions, and learning game content.
          </p>
        </div>

        <section className="space-y-4">
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Language
          </p>

          <div className="grid gap-5 md:grid-cols-2">
            <Link
              to="/admin/questions/english"
              className="group rounded-[2rem] border bg-card p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
                <BookOpen className="h-7 w-7 text-accent" />
              </div>

              <h2 className="mt-5 text-2xl font-bold text-primary">
                English Question Bank
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Review saved reading, vocabulary, grammar, and comprehension questions.
              </p>

              <div className="mt-5 flex items-center gap-2 text-sm font-bold text-primary">
                Open English Bank
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              to="/admin/questions/japanese"
              className="group rounded-[2rem] border bg-card p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
                <Languages className="h-7 w-7 text-accent" />
              </div>

              <h2 className="mt-5 text-2xl font-bold text-primary">
                Japanese Question Bank
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Review saved hiragana, katakana, vocabulary, grammar, and reading questions.
              </p>

              <div className="mt-5 flex items-center gap-2 text-sm font-bold text-primary">
                Open Japanese Bank
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </section>

        <section className="space-y-4">
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Math
          </p>

          <div className="grid gap-5 md:grid-cols-2">
            <Link
              to="/admin/questions/math"
              className="group rounded-[2rem] border bg-card p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
                <Calculator className="h-7 w-7 text-accent" />
              </div>

              <h2 className="mt-5 text-2xl font-bold text-primary">
                Math Question Bank
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Review saved Math questions by grade, topic, skill, and difficulty.
              </p>

              <div className="mt-5 flex items-center gap-2 text-sm font-bold text-primary">
                Open Math Bank
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </section>

        <section className="space-y-4">
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Games
          </p>

          <div className="grid gap-5 md:grid-cols-2">
            <Link
              to="/admin/questions/games/memory-flip"
              className="group rounded-[2rem] border bg-card p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
                <Gamepad2 className="h-7 w-7 text-accent" />
              </div>

              <h2 className="mt-5 text-2xl font-bold text-primary">
                Memory Flip Bank
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Review saved word pairs by grade, difficulty, and language pair.
              </p>

              <div className="mt-5 flex items-center gap-2 text-sm font-bold text-primary">
                Open Memory Flip Bank
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </Link>

            <div className="rounded-[2rem] border border-dashed bg-card/60 p-6 opacity-70">
              <h2 className="text-2xl font-bold text-primary">
                More Game Banks
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Future game content can be reviewed here.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default QuestionBankHome;