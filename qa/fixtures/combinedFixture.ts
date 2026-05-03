import { test as base, Page, APIRequestContext } from "@playwright/test";

type CombinedFixtures = {
  page: Page;
  apiClient: APIRequestContext;
};

export const test = base.extend<CombinedFixtures>({
  page: async ({ page }, use) => {
    await use(page);
  },
  apiClient: async ({ request }, use) => {
    await use(request);
  },
});

export { expect } from "@playwright/test";
