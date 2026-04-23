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

test.describe('TC-02: Update Order Status Validation', () => {
  test('unknown status value returns 400 listing valid statuses', async ({ baseURL }) => {
    const ctx = await request.newContext({ baseURL });

    // Create a valid order first
    const createResponse = await ctx.post('/api/orders', {
      data: { sender: 'Test User', contents: [{ name: 'Margherita', quantity: 1 }] },
    });
    expect(createResponse.status()).toBe(201);
    const createBody = await createResponse.json();
    const orderId = createBody.data.id;

    // Attempt to set an invalid status
    const updateResponse = await ctx.put(`/api/orders/${orderId}`, {
      data: { status: 'UNKNOWN' },
    });

    expect(updateResponse.status()).toBe(400);
    const updateBody = await updateResponse.json();
    expect(updateBody.success).toBe(false);
    expect(updateBody.message).toMatch(/RECEIVED/);
    expect(updateBody.message).toMatch(/DELIVERING/);
    expect(updateBody.message).toMatch(/DELIVERED/);
    expect(updateBody.message).toMatch(/CANCELED/);

    await ctx.dispose();
  });
});
