import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { canAddProduct } from "@/lib/usage/check-limits";
import { z } from "zod";

const createSchema = z.object({
  competitor_id: z.string().uuid(),
  name: z.string().min(1).max(200),
  url: z.string().url(),
  css_selector: z.string().max(500).optional(),
});

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const competitorId = url.searchParams.get("competitor_id");

  let query = supabase
    .from("products")
    .select("*, competitors(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (competitorId) {
    query = query.eq("competitor_id", competitorId);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const limitCheck = await canAddProduct(user.id);
  if (!limitCheck.allowed) return NextResponse.json({ error: limitCheck.message }, { status: 403 });

  // Verify competitor belongs to user
  const { data: competitor } = await supabase
    .from("competitors")
    .select("id")
    .eq("id", parsed.data.competitor_id)
    .eq("user_id", user.id)
    .single();

  if (!competitor) return NextResponse.json({ error: "Competitor not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("products")
    .insert({
      user_id: user.id,
      competitor_id: parsed.data.competitor_id,
      name: parsed.data.name,
      url: parsed.data.url,
      css_selector: parsed.data.css_selector || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
