import { test, expect, request } from '@playwright/test';

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

test.describe('TC-01: Order Lookup — Valid ID', () => {
  test('shows order details when a valid ID is entered and Look Up Order is clicked', async ({ page, baseURL }) => {
    const orderId = await createOrder(baseURL!);

    await page.goto('/');
    await page.locator('#order-id').fill(orderId);
    await page.getByRole('button', { name: 'Look Up Order' }).click();

    await expect(page.locator('#order-details')).toBeVisible();
    await expect(page.locator('#order-details')).toContainText(orderId);
    await expect(page.locator('#order-details')).toContainText('Test User');
    await expect(page.locator('.status-badge')).toBeVisible();
    await expect(page.locator('.content-item').filter({ hasText: 'Margherita Pizza' })).toBeVisible();
  });
});

test.describe('TC-02: Order Lookup — Invalid ID', () => {
  test('shows error notification and hides order details for a non-existent ID', async ({ page }) => {
    await page.goto('/');
    await page.locator('#order-id').fill('nonexistent-id');
    await page.getByRole('button', { name: 'Look Up Order' }).click();

    await expect(page.locator('#notification')).toBeVisible();
    await expect(page.locator('#notification')).toContainText('Order not found');
    await expect(page.locator('#order-details')).toBeHidden();
  });
});

test.describe('TC-03: Order Lookup via Enter Key', () => {
  test('pressing Enter in the order ID field triggers lookup', async ({ page, baseURL }) => {
    const orderId = await createOrder(baseURL!);

    await page.goto('/');
    await page.locator('#order-id').fill(orderId);
    await page.locator('#order-id').press('Enter');

    await expect(page.locator('#order-details')).toBeVisible();
    await expect(page.locator('#order-details')).toContainText(orderId);
    await expect(page.locator('.status-badge')).toBeVisible();
  });
});
