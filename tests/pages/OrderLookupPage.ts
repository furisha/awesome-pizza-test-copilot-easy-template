import { expect, type Locator, type Page } from '@playwright/test';

export class OrderLookupPage {
  readonly page: Page;
  readonly orderIdInput: Locator;
  readonly lookUpButton: Locator;
  readonly orderDetails: Locator;

  constructor(page: Page) {
    this.page = page;
    this.orderIdInput = page.locator('#order-id');
    this.lookUpButton = page.getByRole('button', { name: 'Look Up Order' });
    this.orderDetails = page.locator('#order-details');
  }

  async goto() {
    await this.page.goto('/');
  }

  async lookUpOrder(orderId: string) {
    await this.orderIdInput.fill(orderId);
    await this.lookUpButton.click();
  }

  async gotoAndLookUpOrder(orderId: string) {
    await this.goto();
    await this.lookUpOrder(orderId);
    await expect(this.orderDetails).toBeVisible();
  }
}
