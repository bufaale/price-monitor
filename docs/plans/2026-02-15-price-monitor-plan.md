# PriceWise Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an AI-powered competitive price monitoring SaaS that scrapes competitor product prices, detects changes, sends alerts, and provides AI pricing strategy recommendations.

**Architecture:** Cloned from app-09-saas-boilerplate. Cheerio + fetch for price scraping (JSON-LD first, CSS selector fallback). Vercel Cron daily + manual "Scan Now". Alerts via Resend email + webhook. AI strategy via Claude Haiku. No Railway worker — everything runs in Vercel API routes.

**Tech Stack:** Next.js 16, Supabase, Stripe, Cheerio, Recharts, Claude Haiku 4.5 (Vercel AI SDK), Resend, Tailwind CSS 4 + shadcn/ui

---

### Task 1: Rebrand boilerplate to PriceWise

**Context:** The project was cloned from app-09-saas-boilerplate. All files still reference the boilerplate branding. This task updates the identity to PriceWise.

**Files:**
- Modify: `package.json` — change name
- Modify: `src/config/site.ts` — rebrand
- Modify: `src/components/landing/hero.tsx` — new hero copy
- Modify: `src/components/landing/features.tsx` — price monitoring features
- Modify: `src/components/landing/testimonials.tsx` — e-commerce testimonials
- Modify: `src/components/landing/faq.tsx` — price monitoring FAQ
- Modify: `src/components/landing/footer.tsx` — update links
- Modify: `src/components/landing/navbar.tsx` — no code change needed (reads from siteConfig)
- Modify: `src/lib/email/resend.ts` — update email subjects/copy

**Step 1: Update `package.json`**

Change `"name"` from `"app-09-saas-boilerplate"` to `"app-06-price-monitor"`.

**Step 2: Update `src/config/site.ts`**

```typescript
export const siteConfig = {
  name: "PriceWise",
  description:
    "AI-powered competitive price monitoring. Track competitor prices, get instant alerts, and optimize your pricing strategy.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/og.png",
  links: {
    github: "https://github.com/bufaale/price-monitor",
    twitter: "https://twitter.com/pricewise",
  },
} as const;
```

**Step 3: Update `src/components/landing/hero.tsx`**

Replace the entire hero content with PriceWise branding:
- Badge: "AI-Powered Price Intelligence"
- H1: "Track Competitor Prices." highlight "Stay Ahead."
- Description: Monitor competitor pricing in real-time. Get instant alerts when prices change and AI-powered strategy recommendations to optimize your margins.
- CTAs: "Start Monitoring Free" → /signup, "See How It Works" → #features
- Bottom text: "14-day free trial. No credit card required."

**Step 4: Update `src/components/landing/features.tsx`**

Replace the features array with these 6 items:
1. **Price Tracking** (TrendingUp icon) — Add competitor product URLs and track prices automatically. Daily scans with instant change detection.
2. **Smart Extraction** (Search icon) — Automatically extracts prices using structured data (JSON-LD, Open Graph) with CSS selector fallback for any site.
3. **Instant Alerts** (Bell icon) — Get notified immediately when competitors change prices. Email alerts and webhook integrations for your workflow.
4. **AI Strategy** (Brain icon) — Claude AI analyzes competitor pricing patterns and recommends optimal price points to maximize your margins.
5. **Historical Charts** (BarChart3 icon) — Interactive price history charts. Spot trends, seasonal patterns, and competitor strategies over time.
6. **Export & API** (Download icon) — Export data as CSV or integrate via API. Connect PriceWise to your existing pricing systems.

Update the section heading: "Everything you need to monitor competitor prices" / "Track, analyze, and optimize your pricing with powerful tools."

**Step 5: Update `src/components/landing/testimonials.tsx`**

Replace with e-commerce focused testimonials:
1. "PriceWise saved us 15 hours/week of manual price checking. The AI strategy suggestions actually improved our margins by 8%." — Jennifer Park, E-commerce Director at ShopFlow, initials JP
2. "We caught a competitor's price drop within minutes and adjusted our pricing before losing any sales. Game changer." — David Chen, CEO at RetailEdge, initials DC
3. "The historical charts helped us spot seasonal pricing patterns we never noticed. Now we plan promotions months in advance." — Maria Santos, Pricing Analyst at TechMart, initials MS

Update heading: "Trusted by e-commerce teams" / "See how businesses use PriceWise to stay competitive."

**Step 6: Update `src/components/landing/faq.tsx`**

Replace with PriceWise FAQ items:
1. "How does price tracking work?" — You add competitor product URLs, and PriceWise automatically visits each page daily to extract the current price. We use structured data (JSON-LD, Open Graph) for accurate extraction, with CSS selector fallback for custom setups.
2. "What websites can you track?" — PriceWise works with most e-commerce sites that render prices in HTML, including Amazon, Shopify stores, WooCommerce, BigCommerce, and custom sites. If a site renders prices server-side, we can track it.
3. "How do alerts work?" — When a price change exceeds your configured threshold (default 1%), you get an email notification immediately. Pro and Business plans also support webhook notifications for custom integrations.
4. "What does the AI Strategy feature do?" — Our AI analyzes your competitors' price history, identifies patterns (seasonal changes, promotional cycles), and recommends optimal price points. It considers your competitive position and suggests adjustments to maximize margins.
5. "Can I export my data?" — Yes, all plans include CSV export. Business plan users also get API access to integrate price data directly into their existing pricing systems, ERPs, or custom dashboards.
6. "Is there a free trial?" — Yes, new accounts get a 14-day free trial of the Starter plan. No credit card required. After the trial, you can upgrade or continue with limited free features.

Update heading: "Frequently asked questions" / "Everything you need to know about PriceWise."

**Step 7: Update `src/components/landing/footer.tsx`**

