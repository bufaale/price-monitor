# PriceWise - AI Competitive Price Monitor Design

## Overview

SaaS tool that lets e-commerce businesses track competitor prices automatically. Users add competitor product URLs, the system scrapes prices daily (+ on-demand), detects changes, sends alerts, and provides AI-powered pricing strategy recommendations.

## Architecture

```
User adds competitor + products
  → Cheerio + fetch scrapes HTML
  → JSON-LD structured data extraction (primary)
  → CSS selector fallback (user-provided)
  → Price stored in Supabase (time-series)

Vercel Cron (daily) + Manual "Scan Now"
  → Triggers scraping for all active products
  → Compares prices with previous values
  → Creates alerts on threshold breach

Alerts
  → Email via Resend
  → Webhook POST to user-configured URL

AI Strategy
  → Claude Haiku analyzes price history
  → Generates positioning + recommendations
```

**Key decisions:**
- No Railway worker — all scraping in Vercel API routes (Cheerio is lightweight)
- No Playwright — most e-commerce sites render prices server-side
- No proxy rotation for MVP — User-Agent rotation + request delays suffice for moderate volumes
- JSON-LD/schema.org first, CSS selector fallback for extraction

## Tech Stack

- Next.js 16 (App Router) + Tailwind CSS 4 + shadcn/ui
- Supabase (PostgreSQL + Auth + RLS)
- Cheerio (HTML parsing) + node-fetch
- Recharts (historical price charts)
- Claude Haiku 4.5 via Vercel AI SDK (AI strategy)
- Stripe (subscriptions)
- Resend (alert emails)

## Data Model

### competitors
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid FK profiles | |
| name | text | e.g., "Amazon" |
| website_url | text | Base URL |
| status | text | active / paused |
| created_at | timestamptz | |

### products
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid FK profiles | |
| competitor_id | uuid FK competitors | |
| name | text | Product name |
| url | text | Product page URL |
| css_selector | text | Fallback selector |
| current_price | numeric(10,2) | Latest price |
| previous_price | numeric(10,2) | Before last change |
| currency | text | USD, EUR, etc. |
| last_scraped_at | timestamptz | |
| scrape_status | text | success / error / pending |
| scrape_error | text | Last error message |
| created_at | timestamptz | |

### price_history
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| product_id | uuid FK products | |
| price | numeric(10,2) | |
| currency | text | |
| scraped_at | timestamptz | Indexed for time-series queries |

### alerts
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid FK profiles | |
| product_id | uuid FK products | |
| alert_type | text | price_drop / price_increase / threshold |
| old_price | numeric(10,2) | |
| new_price | numeric(10,2) | |
| change_percent | numeric(5,2) | |
| notified_email | boolean | |
| notified_webhook | boolean | |
| read | boolean | default false |
| created_at | timestamptz | |

### alert_settings
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid FK profiles | UNIQUE |
| email_enabled | boolean | default true |
| webhook_url | text | nullable |
| webhook_enabled | boolean | default false |
| threshold_percent | numeric(5,2) | default 1.00 (1%) |
| notify_price_drop | boolean | default true |
| notify_price_increase | boolean | default true |

### ai_generations
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid FK profiles | |
| prompt_summary | text | What was analyzed |
| result | text | AI output |
| tokens_used | integer | |
| created_at | timestamptz | |

### Profiles extensions
Add to existing profiles table:
- `company_name text`
- `alert_email text` (defaults to account email)

## Pricing Tiers

| | Starter $49/mo | Pro $149/mo | Business $299/mo |
|---|---|---|---|
| Competitors | 3 | 10 | Unlimited |
| Products | 50 | 300 | Unlimited |
| Scan frequency | Daily | Daily | Daily |
| Price alerts | Email | Email + Webhook | Email + Webhook + API |
| AI Strategy | 3/mo | 15/mo | Unlimited |
| Export | CSV | CSV + API | CSV + API |

## Pages

### Landing Page
- Hero: "Track competitor prices. Stay ahead."
- Features grid, pricing cards, CTA

