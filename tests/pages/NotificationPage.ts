import { expect, type Locator, type Page } from '@playwright/test';

export class NotificationPage {
  readonly page: Page;
  readonly notification: Locator;

  constructor(page: Page) {
    this.page = page;
    this.notification = page.locator('#notification');
  }

  async waitForVisible() {
    await expect(this.notification).toHaveClass(/show/);
  }

  async waitForDismissed(timeout = 5000) {
    await expect(this.notification).not.toHaveClass(/show/, { timeout });
  }

  async expectSuccess(text: string) {
    await expect(this.notification).toHaveClass(/show/);
    await expect(this.notification).not.toHaveClass(/error/);
    await expect(this.notification).toContainText(text);
  }

  async expectError(text: string) {
    await expect(this.notification).toHaveClass(/show/);
    await expect(this.notification).toHaveClass(/error/);
    await expect(this.notification).toContainText(text);
  }
}
