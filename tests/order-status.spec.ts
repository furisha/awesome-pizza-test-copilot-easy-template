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

// Helper: advance an order to DELIVERING status via the API
async function setOrderDelivering(baseURL: string, orderId: string): Promise<void> {
  const ctx = await request.newContext({ baseURL });
  await ctx.put(`/api/orders/${orderId}`, { data: { status: 'DELIVERING' } });
  await ctx.dispose();
}

// Shared setup: navigate to page and look up an order by ID
async function lookUpOrder(page: any, orderId: string) {
  await page.goto('/');
  await page.locator('#order-id').fill(orderId);
  await page.getByRole('button', { name: 'Look Up Order' }).click();
  await expect(page.locator('#order-details')).toBeVisible();
}

test.describe('TC-01: Order Status Transition — RECEIVED to DELIVERING', () => {
  test('clicking Mark as Delivering updates badge and swaps action buttons', async ({ page, baseURL }) => {
    const orderId = await createOrder(baseURL!);
    await lookUpOrder(page, orderId);

    await expect(page.locator('.status-badge')).toHaveText('RECEIVED');
    await expect(page.getByRole('button', { name: 'Mark as Delivering' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel Order' })).toBeVisible();

    await page.getByRole('button', { name: 'Mark as Delivering' }).click();

    await expect(page.locator('.status-badge')).toHaveText('DELIVERING');
    await expect(page.getByRole('button', { name: 'Mark as Delivered' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Mark as Delivering' })).toBeHidden();
    await expect(page.getByRole('button', { name: 'Cancel Order' })).toBeHidden();
  });
});

test.describe('TC-02: Order Status Transition — DELIVERING to DELIVERED', () => {
  test('clicking Mark as Delivered updates badge and removes all action buttons', async ({ page, baseURL }) => {
    const orderId = await createOrder(baseURL!);
    await setOrderDelivering(baseURL!, orderId);
    await lookUpOrder(page, orderId);

    await expect(page.locator('.status-badge')).toHaveText('DELIVERING');
    await expect(page.getByRole('button', { name: 'Mark as Delivered' })).toBeVisible();

    await page.getByRole('button', { name: 'Mark as Delivered' }).click();

    await expect(page.locator('.status-badge')).toHaveText('DELIVERED');
    await expect(page.getByRole('button', { name: 'Mark as Delivered' })).toBeHidden();
  });
});

test.describe('TC-03: Order Status Transition — RECEIVED to CANCELED', () => {
  test('clicking Cancel Order updates badge and removes all action buttons', async ({ page, baseURL }) => {
    const orderId = await createOrder(baseURL!);
    await lookUpOrder(page, orderId);

    await expect(page.locator('.status-badge')).toHaveText('RECEIVED');

    await page.getByRole('button', { name: 'Cancel Order' }).click();

    await expect(page.locator('.status-badge')).toHaveText('CANCELED');
    await expect(page.getByRole('button', { name: 'Mark as Delivering' })).toBeHidden();
    await expect(page.getByRole('button', { name: 'Cancel Order' })).toBeHidden();
  });
});
