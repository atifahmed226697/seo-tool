import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://seotoolkit.local"
  ),
  title: {
    default: "SEO Toolkit - Fast, Free & Modern SEO Tools",
    template: "%s | SEO Toolkit",
  },
  description:
    "A free collection of essential SEO tools, text utilities, and domain checkers designed for creators, webmasters, and SEO professionals.",
  keywords: [
    "SEO tools",
    "case converter",
    "meta tag generator",
    "meta tag analyzer",
    "domain age checker",
    "DA PA checker",
    "spam score checker",
    "google index checker",
  ],
  authors: [{ name: "SEO Toolkit Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "SEO Toolkit",
    title: "SEO Toolkit - Fast, Free & Modern SEO Tools",
    description:
      "A free suite of essential SEO tools, text utilities, and domain checkers.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Toolkit - Fast, Free & Modern SEO Tools",
    description:
      "A free suite of essential SEO tools, text utilities, and domain checkers.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="font-sans antialiased bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
