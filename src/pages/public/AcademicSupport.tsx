import { motion } from "framer-motion";
import {
  ArrowRight,
  Calculator,
  GraduationCap,
  Languages,
  Mic,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Footer from "@/components/Footer";
import SeoHelmet from "@/components/SeoHelmet";

type AcademicSupportItem = {
  slug: string;
  icon: React.ElementType;
  title: string;
  body: string;
};

const AcademicSupport = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const currentLang = location.pathname.startsWith("/zh")
    ? "zh"
    : location.pathname.startsWith("/ja")
      ? "ja"
      : "en";

  const withLang = (path: string) =>
    `/${currentLang}${path === "/" ? "" : path}`;

  const supportItems: AcademicSupportItem[] = [
    {
      slug: "english-foundation",
      icon: GraduationCap,
      title: t("academicSupport.cards.englishFoundation.title"),
      body: t("academicSupport.cards.englishFoundation.body"),
    },
    {
      slug: "speaking-writing",
      icon: Mic,
      title: t("academicSupport.cards.speakingWriting.title"),
      body: t("academicSupport.cards.speakingWriting.body"),
    },
    {
      slug: "math-support",
      icon: Calculator,
      title: t("academicSupport.cards.mathSupport.title"),
      body: t("academicSupport.cards.mathSupport.body"),
    },
    {
      slug: "japanese-lessons",
      icon: Languages,
      title: t("academicSupport.cards.japaneseLessons.title"),
      body: t("academicSupport.cards.japaneseLessons.body"),
    },
    {
      slug: "mandarin-lessons",
      icon: Languages,
      title: t("academicSupport.cards.mandarinLessons.title"),
      body: t("academicSupport.cards.mandarinLessons.body"),
    },
  ];

  const baseUrl = "https://www.lunastudies.com";
  const canonicalUrl = `${baseUrl}/${currentLang}/academic-support`;

  return (
    <>
      <SeoHelmet
        title={t("academicSupport.seo.title")}
        description={t("academicSupport.seo.description")}
        canonicalUrl={canonicalUrl}
        currentLang={currentLang}
      />

      <div className="min-h-screen bg-background">
        <section className="relative overflow-hidden bg-[#fffdf8] px-4 pb-20 pt-28 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_20%,#fff1bd_0%,transparent_24%),radial-gradient(circle_at_18%_72%,#f0eaff_0%,transparent_28%)]" />

          <div className="relative z-10 mx-auto max-w-5xl text-center">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]"
            >
              {t("academicSupport.hero.label")}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="mx-auto mt-5 max-w-4xl font-poppins text-[2.9rem] font-black leading-[1.02] tracking-[-0.04em] text-primary sm:text-[4.2rem]"
            >
              {t("academicSupport.hero.title")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="mx-auto mt-6 max-w-2xl text-base leading-8 text-primary/60 sm:text-lg"
            >
              {t("academicSupport.hero.subtitle")}
            </motion.p>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#fbfaff] px-4 py-20 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,#f0eaff_0%,transparent_24%),radial-gradient(circle_at_88%_82%,#fff1bd_0%,transparent_22%)]" />

          <div className="relative z-10 mx-auto max-w-[1180px]">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {supportItems.map((item, index) => {
                const Icon = item.icon;

                return (
                  <motion.article
                    key={item.slug}
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.25 }}
                    transition={{ duration: 0.45, delay: index * 0.05 }}
                    whileHover={{ y: -7 }}
                    className="group flex min-h-[250px] flex-col rounded-[1.6rem] border border-white/80 bg-white/95 p-6 shadow-[0_18px_55px_rgba(66,56,120,0.08)] backdrop-blur-xl"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f3efff]">
                        <Icon className="h-6 w-6 text-[#8d73ff]" />
                      </div>

                      <ArrowRight className="h-5 w-5 text-primary/25 transition group-hover:translate-x-1 group-hover:text-[#8d73ff]" />
                    </div>

                    <h2 className="mt-6 font-poppins text-xl font-black leading-tight text-primary">
                      {item.title}
                    </h2>

                    <p className="mt-3 text-sm leading-7 text-primary/60">
                      {item.body}
                    </p>

                    <Link
                      to={withLang(`/subjects/${item.slug}`)}
                      className="mt-auto pt-6 text-sm font-black text-[#8d73ff]"
                    >
                      {t("academicSupport.cards.cta")}
                    </Link>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default AcademicSupport;
