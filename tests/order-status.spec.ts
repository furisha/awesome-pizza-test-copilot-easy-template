import { test, expect, request } from '@playwright/test';
import { OrderLookupPage } from './pages/OrderLookupPage';
import { OrderStatusPage } from './pages/OrderStatusPage';

// Helper: place an order via the API and return its ID
async function createOrder(baseURL: string): Promise<string> {
  const ctx = await request.newContext({ baseURL });
  const response = await ctx.post('/api/orders', {
    data: {
      sender: 'Test User',
      contents: [{ name: 'Margherita Pizza', quantity: 1 }],
    },
  });
  const body = await response.json();
  await ctx.dispose();
  return body.data.id;
}

// Helper: advance an order to DELIVERING status via the API
async function setOrderDelivering(baseURL: string, orderId: string): Promise<void> {
  const ctx = await request.newContext({ baseURL });
  await ctx.put(`/api/orders/${orderId}`, { data: { status: 'DELIVERING' } });
  await ctx.dispose();
}

test.describe('TC-01: Order Status Transition — RECEIVED to DELIVERING', () => {
  test('clicking Mark as Delivering updates badge and swaps action buttons', async ({ page, baseURL }) => {
    const orderId = await createOrder(baseURL!);
    const lookupPage = new OrderLookupPage(page);
    const statusPage = new OrderStatusPage(page);

    await lookupPage.gotoAndLookUpOrder(orderId);

    await expect(statusPage.statusBadge).toHaveText('RECEIVED');
    await expect(statusPage.markAsDeliveringButton).toBeVisible();
    await expect(statusPage.cancelOrderButton).toBeVisible();

    await statusPage.markAsDelivering();

    await expect(statusPage.statusBadge).toHaveText('DELIVERING');
    await expect(statusPage.markAsDeliveredButton).toBeVisible();
    await expect(statusPage.markAsDeliveringButton).toBeHidden();
    await expect(statusPage.cancelOrderButton).toBeHidden();
  });
});

test.describe('TC-02: Order Status Transition — DELIVERING to DELIVERED', () => {
  test('clicking Mark as Delivered updates badge and removes all action buttons', async ({ page, baseURL }) => {
    const orderId = await createOrder(baseURL!);
    await setOrderDelivering(baseURL!, orderId);

    const lookupPage = new OrderLookupPage(page);
    const statusPage = new OrderStatusPage(page);

    await lookupPage.gotoAndLookUpOrder(orderId);

    await expect(statusPage.statusBadge).toHaveText('DELIVERING');
    await expect(statusPage.markAsDeliveredButton).toBeVisible();

    await statusPage.markAsDelivered();

    await expect(statusPage.statusBadge).toHaveText('DELIVERED');
    await expect(statusPage.markAsDeliveredButton).toBeHidden();
  });
});

test.describe('TC-03: Order Status Transition — RECEIVED to CANCELED', () => {
  test('clicking Cancel Order updates badge and removes all action buttons', async ({ page, baseURL }) => {
    const orderId = await createOrder(baseURL!);
    const lookupPage = new OrderLookupPage(page);
    const statusPage = new OrderStatusPage(page);

    await lookupPage.gotoAndLookUpOrder(orderId);

    await expect(statusPage.statusBadge).toHaveText('RECEIVED');

    await statusPage.cancelOrder();

    await expect(statusPage.statusBadge).toHaveText('CANCELED');
    await expect(statusPage.markAsDeliveringButton).toBeHidden();
    await expect(statusPage.cancelOrderButton).toBeHidden();
    await expect(statusPage.markAsDeliveredButton).toBeHidden();
  });
});
