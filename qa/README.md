# QA Test Automation Framework

## Project Overview

This is a **test automation framework** built with **Playwright** and **TypeScript** that demonstrates modern QA best practices. The focus is on **framework architecture, organization, and scalability** rather than test coverage.

### Key Focus Areas

✅ **Framework Structure** - Well-organized, maintainable code architecture  
✅ **Page Object Model (POM)** - Separation of test logic from UI interactions  
✅ **API Helpers** - Centralized, reusable API interaction patterns  
✅ **Request Manager** - Intelligent rate limiting and request throttling  
✅ **Logical Test Organization** - Feature-based folder structure with semantic tags  
✅ **Data Generation** - Realistic test data using Faker.js  
✅ **Integration Testing** - Multi-layer tests combining API and UI workflows  
❌ **NOT Test Coverage** - This submission focuses on framework quality, not test quantity

---

## Framework Architecture

### 1. Page Object Model (POM)

Located in: `Pages/`

```
Pages/
├── BasePage.ts           # Base class with common page interactions
├── LoginPage.ts          # Login page interactions
├── RegisterPage.ts       # Registration page interactions
├── DashboardPage.ts      # Dashboard page interactions
└── TaskDetailsPage.ts    # Task details page interactions
```

**Purpose**: Encapsulates page-specific selectors and interactions, making tests maintainable and reducing duplication.

**Example**:

```typescript
// Test code (clean, readable)
await loginPage.login(email, password);

// BasePage handles complex interactions
// If selector changes, update only in BasePage
```

### 2. Request Manager

Located in: `api/utils/requestManager.ts`

**Core Responsibility**: Prevents rate limiting (429 errors) through intelligent request throttling.

**Features**:

- **Global Rate Limiting Coordination** - Shared state across all requests
- **Minimum Delay Enforcement** - 5000ms between all API calls
- **Exponential Backoff** - Smart retry logic on 429 responses
- **Max Retries** - 3 automatic retry attempts before failing

**Why It Matters**:

- Stops cascading 429 errors that block entire test suites
- Automatic retry + backoff = robust test execution
- Shared static state ensures app-wide coordination

**Usage**:

```typescript
const requestManager = new RequestManager(request, API_BASE_URL);
const response = await requestManager.get("/users"); // Auto-throttled
```

### 3. API Helpers

Located in: `api/helpers/`

```
api/helpers/
├── userHelper.ts         # User registration, login, profile operations
├── taskHelper.ts         # Task CRUD operations
├── teamHelper.ts         # Team creation and management
├── projectHelper.ts      # Project operations
└── attachmentHelper.ts   # File attachment handling
```

**Purpose**: Encapsulates API operations with request throttling built-in.

**Benefits**:

- Reusable across multiple tests
- Consistent error handling
- Automatic RequestManager integration
- Status code flexibility (accepts both 200/201 for creation endpoints)

**Example**:

```typescript
const userHelper = new UserHelper(request, API_BASE_URL);
const response = await userHelper.registerUser({
  email: "user@example.com",
  username: "testuser",
  password: "SecurePass123",
  language: "en",
});
```

### 4. Data Generation (Faker.js)

Located in: `data/fakerHelper.ts` and `data/testData.ts`

**Purpose**: Generates realistic, random test data to prevent test interdependencies.

**Includes**:

- Random email addresses
- Unique usernames
- Secure passwords
- Task descriptions and titles
- Comments and attachments

**Example**:

```typescript
const newUser = fakerHelper.generateRegistrationData();
// Returns: { email, username, password, language }
```

### 5. Test Fixtures

Located in: `fixtures/`

```
fixtures/
├── apiFixture.ts         # API request context setup
├── uiFixture.ts          # Browser page setup
└── combinedFixture.ts    # Both API and UI for integration tests
```

**Purpose**: Provides pre-configured contexts (request, page, etc.) for tests.

**Usage**:

```typescript
test("example", async ({ request, page }) => {
  // Fixtures automatically provide request and page
});
```

### 6. Logical Test Organization

Located in: `tests/`

```
tests/
├── api/
│   └── auth/
│       └── tokenManagement.spec.ts
├── ui/
│   ├── auth/
│   │   ├── loginFlow.spec.ts
│   │   └── registerFlow.spec.ts
│   └── tasks/
│       ├── taskCreation.spec.ts
│       └── taskFavorites.spec.ts
└── integration/
    └── tasks/
        ├── taskAssignment.spec.ts
        └── taskAttachmentWorkflow.spec.ts
```

