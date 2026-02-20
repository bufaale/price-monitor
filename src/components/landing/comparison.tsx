import { Check, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type CellValue = true | false | string;

interface ComparisonRow {
  feature: string;
  pricehawk: CellValue;
  prisync: CellValue;
  price2spy: CellValue;
  pricefy: CellValue;
}

const comparisonData: ComparisonRow[] = [
  {
    feature: "Starting Price",
    pricehawk: "$49/mo",
    prisync: "$99/mo",
    price2spy: "$19.95/mo",
    pricefy: "$49/mo",
  },
  {
    feature: "AI Strategy Recs",
    pricehawk: true,
    prisync: false,
    price2spy: false,
    pricefy: false,
  },
  {
    feature: "Price Alerts",
    pricehawk: "All tiers",
    prisync: "$399+ only",
    price2spy: "Add-on",
    pricefy: "$49+",
  },
  {
    feature: "Historical Charts",
    pricehawk: true,
    prisync: "$399+ only",
    price2spy: "Report-based",
    pricefy: "$49+",
  },
  {
    feature: "Free Tier/Trial",
    pricehawk: "Free tier",
    prisync: "14-day trial",
    price2spy: "Free trial",
    pricefy: "Free (50 SKUs)",
  },
  {
    feature: "CSV Export",
    pricehawk: true,
    prisync: true,
    price2spy: true,
    pricefy: true,
  },
  {
    feature: "Self-Service",
    pricehawk: true,
    prisync: true,
    price2spy: true,
    pricefy: true,
  },
];

function CellContent({ value }: { value: CellValue }) {
  if (value === true) {
    return <Check className="mx-auto h-5 w-5 text-green-600" />;
  }
  if (value === false) {
    return <X className="mx-auto h-5 w-5 text-red-400" />;
  }
  return (
    <span className="text-sm text-muted-foreground">{value}</span>
  );
}

export function Comparison() {
  return (
    <section id="comparison" className="bg-muted/40 py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold">How we compare</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            AI-powered price intelligence at a fraction of the cost.
          </p>
        </div>
        <div className="mt-12 overflow-x-auto rounded-lg border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Feature</TableHead>
                <TableHead className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-bold text-primary">PriceHawk</span>
                    <Badge variant="secondary" className="text-xs">
                      You are here
                    </Badge>
                  </div>
                </TableHead>
                <TableHead className="text-center">Prisync</TableHead>
                <TableHead className="text-center">Price2Spy</TableHead>
                <TableHead className="text-center">Pricefy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparisonData.map((row) => (
                <TableRow key={row.feature}>
                  <TableCell className="font-medium">{row.feature}</TableCell>
                  <TableCell className="bg-primary/5 text-center">
                    <CellContent value={row.pricehawk} />
                  </TableCell>
                  <TableCell className="text-center">
                    <CellContent value={row.prisync} />
                  </TableCell>
                  <TableCell className="text-center">
                    <CellContent value={row.price2spy} />
                  </TableCell>
                  <TableCell className="text-center">
                    <CellContent value={row.pricefy} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
