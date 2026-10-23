import React from "react";
import Link from "next/link";
import { Tool } from "@/lib/tools";
import { ToolIcon } from "@/components/ToolIcon";
import { ComingSoonBadge } from "@/components/ComingSoonBadge";
import { ArrowRight } from "lucide-react";

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-indigo-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-indigo-500/70">
      <div>
        {/* Header: Icon, Category & Status Badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-950/60 dark:text-indigo-400 dark:group-hover:bg-indigo-500 dark:group-hover:text-white">
            <ToolIcon name={tool.icon} className="h-5 w-5" />
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <ComingSoonBadge status={tool.status} />
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {tool.category}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400">
          <Link href={`/tools/${tool.slug}`} className="focus:outline-none">
            <span className="absolute inset-0" aria-hidden="true" />
            {tool.name}
          </Link>
        </h3>

        {/* Short Description */}
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-2">
          {tool.shortDescription}
        </p>
      </div>

      {/* Footer link cue */}
      <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs font-medium text-slate-500 dark:text-slate-400">
        <span className="text-slate-400 dark:text-slate-500">
          {tool.estimatedStep}
        </span>
        <span className="inline-flex items-center gap-1 text-indigo-600 group-hover:translate-x-0.5 transition-transform font-semibold dark:text-indigo-400">
          Open Tool
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  );
}
