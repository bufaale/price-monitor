import { type Page } from "@playwright/test";

export const TEST_PASSWORD = "TestE2E_Pass123!";

function supabaseUrl(): string {
  return process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
}
function supabaseServiceKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}
function supabaseAnonKey(): string {
  return process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
}

export async function createTestUser(prefix: string): Promise<{ id: string; email: string }> {
  const email = `e2e-${prefix}-${Date.now()}@test.example.com`;
  const res = await fetch(`${supabaseUrl()}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${supabaseServiceKey()}`,
      apikey: supabaseAnonKey(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: `E2E ${prefix}` },
    }),
  });
  if (!res.ok) throw new Error(`Failed to create user: ${await res.text()}`);
  const user = await res.json();
  return { id: user.id, email };
}

export async function deleteTestUser(userId: string): Promise<void> {
  await fetch(`${supabaseUrl()}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${supabaseServiceKey()}`,
      apikey: supabaseAnonKey(),
    },
  });
}

export async function loginViaUI(page: Page, email: string, password: string = TEST_PASSWORD) {
  await page.goto("/login");
  await page.getByRole("textbox", { name: "Email" }).fill(email);
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("button", { name: /Sign in|Iniciar sesión/i }).click();
  await page.waitForURL("**/dashboard**", { timeout: 15_000 });
}
