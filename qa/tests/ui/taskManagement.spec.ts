import { expect, test } from "@playwright/test";
import { DashboardPage } from "../../Pages/DashboardPage";
import { UserHelper } from "../../api/helpers/userHelper";
import { fakerHelper } from "../../data/fakerHelper";
import { TaskDetailsPage } from "../../Pages/TaskDetailsPage";

const LOGIN_URL = "http://localhost:8080/login";
const API_BASE_URL = "http://localhost:8080/api/v1";

test.describe("Task Management", () => {
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page, request }) => {
    // Create a new test user for each test
    const testUser = fakerHelper.generateRegistrationData();

    // Register the user via API
    const userHelper = new UserHelper(request, API_BASE_URL);
    await userHelper.registerUser({
      email: testUser.email,
      username: testUser.username,
      password: testUser.password,
      language: testUser.language,
    });

    // Login via API to get token
    const loginResponse = await userHelper.login({
      username: testUser.username,
      password: testUser.password,
    });

    expect(loginResponse.status).toBe(200);
    const token = loginResponse.data.token;

    // Navigate to page and store token in localStorage
    await page.goto(LOGIN_URL);
    await page.evaluate((authToken) => {
      localStorage.setItem("token", authToken);
    }, token);

    // Navigate to dashboard
    await page.goto("http://localhost:8080");
    dashboardPage = new DashboardPage(page);
  });

 
});
