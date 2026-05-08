import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import { Resend } from "resend";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

dotenv.config();
//const supabaseAdmin = createClient(
  //process.env.SUPABASE_URL,
  //process.env.SUPABASE_SERVICE_ROLE_KEY
//);

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
      <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        style="
          background:#f4f4f4;
          padding:40px 0;
          font-family:Arial,sans-serif;
        "
      >
        <tr>
          <td align="center">

            <table
              width="680"
              cellpadding="0"
              cellspacing="0"
              style="
                background:#ffffff;
                border-radius:24px;
                overflow:hidden;
                box-shadow:0 10px 30px rgba(0,0,0,0.06);
              "
            >

              <!-- HEADER -->
              <tr>
                <td
                  align="center"
                  style="
                    padding:50px 40px 30px;
                    background:#ffffff;
                  "
                >

                  <img
                    src="https://lunastudies.com/lunalogo.png"
                    width="120"
                    style="margin-bottom:20px;"
                  />

                  <h1 style="
                    margin:0;
                    color:#08275c;
                    font-size:34px;
                    font-weight:700;
                  ">
                    Thank You For Your Enquiry
                  </h1>

                  <p style="
                    margin-top:18px;
                    color:#666;
                    font-size:18px;
                    line-height:1.8;
                    max-width:520px;
                  ">
                    We have successfully received your enquiry.
                    Our team will review your request and
                    get back to you as soon as possible.
                  </p>

                </td>
              </tr>

              <!-- CONTENT -->
              <tr>
                <td style="padding:0 50px 40px;">

                  <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    style="
                      background:#fafafa;
                      border-radius:18px;
                      padding:30px;
                    "
                  >

                    <tr>
                      <td style="
                        color:#08275c;
                        font-size:16px;
                        font-weight:bold;
                        padding-bottom:18px;
                      ">
                        Enquiry Details
                      </td>
                    </tr>

                    <tr>
                      <td style="padding-bottom:14px;">
                        <strong>Name:</strong> ${name}
                      </td>
                    </tr>

                    <tr>
                      <td style="padding-bottom:14px;">
                        <strong>Email:</strong> ${email}
                      </td>
                    </tr>

                    <tr>
                      <td style="padding-bottom:14px;">
                        <strong>Subject:</strong> ${subject || "-"}
                      </td>
                    </tr>

                    <tr>
                      <td style="padding-bottom:14px;">
                        <strong>Grade:</strong> ${grade || "-"}
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <strong>Message:</strong><br /><br />
                        ${message || "-"}
                      </td>
                    </tr>

                  </table>

                </td>
              </tr>

              <!-- CONTACT SECTION -->
              <tr>
                <td style="
                  background:#f8f8f8;
                  padding:35px;
                ">

                  <table width="100%">
                    <tr>

                      <!-- WECHAT -->
                      <td align="center" width="33%">
                        <img
                          src="https://cdn.simpleicons.org/wechat/07C160"
                          width="34"
                          style="margin-bottom:10px;"
                        />

                        <p style="
                          margin:0;
                          font-size:16px;
                          font-weight:bold;
                          color:#08275c;
                        ">
                          WeChat ID
                        </p>

                        <p style="
                          margin-top:8px;
                          color:#555;
                        ">
                          luna.education
                        </p>
                      </td>

                      <!-- WHATSAPP -->
                      <td align="center" width="33%">
                        <img
                          src="https://cdn-icons-png.flaticon.com/512/733/733585.png"
                          width="34"
                          style="margin-bottom:10px;"
                        />

                        <p style="
                          margin:0;
                          font-size:16px;
                          font-weight:bold;
                          color:#08275c;
                        ">
                          WhatsApp
                        </p>

                        <p style="
                          margin-top:8px;
                          color:#555;
                        ">
                          +65 XXXX XXXX
                        </p>
                      </td>

                      <!-- WEBSITE -->
                      <td align="center" width="33%">
                        <img
                          src="https://cdn-icons-png.flaticon.com/512/1006/1006771.png"
                          width="34"
                          style="margin-bottom:10px;"
                        />

                        <p style="
                          margin:0;
                          font-size:16px;
                          font-weight:bold;
                          color:#08275c;
                        ">
                          Website
                        </p>

                        <p style="
                          margin-top:8px;
                          color:#555;
                        ">
                          lunastudies.com
                        </p>
                      </td>

                    </tr>
                  </table>

                </td>
              </tr>

            </table>

          </td>
        </tr>
      </table>
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

