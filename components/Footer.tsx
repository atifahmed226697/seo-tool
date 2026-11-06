import Link from "next/link";
import { Search } from "lucide-react";
import { tools } from "@/lib/tools";

const popularSlugs = ["meta-tag-analyzer", "domain-age-checker", "broken-link-checker", "word-counter"];

export function Footer() {
  const columns = [
    {
      title: "Explore",
      links: [
        { label: "All tools", href: "/#tools" },
        { label: "Blog", href: "/blog" },
        { label: "About us", href: "/about" },
        { label: "Contact us", href: "/contact" },
      ],
    },
    {
      title: "Start with these tools",
      links: popularSlugs.flatMap((slug) => {
        const tool = tools.find((item) => item.slug === slug && item.status === "ready");
        return tool ? [{ label: tool.name, href: `/tools/${slug}` }] : [];
      }),
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy-policy" },
        { label: "Terms & Conditions", href: "/terms" },
      ],
    },
  ];

  return (
    <footer className="border-t border-brand-forest/20 bg-brand-blue text-brand-ink">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-12">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 font-extrabold tracking-tight">
              <span className="grid h-8 w-8 place-items-center rounded-md bg-brand-forest text-white">
                <Search className="h-4 w-4" aria-hidden="true" />
              </span>
              SEO Toolkit
            </Link>
            <p className="mt-3 max-w-[16rem] text-sm leading-relaxed text-brand-ink/75">
              Free tools for checking public pages, preparing content and working with images or PDFs.
            </p>
          </div>

          {columns.map(({ title, links }) => (
            <nav key={title} aria-label={title}>
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-brand-forest">{title}</h2>
              <ul className="mt-3 space-y-2 text-sm text-brand-ink/80">
                {links.map(({ label, href }) => (
                  <li key={href}>
                    <Link href={href} className="underline-offset-4 hover:text-brand-forest hover:underline">{label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap justify-between gap-2 border-t border-brand-forest/20 pt-5 text-xs text-brand-ink/75">
          <p>© {new Date().getFullYear()} SEO Toolkit. All rights reserved.</p>
          <p>SEO tools and publishing guides.</p>
        </div>
      </div>
    </footer>
  );
}
