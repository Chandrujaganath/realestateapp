import { test, expect } from "@playwright/test"
import { loginAs, logout } from "./helpers/auth"

test.describe("Admin User Flow", () => {
  test("complete admin journey", async ({ page }) => {
    // Login as admin
    await loginAs(page, "admin")

    // Step 1: Create a new project from template
    await page.click('[data-testid="create-project-link"]')
    await page.fill('input[name="projectName"]', `Test Project ${Date.now()}`)
    await page.fill('input[name="location"]', "Test Location")
    await page.selectOption('select[name="template"]', "residential")
    await page.fill('input[name="totalArea"]', "10000")
    await page.click('button[type="submit"]')

    // Verify project creation confirmation
    await expect(page.locator(".project-creation-confirmation")).toBeVisible()

    // Step 2: Edit plot layout
    await page.click('[data-testid="projects-link"]')
    await page.click('.project-card:first-child [data-testid="edit-project"]')
    await page.click('[data-testid="edit-layout"]')

    // Simulate plot editing (this would be more complex in a real test)
    await page.click('[data-testid="add-road"]')
    await page.click("canvas", { position: { x: 100, y: 100 } })
    await page.click("canvas", { position: { x: 200, y: 200 } })
    await page.click('[data-testid="save-road"]')

    // Save layout changes
    await page.click('[data-testid="save-layout"]')

    // Verify layout saved confirmation
    await expect(page.locator(".layout-saved-confirmation")).toBeVisible()

    // Step 3: Check visit requests
    await page.click('[data-testid="visit-requests-link"]')

    // If there are pending requests, approve one
    const hasPendingRequests = (await page.locator(".pending-visit-request").count()) > 0
    if (hasPendingRequests) {
      await page.click('.pending-visit-request:first-child [data-testid="approve-visit"]')
      await page.click('[data-testid="confirm-approval"]')

      // Verify approval confirmation
      await expect(page.locator(".approval-confirmation")).toBeVisible()
    }

    // Step 4: Manage managers
    await page.click('[data-testid="managers-link"]')

    // Check attendance records
    await page.click('[data-testid="attendance-records"]')
    await expect(page.locator(".attendance-table")).toBeVisible()

    // Check leave requests
    await page.click('[data-testid="leave-requests"]')

    // If there are pending leave requests, approve one
    const hasPendingLeave = (await page.locator(".pending-leave-request").count()) > 0
    if (hasPendingLeave) {
      await page.click('.pending-leave-request:first-child [data-testid="approve-leave"]')
      await page.click('[data-testid="confirm-approval"]')

      // Verify approval confirmation
      await expect(page.locator(".leave-approval-confirmation")).toBeVisible()
    }

    // Step 5: Create announcement
    await page.click('[data-testid="announcements-link"]')
    await page.click('[data-testid="create-announcement"]')
    await page.fill('input[name="title"]', "Important Announcement")
    await page.fill('textarea[name="content"]', "This is an important announcement for all users.")
    await page.selectOption('select[name="audience"]', "all")
    await page.click('button[type="submit"]')

    // Verify announcement creation confirmation
    await expect(page.locator(".announcement-creation-confirmation")).toBeVisible()

    // Logout
    await logout(page)
  })

  test("security and role guards", async ({ page }) => {
    // Login as manager
    await loginAs(page, "manager")

    // Try to access admin-only page
    await page.goto("/admin/projects/create")

    // Verify redirect or access denied
    await expect(page).toHaveURL("/dashboard")
    await expect(page.locator(".access-denied-message")).toBeVisible()

    // Logout
    await logout(page)

    // Login as guest
    await loginAs(page, "guest")

    // Try to access manager-only page
    await page.goto("/manager/tasks")

    // Verify redirect or access denied
    await expect(page).toHaveURL("/dashboard")
    await expect(page.locator(".access-denied-message")).toBeVisible()

    // Logout
    await logout(page)
  })
})

