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

test.describe('TC-01: Menu Display', () => {
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

test.describe('TC-02: Adding Items to Cart', () => {
  let menuPage: MenuPage;

  test.beforeEach(async ({ page }) => {
    menuPage = new MenuPage(page);
    await menuPage.goto();
  });

  test('incrementing a menu item updates its quantity display and adds it to the cart', async ({ page }) => {
    const firstItem = menuPage.getMenuItem(0);
    const itemName = await firstItem.getByRole('heading').innerText();

    await menuPage.getIncrementButton(0).click();

    await expect(menuPage.getQuantityDisplay(0)).toHaveText('1');
    await expect(page.locator('.cart-item-name').filter({ hasText: itemName })).toBeVisible();
    await expect(page.locator('.cart-item').filter({ hasText: itemName }).locator('.cart-item-quantity')).toContainText('1');
    await expect(page.locator('#total-items')).toHaveText('1');
  });
});

test.describe('TC-03: Reducing Item Quantity to Zero Removes from Cart', () => {
  let menuPage: MenuPage;

  test.beforeEach(async ({ page }) => {
    menuPage = new MenuPage(page);
    await menuPage.goto();
  });

  test('decrementing to zero removes the item from the cart and shows empty state', async ({ page }) => {
    await menuPage.getIncrementButton(0).click();
    await expect(menuPage.getQuantityDisplay(0)).toHaveText('1');

    await menuPage.getDecrementButton(0).click();

    await expect(menuPage.getQuantityDisplay(0)).toHaveText('0');
    await expect(page.locator('.empty-cart')).toBeVisible();
    await expect(page.locator('#total-items')).toHaveText('0');
  });
});

test.describe('TC-04: Remove Button in Cart', () => {
  let menuPage: MenuPage;

  test.beforeEach(async ({ page }) => {
    menuPage = new MenuPage(page);
    await menuPage.goto();
  });

  test('clicking Remove in the cart removes the item and resets its menu quantity to 0', async ({ page }) => {
    await menuPage.getIncrementButton(0).click();
    await expect(menuPage.getQuantityDisplay(0)).toHaveText('1');

    await page.locator('.remove-item-btn').first().click();

    await expect(page.locator('.empty-cart')).toBeVisible();
    await expect(menuPage.getQuantityDisplay(0)).toHaveText('0');
    await expect(page.locator('#total-items')).toHaveText('0');
  });
});
