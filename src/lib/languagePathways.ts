import {
  buildEnglishAccessKey,
  ENGLISH_PATHWAYS,
  formatEnglishAccessLabel,
  parseEnglishAccessKey,
} from "@/lib/englishPathways";

export type LanguageTarget = "English" | "Japanese" | "Chinese";

export type LanguageAccessOption = {
  key: string;
  label: string;
  description: string;
  target_language: LanguageTarget;
  pathway: string;
  level: string;
};

export type NonEnglishPathwayConfig = {
  targetLanguage: Exclude<LanguageTarget, "English">;
  label: string;
  pathway: string;
  levelLabel: string;
  levels: string[];
  skillLabel: string;
  skills: string[];
  topicPlaceholder: string;
  focus: string;
};

export const NON_ENGLISH_LANGUAGE_PATHWAYS: Record<
  Exclude<LanguageTarget, "English">,
  NonEnglishPathwayConfig
> = {
  Japanese: {
    targetLanguage: "Japanese",
    label: "Japanese",
    pathway: "JLPT",
    levelLabel: "JLPT Level",
    levels: ["N5", "N4", "N3", "N2", "N1"],
    skillLabel: "Skill",
    skills: ["Vocabulary", "Grammar", "Kanji", "Reading", "Sentence Patterns"],
    topicPlaceholder: "Topic, e.g. daily routines, particles, kanji, travel, school life...",
    focus:
      "JLPT-aligned Japanese practice for vocabulary, grammar, kanji, reading, and sentence patterns.",
  },
  Chinese: {
    targetLanguage: "Chinese",
    label: "Chinese",
    pathway: "HSK",
    levelLabel: "HSK Level",
    levels: ["HSK 1", "HSK 2", "HSK 3", "HSK 4", "HSK 5", "HSK 6"],
    skillLabel: "Skill",
    skills: ["Vocabulary", "Grammar", "Characters", "Reading", "Sentence Structure"],
    topicPlaceholder: "Topic, e.g. family, school, food, travel, sentence structure...",
    focus:
      "HSK-aligned Chinese practice for vocabulary, grammar, characters, reading, and sentence structure.",
  },
};

export const buildLanguageAccessKey = (
  targetLanguage: LanguageTarget,
  pathway: string,
  level: string
) => `${targetLanguage}::${pathway}::${level}`;

export const parseLanguageAccessKey = (value: string) => {
  const parsedEnglish = parseEnglishAccessKey(value);
  if (parsedEnglish) return parsedEnglish;

  const [targetLanguage, pathway, level] = value.split("::");

  if (!targetLanguage || !pathway || !level) return null;
  if (!["English", "Japanese", "Chinese"].includes(targetLanguage)) return null;

  return { targetLanguage, pathway, level };
};

export const LANGUAGE_ACCESS_OPTIONS: Array<{
  group: string;
  description: string;
  items: LanguageAccessOption[];
}> = [
  {
    group: "English Pathways",
    description: "MAP, WIDA, CAT4, AEIS, O-Level English, TOEFL, and IELTS access.",
    items: ENGLISH_PATHWAYS.flatMap((pathway) =>
      pathway.levels.map((level) => ({
        key: buildEnglishAccessKey(pathway.key, level),
        label: formatEnglishAccessLabel(pathway.key, level),
        description: pathway.levelLabel,
        target_language: "English" as const,
        pathway: pathway.key,
        level,
      }))
    ),
  },
  {
    group: "Japanese Pathway",
    description: "JLPT access by level. No generic grades.",
    items: NON_ENGLISH_LANGUAGE_PATHWAYS.Japanese.levels.map((level) => ({
      key: buildLanguageAccessKey("Japanese", "JLPT", level),
      label: `JLPT ${level}`,
      description: NON_ENGLISH_LANGUAGE_PATHWAYS.Japanese.levelLabel,
      target_language: "Japanese" as const,
      pathway: "JLPT",
      level,
    })),
  },
  {
    group: "Chinese Pathway",
    description: "HSK access by level. No generic grades.",
    items: NON_ENGLISH_LANGUAGE_PATHWAYS.Chinese.levels.map((level) => ({
      key: buildLanguageAccessKey("Chinese", "HSK", level),
      label: level,
      description: NON_ENGLISH_LANGUAGE_PATHWAYS.Chinese.levelLabel,
      target_language: "Chinese" as const,
      pathway: "HSK",
      level,
    })),
  },
];

export const ALL_LANGUAGE_ACCESS_OPTIONS = LANGUAGE_ACCESS_OPTIONS.flatMap(
  (group) => group.items
);
