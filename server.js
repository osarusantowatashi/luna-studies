import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import { Resend } from "resend";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const chatRateLimitMap = new Map();

const getClientIp = (req) => {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown"
  );
};

const checkRateLimit = (ip, limit = 20, windowMs = 60 * 1000) => {
  const now = Date.now();
  const record = chatRateLimitMap.get(ip) || { count: 0, start: now };

  if (now - record.start > windowMs) {
    chatRateLimitMap.set(ip, { count: 1, start: now });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count += 1;
  chatRateLimitMap.set(ip, record);
  return true;
};



dotenv.config();
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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

const requireAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return res.status(500).json({ error: "Profile check failed" });
    }

    const isAdmin =
      user.email === "admin@lunastudies.com" || profile?.role === "admin";

    if (!isAdmin) {
      return res.status(403).json({ error: "Admin access only" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ error: "Admin auth failed" });
  }
};

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
                          luna-education
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

                        <p style="margin-top:8px;">
                          <a
                            href="https://wa.me/6581381999?text=Hello%20LUNA%20Education%2C%20I%20would%20like%20to%20enquire%20about%20lessons."
                            style="
                              color:#25D366;
                              text-decoration:none;
                              font-weight:600;
                            "
                          >
                            +65 8138 1999
                          </a>
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
const VOCAB_BUCKET = "vocab-images";
const STYLE_VERSION = "luna_flashcard_v1";

const GAME_PAIR_COUNT_BY_DIFFICULTY = {
  Easy: 6,
  Medium: 8,
  Hard: 10,
  Advanced: 12,
};

const GAME_VOCAB_DIFFICULTY_RULES = {
  Easy: `
- Use basic everyday vocabulary.
- Suitable for the selected grade.
- Use concrete and easy-to-visualize words.
`,

  Medium: `
- Use slightly more challenging vocabulary.
- Still suitable for the selected grade.
- Prefer school, daily life, actions, emotions, nature, and objects.
`,

  Hard: `
- Use stronger vocabulary, but still age-appropriate.
- Avoid overly abstract academic words for Grade 1–3.
`,

  Advanced: `
- Use the most challenging vocabulary suitable for the selected grade.
- For Grade 1–3, still use visual and child-friendly words.
- For Grade 4–6, academic vocabulary is allowed.
`
};

const normalizeText = (text = "") =>
  String(text).trim().toLowerCase();


const getCoreVocab = (text = "") =>
  normalizeText(text)
    .replace(/^(cute|red|blue|yellow|green|happy|small|big|simple|colorful|wooden|fresh|bright|orange)\s+/i, "")
    .replace(/\s+(color|weather)$/i, "")
    .trim();



const mapWithConcurrency = async (items, limit, asyncMapper) => {
  const results = [];
  let index = 0;

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const currentIndex = index++;
      results[currentIndex] = await asyncMapper(items[currentIndex], currentIndex);
    }
  });

  await Promise.all(workers);
  return results;
};
const getGradeVocabRule = (grade = "Grade 1") => {
  const rules = {
    "Grade 1": `
- Use very basic child vocabulary.
- Use concrete words only.
- Good categories: animals, food, colors, toys, classroom items, body parts, simple actions, weather.
- Avoid abstract words.
`,

    "Grade 2": `
- Use simple daily-life and school vocabulary.
- Words can be slightly harder than Grade 1.
- Good categories: home, school, nature, transport, feelings, simple verbs.
- Avoid academic abstract words.
`,

    "Grade 3": `
- Use lower-primary vocabulary.
- Can include simple descriptive words, actions, places, and school-related words.
- Avoid heavy academic words.
`,

    "Grade 4": `
- Use upper-primary vocabulary.
- Can include common academic words if still visual and child-friendly.
`,

    "Grade 5": `
- Use stronger upper-primary vocabulary.
- Academic school vocabulary is allowed.
- Still keep it useful for children.
`,

    "Grade 6": `
- Use advanced primary / early middle-school vocabulary.
- Academic and reasoning words are allowed.
`,
  };

  return rules[grade] || rules["Grade 1"];
};

const getPairKey = (left = "", right = "") =>
  `${normalizeText(left)}__${normalizeText(right)}`;

const getImageTypeInstruction = (imageType = "object") => {
  const rules = {
    object:
      "Show one clear object only, centered, easy to recognize.",
    animal:
      "Show one cute animal only, centered, full body if possible.",
    person:
      "Show one child or person clearly, friendly and simple.",
    action:
      "Show a child clearly performing the action. The action must be obvious.",
    emotion:
      "Show a child face clearly expressing the emotion. Focus on facial expression.",
    color:
      "Show only a clean color swatch, paint splash, or simple color card. Do not show random objects.",
    place:
      "Show a clear place or building scene, simple and easy for children to recognize.",
    nature:
      "Show one clear natural element, such as sun, tree, flower, rain, cloud, or river.",
    food:
      "Show one clear food item only, centered and appetizing.",
    transport:
      "Show one clear vehicle only, centered.",
    school_item:
      "Show one clear school item only, centered.",
    abstract_concept:
      "Show a simple child-friendly scene that represents the concept clearly. Avoid complex metaphors.",
  };

  return rules[imageType] || rules.object;
};

