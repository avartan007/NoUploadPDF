const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('NoUploadPDF — 28 Tools, Local AI, Auto-Redact & Zero-Upload Guarantee', () => {
  const fileUrl = 'file://' + path.resolve(__dirname, '../index.html');

  test('renders all 28 PDF tools immediately without vanishing', async ({ page }) => {
    await page.goto(fileUrl);
    const cards = page.locator('#mainToolsGrid .tool-card');
    await expect(cards).toHaveCount(28);
    await expect(page.locator('#headerBytesCounter')).toContainText('0 bytes stored');
  });

  test('opens Local AI, Auto-Redact, and Document Detective Power Suite', async ({ page }) => {
    await page.goto(fileUrl);
    await page.click('#openPowerSuiteBtn');
    await expect(page.locator('#powerSuiteModal')).toBeVisible();
  });

  test('runs in-browser unit test suite with 0 failures', async ({ page }) => {
    await page.goto(fileUrl);
    const result = await page.evaluate(async () => {
      return await window.runUnitTestSuite();
    });
    expect(result.failed).toBe(0);
    expect(result.passed).toBeGreaterThanOrEqual(8);
  });
});
