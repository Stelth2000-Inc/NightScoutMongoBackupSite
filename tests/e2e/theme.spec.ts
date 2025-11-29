import { test, expect } from "@playwright/test";

test.describe("Theme Toggle", () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.context().addCookies([
      {
        name: "next-auth.session-token",
        value: "mock-session-token",
        domain: "localhost",
        path: "/",
      },
    ]);
  });

  test("theme toggle is visible", async ({ page }) => {
    await page.goto("/");
    const themeToggle = page.getByText("Light").or(page.getByText("Dark")).or(page.getByText("System"));
    await expect(themeToggle.first()).toBeVisible();
  });

  test("can switch between themes", async ({ page }) => {
    await page.goto("/");
    
    const lightButton = page.getByRole("button", { name: "Light" });
    const darkButton = page.getByRole("button", { name: "Dark" });
    const systemButton = page.getByRole("button", { name: "System" });

    await expect(lightButton).toBeVisible();
    await expect(darkButton).toBeVisible();
    await expect(systemButton).toBeVisible();

    // Click dark theme
    await darkButton.click();
    await expect(darkButton).toHaveClass(/bg-slate-100/);

    // Click light theme
    await lightButton.click();
    await expect(lightButton).toHaveClass(/bg-slate-100/);
  });
});

