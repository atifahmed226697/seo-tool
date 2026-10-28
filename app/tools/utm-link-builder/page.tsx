import type { Metadata } from "next";
import { ToolLayout } from "@/components/ToolLayout";
import UtmLinkBuilderUI from "@/components/tools/UtmLinkBuilderUI";

export const metadata: Metadata = {
  title: "UTM Link Builder - Create Campaign Tracking URLs | SEO Toolkit",
  description:
    "Free UTM link builder. Add source, medium and campaign parameters to any URL and copy the tracking link in one click.",
};

export default function UtmLinkBuilderPage() {
  return (
    <ToolLayout
      slug="utm-link-builder"
      title="UTM Link Builder"
      description="Add UTM campaign parameters to any URL so you can track where your traffic comes from in analytics."
    >
      <UtmLinkBuilderUI />
    </ToolLayout>
  );
}