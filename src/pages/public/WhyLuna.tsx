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
  ArrowRight,
  Search,
  Route,
  Sprout,
  ShieldCheck,
} from "lucide-react";
import Footer from "@/components/Footer";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import SeoHelmet from "@/components/SeoHelmet";

const WhyLuna = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const currentLang = location.pathname.startsWith("/zh")
    ? "zh"
    : location.pathname.startsWith("/ja")
      ? "ja"
      : "en";

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

  const baseUrl = "https://www.lunastudies.com";
  const canonicalUrl = `${baseUrl}/${currentLang}/whyluna`;

  const seoTitle = t("whyLuna.seo.title");
  const seoDescription = t("whyLuna.seo.description");

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
        <section className="relative overflow-hidden bg-[#fffdf8] px-4 pt-28 pb-20 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_18%,#fff1bd_0%,transparent_28%),radial-gradient(circle_at_18%_70%,#f0eaff_0%,transparent_30%)]" />

          <motion.div
            animate={{ y: [0, -14, 0], rotate: [0, 4, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-[10%] top-[18%] hidden lg:block"
          >
            <img src="/stickers/plane.png" alt="plane" className="w-24" />
          </motion.div>

          <div className="relative z-10 mx-auto grid max-w-[1280px] items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
            {/* LEFT */}
            <div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-5 text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]"
              >
                {t("whyLuna.hero.label")}
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 35 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="font-poppins text-[3.2rem] font-black leading-[0.95] tracking-[-0.045em] text-primary sm:text-[4.6rem] lg:text-[5.6rem]"
              >
                {t("whyLuna.hero.titleLine1")}<br />
                {t("whyLuna.hero.titleLine2")}<br />
                <span className="text-[#8d73ff]">
                  {t("whyLuna.hero.titleHighlight")}
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="mt-7 max-w-xl text-base leading-8 text-primary/65 sm:text-lg"
              >
                {t("whyLuna.hero.description")}
              </motion.p>

              <div className="mt-8 flex flex-wrap gap-3">
                {highlights.slice(0, 3).map((item, i) => (
                  <motion.span
                    key={item}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.3 + i * 0.08 }}
                    whileHover={{ y: -4, scale: 1.03 }}
                    className="rounded-full bg-white/85 px-4 py-2 text-sm font-semibold text-primary shadow-[0_12px_35px_rgba(66,56,120,0.08)]"
                  >
                    {item}
                  </motion.span>
                ))}
              </div>

              <Link to={withLang("/enquiry")}>
                <Button className="mt-10 h-14 rounded-full bg-primary px-9 text-base shadow-[0_20px_55px_rgba(10,36,84,0.18)]">
                  {t("whyLuna.buttons.enquire")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* RIGHT GROWTH MAP */}
            <motion.div
              initial={{ opacity: 0, y: 50, rotate: 2 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="rounded-[3rem] bg-white/90 p-6 shadow-[0_25px_80px_rgba(66,56,120,0.12)] backdrop-blur-xl sm:p-8">
                <div className="mb-7 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-[#8d73ff]">
                      {t("whyLuna.planCard.label")}
                    </p>
                    <h3 className="mt-2 font-poppins text-3xl font-black text-primary">
                      {t("whyLuna.planCard.title")}
                    </h3>
                  </div>

                  <div className="rounded-full bg-[#f6f2ff] px-4 py-2 text-sm font-bold text-[#8d73ff]">
                    {t("whyLuna.planCard.badge")}
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    [
                      t("whyLuna.planCard.items.preTest.title"),
                      t("whyLuna.planCard.items.preTest.desc"),
                      "35%",
                    ],
                    [
                      t("whyLuna.planCard.items.midTest.title"),
                      t("whyLuna.planCard.items.midTest.desc"),
                      "68%",
                    ],
                    [
                      t("whyLuna.planCard.items.postTest.title"),
                      t("whyLuna.planCard.items.postTest.desc"),
                      "86%",
                    ],
                  ].map(([label, text, score], i) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, x: 40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: false }}
                      transition={{ duration: 0.5, delay: i * 0.12 }}
                      whileHover={{ y: -5, scale: 1.015 }}
                      className="rounded-[1.5rem] bg-[#fbfaff] p-5"
                    >
                      <div className="flex justify-between text-sm">
                        <div>
                          <p className="font-black text-primary">{label}</p>
                          <p className="mt-1 text-xs text-primary/50">{text}</p>
                        </div>
                        <p className="text-lg font-black text-[#8d73ff]">{score}</p>
                      </div>

                      <div className="mt-4 h-3 rounded-full bg-[#eee9ff]">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: score }}
                          viewport={{ once: false }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className="h-3 rounded-full bg-[#8d73ff]"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="mt-5 rounded-[1.7rem] bg-white p-5 shadow-[0_18px_50px_rgba(66,56,120,0.10)] lg:absolute lg:-bottom-8 lg:-left-8 lg:w-[300px]"
              >
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8d73ff]">
                  {t("whyLuna.planCard.chat.label")}
                </p>
                <p className="mt-2 text-sm font-bold text-primary">
                  {t("whyLuna.planCard.chat.message")}
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>
        {/* HIGHLIGHTS + COMPARISON */}
        <section className="relative overflow-hidden bg-[#fbfaff] px-4 py-24 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#f0eaff_0%,transparent_28%),radial-gradient(circle_at_80%_80%,#fff1bd_0%,transparent_26%)]" />

          <div className="relative z-10 mx-auto max-w-[1280px]">
            {/* HIGHLIGHT STRIP */}
            <motion.div
              initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: false, amount: 0.35 }}
              transition={{ duration: 0.7 }}
              className="rounded-[3rem] bg-white/90 p-6 shadow-[0_25px_80px_rgba(66,56,120,0.10)] backdrop-blur-xl sm:p-8"
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {highlights.map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ delay: i * 0.06 }}
                    whileHover={{ y: -6, scale: 1.02 }}
                    className="flex items-center gap-3 rounded-2xl bg-[#fffdf8] px-4 py-4"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#8d73ff] text-white">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-semibold text-primary/75">
                      {item}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* COMPARISON */}
            <div className="mt-24 text-center">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]">
                {t("whyLuna.comparison.label")}
              </p>

              <h2 className="mt-4 font-poppins text-4xl font-black leading-tight text-primary sm:text-5xl">
                {t("whyLuna.comparison.titleLine1")}<br />
                {t("whyLuna.comparison.titleLine2")}
              </h2>
            </div>

            <div className="mt-14 grid gap-8 lg:grid-cols-2">
              {/* Typical Tuition */}
              <motion.div
                initial={{ opacity: 0, x: -60, rotate: -2 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.35 }}
                transition={{ duration: 0.7 }}
                whileHover={{ y: -10, rotate: -3 }}
                className="relative rounded-[3rem] bg-white/60 p-7 shadow-[0_18px_55px_rgba(66,56,120,0.06)] backdrop-blur-xl"
              >
                <div className="absolute -top-4 left-8 rounded-full bg-slate-200 px-5 py-2 text-xs font-black text-slate-500">
                  {t("whyLuna.comparison.typical.label")}
                </div>

                <h3 className="font-poppins text-3xl font-black text-slate-400">
                  {t("whyLuna.comparison.typical.titleLine1")}<br />
                  {t("whyLuna.comparison.typical.titleLine2")}
                </h3>

                <div className="mt-8 space-y-4">
                  {[
                    t("whyLuna.comparison.typical.point1"),
                    t("whyLuna.comparison.typical.point2"),
                    t("whyLuna.comparison.typical.point3"),
                    t("whyLuna.comparison.typical.point4"),
                  ].map((item, i) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: false }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-start gap-3 rounded-2xl bg-white/70 p-4 text-sm text-slate-500"
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-black">
                        ×
                      </span>
                      <span>{item}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Luna Education */}
              <motion.div
                initial={{ opacity: 0, x: 60, rotate: 2 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.35 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                whileHover={{ y: -10, rotate: 3 }}
                className="relative rounded-[3rem] bg-white/95 p-7 shadow-[0_25px_80px_rgba(66,56,120,0.12)] backdrop-blur-xl"
              >
                <div className="absolute -top-4 left-8 rounded-full bg-[#8d73ff] px-5 py-2 text-xs font-black text-white">
                  {t("whyLuna.comparison.luna.label")}
                </div>

                <h3 className="font-poppins text-3xl font-black text-primary">
                  {t("whyLuna.comparison.luna.titleLine1")}<br />
                  {t("whyLuna.comparison.luna.titleLine2")}
                </h3>

                <div className="mt-8 space-y-4">
                  {[
                    t("whyLuna.comparison.luna.point1"),
                    t("whyLuna.comparison.luna.point2"),
                    t("whyLuna.comparison.luna.point3"),
                    t("whyLuna.comparison.luna.point4"),
                  ].map((item, i) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: false }}
                      transition={{ delay: 0.1 + i * 0.08 }}
                      className="flex items-start gap-3 rounded-2xl bg-[#fbfaff] p-4 text-sm font-medium text-primary/75"
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#8d73ff] text-xs font-black text-white">
                        ✓
                      </span>
                      <span>{item}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* VALUES */}
        <section className="relative overflow-hidden bg-[#fffdf8] px-4 py-24 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,#fff1bd_0%,transparent_26%),radial-gradient(circle_at_85%_70%,#f0eaff_0%,transparent_30%)]" />

          <div className="relative z-10 mx-auto max-w-[1280px]">
            <div className="mb-16 text-center">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]">
                {t("whyLuna.values.label")}
              </p>

              <h2 className="mt-4 font-poppins text-4xl font-black leading-tight text-primary sm:text-5xl">
                {t("whyLuna.values.titleLine1")}<br />
                {t("whyLuna.values.titleLine2")}
              </h2>

              <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-primary/60">
                {t("whyLuna.values.description")}
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: t("whyLuna.values.items.clarity.title"),
                  text: t("whyLuna.values.items.clarity.text"),
                  icon: Search,
                  color: "bg-[#ffe66d]",
                  rotate: "-rotate-2",
                },
                {
                  title: t("whyLuna.values.items.structure.title"),
                  text: t("whyLuna.values.items.structure.text"),
                  icon: Route,
                  color: "bg-[#8d73ff]",
                  rotate: "rotate-2",
                  light: true,
                },
                {
                  title: t("whyLuna.values.items.growth.title"),
                  text: t("whyLuna.values.items.growth.text"),
                  icon: Sprout,
                  color: "bg-[#b8f36c]",
                  rotate: "-rotate-1",
                },
                {
                  title: t("whyLuna.values.items.responsibility.title"),
                  text: t("whyLuna.values.items.responsibility.text"),
                  icon: ShieldCheck,
                  color: "bg-[#ff8bd2]",
                  rotate: "rotate-1",
                },
              ].map((value, i) => {

                const Icon = value.icon;
                return (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 50, rotate: 0 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.35 }}
                    transition={{ duration: 0.55, delay: i * 0.08 }}
                    whileHover={{
                      y: -12,
                      scale: 1.03,
                      rotate: i % 2 === 0 ? -4 : 4,
                    }}
                    className={`group rounded-[2.4rem] bg-white/95 p-7 shadow-[0_18px_55px_rgba(66,56,120,0.08)] backdrop-blur-xl ${value.rotate}`}
                  >
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 3 + i * 0.3, repeat: Infinity }}
                      className={`mb-6 flex h-16 w-16 items-center justify-center rounded-[1.5rem] ${value.color}`}
                    >
                      <Icon
                        className={`h-7 w-7 ${value.light ? "text-white" : "text-primary"}`}
                        strokeWidth={2.5}
                      />
                    </motion.div>

                    <h3 className="font-poppins text-2xl font-black text-primary">
                      {value.title}
                    </h3>

                    <p className="mt-4 text-sm leading-7 text-primary/60">
                      {value.text}
                    </p>

                    <div className="mt-6 h-2 overflow-hidden rounded-full bg-[#f3efff]">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${65 + i * 8}%` }}
                        viewport={{ once: false }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="h-full rounded-full bg-[#8d73ff]"
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* BOTTOM BULLETS */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.35 }}
              transition={{ duration: 0.7 }}
              className="mt-16 rounded-[3rem] bg-white/90 p-6 shadow-[0_25px_80px_rgba(66,56,120,0.10)] backdrop-blur-xl sm:p-8"
            >
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  t("whyLuna.values.bullets.point1"),
                  t("whyLuna.values.bullets.point2"),
                  t("whyLuna.values.bullets.point3"),
                  t("whyLuna.values.bullets.point4"),
                ].map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ y: -5, scale: 1.01 }}
                    className="flex items-start gap-3 rounded-2xl bg-[#fbfaff] p-5"
                  >
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#8d73ff] text-xs font-black text-white">
                      ✓
                    </span>
                    <p className="text-sm leading-7 text-primary/65">{item}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* VISUAL STORY SECTIONS */}
        <section className="relative bg-[#fbfaff] px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1280px]">
            <div className="mb-16 text-center">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]">
                {t("whyLuna.system.label")}
              </p>

              <h2 className="mt-4 font-poppins text-4xl font-black leading-tight text-primary sm:text-5xl">
                {t("whyLuna.system.titleLine1")}<br />
                {t("whyLuna.system.titleLine2")}
              </h2>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {sections.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 60, rotate: index % 2 === 0 ? -2 : 2 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.65, delay: index * 0.1 }}
                  whileHover={{
                    y: -12,
                    scale: 1.02,
                    rotate: index % 2 === 0 ? -3 : 3,
                  }}
                  className="group relative overflow-hidden rounded-[3rem] bg-white/95 p-7 shadow-[0_22px_65px_rgba(66,56,120,0.10)] backdrop-blur-xl"
                >
                  <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#f0eaff]" />

                  <div className="relative z-10">
                    <div className="mb-7 flex items-center justify-between">
                      <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-[#f6f2ff]">
                        <item.icon className="h-7 w-7 text-[#8d73ff]" />
                      </div>

                      <span className="rounded-full bg-[#fff6da] px-4 py-2 text-xs font-black text-[#d4a100]">
                        {item.tag}
                      </span>
                    </div>

                    <h3 className="font-poppins text-3xl font-black text-primary">
                      {item.title}
                    </h3>

                    <p className="mt-5 text-base leading-8 text-primary/60">
                      {item.text}
                    </p>

                    <div className="mt-8 rounded-[2rem] bg-[#fbfaff] p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <span className="text-sm font-bold text-primary/60">
                          {t("whyLuna.focusArea")}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#8d73ff]">
                          {t("whyLuna.improving")}
                        </span>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-[#eee9ff]">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${65 + index * 8}%` }}
                          viewport={{ once: false }}
                          transition={{ duration: 0.9 }}
                          className="h-full rounded-full bg-[#8d73ff]"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        {/* QUESTION BANK */}
        <section className="relative overflow-hidden bg-[#fffdf8] px-4 py-24 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_25%,#f0eaff_0%,transparent_28%),radial-gradient(circle_at_85%_70%,#fff1bd_0%,transparent_28%)]" />

          <div className="relative z-10 mx-auto grid max-w-[1280px] items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
            {/* LEFT */}
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]">
                {t("whyLuna.questionBank.label")}
              </p>

              <h2 className="mt-5 font-poppins text-4xl font-black leading-tight text-primary sm:text-5xl">
                {t("whyLuna.questionBank.titleLine1")}<br />
                {t("whyLuna.questionBank.titleLine2")}
              </h2>

              <p className="mt-6 max-w-xl text-base leading-8 text-primary/60 sm:text-lg">
                {t("whyLuna.questionBank.description")}
              </p>

              <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-2">
                {[
                  t("whyLuna.questionBank.benefits.targetedPractice"),
                  t("whyLuna.questionBank.benefits.mistakeReview"),
                  t("whyLuna.questionBank.benefits.tutorFollowUp"),
                  t("whyLuna.questionBank.benefits.goalBasedSets"),
                ].map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="rounded-2xl bg-white/90 px-4 py-4 text-sm font-bold text-primary/70 shadow-[0_12px_35px_rgba(66,56,120,0.07)]"
                  >
                    ✓ {item}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* RIGHT QUESTION BANK MOCKUP */}
            <motion.div
              initial={{ opacity: 0, y: 50, rotate: 2 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: false, amount: 0.35 }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div className="rounded-[3rem] bg-white/95 p-6 shadow-[0_25px_80px_rgba(66,56,120,0.12)] backdrop-blur-xl sm:p-8">
                <div className="mb-7 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-[#8d73ff]">
                      <BookOpen className="h-7 w-7 text-white" />
                    </div>

                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#8d73ff]">
                        {t("whyLuna.questionBank.mockup.label")}
                      </p>
                      <h3 className="mt-1 font-poppins text-3xl font-black text-primary">
                        {t("whyLuna.questionBank.mockup.title")}
                      </h3>
                    </div>
                  </div>

                  <span className="rounded-full bg-[#fff6da] px-4 py-2 text-xs font-black text-[#d4a100]">
                    {t("whyLuna.questionBank.mockup.badge")}
                  </span>
                </div>

                <div className="grid gap-4">
                  {[
                    {
                      title: t("whyLuna.questionBank.items.map"),
                      status: t("whyLuna.questionBank.available"),
                      percent: "86%",
                      color: "bg-[#ffe66d]",
                    },
                    {
                      title: t("whyLuna.questionBank.items.toefl"),
                      status: t("whyLuna.questionBank.available"),
                      percent: "72%",
                      color: "bg-[#8d73ff]",
                      light: true,
                    },
                    {
                      title: t("whyLuna.questionBank.items.aeis"),
                      status: t("whyLuna.questionBank.available"),
                      percent: "64%",
                      color: "bg-[#b8f36c]",
                    },
                    {
                      title: t("whyLuna.questionBank.items.interview"),
                      status: t("whyLuna.questionBank.available"),
                      percent: "91%",
                      color: "bg-[#ff8bd2]",
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: 40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: false }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ x: 8, scale: 1.01 }}
                      className="rounded-[1.5rem] bg-[#fbfaff] p-5"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.color}`}
                          >
                            <span
                              className={`text-lg font-black ${item.light ? "text-white" : "text-primary"
                                }`}
                            >
                              {i + 1}
                            </span>
                          </div>

                          <div>
                            <p className="font-bold text-primary">{item.title}</p>
                            <p className="mt-1 text-xs text-primary/50">
                              {t("whyLuna.questionBank.mockup.readiness")}
                            </p>
                          </div>
                        </div>

                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#8d73ff]">
                          {item.status}
                        </span>
                      </div>

                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#eee9ff]">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: item.percent }}
                          viewport={{ once: false }}
                          transition={{ duration: 0.8, delay: 0.15 }}
                          className="h-full rounded-full bg-[#8d73ff]"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="mt-5 rounded-[1.7rem] bg-white p-5 shadow-[0_18px_50px_rgba(66,56,120,0.10)] lg:absolute lg:-bottom-8 lg:-left-8 lg:w-[300px]"
              >
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8d73ff]">
                  {t("whyLuna.questionBank.review.label")}
                </p>
                <p className="mt-2 text-sm font-bold text-primary">
                  {t("whyLuna.questionBank.review.text")}
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>
        {/* FINAL CTA */}
        <section className="relative overflow-hidden bg-[#0f172a] px-4 py-24 sm:px-6 lg:px-8">
          {/* glow backgrounds */}
          <div className="absolute left-[-120px] top-[-100px] h-[320px] w-[320px] rounded-full bg-[#8d73ff]/30 blur-3xl" />
          <div className="absolute bottom-[-140px] right-[-100px] h-[360px] w-[360px] rounded-full bg-[#ffe66d]/20 blur-3xl" />

          {/* stars */}
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute left-[12%] top-[20%] h-2 w-2 rounded-full bg-white"
          />

          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute right-[18%] top-[30%] h-3 w-3 rounded-full bg-[#ffe66d]"
          />

          <div className="relative z-10 mx-auto max-w-[1200px]">
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.7 }}
              className="overflow-hidden rounded-[3rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl sm:p-12"
            >
              <div className="grid items-center gap-14 lg:grid-cols-[1fr_0.9fr]">
                {/* LEFT */}
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.25em] text-[#ffe66d]">
                    {t("whyLuna.cta.label")}
                  </p>

                  <h2 className="mt-5 font-poppins text-4xl font-black leading-tight text-white sm:text-6xl">
                    {t("whyLuna.cta.titleLine1")}<br />
                    {t("whyLuna.cta.titleLine2")}<br />
                    {t("whyLuna.cta.titleLine3")}
                  </h2>

                  <p className="mt-7 max-w-2xl text-lg leading-8 text-white/70">
                    {t("whyLuna.cta.description")}
                  </p>

                  {/* floating benefits */}
                  <div className="mt-10 flex flex-wrap gap-3">
                    {[
                      t("whyLuna.cta.tags.planning"),
                      t("whyLuna.cta.tags.exams"),
                      t("whyLuna.cta.tags.questionBanks"),
                      t("whyLuna.cta.tags.progress"),
                    ].map((item, i) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false }}
                        transition={{ delay: i * 0.08 }}
                        whileHover={{ y: -4 }}
                        className="rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm font-bold text-white/85"
                      >
                        {item}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* RIGHT CARD */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, rotate: 2 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                  viewport={{ once: false, amount: 0.35 }}
                  transition={{ duration: 0.7 }}
                  whileHover={{ y: -10 }}
                  className="relative rounded-[2.5rem] bg-white p-7 shadow-[0_35px_90px_rgba(0,0,0,0.30)]"
                >
                  {/* glow */}
                  <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#ffe66d]/50 blur-2xl" />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8d73ff]">
                          {t("whyLuna.cta.card.label")}
                        </p>

                        <h3 className="mt-2 font-poppins text-3xl font-black text-primary">
                          {t("whyLuna.cta.card.title")}
                        </h3>
                      </div>

                      <div className="rounded-full bg-[#f6f2ff] px-4 py-2 text-xs font-black text-[#8d73ff]">
                        {t("whyLuna.cta.card.badge")}
                      </div>
                    </div>

                    {/* mini process */}
                    <div className="mt-8 space-y-5">
                      {[
                        [t("whyLuna.cta.card.steps.assessment"), "✓"],
                        [t("whyLuna.cta.card.steps.matching"), "✓"],
                        [t("whyLuna.cta.card.steps.planning"), "✓"],
                        [t("whyLuna.cta.card.steps.pathway"), "✓"],
                      ].map(([step, icon], i) => (
                        <motion.div
                          key={step}
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: false }}
                          transition={{ delay: i * 0.08 }}
                          className="flex items-center justify-between rounded-2xl bg-[#fbfaff] p-4"
                        >
                          <p className="font-semibold text-primary">{step}</p>

                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#8d73ff] text-sm font-black text-white">
                            {icon}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    {/* CTA buttons */}
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <Link to={withLang("/enquiry")} className="flex-1">
                        <Button className="h-14 w-full rounded-2xl bg-[#8d73ff] text-base font-bold shadow-[0_18px_45px_rgba(141,115,255,0.35)]">
                          {t("whyLuna.buttons.enquire")}
                        </Button>
                      </Link>

                      <Link to={withLang("/subjects")} className="flex-1">
                        <Button
                          variant="outline"
                          className="h-14 w-full rounded-2xl border-primary/10 bg-white text-base font-bold"
                        >
                          {t("whyLuna.buttons.programs")}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
        <Footer />
      </div>
    </>
  );
};

export default WhyLuna;