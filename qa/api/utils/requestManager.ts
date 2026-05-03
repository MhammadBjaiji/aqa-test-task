import { APIRequestContext } from "@playwright/test";

export interface RequestOptions {
  headers?: Record<string, string>;
  data?: any;
}

export interface RateLimitConfig {
  minDelayMs: number; // Minimum delay between requests
  maxRetries: number; // Maximum retry attempts on 429
  initialBackoffMs: number; // Initial backoff delay
  maxBackoffMs: number; // Maximum backoff delay
}

const DEFAULT_CONFIG: RateLimitConfig = {
  minDelayMs: 5000, // 5000ms between requests to prevent rate limiting
  maxRetries: 3,
  initialBackoffMs: 2000, // 2 seconds
  maxBackoffMs: 16000, // 16 seconds
};

/**
 * Centralized request manager that throttles API calls and handles rate limiting
 * This prevents 429 errors by spacing out requests and retrying intelligently
 */
export class RequestManager {
  // Shared static state across all RequestManager instances for global rate limit coordination
  private static lastGlobalRequestTime: number = 0;
  private static isGloballyRateLimited: boolean = false;
  private static globalRateLimitResetTime: number = 0;

  private request: APIRequestContext;
  private baseURL: string;
  private config: RateLimitConfig;

  constructor(
    request: APIRequestContext,
    baseURL: string,
    config: Partial<RateLimitConfig> = {},
  ) {
    this.request = request;
    this.baseURL = baseURL;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Delay execution (respects minimum delay between requests using shared global state)
   */
  private async enforceMinDelay(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - RequestManager.lastGlobalRequestTime;

    if (timeSinceLastRequest < this.config.minDelayMs) {
      const delayNeeded = this.config.minDelayMs - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, delayNeeded));
    }

