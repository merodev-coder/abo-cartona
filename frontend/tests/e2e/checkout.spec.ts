import { test, expect, type Page } from '@playwright/test';
import { formatEGPNumber } from '../../src/lib/currency';

test('EGP amounts round consistently and have no embedded bidi currency controls', () => {
  expect(formatEGPNumber(1234567.5)).toBe('1,234,567.50');
  expect(formatEGPNumber(35)).toBe('35.00');
  expect(formatEGPNumber(1.235)).toBe('1.24');
  expect(formatEGPNumber(Number.NaN)).toBe('—');
});
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
          configuration: { destinationReady: configured, uploadReady: true },
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

async function configurePaymentMethods(page: Page, instaPayConfirmed = true) {
  await page.route('**/api/orders/payment-config', (route) =>
    route.fulfill({
      json: {
        methods: [
          {
            id: 'vodafone',
            code: 'VODAFONE_CASH',
            name: 'فودافون كاش',
            destination: '+20 106 795 7449',
          },
          ...(instaPayConfirmed
            ? [
                {
                  id: 'instapay',
                  code: 'INSTAPAY',
                  name: 'إنستاباي',
                  destination: '+20 106 795 7449',
                },
              ]
            : []),
        ],
        configuration: { destinationReady: true, uploadReady: true },
        maxBytes: 5242880,
      },
    })
  );
}

test('configured payment cards default to Vodafone, copy the exact phone, and switch to InstaPay', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await setup(page);
  await configurePaymentMethods(page);
  await pickup(page);
  await expect(page.getByRole('radio', { name: /Vodafone Cash/ })).toBeChecked();
  await expect(page.getByRole('heading', { name: 'التحويل عبر فودافون كاش' })).toBeVisible();
  await expect(page.getByText('لم يضبط المتجر', { exact: false })).toHaveCount(0);
  const number = page.locator('bdi').filter({ hasText: '+20 106 795 7449' });
  await expect(number).toHaveAttribute('dir', 'ltr');
  await page.getByRole('button', { name: 'نسخ الرقم', exact: true }).click();
  await expect(page.getByRole('button', { name: 'تم نسخ الرقم', exact: true })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('+201067957449');
  await page.getByRole('radio', { name: /InstaPay/ }).check();
  await expect(page.getByRole('heading', { name: 'التحويل عبر إنستاباي' })).toBeVisible();
  const request = page.waitForRequest((r) => r.url().endsWith('/api/orders/proofs'));
  await uploadScreenshot(page);
  expect((await request).postData()).toContain('instapay');
  await page.getByRole('radio', { name: /Vodafone Cash/ }).check();
  await expect(page.getByRole('img', { name: 'معاينة إيصال التحويل' })).toHaveCount(0);
  await expect(page.getByText('تم حفظ الصورة بأمان.', { exact: false })).toHaveCount(0);
});

test('unconfirmed InstaPay remains disabled without blocking Vodafone uploads', async ({
  page,
}) => {
  await setup(page);
  await configurePaymentMethods(page, false);
  await pickup(page);
  await expect(page.getByRole('radio', { name: /InstaPay/ })).toBeDisabled();
  await expect(page.getByRole('radio', { name: /Vodafone Cash/ })).toBeChecked();
  await uploadScreenshot(page);
});

test('clipboard failure offers manual copying without pretending success', async ({ page }) => {
  await setup(page);
  await configurePaymentMethods(page);
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: () => Promise.reject(new Error('denied')) },
    })
  );
  await pickup(page);
  await page.getByRole('button', { name: 'نسخ الرقم', exact: true }).click();
  await expect(page.getByText('تعذر النسخ.', { exact: false })).toBeVisible();
  await expect(page.getByRole('button', { name: 'تم نسخ الرقم', exact: true })).toHaveCount(0);
});

