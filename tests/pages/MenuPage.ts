import { expect, type Locator, type Page, type Response } from '@playwright/test';

export class MenuPage {
  readonly page: Page;
  readonly menuSection: Locator;
  readonly menuHeading: Locator;
  readonly menuItems: Locator;
  readonly quantityDisplays: Locator;

  constructor(page: Page) {
    this.page = page;
    this.menuSection = page.locator('#menu-section');
    this.menuHeading = page.getByRole('heading', { name: "Today's Menu" });
    this.menuItems = page.locator('.menu-item');
    this.quantityDisplays = page.locator('.quantity-display');
  }

  async gotoAndWaitForMenu(): Promise<Response> {
    const responsePromise = this.page.waitForResponse('**/api/daily-menu');
    await this.page.goto('/');
    return responsePromise;
  }

  async goto() {
    await this.page.goto('/');
    await expect(this.menuItems.first()).toBeVisible();
  }

  getMenuItem(index: number): Locator {
    return this.menuItems.nth(index);
  }

  getMenuItemByName(name: string): Locator {
    return this.menuItems.filter({ hasText: name });
  }

  getDecrementButton(itemIndex: number): Locator {
    return this.menuItems.nth(itemIndex).locator('.quantity-btn').first();
  }

  getIncrementButton(itemIndex: number): Locator {
    return this.menuItems.nth(itemIndex).locator('.quantity-btn').last();
  }

  getQuantityDisplay(itemIndex: number): Locator {
    return this.menuItems.nth(itemIndex).locator('.quantity-display');
  }
}
