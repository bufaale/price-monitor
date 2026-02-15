import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/stripe/plans";
import { z } from "zod";

const updateSchema = z.object({
  email_enabled: z.boolean().optional(),
  webhook_url: z.string().url().nullable().optional(),
  webhook_enabled: z.boolean().optional(),
  threshold_percent: z.number().min(0.1).max(100).optional(),
  notify_price_drop: z.boolean().optional(),
  notify_price_increase: z.boolean().optional(),
});

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("alert_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return NextResponse.json({ data });
}

export async function PUT(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  // Check webhook permission
  if (parsed.data.webhook_enabled) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_plan")
      .eq("id", user.id)
      .single();
    const plan = getUserPlan(profile?.subscription_plan ?? null);
    if (!plan.limits.webhookEnabled) {
      return NextResponse.json({ error: "Webhook alerts require Pro plan or higher" }, { status: 403 });
    }
  }

  const { data, error } = await supabase
    .from("alert_settings")
    .update(parsed.data)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
