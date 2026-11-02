import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import { BlogCard } from "@/components/BlogCard";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Practical SEO guides, tips and tutorials from SEO Toolkit for webmasters, bloggers and marketers.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div>
      <section className="bg-indigo-700 py-12 sm:py-16 dark:bg-indigo-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-widest text-accent-400">
            Blog
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            SEO guides and tips
          </h1>
          <p className="mt-3 max-w-2xl text-base text-indigo-100">
            Short, practical articles to help you get more from your website.
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* AD SLOT */}
          <div className="mb-6 flex min-h-[100px] items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 text-xs uppercase tracking-widest text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-600">
            Advertisement
          </div>

          {posts.length === 0 ? (
            <p className="text-base text-slate-600 dark:text-slate-400">
              No articles yet. Please check back soon.
            </p>
          ) : (
            <div className="border-t border-slate-200 dark:border-slate-800">
              {posts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}