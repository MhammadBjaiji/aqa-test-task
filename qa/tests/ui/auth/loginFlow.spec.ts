import { defineConfig, expect, test } from "@playwright/test";
import { LoginPage } from "../../../Pages/LoginPage";
import { DashboardPage } from "../../../Pages/DashboardPage";
import { TEST_USERS, TEST_DATA } from "../../../data/testData";
import { UserHelper } from "../../../api/helpers/userHelper";
import { fakerHelper } from "../../../data/fakerHelper";

const LOGIN_URL = "http://localhost:8080/login";
const API_BASE_URL = "http://localhost:8080/api/v1";

test.describe("Login Flow", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    await page.goto(LOGIN_URL);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    loginPage = new LoginPage(page);
  });

  test("@smoke @auth @critical should login with valid credentials", async ({
    request,
    page,
  }) => {
    const newUser = fakerHelper.generateRegistrationData();
    const userHelper = new UserHelper(request, API_BASE_URL);
    const registerResponse = await userHelper.registerUser({
      email: newUser.email,
      username: newUser.username,
      password: newUser.password,
      language: newUser.language,
    });

    expect(registerResponse.status).toBe(200);
    expect(registerResponse.data).not.toBeNull();

    await page.goto(LOGIN_URL);
    await page.waitForLoadState("networkidle");
    loginPage = new LoginPage(page);

    await loginPage.login(newUser.email, newUser.password);
    const dashboardPage = new DashboardPage(loginPage.page);
    expect(await dashboardPage.isBellVisible()).toBe(true);
  });

  test("@regression @auth should show error with invalid credentials", async () => {
    const randomUser = TEST_DATA.randomInvalidUser();
    await loginPage.login(randomUser.email, randomUser.password);
    expect(await loginPage.isErrorMessageVisible()).toBe(true);
  });

  test("@regression @auth should show validation errors with empty credentials", async () => {
    await loginPage.login("", "");
    expect(await loginPage.isUsernameWarningVisible()).toBe(true);
    expect(await loginPage.isPasswordWarningVisible()).toBe(true);
  });
});
