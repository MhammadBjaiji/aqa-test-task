import { APIRequestContext } from "@playwright/test";
import { ENDPOINTS } from "../endpoints";
import { RequestManager } from "../utils/requestManager";

export interface CreateTaskPayload {
  title: string;
  description?: string;
  project_id: number;
  bucket_id?: number;
  priority?: number;
  due_date?: string;
}

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  name?: string;
  created: string;
  updated: string;
}

export interface TaskResponse {
  id: number;
  title: string;
  description: string;
  project_id: number;
  bucket_id: number;
  created: string;
  updated: string;
  attachments: any[];
  comments: any[];
}

export interface TaskDetailResponse {
  id: number;
  title: string;
  description: string;
  project_id: number;
  bucket_id: number;
  created: string;
  updated: string;
  created_by: UserInfo;
  assignees: UserInfo[];
  attachments: any[];
  comments: any[];
  comment_count: number;
  done: boolean;
  done_at?: string;
  due_date?: string;
  is_favorite: boolean;
  priority: number;
  [key: string]: any; // Allow other fields from the API response
}

export class TaskHelper {
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
   * Create a new task
   * @param payload - Task data (requires project_id)
   * @returns Response with task data
   */
  async createTask(payload: CreateTaskPayload) {
    const response = await this.requestManager.put(
      ENDPOINTS.PROJECT_TASKS(payload.project_id),
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        data: {
          title: payload.title,
          description: payload.description || "",
          bucket_id: payload.bucket_id,
          priority: payload.priority,
          due_date: payload.due_date,
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
   * Create a task and assert success
   * @param payload - Task data
   * @returns Task data or throws error
   */
  async createTaskAndAssert(payload: CreateTaskPayload) {
    const response = await this.createTask(payload);

    if (response.status !== 201 && response.status !== 200) {
      throw new Error(
        `Failed to create task. Status: ${response.status}. Error: ${response.error}`,
      );
    }

    return response.data as TaskResponse;
  }

  /**
   * Get task by ID
   * @param taskId - Task ID
   * @returns Task data
   */
  async getTask(taskId: number) {
    const response = await this.requestManager.get(
      ENDPOINTS.TASK_BY_ID(taskId),
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
   * Get task by ID and assert success (includes full details with assignees)
   * @param taskId - Task ID
   * @returns Task detail data or throws error
   */
  async getTaskAndAssert(taskId: number) {
    const response = await this.getTask(taskId);

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(
        `Failed to get task. Status: ${response.status}. Error: ${response.error}`,
      );
    }

    return response.data as TaskDetailResponse;
  }

  /**
   * Get all projects
   * @returns Projects list
   */
  async getProjects() {
    const response = await this.requestManager.get(ENDPOINTS.PROJECTS, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });

    return {
      status: response.status(),
      data: response.ok() ? await response.json() : null,
      error: !response.ok() ? await response.text() : null,
    };
  }

  /**
   * Get the first available project
   * @returns Project ID or throws error if no projects exist
   */
  async getFirstProjectId(): Promise<number> {
    const response = await this.getProjects();

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(
        `Failed to get projects. Status: ${response.status}. Error: ${response.error}`,
      );
    }

    const projects = Array.isArray(response.data)
      ? response.data
      : response.data?.projects || [];
    if (projects.length === 0) {
      throw new Error(
        "No projects found. Please create a project before creating tasks.",
      );
    }

    return projects[0].id;
  }

  /**
   * Assign a user to a task
   * @param taskId - Task ID
   * @param userId - User ID to assign
   * @returns Response with assignment data
   */
  async assignUserToTask(taskId: number, userId: number) {
    const response = await this.requestManager.put(
      ENDPOINTS.TASK_ASSIGNMENT(taskId),
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        data: {
          user_id: userId,
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
   * Assign a user to a task and assert success
   * @param taskId - Task ID
   * @param userId - User ID to assign
   * @returns Assignment data or throws error
   */
  async assignUserToTaskAndAssert(taskId: number, userId: number) {
    const response = await this.assignUserToTask(taskId, userId);

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(
        `Failed to assign user to task. Status: ${response.status}. Error: ${response.error}`,
      );
    }

    return response.data;
  }
}
