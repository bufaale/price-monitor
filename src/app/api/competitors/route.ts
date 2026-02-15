import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { canAddCompetitor } from "@/lib/usage/check-limits";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  website_url: z.string().url("Please enter a valid URL"),
});

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("competitors")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

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

  const limitCheck = await canAddCompetitor(user.id);
  if (!limitCheck.allowed) return NextResponse.json({ error: limitCheck.message }, { status: 403 });

  const { data, error } = await supabase
    .from("competitors")
    .insert({ user_id: user.id, name: parsed.data.name, website_url: parsed.data.website_url })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
