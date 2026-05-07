import { Link } from "react-router-dom";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Sparkles } from "lucide-react";

const tutors = [
  {
    name: "Mimi",
    role: "English · Japanese Instructor",
    image: "/tutors/Mimi_Tutor.jpg",
    tags: ["TOEFL 117", "SAT 1460", "JLPT N1"],
    desc: "Specialises in MAP Reading, TOEFL speaking, and international school admissions.",
    highlight: "MAP · TOEFL · Admissions",
  },

  {
    name: "Grace",
    role: "English Tutor",
    image: "/tutors/Grace_Tutor.jpg",
    tags: ["IB", "CAT4", "AEIS"],
    desc: "Focuses on structured problem solving and exam confidence building.",
    highlight: "IB · CAT4 · AEIS",
  },

  {
    name: "Francis",
    role: "Japanese Language Tutor",
    image: "/tutors/Francis.jpg",
    tags: ["Native JP", "JLPT", "Conversation"],
    desc: "Supports students through practical communication and structured grammar learning.",
    highlight: "JLPT · Grammar · Speaking",
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* HERO */}
      <section className="relative overflow-hidden bg-hero px-6 py-28">
        <div className="absolute left-10 top-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
          <div>
            <p className="mb-6 text-sm font-semibold uppercase tracking-[0.3em] text-accent">
              Luna Education
            </p>

            <h1 className="max-w-3xl font-serif text-5xl font-medium leading-[1.05] text-primary md:text-7xl">
              Build confidence.
              <br />
              Improve results.
              <br />
              Enjoy learning again.
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              Personalised 1–1 tutoring for international students who need
              clearer guidance, stronger study habits, and more confident
              academic performance.
            </p>

            <p className="mt-4 text-sm font-medium text-primary">
              Trial lesson available · Online & offline support · English /
              Chinese / Japanese
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link to="/enquiry">
                <Button size="lg" className="h-12 px-8 text-base shadow-elegant">
                  Enquire now
                </Button>
              </Link>

              <Link to="/subjects">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 bg-white px-8 text-base"
                >
                  Explore programs
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-10 top-16 h-72 w-72 rounded-full bg-yellow-300/20 blur-3xl" />

            <div className="relative rounded-[2rem] border bg-white/90 p-8 shadow-elegant backdrop-blur">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-accent">
                Student Growth
              </p>

              <h3 className="font-serif text-3xl text-primary">
                From unsure to confident
              </h3>

              <div className="mt-8 grid gap-5">
                <div className="rounded-2xl border bg-secondary/40 p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Before
                  </p>
                  <p className="mt-2 text-lg text-primary">
                    Struggles to organise ideas and explain answers clearly.
                  </p>
                </div>

                <div className="rounded-2xl border bg-card p-5 shadow-soft">
                  <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                    After
                  </p>
                  <p className="mt-2 text-lg font-semibold text-primary">
                    Gives structured answers with confidence and clearer
                    reasoning.
                  </p>
                </div>
              </div>

              <div className="mt-7 rounded-2xl border bg-background p-5">
                <p className="text-sm text-muted-foreground">
                  “My child finally understands how to approach questions, not
                  just memorise answers.”
                </p>
                <p className="mt-3 text-sm font-semibold text-primary">
                  — Parent feedback
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TUTOR MARQUEE */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-secondary/20 to-background py-28">
        <div className="absolute left-0 top-10 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute right-0 bottom-10 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 mb-12">
          <div className="flex items-center gap-2 text-accent">
            <Sparkles className="h-4 w-4" />
            <p className="text-sm uppercase tracking-[0.3em] font-semibold">
              Meet Our Tutors
            </p>
          </div>

          <h2 className="mt-4 max-w-4xl font-serif text-4xl md:text-6xl text-primary leading-tight">
            Learn from tutors who make progress feel possible
          </h2>

          <p className="mt-5 max-w-2xl text-muted-foreground leading-7">
            Experienced multilingual tutors with strong academic backgrounds,
            structured lesson planning, and real student-support experience.
          </p>
        </div>

        <div className="relative overflow-hidden py-8 group">
          <div className="pointer-events-none absolute left-0 top-0 z-20 h-full w-40 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 z-20 h-full w-40 bg-gradient-to-l from-background to-transparent" />

          <div className="flex w-max gap-8 animate-infinite-scroll group-hover:[animation-play-state:paused]">
            {[...tutors, ...tutors, ...tutors].map((tutor, i) => (
              <div
                key={i}
                className="
                  w-[380px] h-[500px] shrink-0
                  overflow-hidden rounded-[2.5rem]
                  border border-white/70
                  bg-white
                  shadow-[0_25px_80px_rgba(15,23,42,0.10)]
                  transition-all duration-500
                  hover:-translate-y-3
                  hover:shadow-[0_35px_100px_rgba(15,23,42,0.18)]
                  flex flex-col
                "
              >
                {/* IMAGE AREA */}
<div className="relative h-[250px] overflow-hidden">
  
  {/* IMAGE */}
  <img
    src={tutor.image}
    alt={tutor.name}
    className="
      h-full
      w-full
      object-cover
      transition-transform
      duration-700
      hover:scale-105
    "
  />

  {/* DARK OVERLAY */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />

  {/* TOP TAG */}
  <div className="absolute left-5 top-5">
    <span
      className="
        rounded-full
        bg-white/90
        px-4
        py-2
        text-xs
        font-semibold
        text-[#9f6d2f]
        backdrop-blur-md
      "
    >
      {tutor.highlight}
    </span>
  </div>

  {/* NAME AREA */}
  <div className="absolute bottom-6 left-6">
    <h3 className="font-serif text-5xl text-white leading-none drop-shadow-lg">
      {tutor.name}
    </h3>

    <p className="mt-2 text-sm font-semibold text-white/90">
      {tutor.role}
    </p>
  </div>
</div>

                {/* CONTENT */}
                <div className="flex flex-1 flex-col p-7">
                  <div className="flex flex-wrap gap-2">
                    {tutor.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-secondary px-3.5 py-1.5 text-xs font-semibold text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <p className="mt-6 text-sm leading-7 text-muted-foreground line-clamp-3">
                    {tutor.desc}
                  </p>

                  <div className="mt-auto flex items-center justify-between border-t pt-5">
                    <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                      Luna Tutor
                    </p>

                    <span className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white">
                      1:1 Support
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y bg-secondary/40 px-6 py-10">
        <div className="mx-auto grid max-w-6xl gap-6 text-center md:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Students supported</p>
            <p className="mt-1 font-semibold text-primary">
              International schools
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Subjects</p>
            <p className="mt-1 font-semibold text-primary">
              MAP · AEIS · TOEFL
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Languages</p>
            <p className="mt-1 font-semibold text-primary">EN · CN · JP</p>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="container mx-auto px-6 py-24">
        <div className="mb-14 text-center">
          <h2 className="font-serif text-4xl text-primary">
            A clear system for real improvement
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-5">
          {[
            "Trial Assessment",
            "Comprehensive Report",
            "Tutor Matching",
            "Progress Tracking",
            "Final Evaluation",
          ].map((step, i) => (
            <div key={step} className="text-center">
              <p className="font-semibold text-accent">{`0${i + 1}`}</p>
              <p className="mt-2 text-sm text-muted-foreground">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY LUNA PREVIEW */}
      <section className="bg-secondary/30 px-6 py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <div>
            <h2 className="font-serif text-4xl text-primary">
              Not just tuition. A structured learning system.
            </h2>

            <p className="mt-6 text-muted-foreground">
              We combine personalised learning, structured tracking, and tutor
              guidance to ensure consistent progress.
            </p>

            <Link to="/why-luna">
              <Button className="mt-8">
                Learn more
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="rounded-3xl border bg-card p-6">
            <ul className="space-y-4 text-sm">
              {[
                "1–1 personalised tutoring",
                "Pre-test / Mid-test / Post-test",
                "Tutor matching system",
                "Progress tracking with feedback",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <section className="container mx-auto px-6 py-24">
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-accent">
            Programs
          </p>

          <h2 className="font-serif text-4xl text-primary md:text-5xl">
            Designed for international students
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            From entrance exams to language development, each program is
            structured to support your child’s academic journey.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              title: "Entrance Exams",
              subtitle: "AEIS, CAT4, International School Entry",
              points: [
                "Structured preparation plan",
                "Interview + written support",
                "Past-style practice questions",
              ],
            },
            {
              title: "English & Academic Skills",
              subtitle: "MAP, WIDA, Writing, Reading",
              points: [
                "Reading comprehension",
                "Essay structure",
                "Vocabulary building",
              ],
            },
            {
              title: "Test Preparation",
              subtitle: "TOEFL, IELTS, Interview Training",
              points: [
                "Speaking & writing training",
                "Exam strategies",
                "Mock test simulations",
              ],
            },
          ].map((program) => (
            <div
              key={program.title}
              className="group relative rounded-3xl border bg-card p-8 shadow-soft transition hover:-translate-y-2 hover:shadow-elegant"
            >
              <h3 className="mb-2 font-serif text-2xl text-primary">
                {program.title}
              </h3>

              <p className="mb-6 text-sm text-muted-foreground">
                {program.subtitle}
              </p>

              <div className="space-y-2 text-sm text-muted-foreground">
                {program.points.map((point) => (
                  <p key={point}>✔ {point}</p>
                ))}
              </div>

              <Link
                to="/subjects"
                className="mt-6 inline-block text-sm font-medium text-primary"
              >
                Learn more →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-hero px-6 py-24 text-center">
        <h2 className="font-serif text-4xl text-primary">
          Start your child’s improvement journey
        </h2>

        <p className="mt-4 text-muted-foreground">
          Tell us your goals and we’ll recommend a personalised plan.
        </p>

        <Link to="/enquiry">
          <Button size="lg" className="mt-10 h-12 px-10 shadow-elegant">
            Enquire now
          </Button>
        </Link>
      </section>
    </div>
  );
};

export default Landing;