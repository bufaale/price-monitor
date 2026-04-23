import { test, expect } from "@playwright/test";

test.describe("Landing page — Price Monitor", () => {
  test("hero mentions AI pricing strategy and competitors", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBeLessThan(400);
    await expect(
      page.getByText(/AI pricing strategy/i).first()
    ).toBeVisible();
    await expect(
      page.getByText(/Track Competitor Prices/i).first()
    ).toBeVisible();
    await expect(page.getByText(/Prisync/i).first()).toBeVisible();
  });

  test("hero mentions $49/mo entry and CTA to signup", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/\$49\/mo/).first()).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Start Monitoring Free/i }).first()
    ).toBeVisible();
  });

  test("pricing section shows tiers and Most Popular", async ({ page }) => {
    await page.goto("/#pricing");
    await expect(
      page.getByText("Simple, transparent pricing").first()
    ).toBeVisible();
    await expect(page.getByText("Most Popular").first()).toBeVisible();
    await expect(page.getByText("Monthly", { exact: true }).first()).toBeVisible();
  });
});
