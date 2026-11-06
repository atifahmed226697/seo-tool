import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AUTHOR,
  formatDate,
  getAllPosts,
  getPostBySlug,
  TocItem,
} from "@/lib/blog";
import { BlogCard } from "@/components/BlogCard";
import { ImageLightbox } from "@/components/ImageLightbox";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://seotoolkit.local";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {};
  }

  const seoTitle = post.seoTitle || post.title;

  return {
    title: seoTitle,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: seoTitle,
      description: post.description,
      publishedTime: post.date,
      images: post.image ? [post.image] : undefined,
    },
    twitter: {
      card: post.image ? "summary_large_image" : "summary",
      title: seoTitle,
      description: post.description,
      images: post.image ? [post.image] : undefined,
    },
  };
}

function Toc({ toc }: { toc: TocItem[] }) {
  return (
    <ul className="space-y-3 text-sm">
      {toc.map((item) => (
        <li key={item.id} className={item.level === 3 ? "pl-4" : ""}>
          <a
            href={`#${item.id}`}
            className="leading-relaxed text-[#465B55] underline-offset-4 hover:text-[#181D16] hover:underline dark:text-slate-300 dark:hover:text-white"
          >
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  );
}

function ShareLinks({ url, title }: { url: string; title: string }) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      label: "Email",
      href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-[#AFC9C4] px-3 py-2 text-xs font-semibold text-[#181D16] transition-colors hover:bg-brand-lavender focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#35615B] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const url = `${SITE_URL}/blog/${post.slug}`;

  // Show articles in the same category first.
  const related = getAllPosts()
    .filter((article) => article.slug !== post.slug)
    .sort(
      (a, b) =>
        Number(b.category === post.category) -
        Number(a.category === post.category)
    )
    .slice(0, 3);

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: post.updated || post.date,
      author: { "@type": "Person", name: AUTHOR.name },
      mainEntityOfPage: url,
      image: post.image ? new URL(post.image, SITE_URL).href : undefined,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Blog",
          item: `${SITE_URL}/blog`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: post.title,
          item: url,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background text-[#181D16] dark:bg-slate-950 dark:text-slate-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />

      <ImageLightbox />

      {/* Article header */}
      <section className="border-b border-[#C6DAD7] bg-brand-blue py-10 sm:py-14 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav
            className="flex flex-wrap items-center gap-2 text-xs text-[#465B55] dark:text-slate-300"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="underline-offset-4 hover:underline">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/blog" className="underline-offset-4 hover:underline">
              Blog
            </Link>
            <span aria-hidden="true">/</span>
            <span>{post.category}</span>
          </nav>

          <h1 className="mt-5 max-w-4xl break-words text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>

          <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#465B55] dark:text-slate-300">
            <span>By {AUTHOR.name}</span>
            <span aria-hidden="true">·</span>
            <span>{post.readMinutes} min read</span>
            <span aria-hidden="true">·</span>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </p>

          {post.updated && post.updated !== post.date && (
            <p className="mt-2 text-xs text-[#465B55] dark:text-slate-400">
              Updated{" "}
              <time dateTime={post.updated}>
                {formatDate(post.updated)}
              </time>
            </p>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_17rem]">
          <article className="mx-auto min-w-0 w-full max-w-3xl">
            {/* Mobile table of contents */}
            {post.toc.length > 0 && (
              <details className="mb-8 border-y border-[#C6DAD7] py-4 lg:hidden dark:border-slate-800">
                <summary className="cursor-pointer text-sm font-semibold">
                  Table of Contents
                </summary>
                <div className="mt-4">
                  <Toc toc={post.toc} />
                </div>
              </details>
            )}

            {post.image && (
              <img
                src={post.image}
                alt={post.title}
                decoding="async"
                className="mb-8 h-auto w-full rounded-lg"
              />
            )}

            <div
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: post.html }}
            />

            <div className="mt-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#465B55] dark:text-slate-300">
                Share this article
              </p>
              <ShareLinks url={url} title={post.title} />
            </div>

            {/* Author information */}
            <div className="mt-10 flex items-start gap-4 border-t border-[#C6DAD7] pt-6 dark:border-slate-800">
              <div
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-blue text-lg font-bold text-[#181D16] dark:bg-slate-800 dark:text-white"
              >
                {AUTHOR.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold">{AUTHOR.name}</p>
                <p className="mt-1 text-sm leading-relaxed text-[#465B55] dark:text-slate-300">
                  {AUTHOR.bio}
                </p>
              </div>
            </div>
          </article>

          {/* Desktop sidebar */}
          <aside aria-label="Article navigation" className="hidden lg:block">
            <div className="sticky top-20 space-y-8 border-l border-[#C6DAD7] pl-6 dark:border-slate-800">
              {post.toc.length > 0 && (
                <div>
                  <h2 className="mb-4 text-xs font-bold uppercase tracking-wider">
                    Table of Contents
                  </h2>
                  <Toc toc={post.toc} />
                </div>
              )}

              <div>
                <h2 className="mb-3 text-xs font-bold uppercase tracking-wider">
                  Share
                </h2>
                <ShareLinks url={url} title={post.title} />
              </div>
            </div>
          </aside>
        </div>
      </div>

      {related.length > 0 && (
        <section className="border-t border-[#C6DAD7] py-12 dark:border-slate-800">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold tracking-tight">
              More articles
            </h2>
            <div className="mt-6 border-t border-[#C6DAD7] dark:border-slate-800">
              {related.map((article) => (
                <BlogCard key={article.slug} post={article} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}