import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Compass,
  FileCheck,
  FileText,
  GraduationCap,
  Languages,
  LayoutDashboard,
  MapPin,
  MessagesSquare,
  PackageCheck,
  PenLine,
  School,
  Target,
  UserRoundCheck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import SeoHelmet from "@/components/SeoHelmet";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

type ServiceDetailKey =
  | "essaySupport"
  | "parentInterview"
  | "mockInterview"
  | "examPackage"
  | "schoolConsulting"
  | "consultation";

type Region = "japan" | "singapore";

type SchoolCard = {
  slug: string;
  name: string;
  location: string;
  curriculum: string;
  ageRange: string;
  note: string;
};

type DetailPage = {
  seo: { title: string; description: string };
  hero: { label: string; title: string; subtitle: string; cta: string; secondary?: string };
  heroHighlights: string[];
  unique: {
    label: string;
    title: string;
    description: string;
    items?: { title: string; text: string }[];
    beforeLabel?: string;
    before?: string;
    afterLabel?: string;
    after?: string;
    disclaimer?: string;
  };
  cards: {
    label: string;
    title: string;
    items: { title: string; text: string }[];
  };
  process: {
    label: string;
    title: string;
    steps: string[];
  };
  faqTitle: string;
  faq: { q: string; a: string }[];
  cta: { title: string; text: string; button: string };
};

const serviceSlugs: Record<ServiceDetailKey, string> = {
  essaySupport: "essay-support",
  parentInterview: "parent-interview",
  mockInterview: "mock-interview",
  examPackage: "exam-package",
  schoolConsulting: "school-consulting",
  consultation: "consultation",
};

const serviceIcons: Record<ServiceDetailKey, LucideIcon> = {
  essaySupport: FileText,
  parentInterview: MessagesSquare,
  mockInterview: ClipboardCheck,
  examPackage: PackageCheck,
  schoolConsulting: School,
  consultation: Compass,
};

const getLang = (pathname: string) =>
  pathname.startsWith("/zh") ? "zh" : pathname.startsWith("/ja") ? "ja" : "en";

const getRegionSchools = (region: Region): SchoolCard[] =>
  region === "japan"
    ? [
        {
          slug: "asij",
          name: "The American School in Japan",
          location: "Chofu, Tokyo",
          curriculum: "American curriculum, AP, High School Diploma",
          ageRange: "Early learning to Grade 12",
          note: "A long-established international day school with a Chofu campus and early learning presence in Roppongi.",
        },
        {
          slug: "british-school-in-tokyo",
          name: "British School in Tokyo",
          location: "Tokyo",
          curriculum: "British curriculum",
          ageRange: "Early years to sixth form",
          note: "A British international school pathway for families seeking UK-style learning in Tokyo.",
        },
        {
          slug: "nishimachi",
          name: "Nishimachi International School",
          location: "Tokyo",
          curriculum: "International elementary and middle years",
          ageRange: "Kindergarten to Grade 9",
          note: "Known for bilingual and multicultural learning in central Tokyo.",
        },
        {
          slug: "kist",
          name: "K. International School Tokyo",
          location: "Tokyo",
          curriculum: "IB continuum",
          ageRange: "Preschool to Grade 12",
          note: "An IB-focused international school serving families across Tokyo.",
        },
        {
          slug: "yis",
          name: "Yokohama International School",
          location: "Yokohama",
          curriculum: "IB and international curriculum",
          ageRange: "Early learning to Grade 12",
          note: "A Yokohama-based international pathway with broad academic and activity options.",
        },
        {
          slug: "st-marys",
          name: "St. Mary’s International School",
          location: "Tokyo",
          curriculum: "International / American-style pathway",
          ageRange: "Boys, K to Grade 12",
          note: "A boys’ international school with college-preparatory learning and activities.",
        },
        {
          slug: "seisen",
          name: "Seisen International School",
          location: "Tokyo",
          curriculum: "IB and international curriculum",
          ageRange: "Girls, early years to Grade 12",
          note: "A girls’ international school with academic and service-oriented learning.",
        },
        {
          slug: "phoenix-house",
          name: "Phoenix House International School",
          location: "Tokyo",
          curriculum: "British-style curriculum",
          ageRange: "Primary and middle years",
          note: "A newer international school option for families considering a British-style pathway.",
        },
      ]
    : [
        {
          slug: "uwcsea",
          name: "UWC South East Asia",
          location: "Singapore",
          curriculum: "UWC / IB pathway",
          ageRange: "Kindergarten to Grade 12",
          note: "A large international school known for academics, activities and service learning.",
        },
        {
          slug: "tanglin-trust",
          name: "Tanglin Trust School",
          location: "Singapore",
          curriculum: "British curriculum, IGCSE, A Level / IB options",
          ageRange: "Nursery to sixth form",
          note: "A long-established British international school with strong academic pathways.",
        },
        {
          slug: "dover-court",
          name: "Dover Court International School",
          location: "Singapore",
          curriculum: "British curriculum",
          ageRange: "Early years to secondary",
          note: "A British school option with learning support and international community.",
        },
        {
          slug: "sas",
          name: "Singapore American School",
          location: "Singapore",
          curriculum: "American curriculum",
          ageRange: "Preschool to Grade 12",
          note: "A major American curriculum school with broad academic and activity programs.",
        },
        {
          slug: "stamford-american",
          name: "Stamford American International School",
          location: "Singapore",
          curriculum: "American / IB pathway",
          ageRange: "Early learning to Grade 12",
          note: "An international school option with multiple curriculum pathways.",
        },
        {
          slug: "canadian-international",
          name: "Canadian International School",
          location: "Singapore",
          curriculum: "IB pathway",
          ageRange: "Nursery to Grade 12",
          note: "A Canadian-rooted international school with IB learning pathways.",
        },
        {
          slug: "australian-international",
          name: "Australian International School Singapore",
          location: "Singapore",
          curriculum: "Australian / IB pathway",
          ageRange: "Infant care to Grade 12",
          note: "An Australian international pathway with broad co-curricular options.",
        },
        {
          slug: "dulwich",
          name: "Dulwich College Singapore",
          location: "Singapore",
          curriculum: "British curriculum, IGCSE, IB Diploma",
          ageRange: "Toddler to Grade 12",
          note: "A British international school with a college-style learning pathway.",
        },
      ];

const fadeIn = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.45 },
};

const sectionClass = "px-4 py-16 sm:px-6 lg:px-8 lg:py-20";
const containerClass = "mx-auto max-w-[1180px]";

const SectionHeader = ({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description?: string;
}) => (
  <div className="mb-10 max-w-3xl">
    <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8d73ff]">
      {label}
    </p>
    <h2 className="mt-4 font-poppins text-3xl font-black leading-tight text-primary sm:text-4xl">
      {title}
    </h2>
    {description && (
      <p className="mt-4 text-base leading-8 text-primary/60">{description}</p>
    )}
  </div>
);

