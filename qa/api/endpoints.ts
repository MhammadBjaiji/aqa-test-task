// Define your API endpoints here
export const ENDPOINTS = {
  // Users endpoints
  USERS: "/users",
  USER_BY_ID: (id: string) => `/users/${id}`,
  REGISTER: "/register",
  LOGIN: "/login",

  // Projects endpoints
  PROJECTS: "/projects",
  PROJECT_BY_ID: (id: number) => `/projects/${id}`,

  // Tasks endpoints
  PROJECT_TASKS: (projectId: number) => `/projects/${projectId}/tasks`,
  TASK_BY_ID: (id: number) => `/tasks/${id}`,
  TASK_ATTACHMENTS: (id: number) => `/tasks/${id}/attachments`,
  TASK_ATTACHMENT_BY_ID: (taskId: number, attachmentId: number) =>
    `/tasks/${taskId}/attachments/${attachmentId}`,
  TASK_ASSIGNMENT: (taskId: number) => `/tasks/${taskId}/assignees`,

  // Teams endpoints
  TEAMS: "/teams",
  TEAM_BY_ID: (id: number) => `/teams/${id}`,
  TEAM_MEMBERS: (teamId: number) => `/teams/${teamId}/members`,
  PROJECT_TEAMS: (projectId: number) => `/projects/${projectId}/teams`,
  PROJECT_TEAM_BY_ID: (projectId: number, teamId: number) =>
    `/projects/${projectId}/teams/${teamId}`,

  // Add more endpoints as needed
  // PRODUCTS: '/products',
  // ORDERS: '/orders',
};
