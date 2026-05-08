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
  Star,
  Users,
  GraduationCap,
  Heart,
} from "lucide-react";
import Footer from "@/components/Footer";

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
    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/10 bg-white/85 shadow-[0_12px_35px_rgba(15,23,42,0.08)] backdrop-blur transition group-hover:-translate-y-1 sm:h-14 sm:w-14">
      <Icon className="h-5 w-5 text-accent sm:h-6 sm:w-6" />
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
  <div className="min-w-[120px] rounded-2xl border border-primary/10 bg-white/92 px-4 py-3 shadow-[0_18px_50px_rgba(15,23,42,0.12)] backdrop-blur-2xl xl:min-w-[138px] xl:px-5 xl:py-4">
    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70">
      {label}
    </p>
    <p className="mt-1 font-serif text-2xl text-primary xl:text-3xl">
      {value}
    </p>
    <p className="text-xs text-muted-foreground">{sub}</p>
  </div>
);

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />

     {/* HERO */}
<section className="relative overflow-hidden bg-[#fbfaf6] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
  <div className="absolute inset-0 bg-[linear-gradient(90deg,#fffdf8_0%,#fffaf0_48%,#f7fbff_100%)]" />

  <div className="relative mx-auto min-h-[620px] w-full max-w-[1440px] overflow-hidden rounded-[2.5rem] bg-[#fffdf8] md:min-h-[680px] lg:min-h-[720px]">
    
    {/* IMAGE BACKGROUND */}
    <img
      src="/hero/luna_hero_girl.png"
      alt="Luna Education student studying"
      className="
        absolute
        inset-y-0
        right-0
        h-full
        w-[72%]
        object-cover
        object-[45%_42%]
        opacity-95
        max-md:w-full
        max-md:opacity-25
      "
    />

    {/* BLEND */}
    <div className="absolute inset-0 bg-gradient-to-r from-[#fffdf8] via-[#fffdf8]/85 to-transparent md:via-[#fffdf8]/55" />
    <div className="absolute inset-0 bg-gradient-to-t from-[#fbfaf6]/80 via-transparent to-transparent" />

    {/* LEFT CONTENT */}
    <div className="relative z-20 w-full max-w-[620px] px-6 py-10 sm:px-10 md:px-12 lg:px-14 lg:py-16">
      <div className="mb-5 flex items-center gap-3">
        <span className="h-px w-10 bg-accent" />
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent sm:text-sm">
          Personalised 1–1 Tutoring
        </p>
      </div>

      <h1 className="font-serif text-[clamp(2.3rem,4.7vw,5.1rem)] font-medium leading-[1.04] text-primary">
        Helping international students think clearly.
        <span className="relative mt-2 block italic text-accent">
          Learn confidently.
          <span className="absolute -bottom-2 left-0 h-[10px] w-[min(320px,100%)] rounded-full bg-accent/20" />
        </span>
      </h1>

      <p className="mt-7 max-w-lg text-base leading-8 text-slate-600 sm:text-lg">
        Personalised support that builds clarity, stronger study habits, and
        real academic results.
      </p>

      <div className="mt-8 grid max-w-xl grid-cols-2 gap-4 sm:grid-cols-4">
        <HeroFeature icon={BookOpen} title="Expert Tutors" subtitle="Top international graduates" />
        <HeroFeature icon={Target} title="Personalised" subtitle="Learning plans just for you" />
        <HeroFeature icon={BarChart3} title="Proven Results" subtitle="Better habits, better outcomes" />
        <HeroFeature icon={Globe2} title="Multilingual" subtitle="EN / 中文 / 日本語" />
      </div>

      <div className="mt-9 flex flex-col gap-4 sm:flex-row">
        <Link to="/enquiry">
          <Button className="h-14 w-full rounded-2xl bg-primary px-8 text-base shadow-[0_18px_45px_rgba(10,36,84,0.22)] sm:w-auto">
            Enquire now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>

        <Link to="/subjects">
          <Button variant="outline" className="h-14 w-full rounded-2xl border-primary/20 bg-white/80 px-8 text-base text-primary shadow-sm backdrop-blur sm:w-auto">
            Explore programs
          </Button>
        </Link>
      </div>

      <p className="mt-7 text-sm font-medium texprimary/70">
        Online & offline support · Trial lesson available
      </p>
    </div>

    {/* FLOATING CARDS */}
    <div className="absolute right-[6%] top-[16%] z-20 hidden w-[390px] rounded-[1.8rem] border border-white/80 bg-white/85 p-5 shadow-[0_25px_80px_rgba(15,23,42,0.14)] backdrop-blur-2xl md:block lg:right-[10%]">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
        Student Transformation
      </p>

      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-primary">Before</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Confused notes<br />Scattered ideas<br />Low confidence
          </p>
        </div>

        <ArrowRight className="mt-9 h-6 w-6 text-accent" />

        <div>
          <p className="text-xs font-bold uppercase text-accent">After</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Clear structure<br />Confident answers<br />Stronger results
          </p>
        </div>
      </div>
    </div>

    <div className="absolute bottom-[12%] right-[22%] z-20 hidden w-[330px] rounded-[1.8rem] border border-white/80 bg-white/85 p-5 shadow-[0_25px_80px_rgba(15,23,42,0.14)] backdrop-blur-2xl md:block lg:right-[30%]">
      <p className="font-serif text-3xl text-accent">“</p>

      <p className="mt-1 text-sm leading-7 text-primary/80">
        Luna Education helped me organise my thoughts and explain answers clearly.
        I finally enjoy learning!
      </p>

      <p className="mt-3 text-sm font-semibold text-primary">
        — Chloe, Grade 11
      </p>

      <div className="mt-3 flex gap-1 text-accent">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className="h-4 w-4 fill-current" />
        ))}
      </div>
    </div>
  </div>

  {/* BOTTOM STATS */}
  <div className="relative z-30 mx-auto mt-8 grid max-w-[1440px] gap-4 rounded-[2rem] border border-white/80 bg-white/85 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-5">
    {[
      { icon: Users, value: "500+", title: "Students supported" },
      { icon: Star, value: "95%", title: "Students improve within 3 months" },
      { icon: Globe2, value: "10+", title: "Countries represented" },
      { icon: GraduationCap, value: "Top Uni", title: "Worldwide support" },
      { icon: Heart, value: "4.9/5", title: "Average parent rating" },
    ].map((item) => (
      <div key={item.title} className="flex min-w-0 items-center gap-4 lg:border-r lg:border-primary/10 lg:last:border-r-0">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary/70 sm:h-14 sm:w-14">
          <item.icon className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
        </div>

        <div className="min-w-0">
          <p className="font-serif text-2xl text-primary sm:text-3xl">
            {item.value}
          </p>
          <p className="text-xs leading-5 text-muted-foreground sm:text-sm">
            {item.title}
          </p>
        </div>
      </div>
    ))}
  </div>
