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
      className="group flex items-center gap-4 rounded-xl bg-brand-blue p-4 text-brand-ink hover:underline"
    >
      <ToolIcon
        name={tool.icon}
        className="h-5 w-5 shrink-0"
      />

      <div className="min-w-0 flex-1">
        <h3 className="text-base font-semibold">
          {tool.name}
        </h3>
        <p className="mt-0.5 line-clamp-2 text-sm text-slate-600">
          {tool.shortDescription}
        </p>
      </div>

      <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-brand-ink" />
    </Link>
  );
}