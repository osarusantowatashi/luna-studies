import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import EnquiryForm from "@/pages/EnquiryForm";
import {
  BookOpen,
  PenLine,
  Mic,
  Calculator,
  GraduationCap,
  School,
  Languages,
  ArrowRight,
} from "lucide-react";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";

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

  const subjects = [
    {
      icon: BookOpen,
      title: t("subjects.items.assessments.title"),
      body: t("subjects.items.assessments.body"),
      details: t("subjects.items.assessments.details"),
      suitableFor: t("subjects.items.assessments.suitableFor"),
    },
    {
      icon: School,
      title: t("subjects.items.aeis.title"),
      body: t("subjects.items.aeis.body"),
      details: t("subjects.items.aeis.details"),
      suitableFor: t("subjects.items.aeis.suitableFor"),
    },
    {
      icon: PenLine,
      title: t("subjects.items.toefl.title"),
      body: t("subjects.items.toefl.body"),
      details: t("subjects.items.toefl.details"),
      suitableFor: t("subjects.items.toefl.suitableFor"),
    },
    {
      icon: Mic,
      title: t("subjects.items.speaking.title"),
      body: t("subjects.items.speaking.body"),
      details: t("subjects.items.speaking.details"),
      suitableFor: t("subjects.items.speaking.suitableFor"),
    },
    {
      icon: Calculator,
      title: t("subjects.items.math.title"),
      body: t("subjects.items.math.body"),
      details: t("subjects.items.math.details"),
      suitableFor: t("subjects.items.math.suitableFor"),
    },
    {
      icon: Languages,
      title: t("subjects.items.japanese.title"),
      body: t("subjects.items.japanese.body"),
      details: t("subjects.items.japanese.details"),
      suitableFor: t("subjects.items.japanese.suitableFor"),
    },
    {
      icon: GraduationCap,
      title: t("subjects.items.foundation.title"),
      body: t("subjects.items.foundation.body"),
      details: t("subjects.items.foundation.details"),
      suitableFor: t("subjects.items.foundation.suitableFor"),
    },
    {
      icon: Languages,
      title: t("subjects.items.mandarin.title"),
      body: t("subjects.items.mandarin.body"),
      details: t("subjects.items.mandarin.details"),
      suitableFor: t("subjects.items.mandarin.suitableFor"),
    },
  ];

  const [selectedSubject, setSelectedSubject] = useState<
    (typeof subjects)[0] | null
  >(null);

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
              {t("subjects.hero.titleLine1")}<br />
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

        {/* SUBJECT CARDS */}
        <section className="relative overflow-hidden bg-[#fbfaff] px-4 py-20 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,#f0eaff_0%,transparent_25%),radial-gradient(circle_at_85%_80%,#fff1bd_0%,transparent_25%)]" />

          <div className="relative z-10 mx-auto max-w-[1280px]">
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {subjects.map((subject, i) => (
                <motion.div
                  key={subject.title}
                  initial={{ opacity: 0, y: 50, rotate: 0 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.25 }}
                  transition={{ duration: 0.55, delay: i * 0.06 }}
                  whileHover={{
                    y: -12,
                    scale: 1.025,
                    rotate: i % 2 === 0 ? -2 : 2,
                  }}
                  className="group relative flex min-h-[300px] flex-col overflow-hidden rounded-[2.4rem] bg-white/95 p-6 shadow-[0_18px_55px_rgba(66,56,120,0.09)] backdrop-blur-xl"
                >
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#f0eaff]" />

                  <div className="relative z-10">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{
                        duration: 3 + i * 0.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="mb-6 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-[#8d73ff]"
                    >
                      <subject.icon className="h-7 w-7 text-white" />
                    </motion.div>

                    <h3 className="font-poppins text-2xl font-black leading-tight text-primary">
                      {subject.title}
                    </h3>

                    <p className="mt-4 text-sm leading-7 text-primary/60">
                      {subject.body}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedSubject(subject)}
                    className="relative z-10 mt-auto flex items-center pt-6 text-sm font-black text-[#8d73ff]"
                  >
                    {t("subjects.learnMore")}
                    <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        {selectedSubject && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-md"
            onClick={() => setSelectedSubject(null)}
          >            <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="relative z-[10000] max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[2.5rem] bg-white p-7 shadow-[0_40px_120px_rgba(0,0,0,0.22)] sm:p-10"
          >
              {/* close button */}
              <button
                onClick={() => setSelectedSubject(null)}
                className="absolute right-6 top-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#f3efff] text-primary transition hover:scale-110 hover:bg-[#e8deff]"

              >
                ✕
              </button>

              {/* top */}
              <div className="flex flex-col gap-8 lg:flex-row">
                {/* left */}
                <div className="flex-1">
                  <div className="inline-flex rounded-full bg-[#8d73ff] px-5 py-2 text-sm font-black text-white">
                    {t("subjects.modal.programLabel")}
                  </div>

                  <h2 className="mt-5 font-poppins text-4xl font-black leading-tight text-primary">
                    {selectedSubject.title}
                  </h2>

                  <p className="mt-6 text-base leading-8 text-primary/65">
                    {selectedSubject.details}
                  </p>

                  {/* suitable */}
                  <div className="mt-8 rounded-[2rem] bg-[#fbfaff] p-6">
                    <p className="text-sm font-black uppercase tracking-[0.15em] text-[#8d73ff]">
                      {t("subjects.modal.suitableFor")}
                    </p>

                    <p className="mt-3 leading-7 text-primary/70">
                      {selectedSubject.suitableFor}
                    </p>
                  </div>
                </div>

                {/* right floating card */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-full rounded-[2.2rem] bg-[#fbfaff] p-7 lg:w-[340px]"
                >
                  <div className="rounded-[1.8rem] bg-white p-6 shadow-[0_12px_40px_rgba(66,56,120,0.08)]">
                    <p className="text-sm font-black uppercase tracking-[0.15em] text-[#8d73ff]">
                      {t("subjects.modal.includedTitle")}
                    </p>

                    <div className="mt-6 space-y-4">
                      {[
                        t("subjects.modal.included.items.lessons"),
                        t("subjects.modal.included.items.homework"),
                        t("subjects.modal.included.items.tracking"),
                        t("subjects.modal.included.items.support"),
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-3 rounded-2xl bg-[#fbfaff] p-4"
                        >
                          <div className="h-3 w-3 rounded-full bg-[#8d73ff]" />
                          <p className="text-sm font-semibold text-primary">
                            {item}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* enquiry button only */}
              <div className="mt-10 rounded-[2rem] bg-[#fffdf8] p-6 sm:p-8">
                <h3 className="font-poppins text-2xl font-black text-primary">
                  {t("subjects.modal.enquiryTitle")}
                </h3>

                <p className="mt-3 text-sm leading-7 text-primary/60">
                  {t("subjects.modal.enquiryDescription")}
                </p>

                <Link
                  to={`${withLang("/enquiry")}?subject=${encodeURIComponent(
                    selectedSubject.title
                  )}#enquiry-form`}
                >
                  <Button className="mt-6 h-13 rounded-2xl bg-primary px-7 text-sm font-bold">
                    {t("subjects.modal.enquiryButton", {
                      subject: selectedSubject.title,
                    })}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
        <Footer />
      </div>
    </>
  );
};

export default Subjects;