import { test, expect, request } from '@playwright/test';

test.describe('TC-01: Daily Menu Response Shape', () => {
  test('returns 200 with success true and exactly 5 items', async ({ baseURL }) => {
    const ctx = await request.newContext({ baseURL });

    const response = await ctx.get('/api/daily-menu');

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data).toHaveLength(5);

    await ctx.dispose();
  });

  test('each menu item has name, description, and imageUrl fields', async ({ baseURL }) => {
    const ctx = await request.newContext({ baseURL });

    const response = await ctx.get('/api/daily-menu');
    const body = await response.json();

    for (const item of body.data) {
      expect(typeof item.name).toBe('string');
      expect(item.name.length).toBeGreaterThan(0);
      expect(typeof item.description).toBe('string');
      expect(item.description.length).toBeGreaterThan(0);
      expect(typeof item.imageUrl).toBe('string');
      expect(item.imageUrl.length).toBeGreaterThan(0);
    }

    await ctx.dispose();
  });
});
