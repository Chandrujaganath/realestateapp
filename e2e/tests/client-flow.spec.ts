import { test, expect } from "@playwright/test"
import { loginAs, logout } from "./helpers/auth"

test.describe("Client User Flow", () => {
  test("complete client journey", async ({ page }) => {
    // Login as client
    await loginAs(page, "client")

    // Step 1: View owned plots
    await page.click('[data-testid="my-plots-link"]')
    await expect(page.locator(".plot-list")).toBeVisible()

    // Step 2: View permanent QR code
    await page.click('[data-testid="view-qr-code"]')
    await expect(page.locator(".permanent-qr-code")).toBeVisible()

    // Step 3: Check live CCTV
    await page.click('[data-testid="live-cctv-link"]')
    await expect(page.locator(".cctv-feed")).toBeVisible()

    // Step 4: Generate temporary visitor QR
    await page.click('[data-testid="generate-visitor-qr"]')
    await page.fill('input[name="visitorName"]', "John Doe")
    await page.fill('input[name="visitorEmail"]', "john.doe@example.com")
    await page.fill('input[name="validUntil"]', new Date(Date.now() + 86400000).toISOString().split("T")[0]) // Tomorrow
    await page.click('button[type="submit"]')

    // Verify temporary QR code generation
    await expect(page.locator(".temporary-qr-code")).toBeVisible()

    // Step 5: Initiate a sell request
    await page.click('[data-testid="sell-request-link"]')
    await page.click('.plot-card:first-child [data-testid="sell-plot-button"]')
    await page.fill('input[name="askingPrice"]', "500000")
    await page.fill('textarea[name="description"]', "Selling my plot due to relocation")
    await page.click('button[type="submit"]')

    // Verify sell request confirmation
    await expect(page.locator(".sell-request-confirmation")).toBeVisible()

    // Step 6: Book a new plot visit
    await page.click('[data-testid="projects-link"]')
    await page.click(".project-card:first-child")
    await page.click('[data-testid="book-visit-button"]')
    await page.fill('input[name="visitDate"]', new Date(Date.now() + 86400000).toISOString().split("T")[0]) // Tomorrow
    await page.fill('textarea[name="purpose"]', "Interested in purchasing another plot")
    await page.click('button[type="submit"]')

    // Verify booking confirmation
    await expect(page.locator(".booking-confirmation")).toBeVisible()

    // Logout
    await logout(page)

    // Step 7: Login as manager to check the sell request
    await loginAs(page, "manager")

    // Check tasks and sell requests
    await page.click('[data-testid="my-tasks-link"]')
    await expect(page.locator(".sell-request-task")).toBeVisible()

    // Mark sell request as under review
    await page.click('[data-testid="review-sell-request"]')
    await page.click('[data-testid="mark-under-review"]')

    // Verify status update
    await expect(page.locator(".status-under-review")).toBeVisible()

    // Logout
    await logout(page)
  })
})