### Dashboard (`/dashboard`)
- Summary cards: total competitors, products tracked, price changes (24h), alerts unread
- Recent alerts list (last 10)
- Top movers chart (biggest price changes today)

### Competitors (`/dashboard/competitors`)
- Table: name, website, product count, last scraped, status toggle
- Add competitor: name + website URL
- Click → see products for that competitor

### Products (`/dashboard/products`)
- Table: name, competitor, current price, change %, trend sparkline, last scraped, status
- Filter by competitor
- Add product modal: URL + optional name + optional CSS selector → "Preview Price" button

### Product Detail (`/dashboard/products/[id]`)
- Price history chart (Recharts line chart, 30/60/90 day views)
- Price change log (table of all recorded prices)
- Current price vs. your price (if user sets their own price)

### Alerts (`/dashboard/alerts`)
- Alert feed: product name, old→new price, change %, timestamp
- Mark as read
- Filter by type (drop/increase)
- Alert settings panel: thresholds, email toggle, webhook config

### AI Strategy (`/dashboard/strategy`)
- Select products to analyze (multi-select)
- "Generate Strategy" → Claude analyzes price history data
- Shows: positioning analysis, recommended actions, competitor patterns
- History of past generations

### Settings (`/dashboard/settings`)
- Profile: company name, alert email
- Billing: current plan, upgrade/manage via Stripe portal
- API Key: view/regenerate (Business plan only)

## API Routes

### Scraping
- `POST /api/scrape` — Scrape a single product URL (returns extracted price for preview)
- `POST /api/scrape/batch` — Scrape all active products for a user (called by cron + manual)
- `GET /api/cron/scrape` — Vercel cron endpoint (daily), iterates all users with active products

### CRUD
- `GET/POST /api/competitors` — List/create competitors
- `GET/PUT/DELETE /api/competitors/[id]` — Single competitor ops
- `GET/POST /api/products` — List/create products
- `GET/PUT/DELETE /api/products/[id]` — Single product ops
- `GET /api/products/[id]/history` — Price history for a product
- `GET /api/alerts` — List alerts for user
- `PUT /api/alerts/[id]` — Mark alert as read
- `GET/PUT /api/alert-settings` — Get/update alert settings

### AI
- `POST /api/ai/strategy` — Generate pricing strategy from selected products

### Stripe
- `POST /api/stripe/checkout` — Create checkout session
- `POST /api/stripe/webhook` — Handle Stripe events
- `POST /api/stripe/portal` — Create portal session

### Auth
- `POST /api/auth/callback` — Supabase auth callback
- `POST /api/auth/signout` — Sign out

## Scraping Logic

```
1. Fetch HTML (randomized User-Agent, 2s delay between requests)
2. Parse with Cheerio
3. Look for JSON-LD: <script type="application/ld+json">
   → Find @type: "Product" with offers.price or offers.lowPrice
4. If no JSON-LD → try Open Graph: <meta property="product:price:amount">
5. If no OG → use user-provided CSS selector
6. Parse price string: strip currency symbols, commas → numeric
7. Detect currency from JSON-LD, OG, or page content
8. Return { price, currency, method: "json-ld" | "og" | "selector" }
```

## Alert Flow

```
1. After scraping, compare new price with products.current_price
2. Calculate change_percent
3. If abs(change_percent) >= user's threshold_percent:
   a. Insert into alerts table
   b. Update products.previous_price = old current, current_price = new
   c. If email_enabled → send via Resend (inline, no queue)
   d. If webhook_enabled → POST to webhook_url
4. If no change or below threshold:
   a. Just update products.last_scraped_at
```

## Usage Limits Enforcement

Check limits on:
- Adding competitor: count user's active competitors vs plan limit
- Adding product: count user's active products vs plan limit
- AI strategy: count ai_generations this month vs plan limit
- API access: check plan allows API (Business only)

Limits defined in `src/config/plans.ts` alongside Stripe price IDs.
