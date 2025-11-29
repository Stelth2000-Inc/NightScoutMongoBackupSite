# Testing Guide

This project uses two testing frameworks:

## Unit Tests (Vitest + React Testing Library)

Unit tests are located in `tests/unit/` and test individual components, pages, and API routes.

### Running Unit Tests

```bash
# Run all unit tests
bun test

# Run tests in watch mode
bun test --watch

# Run tests with UI
bun test:ui

# Run tests with coverage
bun test:coverage
```

### Test Structure

- `tests/unit/components/` - Component tests
- `tests/unit/pages/` - Page component tests
- `tests/unit/api/` - API route tests
- `tests/utils/` - Test utilities and mocks

## End-to-End Tests (Playwright)

E2E tests are located in `tests/e2e/` and test full user flows.

### Running E2E Tests

```bash
# Run all E2E tests
bun test:e2e

# Run E2E tests with UI
bun test:e2e:ui
```

### E2E Test Structure

- `tests/e2e/auth.spec.ts` - Authentication flow tests
- `tests/e2e/dashboard.spec.ts` - Dashboard functionality tests
- `tests/e2e/theme.spec.ts` - Theme toggle tests

## Test Utilities

### `tests/utils/test-utils.tsx`

Provides a custom `render` function that wraps components with all necessary providers (NextAuth, ThemeProvider, etc.).

### `tests/utils/mocks.ts`

Contains mocks for Next.js modules like `next-auth/react`, `next/navigation`, and `next-themes`.

## Writing New Tests

### Component Test Example

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "../../utils/test-utils";
import { MyComponent } from "@/components/my-component";

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
```

### API Route Test Example

```ts
import { describe, it, expect, vi } from "vitest";
import { GET } from "@/app/api/my-route/route";

describe("GET /api/my-route", () => {
  it("returns data", async () => {
    const response = await GET();
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toHaveProperty("key");
  });
});
```

### E2E Test Example

```ts
import { test, expect } from "@playwright/test";

test("user can perform action", async ({ page }) => {
  await page.goto("/");
  await page.click("button");
  await expect(page.getByText("Success")).toBeVisible();
});
```

