import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";
import type { Metadata } from "next";
import Provider from './provider';

export const metadata: Metadata = {
  title:
    "Testly AI - Automated Testing Platform | AI-Powered Test Case Generation & Browser Testing",
  description:
    "Testly AI automatically analyzes GitHub repositories, generates intelligent test cases, executes browser-based tests, detects bugs, validates user flows, and delivers detailed QA reports. Accelerate software quality with autonomous AI test automation.",
  keywords: [
    "Testly",
    "AI testing",
    "AI test automation",
    "automated testing platform",
    "GitHub test automation",
    "browser testing",
    "end-to-end testing",
    "E2E testing",
    "QA automation",
    "AI generated test cases",
    "Playwright testing",
    "web application testing",
    "software testing",
    "regression testing",
    "continuous testing",
    "quality assurance",
    "bug detection",
    "test case generation",
    "developer tools",
    "CI/CD testing",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className="bg-white text-black"
          style={{ margin: 0, padding: 0 }}
          suppressHydrationWarning
        >
          <Provider>
              {children}
          </Provider>
        </body>
      </html>
    </ClerkProvider>
  );
}
