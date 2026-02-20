import { Brain, Bell, DollarSign, BarChart3 } from "lucide-react";

const reasons = [
  {
    icon: Brain,
    title: "AI Strategy Recommendations",
    description:
      "Prisync and Price2Spy track prices. We analyze patterns and recommend pricing strategies using AI. Know when to undercut, match, or hold your price.",
  },
  {
    icon: Bell,
    title: "Alerts on Every Tier",
    description:
      "Prisync locks instant price alerts behind their $399+/mo Platinum plan. PriceHawk includes email alerts on every tier starting at $49/mo.",
  },
  {
    icon: DollarSign,
    title: "Half the Price of Prisync",
    description:
      "Prisync starts at $99/mo. We start at $49/mo with more features — including AI strategy that Prisync doesn't offer at any price.",
  },
  {
    icon: BarChart3,
    title: "Historical Charts Included",
    description:
      "Track price trends over time from day one. Many competitors lock historical data behind premium tiers or charge extra for reporting.",
  },
];

export function WhyUs() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold">
            Why PriceHawk over alternatives?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            AI pricing strategy for SMBs, not just price tracking.
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {reasons.map((reason) => (
            <div key={reason.title} className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <reason.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{reason.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {reason.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
