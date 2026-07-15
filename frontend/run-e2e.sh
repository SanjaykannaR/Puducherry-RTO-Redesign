#!/bin/bash
# ── E2E Test Runner (Sharded for Windows Chromium stability) ──
# Runs 2 shards sequentially to avoid STATUS_STACK_OVERFLOW after 100+ navigations.
# Total: 131 tests across 2 Chromium instances (~65 each).

set -e

echo ""
echo "════════════════════════════════════════════════════"
echo " E2E Test Suite — Sharded for Windows Stability"
echo "════════════════════════════════════════════════════"
echo ""

FAILED=0

echo "── Shard 1: app + auth-flow (65 tests) ──"
echo ""
if npx playwright test --config=playwright.shard1.config.ts "$@"; then
    echo "✓ Shard 1 PASSED"
else
    echo "✗ Shard 1 FAILED"
    FAILED=1
fi
echo ""

echo "── Shard 2: admin + interactions + admin-applications + exam (66 tests) ──"
echo ""
if npx playwright test --config=playwright.shard2.config.ts "$@"; then
    echo "✓ Shard 2 PASSED"
else
    echo "✗ Shard 2 FAILED"
    FAILED=1
fi
echo ""

if [ $FAILED -eq 0 ]; then
    echo "════════════════════════════════════════════════════"
    echo " ✓ ALL 131 TESTS PASSED"
    echo "════════════════════════════════════════════════════"
else
    echo "════════════════════════════════════════════════════"
    echo " ✗ SOME SHARDS FAILED — check output above"
    echo "════════════════════════════════════════════════════"
    exit 1
fi
