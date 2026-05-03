import { APIRequestContext } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { faker } from "@faker-js/faker";
import { ENDPOINTS } from "../endpoints";

export interface AttachmentResponse {
  id: number;
  task_id: number;
  file: {
    id: number;
    name: string;
    mime: string;
    size: number;
    created: string;
  };
  created: string;
  created_by: {
    id: number;
    username: string;
    email: string;
  };
}

export class AttachmentHelper {
  private baseURL: string;
  private request: APIRequestContext;
  private token: string;

  constructor(request: APIRequestContext, baseURL: string, token: string) {
    this.request = request;
    this.baseURL = baseURL;
    this.token = token;
  }

  /**
   * Create a temporary test file
   * @param filename - Name of the file
   * @param content - File content
   * @returns Full path to the created file
   */
  createTestFile(filename: string, content: string): string {
    const tmpDir = path.join(process.cwd(), "test-files");

    // Create test-files directory if it doesn't exist
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    const filePath = path.join(tmpDir, filename);
    fs.writeFileSync(filePath, content);

    return filePath;
  }

  /**
   * Clean up test file
   * @param filePath - Path to file to delete
   */
  cleanupTestFile(filePath: string): void {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  /**
   * Create a test file with faker-generated content
   * @param filename - Name of the file
   * @returns Full path to the created file
   */
  createTestFileWithFakerContent(filename: string): string {
    const fakerContent = faker.lorem.paragraphs(2);
    return this.createTestFile(filename, fakerContent);
  }

  /**
   * Generate a random test file name
   * @returns Random filename with .txt extension
   */
  generateTestFileName(): string {
    const randomId = Math.random().toString(36).substring(2, 10);
    return `attachment-${randomId}.txt`;
  }

  /**
   * Upload an attachment to a task
   * @param taskId - Task ID
   * @param filePath - Path to file to upload
   * @returns Response with attachment data
   */
  async uploadAttachment(taskId: number, filePath: string) {
    const response = await this.request.put(
      `${this.baseURL}${ENDPOINTS.TASK_ATTACHMENTS(taskId)}`,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        multipart: {
          files: fs.createReadStream(filePath),
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
   * Upload an attachment and assert success
   * @param taskId - Task ID
   * @param filePath - Path to file to upload
   * @returns Attachment data or throws error
   */
  async uploadAttachmentAndAssert(
    taskId: number,
    filePath: string,
  ): Promise<AttachmentResponse> {
    const response = await this.uploadAttachment(taskId, filePath);

    if (response.status !== 201 && response.status !== 200) {
      throw new Error(
        `Failed to upload attachment. Status: ${response.status}. Error: ${response.error}`,
      );
    }

    // API returns attachment in success array
    const attachmentData =
      response.data?.success && Array.isArray(response.data.success)
        ? response.data.success[0]
        : response.data;

    return attachmentData as AttachmentResponse;
  }

  /**
   * Get attachment details
   * @param taskId - Task ID
   * @param attachmentId - Attachment ID
   * @returns Attachment data
   */
  async getAttachment(taskId: number, attachmentId: number) {
    const response = await this.request.get(
      `${this.baseURL}${ENDPOINTS.TASK_ATTACHMENT_BY_ID(taskId, attachmentId)}`,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      },
    );

    let data = null;
    let error = null;

    try {
      if (response.ok()) {
        const contentType = response.headers()["content-type"] || "";
        if (contentType.includes("application/json")) {
          data = await response.json();
        } else {
          data = await response.text();
        }
      } else {
        error = await response.text();
      }
    } catch (e) {
      error = `Failed to parse response: ${e}`;
    }

    return {
      status: response.status(),
      data,
      error,
    };
  }

  /**
   * Download attachment with preview
   * @param taskId - Task ID
   * @param attachmentId - Attachment ID
   * @param previewSize - Optional preview size (sm, md, lg, xl)
   * @returns File data or preview
   */
  async getAttachmentWithPreview(
    taskId: number,
    attachmentId: number,
    previewSize?: "sm" | "md" | "lg" | "xl",
  ) {
    const params = previewSize ? `?preview_size=${previewSize}` : "";
    const response = await this.request.get(
      `${this.baseURL}${ENDPOINTS.TASK_ATTACHMENT_BY_ID(taskId, attachmentId)}${params}`,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      },
    );

    return {
      status: response.status(),
      data: response.ok() ? await response.body() : null,
      error: !response.ok() ? await response.text() : null,
    };
  }
}
