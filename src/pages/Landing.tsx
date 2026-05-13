
import { Link } from "react-router-dom";
import NavBar from "@/components/NavBar";
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
  X,
  MessageCircle
} from "lucide-react";
import Footer from "@/components/Footer";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import TutorProfileModal from "@/components/TutorProfileModal";




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
    <p className="mt-1 max-w-[110px] text-xs leading-5 text-muted-foreground">{subtitle}</p>
  </div>
);

const Landing = () => {
  
  const { t } = useTranslation();
  const [selectedTutor, setSelectedTutor] = useState<any | null>(null);

  const tutors = [
    {
      name: "Mimi",
      role: t("landing.tutors.mimi.role"),
      image: "/tutors/mimi_new.jpg",
      tags: ["TOEFL 119", "IELTS 8.5", "JLPT N1"],
      desc: t("landing.tutors.mimi.desc"),
      highlight: "MAP · TOEFL · Admissions",
      education: t("landing.tutors.mimi.education"),
      languages: t("landing.tutors.mimi.languages"),
      subjects: t("landing.tutors.mimi.subjects", { returnObjects: true }) as string[],
      experience: t("landing.tutors.mimi.experience", { returnObjects: true }) as string[],
    },
    {
      name: "Grace",
      role: t("landing.tutors.grace.role"),
      image: "/tutors/grace_new.jpg",
      tags: ["TOEFL 108", "IB 40", "Master Degree"],
      desc: t("landing.tutors.grace.desc"),
      highlight: "IB · CAT4 · AEIS",
      education: t("landing.tutors.grace.education"),
      languages: t("landing.tutors.grace.languages"),
      subjects: t("landing.tutors.grace.subjects", { returnObjects: true }) as string[],
      experience: t("landing.tutors.grace.experience", { returnObjects: true }) as string[],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#fbfaf6] px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#fffdf8_0%,#fffaf2_48%,#f7fbff_100%)]" />

        {/* RIGHT IMAGE AS BACKGROUND */}
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[62%] lg:block">
          <img
            src="/hero/luna_girl.jpeg"
            alt="Luna Education student studying"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />

          <div className="absolute inset-y-0 left-0 w-[44%] bg-gradient-to-r from-[#fbfaf6] via-[#fbfaf6]/90 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-t from-[#fbfaf6] via-[#fbfaf6]/80 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-[16%] bg-gradient-to-b from-[#fbfaf6]/90 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1440px]">
        <div className="grid min-h-[auto] items-center gap-10 py-4 lg:min-h-[660px] lg:grid-cols-[0.8fr_1.2fr]">
            {/* LEFT */}
            <div className="relative z-20 w-full max-w-[560px]">
              <div className="mb-5 flex items-center gap-3">
                <span className="h-px w-10 bg-accent" />
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent sm:text-sm">
                  {t("landing.hero.label")}
                </p>
              </div>

              <h1 className="max-w-[760px] font-serif text-[2.5rem] font-medium leading-[1.08] text-primary sm:text-[3.2rem] lg:text-[clamp(2.6rem,3.8vw,4.2rem)]">
                {t("landing.hero.title")}
                <span className="relative mt-2 block italic leading-tight text-accent">
                  {t("landing.hero.accent")}
                  <span className="absolute -bottom-2 left-0 h-[10px] w-[min(340px,100%)] rounded-full bg-accent/20" />
                </span>
              </h1>

              <p className="mt-7 max-w-[520px] text-sm leading-7 text-slate-600 sm:text-base lg:text-lg">
                {t("landing.hero.subtitle")}
              </p>

              <div className="mt-8 grid max-w-[680px] grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
                <HeroFeature
                  icon={BookOpen}
                  title={t("landing.features.tutors.title")}
                  subtitle={t("landing.features.tutors.subtitle")}
                />
                <HeroFeature
                  icon={Target}
                  title={t("landing.features.personalised.title")}
                  subtitle={t("landing.features.personalised.subtitle")}
                />
                <HeroFeature
                  icon={BarChart3}
                  title={t("landing.features.results.title")}
                  subtitle={t("landing.features.results.subtitle")}
                />
                <HeroFeature
                  icon={Globe2}
                  title={t("landing.features.language.title")}
                  subtitle={t("landing.features.language.subtitle")}
                />
              </div>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link to="/enquiry">
                  <Button className="h-12 w-full rounded-2xl text-sm sm:h-14 sm:text-base bg-primary px-8 text-base shadow-[0_18px_45px_rgba(10,36,84,0.22)] sm:w-auto">
                    {t("landing.buttons.enquire")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>

                <Link to="/subjects">
                  <Button
                    variant="outline"
                    className="h-12 w-full rounded-2xl text-sm sm:h-14 sm:text-base border-primary/20 bg-white/80 px-8 text-base text-primary shadow-sm backdrop-blur sm:w-auto"
                  >
                    {t("landing.buttons.programs")}
                  </Button>
                </Link>
              </div>

              <p className="mt-7 text-sm font-medium text-primary/70">
                {t("landing.hero.note")}
              </p>
            </div>

            {/* RIGHT SIDE FLOATING CARD */}
            <div className="relative hidden h-full lg:block">
              <div className="absolute bottom-[25%] left-[10%] w-[72%] max-w-[620px] rounded-[28px] border border-white/70 bg-white/72 px-7 py-5 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-2xl">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary">
                  {t("landing.floating.title")}
                </p>

                <p className="mt-2 text-sm leading-6 text-primary/80 sm:text-base">
                  {t("landing.floating.subtitle")}
                </p>
              </div>
            </div>

            {/* MOBILE IMAGE ONLY */}
            <div className="relative overflow-hidden rounded-[1.6rem] lg:hidden">
              <img
                src="/hero/luna_girl.jpeg"
                alt="Luna Education student studying"
                className="w-full object-cover"
              />
            </div>
          </div>

          {/* BOTTOM STATS */}
          <div className="relative z-30 mx-auto grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 rounded-[2rem] border border-white/80 bg-white/85 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-5">
            {[
              {
                icon: Users,
                value: "500+",
                title: t("landing.stats.students"),
              },
              {
                icon: Star,
                value: "95%",
                title: t("landing.stats.improve"),
              },
              {
                icon: Globe2,
                value: "10+",
                title: t("landing.stats.countries"),
              },
              {
                icon: GraduationCap,
                value: "Top Uni",
                title: t("landing.stats.worldwide"),
              },
              {
                icon: Heart,
                value: "4.97/5",
                title: t("landing.stats.rating"),
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex min-w-0 items-center gap-3 rounded-2xl bg-white/70 p-3 lg:rounded-none lg:bg-transparent lg:p-0 lg:border-r lg:border-primary/10 lg:last:border-r-0"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary/70 sm:h-14 sm:w-14">
                  <item.icon className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
                </div>

                <div className="min-w-0">
                  <p className="font-serif text-xl text-primary sm:text-2xl lg:text-3xl">
                    {item.value}
                  </p>
                  <p className="text-xs leading-5 text-muted-foreground sm:text-sm">
                    {item.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HEAD TUTORS */}
      <section className="relative overflow-hidden bg-white px-4 py-14 sm:px-6 sm:py-16">
      <div className="mx-auto grid max-w-[1500px] items-center gap-14 px-0 lg:gap-24 lg:px-6 lg:grid-cols-[1.05fr_0.95fr]">
          {/* LEFT COPY */}
          <div className="self-center">
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#b8873a]">
              {t("landing.headTutors.label")}
            </p>
            <h2 className="mt-5 max-w-[720px] font-serif text-3xl leading-tight text-primary sm:text-4xl lg:text-5xl">
              {t("landing.headTutors.title")}
            </h2>

            <p className="mt-6 max-w-lg text-base leading-8 text-muted-foreground">
              {t("landing.headTutors.desc")}
            </p>

            <Link to="/tutors">
              <Button className="mt-8 rounded-2xl bg-primary px-8">
                {t("landing.headTutors.button")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* RIGHT FEATURED TUTORS */}
          <div className="grid gap-6 lg:translate-x-10">
            {tutors.slice(0, 2).map((tutor, index) => {
              const isLongDesc = tutor.desc.length > 85;

              return (
                <div
                  key={tutor.name}
                  className={`group flex flex-col items-start gap-6 rounded-[2rem] border border-white/70 bg-[#f8f6f1] p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)] lg:flex-row lg:items-center sm:gap-8 sm:px-8 sm:py-6 lg:min-h-[240px] lg:max-w-[760px] ${
                    index === 1 ? "lg:ml-28" : ""
                  }`}
                >
                  <div className="h-[260px] w-full overflow-hidden rounded-[2rem] bg-secondary sm:h-[200px] sm:w-[210px] sm:shrink-0 sm:rounded-[3rem]">
                    <img
                      src={tutor.image}
                      alt={tutor.name}
                      className={`h-full w-full object-cover object-top transition duration-500 lg:scale-[1.35] ${
                        tutor.name === "Mimi" ? "lg:translate-x-2" : ""
                      }`}
                    />
                  </div>



                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#b8873a]">
                      {t("landing.headTutors.cardLabel")}
                    </p>

                    <h3 className="mt-2 font-serif text-3xl leading-none text-primary sm:text-[42px]">
                      {tutor.name}
                    </h3>

                    <p className="mt-1 text-sm font-medium text-primary/70">
                      {tutor.role}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {tutor.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-[#ede7dc] px-3 py-1 text-xs font-semibold text-primary/80"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <p className="mt-4 line-clamp-2 max-w-[540px] text-[15px] leading-7 text-muted-foreground">  {tutor.desc}
                    </p>

                    {isLongDesc && (
                      <Link
                        to="/tutors"
                        className="mt-1 inline-block text-sm font-medium text-[#b8873a] hover:underline"
                      >
                        More
                      </Link>
                    )}

<div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-nowrap sm:items-center"> <Button
  onClick={() => setSelectedTutor(tutor)}
  className="h-11 w-full rounded-xl bg-primary px-6 text-sm sm:w-auto"
>
  {t("landing.headTutors.viewProfile")}
  <ArrowRight className="ml-2 h-4 w-4" />
</Button>
                      <Link to="/enquiry">
                        <Button
                          variant="outline"
                          className="h-11 w-full rounded-xl border-[#b8873a]/30 bg-white px-6 text-sm text-[#b8873a] sm:w-auto"
                        >
                          {t("landing.headTutors.book")}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      {/* TRUST STRIP */}
      <section className="border-y bg-secondary/40 px-4 py-8 sm:px-6 sm:py-10">
  <div className="mx-auto grid max-w-6xl gap-4 text-center md:grid-cols-3">
    <div>
      <p className="text-sm text-muted-foreground">
        {t("landing.stats.students")}
      </p>
      <p className="mt-1 font-semibold text-primary">
        {t("landing.trust.schools")}
      </p>
    </div>

    <div>
      <p className="text-sm text-muted-foreground">
        {t("landing.trust.subjects")}
      </p>
      <p className="mt-1 font-semibold text-primary">
        MAP · AEIS · TOEFL
      </p>
    </div>

    <div>
      <p className="text-sm text-muted-foreground">
        {t("landing.trust.languages")}
      </p>
      <p className="mt-1 font-semibold text-primary">
        EN · CN · JP
      </p>
    </div>
  </div>
</section>
      {/* PROCESS */}
      <section className="container mx-auto px-4 py-16 sm:px-6 sm:py-24">
        <div className="mb-14 text-center">
        <h2 className="font-serif text-3xl text-primary sm:text-4xl">
            {t("landing.process.title")}
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-5">
          {(t("landing.process.steps", { returnObjects: true }) as string[]).map((step, i) => (
            <div key={step} className="text-center">
              <p className="font-semibold text-accent">{`0${i + 1}`}</p>
              <p className="mt-2 text-sm text-muted-foreground">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY LUNA PREVIEW */}
      <section className="bg-secondary/30 px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <div>
          <h2 className="font-serif text-3xl text-primary sm:text-4xl">
              {t("landing.why.title")}
            </h2>

            <p className="mt-6 text-muted-foreground">
              {t("landing.why.desc")}
            </p>

            <Link to="/why-luna">
              <Button className="mt-8">
                {t("landing.why.button")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="rounded-3xl border bg-card p-6">
            <ul className="space-y-4 text-sm">
              {(t("landing.why.points", { returnObjects: true }) as string[]).map((item) => (
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
      <section className="container mx-auto px-4 py-16 sm:px-6 sm:py-24">
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-accent">
            {t("landing.programs.label")}
          </p>

          <h2 className="font-serif text-4xl text-primary md:text-5xl">

            {t("landing.programs.title")}

          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">

            {t("landing.programs.desc")}

          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {(t("landing.programs.items", { returnObjects: true }) as any[]).map((program) => (
            <div
              key={program.title}
              className="group relative rounded-3xl border bg-card p-6 sm:p-8 shadow-soft transition hover:-translate-y-2 hover:shadow-elegant"
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
                {t("landing.programs.learnMore")} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-hero px-4 py-16 text-center sm:px-6 sm:py-24">
      <h2 className="font-serif text-3xl text-primary sm:text-4xl">
          {t("landing.cta.title")}
        </h2>

        <p className="mt-4 text-muted-foreground">

          {t("landing.cta.desc")}

        </p>

        <Link to="/enquiry">
          <Button size="lg" className="mt-10 h-12 px-10 shadow-elegant">

            {t("landing.cta.button")}
          </Button>
        </Link>
      </section>
      <TutorProfileModal
  tutor={selectedTutor}
  onClose={() => setSelectedTutor(null)}
/>
      <Footer />
    </div>
  );
};

export default Landing;