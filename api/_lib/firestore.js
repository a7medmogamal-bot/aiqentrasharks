import { fetchWithTimeout } from "./auth.js";
import { FETCH_TIMEOUT_MS } from "./constants.js";

function getFirestoreBase(projectId) {
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
}

function toFirestoreValue(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "string") return { stringValue: v };
  if (typeof v === "number") {
    return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  }
  if (typeof v === "boolean") return { booleanValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toFirestoreValue) } };
  if (typeof v === "object") {
    const fields = {};
    Object.keys(v).forEach(k => { fields[k] = toFirestoreValue(v[k]); });
    return { mapValue: { fields } };
  }
  return { nullValue: null };
}

async function createJobDoc(projectId, uid, jobId, jobData, idToken) {
  const url = `${getFirestoreBase(projectId)}/users/${uid}/generationJobs?documentId=${jobId}`;
  const body = { fields: {} };
  Object.keys(jobData).forEach(k => { body.fields[k] = toFirestoreValue(jobData[k]); });

  const res = await fetchWithTimeout(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`
    },
    body: JSON.stringify(body)
  }, FETCH_TIMEOUT_MS);

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    console.error("firestore_create_error", res.status, err.slice(0, 500));
    throw new Error(`firestore_create_${res.status}`);
  }
  return await res.json();
}

async function updateJobDoc(projectId, uid, jobId, jobData, idToken) {
  const fieldPaths = Object.keys(jobData);
  const query = fieldPaths.map(f => `updateMask.fieldPaths=${encodeURIComponent(f)}`).join("&");
  const url = `${getFirestoreBase(projectId)}/users/${uid}/generationJobs/${jobId}?${query}`;

  const body = { fields: {} };
  Object.keys(jobData).forEach(k => { body.fields[k] = toFirestoreValue(jobData[k]); });

  const res = await fetchWithTimeout(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`
    },
    body: JSON.stringify(body)
  }, FETCH_TIMEOUT_MS);

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    console.error("firestore_update_error", res.status, err.slice(0, 500));
    throw new Error(`firestore_update_${res.status}`);
  }
  return await res.json();
}

async function getUsageDoc(projectId, uid, date, idToken) {
  const url = `${getFirestoreBase(projectId)}/users/${uid}/usage/${date}`;
  const res = await fetchWithTimeout(url, {
    headers: { Authorization: `Bearer ${idToken}` }
  }, FETCH_TIMEOUT_MS);

  if (!res.ok) {
    if (res.status === 404) return { count: 0 };
    throw new Error(`firestore_get_usage_${res.status}`);
  }

  const json = await res.json();
  const fields = json.fields || {};
  return {
    count: fields.count ? Number(fields.count.integerValue || fields.count.doubleValue || 0) : 0
  };
}

async function incrementUsage(projectId, uid, date, idToken) {
  const url = `${getFirestoreBase(projectId)}/users/${uid}/usage/${date}`;

  const res = await fetchWithTimeout(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`
    },
    body: JSON.stringify({
      fields: {
        count: { integerValue: "1" },
        date: { stringValue: date }
      }
    })
  }, FETCH_TIMEOUT_MS);

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    console.error("firestore_usage_error", res.status, err.slice(0, 500));
    throw new Error(`firestore_usage_${res.status}`);
  }
  return await res.json();
}

export { getFirestoreBase, createJobDoc, updateJobDoc, getUsageDoc, incrementUsage };
