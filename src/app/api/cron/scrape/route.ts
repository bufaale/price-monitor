import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { runBatchScrapeForUser } from "@/lib/scraper/batch-scrape";

export const maxDuration = 60;

function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Get distinct user IDs with active products
  const { data: rows } = await admin.from("products").select("user_id");

  if (!rows?.length) {
    return NextResponse.json({ message: "No products to scrape" });
  }

  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const results = [];

  for (const userId of userIds) {
    const r = await runBatchScrapeForUser(userId);
    results.push({ userId, ...r });
  }

  return NextResponse.json({ users: results.length, results });
}
