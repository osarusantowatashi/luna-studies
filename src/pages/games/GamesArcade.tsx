import { Link } from "react-router-dom";
import { Brain, Layers, Car, Search, Headphones, Blocks } from "lucide-react";

const games = [
  {
    title: "Memory Flip",
    description: "Match language pairs across Chinese, English, and Japanese.",
    path: "/memory-flip",
    icon: Layers,
    status: "Available",
  },
  {
    title: "Word Drive",
    description: "Drive into the correct word before time runs out.",
    path: "#",
    icon: Car,
    status: "Coming Soon",
  },
  {
    title: "Grammar Runner",
    description: "Choose the correct grammar gate while running forward.",
    path: "#",
    icon: Brain,
    status: "Coming Soon",
  },
  {
    title: "Word Search",
    description: "Find hidden vocabulary words in a timed puzzle.",
    path: "#",
    icon: Search,
    status: "Coming Soon",
  },
  {
    title: "Listening Challenge",
    description: "Listen carefully and select the correct meaning.",
    path: "#",
    icon: Headphones,
    status: "Coming Soon",
  },
  {
    title: "CAT4 Patterns",
    description: "Train pattern recognition and reasoning skills.",
    path: "#",
    icon: Blocks,
    status: "Coming Soon",
  },
];

export default function GamesArcade() {
  return (
    <div className="min-h-screen bg-[#F6F8FC] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-[#8d73ff]">
            Luna Learning Arcade
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight text-[#082A55] sm:text-5xl">
            Mini Games
          </h1>

          <p className="mt-3 max-w-2xl text-slate-500">
            Practise vocabulary, grammar, reasoning, and language skills through short interactive games.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => {
            const Icon = game.icon;
            const available = game.status === "Available";

            const card = (
              <div
                className={`h-full rounded-[2rem] border bg-white p-6 shadow-sm transition ${
                  available
                    ? "hover:-translate-y-1 hover:shadow-lg"
                    : "opacity-60"
                }`}
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#082A55] text-white">
                    <Icon className="h-6 w-6" />
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      available
                        ? "bg-[#f0fff6] text-[#16824b]"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {game.status}
                  </span>
                </div>

                <h2 className="text-2xl font-black text-[#082A55]">
                  {game.title}
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {game.description}
                </p>

                <div className="mt-6 rounded-full bg-[#082A55] px-5 py-3 text-center text-sm font-bold text-white">
                  {available ? "Play Now" : "Coming Soon"}
                </div>
              </div>
            );

            return available ? (
              <Link key={game.title} to={game.path}>
                {card}
              </Link>
            ) : (
              <div key={game.title}>{card}</div>
            );
          })}
        </div>
      </div>
    </div>
  );
}