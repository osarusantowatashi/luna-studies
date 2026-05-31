import Footer from "@/components/Footer";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import TutorProfileModal from "@/components/TutorProfileModal";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";



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
  const [selectedTutor, setSelectedTutor] = useState<any | null>(null);

  type Tutor = {
    name: string;
    image: string;
    role: string;
    subjects: string[];
    education: string;
    languages: string;
    bio: string;
    experience: string[];
  };

  const tutorsRaw = t("tutorsPage.items", { returnObjects: true });

  const tutors: Tutor[] = Array.isArray(tutorsRaw)
    ? (tutorsRaw as Tutor[])
    : [
      {
        name: "Mimi",
        image: "/tutors/mimi_new.jpg",
        role: "Trilingual Educator & Head Tutor",
        subjects: ["Japanese", "English", "TOEFL", "IELTS", "SAT"],
        education: "Waseda University, Japan",
        languages: "Japanese / English / Mandarin",
        bio: "Specialises in trilingual education, international school preparation, and personalised academic planning.",
        experience: [],
      },
      {
        name: "Grace",
        image: "/tutors/grace_new.jpg",
        role: "Academic English & IB Tutor",
        subjects: ["IB English", "TOEFL", "Academic Writing"],
        education: "National University of Singapore, Singapore",
        languages: "English / Mandarin",
        bio: "Experienced in bilingual education, IB preparation, and academic English.",
        experience: [],
      },
      {
        name: "Francis",
        image: "/tutors/francis_new.png",
        role: "International Math Tutor",
        subjects: ["IGCSE Math", "A Level Math", "AEIS Math"],
        education: "University of Sydney, Australia",
        languages: "English / Mandarin",
        bio: "Focuses on mathematical logic, structured problem solving, and international curricula.",
        experience: [],
      },
      {
        name: "CJ",
        image: "/tutors/cj_new.png",
        role: "STEM & Singapore Curriculum Tutor",
        subjects: ["AEIS", "A Level Math", "English"],
        education: "Nanyang Technological University, Singapore",
        languages: "English / Mandarin",
        bio: "Experienced in Singapore local education pathways and bilingual teaching.",
        experience: [],
      },
      {
        name: "Christine",
        image: "/tutors/christine_new.png",
        role: "English Foundations Tutor",
        subjects: ["English", "Grammar", "Writing"],
        education: "University of Fuzhou, China",
        languages: "English / Mandarin",
        bio: "Specialises in building strong English foundations through structured learning.",
        experience: [],
      },
    ];
  return (
    <>
      <Helmet>
        <title>{t("tutorsPage.seo.title")}</title>
        <meta name="description" content={t("tutorsPage.seo.description")} />
      </Helmet>
      <div className="min-h-screen bg-background">

        {/* HERO */}
        <section className="relative overflow-hidden bg-[#fffdf8] px-4 pt-28 pb-20 text-center sm:px-6 lg:px-8">
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
                    ? "text-[3rem] leading-[1.08] tracking-[-0.025em] sm:text-[4.4rem]"
                    : "text-[3.2rem] leading-[0.95] tracking-[-0.045em] sm:text-[4.8rem]"
                }`}
            >
              {label("tutorsPage.hero.title", "Meet Our Tutors")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`mx-auto mt-7 text-primary/60
                ${
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
              )}    </motion.p>
          </div>
        </section>

        {/* TUTOR CARDS */}
        <section className="relative overflow-hidden bg-[#fbfaff] px-4 py-20 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,#f0eaff_0%,transparent_25%),radial-gradient(circle_at_85%_80%,#fff1bd_0%,transparent_25%)]" />

          <div className="relative z-10 mx-auto max-w-[1280px]">
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">      {tutors.map((tutor, i) => (
              <motion.div
                key={tutor.name}
                initial={{ opacity: 0, y: 50, rotate: 0 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.25 }}
                transition={{ duration: 0.55, delay: i * 0.06 }}
                whileHover={{
                  y: -12,
                  scale: 1.025,
                  rotate: i % 2 === 0 ? -2 : 2,
                }}
                className="group relative flex min-h-[520px] flex-col overflow-hidden rounded-[2rem] bg-white/95 p-5 shadow-[0_18px_55px_rgba(66,56,120,0.09)] backdrop-blur-xl sm:rounded-[2.4rem] sm:p-6 lg:min-h-[560px]"        >
                <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#f0eaff]" />

                <div className="relative z-10 h-[220px] overflow-hidden rounded-[2rem] bg-[#f6f2ff] sm:h-[240px] lg:h-[260px]">
                  <img
                    src={tutor.image}
                    alt={tutor.name}
                    className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
                  />
                </div>
                {/* content */}
                <div className="relative z-10 mt-6 flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-poppins text-3xl font-black text-primary">
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
                      #{subject}
                    </span>
                    ))}

                    {(tutor.subjects || []).length > 3 && (<span className="rounded-full bg-[#f6f2ff] px-3 py-1.5 text-[11px] font-black text-primary/70">
                      ...
                    </span>
                    )}
                  </div>

                  <div className="mt-auto grid gap-3 pt-6 sm:grid-cols-1 lg:grid-cols-2">
  <Button
    onClick={() => setSelectedTutor(tutor)}
    className="h-12 w-full rounded-2xl bg-primary px-4 text-sm font-bold"
  >
    <span className="truncate">View Profile</span>
    <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
  </Button>

  <Button
    asChild
    variant="outline"
    className="h-12 w-full rounded-2xl border-primary/10 bg-white px-4 text-sm font-bold text-primary"
  >
    <Link to="/enquiry">
      <span className="truncate">Book Consultation</span>
    </Link>
  </Button>
</div>
                </div>
              </motion.div>
            ))}
            </div>
          </div>
        </section>


        <TutorProfileModal

          tutor={selectedTutor}

          onClose={() => setSelectedTutor(null)}

        />
        <Footer />
      </div>
    </>
  );
};

export default Tutors;