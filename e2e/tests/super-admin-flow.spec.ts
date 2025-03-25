import { test, expect } from "@playwright/test"
import { loginAs, logout } from "./helpers/auth"

test.describe("Super Admin User Flow", () => {
  test("complete super admin journey", async ({ page }) => {
    // Login as super admin
    await loginAs(page, "superadmin")

    // Step 1: Create a new admin
    await page.click('[data-testid="admin-management-link"]')
    await page.click('[data-testid="create-admin"]')

    const uniqueEmail = `admin-${Date.now()}@example.com`
    await page.fill('input[name="name"]', "Test Admin")
    await page.fill('input[name="email"]', uniqueEmail)
    await page.fill('input[name="password"]', "testpassword123")
    await page.selectOption('select[name="region"]', "North")
    await page.click('button[type="submit"]')

    // Verify admin creation confirmation
    await expect(page.locator(".admin-creation-confirmation")).toBeVisible()

    // Step 2: Modify global templates
    await page.click('[data-testid="templates-link"]')
    await page.click('.template-card:first-child [data-testid="edit-template"]')

    await page.fill('input[name="templateName"]', "Updated Template Name")
    await page.fill('textarea[name="description"]', "Updated template description")
    await page.click('button[type="submit"]')

    // Verify template update confirmation
    await expect(page.locator(".template-update-confirmation")).toBeVisible()

    // Step 3: Set system settings
    await page.click('[data-testid="system-settings-link"]')

    // Toggle maintenance mode
    await page.click('[data-testid="maintenance-mode-toggle"]')
    await page.click('[data-testid="confirm-maintenance-mode"]')

    // Verify settings update confirmation
    await expect(page.locator(".settings-update-confirmation")).toBeVisible()

    // Turn off maintenance mode for other tests
    await page.click('[data-testid="maintenance-mode-toggle"]')
    await page.click('[data-testid="confirm-maintenance-mode"]')

    // Step 4: View audit logs
    await page.click('[data-testid="audit-logs-link"]')
    await expect(page.locator(".audit-logs-table")).toBeVisible()

    // Filter logs by admin actions
    await page.selectOption('select[data-testid="log-filter"]', "admin")
    await expect(page.locator(".filtered-logs")).toBeVisible()

    // Step 5: Post global announcement
    await page.click('[data-testid="global-announcements-link"]')
    await page.click('[data-testid="create-global-announcement"]')

    await page.fill('input[name="title"]', "System-Wide Announcement")
    await page.fill('textarea[name="content"]', "This is a system-wide announcement for all users.")
    await page.click('button[type="submit"]')

    // Verify announcement creation confirmation
    await expect(page.locator(".announcement-creation-confirmation")).toBeVisible()

    // Logout
    await logout(page)

    // Verify announcement is visible to other users
    await loginAs(page, "client")
    await expect(page.locator(".global-announcement")).toBeVisible()
    await expect(page.locator(".global-announcement-title")).toHaveText("System-Wide Announcement")

    // Logout
    await logout(page)
  })
})

