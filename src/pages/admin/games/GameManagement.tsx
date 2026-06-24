import { Link } from "react-router-dom";
import { Gamepad2, Images, ArrowRight } from "lucide-react";

export default function GameManagement() {
  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-accent">
            Luna Learning Arcade
          </p>

          <h1 className="mt-2 font-serif text-3xl text-primary sm:text-4xl">
            Game Management
          </h1>

          <p className="mt-3 max-w-2xl text-muted-foreground">
            Generate learning games, review vocabulary images, and manage game content for students.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Link
            to="/admin/games/memory-flip"
            className="group block min-h-11 rounded-[1.6rem] border bg-card p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-elegant sm:rounded-[2rem] sm:p-6"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
              <Gamepad2 className="h-7 w-7 text-accent" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-primary sm:text-2xl">
              Memory Flip
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Generate bilingual memory matching games and manage vocabulary image quality.
            </p>

            <div className="mt-5 flex items-center gap-2 text-sm font-bold text-primary">
              Open Memory Flip
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </div>
          </Link>

          <div className="rounded-[1.6rem] border border-dashed bg-card/60 p-5 opacity-70 sm:rounded-[2rem] sm:p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
              <Images className="h-7 w-7 text-muted-foreground" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-primary sm:text-2xl">
              More Games
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Future games can be added here, using the same shared LUNA vocabulary image library.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
