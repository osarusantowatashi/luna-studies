export type Tutor = {
  slug: string;
  name: string;
  image: string;
  role: string;
  subjects: string[];
  education: string;
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
    subjects: ["Japanese", "English", "TOEFL", "IELTS", "SAT"],
    education: "Waseda University, Japan",
    languages: "Japanese / English / Mandarin",
    bio: "Specialises in trilingual education, international school preparation, and personalised academic planning.",
    experience: [],
  },
  {
    name: "Grace",
    image: "/tutors/grace_new.jpg",
    role: "English Tutor",
    subjects: ["IB English", "TOEFL", "Academic Writing"],
    education: "National University of Singapore, Singapore",
    languages: "English / Mandarin",
    bio: "Experienced in bilingual education, IB preparation, and academic English.",
    experience: [],
  },
  {
    name: "Francis",
    image: "/tutors/francis_new.png",
    role: "Mathematics Tutor",
    subjects: ["IGCSE Math", "A Level Math", "AEIS Math"],
    education: "University of Sydney, Australia",
    languages: "English / Mandarin",
    bio: "Focuses on mathematical logic, structured problem solving, and international curricula.",
    experience: [],
  },
  {
    name: "CJ",
    image: "/tutors/cj_new.png",
    role: "Academic Tutor",
    subjects: ["AEIS", "A Level Math", "English"],
    education: "Nanyang Technological University, Singapore",
    languages: "English / Mandarin",
    bio: "Experienced in Singapore local education pathways and bilingual teaching.",
    experience: [],
  },
  {
    name: "Christine",
    image: "/tutors/christine_new.png",
    role: "English Tutor",
    subjects: ["English", "Grammar", "Writing"],
    education: "University of Fuzhou, China",
    languages: "English / Mandarin",
    bio: "Specialises in building strong English foundations through structured learning.",
    experience: [],
  },
  {
    name: "Kana",
    image: "/tutors/kana_new.png",
    role: "Japanese Tutor",
    subjects: ["Japanese Language", "Beginner Japanese", "JLPT Preparation"],
    education: "Keio University, Japan",
    languages: "Japanese / English / Mandarin",
    bio: "A patient and structured Japanese tutor who helps students build strong foundations.",
    experience: [],
  },
  {
    name: "Junichi Ro",
    image: "/tutors/Junichi Ro.jpeg",
    role: "Mathematics & English Tutor",
    subjects: ["Mathematics", "English"],
    education: "Bachelor of Science in Mathematics, New York University",
    languages: "English / Japanese",
    bio: "A native bilingual Mathematics and English tutor who helps students build logical thinking, conceptual understanding, and confident problem-solving skills.",
    experience: [],
  },
  {
    name: "Siya",
    image: "/tutors/siya.jpeg",
    role: "Academic Tutor",
    subjects: ["Academic Research", "Essay Writing", "Critical Thinking"],
    education: "Keio University, Japan",
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
    slug: tutorSlug(tutor.name),
  }));
};
