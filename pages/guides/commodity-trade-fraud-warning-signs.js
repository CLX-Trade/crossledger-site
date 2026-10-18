// Guide: commodity trade fraud warning signs. Sources checked 16 Oct 2026;
// facts carry a source, opinions are marked as ours. Codex-reviewed (eBL
// duplication claim narrowed; desk experience attributed to GDN Group).
import Link from "next/link";
import Guide from "../../components/Guide";

const SOURCES = [
  { label: "J. Saunders, “Commodity trade finance keeps falling for the same fraud. It does not have to”, Trade Finance Global, 7 Sep 2026", url: "https://www.tradefinanceglobal.com/posts/commodity-trade-finance-keeps-falling-same-fraud-does-not-have-to/" },
  { label: "Association of Banks in Singapore, Trade Finance Registry", url: "https://abs.org.sg/industry-guidelines/compliance-and-risk-management/trade-finance-registry" },
  { label: "UK Electronic Trade Documents Act 2023", url: "https://www.legislation.gov.uk/ukpga/2023/38" },
];

export default function CommodityTradeFraud() {
  return (
    <Guide
      slug="commodity-trade-fraud-warning-signs"
      seoTitle="Commodity Trade Fraud: Warning Signs and Checks | CrossLedger"
      description="The fraud patterns that keep recurring in commodity trade finance, the warning signs to watch for, and the document and cargo checks that catch them."
      title="Commodity trade fraud: the warning signs, and the checks that catch them"
      audience="traders, trade-finance teams and inspectors"
      reviewed="16 October 2026"
      reviewedIso="2026-10-16"
      readTime="About 5 min read"
      sources={SOURCES}
    >
      <p>Commodity trade finance doesn&apos;t usually lose money to new tricks. It loses money to the same few patterns, repeated. John Saunders, formerly head of commodity structured trade finance at HSBC Australia, set them out in Trade Finance Global in September 2026: cargo that is missing or smaller than invoiced, the same goods pledged to several lenders, and new borrowing used to cover old losses. His conclusion is that the fixes are known, but that no one in the chain clearly owns them.</p>
      <p>This guide sets out those patterns, the warning signs that tend to come with them, and the checks that make them harder to run.</p>

      <h2>1. The patterns</h2>
      <p><strong>Phantom or short cargo.</strong> Documents describe goods that don&apos;t exist, or more of them than exist. A warehouse receipt, certificate of quality or bill of lading looks normal; the tank or warehouse tells a different story.</p>
      <p><strong>Double financing.</strong> The same cargo, or the same paper description of it, supports finance from more than one lender. Each lender sees a clean file, and none sees the others.</p>
      <p><strong>Rolling the hole.</strong> New finance repays old, so losses stay hidden until the music stops.</p>
      <p><strong>Circular or related-party trades.</strong> Invoices pass between connected companies to create the look of genuine sales, producing paper volume without independent buyers.</p>

      <h2>2. Warning signs</h2>
      <p>From the experience of GDN Group&apos;s trading desk, and the sources below, a deal deserves a second look when:</p>
      <ul>
        <li>the counterparty pushes for payment before an inspection you choose, or insists on its own inspector only;</li>
        <li>documents arrive as scans &ldquo;with originals to follow&rdquo;, and the originals keep slipping;</li>
        <li>the inspection report, certificate or bill can&apos;t be confirmed directly with the issuer (inspector, carrier, terminal);</li>
        <li>the price is well below market without a credible reason;</li>
        <li>the paper trail runs through newly formed or related companies, or a payment account doesn&apos;t match the seller&apos;s name or country;</li>
        <li>the same cargo, vessel or tank appears in more than one offer.</li>
      </ul>
      <p>None of these proves fraud. Each is a reason to verify before money moves.</p>

      <h2>3. The checks that work</h2>
      <p><strong>Confirm documents at the source.</strong> Check a bill of lading with the carrier or its agent, an inspection certificate with the inspection company&apos;s office (not a phone number on the certificate), and a letter of credit with the issuing bank. This is basic practice; it is skipped because it is slow.</p>
      <p><strong>Independent inspection, paid for by the party at risk.</strong> Saunders argues that independent verification is cheap relative to the exposure, and that it gets skipped when nobody owns it. Our view: whoever&apos;s money is released against the cargo should appoint the inspector.</p>
      <p><strong>Shared registries for financing.</strong> Singapore&apos;s banks set up the Trade Finance Registry to catch duplicate financing. The Association of Banks in Singapore owns it, and it was launched in June 2023 &ldquo;to address informational asymmetry to better detect and mitigate duplicate financing&rdquo;, particularly in commodity trade. Nearly 40 banks have joined (ABS).</p>
      <p><strong>Electronic bills of lading.</strong> On a system that enforces exclusive control and protects the record from unauthorised alteration, a bill of lading is much harder to duplicate or alter than paper. On its own it doesn&apos;t stop double financing, for example where finance is raised against different documents or on separate platforms. (See our guide to <Link href="/guides/electronic-bills-of-lading">electronic bills of lading</Link>.)</p>
      <p><strong>Release payment on proof, not on promises.</strong> Payment should be committed early but released only once the documents and the cargo check out.</p>

      <h2>4. What technology can and can&apos;t do</h2>
      <p>Recording a document&apos;s fingerprint (a hash) on a blockchain shows the document hasn&apos;t changed since it was registered, and lets a registry flag the same document if it is registered twice. It does <strong>not</strong> show the document was true when it was registered. A forged certificate fingerprinted on-chain is still forged. Only checks in the physical world (inspection, confirmation with the issuer) establish that the goods exist and match the paper.</p>

      <h2>5. Where CrossLedger fits</h2>
      <p>CrossLedger is in development. It is building settlement for physical commodity trade around the checks above: trade documents fingerprinted on a public registry, payment held in escrow for that one trade, and release designed to happen only when the documents check out and an independent inspector has signed off, with a dispute path if they don&apos;t. It is designed to make these checks routine and visible to every party; it can&apos;t guarantee that a document or cargo is genuine, and no system removes the need for the checks themselves.</p>
    </Guide>
  );
}
