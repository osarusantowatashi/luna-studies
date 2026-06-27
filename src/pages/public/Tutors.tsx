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
        <section className="relative overflow-hidden bg-[#fffdf8] px-4 pb-14 pt-20 text-center sm:px-6 sm:pb-20 sm:pt-28 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,#fff1bd_0%,transparent_28%),radial-gradient(circle_at_20%_70%,#f0eaff_0%,transparent_30%)]" />

          <div className="relative z-10 mx-auto max-w-5xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]"
            >
              {label("tutorsPage.hero.label", "Our Tutors")}    </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`mt-5 mx-auto max-w-6xl font-poppins font-black text-primary
  ${isZh
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
              className={`mx-auto mt-7 text-primary/60
                ${isZh
                  ? "max-w-4xl text-[1.05rem] leading-[2.2] tracking-[0.01em]"
                  : isJa
                    ? "max-w-3xl text-[1.02rem] leading-8"
                    : "max-w-2xl text-base leading-8 sm:text-lg"
                }`}
            >
              {label(
                "tutorsPage.hero.description",
                "Our tutors are selected for strong academic backgrounds, clear communication, and the ability to adapt lessons to each student."
              )}    </motion.p>
          </div>
        </section>

        {/* TUTOR CARDS */}
        <section className="relative overflow-hidden bg-[#fbfaff] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,#f0eaff_0%,transparent_25%),radial-gradient(circle_at_85%_80%,#fff1bd_0%,transparent_25%)]" />

          <div className="relative z-10 mx-auto max-w-[1280px]">
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">      {tutors.map((tutor, i) => (
              <motion.div
                key={tutor.slug}
                initial={{ opacity: 0, y: 50, rotate: 0 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.25 }}
                transition={{ duration: 0.55, delay: i * 0.06 }}
                whileHover={{
                  y: -12,
                  scale: 1.025,
                  rotate: i % 2 === 0 ? -2 : 2,
                }}
                className="group relative flex min-h-0 flex-col overflow-hidden rounded-[1.8rem] bg-white/95 p-4 shadow-[0_18px_55px_rgba(66,56,120,0.09)] backdrop-blur-xl sm:min-h-[520px] sm:rounded-[2.4rem] sm:p-6 lg:min-h-[560px]"        >
                <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#f0eaff]" />

                <div
                  className={`relative z-10 aspect-[4/3] overflow-hidden rounded-[1.5rem] sm:aspect-square sm:rounded-[2rem] ${
                    tutor.name === "Siya" ? "bg-white" : "bg-[#f6f2ff]"
                  }`}
                >
                  <img
                    src={tutor.image}
                    alt={tutor.name}
                    className={`h-full w-full object-center transition duration-500 ${
                      tutor.name === "Siya"
                        ? "object-contain"
                        : tutor.image === "/tutors/Junichi Ro.jpeg"
                          ? "scale-[0.92] object-cover object-[center_20%] group-hover:scale-[0.96]"
                        : "object-cover group-hover:scale-105"
                    }`}
                  />
                </div>
                {/* content */}
                <div className="relative z-10 mt-6 flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-poppins text-2xl font-black text-primary sm:text-3xl">
                        {tutor.name}
                      </h2>

                      <p className="mt-1 text-sm font-black text-[#8d73ff]">
                        {tutor.role}
                      </p>
                    </div>

                    <span className="rounded-full bg-[#fff6da] px-3 py-1 text-xs font-black text-[#d4a100]">
                      5.0
                    </span>
                  </div>

                  <p className="mt-4 line-clamp-3 text-sm leading-7 text-primary/60">
                    {tutor.bio}
                  </p>

                  <div className="mt-5 space-y-2 text-sm">
                    <p className="leading-6 text-primary/65">
                      <span className="font-black text-primary">
                        {label("tutorsPage.labels.education", "Education")}:                </span>{" "}
                      {tutor.education}
                    </p>

                    {tutor.major && (
                      <p className="leading-6 text-primary/65">
                        <span className="font-black text-primary">
                          {label("tutorsPage.labels.major", "Major")}:                </span>{" "}
                        {tutor.major}
                      </p>
                    )}

                    <p className="leading-6 text-primary/65">
                      <span className="font-black text-primary">
                        {label("tutorsPage.labels.languages", "Languages")}:                </span>{" "}
                      {tutor.languages}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {(tutor.subjects || []).slice(0, 3).map((subject) => (<span
                      key={subject}
                      className="rounded-full bg-[#f6f2ff] px-3 py-1.5 text-[11px] font-black text-primary/70"
                    >
                      {subject.replace(/^#/, "")}
                    </span>
                    ))}

                    {(tutor.subjects || []).length > 3 && (<span className="rounded-full bg-[#f6f2ff] px-3 py-1.5 text-[11px] font-black text-primary/70">
                      ...
                    </span>
                    )}
                  </div>

                  <div className="mt-auto grid gap-3 pt-6 sm:grid-cols-1 lg:grid-cols-2">
                    <Button
                      asChild
                      className="h-12 min-h-11 w-full rounded-2xl bg-primary px-4 text-sm font-bold"
                    >
                      <Link to={withLang(`/tutors/${tutor.slug}`)}>
                        <span className="truncate">
                          {t("tutorsPage.buttons.viewProfile")}
                        </span>
                        <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
                      </Link>
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      className="h-12 min-h-11 w-full rounded-2xl border-primary/10 bg-white px-4 text-sm font-bold text-primary"
                    >
                      <Link to={withLang("/enquiry")}>
                        <span className="truncate">
                          {t("tutorsPage.buttons.book")}
                        </span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
            </div>
          </div>
        </section>
        <Footer />
      </div>
    </>
  );
};

export default Tutors;
