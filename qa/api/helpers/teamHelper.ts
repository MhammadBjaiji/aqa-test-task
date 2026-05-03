import { APIRequestContext } from "@playwright/test";
import { ENDPOINTS } from "../endpoints";
import { RequestManager } from "../utils/requestManager";

export interface CreateTeamPayload {
  name: string;
  description?: string;
  is_public?: boolean;
}

export interface TeamResponse {
  id: number;
  name: string;
  description?: string;
  is_public: boolean;
  members: any[];
  created_by: any;
}

export interface AddTeamToProjectPayload {
  team_id: number;
  permission: 0 | 1 | 2; // 0 = Read only, 1 = Read & Write, 2 = Admin
}

export interface AddTeamMemberPayload {
  username: string;
  admin?: boolean;
}

export interface TeamMemberResponse {
  id: number;
  username: string;
  admin: boolean;
  created: string;
}

export class TeamHelper {
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
   * Create a new team
   * @param payload - Team creation data
   * @returns Response with team data
   */
  async createTeam(payload: CreateTeamPayload) {
    const response = await this.requestManager.put(ENDPOINTS.TEAMS, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      data: {
        name: payload.name,
        description: payload.description || "",
        is_public: payload.is_public || false,
      },
    });

    return {
      status: response.status(),
      data: response.ok() ? await response.json() : null,
      error: !response.ok() ? await response.text() : null,
    };
  }

  /**
   * Create a team and assert success
   * @param payload - Team creation data
   * @returns Team data or throws error
   */
  async createTeamAndAssert(payload: CreateTeamPayload) {
    const response = await this.createTeam(payload);

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(
        `Failed to create team. Status: ${response.status}. Error: ${response.error}`,
      );
    }

    return response.data as TeamResponse;
  }

  /**
   * Add a team to a project
   * @param projectId - Project ID
   * @param payload - Team and permission data
   * @returns Response with project-team relation
   */
  async addTeamToProject(projectId: number, payload: AddTeamToProjectPayload) {
    const response = await this.requestManager.put(
      ENDPOINTS.PROJECT_TEAMS(projectId),
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        data: {
          team_id: payload.team_id,
          permission: payload.permission,
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
   * Add a team to a project and assert success
   * @param projectId - Project ID
   * @param payload - Team and permission data
   * @returns Project-team relation data or throws error
   */
  async addTeamToProjectAndAssert(
    projectId: number,
    payload: AddTeamToProjectPayload,
  ) {
    const response = await this.addTeamToProject(projectId, payload);

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(
        `Failed to add team to project. Status: ${response.status}. Error: ${response.error}`,
      );
    }

    return response.data;
  }

  /**
   * Add a member to a team
   * @param teamId - Team ID
   * @param payload - Member data (username and admin flag)
   * @returns Response with member data
   */
  async addMemberToTeam(teamId: number, payload: AddTeamMemberPayload) {
    const response = await this.requestManager.put(
      ENDPOINTS.TEAM_MEMBERS(teamId),
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        data: {
          username: payload.username,
          admin: payload.admin || false,
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
   * Add a member to a team and assert success
   * @param teamId - Team ID
   * @param payload - Member data (username and admin flag)
   * @returns Member data or throws error
   */
  async addMemberToTeamAndAssert(
    teamId: number,
    payload: AddTeamMemberPayload,
  ) {
    const response = await this.addMemberToTeam(teamId, payload);

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(
        `Failed to add member to team. Status: ${response.status}. Error: ${response.error}`,
      );
    }

    return response.data as TeamMemberResponse;
  }
}
