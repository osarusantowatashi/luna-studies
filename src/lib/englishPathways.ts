export type EnglishPathwayKey =
  | "MAP"
  | "WIDA"
  | "CAT4"
  | "AEIS"
  | "O-Level English"
  | "TOEFL"
  | "IELTS";

type EnglishPathwayConfig = {
  key: EnglishPathwayKey;
  levelLabel: string;
  levels: string[];
  variantLabel?: string;
  variants?: string[];
  skillLabel: string;
  skills: string[];
  difficultyLabel?: string;
  difficulties?: string[];
  topicPlaceholder: string;
  useGradeAccess: boolean;
};

const K12_GRADES = [
  "Kindergarten",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
];

export const ENGLISH_PATHWAYS: EnglishPathwayConfig[] = [
  {
    key: "MAP",
    levelLabel: "Grade",
    levels: K12_GRADES,
    skillLabel: "Skill",
    skills: ["Reading", "Vocabulary", "Language Usage"],
    difficultyLabel: "Difficulty",
    difficulties: ["Below Grade", "On Grade", "Above Grade"],
    topicPlaceholder: "Topic, e.g. ecosystems, school routines, character traits...",
    useGradeAccess: true,
  },
  {
    key: "WIDA",
    levelLabel: "Grade Band",
    levels: ["K-2", "3-5", "6-8", "9-12"],
    skillLabel: "Domain",
    skills: ["Reading", "Writing", "Academic Vocabulary", "Grammar"],
    difficultyLabel: "Language Level",
    difficulties: ["Beginner", "Intermediate", "Advanced"],
    topicPlaceholder: "Topic, e.g. classroom language, science explanation, social studies...",
    useGradeAccess: false,
  },
  {
    key: "CAT4",
    levelLabel: "Grade",
    levels: K12_GRADES.slice(1),
    skillLabel: "Battery",
    skills: [
      "Verbal Reasoning",
      "Non-verbal Reasoning",
      "Quantitative Reasoning",
      "Spatial Reasoning",
    ],
    topicPlaceholder: "Topic, e.g. word relationships, number patterns, figure matrices...",
    useGradeAccess: true,
  },
  {
    key: "AEIS",
    levelLabel: "Level",
    levels: ["Primary", "Secondary"],
    skillLabel: "Skill",
    skills: [
      "Grammar",
      "Vocabulary",
      "Cloze",
      "Reading Comprehension",
      "Sentence Transformation",
      "Composition Planning",
    ],
    topicPlaceholder: "Topic, e.g. school life, everyday situations, narrative writing...",
    useGradeAccess: false,
  },
  {
    key: "O-Level English",
    levelLabel: "Level",
    levels: ["O-Level"],
    skillLabel: "Skill",
    skills: [
      "Grammar",
      "Vocabulary",
      "Cloze",
      "Reading Comprehension",
      "Sentence Transformation",
      "Composition Planning",
    ],
    topicPlaceholder: "Topic, e.g. argumentative writing, comprehension, editing...",
    useGradeAccess: false,
  },
  {
    key: "TOEFL",
    levelLabel: "Level",
    levels: ["Foundation", "Intermediate", "Advanced"],
    skillLabel: "Practice Focus",
    skills: ["Reading", "Writing", "Vocabulary", "Grammar"],
    topicPlaceholder: "Topic, e.g. campus life, biology lecture, academic reading...",
    useGradeAccess: false,
  },
  {
    key: "IELTS",
    levelLabel: "Target Band",
    levels: ["4.0-5.0", "5.5-6.0", "6.5-7.0", "7.5+"],
    variantLabel: "Module",
    variants: ["Academic", "General Training"],
    skillLabel: "Practice Focus",
    skills: ["Reading", "Writing", "Vocabulary", "Grammar"],
    topicPlaceholder: "Topic, e.g. technology, environment, work, education...",
    useGradeAccess: false,
  },
];

export const ENGLISH_PATHWAY_KEYS = ENGLISH_PATHWAYS.map((pathway) => pathway.key);

export const getEnglishPathway = (key: string) =>
  ENGLISH_PATHWAYS.find((pathway) => pathway.key === key) || ENGLISH_PATHWAYS[0];

export const buildEnglishAccessKey = (pathway: string, level: string) =>
  `English::${pathway}::${level}`;

export const parseEnglishAccessKey = (value: string) => {
  const [targetLanguage, pathway, level] = value.split("::");

  if (targetLanguage !== "English" || !pathway || !level) return null;

  return { targetLanguage, pathway, level };
};

export const formatEnglishAccessLabel = (pathway: string, level: string) =>
  `${pathway} ${level}`;
