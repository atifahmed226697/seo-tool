import type { Metadata } from "next";
import { ToolLayout } from "@/components/ToolLayout";
import LinksCounterUI from "@/components/tools/LinksCounterUI";

export const metadata: Metadata = {
  title: "Links Counter - Count Internal and External Links | SEO Toolkit",
  description:
    "Free links counter. Count internal, external and nofollow links on any page and see every link in a table.",
};

export default function LinksCounterPage() {
  return (
    <ToolLayout
      slug="links-counter"
      title="Links Counter"
      description="Count internal and external links on any page, with nofollow detection."
    >
      <LinksCounterUI />
    </ToolLayout>
  );
}