const includeIcons: Partial<Record<ServiceDetailKey, LucideIcon[]>> = {
  essaySupport: [PenLine, ClipboardList, FileCheck, CheckCircle2],
  parentInterview: [MessagesSquare, Languages, UserRoundCheck, ClipboardCheck],
  mockInterview: [MessagesSquare, Target, BookOpen, ClipboardCheck],
  examPackage: [BookOpen, BarChart3, ClipboardCheck, CalendarDays],
  consultation: [Compass, Languages, School, CheckCircle2],
};

const uniqueIcons: Partial<Record<ServiceDetailKey, LucideIcon[]>> = {
  parentInterview: [CalendarDays, MessagesSquare, CheckCircle2],
  mockInterview: [UserRoundCheck, MessagesSquare, BarChart3],
  examPackage: [Target, ClipboardCheck, Languages],
  consultation: [School, Target, Compass],
};

const HeroVisual = ({
  pageKey,
  page,
  icon: Icon,
}: {
  pageKey: ServiceDetailKey;
  page: DetailPage;
  icon: LucideIcon;
}) => {
  if (pageKey === "essaySupport") {
    return (
      <div className="relative overflow-hidden rounded-[1.75rem] border border-primary/10 bg-white p-6 shadow-[0_24px_60px_rgba(15,35,75,0.10)]">
        <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#fff1bd]" />
        <div className="relative flex items-center justify-between border-b border-primary/10 pb-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-primary/35">
              Draft Review
            </p>
            <p className="mt-2 font-poppins text-2xl font-black text-primary">
              Application Statement
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3efff]">
            <Icon className="h-6 w-6 text-[#8d73ff]" />
          </div>
        </div>
        <div className="relative mt-6 space-y-4">
          <div className="rounded-2xl bg-[#fbfaff] p-4">
            <div className="mb-3 h-2 w-24 rounded-full bg-primary/15" />
            <div className="space-y-2">
              <div className="h-2 rounded-full bg-primary/10" />
              <div className="h-2 w-10/12 rounded-full bg-primary/10" />
              <div className="h-2 w-8/12 rounded-full bg-primary/10" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {page.heroHighlights.slice(0, 2).map((item) => (
              <div key={item} className="rounded-2xl border border-primary/10 bg-white p-4">
                <CheckCircle2 className="h-5 w-5 text-[#8d73ff]" />
                <p className="mt-3 text-sm font-bold leading-6 text-primary">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (pageKey === "mockInterview") {
    return (
      <div className="rounded-[1.75rem] border border-primary/10 bg-white p-6 shadow-[0_24px_60px_rgba(15,35,75,0.10)]">
        <div className="flex items-center justify-between border-b border-primary/10 pb-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-primary/35">
              Interview Scorecard
            </p>
            <p className="mt-2 font-poppins text-2xl font-black text-primary">
              Practice Feedback
            </p>
          </div>
          <ClipboardCheck className="h-7 w-7 text-[#8d73ff]" />
        </div>
        <div className="mt-6 grid gap-3">
          {["Clarity", "Confidence", "Listening", "Next steps"].map((item, index) => (
            <div key={item} className="rounded-2xl border border-primary/10 bg-[#fffdf8] p-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-bold text-primary">{item}</p>
                <p className="font-poppins text-lg font-black text-primary">{86 - index * 6}%</p>
              </div>
              <div className="mt-3 h-2 rounded-full bg-[#f3efff]">
                <div className="h-2 rounded-full bg-[#8d73ff]" style={{ width: `${86 - index * 6}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (pageKey === "consultation") {
    return (
      <div className="rounded-[1.75rem] border border-primary/10 bg-white p-6 shadow-[0_24px_60px_rgba(15,35,75,0.10)]">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-primary/35">
          First Step Plan
        </p>
        <div className="mt-5 grid gap-3">
          {page.heroHighlights.map((item, index) => (
            <div key={item} className="flex items-center gap-3 rounded-2xl bg-[#fbfaff] p-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#8d73ff] text-xs font-black text-white">
                {index + 1}
              </span>
              <p className="text-sm font-bold text-primary">{item}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-2xl border border-primary/10 bg-[#fffdf8] p-4">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-black text-primary">Priority Map</p>
            <Compass className="h-5 w-5 text-[#8d73ff]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {["Urgent", "Prepare", "Review", "Later"].map((item) => (
              <div key={item} className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-primary/60">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (pageKey === "examPackage") {
    return (
      <div className="rounded-[1.75rem] border border-primary/10 bg-white p-6 shadow-[0_24px_60px_rgba(15,35,75,0.10)]">
        <div className="flex items-center justify-between">
          <p className="font-poppins text-2xl font-black text-primary">Preparation Roadmap</p>
          <CalendarDays className="h-6 w-6 text-[#8d73ff]" />
        </div>
        <div className="mt-6 space-y-3">
          {page.process.steps.map((step, index) => (
            <div key={step} className="grid grid-cols-[42px_1fr] items-center gap-3 rounded-2xl border border-primary/10 bg-[#fffdf8] p-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary font-poppins text-sm font-black text-white">
                {index + 1}
              </span>
              <div>
                <p className="font-bold text-primary">{step}</p>
                <div className="mt-2 h-1.5 rounded-full bg-[#f3efff]">
                  <div className="h-1.5 rounded-full bg-[#8d73ff]" style={{ width: `${58 + index * 8}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[1.75rem] border border-primary/10 bg-white p-6 shadow-[0_24px_60px_rgba(15,35,75,0.10)]">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f3efff]">
          <Icon className="h-5 w-5 text-[#8d73ff]" />
        </div>
        <p className="font-poppins text-xl font-black text-primary">{page.hero.title}</p>
      </div>
      <div className="mt-6 rounded-2xl border border-primary/10 bg-[#fffdf8] p-4">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-primary/35">
          Coaching Worksheet
        </p>
        <div className="mt-4 space-y-3">
          {["Question", "Answer structure", "Example", "Follow-up"].map((item, index) => (
            <div key={item} className="grid grid-cols-[28px_1fr] items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f3efff] text-xs font-black text-[#8d73ff]">
                {index + 1}
              </span>
              <div className="h-2 rounded-full bg-primary/10" />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {page.heroHighlights.map((item) => (
          <div key={item} className="flex gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#8d73ff]" />
            <p className="text-sm font-semibold leading-6 text-primary/68">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProfessionalHero = ({
  pageKey,
  page,
  icon: Icon,
  enquiryUrl,
  servicesUrl,
  advisoryLabel,
  advisoryTitle,
}: {
  pageKey: ServiceDetailKey;
  page: DetailPage;
  icon: LucideIcon;
  enquiryUrl: string;
  servicesUrl: string;
  advisoryLabel: string;
  advisoryTitle: string;
}) => (
  <section className="relative overflow-hidden bg-[#fffdf8] px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,#fff1bd_0%,transparent_24%),radial-gradient(circle_at_12%_82%,#f1edff_0%,transparent_26%)]" />
    <div className="relative z-10 mx-auto grid max-w-[1180px] items-center gap-12 lg:grid-cols-[1.02fr_0.8fr]">
      <motion.div {...fadeIn}>
        <p className="text-xs font-black uppercase tracking-[0.26em] text-[#8d73ff]">
          {page.hero.label}
        </p>
        <h1 className="mt-5 font-poppins text-4xl font-black leading-tight text-primary sm:text-6xl">
          {page.hero.title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-primary/66">
          {page.hero.subtitle}
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link to={enquiryUrl}>
            <Button className="h-13 rounded-full bg-primary px-8 text-base shadow-[0_16px_36px_rgba(10,36,84,0.16)]">
              {page.hero.cta}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          {page.hero.secondary && (
            <Link to={servicesUrl}>
              <Button
                variant="outline"
                className="h-13 rounded-full border-primary/15 bg-white px-8 text-base text-primary"
              >
                {page.hero.secondary}
              </Button>
            </Link>
          )}
        </div>
      </motion.div>

      <motion.aside
        {...fadeIn}
        className="lg:pl-4"
      >
        <HeroVisual
          pageKey={pageKey}
          page={page}
          icon={Icon}
        />
        <div className="mt-4 rounded-[1.25rem] border border-primary/10 bg-white/80 p-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-primary/35">
            {advisoryLabel}
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-primary/62">
            {advisoryTitle}
          </p>
        </div>
      </motion.aside>
    </div>
  </section>
);

const ProcessRows = ({ steps }: { steps: string[] }) => (
  <div className="divide-y divide-primary/10 rounded-[1.5rem] border border-primary/10 bg-white">
    {steps.map((step, index) => (
      <motion.div key={step} {...fadeIn} className="grid gap-4 p-5 sm:grid-cols-[92px_1fr] sm:p-6">
        <p className="font-poppins text-3xl font-black text-primary/18">
          {String(index + 1).padStart(2, "0")}
        </p>
        <p className="self-center font-semibold leading-7 text-primary">{step}</p>
      </motion.div>
    ))}
  </div>
);

const IncludesSection = ({
  page,
  pageKey,
}: {
  page: DetailPage;
  pageKey: ServiceDetailKey;
}) => {
  const icons = includeIcons[pageKey] || [];

  return (
    <section className={`${sectionClass} bg-[#fffdf8]`}>
      <div className={containerClass}>
        <SectionHeader label={page.cards.label} title={page.cards.title} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {page.cards.items.map((item, index) => {
            const CardIcon = icons[index] || CheckCircle2;

            return (
              <motion.div
                key={item.title}
                {...fadeIn}
                className="group rounded-[1.25rem] border border-primary/10 bg-white p-5 shadow-[0_12px_34px_rgba(15,35,75,0.05)] transition hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(15,35,75,0.08)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f3efff] transition group-hover:bg-[#8d73ff]">
                  <CardIcon className="h-5 w-5 text-[#8d73ff] transition group-hover:text-white" />
                </div>
                <h3 className="mt-5 font-poppins text-lg font-black leading-tight text-primary">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-primary/60">{item.text}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const UniqueServiceSection = ({
  page,
  pageKey,
  icon: Icon,
}: {
  page: DetailPage;
  pageKey: ServiceDetailKey;
  icon: LucideIcon;
}) => {
  const uniqueItems = page.unique.items || [];
  const icons = uniqueIcons[pageKey] || [];

  if (pageKey === "essaySupport") {
    return (
      <section className={sectionClass}>
        <div className={containerClass}>
          <SectionHeader
            label={page.unique.label}
            title={page.unique.title}
            description={page.unique.description}
          />
          <div className="grid overflow-hidden rounded-[1.5rem] border border-primary/10 bg-white shadow-[0_16px_45px_rgba(15,35,75,0.06)] lg:grid-cols-2">
            <div className="border-b border-primary/10 p-7 lg:border-b-0 lg:border-r">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-primary/35">
                {page.unique.beforeLabel}
              </p>
              <p className="mt-5 text-lg leading-9 text-primary/62">{page.unique.before}</p>
            </div>
            <div className="bg-[#fbfaff] p-7">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#8d73ff]">
                {page.unique.afterLabel}
              </p>
              <p className="mt-5 text-lg leading-9 text-primary">{page.unique.after}</p>
            </div>
          </div>
          {page.unique.disclaimer && (
            <p className="mt-5 max-w-4xl text-sm leading-7 text-primary/50">
              {page.unique.disclaimer}
            </p>
          )}
        </div>
      </section>
    );
  }

  if (pageKey === "examPackage") {
    return (
      <section className={sectionClass}>
        <div className={`${containerClass} grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center`}>
          <SectionHeader
            label={page.unique.label}
            title={page.unique.title}
            description={page.unique.description}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {uniqueItems.map((item, index) => {
              const CardIcon = icons[index] || Icon;
              return (
                <motion.div key={item.title} {...fadeIn} className="rounded-[1.25rem] border border-primary/10 bg-white p-5">
                  <CardIcon className="h-7 w-7 text-[#8d73ff]" />
                  <h3 className="mt-5 font-poppins text-lg font-black text-primary">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-primary/60">{item.text}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={sectionClass}>
      <div className={containerClass}>
        <SectionHeader
          label={page.unique.label}
          title={page.unique.title}
          description={page.unique.description}
        />
        <div className={`grid gap-4 ${pageKey === "consultation" ? "md:grid-cols-3" : "lg:grid-cols-3"}`}>
          {uniqueItems.map((item, index) => {
            const CardIcon = icons[index] || Icon;
            return (
              <motion.div
                key={item.title}
                {...fadeIn}
                className="rounded-[1.25rem] border border-primary/10 bg-white p-6 shadow-[0_12px_34px_rgba(15,35,75,0.05)]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f3efff]">
                    <CardIcon className="h-5 w-5 text-[#8d73ff]" />
                  </div>
                  <h3 className="font-poppins text-lg font-black text-primary">{item.title}</h3>
                </div>
                <p className="mt-4 text-sm leading-7 text-primary/62">{item.text}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const ScenarioSection = ({
  pageKey,
  ui,
}: {
  pageKey: ServiceDetailKey;
  ui: any;
}) => {
  const scenario = ui.scenarios?.[pageKey];
  if (!scenario) return null;

  return (
    <section className="px-4 py-14 sm:px-6 lg:px-8">
      <div className={`${containerClass} overflow-hidden rounded-[1.75rem] border border-primary/10 bg-white shadow-[0_18px_52px_rgba(15,35,75,0.07)] lg:grid lg:grid-cols-[0.9fr_1.1fr]`}>
        <div className="bg-[#f3efff] p-7 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8d73ff]">
            {ui.scenarioLabel}
          </p>
          <h2 className="mt-4 font-poppins text-3xl font-black leading-tight text-primary">
            {scenario.title}
          </h2>
          <p className="mt-4 leading-8 text-primary/62">{scenario.text}</p>
        </div>
        <div className="grid gap-3 p-5 sm:p-6">
          {(scenario.items as string[]).map((item, index) => (
            <div key={item} className="flex items-center gap-4 rounded-2xl border border-primary/10 bg-[#fffdf8] p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-black text-white">
                {index + 1}
              </span>
              <p className="text-sm font-semibold leading-6 text-primary/70">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ServiceProcessSection = ({
  page,
  pageKey,
}: {
  page: DetailPage;
  pageKey: ServiceDetailKey;
}) => {
  if (pageKey === "examPackage") {
    return (
      <section className={sectionClass}>
        <div className={containerClass}>
          <SectionHeader label={page.process.label} title={page.process.title} />
          <div className="relative grid gap-4 md:grid-cols-5">
            {page.process.steps.map((step, index) => (
              <motion.div key={step} {...fadeIn} className="relative rounded-[1.25rem] border border-primary/10 bg-white p-5">
                <p className="font-poppins text-3xl font-black text-primary/18">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <p className="mt-6 font-bold leading-6 text-primary">{step}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (pageKey === "consultation") {
    return (
      <section className={sectionClass}>
        <div className={`${containerClass} grid gap-8 lg:grid-cols-[0.75fr_1.25fr]`}>
          <SectionHeader label={page.process.label} title={page.process.title} />
          <ProcessRows steps={page.process.steps} />
        </div>
      </section>
    );
  }

  return (
    <section className={sectionClass}>
      <div className={containerClass}>
        <SectionHeader label={page.process.label} title={page.process.title} />
        <ProcessRows steps={page.process.steps} />
      </div>
    </section>
  );
};

const TrustSignals = ({ ui }: { ui: any }) => (
  <section className="bg-[#fffdf8] px-4 py-14 sm:px-6 lg:px-8">
    <div className={containerClass}>
      <SectionHeader label={ui.trustLabel} title={ui.trustTitle} />
      <div className="grid gap-3 md:grid-cols-5">
        {[
          Languages,
          School,
          MessagesSquare,
          Users,
          LayoutDashboard,
        ].map((SignalIcon, index) => (
          <div key={ui.trustSignals[index]} className="rounded-[1rem] border border-primary/10 bg-white p-4">
            <SignalIcon className="h-5 w-5 text-[#8d73ff]" />
            <p className="mt-4 text-sm font-bold leading-6 text-primary/70">
              {ui.trustSignals[index]}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const DeliverablesSection = ({
  pageKey,
  ui,
}: {
  pageKey: ServiceDetailKey;
  ui: any;
}) => {
  const deliverables = ui.deliverables?.[pageKey] || ui.deliverables?.consultation || [];
  const icons = [FileText, ClipboardCheck, CalendarDays, LayoutDashboard, School];

  return (
    <section className={sectionClass}>
      <div className={containerClass}>
        <SectionHeader label={ui.deliverablesLabel} title={ui.deliverablesTitle} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {deliverables.map((item: { title: string; text: string }, index: number) => {
            const DeliverableIcon = icons[index % icons.length];

            return (
              <motion.div
                key={item.title}
                {...fadeIn}
                className="rounded-[1.25rem] border border-primary/10 bg-white p-5 shadow-[0_12px_34px_rgba(15,35,75,0.05)]"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f3efff]">
                    <DeliverableIcon className="h-5 w-5 text-[#8d73ff]" />
                  </div>
                  <div className="h-2 flex-1 rounded-full bg-primary/10" />
                </div>
                <h3 className="mt-5 font-poppins text-lg font-black text-primary">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-primary/62">{item.text}</p>
                <div className="mt-5 space-y-2 rounded-2xl bg-[#fffdf8] p-3">
                  <div className="h-2 rounded-full bg-primary/10" />
                  <div className="h-2 w-10/12 rounded-full bg-primary/10" />
                  <div className="h-2 w-7/12 rounded-full bg-[#8d73ff]/40" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

type Testimonial = {
  quote: string;
  byline: string;
  detail: string;
};

const serviceTestimonials: Record<ServiceDetailKey, Testimonial[]> = {
  essaySupport: [
    {
      quote:
        "We had the ideas, but the essay felt scattered. Luna helped us keep our child’s voice while making the structure much clearer.",
      byline: "Parent of international school applicant",
      detail: "Application essay",
    },
    {
      quote:
        "最初は『何を書けばいいか分からない』と言っていましたが、例を一緒に整理してから、自分で直せる部分が増えました。",
      byline: "Grade 7 parent, Tokyo",
      detail: "Student statement",
    },
    {
      quote:
        "文书不是被改成很漂亮的英文，而是孩子原本想说的话终于变清楚了。",
      byline: "Parent, Singapore",
      detail: "Application review",
    },
  ],
  parentInterview: [
    {
      quote:
        "面接で何を聞かれるかだけでなく、家族としてどう伝えるかを整理できました。",
      byline: "Tokyo parent",
      detail: "Parent interview",
    },
    {
      quote:
        "We stopped trying to memorise answers. The practice helped us explain our child with small, real examples from home.",
      byline: "Singapore family",
      detail: "Admissions coaching",
    },
    {
      quote:
        "之前我们回答得太像简历。练习后，终于能讲出孩子在学校和家里的真实状态。",
      byline: "Parent of Grade 4 applicant",
      detail: "Family interview prep",
    },
  ],
  mockInterview: [
    {
      quote:
        "一开始孩子回答很短，练习几次后，终于能用完整句子解释自己的想法。",
      byline: "小学申请家庭",
      detail: "Mock interview",
    },
    {
      quote:
        "The first session was awkward, but by the second practice my son knew how to pause, think, and answer without rushing.",
      byline: "Parent, Tokyo",
      detail: "Student screening",
    },
    {
      quote:
        "I liked that we practised normal questions, not just perfect answers. It felt closer to a real interview.",
      byline: "Grade 6 student",
      detail: "International school applicant",
    },
  ],
  examPackage: [
    {
      quote:
        "The schedule made the preparation less stressful. We knew what to focus on each week.",
      byline: "Grade 6 parent",
      detail: "Entrance exam package",
    },
    {
      quote:
        "MAP の練習だけでなく、出願日程と面接準備も一緒に見えたので、家庭での準備が進めやすくなりました。",
      byline: "Parent, Japan",
      detail: "Assessment planning",
    },
    {
      quote:
        "孩子以前只知道刷题，现在会看错题原因，也知道下一周要补什么。",
      byline: "Parent of middle school student",
      detail: "Study plan",
    },
  ],
  schoolConsulting: [
    {
      quote:
        "We were comparing several schools and felt lost. The session helped us understand which environment would actually fit our child.",
      byline: "Singapore family",
      detail: "School consulting",
    },
    {
      quote:
        "学校名は知っていても、何を基準に比べるべきか分かっていませんでした。比較表があると家族で話しやすかったです。",
      byline: "Parent relocating to Tokyo",
      detail: "School comparison",
    },
    {
      quote:
        "我们最后没有只看排名，而是重新想了通勤、语言支持和孩子性格，这点很有帮助。",
      byline: "International school family",
      detail: "Admissions planning",
    },
  ],
  consultation: [
    {
      quote:
        "We came in with too many questions. By the end, we knew what was urgent, what could wait, and who should help next.",
      byline: "Parent, Tokyo",
      detail: "Education consultation",
    },
    {
      quote:
        "相談後、家庭でやることとレッスンで任せることを分けられたのが良かったです。",
      byline: "Luna family",
      detail: "Planning session",
    },
    {
      quote:
        "不是马上推课程，而是先帮我们判断孩子现在最需要解决什么。",
      byline: "Parent of two students",
      detail: "First-step plan",
    },
  ],
};

const TestimonialsSection = ({
  pageKey,
  ui,
}: {
  pageKey: ServiceDetailKey;
  ui: any;
}) => {
  const testimonials = serviceTestimonials[pageKey];
  const [featured, ...secondary] = testimonials;

  return (
    <section className="bg-[#fffdf8] px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
      <div className={containerClass}>
        <SectionHeader label={ui.testimonialsLabel} title={ui.testimonialsTitle} />
        <div className="flex snap-x gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-[1.15fr_0.85fr] md:overflow-visible md:pb-0">
          <motion.figure
            {...fadeIn}
            className="min-w-[82%] snap-start rounded-[1.25rem] border border-[#8d73ff]/18 bg-white p-6 shadow-[0_18px_44px_rgba(15,35,75,0.07)] sm:min-w-[64%] md:min-w-0 md:p-7"
          >
            <div className="flex items-center justify-between gap-4">
              <MessagesSquare className="h-6 w-6 text-[#8d73ff]" />
              <span className="rounded-full bg-[#fff6da] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-primary/55">
                {featured.detail}
              </span>
            </div>
            <blockquote className="mt-6 text-[17px] leading-8 text-primary/76">
              “{featured.quote}”
            </blockquote>
            <figcaption className="mt-6 border-t border-primary/10 pt-4">
              <p className="text-sm font-black text-primary">{featured.byline}</p>
            </figcaption>
          </motion.figure>

          <div className="flex min-w-[82%] snap-start flex-col gap-4 sm:min-w-[64%] md:min-w-0">
            {secondary.map((item, index) => (
              <motion.figure
                key={`${item.byline}-${item.quote}`}
                {...fadeIn}
                className={`rounded-[1.1rem] border bg-white p-5 shadow-[0_10px_28px_rgba(15,35,75,0.05)] ${
                  index === 0 ? "border-primary/10" : "border-[#ffc928]/35"
                }`}
              >
                <blockquote className="text-sm leading-7 text-primary/70">
                  “{item.quote}”
                </blockquote>
                <figcaption className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-primary/10 pt-3">
                  <p className="text-sm font-bold text-primary">{item.byline}</p>
                  <p className="text-xs font-semibold text-primary/40">{item.detail}</p>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export const ServiceDetailPage = ({ pageKey }: { pageKey: ServiceDetailKey }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const currentLang = getLang(location.pathname);
  const withLang = (path: string) => `/${currentLang}${path === "/" ? "" : path}`;
  const page = t(`services.detailPages.${pageKey}`, { returnObjects: true }) as DetailPage;
  const ui = t("services.detailUi", { returnObjects: true }) as any;
  const Icon = serviceIcons[pageKey];
  const slug = serviceSlugs[pageKey];
  const enquiryUrl = `${withLang("/enquiry")}?service=${encodeURIComponent(page.hero.title)}#enquiry-form`;

  return (
    <>
      <SeoHelmet
        title={page.seo.title}
        description={page.seo.description}
        canonicalUrl={`https://www.lunastudies.com/${currentLang}/services/${slug}`}
        currentLang={currentLang}
      />

      <main className="min-h-screen bg-[#fbfaff]">
        <ProfessionalHero
          pageKey={pageKey}
          page={page}
          icon={Icon}
          enquiryUrl={enquiryUrl}
          servicesUrl={withLang("/services")}
          advisoryLabel={ui.advisoryLabel}
          advisoryTitle={ui.advisoryTitle}
        />

        <UniqueServiceSection page={page} pageKey={pageKey} icon={Icon} />
        <IncludesSection page={page} pageKey={pageKey} />
        <ScenarioSection pageKey={pageKey} ui={ui} />
        <ServiceProcessSection page={page} pageKey={pageKey} />
        <TrustSignals ui={ui} />
        <DeliverablesSection pageKey={pageKey} ui={ui} />
        <TestimonialsSection pageKey={pageKey} ui={ui} />
      </main>
      <Footer />
    </>
  );
};

export const SchoolConsultingPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const currentLang = getLang(location.pathname);
  const withLang = (path: string) => `/${currentLang}${path === "/" ? "" : path}`;
  const page = t("services.detailPages.schoolConsulting", { returnObjects: true }) as any;
  const ui = t("services.detailUi", { returnObjects: true }) as any;
  const enquiryUrl = `${withLang("/enquiry")}?service=${encodeURIComponent(page.hero.title)}#enquiry-form`;
  const featuredSchools = [
    ...getRegionSchools("japan").slice(0, 4).map((school) => ({ ...school, region: "japan" as Region })),
    ...getRegionSchools("singapore").slice(0, 4).map((school) => ({ ...school, region: "singapore" as Region })),
  ];

  return (
    <>
      <SeoHelmet
        title={page.seo.title}
        description={page.seo.description}
        canonicalUrl={`https://www.lunastudies.com/${currentLang}/services/school-consulting`}
        currentLang={currentLang}
      />
      <main className="min-h-screen bg-[#f8fafc]">
        <section className="relative overflow-hidden border-b border-slate-200 bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,#fff1bd_0%,transparent_24%),radial-gradient(circle_at_15%_80%,#f3efff_0%,transparent_24%)]" />
          <div className="relative z-10 mx-auto grid max-w-[1180px] items-center gap-10 lg:grid-cols-[1fr_0.82fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.26em] text-[#8d73ff]">
                {page.hero.label}
              </p>
              <h1 className="mt-5 font-poppins text-4xl font-black leading-tight text-primary sm:text-6xl">
                {page.hero.title}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-primary/66">
                {page.hero.subtitle}
              </p>
              <Link to={enquiryUrl}>
                <Button className="mt-8 h-13 rounded-full bg-primary px-8 text-base">
                  {page.hero.cta}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="rounded-[1.75rem] border border-primary/10 bg-white p-6 shadow-[0_24px_60px_rgba(15,35,75,0.10)]">
              <div className="flex items-center justify-between border-b border-primary/10 pb-5">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-primary/35">
                    School Fit Matrix
                  </p>
                  <p className="mt-2 font-poppins text-2xl font-black text-primary">
                    Compare pathways clearly
                  </p>
                </div>
                <School className="h-7 w-7 text-[#8d73ff]" />
              </div>
              <div className="mt-5 overflow-hidden rounded-2xl border border-primary/10">
                {["Curriculum", "Admissions", "Language", "Commute"].map((row, index) => (
                  <div key={row} className="grid grid-cols-[0.85fr_1fr_1fr] border-b border-primary/10 last:border-b-0">
                    <p className="bg-[#fbfaff] px-3 py-3 text-xs font-black text-primary/60">{row}</p>
                    <div className="px-3 py-3">
                      <div className={`h-2 rounded-full ${index % 2 === 0 ? "w-10/12 bg-[#8d73ff]" : "w-8/12 bg-[#ffc928]"}`} />
                    </div>
                    <div className="px-3 py-3">
                      <div className={`h-2 rounded-full ${index % 2 === 0 ? "w-8/12 bg-[#ffc928]" : "w-11/12 bg-[#8d73ff]"}`} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-4 gap-2">
                {["01", "02", "03", "04"].map((step) => (
                  <div key={step} className="rounded-xl bg-[#fffdf8] px-3 py-3 text-center font-poppins text-sm font-black text-primary">
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="schools" className={sectionClass}>
          <div className={containerClass}>
            <SectionHeader label={page.regions.label} title={ui.internationalSchoolsTitle} description={page.regions.text} />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {featuredSchools.map((school) => {
                const display = getSchoolDisplay(school, ui);

                return (
                  <Link key={`${school.region}-${school.slug}`} to={withLang(`/services/school-consulting/${school.region}/${school.slug}`)}>
                    <article className="flex h-full min-h-[220px] flex-col rounded-[1.1rem] border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:border-[#8d73ff]/25 hover:shadow-[0_18px_42px_rgba(15,23,42,0.08)]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-slate-200 bg-[#fffdf8] font-poppins text-lg font-black text-primary">
                          {getSchoolInitials(school.name)}
                        </div>
                        <span className="rounded-full bg-[#f3efff] px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-[#8d73ff]">
                          {school.region}
                        </span>
                      </div>
                      <h3 className="mt-5 font-poppins text-lg font-black leading-tight text-primary">
                        {school.name}
                      </h3>
                      <p className="mt-2 text-sm font-bold text-primary/50">{school.location}</p>
                      <p className="mt-4 text-sm leading-6 text-primary/58">{display.curriculum}</p>
                    </article>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className={`${sectionClass} bg-[#fffdf8]`}>
          <div className={containerClass}>
            <SectionHeader label={page.regions.label} title={page.regions.title} />
            <div className="grid gap-5 md:grid-cols-2">
              {(["japan", "singapore"] as Region[]).map((region) => (
                <Link key={region} to={withLang(`/services/school-consulting/${region}`)}>
                  <article className="min-h-[230px] rounded-[1rem] border border-slate-200 bg-white p-7 shadow-[0_10px_28px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(15,23,42,0.08)]">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-[#fffdf8]">
                      <MapPin className="h-5 w-5 text-[#8d73ff]" />
                    </div>
                    <h2 className="mt-5 font-poppins text-2xl font-black text-primary">
                      {page.regions[region]}
                    </h2>
                    <p className="mt-3 leading-7 text-primary/62">{page.regions.text}</p>
                    <p className="mt-6 text-sm font-black text-primary">
                      {ui.viewRegionGuide}
                    </p>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className={`${sectionClass} bg-[#fffdf8]`}>
          <div className={containerClass}>
            <SectionHeader label={page.cards.label} title={page.cards.title} />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {page.cards.items.map((item: { title: string; text: string }) => (
                <div key={item.title} className="rounded-[1rem] border border-slate-200 bg-white p-6">
                  <h3 className="font-poppins text-xl font-black text-primary">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-primary/62">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <div className={containerClass}>
            <SectionHeader label={page.process.label} title={page.process.title} />
            <ProcessRows steps={page.process.steps} />
          </div>
        </section>

        <section className={`${sectionClass} bg-[#fffdf8]`}>
          <div className={containerClass}>
            <SectionHeader label={ui.howLunaHelps} title={ui.schoolDecisionSupport} />
            <div className="grid gap-4 md:grid-cols-3">
              {(ui.schoolHelpItems as string[]).map((item) => (
                <div key={item} className="rounded-[1rem] border border-slate-200 bg-white p-6">
                  <h3 className="font-poppins text-xl font-black text-primary">{item}</h3>
                  <p className="mt-3 text-sm leading-7 text-primary/62">
                    {ui.noGuaranteeText}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <TrustSignals ui={ui} />
        <DeliverablesSection pageKey="schoolConsulting" ui={ui} />
        <TestimonialsSection pageKey="schoolConsulting" ui={ui} />
      </main>
      <Footer />
    </>
  );
};

const getSchoolInitials = (name: string) =>
  name
    .replace(/^The\s+/i, "")
    .split(/\s+/)
    .filter((word) => /^[A-Za-z]/.test(word))
    .slice(0, 3)
    .map((word) => word[0].toUpperCase())
    .join("");

const getSchoolStats = (school: SchoolCard, ui: any) => {
  if (school.slug === "asij") return { students: ui.asijStudentCount, curriculum: "American" };
  if (school.slug === "uwcsea") return { students: ui.largeK12Community, curriculum: "UWC / IB" };
  if (school.slug === "sas") return { students: ui.largeK12Community, curriculum: "American" };
  if (school.slug === "tanglin-trust") return { students: ui.nurseryToSixthForm, curriculum: "British" };
  const display = getSchoolDisplay(school, ui);
  return { students: display.ageRange, curriculum: display.curriculum.split(",")[0] };
};

const getSchoolDisplay = (school: SchoolCard, ui: any) => {
  const display = ui.schoolDirectory?.[school.slug] || {};

  return {
    curriculum: display.curriculum || school.curriculum,
    ageRange: display.ageRange || school.ageRange,
    note: display.note || school.note,
  };
};

export const SchoolRegionPage = ({ region }: { region: Region }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const currentLang = getLang(location.pathname);
  const withLang = (path: string) => `/${currentLang}${path === "/" ? "" : path}`;
  const copy = t(`services.schools.${region}`, { returnObjects: true }) as any;
  const ui = t("services.detailUi", { returnObjects: true }) as any;
  const schools = getRegionSchools(region);

  return (
    <>
      <SeoHelmet
        title={copy.seo.title}
        description={copy.seo.description}
        canonicalUrl={`https://www.lunastudies.com/${currentLang}/services/school-consulting/${region}`}
        currentLang={currentLang}
      />
      <main className="min-h-screen bg-[#f8fafc]">
        <section className="border-b border-slate-200 bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className={containerClass}>
            <Link to={withLang("/services/school-consulting")} className="text-sm font-bold text-[#8d73ff]">
              {copy.back}
            </Link>
            <h1 className="mt-6 font-poppins text-4xl font-black leading-tight text-primary sm:text-6xl">
              {copy.title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-primary/66">{copy.intro}</p>
            <div className="mt-8 flex flex-wrap gap-2">
              {(ui.directoryFilters as string[]).map((filter) => (
                <span
                  key={filter}
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600"
                >
                  {filter}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <div className={`${containerClass} grid gap-5 md:grid-cols-2 lg:grid-cols-3`}>
            {schools.map((school) => (
              (() => {
                const display = getSchoolDisplay(school, ui);
                const stats = getSchoolStats(school, ui);

                return (
                  <Link key={school.slug} to={withLang(`/services/school-consulting/${region}/${school.slug}`)}>
                    <article className="flex h-full min-h-[300px] flex-col rounded-[1rem] border border-slate-200 bg-white p-6 shadow-[0_10px_28px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(15,23,42,0.08)]">
                      <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-slate-200 bg-[#fffdf8] font-poppins text-xl font-black text-primary">
                        {getSchoolInitials(school.name)}
                      </div>
                      <div>
                        <h2 className="mt-5 font-poppins text-xl font-black leading-tight text-primary">{school.name}</h2>
                        <p className="mt-3 text-sm font-bold text-[#8d73ff]">{school.location}</p>
                      </div>
                      <div className="mt-5 space-y-2 border-t border-slate-100 pt-5">
                        <p className="text-sm font-semibold text-primary/70">{stats.curriculum}</p>
                        <p className="text-sm text-primary/50">{stats.students}</p>
                        <p className="text-sm leading-6 text-primary/58">{display.note}</p>
                      </div>
                      <p className="mt-auto pt-6 text-sm font-black text-primary">
                        {ui.viewProfile} →
                      </p>
                    </article>
                  </Link>
                );
              })()
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

const getSchoolDetail = (region: Region, slug: string) => {
  const schools = getRegionSchools(region);
  return schools.find((school) => school.slug === slug) || schools[0];
};

export const SchoolDetailRouter = () => {
  const { schoolSlug = "" } = useParams();
  const region: Region = getRegionSchools("singapore").some((school) => school.slug === schoolSlug)
    ? "singapore"
    : "japan";

  return <SchoolDetailPage region={region} />;
};

export const SchoolDetailPage = ({ region }: { region: Region }) => {
  const { t } = useTranslation();
  const { schoolSlug = "" } = useParams();
  const location = useLocation();
  const currentLang = getLang(location.pathname);
  const withLang = (path: string) => `/${currentLang}${path === "/" ? "" : path}`;
  const school = getSchoolDetail(region, schoolSlug);
  const isAsij = region === "japan" && school.slug === "asij";
  const copy = t("services.schools.detail", { returnObjects: true }) as any;
  const asij = t("services.schools.asij", { returnObjects: true }) as any;
  const ui = t("services.detailUi", { returnObjects: true }) as any;
  const schoolDisplay = getSchoolDisplay(school, ui);
  const enquiryUrl = `${withLang("/enquiry")}?service=${encodeURIComponent(`${ui.schoolConsultingPrefix}: ${school.name}`)}#enquiry-form`;
  const related = getRegionSchools(region).filter((item) => item.slug !== school.slug).slice(0, 3);
  const facts = isAsij
    ? asij.facts
    : [
        [ui.location, school.location],
        [ui.curriculum, schoolDisplay.curriculum],
        [ui.ageRange, schoolDisplay.ageRange],
        [ui.boarding, copy.noBoarding],
      ];
  const admissionsRows = isAsij
    ? [
        [ui.highSchool, ui.asijAdmissionDocsHigh, ui.likelyRequired, ui.mayBeRequested, ui.confirmCurrentRequirements],
        [ui.middleSchool, ui.asijAdmissionDocsMiddle, ui.likelyRequired, ui.mayBeRequested, ui.prepareDocumentsEarly],
        [ui.elementary, ui.asijAdmissionDocsElementary, ui.mayBeRequested, ui.mayBeRequested, ui.requirementsVaryByGrade],
        [ui.kindergarten, ui.asijAdmissionDocsKindergarten, ui.mayBeRequested, ui.ageAppropriateReview, ui.confirmCurrentRequirements],
      ]
    : [[ui.allLevels, ui.requirementsVary, ui.varies, ui.varies, ui.contactLunaPlanning]];
  const curriculumSections = isAsij
    ? [
        {
          title: ui.elementaryPrimary,
          body: ui.asijCurriculumElementary,
        },
        {
          title: ui.middleSchool,
          body: ui.asijCurriculumMiddle,
        },
        {
          title: ui.highSchool,
          body: ui.asijCurriculumHigh,
        },
      ]
    : [
        {
          title: ui.curriculumOverview,
          body: ui.curriculumOverviewText,
        },
      ];
  const communitySections = [
    {
      title: ui.leadership,
      items: isAsij
        ? ui.asijLeadershipItems
        : ui.genericLeadershipItems,
    },
    {
      title: ui.artsActivities,
      items: isAsij
        ? ui.asijArtsItems
        : ui.genericArtsItems,
    },
    {
      title: ui.sports,
      items: isAsij
        ? ui.asijSportsItems
        : ui.genericSportsItems,
    },
  ];
  const outcomeItems = isAsij
    ? [
        [ui.universityPathways, ui.asijUniversityPathways],
        [ui.apCourses, ui.asijApCourses],
        [ui.alumniNetwork, ui.asijAlumniNetwork],
        [ui.diploma, ui.asijDiploma],
      ]
    : [
        [ui.universityPathways, ui.pathwaysVary],
        [ui.curriculumOutcomes, schoolDisplay.curriculum],
        [ui.admissionsFit, ui.admissionsFitText],
        [ui.nextSteps, ui.nextStepsText],
      ];
  return (
    <>
      <SeoHelmet
        title={`${school.name} | Luna Education`}
        description={isAsij ? asij.seo.description : copy.placeholderSeo}
        canonicalUrl={`https://www.lunastudies.com/${currentLang}/services/school-consulting/${region}/${school.slug}`}
        currentLang={currentLang}
      />
      <main className="min-h-screen bg-[#f8fafc]">
        <section className="border-b border-slate-200 bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className={containerClass}>
            <Link to={withLang(`/services/school-consulting/${region}`)} className="text-sm font-bold text-[#8d73ff]">
              {copy.back}
            </Link>
            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
              <div>
                <h1 className="font-poppins text-4xl font-black leading-tight text-primary sm:text-6xl">
                  {school.name}
                </h1>
                <p className="mt-4 text-lg text-primary/60">{school.location}</p>
                <p className="mt-3 text-base font-semibold text-primary/55">{getSchoolStats(school, ui).students}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {schoolDisplay.curriculum.split(",").map((tag) => (
                    <span key={tag} className="rounded-full border border-primary/10 bg-white px-4 py-2 text-xs font-bold text-primary/70">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
                <Link to={enquiryUrl}>
                  <Button className="mt-8 h-13 rounded-full bg-primary px-8">
                    {copy.cta}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <div className="rounded-[1rem] border border-slate-200 bg-slate-50 p-6">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl border border-slate-200 bg-white font-poppins text-xl font-black text-primary">
                  {getSchoolInitials(school.name)}
                </div>
                <h2 className="font-poppins text-2xl font-black text-primary">{copy.keyFacts}</h2>
                <div className="mt-5 divide-y divide-primary/10">
                  {facts.map(([label, value]: string[]) => (
                    <div key={label} className="py-3">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-primary/35">{label}</p>
                      <p className="mt-1 font-semibold text-primary">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <div className={`${containerClass} grid gap-8 lg:grid-cols-[0.85fr_1.15fr]`}>
            <div>
              <SectionHeader label={copy.about} title={isAsij ? asij.profileTitle : school.name} />
            </div>
            <div className="space-y-5">
              {(isAsij ? asij.about : [schoolDisplay.note, copy.placeholderBio]).map((text: string) => (
                <p key={text} className="text-base leading-8 text-primary/66">{text}</p>
              ))}
            </div>
          </div>
        </section>

        <section className={`${sectionClass} bg-[#fffdf8]`}>
          <div className={containerClass}>
            <SectionHeader label={ui.admissions} title={ui.admissionsTitle} />
            <div className="overflow-hidden rounded-[1.5rem] border border-primary/10 bg-white">
              <div className="hidden grid-cols-[0.7fr_1.2fr_0.75fr_0.75fr_1fr] bg-[#fbfaff] px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-primary/45 md:grid">
                <p>{ui.gradeLevel}</p>
                <p>{ui.requiredDocuments}</p>
                <p>{ui.interview}</p>
                <p>{ui.assessment}</p>
                <p>{ui.notes}</p>
              </div>
              {admissionsRows.map(([level, docs, interview, assessment, notes]) => (
                <div key={level} className="grid gap-3 border-t border-primary/10 px-5 py-5 md:grid-cols-[0.7fr_1.2fr_0.75fr_0.75fr_1fr]">
                  <p className="font-bold text-primary">{level}</p>
                  <p className="text-sm leading-7 text-primary/62">{docs}</p>
                  <p className="text-sm leading-7 text-primary/62">{interview}</p>
                  <p className="text-sm leading-7 text-primary/62">{assessment}</p>
                  <p className="text-sm leading-7 text-primary/62">{notes}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <div className={containerClass}>
            <SectionHeader label={ui.curriculum} title={ui.curriculumTitle} />
            <div className="divide-y divide-slate-200 overflow-hidden rounded-[1rem] border border-slate-200 bg-white">
              {curriculumSections.map((section) => (
                <details key={section.title} className="group">
                  <summary className="cursor-pointer list-none px-6 py-5 font-poppins text-xl font-black text-primary">
                    {section.title}
                  </summary>
                  <p className="border-t border-slate-100 px-6 pb-6 pt-1 leading-8 text-primary/62">
                    {section.body}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className={`${sectionClass} bg-[#fffdf8]`}>
          <div className={containerClass}>
            <SectionHeader label={ui.studentLife} title={ui.studentLifeTitle} />
            <div className="grid gap-5 md:grid-cols-3">
              {communitySections.map((section) => (
                <div key={section.title} className="rounded-[1rem] border border-slate-200 bg-white p-6">
                  <h3 className="font-poppins text-xl font-black text-primary">{section.title}</h3>
                  <ul className="mt-4 space-y-3">
                    {section.items.map((item) => (
                      <li key={item} className="flex gap-2 text-sm leading-6 text-primary/62">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#8d73ff]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <div className={containerClass}>
            <SectionHeader label={ui.outcomes} title={ui.outcomesTitle} />
            <div className="grid gap-4 md:grid-cols-4">
              {outcomeItems.map(([label, value]) => (
                <div key={label} className="rounded-[1rem] border border-slate-200 bg-white p-5">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-primary/35">{label}</p>
                  <p className="mt-3 font-semibold leading-7 text-primary">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {!isAsij && (
          <section className="bg-[#fffdf8] px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
            <div className={`${containerClass} rounded-[1rem] border border-slate-200 bg-white p-8`}>
              <GraduationCap className="h-10 w-10 text-[#8d73ff]" />
              <h2 className="mt-5 font-poppins text-3xl font-black text-primary">{copy.moreSoonTitle}</h2>
              <p className="mt-4 max-w-3xl leading-8 text-primary/62">{copy.moreSoonText}</p>
            </div>
          </section>
        )}

        <section className={`${sectionClass} bg-[#fffdf8]`}>
          <div className={containerClass}>
            <SectionHeader label={ui.howLunaCanHelp} title={ui.schoolHelpTitle} />
            <div className="grid gap-4 md:grid-cols-3">
              {(ui.schoolHelpItems as string[]).map((item) => (
                <div key={item} className="rounded-[1rem] border border-slate-200 bg-white p-6">
                  <h3 className="font-poppins text-xl font-black text-primary">{item}</h3>
                  <p className="mt-3 text-sm leading-7 text-primary/62">
                    {ui.schoolHelpText}
                  </p>
                </div>
              ))}
            </div>
            <Link to={enquiryUrl}>
              <Button className="mt-8 h-13 rounded-full bg-primary px-8">
                {copy.cta}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        <section className={sectionClass}>
          <div className={containerClass}>
            <SectionHeader label={copy.related} title={copy.relatedTitle} />
            <div className="grid gap-4 md:grid-cols-3">
              {related.map((item) => (
                <Link key={item.slug} to={withLang(`/services/school-consulting/${region}/${item.slug}`)}>
                  <div className="rounded-[1.25rem] border border-primary/10 bg-white p-5 transition hover:bg-[#fffdf8]">
                    <h3 className="font-bold text-primary">{item.name}</h3>
                    <p className="mt-2 text-sm text-primary/55">{item.location}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};
