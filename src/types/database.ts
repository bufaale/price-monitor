export interface Profile {
  [key: string]: unknown;
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  stripe_customer_id: string | null;
  subscription_status: "active" | "trialing" | "past_due" | "canceled" | "free";
  subscription_plan: string | null;
  company_name: string | null;
  alert_email: string | null;
  api_key: string | null;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  [key: string]: unknown;
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  status: "active" | "trialing" | "past_due" | "canceled" | "incomplete";
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface AiUsage {
  [key: string]: unknown;
  id: string;
  user_id: string;
  tokens_used: number;
  model: string;
  created_at: string;
}

export interface Competitor {
  [key: string]: unknown;
  id: string;
  user_id: string;
  name: string;
  website_url: string;
  status: "active" | "paused";
  created_at: string;
}

export interface Product {
  [key: string]: unknown;
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
  [key: string]: unknown;
  id: string;
  product_id: string;
  price: number;
  currency: string;
  scraped_at: string;
}

export interface Alert {
  [key: string]: unknown;
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
  [key: string]: unknown;
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
  [key: string]: unknown;
  id: string;
  user_id: string;
  prompt_summary: string;
  result: string;
  tokens_used: number;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          [key: string]: unknown;
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          stripe_customer_id?: string | null;
          subscription_status?: "active" | "trialing" | "past_due" | "canceled" | "free";
          subscription_plan?: string | null;
          company_name?: string | null;
          alert_email?: string | null;
          api_key?: string | null;
          role?: "user" | "admin";
        };
        Update: {
          [key: string]: unknown;
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          stripe_customer_id?: string | null;
          subscription_status?: "active" | "trialing" | "past_due" | "canceled" | "free";
          subscription_plan?: string | null;
          company_name?: string | null;
          alert_email?: string | null;
          api_key?: string | null;
          role?: "user" | "admin";
          updated_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: Subscription;
        Insert: {
          [key: string]: unknown;
          user_id: string;
          stripe_subscription_id: string;
          stripe_price_id: string;
          status: "active" | "trialing" | "past_due" | "canceled" | "incomplete";
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end?: boolean;
        };
        Update: {
          [key: string]: unknown;
          user_id?: string;
          stripe_subscription_id?: string;
          stripe_price_id?: string;
          status?: "active" | "trialing" | "past_due" | "canceled" | "incomplete" | string;
          current_period_start?: string;
          current_period_end?: string;
          cancel_at_period_end?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      ai_usage: {
        Row: AiUsage;
        Insert: {
          [key: string]: unknown;
          user_id: string;
          tokens_used: number;
          model: string;
        };
        Update: {
          [key: string]: unknown;
        };
        Relationships: [];
      };
      competitors: {
        Row: Competitor;
        Insert: {
          [key: string]: unknown;
          user_id: string;
          name: string;
          website_url: string;
          status?: "active" | "paused";
        };
        Update: {
          [key: string]: unknown;
          name?: string;
          website_url?: string;
          status?: "active" | "paused";
        };
        Relationships: [];
      };
      products: {
        Row: Product;
        Insert: {
          [key: string]: unknown;
          user_id: string;
          competitor_id: string;
          name: string;
          url: string;
          css_selector?: string | null;
        };
        Update: {
          [key: string]: unknown;
          name?: string;
          url?: string;
          css_selector?: string | null;
          current_price?: number | null;
          previous_price?: number | null;
          currency?: string;
          last_scraped_at?: string | null;
          scrape_status?: "success" | "error" | "pending";
          scrape_error?: string | null;
        };
        Relationships: [];
      };
      price_history: {
        Row: PriceHistory;
        Insert: {
          [key: string]: unknown;
          product_id: string;
          price: number;
          currency: string;
          scraped_at?: string;
        };
        Update: {
          [key: string]: unknown;
        };
        Relationships: [];
      };
      alerts: {
        Row: Alert;
        Insert: {
          [key: string]: unknown;
          user_id: string;
          product_id: string;
          alert_type: "price_drop" | "price_increase";
          old_price: number;
          new_price: number;
          change_percent: number;
          notified_email?: boolean;
          notified_webhook?: boolean;
          read?: boolean;
        };
        Update: {
          [key: string]: unknown;
          read?: boolean;
          notified_email?: boolean;
          notified_webhook?: boolean;
        };
        Relationships: [];
      };
      alert_settings: {
        Row: AlertSettings;
        Insert: {
          [key: string]: unknown;
          user_id: string;
          email_enabled?: boolean;
          webhook_url?: string | null;
          webhook_enabled?: boolean;
          threshold_percent?: number;
          notify_price_drop?: boolean;
          notify_price_increase?: boolean;
        };
        Update: {
          [key: string]: unknown;
          email_enabled?: boolean;
          webhook_url?: string | null;
          webhook_enabled?: boolean;
          threshold_percent?: number;
          notify_price_drop?: boolean;
          notify_price_increase?: boolean;
        };
        Relationships: [];
      };
      ai_generations: {
        Row: AiGeneration;
        Insert: {
          [key: string]: unknown;
          user_id: string;
          prompt_summary: string;
          result: string;
          tokens_used: number;
        };
        Update: {
          [key: string]: unknown;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}
