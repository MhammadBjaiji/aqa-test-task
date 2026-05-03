import { test as base, APIRequestContext } from "@playwright/test";

type APIFixtures = {
  apiClient: APIRequestContext;
};

export const test = base.extend<APIFixtures>({
  apiClient: async ({ request }, use) => {
    // You can add custom API client setup here if needed
    await use(request);
  },
});

export { expect } from "@playwright/test";
