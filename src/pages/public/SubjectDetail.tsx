

import { Link, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import {
    ArrowRight,
    CheckCircle2,
    Sparkles,
    Target,
    ClipboardList,
    Users,
    BarChart3,
    BookOpen,
} from "lucide-react";
import SeoHelmet from "@/components/SeoHelmet";

const programMap: Record<string, string> = {
    "map-preparation": "map",
    "wida-preparation": "wida",
    "cat4-preparation": "cat4",
    "aeis-preparation": "aeis",
    "toefl-preparation": "toefl",
    "ielts-preparation": "ielts",
    "jlpt-preparation": "jlpt",
    "hsk-preparation": "hsk",
    "english-foundation": "foundation",
    "speaking-writing": "speaking",
    "math-support": "math",
    "japanese-lessons": "japanese",
    "mandarin-lessons": "mandarin",
};

type ProgramContent = {
    badge: string;
    heroLine: string;
    cover: string[];
    lunaHelps: string[];
    outcomes: string[];
    faq: { q: string; a: string }[];
};

export default function SubjectDetail() {
    const { slug } = useParams();
    const { t } = useTranslation();
    const location = useLocation();

    const currentLang = location.pathname.startsWith("/zh")
        ? "zh"
        : location.pathname.startsWith("/ja")
            ? "ja"
            : "en";

    const withLang = (path: string) =>
        `/${currentLang}${path === "/" ? "" : path}`;

    const key = programMap[slug || ""];
    const content = key
        ? (t(`subjects.items.${key}.detailPage`, {
            returnObjects: true,
        }) as ProgramContent)
        : null;

    if (!key || !content) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white px-6 text-center">
                <div>
                    <h1 className="text-3xl font-black text-primary">
                        {t("subjectDetail.notFoundTitle")}
                    </h1>

                    <Link to={withLang("/subjects")}>
                        <Button className="mt-6 rounded-2xl">
                            {t("subjectDetail.backToProgramsButton")}
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const title = t(`subjects.items.${key}.title`);
    const body = t(`subjects.items.${key}.body`);
    const details = t(`subjects.items.${key}.details`);
    const suitableFor = t(`subjects.items.${key}.suitableFor`);

    const baseUrl = "https://www.lunastudies.com";
    const canonicalUrl = `${baseUrl}/${currentLang}/subjects/${slug}`;

    const seoTitle = `${title} | Luna Studies`;

    const seoDescription =
        typeof details === "string"
            ? details.slice(0, 155)
            : `${title} tutoring and preparation support with Luna Studies.`;
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
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,#fff1bd_0%,transparent_28%),radial-gradient(circle_at_20%_70%,#f0eaff_0%,transparent_30%)]" />

                    <div className="relative z-10 mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 28 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div>
                                <Link
                                    to={withLang("/subjects")}
                                    className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-primary/55 shadow-[0_10px_30px_rgba(66,56,120,0.06)] transition hover:bg-white hover:text-[#8d73ff]"
                                >
                                    <ArrowRight className="h-4 w-4 rotate-180" />
                                    {t("subjectDetail.backToPrograms")}
                                </Link>
                            </div>

                            <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-black text-[#8d73ff] shadow-[0_12px_35px_rgba(66,56,120,0.08)]">
                                <Sparkles className="h-4 w-4" />
                                {content.badge}
                            </div>

                            <h1 className="mt-6 font-poppins text-[3.2rem] font-black leading-[0.95] tracking-[-0.045em] text-primary sm:text-[4.8rem]">
                                {title}
                            </h1>

                            <p className="mt-7 max-w-3xl text-base leading-8 text-primary/65 sm:text-lg">
                                {content.heroLine}
                            </p>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <Link
                                    to={`${withLang("/enquiry")}?subject=${encodeURIComponent(
                                        title
                                    )}#enquiry-form`}
                                >
                                    <Button className="h-13 rounded-2xl bg-primary px-7 text-sm font-bold">
                                        {t("subjectDetail.enquireNow")}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>

                                <a href="#luna-approach">
                                    <Button
                                        variant="outline"
                                        className="h-13 rounded-2xl px-7 text-sm font-bold"
                                    >
                                        {t("subjectDetail.howLunaHelps")}
                                    </Button>
                                </a>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 35, rotate: 2 }}
                            animate={{ opacity: 1, y: 0, rotate: 0 }}
                            transition={{ delay: 0.1 }}
                            className="rounded-[2.8rem] bg-white/90 p-7 shadow-[0_30px_90px_rgba(66,56,120,0.14)] backdrop-blur-xl"
                        >
                            <div className="rounded-[2rem] bg-[#fbfaff] p-6">
                                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8d73ff]">
                                    {t("subjectDetail.programFocus")}
                                </p>

                                <p className="mt-4 text-lg font-bold leading-8 text-primary">
                                    {body}
                                </p>

                                <div className="mt-6 space-y-3">
                                    {content.outcomes.slice(0, 3).map((item) => (
                                        <div
                                            key={item}
                                            className="flex items-center gap-3 rounded-2xl bg-white p-4"
                                        >
                                            <CheckCircle2 className="h-5 w-5 shrink-0 text-[#8d73ff]" />
                                            <p className="text-sm font-semibold text-primary/75">
                                                {item}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* OVERVIEW */}
                <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                        <div>
                            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]">
                                {t("subjectDetail.overview")}
                            </p>

                            <h2 className="mt-4 font-poppins text-4xl font-black tracking-[-0.035em] text-primary">
                                {t("subjectDetail.overviewTitle")}
                            </h2>
                        </div>

                        <div className="rounded-[2.5rem] bg-[#fbfaff] p-8">
                            <p className="text-base leading-8 text-primary/70">
                                {details}
                            </p>

                            <div className="mt-8 rounded-[2rem] bg-white p-6">
                                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8d73ff]">
                                    {t("subjectDetail.suitableFor")}
                                </p>

                                <p className="mt-3 leading-8 text-primary/70">
                                    {suitableFor}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* WHAT WE COVER */}
                <section className="bg-[#fbfaff] px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <p className="text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]">
                            {t("subjectDetail.cover")}
                        </p>

                        <h2 className="mt-4 font-poppins text-4xl font-black tracking-[-0.035em] text-primary">
                            {t("subjectDetail.coverTitle")}
                        </h2>

                        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                            {content.cover.map((item, index) => (
                                <motion.div
                                    key={item}
                                    initial={{ opacity: 0, y: 25 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.06 }}
                                    className="rounded-[2rem] bg-white p-6 shadow-[0_16px_45px_rgba(66,56,120,0.08)]"
                                >
                                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8d73ff]">
                                        <BookOpen className="h-5 w-5 text-white" />
                                    </div>

                                    <p className="font-bold leading-7 text-primary">
                                        {item}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* LUNA APPROACH */}
                <section
                    id="luna-approach"
                    className="bg-white px-4 py-20 sm:px-6 lg:px-8"
                >
                    <div className="mx-auto max-w-7xl">
                        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
                            <div>
                                <p className="text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]">
                                    {t("subjectDetail.approach")}
                                </p>

                                <h2 className="mt-4 font-poppins text-4xl font-black tracking-[-0.035em] text-primary">
                                    {t("subjectDetail.approachTitle")}
                                </h2>

                                <p className="mt-5 leading-8 text-primary/60">
                                    {t("subjectDetail.approachDescription")}
                                </p>
                            </div>

                            <div className="grid gap-4">
                                {content.lunaHelps.map((item, index) => (
                                    <div
                                        key={item}
                                        className="flex gap-4 rounded-[2rem] bg-[#fbfaff] p-5"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#8d73ff] text-sm font-black text-white">
                                            {index + 1}
                                        </div>

                                        <p className="leading-7 text-primary/75">
                                            {item}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-14 grid gap-5 md:grid-cols-4">
                            {[
                                {
                                    icon: ClipboardList,
                                    title: t("subjectDetail.journey.diagnostic.title"),
                                    text: t("subjectDetail.journey.diagnostic.text"),
                                },
                                {
                                    icon: Target,
                                    title: t("subjectDetail.journey.plan.title"),
                                    text: t("subjectDetail.journey.plan.text"),
                                },
                                {
                                    icon: Users,
                                    title: t("subjectDetail.journey.matching.title"),
                                    text: t("subjectDetail.journey.matching.text"),
                                },
                                {
                                    icon: BarChart3,
                                    title: t("subjectDetail.journey.tracking.title"),
                                    text: t("subjectDetail.journey.tracking.text"),
                                },
                            ].map((step) => (
                                <div
                                    key={step.title}
                                    className="rounded-[2rem] bg-[#fffdf8] p-6 shadow-[0_16px_45px_rgba(66,56,120,0.06)]"
                                >
                                    <step.icon className="h-7 w-7 text-[#8d73ff]" />

                                    <h3 className="mt-5 font-poppins text-xl font-black text-primary">
                                        {step.title}
                                    </h3>

                                    <p className="mt-3 text-sm leading-7 text-primary/60">
                                        {step.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* OUTCOMES */}
                <section className="bg-[#fbfaff] px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <p className="text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]">
                            {t("subjectDetail.outcomes")}
                        </p>

                        <h2 className="mt-4 font-poppins text-4xl font-black tracking-[-0.035em] text-primary">
                            {t("subjectDetail.outcomesTitle")}
                        </h2>

                        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {content.outcomes.map((item) => (
                                <div
                                    key={item}
                                    className="rounded-[2rem] bg-white p-6 shadow-[0_16px_45px_rgba(66,56,120,0.08)]"
                                >
                                    <CheckCircle2 className="h-6 w-6 text-[#8d73ff]" />

                                    <p className="mt-4 font-bold leading-7 text-primary">
                                        {item}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* TUTOR MATCHING */}
                <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl rounded-[2.8rem] bg-[#fffdf8] p-8 shadow-[0_25px_80px_rgba(66,56,120,0.1)] sm:p-10">
                        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
                            <div>
                                <p className="text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]">
                                    {t("subjectDetail.tutor")}
                                </p>

                                <h2 className="mt-4 font-poppins text-4xl font-black tracking-[-0.035em] text-primary">
                                    {t("subjectDetail.tutorTitle")}
                                </h2>

                                <p className="mt-5 leading-8 text-primary/65">
                                    {t("subjectDetail.tutorDescription")}
                                </p>
                            </div>

                            <div className="rounded-[2.2rem] bg-white p-6">
                                <div className="space-y-4">
                                    {(t("subjectDetail.tutorPoints", {
                                        returnObjects: true,
                                    }) as string[]).map((item) => (
                                        <div
                                            key={item}
                                            className="flex items-center gap-3 rounded-2xl bg-[#fbfaff] p-4"
                                        >
                                            <CheckCircle2 className="h-5 w-5 text-[#8d73ff]" />
                                            <p className="text-sm font-bold text-primary/75">
                                                {item}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="bg-[#fbfaff] px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-5xl">
                        <p className="text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]">
                            {t("subjectDetail.faq")}
                        </p>

                        <h2 className="mt-4 font-poppins text-4xl font-black tracking-[-0.035em] text-primary">
                            {t("subjectDetail.faqTitle")}
                        </h2>

                        <div className="mt-10 space-y-4">
                            {content.faq.map((item) => (
                                <div
                                    key={item.q}
                                    className="rounded-[2rem] bg-white p-6 shadow-[0_16px_45px_rgba(66,56,120,0.07)]"
                                >
                                    <h3 className="font-poppins text-xl font-black text-primary">
                                        {item.q}
                                    </h3>

                                    <p className="mt-3 leading-8 text-primary/65">
                                        {item.a}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="bg-[#fffdf8] px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-5xl rounded-[2.8rem] bg-white p-8 text-center shadow-[0_25px_80px_rgba(66,56,120,0.12)] sm:p-12">
                        <p className="text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]">
                            {t("subjectDetail.cta")}
                        </p>

                        <h2 className="mt-4 font-poppins text-4xl font-black tracking-[-0.035em] text-primary">
                            {t("subjectDetail.ctaTitle", { title })}
                        </h2>

                        <p className="mx-auto mt-5 max-w-2xl leading-8 text-primary/60">
                            {t("subjectDetail.ctaDescription")}
                        </p>

                        <Link
                            to={`${withLang("/enquiry")}?subject=${encodeURIComponent(
                                title
                            )}#enquiry-form`}
                        >
                            <Button className="mt-8 h-13 rounded-2xl bg-primary px-8 font-bold">
                                {t("subjectDetail.enquireAbout", { title })}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </section>

                <Footer />
            </div>
        </>
    );
}