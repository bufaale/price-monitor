"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Brain,
  CheckSquare,
  Clock,
  Loader2,
  Sparkles,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Product {
  id: string;
  name: string;
  url: string;
  current_price: number | null;
  currency: string;
  competitor_id: string;
  competitors?: { name: string };
}

interface AiGeneration {
  id: string;
  user_id: string;
  prompt_summary: string;
  result: string;
  tokens_used: number;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function relativeDate(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffHr = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHr < 1) return "Just now";
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

/**
 * Simple markdown-like renderer.
 * - Lines starting with ## become <h3>
 * - **bold** text is wrapped in <strong>
 * - Other lines become <p>
 */
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Empty lines
    if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
      continue;
    }

    // ## Heading
    if (line.startsWith("## ")) {
      elements.push(
        <h3 key={i} className="text-lg font-semibold mt-4 mb-2">
          {processBold(line.slice(3))}
        </h3>,
      );
      continue;
    }

    // ### Heading
    if (line.startsWith("### ")) {
      elements.push(
        <h4 key={i} className="text-base font-semibold mt-3 mb-1">
          {processBold(line.slice(4))}
        </h4>,
      );
      continue;
    }

    // # Heading
    if (line.startsWith("# ")) {
      elements.push(
        <h3 key={i} className="text-xl font-bold mt-4 mb-2">
          {processBold(line.slice(2))}
        </h3>,
      );
      continue;
    }

    // Bullet points
    if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <li key={i} className="ml-4 text-sm text-muted-foreground list-disc">
          {processBold(line.slice(2))}
        </li>,
      );
      continue;
    }

    // Numbered lists
    const numberedMatch = line.match(/^(\d+)\.\s(.+)/);
    if (numberedMatch) {
      elements.push(
        <li key={i} className="ml-4 text-sm text-muted-foreground list-decimal">
          {processBold(numberedMatch[2])}
        </li>,
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="text-sm text-muted-foreground">
        {processBold(line)}
      </p>,
    );
  }

  return elements;
}

function processBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function StrategyPage() {
  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [strategyResult, setStrategyResult] = useState<string | null>(null);
  const [productsAnalyzed, setProductsAnalyzed] = useState(0);

  // Past generations
  const [pastGenerations, setPastGenerations] = useState<AiGeneration[]>([]);
  const [loadingGenerations, setLoadingGenerations] = useState(true);

  // Usage
  const [usageCount, setUsageCount] = useState(0);

  // ---------------------------------------------------------------------------
  // Fetch products
  // ---------------------------------------------------------------------------

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch products");
      setProducts(json.data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load products",
      );
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Fetch past generations + usage count
  // ---------------------------------------------------------------------------

  const fetchGenerations = useCallback(async () => {
    try {
      const supabase = createClient();

      // Past generations
      const { data: generations } = await supabase
        .from("ai_generations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (generations) setPastGenerations(generations);

      // Count this month's generations for usage display
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from("ai_generations")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startOfMonth.toISOString());

      setUsageCount(count ?? 0);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to load past generations",
      );
    } finally {
      setLoadingGenerations(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchGenerations();
  }, [fetchProducts, fetchGenerations]);

  // ---------------------------------------------------------------------------
  // Product selection
  // ---------------------------------------------------------------------------

  function toggleProduct(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function selectAll() {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)));
    }
  }

  // ---------------------------------------------------------------------------
  // Generate strategy
  // ---------------------------------------------------------------------------

  async function handleGenerate() {
    if (selectedIds.size === 0) {
      toast.error("Select at least one product");
      return;
    }

    setGenerating(true);
    setStrategyResult(null);

    try {
      const res = await fetch("/api/ai/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: Array.from(selectedIds) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to generate strategy");

      setStrategyResult(json.strategy);
      setProductsAnalyzed(json.productsAnalyzed);
      toast.success("Strategy report generated");

      // Refresh past generations and usage count
      fetchGenerations();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to generate strategy",
      );
    } finally {
      setGenerating(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Group products by competitor
  // ---------------------------------------------------------------------------

  const productsByCompetitor = products.reduce<
    Record<string, { competitorName: string; products: Product[] }>
  >((acc, product) => {
    const compId = product.competitor_id;
    const compName = product.competitors?.name ?? "Unknown";
    if (!acc[compId]) {
      acc[compId] = { competitorName: compName, products: [] };
    }
    acc[compId].products.push(product);
    return acc;
  }, {});

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Strategy</h1>
          <p className="mt-1 text-muted-foreground">
            Get AI-powered pricing insights and competitive analysis
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {usageCount} AI report{usageCount !== 1 ? "s" : ""} used this month
        </Badge>
      </div>

      {/* Product Picker */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Select Products</CardTitle>
            <CardDescription>
              Choose which products to include in the analysis
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            {products.length > 0 && (
              <Button variant="outline" size="sm" onClick={selectAll}>
                {selectedIds.size === products.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            )}
            <Button
              onClick={handleGenerate}
              disabled={generating || selectedIds.size === 0}
            >
              {generating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {generating ? "Generating..." : "Generate Strategy"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingProducts ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <div className="ml-4 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-44" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Brain className="h-10 w-10 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium">No products yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add competitors and products first to generate AI strategy
                reports.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(productsByCompetitor).map(
                ([compId, group]) => (
                  <div key={compId}>
                    <p className="text-sm font-semibold text-muted-foreground mb-2">
                      {group.competitorName}
                    </p>
                    <div className="ml-1 space-y-1">
                      {group.products.map((product) => {
                        const isSelected = selectedIds.has(product.id);
                        return (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => toggleProduct(product.id)}
                            className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted/50 ${
                              isSelected ? "bg-muted" : ""
                            }`}
                          >
                            {isSelected ? (
                              <CheckSquare className="h-4 w-4 text-primary shrink-0" />
                            ) : (
                              <Square className="h-4 w-4 text-muted-foreground shrink-0" />
                            )}
                            <span className="flex-1 truncate">
                              {product.name}
                            </span>
                            {product.current_price !== null && (
                              <span className="text-xs text-muted-foreground tabular-nums">
                                {product.currency}{" "}
                                {product.current_price.toFixed(2)}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ),
              )}
              <p className="text-xs text-muted-foreground pt-2">
                {selectedIds.size} product{selectedIds.size !== 1 ? "s" : ""}{" "}
                selected
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generating indicator */}
      {generating && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <div>
                <p className="font-medium">Generating AI Strategy Report</p>
                <p className="text-sm text-muted-foreground">
                  Analyzing price data and market trends. This may take up to 60
                  seconds...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strategy Result */}
      {strategyResult && !generating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Strategy Report
            </CardTitle>
            <CardDescription>
              AI analysis of {productsAnalyzed} product
              {productsAnalyzed !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {renderMarkdown(strategyResult)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Past Generations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Past Reports
          </CardTitle>
          <CardDescription>
            Your previous AI strategy generations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingGenerations ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-24 ml-auto" />
                </div>
              ))}
            </div>
          ) : pastGenerations.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No reports generated yet. Select products above and generate your
              first AI strategy report.
            </p>
          ) : (
            <div className="space-y-3">
              {pastGenerations.map((gen) => (
                <PastGenerationItem key={gen.id} generation={gen} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Past generation item with expandable result
// ---------------------------------------------------------------------------

function PastGenerationItem({ generation }: { generation: AiGeneration }) {
  const [expanded, setExpanded] = useState(false);

  const preview =
    generation.result.length > 150
      ? generation.result.slice(0, 150) + "..."
      : generation.result;

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {generation.prompt_summary}
          </p>
          {!expanded && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {preview}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <span className="text-xs text-muted-foreground">
            {relativeDate(generation.created_at)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Collapse" : "Expand"}
          </Button>
        </div>
      </div>
      {expanded && (
        <>
          <Separator className="my-3" />
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {renderMarkdown(generation.result)}
          </div>
        </>
      )}
    </div>
  );
}
