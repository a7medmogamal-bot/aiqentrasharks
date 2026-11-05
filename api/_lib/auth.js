import { createVerify } from "crypto";
import { FETCH_TIMEOUT_MS } from "./constants.js";

let cachedKeys = null;
let cachedKeysAt = 0;

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") throw new Error("fetch_timeout");
    throw err;
  }
}

async function getGooglePublicKeys() {
  const now = Date.now();
  if (cachedKeys && now - cachedKeysAt < 3600 * 1000) return cachedKeys;

  const res = await fetchWithTimeout(
    "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com",
    {},
    FETCH_TIMEOUT_MS
  );

  if (!res.ok) throw new Error("keys_fetch_failed");

  cachedKeys = await res.json();
  cachedKeysAt = now;
  return cachedKeys;
}

function base64UrlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return Buffer.from(str, "base64").toString("utf8");
}

function base64UrlToUint8(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return Buffer.from(str, "base64");
}

async function verifyFirebaseToken(idToken, projectId) {
  const parts = idToken.split(".");
  if (parts.length !== 3) throw new Error("invalid_token_format");

  const [headerB64, payloadB64, sigB64] = parts;

  let header, payload;
  try {
    header = JSON.parse(base64UrlDecode(headerB64));
    payload = JSON.parse(base64UrlDecode(payloadB64));
  } catch {
    throw new Error("invalid_token_json");
  }

  if (header.alg !== "RS256") throw new Error("invalid_alg");
  if (!header.kid) throw new Error("missing_kid");

  const keys = await getGooglePublicKeys();
  const cert = keys[header.kid];
  if (!cert) throw new Error("unknown_kid");

  const verifier = createVerify("RSA-SHA256");
  verifier.update(headerB64 + "." + payloadB64);
  const valid = verifier.verify(cert, base64UrlToUint8(sigB64));
  if (!valid) throw new Error("invalid_signature");

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) throw new Error("token_expired");
  if (payload.aud !== projectId) throw new Error("invalid_audience");
  if (payload.iss !== `https://securetoken.google.com/${projectId}`) {
    throw new Error("invalid_issuer");
  }
  if (!payload.sub) throw new Error("missing_sub");

  return { uid: payload.sub, email: payload.email || null };
}

export { fetchWithTimeout, verifyFirebaseToken };
