import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

const tutors = [
  {
    name: "Mimi",
    role: "Head Tutor",
    subjects: ["Japanese", "English", "MAP", "WIDA", "TOEFL","O Level"],
    education: "Waseda University",
    languages: "Japanese / English / Mandarin",
    bio: "Specialises in trilingual education, international school preparation, and structured learning plans.",
  },
  {
    name: "Grace",
    role: "English Tutor",
    subjects: ["TOEFL", "IB", "Writing", "Listening","Accent reduction"],
    education: "International education background",
    languages: "English / Mandarin",
    bio: "Supports students with academic English, specialises in bilingual education and confident speaking.",
  },
  {
    name: "Tutor B",
    role: "Math Tutor",
    subjects: ["Math", "Problem Solving", "AEIS"],
    education: "STEM background",
    languages: "English / Mandarin",
    bio: "Focuses on clear explanations, mistake review, and building strong foundations.",
  },
  {
    name: "Tutor C",
    role: "Math Tutor",
    subjects: ["Math", "Problem Solving", "AEIS"],
    education: "STEM background",
    languages: "English / Mandarin",
    bio: "Focuses on clear explanations, mistake review, and building strong foundations.",
  },
  {
    name: "Tutor D",
    role: "Math Tutor",
    subjects: ["Math", "Problem Solving", "AEIS"],
    education: "STEM background",
    languages: "English / Mandarin",
    bio: "Focuses on clear explanations, mistake review, and building strong foundations.",
  },
  {
    name: "Tutor E",
    role: "Math Tutor",
    subjects: ["Math", "Problem Solving", "AEIS"],
    education: "STEM background",
    languages: "English / Mandarin",
    bio: "Focuses on clear explanations, mistake review, and building strong foundations.",
  },
];

const Tutors = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <section className="px-6 py-24 text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent">
          Our Tutors
        </p>

        <h1 className="mx-auto max-w-3xl font-serif text-5xl text-primary">
          Meet the tutors behind Luna Studies
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-muted-foreground">
          Our tutors are selected for strong academic backgrounds, clear communication,
          and the ability to adapt lessons to each student.
        </p>
      </section>

      <section className="container mx-auto px-6 pb-24">
        <div className="grid gap-8 md:grid-cols-3">
          {tutors.map((tutor) => (
            <div
              key={tutor.name}
              className="rounded-3xl border bg-card p-7 shadow-soft transition hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-secondary font-serif text-2xl text-primary">
                {tutor.name[0]}
              </div>

              <h2 className="font-serif text-3xl text-primary">
                {tutor.name}
              </h2>

              <p className="mt-1 text-sm font-semibold text-accent">
                {tutor.role}
              </p>

              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {tutor.bio}
              </p>

              <div className="mt-5 space-y-3 text-sm">
                <p>
                  <span className="font-semibold text-primary">Education:</span>{" "}
                  {tutor.education}
                </p>

                <p>
                  <span className="font-semibold text-primary">Languages:</span>{" "}
                  {tutor.languages}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {tutor.subjects.map((subject) => (
                  <span
                    key={subject}
                    className="rounded-full bg-secondary px-3 py-1 text-xs"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Tutors;