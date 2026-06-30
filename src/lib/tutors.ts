export type Tutor = {
  slug: string;
  name: string;
  image: string;
  role: string;
  subjects: string[];
  education: string;
  major?: string;
  languages: string;
  bio: string;
  desc?: string;
  experience: string[];
  teachingStyle?: string[];
  quote?: string;
};

type TranslationFn = (
  key: string,
  options?: { returnObjects?: boolean }
) => unknown;

export const tutorSlug = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const fallbackTutors: Omit<Tutor, "slug">[] = [
  {
    name: "Mimi",
    image: "/tutors/mimi_new.jpg",
    role: "Academic Tutor",
    subjects: ["IB English", "TOEFL", "IELTS", "MAP", "CAT4", "JLPT", "Japanese"],
    education: "Waseda University",
    major: "School of International Liberal Studies (SILS)",
    languages: "Japanese / English / Mandarin",
    bio: "Specialises in trilingual education, international school preparation, and personalised academic planning.",
    experience: [],
  },
  {
    name: "Grace",
    image: "/tutors/grace.jpeg",
    role: "English Tutor",
    subjects: ["IB English", "TOEFL", "IELTS", "Academic Writing"],
    education: "National University of Singapore",
    major: "Bachelor of Science (Hons) in Life Science; Master of Science in Applied Biomedicine",
    languages: "English / Mandarin",
    bio: "Experienced in bilingual education, IB preparation, and academic English.",
    experience: [],
  },
  {
    name: "Francis",
    image: "/tutors/francis.jpeg",
    role: "Mathematics Tutor",
    subjects: ["CIE Math", "IGCSE Math", "A-Level Math", "Mathematics"],
    education: "University of Sydney",
    major: "Bachelor of Commerce",
    languages: "English / Mandarin",
    bio: "Focuses on mathematical logic, structured problem solving, and international curricula.",
    experience: [],
  },
  {
    name: "CJ",
    image: "/tutors/cj.jpeg",
    role: "Academic Tutor",
    subjects: ["AEIS", "O-Level Math", "A-Level Math", "Mathematics"],
    education: "Nanyang Technological University, Singapore",
    major: "Bachelor of Engineering in Electronic Engineering",
    languages: "English / Mandarin",
    bio: "Experienced in Singapore local education pathways and bilingual teaching.",
    experience: [],
  },
  {
    name: "Christine",
    image: "/tutors/christine.jpeg",
    role: "English Tutor",
    subjects: ["English Language", "English Literature", "Academic Writing", "ESL"],
    education: "Fuzhou University",
    major: "English Studies",
    languages: "English / Mandarin",
    bio: "Specialises in building strong English foundations through structured learning.",
    experience: [],
  },
  {
    name: "Kana",
    image: "/tutors/kana_new.png",
    role: "Japanese Tutor",
    subjects: ["JLPT", "O-Level Japanese", "A-Level Japanese", "Japanese Language"],
    education: "Keio University",
    major: "Bachelor in Chinese Studies",
    languages: "Japanese / English / Mandarin",
    bio: "A patient and structured Japanese tutor who helps students build strong foundations.",
    experience: [],
  },
  {
    name: "Junichi",
    image: "/tutors/Junichi Ro.jpeg",
    role: "Mathematics & English Tutor",
    subjects: ["IB Math", "AP Math", "Advanced Mathematics", "Calculus"],
    education: "New York University",
    major: "Bachelor of Science in Mathematics",
    languages: "English / Japanese",
    bio: "A native bilingual Mathematics and English tutor who helps students build logical thinking, conceptual understanding, and confident problem-solving skills.",
    experience: [],
  },
  {
    name: "Siya",
    image: "/tutors/siya.jpeg",
    role: "Academic Tutor",
    subjects: ["Mathematics", "Primary Math", "Lower Secondary Math", "Academic Support"],
    education: "Keio University",
    major: "Economics",
    languages: "English / Hindi / Japanese",
    bio: "Guides students in independent thinking, research habits and academic writing.",
    experience: [],
  },
];

export const getTutors = (t: TranslationFn): Tutor[] => {
  const tutorsRaw = t("tutorsPage.items", { returnObjects: true });
  const tutors = Array.isArray(tutorsRaw) ? tutorsRaw : fallbackTutors;

  return (tutors as Omit<Tutor, "slug">[]).map((tutor) => ({
    ...tutor,
    slug: tutor.image === "/tutors/Junichi Ro.jpeg" ? "junichi-ro" : tutorSlug(tutor.name),
  }));
};
