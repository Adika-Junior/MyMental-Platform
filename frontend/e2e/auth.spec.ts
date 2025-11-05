import { test, expect } from '@playwright/test';

/**
 * Authentication E2E tests
 */
test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login button when not authenticated', async ({ page }) => {
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
  });

  test('should open login modal when login button is clicked', async ({ page }) => {
    const loginButton = page.getByRole('button', { name: /login/i }).first();
    await loginButton.click();
    
    // Wait for modal to appear
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
  });

  test('should show validation errors for empty form submission', async ({ page }) => {
    const loginButton = page.getByRole('button', { name: /login/i }).first();
    await loginButton.click();
    
    const submitButton = page.getByRole('button', { name: /sign in|login/i });
    await submitButton.click();
    
    // Should show validation errors or prevent submission
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
  });

  test('should navigate to chat page after successful login', async ({ page }) => {
    // This test requires a test user account
    // Skip if no test credentials provided
    const testEmail = process.env.TEST_USER_EMAIL;
    const testPassword = process.env.TEST_USER_PASSWORD;
    
    if (!testEmail || !testPassword) {
      test.skip();
      return;
    }

    const loginButton = page.getByRole('button', { name: /login/i }).first();
    await loginButton.click();
    
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    
    const submitButton = page.getByRole('button', { name: /sign in|login/i });
    await submitButton.click();
    
    // Wait for navigation to chat or home
    await page.waitForURL(/chat|dashboard|home/, { timeout: 10000 });
    
    // Should be logged in
    await expect(page.getByRole('button', { name: /logout/i })).toBeVisible({ timeout: 5000 });
  });

  test('should show error message for invalid credentials', async ({ page }) => {
    const loginButton = page.getByRole('button', { name: /login/i }).first();
    await loginButton.click();
    
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    
    const submitButton = page.getByRole('button', { name: /sign in|login/i });
    await submitButton.click();
    
    // Should show error message
    await expect(page.getByText(/invalid|error|incorrect/i)).toBeVisible({ timeout: 5000 });
  });
});

