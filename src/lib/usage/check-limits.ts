import { createServerClient } from "@supabase/ssr";
import { getUserPlan, checkLimit } from "@/lib/stripe/plans";

function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

export async function canAddCompetitor(userId: string): Promise<{ allowed: boolean; message?: string }> {
  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("subscription_plan").eq("id", userId).single();
  const plan = getUserPlan(profile?.subscription_plan ?? null);

  const { count } = await admin.from("competitors").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("status", "active");
  const { allowed } = checkLimit(count ?? 0, plan.limits.maxCompetitors);

  if (!allowed) return { allowed: false, message: `${plan.name} plan allows ${plan.limits.maxCompetitors} competitors. Upgrade for more.` };
  return { allowed: true };
}

export async function canAddProduct(userId: string): Promise<{ allowed: boolean; message?: string }> {
  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("subscription_plan").eq("id", userId).single();
  const plan = getUserPlan(profile?.subscription_plan ?? null);

  const { count } = await admin.from("products").select("*", { count: "exact", head: true }).eq("user_id", userId);
  const { allowed } = checkLimit(count ?? 0, plan.limits.maxProducts);

  if (!allowed) return { allowed: false, message: `${plan.name} plan allows ${plan.limits.maxProducts} products. Upgrade for more.` };
  return { allowed: true };
}

export async function canGenerateAiStrategy(userId: string): Promise<{ allowed: boolean; message?: string }> {
  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("subscription_plan").eq("id", userId).single();
  const plan = getUserPlan(profile?.subscription_plan ?? null);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count } = await admin.from("ai_generations").select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfMonth.toISOString());

  const { allowed } = checkLimit(count ?? 0, plan.limits.maxAiGenerations);

  if (!allowed) return { allowed: false, message: `${plan.name} plan allows ${plan.limits.maxAiGenerations} AI reports/month. Upgrade for more.` };
  return { allowed: true };
}
