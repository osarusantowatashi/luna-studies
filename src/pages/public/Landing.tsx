
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Target,
  BarChart3,
  FileText,
  ClipboardCheck,
  PackageCheck,
  School,
  Compass,
  Star,
  Users,
  Sparkles,
  MessageCircle
} from "lucide-react";
import Footer from "@/components/Footer";
import { useTranslation } from "react-i18next";
import { useRef } from "react";
import SeoHelmet from "@/components/SeoHelmet";



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
  const location = useLocation();

  const currentLang = location.pathname.startsWith("/zh")
    ? "zh"
    : location.pathname.startsWith("/ja")
      ? "ja"
      : "en";

  const withLang = (path: string) =>
    `/${currentLang}${path === "/" ? "" : path}`;

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

    useTransform(smoothTutorProgress, [0, 0.14], [0, 0]),

    useTransform(smoothTutorProgress, [0.12, 0.32], [680, 0]),

    useTransform(smoothTutorProgress, [0.28, 0.48], [680, 0]),

    useTransform(smoothTutorProgress, [0.44, 0.64], [680, 0]),

    useTransform(smoothTutorProgress, [0.6, 0.78], [680, 0]),

    useTransform(smoothTutorProgress, [0.72, 0.9], [680, 0]),

    useTransform(smoothTutorProgress, [0.82, 1.0], [680, 0]),

  ];
  const pathwayRef = useRef(null);

  const { scrollYProgress: pathwayProgress } = useScroll({
    target: pathwayRef,
    offset: ["start end", "end start"],
  });

  const routeX = useTransform(pathwayProgress, [0, 1], ["-10%", "110%"]);
  const routeY = useTransform(pathwayProgress, [0, 0.3, 0.6, 1], [20, -30, 30, -10]);

  const { t } = useTranslation();
  const heroDescription = t("landing.hero.description");
  const heroDescriptionLines =
    currentLang === "zh"
      ? heroDescription.replace("，帮助", "。|帮助").split("|")
      : currentLang === "ja"
        ? heroDescription.replace("通して、", "通して、|").split("|")
      : [heroDescription];
  const heroDescriptionWidthClass =
    currentLang === "ja"
      ? "max-w-[42rem]"
      : currentLang === "zh"
        ? "max-w-2xl"
        : "max-w-[46rem]";
  const heroTitleLine2 = t("landing.hero.titleLine2");
  const heroTitleSizeClass =
    currentLang === "zh"
      ? "text-[1.75rem] min-[390px]:text-[1.95rem] sm:text-[3.25rem] lg:text-[4rem] xl:text-[4.45rem]"
      : currentLang === "ja"
        ? "text-[1.45rem] min-[390px]:text-[1.65rem] sm:text-[2.8rem] lg:text-[3.45rem] xl:text-[3.95rem]"
        : "text-[1.5rem] min-[390px]:text-[1.72rem] sm:text-[2.9rem] lg:text-[3.55rem] xl:text-[4.05rem]";

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
    {
      name: "Junichi Ro",
      role: t("landing.tutors.junichi.role"),
      image: "/tutors/Junichi Ro.jpeg",
      tags: ["NYU Math", "English", "Japanese"],
      desc: t("landing.tutors.junichi.desc"),
      highlight: "Math · English · Reasoning",
      education: "Bachelor of Science in Mathematics, New York University",
      languages: "English / Japanese",
      subjects: ["Mathematics", "English"],
      experience: [
        "Mathematics and English teaching across multiple countries",
        "Former Student Leader at a Mathematics Learning Support Center",
      ],
    },
  ];

  const baseUrl = "https://www.lunastudies.com";

  const canonicalUrl =
    currentLang === "en"
      ? `${baseUrl}/en`
      : currentLang === "zh"
        ? `${baseUrl}/zh`
        : `${baseUrl}/ja`;
  
  const seoTitle = t("landing.seo.title");
  const seoDescription = t("landing.seo.description");

  return (
    <>
      <SeoHelmet
  title={t("landing.seo.title")}
  description={t("landing.seo.description")}
  canonicalUrl={canonicalUrl}
  currentLang={currentLang}
/>

      <div className="min-h-screen bg-background">

        {/* HERO */}
        <section className="relative overflow-hidden bg-[#fbfaff] px-4 pb-32 pt-14 sm:px-6 sm:pb-32 sm:pt-20 md:pb-28 lg:px-8 lg:pb-16 lg:pt-12 xl:pt-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,#f0eaff_0%,transparent_30%),radial-gradient(circle_at_80%_18%,#fff1bd_0%,transparent_24%),linear-gradient(180deg,#f8f6ff_0%,#fffdf8_100%)]" />
          <div className="pointer-events-none absolute -left-20 top-[26%] h-80 w-80 rounded-full bg-[#8d73ff]/8 blur-3xl" />
          <div className="pointer-events-none absolute right-[4%] top-[17%] h-80 w-80 rounded-full bg-[#ffe89a]/32 blur-2xl shadow-[0_0_90px_rgba(255,217,100,0.16)] sm:h-[28rem] sm:w-[28rem]" />

          <div className="relative z-10 mx-auto max-w-[1320px]">
            <div className="relative flex min-h-0 flex-col items-center pt-6 text-center sm:pt-8 lg:min-h-[650px] lg:justify-center lg:pt-0">
              <div className="pointer-events-none absolute left-1/2 top-[50%] hidden h-[590px] w-[590px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#8d73ff]/7 bg-white/20 shadow-[inset_0_0_90px_rgba(141,115,255,0.05)] backdrop-blur-sm lg:block" />
              <div className="pointer-events-none absolute left-1/2 top-[46%] hidden h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ffe66d]/18 shadow-[0_0_55px_rgba(255,230,109,0.13)] lg:block" />

              <svg
                className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
                viewBox="0 0 1320 620"
                fill="none"
                preserveAspectRatio="none"
              >
                <motion.path
                  d="M128 405 C205 158, 470 86, 687 132 C884 174, 1016 290, 1114 482"
                  stroke="#8d73ff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="10 16"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.14 }}
                  transition={{ duration: 1.2, delay: 0.2 }}
                />
              </svg>

              <motion.img
                src="/stickers/plane.png"
                alt="paper airplane"
                className="pointer-events-none absolute left-[62%] top-[12%] z-20 hidden w-16 drop-shadow-xl lg:block xl:w-20"
                animate={{ y: [0, -8, 0], x: [0, 12, 0], rotate: [-18, -12, -18] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />

              <div className="relative z-30 mx-auto max-w-[960px]">
                <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#8d73ff] shadow-[0_12px_35px_rgba(15,23,42,0.06)] backdrop-blur-md sm:text-sm">
                  <Sparkles className="h-4 w-4" />
                  {t("landing.hero.label")}
                </p>

                <h1 className={`font-poppins font-black leading-[1.08] text-primary ${heroTitleSizeClass}`}>
                  <span className="block whitespace-nowrap">
                    {t("landing.hero.titleLine1")}
                  </span>
                  <span className="mt-2 block whitespace-nowrap text-[#8d73ff] sm:mt-3">
                    {heroTitleLine2}
                  </span>
                </h1>

                <p className={`mx-auto mt-7 text-base leading-8 text-primary/68 sm:text-lg ${heroDescriptionWidthClass}`}>
                  {heroDescriptionLines.map((line) => (
                    <span key={line} className="block [&+&]:mt-2">
                      {line}
                    </span>
                  ))}
                </p>

                <div className="mx-auto mt-8 grid max-w-md gap-3 sm:mt-9 sm:flex sm:max-w-none sm:flex-wrap sm:items-center sm:justify-center sm:gap-4">
                  <Link to={withLang("/enquiry")} className="w-full sm:w-auto">
                    <Button className="h-14 w-full rounded-full bg-primary px-8 text-base shadow-[0_18px_45px_rgba(10,36,84,0.20)] sm:w-auto">
                      {t("landing.hero.primaryButton")}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>

                  <Link to={withLang("/services")} className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      className="h-14 w-full rounded-full border-primary/15 bg-white/85 px-8 text-base text-primary shadow-sm backdrop-blur sm:w-auto"
                    >
                      {t("landing.hero.secondaryButton")}
                    </Button>
                  </Link>
                </div>

                <div className="mx-auto mt-8 grid w-full max-w-sm gap-3 lg:hidden">
                  {[
                    {
                      icon: Users,
                      value: "Global",
                      label: "Online Support",
                      accent: "bg-[linear-gradient(135deg,#9a82ff_0%,#7157e8_100%)]",
                      surface: "bg-[linear-gradient(135deg,rgba(255,255,255,0.92)_0%,rgba(250,247,255,0.78)_100%)]",
                      glow: "bg-[#8d73ff]/14",
                      light: true,
                    },
                    {
                      icon: School,
                      value: "K–12",
                      label: "Grades Supported",
                      accent: "bg-[linear-gradient(135deg,#ffe66d_0%,#ffc928_100%)]",
                      surface: "bg-[linear-gradient(135deg,rgba(255,255,255,0.92)_0%,rgba(255,251,232,0.78)_100%)]",
                      glow: "bg-[#ffc928]/16",
                    },
                    {
                      icon: Compass,
                      value: "100+",
                      label: "School Pathways",
                      accent: "bg-[linear-gradient(135deg,#c8ff78_0%,#9ee94c_100%)]",
                      surface: "bg-[linear-gradient(135deg,rgba(255,255,255,0.96)_0%,rgba(248,255,239,0.82)_100%)]",
                      glow: "bg-[#b8f36c]/18",
                    },
                  ].map((item, index) => {
                    const CoverageIcon = item.icon;

                    return (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.42, delay: 0.18 + index * 0.08 }}
                        className={`relative w-full max-w-full overflow-hidden rounded-[1.45rem] border border-white/85 px-4 py-3 text-left shadow-[0_16px_42px_rgba(66,56,120,0.10)] ring-1 ring-primary/[0.035] backdrop-blur-2xl ${item.surface}`}
                      >
                        <div className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl ${item.glow}`} />
                        <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-white/90" />

                        <div className="relative flex items-center gap-3.5">
                          <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.15rem] shadow-[0_12px_26px_rgba(15,23,42,0.10),inset_0_1px_0_rgba(255,255,255,0.52)] ring-1 ring-white/45 ${item.accent}`}>
                            <div className="pointer-events-none absolute inset-1 rounded-[0.9rem] border border-white/20" />
                            <CoverageIcon
                              className={`relative h-5 w-5 ${item.light ? "text-white" : "text-primary"}`}
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="font-poppins text-[1.45rem] font-black leading-none tracking-[-0.01em] text-primary">
                              {item.value}
                            </p>
                            <p className="mt-2 whitespace-nowrap text-sm font-semibold leading-none text-primary/52">
                              {item.label}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div className="hidden lg:absolute lg:inset-0 lg:z-20 lg:block">
                {[
                  {
                    icon: Users,
                    value: "Global",
                    label: "Online Support",
                    accent: "bg-[linear-gradient(135deg,#9a82ff_0%,#7157e8_100%)]",
                    surface: "bg-[linear-gradient(135deg,rgba(255,255,255,0.92)_0%,rgba(250,247,255,0.78)_100%)]",
                    glow: "bg-[#8d73ff]/14",
                    position: "lg:absolute lg:-left-[3%] lg:top-[17%] xl:left-[1%]",
                    tilt: "lg:-rotate-[5deg]",
                    light: true,
                  },
                  {
                    icon: School,
                    value: "K–12",
                    label: "Grades Supported",
                    accent: "bg-[linear-gradient(135deg,#ffe66d_0%,#ffc928_100%)]",
                    surface: "bg-[linear-gradient(135deg,rgba(255,255,255,0.92)_0%,rgba(255,251,232,0.78)_100%)]",
                    glow: "bg-[#ffc928]/16",
                    position: "lg:absolute lg:-right-[3%] lg:top-[23%] xl:right-[1%]",
                    tilt: "lg:rotate-[5deg]",
                  },
                  {
                    icon: Compass,
                    value: "100+",
                    label: "School Pathways",
                    accent: "bg-[linear-gradient(135deg,#c8ff78_0%,#9ee94c_100%)]",
                    surface: "bg-[linear-gradient(135deg,rgba(255,255,255,0.96)_0%,rgba(248,255,239,0.82)_100%)]",
                    glow: "bg-[#b8f36c]/18",
                    position: "lg:absolute lg:bottom-[12%] lg:left-[1%] xl:left-[7%]",
                    tilt: "lg:-rotate-[7deg]",
                    primary: true,
                  },
                ].map((item, index) => {
                  const CoverageIcon = item.icon;

                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 18, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.25 + index * 0.12 }}
                      whileHover={{ y: item.primary ? -6 : -3 }}
                      className={`group relative w-full max-w-full overflow-hidden rounded-[1.5rem] border border-white/85 px-4 py-3 text-left ring-1 ring-primary/[0.035] backdrop-blur-2xl transition sm:rounded-[1.75rem] sm:py-3.5 ${item.surface} ${
                        item.primary
                          ? "shadow-[0_26px_70px_rgba(66,56,120,0.16)] lg:w-[250px] lg:px-4 lg:py-3.5 xl:w-[306px] xl:px-5 xl:py-4"
                          : "shadow-[0_20px_50px_rgba(66,56,120,0.11)] lg:w-[238px] lg:px-4 lg:py-3.5 xl:w-[296px] xl:px-5 xl:py-4"
                      } ${item.position} ${item.tilt}`}
                    >
                      <div className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl ${item.glow}`} />
                      <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-white/90" />
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(255,255,255,0.72),transparent_34%)] opacity-80" />

                      <div className={`flex items-center ${item.primary ? "gap-4" : "gap-3.5"}`}>
                        <div className={`relative flex shrink-0 items-center justify-center rounded-[1.15rem] shadow-[0_12px_26px_rgba(15,23,42,0.10),inset_0_1px_0_rgba(255,255,255,0.52)] ring-1 ring-white/45 transition group-hover:scale-[1.03] sm:rounded-[1.35rem] ${item.primary ? "h-14 w-14 lg:h-[4.15rem] lg:w-[4.15rem]" : "h-12 w-12 lg:h-[3.65rem] lg:w-[3.65rem]"} ${item.accent}`}>
                          <div className="pointer-events-none absolute inset-1 rounded-[1.05rem] border border-white/20" />
                          <CoverageIcon
                            className={`relative ${item.primary ? "h-6 w-6 lg:h-7 lg:w-7" : "h-5 w-5 lg:h-6 lg:w-6"} ${item.light ? "text-white" : "text-primary"}`}
                          />
                        </div>

                        <div className="relative min-w-0">
                          <p className={`font-poppins font-black leading-none tracking-[-0.01em] text-primary ${item.primary ? "text-[1.65rem] lg:text-[2rem] xl:text-[2.15rem]" : "text-[1.45rem] lg:text-[1.65rem] xl:text-[1.8rem]"}`}>
                            {item.value}
                          </p>
                          <p className={`mt-2 whitespace-nowrap leading-none text-primary/52 ${item.primary ? "text-sm font-semibold" : "text-sm font-medium"}`}>
                            {item.label}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

        </section>


        {/* ASSESSMENT & ADMISSIONS PATHWAYS */}
        <section className="relative overflow-hidden bg-[#fbfaff] px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,#f0eaff_0%,transparent_28%),radial-gradient(circle_at_82%_72%,#fff1bd_0%,transparent_25%),linear-gradient(180deg,#fffdf8_0%,#fbfaff_100%)]" />

          <motion.div
            initial={{ opacity: 0, y: 34, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="relative z-10 mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] border border-white/75 bg-white/88 px-5 py-7 shadow-[0_24px_70px_rgba(66,56,120,0.10)] backdrop-blur-xl sm:rounded-[2.4rem] sm:px-7 lg:grid lg:grid-cols-[1.18fr_2.55fr] lg:items-stretch lg:gap-12 lg:px-12 lg:py-9 xl:gap-16"
          >
            <div className="pointer-events-none absolute left-12 top-10 h-32 w-32 rounded-full bg-[#ffe66d]/12 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 right-[30%] h-56 w-56 rounded-full bg-[#8d73ff]/10 blur-3xl" />

            <div className="relative mb-7 border-b border-primary/10 pb-8 lg:mb-0 lg:border-b-0 lg:border-r lg:border-primary/8 lg:pb-0 lg:pr-12 xl:pr-16">
              <motion.p
                initial={{ opacity: 0, x: -18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                transition={{ delay: 0.12 }}
                className="text-xs font-black uppercase tracking-[0.22em] text-primary/42"
              >
                {t("landing.programs.label")}
              </motion.p>

              <motion.h2
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ delay: 0.2 }}
                className="mt-5 font-poppins text-[1.85rem] font-black leading-[1.14] text-primary min-[390px]:text-[2rem] sm:text-[2.45rem] lg:text-[2.55rem]"
              >
                {(currentLang === "zh"
                  ? ["每一次测评", "每一个目标", "每一步成长"]
                  : currentLang === "ja"
                    ? ["一つひとつの試験に、", "明確な学習計画を"]
                    : ["Every assessment,", "with a clearer path"]
                ).map((line, index) => (
                  <span
                    key={line}
                    className={`block ${currentLang === "zh" ? "whitespace-nowrap" : ""}`}
                  >
                    {line.includes("成长") ? (
                      <>
                        每一步<span className="relative inline-block text-[#8d73ff]">
                          成长
                          <motion.span
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: false }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                            className="absolute -bottom-0.5 left-0 right-0 h-2 origin-left rounded-full bg-[#ffc928]/45"
                          />
                        </span>
                      </>
                    ) : (
                      line
                    )}
                  </span>
                ))}
              </motion.h2>
            </div>

            <div className="relative mt-7 grid grid-cols-1 gap-3 min-[390px]:grid-cols-2 sm:grid-cols-3 lg:mt-0 lg:grid-cols-5 lg:gap-3">
              {[
                {
                  icon: BarChart3,
                  title: t("landing.programs.items.map.title"),
                  sub: currentLang === "zh" ? "成长测评" : currentLang === "ja" ? "学力成長測定" : "Growth Assessment",
                  bg: "bg-[#ffe66d]",
                  path: withLang("/subjects/map-preparation"),
                  cardClass: "border-[#ffe66d]/24 bg-white/94 shadow-[0_14px_34px_rgba(66,56,120,0.07)]",
                  iconClass: "h-[4.5rem] w-[4.5rem]",
                  titleClass: "text-3xl",
                },
                {
                  icon: Users,
                  title: t("landing.programs.items.wida.title"),
                  sub: currentLang === "zh" ? "语言发展" : currentLang === "ja" ? "言語発達" : "Language Development",
                  bg: "bg-[#b8f36c]",
                  path: withLang("/subjects/wida-preparation"),
                  cardClass: "border-[#b8f36c]/22 bg-white/90 shadow-[0_14px_34px_rgba(66,56,120,0.065)]",
                  iconClass: "h-[4.5rem] w-[4.5rem]",
                  titleClass: "text-3xl",
                },
                {
                  icon: Target,
                  title: t("landing.programs.items.cat4.title"),
                  sub: currentLang === "zh" ? "认知能力" : currentLang === "ja" ? "認知能力" : "Cognitive Ability",
                  bg: "bg-[#ffc928]",
                  path: withLang("/subjects/cat4-preparation"),
                  cardClass: "border-[#ffc928]/22 bg-[#fffdf8]/90 shadow-[0_14px_34px_rgba(66,56,120,0.065)]",
                  iconClass: "h-[4.5rem] w-[4.5rem]",
                  titleClass: "text-3xl",
                },
                {
                  icon: FileText,
                  title: "TOEFL",
                  sub: currentLang === "zh" ? "英语能力" : currentLang === "ja" ? "英語力" : "English Proficiency",
                  bg: "bg-[#f6f2ff]",
                  path: withLang("/subjects/toefl-preparation"),
                  cardClass: "border-[#8d73ff]/12 bg-white/90 shadow-[0_14px_34px_rgba(66,56,120,0.065)]",
                  iconClass: "h-[4.5rem] w-[4.5rem]",
                  titleClass: "text-3xl",
                },
                {
                  icon: BookOpen,
                  title: "IELTS",
                  sub: currentLang === "zh" ? "学术英语" : currentLang === "ja" ? "アカデミック英語" : "Academic English",
                  bg: "bg-[#8d73ff]",
                  path: withLang("/subjects/ielts-preparation"),
                  light: true,
                  cardClass: "border-[#8d73ff]/16 bg-white/90 shadow-[0_14px_34px_rgba(66,56,120,0.065)]",
                  iconClass: "h-[4.5rem] w-[4.5rem]",
                  titleClass: "text-3xl",
                },
              ].map((item, i) => (
                <Link key={item.title} to={item.path}>
                  <motion.div
                    initial={{ opacity: 0, y: 28, scale: 0.94, rotate: i % 2 === 0 ? -1.5 : 1.5 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: false }}
                    transition={{ delay: 0.16 + i * 0.06, duration: 0.4 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className={`group relative flex h-full min-h-[148px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[1.5rem] border px-3 py-5 text-center backdrop-blur-xl transition hover:border-[#8d73ff]/22 hover:bg-white hover:shadow-[0_20px_48px_rgba(66,56,120,0.10)] sm:min-h-[178px] sm:px-4 lg:min-h-[210px] ${item.cardClass}`}
                  >
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 3 + i * 0.2, repeat: Infinity, ease: "easeInOut" }}
                      className={`mb-5 flex items-center justify-center rounded-[1.6rem] ${item.bg} shadow-[0_14px_34px_rgba(15,23,42,0.10)] transition duration-300 group-hover:scale-105 ${item.iconClass}`}
                    >
                      <item.icon className={`h-9 w-9 ${item.light ? "text-white" : "text-primary"}`} />
                    </motion.div>

                    <p className={`font-poppins font-black leading-none text-primary ${item.titleClass}`}>
                      {item.title}
                    </p>

                    <p className="mt-3 max-w-[126px] text-xs font-semibold leading-5 text-primary/55">
                      {item.sub}
                    </p>

                    <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 translate-x-1 text-[#8d73ff] opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        </section>


        {/* SERVICES PREVIEW */}
        <section className="relative overflow-hidden bg-[#fffdf8] px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,#f0eaff_0%,transparent_28%),radial-gradient(circle_at_84%_72%,#fff1bd_0%,transparent_26%)]" />

          <div className="relative z-10 mx-auto grid max-w-[1280px] gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.55 }}
            >
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]">
                {t("landing.servicesPreview.label")}
              </p>

              <h2 className="mt-5 font-poppins text-4xl font-black leading-tight text-primary sm:text-5xl">
                {t("landing.servicesPreview.titleLine1")}<br />
                {t("landing.servicesPreview.titleLine2")}
              </h2>

              <p className="mt-6 max-w-xl text-base leading-8 text-primary/65 sm:text-lg">
                {t("landing.servicesPreview.description")}
              </p>

              <Link to={withLang("/services")}>
                <Button className="mt-8 h-14 rounded-full bg-primary px-8 text-base shadow-[0_18px_45px_rgba(10,36,84,0.16)]">
                  {t("landing.servicesPreview.button")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {[
                {
                  icon: BookOpen,
                  title: t("landing.servicesPreview.items.privateLessons.title"),
                  desc: t("landing.servicesPreview.items.privateLessons.desc"),
                  path: withLang("/subjects"),
                },
                {
                  icon: FileText,
                  title: t("landing.servicesPreview.items.essay.title"),
                  desc: t("landing.servicesPreview.items.essay.desc"),
                  path: withLang("/services/essay-support"),
                },
                {
                  icon: Users,
                  title: t("landing.servicesPreview.items.parentInterview.title"),
                  desc: t("landing.servicesPreview.items.parentInterview.desc"),
                  path: withLang("/services/parent-interview"),
                },
                {
                  icon: ClipboardCheck,
                  title: t("landing.servicesPreview.items.mockInterview.title"),
                  desc: t("landing.servicesPreview.items.mockInterview.desc"),
                  path: withLang("/services/mock-interview"),
                },
                {
                  icon: PackageCheck,
                  title: t("landing.servicesPreview.items.examPackage.title"),
                  desc: t("landing.servicesPreview.items.examPackage.desc"),
                  path: withLang("/services/exam-package"),
                },
                {
                  icon: School,
                  title: t("landing.servicesPreview.items.schoolConsulting.title"),
                  desc: t("landing.servicesPreview.items.schoolConsulting.desc"),
                  path: withLang("/services/school-consulting"),
                },
                {
                  icon: Compass,
                  title: t("landing.servicesPreview.items.consultation.title"),
                  desc: t("landing.servicesPreview.items.consultation.desc"),
                  path: withLang("/services/consultation"),
                },
              ].map((service, index) => {
                const ServiceIcon = service.icon;

                return (
                  <Link
                    key={service.title}
                    to={service.path}
                    className={index === 6 ? "sm:col-span-2 xl:col-span-3" : ""}
                  >
                    <motion.article
                      initial={{ opacity: 0, y: 22 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.25 }}
                      transition={{ duration: 0.45, delay: index * 0.04 }}
                      whileHover={{ y: -5 }}
                      className="group flex h-full min-h-[150px] flex-col rounded-[1.5rem] border border-white/80 bg-white/92 p-5 shadow-[0_16px_45px_rgba(66,56,120,0.08)] backdrop-blur-xl"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3efff]">
                          <ServiceIcon className="h-6 w-6 text-[#8d73ff]" />
                        </div>

                        <ArrowRight className="h-5 w-5 text-primary/25 transition group-hover:translate-x-1 group-hover:text-[#8d73ff]" />
                      </div>

                      <h3 className="mt-5 font-poppins text-lg font-black leading-tight text-primary">
                        {service.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-primary/60">
                        {service.desc}
                      </p>

                    </motion.article>
                  </Link>
                );
              })}
            </div>
          </div>
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

            <div className="relative mx-auto max-w-[1100px] rounded-[2.4rem] bg-white/55 p-4 backdrop-blur-xl sm:p-6 lg:min-h-[620px] lg:rounded-[3rem] lg:p-10">
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

              <div className="relative z-20 grid gap-4 sm:gap-5 md:grid-cols-2 lg:gap-6">
                {[
                  {
                    flag: "🇯🇵",
                    country: t("landing.pathways.items.japan.country"),
                    desc: t("landing.pathways.items.japan.desc"),
                    tags: ["MAP", "WIDA", t("landing.pathways.tags.interview")],
                    rotate: "lg:-rotate-2",
                  },
                  {
                    flag: "🇸🇬",
                    country: t("landing.pathways.items.singapore.country"),
                    desc: t("landing.pathways.items.singapore.desc"),
                    tags: ["AEIS", t("landing.pathways.tags.english"), t("landing.pathways.tags.transition")],
                    rotate: "lg:rotate-2",
                  },
                  {
                    flag: "🇦🇺",
                    country: t("landing.pathways.items.australia.country"),
                    desc: t("landing.pathways.items.australia.desc"),
                    tags: ["IELTS", t("landing.pathways.tags.writing"), t("landing.pathways.tags.speaking")],
                    rotate: "lg:rotate-1",
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
                    rotate: "lg:-rotate-1",
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
                    className={`group relative rounded-[2rem] bg-white/95 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl lg:rounded-[2.2rem] lg:p-6 ${path.rotate}`}
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

              <h2 className="mt-5 font-poppins text-[1.75rem] font-black leading-tight text-primary min-[375px]:text-[2rem] sm:text-[3.5rem] md:text-6xl lg:text-[3.25rem] xl:text-[3.45rem]">
                {(currentLang === "zh"
                  ? ["不只是上课", "而是一套", "为成长设计的学习系统"]
                  : [
                    t("landing.whyPreview.titleLine1"),
                    t("landing.whyPreview.titleLine2"),
                    t("landing.whyPreview.titleLine3"),
                  ]
                ).map((line, index) => (
                  <span
                    key={line}
                    className={`block ${currentLang === "zh" && index === 2 ? "whitespace-nowrap" : ""}`}
                  >
                    {line}
                  </span>
                ))}
              </h2>

              <p className="mt-7 max-w-xl text-lg leading-8 text-primary/65">
                {t("landing.whyPreview.description")} </p>

              <Link to={withLang("/whyluna")}>
                <Button className="group mt-9 h-14 rounded-full bg-primary px-8 text-base">
                  {t("landing.whyPreview.button")}
                  <ArrowRight className="ml-2 h-5 w-5 transition group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            {/* RIGHT INTERACTIVE CARDS */}
            <div className="relative mt-10 grid gap-4 sm:grid-cols-2 lg:mt-0 lg:min-h-[520px] lg:block">
              {[
                {
                  icon: Target,
                  title: t("landing.whyPreview.cards.assessment.title"),
                  desc: t("landing.whyPreview.cards.assessment.desc"),
                  top: "lg:top-[0%]",
                  left: "lg:left-[10%]",
                  rotate: "lg:-rotate-3",
                  color: "bg-[#ffe66d]",
                },
                {
                  icon: Users,
                  title: t("landing.whyPreview.cards.matching.title"),
                  desc: t("landing.whyPreview.cards.matching.desc"),
                  top: "lg:top-[22%]",
                  left: "lg:left-[36%]",
                  rotate: "lg:rotate-3",
                  color: "bg-[#8d73ff]",
                  light: true,
                },
                {
                  icon: BarChart3,
                  title: t("landing.whyPreview.cards.progress.title"),
                  desc: t("landing.whyPreview.cards.progress.desc"),
                  top: "lg:top-[48%]",
                  left: "lg:left-[8%]",
                  rotate: "lg:rotate-2",
                  color: "bg-[#b8f36c]",
                },
                {
                  icon: MessageCircle,
                  title: t("landing.whyPreview.cards.support.title"),
                  desc: t("landing.whyPreview.cards.support.desc"),
                  top: "lg:top-[66%]",
                  left: "lg:left-[44%]",
                  rotate: "lg:-rotate-2",
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
                  className={`relative rounded-[2rem] bg-white/95 p-5 shadow-[0_18px_55px_rgba(66,56,120,0.10)] backdrop-blur-xl sm:p-6 lg:absolute lg:w-[320px] ${item.top} ${item.left} ${item.rotate}`}
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
          className="relative overflow-hidden bg-[#fffdf8] px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#f0eaff_0%,transparent_28%),radial-gradient(circle_at_80%_60%,#fff1bd_0%,transparent_25%)]" />

          <div className="relative z-10 mx-auto max-w-[1280px]">
            <div className="mb-10 text-center lg:mb-16">
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

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5">
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
                    className="group relative rounded-[2rem] bg-white/90 p-5 shadow-[0_18px_55px_rgba(66,56,120,0.10)] backdrop-blur-xl lg:p-6"
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
          className="relative hidden h-[720vh] bg-[#fbfaff] lg:block">
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

                <Link to={withLang("/tutors")}>
                  <Button className="mt-8 h-12 rounded-full bg-primary px-8">
                    {t("landing.tutorsSection.button")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>

              {/* VERTICAL STACKED CARDS */}
              <div className="relative overflow-hidden rounded-[3rem] bg-transparent">
                <div className="relative h-[430px] w-full overflow-hidden xl:h-[470px]">

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
                      name: "Junichi Ro",
                      role: t("landing.tutors.junichi.role"),
                      image: "/tutors/Junichi Ro.jpeg",
                      tags: ["NYU Math", "English", "Japanese"],
                      desc: t("landing.tutors.junichi.desc"),
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
                    {
                      name: "Kana",
                      role: t("landing.tutors.kana.role"),
                      image: "/tutors/kana_new.png",
                      tags: ["Japanese", "JLPT", "Conversational"],
                      desc: t("landing.tutors.kana.desc"),
                    }
                  ].map((tutor, i) => (
                      <motion.div
                      key={tutor.name}
                      style={{
                        y: tutorCardY[i],
                        rotate: [-4, 3.5, -3, 2.5, 4, -2.5, 3][i],
                        zIndex: i + 10,
                      }}
                      whileHover={{ y: -8, scale: 1.015 }}
                      transition={{ duration: 0.25 }}
                      className="absolute left-[2%] top-0 h-[260px] w-[620px] rounded-[2.6rem] bg-white/95 p-5 backdrop-blur-xl xl:h-[300px] xl:w-[720px] xl:p-7">
                      <div className="flex h-full gap-5 xl:gap-7">

                        {/* IMAGE */}
                        <div className="h-full w-[210px] shrink-0 overflow-hidden rounded-[2rem] bg-[#f3efff] xl:w-[250px]">
                          <img
                            src={tutor.image}
                            alt={tutor.name}
                            className={`
      h-full w-full transition duration-500
      ${tutor.name === "Kana"
                                ? "object-cover object-[center_18%]"
                                : "object-cover object-top"
                              }
    `}
                          />
                        </div>

                        {/* CONTENT */}
                        <div className="flex flex-1 flex-col justify-center">

                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-poppins text-3xl font-black text-primary xl:text-4xl">
                                {tutor.name}
                              </h3>

                              <p className="mt-2 text-base font-semibold text-[#8d73ff] xl:text-lg">
                                {tutor.role}
                              </p>
                            </div>

                            <span className="rounded-full bg-[#fff6da] px-4 py-2 text-sm font-bold text-[#d4a100]">
                              5.0
                            </span>
                          </div>

                          <p className="mt-4 max-w-[360px] text-sm leading-6 text-primary/65 xl:mt-6 xl:max-w-[420px] xl:text-[17px] xl:leading-8">      {tutor.desc}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-2 xl:mt-6 xl:gap-3">
                            {tutor.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-[#f6f2ff] px-3 py-1.5 text-xs font-bold text-primary/70 xl:px-4 xl:py-2 xl:text-sm"
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
        <section className="relative overflow-hidden bg-[#fbfaff] px-4 py-20 sm:px-6 lg:hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,#f0eaff_0%,transparent_30%),radial-gradient(circle_at_85%_78%,#fff1bd_0%,transparent_28%)]" />

          <div className="relative z-10 mx-auto max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]">
              {t("landing.tutorsSection.label")}
            </p>

            <h2 className="mt-4 font-poppins text-4xl font-black leading-tight text-primary sm:text-5xl">
              {t("landing.tutorsSection.mobileTitle")}
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-7 text-primary/60 sm:text-base">
              {t("landing.tutorsSection.description")}
            </p>

            <div className="mt-8 grid gap-5">
              {tutors.map((tutor, i) => (
                <motion.div
                  key={tutor.name}
                  initial={{ opacity: 0, y: 30, rotate: 0 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.25 }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  whileHover={{ y: -6, scale: 1.01 }}
                  className="rounded-[2.2rem] bg-white/95 p-4 shadow-[0_18px_55px_rgba(66,56,120,0.10)] backdrop-blur-xl sm:p-5"
                >
                  <div className="grid grid-cols-[108px_minmax(0,1fr)] gap-4 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-5">
                    <div className="h-[145px] overflow-hidden rounded-[1.6rem] bg-[#f3efff] sm:h-[190px] sm:rounded-[2rem]">
                      <img
                        src={tutor.image}
                        alt={tutor.name}
                        className="h-full w-full object-cover object-top"
                      />
                    </div>

                    <div className="flex min-w-0 flex-col justify-center">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-poppins text-2xl font-black text-primary sm:text-3xl">
                            {tutor.name}
                          </h3>

                          <p className="mt-1 text-xs font-semibold text-[#8d73ff] sm:text-sm">
                            {tutor.role}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-full bg-[#fff6da] px-3 py-1 text-xs font-bold text-[#d4a100]">
                          5.0
                        </span>
                      </div>

                      <p className="mt-3 line-clamp-3 text-xs leading-5 text-primary/65 sm:text-sm sm:leading-6">
                        {tutor.desc}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-1.5 sm:gap-2">
                        {tutor.tags.map((tag) => (
                          <span
                            key={tag}
                            className="whitespace-nowrap rounded-full bg-[#f6f2ff] px-2.5 py-1 text-[10px] font-bold text-primary/70 sm:px-3 sm:py-1.5 sm:text-xs"
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

            <Link to={withLang("/tutors")}>
              <Button className="mt-8 h-12 rounded-full bg-primary px-8">
                {t("landing.tutorsSection.button")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* ARTISTIC ENQUIRY */}
        <section
          ref={enquiryRef}
          className="relative overflow-hidden bg-[#fffdf8] px-4 py-20 sm:px-6 lg:px-8 lg:py-28"  >
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

                <h2 className="mt-5 font-poppins text-4xl font-black leading-tight text-primary sm:text-5xl lg:text-6xl">
                  {t("landing.enquiry.titleLine1")}<br />
                  {t("landing.enquiry.titleLine2")}<br />
                  {t("landing.enquiry.titleLine3")}
                </h2>

                <p className="mt-7 max-w-xl text-lg leading-8 text-primary/65">
                  {t("landing.enquiry.description")}
                </p>

                <Link to={withLang("/enquiry")}>
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
              <Link to={withLang("/enquiry")} className="block">
                <motion.div
                  style={{ rotate: enquiryCardRotate }}
                  whileHover={{
                    scale: 1.025,
                    rotate: 0,
                    y: -10,
                  }}
                  transition={{ duration: 0.35 }}
                  className="group relative rounded-[2.4rem] bg-white/90 p-5 shadow-[0_25px_80px_rgba(66,56,120,0.12)] backdrop-blur-xl sm:p-8 lg:rounded-[3rem]"
                >
                  <div className="absolute -right-4 -top-4 rounded-full bg-[#ffc928] px-5 py-3 text-sm font-black text-primary shadow-lg">
                    {t("landing.enquiry.card.badge")}
                  </div>

                  <div className="rounded-[2rem] bg-[#f8f6ff] p-5 sm:rounded-[2.3rem] sm:p-6">
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
