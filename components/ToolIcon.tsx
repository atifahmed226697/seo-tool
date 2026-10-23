import React from "react";
import {
  Type,
  FileCode2,
  SearchCode,
  CalendarClock,
  BarChart3,
  ShieldAlert,
  Globe,
  LucideProps,
  Wrench,
} from "lucide-react";
import { Tool } from "@/lib/tools";

interface ToolIconProps extends LucideProps {
  name: Tool["icon"] | string;
}

export function ToolIcon({ name, ...props }: ToolIconProps) {
  switch (name) {
    case "Type":
      return <Type {...props} />;
    case "FileCode2":
      return <FileCode2 {...props} />;
    case "SearchCode":
      return <SearchCode {...props} />;
    case "CalendarClock":
      return <CalendarClock {...props} />;
    case "BarChart3":
      return <BarChart3 {...props} />;
    case "ShieldAlert":
      return <ShieldAlert {...props} />;
    case "Globe":
      return <Globe {...props} />;
    default:
      return <Wrench {...props} />;
  }
}
