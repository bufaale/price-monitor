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
