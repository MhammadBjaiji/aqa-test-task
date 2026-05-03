# Test Command Reference

Quick reference for running tests by category using Playwright tags.

## 🚀 Quick Start Commands

### Run All Tests

```bash
npx playwright test
```

### Run Only New Organized Tests

```bash
npx playwright test tests/ui/auth tests/ui/tasks tests/api/auth tests/integration/tasks
```

---

## 🏷️ Test Categories

### Smoke Tests (Quick validation ~5 min)

Run fast, essential tests to verify basic functionality:

```bash
npx playwright test --grep @smoke
```

**Tests:**

- Login with valid credentials
- Registration email validation
- Task description editing

### Regression Tests (Full feature coverage)

Run comprehensive tests across all features:

```bash
npx playwright test --grep @regression
```

**Tests:**

- All UI interaction tests
- Form validation tests
- Task CRUD operations
- Attachment workflows

### Critical Tests (Must always pass)

Run business-critical tests:

```bash
npx playwright test --grep @critical
```

**Tests:**

- Login functionality
- Task assignment workflows
- Token generation
- Attachment upload & verification

### Slow Tests (>30 seconds)

Run tests that take longer due to rate limiting delays:

```bash
npx playwright test --grep @slow
```

**Tests:**

- Task assignment (15s initial delay + 2 user registration)
- Task title editing
- Attachment workflows (8s initial delay)
- Token management

---

## 🔐 Feature-Specific Tests

### Authentication Tests

```bash
npx playwright test --grep @auth
```

**Tests:**

- Login flow (valid/invalid credentials)
- Registration validation (email, username, password)
- Token management (long_token flag)

### Task Management Tests

```bash
npx playwright test --grep @tasks
```

**Tests:**

- Task creation and CRUD
- Task favorites
- Task comments and status updates
- Task title editing

### Integration Tests

```bash
npx playwright test --grep @integration
```

**Tests:**

- Multi-user task assignment workflows
- API + UI attachment workflows

---

## 🎯 Advanced Command Combinations

### Smoke + Critical (Quick + Essential)

```bash
npx playwright test --grep "@smoke|@critical"
```

### Regression + Auth (Feature-focused)

```bash
npx playwright test --grep "@regression" --grep "@auth"
```

### Exclude Slow Tests (Quick runs)

```bash
npx playwright test --grep-invert @slow
```

### Tasks Only

```bash
npx playwright test --grep "@tasks"
```

### Critical Tasks

```bash
npx playwright test --grep "@critical.*@tasks"
```

---

## 🏃 CI/CD Pipeline Suggestions

### Quick Validation (2-3 min)

```bash
npx playwright test --grep "@smoke"
```

Run on: Every PR, commit

### Regression Suite (5-10 min)

```bash
npx playwright test --grep "@regression" --grep-invert @slow
```

Run on: Before merge, nightly

### Full Suite (20-30 min)

```bash
npx playwright test
```

Run on: Daily, release preparation

### Critical Only (3-5 min)

```bash
npx playwright test --grep "@critical"
```

Run on: Production deployments

---

## 📊 Tag Matrix

| Tag          | Count | Duration | Purpose                   |
| ------------ | ----- | -------- | ------------------------- |
| @smoke       | 3     | <5 min   | Quick validation          |
| @regression  | 10    | ~10 min  | Full feature testing      |
| @critical    | 3     | ~8 min   | Must-pass business flows  |
| @slow        | 3     | ~20 min  | Tests with delays/waiting |
| @auth        | 6     | ~5 min   | Authentication features   |
| @tasks       | 7     | ~15 min  | Task management features  |
| @integration | 2     | ~10 min  | Multi-component workflows |

---

## 💡 Best Practices

1. **Local Development**: Run `@smoke` before committing
2. **Pre-PR**: Run `@regression --grep-invert @slow` for faster feedback
3. **Nightly**: Run full suite including `@slow` tests
4. **Before Release**: Run `@critical` to validate core functionality
5. **Feature Branches**: Run specific feature tags (e.g., `@tasks`)

---

## 🔗 Tag Definitions

- **@smoke**: Fast, essential validation tests - smoke out major issues
- **@regression**: Comprehensive feature testing - catch regressions
- **@critical**: Business-critical workflows - production quality gates
- **@slow**: Tests with deliberate delays - prevent rate limiting
- **@auth**: Authentication & authorization tests
- **@tasks**: Task management feature tests
- **@integration**: Multi-component, end-to-end workflows
