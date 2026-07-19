# TODO

## Pending

- [ ] Verify CI passes after warmup + retry changes (commit `f5fbbf0`) — check that auth tests actually run and pass instead of being skipped
- [ ] Merge `sanjay` → `main` once both E2E shards are green with 0 failures
- [ ] Google OAuth `redirect_uri_mismatch` — all code/config verified correct; user needs to update Google Cloud Console URI list

## Done

- [x] E2E test stabilization — skip guards, retry logic, backend warmup
- [x] CI simplified — removed `cd.yml`, `publish-report.yml`, merged-reports job
- [x] Admin sidebar skip guards for Reports/Services/Settings `beforeEach`
- [x] Exam INTRO tests rewritten to use start-button-visible pattern
- [x] `authenticatePage` retry + timeout increase (15s → 20s)
- [x] `gotoAndWaitForAuth` retry on auth failure
- [x] Backend warmup step in CI (both shards) — Prisma JIT + connection pool
