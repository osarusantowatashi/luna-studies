import { Button } from "@/components/ui/button";
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

      <section className="bg-hero px-4 py-10 text-center sm:px-6 sm:py-24">
        <h1 className="font-serif text-3xl text-primary sm:text-5xl">
          {t("subjects.hero.title")}
        </h1>
      </section>

      <section className="container mx-auto px-4 py-14 sm:px-6 sm:py-20">
        <div className="grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-4">
          {subjects.map((subject) => (
            <div
              key={subject.title}
              className="group flex h-full flex-col rounded-[1.8rem] border bg-card p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-elegant sm:rounded-2xl sm:p-6"
            >
              <subject.icon className="mb-4 h-7 w-7 text-primary sm:h-8 sm:w-8" />

              <h3 className="text-xl font-serif leading-tight text-primary">
                {subject.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">{subject.body}</p>

              <button
                onClick={() => setSelectedSubject(subject)}
                className="mt-6 flex items-center text-sm font-medium text-accent"
              >
                {t("subjects.learnMore")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {selectedSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm sm:px-6">
          <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[1.8rem] bg-white p-5 shadow-[0_30px_100px_rgba(0,0,0,0.25)] sm:rounded-3xl sm:p-8">
            <button
              onClick={() => setSelectedSubject(null)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-lg text-primary transition hover:bg-secondary/80 sm:right-5 sm:top-5"
            >
              ✕
            </button>

            <h2 className="pr-12 font-serif text-2xl leading-tight text-primary sm:text-3xl">
              {selectedSubject.title}
            </h2>

            <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
              {selectedSubject.details}
            </p>

            <div className="mt-6 rounded-2xl bg-secondary/50 p-5">
              <p className="font-semibold">{t("subjects.suitableFor")}</p>
              <p>{selectedSubject.suitableFor}</p>
            </div>

            <div className="mt-8">
              <EnquiryForm subject={selectedSubject.title} />
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                type="button"
                onClick={() => setSelectedSubject(null)}
                className="w-full rounded-2xl sm:w-auto"
              >
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