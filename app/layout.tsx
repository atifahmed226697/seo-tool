import type { Metadata } from "next";
import { Source_Serif_4, Public_Sans, Manrope } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

// Headings ke liye serif font
const serif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
});

// Baqi poore text ke liye sans font
const sans = Public_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

// Manrope: used on the homepage (see app/page.tsx)
const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

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
    <html
      lang="en"
      className={`scroll-smooth ${serif.variable} ${sans.variable} ${manrope.variable}`}
    >
      <body className="font-sans text-base leading-relaxed antialiased bg-background text-foreground min-h-screen flex flex-col selection:bg-accent-500 selection:text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}