import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PostMeta, formatDate } from "@/lib/blog";

export function BlogCard({ post }: { post: PostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col gap-5 border-b border-[#C6DAD7] px-3 py-6 transition-colors hover:bg-[#DDEDEC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#35615B] sm:flex-row sm:items-start sm:gap-7 sm:px-5 sm:py-8 dark:border-slate-800 dark:hover:bg-slate-900"
    >
      {post.image && (
        <img
          src={post.image}
          alt=""
          loading="lazy"
          decoding="async"
          width={320}
          height={200}
          className="aspect-[8/5] w-full shrink-0 rounded-lg object-cover sm:w-48 lg:w-56"
        />
      )}

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#35615B] dark:text-slate-300">
          {post.category}
        </p>

        <h3 className="mt-2 text-xl font-bold leading-snug tracking-tight text-[#181D16] group-hover:underline group-hover:underline-offset-4 sm:text-2xl dark:text-white">
          {post.title}
        </h3>

        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[#465B55] sm:text-base dark:text-slate-300">
          {post.description}
        </p>

        <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#465B55] sm:text-sm dark:text-slate-400">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readMinutes} min read</span>
        </p>
      </div>

      <ArrowUpRight
        aria-hidden="true"
        className="hidden h-5 w-5 shrink-0 text-[#35615B] sm:mt-1 sm:block dark:text-slate-300"
      />
    </Link>
  );
}