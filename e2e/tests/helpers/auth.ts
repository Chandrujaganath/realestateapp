import type { Page } from "@playwright/test"

export async function loginAs(
  page: Page,
  role: "guest" | "client" | "manager" | "admin" | "superadmin",
  email?: string,
  password?: string,
) {
  // Default test credentials
  const credentials = {
    guest: { email: "test-guest@example.com", password: "testpassword123" },
    client: { email: "test-client@example.com", password: "testpassword123" },
    manager: { email: "test-manager@example.com", password: "testpassword123" },
    admin: { email: "test-admin@example.com", password: "testpassword123" },
    superadmin: { email: "test-superadmin@example.com", password: "testpassword123" },
  }

  // Use provided credentials or defaults
  const userEmail = email || credentials[role].email
  const userPassword = password || credentials[role].password

  // Navigate to login page
  await page.goto("/login")

  // Fill in login form
  await page.fill('input[name="email"]', userEmail)
  await page.fill('input[name="password"]', userPassword)

  // Submit form
  await page.click('button[type="submit"]')

  // Wait for navigation to complete
  await page.waitForURL("**/dashboard")
}

export async function logout(page: Page) {
  // Click on user menu
  await page.click('[data-testid="user-menu"]')

  // Click logout button
  await page.click('[data-testid="logout-button"]')

  // Wait for navigation to login page
  await page.waitForURL("**/login")
}

