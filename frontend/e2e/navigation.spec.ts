import { test, expect } from '@playwright/test';

/**
 * Navigation E2E tests
 */
test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to home page', async ({ page }) => {
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { name: /mymental/i })).toBeVisible();
  });

  test('should navigate to about page', async ({ page }) => {
    const aboutLink = page.getByRole('link', { name: /about/i }).first();
    await aboutLink.click();
    await expect(page).toHaveURL(/\/about/);
  });

  test('should navigate to services pages', async ({ page }) => {
    // Test depression service page
    const servicesLink = page.getByRole('link', { name: /services|depression/i }).first();
    await servicesLink.click();
    
    // Should navigate to a service page
    await page.waitForURL(/\/services/, { timeout: 5000 });
    await expect(page.getByRole('heading', { name: /depression|addiction|career|relationship|financial/i })).toBeVisible();
  });

  test('should navigate to chat page', async ({ page }) => {
    const chatLink = page.getByRole('link', { name: /chat|chatbot/i }).first();
    await chatLink.click();
    await expect(page).toHaveURL(/\/chat/);
  });

  test('should have working footer links', async ({ page }) => {
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Check footer links
    const footerHomeLink = page.getByRole('link', { name: /home/i }).filter({ hasText: /home/i }).first();
    if (await footerHomeLink.count() > 0) {
      await footerHomeLink.click();
      await expect(page).toHaveURL(/\/$/);
    }
  });

  test('should have accessible skip link', async ({ page }) => {
    // Check for skip link (accessibility feature)
    const skipLink = page.getByRole('link', { name: /skip to main content/i });
    if (await skipLink.count() > 0) {
      await expect(skipLink).toBeVisible();
      await skipLink.click();
      // Should focus main content
      await expect(page.locator('#main-content, main')).toBeFocused();
    }
  });
});