Update the product links:
- Product section: Features (#features), Pricing (#pricing), API Docs (#)
- Resources section: Blog (#), Changelog (#), Status (#)
- Legal: Privacy (#), Terms (#)
- Social: GitHub (siteConfig.links.github), Twitter (siteConfig.links.twitter)

**Step 8: Update `src/lib/email/resend.ts`**

- Change `sendWelcomeEmail` subject: "Welcome to PriceWise!" and body: "Thanks for signing up. Start tracking competitor prices in minutes."
- Change `sendSubscriptionEmail` subject keep as is but update body to mention PriceWise features
- Add new function `sendPriceAlertEmail(email, productName, oldPrice, newPrice, changePercent, productUrl)` that sends a price change alert

**Step 9: Commit**

```bash
git add -A
git commit -m "feat: rebrand boilerplate to PriceWise"
```

---

### Task 2: Update pricing plans and types

**Context:** The boilerplate has Free/Pro/Enterprise plans. PriceWise needs Starter $49/Pro $149/Business $299 with usage limits (competitors, products, AI generations).

**Files:**
- Modify: `src/lib/stripe/plans.ts` — new pricing tiers with limits
- Modify: `src/types/database.ts` — add PriceWise-specific interfaces
- Modify: `src/components/landing/pricing.tsx` — update pricing display to show limits
- Modify: `src/app/(dashboard)/settings/billing/upgrade-buttons.tsx` — update for new plan IDs

**Step 1: Rewrite `src/lib/stripe/plans.ts`**

```typescript
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
```

**Step 2: Update `src/types/database.ts`**

Keep existing Profile, Subscription, AiUsage interfaces. Add new interfaces after them:

```typescript
export interface Competitor {
  id: string;
  user_id: string;
  name: string;
  website_url: string;
  status: "active" | "paused";
  created_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  competitor_id: string;
  name: string;
  url: string;
  css_selector: string | null;
  current_price: number | null;
  previous_price: number | null;
  currency: string;
  last_scraped_at: string | null;
  scrape_status: "success" | "error" | "pending";
  scrape_error: string | null;
  created_at: string;
}

export interface PriceHistory {
  id: string;
  product_id: string;
  price: number;
  currency: string;
  scraped_at: string;
}

export interface Alert {
  id: string;
  user_id: string;
  product_id: string;
  alert_type: "price_drop" | "price_increase";
  old_price: number;
  new_price: number;
  change_percent: number;
  notified_email: boolean;
  notified_webhook: boolean;
  read: boolean;
  created_at: string;
}

export interface AlertSettings {
  id: string;
  user_id: string;
  email_enabled: boolean;
  webhook_url: string | null;
  webhook_enabled: boolean;
  threshold_percent: number;
  notify_price_drop: boolean;
  notify_price_increase: boolean;
}

export interface AiGeneration {
  id: string;
  user_id: string;
  prompt_summary: string;
  result: string;
  tokens_used: number;
  created_at: string;
}
```

Add these tables to the Database interface under `Tables`.

**Step 3: Update pricing component**

The existing `src/components/landing/pricing.tsx` already reads from `pricingPlans` — it will work with the new plan data automatically since it renders `plan.features` as a list. No structural changes needed, just verify it renders correctly.

**Step 4: Update `src/app/(dashboard)/settings/billing/upgrade-buttons.tsx`**

Read the file first, then update it to reference the new plan IDs (starter/pro/business instead of free/pro/enterprise). The buttons should show the first paid plan's price for users on free/starter, and portal for active subscribers.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: update pricing plans and database types for PriceWise"
```

---

### Task 3: Database migration — PriceWise schema

**Context:** The boilerplate has profiles, subscriptions, ai_usage tables. PriceWise needs competitors, products, price_history, alerts, alert_settings, and ai_generations tables plus profile extensions.

**Files:**
- Create: `supabase/migrations/00003_pricewise_schema.sql`

**Step 1: Write the migration**

```sql
-- ============================================
-- PriceWise - Competitive Price Monitor Schema
-- ============================================

-- Extend profiles with business info
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS company_name text,
  ADD COLUMN IF NOT EXISTS alert_email text;

-- ============================================
-- Competitors table
-- ============================================
CREATE TABLE IF NOT EXISTS competitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  website_url text NOT NULL,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_competitors_user_id ON competitors(user_id);

-- ============================================
-- Products table
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  competitor_id uuid REFERENCES competitors(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  url text NOT NULL,
  css_selector text,
  current_price numeric(10,2),
  previous_price numeric(10,2),
  currency text NOT NULL DEFAULT 'USD',
  last_scraped_at timestamptz,
  scrape_status text NOT NULL DEFAULT 'pending'
    CHECK (scrape_status IN ('success', 'error', 'pending')),
  scrape_error text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_competitor_id ON products(competitor_id);

-- ============================================
-- Price history table (time-series)
-- ============================================
CREATE TABLE IF NOT EXISTS price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  price numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  scraped_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_price_history_product_id ON price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_price_history_scraped_at ON price_history(scraped_at);
-- Composite index for time-series queries
CREATE INDEX IF NOT EXISTS idx_price_history_product_time ON price_history(product_id, scraped_at DESC);

-- ============================================
-- Alerts table
-- ============================================
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  alert_type text NOT NULL
    CHECK (alert_type IN ('price_drop', 'price_increase')),
  old_price numeric(10,2) NOT NULL,
  new_price numeric(10,2) NOT NULL,
  change_percent numeric(5,2) NOT NULL,
  notified_email boolean DEFAULT false,
  notified_webhook boolean DEFAULT false,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);

-- ============================================
-- Alert settings table (one per user)
-- ============================================
CREATE TABLE IF NOT EXISTS alert_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email_enabled boolean DEFAULT true,
  webhook_url text,
  webhook_enabled boolean DEFAULT false,
  threshold_percent numeric(5,2) DEFAULT 1.00,
  notify_price_drop boolean DEFAULT true,
  notify_price_increase boolean DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_alert_settings_user_id ON alert_settings(user_id);

-- ============================================
-- AI generations table
-- ============================================
CREATE TABLE IF NOT EXISTS ai_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  prompt_summary text NOT NULL,
  result text NOT NULL,
  tokens_used integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_generations_user_id ON ai_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_created_at ON ai_generations(created_at);

-- ============================================
-- RLS policies for competitors
-- ============================================
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own competitors"
  ON competitors FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own competitors"
  ON competitors FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own competitors"
  ON competitors FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own competitors"
  ON competitors FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- RLS policies for products
-- ============================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own products"
  ON products FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own products"
  ON products FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own products"
  ON products FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own products"
  ON products FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- RLS policies for price_history
-- ============================================
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- Users can view price history for their own products
CREATE POLICY "Users can view own price history"
  ON price_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = price_history.product_id
      AND products.user_id = auth.uid()
    )
  );

-- ============================================
-- RLS policies for alerts
-- ============================================
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alerts"
  ON alerts FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own alerts"
  ON alerts FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================
-- RLS policies for alert_settings
-- ============================================
ALTER TABLE alert_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alert settings"
  ON alert_settings FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own alert settings"
  ON alert_settings FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own alert settings"
  ON alert_settings FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================
-- RLS policies for ai_generations
-- ============================================
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ai generations"
  ON ai_generations FOR SELECT
  USING (user_id = auth.uid());

-- ============================================
-- Auto-create default alert settings on profile creation
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_profile_alert_settings()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.alert_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_profile_created_alert_settings
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_profile_alert_settings();
```

**Step 2: Commit**

```bash
git add supabase/migrations/00003_pricewise_schema.sql
git commit -m "feat: add PriceWise database schema migration"
```

---

### Task 4: Scraping engine — price extraction library

**Context:** The core feature. Cheerio + fetch to scrape prices from product URLs. Three extraction strategies: JSON-LD structured data → Open Graph meta tags → user-provided CSS selector.

**Files:**
- Create: `src/lib/scraper/types.ts`
- Create: `src/lib/scraper/user-agents.ts`
- Create: `src/lib/scraper/fetch-page.ts`
- Create: `src/lib/scraper/extract-jsonld.ts`
- Create: `src/lib/scraper/extract-og.ts`
- Create: `src/lib/scraper/extract-selector.ts`
- Create: `src/lib/scraper/parse-price.ts`
- Create: `src/lib/scraper/scrape-product.ts`

**Step 1: Install cheerio**

```bash
npm install cheerio
npm install -D @types/cheerio
```

Note: Check if `@types/cheerio` is needed — cheerio v1.0+ has built-in types, skip if so.

**Step 2: Create `src/lib/scraper/types.ts`**

```typescript
export interface ScrapeResult {
  price: number;
  currency: string;
  method: "json-ld" | "og" | "selector";
  productName?: string;
}

export interface ScrapeError {
  code: "FETCH_FAILED" | "NO_PRICE_FOUND" | "INVALID_URL" | "TIMEOUT" | "HTML_TOO_LARGE";
  message: string;
}
```

**Step 3: Create `src/lib/scraper/user-agents.ts`**

```typescript
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
];

