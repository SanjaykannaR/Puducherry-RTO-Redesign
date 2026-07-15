@echo off
REM ── E2E Test Runner (Sharded for Windows Chromium stability) ──
REM Runs 2 shards sequentially to avoid STATUS_STACK_OVERFLOW after 100+ navigations.
REM Total: 131 tests across 2 Chromium instances (~65 each).

echo.
echo ════════════════════════════════════════════════════
echo  E2E Test Suite — Sharded for Windows Stability
echo ════════════════════════════════════════════════════
echo.

set FAILED=0

echo ── Shard 1: app + auth-flow (65 tests) ──
echo.
npx playwright test --config=playwright.shard1.config.ts %*
if %ERRORLEVEL% neq 0 (
    echo ✗ Shard 1 FAILED
    set FAILED=1
) else (
    echo ✓ Shard 1 PASSED
)
echo.

echo ── Shard 2: admin + interactions + admin-applications + exam (66 tests) ──
echo.
npx playwright test --config=playwright.shard2.config.ts %*
if %ERRORLEVEL% neq 0 (
    echo ✗ Shard 2 FAILED
    set FAILED=1
) else (
    echo ✓ Shard 2 PASSED
)
echo.

if %FAILED% eq 0 (
    echo ════════════════════════════════════════════════════
    echo  ✓ ALL 131 TESTS PASSED
    echo ════════════════════════════════════════════════════
) else (
    echo ════════════════════════════════════════════════════
    echo  ✗ SOME SHARDS FAILED — check output above
    echo ════════════════════════════════════════════════════
)
