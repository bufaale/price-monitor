import { NextResponse } from "next/server";

import { runBatchScrapeForUser } from "@/lib/scraper/batch-scrape";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runBatchScrapeForUser(user.id);
  return NextResponse.json(result);
}
