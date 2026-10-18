// Guide: electronic bills of lading. Sources checked 16 Oct 2026; facts carry
// a source, opinions are marked as ours. Codex-reviewed (lawful-holder wording).
import Guide from "../../components/Guide";

const SOURCES = [
  { label: "UK Electronic Trade Documents Act 2023, s.2", url: "https://www.legislation.gov.uk/ukpga/2023/38" },
  { label: "UNCITRAL, MLETR status (checked 16 Oct 2026)", url: "https://uncitral.un.org/en/texts/ecommerce/modellaw/electronic_transferable_records/status" },
  { label: "SAFETY4SEA, “Netherlands adopts electronic bills of lading legislation”, 6 Apr 2026", url: "https://safety4sea.com/netherlands-adopts-electronic-bills-of-lading-legislation/" },
  { label: "DCSA press release, Feb 2023", url: "https://dcsa.org/newsroom/resources/dcsas-member-carriers-commit-to-a-fully-standardised-electronic-bill-of-lading-by-2030/" },
  { label: "Smart Maritime Network, “BIMCO updates eBL standard”, 25 Sep 2026", url: "https://smartmaritimenetwork.com/2026/09/25/bimco-updates-ebl-standard/" },
  { label: "West P&I, “Paperless Trading: A Guide to Electronic Bills of Lading”", url: "https://www.westpandi.com/News-and-Resources/Bills-of-Lading/Paperless-Trading-A-Guide-to-Electronic-Bills-of-L/" },
];

export default function ElectronicBillsOfLading() {
  return (
    <Guide
      slug="electronic-bills-of-lading"
      seoTitle="Electronic Bills of Lading: How They Work | CrossLedger Guide"
      description="What an electronic bill of lading is, where the law recognises it, how carriers and P&I clubs treat it, and the practical checks before you trade on one."
      title="Electronic bills of lading: how they work, and what to check before you trade on one"
      audience="commodity traders, trade-finance teams and logistics operators"
      reviewed="16 October 2026"
      reviewedIso="2026-10-16"
      readTime="About 6 min read"
      sources={SOURCES}
    >
      <p>A bill of lading does three jobs: it is the carrier&apos;s receipt for the goods, evidence of the contract of carriage, and, when negotiable, a document of title: subject to its terms, any required endorsement and the governing law, the lawful holder of the original is entitled to claim delivery of the goods. That third job is why paper has lasted so long. Transferring title has meant transferring a physical original, by courier, often several times along a chain of buyers and banks.</p>
      <p>An electronic bill of lading (eBL) aims to do the same three jobs with a record that can be &ldquo;held&rdquo; and transferred digitally. Whether it can depends less on the software than on the law and on the parties around the trade.</p>

      <h2>1. What makes an electronic bill &ldquo;the original&rdquo;</h2>
      <p>The hard problem is uniqueness. A PDF can be copied, so a paper-equivalent electronic document needs a system that ensures only one party controls it at any time and that it can&apos;t be altered without trace.</p>
      <p>The UK&apos;s Electronic Trade Documents Act 2023 is a good example of how the law frames this. It doesn&apos;t prescribe a technology. A document qualifies as an &ldquo;electronic trade document&rdquo; when &ldquo;a reliable system&rdquo; is used to, among other things, identify the document, protect it from unauthorised alteration, and ensure only one person can exercise control of it at a time (section 2). Blockchain is one way to meet that test, not a requirement.</p>

      <h2>2. Where the law recognises eBLs</h2>
      <p>Most legal reform follows the UNCITRAL Model Law on Electronic Transferable Records (MLETR, 2017). As of 16 October 2026, UNCITRAL&apos;s status page lists 13 jurisdictions with legislation based on or influenced by it, including Singapore (2021), Abu Dhabi Global Market (2021), Papua New Guinea (2022), the United Kingdom (2023), France (2024) and China (2025, bills of lading only).</p>
      <p>Outside that list, the Netherlands has also recognised eBLs as the legal equivalent of paper, as reported by ICC Netherlands (SAFETY4SEA, 6 April 2026).</p>
      <p>What this means in practice: check which law governs your bill of lading and the contract around it. A good eBL on a reliable platform is still exposed if the law that governs it, or a court asked to enforce it, doesn&apos;t recognise electronic transferable records. Ask your lawyers how conflict-of-laws rules apply to your chain.</p>

      <h2>3. Where the industry is</h2>
      <ul>
        <li><strong>Container lines.</strong> In February 2023 the nine member carriers of the Digital Container Shipping Association committed to digitising 50% of original bills of lading within five years and to full adoption of a standardised eBL by 2030 (DCSA press release).</li>
        <li><strong>Bulk shipping.</strong> On 25 September 2026 BIMCO released version 2.0 of its open eBL standard for bulk trades: 36 predefined data fields, aligned with UN/CEFACT, aimed at interoperability between platforms (Smart Maritime Network).</li>
        <li><strong>Insurance.</strong> P&amp;I cover for liabilities arising from eBLs has historically depended on using a system approved by the International Group of P&amp;I Clubs. From 20 February 2025 the Group treats systems meeting set criteria as &ldquo;deemed approved&rdquo; (West P&amp;I guidance). Confirm the position with your own club before relying on a particular platform.</li>
      </ul>

      <h2>4. Practical checks before you trade on an eBL</h2>
      <p>These are our recommendations, not legal advice:</p>
      <ol>
        <li><strong>Same platform, or interoperable platforms.</strong> Every party who must hold the bill (shipper, carrier, banks, buyers) needs access. Ask early.</li>
        <li><strong>Governing law.</strong> Confirm the bill and the sale contract sit under a law that recognises electronic transferable records.</li>
        <li><strong>Bank acceptance.</strong> If a letter of credit is involved, confirm the issuing and confirming banks accept eBLs, and on which platforms, before the credit is issued.</li>
        <li><strong>P&amp;I position.</strong> Confirm the carrier&apos;s club covers the platform.</li>
        <li><strong>Switching back to paper.</strong> Know the platform&apos;s procedure if a party late in the chain can&apos;t accept an eBL.</li>
        <li><strong>The cargo itself.</strong> An eBL makes the document harder to forge or duplicate. It doesn&apos;t make the description of the goods true. Quantity and quality still need independent inspection.</li>
      </ol>

      <h2>5. Where CrossLedger fits</h2>
      <p>CrossLedger is in development and is not an eBL platform. It is building a settlement layer for physical commodity trades: trade documents are fingerprinted on a public registry so later changes are detectable, payment is held in escrow for that one trade, and release is designed to happen only when the documents check out and an independent inspector has signed off. Paper bills, eBLs from approved platforms, and inspection reports would all be inputs to that check.</p>
    </Guide>
  );
}
