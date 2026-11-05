export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  return res.status(200).json({
    ok: true,
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    keySource: process.env.GROQ_API_KEY ? "env" : "hardcoded",
    node: process.version,
    project: process.env.FIREBASE_PROJECT_ID || "aiqentraplatform",
    timestamp: new Date().toISOString()
  });
}
