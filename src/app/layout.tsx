import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import { StoreProvider } from "@/store/providers/StoreProvider";
import { QueryProvider } from "@/store/providers/QueryProvider";
import { ToastViewport } from "@/components/ui/Toast";
import { siteConfig } from "@/config/site";
import "./globals.css";

/**
 * Single typeface for the entire product. Plus Jakarta Sans gives us a clean,
 * modern, SaaS-grade voice from 13px UI text up to large editorial display
 * weights without any face-mixing. We expose two CSS variables — one for body,
 * one for display — but they resolve to the same family with different
 * weights / tracking applied at the component level via Tailwind utilities.
 */
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

/**
 * Fraunces — a warm, high-contrast editorial serif — is our DISPLAY face for
 * headings. Paired with Jakarta for body/UI, it gives the boutique a refined,
 * florist-editorial voice instead of a generic single-sans look.
 */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name }],
  keywords: [
    "flowers",
    "gifts",
    "luxury gifting",
    "boutique",
    "same day delivery",
    "Amoon Bloom",
  ],
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream-50 text-ink-900 font-sans">
        <StoreProvider>
          <QueryProvider>
            {children}
            <ToastViewport />
          </QueryProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
