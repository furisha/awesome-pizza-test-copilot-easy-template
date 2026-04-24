import { test, expect, request } from '@playwright/test';

test.describe('TC-01: Fetch Order By ID', () => {
  test('returns 200 with order data matching the created order', async ({ baseURL }) => {
    const ctx = await request.newContext({ baseURL });

    const createResponse = await ctx.post('/api/orders', {
      data: { sender: 'Charlie', contents: [{ name: 'Pepperoni Pizza', quantity: 1 }] },
    });
    const { data: created } = await createResponse.json();

    const getResponse = await ctx.get(`/api/orders/${created.id}`);

    expect(getResponse.status()).toBe(200);
    const body = await getResponse.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(created.id);
    expect(body.data.sender).toBe('Charlie');
    expect(body.data.status).toBe('RECEIVED');
    expect(body.data.contents).toEqual([{ name: 'Pepperoni Pizza', quantity: 1 }]);

    await ctx.dispose();
  });
});

test.describe('TC-02: Fetch Non-Existent Order Returns 404', () => {
  test('returns 404 with success false and not-found message', async ({ baseURL }) => {
    const ctx = await request.newContext({ baseURL });

    const response = await ctx.get('/api/orders/nonexistent-order-id');

    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.message).toMatch(/not found/i);

    await ctx.dispose();
  });
});
