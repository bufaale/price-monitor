"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Competitor {
  name: string;
  website_url: string;
}

interface Product {
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
  competitors?: Competitor;
}

interface PriceHistory {
  id: string;
  product_id: string;
  price: number;
  currency: string;
  scraped_at: string;
}

interface ChartDataPoint {
  date: string;
  price: number;
  fullDate: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatPrice(price: number | null, currency = "USD"): string {
  if (price === null || price === undefined) return "--";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatFullDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function relativeTime(dateStr: string | null): string {
  if (!dateStr) return "Never";
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

function getCurrencySymbol(currency: string): string {
  try {
    const parts = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).formatToParts(0);
    const symbolPart = parts.find((p) => p.type === "currency");
    return symbolPart?.value ?? "$";
  } catch {
    return "$";
  }
}

// ---------------------------------------------------------------------------
// Custom Tooltip for Recharts
// ---------------------------------------------------------------------------

interface TooltipPayload {
  value: number;
  payload: ChartDataPoint;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  currency: string;
}

function ChartTooltip({ active, payload, currency }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0];
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
      <p className="text-xs text-muted-foreground">{data.payload.fullDate}</p>
      <p className="text-sm font-semibold">
        {formatPrice(data.value, currency)}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Time Range Options
// ---------------------------------------------------------------------------

const TIME_RANGES = [
  { label: "30 days", value: 30 },
  { label: "60 days", value: 60 },
  { label: "90 days", value: 90 },
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const productId = params.id;

  // Data state
  const [product, setProduct] = useState<Product | null>(null);
  const [history, setHistory] = useState<PriceHistory[]>([]);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Time range
  const [days, setDays] = useState<number>(30);

  // Scan
  const [scanning, setScanning] = useState(false);

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------

  const fetchProduct = useCallback(async () => {
    try {
      const res = await fetch(`/api/products/${productId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch product");
      setProduct(json.data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load product",
      );
    } finally {
      setLoadingProduct(false);
    }
  }, [productId]);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch(
        `/api/products/${productId}/history?days=${days}`,
      );
      const json = await res.json();
      if (!res.ok)
        throw new Error(json.error || "Failed to fetch price history");
      setHistory(json.data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load price history",
      );
    } finally {
      setLoadingHistory(false);
    }
  }, [productId, days]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // ---------------------------------------------------------------------------
  // Scan Now (single product)
  // ---------------------------------------------------------------------------

  async function handleScanNow() {
    if (!product) return;
    setScanning(true);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: product.url,
          cssSelector: product.css_selector || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Scan failed");
      toast.success(
        `Price scraped: ${formatPrice(json.data.price, json.data.currency)}`,
      );
      // Refresh product data and history
      await Promise.all([fetchProduct(), fetchHistory()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setScanning(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Chart data
  // ---------------------------------------------------------------------------

  const chartData: ChartDataPoint[] = history.map((h) => ({
    date: formatShortDate(h.scraped_at),
    price: h.price,
    fullDate: formatFullDate(h.scraped_at),
  }));

  const priceChange =
    product?.current_price !== null &&
    product?.previous_price !== null &&
    product?.previous_price !== 0
      ? (((product!.current_price! - product!.previous_price!) /
          product!.previous_price!) *
          100)
      : null;

  // ---------------------------------------------------------------------------
  // Status badge
  // ---------------------------------------------------------------------------

  function statusBadge(status: Product["scrape_status"]) {
    switch (status) {
      case "success":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">
            Success
          </Badge>
        );
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400">
            Pending
          </Badge>
        );
    }
  }

  // ---------------------------------------------------------------------------
  // Loading skeleton
  // ---------------------------------------------------------------------------

  if (loadingProduct) {
    return (
      <div className="space-y-8">
        {/* Back button skeleton */}
        <Skeleton className="h-9 w-36" />

        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>

        {/* Chart card skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <div className="flex gap-2 mt-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>

        {/* Info card skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-32" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* History table skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-36" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-medium">Product not found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          This product may have been deleted or you don&apos;t have access.
        </p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </Button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-8">
      {/* Back button */}
      <Button variant="ghost" asChild>
        <Link href="/dashboard/products">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Link>
      </Button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="mt-1 text-muted-foreground">
            {product.competitors?.name ?? "Unknown Competitor"}
          </p>
        </div>

        <Button onClick={handleScanNow} disabled={scanning}>
          {scanning ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          {scanning ? "Scanning..." : "Scan Now"}
        </Button>
      </div>

      {/* Price summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Current Price</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {formatPrice(product.current_price, product.currency)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Previous Price</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums text-muted-foreground">
              {formatPrice(product.previous_price, product.currency)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Price Change</CardDescription>
          </CardHeader>
          <CardContent>
            {priceChange !== null ? (
              <div className="flex items-center gap-2">
                {priceChange > 0 ? (
                  <TrendingUp className="h-5 w-5 text-red-600 dark:text-red-400" />
                ) : priceChange < 0 ? (
                  <TrendingDown className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : null}
                <p
                  className={`text-2xl font-bold tabular-nums ${
                    priceChange > 0
                      ? "text-red-600 dark:text-red-400"
                      : priceChange < 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-muted-foreground"
                  }`}
                >
                  {priceChange > 0 ? "+" : ""}
                  {Math.round(priceChange * 100) / 100}%
                </p>
              </div>
            ) : (
              <p className="text-2xl font-bold text-muted-foreground">--</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Price History Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Price History</CardTitle>
            <div className="flex gap-1">
              {TIME_RANGES.map((range) => (
                <Button
                  key={range.value}
                  variant={days === range.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDays(range.value)}
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingHistory ? (
            <Skeleton className="h-[300px] w-full" />
          ) : chartData.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              <p>No price history data for this time range.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value: number) =>
                    `${getCurrencySymbol(product.currency)}${value}`
                  }
                  domain={["auto", "auto"]}
                  width={70}
                />
                <RechartsTooltip
                  content={<ChartTooltip currency={product.currency} />}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="hsl(217, 91%, 60%)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "hsl(217, 91%, 60%)" }}
                  activeDot={{ r: 5, fill: "hsl(217, 91%, 60%)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Product Info */}
      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Product Name</p>
              <p className="font-medium">{product.name}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Competitor</p>
              <p className="font-medium">
                {product.competitors?.name ?? "Unknown"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Product URL</p>
              <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline break-all"
              >
                {product.url}
                <ExternalLink className="h-3 w-3 flex-shrink-0" />
              </a>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">CSS Selector</p>
              <p className="font-medium font-mono text-sm">
                {product.css_selector || "Auto-detect"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Current Price</p>
              <p className="font-medium tabular-nums">
                {formatPrice(product.current_price, product.currency)}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Previous Price</p>
              <p className="font-medium tabular-nums">
                {formatPrice(product.previous_price, product.currency)}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Last Scraped</p>
              <p className="font-medium">
                {product.last_scraped_at
                  ? `${formatFullDate(product.last_scraped_at)} (${relativeTime(product.last_scraped_at)})`
                  : "Never"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Scrape Status</p>
              <div className="mt-1">
                {statusBadge(product.scrape_status)}
                {product.scrape_status === "error" && product.scrape_error && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {product.scrape_error}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Price Records</CardTitle>
          <CardDescription>
            All price data points from newest to oldest ({history.length}{" "}
            records)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingHistory ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground">
                No price records found for this time range.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Click &quot;Scan Now&quot; to scrape the current price.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Currency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...history].reverse().map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="text-muted-foreground">
                      {formatFullDate(record.scraped_at)}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatPrice(record.price, record.currency)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {record.currency}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
