import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const location = useLocation();

  const currentLang = location.pathname.startsWith("/zh") ? "zh" : "en";

  const withLang = (path: string) =>
    `/${currentLang}${path === "/" ? "" : path}`;
  const highlights = [
    t("whyLuna.highlights.personalised"),
    t("whyLuna.highlights.tutors"),
    t("whyLuna.highlights.onlineOffline"),
    t("whyLuna.highlights.chat"),
    t("whyLuna.highlights.questionBanks"),
    t("whyLuna.highlights.tracking"),
  ];

  const sections = [
    {
      title: t("whyLuna.sections.tutors.title"),
      text: t("whyLuna.sections.tutors.text"),
      icon: Globe2,
      tag: t("whyLuna.sections.tutors.tag"),
    },
    {
      title: t("whyLuna.sections.planning.title"),
      text: t("whyLuna.sections.planning.text"),
      icon: UserRound,
      tag: t("whyLuna.sections.planning.tag"),
    },
    {
      title: t("whyLuna.sections.progress.title"),
      text: t("whyLuna.sections.progress.text"),
      icon: BarChart3,
      tag: t("whyLuna.sections.progress.tag"),
    },
    {
      title: t("whyLuna.sections.support.title"),
      text: t("whyLuna.sections.support.text"),
      icon: MessageCircle,
      tag: t("whyLuna.sections.support.tag"),
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
              {t("whyLuna.hero.label")}
            </p>

            <h1 className="font-serif text-5xl leading-tight text-primary md:text-6xl">
              {t("whyLuna.hero.title1")}
              <br />
              {t("whyLuna.hero.title2")}
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              {t("whyLuna.hero.description")}
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

            <Link to={withLang("/enquiry")}>
              <Button size="lg" className="mt-10 h-12 px-10 shadow-elegant">
                {t("whyLuna.buttons.enquire")}
              </Button>
            </Link>
          </div>

          {/* VISUAL MOCKUP */}
          <div className="relative">
            <div className="rounded-[2rem] border bg-white/85 p-6 shadow-elegant backdrop-blur">
              <div className="mb-6 flex items-center justify-between">
                <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-accent">
  {t("whyLuna.planCard.label")}
</p>
<h3 className="mt-1 font-serif text-2xl text-primary">
  {t("whyLuna.planCard.title")}
</h3>
                </div>
                <div className="rounded-full bg-secondary px-3 py-1 text-xs">
                  1–1
                </div>
              </div>

              <div className="grid gap-4">
              {[
  [
    t("whyLuna.planCard.pretest.title"),
    t("whyLuna.planCard.pretest.desc"),
    "35%",
  ],
  [
    t("whyLuna.planCard.midtest.title"),
    t("whyLuna.planCard.midtest.desc"),
    "68%",
  ],
  [
    t("whyLuna.planCard.posttest.title"),
    t("whyLuna.planCard.posttest.desc"),
    "86%",
  ],
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
            <p className="text-xs text-muted-foreground">
  {t("whyLuna.planCard.chat.label")}
</p>
<p className="mt-1 text-sm font-semibold text-primary">
  “{t("whyLuna.planCard.chat.message")}”
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
            {t("whyLuna.comparison.label")}
          </p>
          <h2 className="font-serif text-4xl text-primary md:text-5xl">
            {t("whyLuna.comparison.title")}
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-3xl border bg-secondary/40 p-8">
            <h3 className="font-serif text-2xl text-muted-foreground">
              {t("whyLuna.comparison.typical.title")}
            </h3>

            <ul className="mt-6 space-y-4 text-sm text-muted-foreground">
              {[
                t("whyLuna.comparison.typical.point1"),
                t("whyLuna.comparison.typical.point2"),
                t("whyLuna.comparison.typical.point3"),
                t("whyLuna.comparison.typical.point4"),
              ].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border bg-card p-8 shadow-elegant">
            <h3 className="font-serif text-2xl text-primary">
              {t("whyLuna.comparison.luna.title")}
            </h3>

            <ul className="mt-6 space-y-4 text-sm text-primary">
              {[
                t("whyLuna.comparison.luna.point1"),
                t("whyLuna.comparison.luna.point2"),
                t("whyLuna.comparison.luna.point3"),
                t("whyLuna.comparison.luna.point4"),
              ].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="bg-secondary/30 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-accent">
              {t("whyLuna.values.label")}
            </p>

            <h2 className="font-serif text-4xl text-primary md:text-5xl">
              {t("whyLuna.values.title")}
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              {t("whyLuna.values.description")}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: t("whyLuna.values.items.clarity.title"),
                text: t("whyLuna.values.items.clarity.text"),
              },
              {
                title: t("whyLuna.values.items.structure.title"),
                text: t("whyLuna.values.items.structure.text"),
              },
              {
                title: t("whyLuna.values.items.growth.title"),
                text: t("whyLuna.values.items.growth.text"),
              },
              {
                title: t("whyLuna.values.items.responsibility.title"),
                text: t("whyLuna.values.items.responsibility.text"),
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
              t("whyLuna.values.bullets.point1"),
              t("whyLuna.values.bullets.point2"),
              t("whyLuna.values.bullets.point3"),
              t("whyLuna.values.bullets.point4"),
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
                    <span className="text-muted-foreground">{t("whyLuna.focusArea")}</span>
                    <span className="font-semibold text-primary">
                      {t("whyLuna.improving")}
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
              {t("whyLuna.questionBank.label")}
            </p>
            <h2 className="font-serif text-4xl text-primary">
              {t("whyLuna.questionBank.title")}
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              {t("whyLuna.questionBank.description")}
            </p>
          </div>

          <div className="rounded-[2rem] border bg-card p-6 shadow-elegant">
            <div className="mb-5 flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-primary" />
              <h3 className="font-serif text-2xl text-primary">
                {t("whyLuna.questionBank.cardTitle")}
              </h3>
            </div>

            <div className="grid gap-3">
              {[
                t("whyLuna.questionBank.items.map"),
                t("whyLuna.questionBank.items.toefl"),
                t("whyLuna.questionBank.items.aeis"),
                t("whyLuna.questionBank.items.interview"),
              ].map(
                (item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-2xl border bg-background p-4"
                  >
                    <span className="text-sm text-primary">{item}</span>
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs">
                      {t("whyLuna.questionBank.available")}
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
          {t("whyLuna.cta.title")}
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          {t("whyLuna.cta.description")}
        </p>

        <Link to={withLang("/enquiry")}>
          <Button size="lg" className="mt-10 h-12 px-10 shadow-elegant">
            {t("whyLuna.buttons.enquire")}
          </Button>
        </Link>
      </section>
      <Footer />
    </div>
  );
};

export default WhyLuna;