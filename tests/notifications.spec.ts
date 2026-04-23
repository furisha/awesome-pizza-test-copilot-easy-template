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

test.describe('TC-01: Notification — Success', () => {
  test('shows a success notification after placing an order', async ({ page, baseURL }) => {
    const orderId = await createOrder(baseURL!);

    await page.goto('/');
    await page.locator('#order-id').fill(orderId);
    await page.getByRole('button', { name: 'Look Up Order' }).click();

    const notification = page.locator('#notification');
    await expect(notification).toHaveClass(/show/);
    await expect(notification).toContainText('Order found');
  });
});

test.describe('TC-02: Notification — Error', () => {
  test('shows an error notification when looking up a non-existent order', async ({ page }) => {
    await page.goto('/');
    await page.locator('#order-id').fill('nonexistent-id');
    await page.getByRole('button', { name: 'Look Up Order' }).click();

    const notification = page.locator('#notification');
    await expect(notification).toHaveClass(/show/);
    await expect(notification).toHaveClass(/error/);
    await expect(notification).toContainText('Order not found');
  });
});

test.describe('TC-03: Notification — Auto-Dismiss', () => {
  test('notification disappears automatically after ~3 seconds', async ({ page }) => {
    await page.goto('/');
    await page.locator('#order-id').fill('nonexistent-id');
    await page.getByRole('button', { name: 'Look Up Order' }).click();

    const notification = page.locator('#notification');
    await expect(notification).toHaveClass(/show/);

    // Auto-dismiss fires after 3000ms — wait for the class to be removed
    await expect(notification).not.toHaveClass(/show/, { timeout: 5000 });
  });
});
