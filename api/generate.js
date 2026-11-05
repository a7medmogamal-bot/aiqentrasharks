import {
  HARDCODED_GROQ_KEY,
  MAX_IMAGES,
  MAX_PAYLOAD_BYTES,
  MAX_IMAGE_BASE64_LENGTH,
  JOB_TTL_SECONDS,
  VALID_SUBJECTS
} from "./_lib/constants.js";
import { verifyFirebaseToken } from "./_lib/auth.js";
import { createJobDoc, getUsageDoc, incrementUsage } from "./_lib/firestore.js";
import { processJob } from "./_lib/process.js";

function generateJobId() {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `job_${ts}_${rand}`;
}

function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const projectId = process.env.FIREBASE_PROJECT_ID || "aiqentraplatform";
    const groqApiKey = process.env.GROQ_API_KEY || HARDCODED_GROQ_KEY;

    if (req.method === "GET") {
      return res.status(200).json({
        ok: true,
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        keySource: process.env.GROQ_API_KEY ? "env" : "hardcoded",
        node: process.version,
        project: projectId
      });
    }

    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "method_not_allowed" });
    }

    if (!groqApiKey) {
      return res.status(500).json({ ok: false, error: "missing_groq_key" });
    }

    const authHeader = req.headers.authorization || "";
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!match) return res.status(401).json({ ok: false, error: "missing_token" });

    const idToken = match[1];
    let decoded;
    try {
      decoded = await verifyFirebaseToken(idToken, projectId);
    } catch (err) {
      return res.status(401).json({ ok: false, error: "invalid_token", reason: err.message });
    }

    let body;
    try {
      body = req.body && typeof req.body === "object" ? req.body : JSON.parse(req.body || "{}");
    } catch {
      return res.status(400).json({ ok: false, error: "invalid_body" });
    }

    const language = body.language === "en" ? "en" : "ar";
    const userName = String(body.userName || "").slice(0, 40);
    const images = Array.isArray(body.images) ? body.images.slice(0, MAX_IMAGES) : [];

    if (!images.length) return res.status(400).json({ ok: false, error: "no_images" });

    for (const img of images) {
      if (typeof img.data !== "string" || img.data.length > MAX_IMAGE_BASE64_LENGTH) {
        return res.status(400).json({ ok: false, error: "invalid_image" });
      }
      const mime = img.mime || "image/jpeg";
      if (!["image/jpeg", "image/png", "image/webp"].includes(mime)) {
        return res.status(400).json({ ok: false, error: "invalid_mime" });
      }
    }

    let curriculum = { enabled: false, subject: null, baccalaureate: false };
    if (body.curriculum && typeof body.curriculum === "object" && body.curriculum.enabled) {
      const subject = String(body.curriculum.subject || "").toLowerCase();
      if (!VALID_SUBJECTS.includes(subject)) {
        return res.status(400).json({ ok: false, error: "invalid_subject" });
      }
      curriculum = {
        enabled: true,
        subject,
        baccalaureate: !!body.curriculum.baccalaureate
      };
    }

    let dist = body.distribution || { easy: 2, medium: 2, hard: 2, exam: 2 };
    const total = (dist.easy || 0) + (dist.medium || 0) + (dist.hard || 0) + (dist.exam || 0);
    if (total > 20 || total < 1) {
      dist = { easy: 2, medium: 2, hard: 2, exam: 2 };
    }

    const totalSize = images.reduce((sum, img) => sum + (img.data?.length || 0), 0);
    if (totalSize > MAX_PAYLOAD_BYTES) {
      return res.status(413).json({ ok: false, error: "payload_too_large" });
    }

    const date = todayUTC();
    try {
      const usage = await getUsageDoc(projectId, decoded.uid, date, idToken);
      if (usage.count >= 10) {
        return res.status(429).json({ ok: false, error: "limit_reached" });
      }
    } catch (err) {
      console.warn("Usage check failed:", err.message);
    }

    const jobId = generateJobId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + JOB_TTL_SECONDS * 1000);

    const jobData = {
      status: "queued",
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      language,
      userName,
      curriculum,
      distribution: dist,
      imageCount: images.length
    };

    try {
      await createJobDoc(projectId, decoded.uid, jobId, jobData, idToken);
    } catch (err) {
      return res.status(500).json({ ok: false, error: "job_create_failed", reason: err.message });
    }

    const jobPayload = {
      language,
      userName,
      curriculum,
      distribution: dist,
      images: images.map(img => ({
        index: img.index,
        mime: img.mime || "image/jpeg",
        data: img.data,
        name: img.name || "image"
      }))
    };

    processJob(projectId, decoded.uid, jobId, jobPayload, idToken, groqApiKey)
      .then(() => incrementUsage(projectId, decoded.uid, date, idToken).catch(() => {}))
      .catch(err => console.error("[bg] error:", err.message));

    return res.status(200).json({ ok: true, jobId, status: "queued" });

  } catch (err) {
    console.error("[FATAL]", err.message, err.stack?.slice(0, 500));
    if (!res.headersSent) {
      return res.status(500).json({ ok: false, error: "internal_error", reason: err.message });
    }
  }
}
