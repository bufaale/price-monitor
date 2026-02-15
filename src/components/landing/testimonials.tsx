import { Card, CardContent, CardHeader } from "@/components/ui/card";

const testimonials = [
  {
    quote:
      "PriceWise saved us 15 hours/week of manual price checking. The AI strategy suggestions actually improved our margins by 8%.",
    name: "Jennifer Park",
    role: "E-commerce Director at ShopFlow",
    initials: "JP",
  },
  {
    quote:
      "We caught a competitor's price drop within minutes and adjusted our pricing before losing any sales. Game changer.",
    name: "David Chen",
    role: "CEO at RetailEdge",
    initials: "DC",
  },
  {
    quote:
      "The historical charts helped us spot seasonal pricing patterns we never noticed. Now we plan promotions months in advance.",
    name: "Maria Santos",
    role: "Pricing Analyst at TechMart",
    initials: "MS",
  },
];

export function Testimonials() {
  return (
    <section className="bg-muted/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Trusted by e-commerce teams</h2>
          <p className="text-muted-foreground mt-4 mx-auto max-w-2xl">
            See how businesses use PriceWise to stay competitive.
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.name}
              className="transition-shadow hover:shadow-md"
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold">
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{testimonial.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <blockquote className="text-muted-foreground text-sm leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
