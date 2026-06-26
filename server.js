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

app.get("/api/luna-chat/warmup", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.json({
    ok: true,
    service: "luna-chat",
    ready: Boolean(process.env.OPENAI_API_KEY),
  });
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

const VALID_GAME_VOCAB_LANGUAGES = new Set(["en", "zh", "ja"]);
const VALID_IMAGE_TYPES = new Set([
  "object",
  "animal",
  "person",
  "action",
  "emotion",
  "color",
  "place",
  "nature",
  "food",
  "transport",
  "school_item",
  "abstract_concept",
]);

const sanitizeGameVocabLanguages = (languages = []) => {
  const cleanLanguages = Array.isArray(languages)
    ? languages.filter((lang) => VALID_GAME_VOCAB_LANGUAGES.has(lang))
    : [];

  return cleanLanguages.length > 0 ? cleanLanguages : ["en", "zh", "ja"];
};

const cleanGameVocabItem = (item = {}) => {
  const en = String(item.en || item.english || "").trim();
  const zh = String(item.zh || item.chinese || "").trim();
  const ja = String(item.ja || item.japanese || "").trim();
  const imageKeyword = String(item.image_keyword || item.imageKeyword || en)
    .trim()
    .toLowerCase();
  const imageType = String(item.image_type || item.imageType || "object")
    .trim()
    .toLowerCase();

  if (!en || !zh || !ja || !imageKeyword) return null;

  return {
    en,
    zh,
    ja,
    image_keyword: imageKeyword,
    image_type: VALID_IMAGE_TYPES.has(imageType) ? imageType : "object",
    metadata: typeof item.metadata === "object" && item.metadata ? item.metadata : {},
  };
};

const findReusableVocabImage = async (vocabWord, imageKeyword) => {
  const cleanVocabWord = getCoreVocab(vocabWord);
  const cleanKeyword = getCoreVocab(imageKeyword || vocabWord);

  if (!cleanVocabWord && !cleanKeyword) return null;

  const lookup = async (column, value) => {
    if (!value) return null;

    const { data, error } = await supabaseAdmin
      .from("vocab_images")
      .select("id, image_url")
      .eq(column, value)
      .in("status", ["approved", "needs_review"])
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("VOCAB IMAGE REUSE LOOKUP ERROR:", error);
      return null;
    }

    return data || null;
  };

  return (
    (await lookup("vocab_word", cleanVocabWord)) ||
    (await lookup("keyword", cleanKeyword))
  );
};

const findVocabImageByUrl = async (imageUrl) => {
  if (!imageUrl) return null;

  const { data, error } = await supabaseAdmin
    .from("vocab_images")
    .select("id, image_url")
    .eq("image_url", imageUrl)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("VOCAB IMAGE URL LOOKUP ERROR:", error);
    return null;
  }

  return data || null;
};

const toVocabularyPreview = (item = {}) => ({
  id: item.id,
  en: item.en || "",
  zh: item.zh || "",
  ja: item.ja || "",
  image_keyword: item.image_keyword || "",
  grade: item.grade || "",
  category: item.category || "",
  status: item.status || "",
  image_url: item.image_url || "",
  created_at: item.created_at || null,
});

const normalizeGameVocabKey = (value = "") =>
  normalizeText(value).replace(/\s+/g, " ").trim();

const compareGameVocabularyRows = (first, second) => {
  const firstApproved = first.status === "approved" ? 0 : 1;
  const secondApproved = second.status === "approved" ? 0 : 1;
  if (firstApproved !== secondApproved) return firstApproved - secondApproved;

  const firstImage = first.image_url ? 0 : 1;
  const secondImage = second.image_url ? 0 : 1;
  if (firstImage !== secondImage) return firstImage - secondImage;

  const firstComplete = first.en && first.zh && first.ja ? 0 : 1;
  const secondComplete = second.en && second.zh && second.ja ? 0 : 1;
  if (firstComplete !== secondComplete) return firstComplete - secondComplete;

  const firstTime = first.created_at ? new Date(first.created_at).getTime() : Number.MAX_SAFE_INTEGER;
  const secondTime = second.created_at ? new Date(second.created_at).getTime() : Number.MAX_SAFE_INTEGER;
  if (firstTime !== secondTime) return firstTime - secondTime;

  const firstMetadata = Object.keys(first.metadata || {}).length > 0 ? 0 : 1;
  const secondMetadata = Object.keys(second.metadata || {}).length > 0 ? 0 : 1;
  return firstMetadata - secondMetadata;
};

const buildGameVocabularyDuplicateAudit = (items = []) => {
  const activeItems = items.filter((item) => item.status !== "rejected");
  const parent = new Map();

  const find = (id) => {
    if (parent.get(id) !== id) parent.set(id, find(parent.get(id)));
    return parent.get(id);
  };

  const union = (left, right) => {
    const leftRoot = find(left);
    const rightRoot = find(right);
    if (leftRoot !== rightRoot) parent.set(rightRoot, leftRoot);
  };

  activeItems.forEach((item) => parent.set(item.id, item.id));

  const connectByKey = (keyGetter) => {
    const groups = new Map();

    for (const item of activeItems) {
      const key = keyGetter(item);
      if (!key) continue;
      groups.set(key, [...(groups.get(key) || []), item]);
    }

    for (const group of groups.values()) {
      if (group.length < 2) continue;
      for (let index = 1; index < group.length; index += 1) {
        union(group[0].id, group[index].id);
      }
    }
  };

  connectByKey((item) => normalizeGameVocabKey(item.en));
  connectByKey((item) => normalizeGameVocabKey(item.image_keyword));

  const components = new Map();

  for (const item of activeItems) {
    const root = find(item.id);
    components.set(root, [...(components.get(root) || []), item]);
  }

  const duplicateGroups = [];

  for (const componentItems of components.values()) {
    if (componentItems.length < 2) continue;

    const enKeys = new Map();
    const keywordKeys = new Map();

    for (const item of componentItems) {
      const en = getCoreVocab(item.en);
      const keyword = getCoreVocab(item.image_keyword);
      if (en) enKeys.set(en, [...(enKeys.get(en) || []), item]);
      if (keyword) keywordKeys.set(keyword, [...(keywordKeys.get(keyword) || []), item]);
    }

    const reasons = [];
    const duplicateKeys = [];

    for (const [key, group] of enKeys.entries()) {
      if (group.length > 1) {
        reasons.push("global_en_duplicate");
        duplicateKeys.push(`en:${key}`);
      }
    }

    for (const [key, group] of keywordKeys.entries()) {
      if (group.length > 1) {
        reasons.push("global_image_keyword_duplicate");
        duplicateKeys.push(`image_keyword:${key}`);
      }
    }

    if (reasons.length === 0) continue;

    const sortedItems = [...componentItems].sort(compareGameVocabularyRows);
    const keptItem = sortedItems[0];
    const duplicateItems = sortedItems.slice(1);

    duplicateGroups.push({
      id: `duplicate-group-${duplicateGroups.length + 1}`,
      reasons: Array.from(new Set(reasons)),
      duplicate_keys: duplicateKeys,
      kept_item: toVocabularyPreview(keptItem),
      duplicate_items: duplicateItems.map(toVocabularyPreview),
    });
  }

  return {
    total_items_checked: items.length,
    active_items_checked: activeItems.length,
    duplicate_groups: duplicateGroups,
    duplicate_groups_found: duplicateGroups.length,
    duplicate_rows_to_reject: duplicateGroups.reduce(
      (total, group) => total + group.duplicate_items.length,
      0
    ),
    kept_rows: duplicateGroups.length,
  };
};

const hasLatinText = (text = "") => /[A-Za-z]/.test(String(text));
const hasKanaText = (text = "") => /[\u3040-\u30ff]/.test(String(text));
const hasCjkText = (text = "") => /[\u3400-\u9fff]/.test(String(text));

const detectMemoryFlipTextLanguage = (text = "", languagePair = "", position = "") => {
  const value = String(text || "").trim();
  if (!value) return null;

  if (hasLatinText(value)) return "en";
  if (hasKanaText(value)) return "ja";

  if (hasCjkText(value)) {
    if (languagePair === "zh_ja") {
      return position === "right" ? "ja" : "zh";
    }

    if (languagePair === "en_ja") return "ja";

    return "zh";
  }

  return null;
};

const assignBackfillLanguage = (candidate, lang, value) => {
  const cleanValue = String(value || "").trim();
  if (!lang || !cleanValue) return;

  if (!candidate[lang]) {
    candidate[lang] = cleanValue;
    return;
  }

  if (normalizeText(candidate[lang]) !== normalizeText(cleanValue)) {
    candidate.metadata.language_conflicts = [
      ...(candidate.metadata.language_conflicts || []),
      {
        language: lang,
        kept: candidate[lang],
        ignored: cleanValue,
      },
    ];
  }
};

const extractMemoryFlipCandidate = (row, pair) => {
  const left = String(pair?.left || "").trim();
  const right = String(pair?.right || "").trim();

  if (!left || !right) return null;

  const languagePair = String(row.language_pair || pair.language_pair || "").trim();
  const vocabWord = String(pair.vocab_word || "").trim();
  const imageKeyword = String(pair.image_keyword || vocabWord || left || right)
    .trim()
    .toLowerCase();
  const imageType = String(pair.image_type || "object").trim().toLowerCase();

  const candidate = {
    en: "",
    zh: "",
    ja: "",
    image_keyword: imageKeyword,
    image_type: VALID_IMAGE_TYPES.has(imageType) ? imageType : "object",
    image_url: String(pair.image_url || "").trim() || null,
    vocab_image_id: null,
    grade: row.grade || "Legacy",
    difficulty: row.difficulty || null,
    category: row.skill || row.exam_type || "Memory Flip",
    status: "needs_review",
    metadata: {
      source: "memory_flip_backfill",
      legacy_game_question_ids: [row.id],
      legacy_language_pairs: languagePair ? [languagePair] : [],
      legacy_pair_ids: pair.pair_id ? [pair.pair_id] : [],
      legacy_exam_types: row.exam_type ? [row.exam_type] : [],
      legacy_skills: row.skill ? [row.skill] : [],
    },
  };

  if (vocabWord && hasLatinText(vocabWord)) {
    assignBackfillLanguage(candidate, "en", vocabWord);
  }

  assignBackfillLanguage(
    candidate,
    detectMemoryFlipTextLanguage(left, languagePair, "left"),
    left
  );
  assignBackfillLanguage(
    candidate,
    detectMemoryFlipTextLanguage(right, languagePair, "right"),
    right
  );

  if (!candidate.en && imageKeyword && hasLatinText(imageKeyword)) {
    assignBackfillLanguage(candidate, "en", imageKeyword);
  }

  if (!candidate.en && !candidate.zh && !candidate.ja) return null;

  return candidate;
};

const mergeBackfillCandidates = (base, next) => {
  for (const lang of ["en", "zh", "ja"]) {
    if (!base[lang] && next[lang]) {
      base[lang] = next[lang];
    }
  }

  if (!base.image_url && next.image_url) {
    base.image_url = next.image_url;
  }

  if (!base.vocab_image_id && next.vocab_image_id) {
    base.vocab_image_id = next.vocab_image_id;
  }

  base.metadata.legacy_game_question_ids = Array.from(
    new Set([
      ...(base.metadata.legacy_game_question_ids || []),
      ...(next.metadata.legacy_game_question_ids || []),
    ])
  );
  base.metadata.legacy_language_pairs = Array.from(
    new Set([
      ...(base.metadata.legacy_language_pairs || []),
      ...(next.metadata.legacy_language_pairs || []),
    ])
  );
  base.metadata.legacy_pair_ids = Array.from(
    new Set([
      ...(base.metadata.legacy_pair_ids || []),
      ...(next.metadata.legacy_pair_ids || []),
    ])
  );
  base.metadata.legacy_exam_types = Array.from(
    new Set([
      ...(base.metadata.legacy_exam_types || []),
      ...(next.metadata.legacy_exam_types || []),
    ])
  );
  base.metadata.legacy_skills = Array.from(
    new Set([
      ...(base.metadata.legacy_skills || []),
      ...(next.metadata.legacy_skills || []),
    ])
  );

  return base;
};

const getBackfillCandidateKey = (candidate) =>
  [
    normalizeText(candidate.grade),
    getCoreVocab(candidate.image_keyword),
    getCoreVocab(candidate.en),
    normalizeText(candidate.zh),
    normalizeText(candidate.ja),
  ]
    .filter(Boolean)
    .join("|");

const findExistingGameVocabularyItem = (candidate, existingItems = []) => {
  const candidateGrade = normalizeText(candidate.grade);
  const candidateEn = getCoreVocab(candidate.en);
  const candidateKeyword = getCoreVocab(candidate.image_keyword);
  const candidateZh = normalizeText(candidate.zh);
  const candidateJa = normalizeText(candidate.ja);

  return (existingItems || []).find((item) => {
    if (normalizeText(item.grade) !== candidateGrade) return false;

    const itemEn = getCoreVocab(item.en);
    const itemKeyword = getCoreVocab(item.image_keyword);
    const itemZh = normalizeText(item.zh);
    const itemJa = normalizeText(item.ja);

    if (candidateEn && itemEn && candidateEn === itemEn) return true;

    const keywordMatches =
      candidateKeyword && itemKeyword && candidateKeyword === itemKeyword;
    const zhMatches = candidateZh && itemZh && candidateZh === itemZh;
    const jaMatches = candidateJa && itemJa && candidateJa === itemJa;

    if (keywordMatches && (zhMatches || jaMatches || candidateEn === itemEn)) {
      return true;
    }

    if (zhMatches && jaMatches) return true;

    return false;
  });
};

const getMissingGameVocabLanguages = (candidate) =>
  ["en", "zh", "ja"].filter((lang) => !String(candidate[lang] || "").trim());

const BACKFILL_AI_MAX_ITEMS_PER_BATCH = 150;
const BACKFILL_AI_MAX_PROMPT_CHARS = 16000;

const createDynamicBackfillAiBatches = (workItems) => {
  const batches = [];
  let current = [];
  let currentChars = 0;

  for (const workItem of workItems) {
    const inputItem = {
      id: workItem.migration_id,
      image_keyword: workItem.candidate.image_keyword,
      en: workItem.candidate.en || undefined,
      zh: workItem.candidate.zh || undefined,
      ja: workItem.candidate.ja || undefined,
      missing_languages: workItem.missingLanguages,
    };
    const itemChars = JSON.stringify(inputItem).length;

    if (
      current.length > 0 &&
      (current.length >= BACKFILL_AI_MAX_ITEMS_PER_BATCH ||
        currentChars + itemChars > BACKFILL_AI_MAX_PROMPT_CHARS)
    ) {
      batches.push(current);
      current = [];
      currentChars = 0;
    }

    current.push(workItem);
    currentChars += itemChars;
  }

  if (current.length > 0) batches.push(current);

  return batches;
};