for (const width of [390, 1440]) {
  test(`payment selector and upload fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1800 });
    await setup(page);
    await configurePaymentMethods(page);
    await pickup(page);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
    const section = page.locator('section[aria-label="إثبات دفع العربون"]');
    await section.evaluate((element) =>
      window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 100)
    );
    await section.screenshot({ path: `qa/payment-methods-${width}.png`, animations: 'disabled' });
  });
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
      await page.setViewportSize({ width, height: 1600 });
      await page
        .locator('section[aria-label="إثبات دفع العربون"]')
        .evaluate((element) =>
          window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 100)
        );
      await page
        .locator('section[aria-label="إثبات دفع العربون"]')
        .screenshot({ path: `qa/deposit-${width}.png`, animations: 'disabled' });
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
  await expect(page.getByText('طرق التحويل غير متاحة حالياً.', { exact: false })).toBeVisible();
  await expect(page.locator('input[type=file]')).toBeVisible();
  let uploaded = false;
  await page.route('**/api/orders/proofs', (route) => {
    uploaded = true;
    return route.abort();
  });
  await page.locator('input[type=file]').setInputFiles({
    name: 'proof.png',
    mimeType: 'image/png',
    buffer: Buffer.from('local-preview-only'),
  });
  await expect(page.getByRole('button', { name: 'رفع الصورة', exact: true })).toBeDisabled();
  expect(uploaded).toBe(false);
  await expect(page.getByRole('button', { name: 'تأكيد الطلب', exact: true })).toBeDisabled();
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

test('failed configuration requests retain the upload box and show a retry action', async ({
  page,
}) => {
  await setup(page);
  await page.route('**/api/orders/payment-config', (route) =>
    route.fulfill({ status: 503, json: {} })
  );
  await pickup(page);
  await expect(page.getByRole('button', { name: 'إعادة تحميل إعدادات الدفع' })).toBeVisible();
  await expect(page.locator('input[type=file]')).toBeVisible();
});

test('missing UploadThing configuration keeps the destination and uploader visible', async ({
  page,
}) => {
  await setup(page);
  await page.route('**/api/orders/payment-config', (route) =>
    route.fulfill({
      json: {
        methods: [{ id: 'instapay', name: 'InstaPay', destination: 'isolated-fixture' }],
        maxBytes: 5242880,
        configuration: { destinationReady: true, uploadReady: false },
      },
    })
  );
  await pickup(page);
  await expect(page.getByText('isolated-fixture', { exact: true })).toBeVisible();
  await expect(page.getByText('خدمة رفع إثبات التحويل غير مهيأة', { exact: false })).toBeVisible();
  await expect(page.locator('input[type=file]')).toBeVisible();
  await fillCustomer(page);
  await expect(page.getByRole('button', { name: 'تأكيد الطلب', exact: true })).toBeDisabled();
});

test('zero-fee delivery can submit without a payment claim or destination', async ({ page }) => {
  await setup(page, 650, false);
  await page.route('**/api/shipping/methods', (route) =>
    route.fulfill({
      json: {
        methods: [
          {
            _id: 'free',
            name: 'Free test delivery',
            governorates: [{ _id: 'free-city', name: 'القاهرة', cost: 0 }],
          },
        ],
      },
    })
  );
  await page.goto('/checkout');
  await page.getByRole('button', { name: /متابعة:/ }).click();
  await page.getByRole('button', { name: /اختر المحافظة/ }).click();
  await page.getByRole('button', { name: /القاهرة/ }).click();
  await fillCustomer(page);
  await page
    .getByPlaceholder('المحافظة، المنطقة، اسم الشارع، رقم العمارة، رقم الشقة')
    .fill('عنوان الاختبار');
  await expect(page.locator('input[type=file]')).toHaveCount(0);
  const button = page.getByRole('button', { name: 'تأكيد وإرسال الطلب', exact: true });
  await expect(button).toBeEnabled();
  const request = page.waitForRequest(
    (r) => r.url().endsWith('/api/orders') && r.method() === 'POST'
  );
  await button.click();
  const payload = (await request).postDataJSON();
  expect(payload.depositAmountMinor).toBe(0);
  expect(payload.proofId).toBeNull();
});

test('failed uploads can be retried without reselecting the image', async ({ page }) => {
  await setup(page);
  let count = 0;
  await page.route('**/api/orders/proofs', (route) =>
    ++count === 1
      ? route.fulfill({ status: 503, json: { error: 'تعذر رفع إثبات التحويل' } })
      : route.fulfill({ status: 201, json: { proofId: '507f1f77bcf86cd799439019' } })
  );
  await pickup(page);
  await page.locator('input[type=file]').setInputFiles({
    name: 'proof.webp',
    mimeType: 'image/webp',
    buffer: Buffer.from('isolated-mocked-upload'),
  });
  await page.getByRole('button', { name: 'إعادة محاولة الرفع' }).click();
  await expect(page.getByText('تم حفظ الصورة بأمان.', { exact: false })).toBeVisible();
  expect(count).toBe(2);
  await expect(page.locator('section[aria-label="إثبات دفع العربون"] bdi').first()).toHaveAttribute(
    'dir',
    'ltr'
  );
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
  await page.locator('input[type=file]').setInputFiles({
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
  await expect(page.getByRole('heading', { name: 'دفع مصاريف التوصيل' })).toHaveCount(0);
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
  await page.locator('input[type=file]').setInputFiles({
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
          paymentMethod: 'INSTAPAY',
          paymentDestination: '+20 106 795 7449',
          createdAt: new Date().toISOString(),
        },
      },
    });
  });
  await page.goto('/admin/orders/AC-qa');
  await expect(page.getByText('إنستاباي', { exact: true })).toBeVisible();
  await expect(page.getByRole('main').getByText('+20 106 795 7449', { exact: true })).toBeVisible();
  const reject = page.getByRole('button', { name: 'رفض الإثبات', exact: true });
  await expect(reject).toBeDisabled();
  await page.getByRole('textbox', { name: 'سبب الرفض' }).fill('الصورة غير واضحة');
  await expect(reject).toBeEnabled();
  await reject.click();
  await expect(page.getByText('تم رفض إثبات الدفع', { exact: true })).toBeVisible();
});
