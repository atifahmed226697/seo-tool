import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

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
    default: "Free SEO and Website Tools | SEO Toolkit",
    template: "%s | SEO Toolkit",
  },
  description:
    "Free tools for checking public webpages and preparing metadata, sitemaps, images and PDFs.",
  authors: [{ name: "SEO Toolkit Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "SEO Toolkit",
    title: "Free SEO and Website Tools | SEO Toolkit",
    description:
      "Check public pages and prepare website content with SEO Toolkit.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free SEO and Website Tools | SEO Toolkit",
    description:
      "Check public pages and prepare website content with SEO Toolkit.",
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
      className={`scroll-smooth ${manrope.variable}`}
    >
      <body className="font-sans text-base leading-relaxed antialiased bg-background text-foreground min-h-screen flex flex-col selection:bg-brand-lavender selection:text-foreground">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}