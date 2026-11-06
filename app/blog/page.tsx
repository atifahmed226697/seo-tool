import { sitePageMetadata } from "@/lib/site-page-metadata";
import { getAllPosts } from "@/lib/blog";
import { BlogCard } from "@/components/BlogCard";

export const metadata = sitePageMetadata(
  "/blog",
  "SEO Guides for Website Publishing",
  "Read practical SEO guides with examples for writing metadata, checking published pages and using SEO Toolkit.",
);

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-background text-[#181D16] dark:bg-slate-950 dark:text-slate-100">
      <section className="border-b border-[#C6DAD7] bg-brand-blue py-12 sm:py-16 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#35615B] dark:text-slate-300">
            SEO Toolkit Blog
          </p>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl">
            SEO guides for website publishing
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#465B55] sm:text-lg dark:text-slate-300">
            Follow examples you can use when writing page metadata and checking what your site publishes.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="blog-guides"
        className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8"
      >
        <h2 id="blog-guides" className="mb-5 text-2xl font-bold tracking-tight">Publishing guides</h2>

        {posts.length === 0 ? (
          <p className="py-8 text-base text-[#465B55] dark:text-slate-300">
            No articles are published yet.
          </p>
        ) : (
          <ul className="space-y-4">
            {posts.map((post) => (
              <li key={post.slug}><BlogCard post={post} /></li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}