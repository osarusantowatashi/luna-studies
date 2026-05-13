import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import TutorProfileModal from "@/components/TutorProfileModal";



const Tutors = () => {
  const { t } = useTranslation();
  const [selectedTutor, setSelectedTutor] = useState<any | null>(null);

  const tutors = t("tutorsPage.items", { returnObjects: true }) as {
    name: string;
    image: string;
    role: string;
    subjects: string[];
    education: string;
    languages: string;
    bio: string;
    experience: string[];
  }[];

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <section className="px-4 py-16 text-center sm:px-6 sm:py-24">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent">
          {t("tutorsPage.hero.label")}
        </p>

        <h1 className="mx-auto max-w-3xl font-serif text-3xl text-primary sm:text-5xl">
          {t("tutorsPage.hero.title")}
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
          {t("tutorsPage.hero.description")}
        </p>
      </section>

      <section className="container mx-auto px-4 pb-16 sm:px-6 sm:pb-24">
      <div className="grid gap-5 sm:gap-8 md:grid-cols-2 xl:grid-cols-3">
          {tutors.map((tutor) => (
            <div
              key={tutor.name}
              className="rounded-[1.8rem] border bg-card p-5 shadow-soft transition md:hover:-translate-y-1 md:hover:shadow-elegant sm:rounded-3xl sm:p-7"
            >
              <div className="mb-5 h-16 w-16 overflow-hidden rounded-full bg-secondary shadow-soft sm:h-20 sm:w-20">
  <img
    src={tutor.image}
    alt={tutor.name}
    className="h-full w-full object-cover object-[center_top]"
  />
</div>

              <h2 className="font-serif text-2xl text-primary sm:text-3xl">
                {tutor.name}
              </h2>

              <p className="mt-1 text-sm font-semibold text-accent">
                {tutor.role}
              </p>

              <p className="mt-4 line-clamp-2 text-sm leading-7 text-muted-foreground">
                {tutor.bio}
              </p>

              <div className="mt-5 space-y-3 text-sm">
                <p className="leading-7">
                  <span className="font-semibold text-primary">
                    {t("tutorsPage.labels.education")}:
                  </span>{" "}
                  {tutor.education}
                </p>

                <p className="leading-7">
                  <span className="font-semibold text-primary">
                    {t("tutorsPage.labels.languages")}:
                  </span>{" "}
                  {tutor.languages}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {tutor.subjects.slice(0, 3).map((subject) => (
                  <span
                    key={subject}
                    className="rounded-full bg-secondary px-3 py-1.5 text-[11px] font-medium text-primary"
                  >
                    {subject}
                  </span>
                ))}

                {tutor.subjects.length > 3 && (
                  <span className="rounded-full bg-secondary px-3 py-1.5 text-[11px] font-medium text-primary">
                    ...
                  </span>
                )}
              </div>
              <div className="mt-6 flex flex-col gap-3 pt-2 sm:flex-row sm:flex-nowrap sm:items-center">
                <Button
                  onClick={() => setSelectedTutor(tutor)}
                  className="h-11 w-full rounded-xl bg-primary px-6 text-sm sm:w-auto"
                >
                  {t("landing.headTutors.viewProfile")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <Link to="/enquiry" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="h-11 w-full rounded-xl border-[#b8873a]/30 bg-white px-6 text-sm text-[#b8873a] sm:w-auto"
                  >
                    {t("landing.headTutors.book")}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <TutorProfileModal
        tutor={selectedTutor}
        onClose={() => setSelectedTutor(null)}
      />

      <Footer />
    </div>
  );
};

export default Tutors;