**Organization Principle**: Feature-based, not test-type-based

- **By Feature**: Find all tests for a feature in one place
- **By Type**: Separate concerns (api tests, ui tests, integration)
- **By Layer**: Clear separation between unit, integration, and e2e

### 7. Semantic Test Tagging

All tests include semantic tags for flexible execution:

```typescript
test("@smoke @auth @critical should login with valid credentials", async () => {
  // test code
});
```

**Available Tags**:

- `@smoke` - Quick sanity checks
- `@critical` - Critical path functionality
- `@regression` - Regression test suite
- `@slow` - Long-running tests
- `@auth` - Authentication-related
- `@tasks` - Task-related features
- `@integration` - Integration workflows

---

## Test Commands

### Basic Commands

#### `npm run test`

Runs **all tests** in the entire suite (UI, API, Integration).

```bash
npm run test
```

**Duration**: ~4-5 minutes  
**Use Case**: Full validation before deployment

---

#### `npm run test:ui`

Runs **UI tests only** using Chromium browser.

```bash
npm run test:ui
```

**Duration**: ~2 minutes  
**Projects**: UI tests (chromium)  
**Use Case**: Frontend functionality validation

---

#### `npm run test:api`

Runs **API tests only** (no browser required).

```bash
npm run test:api
```

**Duration**: ~30 seconds  
**Projects**: API tests  
**Use Case**: Backend logic validation

---

#### `npm run test:integration`

Runs **integration tests only** (API + UI combined workflows).

```bash
npm run test:integration
```

**Duration**: ~1 minute  
**Projects**: Integration tests  
**Use Case**: End-to-end workflow validation

---

#### `npm run test:debug`

Runs tests in **debug mode** with Playwright Inspector.

```bash
npm run test:debug
```

**Use Case**: Interactive debugging and test development

---

#### `npm run test:report`

Opens the **HTML report** from the last test run.

```bash
npm run test:report
```

**Use Case**: Visual inspection of test results

---

### Organized Test Commands

These commands run the **reorganized test suite** with feature-based organization and semantic tags.

#### `npm run test:organized`

Runs **all organized tests** (14 total across auth, tasks, integration).

```bash
npm run test:organized
```

**Tests**: 14 (3 login + 3 register + 4 tasks + 1 favorites + 1 token + 2 integration)  
**Duration**: ~3 minutes  
**Timeout**: 120 seconds per test  
**Use Case**: Full validation of reorganized suite

---

#### `npm run test:auth`

Runs **authentication tests only** (login, register, tokens).

```bash
npm run test:auth
```

**Tests**: 7 (3 login + 3 register + 1 token management)  
**Features**: UI auth tests + API token tests  
**Timeout**: 120 seconds per test  
**Use Case**: Auth feature validation

---

#### `npm run test:tasks`

Runs **task-related tests** (creation, editing, favorites, assignment).

```bash
npm run test:tasks
```

**Tests**: 7 (4 CRUD operations + 1 favorites + 2 integration)  
**Features**: UI task tests + integration task workflows  
**Timeout**: 120 seconds per test  
**Use Case**: Task feature validation

---

### Tag-Based Commands

Execute specific test categories using semantic tags for targeted testing.

#### `npm run test:smoke`

Runs **quick sanity checks** (fast-running tests only).

```bash
npm run test:smoke
```

**Tests**: 3 tests tagged with `@smoke`  
**Duration**: ~15 seconds  
**Tags**: @smoke, @auth, @critical, @tasks, @regression  
**Use Case**: Quick validation during development

---

#### `npm run test:critical`

Runs **critical path tests** (essential functionality).

```bash
npm run test:critical
```

**Tests**: 3 tests tagged with `@critical`  
**Duration**: ~90 seconds  
**Coverage**: Login functionality, token generation, task assignment  
**Use Case**: Pre-deployment critical functionality check

---

#### `npm run test:regression`

Runs **regression test suite** (comprehensive validation).

```bash
npm run test:regression
```

**Tests**: 9 tests tagged with `@regression`  
**Duration**: ~2 minutes  
**Coverage**: All features with regression scenarios  
**Use Case**: Nightly regression testing

---

#### `npm run test:slow`

Runs **long-running tests** (complex workflows).

