import { test, expect } from "@playwright/test"
import { loginAs, logout } from "./helpers/auth"

test.describe("Complete System Test", () => {
  test("end-to-end workflow across all roles", async ({ page, browser }) => {
    // Step 1: Super Admin creates a new admin
    await loginAs(page, "superadmin")

    await page.click('[data-testid="admin-management-link"]')
    await page.click('[data-testid="create-admin"]')

    const adminEmail = `admin-${Date.now()}@example.com`
    await page.fill('input[name="name"]', "Test Admin")
    await page.fill('input[name="email"]', adminEmail)
    await page.fill('input[name="password"]', "testpassword123")
    await page.selectOption('select[name="region"]', "North")
    await page.click('button[type="submit"]')

    // Verify admin creation
    await expect(page.locator(".admin-creation-confirmation")).toBeVisible()

    // Logout
    await logout(page)

    // Step 2: New Admin creates a project
    await loginAs(page, "admin", adminEmail, "testpassword123")

    await page.click('[data-testid="create-project-link"]')

    const projectName = `Test Project ${Date.now()}`
    await page.fill('input[name="projectName"]', projectName)
    await page.fill('input[name="location"]', "Test Location")
    await page.selectOption('select[name="template"]', "residential")
    await page.fill('input[name="totalArea"]', "10000")
    await page.click('button[type="submit"]')

    // Verify project creation
    await expect(page.locator(".project-creation-confirmation")).toBeVisible()

    // Logout
    await logout(page)

    // Step 3: Guest registers and books a visit
    const guestContext = await browser.newContext()
    const guestPage = await guestContext.newPage()

    await guestPage.goto("/register")

    const guestEmail = `guest-${Date.now()}@example.com`
    await guestPage.fill('input[name="name"]', "Test Guest")
    await guestPage.fill('input[name="email"]', guestEmail)
    await guestPage.fill('input[name="password"]', "testpassword123")
    await guestPage.fill('input[name="confirmPassword"]', "testpassword123")
    await guestPage.selectOption('select[name="role"]', "guest")
    await guestPage.click('button[type="submit"]')

    // Wait for registration to complete
    await guestPage.waitForURL("**/dashboard")

    // Browse projects
    await guestPage.click('[data-testid="projects-link"]')

    // Search for the new project
    await guestPage.fill('input[data-testid="search-projects"]', projectName)
    await guestPage.click(`.project-card:has-text("${projectName}")`)

    // Book a visit
    await guestPage.click('[data-testid="book-visit-button"]')
    await guestPage.fill('input[name="visitDate"]', new Date(Date.now() + 86400000).toISOString().split("T")[0]) // Tomorrow
    await guestPage.fill('textarea[name="purpose"]', "Interested in purchasing a plot")
    await guestPage.click('button[type="submit"]')

    // Verify booking confirmation
    await expect(guestPage.locator(".booking-confirmation")).toBeVisible()

    // Logout
    await guestPage.click('[data-testid="user-menu"]')
    await guestPage.click('[data-testid="logout-button"]')
    await guestPage.waitForURL("**/login")

    // Step 4: Admin approves the visit
    await loginAs(page, "admin", adminEmail, "testpassword123")

    await page.click('[data-testid="visit-requests-link"]')

    // Search for the guest's visit request
    await page.fill('input[data-testid="search-visits"]', guestEmail)
    await page.click(`[data-testid="approve-visit-${guestEmail}"]`)
    await page.click('[data-testid="confirm-approval"]')

    // Verify approval confirmation
    await expect(page.locator(".approval-confirmation")).toBeVisible()

    // Logout
    await logout(page)

    // Step 5: Guest checks QR code
    await guestPage.goto("/login")
    await guestPage.fill('input[name="email"]', guestEmail)
    await guestPage.fill('input[name="password"]', "testpassword123")
    await guestPage.click('button[type="submit"]')

    // Navigate to my visits
    await guestPage.click('[data-testid="my-visits-link"]')

    // Verify QR code is visible
    await expect(guestPage.locator(".qr-code-image")).toBeVisible()

    // Step 6: Manager scans QR code (entry)
    const managerContext = await browser.newContext()
    const managerPage = await managerContext.newPage()

    await managerPage.goto("/login")
    await managerPage.fill('input[name="email"]', "test-manager@example.com")
    await managerPage.fill('input[name="password"]', "testpassword123")
    await managerPage.click('button[type="submit"]')

    // Navigate to QR scanner
    await managerPage.click('[data-testid="qr-scanner-link"]')

    // Simulate QR code scan
    // In a real test, we would need to extract the QR code data from the guest page
    // and pass it to the manager page. For this test, we'll use a mock.
    await managerPage.evaluate((guestEmail) => {
      // Mock function to simulate scanning the QR code
      window.dispatchEvent(
        new CustomEvent("qr-scanned", {
          detail: {
            visitId: `visit-${guestEmail}`,
            guestEmail,
            type: "entry",
          },
        }),
      )
    }, guestEmail)

    // Verify entry confirmation
    await expect(managerPage.locator(".entry-confirmation")).toBeVisible()

    // Step 7: Guest provides feedback
    await guestPage.click('[data-testid="provide-feedback"]')
    await guestPage.fill('textarea[name="feedback"]', "Great experience visiting the property!")
    await guestPage.selectOption('select[name="rating"]', "5")
    await guestPage.click('button[type="submit"]')

    // Verify feedback confirmation
    await expect(guestPage.locator(".feedback-confirmation")).toBeVisible()

    // Step 8: Manager scans QR code (exit)
    await managerPage.evaluate((guestEmail) => {
      // Mock function to simulate scanning the QR code
      window.dispatchEvent(
        new CustomEvent("qr-scanned", {
          detail: {
            visitId: `visit-${guestEmail}`,
            guestEmail,
            type: "exit",
          },
        }),
      )
    }, guestEmail)

    // Verify exit confirmation
    await expect(managerPage.locator(".exit-confirmation")).toBeVisible()

    // Step 9: Admin checks visit logs
    await loginAs(page, "admin", adminEmail, "testpassword123")

    await page.click('[data-testid="visit-logs-link"]')

    // Search for the guest's visit log
    await page.fill('input[data-testid="search-visit-logs"]', guestEmail)

    // Verify entry and exit times are recorded
    await expect(page.locator(".entry-time")).toBeVisible()
    await expect(page.locator(".exit-time")).toBeVisible()

    // Step 10: Super Admin checks audit logs
    await logout(page)
    await loginAs(page, "superadmin")

    await page.click('[data-testid="audit-logs-link"]')

    // Filter logs for the test admin
    await page.fill('input[data-testid="search-audit-logs"]', adminEmail)

    // Verify admin actions are logged
    await expect(page.locator(".audit-log-item")).toBeVisible()

    // Clean up - close all contexts
    await guestContext.close()
    await managerContext.close()
  })
})

