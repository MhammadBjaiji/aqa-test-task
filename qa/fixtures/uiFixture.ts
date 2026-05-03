import { test as base, Browser, BrowserContext, Page } from "@playwright/test";

type UIFixtures = {
  page: Page;
  context: BrowserContext;
};

export const test = base.extend<UIFixtures>({
  page: async ({ page }, use) => {
    // You can add custom page setup here if needed
    await use(page);
  },
  context: async ({ context }, use) => {
    // You can add custom context setup here if needed
    await use(context);
  },
});

export { expect } from "@playwright/test";
