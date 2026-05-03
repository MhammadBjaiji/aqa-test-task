import { APIRequestContext } from "@playwright/test";
import { ENDPOINTS } from "../endpoints";
import { RequestManager } from "../utils/requestManager";

export interface CreateProjectPayload {
  title: string;
  description?: string;
  hex_color?: string;
  identifier?: string;
}

export interface ProjectResponse {
  id: number;
  title: string;
  description?: string;
  identifier?: string;
  hex_color?: string;
  owner: any;
  created: string;
  updated: string;
}

export class ProjectHelper {
  private baseURL: string;
  private request: APIRequestContext;
  private token: string;
  private requestManager: RequestManager;

  constructor(request: APIRequestContext, baseURL: string, token: string) {
    this.request = request;
    this.baseURL = baseURL;
    this.token = token;
    this.requestManager = new RequestManager(request, baseURL);
  }

  /**
   * Create a new project
   * @param payload - Project creation data
   * @returns Response with project data
   */
  async createProject(payload: CreateProjectPayload) {
    const response = await this.requestManager.put(ENDPOINTS.PROJECTS, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      data: {
        title: payload.title,
        description: payload.description || "",
        hex_color: payload.hex_color || "#5264AE",
        identifier: payload.identifier || "",
      },
    });

    return {
      status: response.status(),
      data: response.ok() ? await response.json() : null,
      error: !response.ok() ? await response.text() : null,
    };
  }

  /**
   * Create a project and assert success
   * @param payload - Project creation data
   * @returns Project data or throws error
   */
  async createProjectAndAssert(payload: CreateProjectPayload) {
    const response = await this.createProject(payload);

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(
        `Failed to create project. Status: ${response.status}. Error: ${response.error}`,
      );
    }

    return response.data as ProjectResponse;
  }

  /**
   * Get a project by ID
   * @param projectId - Project ID
   * @returns Project data or null
   */
  async getProject(projectId: number) {
    const response = await this.requestManager.get(
      ENDPOINTS.PROJECT_BY_ID(projectId),
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      },
    );

    return {
      status: response.status(),
      data: response.ok() ? await response.json() : null,
      error: !response.ok() ? await response.text() : null,
    };
  }

  /**
   * Get a project by ID and assert success
   * @param projectId - Project ID
   * @returns Project data or throws error
   */
  async getProjectAndAssert(projectId: number) {
    const response = await this.getProject(projectId);

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(
        `Failed to get project. Status: ${response.status}. Error: ${response.error}`,
      );
    }

    return response.data as ProjectResponse;
  }
}
