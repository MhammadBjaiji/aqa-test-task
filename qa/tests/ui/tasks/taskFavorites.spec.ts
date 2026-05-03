import { expect, test } from "@playwright/test";
import { DashboardPage } from "../../../Pages/DashboardPage";
import { UserHelper } from "../../../api/helpers/userHelper";
import { fakerHelper } from "../../../data/fakerHelper";
import { TaskDetailsPage } from "../../../Pages/TaskDetailsPage";
import { FavoritesPage } from "../../../Pages/FavoritesPage";

const LOGIN_URL = "http://localhost:8080/login";
const API_BASE_URL = "http://localhost:8080/api/v1";

test.describe("Task Favorites", () => {
  let dashboardPage: DashboardPage;
  let token: string;

  test.beforeAll(async ({ browser }) => {
    // Create a single test user for all tests
    const context = await browser.newContext();
    const page = await context.newPage();
    const request = context.request;

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
    token = loginResponse.data.token;

    await context.close();
  });

  test.beforeEach(async ({ page }) => {
    // Navigate to page and store token in localStorage
    await page.goto(LOGIN_URL);
    await page.evaluate((authToken) => {
      localStorage.setItem("token", authToken);
    }, token);

    // Navigate to dashboard
    await page.goto("http://localhost:8080");
    dashboardPage = new DashboardPage(page);
  });

  test("@regression @tasks should add task to favorites and verify it appears in favorites list", async () => {
    const title = fakerHelper.generateTaskTitle();
    await dashboardPage.addATask(title);
    await dashboardPage.openTaskDetails(title);
    const taskDetailsPage = new TaskDetailsPage(dashboardPage.page);
    await taskDetailsPage.addToFavoritesAndNavigate();
    const favoritesPage = new FavoritesPage(dashboardPage.page);
    expect(await favoritesPage.isTaskInFavorites(title)).toBe(true);
  });
});