export function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}
```

**Step 4: Create `src/lib/scraper/parse-price.ts`**

```typescript
const CURRENCY_MAP: Record<string, string> = {
  "$": "USD", "€": "EUR", "£": "GBP", "¥": "JPY", "₹": "INR",
  "R$": "BRL", "C$": "CAD", "A$": "AUD", "kr": "SEK", "zł": "PLN",
};

export function parsePrice(raw: string): { price: number; currency: string } | null {
  if (!raw || typeof raw !== "string") return null;

  const cleaned = raw.trim();

  // Detect currency from symbols
  let currency = "USD";
  for (const [symbol, code] of Object.entries(CURRENCY_MAP)) {
    if (cleaned.includes(symbol)) {
      currency = code;
      break;
    }
  }

  // Remove all non-numeric except dots and commas
  let numStr = cleaned.replace(/[^0-9.,]/g, "");

  // Handle European format: 1.234,56 → 1234.56
  if (numStr.includes(",") && numStr.includes(".")) {
    const lastComma = numStr.lastIndexOf(",");
    const lastDot = numStr.lastIndexOf(".");
    if (lastComma > lastDot) {
      // European: dots are thousands, comma is decimal
      numStr = numStr.replace(/\./g, "").replace(",", ".");
    } else {
      // US: commas are thousands, dot is decimal
      numStr = numStr.replace(/,/g, "");
    }
  } else if (numStr.includes(",")) {
    // Could be thousands (1,234) or decimal (12,34)
    const parts = numStr.split(",");
    if (parts[parts.length - 1].length === 2) {
      // Likely decimal
      numStr = numStr.replace(",", ".");
    } else {
      // Likely thousands separator
      numStr = numStr.replace(/,/g, "");
    }
  }

  const price = parseFloat(numStr);
  if (isNaN(price) || price <= 0) return null;

  return { price: Math.round(price * 100) / 100, currency };
}
```

**Step 5: Create `src/lib/scraper/fetch-page.ts`**

```typescript
import { getRandomUserAgent } from "./user-agents";

const MAX_HTML_SIZE = 2 * 1024 * 1024; // 2MB

export async function fetchPage(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": getRandomUserAgent(),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      signal: controller.signal,
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      throw new Error(`Not an HTML page: ${contentType}`);
    }

    const html = await response.text();
    if (html.length > MAX_HTML_SIZE) {
      throw new Error(`Page too large: ${(html.length / 1024 / 1024).toFixed(1)}MB`);
    }

    return html;
  } finally {
    clearTimeout(timeout);
  }
}
```

**Step 6: Create `src/lib/scraper/extract-jsonld.ts`**

```typescript
import * as cheerio from "cheerio";
import { parsePrice } from "./parse-price";
import type { ScrapeResult } from "./types";

export function extractFromJsonLd($: cheerio.CheerioAPI): ScrapeResult | null {
  const scripts = $('script[type="application/ld+json"]');

  for (let i = 0; i < scripts.length; i++) {
    try {
      const text = $(scripts[i]).html();
      if (!text) continue;

      const data = JSON.parse(text);
      const result = findProductPrice(data);
      if (result) return result;
    } catch {
      continue;
    }
  }

  return null;
}

function findProductPrice(data: unknown): ScrapeResult | null {
  if (!data || typeof data !== "object") return null;

  // Handle arrays (some sites wrap in array)
  if (Array.isArray(data)) {
    for (const item of data) {
      const result = findProductPrice(item);
      if (result) return result;
    }
    return null;
  }

  const obj = data as Record<string, unknown>;
  const type = obj["@type"];

  if (type === "Product" || (Array.isArray(type) && type.includes("Product"))) {
    const offers = obj.offers as Record<string, unknown> | Record<string, unknown>[] | undefined;
    if (!offers) return null;

    const offerObj = Array.isArray(offers) ? offers[0] : offers;
    if (!offerObj) return null;

    const priceStr = String(offerObj.price ?? offerObj.lowPrice ?? "");
    const parsed = parsePrice(priceStr);
    if (!parsed) return null;

    return {
      price: parsed.price,
      currency: String(offerObj.priceCurrency || parsed.currency),
      method: "json-ld",
      productName: typeof obj.name === "string" ? obj.name : undefined,
    };
  }

  // Recurse into @graph
  if (obj["@graph"] && Array.isArray(obj["@graph"])) {
    for (const item of obj["@graph"]) {
      const result = findProductPrice(item);
      if (result) return result;
    }
  }

  return null;
}
```

**Step 7: Create `src/lib/scraper/extract-og.ts`**

```typescript
import * as cheerio from "cheerio";
import { parsePrice } from "./parse-price";
import type { ScrapeResult } from "./types";

export function extractFromOG($: cheerio.CheerioAPI): ScrapeResult | null {
  const priceAmount = $('meta[property="product:price:amount"]').attr("content");
  if (!priceAmount) return null;

  const parsed = parsePrice(priceAmount);
  if (!parsed) return null;

  const priceCurrency = $('meta[property="product:price:currency"]').attr("content");
  const productName = $('meta[property="og:title"]').attr("content");

  return {
    price: parsed.price,
    currency: priceCurrency || parsed.currency,
    method: "og",
    productName: productName || undefined,
  };
}
```

**Step 8: Create `src/lib/scraper/extract-selector.ts`**

```typescript
import * as cheerio from "cheerio";
import { parsePrice } from "./parse-price";
import type { ScrapeResult } from "./types";

export function extractFromSelector($: cheerio.CheerioAPI, selector: string): ScrapeResult | null {
  const element = $(selector).first();
  if (!element.length) return null;

  const text = element.text().trim();
  if (!text) return null;

  const parsed = parsePrice(text);
  if (!parsed) return null;

  // Try to get product name from <h1> or og:title
  const productName = $("h1").first().text().trim() ||
    $('meta[property="og:title"]').attr("content") ||
    undefined;

  return {
    price: parsed.price,
    currency: parsed.currency,
    method: "selector",
    productName,
  };
}
```

**Step 9: Create `src/lib/scraper/scrape-product.ts`**

This is the main entry point that orchestrates the scraping pipeline.

```typescript
import * as cheerio from "cheerio";
import { fetchPage } from "./fetch-page";
import { extractFromJsonLd } from "./extract-jsonld";
import { extractFromOG } from "./extract-og";
import { extractFromSelector } from "./extract-selector";
import type { ScrapeResult, ScrapeError } from "./types";

