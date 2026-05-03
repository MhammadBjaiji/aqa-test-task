# Test Reporting System

## Overview

The test suite includes a comprehensive custom reporting system that automatically tracks and summarizes test results by **tags** and **feature areas**. After each test run, detailed reports are generated in the `reports/` directory.

## Report Output

### 1. Console Summary (Immediate Feedback)

After running tests, you'll see a real-time summary:

```
📊 Test Report Summary
═══════════════════════════════════════

📈 OVERALL RESULTS
─────────────────────────────────
Total Tests: 14
Passed: 13 ✓
Failed: 1 ✗
Pass Rate: 92.9%
Duration: 180.5s

🏷️  BY TAG
─────────────────────────────────
@smoke: 3/3 passed (100%)
@critical: 3/3 passed (100%)
@regression: 9/8 passed (88%)
@auth: 6/6 passed (100%)
@tasks: 8/7 passed (87%)
@integration: 2/1 passed (50%)
@slow: 5/4 passed (80%)

📂 BY FEATURE
─────────────────────────────────
ui-auth: 3/3 passed (100%)
ui-tasks: 5/4 passed (80%)
api-auth: 1/1 passed (100%)
integration-tasks: 2/1 passed (50%)
```

### 2. JSON Report (`reports/test-report.json`)

Structured data for programmatic access:

```json
{
  "timestamp": "2026-05-03T19:46:09.496Z",
  "summary": {
    "total": 14,
    "passed": 13,
    "failed": 1,
    "passRate": "92.9%",
    "duration": 180500
  },
  "byTag": {
    "@smoke": {
      "total": 3,
      "passed": 3,
      "failed": 0,
      "tests": ["test name 1", "test name 2", ...]
    },
    ...
  },
  "byFeature": {
    "ui-auth": {
      "total": 3,
      "passed": 3,
      "failed": 0,
      "tests": [...]
    },
    ...
  },
  "failedTests": [
    {
      "name": "test name",
      "file": "tests/ui/tasks/taskFavorites.spec.ts",
      "error": "Error message",
      "tags": ["@regression", "@tasks"]
    }
  ]
}
```

### 3. Text Summary (`reports/test-summary.txt`)

Human-readable report with all details including failed test information.

## View Reports

```bash
# View text summary
npm run report:view

# View JSON report
npm run report:json

# View HTML report (Playwright's built-in)
npm run test:report
```

## Key Metrics

### By Tag

Each tag shows:

- Total tests with that tag
- Number passed/failed
- Pass rate percentage
- List of test names

**Tags Tracked:**

- `@smoke` - Quick sanity checks
- `@critical` - Critical path tests
- `@regression` - Regression suite
- `@slow` - Long-running tests
- `@auth` - Authentication tests
- `@tasks` - Task-related tests
- `@integration` - Integration tests

### By Feature

Each feature area shows:

- Total tests in that feature
- Number passed/failed
- Pass rate percentage
- Derived from file paths:
  - `ui-auth` → `tests/ui/auth/`
  - `ui-tasks` → `tests/ui/tasks/`
  - `api-auth` → `tests/api/auth/`
  - `integration-tasks` → `tests/integration/tasks/`

## Interpreting Results

### Healthy Suite

- Overall pass rate > 95%
- All `@smoke` and `@critical` tests passing
- No repeated failures in same feature area

### Warning Signs

- Any `@critical` tests failing
- Feature area with < 90% pass rate
- Same test failing consistently (flakiness)
- `@smoke` tests failing (basic functionality broken)

### Expected Transient Failures

- Rate limiting retries (visible in console output, but tests eventually pass)
- First test in `@slow` category taking longer than others

## Integration with CI/CD

The JSON report can be parsed in CI/CD pipelines:

```bash
# Check if critical tests passed (parse JSON)
node -e "const r = require('./reports/test-report.json'); const critical = r.byTag['@critical']; process.exit(critical.failed > 0 ? 1 : 0)"

# Extract pass rate
node -e "const r = require('./reports/test-report.json'); console.log(r.summary.passRate)"

# Get failed test names
node -e "const r = require('./reports/test-report.json'); r.failedTests.forEach(t => console.log(t.name))"
```

## Report Files Location

All reports are automatically generated in:

```
qa-test-task/
└── reports/
    ├── test-report.json      (Structured data)
    └── test-summary.txt      (Human-readable)
```

Reports are **overwritten** with each test run (not appended), so they always reflect the latest results.

## Future Enhancements

Possible additions to the reporting system:

- Historical trend tracking (pass rate over time)
- Rate limit frequency analysis (which tests trigger throttling)
- Test duration tracking (identify performance regressions)
- Slack/email notifications on failures
- Dashboard UI for result visualization
