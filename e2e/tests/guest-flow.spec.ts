import { test, expect } from "@playwright/test"
import { loginAs, logout } from "./helpers/auth"

test.describe("Guest User Flow", () => {
  test("complete guest journey", async ({ page }) => {
    // Step 1: Register as a new guest
    await page.goto("/register")

    const uniqueEmail = `guest-${Date.now()}@example.com`
    await page.fill('input[name="name"]', "Test Guest")
    await page.fill('input[name="email"]', uniqueEmail)
    await page.fill('input[name="password"]', "testpassword123")
    await page.fill('input[name="confirmPassword"]', "testpassword123")
    await page.selectOption('select[name="role"]', "guest")
    await page.click('button[type="submit"]')

    // Wait for registration to complete and redirect to dashboard
    await page.waitForURL("**/dashboard")

    // Step 2: Browse projects
    await page.click('[data-testid="projects-link"]')
    await page.waitForURL("**/projects")

    // Step 3: Select a project
    await page.click(".project-card:first-child")

    // Step 4: Book a visit
    await page.click('[data-testid="book-visit-button"]')
    await page.fill('input[name="visitDate"]', new Date(Date.now() + 86400000).toISOString().split("T")[0]) // Tomorrow
    await page.fill('textarea[name="purpose"]', "Interested in purchasing a plot")
    await page.click('button[type="submit"]')

    // Verify booking confirmation
    await expect(page.locator(".booking-confirmation")).toBeVisible()

    // Step 5: Logout
    await logout(page)

    // Step 6: Login as admin to approve the visit
    await loginAs(page, "admin")

    // Navigate to visit requests
    await page.click('[data-testid="visit-requests-link"]')

    // Find and approve the visit request
    await page.fill('input[data-testid="search-visits"]', uniqueEmail)
    await page.click(`[data-testid="approve-visit-${uniqueEmail}"]`)
    await page.click('[data-testid="confirm-approval"]')

    // Verify approval confirmation
    await expect(page.locator(".approval-confirmation")).toBeVisible()

    // Logout as admin
    await logout(page)

    // Step 7: Login as guest again to check QR code
    await loginAs(page, "guest", uniqueEmail, "testpassword123")

    // Navigate to my visits
    await page.click('[data-testid="my-visits-link"]')

    // Verify QR code is visible
    await expect(page.locator(".qr-code-image")).toBeVisible()

    // Step 8: Simulate QR code scan (entry)
    await page.click('[data-testid="simulate-entry-scan"]')
    await expect(page.locator(".entry-confirmation")).toBeVisible()

    // Step 9: Provide feedback
    await page.click('[data-testid="provide-feedback"]')
    await page.fill('textarea[name="feedback"]', "Great experience visiting the property!")
    await page.selectOption('select[name="rating"]', "5")
    await page.click('button[type="submit"]')

    // Verify feedback confirmation
    await expect(page.locator(".feedback-confirmation")).toBeVisible()

    // Step 10: Simulate QR code scan (exit)
    await page.click('[data-testid="simulate-exit-scan"]')
    await expect(page.locator(".exit-confirmation")).toBeVisible()

    // Logout
    await logout(page)
  })

  test("guest account deactivation after visit", async ({ page }) => {
    // Create a guest with a past visit date
    await page.goto("/register")

    const uniqueEmail = `past-guest-${Date.now()}@example.com`
    await page.fill('input[name="name"]', "Past Guest")
    await page.fill('input[name="email"]', uniqueEmail)
    await page.fill('input[name="password"]', "testpassword123")
    await page.fill('input[name="confirmPassword"]', "testpassword123")
    await page.selectOption('select[name="role"]', "guest")
    await page.click('button[type="submit"]')

    // Wait for registration to complete
    await page.waitForURL("**/dashboard")

    // Login as admin to create and approve a visit with past date
    await logout(page)
    await loginAs(page, "admin")

    // Create a visit for the guest with a past date
    await page.click('[data-testid="create-visit-link"]')
    await page.fill('input[name="email"]', uniqueEmail)
    await page.fill('input[name="visitDate"]', new Date(Date.now() - 86400000).toISOString().split("T")[0]) // Yesterday
    await page.fill('textarea[name="purpose"]', "Test past visit")
    await page.click('button[type="submit"]')

    // Approve the visit
    await page.click('[data-testid="visit-requests-link"]')
    await page.fill('input[data-testid="search-visits"]', uniqueEmail)
    await page.click(`[data-testid="approve-visit-${uniqueEmail}"]`)
    await page.click('[data-testid="confirm-approval"]')

    // Trigger the scheduled function manually for testing
    await page.click('[data-testid="run-scheduled-functions"]')
    await page.click('[data-testid="run-deactivation-function"]')

    // Logout as admin
    await logout(page)

    // Try to login as the deactivated guest
    await page.goto("/login")
    await page.fill('input[name="email"]', uniqueEmail)
    await page.fill('input[name="password"]', "testpassword123")
    await page.click('button[type="submit"]')

    // Verify account deactivation message
    await expect(page.locator(".account-deactivated")).toBeVisible()
  })
})

