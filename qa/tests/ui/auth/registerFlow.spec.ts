import { defineConfig, expect, test } from "@playwright/test";
import { RegisterPage } from "../../../Pages/RegisterPage";
import { fakerHelper } from "../../../data/fakerHelper";

const REGISTER_PAGE = "http://localhost:8080/register";

test.describe("Registration Form Validation", () => {
  let registerPage: RegisterPage;

  test.beforeEach(async ({ page }) => {
    await page.goto(REGISTER_PAGE);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    registerPage = new RegisterPage(page);
  });

  test("@smoke @auth should reject invalid email format", async () => {
    const username = fakerHelper.generateUsername();
    const email = "invalidEmailFormat";
    const password = fakerHelper.generatePassword();

    await registerPage.fillRegistrationForm(username, email, password);
    expect(await registerPage.isValidEmailWarningVisible()).toBe(true);
    expect(await registerPage.isSubmitButtonDisabled()).toBe(true);
  });

  test("@regression @auth should reject malformed username", async () => {
    const username = fakerHelper.generateMalformedUsername();
    const email = fakerHelper.generateEmail();
    const password = fakerHelper.generatePassword();

    await registerPage.fillRegistrationForm(username, email, password);
    expect(await registerPage.isValidUsernameWarningVisible()).toBe(true);
    expect(await registerPage.isSubmitButtonDisabled()).toBe(true);
  });

  test("@regression @auth should reject empty password", async () => {
    const username = fakerHelper.generateUsername();
    const email = fakerHelper.generateEmail();
    const password = "";

    await registerPage.fillRegistrationForm(username, email, password);
    expect(await registerPage.isValidPasswordWarningVisible()).toBe(true);
    expect(await registerPage.isSubmitButtonDisabled()).toBe(true);
  });
});
