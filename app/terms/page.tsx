import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalHeading } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms & Conditions | SEO Toolkit",
  description:
    "Terms and conditions for using SEO Toolkit, including acceptable use, disclaimers and limits of liability.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms & Conditions" updated="November 2, 2026">
      <p>
        By using SEO Toolkit you agree to these terms. If you do not agree,
        please do not use the site.
      </p>

      <LegalHeading>Use of the tools</LegalHeading>
      <p>
        The tools on this site are free to use for personal and commercial
        work. You are responsible for how you use the results.
      </p>

      <LegalHeading>Acceptable use</LegalHeading>
      <p>When using the site you agree not to:</p>
      <ul className="list-disc space-y-2 pl-6">
        <li>Send automated or excessive requests that slow down the service.</li>
        <li>Try to break, overload or gain unauthorized access to the site.</li>
        <li>
          Use the URL-checking tools to scan websites you have no right to
          check, or for any illegal purpose.
        </li>
        <li>Copy or resell the site&apos;s tools as your own product.</li>
      </ul>

      <LegalHeading>Accuracy of results</LegalHeading>
      <p>
        We try to keep the tools accurate, but results depend on third-party
        data and on the pages you check. Domain, meta tag and link results are
        provided for information only and may sometimes be incomplete or out of
        date. Please verify important results before relying on them.
      </p>

      <LegalHeading>No warranty</LegalHeading>
      <p>
        The site and its tools are provided &quot;as is&quot; and &quot;as
        available&quot;, without warranties of any kind. We do not promise that
        the site will always be available or free of errors.
      </p>

      <LegalHeading>Limitation of liability</LegalHeading>
      <p>
        To the extent allowed by law, SEO Toolkit is not liable for any loss or
        damage that comes from using, or not being able to use, the site or its
        tools, including lost traffic, rankings or revenue.
      </p>

      <LegalHeading>Advertising and third-party links</LegalHeading>
      <p>
        The site may display ads and links to third-party websites. We do not
        control or endorse those sites and are not responsible for their
        content. See our{" "}
        <Link
          href="/privacy-policy"
          className="font-semibold text-indigo-700 underline hover:text-accent-600 dark:text-accent-400"
        >
          Privacy Policy
        </Link>{" "}
        for how advertising cookies work.
      </p>

      <LegalHeading>Intellectual property</LegalHeading>
      <p>
        The design, text and code of SEO Toolkit belong to us. Text you enter
        into the tools remains yours.
      </p>

      <LegalHeading>Changes to these terms</LegalHeading>
      <p>
        We may update these terms from time to time. Continuing to use the site
        after a change means you accept the new terms.
      </p>

      <LegalHeading>Contact us</LegalHeading>
      <p>
        Questions about these terms? Email us at{" "}
        <a
          href="mailto:contact@yourdomain.com"
          className="font-semibold text-indigo-700 underline hover:text-accent-600 dark:text-accent-400"
        >
          contact@yourdomain.com
        </a>
        .
      </p>
    </LegalPage>
  );
}