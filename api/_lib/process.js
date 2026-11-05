import { buildPrompt } from "./prompt.js";
import { callGroq } from "./groq.js";
import { updateJobDoc } from "./firestore.js";

async function processJob(projectId, uid, jobId, jobPayload, idToken, apiKey) {
  const { language, userName, curriculum, distribution, images } = jobPayload;

  try {
    console.log(`[job ${jobId}] starting...`);

    const prompt = buildPrompt(language, userName, curriculum, distribution);
    const result = await callGroq(apiKey, images, prompt);

    await updateJobDoc(projectId, uid, jobId, {
      status: "completed",
      result,
      completedAt: new Date().toISOString()
    }, idToken);

    console.log(`[job ${jobId}] completed: ${result.questions?.length || 0} questions`);
  } catch (err) {
    console.error(`[job ${jobId}] failed:`, err.message);

    let errorCode = "generation_failed";
    if (err.message === "content_blocked") errorCode = "content_blocked";
    else if (err.message === "rate_limited") errorCode = "rate_limited";
    else if (err.message === "invalid_api_key") errorCode = "server_config_error";
    else if (err.message === "no_questions_generated") errorCode = "insufficient_content";
    else if (err.message === "fetch_timeout" || err.message === "groq_timeout") errorCode = "timeout";
    else if (err.message === "payload_too_large") errorCode = "payload_too_large";
    else if (err.message === "invalid_request") errorCode = "invalid_request";

    try {
      await updateJobDoc(projectId, uid, jobId, {
        status: "failed",
        error: errorCode,
        failedAt: new Date().toISOString()
      }, idToken);
    } catch (updateErr) {
      console.error(`[job ${jobId}] update failed:`, updateErr.message);
    }
  }
}

export { processJob };
