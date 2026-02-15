export const siteConfig = {
  name: "PriceWise",
  description:
    "AI-powered competitive price monitoring. Track competitor prices, get instant alerts, and optimize your pricing strategy.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/og.png",
  links: {
    github: "https://github.com/bufaale/price-monitor",
    twitter: "https://twitter.com/pricewise",
  },
} as const;
