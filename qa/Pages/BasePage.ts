import { Page, Locator } from "@playwright/test";

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Navigation methods
  async goto(url: string = "") {
    await this.page.goto(url);
  }

  async waitForLoadState() {
    await this.page.waitForLoadState("networkidle");
  }

  async reload() {
    await this.page.reload();
  }

  async goBack() {
    await this.page.goBack();
  }

  async goForward() {
    await this.page.goForward();
  }

  // Element interaction methods
  async click(locator: Locator, options?: any) {
    await this.waitForElement(locator);
    await locator.click(options);
  }

  async fill(locator: Locator, text: string) {
    await this.waitForElement(locator);
    await locator.clear();
    await locator.fill(text);
  }

  async type(locator: Locator, text: string) {
    await this.waitForElement(locator);
    await locator.type(text);
  }

  async clear(locator: Locator) {
    await this.waitForElement(locator);
    await locator.clear();
  }

  async selectOption(locator: Locator, value: string | string[]) {
    await this.waitForElement(locator);
    await locator.selectOption(value);
  }

  async check(locator: Locator) {
    await this.waitForElement(locator);
    await locator.check();
  }

  async uncheck(locator: Locator) {
    await this.waitForElement(locator);
    await locator.uncheck();
  }

  async press(locator: Locator, key: string) {
    await this.waitForElement(locator);
    await locator.press(key);
  }

  async focus(locator: Locator) {
    await locator.focus();
  }

  async blur(locator: Locator) {
    await locator.evaluate((el: any) => el.blur());
  }

  async hover(locator: Locator) {
    await locator.hover();
  }

  async dragTo(sourceLocator: Locator, targetLocator: Locator) {
    await sourceLocator.dragTo(targetLocator);
  }

  // Element state methods
  async isElementVisible(
    locator: Locator,
    timeout: number = 5000,
  ): Promise<boolean> {
    try {
      await locator.waitFor({ state: "visible", timeout });
      return true;
    } catch (error) {
      console.log(`Element not visible: ${error}`);
      return false;
    }
  }

  async isElementHidden(
    locator: Locator,
    timeout: number = 5000,
  ): Promise<boolean> {
    try {
      await locator.waitFor({ state: "hidden", timeout });
      return true;
    } catch {
      return false;
    }
  }

  async isElementEnabled(locator: Locator): Promise<boolean> {
    return await locator.isEnabled();
  }

  async isElementDisabled(locator: Locator): Promise<boolean> {
    return !(await locator.isEnabled());
  }

  async isElementChecked(locator: Locator): Promise<boolean> {
    return await locator.isChecked();
  }

  async elementExists(locator: Locator): Promise<boolean> {
    const count = await locator.count();
    return count > 0;
  }

  // Wait methods
  async waitForElement(locator: Locator, timeout: number = 5000) {
    await locator.waitFor({ state: "visible", timeout });
  }

  async waitForElementToDisappear(locator: Locator, timeout: number = 5000) {
    await locator.waitFor({ state: "hidden", timeout });
  }

  async waitForNavigation(
    action: () => Promise<void>,
    timeout: number = 30000,
  ) {
    await Promise.all([this.page.waitForNavigation({ timeout }), action()]);
  }

  async waitForLoadingToFinish(
    loadingLocator: Locator,
    timeout: number = 10000,
  ) {
    await this.waitForElement(loadingLocator, timeout);
    await this.waitForElementToDisappear(loadingLocator, timeout);
  }

  // Text and attribute methods
  async getText(locator: Locator): Promise<string> {
    await this.waitForElement(locator);
    return (await locator.textContent()) || "";
  }

  async getInputValue(locator: Locator): Promise<string> {
    await this.waitForElement(locator);
    return await locator.inputValue();
  }

  async getAttribute(
    locator: Locator,
    attribute: string,
  ): Promise<string | null> {
    await this.waitForElement(locator);
    return await locator.getAttribute(attribute);
  }

  async getCount(locator: Locator): Promise<number> {
    return await locator.count();
  }

  // Scroll methods
  async scrollToElement(locator: Locator) {
    await locator.scrollIntoViewIfNeeded();
  }

  async scrollToTop() {
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

  async scrollToBottom() {
    await this.page.evaluate(() =>
      window.scrollTo(0, document.body.scrollHeight),
    );
  }

  // Page methods
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async getPageContent(): Promise<string> {
    return await this.page.content();
  }

  // Screenshot and debugging
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `./screenshots/${name}.png` });
  }

  async closeModal(closeButtonLocator: Locator) {
    if (await this.isElementVisible(closeButtonLocator)) {
      await this.click(closeButtonLocator);
    }
  }

  // Common helper methods
  async fillAndSubmit(
    inputLocator: Locator,
    submitButtonLocator: Locator,
    text: string,
  ) {
    await this.fill(inputLocator, text);
    await this.click(submitButtonLocator);
  }

  async typeAndKey(locator: Locator, text: string, key: string) {
    await this.type(locator, text);
    await this.press(locator, key);
  }
}
