import SeoHelmet from "@/components/SeoHelmet";
import { motion } from "framer-motion";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    Clock,
    Globe2,
    GraduationCap,
    HeartHandshake,
    Sparkles,
    TrendingUp,
    Users,
} from "lucide-react";



const Careers = () => {

    const { t } = useTranslation();

    const openings = t("careers.openings.items", {
        returnObjects: true,
    }) as {
        title: string;
        slug: string;
        type: string;
        location: string;
    }[];

    const whyLuna = t("careers.why.items", {
        returnObjects: true,
    }) as {
        title: string;
        text: string;
    }[];

    const whyIcons = [HeartHandshake, TrendingUp, Globe2, Clock];

    const process = t("careers.process.items", {
        returnObjects: true,
    }) as string[];


    const currentLang = location.pathname.startsWith("/zh")
        ? "zh"
        : location.pathname.startsWith("/ja")
            ? "ja"
            : "en";

    const baseUrl = "https://www.lunastudies.com";
    const canonicalUrl = `${baseUrl}/${currentLang}/careers`;

    const seoTitle = t("careers.seo.title");
    const seoDescription = t("careers.seo.description");
    return (
        <>
            <SeoHelmet
                title={seoTitle}
                description={seoDescription}
                canonicalUrl={canonicalUrl}
                currentLang={currentLang}
            />

            <div className="min-h-screen bg-[#fbfaff]">
                <NavBar />

                <main className="relative">
                    <section className="relative overflow-hidden px-4 pt-28 pb-20 sm:px-6 lg:px-8">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,#f0eaff_0%,transparent_30%),radial-gradient(circle_at_84%_70%,#fff1bd_0%,transparent_30%),linear-gradient(180deg,#fffdf8_0%,#fbfaff_100%)]" />

                        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_0.9fr]">
                            <motion.div
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]">
                                    <Sparkles className="h-5 w-5" />
                                    {t("careers.hero.label")}
                                </p>

                                <h1 className="mt-6 max-w-3xl font-poppins text-[3rem] font-black leading-[1.05] text-primary sm:text-[4.5rem]">
                                    {t("careers.hero.title")}
                                </h1>

                                <p className="mt-6 max-w-2xl text-lg leading-8 text-primary/60">
                                    {t("careers.hero.description")}
                                </p>

                                <div className="mt-8 flex flex-wrap gap-4">
                                    <a href="#openings">
                                        <Button className="h-13 rounded-2xl px-6 shadow-elegant">
                                            {t("careers.hero.viewRoles")}
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </Button>
                                    </a>

                                    <a href="#openings">
                                        <Button variant="outline" className="h-13 rounded-2xl px-6">
                                            {t("careers.hero.applyNow")}
                                        </Button>
                                    </a>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.92, rotate: 2 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{ delay: 0.15 }}
                                className="rounded-[3rem] border border-white/70 bg-white/80 p-6 shadow-[0_35px_100px_rgba(66,56,120,0.14)] backdrop-blur-xl"
                            >
                                <div className="rounded-[2.5rem] bg-[#082A55] p-8 text-white">
                                    <GraduationCap className="h-10 w-10 text-[#F6C65B]" />

                                    <h2 className="mt-8 text-3xl font-black">
                                        {t("careers.hero.cardTitle")}
                                    </h2>

                                    <p className="mt-4 leading-7 text-white/70">
                                        {t("careers.hero.cardText")}
                                    </p>

                                    <div className="mt-8 grid grid-cols-2 gap-3">
                                        {(t("careers.hero.badges", {
                                            returnObjects: true,
                                        }) as string[]).map((item) => (
                                            <div
                                                key={item}
                                                className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold"
                                            >
                                                {item}
                                            </div>
                                        )
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </section>

                    <section className="px-4 py-20 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-7xl">
                            <div className="text-center">
                                <p className="text-sm font-black uppercase tracking-[0.22em] text-[#8d73ff]">
                                    {t("careers.why.label")}
                                </p>
                                <h2 className="mt-3 font-poppins text-4xl font-black text-primary">
                                    {t("careers.why.title")}
                                </h2>
                            </div>

                            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                                {whyLuna.map((item, index) => (
                                    <motion.div
                                        key={`${item.title}-${index}`}
                                        initial={{ opacity: 0, y: 24 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.06 }}
                                        className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(66,56,120,0.08)]"
                                    >
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF2C7] text-[#082A55]">
                                            {(() => {
                                                const Icon = whyIcons[index] || HeartHandshake;
                                                return <Icon className="h-6 w-6" />;
                                            })()}
                                        </div>

                                        <h3 className="mt-5 text-xl font-black text-primary">
                                            {item.title}
                                        </h3>

                                        <p className="mt-3 text-sm leading-7 text-primary/55">
                                            {item.text}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section
                        id="openings"
                        className="relative px-4 py-24 sm:px-6 lg:px-8"
                    >
                        <div className="absolute inset-0 bg-white" />

                        <div className="relative z-10 mx-auto max-w-7xl">
                            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                                <div>
                                    <p className="text-sm font-black uppercase tracking-[0.22em] text-[#8d73ff]">
                                        {t("careers.openings.label")}
                                    </p>

                                    <h2 className="mt-3 font-poppins text-4xl font-black text-primary sm:text-5xl">
                                        {t("careers.openings.title")}
                                    </h2>

                                    <p className="mt-4 max-w-2xl text-base leading-8 text-primary/55">
                                        {t("careers.openings.description")}
                                    </p>
                                </div>

                                <a href="mailto:enquiries@lunastudies.com">
                                    <Button className="rounded-2xl px-6 shadow-elegant">
                                        {t("careers.openings.applyEmail")}
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </a>
                            </div>

                            <div className="mt-12 grid gap-5">
                                {openings.map((job, index) => (
                                    <motion.div
                                        key={`${job.title}-${index}`}
                                        initial={{ opacity: 0, y: 24 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group rounded-[2rem] border border-[#E8D8B5] bg-[#fffdf8] p-6 shadow-[0_18px_60px_rgba(8,42,85,0.06)] transition hover:-translate-y-1 hover:shadow-[0_26px_80px_rgba(8,42,85,0.12)]"
                                    >
                                        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <h3 className="text-2xl font-black text-primary">
                                                        {job.title}
                                                    </h3>

                                                    <span className="rounded-full bg-[#FFF2C7] px-3 py-1 text-xs font-black text-[#082A55]">
                                                        {job.type}
                                                    </span>
                                                </div>

                                                <div className="mt-4 text-sm font-semibold text-primary/55">
                                                    {job.location}
                                                </div>
                                            </div>

                                            <Link to={`/${currentLang}/careers/${job.slug}`}>
                                                <Button
                                                    variant="outline"
                                                    className="rounded-2xl border-[#082A55] text-[#082A55] group-hover:bg-[#082A55] group-hover:text-white"
                                                >
                                                    {t("careers.openings.apply")}
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="px-4 py-24 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-7xl rounded-[3rem] bg-[#082A55] p-8 text-white sm:p-12">
                            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
                                <div>
                                    <p className="text-sm font-black uppercase tracking-[0.22em] text-[#F6C65B]">
                                        {t("careers.process.label")}
                                    </p>

                                    <h2 className="mt-3 font-poppins text-4xl font-black">
                                        {t("careers.process.title")}
                                    </h2>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-5">
                                    {process.map((item, index) => (
                                        <div
                                            key={item}
                                            className="rounded-3xl bg-white/10 p-5 text-center"
                                        >
                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F6C65B] font-black text-[#082A55]">
                                                {String(index + 1).padStart(2, "0")}
                                            </div>

                                            <p className="mt-4 text-sm font-bold">{item}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="px-4 pb-24 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-4xl text-center">
                            <Users className="mx-auto h-10 w-10 text-[#8d73ff]" />

                            <h2 className="mt-5 font-poppins text-4xl font-black text-primary">
                                {t("careers.cta.title")}
                            </h2>

                            <p className="mt-4 text-primary/55">
                                {t("careers.cta.description")}
                            </p>

                            <a href="mailto:enquiries@lunastudies.com">
                                <Button className="mt-8 h-13 rounded-2xl px-8 shadow-elegant">
                                    {t("careers.cta.button")}
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </a>
                        </div>
                    </section>
                </main>

                <Footer />
            </div>
        </>
    );
};

export default Careers;