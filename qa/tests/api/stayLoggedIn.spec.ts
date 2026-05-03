import { test, expect } from "@playwright/test";
import { APIRequestContext } from "@playwright/test";
import { jwtDecode } from "jwt-decode";
import { UserHelper } from "../../api/helpers/userHelper";
import { fakerHelper } from "../../data/fakerHelper";

const API_BASE_URL = "http://localhost:8080/api/v1";

// Helper function to retry failed requests
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000,
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation();
      // Check if result has a status field (for API responses)
      if (result && typeof result === "object" && "status" in result) {
        const response = result as any;
        if (response.status === 200) {
          return result;
        }
      }
      return result;
    } catch (error) {
      if (attempt < maxRetries) {
        console.log(`Attempt ${attempt} failed, retrying in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        throw error;
      }
    }
  }

  throw new Error("Max retries exceeded");
}

test.describe("Stay Logged In Feature - API Tests", () => {
  let request: APIRequestContext;

  test.beforeEach(async ({ request: requestContext }) => {
    request = requestContext;
  });

  test("compare token expiration: stay logged in vs regular login", async () => {
    // Create 2 test users with Faker
    const user1 = fakerHelper.generateRegistrationData();
    const user2 = fakerHelper.generateRegistrationData();

    const userHelper = new UserHelper(request, API_BASE_URL);

    // Register first user with retry logic to handle 412 errors
    const registerResponse1 = await retryOperation(
      async () =>
        await userHelper.registerUser({
          email: user1.email,
          username: user1.username,
          password: user1.password,
          language: user1.language,
        }),
      3,
      1000,
    );

    expect(registerResponse1.status).toBe(200);

    // Add delay before registering second user
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Register second user with retry logic
    const registerResponse2 = await retryOperation(
      async () =>
        await userHelper.registerUser({
          email: user2.email,
          username: user2.username,
          password: user2.password,
          language: user2.language,
        }),
      3,
      1000,
    );

    expect(registerResponse2.status).toBe(200);

    // Add significant delay to ensure registrations are fully processed
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Login User 1 multiple times to establish baseline
    // First login with long_token: true
    const loginResponse1a = await userHelper.login({
      username: user1.username,
      password: user1.password,
      long_token: true,
    });

    expect(loginResponse1a.status).toBe(200);
    const token1a = loginResponse1a.data.token;
    const decodedToken1a = jwtDecode<any>(token1a);
    const exp1a = decodedToken1a.exp;

    // Add delay to get a second timestamp
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Second login with long_token: true (same user, same flag)
    // This should give us tokens with similar but slightly different expirations
    const loginResponse1b = await userHelper.login({
      username: user1.username,
      password: user1.password,
      long_token: true,
    });

    expect(loginResponse1b.status).toBe(200);
    const token1b = loginResponse1b.data.token;
    const decodedToken1b = jwtDecode<any>(token1b);
    const exp1b = decodedToken1b.exp;

    // Add delay before testing different flag
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Login User 2 with long_token: false (for comparison)
    const loginResponse2a = await userHelper.login({
      username: user2.username,
      password: user2.password,
      long_token: false,
    });

    expect(loginResponse2a.status).toBe(200);
    const token2a = loginResponse2a.data.token;
    const decodedToken2a = jwtDecode<any>(token2a);
    const exp2a = decodedToken2a.exp;

    // Calculate the difference between two long_token: true logins (2 seconds apart)
    const longTokenDifference = exp1b - exp1a;
    // This should be approximately 2 seconds (the delay we added)

    // Calculate the difference between long_token: true and long_token: false
    const flagDifference = exp1a - exp2a;

    console.log(`Token with long_token: true (1st login) exp: ${exp1a}`);
    console.log(
      `Token with long_token: true (2nd login, 2s later) exp: ${exp1b}`,
    );
    console.log(`Token with long_token: false exp: ${exp2a}`);
    console.log(
      `Difference between two long_token: true logins (2s apart): ${longTokenDifference}s`,
    );
    console.log(
      `Difference between long_token: true and long_token: false: ${flagDifference}s`,
    );

    // Verify both tokens are valid and have expiration data
    expect(exp1a).toBeGreaterThan(0);
    expect(exp1b).toBeGreaterThan(0);
    expect(exp2a).toBeGreaterThan(0);

    // The difference between two logins 2s apart should be close to 2s
    expect(longTokenDifference).toBeGreaterThanOrEqual(1);
    expect(longTokenDifference).toBeLessThanOrEqual(3);
    console.log("✓ Two logins with same flag 2s apart have ~2s exp difference");

    // Log which flag produces longer tokens
    if (flagDifference > 0) {
      console.log(
        `✓ long_token: true produces ${flagDifference}s longer tokens`,
      );
    } else if (flagDifference < 0) {
      console.log(
        `✓ long_token: false produces ${Math.abs(flagDifference)}s longer tokens`,
      );
    } else {
      console.log(
        `⚠ Both flags produce tokens with same expiration (no difference detected)`,
      );
    }

    // Assert that long_token: true produces MEANINGFULLY longer tokens
    // A real "stay logged in" feature should be at least hours/days longer, not seconds
    const MINIMUM_LONG_TOKEN_DIFFERENCE_SECONDS = 3600; // 1 hour minimum

    expect(
      exp1a,
      `long_token: true should produce tokens valid for at least ${MINIMUM_LONG_TOKEN_DIFFERENCE_SECONDS}s longer than long_token: false`,
    ).toBeGreaterThan(exp2a + MINIMUM_LONG_TOKEN_DIFFERENCE_SECONDS);
  });
});
