import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import LandingPageClient from "@/components/landing/LandingPageClient";
import { FAQS } from "@/components/landing/content";
import { getSiteUrl, siteConfig } from "@/lib/site";

const pageTitle = "Testly | AI Test Automation for GitHub Repositories";
const pageDescription =
  "Testly is an AI-powered test automation platform for GitHub repositories. Generate end-to-end test cases, run browser automation in Browserbase, and speed up QA and regression testing.";

const pageKeywords = [
  ...siteConfig.keywords,
  "Testly",
  "AI test automation",
  "GitHub repository testing",
  "end-to-end test generation",
  "Browserbase testing",
  "QA automation platform",
  "Next.js testing",
  "React testing automation",
  "automated regression testing",
];

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: pageKeywords,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "/",
    siteName: siteConfig.name,
    type: "website",
    images: [
      {
        url: "/logo.svg",
        width: 512,
        height: 512,
        alt: "Testly AI test automation platform logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: ["/logo.svg"],
  },
};

export default async function HomePage() {
  const siteUrl = getSiteUrl();
  const { userId } = await auth();

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: siteConfig.name,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        description: pageDescription,
        url: siteUrl,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        featureList: [
          "AI-generated test cases",
          "GitHub repository analysis",
          "Browserbase cloud execution",
          "Automated regression testing",
          "End-to-end testing for Next.js and React apps",
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQS.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <LandingPageClient isSignedIn={Boolean(userId)} />
    </>
  );
}
