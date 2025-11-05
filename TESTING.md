# Testing Guide

This document describes the testing strategy and how to run tests for the MyMental Platform.

## Test Types

### 1. E2E Tests (Frontend)

End-to-end tests using Playwright to test the full user journey.

**Setup:**
```bash
cd frontend
npm install
npx playwright install
```

**Run tests:**
```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed
```

**Test files:**
- `e2e/auth.spec.ts` - Authentication flows
- `e2e/chat.spec.ts` - Chat functionality
- `e2e/navigation.spec.ts` - Navigation and routing

**Test credentials:**
Set environment variables for authenticated tests:
```bash
export TEST_USER_EMAIL=test@example.com
export TEST_USER_PASSWORD=testpass123
```

### 2. Backend API Tests

Integration tests for Django REST API endpoints.

**Run tests:**
```bash
cd backend
source venv/bin/activate
pytest
pytest tests/ -v
pytest tests/test_chatbot_api.py -v
```

**Test coverage:**
```bash
pytest --cov=chatbot --cov=users --cov-report=html
```

### 3. Load Tests

Performance and load testing using Locust.

**Setup:**
```bash
cd backend
pip install locust
```

**Run load tests:**
```bash
# Start backend server first
python manage.py runserver

# In another terminal, run Locust
locust -f tests/load_test.py --host=http://localhost:8000

# Open http://localhost:8089 in browser
```

**Load test scenarios:**
- API User: Authenticated user behavior
- Public User: Unauthenticated user behavior

### 4. Mobile Smoke Tests

Basic smoke tests for mobile app build and functionality.

**Run smoke tests:**
```bash
cd mobile
./tests/smoke-test.sh
```

**What it tests:**
- App can build successfully
- Critical files exist
- Dependencies are installed
- App can start

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd frontend && npm install && npx playwright install
      - run: cd frontend && npm run test:e2e
  
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
      - run: cd backend && pip install -r requirements.txt
      - run: cd backend && pytest
```

## Test Coverage Goals

- **E2E Tests**: 80%+ of critical user flows
- **API Tests**: 90%+ of API endpoints
- **Load Tests**: All critical endpoints under load
- **Mobile Tests**: Basic functionality verification

## Writing New Tests

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('should do something', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: /click me/i })).toBeVisible();
});
```

### Backend Test Example

```python
from django.test import TestCase
from rest_framework.test import APIClient

class MyTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
    
    def test_endpoint(self):
        response = self.client.get('/api/endpoint/')
        self.assertEqual(response.status_code, 200)
```

## Troubleshooting

### E2E Tests Fail
- Ensure backend is running: `cd backend && python manage.py runserver`
- Check test credentials in environment variables
- Verify Playwright browsers are installed: `npx playwright install`

### Load Tests Not Starting
- Ensure backend is accessible
- Check Locust installation: `pip install locust`
- Verify test user exists in database

### Mobile Tests Fail
- Ensure Expo CLI is installed: `npm install -g expo-cli`
- Check Node.js version (18+)
- Verify all dependencies: `npm install`

