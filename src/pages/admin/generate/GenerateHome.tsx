import { Link } from "react-router-dom";
import { BookOpen, Calculator, Gamepad2, ArrowRight, Languages } from "lucide-react";

export default function GenerateHome() {
  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-10">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-accent">
            Luna Content Studio
          </p>

          <h1 className="mt-2 font-serif text-4xl text-primary sm:text-5xl">
            Generate Management
          </h1>

          <p className="mt-3 max-w-3xl text-muted-foreground">
            Generate language questions, Math practice, and learning games for students.
          </p>
        </div>

        <section className="space-y-4">
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Language
          </p>

          <div className="grid gap-5 md:grid-cols-2">
            <Link
              to="/admin/generate/english"
              className="group rounded-[2rem] border bg-card p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
                <BookOpen className="h-7 w-7 text-accent" />
              </div>

              <h2 className="mt-5 text-2xl font-bold text-primary">
                English Question Generator
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Generate reading, vocabulary, grammar, and comprehension questions.
              </p>

              <div className="mt-5 flex items-center gap-2 text-sm font-bold text-primary">
                Open English Generator
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              to="/admin/generate/japanese"
              className="group rounded-[2rem] border bg-card p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
                <Languages className="h-7 w-7 text-accent" />
              </div>

              <h2 className="mt-5 text-2xl font-bold text-primary">
                Japanese Question Generator
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Generate hiragana, katakana, vocabulary, grammar, and reading questions.
              </p>

              <div className="mt-5 flex items-center gap-2 text-sm font-bold text-primary">
                Open Japanese Generator
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
              to="/admin/generate/math"
              className="group rounded-[2rem] border bg-card p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
                <Calculator className="h-7 w-7 text-accent" />
              </div>

              <h2 className="mt-5 text-2xl font-bold text-primary">
                Math Question Generator
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Generate topic-based math questions by grade, skill, and difficulty.
              </p>

              <div className="mt-5 flex items-center gap-2 text-sm font-bold text-primary">
                Open Math Generator
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
              to="/admin/generate/memory-flip"
              className="group rounded-[2rem] border bg-card p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
                <Gamepad2 className="h-7 w-7 text-accent" />
              </div>

              <h2 className="mt-5 text-2xl font-bold text-primary">
                Memory Flip Generator
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Generate bilingual memory matching games and vocabulary pairs.
              </p>

              <div className="mt-5 flex items-center gap-2 text-sm font-bold text-primary">
                Open Memory Flip Generator
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </Link>

            <div className="rounded-[2rem] border border-dashed bg-card/60 p-6 opacity-70">
              <h2 className="text-2xl font-bold text-primary">
                More Games
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Future learning games can be added here.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}