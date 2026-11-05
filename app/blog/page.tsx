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
    <div className="min-h-screen bg-[#EFF7F6] text-[#181D16] dark:bg-slate-950 dark:text-slate-100">
      <section className="border-b border-[#C6DAD7] bg-[#DDEDEC] py-12 sm:py-16 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#35615B] dark:text-slate-300">
            SEO Toolkit Blog
          </p>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl">
            SEO guides and tips
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#465B55] sm:text-lg dark:text-slate-300">
            Practical explanations and examples to help you understand SEO
            and get more from your website.
          </p>
        </div>
      </section>

      <section
        aria-label="Blog articles"
        className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8"
      >
        {/* Advertisement placement */}
        <div className="mb-8 flex min-h-[100px] items-center justify-center border-y border-[#C6DAD7] text-xs uppercase tracking-widest text-[#465B55] dark:border-slate-800 dark:text-slate-400">
          Advertisement
        </div>

        {posts.length === 0 ? (
          <p className="py-8 text-base text-[#465B55] dark:text-slate-300">
            No articles are published yet.
          </p>
        ) : (
          <div className="border-t border-[#C6DAD7] dark:border-slate-800">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}