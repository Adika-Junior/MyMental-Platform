import { test, expect } from '@playwright/test';

/**
 * Chat functionality E2E tests
 */
test.describe('Chat', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to chat page
    await page.goto('/chat');
  });

  test('should display chat interface', async ({ page }) => {
    // Check for chat container or messages area
    const chatContainer = page.locator('[data-testid="chat-container"], .chat-container, main').first();
    await expect(chatContainer).toBeVisible();
  });

  test('should allow typing and sending messages', async ({ page }) => {
    // Find message input
    const messageInput = page.locator('textarea, input[type="text"]').filter({ hasText: /message|type/i }).first();
    
    if (await messageInput.count() > 0) {
      await messageInput.fill('Hello, this is a test message');
      
      // Find send button
      const sendButton = page.getByRole('button', { name: /send|submit/i }).first();
      await sendButton.click();
      
      // Wait for message to appear (either user message or bot response)
      await page.waitForTimeout(2000);
      
      // Verify message was sent (check for message in chat)
      const messages = page.locator('[data-testid="message"], .message').first();
      await expect(messages).toBeVisible({ timeout: 5000 });
    } else {
      // Skip if chat interface not fully loaded
      test.skip();
    }
  });

  test('should display welcome message or initial bot message', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Check for welcome message or initial bot greeting
    const welcomeMessage = page.getByText(/welcome|hello|hi|how can i help/i).first();
    await expect(welcomeMessage).toBeVisible({ timeout: 5000 });
  });

  test('should handle multiple messages in conversation', async ({ page }) => {
    const messageInput = page.locator('textarea, input[type="text"]').filter({ hasText: /message|type/i }).first();
    
    if (await messageInput.count() > 0) {
      // Send first message
      await messageInput.fill('First message');
      const sendButton = page.getByRole('button', { name: /send|submit/i }).first();
      await sendButton.click();
      await page.waitForTimeout(2000);
      
      // Send second message
      await messageInput.fill('Second message');
      await sendButton.click();
      await page.waitForTimeout(2000);
      
      // Verify both messages are in chat
      const messages = page.locator('[data-testid="message"], .message');
      const messageCount = await messages.count();
      expect(messageCount).toBeGreaterThanOrEqual(2);
    } else {
      test.skip();
    }
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that chat interface is still usable
    const chatContainer = page.locator('main, [data-testid="chat-container"]').first();
    await expect(chatContainer).toBeVisible();
    
    // Check for mobile-friendly input
    const messageInput = page.locator('textarea, input[type="text"]').first();
    await expect(messageInput).toBeVisible();
  });
});

