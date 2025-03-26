import { test, expect } from '@playwright/test';

import { loginAs, logout } from './helpers/auth';

test.describe('Cross-Role Interactions', () => {
  test('plot sale workflow across roles', async ({ page }) => {
    // Step 1: Client initiates sell request
    await loginAs(page, 'client');

    await page.click('[data-testid="my-plots-link"]');
    await page.click('.plot-card:first-child [data-testid="sell-plot-button"]');

    const plotTitle = await page.locator('.plot-card:first-child .plot-title').textContent();

    await page.fill('input[name="askingPrice"]', '500000');
    await page.fill('textarea[name="description"]', 'Selling my plot due to relocation');
    await page.click('button[type="submit"]');

    // Verify sell request confirmation
    await expect(page.locator('.sell-request-confirmation')).toBeVisible();

    // Logout
    await logout(page);

    // Step 2: Manager processes the sell request
    await loginAs(page, 'manager');

    await page.click('[data-testid="my-tasks-link"]');

    // Find the sell request task
    await page.fill('input[data-testid="search-tasks"]', plotTitle || '');
    await page.click('.task-item:first-child');

    // Mark as under review
    await page.click('[data-testid="mark-under-review"]');
    await page.fill('textarea[name="notes"]', 'Contacting potential buyers');
    await page.click('button[type="submit"]');

    // Verify status update
    await expect(page.locator('.status-updated-confirmation')).toBeVisible();

    // Mark as completed
    await page.click('[data-testid="mark-completed"]');
    await page.fill('textarea[name="notes"]', 'Found a buyer, paperwork completed');
    await page.fill('input[name="salePrice"]', '490000');
    await page.click('button[type="submit"]');

    // Verify completion confirmation
    await expect(page.locator('.task-completed-confirmation')).toBeVisible();

    // Logout
    await logout(page);

    // Step 3: Admin confirms the final sale
    await loginAs(page, 'admin');

    await page.click('[data-testid="sell-requests-link"]');

    // Find the completed sell request
    await page.fill('input[data-testid="search-sell-requests"]', plotTitle || '');
    await page.click('.sell-request-item:first-child');

    // Confirm final sale
    await page.click('[data-testid="confirm-sale"]');
    await page.fill('textarea[name="notes"]', 'All paperwork verified, sale confirmed');
    await page.click('button[type="submit"]');

    // Verify sale confirmation
    await expect(page.locator('.sale-confirmation')).toBeVisible();

    // Logout
    await logout(page);

    // Step 4: Client verifies the sale is complete
    await loginAs(page, 'client');

    await page.click('[data-testid="my-sell-requests-link"]');

    // Verify sell request status is "sold"
    await expect(page.locator('.sell-request-status')).toHaveText('Sold');

    // Logout
    await logout(page);
  });
});
