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

      <section className="px-6 py-24 text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent">
          {t("tutorsPage.hero.label")}
        </p>

        <h1 className="mx-auto max-w-3xl font-serif text-5xl text-primary">
          {t("tutorsPage.hero.title")}
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-muted-foreground">
          {t("tutorsPage.hero.description")}
        </p>
      </section>

      <section className="container mx-auto px-6 pb-24">
        <div className="grid gap-8 md:grid-cols-3">
          {tutors.map((tutor) => (
            <div
              key={tutor.name}
              className="rounded-3xl border bg-card p-7 shadow-soft transition hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className="mb-5 h-20 w-20 overflow-hidden rounded-full bg-secondary shadow-soft">
  <img
    src={tutor.image}
    alt={tutor.name}
    className="h-full w-full object-cover object-top"
  />
</div>

              <h2 className="font-serif text-3xl text-primary">
                {tutor.name}
              </h2>

              <p className="mt-1 text-sm font-semibold text-accent">
                {tutor.role}
              </p>

              <p className="mt-4 line-clamp-2 text-sm leading-6 text-muted-foreground">
                {tutor.bio}
              </p>

              <div className="mt-5 space-y-3 text-sm">
                <p>
                  <span className="font-semibold text-primary">
                    {t("tutorsPage.labels.education")}:
                  </span>{" "}
                  {tutor.education}
                </p>

                <p>
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
                    className="rounded-full bg-secondary px-3 py-1 text-xs"
                  >
                    {subject}
                  </span>
                ))}

                {tutor.subjects.length > 3 && (
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs">
                    ...
                  </span>
                )}
              </div>
              <div className="mt-6 flex flex-nowrap items-center gap-3">
                <Button
                  onClick={() => setSelectedTutor(tutor)}
                  className="h-11 rounded-xl bg-primary px-6 text-sm"
                >
                  {t("landing.headTutors.viewProfile")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <Link to="/enquiry">
                  <Button
                    variant="outline"
                    className="h-11 rounded-xl border-[#b8873a]/30 bg-white px-6 text-sm text-[#b8873a]"
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