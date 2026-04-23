import { test, expect } from '@playwright/test';

// Needs its own navigation — must set up waitForResponse before goto
test('TC-01: menu is populated from the API', async ({ page }) => {
  const menuResponsePromise = page.waitForResponse('**/api/daily-menu');
  await page.goto('/');
  const menuResponse = await menuResponsePromise;
  const body = await menuResponse.json();

  expect(menuResponse.status()).toBe(200);
  expect(body.success).toBe(true);
  expect(body.data.length).toBeGreaterThan(0);

  // Each item returned by the API must appear in the rendered menu
  for (const item of body.data) {
    await expect(
      page.locator('.menu-item').filter({ hasText: item.name })
    ).toBeVisible();
  }

  // The number of rendered cards must match the API payload
  await expect(page.locator('.menu-item')).toHaveCount(body.data.length);
});

test.describe('TC-01: Menu Loading', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for at least one menu item to be rendered before each test
    await expect(page.locator('.menu-item').first()).toBeVisible();
  });

  test('displays the menu section heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: "Today's Menu" })).toBeVisible();
  });

  test('each menu item displays a name, description, and image', async ({ page }) => {
    const menuItems = page.locator('.menu-item');
    const count = await menuItems.count();

    for (let i = 0; i < count; i++) {
      const item = menuItems.nth(i);
      await expect(item.getByRole('heading')).toBeVisible();
      await expect(item.locator('p')).toBeVisible();
      await expect(item.getByRole('img')).toBeVisible();
    }
  });

  test('each menu item has decrement and increment quantity buttons', async ({ page }) => {
    const menuItems = page.locator('.menu-item');
    const count = await menuItems.count();

    // Prevent silent pass if list is somehow empty
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const buttons = menuItems.nth(i).locator('.quantity-btn');
      await expect(buttons.first()).toHaveText('\u2212');
      await expect(buttons.last()).toHaveText('+');
    }
  });

  test('all item quantities start at 0', async ({ page }) => {
    const quantities = page.locator('.quantity-display');
    const count = await quantities.count();

    expect(count).toBeGreaterThan(0);

    const expectedZeros = Array(count).fill('0');
    await expect(quantities).toHaveText(expectedZeros);
  });
});
