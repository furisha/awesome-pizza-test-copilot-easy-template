import { test, expect } from '@playwright/test';
import { MenuPage } from './pages/MenuPage';

// Needs its own navigation — must set up waitForResponse before goto
test('TC-01: menu is populated from the API', async ({ page }) => {
  const menuPage = new MenuPage(page);
  const menuResponse = await menuPage.gotoAndWaitForMenu();
  const body = await menuResponse.json();

  expect(menuResponse.status()).toBe(200);
  expect(body.success).toBe(true);
  expect(body.data.length).toBeGreaterThan(0);

  for (const item of body.data) {
    await expect(menuPage.getMenuItemByName(item.name)).toBeVisible();
  }

  await expect(menuPage.menuItems).toHaveCount(body.data.length);
});

test.describe('TC-02: Menu Loading', () => {
  let menuPage: MenuPage;

  test.beforeEach(async ({ page }) => {
    menuPage = new MenuPage(page);
    await menuPage.goto();
  });

  test('displays the menu section heading', async () => {
    await expect(menuPage.menuHeading).toBeVisible();
  });

  test('each menu item displays a name, description, and image', async () => {
    const count = await menuPage.menuItems.count();

    for (let i = 0; i < count; i++) {
      const item = menuPage.getMenuItem(i);
      await expect(item.getByRole('heading')).toBeVisible();
      await expect(item.locator('p')).toBeVisible();
      await expect(item.getByRole('img')).toBeVisible();
    }
  });

  test('each menu item has decrement and increment quantity buttons', async () => {
    const count = await menuPage.menuItems.count();

    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      await expect(menuPage.getDecrementButton(i)).toHaveText('\u2212');
      await expect(menuPage.getIncrementButton(i)).toHaveText('+');
    }
  });

  test('all item quantities start at 0', async () => {
    const count = await menuPage.quantityDisplays.count();

    expect(count).toBeGreaterThan(0);

    await expect(menuPage.quantityDisplays).toHaveText(Array(count).fill('0'));
  });
});
