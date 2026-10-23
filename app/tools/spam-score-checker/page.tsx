import type { Metadata } from "next";
import { ToolLayout } from "@/components/ToolLayout";
import { SpamScoreCheckerUI } from "@/components/tools/SpamScoreCheckerUI";

export const metadata: Metadata = {
  title: "Spam Score Checker - Audit Domain Penalty Risk & Toxicity | SEO Toolkit",
  description:
    "Check domain spam score percentages and bad link indicators in single or bulk mode. Protect your backlink network and organic search visibility.",
};

export default function SpamScoreCheckerPage() {
  return (
    <ToolLayout
      slug="spam-score-checker"
      title="Spam Score Checker"
      description="Assess the spam risk and unnatural link profile of any domain name in single or batch mode before acquiring or backlinking."
    >
      <SpamScoreCheckerUI />
    </ToolLayout>
  );
}
