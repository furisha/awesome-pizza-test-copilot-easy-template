import { expect, type Locator, type Page, type Response } from '@playwright/test';

export class OrderPlacementPage {
  readonly page: Page;
  readonly customerNameInput: Locator;
  readonly placeOrderButton: Locator;
  readonly emptyCart: Locator;
  readonly orderIdInput: Locator;
  readonly orderDetails: Locator;
  readonly statusBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.customerNameInput = page.getByLabel('Your Name:');
    this.placeOrderButton = page.getByRole('button', { name: 'Place Order' });
    this.emptyCart = page.locator('.empty-cart');
    this.orderIdInput = page.locator('#order-id');
    this.orderDetails = page.locator('#order-details');
    this.statusBadge = page.locator('.status-badge');
  }

  async goto() {
    await this.page.goto('/');
    await expect(this.page.locator('.menu-item').first()).toBeVisible();
  }

  async fillName(name: string) {
    await this.customerNameInput.fill(name);
  }

  async addItemToCart(itemName: string, times = 1) {
    const item = this.page.locator('.menu-item').filter({ hasText: itemName });
    for (let i = 0; i < times; i++) {
      await item.locator('.quantity-btn').last().click();
    }
  }

  async addFirstItemToCart() {
    await this.page.locator('.menu-item').first().locator('.quantity-btn').last().click();
  }

  async placeOrder(): Promise<Response> {
    const responsePromise = this.page.waitForResponse('**/api/orders');
    await this.placeOrderButton.click();
    return responsePromise;
  }

  getOrderItem(name: string): Locator {
    return this.page.locator('.content-item').filter({ hasText: name });
  }
}
