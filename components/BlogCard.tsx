import React from "react";
import Link from "next/link";
import { PostMeta, formatDate } from "@/lib/blog";

export function BlogCard({ post }: { post: PostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex items-start gap-5 border-b border-slate-200 py-6 dark:border-slate-800"
    >
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-wider text-accent-600 dark:text-accent-400">
          {post.category}
        </p>
        <h3 className="mt-1 text-xl font-bold text-slate-900 transition-colors group-hover:text-accent-600 dark:text-white dark:group-hover:text-accent-400">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-base text-slate-600 dark:text-slate-400">
          {post.description}
        </p>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-500">
          {formatDate(post.date)} &nbsp;·&nbsp; {post.readMinutes} min read
        </p>
      </div>

      {post.image && (
        <img
          src={post.image}
          alt={post.title}
          loading="lazy"
          className="hidden h-24 w-36 shrink-0 rounded-md border border-slate-200 object-cover sm:block dark:border-slate-800"
        />
      )}
    </Link>
  );
}