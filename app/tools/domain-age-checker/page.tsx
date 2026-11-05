import { ToolLayout } from "@/components/ToolLayout";
import DomainAgeCheckerUI from "@/components/tools/DomainAgeCheckerUI";
import { getToolMetadata } from "@/lib/tool-metadata";

export const metadata = getToolMetadata("domain-age-checker", {
  title: "Domain Age Checker - Lookup Registration & Creation Date",
  description:
    "Check exact domain creation dates, domain age, registrar information and expiration dates. Perfect for SEO due diligence and expired domain research.",
});

export default function DomainAgeCheckerPage() {
  return (
    <ToolLayout
      slug="domain-age-checker"
      title="Domain Age Checker"
      description="Find out the exact age of any domain name, its original creation date, registrar and expiration timeline."
    >
      <DomainAgeCheckerUI />
    </ToolLayout>
  );
}