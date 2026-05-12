import { Button } from "@/components/ui/button";
import NavBar from "@/components/NavBar";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import EnquiryForm from "@/pages/EnquiryForm";
import {
  BookOpen,
  PenLine,
  Mic,
  Calculator,
  GraduationCap,
  School,
  Languages,
  ArrowRight,
} from "lucide-react";
import Footer from "@/components/Footer";

const Subjects = () => {
  const { t } = useTranslation();

  const subjects = [
    {
      icon: BookOpen,
      title: t("subjects.items.assessments.title"),
      body: t("subjects.items.assessments.body"),
      details: t("subjects.items.assessments.details"),
      suitableFor: t("subjects.items.assessments.suitableFor"),
    },
    {
      icon: School,
      title: t("subjects.items.aeis.title"),
      body: t("subjects.items.aeis.body"),
      details: t("subjects.items.aeis.details"),
      suitableFor: t("subjects.items.aeis.suitableFor"),
    },
    {
      icon: PenLine,
      title: t("subjects.items.toefl.title"),
      body: t("subjects.items.toefl.body"),
      details: t("subjects.items.toefl.details"),
      suitableFor: t("subjects.items.toefl.suitableFor"),
    },
    {
      icon: Mic,
      title: t("subjects.items.speaking.title"),
      body: t("subjects.items.speaking.body"),
      details: t("subjects.items.speaking.details"),
      suitableFor: t("subjects.items.speaking.suitableFor"),
    },
    {
      icon: Calculator,
      title: t("subjects.items.math.title"),
      body: t("subjects.items.math.body"),
      details: t("subjects.items.math.details"),
      suitableFor: t("subjects.items.math.suitableFor"),
    },
    {
      icon: Languages,
      title: t("subjects.items.japanese.title"),
      body: t("subjects.items.japanese.body"),
      details: t("subjects.items.japanese.details"),
      suitableFor: t("subjects.items.japanese.suitableFor"),
    },
    {
      icon: GraduationCap,
      title: t("subjects.items.foundation.title"),
      body: t("subjects.items.foundation.body"),
      details: t("subjects.items.foundation.details"),
      suitableFor: t("subjects.items.foundation.suitableFor"),
    },
  ];

  const [selectedSubject, setSelectedSubject] = useState<
    (typeof subjects)[0] | null
  >(null);

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <section className="bg-hero px-6 py-24 text-center">
        <h1 className="text-5xl font-serif text-primary">
          {t("subjects.hero.title")}
        </h1>
      </section>

      <section className="container mx-auto px-6 py-20">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {subjects.map((subject) => (
            <div
              key={subject.title}
              className="group rounded-2xl border bg-card p-6 shadow-soft hover:-translate-y-1"
            >
              <subject.icon className="mb-4 h-6 w-6 text-primary" />

              <h3 className="text-xl font-serif text-primary">
                {subject.title}
              </h3>

              <p className="mt-2 text-muted-foreground">{subject.body}</p>

              <button
                onClick={() => setSelectedSubject(subject)}
                className="mt-4 flex items-center text-accent"
              >
                {t("subjects.learnMore")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {selectedSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-8">
            <button
              onClick={() => setSelectedSubject(null)}
              className="absolute right-5 top-5"
            >
              ✕
            </button>

            <h2 className="text-3xl font-serif text-primary">
              {selectedSubject.title}
            </h2>

            <p className="mt-4 text-muted-foreground">
              {selectedSubject.details}
            </p>

            <div className="mt-6 rounded-lg bg-secondary/50 p-4">
              <p className="font-semibold">{t("subjects.suitableFor")}</p>
              <p>{selectedSubject.suitableFor}</p>
            </div>

            <div className="mt-8">
              <EnquiryForm subject={selectedSubject.title} />
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={() => setSelectedSubject(null)}>
                {t("subjects.close")}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Subjects;