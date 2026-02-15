import { NextResponse } from "next/server";
import { z } from "zod";

import { scrapeProduct } from "@/lib/scraper/scrape-product";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  url: z.string().url("Please enter a valid URL"),
  cssSelector: z.string().optional(),
});

export const maxDuration = 30;

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const result = await scrapeProduct(parsed.data.url, parsed.data.cssSelector);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.message, code: result.error.code },
      { status: 422 },
    );
  }

  return NextResponse.json({ data: result.data });
}
