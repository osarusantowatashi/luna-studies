import Footer from "@/components/Footer";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import SeoHelmet from "@/components/SeoHelmet";
import { getTutors } from "@/lib/tutors";

const Tutors = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const currentLang = location.pathname.startsWith("/zh")
    ? "zh"
    : location.pathname.startsWith("/ja")
      ? "ja"
      : "en";

  const isZh = currentLang === "zh";
  const isJa = currentLang === "ja";

  const withLang = (path: string) =>
    `/${currentLang}${path === "/" ? "" : path}`;

  const label = (key: string, fallback: string) => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const tutors = getTutors(t);

  const baseUrl = "https://www.lunastudies.com";
  const canonicalUrl = `${baseUrl}/${currentLang}/tutors`;

  const seoTitle = t("tutorsPage.seo.title");
  const seoDescription = t("tutorsPage.seo.description");

  const getHighlights = (tutor: any) => {
    const items: string[] = [];

    if (tutor.education) items.push(tutor.education);
    if (tutor.major) items.push(tutor.major);
    if (tutor.languages) items.push(`Languages: ${tutor.languages}`);
    if (tutor.bio) items.push(tutor.bio);

    return items.slice(0, 4);
  };

  return (
    <>
      <SeoHelmet
        title={seoTitle}
        description={seoDescription}
        canonicalUrl={canonicalUrl}
        currentLang={currentLang}
      />

      <div className="min-h-screen bg-[#fffdf8]">
        {/* HERO */}
        <section className="relative overflow-hidden px-4 pb-14 pt-20 text-center sm:px-6 sm:pb-20 sm:pt-28 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,#fff1bd_0%,transparent_28%),radial-gradient(circle_at_20%_70%,#f0eaff_0%,transparent_30%)]" />

          <div className="relative z-10 mx-auto max-w-5xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]"
            >
              {label("tutorsPage.hero.label", "Our Tutors")}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`mx-auto mt-5 max-w-6xl font-poppins font-black text-primary ${
                isZh
                  ? "text-[2.8rem] leading-[1.15] tracking-[-0.015em] sm:text-[4.2rem]"
                  : isJa
                    ? "text-[2.55rem] leading-[1.08] tracking-[-0.02em] sm:text-[4.4rem]"
                    : "text-[2.55rem] leading-[1.04] tracking-[-0.025em] min-[390px]:text-[2.9rem] sm:text-[4.8rem] sm:leading-[0.95]"
              }`}
            >
              {label("tutorsPage.hero.title", "Meet Our Tutors")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`mx-auto mt-7 text-primary/60 ${
                isZh
                  ? "max-w-4xl text-[1.05rem] leading-[2.2] tracking-[0.01em]"
                  : isJa
                    ? "max-w-3xl text-[1.02rem] leading-8"
                    : "max-w-2xl text-base leading-8 sm:text-lg"
              }`}
            >
              {label(
                "tutorsPage.hero.description",
                "Our tutors are selected for strong academic backgrounds, clear communication, and the ability to adapt lessons to each student."
              )}
            </motion.p>
          </div>
        </section>

        {/* TUTORS */}
        <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="absolute inset-0 bg-[#fffdf8]" />
<div className="absolute inset-0 bg-[linear-gradient(180deg,#fffdf8_0%,#fcfbff_45%,#f8f5ff_100%)]" />

<div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(230,221,255,0.65)_0%,transparent_28%),radial-gradient(circle_at_82%_38%,rgba(240,236,255,0.55)_0%,transparent_30%)]" />
          <div className="relative z-10 mx-auto max-w-[1280px]">
            <div className="grid items-stretch gap-x-14 gap-y-20 md:grid-cols-2 xl:grid-cols-3">
              {tutors.map((tutor, i) => {
                const highlights = getHighlights(tutor);
                const subjects = tutor.subjects || [];

                return (
                  <motion.div
                    key={tutor.slug}
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.45, delay: i * 0.04 }}
                    className="group flex h-full flex-col items-center text-center"
                  >
                    {/* Profile image */}
                    <div className="aspect-square w-full max-w-[320px] overflow-hidden rounded-[1.4rem]">
                      <img
                        src={tutor.image}
                        alt={tutor.name}
                        className={`h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.035] ${
                          tutor.image === "/tutors/Junichi Ro.jpeg"
                            ? "object-[center_20%]"
                            : ""
                        }`}
                      />
                    </div>

                    <h2 className="mt-7 font-poppins text-2xl font-black uppercase tracking-[0.03em] text-primary">
                      {tutor.name}
                    </h2>

                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary/45">
                      {tutor.role}
                    </p>

                    <div className="mt-6 flex w-full flex-1 flex-col items-center">
                      {/* Main points */}
                      <div className="w-full max-w-[420px] text-left">
                        <h3 className="text-center text-xs font-black uppercase tracking-[0.18em] text-[#8d73ff]">
                          Main Points
                        </h3>

                        <ul className="mt-4 min-h-[168px] space-y-2.5 text-sm leading-6 text-primary/70">
                          {highlights.map((item: string) => (
                            <li key={item} className="flex gap-2.5">
                              <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary/35" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Subjects */}
                      <div className="mt-6 w-full max-w-[420px]">
                        <h3 className="text-xs font-black uppercase tracking-[0.18em] text-[#8d73ff]">
                          Subjects
                        </h3>

                        <p className="mx-auto mt-3 min-h-[64px] max-w-[360px] text-sm leading-7 text-primary/65">
                          {subjects
                            .slice(0, 8)
                            .map((subject: string) => subject.replace(/^#/, ""))
                            .join(" • ")}
                        </p>
                      </div>

                      {/* Buttons */}
                      <div className="mt-auto flex flex-wrap justify-center gap-3 pt-7">
                        <Button
                          asChild
                          className="h-11 rounded-full bg-primary px-5 text-sm font-bold shadow-none"
                        >
                          <Link to={withLang(`/tutors/${tutor.slug}`)}>
                            <span>{t("tutorsPage.buttons.viewProfile")}</span>
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>

                        <Button
                          asChild
                          variant="ghost"
                          className="h-11 rounded-full px-4 text-sm font-bold text-primary hover:bg-white/45"
                        >
                          <Link to={withLang("/enquiry")}>
                            {t("tutorsPage.buttons.book")}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </motion.div>
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

export default Tutors;