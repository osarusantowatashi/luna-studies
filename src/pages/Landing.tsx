
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
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
  Sparkles,
  Plane,
  X,
  MessageCircle
} from "lucide-react";
import Footer from "@/components/Footer";
import { useTranslation } from "react-i18next";
import { useState, useRef } from "react";
import TutorProfileModal from "@/components/TutorProfileModal";
import { Helmet } from "react-helmet-async";



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

  const tutorScrollRef = useRef(null);

  const processRef = useRef(null);

  const { scrollYProgress: processProgress } = useScroll({
    target: processRef,
    offset: ["start center", "end center"],
  });

  const enquiryRef = useRef(null);

  const { scrollYProgress: enquiryProgress } = useScroll({
    target: enquiryRef,
    offset: ["start end", "end start"],
  });

  const enquiryMoonY = useTransform(enquiryProgress, [0, 1], [80, -80]);
  const enquiryCardRotate = useTransform(enquiryProgress, [0, 1], [-6, 6]);
  const enquiryLine = useTransform(enquiryProgress, [0.2, 0.75], [0, 1]);
  const processPlaneX = useTransform(processProgress, [0, 1], ["0%", "420%"]);
  const processPlaneY = useTransform(
    processProgress,
    [0, 0.25, 0.5, 0.75, 1],
    [0, -40, 20, -30, 0]
  );
  const { scrollYProgress: tutorProgress } = useScroll({
    target: tutorScrollRef,
    offset: ["start start", "end end"],
  });

  const smoothTutorProgress = useSpring(tutorProgress, {
    stiffness: 80,
    damping: 24,
  });
  const tutorCardY = [
    useTransform(smoothTutorProgress, [0, 0.18], [0, 0]),
    useTransform(smoothTutorProgress, [0.14, 0.42], [680, 0]),
    useTransform(smoothTutorProgress, [0.34, 0.62], [680, 0]),
    useTransform(smoothTutorProgress, [0.54, 0.82], [680, 0]),
    useTransform(smoothTutorProgress, [0.74, 1.0], [680, 0]),
  ];
  const pathwayRef = useRef(null);

  const { scrollYProgress: pathwayProgress } = useScroll({
    target: pathwayRef,
    offset: ["start end", "end start"],
  });

  const routeX = useTransform(pathwayProgress, [0, 1], ["-10%", "110%"]);
  const routeY = useTransform(pathwayProgress, [0, 0.3, 0.6, 1], [20, -30, 30, -10]);

  const { t } = useTranslation();
  const [selectedTutor, setSelectedTutor] = useState<any | null>(null);

  const { scrollYProgress } = useScroll();


  const vocabData = [
    { date: "May 18", words: 12 },
    { date: "May 25", words: 18 },
    { date: "Jun 01", words: 29 },
    { date: "Jun 08", words: 42 },
  ];
  const chokinaY = useTransform(scrollYProgress, [0, 0.08, 0.16], [120, 0, 0]);
  const hapikoY = useTransform(scrollYProgress, [0, 0.08, 0.16], [120, 0, 0]);
  const dogOpacity = useTransform(scrollYProgress, [0, 0.05], [0, 1]);

  const cardY = useTransform(scrollYProgress, [0.05, 0.16], [90, 0]);
  const cardOpacity = useTransform(scrollYProgress, [0.05, 0.12], [0, 1]);

  const floatY = useTransform(scrollYProgress, [0, 0.18], [40, -10]);

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
    <>
      <Helmet>
        <title>{t("landing.seo.title")}</title>
        <meta name="description" content={t("landing.seo.description")} />
      </Helmet>

      <div className="min-h-screen bg-background">

        {/* HERO */}
        <section className="relative overflow-hidden bg-[#fbfaff] px-4 pt-24 pb-16 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,#fff1bd_0%,transparent_22%),radial-gradient(circle_at_82%_78%,#fff5e4_0%,transparent_28%),linear-gradient(180deg,#f8f6ff_0%,#fffdf8_100%)]" />

          <div className="relative z-10 mx-auto max-w-[1440px]">
            <div className="grid min-h-[560px] items-start gap-8 pt-8 lg:grid-cols-[0.82fr_1.18fr]">      {/* LEFT */}
              <div className="relative z-20 max-w-[620px]">
                <p className="mb-6 flex items-center gap-2 text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]">
                  <Sparkles className="h-5 w-5" />
                  {t("landing.hero.label")}
                </p>

                <h1 className="font-poppins text-[3rem] font-black leading-[1.02] tracking-[-0.045em] text-primary sm:text-[4rem] lg:text-[5rem]">
                  {t("landing.hero.titleLine1")}<br />
                  {t("landing.hero.titleLine2")} <span className="text-[#8d73ff]">{t("landing.hero.titleHighlight")}</span><br />
                  {t("landing.hero.titleLine3")}<span className="text-[#ffc928]">.</span>
                </h1>

                <p className="mt-7 max-w-lg text-base leading-8 text-primary/70 sm:text-lg">
                  {t("landing.hero.description")}
                </p>

                <div className="mt-9 flex flex-wrap items-center gap-4">
                  <Link to="/enquiry">
                    <Button className="h-14 rounded-full bg-primary px-8 text-base shadow-[0_18px_45px_rgba(10,36,84,0.20)]">
                      {t("landing.hero.primaryButton")}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>

                  <Link to="/subjects">
                    <Button
                      variant="outline"
                      className="h-14 rounded-full border-primary/15 bg-white/85 px-8 text-base text-primary shadow-sm backdrop-blur"
                    >
                      {t("landing.hero.secondaryButton")}
                    </Button>
                  </Link>
                </div>

                <div className="mt-10 flex flex-wrap items-center gap-6">
                  <div className="flex -space-x-3">
                    {["/tutors/mimi_new.jpg", "/tutors/grace_new.jpg", "/tutors/francis_new.png", "/tutors/cj_new.png", "/tutors/christine_new.png"].map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt="student"
                        className="h-12 w-12 rounded-full border-4 border-white object-cover shadow-sm"
                      />
                    ))}
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-[#eee9ff] text-lg font-bold text-[#8d73ff]">
                      +
                    </div>
                  </div>

                  <div>
                    <div className="flex gap-1 text-[#ffc928]">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <p className="mt-1 text-sm font-medium text-primary/70">
                      {t("landing.hero.rating")}
                    </p>
                  </div>
                </div>
              </div>

              {/* RIGHT FLOATING DASHBOARD */}
              <div className="relative w-full lg:min-h-[560px]">
                {/* moon glow */}
                <div className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-full bg-[#ffe89a]/60 blur-sm shadow-[0_0_100px_rgba(255,217,100,0.35)] sm:h-72 sm:w-72" />

                <motion.img
                  src="/stickers/plane.png"
                  alt="paper airplane"
                  className="pointer-events-none absolute left-[5%] top-0 z-20 hidden w-24 sm:block"
                  animate={{ y: [0, -12, 0], x: [0, 10, 0], rotate: [0, 4, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />

                <div className="relative z-30 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                  {/* Writing Feedback */}
                  <motion.div
                    initial={false}

                    animate={{ opacity: 1, y: 0 }}

                    whileHover={{ y: -6 }}

                    transition={{ duration: 0.25 }}


                    className="rounded-[2rem] border border-white bg-white/90 p-6 shadow-[0_25px_80px_rgba(66,56,120,0.14)] backdrop-blur-xl sm:col-span-2 lg:col-span-3"
                  >
                    <p className="text-sm font-black text-primary">{t("landing.dashboard.writingFeedback.title")}</p>
                    <p className="mt-5 text-5xl font-black text-[#52bd7f]">
                      8.5<span className="text-xl text-primary">/10</span>
                    </p>
                    <p className="mt-2 text-sm text-primary/70">{t("landing.dashboard.writingFeedback.comment")}</p>

                    <div className="mt-6 space-y-4">
                      {[
                        [t("landing.dashboard.writingFeedback.items.ideas"), "86%"],
                        [t("landing.dashboard.writingFeedback.items.structure"), "68%"],
                        [t("landing.dashboard.writingFeedback.items.vocabulary"), "62%"],
                        [t("landing.dashboard.writingFeedback.items.grammar"), "70%"],
                      ].map(([label, width]) => (
                        <div key={label} className="grid grid-cols-[1fr_90px] items-center gap-3">
                          <p className="text-sm text-primary/65">✓ {label}</p>
                          <div className="h-2 rounded-full bg-slate-100">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width }}
                              viewport={{ once: false }}
                              transition={{ duration: 0.8, delay: 0.2 }}
                              className="h-2 rounded-full bg-[#52bd7f]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Upcoming Lesson */}
                  <motion.div
                    initial={false}

                    animate={{ opacity: 1, y: 0 }}

                    whileHover={{ y: -6 }}

                    transition={{ duration: 0.25 }}


                    className="rounded-[1.8rem] border border-white bg-white/90 p-5 shadow-[0_18px_60px_rgba(66,56,120,0.12)] backdrop-blur-xl lg:col-span-3"
                  >
                    <p className="text-sm font-black text-primary">{t("landing.dashboard.upcomingLesson.title")}</p>
                    <div className="mt-4 rounded-2xl bg-[#f3efff] p-4">
                      <p className="font-bold text-primary">{t("landing.dashboard.upcomingLesson.lesson")}</p>
                      <p className="mt-1 text-sm text-primary/55">{t("landing.dashboard.upcomingLesson.time")}</p>
                    </div>
                    <p className="mt-4 text-right text-sm font-bold text-[#8d73ff]">{t("landing.dashboard.upcomingLesson.action")}</p>
                  </motion.div>

                  {/* Vocabulary Growth */}
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.35 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="rounded-[1.8rem] border border-white bg-white/90 p-5 shadow-[0_18px_60px_rgba(66,56,120,0.12)] backdrop-blur-xl sm:col-span-2 lg:col-span-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-black text-primary">{t("landing.dashboard.vocabularyGrowth.title")}</p>

                      <div className="rounded-xl bg-[#f6f2ff] px-3 py-1 text-xs font-bold text-[#8d73ff]">
                        {t("landing.dashboard.vocabularyGrowth.badge")}
                      </div>
                    </div>

                    <div className="mt-3 h-[105px] w-full">    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={vocabData}>

                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12, fill: "#64748b" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis hide />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="words"
                          stroke="#8d73ff"
                          strokeWidth={4}
                          dot={{ r: 5, fill: "#8d73ff", strokeWidth: 0 }}
                          activeDot={{ r: 7, fill: "#8d73ff" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                    </div>
                  </motion.div>

                  {/* MAP Score Progress */}
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.35 }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    className="rounded-[1.8rem] border border-white bg-white/90 p-5 shadow-[0_18px_60px_rgba(66,56,120,0.12)] backdrop-blur-xl lg:col-span-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-black text-primary">
                        {t("landing.dashboard.mapProgress.title")}
                      </p>

                      <div className="rounded-xl bg-[#f6f2ff] px-3 py-1 text-xs font-bold text-[#8d73ff]">
                        {t("landing.dashboard.mapProgress.badge")}
                      </div>
                    </div>

                    <div className="mt-5 space-y-5">

                      {/* Reading */}
                      <div>
                        <div className="mb-2 flex items-end justify-between">
                          <div>
                            <p className="font-bold text-primary">{t("landing.dashboard.mapProgress.reading.title")}</p>
                            <p className="text-xs text-primary/50">
                              {t("landing.dashboard.mapProgress.reading.subtitle")}
                            </p>
                          </div>

                          <p className="text-2xl font-black text-[#8d73ff]">
                            78%
                          </p>
                        </div>

                        <div className="h-3 rounded-full bg-[#eee9ff]">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: "78%" }}
                            viewport={{ once: false }}
                            transition={{ duration: 0.8 }}
                            className="h-3 rounded-full bg-[#8d73ff]"
                          />
                        </div>
                      </div>

                      {/* Math */}
                      <div>
                        <div className="mb-2 flex items-end justify-between">
                          <div>
                            <p className="font-bold text-primary">{t("landing.dashboard.mapProgress.math.title")}</p>
                            <p className="text-xs text-primary/50">
                              {t("landing.dashboard.mapProgress.math.subtitle")}
                            </p>
                          </div>

                          <p className="text-2xl font-black text-[#8d73ff]">
                            72%
                          </p>
                        </div>

                        <div className="h-3 rounded-full bg-[#eee9ff]">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: "72%" }}
                            viewport={{ once: false }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="h-3 rounded-full bg-[#8d73ff]"
                          />
                        </div>
                      </div>

                    </div>
                  </motion.div>
                  {/* Tutor Feedback */}
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.35 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                    className="rounded-[1.8rem] border border-white bg-white/90 p-5 shadow-[0_18px_60px_rgba(66,56,120,0.12)] backdrop-blur-xl lg:col-span-3"    >
                    <p className="text-sm font-black text-primary">{t("landing.dashboard.tutorFeedback.title")}</p>
                    <div className="mt-4 flex items-center gap-3">
                      <img src="/tutors/christine_new.png" alt={t("landing.dashboard.tutorFeedback.imageAlt")} className="h-12 w-12 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-primary">{t("landing.dashboard.tutorFeedback.name")}</p>
                        <p className="text-xs text-[#8d73ff]">{t("landing.dashboard.tutorFeedback.role")}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-primary/65">
                      {t("landing.dashboard.tutorFeedback.comment")}
                    </p>
                  </motion.div>

                  {/* Weekly Goals */}
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.35 }}
                    transition={{ duration: 0.7, delay: 0.5 }}
                    className="rounded-[1.5rem] border border-white bg-white/90 p-5 shadow-[0_18px_60px_rgba(66,56,120,0.12)] backdrop-blur-xl sm:col-span-2 lg:col-span-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-black text-primary">
                        {t("landing.dashboard.weeklyGoals.title")}
                      </p>

                      <span className="rounded-xl bg-[#fff6da] px-3 py-1 text-xs font-bold text-[#d4a100]">
                        {t("landing.dashboard.weeklyGoals.badge")}
                      </span>
                    </div>

                    <div className="mt-5 space-y-3">

                      {[
                        [t("landing.dashboard.weeklyGoals.items.readingHomework"), true],
                        [t("landing.dashboard.weeklyGoals.items.vocabulary"), true],
                        [t("landing.dashboard.weeklyGoals.items.speakingPractice"), false],
                        [t("landing.dashboard.weeklyGoals.items.grammarReview"), true],
                      ].map(([task, done], i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: false }}
                          transition={{ delay: i * 0.08 }}
                          className="flex items-center gap-3"
                        >
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${done
                              ? "bg-[#8d73ff] text-white"
                              : "border border-slate-300 bg-white"
                              }`}
                          >
                            {done ? "✓" : ""}
                          </div>

                          <p
                            className={`text-sm ${done
                              ? "text-primary/75"
                              : "text-primary/45"
                              }`}
                          >
                            {task}
                          </p>
                        </motion.div>
                      ))}

                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM FEATURE CARD */}
          <motion.div
            initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: false, amount: 0.35 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="
relative z-40 mt-10 overflow-hidden
rounded-[2rem] border border-white/80
bg-white/90
px-5 py-7
sm:px-7
lg:px-10 lg:py-8
shadow-[0_25px_80px_rgba(15,23,42,0.12)]
backdrop-blur-xl
lg:grid lg:grid-cols-[1.2fr_4.2fr]
">
            {/* LEFT TEXT */}
            <div
              className="
relative
mb-6
border-b border-primary/10
pb-7
lg:mb-0
lg:border-b-0 lg:border-r
lg:pb-0 lg:pr-10
"  >
              <motion.p
                initial={{ opacity: 0, x: -18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                transition={{ delay: 0.15 }}
                className="text-sm font-bold text-[#7c5cff]"
              >
                {t("landing.programs.labelLine1")}<br />
                {t("landing.programs.labelLine2")}
              </motion.p>

              <motion.h2
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ delay: 0.25 }}
                className="mt-4 font-poppins text-3xl font-black leading-tight text-primary"
              >
                {t("landing.programs.titleLine1")}<br />
                {t("landing.programs.titleLine2")}<br />
                {t("landing.programs.titleLine3")}{" "}
                <span className="relative inline-block">
                  {t("landing.programs.highlight")}
                  <motion.span
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: false }}
                    transition={{ delay: 0.55, duration: 0.6 }}
                    className="absolute -bottom-1 left-0 h-3 w-full origin-left rounded-full bg-[#ffc928]/45"
                  />
                </span>
              </motion.h2>

              <motion.div
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: false }}
                transition={{ delay: 0.45, duration: 0.7 }}
                className="absolute left-[120px] top-[46px] hidden h-10 w-16 rotate-12 rounded-full border-2 border-[#ffc928] lg:block"
              />
            </div>

            {/* RIGHT PROGRAMS */}
            <div className="
mt-7
grid grid-cols-2 gap-y-8
sm:gap-x-6
lg:mt-0
lg:grid-cols-5
lg:gap-x-2
"
            >    {[
              {
                icon: BarChart3,
                title: t("landing.programs.items.map.title"),
                sub: t("landing.programs.items.map.sub"),
                bg: "bg-[#ffe66d]",
              },
              {
                icon: Globe2,
                title: t("landing.programs.items.toefl.title"),
                sub: t("landing.programs.items.toefl.sub"),
                bg: "bg-[#8d73ff]",
                light: true,
              },
              {
                icon: Users,
                title: t("landing.programs.items.wida.title"),
                sub: t("landing.programs.items.wida.sub"),
                bg: "bg-[#b8f36c]",
              },
              {
                icon: BookOpen,
                title: t("landing.programs.items.writing.title"),
                sub: t("landing.programs.items.writing.sub"),
                bg: "bg-[#ff8bd2]",
              },
              {
                icon: MessageCircle,
                title: t("landing.programs.items.interview.title"),
                sub: t("landing.programs.items.interview.sub"),
                bg: "bg-[#ffe66d]",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 22, scale: 0.92 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: false }}
                transition={{ delay: 0.25 + i * 0.08, duration: 0.45 }}
                whileHover={{
                  y: -8,
                  scale: 1.015,
                  rotate: [-5, 4.5, -4, 5, -3.5][i],
                }} className="
relative flex flex-col items-center justify-start
px-3 py-4
text-center
sm:px-5
lg:min-h-[210px]
lg:border-r lg:border-primary/10 lg:last:border-r-0
"      >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3 + i * 0.25, repeat: Infinity, ease: "easeInOut" }}
                  className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${item.bg} shadow-[0_14px_35px_rgba(15,23,42,0.10)]`}
                >
                  <item.icon className={`h-7 w-7 ${item.light ? "text-white" : "text-primary"}`} />
                </motion.div>

                <p className="font-poppins text-lg font-black text-primary">
                  {item.title}
                </p>

                <p className="mt-2 max-w-[130px] text-sm leading-5 text-primary/65">
                  {item.sub}
                </p>
              </motion.div>
            ))}
            </div>
          </motion.div>

        </section>


        {/* GLOBAL PATHWAYS */}
        <section
          ref={pathwayRef}
          className="relative overflow-hidden bg-[#fbfaff] px-4 py-24 sm:px-6 lg:px-8"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#f0eaff_0%,transparent_30%),radial-gradient(circle_at_85%_70%,#fff1bd_0%,transparent_28%)]" />

          <div className="relative z-10 mx-auto max-w-[1280px]">
            <div className="mb-16 text-center">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]">
                {t("landing.pathways.label")}
              </p>

              <h2 className="mt-4 font-poppins text-4xl font-black leading-tight text-primary sm:text-5xl">
                {t("landing.pathways.titleLine1")}<br />
                {t("landing.pathways.titleLine2")}
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-primary/60">
                {t("landing.pathways.description")}
              </p>
            </div>

            <div className="relative mx-auto min-h-[620px] max-w-[1100px] rounded-[3rem] bg-white/55 p-6 backdrop-blur-xl sm:p-8 lg:p-10">
              {/* dotted route */}
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full"
                viewBox="0 0 1100 620"
                fill="none"
                preserveAspectRatio="none"
              >
                <motion.path
                  d="M280 310 C420 220, 520 220, 560 310"
                  stroke="#8d73ff"
                  strokeWidth="4"
                  strokeDasharray="12 14"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 0.35 }}
                  viewport={{ once: false, amount: 0.55 }}
                  transition={{ duration: 1.1, delay: 0.4 }}
                />

                <motion.path
                  d="M560 310 C650 220, 760 220, 840 310"
                  stroke="#8d73ff"
                  strokeWidth="4"
                  strokeDasharray="12 14"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 0.35 }}
                  viewport={{ once: false, amount: 0.55 }}
                  transition={{ duration: 1.1, delay: 0.8 }}
                />
              </svg>

              {/* flying plane */}
              <motion.img
                src="/stickers/plane.png"
                alt="pathway plane"
                style={{ translateX: routeX, translateY: routeY }}
                className="absolute left-0 top-[48%] z-30 hidden w-20 drop-shadow-xl lg:block"
              />

              <div className="relative z-20 grid gap-6 md:grid-cols-2">
                {[
                  {
                    flag: "🇯🇵",
                    country: t("landing.pathways.items.japan.country"),
                    desc: t("landing.pathways.items.japan.desc"),
                    tags: ["MAP", "WIDA", t("landing.pathways.tags.interview")],
                    rotate: "-rotate-2",
                  },
                  {
                    flag: "🇸🇬",
                    country: t("landing.pathways.items.singapore.country"),
                    desc: t("landing.pathways.items.singapore.desc"),
                    tags: ["AEIS", t("landing.pathways.tags.english"), t("landing.pathways.tags.transition")],
                    rotate: "rotate-2",
                  },
                  {
                    flag: "🇦🇺",
                    country: t("landing.pathways.items.australia.country"),
                    desc: t("landing.pathways.items.australia.desc"),
                    tags: ["IELTS", t("landing.pathways.tags.writing"), t("landing.pathways.tags.speaking")],
                    rotate: "rotate-1",
                  },
                  {
                    flag: "🌏",
                    country: t("landing.pathways.items.others.country"),
                    desc: t("landing.pathways.items.others.desc"),
                    tags: [
                      t("landing.pathways.tags.reading"),
                      t("landing.pathways.tags.criticalThinking"),
                      t("landing.pathways.tags.presentation"),
                    ],
                    rotate: "-rotate-1",
                  },
                ].map((path, i) => (
                  <motion.div
                    key={path.country}
                    initial={{ opacity: 0, y: 50, rotate: 0 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.35 }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    whileHover={{
                      y: -12,
                      scale: 1.025,
                      rotate: i % 2 === 0 ? -3 : 3,
                    }}
                    className={`group relative rounded-[2.2rem] bg-white/95 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl ${path.rotate}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#f6f2ff] text-4xl">
                        {path.flag}
                      </div>

                      <span className="rounded-full bg-[#fff6da] px-4 py-2 text-xs font-black text-[#d4a100]">
                        {path.country}
                      </span>
                    </div>

                    <h3 className="mt-6 font-poppins text-2xl font-black text-primary">
                      {path.country}
                    </h3>

                    <p className="mt-4 text-sm leading-7 text-primary/60">
                      {path.desc}
                    </p>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {path.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-[#f6f2ff] px-3 py-1 text-xs font-bold text-primary/70"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <motion.div
                      className="absolute -right-3 -top-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#8d73ff] text-white opacity-0 shadow-lg group-hover:opacity-100"
                      animate={{ rotate: [0, 8, -8, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                    >
                      ✦
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* WHY LUNA PREVIEW */}
        <section className="relative overflow-hidden bg-[#fbfaff] px-4 py-28 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,#f0eaff_0%,transparent_30%),radial-gradient(circle_at_82%_72%,#fff1bd_0%,transparent_28%)]" />

          <div className="relative z-10 mx-auto grid max-w-[1280px] items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
            {/* LEFT */}
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]">
                {t("landing.whyPreview.label")}
              </p>

              <h2 className="mt-5 font-poppins text-5xl font-black leading-tight text-primary sm:text-6xl">
                {t("landing.whyPreview.titleLine1")}<br />
                {t("landing.whyPreview.titleLine2")}<br />
                {t("landing.whyPreview.titleLine3")}
              </h2>

              <p className="mt-7 max-w-xl text-lg leading-8 text-primary/65">
                {t("landing.whyPreview.description")} </p>

              <Link to="/why-luna">
                <Button className="group mt-9 h-14 rounded-full bg-primary px-8 text-base">
                  {t("landing.whyPreview.button")}
                  <ArrowRight className="ml-2 h-5 w-5 transition group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            {/* RIGHT INTERACTIVE CARDS */}
            <div className="relative min-h-[520px]">
              {[
                {
                  icon: Target,
                  title: t("landing.whyPreview.cards.assessment.title"),
                  desc: t("landing.whyPreview.cards.assessment.desc"),
                  top: "top-[0%]",
                  left: "left-[10%]",
                  rotate: "-rotate-3",
                  color: "bg-[#ffe66d]",
                },
                {
                  icon: Users,
                  title: t("landing.whyPreview.cards.matching.title"),
                  desc: t("landing.whyPreview.cards.matching.desc"),
                  top: "top-[22%]",
                  left: "left-[36%]",
                  rotate: "rotate-3",
                  color: "bg-[#8d73ff]",
                  light: true,
                },
                {
                  icon: BarChart3,
                  title: t("landing.whyPreview.cards.progress.title"),
                  desc: t("landing.whyPreview.cards.progress.desc"),
                  top: "top-[48%]",
                  left: "left-[8%]",
                  rotate: "rotate-2",
                  color: "bg-[#b8f36c]",
                },
                {
                  icon: MessageCircle,
                  title: t("landing.whyPreview.cards.support.title"),
                  desc: t("landing.whyPreview.cards.support.desc"),
                  top: "top-[66%]",
                  left: "left-[44%]",
                  rotate: "-rotate-2",
                  color: "bg-[#ff8bd2]",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 50, rotate: 0 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.35 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  whileHover={{
                    y: -12,
                    scale: 1.03,
                    rotate: i % 2 === 0 ? -4 : 4,
                  }}
                  className={`absolute ${item.top} ${item.left} ${item.rotate} w-[320px] rounded-[2rem] bg-white/95 p-6 shadow-[0_18px_55px_rgba(66,56,120,0.10)] backdrop-blur-xl`}
                >
                  <div
                    className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${item.color}`}
                  >
                    <item.icon
                      className={`h-6 w-6 ${item.light ? "text-white" : "text-primary"
                        }`}
                    />
                  </div>

                  <h3 className="font-poppins text-xl font-black text-primary">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-primary/60">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section
          ref={processRef}
          className="relative overflow-hidden bg-[#fffdf8] px-4 py-24 sm:px-6 lg:px-8"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#f0eaff_0%,transparent_28%),radial-gradient(circle_at_80%_60%,#fff1bd_0%,transparent_25%)]" />

          <div className="relative z-10 mx-auto max-w-[1280px]">
            <div className="mb-16 text-center">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]">
                {t("landing.process.label")}
              </p>

              <h2 className="mt-4 font-poppins text-4xl font-black leading-tight text-primary sm:text-5xl">
                {t("landing.process.title")}
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-primary/60">
                {t("landing.process.description")}
              </p>
            </div>

            <div className="relative">
              {/* dotted flight path */}
              <div className="absolute left-[8%] right-[8%] top-[72px] hidden border-t-2 border-dashed border-[#8d73ff]/25 lg:block" />

              {/* flying mascot / plane */}
              <motion.div
                style={{
                  translateX: processPlaneX,
                  translateY: processPlaneY,
                }}
                className="absolute left-[8%] top-[40px] z-30 hidden lg:block"
              >

              </motion.div>

              <div className="grid gap-5 lg:grid-cols-5">
                {[
                  {
                    num: "01",
                    title: t("landing.process.steps.assessment.title"),
                    desc: t("landing.process.steps.assessment.desc"),
                    icon: Target,
                    color: "bg-[#ffe66d]",
                  },
                  {
                    num: "02",
                    title: t("landing.process.steps.report.title"),
                    desc: t("landing.process.steps.report.desc"),
                    icon: BarChart3,
                    color: "bg-[#b8f36c]",
                  },
                  {
                    num: "03",
                    title: t("landing.process.steps.matching.title"),
                    desc: t("landing.process.steps.matching.desc"),
                    icon: Users,
                    color: "bg-[#f7a8dc]",
                  },
                  {
                    num: "04",
                    title: t("landing.process.steps.tracking.title"),
                    desc: t("landing.process.steps.tracking.desc"),
                    icon: BookOpen,
                    color: "bg-[#8d73ff]",
                    light: true,
                  },
                  {
                    num: "05",
                    title: t("landing.process.steps.evaluation.title"),
                    desc: t("landing.process.steps.evaluation.desc"),
                    icon: Star,
                    color: "bg-[#ffe66d]",
                  },
                ].map((step, i) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 50, rotate: i % 2 === 0 ? -1.5 : 1.5 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.35 }}
                    transition={{ duration: 0.55, delay: i * 0.08 }}
                    whileHover={{
                      y: -10,
                      rotate: i % 2 === 0 ? -3 : 3,
                      scale: 1.03,
                    }}
                    className="group relative rounded-[2rem] bg-white/90 p-6 shadow-[0_18px_55px_rgba(66,56,120,0.10)] backdrop-blur-xl"
                  >
                    <div className="mb-6 flex items-center justify-between">
                      <span className="font-poppins text-3xl font-black text-primary/15">
                        {step.num}
                      </span>

                      <motion.div
                        whileHover={{ rotate: 12 }}
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${step.color}`}
                      >
                        <step.icon
                          className={`h-6 w-6 ${step.light ? "text-white" : "text-primary"
                            }`}
                        />
                      </motion.div>
                    </div>

                    <h3 className="font-poppins text-xl font-black text-primary">
                      {step.title}
                    </h3>

                    <p className="mt-4 text-sm leading-7 text-primary/60">
                      {step.desc}
                    </p>

                    <div className="mt-6 h-2 rounded-full bg-[#f3efff]">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(i + 1) * 20}%` }}
                        viewport={{ once: false }}
                        transition={{ duration: 0.8, delay: 0.15 }}
                        className="h-2 rounded-full bg-[#8d73ff]"
                      />
                    </div>

                    <div className="pointer-events-none absolute -right-3 -top-3 rounded-full bg-[#ffc928] px-3 py-1 text-xs font-black text-primary opacity-0 shadow-lg transition group-hover:opacity-100">
                      {t("landing.process.stepLabel")} {i + 1}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* HEAD TUTORS */}
        <section
          ref={tutorScrollRef}
          className="relative hidden h-[620vh] bg-[#fbfaff] lg:block">
          <div className="sticky top-0 flex h-screen items-center overflow-hidden px-8">
            <div className="mx-auto grid w-full max-w-[1440px] grid-cols-[0.8fr_1.4fr] items-center gap-12">

              {/* LEFT TEXT */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.4 }}
                transition={{ duration: 0.7 }}
              >
                <p className="text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]">
                  {t("landing.tutorsSection.label")}
                </p>

                <h2 className="mt-5 font-poppins text-5xl font-black leading-tight text-primary">
                  {t("landing.tutorsSection.titleLine1")}<br />
                  {t("landing.tutorsSection.titleLine2")}{" "}
                  <span className="text-[#8d73ff]">
                    {t("landing.tutorsSection.highlight")}
                  </span>
                </h2>

                <p className="mt-6 max-w-md text-base leading-8 text-primary/65">
                  {t("landing.tutorsSection.description")}
                </p>

                <Link to="/tutors">
                  <Button className="mt-8 h-12 rounded-full bg-primary px-8">
                    {t("landing.tutorsSection.button")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>

              {/* VERTICAL STACKED CARDS */}
              <div className="relative overflow-hidden rounded-[3rem] bg-transparent">
                <div className="relative h-[390px] w-full overflow-hidden">


                  {[
                    {
                      name: "Mimi",
                      role: t("landing.tutors.mimi.role"),
                      image: "/tutors/mimi_new.jpg",
                      tags: ["TOEFL 119", "IELTS 8.5", "JLPT N1"],
                      desc: t("landing.tutors.mimi.desc"),
                    },
                    {
                      name: "Grace",
                      role: t("landing.tutors.grace.role"),
                      image: "/tutors/grace_new.jpg",
                      tags: ["IB 40", "TOEFL 108", "CAT4"],
                      desc: t("landing.tutors.grace.desc"),
                    },
                    {
                      name: "Francis",
                      role: t("landing.tutors.francis.role"),
                      image: "/tutors/francis_new.png",
                      tags: ["Math", "Science", "MAP"],
                      desc: t("landing.tutors.francis.desc"),
                    },
                    {
                      name: "CJ",
                      role: t("landing.tutors.cj.role"),
                      image: "/tutors/cj_new.png",
                      tags: ["Interview", "Writing", "Speaking"],
                      desc: t("landing.tutors.cj.desc"),
                    },
                    {
                      name: "Christine",
                      role: t("landing.tutors.christine.role"),
                      image: "/tutors/christine_new.png",
                      tags: ["Reading", "Writing", "WIDA"],
                      desc: t("landing.tutors.christine.desc"),
                    },
                  ].map((tutor, i) => (
                    <motion.div
                      key={tutor.name}
                      style={{
                        y: tutorCardY[i],
                        rotate: [-4, 3.5, -3, 4, -2.5][i],
                        zIndex: i + 10,
                      }}
                      whileHover={{ y: -8, scale: 1.015 }}
                      transition={{ duration: 0.25 }}
                      className="absolute left-[2%] top-0 h-[300px] w-[720px] rounded-[2.6rem] bg-white/95 p-7 backdrop-blur-xl">
                      <div className="flex h-full gap-7">

                        {/* IMAGE */}
                        <div className="w-[220px] shrink-0 overflow-hidden rounded-[2rem] bg-[#f3efff]">
                          <img
                            src={tutor.image}
                            alt={tutor.name}
                            className="h-full w-full object-cover object-top"
                          />
                        </div>

                        {/* CONTENT */}
                        <div className="flex flex-1 flex-col justify-center">

                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-poppins text-4xl font-black text-primary">
                                {tutor.name}
                              </h3>

                              <p className="mt-2 text-lg font-semibold text-[#8d73ff]">
                                {tutor.role}
                              </p>
                            </div>

                            <span className="rounded-full bg-[#fff6da] px-4 py-2 text-sm font-bold text-[#d4a100]">
                              5.0
                            </span>
                          </div>

                          <p className="mt-6 max-w-[420px] text-[17px] leading-8 text-primary/65">
                            {tutor.desc}
                          </p>

                          <div className="mt-6 flex flex-wrap gap-3">
                            {tutor.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-[#f6f2ff] px-4 py-2 text-sm font-bold text-primary/70"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>

                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MOBILE / TABLET TUTORS */}
        <section className=" px-4 py-16 lg:hidden">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]">
            {t("landing.tutorsSection.label")}
          </p>

          <h2 className="mt-4 font-poppins text-4xl font-black leading-tight text-primary">
            {t("landing.tutorsSection.mobileTitle")}
          </h2>

          <div className="mt-8 grid gap-5">
            {tutors.map((tutor) => (
              <div
                key={tutor.name}
                className="rounded-[2rem] border border-white bg-white/90 p-5 shadow-[0_18px_60px_rgba(66,56,120,0.12)]"
              >
                <img
                  src={tutor.image}
                  alt={tutor.name}
                  className="h-56 w-full rounded-[1.5rem] object-cover object-top"
                />
                <h3 className="mt-4 font-poppins text-2xl font-black text-primary">
                  {tutor.name}
                </h3>
                <p className="mt-1 text-sm text-primary/60">{tutor.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ARTISTIC ENQUIRY */}
        <section
          ref={enquiryRef}
          className="relative overflow-hidden bg-[#fffdf8] px-4 py-28 sm:px-6 lg:px-8"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#f0eaff_0%,transparent_28%),radial-gradient(circle_at_80%_75%,#fff1bd_0%,transparent_30%)]" />

          <motion.div
            style={{ y: enquiryMoonY }}
            className="absolute right-[8%] top-[12%] h-52 w-52 rounded-full bg-[#ffe680]/70 blur-sm sm:h-72 sm:w-72"
          />

          <div className="relative z-10 mx-auto max-w-[1200px]">
            <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">

              {/* LEFT */}
              <div>
                <p className="text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]">
                  {t("landing.enquiry.label")}
                </p>

                <h2 className="mt-5 font-poppins text-5xl font-black leading-tight text-primary sm:text-6xl">
                  {t("landing.enquiry.titleLine1")}<br />
                  {t("landing.enquiry.titleLine2")}<br />
                  {t("landing.enquiry.titleLine3")}
                </h2>

                <p className="mt-7 max-w-xl text-lg leading-8 text-primary/65">
                  {t("landing.enquiry.description")}
                </p>

                <Link to="/enquiry">
                  <Button className="group mt-9 h-16 rounded-full bg-primary px-9 text-base shadow-[0_20px_55px_rgba(10,36,84,0.20)]">
                    {t("landing.enquiry.button")}
                    <motion.span
                      className="ml-3 inline-flex"
                      animate={{ x: [0, 6, 0] }}
                      transition={{ duration: 1.4, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </Button>
                </Link>
              </div>

              {/* RIGHT ART CARD */}
              <Link to="/enquiry" className="block">
                <motion.div
                  style={{ rotate: enquiryCardRotate }}
                  whileHover={{
                    scale: 1.025,
                    rotate: 0,
                    y: -10,
                  }}
                  transition={{ duration: 0.35 }}
                  className="group relative rounded-[3rem] bg-white/90 p-8 shadow-[0_25px_80px_rgba(66,56,120,0.12)] backdrop-blur-xl"
                >
                  <div className="absolute -right-4 -top-4 rounded-full bg-[#ffc928] px-5 py-3 text-sm font-black text-primary shadow-lg">
                    {t("landing.enquiry.card.badge")}
                  </div>

                  <div className="rounded-[2.3rem] bg-[#f8f6ff] p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#8d73ff] text-3xl">
                        💬
                      </div>
                      <div>
                        <p className="font-poppins text-2xl font-black text-primary">
                          {t("landing.enquiry.card.title")}
                        </p>
                        <p className="text-sm text-primary/55">
                          {t("landing.enquiry.card.subtitle")}
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 space-y-4">
                      {[
                        t("landing.enquiry.card.steps.grade"),
                        t("landing.enquiry.card.steps.level"),
                        t("landing.enquiry.card.steps.goals"),
                        t("landing.enquiry.card.steps.schedule"),
                      ].map((item, i) => (
                        <motion.div
                          key={item}
                          initial={{ opacity: 0, x: 30 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: false }}
                          transition={{ delay: i * 0.12 }}
                          className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4"
                        >
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f6f2ff] text-sm font-black text-[#8d73ff]">
                            {i + 1}
                          </div>
                          <p className="text-sm font-semibold text-primary/70">
                            {item}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* animated drawn line */}
                  <svg
                    className="pointer-events-none absolute -bottom-12 left-10 h-24 w-[80%]"
                    viewBox="0 0 500 100"
                    fill="none"
                  >
                    <motion.path
                      d="M10 60 C120 10, 250 100, 490 30"
                      stroke="#8d73ff"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray="10 12"
                      style={{ pathLength: enquiryLine }}
                    />
                  </svg>

                  <div className="mt-7 flex items-center justify-between">
                    <p className="text-sm font-bold text-primary/55">
                      {t("landing.enquiry.card.continue")}
                    </p>

                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white transition group-hover:translate-x-1">
                      →
                    </div>
                  </div>
                </motion.div>
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Landing;