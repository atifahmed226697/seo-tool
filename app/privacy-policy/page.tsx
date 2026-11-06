import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalHeading } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy | SEO Toolkit",
  description:
    "Read how SEO Toolkit handles your data, cookies and advertising. Most tools run in your browser and we do not require signup.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="November 2, 2026">
      <p>
        SEO Toolkit (&quot;we&quot;, &quot;our&quot;, &quot;the site&quot;)
        offers free online SEO and content tools. This page explains what
        information we handle when you use the site and what choices you have.
      </p>

      <LegalHeading>Information we do not collect</LegalHeading>
      <p>
        You do not need an account to use SEO Toolkit. We do not ask for your
        name, email address or payment details to use the tools.
      </p>

      <LegalHeading>How the tools handle your input</LegalHeading>
      <p>
        Text tools such as the Case Converter, Word Counter, Slug Generator and
        Meta Tag Generator run entirely in your browser. The text you type does
        not leave your device.
      </p>
      <p>
        Tools that check a live page or domain, such as the Domain Age Checker,
        Meta Tag Analyzer, Broken Link Checker, Alt Tag Checker, Links Counter
        and Heading Structure Checker, send the URL or domain you enter to our
        server so it can fetch the result. We do not store these addresses or
        the results.
      </p>

      <p>
        Image and PDF tools process your files in your browser. Image to Text
        downloads an English recognition model. Page Speed Test sends the URL
        you submit to Google PageSpeed Insights to run a Lighthouse test.
        Domain Hosting Checker queries public IP registration services.
      </p>

      <LegalHeading>Technical data and abuse protection</LegalHeading>
      <p>
        Like most websites, our server and hosting provider may process
        technical data such as your IP address, browser type and request time.
        We use this only to keep the site working, to limit abuse and to
        protect the tools from excessive automated requests.
      </p>

      <LegalHeading>Cookies and advertising</LegalHeading>
      <p>
        We may show ads on this site through Google AdSense or similar
        advertising partners. These third-party vendors, including Google, use
        cookies to serve ads based on your previous visits to this and other
        websites.
      </p>
      <p>
        You can opt out of personalized advertising by visiting Google Ads
        Settings, or by visiting www.aboutads.info. You can also block or
        delete cookies from your browser settings. Some site features may work
        differently if you block cookies.
      </p>

      <LegalHeading>Analytics</LegalHeading>
      <p>
        We may use privacy-respecting analytics to understand which tools are
        used most, so we can improve them. This data is collected in aggregate
        and does not identify you personally.
      </p>

      <LegalHeading>Third-party links</LegalHeading>
      <p>
        Some pages may link to other websites. We are not responsible for the
        content or privacy practices of those sites, so please read their
        policies before sharing any information.
      </p>

      <LegalHeading>Children&apos;s privacy</LegalHeading>
      <p>
        SEO Toolkit is not directed to children under 13, and we do not
        knowingly collect personal information from children.
      </p>

      <LegalHeading>Changes to this policy</LegalHeading>
      <p>
        We may update this policy from time to time. The date at the top of
        this page shows when it was last changed.
      </p>

      <LegalHeading>Contact us</LegalHeading>
      <p>
        If you have questions about this policy, email us at{" "}
        <a
          href="mailto:contact@yourdomain.com"
          className="font-semibold text-indigo-700 underline hover:text-accent-600 dark:text-accent-400"
        >
          contact@yourdomain.com
        </a>
        . You can also read our{" "}
        <Link
          href="/terms"
          className="font-semibold text-indigo-700 underline hover:text-accent-600 dark:text-accent-400"
        >
          Terms &amp; Conditions
        </Link>
        .
      </p>
    </LegalPage>
  );
}