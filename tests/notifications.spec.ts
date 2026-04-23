import { test } from '@playwright/test';
import { request } from '@playwright/test';
import { NotificationPage } from './pages/NotificationPage';
import { OrderLookupPage } from './pages/OrderLookupPage';

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

test.describe('TC-01: Notification — Success', () => {
  test('shows a success notification after a successful order lookup', async ({ page, baseURL }) => {
    const orderId = await createOrder(baseURL!);
    const lookupPage = new OrderLookupPage(page);
    const notification = new NotificationPage(page);

    await lookupPage.goto();
    await lookupPage.lookUpOrder(orderId);

    await notification.expectSuccess('Order found');
  });
});

test.describe('TC-02: Notification — Error', () => {
  test('shows an error notification when looking up a non-existent order', async ({ page }) => {
    const lookupPage = new OrderLookupPage(page);
    const notification = new NotificationPage(page);

    await lookupPage.goto();
    await lookupPage.lookUpOrder('nonexistent-id');

    await notification.expectError('Order not found');
  });
});

test.describe('TC-03: Notification — Auto-Dismiss', () => {
  test('notification disappears automatically after ~3 seconds', async ({ page }) => {
    const lookupPage = new OrderLookupPage(page);
    const notification = new NotificationPage(page);

    await lookupPage.goto();
    await lookupPage.lookUpOrder('nonexistent-id');

    await notification.waitForVisible();
    await notification.waitForDismissed();
  });
});
