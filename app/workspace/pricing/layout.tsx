import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing | Testly AI",
  description:
    "Top up Testly credits to power AI test generation, Browserbase execution, and QA automation workflows.",
  keywords: [
    ...siteConfig.keywords,
    "pricing",
    "credits",
    "AI test automation pricing",
    "Browserbase test credits",
  ],
  robots: {
    index: false,
    follow: false,
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