```bash
npm run test:slow
```

**Tests**: 5 tests tagged with `@slow`  
**Duration**: ~90 seconds  
**Scenarios**: Title editing, token generation, task assignment, attachments  
**Use Case**: Separate from quick tests for parallel CI/CD execution

---

### Report Commands

#### `npm run report:view`

Displays the **text-based test summary** from the last run.

```bash
npm run report:view
```

**Output**:

- Overall results (total, passed, failed, pass rate, duration)
- Pass rates by tag (@smoke, @critical, @regression, etc.)
- Pass rates by feature (ui-auth, ui-tasks, api-auth, integration-tasks)
- List of failed tests (if any)

**Use Case**: Quick result inspection without opening HTML

---

#### `npm run report:json`

Displays the **structured JSON report** from the last run.

```bash
npm run report:json
```

**Contains**:

- Timestamp
- Summary metrics
- Per-tag statistics with test names
- Per-feature statistics
- Failed test details

**Use Case**: CI/CD integration, data parsing, programmatic analysis

---

## Rate Limiting Prevention

The framework handles rate limiting (429 errors) through intelligent request throttling:

```typescript
// RequestManager automatically:
// 1. Enforces 5000ms minimum delay between requests
// 2. Detects 429 responses
// 3. Applies exponential backoff (2s, 4s, 8s, 16s max)
// 4. Retries up to 3 times
// 5. Uses shared static state for app-wide coordination
```

**Result**: Tests run reliably without cascading 429 failures.

---

## Test Execution Flow

### Single Test Run

```bash
npm run test:smoke
    ↓
Playwright executes tests
    ↓
RequestManager throttles requests (5s minimum delay)
    ↓
Tests complete
    ↓
CustomReporter captures results
    ↓
Reports generated (JSON + Text)
    ↓
Console summary displays
```

### Report Generation

```
reports/
├── test-report.json      # Structured data (tag/feature breakdown)
└── test-summary.txt      # Human-readable summary
```

---

## Framework Strengths

1. **Maintainability** - Page Object Model reduces duplication and updates
2. **Scalability** - Helper classes make adding new tests trivial
3. **Reliability** - RequestManager prevents flaky rate-limit failures
4. **Organization** - Feature-based structure with semantic tags
5. **Reporting** - Automatic insights by tag, feature, and failure
6. **Flexibility** - Run any subset of tests via commands or tags
7. **Data Isolation** - Faker generates unique data for each test run

---

## What This Submission Is NOT

❌ **Not Complete Test Coverage** - Only 14 tests demonstrating framework patterns  
❌ **Not Production-Ready Test Suite** - Focus is architecture, not comprehensiveness  
❌ **Not All Vikunja Features** - Only auth, tasks, and basic workflows tested

---

## What This Submission IS

✅ **Demonstration of Best Practices** - Industry-standard patterns and structure  
✅ **Production-Ready Framework** - Easy to extend with more tests  
✅ **Well-Documented Architecture** - Clear separation of concerns  
✅ **Intelligent Rate Limiting** - Handles API throttling automatically  
✅ **Smart Test Organization** - Feature-based with flexible execution  
✅ **Comprehensive Reporting** - Tag and feature-based insights

---

## Quick Start

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Run a quick test**:

   ```bash
   npm run test:smoke
   ```

3. **View the report**:

   ```bash
   npm run report:view
   ```

4. **Run organized test suite**:
   ```bash
   npm run test:organized
   ```

---

## Architecture Summary

| Component             | Location                      | Purpose                       |
| --------------------- | ----------------------------- | ----------------------------- |
| **Page Object Model** | `Pages/`                      | UI interaction abstraction    |
| **Request Manager**   | `api/utils/requestManager.ts` | Rate limiting & throttling    |
| **API Helpers**       | `api/helpers/`                | API operation wrappers        |
| **Fixtures**          | `fixtures/`                   | Test context setup            |
| **Data Generation**   | `data/`                       | Realistic test data via Faker |
| **Tests**             | `tests/`                      | Feature-based, tagged tests   |
| **Reporter**          | `reporters/`                  | Custom result aggregation     |
| **Reports**           | `reports/`                    | Generated JSON & text reports |

---

## For More Information

See [REPORTING.md](REPORTING.md) for detailed report documentation.  
See [TEST_COMMANDS.md](TEST_COMMANDS.md) for additional command examples.
