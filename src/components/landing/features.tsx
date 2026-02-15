import {
  TrendingUp,
  Search,
  Bell,
  Brain,
  BarChart3,
  Download,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const features = [
  {
    icon: TrendingUp,
    title: "Price Tracking",
    description:
      "Add competitor product URLs and track prices automatically. Daily scans with instant change detection.",
  },
  {
    icon: Search,
    title: "Smart Extraction",
    description:
      "Automatically extracts prices using structured data (JSON-LD, Open Graph) with CSS selector fallback for any site.",
  },
  {
    icon: Bell,
    title: "Instant Alerts",
    description:
      "Get notified immediately when competitors change prices. Email alerts and webhook integrations for your workflow.",
  },
  {
    icon: Brain,
    title: "AI Strategy",
    description:
      "Claude AI analyzes competitor pricing patterns and recommends optimal price points to maximize your margins.",
  },
  {
    icon: BarChart3,
    title: "Historical Charts",
    description:
      "Interactive price history charts. Spot trends, seasonal patterns, and competitor strategies over time.",
  },
  {
    icon: Download,
    title: "Export & API",
    description:
      "Export data as CSV or integrate via API. Connect PriceWise to your existing pricing systems.",
  },
];

export function Features() {
  return (
    <section id="features" className="bg-muted/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold">
            Everything you need to monitor competitor prices
          </h2>
          <p className="text-muted-foreground mt-4 mx-auto max-w-2xl">
            Track, analyze, and optimize your pricing with powerful tools.
          </p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="transition-shadow hover:shadow-md"
            >
              <CardHeader>
                <div className="bg-primary/10 mb-2 flex h-10 w-10 items-center justify-center rounded-lg">
                  <feature.icon className="text-primary h-5 w-5" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
