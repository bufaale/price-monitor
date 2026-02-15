export interface PlanLimits {
  maxCompetitors: number;      // -1 = unlimited
  maxProducts: number;         // -1 = unlimited
  maxAiGenerations: number;    // per month, -1 = unlimited
  webhookEnabled: boolean;
  apiEnabled: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: { monthly: number; yearly: number };
  stripePriceId: { monthly: string; yearly: string };
  features: string[];
  limits: PlanLimits;
  highlighted?: boolean;
  cta: string;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "For small businesses getting started",
    price: { monthly: 49, yearly: 490 },
    stripePriceId: {
      monthly: (process.env.NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PRICE_ID || "").trim(),
      yearly: (process.env.NEXT_PUBLIC_STRIPE_STARTER_YEARLY_PRICE_ID || "").trim(),
    },
    limits: {
      maxCompetitors: 3,
      maxProducts: 50,
      maxAiGenerations: 3,
      webhookEnabled: false,
      apiEnabled: false,
    },
    features: [
      "3 competitors",
      "50 products",
      "Daily price scans",
      "Email alerts",
      "3 AI strategy reports/mo",
      "CSV export",
    ],
    cta: "Start Free Trial",
  },
  {
    id: "pro",
    name: "Professional",
    description: "For growing e-commerce teams",
    price: { monthly: 149, yearly: 1490 },
    stripePriceId: {
      monthly: (process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || "").trim(),
      yearly: (process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID || "").trim(),
    },
    limits: {
      maxCompetitors: 10,
      maxProducts: 300,
      maxAiGenerations: 15,
      webhookEnabled: true,
      apiEnabled: false,
    },
    features: [
      "10 competitors",
      "300 products",
      "Daily price scans",
      "Email + webhook alerts",
      "15 AI strategy reports/mo",
      "CSV export",
    ],
    highlighted: true,
    cta: "Upgrade to Pro",
  },
  {
    id: "business",
    name: "Business",
    description: "For enterprises and agencies",
    price: { monthly: 299, yearly: 2990 },
    stripePriceId: {
      monthly: (process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID || "").trim(),
      yearly: (process.env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID || "").trim(),
    },
    limits: {
      maxCompetitors: -1,
      maxProducts: -1,
      maxAiGenerations: -1,
      webhookEnabled: true,
      apiEnabled: true,
    },
    features: [
      "Unlimited competitors",
      "Unlimited products",
      "Daily price scans",
      "Email + webhook alerts",
      "Unlimited AI reports",
      "CSV export + API access",
    ],
    cta: "Go Business",
  },
];

export function getPlanByPriceId(priceId: string): PricingPlan | undefined {
  return pricingPlans.find(
    (p) => p.stripePriceId.monthly === priceId || p.stripePriceId.yearly === priceId,
  );
}

export function getUserPlan(subscriptionPlan: string | null): PricingPlan {
  return pricingPlans.find((p) => p.id === subscriptionPlan) || pricingPlans[0];
}

export function checkLimit(
  current: number,
  limitValue: number,
): { allowed: boolean; remaining: number } {
  if (limitValue === -1) return { allowed: true, remaining: Infinity };
  return { allowed: current < limitValue, remaining: Math.max(0, limitValue - current) };
}
