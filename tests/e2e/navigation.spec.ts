import { test, expect } from "@playwright/test";
import { createTestUser, deleteTestUser, loginViaUI } from "../helpers/test-utils";

let testUser: { id: string; email: string };

test.beforeAll(async () => {
  testUser = await createTestUser("nav");
});

test.afterAll(async () => {
  if (testUser?.id) await deleteTestUser(testUser.id);
});

test.describe("PriceHawk navigation", () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUI(page, testUser.email);
  });

  test("dashboard loads after login", async ({ page }) => {
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("sidebar has main nav links", async ({ page }) => {
    await expect(page.getByRole("link", { name: /Dashboard/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Competitors/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Products/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Alerts/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /AI Strategy/i })).toBeVisible();
  });

  test("competitors page loads", async ({ page }) => {
    await page.getByRole("link", { name: /Competitors/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/competitors/);
  });

  test("products page loads", async ({ page }) => {
    await page.getByRole("link", { name: /Products/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/products/);
  });

  test("alerts page loads", async ({ page }) => {
    await page.getByRole("link", { name: /Alerts/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/alerts/);
  });

  test("ai-strategy page loads", async ({ page }) => {
    await page.getByRole("link", { name: /AI Strategy/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/strategy/);
  });

  test("settings billing page loads", async ({ page }) => {
    await page.goto("/settings/billing");
    await expect(page).toHaveURL(/\/settings\/billing/);
  });
});
