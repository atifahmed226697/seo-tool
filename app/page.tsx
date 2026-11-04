import type { Metadata } from "next";
import { tools } from "@/lib/tools";
import HomeTools from "@/components/HomeTools";
import { FaqAccordion } from "@/components/FaqAccordion";

export const metadata: Metadata = {
  title: "SEO Toolkit - Free SEO Tools for Webmasters and Marketers",
  description:
    "Free SEO tools: Case Converter, Meta Tag Generator, Meta Tag Analyzer, Domain Age Checker and more. Fast, simple and no signup needed.",
};

/**
 * Ad slot: for now it only shows a dotted box.
 * After AdSense approval, put the ad code inside this box.
 * min-h keeps the page from jumping when the ad loads.
 */
function AdSlot({ className = "" }: { className?: string }) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="flex min-h-[100px] items-center justify-center rounded-md border border-dashed border-[#181D16]/30 bg-white text-xs uppercase tracking-widest text-[#181D16]/50">
        Advertisement
      </div>
    </div>
  );
}

export default function HomePage() {
  const liveCount = tools.filter((t) => t.status === "ready").length;

  return (
    <div className="flex min-h-screen flex-col bg-white text-foreground">
      {/* 1 + 2. HERO and TOOL DIRECTORY */}
      <HomeTools tools={tools} liveCount={liveCount} />

      {/* AD SLOT 1: after the tool directory */}
      <AdSlot />

      {/* 3. ABOUT (content section for SEO / AEO) */}
      <section id="about" className="scroll-mt-20 py-10 md:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-[28px] font-bold leading-tight text-[#181D16]">What is SEO Toolkit?</h2>
          <p className="mt-4 text-base leading-relaxed text-[#181D16]/85">
            SEO Toolkit is a free collection of online tools for webmasters,
            bloggers and digital marketers. Each tool does one job: check how
            old a domain is, read the meta tags of a page, find broken links,
            or clean up text. You open the tool, paste your input and get the
            result right away.
          </p>

          <h3 className="mt-10 text-lg font-bold text-[#181D16]">What can I do with these tools?</h3>
          <p className="mt-2 text-base leading-relaxed text-[#181D16]/85">
            You can write and test meta tags, build UTM links for campaigns,
            generate hreflang tags for multi-language sites, check heading
            structure and image alt text, count internal and external links,
            and measure keyword density in your content. Content tools such as
            the Word Counter and Slug Generator help you prepare articles
            before you publish them.
          </p>

          <h3 className="mt-10 text-lg font-bold text-[#181D16]">Are the tools really free?</h3>
          <p className="mt-2 text-base leading-relaxed text-[#181D16]/85">
            Yes. Every live tool is free to use, with no registration and no
            credit card.
          </p>

          <h3 className="mt-10 text-lg font-bold text-[#181D16]">Is my data safe?</h3>
          <p className="mt-2 text-base leading-relaxed text-[#181D16]/85">
            Text tools like the Case Converter and Meta Tag Generator run
            entirely in your browser. Tools that check a live URL or domain
            send only that address to our server, and we do not store it.
          </p>
        </div>
      </section>

      {/* AD SLOT 2: between About and FAQ */}
      <AdSlot />

      {/* 4. FAQ */}
      <section id="faq" className="scroll-mt-20 border-t border-[#181D16]/15 py-10 md:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-[28px] font-bold leading-tight text-[#181D16]">Frequently Asked Questions</h2>
            <p className="mt-2 text-base text-[#181D16]/80">Quick answers about how the tools work.</p>
          </div>

          <FaqAccordion />
        </div>
      </section>
    </div>
  );
}