import React from "react";
import { ToolStatus } from "@/lib/tools";
import { Clock, CheckCircle2 } from "lucide-react";

interface ComingSoonBadgeProps {
  status: ToolStatus;
  size?: "sm" | "md";
  className?: string;
}

export function ComingSoonBadge({
  status,
  size = "sm",
  className = "",
}: ComingSoonBadgeProps) {
  const sizeClasses =
    size === "sm" ? "text-xs px-2.5 py-0.5" : "text-sm px-3 py-1";

  if (status === "ready") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/70 ${sizeClasses} ${className}`}
        title="This tool is live"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
        <span>Ready</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60 ${sizeClasses} ${className}`}
      title="This tool is coming soon"
    >
      <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
      <span>Coming soon</span>
    </span>
  );
}