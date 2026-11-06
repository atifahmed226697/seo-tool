import Link from "next/link";
import { LegalPage, LegalHeading } from "@/components/LegalPage";
import { sitePageMetadata } from "@/lib/site-page-metadata";

export const metadata = sitePageMetadata(
  "/terms",
  "Terms and Conditions",
  "Read the terms for using SEO Toolkit, including acceptable use, result limitations and responsibility for submitted inputs.",
);

export default function TermsPage() {
  return (
    <LegalPage title="Terms and Conditions" updated="November 6, 2026">
      <p>
        These terms apply when you use SEO Toolkit. The public tools are free
        to use for personal and commercial work. By using the site, you agree
        to these terms.
      </p>

      <LegalHeading>Acceptable use</LegalHeading>
      <p>Use the tools for lawful tasks and stay within the limits shown on each tool.</p>
      <ul className="list-disc space-y-2 pl-6">
        <li>Submit files and URLs only when you have the right to process or check them.</li>
        <li>Respect rate limits, verification and access restrictions.</li>
        <li>Avoid excessive automated requests, service disruption and attempts to gain unauthorized access.</li>
        <li>Respect intellectual property rights and avoid copying or reselling the site’s tools as your own product.</li>
      </ul>

      <LegalHeading>Results and availability</LegalHeading>
      <p>
        Results depend on the input, the destination response and any external
        data source used for the check. Verify important results against the
        original page or an authoritative record before acting on them. The
        service is provided as available and without warranties to the extent
        permitted by applicable law.
      </p>

      <LegalHeading>Responsibility and limitations</LegalHeading>
      <p>
        You are responsible for your inputs and how you use tool output. To
        the extent permitted by applicable law, SEO Toolkit is not liable for
        losses arising from use of the site or its unavailability, including
        loss of traffic, rankings or revenue.
      </p>

      <LegalHeading>Content and external services</LegalHeading>
      <p>
        You keep the rights you hold in the content you provide. SEO Toolkit’s
        own content and branding are protected by applicable rights. External
        sites and services may have their own terms. See the{" "}
        <Link href="/privacy-policy" className="font-semibold underline">Privacy Policy</Link>
        {" "}for information about how tool inputs are processed.
      </p>

      <LegalHeading>Changes and contact</LegalHeading>
      <p>
        We may revise these terms as the service changes. The date at the top
        shows when this page was last updated. For questions about these
        terms, visit the <Link href="/contact" className="font-semibold underline">contact page</Link>.
      </p>
    </LegalPage>
  );
}
