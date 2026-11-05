import React from "react";
import Link from "next/link";
import { Tool } from "@/lib/tools";
import { ToolIcon } from "@/components/ToolIcon";
import { ArrowRight } from "lucide-react";

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex items-center gap-4 border-b border-slate-200 px-2 py-4 transition-colors hover:bg-white dark:border-slate-800 dark:hover:bg-slate-900"
    >
      <ToolIcon
        name={tool.icon}
        className="h-5 w-5 shrink-0 text-indigo-700 dark:text-accent-400"
      />

      <div className="min-w-0 flex-1">
        <h3 className="text-base font-semibold text-slate-900 transition-colors group-hover:text-accent-600 dark:text-slate-100 dark:group-hover:text-accent-400">
          {tool.name}
        </h3>
        <p className="mt-0.5 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
          {tool.shortDescription}
        </p>
      </div>

      <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-accent-600 dark:group-hover:text-accent-400" />
    </Link>
  );
}