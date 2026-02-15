import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Package, TrendingDown, Bell } from "lucide-react";

interface StatsCardsProps {
  competitors: number;
  products: number;
  priceChanges24h: number;
  unreadAlerts: number;
}

export function StatsCards({ competitors, products, priceChanges24h, unreadAlerts }: StatsCardsProps) {
  const stats = [
    { title: "Competitors", value: competitors, description: "Active tracking", icon: Building2 },
    { title: "Products", value: products, description: "Tracked items", icon: Package },
    { title: "Price Changes", value: priceChanges24h, description: "Last 24 hours", icon: TrendingDown },
    { title: "Unread Alerts", value: unreadAlerts, description: "Needs attention", icon: Bell },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