export async function scrapeProduct(
  url: string,
  cssSelector?: string | null,
): Promise<{ success: true; data: ScrapeResult } | { success: false; error: ScrapeError }> {
  // Validate URL
  try {
    new URL(url);
  } catch {
    return { success: false, error: { code: "INVALID_URL", message: "Invalid URL format" } };
  }

  // Fetch HTML
  let html: string;
  try {
    html = await fetchPage(url);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch page";
    if (message.includes("aborted")) {
      return { success: false, error: { code: "TIMEOUT", message: "Request timed out (15s)" } };
    }
    if (message.includes("too large")) {
      return { success: false, error: { code: "HTML_TOO_LARGE", message } };
    }
    return { success: false, error: { code: "FETCH_FAILED", message } };
  }

  const $ = cheerio.load(html);

  // Strategy 1: JSON-LD structured data
  const jsonLdResult = extractFromJsonLd($);
  if (jsonLdResult) return { success: true, data: jsonLdResult };

  // Strategy 2: Open Graph meta tags
  const ogResult = extractFromOG($);
  if (ogResult) return { success: true, data: ogResult };

  // Strategy 3: CSS selector fallback
  if (cssSelector) {
    const selectorResult = extractFromSelector($, cssSelector);
    if (selectorResult) return { success: true, data: selectorResult };
  }

  return {
    success: false,
    error: {
      code: "NO_PRICE_FOUND",
      message: cssSelector
        ? `No price found via structured data or selector "${cssSelector}"`
        : "No price found in structured data. Try adding a CSS selector.",
    },
  };
}
```

**Step 10: Commit**

```bash
git add -A
git commit -m "feat: add price scraping engine with JSON-LD, OG, and CSS selector extraction"
```

---

### Task 5: Scrape API routes

**Context:** Two API routes: single product scrape (for preview when adding) and batch scrape (for daily cron + manual scan).

**Files:**
- Create: `src/app/api/scrape/route.ts` — single product preview
- Create: `src/app/api/scrape/batch/route.ts` — batch scrape for a user
- Create: `src/app/api/cron/scrape/route.ts` — Vercel cron daily
- Modify: `vercel.json` — add cron config and maxDuration for scrape routes

**Step 1: Create `src/app/api/scrape/route.ts`**

Single product preview scrape. Requires auth. Used when user adds a new product to preview the extracted price before saving.

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { scrapeProduct } from "@/lib/scraper/scrape-product";
import { z } from "zod";

const schema = z.object({
  url: z.string().url("Please enter a valid URL"),
  cssSelector: z.string().optional(),
});

export const maxDuration = 30;

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const result = await scrapeProduct(parsed.data.url, parsed.data.cssSelector);
  if (!result.success) {
    return NextResponse.json({ error: result.error.message, code: result.error.code }, { status: 422 });
  }

  return NextResponse.json({ data: result.data });
}
```

**Step 2: Create `src/app/api/scrape/batch/route.ts`**

Batch scrape all active products for the authenticated user. Called by "Scan Now" button and by the cron job. Handles price comparison, alert creation, and email/webhook notifications.

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";
import { scrapeProduct } from "@/lib/scraper/scrape-product";
import { sendPriceAlertEmail } from "@/lib/email/resend";

export const maxDuration = 60;

function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return runBatchScrape(user.id);
}

export async function runBatchScrape(userId: string) {
  const admin = createAdminClient();

  // Get user's active products
  const { data: products, error: prodErr } = await admin
    .from("products")
    .select("*, competitors!inner(name, status)")
    .eq("user_id", userId)
    .eq("competitors.status", "active");

  if (prodErr || !products?.length) {
    return NextResponse.json({ scraped: 0, message: "No active products to scrape" });
  }

  // Get user's alert settings
  const { data: alertSettings } = await admin
    .from("alert_settings")
    .select("*")
    .eq("user_id", userId)
    .single();

  // Get user's email for alerts
  const { data: profile } = await admin
    .from("profiles")
    .select("email, alert_email")
    .eq("id", userId)
    .single();

  const alertEmail = profile?.alert_email || profile?.email;
  const threshold = alertSettings?.threshold_percent ?? 1;

  let scraped = 0;
  let alerts = 0;

  for (const product of products) {
    // 2s delay between requests to be polite
    if (scraped > 0) {
      await new Promise((r) => setTimeout(r, 2000));
    }

    const result = await scrapeProduct(product.url, product.css_selector);

    if (result.success) {
      const newPrice = result.data.price;
      const oldPrice = product.current_price;

      // Insert price history
      await admin.from("price_history").insert({
        product_id: product.id,
        price: newPrice,
        currency: result.data.currency,
      });

      // Update product
      const updateData: Record<string, unknown> = {
        current_price: newPrice,
        currency: result.data.currency,
        last_scraped_at: new Date().toISOString(),
        scrape_status: "success",
        scrape_error: null,
      };

      // Check for price change alert
      if (oldPrice !== null && oldPrice > 0) {
        const changePercent = ((newPrice - oldPrice) / oldPrice) * 100;

        if (Math.abs(changePercent) >= threshold) {
          const alertType = changePercent < 0 ? "price_drop" : "price_increase";
          const shouldNotify =
            (alertType === "price_drop" && alertSettings?.notify_price_drop !== false) ||
            (alertType === "price_increase" && alertSettings?.notify_price_increase !== false);

          if (shouldNotify) {
            updateData.previous_price = oldPrice;

            // Create alert
            await admin.from("alerts").insert({
              user_id: userId,
              product_id: product.id,
              alert_type: alertType,
              old_price: oldPrice,
              new_price: newPrice,
              change_percent: Math.round(changePercent * 100) / 100,
              notified_email: false,
              notified_webhook: false,
            });

            // Send email notification
            if (alertSettings?.email_enabled !== false && alertEmail) {
              try {
                await sendPriceAlertEmail(
                  alertEmail,
                  product.name,
                  oldPrice,
                  newPrice,
                  Math.round(changePercent * 100) / 100,
                  product.url,
                );
                await admin.from("alerts")
                  .update({ notified_email: true })
                  .eq("product_id", product.id)
                  .eq("new_price", newPrice)
                  .order("created_at", { ascending: false })
                  .limit(1);
              } catch (e) {
                console.error("Failed to send alert email:", e);
              }
            }

            // Send webhook notification
            if (alertSettings?.webhook_enabled && alertSettings?.webhook_url) {
              try {
                await fetch(alertSettings.webhook_url, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    event: "price_change",
                    product: { id: product.id, name: product.name, url: product.url },
                    oldPrice,
                    newPrice,
                    changePercent: Math.round(changePercent * 100) / 100,
                    currency: result.data.currency,
                    timestamp: new Date().toISOString(),
                  }),
                });
                await admin.from("alerts")
                  .update({ notified_webhook: true })
                  .eq("product_id", product.id)
                  .eq("new_price", newPrice)
                  .order("created_at", { ascending: false })
                  .limit(1);
              } catch (e) {
                console.error("Failed to send webhook:", e);
              }
            }

            alerts++;
          }
        }
      }

      await admin.from("products").update(updateData).eq("id", product.id);
      scraped++;
    } else {
      // Update product with error
      await admin.from("products").update({
        scrape_status: "error",
        scrape_error: result.error.message,
        last_scraped_at: new Date().toISOString(),
      }).eq("id", product.id);
      scraped++;
    }
  }

  return NextResponse.json({ scraped, alerts, total: products.length });
}
```

**Step 3: Create `src/app/api/cron/scrape/route.ts`**

Vercel cron job endpoint. Runs daily, iterates all users with active products.

```typescript
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { runBatchScrapeForUser } from "./scrape-user";

