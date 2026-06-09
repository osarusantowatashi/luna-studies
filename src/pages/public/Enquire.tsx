
import EnquiryForm from "@/pages/public/EnquiryForm";
import Footer from "@/components/Footer";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  ClipboardCheck,
  BarChart3,
  Target,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import SeoHelmet from "@/components/SeoHelmet";


const Enquire = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const currentLang = location.pathname.startsWith("/zh")
    ? "zh"
    : location.pathname.startsWith("/ja")
      ? "ja"
      : "en";

  useEffect(() => {
    if (!location.hash) return;

    const id = location.hash.replace("#", "");

    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 300);
  }, [location]);


  const baseUrl = "https://www.lunastudies.com";
  const canonicalUrl = `${baseUrl}/${currentLang}/enquiry`;

  const seoTitle = t("enquire.seo.title");
  const seoDescription = t("enquire.seo.description");
  return (
    <>
      <SeoHelmet
        title={seoTitle}
        description={seoDescription}
        canonicalUrl={canonicalUrl}
        currentLang={currentLang}
      />
      <div className="min-h-screen bg-background">

        {/* ENQUIRY HERO - CONCIERGE STYLE */}
        <section className="relative overflow-hidden bg-[#fbfaff] px-4 pt-24 pb-10 sm:px-6 lg:px-8">          <div className="absolute inset-0 bg-[linear-gradient(135deg,#fffdf8_0%,#f7f3ff_48%,#fff4c7_100%)]" />

          <div className="relative z-10 mx-auto grid max-w-[1180px] items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">            <motion.div
            initial={{ opacity: 0, x: -50, rotate: -2 }}
            animate={{ opacity: 1, x: 0, rotate: -1 }}
            transition={{ duration: 0.7 }}
            className="relative rounded-[2.5rem] bg-white p-7 shadow-[0_24px_80px_rgba(66,56,120,0.12)] sm:p-9"            >
            <div className="absolute -right-6 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full bg-[#fbfaff]" />
            <div className="absolute -left-6 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full bg-[#fbfaff]" />

            <p className="text-sm font-black uppercase tracking-[0.3em] text-[#8d73ff]">
              {t("enquire.hero.label")}
            </p>

            <h1 className="mt-5 font-poppins text-[2.8rem] font-black leading-[0.95] tracking-[-0.045em] text-primary sm:text-[4rem]">
              {t("enquire.hero.titleLine1")}<br />
              {t("enquire.hero.titleLine2")}
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-primary/60">
              {t("enquire.hero.description")}
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                t("enquire.hero.cards.level"),
                t("enquire.hero.cards.goal"),
                t("enquire.hero.cards.tutorFit"),
              ].map((item, i) => (
                <motion.div
                  key={item}
                  whileHover={{ y: -8, rotate: i === 1 ? 2 : -2 }}
                  className="rounded-[1.5rem] bg-[#fbfaff] p-5 text-center"
                >
                  <p className="text-3xl font-black text-[#8d73ff]">0{i + 1}</p>
                  <p className="mt-2 text-sm font-bold text-primary">{item}</p>
                </motion.div>
              ))}
            </div>

            <a
              href="#enquiry-form"
              className="mt-10 inline-flex h-14 items-center rounded-full bg-primary px-8 text-base font-bold text-white"
            >
              {t("enquire.hero.button")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </motion.div>

            {/* RIGHT TIMELINE */}
            <div className="relative">
              <div className="absolute left-6 top-8 h-[82%] w-[3px] rounded-full bg-[#ddd5ff]" />

              {[
                [
                  "01",
                  t("enquire.timeline.step1.title"),
                  t("enquire.timeline.step1.text"),
                ],
                [
                  "02",
                  t("enquire.timeline.step2.title"),
                  t("enquire.timeline.step2.text"),
                ],
                [
                  "03",
                  t("enquire.timeline.step3.title"),
                  t("enquire.timeline.step3.text"),
                ],
                [
                  "04",
                  t("enquire.timeline.step4.title"),
                  t("enquire.timeline.step4.text"),
                ],
              ].map(([num, title, text], i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, x: 45 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ x: 10 }}
                  className="relative mb-5 ml-16 rounded-[2rem] bg-white/90 p-6 shadow-[0_18px_55px_rgba(66,56,120,0.09)]"
                >
                  <div className="absolute -left-[58px] top-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#8d73ff] text-sm font-black text-white">
                    {num}
                  </div>

                  <h3 className="font-poppins text-xl font-black text-primary">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-primary/60">{text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>   {/* FORM */}
        <section id="enquiry-form" className="bg-[#fbfaff] px-4 py-10 sm:px-6 sm:py-14">
          <div className="mx-auto max-w-5xl">
            <EnquiryForm />
          </div>
        </section>{/* PROCESS FLOW */}
        <section className="relative overflow-hidden bg-[#fffdf8] px-4 py-16 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#f0eaff_0%,transparent_25%),radial-gradient(circle_at_80%_80%,#fff1bd_0%,transparent_28%)]" />

          <div className="relative z-10 mx-auto max-w-[1250px]">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-black uppercase tracking-[0.28em] text-[#8d73ff]">
                {t("enquire.process.label")}
              </p>

              <h2 className="mt-4 font-poppins text-[2.7rem] font-black leading-[0.95] tracking-[-0.04em] text-primary sm:text-[4rem]">
                {t("enquire.process.titleLine1")}<br />
                {t("enquire.process.titleLine2")}
              </h2>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-primary/60">
                {t("enquire.process.description")}
              </p>
            </div>

            <div className="relative mt-14">
              {/* line */}
              <div className="absolute left-0 top-10 hidden h-[3px] w-full rounded-full bg-[#e7dfff] xl:block" />

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
                {[
                  {
                    step: "01",
                    title: t("enquire.steps.step1.title"),
                    text: t("enquire.steps.step1.text"),
                    icon: ClipboardCheck,
                  },
                  {
                    step: "02",
                    title: t("enquire.steps.step2.title"),
                    text: t("enquire.steps.step2.text"),
                    icon: BarChart3,
                  },
                  {
                    step: "03",
                    title: t("enquire.steps.step3.title"),
                    text: t("enquire.steps.step3.text"),
                    icon: Target,
                  },
                  {
                    step: "04",
                    title: t("enquire.steps.step4.title"),
                    text: t("enquire.steps.step4.text"),
                    icon: TrendingUp,
                  },
                  {
                    step: "05",
                    title: t("enquire.steps.step5.title"),
                    text: t("enquire.steps.step5.text"),
                    icon: Sparkles,
                  },
                ].map((item, i) => {
                  const Icon = item.icon;

                  return (
                    <motion.div
                      key={item.step}
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.2 }}
                      transition={{ delay: i * 0.08 }}
                      whileHover={{
                        y: -10,
                        rotate: i % 2 === 0 ? -2 : 2,
                      }}
                      className="group relative rounded-[2.2rem] bg-white/95 p-6 shadow-[0_18px_55px_rgba(66,56,120,0.08)] backdrop-blur-xl"
                    >
                      <div className="relative z-10">
                        <div className="flex items-center justify-between">
                          <div className="flex h-14 w-14 items-center justify-center rounded-[1.4rem] bg-[#8d73ff] shadow-[0_14px_35px_rgba(141,115,255,0.28)]">
                            <Icon className="h-6 w-6 text-white" strokeWidth={2.4} />
                          </div>

                          <span className="text-sm font-black text-[#8d73ff]">
                            {item.step}
                          </span>
                        </div>

                        <h3 className="mt-6 font-poppins text-xl font-black leading-tight text-primary">
                          {item.title}
                        </h3>

                        <p className="mt-3 text-sm leading-7 text-primary/60">
                          {item.text}
                        </p>
                      </div>

                      <div className="absolute inset-x-0 bottom-0 h-1 rounded-b-[2.2rem] bg-gradient-to-r from-[#8d73ff] to-[#ffd84d] opacity-0 transition group-hover:opacity-100" />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    </>
  );
};

export default Enquire;