app.post("/api/send-lesson-reminders", async (req, res) => {
  // 找 lesson_date <= 昨天
  // status = pending
  // reminder_sent_at is null
  // 按 tutor_id group
  // 每个 tutor 发一封 email
  // 发完 update reminder_sent_at
});


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
app.post("/api/luna-chat", async (req, res) => {
  try {
    console.log("🌙 LUNA CHAT HIT:", req.body);

    const { messages } = req.body;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:  `
              You are Luna AI Consultant for LUNA Education.

              You are NOT a generic AI chatbot.
              You behave like a professional international education consultant.

              ==================================================
              ABOUT LUNA EDUCATION
              ==================================================

              LUNA Education is a premium personalised 1-to-1 international education platform.

              We specialise in:
              - MAP
              - CAT4
              - WIDA
              - AEIS
              - TOEFL
              - IELTS
              - SAT
              - IB
              - IGCSE
              - O-Level
              - A-Level
              - AP
              - International school preparation
              - School admissions
              - Interview preparation
              - English communication
              - Academic English
              - Personalised learning support

              Lessons are mainly ONLINE.

              Offline lessons may be available only in:
              - Singapore
              - Tokyo

              LUNA focuses on:
              - personalised learning
              - structured progress tracking
              - detailed assessments
              - tutor matching
              - long-term academic growth
              - confidence building
              - international education systems

              LUNA does NOT provide:
              - group classes
              - random crash courses
              - guaranteed score promises

              Do NOT invent services, prices, packages, schedules, or guarantees.

              If unsure, say:
              "Please enquire with our team for more details."

              ==================================================
              LUNA SERVICE FLOW
              ==================================================

              LUNA follows a structured learning system:

              1. Trial Assessment
              - Evaluate the student’s level
              - Understand strengths and weaknesses
              - Understand learning style and goals

              2. Comprehensive Report
              - Reading
              - Writing
              - Grammar
              - Vocabulary
              - Listening
              - Speaking
              - Skill gap analysis

              3. Tutor Matching
              - Match based on:
                - student personality
                - learning style
                - academic goals
                - current level

              4. Progress Tracking
              - Feedback every 3 lessons
              - Continuous adjustment
              - Structured monitoring

              5. Final Evaluation
              - Compare before/after progress
              - Show measurable improvement
              - Provide recommendations

              ==================================================
              YOUR ROLE
              ==================================================

              Your job is to:
              - guide parents professionally
              - identify student needs
              - recommend suitable programmes
              - explain Luna’s learning system clearly
              - build trust and professionalism

              You should:
              - ask smart follow-up questions
              - keep replies concise
              - sound warm and premium
              - sound human
              - sound calm and experienced

              You should NEVER:
              - sound robotic
              - sound overly salesy
              - give long essays
              - use emojis excessively
              - overexplain
              - invent information

              ==================================================
              IMPORTANT BEHAVIOUR RULES
              ==================================================

              When parents ask vague questions:
              → ask clarifying questions first.

              Examples:
              - student age
              - school curriculum
              - current level
              - target schools
              - exam type
              - preferred language
              - strengths/weaknesses

              When parents mention weak foundations:
              → reassure calmly and explain structured support.

              When parents ask about results:
              → explain progress tracking, assessments, and personalised learning.

              When parents ask about tutors:
              → explain tutor matching carefully.

              When parents ask about lesson mode:
              → explain online-first model professionally.

              ==================================================
              TONE
              ==================================================

              Tone should feel:
              - premium
              - trustworthy
              - structured
              - modern
              - international
              - educational consultant style

              NOT:
              - pushy sales
              - overly casual
              - AI-like
              - childish

              ==================================================
              GOOD RESPONSE STYLE
              ==================================================

              GOOD:
              "May I know your child’s current grade level and whether they are preparing for school admissions or academic improvement?"

              GOOD:
              "We usually begin with an assessment so we can understand the student’s current level, learning gaps, and learning style before recommending a suitable plan."

              GOOD:
              "For students with weaker foundations, we typically rebuild core concepts step-by-step while tracking progress closely."

              BAD:
              "OMG we can definitely help!!!"

              BAD:
              Long AI-generated essays.

              BAD:
              Inventing fake pricing or guarantees.

              ==================================================
              CONTACT INFORMATION
              ==================================================

              WeChat:
              luna.education

              WhatsApp:
              +65 94235165

              If parents request detailed consultation:
              "Please contact our team directly via WhatsApp or WeChat for personalised guidance."
          `,
        },
        ...messages.map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.text,
        })),
      ],
    });

    res.json({ reply: response.output_text });
  } catch (error) {
    console.error("🌙 LUNA CHAT ERROR:", error);

    res.status(500).json({
      reply: "Sorry, something went wrong.",
      error: error.message,
    });
  }
});

