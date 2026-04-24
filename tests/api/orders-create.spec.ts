import { test, expect, request } from '@playwright/test';

test.describe('TC-01: Create Order Input Validation', () => {
  test('missing sender returns 400 with descriptive error', async ({ baseURL }) => {
    const ctx = await request.newContext({ baseURL });

    const response = await ctx.post('/api/orders', {
      data: { contents: [{ name: 'Margherita', quantity: 1 }] },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.message).toMatch(/sender/i);

    await ctx.dispose();
  });

  test('empty contents array returns 400 with descriptive error', async ({ baseURL }) => {
    const ctx = await request.newContext({ baseURL });

    const response = await ctx.post('/api/orders', {
      data: { sender: 'Alice', contents: [] },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.message).toMatch(/contents/i);

    await ctx.dispose();
  });

  test('missing contents field returns 400 with descriptive error', async ({ baseURL }) => {
    const ctx = await request.newContext({ baseURL });

    const response = await ctx.post('/api/orders', {
      data: { sender: 'Alice' },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.message).toMatch(/contents/i);

    await ctx.dispose();
  });
});

test.describe('TC-02: Successful Order Creation', () => {
  test('returns 201 with generated id, correct sender, RECEIVED status, and matching contents', async ({ baseURL }) => {
    const ctx = await request.newContext({ baseURL });

    const response = await ctx.post('/api/orders', {
      data: { sender: 'Alice', contents: [{ name: 'Margherita Pizza', quantity: 2 }] },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(typeof body.data.id).toBe('string');
    expect(body.data.id.length).toBeGreaterThan(0);
    expect(body.data.sender).toBe('Alice');
    expect(body.data.status).toBe('RECEIVED');
    expect(body.data.contents).toEqual([{ name: 'Margherita Pizza', quantity: 2 }]);

    await ctx.dispose();
  });
});

test.describe('TC-03: Order With Multiple Items', () => {
  test('all items appear in response contents with correct quantities', async ({ baseURL }) => {
    const ctx = await request.newContext({ baseURL });

    const items = [
      { name: 'Margherita Pizza', quantity: 1 },
      { name: 'BBQ Chicken Pizza', quantity: 2 },
    ];
    const response = await ctx.post('/api/orders', {
      data: { sender: 'Bob', contents: items },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.data.contents).toHaveLength(2);
    expect(body.data.contents).toEqual(expect.arrayContaining(items));

    await ctx.dispose();
  });
});

test.describe('TC-04: Zero Quantity Item in Order', () => {
  test('order with zero-quantity item is rejected with 400', async ({ baseURL }) => {
    const ctx = await request.newContext({ baseURL });

    const response = await ctx.post('/api/orders', {
      data: { sender: 'Ivan', contents: [{ name: 'Margherita Pizza', quantity: 0 }] },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);

    await ctx.dispose();
  });
});
