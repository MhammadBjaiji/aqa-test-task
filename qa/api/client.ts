import { APIRequestContext } from "@playwright/test";

export class APIClient {
  private baseURL: string;
  private request: APIRequestContext;

  constructor(request: APIRequestContext, baseURL: string) {
    this.request = request;
    this.baseURL = baseURL;
  }

  async get(endpoint: string, options?: any) {
    return this.request.get(`${this.baseURL}${endpoint}`, options);
  }

  async post(endpoint: string, data?: any, options?: any) {
    return this.request.post(`${this.baseURL}${endpoint}`, {
      data,
      ...options,
    });
  }

  async put(endpoint: string, data?: any, options?: any) {
    return this.request.put(`${this.baseURL}${endpoint}`, { data, ...options });
  }

  async delete(endpoint: string, options?: any) {
    return this.request.delete(`${this.baseURL}${endpoint}`, options);
  }

  async patch(endpoint: string, data?: any, options?: any) {
    return this.request.patch(`${this.baseURL}${endpoint}`, {
      data,
      ...options,
    });
  }
}