const fillMissingGameVocabLanguagesBatch = async (workItems) => {
  const inputItems = workItems.map((workItem) => ({
    id: workItem.migration_id,
    image_keyword: workItem.candidate.image_keyword,
    en: workItem.candidate.en || undefined,
    zh: workItem.candidate.zh || undefined,
    ja: workItem.candidate.ja || undefined,
    missing_languages: workItem.missingLanguages,
  }));

  const prompt = `
Fill ONLY the missing language fields for these reusable children's vocabulary items.

Input JSON:
${JSON.stringify(inputItems, null, 2)}

Rules:
- Return one result per input item.
- Preserve every id exactly.
- Return ONLY missing fields listed in missing_languages.
- Do not return existing non-empty fields unless they are listed as missing.
- English must be concise and lowercase unless normally capitalized.
- Chinese must be Simplified Chinese.
- Japanese must be natural, child-friendly Japanese.
- Use image_keyword only as context.
- Do not add explanations or markdown.

Return ONLY valid JSON:
{
  "items": [
    {
      "id": "migration-id-1",
      "ja": "りんご"
    }
  ]
}
`;

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: prompt,
  });

  const text = response.output_text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  let parsed;

  try {
    parsed = JSON.parse(text);
  } catch (err) {
    console.error("BACKFILL LANGUAGE BATCH JSON PARSE ERROR:", text);
    throw new Error("AI returned invalid JSON for a backfill batch.");
  }

  const resultItems = Array.isArray(parsed.items) ? parsed.items : [];
  const resultById = new Map(
    resultItems.map((item) => [String(item.id || ""), item])
  );

  return workItems.map((workItem) => {
    const result = resultById.get(workItem.migration_id) || {};
    const candidate = {
      ...workItem.candidate,
      metadata: { ...(workItem.candidate.metadata || {}) },
    };
    const filledLanguages = [];

    for (const lang of workItem.missingLanguages) {
      const value = String(result[lang] || "").trim();

      if (value) {
        candidate[lang] = value;
        filledLanguages.push(lang);
      }
    }

    candidate.metadata.ai_filled_languages = Array.from(
      new Set([
        ...(candidate.metadata.ai_filled_languages || []),
        ...filledLanguages,
      ])
    );

    return {
      ...workItem,
      candidate,
      filledLanguages,
    };
  });
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

