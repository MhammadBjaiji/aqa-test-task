import { Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class TaskDetailsPage extends BasePage {
  descriptionEditButton = this.page.getByRole("button", { name: "Edit" });

  descriptionBox = this.page
    .locator(".details.content")
    .filter({ has: this.page.getByRole("heading", { name: "Description" }) })
    .locator(".ProseMirror");

  saveButton = this.page
    .locator(".details.description")
    .getByRole("button", { name: "Save" });

  commentBox = this.page.locator(".comments-container").locator(".ProseMirror");

  commentButton = this.page.getByRole("button", { name: "Comment" });

  addToFavoritesButton = this.page
    .getByRole("button", { name: "Add to Favorites" })
    .filter({ has: this.page.locator(".fa-star") });
  favoritesLink = this.page.getByRole("link", { name: "Favorites" });

  constructor(page: Page) {
    super(page);
  }

  async editDescription(newDescription: string) {
    await this.click(this.descriptionBox);
    await this.descriptionBox.fill(newDescription);
    await this.saveButton.click();
  }

  async getDescriptionText() {
    return await this.descriptionBox.innerText();
  }

  async addComment(comment: string) {
    await this.click(this.commentBox);
    await this.commentBox.fill(comment);
    await this.commentButton.click();
  }

  async doesCommentExist(comment: string) {
    // 1. Locate the container that HAS the 'Comments' heading
    const commentsContainer = this.page.locator("section, div, aside").filter({
      has: this.page.getByRole("heading", { name: /comments/i }),
    });

    // 2. Search for your Faker text within THAT specific container
    const targetComment = commentsContainer.getByText(comment);

    return this.isElementVisible(targetComment);
  }

  async editTitle(title: string, newTitle: string) {
    const titlelocator = this.page.getByRole("heading", { name: title });
    await this.click(titlelocator);
    await this.fill(titlelocator, newTitle);
    const newTitleLocator = this.page.getByRole("heading", { name: newTitle });
    await this.blur(newTitleLocator);
  }

  async isTitleEdited(title: string) {
    const titleLocator = this.page.getByRole("heading", { name: title });
    return this.isElementVisible(titleLocator);
  }

  async changeTaskStatus(status: string, newStatus: string) {
    let dropdoownButton = this.page.getByRole("button", { name: status });
    await this.click(dropdoownButton);

    // Wait for dropdown menu to become visible and click the status option
    let newStatusOption = this.page
      .getByRole("button", { name: newStatus })
      .and(this.page.locator(".dropdown-item"));
    await this.waitForElement(newStatusOption);
    await this.click(newStatusOption);
  }

  async isStatusUpdated(status: string) {
    const statusLocator = this.page.getByRole("button", { name: status });
    return this.isElementVisible(statusLocator);
  }

  async addToFavoritesAndNavigate() {
    await this.click(this.addToFavoritesButton);
    await this.click(this.favoritesLink);
  }

  /**
   * Get attachment locator by filename
   * @param fileName - Name of the attachment file
   * @returns Locator for the attachment
   */
  getAttachmentByName(fileName: string) {
    return this.page.locator(".filename").filter({ hasText: fileName });
  }

  /**
   * Check if attachment is visible in task details
   * @param fileName - Name of the attachment file
   * @returns Boolean indicating if attachment is visible
   */
  async isAttachmentVisible(fileName: string) {
    const attachmentLocator = this.getAttachmentByName(fileName);
    return this.isElementVisible(attachmentLocator);
  }

  /**
   * Get assignees list container
   * @returns Locator for the assignees list
   */
  private getAssigneesList() {
    return this.page.locator(".assignees-list");
  }

  /**
   * Check if a user is assigned to the task
   * @param username - Username to check
   * @returns Boolean indicating if user is assigned
   */
  async isUserAssigned(username: string) {
    const assigneesList = this.getAssigneesList();
    const assigneeLocator = assigneesList
      .locator(".assignee")
      .filter({ has: this.page.locator(`.username:text-is("${username}")`) });
    return this.isElementVisible(assigneeLocator);
  }

  /**
   * Get all assigned usernames
   * @returns Array of usernames assigned to the task
   */
  async getAssignedUsers() {
    const assigneesList = this.getAssigneesList();
    const usernames = await assigneesList
      .locator(".username")
      .allTextContents();
    return usernames;
  }
}
