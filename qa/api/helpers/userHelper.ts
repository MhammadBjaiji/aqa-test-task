import { APIRequestContext } from "@playwright/test";
import { ENDPOINTS } from "../endpoints";
import { RequestManager } from "../utils/requestManager";

export interface RegisterUserPayload {
  email: string;
  username: string;
  password: string;
  language?: string;
}

export interface LoginPayload {
  username: string;
  password: string;
  long_token?: boolean;
  totp_passcode?: string;
}

export interface RegisterUserResponse {
  id: number;
  username: string;
  email: string;
  created: string;
  updated: string;
}

export interface LoginResponse {
  token: string;
}

export class UserHelper {
  private baseURL: string;
  private request: APIRequestContext;
  private requestManager: RequestManager;

  constructor(request: APIRequestContext, baseURL: string) {
    this.request = request;
    this.baseURL = baseURL;
    this.requestManager = new RequestManager(request, baseURL);
  }

  /**
   * Register a new user in Vikunja
   * @param payload - User registration data
   * @returns Response status and user data
   */
  async registerUser(payload: RegisterUserPayload) {
    const response = await this.requestManager.post(ENDPOINTS.REGISTER, {
      data: {
        email: payload.email,
        username: payload.username,
        password: payload.password,
        language: payload.language || "en",
      },
    });

    return {
      status: response.status(),
      data: response.ok() ? await response.json() : null,
      error: !response.ok() ? await response.text() : null,
    };
  }

  /**
   * Register a user and return the user data if successful
   * @param payload - User registration data
   * @returns User data or throws error
   */
  async registerUserAndAssert(payload: RegisterUserPayload) {
    const response = await this.registerUser(payload);

    if (response.status !== 201 && response.status !== 200) {
      throw new Error(
        `Failed to register user. Status: ${response.status}. Error: ${response.error}`,
      );
    }

    return response.data as RegisterUserResponse;
  }

  /**
   * Generate a random email for testing
   */
  generateRandomEmail(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `testuser_${timestamp}_${random}@test.com`;
  }

  /**
   * Generate a random username for testing
   */
  generateRandomUsername(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `testuser_${timestamp}_${random}`;
  }

  /**
   * Create a test user with random credentials
   */
  async createTestUser(
    password: string = "TestPassword123!",
    language: string = "en",
  ) {
    const payload: RegisterUserPayload = {
      email: this.generateRandomEmail(),
      username: this.generateRandomUsername(),
      password,
      language,
    };

    return this.registerUserAndAssert(payload);
  }

  /**
   * Login a user
   * @param payload - Login credentials
   * @returns Response with token and status
   */
  async login(payload: LoginPayload) {
    const response = await this.requestManager.post(ENDPOINTS.LOGIN, {
      data: {
        username: payload.username,
        password: payload.password,
        long_token: payload.long_token || false,
        ...(payload.totp_passcode && {
          totp_passcode: payload.totp_passcode,
        }),
      },
    });

    return {
      status: response.status(),
      data: response.ok() ? await response.json() : null,
      error: !response.ok() ? await response.text() : null,
    };
  }
}
