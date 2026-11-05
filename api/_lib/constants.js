const GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const HARDCODED_GROQ_KEY = "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";

const MAX_IMAGES = 3;
const MAX_PAYLOAD_BYTES = 2 * 1024 * 1024;
const MAX_IMAGE_BASE64_LENGTH = 1_500_000;
const JOB_TTL_SECONDS = 60 * 30;
const VALID_SUBJECTS = ["arabic", "english", "history"];

const FETCH_TIMEOUT_MS = 5000;
const GROQ_TIMEOUT_MS = 120000;

const MAX_OUTPUT_TOKENS = 8192;
const TEMPERATURE = 0.7;
const TOP_P = 0.95;

export {
  GROQ_MODEL,
  GROQ_API_URL,
  HARDCODED_GROQ_KEY,
  MAX_IMAGES,
  MAX_PAYLOAD_BYTES,
  MAX_IMAGE_BASE64_LENGTH,
  JOB_TTL_SECONDS,
  VALID_SUBJECTS,
  FETCH_TIMEOUT_MS,
  GROQ_TIMEOUT_MS,
  MAX_OUTPUT_TOKENS,
  TEMPERATURE,
  TOP_P
};
