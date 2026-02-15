import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "How does price tracking work?",
    answer:
      "You add competitor product URLs, and PriceWise automatically visits each page daily to extract the current price. We use structured data (JSON-LD, Open Graph) for accurate extraction, with CSS selector fallback for custom setups.",
  },
  {
    question: "What websites can you track?",
    answer:
      "PriceWise works with most e-commerce sites that render prices in HTML, including Amazon, Shopify stores, WooCommerce, BigCommerce, and custom sites. If a site renders prices server-side, we can track it.",
  },
  {
    question: "How do alerts work?",
    answer:
      "When a price change exceeds your configured threshold (default 1%), you get an email notification immediately. Pro and Business plans also support webhook notifications for custom integrations.",
  },
  {
    question: "What does the AI Strategy feature do?",
    answer:
      "Our AI analyzes your competitors' price history, identifies patterns (seasonal changes, promotional cycles), and recommends optimal price points. It considers your competitive position and suggests adjustments to maximize margins.",
  },
  {
    question: "Can I export my data?",
    answer:
      "Yes, all plans include CSV export. Business plan users also get API access to integrate price data directly into their existing pricing systems, ERPs, or custom dashboards.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes, new accounts get a 14-day free trial of the Starter plan. No credit card required. After the trial, you can upgrade or continue with limited free features.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Frequently asked questions</h2>
          <p className="text-muted-foreground mt-4 mx-auto max-w-2xl">
            Everything you need to know about PriceWise.
          </p>
        </div>
        <div className="mt-12">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-base">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
