import { test } from "node:test";
import assert from "node:assert/strict";
import { checkHeartbeat } from "./heartbeat-core.mjs";

const now = Date.parse("2026-11-02T14:00:00Z");
const reply = (last_success_at) => async () => ({ ok: true, json: async () => ({ last_success_at }) });

test("accepts a genuine recent successful completion", async () => {
  const age = await checkHeartbeat({ url: "https://example.org/heartbeat", maxAgeMinutes: 90, now, fetchImpl: reply("2026-11-02T13:00:00Z") });
  assert.equal(age, 60);
});
test("rejects a missed run beyond 90 minutes", async () => {
  await assert.rejects(checkHeartbeat({ url: "https://example.org/heartbeat", maxAgeMinutes: 90, now, fetchImpl: reply("2026-11-02T12:29:00Z") }), /stale/);
});
test("rejects missing configuration without pretending success", async () => {
  await assert.rejects(checkHeartbeat({ url: "", maxAgeMinutes: 90, now, fetchImpl: reply("2026-11-02T13:00:00Z") }), /NOT CONFIGURED/);
});
test("rejects invalid, future, and malformed timestamps", async () => {
  for (const value of ["invalid", "2026-11-02T14:06:00Z", null]) {
    await assert.rejects(checkHeartbeat({ url: "https://example.org/heartbeat", maxAgeMinutes: 90, now, fetchImpl: reply(value) }));
  }
});
test("rejects non-HTTPS URLs", async () => {
  await assert.rejects(checkHeartbeat({ url: "http://example.org/heartbeat", maxAgeMinutes: 90, now, fetchImpl: reply("2026-11-02T13:00:00Z") }), /NOT CONFIGURED/);
});
test("rejects HTTP failures", async () => {
  await assert.rejects(checkHeartbeat({ url: "https://example.org/heartbeat", maxAgeMinutes: 90, now, fetchImpl: async () => ({ ok: false, status: 503 }) }), /503/);
});