const generateLunaVocabImage = async (keyword, imageType = "object") => {
  const typeInstruction = getImageTypeInstruction(imageType);

  const prompt = `
Create a premium educational flashcard illustration for the vocabulary concept: "${keyword}".

Image type:
${imageType}

Specific visual instruction:
${typeInstruction}

Style rules:
- Cute minimal educational illustration.
- Single main visual focus.
- Centered composition.
- White or very light warm background.
- Soft pastel colors.
- Rounded friendly shapes.
- Child-friendly.
- Clean and modern.
- No text.
- No letters.
- No watermark.
- No extra distracting objects.
- Consistent LUNA learning app style.
`;

  const result = await client.images.generate({
    model: "gpt-image-1",
    prompt,
    size: "1024x1024",
    quality: "low",
    n: 1,
  });

  return result.data?.[0]?.b64_json || null;
};

const saveVocabImageToStorage = async (keyword, b64, nextCount) => {
  const cleanKeyword = normalizeText(keyword);
  const buffer = Buffer.from(b64, "base64");

  const storagePath = `${STYLE_VERSION}/${cleanKeyword.replace(/\s+/g, "-")}-${nextCount}.png`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(VOCAB_BUCKET)
    .upload(storagePath, buffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (uploadError) {
    console.error("VOCAB IMAGE UPLOAD ERROR:", uploadError);
    return null;
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from(VOCAB_BUCKET)
    .getPublicUrl(storagePath);

  return {
    imageUrl: publicUrlData.publicUrl,
    storagePath,
  };
};

const getOrCreateVocabImage = async (
  vocabWord,
  imageKeyword,
  imageType = "object",
  leftText = null,
  rightText = null,
  languagePair = null
) => {
  const cleanVocabWord = getCoreVocab(vocabWord);
  const cleanKeyword = getCoreVocab(imageKeyword || vocabWord);

  if (!cleanVocabWord && !cleanKeyword) return null;

  const finalVocabWord = cleanVocabWord || cleanKeyword;
  const finalKeyword = cleanKeyword || cleanVocabWord;

  // 1. Reuse existing approved OR needs_review image by vocab_word.
  // This saves image tokens while images are waiting for review.
  const { data: existingByWord, error: wordError } = await supabaseAdmin
    .from("vocab_images")
    .select("*")
    .eq("vocab_word", finalVocabWord)
    .in("status", ["approved", "needs_review"])
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (wordError) {
    console.error("VOCAB IMAGE WORD FETCH ERROR:", wordError);
  }

  if (existingByWord?.image_url) {
    return existingByWord.image_url;
  }

  // 2. Reuse existing approved OR needs_review image by keyword.
  const { data: existingByKeyword, error: keywordError } = await supabaseAdmin
    .from("vocab_images")
    .select("*")
    .eq("keyword", finalKeyword)
    .in("status", ["approved", "needs_review"])
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (keywordError) {
    console.error("VOCAB IMAGE KEYWORD FETCH ERROR:", keywordError);
  }

  if (existingByKeyword?.image_url) {
    return existingByKeyword.image_url;
  }

  // 3. If keyword was rejected, do not generate again.
  const { data: rejected, error: rejectedError } = await supabaseAdmin
    .from("vocab_images")
    .select("*")
    .eq("keyword", finalKeyword)
    .eq("status", "rejected")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (rejectedError) {
    console.error("VOCAB IMAGE REJECTED FETCH ERROR:", rejectedError);
  }

  if (rejected) {
    return null;
  }

  // 4. Check any old record for generation_count protection.
  const { data: existingAny, error: existingAnyError } = await supabaseAdmin
    .from("vocab_images")
    .select("*")
    .eq("keyword", finalKeyword)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingAnyError) {
    console.error("VOCAB IMAGE EXISTING FETCH ERROR:", existingAnyError);
  }

  if (existingAny?.generation_count >= 2) {
    return existingAny.image_url || null;
  }

  let b64 = null;

  try {
    b64 = await generateLunaVocabImage(finalKeyword, imageType);
  } catch (err) {
    console.error("OPENAI IMAGE ERROR:", err.message);
    return existingAny?.image_url || null;
  }

  if (!b64) return existingAny?.image_url || null;

  const nextCount = (existingAny?.generation_count || 0) + 1;
  const saved = await saveVocabImageToStorage(finalKeyword, b64, nextCount);

  if (!saved?.imageUrl) return existingAny?.image_url || null;

  await supabaseAdmin.from("vocab_images").upsert(
    {
      keyword: finalKeyword,
      vocab_word: finalVocabWord,
      left_text: leftText,
      right_text: rightText,
      language_pair: languagePair,
      image_type: imageType,
      image_url: saved.imageUrl,
      storage_path: saved.storagePath,
      style_version: STYLE_VERSION,
      status: "needs_review",
      generation_count: nextCount,
      last_generated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "keyword" }
  );

  return saved.imageUrl;
};

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

app.post("/api/generate-game-questions", requireAdmin, async (req, res) => {
  console.log("🎮 GAME QUESTION ROUTE HIT");
  console.log("BODY:", req.body);

  try {
    const {
      gameType,
      examType = "English Foundation",
      grade,
      skill = "Vocabulary",
      difficulty = "Easy",
      languagePair = "zh_en",
    } = req.body;

    if (gameType !== "memory_flip") {
      return res.status(400).json({
        error: "Only memory_flip is supported now.",
      });
    }

    const pairCountByDifficulty = {
      Easy: 6,
      Medium: 8,
      Hard: 10,
      Advanced: 12,
    };

    const finalDifficulty = pairCountByDifficulty[difficulty]
      ? difficulty
      : "Easy";

    const finalPairCount = pairCountByDifficulty[finalDifficulty];

    const gradeWordRules = {
      "Grade 1": `
Use Grade 1 vocabulary only.
Words must be simple, visual, concrete, and child-friendly.
Good categories: animals, food, toys, classroom objects, home objects, body parts, colors, shapes, weather, simple actions, simple feelings, places, transport, nature.
Do NOT use abstract academic words.
Examples: rabbit, turtle, sandwich, pencil, blanket, jacket, triangle, cloudy, playground, garden, bus, jump, laugh, tired.
`,
      "Grade 2": `
Use Grade 2 vocabulary only.
Words can be slightly richer, but still concrete and visual.
Examples: borrow, carry, village, ladder, pocket, shadow, whisper, careful, bright, forest, market, weekend.
`,
      "Grade 3": `
Use Grade 3 vocabulary only.
Words can include daily life, school, nature, simple reasoning, and useful descriptive words.
Examples: describe, collect, protect, healthy, weather, compare, measure, explain, journey, habit, corner.
`,
      "Grade 4": `
Use Grade 4 vocabulary only.
Words may include stronger school vocabulary, but should still be understandable and useful.
Examples: observe, improve, prepare, direction, distance, material, energy, community, recycle, habitat.
`,
      "Grade 5": `
Use Grade 5 vocabulary only.
Words may include moderate academic vocabulary.
Examples: evidence, solution, environment, responsible, communicate, investigate, support, effect, cause.
`,
      "Grade 6": `
Use Grade 6 vocabulary only.
Words may include stronger academic vocabulary.
Examples: analyze, perspective, consequence, structure, strategy, function, concept, procedure, hypothesis.
`,
    };

    const selectedGradeRule = gradeWordRules[grade] || gradeWordRules["Grade 1"];

    const languageRules = {
      zh_en: `
- Left side must be English.
- Right side must be Simplified Chinese.
Example: { "left": "rabbit", "right": "兔子" }
`,
      zh_ja: `
- Left side must be Simplified Chinese.
- Right side must be Japanese.
Example: { "left": "兔子", "right": "うさぎ" }
`,
      en_ja: `
- Left side must be English.
- Right side must be Japanese.
Example: { "left": "rabbit", "right": "うさぎ" }
`,
    };

    const selectedLanguageRule =
      languageRules[languagePair] || languageRules.zh_en;

    const bannedVocabWords = new Set();
    const bannedPairKeys = new Set();

    // 1. existing game vocab
    const { data: gameRows, error: gameRowsError } = await supabaseAdmin
      .from("game_questions")
      .select("question_data")
      .eq("game_type", gameType)
      .eq("language_pair", languagePair);

    if (gameRowsError) {
      return res.status(500).json({ error: gameRowsError.message });
    }

    for (const row of gameRows || []) {
      const pairs = row.question_data?.pairs || [];

      for (const pair of pairs) {
        const left = normalizeText(pair.left);
        const right = normalizeText(pair.right);
        const vocabWord = normalizeText(pair.vocab_word);
        const imageKeyword = normalizeText(pair.image_keyword);

        if (left && right) bannedPairKeys.add(getPairKey(left, right));
        if (left) bannedVocabWords.add(left);
        if (right) bannedVocabWords.add(right);
        if (vocabWord) bannedVocabWords.add(vocabWord);

        // Do not ban image_keyword directly.
        // It may include adjectives like "cute cat" or "red apple".
      }
    }

    // 2. existing / rejected image vocab


    // 3. mastered vocab within 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: masteredRows, error: masteredRowsError } = await supabaseAdmin
      .from("student_game_pair_history")
      .select("pair_key, left_text, right_text, image_keyword")
      .eq("game_type", gameType)
      .eq("language_pair", languagePair)
      .gte("mastered_at", sevenDaysAgo.toISOString());

    if (masteredRowsError) {
      return res.status(500).json({ error: masteredRowsError.message });
    }

    for (const row of masteredRows || []) {
      const left = normalizeText(row.left_text);
      const right = normalizeText(row.right_text);

      if (row.pair_key) bannedPairKeys.add(row.pair_key);
      if (left) bannedVocabWords.add(left);
      if (right) bannedVocabWords.add(right);

      // Do not ban image_keyword directly.
      // It may include adjectives like "cute cat" or "red apple".
    }

    console.log("BANNED VOCAB COUNT:", bannedVocabWords.size);
    console.log("BANNED PAIR COUNT:", bannedPairKeys.size);

    const bannedVocabListForPrompt = Array.from(bannedVocabWords)
      .map(getCoreVocab)
      .filter(Boolean)
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .sort();

    const bannedPromptText =
      bannedVocabListForPrompt.length > 0
        ? bannedVocabListForPrompt.map((w) => `- ${w}`).join("\n")
        : "- None";

    const cleanedPairs = [];

    const buildGamePrompt = (count) => `
Generate exactly ${count} NEW educational matching pairs for children.

Game Type:
Memory Flip Matching Game

Exam Type:
${examType}

Grade:
${grade}

GRADE RULES:
${selectedGradeRule}

Difficulty:
${finalDifficulty}

IMPORTANT:
Difficulty controls pair count only.
Vocabulary difficulty must mainly follow the selected grade.
Do not jump to higher-grade academic vocabulary just because difficulty is Advanced.

Language Pair:
${languagePair}

LANGUAGE RULES:
${selectedLanguageRule}

BANNED WORDS. DO NOT USE ANY OF THESE WORDS:
${bannedPromptText}

VERY IMPORTANT:
- Do not generate words from the banned list above.
- Do not generate common beginner words that are already listed.
- Do not generate variants of banned words.
- Example: if "cat" is banned, do not generate "kitty" or "kitten".
- Example: if "apple" is banned, do not generate "red apple".
Rules:
- Generate NEW words only.
- Do NOT use banned words.
- Do NOT repeat rejected words.
- Do NOT repeat the same left word.
- Do NOT repeat the same right word.
- Keep words child-friendly and visual.
- left and right must be correct translations.
- vocab_word should be English whenever possible.
- image_keyword must be English only.
- image_type must be one of:
object, animal, person, action, emotion, color, place, nature, food, transport, school_item, abstract_concept

Return ONLY valid JSON:
{
  "pairs": [
    {
      "pair_id": 1,
      "left": "Rabbit",
      "right": "兔子",
      "vocab_word": "rabbit",
      "image_keyword": "cute rabbit",
      "image_type": "animal"
    }
  ]
}
`;

    const generateAndCleanPairs = async (count) => {
      const response = await client.responses.create({
        model: "gpt-4.1-mini",
        input: buildGamePrompt(count),
      });

      const text = response.output_text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      console.log("AI RAW TEXT:", text);

      let parsed;

      try {
        parsed = JSON.parse(text);
      } catch (err) {
        console.error("GAME JSON PARSE ERROR:", text);
        return [];
      }

      if (!parsed.pairs || !Array.isArray(parsed.pairs)) {
        return [];
      }

      console.log("AI PAIRS COUNT:", parsed.pairs.length);

      const validPairs = [];

      for (const pair of parsed.pairs) {
        const left = String(pair.left || "").trim();
        const right = String(pair.right || "").trim();

        if (!left || !right) continue;

        const key = getPairKey(left, right);

        const vocabWord = String(pair.vocab_word || left).trim();
        const imageKeyword = String(pair.image_keyword || vocabWord)
          .trim()
          .toLowerCase();

        const imageType = String(pair.image_type || "object")
          .trim()
          .toLowerCase();

        const normalizedLeft = normalizeText(left);
        const normalizedRight = normalizeText(right);
        const normalizedVocab = normalizeText(vocabWord);
        const normalizedKeyword = normalizeText(imageKeyword);
        const coreLeft = getCoreVocab(left);
        const coreVocab = getCoreVocab(vocabWord);
        const coreKeyword = getCoreVocab(imageKeyword);

        if (bannedPairKeys.has(key)) continue;
        if (bannedVocabWords.has(normalizedLeft)) continue;
        if (bannedVocabWords.has(normalizedRight)) continue;
        if (bannedVocabWords.has(normalizedVocab)) continue;

        if (bannedVocabWords.has(coreLeft)) continue;
        if (bannedVocabWords.has(coreVocab)) continue;
        if (bannedVocabWords.has(coreKeyword)) continue;
        bannedPairKeys.add(key);
        bannedVocabWords.add(normalizedLeft);
        bannedVocabWords.add(normalizedRight);
        bannedVocabWords.add(normalizedVocab);

        if (coreLeft) bannedVocabWords.add(coreLeft);
        if (coreVocab) bannedVocabWords.add(coreVocab);
        if (coreKeyword) bannedVocabWords.add(coreKeyword);

        validPairs.push({
          left,
          right,
          vocab_word: vocabWord,
          image_keyword: imageKeyword,
          image_type: imageType,
        });
      }

      console.log("VALID PAIRS COUNT:", validPairs.length);
      return validPairs;
    };

    for (let attempt = 0; attempt < 3; attempt++) {
      const missingCount = finalPairCount - cleanedPairs.length;
      if (missingCount <= 0) break;

      const requestCount = Math.max(18, missingCount * 3);
      const generatedPairs = await generateAndCleanPairs(requestCount);

      console.log(
        `Attempt ${attempt + 1}: requested ${requestCount}, accepted ${generatedPairs.length}, total ${cleanedPairs.length}`
      );

      const pairsWithImages = await mapWithConcurrency(
        generatedPairs,
        3,
        async (pair) => {
          const imageUrl = await getOrCreateVocabImage(
            pair.vocab_word,
            pair.image_keyword,
            pair.image_type,
            pair.left,
            pair.right,
            languagePair
          );

          if (!imageUrl) return null;

          return {
            ...pair,
            image_url: imageUrl,
          };
        }
      );

      for (const pair of pairsWithImages.filter(Boolean)) {
        if (cleanedPairs.length >= finalPairCount) break;

        cleanedPairs.push({
          pair_id: cleanedPairs.length + 1,
          ...pair,
        });
      }
    }

    if (cleanedPairs.length < finalPairCount) {
      return res.status(500).json({
        error: `Only generated ${cleanedPairs.length}/${finalPairCount} valid pairs. Please try again.`,
      });
    }

    const finalQuestionData = {
      pairs: cleanedPairs.slice(0, finalPairCount),
    };

    const { data, error } = await supabaseAdmin
      .from("game_questions")
      .insert([
        {
          game_type: gameType,
          exam_type: examType,
          grade,
          skill,
          difficulty: finalDifficulty,
          language_pair: languagePair,
          question_data: finalQuestionData,
          image_provider: "openai",
          image_cached_at: new Date().toISOString(),
          created_by: req.user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("SUPABASE GAME INSERT ERROR:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.json({
      success: true,
      generated_count: cleanedPairs.length,
      gameQuestion: data,
    });
  } catch (err) {
    console.error("GAME QUESTION ERROR:", err);
    return res.status(500).json({
      error: err.message || "Failed to generate game questions.",
    });
  }
});

app.get("/api/admin/vocab-images", requireAdmin, async (req, res) => {
  try {
    const status = req.query.status || "needs_review";
    const page = Number(req.query.page || 0);
    const limit = Number(req.query.limit || 18);
    const search = String(req.query.search || "").trim();

    const from = page * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from("vocab_images")
      .select("*")
      .eq("status", status)
      .order("updated_at", { ascending: false })
      .range(from, to);

    if (search) {
      query = query.or(
        `keyword.ilike.%${search}%,vocab_word.ilike.%${search}%,image_type.ilike.%${search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({ images: data || [] });
  } catch (err) {
    return res.status(500).json({
      error: err.message || "Failed to load vocab images.",
    });
  }
});

app.post("/api/admin/vocab-images/bulk-approve", requireAdmin, async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "Image ids are required." });
  }

  const { data, error } = await supabaseAdmin
    .from("vocab_images")
    .update({
      status: "approved",
      updated_at: new Date().toISOString(),
    })
    .in("id", ids)
    .select();

  if (error) return res.status(500).json({ error: error.message });

  return res.json({ success: true, images: data });
});

app.post("/api/admin/vocab-images/bulk-reject", requireAdmin, async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "Image ids are required." });
  }

  const { data, error } = await supabaseAdmin
    .from("vocab_images")
    .update({
      status: "rejected",
      updated_at: new Date().toISOString(),
    })
    .in("id", ids)
    .select();

  if (error) return res.status(500).json({ error: error.message });

  return res.json({ success: true, images: data });
});

app.post("/api/admin/vocab-images/:id/approve", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from("vocab_images")
      .update({
        status: "approved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({ success: true, image: data });
  } catch (err) {
    return res.status(500).json({
      error: err.message || "Failed to approve image.",
    });
  }
});

app.post("/api/admin/vocab-images/:id/reject", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from("vocab_images")
      .update({
        status: "rejected",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({ success: true, image: data });
  } catch (err) {
    return res.status(500).json({
      error: err.message || "Failed to reject image.",
    });
  }
});

app.post("/api/admin/vocab-images/:id/regenerate", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("vocab_images")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: "Image record not found." });
    }

    if (existing.generation_count >= 2) {
      return res.status(400).json({
        error: "Generation limit reached. Please change keyword or manually review.",
      });
    }

    let b64 = null;

    try {
      b64 = await generateLunaVocabImage(
        existing.keyword,
        existing.image_type || "object"
      );
    } catch (err) {
      console.error("REGENERATE IMAGE ERROR:", err.message);
      return res.status(500).json({
        error: "OpenAI image generation failed.",
      });
    }

    if (!b64) {
      return res.status(500).json({ error: "Failed to generate image." });
    }

    const nextCount = existing.generation_count + 1;
    const saved = await saveVocabImageToStorage(existing.keyword, b64, nextCount);

    if (!saved?.imageUrl) {
      return res.status(500).json({ error: "Failed to upload image." });
    }

    const { data, error } = await supabaseAdmin
      .from("vocab_images")
      .update({
        vocab_word: existing.vocab_word,
        image_url: saved.imageUrl,
        storage_path: saved.storagePath,
        status: "needs_review",
        generation_count: nextCount,
        last_generated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({ success: true, image: data });
  } catch (err) {
    return res.status(500).json({
      error: err.message || "Failed to regenerate image.",
    });
  }
});

app.post("/api/admin/vocab-images/:id/change-keyword", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { keyword, imageKeyword } = req.body;
    const finalKeyword = imageKeyword || keyword;

    if (!finalKeyword) {
      return res.status(400).json({ error: "Keyword is required." });
    }

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("vocab_images")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: "Image record not found." });
    }

    const cleanKeyword = normalizeText(finalKeyword);
    const imageType = existing.image_type || "object";

    const b64 = await generateLunaVocabImage(cleanKeyword, imageType);

    if (!b64) {
      return res.status(500).json({ error: "Failed to generate image." });
    }

    const saved = await saveVocabImageToStorage(cleanKeyword, b64, 1);

    if (!saved?.imageUrl) {
      return res.status(500).json({ error: "Failed to upload image." });
    }

    const { data, error } = await supabaseAdmin
      .from("vocab_images")
      .update({
        keyword: cleanKeyword,
        vocab_word: existing.vocab_word,
        image_type: imageType,
        image_url: saved.imageUrl,
        storage_path: saved.storagePath,
        status: "needs_review",
        generation_count: 1,
        last_generated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({ success: true, image: data });
  } catch (err) {
    return res.status(500).json({
      error: err.message || "Failed to change keyword.",
    });
  }
});

app.post("/api/generate-questions", requireAdmin, async (req, res) => {
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

app.post("/api/luna-chat", async (req, res) => {
  try {
    console.log("🌙 LUNA CHAT HIT:", req.body);

    const ip = getClientIp(req);

    if (!checkRateLimit(ip, 20, 60 * 1000)) {
      return res.status(429).json({
        reply: "Sorry, too many messages. Please try again in a moment.",
      });
    }

    const { messages, language } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        reply: "Please enter a message first.",
      });
    }

    const limitedMessages = messages.slice(-10);

    const totalChars = limitedMessages.reduce((sum, m) => {
      return sum + String(m.text || "").length;
    }, 0);

    if (totalChars > 4000) {
      return res.status(400).json({
        reply: "Your message is too long. Please keep it shorter.",
      });
    }

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: ` You are Chokina, the AI Education Consultant for LUNA Education.

          You are NOT a generic AI chatbot.
          
          You are the premium AI consultant of LUNA Education.
          
          You behave like a calm, experienced, modern international education advisor.
          
          ==================================================
            ABOUT CHOKINA
          ==================================================

        Chokina is:
        - calm
        - intelligent
        - warm
        - reassuring
        - structured
        - elegant
          
          Chokina speaks naturally like a real educational consultant.
          
          Chokina should NEVER:
        - sound robotic
        - sound like automated customer support
        - sound childish
        - sound overly corporate
        - overuse emojis
        - sound overly AI - generated
          
          Chokina should feel:
        - premium
        - modern
        - trustworthy
        - human
        - emotionally reassuring

        ==================================================
        ABOUT LUNA EDUCATION
        ==================================================

        LUNA Education is a premium personalised 1 - to - 1 international education platform.
          
          At LUNA, we specialise in:
        - MAP
        - CAT4
        - WIDA
        - AEIS
        - TOEFL
        - IELTS
        - SAT
        - IB
        - IGCSE
        - O - Level
        - A - Level
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
          
          At LUNA, we focus on:
        - personalised learning
        - structured progress tracking
        - detailed assessments
        - tutor matching
        - long - term academic growth
        - confidence building
        - international education systems
          
          LUNA does NOT provide:
        - group classes
        - random crash courses
        - guaranteed score promises
          
          Do NOT invent:
        - prices
        - packages
        - schedules
        - guarantees
        - tutor availability
        - services not mentioned
          
          If unsure, say:
        "Please enquire with our team for more details."

        ==================================================
        LUNA LEARNING SYSTEM
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
          Students are matched based on:
        - personality
        - learning style
        - academic goals
        - current level
          
          4. Progress Tracking
        - Feedback every 3 lessons
        - Continuous adjustment
        - Structured monitoring
          
          5. Final Evaluation
        - Compare before / after progress
        - Show measurable improvement
        - Provide recommendations

        ==================================================
        YOUR ROLE
        ==================================================

        As Chokina, your role is to:
        - guide parents professionally
        - support students warmly
        - identify learning needs
        - recommend suitable programmes
        - explain LUNA’s learning system clearly
        - simplify educational decisions
        - build trust professionally
          
          You should:
        - ask smart follow - up questions
        - keep replies concise
        - sound warm and premium
        - sound calm and experienced
        - sound human
        - sound reassuring
        - guide conversations naturally
          
          You should NEVER:
        - sound pushy
        - sound robotic
        - overexplain
        - give huge essays
        - use excessive emojis
        - invent information
        - pressure users aggressively

        ==================================================
        IMPORTANT BEHAVIOUR RULES
        ==================================================

        When parents ask vague questions:
          → ask clarifying questions first.
          
          Focus on understanding:
    - student age
      - grade level
        - curriculum
        - exam type
          - target schools
            - strengths
            - weaknesses
            - learning goals
              - preferred language
          
          Ask SHORT questions.
          
          Only ask ONE important question at a time.
          
          When parents mention weak foundations:
          → reassure calmly and explain structured support.
          
          When parents ask about results:
          → explain personalised learning, assessments, and progress tracking.
          
          When parents ask about tutors:
          → explain tutor matching carefully and professionally.
          
          When parents ask about lesson mode:
          → explain LUNA’s online - first approach professionally.
          
          ==================================================
      TONE
      ==================================================

      Tone should feel:
    - premium
      - trustworthy
      - modern
      - calm
      - elegant
      - international
      - structured
      - educational consultant style

    NOT:
    - pushy sales
      - overly casual
        - childish
        - robotic
        - AI - like
        - exaggerated enthusiasm

          ==================================================
          GOOD RESPONSE STYLE
            ==================================================

            GOOD:
    "May I know the student’s current grade level and learning goals?"

    GOOD:
    "We usually begin with an assessment so we can understand the student’s current level and learning gaps before recommending a suitable plan."

    GOOD:
    "For students with weaker foundations, we typically rebuild core concepts step-by-step while tracking progress closely."

    GOOD:
    "We would be happy to recommend suitable support after a short consultation."

    BAD:
    "OMG we can definitely help!!!"

    BAD:
          Long AI - generated essays.

      BAD:
          Overly robotic consultant language.

      BAD:
          Inventing fake pricing or guarantees.
          
          ==================================================
      CONTACT INFORMATION
        ==================================================

        WeChat:
    luna - education

    WhatsApp:
    +65 81381999
          
          If users request detailed consultation:

    "For personalised guidance, Chokina can help arrange a consultation with the LUNA team via WhatsApp or WeChat."

      ==================================================
      RESPONSE LENGTH RULES
        ==================================================

        - Most replies should be under 45 words.
          - Prefer 1 - 3 short sentences.
          - Never send long essays.
          - Keep replies visually clean and easy to read.
          - Break lines naturally.
          - Ask only ONE important follow - up question at a time.
          - Focus on guiding the conversation forward.
          
          ==================================================
      CONVERSATION FLOW RULES
        ==================================================

        Your goal is NOT only to answer questions.
          
          Your goal is to:
    1. Understand the student's situation
    2. Recommend suitable support
    3. Build trust professionally
    4. Guide parents naturally toward enquiry or consultation
          
          Always move the conversation forward naturally.
          
          ==================================================
      CONSULTATIVE BEHAVIOUR
        ==================================================

        You should behave like a premium educational consultant.

          Avoid:
    - robotic explanations
      - generic AI responses
        - too much educational theory
          - excessive details
            - overwhelming information

    Instead:
    - identify the main issue quickly
      - simplify recommendations
        - sound calm and confident
          - guide parents step - by - step
            - sound emotionally reassuring

              ==================================================
              IMPORTANT CTA RULES
                ==================================================

                When appropriate, encourage users to:
    - submit an enquiry
      - arrange a consultation
        - contact the team on WhatsApp or WeChat
          - begin with an assessment lesson
          
          Do this naturally and professionally.

      Avoid:
    - aggressive selling
      - repeated CTA spam
        - sounding desperate

          ==================================================
          MESSAGE FORMATTING
            ==================================================

            Use natural spacing.

              GOOD:

    "We usually recommend starting with a short assessment first.
          
          May I know the student’s current grade level ? "
          
          BAD:
          
          Huge paragraphs with excessive information.
          
          ==================================================
      AI CONVERSATION STATES
        ==================================================

        You should naturally guide conversations through these stages.
          
          -----------------------------------
      STATE 1 — DISCOVERY
    -----------------------------------

      Goal:
          Understand the student clearly.
          
          Focus on:
    - grade level
      - curriculum
      - exam type
        - learning difficulties
          - goals
          - preferred language
          
          Ask SHORT questions.

      GOOD:
    "May I know the student's current grade level and curriculum?"

    GOOD:
    "Is the student preparing for admissions or academic improvement?"

    -----------------------------------
      STATE 2 — RECOMMENDATION
    -----------------------------------

      Goal:
          Recommend suitable support confidently.
          
          Keep recommendations SHORT.

      GOOD:
    "For CAT4 preparation, we usually recommend structured reasoning training together with timed practice."

    GOOD:
    "For weaker English foundations, we typically rebuild reading and vocabulary first before moving into advanced comprehension."

    Avoid:
    - huge explanations
      - academic essays
        - too much detail

    -----------------------------------
      STATE 3 — CONFIDENCE BUILDING
    -----------------------------------

      Goal:
          Build trust professionally.

      Mention:
    - personalised support
      - assessments
      - tutor matching
        - progress tracking
          - structured learning

    GOOD:
    "We track progress closely and adjust lesson pacing based on the student's development."

    GOOD:
    "Tutors are matched carefully based on the student's level and learning style."

    -----------------------------------
      STATE 4 — CTA
    -----------------------------------

      Goal:
          Guide parents naturally toward consultation or enquiry.

      GOOD:
    "We would be happy to recommend a suitable learning plan after a short consultation."

    GOOD:
    "You may submit an enquiry and our team can recommend a suitable tutor."

    GOOD:
    "Please contact our team via WhatsApp or WeChat for personalised guidance."

    Avoid:
    - aggressive selling
      - repeated CTA spam
        - sounding desperate

          ==================================================
          IMPORTANT
          ==================================================

          Do NOT stay stuck in endless conversation.
          
          After understanding enough information,
      naturally guide the user toward:
    - enquiry
      - consultation
      - assessment lesson
        - WhatsApp contact
          
          LANGUAGE RULE:
    - If language is "zh", reply in Simplified Chinese.
          - If language is "en", reply in English.
          - Match the user's language naturally.
      - Keep replies concise in both languages.
          `,
        },
        ...limitedMessages.map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: String(m.text || "").slice(0, 1200),
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
      <div style = "font-family: Arial, sans-serif; line-height: 1.6;">
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
          </tr >
      `
      )
      .join("");

    const emailResult = await sendEmailWithRetry({
      from: "Luna Education <admin@lunastudies.com>",
      to: "admin@lunastudies.com",
      subject: "Low Balance Student Package Reminder",
      html: `
      <div style = "font-family: Arial, sans-serif; line-height: 1.6;" >
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
        </div >
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

app.post("/api/send-career-application-email", async (req, res) => {
  try {
    console.log("📩 CAREER APPLICATION EMAIL API HIT");
    console.log("BODY:", req.body);

    const { applicationId } = req.body;

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        error: "Missing applicationId",
      });
    }

    const { data: appData, error } = await supabaseAdmin
      .from("career_applications")
      .select("*")
      .eq("id", applicationId)
      .single();

    if (error) throw error;

    const getSignedFileLink = async (filePath) => {
      if (!filePath) return "-";

      const { data, error } = await supabaseAdmin.storage
        .from("career-files")
        .createSignedUrl(filePath, 60 * 60 * 24 * 7);

      if (error) {
        console.error("Signed URL error:", error);
        return filePath;
      }

      return data.signedUrl;
    };

    const resumeLink = await getSignedFileLink(appData.resume_url);
    const coverLetterLink = await getSignedFileLink(appData.cover_letter_url);

    const emailResult = await sendEmailWithRetry({
      from: "Luna Education <admin@lunastudies.com>",
      to: process.env.CAREER_TO_EMAIL || "admin@lunastudies.com",
      reply_to: appData.email,
      subject: `New Career Application - ${appData.position}`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.7;color:#111827;">
          <h2>New Career Application</h2>

          <h3>Position</h3>
          <p>${appData.position || "-"}</p>

          <h3>Personal Information</h3>
          <p><strong>Full Name:</strong> ${appData.full_name || "-"}</p>
          <p><strong>Email:</strong> ${appData.email || "-"}</p>
          <p><strong>Phone / WhatsApp:</strong> ${appData.phone || "-"}</p>
          <p><strong>Country:</strong> ${appData.country || "-"}</p>
          <p><strong>City:</strong> ${appData.city || "-"}</p>

          <h3>Education</h3>
          <p><strong>Universities:</strong> ${appData.universities || "-"}</p>
          <p><strong>Degree/s:</strong> ${appData.degrees || "-"}</p>
          <p><strong>Graduation Year:</strong> ${appData.graduation_year || "-"}</p>

          <h3>Teaching Background</h3>
          <p><strong>Teaching Experience:</strong> ${appData.teaching_experience || "-"}</p>
          <p><strong>Student Age Groups:</strong> ${(appData.student_age_groups || []).join(", ") || "-"}</p>
          <p><strong>Subjects Taught:</strong> ${(appData.subjects_taught || []).join(", ") || "-"}</p>

          <h3>Working Arrangement</h3>
          <p><strong>Online:</strong> ${appData.available_online ? "Yes" : "No"}</p>
          <p><strong>Offline Japan:</strong> ${appData.available_offline_japan ? "Yes" : "No"}</p>
          <p><strong>Offline Singapore:</strong> ${appData.available_offline_singapore ? "Yes" : "No"}</p>
          <p><strong>Hours per week:</strong> ${appData.hours_per_week || "-"}</p>

          <h3>Language Proficiency</h3>
          <p><strong>English:</strong> ${appData.english_proficiency || "-"}</p>
          <p><strong>Chinese:</strong> ${appData.chinese_proficiency || "-"}</p>
          <p><strong>Japanese:</strong> ${appData.japanese_proficiency || "-"}</p>

          <h3>Application Questions</h3>
          <p><strong>Why would you like to join Luna Education?</strong></p>
          <p>${appData.why_join || "-"}</p>

          <p><strong>How did you hear about us?</strong></p>
          <p>${appData.hear_about_us || "-"}</p>

          <p><strong>Additional details:</strong></p>
          <p>${appData.hear_about_us_detail || "-"}</p>

          <h3>Documents</h3>
          <p><strong>Resume:</strong> <a href="${resumeLink}">Open Resume</a></p>
          <p><strong>Cover Letter:</strong> <a href="${coverLetterLink}">Open Cover Letter</a></p>
        </div>
      `,
    });

    if (emailResult.error) {
      return res.status(500).json({
        success: false,
        error: emailResult.error,
      });
    }

    return res.json({
      success: true,
      emailResult,
    });
  } catch (error) {
    console.error("Career application email error:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Failed to send career application email",
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
