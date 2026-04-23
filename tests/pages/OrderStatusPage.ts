import { type Locator, type Page } from '@playwright/test';

export class OrderStatusPage {
  readonly page: Page;
  readonly statusBadge: Locator;
  readonly markAsDeliveringButton: Locator;
  readonly markAsDeliveredButton: Locator;
  readonly cancelOrderButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.statusBadge = page.locator('.status-badge');
    this.markAsDeliveringButton = page.getByRole('button', { name: 'Mark as Delivering' });
    this.markAsDeliveredButton = page.getByRole('button', { name: 'Mark as Delivered' });
    this.cancelOrderButton = page.getByRole('button', { name: 'Cancel Order' });
  }

  async markAsDelivering() {
    await this.markAsDeliveringButton.click();
  }

  async markAsDelivered() {
    await this.markAsDeliveredButton.click();
  }

  async cancelOrder() {
    await this.cancelOrderButton.click();
  }
}
