import { Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class FavoritesPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    async isTaskInFavorites(taskTitle: string) {
        const taskLocator = this.page.getByRole('link', { name: taskTitle });
        return this.isElementVisible(taskLocator);
    }
}