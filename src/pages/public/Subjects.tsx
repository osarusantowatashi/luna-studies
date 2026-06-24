import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  BookOpen,
  PenLine,
  Mic,
  School,
  Languages,
  ArrowRight,
  Brain,
} from "lucide-react";
import Footer from "@/components/Footer";
import SeoHelmet from "@/components/SeoHelmet";
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
    : location.pathname.startsWith("/ja")
      ? "ja"
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
        className="group relative flex min-h-[240px] flex-col overflow-hidden rounded-[1.8rem] bg-white/95 p-5 shadow-[0_18px_55px_rgba(66,56,120,0.09)] backdrop-blur-xl sm:min-h-[280px] sm:rounded-[2.4rem] sm:p-6"
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

          <h3 className="font-poppins text-xl font-black leading-tight text-primary sm:text-2xl">
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
    id,
    label,
    title,
    description,
    items,
  }: {
    id?: string;
    label: string;
    title: string;
    description: string;
    items: ProgramItem[];
  }) => (
    <div id={id} className="mb-20 scroll-mt-24 last:mb-0">
      <div className="mb-10 max-w-3xl">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]">
          {label}
        </p>

        <h2 className="mt-4 font-poppins text-3xl font-black leading-tight tracking-[-0.02em] text-primary sm:text-5xl">
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


  const baseUrl = "https://www.lunastudies.com";
const pathWithoutLang = "/subjects";

const canonicalUrl = `${baseUrl}/${currentLang}${pathWithoutLang}`;

const seoTitle = t("subjects.seo.title");
const seoDescription = t("subjects.seo.description");
  return (
    <>
      <SeoHelmet
  title={seoTitle}
  description={seoDescription}
  canonicalUrl={canonicalUrl}
  currentLang={currentLang}
/>

      <div className="min-h-screen bg-background">
        {/* HERO */}
        <section className="relative overflow-hidden bg-[#fffdf8] px-4 pb-14 pt-20 text-center sm:px-6 sm:pb-20 sm:pt-28 lg:px-8">
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
              className="mt-5 font-poppins text-[2.45rem] font-black leading-[1.04] tracking-[-0.025em] text-primary min-[390px]:text-[2.8rem] sm:text-[4.8rem] sm:leading-[0.95]"
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
        <section className="relative overflow-hidden bg-[#fbfaff] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,#f0eaff_0%,transparent_25%),radial-gradient(circle_at_85%_80%,#fff1bd_0%,transparent_25%)]" />

          <div className="relative z-10 mx-auto max-w-[1280px]">
            <ProgramSection
              id="assessment"
              label={t("subjects.sections.assessment.label")}
              title={t("subjects.sections.assessment.title")}
              description={t("subjects.sections.assessment.description")}
              items={assessmentPrograms}
            />

          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Subjects;
