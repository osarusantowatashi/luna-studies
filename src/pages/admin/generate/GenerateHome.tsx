import { Link } from "react-router-dom";
import { Calculator, ArrowRight, Languages, LibraryBig } from "lucide-react";

export default function GenerateHome() {
  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl space-y-8 sm:space-y-10">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-accent">
            Luna Content Studio
          </p>

          <h1 className="mt-2 font-serif text-3xl text-primary sm:text-5xl">
            Generate Management
          </h1>

          <p className="mt-3 max-w-3xl text-muted-foreground">
            Generate language questions, Singapore Math questions, and game vocabulary from clearly separated systems.
          </p>
        </div>

        <section className="space-y-4">
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Language
          </p>

          <div className="grid gap-5 md:grid-cols-2">
            <Link
              to="/admin/generate/language"
              className="group block min-h-11 rounded-[1.6rem] border bg-card p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-elegant sm:rounded-[2rem] sm:p-6"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
                <Languages className="h-7 w-7 text-accent" />
              </div>

              <h2 className="mt-5 text-xl font-bold text-primary sm:text-2xl">
                Language Question Generator
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Generate one multilingual question record for English, Japanese, or Chinese learning.
              </p>

              <div className="mt-5 flex items-center gap-2 text-sm font-bold text-primary">
                Open Language Generator
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
              className="group block min-h-11 rounded-[1.6rem] border bg-card p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-elegant sm:rounded-[2rem] sm:p-6"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
                <Calculator className="h-7 w-7 text-accent" />
              </div>

              <h2 className="mt-5 text-xl font-bold text-primary sm:text-2xl">
                Math Question Generator
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Generate simple Singapore Math questions by grade, topic, and count.
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
            Game Vocabulary
          </p>

          <div className="grid gap-5 md:grid-cols-2">
            <Link
              to="/admin/generate/shared-vocabulary"
              className="group rounded-[2rem] border bg-card p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
                <LibraryBig className="h-7 w-7 text-accent" />
              </div>

              <h2 className="mt-5 text-2xl font-bold text-primary">
                Game Shared Vocabulary
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Generate reusable vocabulary items for Memory Flip, Word Search, Letter Match, and future games.
              </p>

              <div className="mt-5 flex items-center gap-2 text-sm font-bold text-primary">
                Open Vocabulary Inbox
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </Link>

            <div className="rounded-[2rem] border border-dashed bg-card/60 p-6 opacity-70">
              <h2 className="text-2xl font-bold text-primary">
                Game-specific generators retired
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Memory Flip, Word Search, Letter Match, and future games now reuse the
                shared vocabulary library instead of generating duplicate game content.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