export const maxDuration = 60;

function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Get all users who have at least one active product
  const { data: users } = await admin
    .from("products")
    .select("user_id")
    .eq("scrape_status", "success")
    .not("current_price", "is", null);

  if (!users?.length) {
    return NextResponse.json({ message: "No users with active products" });
  }

  // Deduplicate user IDs
  const userIds = [...new Set(users.map((u) => u.user_id))];

  const results: Array<{ userId: string; scraped: number; alerts: number }> = [];

  for (const userId of userIds) {
    const result = await runBatchScrapeForUser(userId);
    results.push({ userId, ...result });
  }

  return NextResponse.json({ users: results.length, results });
}
```

**Step 3b: Create `src/app/api/cron/scrape-user.ts`**

Extract the batch scrape logic into a reusable function that both the cron job and the user-triggered batch endpoint can call.

Actually, let's refactor: move the core batch logic from `src/app/api/scrape/batch/route.ts` into a shared function in `src/lib/scraper/batch-scrape.ts` that both API routes import.

**Create `src/lib/scraper/batch-scrape.ts`:**

```typescript
import { createServerClient } from "@supabase/ssr";
import { scrapeProduct } from "./scrape-product";
import { sendPriceAlertEmail } from "@/lib/email/resend";

function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

export async function runBatchScrapeForUser(userId: string): Promise<{ scraped: number; alerts: number }> {
  const admin = createAdminClient();

  const { data: products } = await admin
    .from("products")
    .select("id, name, url, css_selector, current_price, competitor_id")
    .eq("user_id", userId);

  if (!products?.length) return { scraped: 0, alerts: 0 };

  // Check competitor status — only scrape products whose competitor is active
  const { data: competitors } = await admin
    .from("competitors")
    .select("id, status")
    .eq("user_id", userId);

  const activeCompetitorIds = new Set(
    (competitors || []).filter((c) => c.status === "active").map((c) => c.id),
  );

  const activeProducts = products.filter((p) => activeCompetitorIds.has(p.competitor_id));
  if (!activeProducts.length) return { scraped: 0, alerts: 0 };

  const { data: alertSettings } = await admin
    .from("alert_settings")
    .select("*")
    .eq("user_id", userId)
    .single();

  const { data: profile } = await admin
    .from("profiles")
    .select("email, alert_email")
    .eq("id", userId)
    .single();

  const alertEmail = profile?.alert_email || profile?.email;
  const threshold = alertSettings?.threshold_percent ?? 1;

  let scraped = 0;
  let alerts = 0;

  for (const product of activeProducts) {
    if (scraped > 0) {
      await new Promise((r) => setTimeout(r, 2000));
    }

    const result = await scrapeProduct(product.url, product.css_selector);

    if (result.success) {
      const newPrice = result.data.price;
      const oldPrice = product.current_price;

      await admin.from("price_history").insert({
        product_id: product.id,
        price: newPrice,
        currency: result.data.currency,
      });

      const updateData: Record<string, unknown> = {
        current_price: newPrice,
        currency: result.data.currency,
        last_scraped_at: new Date().toISOString(),
        scrape_status: "success",
        scrape_error: null,
      };

      if (oldPrice !== null && oldPrice > 0) {
        const changePercent = ((newPrice - oldPrice) / oldPrice) * 100;

        if (Math.abs(changePercent) >= threshold) {
          const alertType = changePercent < 0 ? "price_drop" : "price_increase";
          const shouldNotify =
            (alertType === "price_drop" && alertSettings?.notify_price_drop !== false) ||
            (alertType === "price_increase" && alertSettings?.notify_price_increase !== false);

          if (shouldNotify) {
            updateData.previous_price = oldPrice;

            const { data: alertRow } = await admin.from("alerts").insert({
              user_id: userId,
              product_id: product.id,
              alert_type: alertType,
              old_price: oldPrice,
              new_price: newPrice,
              change_percent: Math.round(changePercent * 100) / 100,
            }).select("id").single();

            if (alertSettings?.email_enabled !== false && alertEmail && alertRow) {
              try {
                await sendPriceAlertEmail(alertEmail, product.name, oldPrice, newPrice, Math.round(changePercent * 100) / 100, product.url);
                await admin.from("alerts").update({ notified_email: true }).eq("id", alertRow.id);
              } catch (e) {
                console.error("Alert email failed:", e);
              }
            }

            if (alertSettings?.webhook_enabled && alertSettings?.webhook_url && alertRow) {
              try {
                await fetch(alertSettings.webhook_url, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    event: "price_change",
                    product: { id: product.id, name: product.name, url: product.url },
                    oldPrice, newPrice,
                    changePercent: Math.round(changePercent * 100) / 100,
                    currency: result.data.currency,
                    timestamp: new Date().toISOString(),
                  }),
                });
                await admin.from("alerts").update({ notified_webhook: true }).eq("id", alertRow.id);
              } catch (e) {
                console.error("Webhook failed:", e);
              }
            }

            alerts++;
          }
        }
      }

      await admin.from("products").update(updateData).eq("id", product.id);
    } else {
      await admin.from("products").update({
        scrape_status: "error",
        scrape_error: result.error.message,
        last_scraped_at: new Date().toISOString(),
      }).eq("id", product.id);
    }

    scraped++;
  }

  return { scraped, alerts };
}
```

Then simplify `src/app/api/scrape/batch/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runBatchScrapeForUser } from "@/lib/scraper/batch-scrape";

