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

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const post = getPostBySlug(params.slug);

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
    <ul className="space-y-2 text-sm">
      {toc.map((item) => (
        <li key={item.id} className={item.level === 3 ? "pl-4" : ""}>
          <a
            href={`#${item.id}`}
            className="text-slate-600 transition-colors hover:text-accent-600 dark:text-slate-400 dark:hover:text-accent-400"
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
          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-accent-500 hover:text-accent-600 dark:border-slate-700 dark:text-slate-300 dark:hover:text-accent-400"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}

export default function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = getPostBySlug(params.slug);

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
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />

      {/* Enable click-to-enlarge for article images. */}
      <ImageLightbox />

      {/* Article header */}
      <section className="bg-indigo-700 py-10 sm:py-14 dark:bg-indigo-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="text-xs text-indigo-200" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/blog" className="hover:text-white">
              Blog
            </Link>
            <span className="mx-2">/</span>
            <span className="text-accent-400">{post.category}</span>
          </nav>

          <h1 className="mt-4 max-w-3xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {post.title}
          </h1>

          <p className="mt-4 text-sm text-indigo-200">
            By {AUTHOR.name} &nbsp;·&nbsp; {post.readMinutes} min read
            &nbsp;·&nbsp; {formatDate(post.date)}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_17rem]">
          <div className="mx-auto w-full max-w-3xl">
            {/* Mobile table of contents */}
            {post.toc.length > 0 && (
              <details className="mb-8 rounded-md border border-slate-200 p-4 lg:hidden dark:border-slate-800">
                <summary className="cursor-pointer text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Table of Contents
                </summary>
                <div className="mt-3">
                  <Toc toc={post.toc} />
                </div>
              </details>
            )}

            {post.image && (
              <img
                src={post.image}
                alt={post.title}
                className="mb-8 w-full rounded-md border border-slate-200 dark:border-slate-800"
              />
            )}

            <div
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: post.html }}
            />

            {/* Advertisement placement */}
            <div className="mt-10 flex min-h-[100px] items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 text-xs uppercase tracking-widest text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-600">
              Advertisement
            </div>

            <div className="mt-8">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                Share this article
              </p>
              <ShareLinks url={url} title={post.title} />
            </div>

            {/* Author information */}
            <div className="mt-10 flex gap-4 rounded-md border border-slate-200 p-5 dark:border-slate-800">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-700 text-lg font-bold text-white dark:bg-accent-500">
                {AUTHOR.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">
                  {AUTHOR.name}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {AUTHOR.bio}
                </p>
              </div>
            </div>
          </div>

          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-20 space-y-8">
              {post.toc.length > 0 && (
                <div>
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Table of Contents
                  </p>
                  <Toc toc={post.toc} />
                </div>
              )}

              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Share
                </p>
                <ShareLinks url={url} title={post.title} />
              </div>
            </div>
          </aside>
        </div>
      </div>

      {related.length > 0 && (
        <section className="border-t border-slate-200 py-12 dark:border-slate-800">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              More articles
            </h2>
            <div className="mt-2">
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