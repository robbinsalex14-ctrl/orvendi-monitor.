// Independent heartbeat verifier. No secrets are stored in this repository.
// The endpoint must return JSON: {"last_success_at":"2026-10-30T20:00:00Z"}.
// This does not query or restart ChatGPT scheduled tasks.
const url = process.env.BUILDER_HEARTBEAT_URL;
const maxAgeMinutes = Number(process.env.MAX_AGE_MINUTES || "90");
if (!url || !/^https:\/\//i.test(url)) {
  console.error("NOT CONFIGURED: BUILDER_HEARTBEAT_URL must be an HTTPS endpoint.");
  process.exit(2);
}
if (!Number.isFinite(maxAgeMinutes) || maxAgeMinutes <= 0) {
  console.error("Invalid MAX_AGE_MINUTES.");
  process.exit(2);
}
try {
  const response = await fetch(url, {signal: AbortSignal.timeout(10000), headers: {"accept":"application/json"}});
  if (!response.ok) throw new Error("Heartbeat HTTP " + response.status);
  const data = await response.json();
  const timestamp = Date.parse(data.last_success_at);
  if (!Number.isFinite(timestamp)) throw new Error("Missing/invalid last_success_at");
  const age = (Date.now() - timestamp) / 60000;
  if (age < -5 || age > maxAgeMinutes) throw new Error("Builder heartbeat stale or future-dated: " + age.toFixed(1) + " minutes");
  console.log("Builder heartbeat healthy; last successful run " + age.toFixed(1) + " minutes ago.");
} catch (error) {
  console.error("BUILDER MONITOR FAILURE:", error.message);
  process.exit(1);
}