export const maxDuration = 60;

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runBatchScrapeForUser(user.id);
  return NextResponse.json(result);
}
```

And simplify `src/app/api/cron/scrape/route.ts`:

```typescript
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
  const { data: rows } = await admin
    .from("products")
    .select("user_id");

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
```

**Step 4: Update `vercel.json`**

```json
{
  "framework": "nextjs",
  "regions": ["iad1"],
  "crons": [
    {
      "path": "/api/cron/scrape",
      "schedule": "0 6 * * *"
    }
  ],
  "functions": {
    "src/app/api/stripe/webhook/route.ts": {
      "maxDuration": 30
    },
    "src/app/api/scrape/route.ts": {
      "maxDuration": 30
    },
    "src/app/api/scrape/batch/route.ts": {
      "maxDuration": 60
    },
    "src/app/api/cron/scrape/route.ts": {
      "maxDuration": 60
    }
  }
}
```

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add scrape API routes and Vercel cron job"
```

---

### Task 6: CRUD API routes — competitors and products

**Context:** Server-side API routes for managing competitors and products. Includes usage limit enforcement.

**Files:**
- Create: `src/lib/usage/check-limits.ts`
- Create: `src/app/api/competitors/route.ts`
- Create: `src/app/api/competitors/[id]/route.ts`
- Create: `src/app/api/products/route.ts`
- Create: `src/app/api/products/[id]/route.ts`
- Create: `src/app/api/products/[id]/history/route.ts`
- Remove: `src/app/api/chat/route.ts` (boilerplate AI chat — not needed)
- Remove: `src/app/api/ai/structured/route.ts` (boilerplate — not needed)
- Remove: `src/components/ai/chat.tsx` (boilerplate — not needed)
- Remove: `src/app/(dashboard)/ai-chat/page.tsx` (boilerplate — not needed)

**Step 1: Create `src/lib/usage/check-limits.ts`**

```typescript
import { createServerClient } from "@supabase/ssr";
import { getUserPlan, checkLimit } from "@/lib/stripe/plans";

function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

export async function canAddCompetitor(userId: string): Promise<{ allowed: boolean; message?: string }> {
  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("subscription_plan").eq("id", userId).single();
  const plan = getUserPlan(profile?.subscription_plan ?? null);

  const { count } = await admin.from("competitors").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("status", "active");
  const { allowed, remaining } = checkLimit(count ?? 0, plan.limits.maxCompetitors);

  if (!allowed) return { allowed: false, message: `${plan.name} plan allows ${plan.limits.maxCompetitors} competitors. Upgrade for more.` };
  return { allowed: true };
}

export async function canAddProduct(userId: string): Promise<{ allowed: boolean; message?: string }> {
  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("subscription_plan").eq("id", userId).single();
  const plan = getUserPlan(profile?.subscription_plan ?? null);

  const { count } = await admin.from("products").select("*", { count: "exact", head: true }).eq("user_id", userId);
  const { allowed, remaining } = checkLimit(count ?? 0, plan.limits.maxProducts);

  if (!allowed) return { allowed: false, message: `${plan.name} plan allows ${plan.limits.maxProducts} products. Upgrade for more.` };
  return { allowed: true };
}

export async function canGenerateAiStrategy(userId: string): Promise<{ allowed: boolean; message?: string }> {
  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("subscription_plan").eq("id", userId).single();
  const plan = getUserPlan(profile?.subscription_plan ?? null);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count } = await admin.from("ai_generations").select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfMonth.toISOString());

  const { allowed } = checkLimit(count ?? 0, plan.limits.maxAiGenerations);

  if (!allowed) return { allowed: false, message: `${plan.name} plan allows ${plan.limits.maxAiGenerations} AI reports/month. Upgrade for more.` };
  return { allowed: true };
}
```

**Step 2: Create `src/app/api/competitors/route.ts`**

```typescript
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
```

**Step 3: Create `src/app/api/competitors/[id]/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  website_url: z.string().url().optional(),
  status: z.enum(["active", "paused"]).optional(),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("competitors")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const { data, error } = await supabase
    .from("competitors")
    .update(parsed.data)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("competitors")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
```

**Step 4: Create `src/app/api/products/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { canAddProduct } from "@/lib/usage/check-limits";
import { z } from "zod";

const createSchema = z.object({
  competitor_id: z.string().uuid(),
  name: z.string().min(1).max(200),
  url: z.string().url(),
  css_selector: z.string().max(500).optional(),
});

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const competitorId = url.searchParams.get("competitor_id");

  let query = supabase
    .from("products")
    .select("*, competitors(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (competitorId) {
    query = query.eq("competitor_id", competitorId);
  }

  const { data, error } = await query;
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

  const limitCheck = await canAddProduct(user.id);
  if (!limitCheck.allowed) return NextResponse.json({ error: limitCheck.message }, { status: 403 });

  // Verify competitor belongs to user
  const { data: competitor } = await supabase
    .from("competitors")
    .select("id")
    .eq("id", parsed.data.competitor_id)
    .eq("user_id", user.id)
    .single();

  if (!competitor) return NextResponse.json({ error: "Competitor not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("products")
    .insert({
      user_id: user.id,
      competitor_id: parsed.data.competitor_id,
      name: parsed.data.name,
      url: parsed.data.url,
      css_selector: parsed.data.css_selector || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
```

**Step 5: Create `src/app/api/products/[id]/route.ts` and `src/app/api/products/[id]/history/route.ts`**

Products [id] route: GET single, PUT update, DELETE. History route: GET with date range filter.

```typescript
// src/app/api/products/[id]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  url: z.string().url().optional(),
  css_selector: z.string().max(500).nullable().optional(),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("products")
    .select("*, competitors(name, website_url)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const { data, error } = await supabase
    .from("products")
    .update(parsed.data)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await supabase.from("products").delete().eq("id", id).eq("user_id", user.id);
  return NextResponse.json({ success: true });
}
```

```typescript
// src/app/api/products/[id]/history/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify product belongs to user
  const { data: product } = await supabase
    .from("products")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const url = new URL(req.url);
  const days = parseInt(url.searchParams.get("days") || "30");
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from("price_history")
    .select("*")
    .eq("product_id", id)
    .gte("scraped_at", since.toISOString())
    .order("scraped_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
```

**Step 6: Create alerts API routes**

```typescript
// src/app/api/alerts/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") || "50");
  const type = url.searchParams.get("type"); // price_drop | price_increase

  let query = supabase
    .from("alerts")
    .select("*, products(name, url, competitors(name))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (type) query = query.eq("alert_type", type);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
```

```typescript
// src/app/api/alerts/[id]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { read } = await req.json();

  const { data, error } = await supabase
    .from("alerts")
    .update({ read: !!read })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data });
}
```

```typescript
// src/app/api/alert-settings/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/stripe/plans";
import { z } from "zod";

const updateSchema = z.object({
  email_enabled: z.boolean().optional(),
  webhook_url: z.string().url().nullable().optional(),
  webhook_enabled: z.boolean().optional(),
  threshold_percent: z.number().min(0.1).max(100).optional(),
  notify_price_drop: z.boolean().optional(),
  notify_price_increase: z.boolean().optional(),
});

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("alert_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return NextResponse.json({ data });
}

export async function PUT(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  // Check webhook permission
  if (parsed.data.webhook_enabled) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_plan")
      .eq("id", user.id)
      .single();
    const plan = getUserPlan(profile?.subscription_plan ?? null);
    if (!plan.limits.webhookEnabled) {
      return NextResponse.json({ error: "Webhook alerts require Pro plan or higher" }, { status: 403 });
    }
  }

  const { data, error } = await supabase
    .from("alert_settings")
    .update(parsed.data)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
```

