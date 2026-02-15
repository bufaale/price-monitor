"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  Bell,
  BellOff,
  CheckCheck,
  Loader2,
  Mail,
  Save,
  Settings2,
  Webhook,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Alert {
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
  products?: { name: string; url: string; competitors?: { name: string } };
}

interface AlertSettings {
  id: string;
  user_id: string;
  email_enabled: boolean;
  webhook_url: string | null;
  webhook_enabled: boolean;
  threshold_percent: number;
  notify_price_drop: boolean;
  notify_price_increase: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  const diffMonth = Math.floor(diffDay / 30);
  return `${diffMonth}mo ago`;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AlertsPage() {
  // Alert feed state
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  // Settings state
  const [settings, setSettings] = useState<AlertSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Editable settings (local form state)
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [thresholdPercent, setThresholdPercent] = useState("1");
  const [notifyPriceDrop, setNotifyPriceDrop] = useState(true);
  const [notifyPriceIncrease, setNotifyPriceIncrease] = useState(true);

  // ---------------------------------------------------------------------------
  // Fetch alerts
  // ---------------------------------------------------------------------------

  const fetchAlerts = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (filterType === "price_drop" || filterType === "price_increase") {
        params.set("type", filterType);
      }
      const res = await fetch(`/api/alerts?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch alerts");
      setAlerts(json.data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load alerts",
      );
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  useEffect(() => {
    setLoading(true);
    fetchAlerts();
  }, [fetchAlerts]);

  // ---------------------------------------------------------------------------
  // Fetch settings
  // ---------------------------------------------------------------------------

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/alert-settings");
      const json = await res.json();
      if (!res.ok)
        throw new Error(json.error || "Failed to fetch alert settings");
      if (json.data) {
        setSettings(json.data);
        setEmailEnabled(json.data.email_enabled);
        setWebhookUrl(json.data.webhook_url ?? "");
        setWebhookEnabled(json.data.webhook_enabled);
        setThresholdPercent(String(json.data.threshold_percent));
        setNotifyPriceDrop(json.data.notify_price_drop);
        setNotifyPriceIncrease(json.data.notify_price_increase);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load settings",
      );
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // ---------------------------------------------------------------------------
  // Mark single alert as read
  // ---------------------------------------------------------------------------

  async function markAsRead(alertId: string) {
    setMarkingId(alertId);
    try {
      const res = await fetch(`/api/alerts/${alertId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update alert");
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, read: true } : a)),
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to mark as read",
      );
    } finally {
      setMarkingId(null);
    }
  }

  // ---------------------------------------------------------------------------
  // Mark all as read
  // ---------------------------------------------------------------------------

  async function markAllRead() {
    const unread = alerts.filter((a) => !a.read);
    if (unread.length === 0) return;

    setMarkingAllRead(true);
    try {
      await Promise.all(
        unread.map((a) =>
          fetch(`/api/alerts/${a.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ read: true }),
          }),
        ),
      );
      setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
      toast.success(`${unread.length} alert${unread.length !== 1 ? "s" : ""} marked as read`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to mark all as read",
      );
    } finally {
      setMarkingAllRead(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Save settings
  // ---------------------------------------------------------------------------

  async function handleSaveSettings() {
    setSavingSettings(true);
    try {
      const threshold = parseFloat(thresholdPercent);
      if (isNaN(threshold) || threshold < 0.1 || threshold > 100) {
        toast.error("Threshold must be between 0.1 and 100");
        setSavingSettings(false);
        return;
      }

      const body: Record<string, unknown> = {
        email_enabled: emailEnabled,
        webhook_url: webhookUrl.trim() || null,
        webhook_enabled: webhookEnabled,
        threshold_percent: threshold,
        notify_price_drop: notifyPriceDrop,
        notify_price_increase: notifyPriceIncrease,
      };

      const res = await fetch("/api/alert-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save settings");
      setSettings(json.data);
      toast.success("Alert settings saved");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save settings",
      );
    } finally {
      setSavingSettings(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Derived
  // ---------------------------------------------------------------------------

  const unreadCount = alerts.filter((a) => !a.read).length;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Alerts</h1>
        <p className="mt-1 text-muted-foreground">
          Price change notifications and alert settings
        </p>
      </div>

      {/* Alert Feed */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Alert Feed
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount} unread
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Recent price change alerts</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            {/* Filter */}
            <div className="w-[180px]">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All alerts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All alerts</SelectItem>
                  <SelectItem value="price_drop">Price Drops</SelectItem>
                  <SelectItem value="price_increase">
                    Price Increases
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mark All Read */}
            <Button
              variant="outline"
              size="sm"
              onClick={markAllRead}
              disabled={markingAllRead || unreadCount === 0}
            >
              {markingAllRead ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCheck className="mr-2 h-4 w-4" />
              )}
              Mark All Read
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BellOff className="h-10 w-10 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium">No alerts yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {filterType !== "all"
                  ? "No alerts matching this filter. Try a different filter."
                  : "Price change alerts will appear here when competitor prices change."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => {
                const isPriceDrop = alert.alert_type === "price_drop";
                const productName =
                  alert.products?.name ?? "Unknown Product";
                const competitorName =
                  alert.products?.competitors?.name ?? "Unknown";

                return (
                  <div
                    key={alert.id}
                    className={`flex items-center gap-4 rounded-lg border p-4 transition-colors ${
                      alert.read
                        ? "bg-background opacity-70"
                        : "bg-muted/30 border-primary/20"
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        isPriceDrop
                          ? "bg-green-100 dark:bg-green-900/30"
                          : "bg-red-100 dark:bg-red-900/30"
                      }`}
                    >
                      {isPriceDrop ? (
                        <ArrowDown className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <ArrowUp className="h-5 w-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {productName}
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          {competitorName}
                        </span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(alert.old_price)} &rarr;{" "}
                        {formatPrice(alert.new_price)}
                      </p>
                    </div>

                    {/* Change badge */}
                    <Badge
                      variant={isPriceDrop ? "default" : "destructive"}
                      className="shrink-0"
                    >
                      {alert.change_percent > 0 ? "+" : ""}
                      {alert.change_percent.toFixed(1)}%
                    </Badge>

                    {/* Timestamp */}
                    <span className="hidden sm:block shrink-0 text-xs text-muted-foreground w-16 text-right">
                      {relativeTime(alert.created_at)}
                    </span>

                    {/* Mark as read */}
                    {!alert.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0"
                        onClick={() => markAsRead(alert.id)}
                        disabled={markingId === alert.id}
                      >
                        {markingId === alert.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Mark Read"
                        )}
                      </Button>
                    )}
                    {alert.read && (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        Read
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Alert Settings
          </CardTitle>
          <CardDescription>
            Configure how and when you receive price change notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {settingsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-6 w-10" />
                </div>
              ))}
            </div>
          ) : !settings ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Alert settings not found. They will be created when you save.
            </p>
          ) : (
            <div className="space-y-6">
              {/* Email notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="email-toggle" className="text-sm font-medium">
                      Email Notifications
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Receive alerts via email
                    </p>
                  </div>
                </div>
                <Switch
                  id="email-toggle"
                  checked={emailEnabled}
                  onCheckedChange={setEmailEnabled}
                />
              </div>

              <Separator />

              {/* Webhook */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Webhook className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label
                        htmlFor="webhook-toggle"
                        className="text-sm font-medium"
                      >
                        Webhook Notifications
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Send alerts to a webhook URL
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="webhook-toggle"
                    checked={webhookEnabled}
                    onCheckedChange={setWebhookEnabled}
                  />
                </div>
                {webhookEnabled && (
                  <div className="ml-7 space-y-2">
                    <Label htmlFor="webhook-url" className="text-xs">
                      Webhook URL
                    </Label>
                    <Input
                      id="webhook-url"
                      type="url"
                      placeholder="https://hooks.example.com/alerts"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <Separator />

              {/* Threshold */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label htmlFor="threshold" className="text-sm font-medium">
                    Threshold Percentage
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Only alert when price changes by at least this percentage
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    id="threshold"
                    type="number"
                    min="0.1"
                    max="100"
                    step="0.1"
                    className="w-24 text-right"
                    value={thresholdPercent}
                    onChange={(e) => setThresholdPercent(e.target.value)}
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>

              <Separator />

              {/* Notify on drops */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ArrowDown className="h-4 w-4 text-green-600" />
                  <div>
                    <Label
                      htmlFor="notify-drops"
                      className="text-sm font-medium"
                    >
                      Notify on Price Drops
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Get alerted when prices decrease
                    </p>
                  </div>
                </div>
                <Switch
                  id="notify-drops"
                  checked={notifyPriceDrop}
                  onCheckedChange={setNotifyPriceDrop}
                />
              </div>

              {/* Notify on increases */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ArrowUp className="h-4 w-4 text-red-600" />
                  <div>
                    <Label
                      htmlFor="notify-increases"
                      className="text-sm font-medium"
                    >
                      Notify on Price Increases
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Get alerted when prices increase
                    </p>
                  </div>
                </div>
                <Switch
                  id="notify-increases"
                  checked={notifyPriceIncrease}
                  onCheckedChange={setNotifyPriceIncrease}
                />
              </div>

              <Separator />

              {/* Save button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                >
                  {savingSettings ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Settings
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
