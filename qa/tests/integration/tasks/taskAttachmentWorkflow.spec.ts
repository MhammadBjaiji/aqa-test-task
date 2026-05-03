import { expect, test } from "@playwright/test";
import { UserHelper } from "../../../api/helpers/userHelper";
import { TaskHelper } from "../../../api/helpers/taskHelper";
import { AttachmentHelper } from "../../../api/helpers/attachmentHelper";
import { fakerHelper } from "../../../data/fakerHelper";
import { DashboardPage } from "../../../Pages/DashboardPage";
import { TaskDetailsPage } from "../../../Pages/TaskDetailsPage";

const LOGIN_URL = "http://localhost:8080/login";
const API_BASE_URL = "http://localhost:8080/api/v1";

test.describe("Task Attachment Workflow", () => {
  let taskHelper: TaskHelper;
  let attachmentHelper: AttachmentHelper;
  let dashboardPage: DashboardPage;
  let token: string;
  let projectId: number;

  test.beforeAll(async ({ browser }) => {
    // Add initial delay to avoid rate limiting with other concurrent test setups
    await new Promise((resolve) => setTimeout(resolve, 8000));

    // Create a single user for all tests to avoid rate limiting
    const context = await browser.newContext();
    const page = await context.newPage();
    const request = context.request;

    const testUser = fakerHelper.generateRegistrationData();
    const userHelper = new UserHelper(request, API_BASE_URL);

    const registerResponse = await userHelper.registerUser({
      email: testUser.email,
      username: testUser.username,
      password: testUser.password,
      language: testUser.language,
    });

    // Verify registration succeeded before attempting login
    expect(registerResponse.status).toBe(200);

    // Add longer delay to ensure backend has fully processed registration
    await page.waitForTimeout(5000);

    // Login to get token
    const loginResponse = await userHelper.login({
      username: testUser.username,
      password: testUser.password,
    });

    expect(loginResponse.status).toBe(200);
    token = loginResponse.data.token;

    // Get project ID
    const tempTaskHelper = new TaskHelper(request, API_BASE_URL, token);
    projectId = await tempTaskHelper.getFirstProjectId();

    await context.close();
  });

  test.beforeEach(async ({ page, request }) => {
    // Initialize helpers
    taskHelper = new TaskHelper(request, API_BASE_URL, token);
    attachmentHelper = new AttachmentHelper(request, API_BASE_URL, token);

    // Setup UI
    await page.goto(LOGIN_URL);
    await page.evaluate((authToken) => {
      localStorage.setItem("token", authToken);
    }, token);

    await page.goto("http://localhost:8080");
    dashboardPage = new DashboardPage(page);
  });

  test("@regression @integration @slow @tasks should upload attachment via API and verify it appears in UI", async ({
    page,
  }) => {
    // Create a test task
    const taskTitle = fakerHelper.generateTaskTitle();
    const taskResponse = await taskHelper.createTaskAndAssert({
      title: taskTitle,
      description: fakerHelper.generateTaskDescription(),
      project_id: projectId,
    });
    const taskId = taskResponse.id;

    // Create and upload a test file with faker content
    const fileName = attachmentHelper.generateTestFileName();
    const filePath = attachmentHelper.createTestFileWithFakerContent(fileName);

    try {
      // Upload attachment via API
      const uploadResponse = await attachmentHelper.uploadAttachmentAndAssert(
        taskId,
        filePath,
      );

      // Verify API response
      expect(uploadResponse.id).toBeDefined();
      expect(uploadResponse.task_id).toBe(taskId);
      expect(uploadResponse.file.name).toBe(fileName);
      expect(uploadResponse.file.size).toBeGreaterThan(0);
      expect(uploadResponse.file.mime).toContain("text");

      // Navigate directly to task details using task ID
      await page.goto(`http://localhost:8080/tasks/${taskId}`);
      await page.waitForLoadState("networkidle");
      const taskDetailsPage = new TaskDetailsPage(page);

      // Wait for attachment to be visible and verify
      const attachmentLocator = taskDetailsPage.getAttachmentByName(fileName);
      await taskDetailsPage.waitForElement(attachmentLocator);

      expect(await taskDetailsPage.isAttachmentVisible(fileName)).toBe(true);
    } finally {
      // Cleanup
      attachmentHelper.cleanupTestFile(filePath);
    }
  });
});
