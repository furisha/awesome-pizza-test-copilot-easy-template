import { test, expect } from '@playwright/test';

test.describe('TC-16: Theme Toggle — Light to Dark', () => {
  test('clicking the moon button sets dark theme and shows sun icon', async ({ page }) => {
    await page.goto('/');

    await page.locator('#theme-toggle').click();

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('#theme-toggle')).toHaveText('☀️');
  });
});

test.describe('TC-17: Theme Toggle — Dark to Light', () => {
  test('clicking the sun button removes dark theme and shows moon icon', async ({ page }) => {
    await page.goto('/');

    // Switch to dark first
    await page.locator('#theme-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    // Switch back to light
    await page.locator('#theme-toggle').click();

    await expect(page.locator('html')).not.toHaveAttribute('data-theme');
    await expect(page.locator('#theme-toggle')).toHaveText('🌙');
  });
});

test.describe('TC-18: Theme Persistence Across Page Reloads', () => {
  test('dark mode preference is preserved after page reload', async ({ page }) => {
    await page.goto('/');

    await page.locator('#theme-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.reload();

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('#theme-toggle')).toHaveText('☀️');
  });
});
