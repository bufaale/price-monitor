import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <Badge variant="secondary" className="mb-4">
          AI pricing strategy, not just price tracking
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Track Competitor Prices. Get{" "}
          <span className="text-primary">AI Strategy Recommendations.</span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Monitor competitor pricing with AI-powered strategy insights. Prisync
          charges $99/mo for basic tracking and locks alerts behind $399+. We
          include everything — AI strategy, alerts, charts — starting at $49/mo.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/signup">Start Monitoring Free</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#comparison">See How We Compare</Link>
          </Button>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          No credit card required. Free tier available.
        </p>
      </div>
    </section>
  );
}
