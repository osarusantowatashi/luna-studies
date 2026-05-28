import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Brain,
  Layers,
  Car,
  Search,
  Headphones,
  Blocks,
  Sparkles,
  Gamepad2,
  Trophy,
  ArrowRight,
} from "lucide-react";

const games = [
  {
    title: "Memory Flip",
    description: "Match language pairs across Chinese, English, and Japanese.",
    path: "/memory-flip",
    status: "Available",
    cover: "/games/Memory-Flip.png",
  },
  {
    title: "Word Drive",
    description: "Drive into the correct word before time runs out.",
    path: "#",
    icon: Car,
    status: "Coming Soon",
    color: "bg-[#ffe66d]",
  },
  {
    title: "Grammar Runner",
    description: "Choose the correct grammar gate while running forward.",
    path: "#",
    icon: Brain,
    status: "Coming Soon",
    color: "bg-[#b8f36c]",
  },
  {
    title: "Word Search",
    description: "Find hidden vocabulary words in a timed puzzle.",
    path: "#",
    icon: Search,
    status: "Coming Soon",
    color: "bg-[#ff8bd2]",
  },
  {
    title: "Listening Challenge",
    description: "Listen carefully and select the correct meaning.",
    path: "#",
    icon: Headphones,
    status: "Coming Soon",
    color: "bg-[#8d73ff]",
  },
  {
    title: "CAT4 Patterns",
    description: "Train pattern recognition and reasoning skills.",
    path: "#",
    icon: Blocks,
    status: "Coming Soon",
    color: "bg-[#ffe66d]",
  },
];

export default function GamesArcade() {
  const availableGames = games.filter((game) => game.status === "Available").length;

  return (
    <div className="min-h-screen overflow-hidden bg-white px-4 py-8 sm:px-6 sm:py-14">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_15%,#f0eaff_0%,transparent_28%),radial-gradient(circle_at_85%_75%,#fff1bd_0%,transparent_30%)]" />

      <div className="relative z-10 mx-auto max-w-[1180px] space-y-0">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-t-[3rem] border border-[#eee8ff] bg-white p-7 shadow-[0_35px_120px_rgba(66,56,120,0.10)] sm:p-10">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#f0eaff]" />
          <div className="absolute bottom-[-80px] left-[-80px] h-56 w-56 rounded-full bg-[#fff1bd]/70" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-end">
            <div>
              <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]">
                <Sparkles className="h-5 w-5" />
                Luna Learning Arcade
              </p>

              <h1 className="mt-5 font-poppins text-[3.2rem] font-black leading-[0.95] tracking-[-0.045em] text-primary sm:text-[4.8rem] lg:text-[5.5rem]">
                Play.
                <br />
                Practise.
                <br />
                Improve.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-primary/60 sm:text-lg">
                Build vocabulary, grammar, reasoning, and language confidence through short interactive learning games.
              </p>
            </div>



            <motion.div
              whileHover={{ y: -8, rotate: 1.5 }}
              className="relative rounded-[2.2rem] bg-[#fbfaff] p-6 shadow-[0_18px_55px_rgba(66,56,120,0.09)]"
            >
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8d73ff]">
                Arcade Status
              </p>

              <div className="mt-5 space-y-4">
                <MiniMetric label="Available Games" value={availableGames} />
                <MiniMetric label="Coming Soon" value={games.length - availableGames} />
                <MiniMetric label="Skill Focus" value="Vocabulary" />
              </div>
            </motion.div>
          </div>
        </section>



        {/* GAME LIST */}
        <section className="relative -mt-2 rounded-b-[2.8rem] bg-white px-7 pb-9 pt-4 shadow-[0_25px_80px_rgba(66,56,120,0.10)] sm:px-9">
          <div className="mb-8">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#8d73ff]">
              Choose a game
            </p>

            <h2 className="mt-3 font-poppins text-3xl font-black text-primary">
              Start your learning challenge.
            </h2>

            <p className="mt-3 text-sm leading-7 text-primary/55">
              Select a game mode and practise with interactive activities designed for Luna students.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((game, index) => {
              const Icon = game.icon;

              const available = game.status === "Available";

              const card = (
                <motion.div
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ delay: index * 0.06 }}
                  whileHover={
                    available
                      ? { y: -8, rotate: index % 2 === 0 ? -1.5 : 1.5 }
                      : {}
                  }
                  className={`group h-full overflow-hidden rounded-[2.2rem] bg-white shadow-[0_18px_55px_rgba(66,56,120,0.08)] transition ${available ? "cursor-pointer" : "opacity-60"
                    }`}
                >
                  <div className="relative overflow-hidden">
                    {game.cover ? (
                      <>
                        <img
                          src={game.cover}
                          alt={game.title}
                          className="h-[220px] w-full object-cover transition duration-500 group-hover:scale-105"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      </>
                    ) : (
                      <div className="flex h-[220px] w-full items-center justify-center bg-[#f6f1ff]">
                        <div
                          className={`flex h-24 w-24 items-center justify-center rounded-[2rem] ${game.color}`}
                        >
                          {game.icon && <game.icon className="h-10 w-10 text-primary" />}
                        </div>
                      </div>
                    )}

                    <div className="absolute right-4 top-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${available
                            ? "bg-green-400 text-white"
                            : "bg-white/80 text-slate-600"
                          }`}
                      >
                        {game.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-poppins text-2xl font-black text-primary">
                      {game.title}
                    </h3>

                    <p className="mt-3 min-h-[72px] text-sm leading-6 text-primary/55">
                      {game.description}
                    </p>

                    <div
                      className={`mt-6 flex h-12 items-center justify-center rounded-2xl text-sm font-black transition ${available
                        ? "bg-primary text-white group-hover:bg-[#123A70]"
                        : "bg-[#f5f5f5] text-primary/45"
                        }`}
                    >
                      {available ? "Play Now" : "Coming Soon"}

                      {available && (
                        <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
                      )}
                    </div>
                  </div>
                </motion.div>
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
        </section>
      </div>
    </div>
  );
}

const MiniMetric = ({ label, value }: { label: string; value: any }) => {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white p-4">
      <span className="text-sm font-bold text-primary/55">{label}</span>
      <span className="font-poppins text-xl font-black text-primary">
        {value}
      </span>
    </div>
  );
};
