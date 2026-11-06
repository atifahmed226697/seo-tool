import Link from "next/link";
import { LegalPage, LegalHeading } from "@/components/LegalPage";
import { sitePageMetadata } from "@/lib/site-page-metadata";

export const metadata = sitePageMetadata(
  "/privacy-policy",
  "Privacy Policy",
  "See which inputs SEO Toolkit processes in your browser, what public URL checks send to our server, and how verification works.",
);

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="November 6, 2026">
      <p>
        This policy explains how SEO Toolkit handles information when you use
        its tools, visit a page or contact support. You can use the public
        tools without creating an account.
      </p>

      <LegalHeading>Inputs processed in your browser</LegalHeading>
      <p>
        Text editors, generators, image tools and PDF tools process your text
        or selected files in the browser. Image to Text downloads an English
        recognition model so it can process your image on your device.
      </p>

      <LegalHeading>Public website and domain checks</LegalHeading>
      <p>
        When you run a public URL or domain check, the tool sends the address
        to our server to retrieve the result. The check may request the public
        page or query a domain or IP registry. Page Speed Test forwards the
        submitted URL to Google PageSpeed Insights. Use a public address and
        remove private tokens or personal information before submitting it.
      </p>

      <LegalHeading>Verification and service operation</LegalHeading>
      <p>
        We use Cloudflare Turnstile to protect public checks from automated
        abuse. Cloudflare processes information about your browser and
        connection during verification. See the{" "}
        <a href="https://www.cloudflare.com/turnstile-privacy-policy/" className="font-semibold underline">
          Turnstile Privacy Addendum
        </a>
        {" "}for details. Our hosting provider may process technical information
        such as IP addresses, request times and browser information to deliver,
        secure and troubleshoot the site.
      </p>

      <LegalHeading>Cookies and browser storage</LegalHeading>
      <p>
        The site and services it uses may rely on browser storage to support
        tool features or verification. You can manage storage and cookies in
        your browser settings. Clearing stored data can cause a tool to
        download its assets again.
      </p>

      <LegalHeading>When you contact us</LegalHeading>
      <p>
        If you email us, we use your address and the information you send to
        respond and investigate the issue. Share only what is needed to
        reproduce the problem, with private details removed.
      </p>

      <LegalHeading>Children and third party sites</LegalHeading>
      <p>
        SEO Toolkit is intended for a general audience and is not directed at
        children under 13. External sites and services have their own privacy
        practices. Review their policies before sharing information with them.
      </p>

      <LegalHeading>Questions and updates</LegalHeading>
      <p>
        Use the <Link href="/contact" className="font-semibold underline">contact page</Link>
        {" "}for privacy questions. The date at the top of this page shows when
        this policy was last updated.
      </p>
    </LegalPage>
  );
}
