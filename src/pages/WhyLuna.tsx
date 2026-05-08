import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  MessageCircle,
  Globe2,
  BarChart3,
  UserRound,
  BookOpen,
  CheckCircle,
} from "lucide-react";
import Footer from "@/components/Footer";

const WhyLuna = () => {
  const highlights = [
    "1–1 personalised tutoring",
    "Young but experienced elite tutors",
    "Online + offline lesson support",
    "Chat support for quick questions",
    "Free question banks for registered students",
    "Pre-test / Mid-test / Post-test tracking",
  ];

  const sections = [
    {
      title: "Elite tutors with international backgrounds",
      text: "Our tutors are young, driven, and carefully selected from strong academic backgrounds. We match students with tutors who understand different school systems, countries, and exam expectations.",
      icon: Globe2,
      tag: "Tutor Matching",
    },
    {
      title: "Personal planning for every student",
      text: "Every student receives a customised plan based on their level, target school, exam, and weaknesses. Lessons are not random — each step is designed with a purpose.",
      icon: UserRound,
      tag: "1–1 Planning",
    },
    {
      title: "Progress you can actually see",
      text: "We use pre-tests, mid-tests, and post-tests to check quality and improvement. Parents can clearly understand where the student started and how they are growing.",
      icon: BarChart3,
      tag: "Quality Tracking",
    },
    {
      title: "Support beyond lesson time",
      text: "Registered students receive access to question banks and chat support for learning queries, so learning continues even outside class.",
      icon: MessageCircle,
      tag: "Continuous Support",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* HERO */}
      <section className="relative overflow-hidden bg-hero px-6 py-28">
        <div className="absolute left-20 top-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute bottom-10 right-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 md:grid-cols-2">
          <div>
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-accent">
              Why Luna
            </p>

            <h1 className="font-serif text-5xl leading-tight text-primary md:text-6xl">
              Premium tutoring,
              <br />
              built around real growth.
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Luna Education combines elite tutors, personalised planning,
              structured assessments, and continuous support — so students don’t
              just attend lessons, they improve with direction.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {highlights.slice(0, 3).map((item) => (
                <span
                  key={item}
                  className="rounded-full border bg-white/70 px-4 py-2 text-sm text-primary shadow-soft"
                >
                  {item}
                </span>
              ))}
            </div>

            <Link to="/#enquiry">
              <Button size="lg" className="mt-10 h-12 px-10 shadow-elegant">
                Enquire now
              </Button>
            </Link>
          </div>

          {/* VISUAL MOCKUP */}
          <div className="relative">
            <div className="rounded-[2rem] border bg-white/85 p-6 shadow-elegant backdrop-blur">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                    Luna Plan
                  </p>
                  <h3 className="mt-1 font-serif text-2xl text-primary">
                    Student Growth Map
                  </h3>
                </div>
                <div className="rounded-full bg-secondary px-3 py-1 text-xs">
                  1–1
                </div>
              </div>

              <div className="grid gap-4">
                {[
                  ["Pre-test", "Identify current level", "35%"],
                  ["Mid-test", "Check improvement", "68%"],
                  ["Post-test", "Confirm growth", "86%"],
                ].map(([label, text, score]) => (
                  <div key={label} className="rounded-2xl border bg-card p-4">
                    <div className="flex justify-between text-sm">
                      <div>
                        <p className="font-semibold text-primary">{label}</p>
                        <p className="text-xs text-muted-foreground">{text}</p>
                      </div>
                      <p className="font-bold text-accent">{score}</p>
                    </div>

                    <div className="mt-3 h-2 rounded-full bg-secondary">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: score }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute -bottom-6 -left-6 rounded-2xl border bg-white p-4 shadow-soft">
              <p className="text-xs text-muted-foreground">Chat support</p>
              <p className="mt-1 text-sm font-semibold text-primary">
                “Can I ask about this question?”
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HIGHLIGHT STRIP */}
      <section className="border-y bg-card px-6 py-8">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
          {highlights.map((item) => (
            <div key={item} className="flex items-center gap-3 text-sm">
              <CheckCircle className="h-5 w-5 text-accent" />
              <span className="text-primary">{item}</span>
            </div>
          ))}
        </div>
      </section>
      
      {/* COMPARISON */}
      <section className="container mx-auto px-6 py-24">
        <div className="mb-14 text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-accent">
            What makes us different
          </p>
          <h2 className="font-serif text-4xl text-primary md:text-5xl">
            Not just lessons. A complete learning system.
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-3xl border bg-secondary/40 p-8">
            <h3 className="font-serif text-2xl text-muted-foreground">
              Typical tuition
            </h3>

            <ul className="mt-6 space-y-4 text-sm text-muted-foreground">
              <li>Random worksheets without a clear learning path</li>
              <li>Limited support outside class time</li>
              <li>Parents unsure whether progress is real</li>
              <li>One-size-fits-all lesson style</li>
            </ul>
          </div>

          <div className="rounded-3xl border bg-card p-8 shadow-elegant">
            <h3 className="font-serif text-2xl text-primary">
              Luna Education
            </h3>

            <ul className="mt-6 space-y-4 text-sm text-primary">
              <li>Personalised 1–1 planning for each student</li>
              <li>Chat support and question-bank access</li>
              <li>Pre-test, mid-test, and post-test quality checks</li>
              <li>Tutors matched by background, subject, and student needs</li>
            </ul>
          </div>
        </div>
      </section>
      
        {/* VALUES */}
      <section className="bg-secondary/30 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-accent">
              Our Values
            </p>

            <h2 className="font-serif text-4xl text-primary md:text-5xl">
              What we believe learning should be
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              At Luna Education, we don’t believe in random practice or passive
              learning. We focus on clarity, structure, and measurable
              improvement.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Clarity",
                text: "Students should understand why an answer is correct, not just memorise it.",
              },
              {
                title: "Structure",
                text: "Learning should follow a clear path with direction and purpose.",
              },
              {
                title: "Growth",
                text: "Mistakes are not failures. They are signals for improvement.",
              },
              {
                title: "Responsibility",
                text: "Students take ownership while tutors guide and challenge them.",
              },
            ].map((value) => (
              <div
                key={value.title}
                className="rounded-3xl border bg-card p-7 shadow-soft transition hover:-translate-y-2 hover:shadow-elegant"
              >
                <h3 className="font-serif text-2xl text-primary">
                  {value.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  {value.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2">
            {[
              "Lessons follow a clear structure instead of random topics",
              "Mistakes are tracked and reviewed systematically",
              "Students learn how to explain answers, not just give them",
              "Parents receive clear progress feedback",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border bg-background p-5"
              >
                <p className="text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* VISUAL STORY SECTIONS */}
      <section className="space-y-28 px-6 py-24">
        {sections.map((item, index) => (
          <div
            key={item.title}
            className="mx-auto grid max-w-6xl items-center gap-14 md:grid-cols-2"
          >
            <div className={index % 2 === 1 ? "md:order-2" : ""}>
              <div className="relative rounded-[2rem] border bg-white p-6 shadow-elegant transition hover:-translate-y-2">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="rounded-full bg-yellow-300 px-3 py-1 text-xs font-semibold text-black">
                    {item.tag}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="h-3 w-32 rounded-full bg-secondary" />
                  <div className="h-3 w-full rounded-full bg-secondary" />
                  <div className="h-3 w-4/5 rounded-full bg-secondary" />
                </div>

                <div className="mt-6 rounded-2xl border bg-card p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Focus Area</span>
                    <span className="font-semibold text-primary">
                      Improving
                    </span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-secondary">
                    <div className="h-2 w-3/4 rounded-full bg-primary" />
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-xl">
              <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent">
                {item.tag}
              </p>
              <h2 className="font-serif text-4xl leading-tight text-primary">
                {item.title}
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                {item.text}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* QUESTION BANK */}
      <section className="bg-secondary/30 px-6 py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent">
              Registered Student Benefit
            </p>
            <h2 className="font-serif text-4xl text-primary">
              Free access to curated question banks
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Registered students can practise with structured question banks
              matched to their goals. Tutors can then review mistakes and turn
              practice into targeted improvement.
            </p>
          </div>

          <div className="rounded-[2rem] border bg-card p-6 shadow-elegant">
            <div className="mb-5 flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-primary" />
              <h3 className="font-serif text-2xl text-primary">
                Question Bank
              </h3>
            </div>

            <div className="grid gap-3">
              {["MAP Reading", "TOEFL Writing", "AEIS Math", "Interview Practice"].map(
                (item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-2xl border bg-background p-4"
                  >
                    <span className="text-sm text-primary">{item}</span>
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs">
                      Available
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-hero px-6 py-24 text-center">
        <h2 className="font-serif text-4xl text-primary">
          Start with a personalised trial lesson
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          We’ll assess the student’s level and recommend the right plan based on
          their goals.
        </p>

        <Link to="/#enquiry">
          <Button size="lg" className="mt-10 h-12 px-10 shadow-elegant">
            Enquire now
          </Button>
        </Link>
      </section>
      <Footer />
    </div>
  );
};

export default WhyLuna;