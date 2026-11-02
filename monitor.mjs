// Independent verifier: never fabricates builder completion or restarts ChatGPT tasks.
import { checkHeartbeat } from "./heartbeat-core.mjs";

try {
  const age = await checkHeartbeat({
    url: process.env.BUILDER_HEARTBEAT_URL,
    maxAgeMinutes: Number(process.env.MAX_AGE_MINUTES || "90"),
  });
  console.log("Builder heartbeat healthy; last successful run " + age.toFixed(1) + " minutes ago.");
} catch (error) {
  console.error("BUILDER MONITOR FAILURE:", error.message);
  process.exitCode = 1;
}
