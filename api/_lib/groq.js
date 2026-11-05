import {
  GROQ_API_URL,
  GROQ_MODEL,
  GROQ_TIMEOUT_MS,
  MAX_OUTPUT_TOKENS,
  TEMPERATURE,
  TOP_P
} from "./constants.js";
import { fetchWithTimeout } from "./auth.js";
import { validateResult } from "./validator.js";

function buildGroqMessages(images, prompt) {
  const content = [{ type: "text", text: prompt }];

  images.forEach((img) => {
    const mime = img.mime || "image/jpeg";
    const dataUrl = img.data.startsWith("data:")
      ? img.data
      : `data:${mime};base64,${img.data}`;

    content.push({
      type: "image_url",
      image_url: { url: dataUrl }
    });
  });

  return [{ role: "user", content }];
}

async function callGroq(apiKey, images, prompt) {
  const messages = buildGroqMessages(images, prompt);

  const body = {
    model: GROQ_MODEL,
    messages,
    temperature: TEMPERATURE,
    max_completion_tokens: MAX_OUTPUT_TOKENS,
    top_p: TOP_P,
    stream: false,
    response_format: { type: "json_object" }
  };

  const res = await fetchWithTimeout(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  }, GROQ_TIMEOUT_MS);

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error("groq_error", res.status, errText.slice(0, 800));

    if (res.status === 429) throw new Error("rate_limited");
    if (res.status === 400) throw new Error("invalid_request");
    if (res.status === 401 || res.status === 403) throw new Error("invalid_api_key");
    if (res.status === 413) throw new Error("payload_too_large");
    throw new Error("groq_api_error");
  }

  const json = await res.json();
  const choice = json.choices?.[0];
  if (!choice) throw new Error("no_choices");
  if (choice.finish_reason === "content_filter") throw new Error("content_blocked");

  const text = choice.message?.content || "";
  if (!text.trim()) throw new Error("empty_response");

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("invalid_json_response");
    try {
      parsed = JSON.parse(match[0]);
    } catch {
      throw new Error("invalid_json_response");
    }
  }

  return validateResult(parsed);
}

export { callGroq };
