# Monitoring deployment gate

Status: **NOT DEPLOYED**. This repository holds a proposed check, not a running watchdog.

1. Confirm repository visibility and restrict access before adding any private material.
2. Implement an authenticated, read-only HTTPS heartbeat endpoint sourced from the *actual hourly builder's successful completion*. Required JSON: `{"last_success_at":"<ISO-8601 UTC timestamp>"}`. A Base44 website uptime check is insufficient.
3. Verify the heartbeat cannot be spoofed by an unrelated app or watchdog and that successful timestamps are only updated after completed builder runs.
4. Test healthy, stale, invalid, and unavailable heartbeat responses. A missing endpoint must fail closed.
5. Obtain explicit approval for the Render cron service's minimum monthly billing before deployment.
6. Configure failure notifications in Render and perform an end-to-end alert test.
7. The monitor can detect missing heartbeats; it **cannot automatically re-enable ChatGPT scheduled tasks** without an authorized, supported scheduler API.

No credentials should be committed. The repository currently has no known builder status endpoint.

## Verified 2026-11-02

Base44 app `6ad9315519616aa7725f81fa` has an active *Ambient Chatter* workflow (every 30 minutes; latest observed success 2026-11-02T12:01:55Z). This is NOT the ChatGPT hourly builder and MUST NOT be substituted as its heartbeat. GitHub Actions failure confirms `BUILDER_HEARTBEAT_URL` unset. Do not add fake success timestamps. A supported ChatGPT scheduler API or a builder-owned completion callback is required to monitor builder progress accurately.

## Implementation 2026-11-02

GitHub Actions checks every ~10 minutes (best effort), and now executes `node --test heartbeat.test.mjs` before the real check. The six local regression tests passed, covering healthy, stale, missing, malformed, insecure, and HTTP-error cases. The real scheduled check still fails closed until `BUILDER_HEARTBEAT_URL` is configured with a builder-owned HTTPS endpoint.

The repo is currently PUBLIC. Do not add app source, API tokens, private status, or private endpoint credentials. Render currently has no deployed services; creating a paid runner is NOT authorized. No supported autonomous hourly coding runner has been connected. Do not claim unattended code development or end-to-end alerting is working. GitHub Actions failure status is visible in Actions; email notification delivery has not been verified.

Next owner-gated requirements: (1) choose and authorize an independent runner with a supported credential path and acceptable cost; (2) make repository private or establish an appropriate private project before attaching code; (3) wire a genuine success-only heartbeat and secure read access; (4) test a real completed cycle and notification delivery.
