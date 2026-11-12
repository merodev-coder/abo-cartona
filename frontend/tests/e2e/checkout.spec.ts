import { test, expect, type Page } from '@playwright/test';
const product = {
  id: '507f1f77bcf86cd799439011',
  _id: '507f1f77bcf86cd799439011',
  name: 'SSD Test 1TB',
  type: 'accessories',
  price: 650,
  quantity: 1,
  stockCount: 10,
  images: ['/assets/images/no_image.png'],
  brands: [],
  tags: [],
  storageCapacity: 0,
  gbSize: 0,
};
async function setup(page: Page, price = 650, configured = true) {
  await page.addInitScript(
    (item) =>
      localStorage.setItem(
        'abo-kartona-store',
        JSON.stringify({ state: { cartItems: [item], driveItems: [], orders: [] }, version: 0 })
      ),
    { ...product, price }
  );
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/payment-config'))
      return route.fulfill({
        json: {
          methods: configured
            ? [{ id: 'instapay', name: 'InstaPay', destination: 'isolated-fixture' }]
            : [],
          maxBytes: 5242880,
        },
      });
    if (path.endsWith('/proofs'))
      return route.fulfill({ status: 201, json: { proofId: '507f1f77bcf86cd799439019' } });
    if (path.endsWith('/shipping/methods'))
      return route.fulfill({
        json: {
          methods: [
            {
              _id: 'shipping-test',
              name: 'Test delivery',
              depositType: 'shipping_only',
              governorates: [
                { _id: 'gov', name: 'القاهرة', cost: 80 },
                { _id: 'gov2', name: 'الجيزة', cost: 35 },
              ],
            },
          ],
        },
      });
    if (path.endsWith('/customer-status'))
      return route.fulfill({
        json: {
          orderID: 'AC-qa',
          status: 'Pending',
          depositStatus: 'PENDING_VERIFICATION',
          fulfillmentMethod: 'pickup',
          pickupAddress: 'القاهرة - حدائق حلوان',
          orderTotalMinor: 65000,
          depositAmountMinor: 10000,
          remainingBalanceMinor: 55000,
        },
      });
    if (path.endsWith('/orders') && route.request().method() === 'POST')
      return route.fulfill({
        status: 201,
        json: {
          order: {
            orderID: 'AC-qa',
            totalPrice: 650,
            depositAmountMinor: 10000,
            depositStatus: 'PENDING_VERIFICATION',
          },
        },
      });
    if (path.endsWith('/products'))
      return route.fulfill({ json: { products: [{ ...product, price }], total: 1 } });
    return route.fulfill({ json: {} });
  });
}
async function pickup(page: Page) {
  await page.goto('/checkout');
  await page.getByRole('radio', { name: /استلام من المحل/ }).check();
  await page.getByRole('button', { name: /متابعة:/ }).click();
  await expect(page.getByRole('heading', { name: 'عربون تأكيد الحجز' })).toBeVisible();
}
test('customer browses the storefront, adds a product and opens the cart', async ({ page }) => {
  await setup(page);
  await page.goto('/');
  await page.getByRole('link', { name: 'منتجات', exact: true }).first().click();
  await expect(page.getByText(product.name, { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'أضف للسلة', exact: true }).first().click();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const stored = JSON.parse(localStorage.getItem('abo-kartona-store') || '{}');
        return stored.state?.cartItems?.[0]?.quantity || 1;
      })
    )
    .toBe(2);
  await page.locator('#global-cart-icon').click();
  await expect(page.getByRole('heading', { name: 'إتمام الشراء' })).toBeVisible();
  await expect(page.getByRole('button', { name: `تقليل كمية ${product.name}` })).toBeVisible();
});
for (const width of [320, 360, 375, 390, 430, 768, 1024, 1440, 1920]) {
  test(`RTL pickup checkout fits ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await setup(page);
    await pickup(page);
    await expect(
      page.getByText('الحد الأدنى لطلب الاستلام من المحل 100 جنيه.', { exact: true })
    ).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    if (width === 390 || width === 1440) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({
        path: `qa/checkout-${width}.png`,
        fullPage: true,
        animations: 'disabled',
      });
    }
  });
}
test('pickup requires evidence and submits its private proof reference', async ({ page }) => {
  await setup(page);
  await pickup(page);
  await page.getByPlaceholder('الاسم الثلاثي').fill('عميل الاختبار');
  await page.getByPlaceholder('01xxxxxxxxx').fill('01000000000');
  await page.getByPlaceholder('example@email.com').fill('qa@example.invalid');
  await page.locator('input[type=checkbox]').check();
  const button = page.getByRole('button', { name: 'تأكيد الطلب', exact: true });
  await expect(button).toBeDisabled();
  await page.locator('input[type=file]').setInputFiles({
    name: 'proof.png',
    mimeType: 'image/png',
    buffer: Buffer.from('isolated-mocked-upload'),
  });
  await expect(button).toBeEnabled();
  const request = page.waitForRequest(
    (r) => r.url().endsWith('/api/orders') && r.method() === 'POST'
  );
  await button.click();
  const submission = await request;
  expect(submission.postDataJSON().proofId).toBe('507f1f77bcf86cd799439019');
  expect(submission.postDataJSON().deliveryMethod).toBe('pickup');
  expect(submission.headers()['idempotency-key']).toBeTruthy();
  await expect(page.getByRole('heading', { name: 'حالة دفع العربون' })).toBeVisible();
  await expect(page.getByText('جاري مراجعة التحويل', { exact: true })).toBeVisible();
  await expect(page.getByText('القاهرة - حدائق حلوان', { exact: true })).toBeVisible();
  expect(submission.postDataJSON().depositAmountMinor).toBe(10000);
});
test('below-minimum pickup is blocked with an explicit policy', async ({ page }) => {
  await setup(page, 50);
  await pickup(page);
  await expect(page.getByRole('alert').filter({ hasText: 'يرجى إضافة منتجات' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'تأكيد الطلب', exact: true })).toBeDisabled();
});
test('missing payment configuration never invents a destination', async ({ page }) => {
  await setup(page, 650, false);
  await pickup(page);
  await expect(page.getByText('الدفع غير متاح حالياً.', { exact: false })).toBeVisible();
  await expect(page.locator('input[type=file]')).toHaveCount(0);
});
test('reduced motion keeps checkout usable with native radio keyboard controls', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await setup(page);
  await page.goto('/checkout');
  await expect(page.getByText(product.name, { exact: false }).first()).toBeVisible();
  const radio = page.getByRole('radio', { name: /استلام من المحل/ });
  await radio.focus();
  await page.keyboard.press('Space');
  await expect(radio).toBeChecked();
  await page.getByRole('button', { name: /متابعة:/ }).click();
  await expect(page.getByRole('heading', { name: 'عربون تأكيد الحجز' })).toBeVisible();
});

test('home delivery keeps its configured shipping deposit and address fields', async ({ page }) => {
  await setup(page);
  await page.goto('/checkout');
  await page.getByRole('button', { name: /متابعة:/ }).click();
  await expect(
    page.getByPlaceholder('المحافظة، المنطقة، اسم الشارع، رقم العمارة، رقم الشقة')
  ).toBeVisible();
  await page.getByRole('button', { name: /اختر المحافظة/ }).click();
  await page.getByRole('button', { name: /القاهرة/ }).click();
  await expect(page.getByRole('heading', { name: 'دفع مصاريف التوصيل' })).toBeVisible();
  await expect(page.getByRole('radio', { name: 'InstaPay' })).toBeChecked();
  await expect(
    page.getByRole('button', { name: 'تأكيد وإرسال الطلب', exact: true })
  ).toBeDisabled();
});

async function fillCustomer(page: Page) {
  await page.getByPlaceholder('الاسم الثلاثي').fill('عميل الاختبار');
  await page.getByPlaceholder('01xxxxxxxxx').fill('01000000000');
  await page.getByPlaceholder('example@email.com').fill('qa@example.invalid');
  await page.locator('input[type=checkbox]').check();
}
async function uploadScreenshot(page: Page) {
  await page
    .locator('input[type=file]')
    .setInputFiles({
      name: 'proof.png',
      mimeType: 'image/png',
      buffer: Buffer.from('isolated-mocked-upload'),
    });
  await expect(page.getByText('تم حفظ الصورة بأمان.', { exact: false })).toBeVisible();
}
test('changing fulfillment invalidates proof permanently, including switching back', async ({
  page,
}) => {
  await setup(page);
  await pickup(page);
  await fillCustomer(page);
  await uploadScreenshot(page);
  await expect(page.getByRole('button', { name: 'تأكيد الطلب', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'تغيير', exact: true }).click();
  await page.getByRole('radio', { name: /توصيل للمنزل/ }).check();
  await page.getByRole('button', { name: /متابعة:/ }).click();
  await expect(page.getByRole('heading', { name: 'دفع مصاريف التوصيل' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'معاينة إيصال التحويل' })).toHaveCount(0);
  await page.getByRole('button', { name: 'تغيير', exact: true }).click();
  await page.getByRole('radio', { name: /استلام من المحل/ }).check();
  await page.getByRole('button', { name: /متابعة:/ }).click();
  await expect(page.getByRole('button', { name: 'تأكيد الطلب', exact: true })).toBeDisabled();
});
test('delivery proof is cleared when the configured governorate fee changes', async ({ page }) => {
  await setup(page);
  await page.goto('/checkout');
  await page.getByRole('button', { name: /متابعة:/ }).click();
  await page.getByRole('button', { name: /اختر المحافظة/ }).click();
  await page.getByRole('button', { name: /القاهرة/ }).click();
  await uploadScreenshot(page);
  await page.getByRole('button', { name: /القاهرة —/ }).click();
  await page.getByRole('button', { name: /الجيزة/ }).click();
  await expect(page.getByRole('img', { name: 'معاينة إيصال التحويل' })).toHaveCount(0);
  await expect(
    page.getByText('يرجى رفع صورة تحويل مصاريف التوصيل لإتمام الطلب.', { exact: true })
  ).toBeVisible();
});
test('upload in progress blocks submission and a failed upload stays blocked', async ({ page }) => {
  await setup(page);
  await pickup(page);
  await fillCustomer(page);
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/api/orders/proofs', async (route) => {
    await pending;
    await route.fulfill({ status: 503, json: { error: 'تعذر رفع إثبات التحويل' } });
  });
  await page
    .locator('input[type=file]')
    .setInputFiles({
      name: 'proof.png',
      mimeType: 'image/png',
      buffer: Buffer.from('isolated-mocked-upload'),
    });
  const confirm = page.getByRole('button', { name: 'تأكيد الطلب', exact: true });
  await expect(confirm).toBeDisabled();
  await expect(page.getByRole('progressbar')).toBeVisible();
  release();
  await expect(page.getByRole('alert').filter({ hasText: 'تعذر رفع إثبات التحويل' })).toBeVisible();
  await expect(confirm).toBeDisabled();
});
test('desktop drag and drop uses the same upload flow and removal clears proof', async ({
  page,
}) => {
  await setup(page);
  await pickup(page);
  const transfer = await page.evaluateHandle(() => {
    const data = new DataTransfer();
    data.items.add(new File(['isolated-mocked-upload'], 'receipt.webp', { type: 'image/webp' }));
    return data;
  });
  await page
    .locator('label')
    .filter({ has: page.locator('input[type=file]') })
    .dispatchEvent('drop', { dataTransfer: transfer });
  await expect(page.getByText('تم حفظ الصورة بأمان.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'إزالة الصورة' }).click();
  await expect(page.getByRole('img', { name: 'معاينة إيصال التحويل' })).toHaveCount(0);
});

test('admin can review pending evidence with a required rejection reason', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('isAdminAuthenticated', 'true');
    localStorage.setItem('token', 'isolated-browser-fixture');
  });
  await page.route('**/api/orders/**', async (route) => {
    if (route.request().method() === 'PATCH')
      return route.fulfill({ json: { depositStatus: route.request().postDataJSON().status } });
    return route.fulfill({
      json: {
        order: {
          id: 'qa',
          orderID: 'AC-qa',
          customerName: 'QA',
          phone: '01000000000',
          items: [],
          driveItems: [],
          storageDataMapping: [],
          totalPrice: 650,
          deliveryMethod: 'pickup',
          status: 'Pending',
          depositStatus: 'PENDING_VERIFICATION',
          depositAmountMinor: 10000,
          remainingBalanceMinor: 55000,
          paymentMethod: 'instapay',
          createdAt: new Date().toISOString(),
        },
      },
    });
  });
  await page.goto('/admin/orders/AC-qa');
  const reject = page.getByRole('button', { name: 'رفض الإثبات', exact: true });
  await expect(reject).toBeDisabled();
  await page.getByRole('textbox', { name: 'سبب الرفض' }).fill('الصورة غير واضحة');
  await expect(reject).toBeEnabled();
  await reject.click();
  await expect(page.getByText('تم رفض إثبات الدفع', { exact: true })).toBeVisible();
});
