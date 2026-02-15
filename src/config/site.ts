export const siteConfig = {
  name: "SaaS AI Boilerplate",
  description:
    "Production-ready SaaS starter with AI, Auth, Billing, and more.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/og.png",
  links: {
    github: "https://github.com/yourusername/saas-ai-boilerplate",
    twitter: "https://twitter.com/yourusername",
  },
} as const;
