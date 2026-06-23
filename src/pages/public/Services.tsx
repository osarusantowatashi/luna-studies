import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  FileText,
  MessagesSquare,
  ClipboardCheck,
  PackageCheck,
  School,
  Compass,
  CheckCircle2,
  Sparkles,
  Star,
  Users,
  Target,
  MessageCircle,
  CalendarDays,
  LayoutDashboard,
  PenLine,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import SeoHelmet from "@/components/SeoHelmet";

type ServiceKey =
  | "privateLessons"
  | "applicationEssay"
  | "parentInterview"
  | "mockScreening"
  | "examPackage"
  | "schoolConsulting"
  | "consultation";

const serviceKeys: ServiceKey[] = [
  "privateLessons",
  "applicationEssay",
  "parentInterview",
  "mockScreening",
  "examPackage",
  "schoolConsulting",
  "consultation",
];

const serviceMeta = {
  privateLessons: {
    icon: BookOpen,
    color: "bg-[#ffe66d]",
    accent: "from-[#fff9d8] to-white",
    rotate: "lg:-rotate-2",
    light: false,
  },
  applicationEssay: {
    icon: FileText,
    color: "bg-[#8d73ff]",
    accent: "from-[#f1edff] to-white",
    rotate: "lg:rotate-2",
    light: true,
  },
  parentInterview: {
    icon: MessagesSquare,
    color: "bg-[#b8f36c]",
    accent: "from-[#f4ffe7] to-white",
    rotate: "lg:-rotate-1",
    light: false,
  },
  mockScreening: {
    icon: ClipboardCheck,
    color: "bg-[#ff8bd2]",
    accent: "from-[#fff0f9] to-white",
    rotate: "lg:rotate-1",
    light: false,
  },
  examPackage: {
    icon: PackageCheck,
    color: "bg-[#ffc928]",
    accent: "from-[#fff7dc] to-white",
    rotate: "lg:-rotate-2",
    light: false,
  },
  schoolConsulting: {
    icon: School,
    color: "bg-[#8d73ff]",
    accent: "from-[#f2eeff] to-white",
    rotate: "lg:rotate-2",
    light: true,
  },
  consultation: {
    icon: Compass,
    color: "bg-[#b8f36c]",
    accent: "from-[#f5ffe9] to-white",
    rotate: "lg:-rotate-1",
    light: false,
  },
} satisfies Record<
  ServiceKey,
  {
    icon: LucideIcon;
    color: string;
    accent: string;
    rotate: string;
    light: boolean;
  }
>;

const heroKeys: ServiceKey[] = [
  "privateLessons",
  "applicationEssay",
  "parentInterview",
  "mockScreening",
  "schoolConsulting",
];

const processIcons: LucideIcon[] = [Target, MessageCircle, Users, Compass];
const processColors = ["bg-[#ffe66d]", "bg-[#b8f36c]", "bg-[#ff8bd2]", "bg-[#8d73ff]"];
const serviceDetailPaths: Record<ServiceKey, string> = {
  privateLessons: "/subjects",
  applicationEssay: "/services/essay-support",
  parentInterview: "/services/parent-interview",
  mockScreening: "/services/mock-interview",
  examPackage: "/services/exam-package",
  schoolConsulting: "/services/school-consulting",
  consultation: "/services/consultation",
};

