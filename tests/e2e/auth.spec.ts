import { test, expect } from "@playwright/test";
import { createTestUser, deleteTestUser, loginViaUI, TEST_PASSWORD } from "../helpers/test-utils";

let testUser: { id: string; email: string };

test.beforeAll(async () => {
  testUser = await createTestUser("auth");
});

test.afterAll(async () => {
  if (testUser?.id) await deleteTestUser(testUser.id);
});

test.describe("Authentication", () => {
  test("login page renders", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("textbox", { name: "Email" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Password" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Sign in|Iniciar sesión/i })).toBeVisible();
  });

  test("signup page renders", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByRole("textbox", { name: "Email" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Password" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Sign up|Create|Registrar/i })).toBeVisible();
  });

  test("unauthenticated users are redirected from /dashboard to /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("login with valid credentials reaches dashboard", async ({ page }) => {
    await loginViaUI(page, testUser.email);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("login with wrong password shows error", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("textbox", { name: "Email" }).fill(testUser.email);
    await page.getByRole("textbox", { name: "Password" }).fill("WrongPassword!123");
    await page.getByRole("button", { name: /Sign in|Iniciar sesión/i }).click();
    await expect(page.getByText(/invalid|incorrect|wrong|Credenciales/i)).toBeVisible({ timeout: 10_000 });
  });
});