    RequestManager.lastGlobalRequestTime = Date.now();
  }

  /**
   * Check if we're globally rate limited and should wait
   */
  private async checkRateLimit(): Promise<void> {
    if (
      RequestManager.isGloballyRateLimited &&
      Date.now() < RequestManager.globalRateLimitResetTime
    ) {
      const waitTime = RequestManager.globalRateLimitResetTime - Date.now();
      console.log(`Rate limited. Waiting ${waitTime}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
    RequestManager.isGloballyRateLimited = false;
  }

  /**
   * Exponential backoff calculation with jitter
   */
  private getBackoffDelay(attemptNumber: number): number {
    const exponentialDelay = Math.min(
      this.config.initialBackoffMs * Math.pow(2, attemptNumber - 1),
      this.config.maxBackoffMs,
    );
    // Add jitter (±20%)
    const jitter = exponentialDelay * 0.2 * (Math.random() * 2 - 1);
    return Math.max(0, exponentialDelay + jitter);
  }

  /**
   * Perform a GET request with throttling and retry
   */
  async get(endpoint: string, options: RequestOptions = {}): Promise<any> {
    let lastError: any;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        await this.checkRateLimit();
        await this.enforceMinDelay();

        const response = await this.request.get(`${this.baseURL}${endpoint}`, {
          headers: options.headers,
        });

        // Handle rate limiting
        if (response.status() === 429) {
          RequestManager.isGloballyRateLimited = true;
          const retryAfter = response.headers()["retry-after"];
          RequestManager.globalRateLimitResetTime =
            Date.now() +
            (retryAfter
              ? parseInt(retryAfter) * 1000
              : this.config.maxBackoffMs);

          if (attempt < this.config.maxRetries) {
            const backoffDelay = this.getBackoffDelay(attempt);
            console.log(
              `Rate limited on attempt ${attempt}. Waiting ${backoffDelay}ms before retry...`,
            );
            await new Promise((resolve) => setTimeout(resolve, backoffDelay));
            continue;
          }
        }

        return response;
      } catch (error) {
        lastError = error;
        if (attempt < this.config.maxRetries) {
          const backoffDelay = this.getBackoffDelay(attempt);
          console.log(
            `Request failed on attempt ${attempt}. Retrying in ${backoffDelay}ms...`,
          );
          await new Promise((resolve) => setTimeout(resolve, backoffDelay));
        }
      }
    }

    throw lastError || new Error("Request failed after max retries");
  }

  /**
   * Perform a PUT request with throttling and retry
   */
  async put(endpoint: string, options: RequestOptions = {}): Promise<any> {
    let lastError: any;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        await this.checkRateLimit();
        await this.enforceMinDelay();

        const response = await this.request.put(`${this.baseURL}${endpoint}`, {
          headers: options.headers,
          data: options.data,
        });

        // Handle rate limiting
        if (response.status() === 429) {
          RequestManager.isGloballyRateLimited = true;
          const retryAfter = response.headers()["retry-after"];
          RequestManager.globalRateLimitResetTime =
            Date.now() +
            (retryAfter
              ? parseInt(retryAfter) * 1000
              : this.config.maxBackoffMs);

          if (attempt < this.config.maxRetries) {
            const backoffDelay = this.getBackoffDelay(attempt);
            console.log(
              `Rate limited on attempt ${attempt}. Waiting ${backoffDelay}ms before retry...`,
            );
            await new Promise((resolve) => setTimeout(resolve, backoffDelay));
            continue;
          }
        }

        return response;
      } catch (error) {
        lastError = error;
        if (attempt < this.config.maxRetries) {
          const backoffDelay = this.getBackoffDelay(attempt);
          console.log(
            `Request failed on attempt ${attempt}. Retrying in ${backoffDelay}ms...`,
          );
          await new Promise((resolve) => setTimeout(resolve, backoffDelay));
        }
      }
    }

    throw lastError || new Error("Request failed after max retries");
  }

  /**
   * Perform a POST request with throttling and retry
   */
  async post(endpoint: string, options: RequestOptions = {}): Promise<any> {
    let lastError: any;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        await this.checkRateLimit();
        await this.enforceMinDelay();

        const response = await this.request.post(`${this.baseURL}${endpoint}`, {
          headers: options.headers,
          data: options.data,
        });

        // Handle rate limiting
        if (response.status() === 429) {
          RequestManager.isGloballyRateLimited = true;
          const retryAfter = response.headers()["retry-after"];
          RequestManager.globalRateLimitResetTime =
            Date.now() +
            (retryAfter
              ? parseInt(retryAfter) * 1000
              : this.config.maxBackoffMs);

          if (attempt < this.config.maxRetries) {
            const backoffDelay = this.getBackoffDelay(attempt);
            console.log(
              `Rate limited on attempt ${attempt}. Waiting ${backoffDelay}ms before retry...`,
            );
            await new Promise((resolve) => setTimeout(resolve, backoffDelay));
            continue;
          }
        }

        return response;
      } catch (error) {
        lastError = error;
        if (attempt < this.config.maxRetries) {
          const backoffDelay = this.getBackoffDelay(attempt);
          console.log(
            `Request failed on attempt ${attempt}. Retrying in ${backoffDelay}ms...`,
          );
          await new Promise((resolve) => setTimeout(resolve, backoffDelay));
        }
      }
    }

    throw lastError || new Error("Request failed after max retries");
  }

  /**
   * Perform a DELETE request with throttling and retry
   */
  async delete(endpoint: string, options: RequestOptions = {}): Promise<any> {
    let lastError: any;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        await this.checkRateLimit();
        await this.enforceMinDelay();

        const response = await this.request.delete(
          `${this.baseURL}${endpoint}`,
          {
            headers: options.headers,
          },
        );

        // Handle rate limiting
        if (response.status() === 429) {
          RequestManager.isGloballyRateLimited = true;
          const retryAfter = response.headers()["retry-after"];
          RequestManager.globalRateLimitResetTime =
            Date.now() +
            (retryAfter
              ? parseInt(retryAfter) * 1000
              : this.config.maxBackoffMs);

          if (attempt < this.config.maxRetries) {
            const backoffDelay = this.getBackoffDelay(attempt);
            console.log(
              `Rate limited on attempt ${attempt}. Waiting ${backoffDelay}ms before retry...`,
            );
            await new Promise((resolve) => setTimeout(resolve, backoffDelay));
            continue;
          }
        }

        return response;
      } catch (error) {
        lastError = error;
        if (attempt < this.config.maxRetries) {
          const backoffDelay = this.getBackoffDelay(attempt);
          console.log(
            `Request failed on attempt ${attempt}. Retrying in ${backoffDelay}ms...`,
          );
          await new Promise((resolve) => setTimeout(resolve, backoffDelay));
        }
      }
    }

    throw lastError || new Error("Request failed after max retries");
  }

  /**
   * Get configuration
   */
  getConfig(): RateLimitConfig {
    return this.config;
  }

  /**
   * Update configuration
   */
  setConfig(config: Partial<RateLimitConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Reset state (useful between test runs)
   */
  static reset(): void {
    RequestManager.lastGlobalRequestTime = 0;
    RequestManager.isGloballyRateLimited = false;
    RequestManager.globalRateLimitResetTime = 0;
  }
}
