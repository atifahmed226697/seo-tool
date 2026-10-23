import type { Metadata } from "next";
import { ToolLayout } from "@/components/ToolLayout";
import { DaPaCheckerUI } from "@/components/tools/DaPaCheckerUI";

export const metadata: Metadata = {
  title: "DA / PA Checker - Check Domain & Page Authority Bulk | SEO Toolkit",
  description:
    "Check Domain Authority (DA) and Page Authority (PA) metrics in single or bulk mode. Benchmark your backlink profile against search competitors.",
};

export default function DaPaCheckerPage() {
  return (
    <ToolLayout
      slug="da-pa-checker"
      title="DA / PA Checker"
      description="Check Domain Authority (DA) and Page Authority (PA) scores to benchmark search engine ranking capability and backlink strength."
    >
      <DaPaCheckerUI />
    </ToolLayout>
  );
}