const ServiceArtifactVisual = ({
  serviceKey,
  title,
  short,
}: {
  serviceKey: ServiceKey;
  title: string;
  short: string;
}) => {
  if (serviceKey === "applicationEssay") {
    return (
      <div className="relative flex h-full min-h-[248px] flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="rounded-2xl bg-white/86 px-4 py-3 shadow-[0_14px_34px_rgba(66,56,120,0.10)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8d73ff]">{short}</p>
            <p className="mt-1 font-poppins text-lg font-black text-primary">{title}</p>
          </div>
          <PenLine className="h-7 w-7 text-primary/35" />
        </div>
        <div className="mt-6 rounded-[1.4rem] bg-white/80 p-5 shadow-[0_16px_42px_rgba(66,56,120,0.10)]">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#ffc928]" />
            <span className="h-3 w-3 rounded-full bg-[#8d73ff]" />
            <span className="h-3 w-3 rounded-full bg-primary/20" />
          </div>
          <div className="space-y-3">
            <div className="h-2 rounded-full bg-primary/10" />
            <div className="h-2 w-10/12 rounded-full bg-primary/10" />
            <div className="h-2 w-8/12 rounded-full bg-[#8d73ff]/45" />
            <div className="h-2 w-11/12 rounded-full bg-primary/10" />
          </div>
        </div>
      </div>
    );
  }

  if (serviceKey === "schoolConsulting") {
    return (
      <div className="relative flex h-full min-h-[248px] flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="rounded-2xl bg-white/86 px-4 py-3 shadow-[0_14px_34px_rgba(66,56,120,0.10)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8d73ff]">{short}</p>
            <p className="mt-1 font-poppins text-lg font-black text-primary">{title}</p>
          </div>
          <School className="h-7 w-7 text-primary/35" />
        </div>
        <div className="mt-6 grid gap-3 rounded-[1.4rem] bg-white/80 p-4 shadow-[0_16px_42px_rgba(66,56,120,0.10)]">
          {["AS", "BS", "IB", "SG"].map((logo, index) => (
            <div key={logo} className="grid grid-cols-[44px_1fr_48px] items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/10 bg-[#fffdf8] font-poppins text-sm font-black text-primary">
                {logo}
              </span>
              <div className="h-2 rounded-full bg-primary/10" />
              <div className={`h-2 rounded-full ${index % 2 === 0 ? "bg-[#8d73ff]" : "bg-[#ffc928]"}`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (serviceKey === "examPackage") {
    return (
      <div className="relative flex h-full min-h-[248px] flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="rounded-2xl bg-white/86 px-4 py-3 shadow-[0_14px_34px_rgba(66,56,120,0.10)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8d73ff]">{short}</p>
            <p className="mt-1 font-poppins text-lg font-black text-primary">{title}</p>
          </div>
          <CalendarDays className="h-7 w-7 text-primary/35" />
        </div>
        <div className="mt-6 grid grid-cols-4 gap-2 rounded-[1.4rem] bg-white/80 p-4 shadow-[0_16px_42px_rgba(66,56,120,0.10)]">
          {Array.from({ length: 16 }).map((_, index) => (
            <div
              key={index}
              className={`aspect-square rounded-lg ${[2, 5, 9, 14].includes(index) ? "bg-[#8d73ff]" : [3, 10].includes(index) ? "bg-[#ffc928]" : "bg-primary/10"}`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (serviceKey === "mockScreening" || serviceKey === "parentInterview") {
    return (
      <div className="relative flex h-full min-h-[248px] flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="rounded-2xl bg-white/86 px-4 py-3 shadow-[0_14px_34px_rgba(66,56,120,0.10)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8d73ff]">{short}</p>
            <p className="mt-1 font-poppins text-lg font-black text-primary">{title}</p>
          </div>
          <ClipboardCheck className="h-7 w-7 text-primary/35" />
        </div>
        <div className="mt-6 rounded-[1.4rem] bg-white/80 p-4 shadow-[0_16px_42px_rgba(66,56,120,0.10)]">
          {["Answer clarity", "Examples", "Tone"].map((label, index) => (
            <div key={label} className="mb-4 last:mb-0">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-bold text-primary/55">{label}</p>
                <p className="text-xs font-black text-primary">{82 - index * 8}%</p>
              </div>
              <div className="h-2 rounded-full bg-[#f3efff]">
                <div className="h-2 rounded-full bg-[#8d73ff]" style={{ width: `${82 - index * 8}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (serviceKey === "consultation") {
    return (
      <div className="relative flex h-full min-h-[248px] flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="rounded-2xl bg-white/86 px-4 py-3 shadow-[0_14px_34px_rgba(66,56,120,0.10)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8d73ff]">{short}</p>
            <p className="mt-1 font-poppins text-lg font-black text-primary">{title}</p>
          </div>
          <Compass className="h-7 w-7 text-primary/35" />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 rounded-[1.4rem] bg-white/80 p-4 shadow-[0_16px_42px_rgba(66,56,120,0.10)]">
          {["Now", "Next", "Watch", "Later"].map((item) => (
            <div key={item} className="rounded-xl bg-[#fffdf8] px-3 py-4 text-center text-xs font-black text-primary/65">
              {item}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-[248px] flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="rounded-2xl bg-white/86 px-4 py-3 shadow-[0_14px_34px_rgba(66,56,120,0.10)]">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8d73ff]">{short}</p>
          <p className="mt-1 font-poppins text-lg font-black text-primary">{title}</p>
        </div>
        <LayoutDashboard className="h-7 w-7 text-primary/35" />
      </div>
      <div className="mt-6 rounded-[1.4rem] bg-white/80 p-4 shadow-[0_16px_42px_rgba(66,56,120,0.10)]">
        {[78, 64, 88].map((value, index) => (
          <div key={value} className="mb-4 last:mb-0">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-bold text-primary/55">{["Reading", "Writing", "Progress"][index]}</p>
              <p className="text-xs font-black text-primary">{value}%</p>
            </div>
            <div className="h-2 rounded-full bg-[#f3efff]">
              <div className="h-2 rounded-full bg-[#8d73ff]" style={{ width: `${value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Services = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const currentLang = location.pathname.startsWith("/zh")
    ? "zh"
    : location.pathname.startsWith("/ja")
      ? "ja"
      : "en";

  const withLang = (path: string) =>
    `/${currentLang}${path === "/" ? "" : path}`;

  const servicePath = (key: ServiceKey) => withLang(serviceDetailPaths[key]);

  const processSteps = t("services.process.steps", {
    returnObjects: true,
  }) as unknown as { title: string; text: string }[];

  const canonicalUrl = `https://www.lunastudies.com/${currentLang}/services`;

  return (
    <>
      <SeoHelmet
        title={t("services.seo.title")}
        description={t("services.seo.description")}
        canonicalUrl={canonicalUrl}
        currentLang={currentLang}
      />

      <div className="min-h-screen bg-[#fbfaff]">
        <section className="relative overflow-hidden bg-[#fbfaff] px-4 pb-16 pt-20 sm:px-6 lg:px-8 lg:pb-20 lg:pt-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,#fff1bd_0%,transparent_24%),radial-gradient(circle_at_18%_78%,#f0eaff_0%,transparent_28%),linear-gradient(180deg,#f8f6ff_0%,#fffdf8_100%)]" />

          <div className="relative z-10 mx-auto grid max-w-[1440px] items-center gap-12 pt-8 lg:grid-cols-[0.82fr_1.18fr]">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="max-w-[650px]"
            >
              <p className="mb-6 flex items-center gap-2 text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]">
                <Sparkles className="h-5 w-5" />
                {t("services.hero.label")}
              </p>

              <h1 className="font-poppins text-[2.7rem] font-black leading-[1.02] tracking-[-0.035em] text-primary sm:text-[4rem] lg:text-[5rem]">
                {t("services.hero.titleLine1")}<br />
                <span className="text-[#8d73ff]">{t("services.hero.titleLine2")}</span>
                <span className="text-[#ffc928]">.</span>
              </h1>

              <p className="mt-7 max-w-xl text-base leading-8 text-primary/70 sm:text-lg">
                {t("services.hero.description")}
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <a href="#services-showcase">
                  <Button className="h-14 rounded-full bg-primary px-8 text-base shadow-[0_18px_45px_rgba(10,36,84,0.20)]">
                    {t("services.hero.primaryButton")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>

                <Link to={withLang("/enquiry")}>
                  <Button
                    variant="outline"
                    className="h-14 rounded-full border-primary/15 bg-white/85 px-8 text-base text-primary shadow-sm backdrop-blur"
                  >
                    {t("services.hero.secondaryButton")}
                  </Button>
                </Link>
              </div>
            </motion.div>

            <div className="relative min-h-[560px]">
              <div className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-full bg-[#ffe89a]/60 blur-sm shadow-[0_0_100px_rgba(255,217,100,0.35)] sm:h-72 sm:w-72" />
              <motion.div
                animate={{ y: [0, -14, 0], rotate: [-2, 2, -2] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-[8%] top-4 z-20 hidden rounded-full bg-[#ffc928] px-5 py-3 text-sm font-black text-primary shadow-[0_14px_35px_rgba(15,23,42,0.12)] sm:block"
              >
                {t("services.intro.label")}
              </motion.div>

              <div className="relative z-30 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                {heroKeys.map((key, index) => {
                  const meta = serviceMeta[key];
                  const Icon = meta.icon;
                  const wide = index === 0 || index === 3;

                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 40, rotate: 0 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.35 }}
                      transition={{ duration: 0.55, delay: index * 0.08 }}
                      whileHover={{ y: -8, scale: 1.02, rotate: index % 2 === 0 ? -2 : 2 }}
                      className={`rounded-[2rem] border border-white bg-white/90 p-5 shadow-[0_25px_80px_rgba(66,56,120,0.14)] backdrop-blur-xl ${wide ? "sm:col-span-2 lg:col-span-3" : "lg:col-span-3"} ${meta.rotate}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${meta.color} shadow-[0_14px_35px_rgba(15,23,42,0.10)]`}>
                          <Icon className={`h-6 w-6 ${meta.light ? "text-white" : "text-primary"}`} />
                        </div>
                        <span className="rounded-full bg-[#fff6da] px-3 py-1 text-xs font-black text-[#d4a100]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <h3 className="mt-5 font-poppins text-xl font-black text-primary">
                        {t(`services.items.${key}.title`)}
                      </h3>
                      <p className="mt-2 text-sm font-semibold text-[#8d73ff]">
                        {t(`services.items.${key}.short`)}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-primary/60">
                        {t(`services.items.${key}.body`)}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#fffdf8] px-4 py-20 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#f0eaff_0%,transparent_28%),radial-gradient(circle_at_80%_70%,#fff1bd_0%,transparent_25%)]" />

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.35 }}
            transition={{ duration: 0.55 }}
            className="relative z-10 mx-auto max-w-[1180px] rounded-[2.8rem] bg-white/88 p-7 shadow-[0_25px_80px_rgba(66,56,120,0.12)] backdrop-blur-xl sm:p-10 lg:grid lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:gap-12"
          >
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]">
                {t("services.intro.label")}
              </p>
              <h2 className="mt-4 font-poppins text-4xl font-black leading-tight text-primary sm:text-5xl">
                {t("services.intro.title")}
              </h2>
            </div>

            <p className="mt-7 text-base leading-8 text-primary/65 lg:mt-0">
              {t("services.intro.description")}
            </p>
          </motion.div>
        </section>

        <section
          id="services-showcase"
          className="relative overflow-hidden bg-[#fbfaff] px-4 py-20 sm:px-6 lg:px-8"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,#f0eaff_0%,transparent_30%),radial-gradient(circle_at_82%_72%,#fff1bd_0%,transparent_28%)]" />

          <motion.div
            initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: false, amount: 0.35 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative z-10 mx-auto max-w-[1320px] overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 px-5 py-7 shadow-[0_25px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:px-7 lg:grid lg:grid-cols-[1.1fr_4.5fr] lg:px-10 lg:py-8"
          >
            <div className="relative mb-6 border-b border-primary/10 pb-7 lg:mb-0 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-10">
              <p className="text-sm font-bold text-[#7c5cff]">
                {t("services.showcase.label")}
              </p>
              <h2 className="mt-4 font-poppins text-3xl font-black leading-tight text-primary">
                {t("services.showcase.titleLine1")}<br />
                {t("services.showcase.titleLine2")}{" "}
                <span className="relative inline-block">
                  {t("services.showcase.highlight")}
                  <motion.span
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: false }}
                    transition={{ delay: 0.35, duration: 0.55 }}
                    className="absolute -bottom-1 left-0 h-3 w-full origin-left rounded-full bg-[#ffc928]/45"
                  />
                </span>
              </h2>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-6 lg:mt-0 lg:grid-cols-7 lg:gap-x-2">
              {serviceKeys.map((key, index) => {
                const meta = serviceMeta[key];
                const Icon = meta.icon;

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 22, scale: 0.92 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: false }}
                    transition={{ delay: 0.12 + index * 0.06, duration: 0.45 }}
                    whileHover={{
                      y: -8,
                      scale: 1.015,
                      rotate: [-5, 4, -4, 5, -3, 3, -2][index],
                    }}
                    className="relative flex flex-col items-center justify-start rounded-[1.5rem] bg-white/45 px-3 py-4 text-center sm:px-5 lg:min-h-[218px] lg:rounded-none lg:border-r lg:border-primary/10 lg:bg-transparent lg:last:border-r-0"
                  >
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 3 + index * 0.22, repeat: Infinity, ease: "easeInOut" }}
                      className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${meta.color} shadow-[0_14px_35px_rgba(15,23,42,0.10)]`}
                    >
                      <Icon className={`h-7 w-7 ${meta.light ? "text-white" : "text-primary"}`} />
                    </motion.div>
                    <p className="font-poppins text-base font-black text-primary">
                      {t(`services.items.${key}.title`)}
                    </p>
                    <p className="mt-2 max-w-[130px] text-sm leading-5 text-primary/65">
                      {t(`services.items.${key}.short`)}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </section>

        <section className="relative overflow-hidden bg-[#fffdf8] px-4 py-20 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,#fff1bd_0%,transparent_24%),radial-gradient(circle_at_85%_72%,#f0eaff_0%,transparent_30%)]" />
          <div className="relative z-10">
            {serviceKeys.map((key, index) => {
              const meta = serviceMeta[key];
              const Icon = meta.icon;
              const points = t(`services.items.${key}.points`, {
                returnObjects: true,
              }) as unknown as string[];
              const number = String(index + 1).padStart(2, "0");
              const visualFirst = index % 2 === 0;

              return (
                <motion.article
                  key={key}
                  initial={{ opacity: 0, y: 48 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ duration: 0.6, delay: 0.04 * index }}
                  className={`relative mx-auto grid max-w-[1280px] items-center gap-10 py-16 lg:grid-cols-[0.94fr_1.06fr] lg:gap-14 lg:py-20 ${visualFirst ? "" : "lg:grid-cols-[1.06fr_0.94fr]"}`}
                >
                  <div className="pointer-events-none absolute right-[-5%] top-[10%] h-40 w-40 rounded-full bg-[#fff1bd]/35 blur-2xl" />
                  <div className="pointer-events-none absolute bottom-[8%] left-[-6%] h-44 w-44 rounded-full bg-[#f0eaff]/45 blur-2xl" />

                    <motion.div
                      whileHover={{ y: -8, rotate: visualFirst ? -1.5 : 1.5 }}
                      transition={{ duration: 0.28 }}
                      className={`relative min-h-[300px] overflow-hidden rounded-[2.2rem] bg-gradient-to-br ${meta.accent} p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_18px_55px_rgba(66,56,120,0.10)] sm:min-h-[360px] sm:p-8 ${visualFirst ? "lg:order-1" : "lg:order-2"}`}
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(255,201,40,0.34),transparent_24%),radial-gradient(circle_at_78%_78%,rgba(141,115,255,0.18),transparent_30%)]" />
                      <div className="absolute right-8 top-8 rounded-full bg-white/75 px-5 py-2 font-poppins text-5xl font-black text-primary/10 sm:text-6xl">
                        {number}
                      </div>

                      <ServiceArtifactVisual
                        serviceKey={key}
                        title={t(`services.items.${key}.title`)}
                        short={t(`services.items.${key}.short`)}
                      />
                    </motion.div>

                    <div className={`relative px-1 sm:px-3 ${visualFirst ? "lg:order-2" : "lg:order-1"}`}>
                      <p className="font-poppins text-6xl font-black leading-none text-primary/[0.06] sm:text-7xl">
                        {number}
                      </p>
                      <p className="mt-2 text-sm font-black uppercase tracking-[0.24em] text-[#8d73ff]">
                        {t(`services.items.${key}.short`)}
                      </p>
                      <h3 className="mt-4 font-poppins text-3xl font-black leading-tight text-primary sm:text-4xl lg:text-5xl">
                        {t(`services.items.${key}.title`)}
                      </h3>
                      <p className="mt-5 max-w-2xl text-base leading-8 text-primary/65">
                        {t(`services.items.${key}.body`)}
                      </p>

                      <div className="mt-7 space-y-3">
                        {points.map((point) => (
                          <div key={point} className="flex gap-3">
                            <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#8d73ff]" />
                            <p className="text-sm font-semibold leading-6 text-primary/70">
                              {point}
                            </p>
                          </div>
                        ))}
                      </div>

                      <Link to={servicePath(key)}>
                        <Button className="mt-8 h-14 rounded-full bg-primary px-7 py-6 text-base shadow-[0_18px_45px_rgba(10,36,84,0.18)]">
                          {key === "privateLessons"
                            ? t("services.privateLessonsButton")
                            : t("services.learnMore")}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                    </div>
                </motion.article>
              );
            })}
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#fbfaff] px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#f0eaff_0%,transparent_28%),radial-gradient(circle_at_80%_60%,#fff1bd_0%,transparent_25%)]" />
          <div className="relative z-10 mx-auto max-w-[1280px]">
            <div className="mb-10 text-center lg:mb-16">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]">
                {t("services.process.label")}
              </p>
              <h2 className="mt-4 font-poppins text-4xl font-black leading-tight text-primary sm:text-5xl">
                {t("services.process.title")}
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-primary/60">
                {t("services.process.description")}
              </p>
            </div>

            <div className="relative">
              <div className="absolute left-[8%] right-[8%] top-[72px] hidden border-t-2 border-dashed border-[#8d73ff]/25 lg:block" />
              <motion.div
                animate={{ x: ["0%", "420%"], y: [0, -35, 18, -24, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-[8%] top-[43px] z-30 hidden h-12 w-12 items-center justify-center rounded-full bg-[#ffc928] text-primary shadow-[0_14px_35px_rgba(15,23,42,0.14)] lg:flex"
              >
                <Star className="h-5 w-5 fill-current" />
              </motion.div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
                {processSteps.map((step, index) => {
                  const icons = [Target, MessageCircle, Users, Compass];
                  const colors = ["bg-[#ffe66d]", "bg-[#b8f36c]", "bg-[#ff8bd2]", "bg-[#8d73ff]"];
                  const StepIcon = icons[index] || Target;

                  return (
                    <motion.div
                      key={step.title}
                      initial={{ opacity: 0, y: 50, rotate: index % 2 === 0 ? -1.5 : 1.5 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.35 }}
                      transition={{ duration: 0.55, delay: index * 0.08 }}
                      whileHover={{
                        y: -10,
                        rotate: index % 2 === 0 ? -3 : 3,
                        scale: 1.03,
                      }}
                      className="group relative rounded-[2rem] bg-white/90 p-5 shadow-[0_18px_55px_rgba(66,56,120,0.10)] backdrop-blur-xl lg:p-6"
                    >
                      <div className="mb-6 flex items-center justify-between">
                        <span className="font-poppins text-3xl font-black text-primary/15">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${colors[index]}`}>
                          <StepIcon className={`h-6 w-6 ${index === 3 ? "text-white" : "text-primary"}`} />
                        </div>
                      </div>
                      <h3 className="font-poppins text-xl font-black text-primary">
                        {step.title}
                      </h3>
                      <p className="mt-4 text-sm leading-7 text-primary/60">
                        {step.text}
                      </p>
                      <div className="mt-6 h-2 rounded-full bg-[#f3efff]">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${(index + 1) * 25}%` }}
                          viewport={{ once: false }}
                          transition={{ duration: 0.8, delay: 0.15 }}
                          className="h-2 rounded-full bg-[#8d73ff]"
                        />
                      </div>
                      <div className="pointer-events-none absolute -right-3 -top-3 rounded-full bg-[#ffc928] px-3 py-1 text-xs font-black text-primary opacity-0 shadow-lg transition group-hover:opacity-100">
                        {t("services.process.stepLabel")} {index + 1}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#fffdf8] px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#f0eaff_0%,transparent_28%),radial-gradient(circle_at_80%_75%,#fff1bd_0%,transparent_30%)]" />
          <motion.div
            animate={{ y: [70, -70, 70] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-[8%] top-[12%] h-52 w-52 rounded-full bg-[#ffe680]/70 blur-sm sm:h-72 sm:w-72"
          />

          <div className="relative z-10 mx-auto grid max-w-[1200px] items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]">
                {t("services.cta.label")}
              </p>
              <h2 className="mt-5 font-poppins text-4xl font-black leading-tight text-primary sm:text-5xl lg:text-6xl">
                {t("services.cta.title")}
              </h2>
              <p className="mt-7 max-w-xl text-lg leading-8 text-primary/65">
                {t("services.cta.description")}
              </p>
              <Link to={withLang("/enquiry")}>
                <Button className="group mt-9 h-16 rounded-full bg-primary px-9 text-base shadow-[0_20px_55px_rgba(10,36,84,0.20)]">
                  {t("services.cta.button")}
                  <motion.span
                    className="ml-3 inline-flex"
                    animate={{ x: [0, 6, 0] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.span>
                </Button>
              </Link>
            </div>

            <Link to={withLang("/enquiry")} className="block">
              <motion.div
                initial={{ rotate: -4 }}
                whileHover={{ scale: 1.025, rotate: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="group relative rounded-[2.4rem] bg-white/90 p-5 shadow-[0_25px_80px_rgba(66,56,120,0.12)] backdrop-blur-xl sm:p-8 lg:rounded-[3rem]"
              >
                <div className="absolute -right-4 -top-4 rounded-full bg-[#ffc928] px-5 py-3 text-sm font-black text-primary shadow-lg">
                  {t("services.hero.label")}
                </div>
                <div className="rounded-[2rem] bg-[#f8f6ff] p-5 sm:rounded-[2.3rem] sm:p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#8d73ff] text-white">
                      <MessageCircle className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="font-poppins text-2xl font-black text-primary">
                        {t("services.cta.title")}
                      </p>
                      <p className="text-sm text-primary/55">
                        {t("services.cta.description")}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 space-y-4">
                    {processSteps.map((step, index) => (
                      <motion.div
                        key={step.title}
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false }}
                        transition={{ delay: index * 0.12 }}
                        className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f6f2ff] text-sm font-black text-[#8d73ff]">
                          {index + 1}
                        </div>
                        <p className="text-sm font-semibold text-primary/70">
                          {step.title}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div className="mt-7 flex items-center justify-between">
                  <p className="text-sm font-bold text-primary/55">
                    {t("services.cta.button")}
                  </p>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white transition group-hover:translate-x-1">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Services;
