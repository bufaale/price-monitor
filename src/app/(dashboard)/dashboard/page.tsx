import { createClient } from "@/lib/supabase/server";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowDown, ArrowUp } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch stats
  const { count: competitorCount } = await supabase
    .from("competitors").select("*", { count: "exact", head: true })
    .eq("user_id", user!.id).eq("status", "active");

  const { count: productCount } = await supabase
    .from("products").select("*", { count: "exact", head: true })
    .eq("user_id", user!.id);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const { count: changesCount } = await supabase
    .from("alerts").select("*", { count: "exact", head: true })
    .eq("user_id", user!.id)
    .gte("created_at", yesterday.toISOString());

  const { count: unreadCount } = await supabase
    .from("alerts").select("*", { count: "exact", head: true })
    .eq("user_id", user!.id).eq("read", false);

  // Recent alerts
  const { data: recentAlerts } = await supabase
    .from("alerts")
    .select("*, products(name, url)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Monitor your competitive pricing landscape
        </p>
      </div>

      <StatsCards
        competitors={competitorCount ?? 0}
        products={productCount ?? 0}
        priceChanges24h={changesCount ?? 0}
        unreadAlerts={unreadCount ?? 0}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Alerts</CardTitle>
          <Link href="/dashboard/alerts" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {!recentAlerts?.length ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No alerts yet. Add competitors and products to start monitoring.
            </p>
          ) : (
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    {alert.alert_type === "price_drop" ? (
                      <ArrowDown className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowUp className="h-4 w-4 text-red-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{(alert.products as unknown as { name: string })?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        ${alert.old_price} → ${alert.new_price}
                      </p>
                    </div>
                  </div>
                  <Badge variant={alert.alert_type === "price_drop" ? "default" : "destructive"}>
                    {alert.change_percent > 0 ? "+" : ""}{alert.change_percent}%
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
