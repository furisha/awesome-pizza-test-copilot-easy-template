import { test, expect } from '@playwright/test';

test.describe('Order Placement', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.menu-item').first()).toBeVisible();
  });

  // TC-05: Place Order Button State — Disabled
  test.describe('TC-05: Place Order button is disabled', () => {
    test('on page load with empty cart and no name', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'Place Order' })).toBeDisabled();
    });

    test('when name is filled but cart is empty', async ({ page }) => {
      await page.getByLabel('Your Name:').fill('Alice');
      await expect(page.getByRole('button', { name: 'Place Order' })).toBeDisabled();
    });

    test('when cart has items but name is empty', async ({ page }) => {
      await page.locator('.menu-item').first().locator('.quantity-btn').last().click();
      await expect(page.getByRole('button', { name: 'Place Order' })).toBeDisabled();
    });
  });

  // TC-06: Place Order Button State — Enabled
  test('TC-06: Place Order button is enabled when name and cart are both filled', async ({ page }) => {
    await page.getByLabel('Your Name:').fill('Alice');
    await page.locator('.menu-item').first().locator('.quantity-btn').last().click();
    await expect(page.getByRole('button', { name: 'Place Order' })).toBeEnabled();
  });

  // TC-07: Successful Order Placement
  test('TC-07: successfully places an order and updates the UI', async ({ page }) => {
    // Add 2x Pepperoni Pizza
    const pepperoni = page.locator('.menu-item').filter({ hasText: 'Pepperoni Pizza' });
    await pepperoni.locator('.quantity-btn').last().click();
    await pepperoni.locator('.quantity-btn').last().click();

    await page.getByLabel('Your Name:').fill('Alice');

    const orderResponsePromise = page.waitForResponse('**/api/orders');
    await page.getByRole('button', { name: 'Place Order' }).click();
    const orderResponse = await orderResponsePromise;
    const body = await orderResponse.json();

    expect(orderResponse.status()).toBe(201);
    expect(body.success).toBe(true);
    const orderId = body.data.id;

    // Success notification
    await expect(page.locator('#notification')).toContainText('Order placed successfully');
    await expect(page.locator('#notification')).toContainText(orderId);

    // Cart and name are cleared, button is disabled
    await expect(page.locator('.empty-cart')).toBeVisible();
    await expect(page.getByLabel('Your Name:')).toHaveValue('');
    await expect(page.getByRole('button', { name: 'Place Order' })).toBeDisabled();

    // Order lookup field auto-filled and details shown
    await expect(page.locator('#order-id')).toHaveValue(orderId);
    await expect(page.locator('#order-details')).toBeVisible();
    await expect(page.locator('.status-badge')).toHaveText('RECEIVED');
  });

  // TC-08: Order Placement with Multiple Items
  test('TC-08: places an order with multiple different pizza types', async ({ page }) => {
    const margherita = page.locator('.menu-item').filter({ hasText: 'Margherita Pizza' });
    const bbqChicken = page.locator('.menu-item').filter({ hasText: 'BBQ Chicken Pizza' });

    await margherita.locator('.quantity-btn').last().click(); // 1x Margherita
    await bbqChicken.locator('.quantity-btn').last().click(); // 1x BBQ Chicken
    await bbqChicken.locator('.quantity-btn').last().click(); // 2x BBQ Chicken

    await page.getByLabel('Your Name:').fill('Bob');

    const orderResponsePromise = page.waitForResponse('**/api/orders');
    await page.getByRole('button', { name: 'Place Order' }).click();
    const orderResponse = await orderResponsePromise;
    const body = await orderResponse.json();

    expect(body.success).toBe(true);

    // Order details show both items with correct quantities
    await expect(page.locator('#order-details')).toBeVisible();
    await expect(page.locator('.content-item').filter({ hasText: 'Margherita Pizza' })).toContainText('\u00d71');
    await expect(page.locator('.content-item').filter({ hasText: 'BBQ Chicken Pizza' })).toContainText('\u00d72');
  });
});