**Step 7: Remove boilerplate AI chat files**

Delete these files that are not needed for PriceWise:
- `src/app/api/chat/route.ts`
- `src/app/api/ai/structured/route.ts`
- `src/components/ai/chat.tsx`
- `src/app/(dashboard)/ai-chat/page.tsx`

**Step 8: Commit**

```bash
git add -A
git commit -m "feat: add CRUD API routes for competitors, products, alerts with usage limits"
```

---

### Task 7: AI strategy API route

**Context:** Users select products to analyze, Claude Haiku examines price history and generates pricing strategy recommendations.

**Files:**
- Create: `src/app/api/ai/strategy/route.ts`

**Step 1: Create the route**

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";
import { canGenerateAiStrategy } from "@/lib/usage/check-limits";
import { getModel } from "@/lib/ai/providers";
import { generateText } from "ai";
import { z } from "zod";

export const maxDuration = 60;

const schema = z.object({
  productIds: z.array(z.string().uuid()).min(1).max(20),
});

function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  // Check AI generation limit
  const limitCheck = await canGenerateAiStrategy(user.id);
  if (!limitCheck.allowed) return NextResponse.json({ error: limitCheck.message }, { status: 403 });

  // Fetch products with price history
  const { data: products } = await supabase
    .from("products")
    .select("id, name, url, current_price, previous_price, currency, competitors(name)")
    .in("id", parsed.data.productIds)
    .eq("user_id", user.id);

  if (!products?.length) return NextResponse.json({ error: "No products found" }, { status: 404 });

  // Fetch recent price history for each product (last 90 days)
  const since = new Date();
  since.setDate(since.getDate() - 90);

  const { data: history } = await supabase
    .from("price_history")
    .select("product_id, price, currency, scraped_at")
    .in("product_id", parsed.data.productIds)
    .gte("scraped_at", since.toISOString())
    .order("scraped_at", { ascending: true });

  // Build prompt
  const productSummaries = products.map((p) => {
    const productHistory = (history || [])
      .filter((h) => h.product_id === p.id)
      .map((h) => `  ${new Date(h.scraped_at).toLocaleDateString()}: ${h.currency} ${h.price}`);

    return `**${p.name}** (${(p.competitors as { name: string })?.name || "Unknown"})
Current: ${p.currency} ${p.current_price}${p.previous_price ? ` | Previous: ${p.currency} ${p.previous_price}` : ""}
URL: ${p.url}
Price History (last 90 days):
${productHistory.length > 0 ? productHistory.join("\n") : "  No history yet"}`;
  }).join("\n\n");

  const prompt = `You are a pricing strategy analyst for e-commerce businesses. Analyze the following competitor product data and provide actionable pricing recommendations.

## Competitor Products

${productSummaries}

## Analysis Required

1. **Market Position**: Where do these products sit in the competitive landscape?
2. **Price Trends**: What patterns do you see in the price history? (seasonal, promotional, steady)
3. **Competitive Gaps**: Are there pricing opportunities or risks?
4. **Recommended Actions**: Specific pricing recommendations with rationale
5. **Risk Assessment**: What to watch out for

Keep the analysis practical and actionable. Focus on data-driven insights, not generic advice.`;

  const { text, usage } = await generateText({
    model: getModel("anthropic:fast"),
    prompt,
    maxTokens: 2000,
  });

  // Save generation
  const admin = createAdminClient();
  await admin.from("ai_generations").insert({
    user_id: user.id,
    prompt_summary: `Strategy analysis for ${products.length} products`,
    result: text,
    tokens_used: (usage?.promptTokens ?? 0) + (usage?.completionTokens ?? 0),
  });

  return NextResponse.json({ strategy: text, productsAnalyzed: products.length });
}
```

**Step 2: Update `vercel.json` to add maxDuration for this route**

Add to functions:
```json
"src/app/api/ai/strategy/route.ts": {
  "maxDuration": 60
}
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add AI strategy generation route with Claude Haiku"
```

---

### Task 8: Dashboard sidebar and navigation

**Context:** Update the sidebar navigation from the boilerplate (Dashboard, AI Chat) to PriceWise-specific pages (Dashboard, Competitors, Products, Alerts, AI Strategy). Update middleware matcher.

**Files:**
- Modify: `src/components/dashboard/app-sidebar.tsx`
- Modify: `src/middleware.ts`

**Step 1: Update `src/components/dashboard/app-sidebar.tsx`**

Replace the navigation arrays:

```typescript
import {
  LayoutDashboard,
  Building2,
  Package,
  Bell,
  Brain,
  Settings,
  CreditCard,
  Key,
  Shield,
} from "lucide-react";

const mainNav = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Competitors", href: "/dashboard/competitors", icon: Building2 },
  { title: "Products", href: "/dashboard/products", icon: Package },
  { title: "Alerts", href: "/dashboard/alerts", icon: Bell },
  { title: "AI Strategy", href: "/dashboard/strategy", icon: Brain },
];
```

Settings and admin nav stay the same.

**Step 2: Update `src/middleware.ts`**

Add the new API routes to the matcher:

```typescript
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/auth/:path*",
    "/api/competitors/:path*",
    "/api/products/:path*",
    "/api/alerts/:path*",
    "/api/alert-settings/:path*",
    "/api/scrape/:path*",
    "/api/ai/:path*",
  ],
};
```

Note: `/api/cron/scrape` intentionally NOT in matcher — it uses Bearer token auth, not cookies.

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: update sidebar navigation and middleware for PriceWise"
```

---

### Task 9: Dashboard page with stats and alerts

**Context:** Replace the boilerplate dashboard with PriceWise-specific stats cards (competitors, products, price changes, alerts) and recent alerts list.

**Files:**
- Modify: `src/app/(dashboard)/dashboard/page.tsx`
- Modify: `src/components/dashboard/stats-cards.tsx`

**Step 1: Rewrite `src/components/dashboard/stats-cards.tsx`**

```typescript
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
```

**Step 2: Rewrite `src/app/(dashboard)/dashboard/page.tsx`**

Server component that fetches stats and recent alerts.

```typescript
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
                      <p className="text-sm font-medium">{(alert.products as { name: string })?.name}</p>
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
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add PriceWise dashboard with stats and alerts"
```

---

### Task 10: Competitors page

**Context:** CRUD interface for managing competitors. List view with add dialog, status toggle, and delete.

**Files:**
- Create: `src/app/(dashboard)/dashboard/competitors/page.tsx`

**Step 1: Create the competitors page**

