import { Link } from "react-router-dom";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const tutors = [
  {
    name: "Mimi",
    role: "English · Japanese Instructor",
    tags: ["TOEFL 117", "SAT 1460", "JLPT N1"],
    desc: "Specialises in MAP Reading, TOEFL speaking, and international school admissions.",
  },

  {
    name: "Grace",
    role: "English Tutor",
    tags: ["IB", "CAT4", "AEIS"],
    desc: "Focuses on structured problem solving and exam confidence building.",
  },

  {
    name: "Francis",
    role: "Japanese Language Tutor",
    tags: ["Native JP", "JLPT", "Conversation"],
    desc: "Supports students through practical communication and structured grammar learning.",
  },
];const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* HERO */}
<section className="relative overflow-hidden bg-hero px-6 py-28">
  <div className="absolute left-10 top-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
  <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

  <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
    {/* LEFT TEXT */}
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
        Personalised 1–1 tutoring for international students who need clearer
        guidance, stronger study habits, and more confident academic performance.
      </p>

      <p className="mt-4 text-sm font-medium text-primary">
        Trial lesson available · Online & offline support · English / Chinese / Japanese
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

    {/* RIGHT TRANSFORMATION MOCKUP */}
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
              Gives structured answers with confidence and clearer reasoning.
            </p>
          </div>
        </div>

        <div className="mt-7 rounded-2xl border bg-background p-5">
          <p className="text-sm text-muted-foreground">
            “My child finally understands how to approach questions, not just memorise answers.”
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
<section className="py-20 overflow-hidden bg-background">

  <div className="mx-auto max-w-7xl px-6 mb-10">
    <p className="text-sm uppercase tracking-[0.3em] text-accent font-semibold">
      Meet Our Tutors
    </p>

    <h2 className="mt-4 font-serif text-4xl md:text-5xl text-primary">
      Learn from experienced international tutors
    </h2>

    <p className="mt-4 max-w-2xl text-muted-foreground leading-7">
      Tutors from leading universities with strong academic backgrounds,
      multilingual communication skills, and real teaching experience.
    </p>
  </div>

  <div className="relative overflow-hidden py-4 group">

    {/* LEFT FADE */}
    <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-background to-transparent" />

    {/* RIGHT FADE */}
    <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-background to-transparent" />

    <div className="flex gap-6 animate-scroll group-hover:[animation-play-state:paused]">

      {[...tutors, ...tutors].map((tutor, i) => (
        <div
          key={i}
          className="
            min-w-[300px]
            rounded-3xl
            border
            bg-white/80
            backdrop-blur-sm
            p-7
            shadow-[0_8px_30px_rgb(0,0,0,0.04)]
            transition-all
            duration-300
            hover:-translate-y-1
          "
        >

          <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-xl font-serif mb-4">
            {tutor.name[0]}
          </div>

          <h3 className="font-serif text-2xl text-primary">
            {tutor.name}
          </h3>

          <p className="text-accent text-sm font-medium mt-1">
            {tutor.role}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {tutor.tags.map((tag, idx) => (
              <span
                key={idx}
                className="rounded-full bg-secondary px-3 py-1 text-xs text-primary"
              >
                {tag}
              </span>
            ))}
          </div>

          <p className="text-muted-foreground text-sm mt-5 leading-6">
            {tutor.desc}
          </p>

        </div>
      ))}

    </div>
  </div>
</section>


      {/* TRUST STRIP */}
      <section className="border-y bg-secondary/40 px-6 py-10">
        <div className="mx-auto max-w-6xl grid md:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-sm text-muted-foreground">Students supported</p>
            <p className="text-primary font-semibold mt-1">International schools</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Subjects</p>
            <p className="text-primary font-semibold mt-1">MAP · AEIS · TOEFL</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Languages</p>
            <p className="text-primary font-semibold mt-1">EN · CN · JP</p>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="container mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="font-serif text-4xl text-primary">
            A clear system for real improvement
          </h2>
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          {[
            "Trial Assessment",
            "Comprehensive Report",
            "Tutor Matching",
            "Progress Tracking",
            "Final Evaluation",
          ].map((step, i) => (
            <div key={step} className="text-center">
              <p className="text-accent font-semibold">{`0${i + 1}`}</p>
              <p className="mt-2 text-sm text-muted-foreground">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY LUNA PREVIEW */}
      <section className="bg-secondary/30 px-6 py-24">
        <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-12 items-center">
          
          <div>
            <h2 className="font-serif text-4xl text-primary">
              Not just tuition.  
              A structured learning system.
            </h2>

            <p className="mt-6 text-muted-foreground">
              We combine personalised learning, structured tracking, and tutor guidance to ensure consistent progress.
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

     <section className="container mx-auto px-6 py-24">
  <div className="mb-14 text-center">
    <p className="text-sm uppercase tracking-widest text-accent font-medium mb-3">
      Programs
    </p>

    <h2 className="font-serif text-4xl md:text-5xl text-primary">
      Designed for international students
    </h2>

    <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
      From entrance exams to language development, each program is structured
      to support your child’s academic journey.
    </p>
  </div>

  <div className="grid md:grid-cols-3 gap-8">
    
    {/* CARD 1 */}
    <div className="group relative rounded-3xl border bg-card p-8 shadow-soft transition hover:-translate-y-2 hover:shadow-elegant">
      <h3 className="font-serif text-2xl text-primary mb-2">
        Entrance Exams
      </h3>
      <p className="text-sm text-muted-foreground mb-6">
        AEIS, CAT4, International School Entry
      </p>

      <div className="space-y-2 text-sm text-muted-foreground">
        <p>✔ Structured preparation plan</p>
        <p>✔ Interview + written support</p>
        <p>✔ Past-style practice questions</p>
      </div>

      <Link to="/subjects" className="mt-6 inline-block text-primary text-sm font-medium">
        Learn more →
      </Link>
    </div>

    {/* CARD 2 */}
    <div className="group relative rounded-3xl border bg-card p-8 shadow-soft transition hover:-translate-y-2 hover:shadow-elegant">
      <h3 className="font-serif text-2xl text-primary mb-2">
        English & Academic Skills
      </h3>
      <p className="text-sm text-muted-foreground mb-6">
        MAP, WIDA, Writing, Reading
      </p>

      <div className="space-y-2 text-sm text-muted-foreground">
        <p>✔ Reading comprehension</p>
        <p>✔ Essay structure</p>
        <p>✔ Vocabulary building</p>
      </div>

      <Link to="/subjects" className="mt-6 inline-block text-primary text-sm font-medium">
        Learn more →
      </Link>
    </div>

    {/* CARD 3 */}
    <div className="group relative rounded-3xl border bg-card p-8 shadow-soft transition hover:-translate-y-2 hover:shadow-elegant">
      <h3 className="font-serif text-2xl text-primary mb-2">
        Test Preparation
      </h3>
      <p className="text-sm text-muted-foreground mb-6">
        TOEFL, IELTS, Interview Training
      </p>

      <div className="space-y-2 text-sm text-muted-foreground">
        <p>✔ Speaking & writing training</p>
        <p>✔ Exam strategies</p>
        <p>✔ Mock test simulations</p>
      </div>

      <Link to="/subjects" className="mt-6 inline-block text-primary text-sm font-medium">
        Learn more →
      </Link>
    </div>

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