app.post("/api/send-lesson-reminders", async (req, res) => {
  try {
    console.log("📌 Lesson reminder API hit");

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const yesterdayDate = yesterday.toISOString().split("T")[0];

    const { data: lessons, error } = await supabaseAdmin
      .from("tutor_lessons")
      .select(`
        id,
        tutor_id,
        student_id,
        lesson_date,
        hours,
        status,
        reminder_sent_at
      `)
      .eq("status", "pending")
      .is("reminder_sent_at", null)
      .lte("lesson_date", yesterdayDate);

    if (error) {
      console.error("Lesson reminder fetch error:", error);
      return res.status(500).json({ success: false, error });
    }

    if (!lessons || lessons.length === 0) {
      return res.json({
        success: true,
        message: "No pending lesson reminders.",
      });
    }

    const tutorIds = [...new Set(lessons.map((l) => l.tutor_id))];
    const studentIds = [...new Set(lessons.map((l) => l.student_id))];

    const { data: tutors } = await supabaseAdmin
      .from("profiles")
      .select("id, name, email")
      .in("id", tutorIds);

    const { data: students } = await supabaseAdmin
      .from("profiles")
      .select("id, name")
      .in("id", studentIds);

    const tutorMap = new Map(tutors?.map((t) => [t.id, t]));
    const studentMap = new Map(students?.map((s) => [s.id, s]));

    const groupedByTutor = lessons.reduce((acc, lesson) => {
      if (!acc[lesson.tutor_id]) acc[lesson.tutor_id] = [];
      acc[lesson.tutor_id].push(lesson);
      return acc;
    }, {});

    const sentResults = [];

    for (const tutorId of Object.keys(groupedByTutor)) {
      const tutor = tutorMap.get(tutorId);
      const tutorLessons = groupedByTutor[tutorId];

      if (!tutor?.email) {
        console.log("No tutor email found:", tutorId);
        continue;
      }

      const lessonRows = tutorLessons
        .map((lesson) => {
          const student = studentMap.get(lesson.student_id);
          return `
            <tr>
              <td style="padding:10px;border-bottom:1px solid #e5e7eb;">
                ${lesson.lesson_date}
              </td>
              <td style="padding:10px;border-bottom:1px solid #e5e7eb;">
                ${student?.name || lesson.student_id}
              </td>
              <td style="padding:10px;border-bottom:1px solid #e5e7eb;">
                ${lesson.hours} hour(s)
              </td>
            </tr>
          `;
        })
        .join("");

      const emailResult = await sendEmailWithRetry({
        from: "Luna Education <admin@lunastudies.com>",
        to: tutor.email,
        subject: "Lesson Check-off Reminder",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Lesson Check-off Reminder</h2>

            <p>Hi ${tutor.name || "Tutor"},</p>

            <p>
              You have ${tutorLessons.length} pending lesson record(s)
              that have not been updated yet.
            </p>

            <table style="border-collapse:collapse;width:100%;margin-top:20px;">
              <thead>
                <tr>
                  <th align="left" style="padding:10px;border-bottom:2px solid #0b234a;">Date</th>
                  <th align="left" style="padding:10px;border-bottom:2px solid #0b234a;">Student</th>
                  <th align="left" style="padding:10px;border-bottom:2px solid #0b234a;">Hours</th>
                </tr>
              </thead>
              <tbody>
                ${lessonRows}
              </tbody>
            </table>

            <p style="margin-top:24px;">
              Please log in to Luna Education and check off these lesson records.
            </p>

            <p>
              Best regards,<br/>
              Luna Education Team
            </p>
          </div>
        `,
      });

      if (emailResult.error) {
        console.error("Reminder email error:", emailResult.error);
        continue;
      }

      const lessonIds = tutorLessons.map((l) => l.id);

      await supabaseAdmin
        .from("tutor_lessons")
        .update({ reminder_sent_at: new Date().toISOString() })
        .in("id", lessonIds);

      sentResults.push({
        tutor_id: tutorId,
        tutor_email: tutor.email,
        lesson_count: tutorLessons.length,
      });
    }

    return res.json({
      success: true,
      sent: sentResults,
    });
  } catch (err) {
    console.error("Lesson reminder API error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

app.post("/api/send-package-low-balance-reminders", async (req, res) => {
  try {
    console.log("📦 Package low balance reminder API hit");

    const { data: packages, error: packageError } = await supabaseAdmin
      .from("student_packages")
      .select("id, student_id, package_hours, package_name, purchased_at, low_balance_reminder_sent_at")
      .is("low_balance_reminder_sent_at", null);

    if (packageError) {
      return res.status(500).json({ success: false, error: packageError });
    }

    if (!packages || packages.length === 0) {
      return res.json({
        success: true,
        message: "No packages to check.",
      });
    }

    const studentIds = [...new Set(packages.map((pkg) => pkg.student_id))];

    const { data: lessons, error: lessonError } = await supabaseAdmin
      .from("tutor_lessons")
      .select("student_id, hours, status")
      .in("student_id", studentIds)
      .in("status", ["completed", "student_absent"]);

    if (lessonError) {
      return res.status(500).json({ success: false, error: lessonError });
    }

    const { data: students, error: studentError } = await supabaseAdmin
      .from("profiles")
      .select("id, name, email")
      .in("id", studentIds);

    if (studentError) {
      return res.status(500).json({ success: false, error: studentError });
    }

    const usedHoursByStudent = new Map();

    for (const lesson of lessons || []) {
      const current = usedHoursByStudent.get(lesson.student_id) || 0;
      usedHoursByStudent.set(
        lesson.student_id,
        current + Number(lesson.hours || 0)
      );
    }

    const studentMap = new Map(students?.map((student) => [student.id, student]));

    const packageGroupsByStudent = new Map();

    for (const pkg of packages) {
      if (!packageGroupsByStudent.has(pkg.student_id)) {
        packageGroupsByStudent.set(pkg.student_id, []);
      }
      packageGroupsByStudent.get(pkg.student_id).push(pkg);
    }

    const lowBalanceStudents = [];

    for (const [studentId, studentPackages] of packageGroupsByStudent.entries()) {
      const purchasedHours = studentPackages.reduce(
        (sum, pkg) => sum + Number(pkg.package_hours || 0),
        0
      );

      const usedHours = usedHoursByStudent.get(studentId) || 0;
      const remaining = purchasedHours - usedHours;

      if (remaining > 0 && remaining <= 2) {
        const student = studentMap.get(studentId);

        lowBalanceStudents.push({
          student_id: studentId,
          student_name: student?.name || studentId,
          purchased_hours: purchasedHours,
          used_hours: usedHours,
          remaining_hours: remaining,
          package_ids: studentPackages.map((pkg) => pkg.id),
        });
      }
    }

    if (lowBalanceStudents.length === 0) {
      return res.json({
        success: true,
        message: "No low balance packages.",
      });
    }

    const rows = lowBalanceStudents
      .map(
        (student) => `
          <tr>
            <td style="padding:10px;border-bottom:1px solid #e5e7eb;">
              ${student.student_name}
            </td>
            <td style="padding:10px;border-bottom:1px solid #e5e7eb;">
              ${student.purchased_hours.toFixed(2)}h
            </td>
            <td style="padding:10px;border-bottom:1px solid #e5e7eb;">
              ${student.used_hours.toFixed(2)}h
            </td>
            <td style="padding:10px;border-bottom:1px solid #e5e7eb;color:#b45309;font-weight:bold;">
              ${student.remaining_hours.toFixed(2)}h
            </td>
          </tr>
        `
      )
      .join("");

    const emailResult = await sendEmailWithRetry({
      from: "Luna Education <admin@lunastudies.com>",
      to: "admin@lunastudies.com",
      subject: "Low Balance Student Package Reminder",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Low Balance Student Package Reminder</h2>

          <p>
            The following student package balance(s) are less than or equal to 2 hours.
          </p>

          <table style="border-collapse:collapse;width:100%;margin-top:20px;">
            <thead>
              <tr>
                <th align="left" style="padding:10px;border-bottom:2px solid #0b234a;">Student</th>
                <th align="left" style="padding:10px;border-bottom:2px solid #0b234a;">Purchased</th>
                <th align="left" style="padding:10px;border-bottom:2px solid #0b234a;">Used</th>
                <th align="left" style="padding:10px;border-bottom:2px solid #0b234a;">Remaining</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>

          <p style="margin-top:24px;">
            Please contact the parent/student to renew or extend lesson hours.
          </p>

          <p>
            Best regards,<br/>
            Luna Education System
          </p>
        </div>
      `,
    });

    if (emailResult.error) {
      return res.status(500).json({
        success: false,
        error: emailResult.error,
      });
    }

    const allPackageIds = lowBalanceStudents.flatMap((student) => student.package_ids);

    await supabaseAdmin
      .from("student_packages")
      .update({
        low_balance_reminder_sent_at: new Date().toISOString(),
      })
      .in("id", allPackageIds);

    return res.json({
      success: true,
      sent_to: "admin@lunastudies.com",
      low_balance_count: lowBalanceStudents.length,
      low_balance_students: lowBalanceStudents,
    });
  } catch (err) {
    console.error("Package reminder API error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
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
