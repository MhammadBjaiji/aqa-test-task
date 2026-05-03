import { Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { DashboardPage } from "./DashboardPage";
import { RegisterPage } from "./RegisterPage";

export class LoginPage extends BasePage {
  // Define locators
  private emailUsernameInput = this.page.locator("#username");
  private passwordInput = this.page.locator("#password");
  private loginButton = this.page.getByRole("button", { name: "Login" });
  private stayLoggedInCheckbox = this.page.getByRole("checkbox", {
    name: "Stay logged in",
  });
  private usernameWarningMessage = this.page.getByText(
    "Please provide a username.",
  );
  private passwordWarningMessage = this.page.getByText(
    "Please provide a password.",
  );
  private errorMessage = this.page.locator("div.message.danger");
  private createAccountLink = this.page.getByRole("link", {
    name: "Create account",
  });

  constructor(page: Page) {
    super(page);
  }

  async login(email: string, password: string, stayLoggedIn: boolean = false) {
    await this.fill(this.emailUsernameInput, email);
    await this.fill(this.passwordInput, password);

    if (stayLoggedIn) {
      await this.check(this.stayLoggedInCheckbox);
    } else {
      await this.uncheck(this.stayLoggedInCheckbox);
    }
    await this.click(this.loginButton);
  }

  async isErrorMessageVisible(): Promise<boolean> {
    return this.isElementVisible(this.errorMessage);
  }

  async isUsernameWarningVisible() {
    return this.isElementVisible(this.usernameWarningMessage);
  }

  async isPasswordWarningVisible() {
    return this.isElementVisible(this.passwordWarningMessage);
  }

  async navigateToCreateAccount() {
    await this.click(this.createAccountLink);
    return new RegisterPage(this.page);
  }
}
