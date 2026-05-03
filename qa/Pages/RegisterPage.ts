import { Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class RegisterPage extends BasePage {
  usernameInput = this.page.locator("#username");
  emailInput = this.page.locator("#email");
  passwordInput = this.page.locator("#password");
  createAccountButton = this.page.getByRole("button", {
    name: "Create account",
  });
  validEmailWarning = this.page.getByText("Please enter a valid email");
  usernameWarning = this.page.getByText(
    "The username must not look like a URL.",
  );
  passwordWarning = this.page.getByText("Please provide a password.");

  constructor(page: Page) {
    super(page);
  }

  async RegisterUser(username: string, email: string, passowrd: string) {
    await this.fill(this.usernameInput, username);
    await this.fill(this.emailInput, email);
    await this.fill(this.passwordInput, passowrd);
    await this.blur(this.passwordInput);
    await this.click(this.createAccountButton);
  }

  async fillRegistrationForm(
    username: string,
    email: string,
    passowrd: string,
  ) {
    await this.fill(this.usernameInput, username);
    await this.fill(this.emailInput, email);
    await this.fill(this.passwordInput, passowrd);
    await this.blur(this.passwordInput);
  }

  async isValidEmailWarningVisible() {
    return this.isElementVisible(this.validEmailWarning);
  }

  async isValidUsernameWarningVisible() {
    return this.isElementVisible(this.usernameWarning);
  }

  async isValidPasswordWarningVisible() {
    return this.isElementVisible(this.passwordWarning);
  }

  async isSubmitButtonDisabled() {
    return this.isElementDisabled(this.createAccountButton);
  }
}
