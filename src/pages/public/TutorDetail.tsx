import Footer from "@/components/Footer";
import SeoHelmet from "@/components/SeoHelmet";
import { Button } from "@/components/ui/button";
import { getTutors } from "@/lib/tutors";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  GraduationCap,
  Languages,
  MessageCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";

const TutorDetail = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { slug } = useParams();

  const currentLang = location.pathname.startsWith("/zh")
    ? "zh"
    : location.pathname.startsWith("/ja")
      ? "ja"
      : "en";

  const withLang = (path: string) =>
    `/${currentLang}${path === "/" ? "" : path}`;

  const label = (key: string, fallback: string) => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const tutor = getTutors(t).find((item) => item.slug === slug);

  if (!tutor) {
    return <Navigate to={withLang("/tutors")} replace />;
  }

  const baseUrl = "https://www.lunastudies.com";
  const canonicalUrl = `${baseUrl}/${currentLang}/tutors/${tutor.slug}`;
  const seoTitle = `${tutor.name} | Luna Education Tutor`;
  const seoDescription =
    tutor.bio ||
    tutor.desc ||
    `${tutor.name} is a Luna Education tutor supporting personalised learning.`;

  return (
    <>
      <SeoHelmet
        title={seoTitle}
        description={seoDescription}
        canonicalUrl={canonicalUrl}
        currentLang={currentLang}
      />

      <div className="min-h-screen bg-background">
        <section className="relative overflow-hidden bg-[#fffdf8] px-4 pb-14 pt-20 sm:px-6 sm:pb-20 sm:pt-28 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,#fff1bd_0%,transparent_25%),radial-gradient(circle_at_18%_74%,#f0eaff_0%,transparent_28%)]" />

          <div className="relative z-10 mx-auto max-w-[1200px]">
            <Link
              to={withLang("/tutors")}
              className="inline-flex items-center text-sm font-bold text-primary/55 transition hover:text-primary"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {label("tutorsPage.buttons.backToTutors", "Back to tutors")}
            </Link>

            <div className="mt-8 grid items-center gap-10 lg:grid-cols-[0.92fr_1.08fr]">
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
                className="relative"
              >
                <div className="absolute -left-5 -top-5 h-32 w-32 rounded-full bg-[#8d73ff]/10 blur-2xl" />
                <div className="absolute -bottom-5 right-8 h-36 w-36 rounded-full bg-[#ffc928]/18 blur-2xl" />

                <div
                  className={`relative mx-auto aspect-[4/5] max-w-[360px] overflow-hidden rounded-[1.8rem] border border-white/80 shadow-[0_28px_90px_rgba(66,56,120,0.16)] sm:max-w-[430px] sm:rounded-[2.2rem] ${
                    tutor.name === "Siya" ? "bg-white" : "bg-[#f6f2ff]"
                  }`}
                >
                  <img
                    src={tutor.image}
                    alt={tutor.name}
                    className={`h-full w-full ${
                      tutor.name === "Siya"
                        ? "object-contain object-center p-5"
                        : "object-cover object-top"
                    }`}
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.08 }}
              >
                <p className="text-sm font-black uppercase tracking-[0.24em] text-[#8d73ff]">
                  {label("tutorsPage.popup.label", "Tutor Profile")}
                </p>

                <h1 className="mt-4 font-poppins text-[2.5rem] font-black leading-[1.04] tracking-[-0.025em] text-primary min-[390px]:text-[2.8rem] sm:text-[4.4rem] sm:leading-[0.98]">
                  {tutor.name}
                </h1>

                <p className="mt-4 text-lg font-bold text-[#8d73ff]">
                  {tutor.role}
                </p>

                <p className="mt-6 max-w-2xl text-base leading-8 text-primary/62 sm:text-lg">
                  {tutor.bio || tutor.desc}
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.4rem] border border-white/80 bg-white/90 p-5 shadow-[0_14px_40px_rgba(66,56,120,0.08)]">
                    <GraduationCap className="mb-3 h-5 w-5 text-[#8d73ff]" />
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-primary/45">
                      {label("tutorsPage.labels.education", "Education")}
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-primary/75">
                      {tutor.education}
                    </p>
                  </div>

                  <div className="rounded-[1.4rem] border border-white/80 bg-white/90 p-5 shadow-[0_14px_40px_rgba(66,56,120,0.08)]">
                    <Languages className="mb-3 h-5 w-5 text-[#8d73ff]" />
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-primary/45">
                      {label("tutorsPage.labels.languages", "Languages")}
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-primary/75">
                      {tutor.languages}
                    </p>
                  </div>
                </div>

                <Button asChild className="mt-8 h-12 w-full rounded-full bg-primary px-8 text-base sm:w-auto">
                  <Link to={withLang("/enquiry")}>
                    {t("tutorsPage.buttons.bookWithTutor", { name: tutor.name })}
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#fbfaff] px-4 py-20 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,#f0eaff_0%,transparent_24%),radial-gradient(circle_at_84%_78%,#fff1bd_0%,transparent_24%)]" />

          <div className="relative z-10 mx-auto grid max-w-[1200px] gap-6 lg:grid-cols-[0.72fr_0.28fr]">
            <div className="space-y-6">
              {tutor.teachingStyle && tutor.teachingStyle.length > 0 && (
                <section className="rounded-[1.8rem] bg-white/92 p-6 shadow-[0_18px_55px_rgba(66,56,120,0.08)] backdrop-blur-xl sm:p-8">
                  <h2 className="font-poppins text-2xl font-black text-primary">
                    {label("tutorsPage.popup.teachingStyle", "Teaching Style")}
                  </h2>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {tutor.teachingStyle.map((style) => (
                      <div
                        key={style}
                        className="rounded-2xl bg-[#f8f6ff] px-4 py-4 text-sm font-bold leading-6 text-primary"
                      >
                        {style}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section className="rounded-[1.8rem] bg-white/92 p-6 shadow-[0_18px_55px_rgba(66,56,120,0.08)] backdrop-blur-xl sm:p-8">
                <h2 className="font-poppins text-2xl font-black text-primary">
                  {label("tutorsPage.popup.experience", "Teaching Experience")}
                </h2>

                <div className="mt-5 grid gap-3">
                  {(tutor.experience || []).map((item) => (
                    <div
                      key={item}
                      className="flex gap-3 rounded-2xl bg-[#f8f6ff] px-4 py-4 text-sm leading-7 text-primary/70"
                    >
                      <CheckCircle className="mt-1 h-4 w-4 shrink-0 text-[#8d73ff]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <section className="rounded-[1.8rem] bg-white/92 p-6 shadow-[0_18px_55px_rgba(66,56,120,0.08)] backdrop-blur-xl">
                <BookOpen className="mb-4 h-5 w-5 text-[#8d73ff]" />
                <h2 className="font-poppins text-xl font-black text-primary">
                  {label("tutorsPage.popup.subjects", "Subjects")}
                </h2>

                <div className="mt-4 flex flex-wrap gap-2">
                  {tutor.subjects.map((subject) => (
                    <span
                      key={subject}
                      className="rounded-full bg-[#f6f2ff] px-3 py-1.5 text-xs font-bold text-primary/70"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </section>

              <section className="rounded-[1.8rem] border border-[#ffc928]/20 bg-[#fffdf8] p-6 shadow-[0_18px_55px_rgba(66,56,120,0.08)]">
                <MessageCircle className="mb-4 h-5 w-5 text-[#b8873a]" />
                <p className="text-sm leading-7 text-primary/65">
                  {tutor.quote || t("tutorsPage.popup.quote", { name: tutor.name })}
                </p>
              </section>
            </aside>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default TutorDetail;
