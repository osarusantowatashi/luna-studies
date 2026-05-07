import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import { Resend } from "resend";
import fs from "fs";
import path from "path";

dotenv.config();
console.log("RESEND KEY:", process.env.RESEND_API_KEY);

const app = express();
app.use(cors());
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmailWithRetry = async (emailPayload, maxRetries = 3) => {
  let lastResponse = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`Sending email attempt ${attempt}/${maxRetries}`);

    const response = await resend.emails.send(emailPayload);
    lastResponse = response;

    if (!response.error) {
      console.log("Email sent successfully");
      return response;
    }

    console.error(`Email attempt ${attempt} failed:`, response.error);

    if (attempt < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }

  return lastResponse;
};

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

app.post("/api/send-admin-enquiry-email", async (req, res) => {
  try {
    console.log("🔥 ADMIN ENQUIRY EMAIL API HIT");
    console.log("BODY:", req.body);

    const {
      subject,
      name,
      email,
      grade,
      message,
      created_at,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: "Missing name or email",
      });
    }

    const response = await sendEmailWithRetry({
      from: "Luna Education <admin@lunastudies.com>",
      to: process.env.ENQUIRY_TO_EMAIL || "enquiries@lunastudies.com",
      reply_to: email,
      subject: `New Luna Enquiry${subject ? `: ${subject}` : ""}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>New Luna Education Enquiry</h2>

          <p><strong>Subject:</strong> ${subject || "-"}</p>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Grade:</strong> ${grade || "-"}</p>
          <p><strong>Created At:</strong> ${created_at || new Date().toISOString()}</p>

          <hr />

          <p><strong>Message:</strong></p>
          <p>${message || "-"}</p>
        </div>
      `,
    });

    const userConfirmation = await sendEmailWithRetry({
      from: "Luna Education <admin@lunastudies.com>",
      to: email,
      subject: "We received your Luna Education enquiry",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Thank you for your enquiry</h2>
    
          <p>Hi ${name},</p>
    
          <p>
            Thank you for contacting Luna Education.
            We have received your enquiry and our team
            will get back to you soon.
          </p>
    
          <p><strong>Subject:</strong> ${subject || "-"}</p>
          <p><strong>Grade:</strong> ${grade || "-"}</p>
    
          <p><strong>Your message:</strong></p>
          <p>${message || "-"}</p>
    
          <hr />
    
          <p>
            Best regards,<br />
            Luna Education Team
          </p>
        </div>
      `,
    });
    
    if (response.error) {
      return res.status(500).json({
        success: false,
        error: response.error,
      });
    }
    
    if (userConfirmation.error) {
      return res.status(500).json({
        success: false,
        error: userConfirmation.error,
      });
    }
    
    return res.json({
      success: true,
      response,
      userConfirmation,
    });

  } catch (error) {
    console.error("ADMIN ENQUIRY EMAIL ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Failed to send admin enquiry email",
    });
  }
});

/* =========================
   HELPERS
========================= */

const safeName = (text = "") =>
  text.replace(/\s+/g, "_").replace(/[^\w]/g, "");

const getExampleFile = (examType, grade, skill) => {
  const possiblePaths = [
    // examples/MAP/Grade_5/Vocabulary.txt
    path.join(
      process.cwd(),
      "examples",
      safeName(examType),
      safeName(grade),
      `${safeName(skill)}.txt`
    ),

    // examples/MAP/Vocabulary.txt
    path.join(
      process.cwd(),
      "examples",
      safeName(examType),
      `${safeName(skill)}.txt`
    ),

    // examples/Vocabulary.txt
    path.join(process.cwd(), "examples", `${safeName(skill)}.txt`),
  ];

  for (const filePath of possiblePaths) {
    console.log("Looking for file:", filePath);

    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      console.log("✅ Example file found");
      console.log("EXAMPLES LENGTH:", content.length);
      return content;
    }
  }

  console.log("❌ No example file found");
  return "";
};

const passageRules = {
  Vocabulary: {
    short: "1–3 sentences (30–80 words)",
    medium: "3–5 sentences (80–150 words)",
    long: "5–8 sentences (150–250 words)",
  },

  "Main Idea": {
    short: "4–6 sentences (120–200 words)",
    medium: "6–10 sentences (200–350 words)",
    long: "10–14 sentences (450–600 words)",
  },

  Inference: {
    short: "4–6 sentences (120–200 words)",
    medium: "6–10 sentences (200–350 words)",
    long: "10–14 sentences (450–600 words)",
  },

  "Detail Questions": {
    short: "3–6 sentences (100–200 words)",
    medium: "6–10 sentences (200–350 words)",
    long: "10–14 sentences (450–600 words)",
  },

};

const examRules = {
  MAP: `
- US-style standardized test
- Clear, student-friendly language
- Focus on skills: main idea, inference, vocabulary in context
- Distractors are plausible but fair
- Passages are moderate length
`,

  AEIS: `
- Singapore English exam style
- Slightly more formal language
- Grammar + comprehension focused
- Vocabulary tends to be practical and school-based
- Questions are more direct
`,

  TOEFL: `
- Academic English
- Formal tone
- Passage often informational (science, history, social studies)
- Questions test inference, detail, vocabulary in context
- Distractors are subtle and tricky
`,

  IELTS: `
- British English tone
- Real-world topics
- Slightly formal but accessible
- Focus on comprehension and reasoning
`,

  WIDA: `
- Language learner focused
- Simplified instructions
- Clear scaffolding
- Emphasis on understanding rather than trickiness
`,

  CAT4: `
- Logic and reasoning focus
- Less language-heavy, more thinking-based
- Abstract or pattern-based when possible
`,
};
const getPassageLength = (skill, grade) => {
  if (!structureRules[skill]?.needsPassage) return null;

  if (["Grade 1", "Grade 2"].includes(grade)) {
    return "100–200 words";
  }

  if (["Grade 3", "Grade 4"].includes(grade)) {
    return "200-350 words";
  }

  if (["Grade 5", "Grade 6"].includes(grade)) {
    return "400-600 words";
  }

  return "600-800 words"; // Grade 8+
};
const structureRules = {
  Vocabulary: {
    needsPassage: true,
    format: `
- Vocabulary-in-context question. Passage must be at least 100 words
- Passage should include the target word.
- Question asks meaning in context or which word can replace the target word.
- Do NOT ask simple definition questions.
`,
  },

  "Main Idea": {
    needsPassage: true,
    format: `
- Passage must have a clear central idea. Passage must be at least 400 words
- Question asks for main idea, central message, or best summary.
- Correct answer summarizes the whole passage.
- Wrong answers are too specific, partially correct, or unrelated.
`,
  },

  Inference: {
    needsPassage: true,
    format: `
- Passage must imply information without directly stating it. Passage must be at least 400 words
- Question asks what the reader can infer.
- Correct answer must be supported by clues in the passage.
- Wrong answers may sound possible but are not supported.
`,
  },

  "Detail Questions": {
    needsPassage: true,
    format: `
- Passage must contain clear supporting details. Passage must be at least 400 words
- Question asks about a specific detail from the passage.
- Correct answer must be directly supported.
- Wrong answers should be close but inaccurate.
`,
  },

  Grammar: {
    needsPassage: false,
    format: `
- Sentence-level grammar questions only.
- No passage.
- Use fill-in-the-blank, sentence correction, tense, agreement, punctuation, connectors, or grammar choice.
- Do NOT generate vocabulary-in-context questions.
- Do NOT generate reading comprehension questions.
`,
  },

  "Math Problem Solving": {
    needsPassage: false,
    format: `
- Create math word problems or calculation questions.
- Question should be clear and grade-appropriate.
- Options should be plausible numerical answers.
`,
  },
};

const gradeRules = {
  "Grade 1": "- Very simple vocabulary. Short sentences. Basic concepts.",
  "Grade 2": "- Simple vocabulary. Short sentences. Direct questions.",
  "Grade 3": "- Simple school-level vocabulary. Some reasoning allowed.",
  "Grade 4": "- Moderate vocabulary. Clear but slightly longer sentences.",
  "Grade 5": "- Grade-level vocabulary. Passage can be 120–250 words if needed.",
  "Grade 6": "- Upper primary level. More reasoning and stronger distractors.",
  "Grade 7": "- Middle school level. More nuanced vocabulary and reasoning.",
  "Grade 8": "- Middle school advanced. Longer passages and closer distractors.",
  "Grade 9": "- Academic vocabulary. More abstract reasoning.",
  "Grade 10": "- Strong academic tone. Complex sentence structures.",
  Beginner: "- Very simple language and direct questions.",
  Intermediate: "- Moderate language and some reasoning.",
  Advanced: "- Complex language, subtle reasoning, and strong distractors.",
};

const difficultyRules = {
  Easy: `
- Use easier vocabulary.
- Make the correct answer clear.
- Distractors should be less tricky.
`,

  Medium: `
- Use grade-level vocabulary.
- Include plausible distractors.
- Require some thinking but remain fair.
`,

  Hard: `
- Use more advanced vocabulary and sentence structures.
- Distractors should be close and tempting.
- Require careful reasoning.
`,

  Advanced: `
- Use academic language.
- Require subtle reasoning.
- Distractors should be highly plausible.
`,
};

/* =========================
   OPENAI GENERATOR
========================= */

app.post("/api/generate-questions", async (req, res) => {
  try {
    console.log("🔥 GENERATE ROUTE HIT");
    console.log("BODY:", req.body);

    const {
      examType,
      grade,
      skill,
      difficulty,
      questionCount,
      extraPrompt,
    } = req.body;

    const examples = getExampleFile(examType, grade, skill);
    const selectedStructure = structureRules[skill] || {
      needsPassage: true,
      format: "- Create realistic exam-style questions for the selected skill.",
    };


let passageLength = "No passage needed.";

if (
  skill === "Main Idea" ||
  skill === "Inference" ||
  skill === "Detail Questions"
) {
  if (difficulty === "Easy") {
    passageLength = "Passage must be 200-380 words.";
  }

  else if (difficulty === "Medium") {
    passageLength = "Passage must be 300-400 words.";
  }

  else if (difficulty === "Hard") {
    passageLength = "Passage must be 550-700 words.";
  }

  else if (difficulty === "Advanced") {
    passageLength = "Passage must be 600-800 words.";
  }
}

if (skill === "Vocabulary") {
  if (difficulty === "Easy") {
    passageLength = "Passage must be 40-80 words.";
  }

  else if (difficulty === "Medium") {
    passageLength = "Passage must be 80-120 words.";
  }

  else if (difficulty === "Hard") {
    passageLength = "Passage must be 150-250 words.";
  }

  else if (difficulty === "Advanced") {
    passageLength = "Passage must be 250-400 words.";
  }
}

    const prompt = `
You are a professional exam question writer.


SELECTED SETTINGS:
Exam Type: ${examType}
Grade / Level: ${grade}
Skill / Question Type: ${skill}
Difficulty: ${difficulty}
Number of questions: ${questionCount}

STYLE EXAMPLES FROM FILE:
${examples || "No example file found. Use realistic exam style."}

PASSAGE LENGTH RULES:
${structureRules[skill]?.needsPassage ? `
- Passage MUST follow this length: ${passageLength}
- Do NOT generate passages shorter or longer than this range
` : `
- No passage allowed. "passage" must be null
`}

EXAM STYLE RULES:
${examRules[examType] || "Match a realistic exam style."}

STRUCTURE RULES:
Needs passage: ${selectedStructure.needsPassage}
${selectedStructure.format}

GRADE RULES:
${gradeRules[grade] || "- Match the selected grade or level appropriately."}

DIFFICULTY RULES:
${difficultyRules[difficulty] || "- Match the selected difficulty appropriately."}
CRITICAL RULES (NON-NEGOTIABLE):

1. STRUCTURE ENFORCEMENT
- If Needs passage = true → EVERY question MUST include a passage
- If Needs passage = false → ALL questions MUST have "passage": null
- ANY violation = WRONG → regenerate internally before answering

2. SKILL ENFORCEMENT
- You MUST follow the exact question type defined by the skill
- DO NOT switch to another question type
- Grammar ≠ Vocabulary ≠ Reading ≠ Writing

3. GRAMMAR-SPECIFIC OVERRIDE
- If Skill = Grammar:
  - NEVER generate a passage
  - NEVER use "in the passage"
  - NEVER create vocabulary-in-context questions
  - ONLY create sentence-level grammar questions

4. SELF-CHECK (IMPORTANT)
Before returning:
- Check if output matches skill
- Check if structure matches Needs passage
- If not → fix it before returning
- count the number of words in each passage. if it is below the required range, expand it! DO NOT return short passages
5. EXAM ENFORCEMENT:
- You MUST match the style of the selected exam
- Do NOT generate generic questions
- If the question could belong to any exam → it is WRONG
- Adjust tone, difficulty, and structure based on exam type

6. PASSAGE CONTROL:
- If passage is required → MUST match the specified length range
- If passage is too short → regenerate internally
- If no passage is required → MUST return "passage": null

If you fail to follow these rules, your answer is incorrect.
Extra instructions:
${extraPrompt || ""}

Return ONLY valid JSON array in this exact format:
[
  {
    "passage": "... or null",
    "question_text": "...",
    "option_a": "...",
    "option_b": "...",
    "option_c": "...",
    "option_d": "...",
    "correct_answer": "option_a",
    "explanation": "..."
  }
]
`;

    const countWords = (text = "") =>
  text.trim().split(/\s+/).filter(Boolean).length;

const cleanJSON = (text) =>
  text.replace(/```json/g, "").replace(/```/g, "").trim();

const needsPassage = selectedStructure.needsPassage;
const getMinWords = (skill, difficulty) => {
  if (!selectedStructure.needsPassage) return 0;

  if (skill === "Vocabulary") {
  if (difficulty === "Easy") return 50;
  if (difficulty === "Medium") return 80;
  if (difficulty === "Hard") return 100;
  if (difficulty === "Advanced") return 120;
}

  if (difficulty === "Easy") return 200;
  if (difficulty === "Medium") return 300;
  if (difficulty === "Hard") return 500;
  if (difficulty === "Advanced") return 650;

  return 250;
};

const minWords = getMinWords(skill, difficulty);

let finalData = null;
let retryPrompt = prompt;

for (let attempt = 0; attempt < 5; attempt++) {
  console.log(`🧠 Attempt ${attempt + 1}`);

  const response = await client.responses.create({
    model: "gpt-4.1",
    input: retryPrompt,
  });

  const text = cleanJSON(response.output_text);

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    console.log("❌ JSON parse failed");
    retryPrompt += "\nReturn valid JSON only.";
    continue;
  }

  let valid = true;

  if (needsPassage) {
    for (const q of parsed) {
      const wc = countWords(q.passage || "");
      console.log("PASSAGE WORD COUNT:", wc);

      if (wc < minWords) {
        valid = false;
        break;
      }
    }
  }

  if (valid) {
    finalData = parsed;
    console.log("✅ Passed validation");
    break;
  }

  console.log("❌ Too short. Retrying with stronger instruction.");

  retryPrompt = `
${prompt}

YOUR LAST OUTPUT FAILED BECAUSE THE PASSAGE WAS TOO SHORT.

MANDATORY:
- Each passage must be at least ${minWords} words.
- Count the words before returning.
- Do not return 1–3 sentence passages.
- Expand with details, examples, transitions, and context.
`;
}

if (!finalData) {
  return res.status(500).json({
    error: `Failed to generate passages longer than ${minWords} words.`,
  });
}

return res.json({ text: JSON.stringify(finalData) });
  } catch (err) {
    console.error("GENERATION ERROR:", err);
    return res.status(500).json({
      error: err.message || "Failed to generate questions",
    });
  }
});

/* =========================
   START SERVER
========================= */

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});