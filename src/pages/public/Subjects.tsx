import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  BookOpen,
  PenLine,
  Mic,
  Calculator,
  GraduationCap,
  School,
  Languages,
  ArrowRight,
  Brain,
  FileText,
} from "lucide-react";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";

type ProgramItem = {
  slug: string;
  icon: React.ElementType;
  title: string;
  body: string;
};

const Subjects = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const currentLang = location.pathname.startsWith("/zh")
    ? "zh"
    : location.pathname.startsWith("/jp")
      ? "jp"
      : "en";

  const withLang = (path: string) =>
    `/${currentLang}${path === "/" ? "" : path}`;

  const assessmentPrograms: ProgramItem[] = [
    {
      slug: "map-preparation",
      icon: BookOpen,
      title: t("subjects.items.map.title"),
      body: t("subjects.items.map.body"),
    },
    {
      slug: "wida-preparation",
      icon: Languages,
      title: t("subjects.items.wida.title"),
      body: t("subjects.items.wida.body"),
    },
    {
      slug: "cat4-preparation",
      icon: Brain,
      title: t("subjects.items.cat4.title"),
      body: t("subjects.items.cat4.body"),
    },
    {
      slug: "aeis-preparation",
      icon: School,
      title: t("subjects.items.aeis.title"),
      body: t("subjects.items.aeis.body"),
    },
    {
      slug: "toefl-preparation",
      icon: PenLine,
      title: t("subjects.items.toefl.title"),
      body: t("subjects.items.toefl.body"),
    },
    {
      slug: "ielts-preparation",
      icon: Mic,
      title: t("subjects.items.ielts.title"),
      body: t("subjects.items.ielts.body"),
    },
    {
      slug: "jlpt-preparation",
      icon: Languages,
      title: t("subjects.items.jlpt.title"),
      body: t("subjects.items.jlpt.body"),
    },
    {
      slug: "hsk-preparation",
      icon: FileText,
      title: t("subjects.items.hsk.title"),
      body: t("subjects.items.hsk.body"),
    },
  ];

  const academicPrograms: ProgramItem[] = [
    {
      slug: "english-foundation",
      icon: GraduationCap,
      title: t("subjects.items.foundation.title"),
      body: t("subjects.items.foundation.body"),
    },
    {
      slug: "speaking-writing",
      icon: Mic,
      title: t("subjects.items.speaking.title"),
      body: t("subjects.items.speaking.body"),
    },
    {
      slug: "math-support",
      icon: Calculator,
      title: t("subjects.items.math.title"),
      body: t("subjects.items.math.body"),
    },
    {
      slug: "japanese-lessons",
      icon: Languages,
      title: t("subjects.items.japanese.title"),
      body: t("subjects.items.japanese.body"),
    },
    {
      slug: "mandarin-lessons",
      icon: Languages,
      title: t("subjects.items.mandarin.title"),
      body: t("subjects.items.mandarin.body"),
    },
  ];

  const ProgramCard = ({
    program,
    index,
  }: {
    program: ProgramItem;
    index: number;
  }) => {
    const Icon = program.icon;

    return (
      <motion.div
        key={program.slug}
        initial={{ opacity: 0, y: 50, rotate: 0 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.25 }}
        transition={{ duration: 0.55, delay: index * 0.05 }}
        whileHover={{
          y: -12,
          scale: 1.025,
          rotate: index % 2 === 0 ? -2 : 2,
        }}
        className="group relative flex min-h-[280px] flex-col overflow-hidden rounded-[2.4rem] bg-white/95 p-6 shadow-[0_18px_55px_rgba(66,56,120,0.09)] backdrop-blur-xl"
      >
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#f0eaff]" />

        <div className="relative z-10">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{
              duration: 3 + index * 0.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="mb-6 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-[#8d73ff]"
          >
            <Icon className="h-7 w-7 text-white" />
          </motion.div>

          <h3 className="font-poppins text-2xl font-black leading-tight text-primary">
            {program.title}
          </h3>

          <p className="mt-4 text-sm leading-7 text-primary/60">
            {program.body}
          </p>
        </div>

        <Link
          to={withLang(`/subjects/${program.slug}`)}
          className="relative z-10 mt-auto flex items-center pt-6 text-sm font-black text-[#8d73ff]"
        >
          {t("subjects.learnMore")}
          <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
        </Link>
      </motion.div>
    );
  };

  const ProgramSection = ({
    label,
    title,
    description,
    items,
  }: {
    label: string;
    title: string;
    description: string;
    items: ProgramItem[];
  }) => (
    <div className="mb-20 last:mb-0">
      <div className="mb-10 max-w-3xl">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]">
          {label}
        </p>

        <h2 className="mt-4 font-poppins text-4xl font-black tracking-[-0.035em] text-primary sm:text-5xl">
          {title}
        </h2>

        <p className="mt-5 text-base leading-8 text-primary/60">
          {description}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((program, index) => (
          <ProgramCard
            key={program.slug}
            program={program}
            index={index}
          />
        ))}
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>{t("subjects.seo.title")}</title>
        <meta name="description" content={t("subjects.seo.description")} />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* HERO */}
        <section className="relative overflow-hidden bg-[#fffdf8] px-4 pt-28 pb-20 text-center sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,#fff1bd_0%,transparent_28%),radial-gradient(circle_at_20%_70%,#f0eaff_0%,transparent_30%)]" />

          <div className="relative z-10 mx-auto max-w-5xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]"
            >
              {t("subjects.hero.label")}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-5 font-poppins text-[3.2rem] font-black leading-[0.95] tracking-[-0.045em] text-primary sm:text-[4.8rem]"
            >
              {t("subjects.hero.titleLine1")}
              <br />
              {t("subjects.hero.titleLine2")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mx-auto mt-7 max-w-2xl text-base leading-8 text-primary/60 sm:text-lg"
            >
              {t("subjects.hero.description")}
            </motion.p>
          </div>
        </section>

        {/* PROGRAM CARDS */}
        <section className="relative overflow-hidden bg-[#fbfaff] px-4 py-20 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,#f0eaff_0%,transparent_25%),radial-gradient(circle_at_85%_80%,#fff1bd_0%,transparent_25%)]" />

          <div className="relative z-10 mx-auto max-w-[1280px]">
            <ProgramSection
              label={t("subjects.sections.assessment.label")}
              title={t("subjects.sections.assessment.title")}
              description={t("subjects.sections.assessment.description")}
              items={assessmentPrograms}
            />

            <ProgramSection
              label={t("subjects.sections.academic.label")}
              title={t("subjects.sections.academic.title")}
              description={t("subjects.sections.academic.description")}
              items={academicPrograms}
            />
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Subjects;