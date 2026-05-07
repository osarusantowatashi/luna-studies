import { Link } from "react-router-dom";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  ArrowRight,
  Sparkles,
  BookOpen,
  Target,
  BarChart3,
  Globe2,
  Trophy,
  Star,
  Users,
  GraduationCap,
  Heart,
} from "lucide-react";

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

const HeroFeature = ({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: any;
  title: string;
  subtitle: string;
}) => (
  <div className="group">
    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/10 bg-white/80 shadow-[0_12px_35px_rgba(15,23,42,0.08)] backdrop-blur transition group-hover:-translate-y-1">
      <Icon className="h-6 w-6 text-accent" />
    </div>
    <p className="text-sm font-bold text-primary">{title}</p>
    <p className="mt-1 text-xs leading-5 text-muted-foreground">{subtitle}</p>
  </div>
);

const ResultBadge = ({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) => (
  <div className="min-w-[138px] rounded-2xl border border-primary/10 bg-white/90 px-5 py-4 shadow-[0_18px_50px_rgba(15,23,42,0.12)] backdrop-blur">
    <p className="text-xs font-bold uppercase tracking-widest text-primary/70">
      {label}
    </p>
    <p className="mt-1 font-serif text-3xl text-primary">{value}</p>
    <p className="text-xs text-muted-foreground">{sub}</p>
  </div>
);

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* HERO */}
      <section className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-[#fbfaf6] px-6 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_20%,rgba(255,197,82,0.22),transparent_28%),radial-gradient(circle_at_82%_68%,rgba(10,36,84,0.10),transparent_30%),linear-gradient(90deg,#fffdf8_0%,#fffaf0_40%,#f7fbff_100%)]" />
        <div className="absolute left-8 top-20 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute right-0 top-0 h-[520px] w-[520px] rounded-full bg-primary/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid min-h-[720px] items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            {/* LEFT */}
            <div className="relative z-20 pt-10">
              <div className="mb-6 flex items-center gap-3">
                <span className="h-px w-10 bg-accent" />
                <p className="text-sm font-bold uppercase tracking-[0.28em] text-accent">
                  Personalised 1–1 Tutoring
                </p>
              </div>

              <h1 className="max-w-2xl font-serif text-5xl font-medium leading-[1.04] text-primary md:text-7xl">
                Helping international students think clearly.
                <span className="relative mt-2 block italic text-accent">
                  Learn confidently.
                  <span className="absolute -bottom-2 left-0 h-[10px] w-[360px] max-w-full rounded-full bg-accent/20" />
                </span>
              </h1>

              <p className="mt-8 max-w-xl text-lg leading-8 text-slate-600 md:text-xl">
                Personalised support that builds clarity, stronger study habits,
                and real academic results.
              </p>

              <div className="mt-9 grid max-w-xl grid-cols-2 gap-6 sm:grid-cols-4">
                <HeroFeature
                  icon={BookOpen}
                  title="Expert Tutors"
                  subtitle="Top international graduates"
                />
                <HeroFeature
                  icon={Target}
                  title="Personalised"
                  subtitle="Learning plans just for you"
                />
                <HeroFeature
                  icon={BarChart3}
                  title="Proven Results"
                  subtitle="Better habits, better outcomes"
                />
                <HeroFeature
                  icon={Globe2}
                  title="Multilingual"
                  subtitle="EN / 中文 / 日本語"
                />
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link to="/enquiry">
                  <Button
                    size="lg"
                    className="h-14 rounded-2xl bg-primary px-9 text-base shadow-[0_18px_45px_rgba(10,36,84,0.22)]"
                  >
                    Enquire now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>

                <Link to="/subjects">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 rounded-2xl border-primary/20 bg-white/80 px-9 text-base text-primary shadow-sm backdrop-blur"
                  >
                    Explore programs
                  </Button>
                </Link>
              </div>

              <p className="mt-7 text-sm font-medium text-primary/70">
                Online & offline support · Trial lesson available
              </p>
            </div>

            {/* RIGHT VISUAL */}
            <div className="relative z-10 min-h-[720px]">
              <img
  src="/hero/luna_hero_girl.png"
  alt="Luna Education student studying"
  className="
    absolute
    z-0
    bottom-[-10px]
    left-[56%]
    h-[880px]
    w-[980px]
    -translate-x-1/2
    object-cover
    object-bottom
    drop-shadow-[0_35px_70px_rgba(15,23,42,0.16)]
  "
/>
<div className="absolute right-20 top-40 h-[400px] w-[400px] rounded-full bg-[#f7d58a]/30 blur-3xl" />

              <div className="absolute left-2 top-24 hidden rotate-[-8deg] font-serif text-2xl italic leading-8 text-primary md:block">
                Better ♡
                <br />
                understanding.
                <br />
                <span className="text-accent">Better me.</span>
              </div>

              <div className="absolute [-30px] top-8 w-[380px] rounded-[2rem] border border-white/80 bg-white/80 p-7 shadow-[0_25px_90px_rgba(15,23,42,0.14)] backdrop-blur-xl">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">
                  Student Transformation
                </p>

                <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-5">
                  <div>
                    <p className="text-xs font-bold uppercase text-primary">
                      Before
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      Confused notes
                      <br />
                      Scattered ideas
                      <br />
                      Low confidence
                    </p>
                    <div className="mt-5 h-16 w-16 rounded-full border border-primary/15 bg-[radial-gradient(circle,transparent_35%,rgba(10,36,84,0.15)_36%,transparent_38%)]" />
                  </div>

                  <ArrowRight className="h-8 w-8 text-accent" />

                  <div>
                    <p className="text-xs font-bold uppercase text-accent">
                      After
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      Clear structure
                      <br />
                      Confident answers
                      <br />
                      Stronger results
                    </p>
                    <div className="mt-5 h-16 w-16 rounded-full border-2 border-accent/50" />
                  </div>
                </div>
              </div>

              <div className="absolute bottom-24 right-[-10px] w-[380px] rounded-[2rem] border border-white/80 bg-white/85 p-7 shadow-[0_25px_90px_rgba(15,23,42,0.14)] backdrop-blur-xl">
                <p className="font-serif text-4xl text-accent">“</p>
                <p className="mt-2 text-sm leading-7 text-primary/80">
                  Luna Education helped me organise my thoughts and explain
                  answers clearly. I finally enjoy learning!
                </p>
                <p className="mt-4 text-sm font-semibold text-primary">
                  — Chloe, Grade 11
                </p>
                <div className="mt-4 flex gap-1 text-accent">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </div>

              <div className="absolute bottom-12 left-0 hidden gap-3 lg:flex">
                <ResultBadge label="IELTS" value="8.5" sub="Overall" />
                <ResultBadge label="SAT" value="1500" sub="+310 points" />
                <ResultBadge label="TOEFL" value="114" sub="+19 points" />              </div>
            </div>
          </div>

          {/* BOTTOM STATS */}
          <div className="relative z-30 -mt-4 grid gap-4 rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl md:grid-cols-5">
            {[
              {
                icon: Users,
                value: "500+",
                title: "Students supported",
              },
              {
                icon: Star,
                value: "95%",
                title: "Students improve within 3 months",
              },
              {
                icon: Globe2,
                value: "10+",
                title: "Countries represented",
              },
              {
                icon: GraduationCap,
                value: "Top Uni",
                title: "UK / US / JP / SG support",
              },
              {
                icon: Heart,
                value: "4.9/5",
                title: "Average parent rating",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-4 border-primary/10 md:border-r md:last:border-r-0"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-secondary/70">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-serif text-3xl text-primary">
                    {item.value}
                  </p>
                  <p className="text-sm leading-5 text-muted-foreground">
                    {item.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TUTOR MARQUEE */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-secondary/20 to-background py-28">
        <div className="absolute left-0 top-10 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute right-0 bottom-10 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative mx-auto mb-12 max-w-7xl px-6">
          <div className="flex items-center gap-2 text-accent">
            <Sparkles className="h-4 w-4" />
            <p className="text-sm font-semibold uppercase tracking-[0.3em]">
              Meet Our Tutors
            </p>
          </div>

          <h2 className="mt-4 max-w-4xl font-serif text-4xl leading-tight text-primary md:text-6xl">
            Learn from tutors who make progress feel possible
          </h2>

          <p className="mt-5 max-w-2xl leading-7 text-muted-foreground">
            Experienced multilingual tutors with strong academic backgrounds,
            structured lesson planning, and real student-support experience.
          </p>
        </div>

        <div className="group relative overflow-hidden py-8">
          <div className="pointer-events-none absolute left-0 top-0 z-20 h-full w-40 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 z-20 h-full w-40 bg-gradient-to-l from-background to-transparent" />

          <div className="flex w-max animate-infinite-scroll gap-8 group-hover:[animation-play-state:paused]">
            {[...tutors, ...tutors, ...tutors].map((tutor, i) => (
              <div
                key={i}
                className="flex h-[500px] w-[380px] shrink-0 flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.10)] transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_35px_100px_rgba(15,23,42,0.18)]"
              >
                <div className="relative h-[250px] overflow-hidden">
                  <img
                    src={tutor.image}
                    alt={tutor.name}
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />

                  <div className="absolute left-5 top-5">
                    <span className="rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-[#9f6d2f] backdrop-blur-md">
                      {tutor.highlight}
                    </span>
                  </div>

                  <div className="absolute bottom-6 left-6">
                    <h3 className="font-serif text-5xl leading-none text-white drop-shadow-lg">
                      {tutor.name}
                    </h3>

                    <p className="mt-2 text-sm font-semibold text-white/90">
                      {tutor.role}
                    </p>
                  </div>
                </div>

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

                  <p className="mt-6 line-clamp-3 text-sm leading-7 text-muted-foreground">
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