Client component with:
- Table: name, website, product count, status toggle, actions (edit/delete)
- "Add Competitor" button → Dialog with name + website_url
- Status toggle calls PUT /api/competitors/[id]
- Delete calls DELETE /api/competitors/[id]
- Fetches data from GET /api/competitors on mount

Use shadcn/ui Table, Dialog, Button, Input, Badge components. Include loading skeleton state. Show toast on success/error.

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add competitors management page"
```

---

### Task 11: Products page + add product with price preview

**Context:** Products list page with add product modal that includes "Preview Price" to test scraping before saving.

**Files:**
- Create: `src/app/(dashboard)/dashboard/products/page.tsx`

**Step 1: Create the products page**

Client component with:
- Table: product name, competitor name, current price, price change %, last scraped, scrape status
- Filter dropdown by competitor
- "Add Product" button → Dialog with: competitor select, URL input, optional CSS selector, "Preview Price" button
- Preview button calls POST /api/scrape → shows extracted price, method used (JSON-LD/OG/selector), product name
- "Save Product" calls POST /api/products
- "Scan Now" button calls POST /api/scrape/batch and shows progress

Use shadcn/ui Table, Dialog, Select, Button, Input, Badge. Show loading states and errors. Format prices with currency.

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add products page with price preview"
```

---

### Task 12: Product detail page with price history chart

**Context:** Individual product page showing price history as a Recharts line chart plus a table of all recorded prices.

**Files:**
- Create: `src/app/(dashboard)/dashboard/products/[id]/page.tsx`

**Step 1: Install recharts**

```bash
npm install recharts
```

**Step 2: Create the product detail page**

Mixed server/client component:
- Server: fetch product data and price history
- Client: Recharts LineChart for price over time, time range toggle (30/60/90 days)
- Price change log table (all recorded prices from newest to oldest)
- Back button to products list
- "Scan Now" button to re-scrape this single product

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add product detail page with price history chart"
```

---

### Task 13: Alerts page

**Context:** Alert feed showing all price change alerts with filtering, mark as read, and alert settings configuration.

**Files:**
- Create: `src/app/(dashboard)/dashboard/alerts/page.tsx`

**Step 1: Create the alerts page**

Client component with:
- Alert feed: list of cards showing product name, competitor, old→new price, change %, timestamp
- "Mark as Read" button on each alert
- "Mark All Read" button
- Filter by type: All, Price Drops, Price Increases
- Alert Settings panel (collapsible Card):
  - Email enabled toggle
  - Webhook URL input + enabled toggle (show upgrade message if plan doesn't support)
  - Threshold % input
  - Notify on price drops toggle
  - Notify on price increases toggle
  - Save Settings button

Fetches from GET /api/alerts and GET/PUT /api/alert-settings.

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add alerts page with feed and settings"
```

---

### Task 14: AI Strategy page

**Context:** Users select products to analyze, Claude generates pricing strategy recommendations.

**Files:**
- Create: `src/app/(dashboard)/dashboard/strategy/page.tsx`

**Step 1: Create the strategy page**

Client component with:
- Multi-select product picker (checkboxes, grouped by competitor)
- "Generate Strategy" button → calls POST /api/ai/strategy
- Results displayed as formatted markdown (use a simple markdown renderer or just render sections with headings)
- Loading state while AI generates
- Past generations list (fetched from ai_generations table)
- Show usage: "X/Y AI reports used this month"

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add AI strategy page with product analysis"
```

---

### Task 15: Settings page updates

**Context:** Update the settings page to include PriceWise-specific fields (company name, alert email) alongside the existing profile fields.

**Files:**
- Modify: `src/app/(dashboard)/settings/page.tsx` — add company_name and alert_email fields

**Step 1: Update settings page**

Add two new fields to the existing form:
- Company Name (text input, saves to profiles.company_name)
- Alert Email (email input, saves to profiles.alert_email, with helper text "Defaults to your account email if left blank")

Load and save these alongside existing full_name and avatar_url.

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: update settings with company name and alert email"
```

---

### Task 16: Build verification and cleanup

**Context:** Ensure the entire app builds without errors. Clean up any remaining boilerplate references.

**Files:**
- Modify: `src/app/layout.tsx` — verify metadata uses PriceWise name
- Modify: `README.md` — update for PriceWise
- Modify: `.env.example` — add all required env vars

**Step 1: Update `.env.example`**

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PORTAL_CONFIG_ID=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PRICE_ID=
NEXT_PUBLIC_STRIPE_STARTER_YEARLY_PRICE_ID=
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=
NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID=
NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID=
NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID=

# AI
ANTHROPIC_API_KEY=

# Email
RESEND_API_KEY=
EMAIL_FROM=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cron
CRON_SECRET=
```

**Step 2: Run build**

```bash
npm run build
```

Fix any TypeScript errors or build failures.

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: build verification and cleanup"
```

---

### Task 17: Infrastructure setup — Supabase, Vercel, Stripe

**Context:** Create Supabase project, deploy to Vercel, create Stripe products, configure auth. Same pattern as previous apps.

**Step 1: Create Supabase project** (pause an existing one first if needed — free tier max 2 active)

**Step 2: Apply migrations**

Apply all 3 migrations to the new Supabase project:
- 00001_initial_schema.sql
- 00002_admin_rls_policy.sql
- 00003_pricewise_schema.sql

Fix mutable search_path warnings on functions.

**Step 3: Create Stripe products**

Create 3 products with 6 prices:
- Starter: $49/mo, $490/yr
- Professional: $149/mo, $1490/yr
- Business: $299/mo, $2990/yr

**Step 4: Deploy to Vercel**

Link project, set all env vars, deploy.

**Step 5: Configure Supabase auth**

Set site_url, redirect URLs, Google OAuth.

**Step 6: Create Stripe webhook**

Endpoint: `https://<domain>/api/stripe/webhook`
Events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted, invoice.payment_failed

**Step 7: Update `.env.keys`**

Add all App-06 credentials to `.shared/.env.keys`.

**Step 8: Push to GitHub**

Create repo `bufaale/price-monitor`, push.

**Step 9: Commit any remaining changes**

```bash
git add -A
git commit -m "chore: infrastructure setup complete"
```

---

### Task 18: End-to-end testing

**Context:** Verify all major flows work end-to-end.

**Step 1: Manual test checklist**

1. Landing page loads with PriceWise branding
2. Sign up → redirected to dashboard
3. Dashboard shows empty state
4. Add competitor → appears in list
5. Add product with URL → "Preview Price" extracts price correctly
6. Save product → appears in products table
7. "Scan Now" → scrapes all products, shows results
8. Product detail → price history chart renders
9. Alert settings → configure thresholds
10. Price change triggers alert (may need to manually test with different price)
11. AI Strategy → select products → generate → see recommendations
12. Settings → save company name and alert email
13. Billing → upgrade flow works
14. Sign out → redirected to login

**Step 2: Fix any issues found**

**Step 3: Final commit**

```bash
git add -A
git commit -m "chore: final verification and fixes"
```
