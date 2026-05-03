import { Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class DashboardPage extends BasePage {
    bellIcon = this.page.getByRole('button', { name: 'Notifications' });
    addButton = this.page.locator('.control').getByRole('button', { name: 'Add' });
    taskTitleInput = this.page.getByRole('textbox', { name: 'Add a task…' });

    constructor(page:Page){
        super(page);
    }

    async isBellVisible(){
        return this.isElementVisible(this.bellIcon);
    }

    async addATask(title: string){
        await this.fill(this.taskTitleInput, title); 
        await this.click(this.addButton);
    }

    async isTaskAdded(title: string){
        const taskLocator = this.page.getByRole('link', { name: title });
        return this.isElementVisible(taskLocator);
    }

    async openTaskDetails(title: string){
        const taskLocator = this.page.getByRole('link', { name: title });
        await this.click(taskLocator);
    }
}