const examRules = {
  MAP: `
- NWEA MAP Growth-aligned mock practice, not official copied material
- Adaptive-assessment feel with clear, student-friendly language
- Focus on reading, vocabulary, language usage, literature, or informational text
- Distractors are plausible but fair
`,

  AEIS: `
- Singapore AEIS-style mock practice, not official copied material
- Slightly more formal language
- Grammar + comprehension focused
- Vocabulary tends to be practical and school-based
- Questions are more direct
`,

  "O-Level English": `
- Singapore / Cambridge O-Level English-style mock practice, not official copied material
- Formal school English, editing, comprehension, cloze, and composition-planning tasks
- Questions should feel like secondary/O-Level preparation, not generic ESL practice
`,

  TOEFL: `
- TOEFL-style mock practice, not official copied material
- Academic English
- Formal tone
- Short TOEFL-aligned skill practice, not full test simulation
- Reading, writing, vocabulary, and grammar micro-practice only
- No listening audio, no listening transcripts, no speaking tasks
- Distractors are subtle and tricky
`,

  IELTS: `
- IELTS-style mock practice, not official copied material
- British English tone
- Real-world topics
- Slightly formal but accessible
- Focus on comprehension and reasoning
- Short IELTS-aligned skill practice, not full test simulation
- Reading, writing, vocabulary, and grammar micro-practice only
- No listening audio, no listening transcripts, no speaking tasks
`,

  WIDA: `
- WIDA-style mock practice, not official copied material
- English language development focused
- Simplified instructions
- Clear scaffolding
- Emphasis on understanding rather than trickiness
- Reading, writing, academic vocabulary, and grammar practice only
- No listening or speaking tasks in Phase 1
`,

  CAT4: `
- CAT4-style mock practice, not official copied material
- Logic and reasoning focus
- Less language-heavy, more thinking-based
- Abstract or pattern-based when possible
`,

  JLPT: `
- JLPT-aligned Japanese micro-practice, not official copied material
- Focus on vocabulary, grammar, kanji, reading, and sentence patterns
- Match the selected N-level from N5 to N1
- No listening or speaking tasks in Phase 1
`,

  HSK: `
- HSK-aligned Chinese micro-practice, not official copied material
- Focus on vocabulary, grammar, characters, reading, and sentence structure
- Match the selected HSK level from HSK 1 to HSK 6
- No listening or speaking tasks in Phase 1
`,
};
const structureRules = {
	  Reading: {
	    needsPassage: true,
	    format: `
- Passage-first reading comprehension practice.
	- Ask about meaning, reasoning, structure, detail, inference, or author's purpose based on the selected pathway.
	- Use one shared passage with a small mixed question set.
	`,
	  },

  Vocabulary: {
    needsPassage: false,
    format: `
- Vocabulary-in-context micro-practice.
- Use one sentence of context inside the question when needed.
- Question asks meaning in context, best replacement word, academic vocabulary usage, or precise word choice.
- No separate passage.
- Do NOT ask simple definition questions.
`,
  },

	  "Main Idea": {
	    needsPassage: true,
	    format: `
	- Shared passage must have a clear central idea.
	- Question asks for main idea, central message, or best summary.
	- Correct answer summarizes the whole passage.
- Wrong answers are too specific, partially correct, or unrelated.
`,
  },

	  Inference: {
	    needsPassage: true,
	    format: `
	- Shared passage must imply information without directly stating it.
	- Question asks what the reader can infer.
	- Correct answer must be supported by clues in the passage.
- Wrong answers may sound possible but are not supported.
`,
  },

	  "Detail Questions": {
	    needsPassage: true,
	    format: `
	- Shared passage must contain clear supporting details.
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

  "Language Usage": {
    needsPassage: false,
    format: `
- Sentence-level language usage question.
- Test grammar, conventions, punctuation, usage, sentence structure, or revision.
- No passage.
`,
  },

  Literature: {
    needsPassage: true,
    format: `
- Literature-style reading question.
- Use a short literary passage, narrative excerpt, poem-like excerpt, or character/setting/theme analysis.
`,
  },

  "Informational Text": {
    needsPassage: true,
    format: `
- Informational text reading question.
- Use nonfiction, data-rich, science, social studies, biography, or explanatory passage.
`,
  },

  Writing: {
    needsPassage: false,
    format: `
- Automatically graded writing-preparation question.
- Use essay planning, best thesis choice, weak argument identification, organization, topic sentence, transition, sentence improvement, or revision tasks.
- Do not require a free-response essay as the answer.
`,
  },

  "Academic Vocabulary": {
    needsPassage: false,
    format: `
- Academic vocabulary micro-practice.
- Use one sentence of context inside the question when needed.
- Test meaning, collocation, word family, register, or precise usage.
- No separate passage.
`,
  },

  Kanji: {
    needsPassage: false,
    format: `
- Kanji recognition or usage micro-practice.
- Test reading, meaning, appropriate usage, or matching kanji to context.
- No separate passage.
`,
  },

  "Sentence Patterns": {
    needsPassage: false,
    format: `
- Japanese sentence pattern micro-practice.
- Test grammar pattern meaning, correct sentence completion, or natural usage.
- No separate passage.
`,
  },

  Characters: {
    needsPassage: false,
    format: `
- Chinese character recognition or usage micro-practice.
- Test meaning, reading, form, or correct usage in a short sentence.
- No separate passage.
`,
  },

  "Sentence Structure": {
    needsPassage: false,
    format: `
- Chinese sentence structure micro-practice.
- Test word order, sentence completion, grammar structure, or natural expression.
- No separate passage.
`,
  },

  "Verbal Reasoning": {
    needsPassage: false,
    format: `
- CAT4 verbal battery style.
- Use word relationships, analogies, classifications, verbal reasoning, or vocabulary logic.
`,
  },

  "Quantitative Reasoning": {
    needsPassage: false,
    format: `
- CAT4 quantitative battery style.
- Use number patterns, mathematical relationships, sequence logic, or quantitative reasoning.
`,
  },

  "Non-verbal Reasoning": {
    needsPassage: false,
    format: `
- CAT4 non-verbal battery style.
- Use abstract pattern reasoning described textually with clear answer choices.
`,
  },

  "Spatial Reasoning": {
    needsPassage: false,
    format: `
- CAT4 spatial battery style.
- Use rotation, folding, shape manipulation, or spatial reasoning described textually with answer choices.
`,
  },

  Cloze: {
    needsPassage: true,
    format: `
- Cloze-style question.
- Provide a short passage or sentence set with one blank and four plausible choices.
`,
  },

	  "Reading Comprehension": {
	    needsPassage: true,
	    format: `
	- Passage-first reading comprehension practice.
	- Test main idea, detail, inference, vocabulary in context, tone, or organization.
	`,
  },

  "Sentence Transformation": {
    needsPassage: false,
    format: `
- Sentence transformation question.
- Test rewriting while preserving meaning, grammar, connectors, voice, reported speech, or clauses.
`,
  },

  "Composition Planning": {
    needsPassage: false,
    format: `
- Composition-planning question.
- Test outline choice, paragraph organization, thesis/topic sentence, supporting evidence, or transition logic.
- Do not ask students to write a full composition.
`,
  },

};

const gradeRules = {
  "Grade 1": "- Very simple vocabulary. Short sentences. Basic concepts.",
  "Grade 2": "- Simple vocabulary. Short sentences. Direct questions.",
  "Grade 3": "- Simple school-level vocabulary. Some reasoning allowed.",
  "Grade 4": "- Moderate vocabulary. Clear but slightly longer sentences.",
  "Grade 5": "- Grade-level vocabulary. Use concise passages only when needed.",
  "Grade 6": "- Upper primary level. More reasoning and stronger distractors.",
  "Grade 7": "- Middle school level. More nuanced vocabulary and reasoning.",
  "Grade 8": "- Middle school advanced. Longer passages and closer distractors.",
  "Grade 9": "- Academic vocabulary. More abstract reasoning.",
  "Grade 10": "- Strong academic tone. Complex sentence structures.",
  Beginner: "- Very simple language and direct questions.",
  Intermediate: "- Moderate language and some reasoning.",
  Advanced: "- Complex language, subtle reasoning, and strong distractors.",
  N5: "- JLPT N5 level. Basic kana, simple kanji, everyday vocabulary, and very simple sentence patterns.",
  N4: "- JLPT N4 level. Basic daily-life grammar, common kanji, and short reading.",
  N3: "- JLPT N3 level. Intermediate grammar, more kanji, and short practical reading.",
  N2: "- JLPT N2 level. Upper-intermediate grammar, nuanced vocabulary, and more abstract reading.",
  N1: "- JLPT N1 level. Advanced vocabulary, complex grammar, and sophisticated reading.",
  "HSK 1": "- HSK 1 level. Very basic Chinese vocabulary, characters, and simple sentence patterns.",
  "HSK 2": "- HSK 2 level. Basic daily communication, common words, and simple grammar.",
  "HSK 3": "- HSK 3 level. Lower-intermediate vocabulary, characters, and sentence structure.",
  "HSK 4": "- HSK 4 level. Intermediate vocabulary, reading, and grammar usage.",
  "HSK 5": "- HSK 5 level. Upper-intermediate vocabulary, longer sentences, and stronger reading.",
  "HSK 6": "- HSK 6 level. Advanced Chinese vocabulary, grammar, and reading comprehension.",
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

  "Below Grade": `
- Keep content slightly below the selected grade while preserving pathway style.
- Use more scaffolding and clearer distractors.
`,

  "On Grade": `
- Match the selected grade or pathway level.
- Use realistic exam-aligned vocabulary and reasoning.
`,

  "Above Grade": `
- Push above the selected grade with stronger vocabulary and closer distractors.
- Still remain age-appropriate and fair.
`,

  Foundation: `
- Build core skills before full exam difficulty.
- Use accessible language and clear reasoning.
`,

  "4.0-5.0": "- IELTS target band 4.0-5.0: accessible topics, clearer evidence, simpler distractors.",
  "5.5-6.0": "- IELTS target band 5.5-6.0: moderate complexity and realistic distractors.",
  "6.5-7.0": "- IELTS target band 6.5-7.0: stronger academic language and closer distractors.",
  "7.5+": "- IELTS target band 7.5+: sophisticated language, subtle reasoning, and precise distinctions.",
};

const compactList = (items = []) => items.filter(Boolean).join("; ");

const getGradeBand = (level = "", grade = "") => {
  const source = String(level || grade || "");
  if (/kindergarten|^k$/i.test(source)) return "K-2";
  const match = source.match(/Grade\s*(\d+)/i);
  const gradeNumber = match ? Number.parseInt(match[1], 10) : null;

  if (!gradeNumber) return "general";
  if (gradeNumber <= 2) return "K-2";
  if (gradeNumber <= 5) return "3-5";
  if (gradeNumber <= 8) return "6-8";
  return "9-12";
};

const getDifficultyProfile = ({
  targetLanguage = "English",
  pathway = "",
  level = "",
  grade = "",
  skill = "",
  pathwayVariant = "",
  difficulty = "",
} = {}) => {
  const selectedPathway = pathway || "General";
  const selectedLevel = String(level || grade || difficulty || "");
  const gradeBand = getGradeBand(selectedLevel, grade);

  const base = {
    pathway: selectedPathway,
    level: selectedLevel || "General",
    skill,
    estimated_cefr: null,
    learnerLevel: "Match the selected pathway and level.",
    vocabularyRange: "Use level-appropriate vocabulary only.",
    sentenceComplexity: "Use sentence complexity appropriate to the learner profile.",
    passageComplexity: "Use concise passages only when the selected skill requires reading.",
    cognitiveSkills: "Use reasoning appropriate to the selected level.",
    questionTypes: "Use the selected skill and pathway format.",
    distractorQuality: "Distractors should be plausible but fair.",
    grammarComplexity: "Use grammar appropriate to the target level.",
    academicStyle: "Keep the style aligned to the selected pathway.",
    acceptableVocabularyExamples: [],
    unacceptableVocabularyExamples: [],
    stemStyleExamples: [],
    distractorStyleExamples: [],
    strictAvoidRules: [
      "Do not copy or closely paraphrase official copyrighted exam questions.",
      "Do not use Listening or Speaking tasks in Phase 1.",
      "Do not exceed the selected level's grammar or vocabulary unless the question explicitly tests recognition.",
    ],
  };

  const withSummary = (profile) => ({
    ...profile,
    difficultyRationale: compactList([
      `Profile: ${profile.pathway} ${profile.level}`,
      profile.estimated_cefr ? `CEFR: ${profile.estimated_cefr}` : "",
      profile.vocabularyRange,
      profile.cognitiveSkills,
      profile.distractorQuality,
    ]),
    whyThisMatchesLevel: compactList([
      `The item must match ${profile.pathway} ${profile.level}`,
      `Skill focus: ${profile.skill || "selected skill"}`,
      profile.sentenceComplexity,
      profile.passageComplexity,
    ]),
  });

  if (selectedPathway === "IELTS") {
    const is75 = /7\.5\+/.test(selectedLevel);
    const is65 = /6\.5/.test(selectedLevel);
    const is55 = /5\.5/.test(selectedLevel);

    return withSummary({
      ...base,
      estimated_cefr: is75 ? "C1" : is65 ? "B2-C1" : is55 ? "B1-B2" : "A2-B1",
      learnerLevel: is75
        ? "Advanced IELTS learner approaching university-level academic English."
        : is65
          ? "Upper-intermediate learner building academic precision."
          : is55
            ? "Intermediate learner who can manage familiar academic topics with support."
            : "Lower-intermediate learner building IELTS foundations.",
      vocabularyRange: is75
        ? "Academic and semi-technical vocabulary, nuanced collocations, paraphrase-heavy wording."
        : is65
          ? "Common academic vocabulary, topic words, moderate paraphrasing."
          : "Everyday and high-frequency academic vocabulary with transparent meaning.",
      sentenceComplexity: is75
        ? "Complex and compound-complex sentences, nominalisation, contrast/concession, dense reference."
        : is65
          ? "Moderately complex sentences with subordination and clear linking."
          : "Short to medium sentences with clear connectors and limited embedding.",
      passageComplexity: is75
        ? "Abstract academic passage with implicit stance, layered evidence, and paraphrased relationships."
        : is65
          ? "Academic passage with some inference, contrast, and paraphrase."
          : "Concrete passage with explicit evidence and familiar topic progression.",
      cognitiveSkills: is75
        ? "Multi-step inference, writer attitude, function of evidence, reference tracking, nuanced paraphrase."
        : is65
          ? "Inference, detail-location, vocabulary in context, and main idea with moderate traps."
          : "Explicit detail, simple inference, main idea, and vocabulary in context.",
      questionTypes: is75
        ? "Inference, author's purpose, reference, paraphrase, tone/attitude, evidence function."
        : "Main idea, detail, vocabulary in context, simple inference, sentence improvement.",
      distractorQuality: is75
        ? "Strong distractors should be partially true, use passage wording, but fail by scope, logic, or attitude."
        : "Distractors should be clear but realistic: too broad, too narrow, opposite, or unsupported.",
      grammarComplexity: is75
        ? "Advanced clauses, cohesion, modality, hedging, passive voice, nominalisation."
        : "Core tenses, articles, prepositions, linking words, basic complex sentences.",
      academicStyle: `${pathwayVariant || "Academic"} IELTS-aligned micro practice, not a full test.`,
      acceptableVocabularyExamples: is75
        ? ["mitigate", "subsequent", "ambiguous", "sustainable", "constitute", "plausible"]
        : ["increase", "reason", "public", "change", "important", "improve"],
      unacceptableVocabularyExamples: is75
        ? ["big", "good", "fast as the main target word", "happy", "go", "basic synonym-only items"]
        : ["notwithstanding", "epistemological", "ameliorate", "ubiquitous as a target word"],
      stemStyleExamples: is75
        ? [
            "Which option best captures the writer's implied attitude toward the policy?",
            "What can be inferred from the contrast between the two findings?",
          ]
        : [
            "According to the paragraph, why did the number increase?",
            "Which word is closest in meaning to important in this context?",
          ],
      distractorStyleExamples: is75
        ? [
            "A choice that repeats a passage phrase but reverses the causal relationship.",
            "A choice that is true in general but not supported by this paragraph.",
          ]
        : [
            "A choice that is mentioned but does not answer the question.",
            "A choice with the opposite meaning of the passage detail.",
          ],
      strictAvoidRules: [
        ...base.strictAvoidRules,
        ...(is75
          ? [
              "Avoid basic synonym questions like rapid -> swift.",
              "Avoid one-sentence evidence questions.",
              "Avoid obvious distractors.",
              "Avoid everyday-only vocabulary.",
              "Avoid simple recall questions.",
            ]
          : [
              "Avoid dense university-level prose.",
              "Avoid obscure academic vocabulary as the target.",
              "Avoid distractors that require advanced outside knowledge.",
            ]),
      ],
    });
  }

  if (selectedPathway === "TOEFL") {
    const isAdvanced = /Advanced/i.test(selectedLevel);
    const isIntermediate = /Intermediate/i.test(selectedLevel);

    return withSummary({
      ...base,
      estimated_cefr: isAdvanced ? "C1" : isIntermediate ? "B2" : "A2-B1",
      learnerLevel: isAdvanced
        ? "Advanced learner ready for dense academic reading and precise reasoning."
        : isIntermediate
          ? "Intermediate-to-upper-intermediate learner building academic fluency."
          : "Foundation learner developing TOEFL-style academic skills.",
      vocabularyRange: isAdvanced
        ? "Academic lecture/reading vocabulary, discipline-neutral terms, precise verbs and abstract nouns."
        : "High-frequency academic and campus vocabulary with clear context support.",
      sentenceComplexity: isAdvanced
        ? "Longer academic sentences with apposition, concession, cause-effect, and reference chains."
        : "Shorter academic sentences with clear signal words and limited embedding.",
      passageComplexity: isAdvanced
        ? "Short academic paragraph that compresses evidence, contrast, and implication."
        : "Concrete academic paragraph with explicit organization.",
      cognitiveSkills: isAdvanced
        ? "Inference, rhetorical function, vocabulary in context, detail synthesis, reference."
        : "Main idea, explicit detail, basic inference, vocabulary in context.",
      questionTypes: isAdvanced
        ? "TOEFL reading micro-items: rhetorical purpose, inference, vocabulary, reference, detail."
        : "TOEFL foundation micro-items: vocabulary, main idea, detail, sentence simplification.",
      distractorQuality: isAdvanced
        ? "Distractors should borrow academic language and fail subtly by logic or scope."
        : "Distractors should be plausible but easier to eliminate with passage evidence.",
      grammarComplexity: isAdvanced
        ? "Academic cohesion, relative clauses, passive constructions, nominalisation."
        : "Core grammar, sentence clarity, connectors, subject-verb agreement.",
      academicStyle: "TOEFL-aligned academic micro practice, no lectures/audio.",
      acceptableVocabularyExamples: isAdvanced
        ? ["hypothesis", "consequently", "derive", "contrast", "phenomenon", "substantial"]
        : ["campus", "study", "reason", "process", "result", "important"],
      unacceptableVocabularyExamples: isAdvanced
        ? ["big/good/fast as target words", "simple picture-word matching"]
        : ["esoteric", "ontological", "incommensurable", "arcane idioms"],
      stemStyleExamples: isAdvanced
        ? [
            "Why does the author mention the second experiment?",
            "The word substantial in the passage is closest in meaning to...",
          ]
        : [
            "What is the paragraph mainly about?",
            "According to the paragraph, what happened first?",
          ],
      distractorStyleExamples: isAdvanced
        ? [
            "A choice that states a true detail but misses the rhetorical function.",
            "A choice that confuses cause and result.",
          ]
        : [
            "A choice that uses a word from the passage but changes the meaning.",
            "A choice that is too general.",
          ],
      strictAvoidRules: [
        ...base.strictAvoidRules,
        ...(isAdvanced
          ? ["Avoid generic ESL vocabulary drills.", "Avoid simple recall if the skill is Reading."]
          : ["Avoid advanced research-article density.", "Avoid idioms or cultural references that obscure the target skill."]),
      ],
    });
  }

  if (selectedPathway === "MAP") {
    const isHigh = gradeBand === "9-12";
    const isMid = gradeBand === "6-8";
    const isElementary35 = gradeBand === "3-5";
    const isLower = isElementary35 || gradeBand === "K-2";

    return withSummary({
      ...base,
      estimated_cefr: null,
      learnerLevel: isHigh
        ? "High-school MAP learner working with academic and literary/informational reasoning."
        : isMid
          ? "Middle-school MAP learner developing inference and precise vocabulary."
          : "Elementary MAP learner building grade-level comprehension and language usage.",
      vocabularyRange: isHigh
        ? "Academic and cross-curricular vocabulary suitable for Grades 9-12."
        : isMid
          ? "Grade-level school vocabulary, prefixes/suffixes, and common academic words."
          : "Concrete school and story vocabulary; some age-appropriate academic words.",
      sentenceComplexity: isHigh
        ? "Complex sentences, embedded clauses, figurative language, and academic transitions."
        : isMid
          ? "Moderate sentences with clear subordination and varied structure."
          : "Short to medium sentences with clear syntax.",
      passageComplexity: isHigh
        ? "Literary or informational passage with implied claims, tone, and structure."
        : isMid
          ? "Age-appropriate passage with inference and evidence."
          : "Concrete narrative/informational passage, no adult abstract topics.",
      cognitiveSkills: isHigh
        ? "Inference, author's craft, evidence evaluation, theme, vocabulary nuance."
        : isMid
          ? "Main idea, detail, inference, vocabulary in context, language conventions."
          : isElementary35
            ? "Context-clue reasoning, grade-level word meaning, main idea, explicit detail, simple inference, grammar conventions."
            : "Main idea, explicit detail, simple inference, word meaning, grammar conventions.",
      questionTypes: "MAP Reading, Vocabulary, or Language Usage aligned to the selected skill.",
      distractorQuality: isHigh
        ? "Close distractors based on misread evidence or overgeneralized themes."
        : "Age-appropriate distractors that are plausible but clearly resolvable.",
      grammarComplexity: isHigh
        ? "Conventions, punctuation, clauses, transitions, style, and revision."
        : "Core grammar, usage, punctuation, and sentence clarity.",
      academicStyle: "NWEA MAP-style adaptive growth practice, not IELTS/TOEFL prose.",
      acceptableVocabularyExamples: isHigh
        ? ["interpret", "contrast", "significant", "perspective", "symbolic"]
        : isElementary35
          ? ["cautious", "scarce", "observe", "investigate", "conclude", "fortunate"]
          : ["compare", "detail", "character", "because", "predict"],
      unacceptableVocabularyExamples: isLower
        ? [
            "epistemology",
            "macroeconomic",
            "notwithstanding",
            "bureaucratic inertia",
            ...(isElementary35 ? ["happy -> joyful", "big -> large", "fast -> quick"] : []),
          ]
        : ["university-only research jargon"],
      stemStyleExamples: isHigh
        ? [
            "Which sentence best supports the author's central claim?",
            "What does the phrase suggest about the narrator's perspective?",
          ]
        : [
            "What is the main idea of the paragraph?",
            "Which detail shows why the character changed her mind?",
          ],
      distractorStyleExamples: isHigh
        ? ["A theme-like answer that is too broad.", "A claim that sounds academic but lacks evidence."]
        : ["A detail from the text that does not answer the question.", "An opposite or unrelated idea."],
      strictAvoidRules: [
        ...base.strictAvoidRules,
        ...(isLower
          ? [
              "Avoid adult abstract topics.",
              "Avoid IELTS-style academic prose.",
              "Avoid overly subtle writer-attitude questions.",
              ...(isElementary35
                ? [
                    "Avoid K-2 synonym drills such as happy -> joyful or big -> large.",
                    "For Grade 3-5 vocabulary, include a short context sentence and require context-clue reasoning.",
                  ]
                : []),
            ]
          : ["Avoid full IELTS/TOEFL style passages.", "Avoid content that requires adult background knowledge."]),
      ],
    });
  }

  if (selectedPathway === "JLPT" || targetLanguage === "Japanese") {
    const isN1 = selectedLevel === "N1";
    const isN2 = selectedLevel === "N2";
    const isLow = selectedLevel === "N5" || selectedLevel === "N4";

    return withSummary({
      ...base,
      pathway: "JLPT",
      estimated_cefr: isN1 ? "B2-C1" : isN2 ? "B2" : selectedLevel === "N3" ? "B1" : "A1-A2",
      learnerLevel: isN1
        ? "Advanced Japanese learner handling abstract, nuanced written Japanese."
        : isN2
          ? "Upper-intermediate Japanese learner handling natural written Japanese."
          : isLow
            ? "Beginner Japanese learner building core forms, kana, basic kanji, and simple patterns."
            : "Intermediate Japanese learner bridging daily and more formal language.",
      vocabularyRange: isN1
        ? "Advanced vocabulary, abstract nouns, nuanced verbs, idiomatic written expressions."
        : isLow
          ? "Core daily vocabulary, kana, basic kanji, common verbs/adjectives."
          : "Intermediate daily/social vocabulary, more kanji compounds, common formal expressions.",
      sentenceComplexity: isN1
        ? "Complex embedded clauses, nuance, written-style grammar, implied relationships."
        : isLow
          ? "Very short sentences using core particles and basic verb/adjective forms."
          : "Moderate sentences with connectors, relative clauses, and common patterns.",
      passageComplexity: isN1
        ? "Dense short Japanese passage with nuanced opinion or abstract relationship."
        : isLow
          ? "Short daily-life text, notice, or simple paragraph."
          : "Practical passage with implied meaning and natural connectors.",
      cognitiveSkills: isN1
        ? "Nuance, implication, grammar function, reading between lines, register."
        : isLow
          ? "Recognition, meaning, simple completion, direct comprehension."
          : "Grammar choice, kanji/vocabulary in context, practical inference.",
      questionTypes: "JLPT-aligned vocabulary, grammar, kanji, reading, or sentence pattern items.",
      distractorQuality: isN1
        ? "Distractors should be grammatically plausible and differ by nuance, register, or collocation."
        : "Distractors should be common learner confusions within the same JLPT level.",
      grammarComplexity: isN1
        ? "N1 written grammar, nuance, formal connectors, advanced patterns."
        : isLow
          ? "Particles は/が/を/に/で, です/ます, basic tense, simple adjectives."
          : "N3-N2 patterns, conjunctions, relative clauses, honorific/formal basics when relevant.",
      academicStyle: "JLPT-style Japanese practice, not translation-only unless vocabulary recognition is intended.",
      acceptableVocabularyExamples: isN1
        ? ["著しい", "促す", "踏まえる", "見解", "余儀なくされる"]
        : ["食べます", "学校", "大きい", "行きます", "本"],
      unacceptableVocabularyExamples: isLow
        ? ["著しい", "概念", "踏まえる", "余儀なくされる"]
        : ["N5-only kana drills as the main challenge"],
      stemStyleExamples: isN1
        ? ["筆者の考えに最も近いものはどれですか。", "文中の「それ」は何を指していますか。"]
        : ["（　）に入ることばはどれですか。", "「たべます」の意味はどれですか。"],
      distractorStyleExamples: isN1
        ? ["A grammatically possible phrase with the wrong nuance.", "A synonym that does not match the register."]
        : ["A particle confusion from the same level.", "A word with similar kana but different meaning."],
      strictAvoidRules: [
        ...base.strictAvoidRules,
        "Avoid using grammar/vocabulary above the selected JLPT level unless explicitly testing recognition.",
        ...(isLow ? ["Avoid long kanji-heavy passages.", "Avoid abstract adult topics."] : []),
      ],
    });
  }

  if (selectedPathway === "HSK" || targetLanguage === "Chinese") {
    const isHsk6 = /HSK\s*6/i.test(selectedLevel);
    const isHsk5 = /HSK\s*5/i.test(selectedLevel);
    const isLow = /HSK\s*(1|2)/i.test(selectedLevel);

    return withSummary({
      ...base,
      pathway: "HSK",
      estimated_cefr: isHsk6 ? "C1" : isHsk5 ? "B2-C1" : /HSK\s*4/i.test(selectedLevel) ? "B1-B2" : "A1-A2",
      learnerLevel: isHsk6
        ? "Advanced Chinese learner handling abstract topics, idiomatic written Chinese, and nuanced argument."
        : isLow
          ? "Beginner Chinese learner building basic words, characters, pinyin-supported meaning, and simple sentences."
          : "Developing Chinese learner building sentence structure, character recognition, and practical reading.",
      vocabularyRange: isHsk6
        ? "Advanced HSK vocabulary, formal verbs, abstract nouns, idiomatic phrases."
        : isLow
          ? "Basic daily vocabulary: family, numbers, time, food, school, simple verbs."
          : "Common HSK vocabulary for daily/social topics, connectors, measure words, and common compounds.",
      sentenceComplexity: isHsk6
        ? "Longer written sentences with connectors, abstract relations, 把/被, complements, and formal style."
        : isLow
          ? "Short SVO sentences, 是/有, simple questions, basic time/place phrases."
          : "Moderate sentences with aspect particles, complements, comparisons, and connectors.",
      passageComplexity: isHsk6
        ? "Compact advanced Chinese passage with argument, implication, or nuanced relationship."
        : isLow
          ? "Very short daily-life sentence or simple paragraph."
          : "Practical paragraph with clear sequence, cause-effect, or comparison.",
      cognitiveSkills: isHsk6
        ? "Inference, nuance, character/word choice, cohesion, implied meaning."
        : isLow
          ? "Recognition, direct meaning, basic grammar choice, simple comprehension."
          : "Sentence structure, vocabulary in context, detail, simple inference.",
      questionTypes: "HSK-aligned vocabulary, grammar, characters, reading, or sentence structure items.",
      distractorQuality: isHsk6
        ? "Distractors should be semantically close and differ by collocation, register, or logic."
        : "Distractors should reflect common same-level learner confusions.",
      grammarComplexity: isHsk6
        ? "Advanced connectors, 把/被, complements, formal written structures, nuanced aspect."
        : isLow
          ? "Basic word order, 是/有, 吗 questions, 的, simple time/place, common measure words."
          : "了/过/着, comparison, complements, 把 basics, connectors.",
      academicStyle: "HSK-aligned Chinese proficiency practice, not generic translation drills unless vocabulary recognition is intended.",
      acceptableVocabularyExamples: isHsk6
        ? ["因素", "促进", "显著", "趋势", "承担", "然而"]
        : ["我", "喜欢", "学校", "苹果", "今天", "老师"],
      unacceptableVocabularyExamples: isLow
        ? ["因素", "显著", "趋势", "承担", "不可避免"]
        : ["HSK 1-only words as the main challenge"],
      stemStyleExamples: isHsk6
        ? ["根据这段话，作者最可能同意哪一项？", "文中“这一现象”指的是什么？"]
        : ["“苹果”的意思是什么？", "哪个词最适合填在括号里？"],
      distractorStyleExamples: isHsk6
        ? ["A near-synonym with wrong collocation.", "A statement that reverses the paragraph's causal logic."]
        : ["A character/word from the same topic with different meaning.", "A grammar choice from a later level that should not be required."],
      strictAvoidRules: [
        ...base.strictAvoidRules,
        "Avoid using grammar/vocabulary above the selected HSK level unless explicitly testing recognition.",
        ...(isLow ? ["Avoid long character-heavy passages.", "Avoid abstract adult topics."] : []),
      ],
    });
  }

  const pathwayProfiles = {
    WIDA: {
      learnerLevel: "English language development learner in the selected grade band.",
      vocabularyRange: "School and academic vocabulary with scaffolding.",
      cognitiveSkills: "Comprehension, language function, evidence, classroom academic language.",
      strictAvoidRules: ["Avoid trick questions; WIDA should assess language development with clarity."],
    },
    CAT4: {
      learnerLevel: "Reasoning practice for the selected grade/year.",
      vocabularyRange: "Minimal language load unless Verbal Reasoning is selected.",
      cognitiveSkills: "Pattern recognition, analogy, classification, quantitative/spatial reasoning.",
      strictAvoidRules: ["Avoid curriculum knowledge requirements; CAT4 should be reasoning-first."],
    },
    AEIS: {
      learnerLevel: "Singapore school admissions English learner.",
      vocabularyRange: "School-life and practical academic vocabulary.",
      cognitiveSkills: "Grammar accuracy, cloze logic, comprehension, sentence transformation.",
      strictAvoidRules: ["Avoid IELTS/TOEFL academic register; keep Singapore school admission style."],
    },
    "O-Level English": {
      learnerLevel: "Secondary/O-Level English learner.",
      vocabularyRange: "Formal school English, comprehension and composition vocabulary.",
      cognitiveSkills: "Editing, cloze, comprehension, argument planning, sentence transformation.",
      strictAvoidRules: ["Avoid primary-level simplicity; avoid full essay free-response items."],
    },
  };

  const fallbackProfile = pathwayProfiles[selectedPathway] || {};

  return withSummary({
    ...base,
    ...fallbackProfile,
    strictAvoidRules: [...base.strictAvoidRules, ...(fallbackProfile.strictAvoidRules || [])],
  });
};

const formatDifficultyProfileForPrompt = (profile = {}) => `
DIFFICULTY PROFILE:
- Pathway: ${profile.pathway}
- Level: ${profile.level}
- Skill: ${profile.skill}
- Estimated CEFR: ${profile.estimated_cefr || "Not applicable"}
- Expected learner level: ${profile.learnerLevel}
- Vocabulary range: ${profile.vocabularyRange}
- Sentence complexity: ${profile.sentenceComplexity}
- Passage complexity: ${profile.passageComplexity}
- Cognitive skills: ${profile.cognitiveSkills}
- Question types: ${profile.questionTypes}
- Distractor quality: ${profile.distractorQuality}
- Grammar complexity: ${profile.grammarComplexity}
- Academic/style register: ${profile.academicStyle}
- Acceptable vocabulary examples: ${(profile.acceptableVocabularyExamples || []).join(", ") || "Use profile-appropriate words."}
- Unacceptable vocabulary examples: ${(profile.unacceptableVocabularyExamples || []).join(", ") || "Avoid off-level words."}
- Example question stem style: ${(profile.stemStyleExamples || []).join(" | ") || "Use the selected pathway's item style."}
- Example distractor style: ${(profile.distractorStyleExamples || []).join(" | ") || "Use plausible but fair distractors."}

STRICT AVOID RULES:
${(profile.strictAvoidRules || []).map((rule) => `- ${rule}`).join("\n")}
`;

const LEGACY_ENGLISH_PATHWAYS = new Set([
  "MAP",
  "WIDA",
  "CAT4",
  "AEIS",
  "O-Level English",
  "TOEFL",
  "IELTS",
]);

const normalizePathwayText = (value = "") =>
  String(value || "").trim().toLowerCase().replace(/[\s_-]+/g, " ");

const detectLegacyEnglishPathway = (question = {}) => {
  const source = normalizePathwayText(
    [
      question.pathway,
      question.exam_type,
      question.category,
      question.skill,
      question.skill_tag,
      question.question_text,
      question.prompt,
    ]
      .filter(Boolean)
      .join(" ")
  );

  if (source.includes("o level") || source.includes("o-level")) return "O-Level English";
  if (source.includes("ielts")) return "IELTS";
  if (source.includes("toefl")) return "TOEFL";
  if (source.includes("aeis")) return "AEIS";
  if (source.includes("cat4") || source.includes("cat 4")) return "CAT4";
  if (source.includes("wida")) return "WIDA";
  if (source.includes("map")) return "MAP";

  return null;
};

const parseGradeNumber = (value = "") => {
  const match = String(value || "").match(/grade\s*(\d+)/i);
  return match ? Number(match[1]) : null;
};

const normalizeLegacyGradeLevel = (value = "") => {
  const raw = String(value || "").trim();
  if (!raw) return null;
  if (/kindergarten/i.test(raw) || /^k$/i.test(raw)) return "Kindergarten";

  const gradeNumber = parseGradeNumber(raw) || Number.parseInt(raw, 10);
  if (Number.isInteger(gradeNumber) && gradeNumber >= 1 && gradeNumber <= 12) {
    return `Grade ${gradeNumber}`;
  }

  return raw;
};

const mapGradeToWidaBand = (grade = "") => {
  if (/^k|kindergarten/i.test(grade)) return "K";
  const gradeNumber = parseGradeNumber(grade);
  if (!gradeNumber) return null;
  if (gradeNumber <= 2) return "Grades 1-2";
  if (gradeNumber <= 5) return "Grades 3-5";
  if (gradeNumber <= 8) return "Grades 6-8";
  return "Grades 9-12";
};

const mapAeisLevel = (grade = "") => {
  if (/primary/i.test(grade)) return "Primary";
  if (/secondary/i.test(grade)) return "Secondary";
  const gradeNumber = parseGradeNumber(grade);
  if (!gradeNumber) return null;
  return gradeNumber <= 6 ? "Primary" : "Secondary";
};

const mapToeflLevel = (difficulty = "", grade = "") => {
  const source = normalizePathwayText(`${difficulty} ${grade}`);
  if (source.includes("foundation") || source.includes("beginner") || source.includes("easy")) {
    return "Foundation";
  }
  if (source.includes("advanced") || source.includes("hard")) return "Advanced";
  if (source.includes("intermediate") || source.includes("medium")) return "Intermediate";
  return null;
};

const mapIeltsBand = (difficulty = "", grade = "") => {
  const source = normalizePathwayText(`${difficulty} ${grade}`);
  if (/7\.5|advanced|hard/.test(source)) return "7.5+";
  if (/6\.5|7\.0/.test(source)) return "6.5-7.0";
  if (/5\.5|6\.0|intermediate|medium/.test(source)) return "5.5-6.0";
  if (/4\.0|5\.0|foundation|beginner|easy/.test(source)) return "4.0-5.0";
  return null;
};

const normalizeLegacySkill = (question = {}, pathway = "") => {
  const skill = String(question.skill || question.skill_tag || question.category || "").trim();
  const source = normalizePathwayText(skill);

  if (!skill) return null;

  if (pathway === "MAP") {
    if (source.includes("grammar") || source.includes("usage")) return "Language Usage";
    if (source.includes("literature")) return "Literature";
    if (source.includes("informational")) return "Informational Text";
    if (source.includes("vocab")) return "Vocabulary";
    return "Reading";
  }

  if (pathway === "WIDA") {
    if (source.includes("writing")) return "Writing";
    if (source.includes("academic") || source.includes("vocab")) return "Academic Vocabulary";
    if (source.includes("grammar")) return "Grammar";
    return "Reading";
  }

  if (pathway === "CAT4") {
    if (source.includes("quant")) return "Quantitative Reasoning";
    if (source.includes("non")) return "Non-verbal Reasoning";
    if (source.includes("spatial")) return "Spatial Reasoning";
    return "Verbal Reasoning";
  }

  if (pathway === "AEIS" || pathway === "O-Level English") {
    if (source.includes("cloze")) return "Cloze";
    if (source.includes("transform")) return "Sentence Transformation";
    if (source.includes("composition") || source.includes("writing")) return "Composition Planning";
    if (source.includes("grammar")) return "Grammar";
    if (source.includes("vocab")) return "Vocabulary";
    return "Reading Comprehension";
  }

  if (pathway === "TOEFL" || pathway === "IELTS") {
    if (source.includes("writing")) return "Writing";
    if (source.includes("vocab")) return "Vocabulary";
    if (source.includes("grammar")) return "Grammar";
    return "Reading";
  }

  return skill;
};

const getLegacyEnglishDefaultCategory = (question = {}, skill = "") => {
  const explicitCategory = String(question.category || "").trim();
  if (explicitCategory) return explicitCategory;

  const source = normalizePathwayText(skill || question.skill || question.skill_tag);

  if (
    source.includes("inference") ||
    source.includes("main idea") ||
    source.includes("detail") ||
    source.includes("reading")
  ) {
    return "Reading Comprehension";
  }

  if (source.includes("vocab")) return "Vocabulary";
  if (source.includes("grammar") || source.includes("usage")) return "Grammar";
  if (source.includes("cloze")) return "Cloze";
  if (source.includes("writing") || source.includes("composition")) return "Writing";

  return question.exam_type || "English Practice";
};

const classifyLegacyEnglishQuestion = (question = {}) => {
  const detectedPathway = detectLegacyEnglishPathway(question);
  const fallbackMapLevel = normalizeLegacyGradeLevel(question.grade || question.level);
  const pathway = detectedPathway || (fallbackMapLevel ? "MAP" : null);

  if (!pathway || !LEGACY_ENGLISH_PATHWAYS.has(pathway)) {
    return {
      status: "unmapped",
      reason: "No confident pathway found",
      confidence: 0,
    };
  }

  let level = null;
  let pathwayVariant = null;

  if (pathway === "MAP" || pathway === "CAT4") {
    level = normalizeLegacyGradeLevel(question.level || question.grade) || null;
  } else if (pathway === "WIDA") {
    level = question.level || mapGradeToWidaBand(question.grade);
  } else if (pathway === "AEIS") {
    level = question.level || mapAeisLevel(question.grade);
  } else if (pathway === "O-Level English") {
    level = "O-Level";
  } else if (pathway === "TOEFL") {
    level = question.level || mapToeflLevel(question.difficulty, question.grade);
  } else if (pathway === "IELTS") {
    level = question.level || mapIeltsBand(question.difficulty, question.grade);
    const source = normalizePathwayText(`${question.category || ""} ${question.exam_type || ""}`);
    if (source.includes("general")) pathwayVariant = "General Training";
    if (source.includes("academic")) pathwayVariant = "Academic";
  }

  const skill = normalizeLegacySkill(question, pathway);
  const confident = Boolean(pathway && level && skill);

  return {
    status: confident ? "mapped" : "needs_review",
    reason: confident ? "Deterministic rule match" : "Pathway found but level or skill is uncertain",
    confidence: confident ? 0.92 : 0.55,
    proposed: {
      target_language: "English",
      pathway,
      level,
      level_label:
        pathway === "WIDA"
          ? "Grade Band"
          : pathway === "TOEFL"
            ? "Level"
            : pathway === "IELTS"
              ? "Target Band"
              : pathway === "AEIS" || pathway === "O-Level English"
                ? "Level"
                : "Grade",
      pathway_variant: pathwayVariant,
      variant_label: pathwayVariant ? "Module" : null,
      skill,
      category: getLegacyEnglishDefaultCategory(question, skill),
      status: confident ? question.status || "approved" : "needs_review",
    },
  };
};

const readingSkillSet = new Set([
  "Reading",
  "Reading Comprehension",
  "Main Idea",
  "Inference",
  "Detail Questions",
  "Literature",
  "Informational Text",
]);

const getReadingPassagePlan = ({
  examType = "",
  level = "",
  grade = "",
  questionCount = 3,
}) => {
  const selectedLevel = String(level || grade || "");
  const requestedCount = Number.parseInt(String(questionCount), 10) || 3;
  const gradeMatch = selectedLevel.match(/Grade\s+(\d+)/i);
  const gradeNumber = gradeMatch ? Number.parseInt(gradeMatch[1], 10) : null;
  const isKindergarten = /kindergarten|^k$/i.test(selectedLevel);
  const isIeltsLongReading =
    examType === "IELTS" &&
    (/5\.5\s*[–-]\s*6\.0|6\.5|7\.5|\+/.test(selectedLevel));
  const isToeflLongReading =
    examType === "TOEFL" && /Intermediate|Advanced/i.test(selectedLevel);
  const isAdvancedJapanese = /N2|N1/.test(selectedLevel);
  const isAdvancedChinese = /HSK\s*(5|6)/i.test(selectedLevel);

  if (
    (gradeNumber && gradeNumber >= 10) ||
    isIeltsLongReading ||
    isToeflLongReading ||
    isAdvancedJapanese ||
    isAdvancedChinese
  ) {
    return {
      minWords: 220,
      maxWords: 350,
      questionTotal: Math.min(3, Math.max(2, requestedCount)),
      label: "advanced reading passage",
    };
  }

  if ((gradeNumber && gradeNumber >= 7) || /N3|HSK\s*4/i.test(selectedLevel)) {
    return {
      minWords: 150,
      maxWords: 220,
      questionTotal: Math.min(3, Math.max(2, requestedCount)),
      label: "middle school reading passage",
    };
  }

  if ((gradeNumber && gradeNumber >= 4) || /N4|HSK\s*(2|3)/i.test(selectedLevel)) {
    return {
      minWords: 100,
      maxWords: 150,
      questionTotal: Math.min(2, Math.max(2, requestedCount)),
      label: "upper primary reading passage",
    };
  }

  if (isKindergarten || (gradeNumber && gradeNumber <= 3) || /N5|HSK\s*1/i.test(selectedLevel)) {
    return {
      minWords: 60,
      maxWords: 100,
      questionTotal: 1,
      label: "early reading passage",
    };
  }

  return {
    minWords: 100,
    maxWords: 150,
    questionTotal: Math.min(2, Math.max(1, requestedCount)),
    label: "general reading passage",
  };
};

const buildLegacyPromptBackfill = (question = {}) => {
  const questionText = question.question_text || question.prompt || question.question_en || "";
  const optionA = question.option_a || question.option_a_en || "";
  const optionB = question.option_b || question.option_b_en || "";
  const optionC = question.option_c || question.option_c_en || "";
  const optionD = question.option_d || question.option_d_en || "";
  const explanation = question.explanation || question.explanation_en || "";

  return {
    question_text: questionText || null,
    question_en: questionText || null,
    option_a: optionA || null,
    option_a_en: optionA || null,
    option_b: optionB || null,
    option_b_en: optionB || null,
    option_c: optionC || null,
    option_c_en: optionC || null,
    option_d: optionD || null,
    option_d_en: optionD || null,
    explanation: explanation || null,
    explanation_en: explanation || null,
    correct_answer: question.correct_answer,
    passage: question.passage || null,
  };
};

const buildLegacyEnglishMigrationPreview = (question = {}, classification = {}) => {
  const content = buildLegacyPromptBackfill(question);
  const proposed = classification.proposed || {};

  return {
    old_question_text: question.question_text || question.prompt || "",
    proposed_question_en: content.question_en || "",
    proposed_options_en: {
      option_a_en: content.option_a_en || "",
      option_b_en: content.option_b_en || "",
      option_c_en: content.option_c_en || "",
      option_d_en: content.option_d_en || "",
    },
    correct_answer: content.correct_answer || "",
    proposed_explanation_en: content.explanation_en || "",
    passage: content.passage || null,
    proposed_pathway: proposed.pathway || null,
    proposed_level: proposed.level || null,
    proposed_skill: proposed.skill || null,
    proposed_category: proposed.category || null,
    proposed_status: proposed.status || classification.status || "needs_review",
  };
};

const fetchLegacyEnglishQuestionsForMigration = async () => {
  const { data, error } = await supabaseAdmin
    .from("questions")
    .select("*")
    .or("target_language.eq.English,target_language.is.null")
    .limit(2000);

  if (error) throw new Error(error.message);

  return (data || []).filter(
    (question) => !question.pathway || question.pathway === "Legacy Grade"
  );
};

const classifyLegacyEnglishQuestionsWithAi = async (items = []) => {
  if (items.length === 0) return new Map();

  const batches = [];
  for (let index = 0; index < items.length; index += 40) {
    batches.push(items.slice(index, index + 40));
  }

  const results = new Map();

  for (const batch of batches) {
    const prompt = `
Classify legacy English learning questions into the new Luna pathway structure.

Allowed pathways and levels:
- MAP: Kindergarten, Grade 1-12
- WIDA: K, Grades 1-2, Grades 3-5, Grades 6-8, Grades 9-12
- CAT4: Grade 1-12
- AEIS: Primary, Secondary
- O-Level English: O-Level
- TOEFL: Foundation, Intermediate, Advanced
- IELTS: 4.0-5.0, 5.5-6.0, 6.5-7.0, 7.5+

Allowed skills:
- MAP: Reading, Vocabulary, Language Usage
- WIDA: Reading, Writing, Academic Vocabulary, Grammar
- CAT4: Verbal Reasoning, Non-verbal Reasoning, Quantitative Reasoning, Spatial Reasoning
- AEIS/O-Level English: Grammar, Vocabulary, Cloze, Reading Comprehension, Sentence Transformation, Composition Planning
- TOEFL/IELTS: Reading, Writing, Vocabulary, Grammar

Rules:
- Do NOT rewrite or regenerate questions.
- Classify only.
- If uncertain, use confidence below 0.75.
- Do not invent official exam claims.

Input:
${JSON.stringify(
  batch.map((item) => ({
    id: item.id,
    exam_type: item.exam_type,
    grade: item.grade,
    difficulty: item.difficulty,
    skill: item.skill || item.skill_tag,
    category: item.category,
    question: item.question_en || item.question_text || item.prompt,
  })),
  null,
  2
)}

Return ONLY JSON:
{
  "items": [
    {
      "id": "...",
      "pathway": "MAP",
      "level": "Grade 5",
      "skill": "Reading",
      "category": "MAP Reading",
      "confidence": 0.82,
      "reason": "..."
    }
  ]
}
`;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const text = response.output_text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      console.error("LEGACY ENGLISH AI CLASSIFICATION JSON ERROR:", text);
      continue;
    }

    for (const item of parsed.items || []) {
      if (!item.id) continue;
      results.set(String(item.id), item);
    }
  }

  return results;
};

const mergeAiLegacyClassification = (question, deterministic, aiItem) => {
  if (!aiItem) return deterministic;

  const pathway = LEGACY_ENGLISH_PATHWAYS.has(aiItem.pathway) ? aiItem.pathway : null;
  const level = String(aiItem.level || "").trim();
  const skill = String(aiItem.skill || "").trim();
  const confidence = Number(aiItem.confidence || 0);

  if (!pathway || !level || !skill) return deterministic;

  return {
    status: confidence >= 0.75 ? "mapped" : "needs_review",
    reason: aiItem.reason || "AI classification",
    confidence,
    proposed: {
      target_language: "English",
      pathway,
      level,
      level_label:
        pathway === "WIDA"
          ? "Grade Band"
          : pathway === "TOEFL"
            ? "Level"
            : pathway === "IELTS"
              ? "Target Band"
              : pathway === "AEIS" || pathway === "O-Level English"
                ? "Level"
                : "Grade",
      pathway_variant: null,
      variant_label: null,
      skill,
      category: aiItem.category || getLegacyEnglishDefaultCategory(question, skill),
      status: confidence >= 0.75 ? question.status || "approved" : "needs_review",
    },
  };
};

app.post("/api/admin/questions/legacy-english-migration/preview", requireAdmin, async (req, res) => {
  try {
    const { useAiClassification = false } = req.body || {};
    const questions = await fetchLegacyEnglishQuestionsForMigration();
    const deterministicResults = questions.map((question) => ({
      question,
      classification: classifyLegacyEnglishQuestion(question),
    }));
    const aiCandidates = deterministicResults
      .filter((item) => item.classification.status !== "mapped")
      .map((item) => item.question);
    const aiResults = useAiClassification
      ? await classifyLegacyEnglishQuestionsWithAi(aiCandidates)
      : new Map();

    const results = deterministicResults.map(({ question, classification }) => {
      const finalClassification = mergeAiLegacyClassification(
        question,
        classification,
        aiResults.get(question.id)
      );

      return {
        id: question.id,
        question_preview:
          question.question_en ||
          question.question_text ||
          question.prompt ||
          "",
        exam_type: question.exam_type || null,
        grade: question.grade || null,
        difficulty: question.difficulty || null,
        skill: question.skill || question.skill_tag || null,
        current_pathway: question.pathway || null,
        current_level: question.level || null,
        current_status: question.status || "approved",
        classification: finalClassification,
        migration_preview: buildLegacyEnglishMigrationPreview(question, finalClassification),
      };
    });

    const confidentlyMapped = results.filter((item) => item.classification.status === "mapped");
    const needsReview = results.filter((item) => item.classification.status === "needs_review");
    const unmapped = results.filter((item) => item.classification.status === "unmapped");
    const nullPathwayResults = results.filter((item) => !item.current_pathway);
    const nullPathwayMapped = nullPathwayResults.filter(
      (item) => item.classification.status === "mapped"
    );

    return res.json({
      total_old_english_questions_found: questions.length,
      null_pathway_questions_found: nullPathwayResults.length,
      null_pathway_mapped_count: nullPathwayMapped.length,
      confidently_mapped_count: confidentlyMapped.length,
      needs_ai_or_review_count: needsReview.length,
      cannot_map_count: unmapped.length,
      ai_classification_used: Boolean(useAiClassification),
      samples: results.slice(0, 30),
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message || "Failed to preview legacy English migration.",
    });
  }
});

app.post("/api/admin/questions/legacy-english-migration/apply", requireAdmin, async (req, res) => {
  try {
    const { applyNeedsReview = false, useAiClassification = false } = req.body || {};
    const questions = await fetchLegacyEnglishQuestionsForMigration();
    const deterministicResults = questions.map((question) => ({
      question,
      classification: classifyLegacyEnglishQuestion(question),
    }));
    const aiCandidates = deterministicResults
      .filter((item) => item.classification.status !== "mapped")
      .map((item) => item.question);
    const aiResults = useAiClassification
      ? await classifyLegacyEnglishQuestionsWithAi(aiCandidates)
      : new Map();
    const updates = [];
    const skipped = [];

    for (const { question, classification: deterministic } of deterministicResults) {
      const classification = mergeAiLegacyClassification(
        question,
        deterministic,
        aiResults.get(question.id)
      );

      if (classification.status === "unmapped") {
        skipped.push({ id: question.id, reason: classification.reason });
        continue;
      }

      if (classification.status === "needs_review" && !applyNeedsReview) {
        skipped.push({ id: question.id, reason: classification.reason });
        continue;
      }

      updates.push({
        question,
        classification,
      });
    }

    const failed = [];
    let updated = 0;
    let nullPathwayUpdated = 0;

    for (const item of updates) {
      const payload = {
        ...item.classification.proposed,
        ...buildLegacyPromptBackfill(item.question),
        updated_at: new Date().toISOString(),
      };

      const { data: updatedRows, error } = await supabaseAdmin
        .from("questions")
        .update(payload)
        .eq("id", item.question.id)
        .select("id,pathway,level,skill,category,status");

      if (error) {
        failed.push({ id: item.question.id, error: error.message });
        continue;
      }

      if (!updatedRows || updatedRows.length === 0) {
        failed.push({ id: item.question.id, error: "No row matched update." });
        continue;
      }

      updated += updatedRows.length;
      if (!item.question.pathway) nullPathwayUpdated += updatedRows.length;
    }

    return res.json({
      total_old_english_questions_found: questions.length,
      null_pathway_questions_found: questions.filter((question) => !question.pathway).length,
      null_pathway_updated_count: nullPathwayUpdated,
      updated_count: updated,
      skipped_count: skipped.length,
      failed_count: failed.length,
      skipped: skipped.slice(0, 30),
      failed,
      ai_classification_used: Boolean(useAiClassification),
      note: "Apply preserves existing question text, options, answer, explanation, and passage while updating classification fields.",
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message || "Failed to apply legacy English migration.",
    });
  }
});

/* =========================
   OPENAI GENERATOR
========================= */

app.post("/api/admin/game-vocabulary/generate", requireAdmin, async (req, res) => {
  console.log("📚 SHARED GAME VOCABULARY ROUTE HIT");
  console.log("BODY:", req.body);

  let batchId = null;

  try {
    const {
      grade = "Grade 1",
      category = "",
      topic = "",
      count = 12,
      itemCount,
      targetLanguages = ["en", "zh", "ja"],
      generateImages = true,
    } = req.body;

    const finalCategory = String(category || topic || "General").trim() || "General";
    const requestedCount = Math.min(
      50,
      Math.max(1, Number(itemCount || count || 12))
    );
    const languages = sanitizeGameVocabLanguages(targetLanguages);

    const { data: batch, error: batchError } = await supabaseAdmin
      .from("game_vocabulary_generation_batches")
      .insert({
        grade,
        category: finalCategory,
        difficulty: null,
        requested_count: requestedCount,
        target_languages: languages,
        generate_images: Boolean(generateImages),
        status: "partial",
        metadata: {
          source: "admin_shared_generator",
        },
        created_by: req.user.id,
      })
      .select()
      .single();

    if (batchError) {
      console.error("GAME VOCAB BATCH INSERT ERROR:", batchError);
      return res.status(500).json({ error: batchError.message });
    }

    batchId = batch.id;

    const { data: existingItems, error: existingError } = await supabaseAdmin
      .from("game_vocabulary_items")
      .select("id, en, zh, ja, image_keyword, grade, category, status")
      .range(0, 19999);

    if (existingError) {
      throw new Error(existingError.message);
    }

    const existingEnglish = new Set();
    const existingKeywords = new Set();
    const existingChinese = new Set();
    const existingJapanese = new Set();

    for (const item of existingItems || []) {
      const en = normalizeGameVocabKey(item.en);
      const keyword = normalizeGameVocabKey(item.image_keyword);
      const zh = normalizeGameVocabKey(item.zh);
      const ja = normalizeGameVocabKey(item.ja);

      if (en) existingEnglish.add(en);
      if (keyword) existingKeywords.add(keyword);
      if (zh) existingChinese.add(zh);
      if (ja) existingJapanese.add(ja);
    }

    const existingEnglishText =
      existingEnglish.size > 0
        ? Array.from(existingEnglish)
          .sort()
          .slice(0, 500)
          .map((word) => `- ${word}`)
          .join("\n")
        : "- None";

    const existingKeywordText =
      existingKeywords.size > 0
        ? Array.from(existingKeywords)
          .sort()
          .slice(0, 500)
          .map((word) => `- ${word}`)
          .join("\n")
        : "- None";

    const generationPrompt = `
Generate exactly ${requestedCount} reusable multilingual vocabulary library items for children's learning games.

Grade:
${grade}

Grade rules:
${getGradeVocabRule(grade)}

Category / topic:
${finalCategory}

Languages:
- English
- Simplified Chinese
- Japanese

Do not generate any of these existing English words:
${existingEnglishText}

Do not generate any of these existing image keywords or concepts:
${existingKeywordText}

Rules:
- Generate fresh vocabulary that does not already exist anywhere in the shared library.
- Do not duplicate vocabulary across grades.
- Each item must represent one reusable vocabulary concept.
- Keep terms concise, child-friendly, and suitable for games.
- English should be lowercase unless the word is normally capitalized.
- Chinese must be Simplified Chinese.
- Japanese should be natural for children.
- image_keyword must be concise English.
- image_type must be one of:
object, animal, person, action, emotion, color, place, nature, food, transport, school_item, abstract_concept
- Prefer concrete visual words when possible.
- Do not include explanations or markdown.

Return ONLY valid JSON:
{
  "items": [
    {
      "en": "apple",
      "zh": "苹果",
      "ja": "りんご",
      "image_keyword": "apple",
      "image_type": "food",
      "metadata": {
        "notes": "optional short note"
      }
    }
  ]
}
`;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: generationPrompt,
    });

    const text = response.output_text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch (err) {
      console.error("SHARED GAME VOCAB JSON PARSE ERROR:", text);
      throw new Error("Generator returned invalid JSON.");
    }

    const rawItems = Array.isArray(parsed.items) ? parsed.items : [];
    const cleanItems = [];
    const seenEnglish = new Set();
    const seenKeywords = new Set();
    const seenChinese = new Set();
    const seenJapanese = new Set();
    const skippedDuplicates = [];

    const recordDuplicate = (item, reason) => {
      skippedDuplicates.push({
        en: item?.en || "",
        image_keyword: item?.image_keyword || "",
        reason,
      });
    };

    for (const rawItem of rawItems) {
      const item = cleanGameVocabItem(rawItem);
      if (!item) continue;

      const coreEn = normalizeGameVocabKey(item.en);
      const coreKeyword = normalizeGameVocabKey(item.image_keyword);
      const coreZh = normalizeGameVocabKey(item.zh);
      const coreJa = normalizeGameVocabKey(item.ja);

      if (!coreEn) continue;

      if (existingEnglish.has(coreEn)) {
        recordDuplicate(item, "existing_en");
        continue;
      }

      if (coreKeyword && existingKeywords.has(coreKeyword)) {
        recordDuplicate(item, "existing_image_keyword");
        continue;
      }

      if (coreZh && existingChinese.has(coreZh)) {
        recordDuplicate(item, "existing_zh");
        continue;
      }

      if (coreJa && existingJapanese.has(coreJa)) {
        recordDuplicate(item, "existing_ja");
        continue;
      }

      if (seenEnglish.has(coreEn)) {
        recordDuplicate(item, "batch_en");
        continue;
      }

      if (coreKeyword && seenKeywords.has(coreKeyword)) {
        recordDuplicate(item, "batch_image_keyword");
        continue;
      }

      if (coreZh && seenChinese.has(coreZh)) {
        recordDuplicate(item, "batch_zh");
        continue;
      }

      if (coreJa && seenJapanese.has(coreJa)) {
        recordDuplicate(item, "batch_ja");
        continue;
      }

      seenEnglish.add(coreEn);
      if (coreKeyword) seenKeywords.add(coreKeyword);
      if (coreZh) seenChinese.add(coreZh);
      if (coreJa) seenJapanese.add(coreJa);
      cleanItems.push(item);

      if (cleanItems.length >= requestedCount) break;
    }

    const savedItems = [];

    for (const item of cleanItems) {
      let imageUrl = null;
      let vocabImageId = null;

      const reusableImage = await findReusableVocabImage(item.en, item.image_keyword);

      if (reusableImage?.image_url) {
        imageUrl = reusableImage.image_url;
        vocabImageId = reusableImage.id;
      } else if (generateImages) {
        imageUrl = await getOrCreateVocabImage(
          item.en,
          item.image_keyword,
          item.image_type,
          item.zh,
          item.en,
          "zh_en"
        );

        const imageRecord = await findVocabImageByUrl(imageUrl);
        vocabImageId = imageRecord?.id || null;
      }

      const payload = {
        image_keyword: item.image_keyword,
        image_type: item.image_type,
        image_url: imageUrl,
        vocab_image_id: vocabImageId,
        en: item.en,
        zh: item.zh,
        ja: item.ja,
        grade,
        difficulty: null,
        category: finalCategory,
        status: imageUrl ? "needs_review" : "needs_review",
        metadata: {
          ...item.metadata,
          target_languages: languages,
          generation_batch_id: batchId,
        },
        created_by: req.user.id,
      };

      const { data, error } = await supabaseAdmin
        .from("game_vocabulary_items")
        .insert(payload)
        .select()
        .single();

      if (error) throw new Error(error.message);
      savedItems.push(data);
    }

    const existingConflictCount = skippedDuplicates.filter((item) =>
      String(item.reason || "").startsWith("existing_")
    ).length;

    const finalStatus =
      savedItems.length >= requestedCount
        ? "completed"
        : savedItems.length > 0
          ? "partial"
          : skippedDuplicates.length > 0
            ? "completed"
            : "failed";

    await supabaseAdmin
      .from("game_vocabulary_generation_batches")
      .update({
        status: finalStatus,
        generated_item_ids: savedItems.map((item) => item.id),
        metadata: {
          source: "admin_shared_generator",
          accepted_count: savedItems.length,
          requested_count: requestedCount,
          raw_count: rawItems.length,
          skipped_duplicate_count: skippedDuplicates.length,
          skipped_duplicates: skippedDuplicates,
          existing_conflict_count: existingConflictCount,
          duplicate_scope: "global",
        },
      })
      .eq("id", batchId);

    if (savedItems.length === 0 && skippedDuplicates.length === 0) {
      return res.status(500).json({
        error: "No valid vocabulary items were generated. Please try a different category.",
        batchId,
      });
    }

    return res.json({
      success: true,
      batchId,
      requested_count: requestedCount,
      generated_count: cleanItems.length,
      inserted_count: savedItems.length,
      skipped_duplicate_count: skippedDuplicates.length,
      skipped_duplicates: skippedDuplicates,
      existing_conflict_count: existingConflictCount,
      items: savedItems,
    });
  } catch (err) {
    console.error("SHARED GAME VOCAB ERROR:", err);

    if (batchId) {
      await supabaseAdmin
        .from("game_vocabulary_generation_batches")
        .update({
          status: "failed",
          error_message: err.message || "Shared vocabulary generation failed.",
        })
        .eq("id", batchId);
    }

    return res.status(500).json({
      error: err.message || "Failed to generate shared game vocabulary.",
      batchId,
    });
  }
});

app.post("/api/admin/game-vocabulary/duplicates", requireAdmin, async (req, res) => {
  try {
    const { apply = false } = req.body || {};

    if (apply) {
      return res.status(400).json({
        error:
          "Bulk duplicate cleanup is disabled. Review each duplicate group and reject selected items manually.",
      });
    }

    const { data: items, error } = await supabaseAdmin
      .from("game_vocabulary_items")
      .select("id, en, zh, ja, image_keyword, grade, category, status, image_url, metadata, created_at")
      .range(0, 19999);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const audit = buildGameVocabularyDuplicateAudit(items || []);
    return res.json({
      success: true,
      applied: false,
      total_items_checked: audit.total_items_checked,
      active_items_checked: audit.active_items_checked,
      duplicate_groups_found: audit.duplicate_groups_found,
      duplicate_rows_to_reject: audit.duplicate_rows_to_reject,
      duplicate_rows_marked_rejected: 0,
      duplicate_rows_deleted: 0,
      kept_rows: audit.kept_rows,
      duplicate_groups: audit.duplicate_groups,
    });
  } catch (err) {
    console.error("GAME VOCAB DUPLICATE AUDIT ERROR:", err);
    return res.status(500).json({
      error: err.message || "Failed to audit shared vocabulary duplicates.",
    });
  }
});

app.get("/api/admin/game-vocabulary/items", requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const pageSize = Math.min(100, Math.max(25, Number(req.query.pageSize || 25)));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const status = String(req.query.status || "approved");
    const grade = String(req.query.grade || "All");
    const category = String(req.query.category || "All");
    const search = String(req.query.search || "").trim();

    let query = supabaseAdmin
      .from("game_vocabulary_items")
      .select("id, en, zh, ja, image_keyword, image_type, image_url, grade, category, status, metadata, created_at, updated_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (status !== "All") query = query.eq("status", status);
    if (grade !== "All") query = query.eq("grade", grade);
    if (category !== "All") query = query.eq("category", category);

    if (search) {
      const cleanSearch = search.replace(/[%_,]/g, " ").trim();
      if (cleanSearch) {
        query = query.or(
          `en.ilike.%${cleanSearch}%,zh.ilike.%${cleanSearch}%,ja.ilike.%${cleanSearch}%,image_keyword.ilike.%${cleanSearch}%`
        );
      }
    }

    const { data, error, count } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({
      items: data || [],
      page,
      pageSize,
      total: count || 0,
      totalPages: Math.max(1, Math.ceil((count || 0) / pageSize)),
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message || "Failed to load shared vocabulary items.",
    });
  }
});

app.patch("/api/admin/game-vocabulary/items/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const allowed = ["en", "zh", "ja", "image_keyword", "grade", "category", "status"];
    const payload = {};

    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body || {}, key)) {
        payload[key] = req.body[key];
      }
    }

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ error: "No editable fields provided." });
    }

    const { data, error } = await supabaseAdmin
      .from("game_vocabulary_items")
      .update(payload)
      .eq("id", id)
      .select("id, en, zh, ja, image_keyword, image_type, image_url, grade, category, status, metadata, created_at, updated_at")
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({ item: data });
  } catch (err) {
    return res.status(500).json({
      error: err.message || "Failed to update shared vocabulary item.",
    });
  }
});

app.post("/api/admin/game-vocabulary/items/:id/mark-duplicate", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { duplicateOf, reason = "manual_duplicate" } = req.body || {};

    if (!duplicateOf || duplicateOf === id) {
      return res.status(400).json({ error: "A different kept item id is required." });
    }

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("game_vocabulary_items")
      .select("id, metadata")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !existing) {
      return res.status(404).json({ error: "Duplicate item not found." });
    }

    const { data, error } = await supabaseAdmin
      .from("game_vocabulary_items")
      .update({
        status: "rejected",
        metadata: {
          ...(existing.metadata || {}),
          duplicate_of: duplicateOf,
          duplicate_reason: reason,
          duplicate_action: "marked_rejected",
          duplicate_checked_at: new Date().toISOString(),
          duplicate_checked_by: req.user.id,
        },
      })
      .eq("id", id)
      .select("id, en, zh, ja, image_keyword, image_type, image_url, grade, category, status, metadata, created_at, updated_at")
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({ item: data });
  } catch (err) {
    return res.status(500).json({
      error: err.message || "Failed to mark duplicate item.",
    });
  }
});

app.post("/api/admin/game-vocabulary/backfill-from-memory-flip", requireAdmin, async (req, res) => {
  console.log("♻️ MEMORY FLIP BACKFILL ROUTE HIT");
  console.log("BODY:", req.body);

  let batchId = null;

  try {
    const {
      dryRun = true,
      preview,
      generateImages = false,
      grade,
      difficulty,
      languagePair,
    } = req.body || {};

    const isDryRun = preview === true ? true : Boolean(dryRun);
    const shouldGenerateImages = Boolean(generateImages);

    let query = supabaseAdmin
      .from("game_questions")
      .select("id, exam_type, grade, skill, difficulty, language_pair, question_data, created_at")
      .eq("game_type", "memory_flip")
      .order("created_at", { ascending: true })
      .range(0, 4999);

    if (grade) query = query.eq("grade", grade);
    if (difficulty) query = query.eq("difficulty", difficulty);
    if (languagePair) query = query.eq("language_pair", languagePair);

    const { data: gameRows, error: gameRowsError } = await query;

    if (gameRowsError) {
      return res.status(500).json({ error: gameRowsError.message });
    }

    const candidatesByKey = new Map();
    let totalPairsScanned = 0;

    for (const row of gameRows || []) {
      const pairs = Array.isArray(row.question_data?.pairs)
        ? row.question_data.pairs
        : [];

      for (const pair of pairs) {
        totalPairsScanned += 1;

        const candidate = extractMemoryFlipCandidate(row, pair);
        if (!candidate) continue;

        const key = getBackfillCandidateKey(candidate);
        if (!key) continue;

        if (candidatesByKey.has(key)) {
          mergeBackfillCandidates(candidatesByKey.get(key), candidate);
        } else {
          candidatesByKey.set(key, candidate);
        }
      }
    }

    const candidates = Array.from(candidatesByKey.values());

    const { data: existingItems, error: existingError } = await supabaseAdmin
      .from("game_vocabulary_items")
      .select("*");

    if (existingError) {
      return res.status(500).json({ error: existingError.message });
    }

    const candidatePlans = candidates.map((candidate, index) => {
      const existing = findExistingGameVocabularyItem(candidate, existingItems || []);
      const missingLanguages = ["en", "zh", "ja"].filter(
        (lang) => !String(candidate[lang] || "").trim()
      );
      const existingMissingLanguages = existing
        ? ["zh", "ja"].filter((lang) => !String(existing[lang] || "").trim())
        : [];
      const canUpdateExisting =
        Boolean(existing) &&
        (existingMissingLanguages.length > 0 ||
          (!existing.image_url && candidate.image_url) ||
          (!existing.vocab_image_id && candidate.vocab_image_id));

      return {
        migration_id: `memory-flip-${index + 1}`,
        candidate,
        existing,
        missingLanguages,
        canUpdateExisting,
      };
    });

    const summary = {
      dry_run: isDryRun,
      total_pairs_scanned: totalPairsScanned,
      unique_items_detected: candidates.length,
      items_already_in_shared_library: candidatePlans.filter((plan) => plan.existing).length,
      items_to_insert: candidatePlans.filter((plan) => !plan.existing).length,
      items_to_update: candidatePlans.filter((plan) => plan.canUpdateExisting).length,
      missing_en_count: candidatePlans.filter((plan) => plan.missingLanguages.includes("en")).length,
      missing_zh_count: candidatePlans.filter((plan) => plan.missingLanguages.includes("zh")).length,
      missing_ja_count: candidatePlans.filter((plan) => plan.missingLanguages.includes("ja")).length,
      images_reused_count: candidatePlans.filter((plan) => Boolean(plan.candidate.image_url)).length,
      images_missing_count: candidatePlans.filter((plan) => !plan.candidate.image_url).length,
      inserted_count: 0,
      updated_count: 0,
      skipped_count: 0,
      ai_filled_count: 0,
      ai_batch_count: 0,
      completed_ai_batch_count: 0,
      failed_ai_batch_count: 0,
      failed_ai_batch_ids: [],
      progress: [],
      generated_images_count: 0,
    };

    if (isDryRun) {
      return res.json({
        success: true,
        dryRun: true,
        summary,
        items: candidates.slice(0, 80).map((candidate) => ({
          ...candidate,
          existing_shared_item_id:
            findExistingGameVocabularyItem(candidate, existingItems || [])?.id || null,
        })),
      });
    }

    const { data: batch, error: batchError } = await supabaseAdmin
      .from("game_vocabulary_generation_batches")
      .insert({
        grade: grade || "Mixed",
        category: "Memory Flip Backfill",
        difficulty: difficulty || "Mixed",
        requested_count: candidates.length,
        target_languages: ["en", "zh", "ja"],
        generate_images: shouldGenerateImages,
        status: "partial",
        metadata: {
          source: "memory_flip_backfill",
          dry_run: false,
          language_pair_filter: languagePair || null,
          scanned_game_question_count: (gameRows || []).length,
          preview_summary: summary,
        },
        created_by: req.user.id,
      })
      .select()
      .single();

    if (batchError) {
      return res.status(500).json({ error: batchError.message });
    }

    batchId = batch.id;

    const savedItems = [];
    const refreshedExistingItems = [...(existingItems || [])];
    const importWorkItems = candidatePlans
      .filter((plan) => !plan.existing || plan.canUpdateExisting)
      .map((plan) => ({
        ...plan,
        candidate: {
          ...plan.candidate,
          metadata: { ...(plan.candidate.metadata || {}) },
        },
      }));
    const aiWorkItems = importWorkItems.filter(
      (workItem) => workItem.missingLanguages.length > 0
    );
    const noAiWorkItems = importWorkItems.filter(
      (workItem) => workItem.missingLanguages.length === 0
    );
    const aiBatches = createDynamicBackfillAiBatches(aiWorkItems);

    summary.ai_batch_count = aiBatches.length;

    const persistProgress = async () => {
      await supabaseAdmin
        .from("game_vocabulary_generation_batches")
        .update({
          metadata: {
            source: "memory_flip_backfill",
            dry_run: false,
            language_pair_filter: languagePair || null,
            scanned_game_question_count: (gameRows || []).length,
            progress: summary.progress,
            partial_summary: summary,
          },
        })
        .eq("id", batchId);
    };

    const writeBackfillItemsBatch = async (workItems, batchLabel) => {
      const insertPayloads = [];
      const updatePayloads = [];

      for (const workItem of workItems) {
        const candidate = {
          ...workItem.candidate,
          metadata: { ...(workItem.candidate.metadata || {}) },
        };
        const unresolvedLanguages = getMissingGameVocabLanguages(candidate);

        if (!candidate.en || unresolvedLanguages.length > 0) {
          summary.skipped_count += 1;
          continue;
        }

        let imageUrl = candidate.image_url || null;
        let vocabImageId = candidate.vocab_image_id || null;

        if (imageUrl) {
          const imageRecord = await findVocabImageByUrl(imageUrl);
          vocabImageId = imageRecord?.id || vocabImageId || null;
        } else {
          const reusableImage = await findReusableVocabImage(
            candidate.en,
            candidate.image_keyword
          );

          if (reusableImage?.image_url) {
            imageUrl = reusableImage.image_url;
            vocabImageId = reusableImage.id;
            summary.images_reused_count += 1;
          } else if (shouldGenerateImages) {
            imageUrl = await getOrCreateVocabImage(
              candidate.en,
              candidate.image_keyword,
              candidate.image_type,
              candidate.zh,
              candidate.en,
              "zh_en"
            );

            const imageRecord = await findVocabImageByUrl(imageUrl);
            vocabImageId = imageRecord?.id || null;

            if (imageUrl) summary.generated_images_count += 1;
          }
        }

        const existing =
          workItem.existing ||
          findExistingGameVocabularyItem(candidate, refreshedExistingItems);
        const memoryFlipMetadata = {
          game_question_ids: Array.from(
            new Set(candidate.metadata.legacy_game_question_ids || [])
          ),
          language_pairs: Array.from(
            new Set(candidate.metadata.legacy_language_pairs || [])
          ),
        };

        if (existing?.id) {
          updatePayloads.push({
            id: existing.id,
            image_keyword: existing.image_keyword || candidate.image_keyword,
            image_type: existing.image_type || candidate.image_type || "object",
            image_url: existing.image_url || imageUrl,
            vocab_image_id: existing.vocab_image_id || vocabImageId,
            en: existing.en || candidate.en,
            zh: existing.zh || candidate.zh || null,
            ja: existing.ja || candidate.ja || null,
            grade: existing.grade || candidate.grade || "Legacy",
            difficulty: existing.difficulty || candidate.difficulty,
            category: existing.category || candidate.category || "Memory Flip",
            status: existing.status || "needs_review",
            metadata: {
              ...(existing.metadata || {}),
              backfilled_from_memory_flip: true,
              backfill_batch_id: batchId,
              backfill_batch_label: batchLabel,
              legacy_memory_flip: {
                ...(existing.metadata?.legacy_memory_flip || {}),
                game_question_ids: Array.from(
                  new Set([
                    ...(existing.metadata?.legacy_memory_flip?.game_question_ids || []),
                    ...memoryFlipMetadata.game_question_ids,
                  ])
                ),
                language_pairs: Array.from(
                  new Set([
                    ...(existing.metadata?.legacy_memory_flip?.language_pairs || []),
                    ...memoryFlipMetadata.language_pairs,
                  ])
                ),
              },
            },
            created_by: existing.created_by || req.user.id,
          });

          continue;
        }

        insertPayloads.push({
          image_keyword: candidate.image_keyword || getCoreVocab(candidate.en),
          image_type: candidate.image_type || "object",
          image_url: imageUrl,
          vocab_image_id: vocabImageId,
          en: candidate.en,
          zh: candidate.zh || null,
          ja: candidate.ja || null,
          grade: candidate.grade || "Legacy",
          difficulty: candidate.difficulty,
          category: candidate.category || "Memory Flip",
          status: "needs_review",
          metadata: {
            ...(candidate.metadata || {}),
            backfilled_from_memory_flip: true,
            backfill_batch_id: batchId,
            backfill_batch_label: batchLabel,
            legacy_memory_flip: memoryFlipMetadata,
          },
          created_by: req.user.id,
        });
      }

      if (updatePayloads.length > 0) {
        const { data, error } = await supabaseAdmin
          .from("game_vocabulary_items")
          .upsert(updatePayloads, { onConflict: "id" })
          .select();

        if (error) throw new Error(error.message);

        summary.updated_count += data?.length || 0;
        savedItems.push(...(data || []));

        for (const item of data || []) {
          const index = refreshedExistingItems.findIndex((row) => row.id === item.id);
          if (index >= 0) refreshedExistingItems[index] = item;
          else refreshedExistingItems.push(item);
        }
      }

      if (insertPayloads.length > 0) {
        const { data, error } = await supabaseAdmin
          .from("game_vocabulary_items")
          .insert(insertPayloads)
          .select();

        if (error) throw new Error(error.message);

        summary.inserted_count += data?.length || 0;
        savedItems.push(...(data || []));
        refreshedExistingItems.push(...(data || []));
      }

      return {
        inserted_count: insertPayloads.length,
        updated_count: updatePayloads.length,
      };
    };

    if (noAiWorkItems.length > 0) {
      const progressEntry = {
        batch_id: "no-ai",
        item_count: noAiWorkItems.length,
        status: "writing",
      };
      summary.progress.push(progressEntry);

      const result = await writeBackfillItemsBatch(noAiWorkItems, "no-ai");

      progressEntry.status = "completed";
      progressEntry.inserted_count = result.inserted_count;
      progressEntry.updated_count = result.updated_count;
      await persistProgress();
    }

    for (let index = 0; index < aiBatches.length; index += 1) {
      const batchNumber = index + 1;
      const aiBatch = aiBatches[index];
      const progressEntry = {
        batch_id: `ai-${batchNumber}`,
        batch_number: batchNumber,
        total_batches: aiBatches.length,
        item_count: aiBatch.length,
        status: "running",
      };

      summary.progress.push(progressEntry);

      try {
        const filledBatch = await fillMissingGameVocabLanguagesBatch(aiBatch);
        const filledFieldCount = filledBatch.reduce(
          (total, item) => total + item.filledLanguages.length,
          0
        );

        summary.ai_filled_count += filledFieldCount;
        progressEntry.filled_count = filledFieldCount;

        const result = await writeBackfillItemsBatch(
          filledBatch,
          progressEntry.batch_id
        );

        progressEntry.status = "completed";
        progressEntry.inserted_count = result.inserted_count;
        progressEntry.updated_count = result.updated_count;
        summary.completed_ai_batch_count += 1;
      } catch (batchError) {
        console.error("MEMORY FLIP BACKFILL AI BATCH ERROR:", batchError);

        progressEntry.status = "failed";
        progressEntry.error_message =
          batchError.message || "Backfill AI batch failed.";
        summary.failed_ai_batch_count += 1;
        summary.failed_ai_batch_ids.push(progressEntry.batch_id);
        summary.skipped_count += aiBatch.length;
      }

      await persistProgress();
    }

    const completedOrExistingCount =
      summary.inserted_count +
      summary.updated_count +
      summary.items_already_in_shared_library;
    const finalStatus =
      summary.failed_ai_batch_count > 0 || summary.skipped_count > 0
        ? completedOrExistingCount > 0
          ? "partial"
          : "failed"
        : "completed";

    await supabaseAdmin
      .from("game_vocabulary_generation_batches")
      .update({
        status: finalStatus,
        generated_item_ids: savedItems.map((item) => item.id),
        metadata: {
          source: "memory_flip_backfill",
          final_summary: summary,
          scanned_game_question_count: (gameRows || []).length,
          language_pair_filter: languagePair || null,
        },
      })
      .eq("id", batchId);

    return res.json({
      success: true,
      dryRun: false,
      batchId,
      summary,
      items: savedItems.slice(0, 80),
    });
  } catch (err) {
    console.error("MEMORY FLIP BACKFILL ERROR:", err);

    if (batchId) {
      await supabaseAdmin
        .from("game_vocabulary_generation_batches")
        .update({
          status: "failed",
          error_message: err.message || "Memory Flip backfill failed.",
        })
        .eq("id", batchId);
    }

    return res.status(500).json({
      error: err.message || "Failed to backfill Memory Flip content.",
      batchId,
    });
  }
});

app.post("/api/admin/game-vocabulary/approve-memory-flip-backfill", requireAdmin, async (req, res) => {
  try {
    const { data: reviewItems, error: reviewError } = await supabaseAdmin
      .from("game_vocabulary_items")
      .select("id, status, metadata")
      .eq("status", "needs_review")
      .range(0, 9999);

    if (reviewError) {
      return res.status(500).json({ error: reviewError.message });
    }

    const targetIds = (reviewItems || [])
      .filter((item) => {
        const metadata = item.metadata || {};
        return (
          metadata.source === "memory_flip_backfill" ||
          metadata.backfilled_from_memory_flip === true
        );
      })
      .map((item) => item.id);

    const chunkSize = 250;
    let approvedCount = 0;

    for (let index = 0; index < targetIds.length; index += chunkSize) {
      const ids = targetIds.slice(index, index + chunkSize);
      const { data, error } = await supabaseAdmin
        .from("game_vocabulary_items")
        .update({ status: "approved" })
        .in("id", ids)
        .select("id");

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      approvedCount += data?.length || 0;
    }

    const { data: allItems, error: allItemsError } = await supabaseAdmin
      .from("game_vocabulary_items")
      .select("id, status, metadata")
      .range(0, 19999);

    if (allItemsError) {
      return res.status(500).json({ error: allItemsError.message });
    }

    const verificationItems = allItems || [];
    const approvedBackfilledCount = verificationItems.filter((item) => {
      const metadata = item.metadata || {};
      return (
        item.status === "approved" &&
        (metadata.source === "memory_flip_backfill" ||
          metadata.backfilled_from_memory_flip === true)
      );
    }).length;

    return res.json({
      success: true,
      targeted_count: targetIds.length,
      approved_count: approvedCount,
      verification: {
        total_shared_items: verificationItems.length,
        approved_count: verificationItems.filter((item) => item.status === "approved").length,
        needs_review_count: verificationItems.filter((item) => item.status === "needs_review").length,
        rejected_count: verificationItems.filter((item) => item.status === "rejected").length,
        approved_backfilled_count: approvedBackfilledCount,
      },
    });
  } catch (err) {
    console.error("APPROVE MEMORY FLIP BACKFILL ERROR:", err);
    return res.status(500).json({
      error: err.message || "Failed to approve Memory Flip backfilled vocabulary.",
    });
  }
});

app.post("/api/generate-game-questions", requireAdmin, async (req, res) => {
  console.log("🎮 GAME QUESTION ROUTE HIT");
  console.log("BODY:", req.body);

  return res.status(410).json({
    error:
      "Game-specific vocabulary generation has been retired. Use the Shared Vocabulary Library generator instead.",
    redirect: "/admin/generate/shared-vocabulary",
  });

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
      category = "",
      questionCount,
      extraPrompt,
      targetLanguage: targetLanguageInput,
      target_language: targetLanguageSnake,
      pathway,
      level,
      pathwayVariant,
      levelLabel = "Grade / Level",
      variantLabel,
      skillLabel = "Skill / Question Type",
      difficultyLabel = "Difficulty",
    } = req.body;

    const targetLanguage = targetLanguageInput || targetLanguageSnake || "English";
    const selectedPathway = pathway || examType;
    const selectedLevel = level || grade;
    const difficultyProfile = getDifficultyProfile({
      targetLanguage,
      pathway: selectedPathway,
      level: selectedLevel,
      grade,
      skill,
      pathwayVariant,
      difficulty,
    });
    const difficultyProfilePrompt = formatDifficultyProfileForPrompt(difficultyProfile);

    const targetLanguageFocusRules = {
      English: `
- Target-language goal: teach and assess English.
- Focus areas may include vocabulary, grammar, reading, writing, sentence structure, school English, and exam preparation when selected.
- The primary student-facing question, passage, options, and answer must be in English.
- Also provide Chinese and Japanese support translations for admin review and explanation support.
`,
      Japanese: `
- Target-language goal: teach and assess Japanese.
- Focus areas may include JLPT-style learning, hiragana, katakana, kanji, vocabulary, grammar, particles, reading, and sentence patterns.
- The primary student-facing question, passage, options, and answer must be in Japanese.
- Also provide English and Chinese support translations for admin review and explanation support.
`,
      Chinese: `
- Target-language goal: teach and assess Chinese.
- Focus areas may include Chinese vocabulary, pinyin, characters, reading, sentence structure, and HSK-style learning when selected.
- The primary student-facing question, passage, options, and answer must be in Chinese.
- Also provide English and Japanese support translations for admin review and explanation support.
`,
    };

    const examples = getExampleFile(examType, grade, skill);
	    const selectedStructure = structureRules[skill] || {
	      needsPassage: true,
	      format: "- Create realistic exam-style questions for the selected skill.",
	    };
	    const isReadingPassagePractice =
	      selectedStructure.needsPassage && readingSkillSet.has(skill);
	    const passagePlan = getReadingPassagePlan({
	      examType: selectedPathway,
	      level: selectedLevel,
	      grade,
	      questionCount,
	    });


	    const passageLengthRule = isReadingPassagePractice
	      ? `Generate one ${passagePlan.label} of ${passagePlan.minWords}-${passagePlan.maxWords} words.`
	      : selectedStructure.needsPassage
	        ? "Use a concise passage of 40-120 words when possible. The absolute maximum is 180 words."
	      : "No separate passage needed.";



    const prompt = `
You are a professional education content writer for concise exam-aligned skill practice.


SELECTED SETTINGS:
Exam / Pathway: ${selectedPathway}
${levelLabel}: ${selectedLevel}
${pathwayVariant ? `${variantLabel || "Variant"}: ${pathwayVariant}` : ""}
${skillLabel}: ${skill}
Category / Topic: ${category || "General"}
${difficulty ? `${difficultyLabel || "Difficulty"}: ${difficulty}` : "Difficulty / Band: Not used for this pathway"}
	Number of questions requested: ${questionCount}
	${isReadingPassagePractice ? `Reading output: 1 passage with ${passagePlan.questionTotal} questions based on that passage.` : ""}
	Target language being learned: ${targetLanguage}

LANGUAGE RULES:
${targetLanguageFocusRules[targetLanguage] || targetLanguageFocusRules.English}
- The target language determines the learning content, grammar scope, vocabulary scope, exam style, skill type, and the language students see during practice.
- Use the selected category/topic as the content theme when it is provided.
	- Generate ONE logical question per item, but include English, Chinese, and Japanese text fields for storage/review.
	- question_en, question_zh, and question_ja must ask the SAME question.
- option_a/b/c/d en/zh/ja fields must represent the SAME answer choices across support languages.
- explanation_en, explanation_zh, and explanation_ja must explain the SAME reasoning.
	- For reading skills, the passage should normally be in ${targetLanguage} and should be the shared source text for all questions in that reading set.
- Do not reduce the task to simple word-pair translation unless Skill = Vocabulary and that is appropriate for the selected grade.
- Do not silently switch the target language. A ${targetLanguage} question must remain a ${targetLanguage} learning question.
- Do not generate Listening tasks, audio scripts, listening transcripts, or Speaking tasks.
- Generate realistic mock questions aligned with the selected pathway. Do not copy or reproduce official copyrighted exam questions.
- This is daily skill practice, not a full exam simulation.

EXPLANATION QUALITY RULES:
- Explanations must be useful teaching notes, not one-line answer keys.
- Explain why the correct answer is correct.
- Explain why a common wrong answer or tempting distractor is wrong when possible.
- For reading, cite specific evidence, wording, or logic from the passage.
- For vocabulary, explain the meaning in context and why distractors do not fit.
- For grammar, name or describe the grammar rule in student-friendly language.
- Keep explanations concise but substantial: usually 2-4 sentences per language.
- explanation_en, explanation_zh, and explanation_ja should carry the same teaching value, not just a short label.

STYLE EXAMPLES FROM FILE:
${examples || "No example file found. Use realistic exam style."}

${difficultyProfilePrompt}

	PASSAGE LENGTH RULES:
	${structureRules[skill]?.needsPassage ? `
	- ${passageLengthRule}
	${isReadingPassagePractice ? `
	- Reading is passage-first. Generate ONE passage only.
	- Generate ${passagePlan.questionTotal} question${passagePlan.questionTotal === 1 ? "" : "s"} from that same passage.
	- Do not repeat or rewrite the passage for each question.
	- Maximum 3 questions per passage.
	- For passages of 220+ words, use 3-4 short paragraphs and aim for the middle of the allowed range so validation does not fail by being too short.
	- Count the passage words before returning. Do not return a passage below ${passagePlan.minWords} words or above ${passagePlan.maxWords} words.
	` : `
	- Reading passages should usually be one short paragraph.
	- Never create full-test passages or long official-style reading sections.
	`}
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
	- If Reading output is active → return exactly ONE reading object with one shared passage and a questions array
	- If Needs passage = true and Reading output is not active → EVERY question MUST include a passage
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
- Check if output matches the selected pathway: ${selectedPathway}
- Check if output matches the selected level: ${selectedLevel}
- Check if output matches skill: ${skill}
- Check if structure matches Needs passage
- Check if vocabulary, grammar, passage complexity, and cognitive demand match the Difficulty Profile
- Check if distractors are plausible for the level
- Check if the correct answer is clearly supported
- Check if the explanation is useful and references evidence/rules where appropriate
- Check if the question is too easy or too hard for the selected profile
- If not → fix it before returning
	- If Reading output is active, passage must be ${passagePlan.minWords}-${passagePlan.maxWords} words.
	- If other passage practice is required, keep it concise: normally 40-120 words, never more than 180 words.
5. EXAM ENFORCEMENT:
- You MUST match the style of the selected exam
- Do NOT generate generic questions, but keep the item short and focused
- If the question could belong to any exam → it is WRONG
- Adjust tone, difficulty, and structure based on exam type

	6. PASSAGE CONTROL:
	- If Reading output is active → include one shared passage and do not duplicate it inside each question
	- If passage is required but Reading output is not active → include a concise short passage
	- If non-reading passage is longer than 180 words → shorten it internally
	- If no passage is required → MUST return "passage": null

If you fail to follow these rules, your answer is incorrect.
Extra instructions:
${extraPrompt || ""}

	${isReadingPassagePractice ? `
	Return ONLY one valid JSON object in this exact format:
	{
	  "type": "reading",
	  "passage": "...",
	  "questions": [
	    {
	      "question_type": "Main Idea",
	      "question_en": "...",
	      "question_zh": "...",
	      "question_ja": "...",
	      "option_a_en": "...",
	      "option_a_zh": "...",
	      "option_a_ja": "...",
	      "option_b_en": "...",
	      "option_b_zh": "...",
	      "option_b_ja": "...",
	      "option_c_en": "...",
	      "option_c_zh": "...",
	      "option_c_ja": "...",
	      "option_d_en": "...",
	      "option_d_zh": "...",
	      "option_d_ja": "...",
	      "correct_answer": "option_a",
	      "explanation_en": "...",
	      "explanation_zh": "...",
	      "explanation_ja": "...",
	      "pathway": "${selectedPathway}",
	      "level": "${selectedLevel}",
	      "skill": "${skill}",
	      "estimated_cefr": "${difficultyProfile.estimated_cefr || ""}",
	      "difficulty_rationale": "...",
	      "why_this_matches_level": "..."
	    }
	  ]
	}
	Question type rules:
	- Use a mix from: Main Idea, Vocabulary in Context, Inference, Detail Question, Reference Question.
	- Do not repeat the same question_type within one passage unless only 1 question is required.
	- All questions must be answerable from the passage.
	` : `
	Return ONLY valid JSON array in this exact format:
	[
	  {
    "passage": "... or null",
    "question_en": "...",
    "question_zh": "...",
    "question_ja": "...",
    "option_a_en": "...",
    "option_a_zh": "...",
    "option_a_ja": "...",
    "option_b_en": "...",
    "option_b_zh": "...",
    "option_b_ja": "...",
    "option_c_en": "...",
    "option_c_zh": "...",
    "option_c_ja": "...",
    "option_d_en": "...",
    "option_d_zh": "...",
    "option_d_ja": "...",
    "correct_answer": "option_a",
    "explanation_en": "...",
    "explanation_zh": "...",
    "explanation_ja": "...",
    "pathway": "${selectedPathway}",
    "level": "${selectedLevel}",
    "skill": "${skill}",
    "estimated_cefr": "${difficultyProfile.estimated_cefr || ""}",
    "difficulty_rationale": "...",
    "question_type": "${skill}",
    "why_this_matches_level": "..."
	  }
	]
	`}
	`;

    const countWords = (text = "") =>
      text.trim().split(/\s+/).filter(Boolean).length;

    const cleanJSON = (text) =>
      text.replace(/```json/g, "").replace(/```/g, "").trim();

    const applyDifficultyMetadata = (item = {}, fallbackQuestionType = skill) => ({
      ...item,
      pathway: item.pathway || selectedPathway,
      level: item.level || selectedLevel,
      skill: item.skill || skill,
      estimated_cefr:
        item.estimated_cefr || difficultyProfile.estimated_cefr || null,
      difficulty_rationale:
        item.difficulty_rationale || difficultyProfile.difficultyRationale,
      question_type:
        item.question_type || fallbackQuestionType || skill || null,
      why_this_matches_level:
        item.why_this_matches_level || difficultyProfile.whyThisMatchesLevel,
    });

    const enrichGeneratedData = (parsed) => {
      if (isReadingPassagePractice && parsed?.type === "reading") {
        return {
          ...parsed,
          pathway: parsed.pathway || selectedPathway,
          level: parsed.level || selectedLevel,
          skill: parsed.skill || skill,
          estimated_cefr:
            parsed.estimated_cefr || difficultyProfile.estimated_cefr || null,
          difficulty_rationale:
            parsed.difficulty_rationale || difficultyProfile.difficultyRationale,
          why_this_matches_level:
            parsed.why_this_matches_level || difficultyProfile.whyThisMatchesLevel,
          questions: (parsed.questions || []).map((question) =>
            applyDifficultyMetadata(question, question.question_type || skill)
          ),
        };
      }

      if (Array.isArray(parsed)) {
        return parsed.map((item) => applyDifficultyMetadata(item));
      }

      return parsed;
    };

	    const needsPassage = selectedStructure.needsPassage;
	    const minPassageWords = isReadingPassagePractice
	      ? passagePlan.minWords
	      : needsPassage
	        ? 20
	        : 0;
	    const maxPassageWords = isReadingPassagePractice ? passagePlan.maxWords : 180;
	    const retryTargetMin = isReadingPassagePractice
	      ? Math.min(passagePlan.maxWords, passagePlan.minWords + 40)
	      : minPassageWords;
	    const retryTargetMax = isReadingPassagePractice
	      ? Math.max(retryTargetMin, passagePlan.maxWords - 40)
	      : maxPassageWords;

    let finalData = null;
    let retryPrompt = prompt;

    for (let attempt = 0; attempt < 3; attempt++) {
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

	      if (isReadingPassagePractice) {
	        const wc = countWords(parsed?.passage || "");
	        const readingQuestions = Array.isArray(parsed?.questions)
	          ? parsed.questions
	          : [];
	        const questionTypes = readingQuestions
	          .map((q) => q.question_type)
	          .filter(Boolean);
	        const uniqueQuestionTypes = new Set(questionTypes);

	        console.log("READING PASSAGE WORD COUNT:", wc);
	        console.log("READING QUESTION COUNT:", readingQuestions.length);

	        if (
	          parsed?.type !== "reading" ||
	          wc < minPassageWords ||
	          wc > maxPassageWords ||
	          readingQuestions.length !== passagePlan.questionTotal ||
	          (questionTypes.length > 1 && uniqueQuestionTypes.size !== questionTypes.length)
	        ) {
	          valid = false;
	        }
	      } else if (needsPassage) {
	        const parsedItems = Array.isArray(parsed) ? parsed : [];

	        if (parsedItems.length === 0) {
	          valid = false;
	        }

	        for (const q of parsedItems) {
	          const wc = countWords(q.passage || "");
	          console.log("PASSAGE WORD COUNT:", wc);

	          if (wc < minPassageWords || wc > maxPassageWords) {
	            valid = false;
	            break;
	          }
	        }
	      } else if (!Array.isArray(parsed)) {
	        valid = false;
	      }

      if (valid) {
        finalData = enrichGeneratedData(parsed);
        console.log("✅ Passed validation");
        break;
      }

	      console.log("❌ Generated structure invalid. Retrying with stricter instruction.");

      retryPrompt = `
${prompt}

	YOUR LAST OUTPUT FAILED BECAUSE THE READING STRUCTURE OR PASSAGE LENGTH WAS INVALID.

	MANDATORY:
	${isReadingPassagePractice ? `
	- Return one JSON object with "type": "reading", one shared passage, and exactly ${passagePlan.questionTotal} questions.
	- The shared passage must be ${passagePlan.minWords}-${passagePlan.maxWords} words.
	- Aim for ${retryTargetMin}-${retryTargetMax} words to avoid being just under the minimum.
	- If the previous passage was too short, add another concrete paragraph with relevant details before returning.
	- Do not duplicate the passage inside individual questions.
	- Mix question_type values. Do not repeat question types.
	` : `
	- If passage is required, each passage must be concise: 40-120 words preferred, 180 words absolute maximum.
	`}
	- If no passage is required, use "passage": null.
	- Count the words before returning.
	- Do not create full exam passages, transcripts, audio scripts, or speaking tasks.
`;
    }

    if (!finalData) {
      return res.status(500).json({
        error: "Failed to generate concise exam-aligned practice questions. Please try a smaller count or a simpler topic.",
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

app.post("/api/submit-career-application", async (req, res) => {
  try {
    const applicationData = req.body;

    const { data: application, error } = await supabaseAdmin
      .from("career_applications")
      .insert(applicationData)
      .select("id")
      .single();

    if (error) {
      console.error("Career application insert error:", error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
    const baseUrl = process.env.API_BASE_URL || `http://localhost:${PORT || 3001}`;

    const emailRes = await fetch(`${baseUrl}/api/send-career-application-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        applicationId: application.id,
      }),
    });

    const emailData = await emailRes.json();

    if (!emailRes.ok || !emailData.success) {
      return res.status(500).json({
        success: false,
        error: emailData.error || "Application saved, but email notification failed.",
      });
    }

    return res.json({
      success: true,
      id: application.id,
    });
  } catch (error) {
    console.error("Submit career application error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Something went wrong.",
    });
  }
});

app.post("/api/generate-flashcards", async (req, res) => {
  try {
    const {
      words,
      wordLanguage = "English",
      helperLanguage = "Chinese",
      difficulty = "Easy",
    } = req.body;

    if (!Array.isArray(words) || words.length === 0) {
      return res.status(400).json({
        error: "Words are required.",
      });
    }

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: `
Create bilingual flashcards.

Word language: ${wordLanguage}
Helper language: ${helperLanguage}
Difficulty: ${difficulty}

Words:
${words.join("\n")}

For EACH word generate:

- meaning
- pronunciation
- example sentence
- memory hint
- quiz question
- 4 quiz options
- answer

Return ONLY valid JSON.

{
  "cards": [
    {
      "word": "sincere",
      "meaning": "真诚的",
      "pronunciation": "sin-SEER",
      "example": "She gave me a sincere smile.",
      "memoryHint": "Think of someone speaking from the heart.",
      "quizQuestion": "What does sincere mean?",
      "quizOptions": [
        "真诚的",
        "巨大的",
        "借入",
        "疲惫的"
      ],
      "answer": "真诚的"
    }
  ]
}
`,
    });

    const text = response.output_text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(text);

    return res.json(parsed);
  } catch (err) {
    console.error("FLASHCARD ERROR:", err);

    return res.status(500).json({
      error: err.message || "Failed to generate flashcards",
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
