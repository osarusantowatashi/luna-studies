import { Link } from "react-router-dom";
import NavBar from "@/components/NavBar";
import LunaMascotChat from "@/components/LunaMascotChat";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  ArrowRight,
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

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* HERO */}
<section className="relative overflow-hidden bg-[#fbf7ef] px-4 pt-28 pb-8 sm:px-6 lg:px-8 lg:pt-32">
  <div className="absolute inset-0 bg-[linear-gradient(90deg,#fbf7ef_0%,#fffaf2_45%,#f7fbff_100%)]" />

  <div className="relative z-10 mx-auto max-w-[1500px]">
    <div className="grid min-h-[760px] grid-cols-1 items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
      {/* LEFT TEXT */}
      <div className="relative z-20">
        <h1 className="max-w-[720px] leading-[0.9] tracking-[-0.06em] text-[#061a39]">
          <span className="block overflow-hidden">
            <span className="block animate-title-1 font-sans text-[clamp(4.5rem,8vw,6.4rem)] font-medium">
              Your future
            </span>
          </span>

          <span className="mt-[-10px] block overflow-hidden">
            <span className="block animate-title-2 font-sans text-[clamp(4rem,7.5vw,6.8rem)] italic font-light">
              seems to
            </span>
          </span>

          <span className="mt-[-22px] block overflow-hidden">
            <span className="block animate-title-3 font-sans text-[clamp(4rem,7.5vw,6.8rem)] italic font-light">
              be
            </span>
          </span>

          <span className="mt-[-12px] block overflow-hidden">
            <span className="block animate-title-4 font-serif text-[clamp(4.8rem,8vw,7.2rem)] italic text-[#caa24a]">
              travelling.
            </span>
          </span>
        </h1>

        <div className="mt-3 h-[2px] w-[360px] max-w-full bg-[#caa24a]" />

        <p className="mt-8 max-w-[480px] text-xl leading-9 text-[#071b3a]/90">
          Premium 1-on-1 tutoring for international students.
          <br />
          Personalised. Global. Future-ready.
        </p>

        <div className="mt-9 flex flex-wrap gap-5">
          <Link to="/enquiry">
            <Button className="h-14 rounded-full bg-[#071b3a] px-9 text-white shadow-xl transition hover:-translate-y-1">
              Enquire now
              <ArrowRight className="ml-4 h-4 w-4" />
            </Button>
          </Link>

          <Link to="/subjects">
            <Button
              variant="outline"
              className="h-14 rounded-full border border-[#071b3a]/40 bg-white/50 px-9 font-medium text-[#071b3a] backdrop-blur transition hover:bg-white"
            >
              View Programs
            </Button>
          </Link>
        </div>

        <div className="mt-10 flex items-center gap-4">
          <div className="flex -space-x-3">
            {["/student1.jpg", "/student2.jpg", "/student3.jpg", "/student4.jpg", "/student5.jpg"].map(
              (src, i) => (
                <img
                  key={i}
                  src={src}
                  className="h-10 w-10 rounded-full border-2 border-white bg-slate-200 object-cover"
                />
              )
            )}
          </div>
          <p className="text-sm text-[#071b3a]/80">
            Students from <span className="text-[#caa24a]">12+</span> countries
          </p>
        </div>
      </div>

      {/* RIGHT VISUAL */}
      <div className="relative hidden h-[820px] overflow-visible lg:block">
        <div className="absolute right-[30px] top-[-90px] h-[760px] w-[760px] overflow-hidden rounded-t-full rounded-bl-[18px] rounded-br-[46px] bg-[#dceaf8] shadow-[0_35px_100px_rgba(7,27,58,0.14)]">
          <img
            src="/hero/aquarium.jpeg"
            className="h-full w-full object-cover animate-aquarium"
          />

          <div className="absolute right-0 top-0 h-full w-[48%] bg-gradient-to-b from-[#cfe7f7] to-[#f7efe2]" />

          <img
            src="/hero/europe.jpeg"
            className="absolute right-[30px] top-[20px] z-30 h-[165px] w-[250px] rotate-[4deg] rounded-md object-cover shadow-2xl animate-paste-2"
          />

          <img
            src="/hero/city.jpeg"
            className="absolute right-[110px] top-[145px] z-20 h-[155px] w-[240px] rotate-[-3deg] rounded-md object-cover shadow-2xl animate-paste-3"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-[#fbf7ef]/25" />

          <div className="absolute bottom-[-100px] left-[40px] h-[430px] w-[430px] rounded-full border border-[#caa24a]/45" />
        </div>

        <img
          src="/hero/hero-student.png"
          className="absolute right-[150px] bottom-[60px] z-30 h-[670px] object-contain drop-shadow-2xl animate-fade-in"
        />

        <div className="absolute right-[35px] top-[65px] z-50 w-[210px] rotate-[-6deg] rounded-xl border border-white/60 bg-white/75 p-5 shadow-xl backdrop-blur-2xl animate-card-2">
          <p className="text-sm font-semibold">✈ Departures</p>
          <div className="mt-3 space-y-2 text-[11px] text-[#071b3a]/70">
            <div className="flex justify-between"><span>08:40</span><span>London</span><span>7</span></div>
            <div className="flex justify-between"><span>09:15</span><span>Singapore</span><span>12</span></div>
            <div className="flex justify-between"><span>09:30</span><span>Toronto</span><span>3</span></div>
            <div className="flex justify-between"><span>09:55</span><span>Melbourne</span><span>8</span></div>
          </div>
          <p className="mt-5 font-serif italic text-lg leading-5">
            The world is
            <br />
            wider than
            <br />
            we imagine.
          </p>
          <div className="mt-2 h-[2px] w-24 bg-[#caa24a]" />
        </div>

        <div className="absolute left-[130px] top-[300px] z-40 rounded-2xl border border-white/60 bg-white/75 px-7 py-6 shadow-xl backdrop-blur-2xl animate-card-1">
          <p className="text-xs tracking-wide text-[#071b3a]/70">TOEFL iBT</p>
          <p className="mt-2 font-serif text-4xl text-[#071b3a]">117</p>
          <p className="mt-1 text-xs text-[#071b3a]/55">Total Score</p>
          <span className="absolute right-4 top-1/2 rounded-full bg-white p-2 text-[#caa24a] shadow">
            <ArrowRight className="h-3.5 w-3.5 -rotate-45" />
          </span>
        </div>

        <div className="absolute bottom-[215px] left-[45px] z-40 w-64 rounded-2xl border border-white/60 bg-white/75 px-7 py-6 shadow-xl backdrop-blur-2xl animate-card-3">
          <p className="text-sm text-[#071b3a]/70">Waseda University</p>
          <p className="mt-1 text-lg font-semibold text-[#071b3a]">SILS 合格</p>
          <p className="mt-4 text-xs text-[#071b3a]/50">Congratulations!</p>
        </div>

        <div className="absolute bottom-[255px] right-[10px] z-40 w-72 rounded-2xl border border-white/60 bg-white/75 px-7 py-6 shadow-xl backdrop-blur-2xl animate-card-4">
          <p className="text-sm text-[#071b3a]/70">Students across</p>
          <p className="mt-2 font-serif text-3xl text-[#071b3a]">12+ countries</p>
          <div className="mt-4 flex gap-2 text-base">
            <span>🇯🇵</span>
            <span>🇸🇬</span>
            <span>🇨🇳</span>
            <span>🇬🇧</span>
            <span>🇺🇸</span>
            <span className="rounded-full bg-white px-2">＋</span>
          </div>
        </div>
      </div>

      {/* MOBILE IMAGE */}
      <div className="relative overflow-hidden rounded-[2rem] lg:hidden">
        <img
          src="/hero/hero-student.png"
          alt="Luna Education student"
          className="w-full object-cover"
        />
      </div>
    </div>

   
  </div>
</section>

      <div className="group relative overflow-hidden py-10">
        <div className="pointer-events-none absolute left-0 top-0 z-20 h-full w-20 bg-gradient-to-r from-background to-transparent md:w-40" />
        <div className="pointer-events-none absolute right-0 top-0 z-20 h-full w-20 bg-gradient-to-l from-background to-transparent md:w-40" />

        <div className="marquee-track flex items-stretch gap-6 will-change-transform">
          {[...tutors, ...tutors, ...tutors].map((tutor, i) => (
            <div
              key={i}
              className="flex shrink-0 flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_80px_rgba(15,23,42,0.14)] w-[280px] sm:w-[320px] lg:w-[360px] min-h-[470px]"
            >
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
                  <h3 className="font-poppins text-4xl leading-none text-white drop-shadow-lg">
                    {tutor.name}
                  </h3>

                  <p className="mt-2 text-sm font-semibold text-white/90">
                    {tutor.role}
                  </p>
                </div>
              </div>

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
          <h2 className="font-poppins text-4xl text-primary">
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
            <h2 className="font-poppins text-4xl text-primary">
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

          <h2 className="font-poppins text-4xl text-primary md:text-5xl">
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
              <h3 className="mb-2 font-poppins text-2xl text-primary">
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

      <LunaMascotChat />

      {/* CTA */}
      <section className="bg-hero px-6 py-24 text-center">
        <h2 className="font-poppins text-4xl text-primary">
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