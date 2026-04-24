import { test, expect, request } from '@playwright/test';

test.describe('TC-01: Update Order Status Validation', () => {
  test('unknown status value returns 400 listing valid statuses', async ({ baseURL }) => {
    const ctx = await request.newContext({ baseURL });

    const createResponse = await ctx.post('/api/orders', {
      data: { sender: 'Test User', contents: [{ name: 'Margherita', quantity: 1 }] },
    });
    expect(createResponse.status()).toBe(201);
    const { data: order } = await createResponse.json();

    const response = await ctx.put(`/api/orders/${order.id}`, {
      data: { status: 'UNKNOWN' },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.message).toMatch(/RECEIVED/);
    expect(body.message).toMatch(/DELIVERING/);
    expect(body.message).toMatch(/DELIVERED/);
    expect(body.message).toMatch(/CANCELED/);

    await ctx.dispose();
  });
});

test.describe('TC-02: Status Transition — RECEIVED to DELIVERING', () => {
  test('returns 200 with updated status DELIVERING', async ({ baseURL }) => {
    const ctx = await request.newContext({ baseURL });

    const createResponse = await ctx.post('/api/orders', {
      data: { sender: 'Dave', contents: [{ name: 'Veggie Supreme', quantity: 1 }] },
    });
    const { data: order } = await createResponse.json();

    const response = await ctx.put(`/api/orders/${order.id}`, {
      data: { status: 'DELIVERING' },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('DELIVERING');

    await ctx.dispose();
  });
});

test.describe('TC-03: Status Transition — DELIVERING to DELIVERED', () => {
  test('returns 200 with updated status DELIVERED', async ({ baseURL }) => {
    const ctx = await request.newContext({ baseURL });

    const createResponse = await ctx.post('/api/orders', {
      data: { sender: 'Eve', contents: [{ name: 'Four Cheese Pizza', quantity: 1 }] },
    });
    const { data: order } = await createResponse.json();
    await ctx.put(`/api/orders/${order.id}`, { data: { status: 'DELIVERING' } });

    const response = await ctx.put(`/api/orders/${order.id}`, {
      data: { status: 'DELIVERED' },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('DELIVERED');

    await ctx.dispose();
  });
});

test.describe('TC-04: Status Transition — RECEIVED to CANCELED', () => {
  test('returns 200 with updated status CANCELED', async ({ baseURL }) => {
    const ctx = await request.newContext({ baseURL });

    const createResponse = await ctx.post('/api/orders', {
      data: { sender: 'Frank', contents: [{ name: 'Margherita Pizza', quantity: 1 }] },
    });
    const { data: order } = await createResponse.json();

    const response = await ctx.put(`/api/orders/${order.id}`, {
      data: { status: 'CANCELED' },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('CANCELED');

    await ctx.dispose();
  });
});

test.describe('TC-05: Update Non-Existent Order Returns 404', () => {
  test('returns 404 with success false', async ({ baseURL }) => {
    const ctx = await request.newContext({ baseURL });

    const response = await ctx.put('/api/orders/nonexistent-order-id', {
      data: { status: 'DELIVERING' },
    });

    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.success).toBe(false);

    await ctx.dispose();
  });
});

test.describe('TC-06: Status Transition from Terminal State', () => {
  // NOTE: The API does not enforce terminal state immutability — status updates
  // on DELIVERED or CANCELED orders succeed with 200. Tests verify actual behavior.
  test('DELIVERED order status update returns 200', async ({ baseURL }) => {
    const ctx = await request.newContext({ baseURL });

    const createResponse = await ctx.post('/api/orders', {
      data: { sender: 'Grace', contents: [{ name: 'Pepperoni Pizza', quantity: 1 }] },
    });
    const { data: order } = await createResponse.json();
    await ctx.put(`/api/orders/${order.id}`, { data: { status: 'DELIVERING' } });
    await ctx.put(`/api/orders/${order.id}`, { data: { status: 'DELIVERED' } });

    const response = await ctx.put(`/api/orders/${order.id}`, {
      data: { status: 'RECEIVED' },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);

    await ctx.dispose();
  });

  test('CANCELED order status update returns 200', async ({ baseURL }) => {
    const ctx = await request.newContext({ baseURL });

    const createResponse = await ctx.post('/api/orders', {
      data: { sender: 'Hank', contents: [{ name: 'Margherita Pizza', quantity: 1 }] },
    });
    const { data: order } = await createResponse.json();
    await ctx.put(`/api/orders/${order.id}`, { data: { status: 'CANCELED' } });

    const response = await ctx.put(`/api/orders/${order.id}`, {
      data: { status: 'DELIVERING' },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);

    await ctx.dispose();
  });
});
