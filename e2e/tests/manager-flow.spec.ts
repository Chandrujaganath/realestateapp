import { test, expect } from '@playwright/test';

import { loginAs, logout } from './helpers/auth';

test.describe('Manager User Flow', () => {
  test('complete manager journey', async ({ page }) => {
    // Login as manager
    await loginAs(page, 'manager');

    // Step 1: Check tasks dashboard
    await page.click('[data-testid="my-tasks-link"]');
    await expect(page.locator('.tasks-dashboard')).toBeVisible();

    // Step 2: Handle a sell request
    await page.click('.sell-request-task:first-child');
    await page.click('[data-testid="mark-under-review"]');
    await page.fill('textarea[name="notes"]', 'Contacting client to discuss details');
    await page.click('button[type="submit"]');

    // Verify status update
    await expect(page.locator('.status-updated-confirmation')).toBeVisible();

    // Step 3: Check attendance geofencing
    await page.click('[data-testid="attendance-link"]');

    // Simulate clock-in
    await page.click('[data-testid="clock-in-button"]');

    // Mock geolocation for testing
    await page.evaluate(() => {
      const _mockGeolocation = {
        getCurrentPosition: (_success) => {
          success({
            coords: {
              latitude: 37.7749,
              longitude: -122.4194,
              accuracy: 10,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null,
            },
            timestamp: Date.now(),
          });
        },
      };
      navigator.geolocation = mockGeolocation as any;
    });

    await page.click('[data-testid="confirm-location"]');

    // Verify clock-in confirmation
    await expect(page.locator('.clock-in-confirmation')).toBeVisible();

    // Step 4: Apply for leave
    await page.click('[data-testid="leave-application-link"]');
    await page.fill(
      'input[name="startDate"]',
      new Date(Date.now() + 604800000).toISOString().split('T')[0]
    ); // Next week
    await page.fill(
      'input[name="endDate"]',
      new Date(Date.now() + 1209600000).toISOString().split('T')[0]
    ); // Two weeks from now
    await page.selectOption('select[name="leaveType"]', 'annual');
    await page.fill('textarea[name="reason"]', 'Family vacation');
    await page.click('button[type="submit"]');

    // Verify leave application confirmation
    await expect(page.locator('.leave-application-confirmation')).toBeVisible();

    // Step 5: Simulate clock-out
    await page.click('[data-testid="attendance-link"]');
    await page.click('[data-testid="clock-out-button"]');
    await page.click('[data-testid="confirm-location"]');

    // Verify clock-out confirmation
    await expect(page.locator('.clock-out-confirmation')).toBeVisible();

    // Logout
    await logout(page);

    // Step 6: Login as admin to approve leave
    await loginAs(page, 'admin');

    // Navigate to leave requests
    await page.click('[data-testid="leave-requests-link"]');

    // Approve leave request
    await page.click('[data-testid="approve-leave-request"]');
    await page.click('[data-testid="confirm-approval"]');

    // Verify approval confirmation
    await expect(page.locator('.leave-approval-confirmation')).toBeVisible();

    // Logout
    await logout(page);
  });

  test('round-robin task allocation', async ({ page }) => {
    // Login as admin to create multiple tasks
    await loginAs(page, 'admin');

    // Create multiple tasks
    for (let i = 0; i < 3; i++) {
      await page.click('[data-testid="create-task-link"]');
      await page.fill('input[name="title"]', `Test Task ${i + 1}`);
      await page.fill('textarea[name="description"]', `Description for test task ${i + 1}`);
      await page.selectOption('select[name="priority"]', 'medium');
      await page.selectOption('select[name="city"]', 'New York'); // Assuming New York has multiple managers
      await page.click('button[type="submit"]');

      // Verify task creation confirmation
      await expect(page.locator('.task-creation-confirmation')).toBeVisible();
    }

    // Logout
    await logout(page);

    // Login as different managers to check task allocation
    const _managerCredentials = [
      { email: 'manager1@example.com', password: 'testpassword123' },
      { email: 'manager2@example.com', password: 'testpassword123' },
      { email: 'manager3@example.com', password: 'testpassword123' },
    ];

    // Check each manager has received a task (round-robin allocation)
    for (const cred of managerCredentials) {
      await loginAs(page, 'manager', cred.email, cred.password);

      // Check tasks
      await page.click('[data-testid="my-tasks-link"]');

      // Verify at least one task is visible
      await expect(page.locator('.task-item')).toBeVisible();

      // Logout
      await logout(page);
    }
  });
});
