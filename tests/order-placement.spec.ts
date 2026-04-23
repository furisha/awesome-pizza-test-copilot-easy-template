import { test, expect } from '@playwright/test';
import { OrderPlacementPage } from './pages/OrderPlacementPage';
import { NotificationPage } from './pages/NotificationPage';

test.describe('Order Placement', () => {
  let orderPage: OrderPlacementPage;

  test.beforeEach(async ({ page }) => {
    orderPage = new OrderPlacementPage(page);
    await orderPage.goto();
  });

  // TC-01: Place Order Button State — Disabled
  test.describe('TC-01: Place Order button is disabled', () => {
    test('on page load with empty cart and no name', async () => {
      await expect(orderPage.placeOrderButton).toBeDisabled();
    });

    test('when name is filled but cart is empty', async () => {
      await orderPage.fillName('Alice');
      await expect(orderPage.placeOrderButton).toBeDisabled();
    });

    test('when cart has items but name is empty', async () => {
      await orderPage.addFirstItemToCart();
      await expect(orderPage.placeOrderButton).toBeDisabled();
    });
  });

  // TC-02: Place Order Button State — Enabled
  test('TC-02: Place Order button is enabled when name and cart are both filled', async () => {
    await orderPage.fillName('Alice');
    await orderPage.addFirstItemToCart();
    await expect(orderPage.placeOrderButton).toBeEnabled();
  });

  // TC-03: Successful Order Placement
  test('TC-03: successfully places an order and updates the UI', async ({ page }) => {
    const notification = new NotificationPage(page);

    await orderPage.addItemToCart('Pepperoni Pizza', 2);
    await orderPage.fillName('Alice');

    const orderResponse = await orderPage.placeOrder();
    const body = await orderResponse.json();

    expect(orderResponse.status()).toBe(201);
    expect(body.success).toBe(true);
    const orderId = body.data.id;

    await notification.expectSuccess('Order placed successfully');
    await expect(orderPage.emptyCart).toBeVisible();
    await expect(orderPage.customerNameInput).toHaveValue('');
    await expect(orderPage.placeOrderButton).toBeDisabled();
    await expect(orderPage.orderIdInput).toHaveValue(orderId);
    await expect(orderPage.orderDetails).toBeVisible();
    await expect(orderPage.statusBadge).toHaveText('RECEIVED');
  });

  // TC-04: Order Placement with Multiple Items
  test('TC-04: places an order with multiple different pizza types', async () => {
    await orderPage.addItemToCart('Margherita Pizza', 1);
    await orderPage.addItemToCart('BBQ Chicken Pizza', 2);
    await orderPage.fillName('Bob');

    const orderResponse = await orderPage.placeOrder();
    const body = await orderResponse.json();

    expect(body.success).toBe(true);

    await expect(orderPage.orderDetails).toBeVisible();
    await expect(orderPage.getOrderItem('Margherita Pizza')).toContainText('\u00d71');
    await expect(orderPage.getOrderItem('BBQ Chicken Pizza')).toContainText('\u00d72');
  });
});
