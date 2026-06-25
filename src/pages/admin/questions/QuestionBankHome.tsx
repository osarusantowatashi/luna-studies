import { Link } from "react-router-dom";
import { ArrowRight, Calculator, Languages, LibraryBig } from "lucide-react";

const questionBankCards = [
  {
    title: "Language Questions",
    description:
      "Manage multilingual language-learning questions for English, Japanese and Chinese.",
    href: "/admin/questions/language",
    cta: "Open Language Questions",
    icon: Languages,
  },
  {
    title: "Math Questions",
    description:
      "Review saved Math questions by grade, topic, skill, and difficulty.",
    href: "/admin/questions/math",
    cta: "Open Math Questions",
    icon: Calculator,
  },
  {
    title: "Shared Vocabulary Library",
    description:
      "Manage approved reusable vocabulary that powers every learning game.",
    href: "/admin/questions/games/memory-flip",
    cta: "Open Shared Library",
    icon: LibraryBig,
  },
];

const QuestionBankHome = () => {
  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl space-y-8 sm:space-y-10">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-accent">
            Luna Question Bank
          </p>

          <h1 className="mt-2 font-serif text-3xl text-primary sm:text-5xl">
            Question Bank Management
          </h1>

          <p className="mt-3 max-w-3xl text-muted-foreground">
            Manage language questions, Math questions, and shared game vocabulary from one clean content hub.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {questionBankCards.map((card) => {
            const Icon = card.icon;

            return (
              <Link
                key={card.href}
                to={card.href}
                className="group block min-h-11 rounded-[1.6rem] border bg-card p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-elegant sm:rounded-[2rem] sm:p-6"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
                  <Icon className="h-7 w-7 text-accent" />
                </div>

                <h2 className="mt-5 text-xl font-bold text-primary sm:text-2xl">
                  {card.title}
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  {card.description}
                </p>

                <div className="mt-5 flex items-center gap-2 text-sm font-bold text-primary">
                  {card.cta}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuestionBankHome;
