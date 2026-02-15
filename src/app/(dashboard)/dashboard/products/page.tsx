"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  MoreHorizontal,
  Trash2,
  ExternalLink,
  Search,
  RefreshCw,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface Competitor {
  id: string;
  name: string;
  website_url: string;
  status: "active" | "paused";
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
  competitors?: { name: string };
}

interface PreviewResult {
  price: number;
  currency: string;
  method: string;
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

function calculateChange(
  current: number | null,
  previous: number | null,
): { percent: number; direction: "up" | "down" | "none" } | null {
  if (current === null || previous === null || previous === 0) return null;
  const percent = ((current - previous) / previous) * 100;
  const rounded = Math.round(percent * 100) / 100;
  if (rounded === 0) return { percent: 0, direction: "none" };
  return {
    percent: rounded,
    direction: rounded > 0 ? "up" : "down",
  };
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

function truncateUrl(url: string, maxLen = 40): string {
  try {
    const parsed = new URL(url);
    const display = parsed.hostname + parsed.pathname;
    return display.length > maxLen ? display.slice(0, maxLen) + "..." : display;
  } catch {
    return url.length > maxLen ? url.slice(0, maxLen) + "..." : url;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProductsPage() {
  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter
  const [filterCompetitor, setFilterCompetitor] = useState<string>("all");

  // Add dialog
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addCompetitorId, setAddCompetitorId] = useState("");
  const [addName, setAddName] = useState("");
  const [addUrl, setAddUrl] = useState("");
  const [addCssSelector, setAddCssSelector] = useState("");

  // Preview
  const [previewing, setPreviewing] = useState(false);
  const [previewResult, setPreviewResult] = useState<PreviewResult | null>(
    null,
  );
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Scan
  const [scanning, setScanning] = useState(false);

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------

  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterCompetitor && filterCompetitor !== "all") {
        params.set("competitor_id", filterCompetitor);
      }
      const res = await fetch(`/api/products?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch products");
      setProducts(json.data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load products",
      );
    } finally {
      setLoading(false);
    }
  }, [filterCompetitor]);

  const fetchCompetitors = useCallback(async () => {
    try {
      const res = await fetch("/api/competitors");
      const json = await res.json();
      if (!res.ok)
        throw new Error(json.error || "Failed to fetch competitors");
      setCompetitors(json.data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load competitors",
      );
    }
  }, []);

  useEffect(() => {
    fetchCompetitors();
  }, [fetchCompetitors]);

  useEffect(() => {
    setLoading(true);
    fetchProducts();
  }, [fetchProducts]);

  // ---------------------------------------------------------------------------
  // Form helpers
  // ---------------------------------------------------------------------------

  function resetAddForm() {
    setAddCompetitorId("");
    setAddName("");
    setAddUrl("");
    setAddCssSelector("");
    setPreviewResult(null);
    setPreviewError(null);
  }

  // ---------------------------------------------------------------------------
  // Preview price
  // ---------------------------------------------------------------------------

  async function handlePreview() {
    if (!addUrl) {
      toast.error("Please enter a URL first");
      return;
    }
    setPreviewing(true);
    setPreviewResult(null);
    setPreviewError(null);

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: addUrl,
          cssSelector: addCssSelector || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setPreviewError(json.error || "Failed to scrape price");
      } else {
        setPreviewResult(json.data);
      }
    } catch (err) {
      setPreviewError(
        err instanceof Error ? err.message : "Scraping failed",
      );
    } finally {
      setPreviewing(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Add product
  // ---------------------------------------------------------------------------

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          competitor_id: addCompetitorId,
          name: addName,
          url: addUrl,
          css_selector: addCssSelector || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to add product");
      toast.success(`${json.data.name} added successfully`);
      setAddOpen(false);
      resetAddForm();
      fetchProducts();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to add product",
      );
    } finally {
      setSaving(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Delete product
  // ---------------------------------------------------------------------------

  function openDelete(product: Product) {
    setSelectedProduct(product);
    setDeleteOpen(true);
  }

  async function handleDelete() {
    if (!selectedProduct) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${selectedProduct.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete product");
      setProducts((prev) => prev.filter((p) => p.id !== selectedProduct.id));
      toast.success(`${selectedProduct.name} deleted`);
      setDeleteOpen(false);
      setSelectedProduct(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete product",
      );
    } finally {
      setDeleting(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Scan all products
  // ---------------------------------------------------------------------------

  async function handleScan() {
    setScanning(true);
    try {
      const res = await fetch("/api/scrape/batch", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Scan failed");
      toast.success(
        `Scan complete: ${json.scraped} product${json.scraped !== 1 ? "s" : ""} scraped, ${json.alerts} alert${json.alerts !== 1 ? "s" : ""} triggered`,
      );
      fetchProducts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setScanning(false);
    }
  }

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
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="mt-1 text-muted-foreground">
            Track and monitor competitor product prices
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Scan Now */}
          <Button
            variant="outline"
            onClick={handleScan}
            disabled={scanning || products.length === 0}
          >
            {scanning ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {scanning ? "Scanning..." : "Scan Now"}
          </Button>

          {/* Add Product Dialog */}
          <Dialog
            open={addOpen}
            onOpenChange={(open) => {
              setAddOpen(open);
              if (!open) resetAddForm();
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <form onSubmit={handleAdd}>
                <DialogHeader>
                  <DialogTitle>Add Product</DialogTitle>
                  <DialogDescription>
                    Add a competitor product to track its price. Use Preview
                    Price to verify scraping works before saving.
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-4">
                  {/* Competitor select */}
                  <div className="space-y-2">
                    <Label htmlFor="add-competitor">Competitor</Label>
                    <Select
                      value={addCompetitorId}
                      onValueChange={setAddCompetitorId}
                    >
                      <SelectTrigger id="add-competitor">
                        <SelectValue placeholder="Select a competitor" />
                      </SelectTrigger>
                      <SelectContent>
                        {competitors.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Product name */}
                  <div className="space-y-2">
                    <Label htmlFor="add-name">Product Name</Label>
                    <Input
                      id="add-name"
                      placeholder="e.g. Pro Plan Monthly"
                      value={addName}
                      onChange={(e) => setAddName(e.target.value)}
                      required
                    />
                  </div>

                  {/* URL */}
                  <div className="space-y-2">
                    <Label htmlFor="add-url">Product URL</Label>
                    <Input
                      id="add-url"
                      type="url"
                      placeholder="https://example.com/product"
                      value={addUrl}
                      onChange={(e) => setAddUrl(e.target.value)}
                      required
                    />
                  </div>

                  {/* CSS Selector */}
                  <div className="space-y-2">
                    <Label htmlFor="add-selector">
                      CSS Selector{" "}
                      <span className="text-muted-foreground font-normal">
                        (optional)
                      </span>
                    </Label>
                    <Input
                      id="add-selector"
                      placeholder=".price, #product-price, etc."
                      value={addCssSelector}
                      onChange={(e) => setAddCssSelector(e.target.value)}
                    />
                  </div>

                  {/* Preview button */}
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePreview}
                      disabled={previewing || !addUrl}
                    >
                      {previewing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Eye className="mr-2 h-4 w-4" />
                      )}
                      Preview Price
                    </Button>

                    {previewing && (
                      <span className="text-sm text-muted-foreground">
                        Scraping page...
                      </span>
                    )}
                  </div>

                  {/* Preview result */}
                  {previewResult && (
                    <div className="rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950/30">
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-400">
                          Price found
                        </span>
                      </div>
                      <div className="mt-2 space-y-1 text-sm">
                        <p>
                          <span className="text-muted-foreground">Price:</span>{" "}
                          <span className="font-semibold">
                            {formatPrice(
                              previewResult.price,
                              previewResult.currency,
                            )}
                          </span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">
                            Currency:
                          </span>{" "}
                          {previewResult.currency}
                        </p>
                        <p>
                          <span className="text-muted-foreground">
                            Extraction method:
                          </span>{" "}
                          {previewResult.method}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Preview error */}
                  {previewError && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/30">
                      <p className="text-sm text-red-800 dark:text-red-400">
                        {previewError}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Try adding a CSS selector for the price element, or
                        check the URL.
                      </p>
                    </div>
                  )}
                </div>

                <DialogFooter className="mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAddOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving || !addCompetitorId || !addName || !addUrl}
                  >
                    {saving && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Product
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setSelectedProduct(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{selectedProduct?.name}</span>?
              This will also remove all price history for this product. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filter + Content */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Products</CardTitle>
          <div className="w-[200px]">
            <Select
              value={filterCompetitor}
              onValueChange={setFilterCompetitor}
            >
              <SelectTrigger>
                <SelectValue placeholder="All competitors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All competitors</SelectItem>
                {competitors.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            /* Loading skeleton */
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-8 ml-auto" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-lg font-medium">No products yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {filterCompetitor !== "all"
                  ? "No products found for this competitor. Try a different filter or add a new product."
                  : "Add your first product to start tracking competitor prices."}
              </p>
              <Button className="mt-4" onClick={() => setAddOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>
          ) : (
            /* Products table */
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Competitor</TableHead>
                  <TableHead className="text-right">Current Price</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                  <TableHead>Last Scraped</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const change = calculateChange(
                    product.current_price,
                    product.previous_price,
                  );

                  return (
                    <TableRow key={product.id}>
                      {/* Product name with link */}
                      <TableCell>
                        <div>
                          <Link
                            href={`/dashboard/products/${product.id}`}
                            className="font-medium hover:underline"
                          >
                            {product.name}
                          </Link>
                          <a
                            href={product.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-0.5"
                          >
                            {truncateUrl(product.url)}
                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                          </a>
                        </div>
                      </TableCell>

                      {/* Competitor */}
                      <TableCell className="text-muted-foreground">
                        {product.competitors?.name ?? "Unknown"}
                      </TableCell>

                      {/* Current price */}
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatPrice(product.current_price, product.currency)}
                      </TableCell>

                      {/* Change % */}
                      <TableCell className="text-right tabular-nums">
                        {change ? (
                          <span
                            className={
                              change.direction === "up"
                                ? "text-red-600 dark:text-red-400"
                                : change.direction === "down"
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-muted-foreground"
                            }
                          >
                            {change.direction === "up" ? "+" : ""}
                            {change.percent}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">--</span>
                        )}
                      </TableCell>

                      {/* Last scraped */}
                      <TableCell className="text-muted-foreground">
                        {relativeTime(product.last_scraped_at)}
                      </TableCell>

                      {/* Status */}
                      <TableCell>{statusBadge(product.scrape_status)}</TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/dashboard/products/${product.id}`}
                              >
                                <Search className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                window.open(
                                  product.url,
                                  "_blank",
                                  "noopener,noreferrer",
                                )
                              }
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Visit URL
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => openDelete(product)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
