import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication by setting a session cookie
    await page.context().addCookies([
      {
        name: "next-auth.session-token",
        value: "mock-session-token",
        domain: "localhost",
        path: "/",
      },
    ]);

    // Mock API responses
    await page.route("**/api/backups/list", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          files: [
            {
              key: "backups/dexcom_20250101.tar.gz",
              lastModified: "2025-01-01T00:00:00Z",
              size: 1048576,
            },
          ],
        }),
      });
    });
  });

  test("displays dashboard when authenticated", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Nightscout Backup Dashboard")).toBeVisible();
  });

  test("displays backup files table", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("S3 Backup Files")).toBeVisible();
    await expect(page.getByText("dexcom_20250101.tar.gz")).toBeVisible();
  });

  test("refresh button loads backups", async ({ page }) => {
    await page.goto("/");
    
    let requestCount = 0;
    await page.route("**/api/backups/list", async (route) => {
      requestCount++;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ files: [] }),
      });
    });

    const refreshButton = page.getByRole("button", { name: /refresh/i });
    await refreshButton.click();

    await expect(page.getByText(/no backups found yet/i)).toBeVisible();
    expect(requestCount).toBeGreaterThan(0);
  });

  test("create backup button triggers backup", async ({ page }) => {
    await page.goto("/");

    let backupRequested = false;
    await page.route("**/api/backups/create", async (route) => {
      backupRequested = true;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "Backup triggered." }),
      });
    });

    const createButton = page.getByRole("button", { name: /create backup/i });
    await createButton.click();

    await expect(page.getByText(/backup triggered/i)).toBeVisible();
    expect(backupRequested).toBe(true);
  });

  test.describe("Delete Backup", () => {
    test("displays delete button for each backup file", async ({ page }) => {
      await page.goto("/");
      
      // Wait for the file to be displayed
      await expect(page.getByText("dexcom_20250101.tar.gz")).toBeVisible();
      
      // Find delete buttons in the table
      const deleteButtons = page.getByRole("button", { name: /delete/i });
      await expect(deleteButtons).toBeVisible();
    });

    test("shows confirmation dialog when delete button is clicked", async ({ page }) => {
      await page.goto("/");
      
      await expect(page.getByText("dexcom_20250101.tar.gz")).toBeVisible();
      
      const deleteButton = page.getByRole("button", { name: /delete/i }).first();
      await deleteButton.click();
      
      // Wait for confirmation dialog
      await expect(page.getByText("Confirm Delete")).toBeVisible();
      await expect(page.getByText(/are you sure you want to delete/i)).toBeVisible();
      await expect(page.getByText("dexcom_20250101.tar.gz")).toBeVisible();
      await expect(page.getByText(/this action cannot be undone/i)).toBeVisible();
    });

    test("closes confirmation dialog when cancel is clicked", async ({ page }) => {
      await page.goto("/");
      
      await expect(page.getByText("dexcom_20250101.tar.gz")).toBeVisible();
      
      const deleteButton = page.getByRole("button", { name: /delete/i }).first();
      await deleteButton.click();
      
      // Wait for confirmation dialog
      await expect(page.getByText("Confirm Delete")).toBeVisible();
      
      // Click cancel
      const cancelButton = page.getByRole("button", { name: /cancel/i });
      await cancelButton.click();
      
      // Dialog should be gone
      await expect(page.getByText("Confirm Delete")).not.toBeVisible();
      
      // File should still be in the table
      await expect(page.getByText("dexcom_20250101.tar.gz")).toBeVisible();
    });

    test("successfully deletes backup when confirmed", async ({ page }) => {
      await page.goto("/");
      
      // Mock the delete API response
      let deleteRequested = false;
      await page.route("**/api/backups/delete?*", async (route) => {
        deleteRequested = true;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            message: "Backup 'backups/dexcom_20250101.tar.gz' deleted successfully.",
          }),
        });
      });
      
      // Mock the updated list after deletion (empty)
      await page.route("**/api/backups/list", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ files: [] }),
        });
      });
      
      await expect(page.getByText("dexcom_20250101.tar.gz")).toBeVisible();
      
      // Click delete button
      const deleteButton = page.getByRole("button", { name: /delete/i }).first();
      await deleteButton.click();
      
      // Confirm deletion
      await expect(page.getByText("Confirm Delete")).toBeVisible();
      const confirmButton = page.getByRole("button", { name: /^delete$/i }).last();
      await confirmButton.click();
      
      // Wait for success message
      await expect(page.getByText(/deleted successfully/i)).toBeVisible();
      
      // File should be removed from the table
      await expect(page.getByText("dexcom_20250101.tar.gz")).not.toBeVisible();
      
      expect(deleteRequested).toBe(true);
    });

    test("shows error message when delete fails", async ({ page }) => {
      await page.goto("/");
      
      // Mock the delete API to fail
      await page.route("**/api/backups/delete?*", async (route) => {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({
            error: "Failed to delete backup from S3.",
          }),
        });
      });
      
      await expect(page.getByText("dexcom_20250101.tar.gz")).toBeVisible();
      
      // Click delete button
      const deleteButton = page.getByRole("button", { name: /delete/i }).first();
      await deleteButton.click();
      
      // Confirm deletion
      await expect(page.getByText("Confirm Delete")).toBeVisible();
      const confirmButton = page.getByRole("button", { name: /^delete$/i }).last();
      await confirmButton.click();
      
      // Wait for error message
      await expect(page.getByText(/failed to delete/i)).toBeVisible();
      
      // File should still be in the table
      await expect(page.getByText("dexcom_20250101.tar.gz")).toBeVisible();
      
      // Dialog should be closed
      await expect(page.getByText("Confirm Delete")).not.toBeVisible();
    });

    test("delete button is disabled during deletion", async ({ page }) => {
      await page.goto("/");
      
      // Mock a slow delete API response
      await page.route("**/api/backups/delete?*", async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            message: "Backup deleted successfully.",
          }),
        });
      });
      
      await expect(page.getByText("dexcom_20250101.tar.gz")).toBeVisible();
      
      const deleteButton = page.getByRole("button", { name: /delete/i }).first();
      await deleteButton.click();
      
      // Confirm deletion
      await expect(page.getByText("Confirm Delete")).toBeVisible();
      const confirmButton = page.getByRole("button", { name: /^delete$/i }).last();
      
      // Click and immediately check if button shows "Deleting..." state
      await confirmButton.click();
      
      // Button should show deleting state (or be disabled)
      await expect(page.getByText(/deleting/i)).toBeVisible();
    });

    test("can delete multiple files sequentially", async ({ page }) => {
      // Mock multiple files
      await page.route("**/api/backups/list", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            files: [
              {
                key: "backups/dexcom_20250101.tar.gz",
                lastModified: "2025-01-01T00:00:00Z",
                size: 1048576,
              },
              {
                key: "backups/dexcom_20250102.tar.gz",
                lastModified: "2025-01-02T00:00:00Z",
                size: 2097152,
              },
            ],
          }),
        });
      });
      
      await page.goto("/");
      
      let deleteCallCount = 0;
      await page.route("**/api/backups/delete?*", async (route) => {
        deleteCallCount++;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            message: "Backup deleted successfully.",
          }),
        });
        
        // Update list after each deletion
        if (deleteCallCount === 1) {
          await page.route("**/api/backups/list", async (listRoute) => {
            await listRoute.fulfill({
              status: 200,
              contentType: "application/json",
              body: JSON.stringify({
                files: [
                  {
                    key: "backups/dexcom_20250102.tar.gz",
                    lastModified: "2025-01-02T00:00:00Z",
                    size: 2097152,
                  },
                ],
              }),
            });
          });
        } else {
          await page.route("**/api/backups/list", async (listRoute) => {
            await listRoute.fulfill({
              status: 200,
              contentType: "application/json",
              body: JSON.stringify({ files: [] }),
            });
          });
        }
      });
      
      // Delete first file
      await expect(page.getByText("dexcom_20250101.tar.gz")).toBeVisible();
      let deleteButtons = page.getByRole("button", { name: /delete/i });
      await deleteButtons.first().click();
      
      await expect(page.getByText("Confirm Delete")).toBeVisible();
      let confirmButton = page.getByRole("button", { name: /^delete$/i }).last();
      await confirmButton.click();
      
      await expect(page.getByText(/deleted successfully/i)).toBeVisible();
      
      // First file should be gone, second should remain
      await expect(page.getByText("dexcom_20250101.tar.gz")).not.toBeVisible();
      await expect(page.getByText("dexcom_20250102.tar.gz")).toBeVisible();
      
      // Delete second file
      deleteButtons = page.getByRole("button", { name: /delete/i });
      await deleteButtons.first().click();
      
      await expect(page.getByText("Confirm Delete")).toBeVisible();
      confirmButton = page.getByRole("button", { name: /^delete$/i }).last();
      await confirmButton.click();
      
      await expect(page.getByText(/deleted successfully/i)).toBeVisible();
      
      // Both files should be gone
      await expect(page.getByText("dexcom_20250102.tar.gz")).not.toBeVisible();
      await expect(page.getByText(/no backups found yet/i)).toBeVisible();
      
      expect(deleteCallCount).toBe(2);
    });
  });
});

