// Pure verification logic: never creates or updates a heartbeat.
// Only the independent builder may publish a genuine completed-cycle timestamp.
export async function checkHeartbeat({ url, maxAgeMinutes = 90, now = Date.now(), fetchImpl = fetch }) {
  if (!url || !/^https:\/\//i.test(url)) {
    throw new Error("NOT CONFIGURED: BUILDER_HEARTBEAT_URL must be an HTTPS endpoint.");
  }
  if (!Number.isFinite(maxAgeMinutes) || maxAgeMinutes <= 0) {
    throw new Error("Invalid MAX_AGE_MINUTES.");
  }
  const response = await fetchImpl(url, {
    signal: AbortSignal.timeout(10000),
    headers: { accept: "application/json" },
  });
  if (!response.ok) throw new Error("Heartbeat HTTP " + response.status);
  const data = await response.json();
  if (typeof data?.last_success_at !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(data.last_success_at)) {
    throw new Error("Missing/invalid last_success_at");
  }
  const timestamp = Date.parse(data.last_success_at);
  if (!Number.isFinite(timestamp)) throw new Error("Missing/invalid last_success_at");
  const age = (now - timestamp) / 60000;
  if (age < -5 || age > maxAgeMinutes) throw new Error("Builder heartbeat stale or future-dated: " + age.toFixed(1) + " minutes");
  return age;
}
