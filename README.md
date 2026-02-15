# PriceWise

> AI-powered competitive price monitoring. Track competitor prices, get instant alerts, and optimize your pricing strategy.

## Features

- **Price Monitoring** -- Track competitor product prices with automated scraping
- **Smart Extraction** -- JSON-LD first, CSS selector fallback for reliable price detection
- **AI Insights** -- Claude-powered pricing strategy recommendations
- **Price Alerts** -- Email + webhook notifications on price changes
- **Price History** -- Charts and trends over time
- **Dashboard** -- Beautiful sidebar layout with dark/light mode
- **Authentication** -- Supabase Auth (email, Google OAuth)
- **Payments** -- Stripe subscriptions (Starter / Pro / Business)
- **Admin Panel** -- User management and subscription stats

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Auth | Supabase Auth |
| Database | Supabase (PostgreSQL + RLS) |
| Payments | Stripe |
| AI | Vercel AI SDK 6 + Claude |
| Email | Resend |
| Scraping | Cheerio |
| Deploy | Vercel |

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/bufaale/price-monitor.git
   cd price-monitor
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your API keys (see `.env.example` for all required variables).

3. **Set up Supabase**
   - Create a project at [supabase.com](https://supabase.com)
   - Run migrations from `supabase/migrations/` in the SQL Editor
   - Enable Google OAuth in Authentication > Providers

4. **Set up Stripe**
   - Create products (Starter, Pro, Business) and prices in Stripe Dashboard
   - Add price IDs to `.env.local`
   - Set up webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

5. **Start development**
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── app/
│   ├── (marketing)/     # Landing page
│   ├── (auth)/          # Login, signup, forgot password
│   ├── (dashboard)/     # Protected dashboard pages
│   └── api/             # API routes
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── landing/         # Landing page sections
│   ├── dashboard/       # Dashboard components
│   └── auth/            # Auth forms
├── lib/
│   ├── supabase/        # Supabase clients
│   ├── stripe/          # Stripe utilities
│   ├── ai/              # AI providers + rate limiting
│   ├── scraper/         # Price scraping engine
│   └── email/           # Resend email templates
├── config/              # Site + plans configuration
└── types/               # TypeScript types
```

## License

MIT