</section>
      <div className="group relative overflow-hidden py-10">
  <div className="pointer-events-none absolute left-0 top-0 z-20 h-full w-20 bg-gradient-to-r from-background to-transparent md:w-40" />
  <div className="pointer-events-none absolute right-0 top-0 z-20 h-full w-20 bg-gradient-to-l from-background to-transparent md:w-40" />

  <div className="marquee-track flex items-stretch gap-6 will-change-transform">
    {[...tutors, ...tutors, ...tutors].map((tutor, i) => (
      <div
        key={i}
        className="
          flex
          shrink-0
          flex-col
          overflow-hidden
          rounded-[2rem]
          border
          border-white/70
          bg-white
          shadow-[0_20px_60px_rgba(15,23,42,0.08)]
          transition-all
          duration-500
          hover:-translate-y-2
          hover:shadow-[0_30px_80px_rgba(15,23,42,0.14)]

          w-[280px]
          sm:w-[320px]
          lg:w-[360px]

          min-h-[470px]
        "
      >
        {/* IMAGE */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={tutor.image}
            alt={tutor.name}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

          <div className="absolute left-4 top-4">
            <span className="rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-[#9f6d2f] backdrop-blur-md">
              {tutor.highlight}
            </span>
          </div>

          <div className="absolute bottom-5 left-5">
            <h3 className="font-serif text-4xl leading-none text-white drop-shadow-lg">
              {tutor.name}
            </h3>

            <p className="mt-2 text-sm font-semibold text-white/90">
              {tutor.role}
            </p>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex flex-1 flex-col p-6">
          <div className="flex flex-wrap gap-2">
            {tutor.tags.map((tag, idx) => (
              <span
                key={idx}
                className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary"
              >
                {tag}
              </span>
            ))}
          </div>

          <p className="mt-5 flex-1 text-sm leading-7 text-muted-foreground">
            {tutor.desc}
          </p>

          <div className="mt-6 flex items-center justify-between border-t pt-4">
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

      <Footer />
    </div>
  );
};

export default Landing;