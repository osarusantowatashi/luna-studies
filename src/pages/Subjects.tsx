import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import NavBar from "@/components/NavBar";
import { useState } from "react";
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

const subjects = [
  {
    icon: BookOpen,
    title: "MAP / WIDA / CAT4 Preparation",
    body: "Targeted preparation for international school assessments.",
    tags: ["MAP", "WIDA", "CAT4", "Academic Skills"],
    details:
      "MAP, WIDA, and CAT4 are commonly used by international schools...",
    suitableFor:
      "Students applying to or currently studying in international schools.",
  },
  {
    icon: School,
    title: "AEIS Preparation",
    body: "English and Math preparation for Singapore AEIS.",
    tags: ["English", "Math", "Writing", "Comprehension"],
    details:
      "AEIS is an entrance exam for international students...",
    suitableFor:
      "Students planning to apply to Singapore government schools.",
  },
  {
    icon: PenLine,
    title: "TOEFL / IELTS",
    body: "Structured exam preparation...",
    tags: ["Essays", "Speaking", "Reading", "Listening"],
    details:
      "TOEFL and IELTS are internationally recognised exams...",
    suitableFor:
      "Students preparing for international school entry...",
  },
  {
    icon: Mic,
    title: "Speaking & Writing",
    body: "Build clear expression...",
    tags: ["PEEL", "Presentation", "Essay"],
    details:
      "This program builds strong communication skills...",
    suitableFor:
      "Students who need to improve expression.",
  },
  {
    icon: Calculator,
    title: "Math Support",
    body: "Grade-level math practice...",
    tags: ["Problem Solving", "Concepts"],
    details:
      "Our math support focuses on building strong conceptual understanding...",
    suitableFor:
      "Students who need support in math.",
  },
  {
    icon: Languages,
    title: "Japanese Lessons",
    body: "Beginner to intermediate Japanese lessons.",
    tags: ["JLPT", "Grammar"],
    details:
      "We offer beginner to intermediate Japanese lessons...",
    suitableFor:
      "Students learning Japanese.",
  },
  {
    icon: GraduationCap,
    title: "English Foundation",
    body: "Grammar, vocabulary, reading support.",
    tags: ["Grammar", "Reading"],
    details:
      "This program strengthens core English skills...",
    suitableFor:
      "Students with weaker English foundations.",
  },
];

const Subjects = () => {
  const [selectedSubject, setSelectedSubject] = useState<
    (typeof subjects)[0] | null
  >(null);

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* HERO */}
      <section className="bg-hero px-6 py-24 text-center">
        <h1 className="text-5xl font-serif text-primary">
          Programs for every student
        </h1>
      </section>

      {/* SUBJECT CARDS */}
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

              <p className="mt-2 text-muted-foreground">
                {subject.body}
              </p>

              <button
                onClick={() => setSelectedSubject(subject)}
                className="mt-4 flex items-center text-accent"
              >
                Learn more
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* POPUP */}
      {selectedSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-8">

            {/* CLOSE */}
            <button
              onClick={() => setSelectedSubject(null)}
              className="absolute right-5 top-5"
            >
              ✕
            </button>

            {/* CONTENT */}
            <h2 className="text-3xl font-serif text-primary">
              {selectedSubject.title}
            </h2>

            <p className="mt-4 text-muted-foreground">
              {selectedSubject.details}
            </p>

            <div className="mt-6 bg-secondary/50 p-4 rounded-lg">
              <p className="font-semibold">Suitable for:</p>
              <p>{selectedSubject.suitableFor}</p>
            </div>

            {/* 🔥 ENQUIRY FORM */}
            <div className="mt-8">
              <EnquiryForm subject={selectedSubject.title} />
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={() => setSelectedSubject(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subjects;