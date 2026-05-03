import { expect, test } from "@playwright/test";
import { DashboardPage } from "../../Pages/DashboardPage";
import { TaskDetailsPage } from "../../Pages/TaskDetailsPage";
import { UserHelper } from "../../api/helpers/userHelper";
import { TeamHelper } from "../../api/helpers/teamHelper";
import { ProjectHelper } from "../../api/helpers/projectHelper";
import { TaskHelper } from "../../api/helpers/taskHelper";
import { fakerHelper } from "../../data/fakerHelper";

const LOGIN_URL = "http://localhost:8080/login";
const API_BASE_URL = "http://localhost:8080/api/v1";

test.describe("Task Assignment", () => {
  let dashboardPage: DashboardPage;
  let user1Token: string;
  let user2Token: string;
  let user1Data: any;
  let user2Data: any;
  let teamId: number;
  let projectId: number;

  test.beforeAll(async ({ browser }) => {
    // Create two test users
    const context = await browser.newContext();
    const page = await context.newPage();
    const request = context.request;
    const userHelper = new UserHelper(request, API_BASE_URL);

    // 1. Register User 1
    const user1Payload = fakerHelper.generateRegistrationData();
    user1Data = await userHelper.registerUserAndAssert({
      email: user1Payload.email,
      username: user1Payload.username,
      password: user1Payload.password,
      language: user1Payload.language,
    });

    const user1LoginResponse = await userHelper.login({
      username: user1Payload.username,
      password: user1Payload.password,
    });
    expect(user1LoginResponse.status).toBe(200);
    user1Token = user1LoginResponse.data.token;

    // 2. Register User 2
    const user2Payload = fakerHelper.generateRegistrationData();
    user2Data = await userHelper.registerUserAndAssert({
      email: user2Payload.email,
      username: user2Payload.username,
      password: user2Payload.password,
      language: user2Payload.language,
    });

    const user2LoginResponse = await userHelper.login({
      username: user2Payload.username,
      password: user2Payload.password,
    });
    expect(user2LoginResponse.status).toBe(200);
    user2Token = user2LoginResponse.data.token;

    // 3. Create team as User 1
    const teamHelper = new TeamHelper(request, API_BASE_URL, user1Token);
    const teamPayload = {
      name: `Team ${Date.now()}`,
      description: "Team for task assignment testing",
      is_public: false,
    };
    const teamData = await teamHelper.createTeamAndAssert(teamPayload);
    teamId = teamData.id;

    // 4. Add User 2 to the team
    await teamHelper.addMemberToTeamAndAssert(teamId, {
      username: user2Payload.username,
      admin: false,
    });

    // 5. Create project as User 1
    const projectHelper = new ProjectHelper(request, API_BASE_URL, user1Token);
    const projectPayload = {
      title: `Project ${Date.now()}`,
      description: "Project for assignment testing",
    };
    const projectData =
      await projectHelper.createProjectAndAssert(projectPayload);
    projectId = projectData.id;

    // 7. Share project with team (add team to project with Read & Write permission)
    await teamHelper.addTeamToProjectAndAssert(projectId, {
      team_id: teamId,
      permission: 1, // Read & Write
    });

    await context.close();
  });

  test.beforeEach(async ({ page }) => {
    // Login as User 1 and navigate to dashboard
    await page.goto(LOGIN_URL);
    await page.evaluate((authToken) => {
      localStorage.setItem("token", authToken);
    }, user1Token);

    // Navigate to dashboard
    await page.goto("http://localhost:8080");
    dashboardPage = new DashboardPage(page);
  });

  test("should assign task to a user and verify in UI", async ({ page }) => {
    const request = page.context().request;
    const taskHelper = new TaskHelper(request, API_BASE_URL, user1Token);

    // 6. Create a task linked to the project
    const taskPayload = {
      title: fakerHelper.generateTaskTitle(),
      description: fakerHelper.generateTaskDescription(),
      project_id: projectId,
    };
    const taskData = await taskHelper.createTaskAndAssert(taskPayload);
    const taskId = taskData.id;

    // Assign the task to User 2
    await taskHelper.assignUserToTaskAndAssert(taskId, user2Data.id);

    // Verify assignment via API - get task and check assignees array
    const taskDetails = await taskHelper.getTaskAndAssert(taskId);
    expect(taskDetails.assignees).toBeDefined();
    expect(taskDetails.assignees.length).toBeGreaterThan(0);
    expect(
      taskDetails.assignees.some((assignee) => assignee.id === user2Data.id),
    ).toBe(true);

    // Navigate to task details page and verify in UI
    await page.goto(`http://localhost:8080/tasks/${taskId}`);
    await page.waitForLoadState("networkidle");
    const taskDetailsPage = new TaskDetailsPage(page);

    // Verify the assignee is displayed on the task details page
    expect(await taskDetailsPage.isUserAssigned(user2Data.username)).toBe(true);
  });
});
