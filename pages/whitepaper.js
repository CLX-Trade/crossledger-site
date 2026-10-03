import Link from "next/link";
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Seo from "../components/Seo";
import { CONTRACTS, SITE, shortAddr } from "../lib/site";

// Version and status. Update the date and the "Before you read" box whenever a
// fact below changes on-chain.
const VERSION = "2.0";
const UPDATED = "3 October 2026";

const TOC = [
  { id: "abstract", title: "A settlement layer for physical commodity trade" },
  { id: "introduction", title: "How commodity trade settles today", children: [
    { id: "instruments", title: "Letters of credit and documentary collections" },
    { id: "documents", title: "The document problem" },
    { id: "fraud", title: "Fraud and duplicate financing" },
    { id: "prior", title: "Earlier attempts: consortium ledgers" },
  ]},
  { id: "design", title: "CrossLedger design", children: [
    { id: "principles", title: "Design principles" },
    { id: "participants", title: "Participants" },
    { id: "registry", title: "The document registry" },
    { id: "escrow", title: "Conditional escrow" },
    { id: "attestations", title: "Inspection attestations" },
    { id: "lifecycle", title: "A trade, end to end" },
    { id: "disputes", title: "Disputes" },
    { id: "privacy", title: "Privacy and data" },
    { id: "legal-effect", title: "Legal effect of electronic records" },
  ]},
  { id: "token", title: "The CLXT token", children: [
    { id: "token-facts", title: "On-chain facts" },
    { id: "utility", title: "Intended utility" },
    { id: "allocation", title: "Allocation" },
    { id: "supply", title: "Supply accounting and staking" },
    { id: "presale", title: "Presale" },
    { id: "presale-defect", title: "The V1 presale defect" },
  ]},
  { id: "business", title: "Business model" },
  { id: "roadmap", title: "Status and roadmap" },
  { id: "team", title: "Team" },
  { id: "regulatory", title: "Regulatory position and restrictions" },
  { id: "risks", title: "Risk factors" },
  { id: "conclusion", title: "Conclusion" },
  { id: "notes", title: "Notes and references" },
];

const flatIds = TOC.flatMap((s) => [s.id, ...(s.children || []).map((c) => c.id)]);

function useActiveSection() {
  const [active, setActive] = useState(flatIds[0]);
  useEffect(() => {
    // The active entry is the last heading that has scrolled past the header.
    const els = flatIds.map((id) => document.getElementById(id)).filter(Boolean);
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = els[0]?.id;
      for (const el of els) {
        if (el.getBoundingClientRect().top <= 120) current = el.id;
        else break;
      }
      if (current) setActive(current);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (frame) cancelAnimationFrame(frame); };
  }, []);
  return active;
}

function Toc({ active }) {
  return (
    <ol>
      {TOC.map((s) => (
        <li key={s.id}>
          <a href={`#${s.id}`} className={active === s.id ? "active" : ""}>{s.title}</a>
          {s.children && (
            <ol>
              {s.children.map((c) => (
                <li key={c.id}><a href={`#${c.id}`} className={active === c.id ? "active" : ""}>{c.title}</a></li>
              ))}
            </ol>
          )}
        </li>
      ))}
    </ol>
  );
}

const Fn = ({ n }) => <sup><a href={`#fn-${n}`} id={`ref-${n}`} aria-label={`Note ${n}`}>[{n}]</a></sup>;
const Addr = ({ a, kind = "address" }) => (
  <a href={`https://etherscan.io/${kind}/${a}`} target="_blank" rel="noopener"><code>{shortAddr(a)}</code></a>
);

function ArchitectureDiagram() {
  return (
    <figure className="diagram" aria-labelledby="fig1">
      <svg viewBox="0 0 760 340" role="img" aria-label="CrossLedger architecture: off-chain documents and inspectors feed hashes and signed attestations into the registry and escrow contracts on Ethereum">
        <defs>
          <marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path className="arrow" d="M0,0 L10,5 L0,10 z" /></marker>
          <marker id="ahh" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path className="arrow-hl" d="M0,0 L10,5 L0,10 z" /></marker>
        </defs>
        <text x="20" y="28" fontSize="13" fontWeight="700" className="muted-text">OFF-CHAIN</text>
        <text x="410" y="28" fontSize="13" fontWeight="700" className="muted-text">ETHEREUM MAINNET</text>
        <line x1="385" y1="16" x2="385" y2="324" className="edge" strokeDasharray="4 5" />

        <rect className="box" x="20" y="48" width="160" height="58" rx="10" />
        <text x="100" y="73" fontSize="14" fontWeight="700" textAnchor="middle">Seller / buyer</text>
        <text x="100" y="92" fontSize="12" textAnchor="middle" className="muted-text">contract, invoice, B/L</text>

        <rect className="box" x="20" y="140" width="160" height="58" rx="10" />
        <text x="100" y="165" fontSize="14" fontWeight="700" textAnchor="middle">Inspector</text>
        <text x="100" y="184" fontSize="12" textAnchor="middle" className="muted-text">quantity and quality</text>

        <rect className="box" x="20" y="232" width="160" height="58" rx="10" />
        <text x="100" y="257" fontSize="14" fontWeight="700" textAnchor="middle">Document store</text>
        <text x="100" y="276" fontSize="12" textAnchor="middle" className="muted-text">encrypted originals</text>

        <rect className="box-hl" x="410" y="48" width="170" height="70" rx="10" />
        <text x="495" y="77" fontSize="14" fontWeight="700" textAnchor="middle">Document registry</text>
        <text x="495" y="97" fontSize="12" textAnchor="middle" className="muted-text">hash · type · trade · signer</text>

        <rect className="box-hl" x="410" y="160" width="170" height="70" rx="10" />
        <text x="495" y="189" fontSize="14" fontWeight="700" textAnchor="middle">Conditional escrow</text>
        <text x="495" y="209" fontSize="12" textAnchor="middle" className="muted-text">USDT / USDC held per trade</text>

        <rect className="box" x="610" y="160" width="130" height="70" rx="10" />
        <text x="675" y="189" fontSize="14" fontWeight="700" textAnchor="middle">Seller wallet</text>
        <text x="675" y="209" fontSize="12" textAnchor="middle" className="muted-text">released funds</text>

        <rect className="box" x="410" y="262" width="170" height="52" rx="10" />
        <text x="495" y="293" fontSize="14" fontWeight="700" textAnchor="middle">CLXT (fees, bonds)</text>

        <path className="edge" d="M180 77 H 404" markerEnd="url(#ah)" />
        <text x="292" y="69" fontSize="12" textAnchor="middle" className="muted-text">document hashes</text>
        <path className="edge" d="M180 169 C 290 169, 300 195, 404 195" markerEnd="url(#ah)" />
        <text x="292" y="160" fontSize="12" textAnchor="middle" className="muted-text">signed attestation</text>
        <path className="edge" d="M100 232 V 204" markerEnd="url(#ah)" strokeDasharray="3 4" />
        <path className="edge-hl" d="M495 118 V 154" markerEnd="url(#ahh)" />
        <text x="503" y="141" fontSize="12" className="muted-text">conditions met?</text>
        <path className="edge-hl" d="M580 195 H 604" markerEnd="url(#ahh)" />
        <path className="edge" d="M495 230 V 256" markerEnd="url(#ah)" strokeDasharray="3 4" />
      </svg>
      <figcaption id="fig1">Figure 1. Documents never go on-chain; their fingerprints do. Escrow releases when the registry and a signed inspection attestation satisfy the trade&apos;s conditions.</figcaption>
    </figure>
  );
}

function EscrowStates() {
  const s = [
    ["Created", 20], ["Funded", 150], ["Documents lodged", 280], ["Inspected", 430], ["Released", 570],
  ];
  return (
    <figure className="diagram" aria-labelledby="fig2">
      <svg viewBox="0 0 700 200" role="img" aria-label="Escrow states: Created, Funded, Documents lodged, Inspected, Released; with Disputed and Refunded branches">
        <defs>
          <marker id="a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path className="arrow" d="M0,0 L10,5 L0,10 z" /></marker>
        </defs>
        {s.map(([label, x], i) => (
          <g key={label}>
            <rect className={i === 4 ? "box-hl" : "box"} x={x} y="40" width={i === 2 ? 128 : 108} height="44" rx="22" />
            <text x={x + (i === 2 ? 64 : 54)} y="67" fontSize="13" fontWeight="700" textAnchor="middle">{label}</text>
          </g>
        ))}
        <path className="edge" d="M128 62 H 144" markerEnd="url(#a2)" />
        <path className="edge" d="M258 62 H 274" markerEnd="url(#a2)" />
        <path className="edge" d="M408 62 H 424" markerEnd="url(#a2)" />
        <path className="edge" d="M538 62 H 564" markerEnd="url(#a2)" />
        <rect className="box" x="300" y="138" width="108" height="44" rx="22" />
        <text x="354" y="165" fontSize="13" fontWeight="700" textAnchor="middle">Disputed</text>
        <rect className="box" x="470" y="138" width="108" height="44" rx="22" />
        <text x="524" y="165" fontSize="13" fontWeight="700" textAnchor="middle">Refunded</text>
        <path className="edge" d="M344 84 V 132" markerEnd="url(#a2)" />
        <path className="edge" d="M470 84 C 470 110, 380 110, 370 132" markerEnd="url(#a2)" />
        <path className="edge" d="M408 160 H 464" markerEnd="url(#a2)" />
        <path className="edge" d="M408 150 C 500 120, 600 120, 620 90" markerEnd="url(#a2)" />
        <text x="96" y="132" fontSize="12" className="muted-text">deadline missed</text>
        <path className="edge" d="M204 84 C 204 150, 420 190, 470 172" markerEnd="url(#a2)" strokeDasharray="3 4" />
      </svg>
      <figcaption id="fig2">Figure 2. Escrow lifecycle. Funds move only forward to release, or sideways to dispute and refund. No party can withdraw funds unilaterally once a trade is funded.</figcaption>
    </figure>
  );
}

export default function Whitepaper() {
  const active = useActiveSection();

  return (
    <Layout>
      <Seo
        title="CrossLedger Whitepaper | Settlement Infrastructure for Commodity Trade"
        description="The CrossLedger whitepaper, version 2.0: a document registry, conditional escrow and inspection attestations for cross-border commodity trade, and the CLXT token."
        path="/whitepaper"
        type="article"
        jsonLd={{
          "@context": "https://schema.org", "@type": "TechArticle",
          headline: "CrossLedger Whitepaper", version: VERSION, dateModified: "2026-10-03",
          author: { "@type": "Organization", name: "GDN Group" },
          publisher: { "@type": "Organization", name: "GDN Enterprise Pty Ltd" },
          url: `${SITE.url}/whitepaper`,
        }}
      />
      <div className="container">
        <div className="doc">
          <article>
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link href="/">crossledger.trade</Link><span>/</span><span aria-current="page">Whitepaper</span>
            </nav>
            <h1 className="doc-title">CrossLedger Whitepaper</h1>
            <div className="doc-meta">
              <span>Version {VERSION}</span><span>Updated {UPDATED}</span><span>GDN Group</span><span>~25 min read</span>
            </div>
            <div className="doc-tools">
              <a className="btn btn-outline" href="/CrossLedger-CLXT-Whitepaper.pdf" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m0 0-4-4m4 4 4-4M5 21h14" /></svg>
                Download PDF
              </a>
              <button type="button" className="btn btn-outline" onClick={() => window.print()}>Print</button>
            </div>

            <div className="mobile-toc">
              <details><summary>On this page</summary><Toc active={active} /></details>
            </div>

            <div className="prose">
              <div className="callout">
                <span className="badge-outline">Before you read</span>
                <h2 style={{ marginTop: 14 }}>What is true today</h2>
                <p>CrossLedger is in development. The token and a first presale contract are live on Ethereum; the trade platform described in <a href="#design">Section 3</a> is not yet processing commercial trades. This paper separates what exists from what is planned, and says which is which.</p>
                <p><strong>CLXT purchases are paused as at {UPDATED}.</strong> The first presale contract cannot complete a purchase (see <a href="#presale-defect">The V1 presale defect</a>). A corrected contract has been written and tested against a copy of mainnet. It will only be enabled after deployment and a live test purchase. Do not send funds to any contract address directly.</p>
                <div className="actions">
                  <Link href="/#presale" className="btn btn-primary">Check presale status →</Link>
                  <Link href="/how-it-works" className="btn btn-outline">How CrossLedger works</Link>
                </div>
                <div className="callout-inner">
                  <h4>What changed since version 1.0 (March 2026)</h4>
                  <ul>
                    <li>Total supply corrected to 1,000,000,000 CLXT, the figure in the deployed contract (v1.0 said 980,000,000).</li>
                    <li>The &quot;US$13.50 launch target&quot; and all projected listing prices are withdrawn. CrossLedger publishes no price targets.</li>
                    <li>Presale mechanics now describe the deployed contract (instant delivery, owner-set rate), not the claim-based design v1.0 described.</li>
                    <li>Two contract defects are disclosed: the presale purchase failure and the staking supply-accounting issue.</li>
                    <li>Regulatory section rewritten. Australia is a restricted jurisdiction pending legal advice.</li>
                  </ul>
                </div>
              </div>

              <h2 id="abstract">A settlement layer for physical commodity trade</h2>
              <p>A cargo of diesel, sugar or copper concentrate is paid for against paper. A bill of lading, an inspection certificate, an invoice and a dozen supporting documents travel by courier between banks in different countries while the goods travel by sea. Payment waits for the paper. When the paper is late, wrong or forged, everyone waits longer, and sometimes the money goes to the wrong party.</p>
              <p>CrossLedger is infrastructure to change the order of operations. Trade documents are fingerprinted and registered on a public ledger the moment they are issued. Payment is held in a programmable escrow that releases when the registered documents and a signed inspection result satisfy the conditions both parties agreed in advance. The buyer knows the money moves only on proof; the seller knows the money is already there.</p>
              <p>None of this needs a new cryptocurrency for settlement. Trades settle in dollar stablecoins. The CLXT token has a narrower job: it pays platform fees and, in a later phase, bonds the inspectors and verifiers whose signatures release funds. This paper describes the problem, the design, the token, the current state of the deployed contracts, and the risks.</p>

              <h2 id="introduction">How commodity trade settles today</h2>
              <h3 id="instruments">Letters of credit and documentary collections</h3>
              <p>Cross-border commodity sales are usually paid in one of three ways. On <em>open account</em> the seller ships and trusts the buyer to pay. With a <em>documentary collection</em>, banks exchange documents for payment but give no guarantee. With a <em>documentary letter of credit</em> (LC), the buyer&apos;s bank undertakes to pay the seller if, and only if, the seller presents documents that comply with the credit&apos;s terms, under the ICC&apos;s Uniform Customs and Practice for Documentary Credits (UCP 600).<Fn n={1} /></p>
              <p>The LC is the workhorse of bulk commodity trade because it replaces counterparty risk with bank risk. It is also slow and expensive. Banks examine documents, not goods; a discrepancy in a date or a port name can block payment even when the cargo is perfect. Settlement commonly takes 5 to 14 business days after presentation, and LC issuance, confirmation and negotiation fees for emerging-market trades often total 1 to 3 percent of transaction value.</p>
              <p>For small and mid-sized exporters the problem is access, not just cost. The Asian Development Bank estimates the global trade finance gap, meaning requests for trade finance that banks decline, at US$2.5 trillion, with small firms bearing a disproportionate share of rejections.<Fn n={2} /></p>

              <h3 id="documents">The document problem</h3>
              <p>A single international shipment can involve dozens of parties and documents. The ICC Digital Standards Initiative estimates that one transaction can require up to 36 original documents and 240 copies.<Fn n={3} /> Most are still paper or unstructured PDF, issued by different organisations on different systems. Each party reconciles them by hand against its own records.</p>
              <p>The bill of lading matters most, because for most of trade history possession of the paper original has meant control of the goods. That is why it travels by courier, why it can be lost, and why the industry has relied on letters of indemnity to release cargo without it, shifting risk rather than removing it.</p>

              <h3 id="fraud">Fraud and duplicate financing</h3>
              <p>Because no shared record says which documents exist and who has relied on them, the same cargo can be financed more than once. In the 2014 Qingdao port case, metal stocks were pledged to multiple lenders using duplicate warehouse receipts. In 2020 the Singapore oil trader Hin Leong collapsed owing banks about US$3.5 billion, and criminal charges of forgery and cheating followed.<Fn n={4} /> In both cases each lender held documents that looked valid in isolation. A common registry that every financier checks before advancing funds would have shown the duplication.</p>
              <p>GDN Group meets the everyday version of this problem on its own trade desk: counterparties offering cargoes they do not control, supported by documents that do not survive verification. CrossLedger began as the tool the desk needed.</p>

              <h3 id="prior">Earlier attempts: consortium ledgers</h3>
              <p>The idea is not new, and the history is instructive. Between 2017 and 2023 several bank- and carrier-led consortia built permissioned blockchain networks for trade: we.trade, Marco Polo, Contour and the Maersk and IBM TradeLens platform. All four have since closed or become insolvent.<Fn n={5} /></p>
              <p>Their technology broadly worked. What failed was the network: each needed every bank, carrier and trader to join one private system, on terms set by competitors, before it delivered value to anyone. CrossLedger draws three lessons from this. Use a public, neutral chain that nobody has to be invited onto. Deliver value to a single trade between two parties, before any network effect. And start from a trading desk with real cargoes rather than a consortium with a mandate.</p>

              <h2 id="design">CrossLedger design</h2>
              <ArchitectureDiagram />

              <h3 id="principles">Design principles</h3>
              <ul>
                <li><strong>Fingerprints, not documents.</strong> Only cryptographic hashes and minimal metadata are written on-chain. Commercial documents stay private.</li>
                <li><strong>Stablecoin settlement.</strong> Trades settle in USDT or USDC. Neither party takes price exposure to CLXT.</li>
                <li><strong>Conditions agreed up front.</strong> Release rules are fixed when the escrow is created and cannot be changed by one party afterwards.</li>
                <li><strong>Named, accountable signers.</strong> Releases depend on identified inspectors and parties whose signing keys are bound to verified identities, not on anonymous oracles.</li>
                <li><strong>Exit to the real world.</strong> Every trade keeps a governing-law contract and a dispute path that works without the platform.</li>
              </ul>

              <h3 id="participants">Participants</h3>
              <div className="table-wrap">
                <table className="data">
                  <thead><tr><th>Role</th><th>What they do on CrossLedger</th></tr></thead>
                  <tbody>
                    <tr><td>Seller</td><td>Creates the trade, registers commercial and shipping documents, receives released funds.</td></tr>
                    <tr><td>Buyer</td><td>Accepts terms, funds escrow in stablecoins, can raise a dispute before release.</td></tr>
                    <tr><td>Inspector</td><td>Independent surveyor (for example SGS, Intertek, Bureau Veritas, Saybolt) who signs a quantity and quality attestation.</td></tr>
                    <tr><td>Financier (optional)</td><td>Checks the registry before advancing funds against a cargo; can be named as payee.</td></tr>
                    <tr><td>Arbitrator</td><td>Named in the trade terms; resolves disputes and directs release or refund.</td></tr>
                  </tbody>
                </table>
              </div>
              <p>Participants are onboarded through know-your-customer and know-your-business checks run by a regulated third-party provider. The contracts record only that a wallet has passed verification, never who it belongs to.</p>

              <h3 id="registry">The document registry</h3>
              <p>When a document is issued, its SHA-256 hash is written to the registry with a document type (contract, invoice, bill of lading, certificate of origin, inspection report and so on), the trade it belongs to, the submitting wallet and a timestamp. Anyone holding the original can later prove it is the registered version by hashing it again. Any change to a single character produces a different hash.</p>
              <p>Two properties follow. First, <em>uniqueness</em>: the registry refuses a hash that is already registered, so the same file cannot be presented twice without the conflict showing. A hash only matches an identical file, though: a rescanned or edited copy of the same bill of lading produces a different hash. Stronger protection therefore keys each entry to issuer-authenticated identifiers, such as the bill of lading number and the carrier that issued it, and records each financing against them. That identifier layer is part of the planned design and is not yet built. Second, <em>provenance</em>: each entry shows which identified party submitted it and when, and verifiers can mark entries verified, rejected or revoked.</p>

              <h3 id="escrow">Conditional escrow</h3>
              <p>Each trade has its own escrow. The seller creates it with the amount, the stablecoin, the required documents, the inspection requirement, a delivery deadline and the arbitrator. The buyer funds it. From that point neither party can withdraw funds alone.</p>
              <EscrowStates />
              <p>Release happens when every required document is registered and verified and the inspection attestation reports results inside the agreed tolerances. If the deadline passes without the conditions being met, the buyer can reclaim the funds. Either party can raise a dispute before release, which freezes the escrow until the named arbitrator rules.</p>
              <p>The platform fee, targeted at 0.2 to 0.4 percent of trade value, is charged when the escrow is funded, with a discount when paid in CLXT. These are design targets, not rates CrossLedger has achieved in operation.</p>

              <h3 id="attestations">Inspection attestations</h3>
              <p>The weakest point of any on-chain settlement system is the bridge to physical reality: something has to tell the contract that the goods exist and match the contract. CrossLedger does not pretend this can be made trustless. Instead it makes it accountable. The inspector already trusted by both parties signs a structured attestation (quantity, quality parameters, location, time, certificate reference) with a key registered to their verified identity. The escrow checks the signature and compares the reported values against the trade&apos;s tolerances.</p>
              <p>In a later phase, inspectors and verifiers will post a CLXT bond that can be forfeited if an attestation is shown to be false. That gives the token a security role tied to real activity, and gives the parties recourse beyond reputation.</p>

              <h3 id="lifecycle">A trade, end to end</h3>
              <p>Consider a 30,000 metric tonne in-tank sale of EN590 diesel at a storage terminal, paid on a dip test with title passing at injection into the buyer&apos;s tank, a structure GDN&apos;s desk uses in practice.</p>
              <ol>
                <li>The seller creates the trade: quantity and tolerance, price, USDT as settlement asset, required documents (sale contract, tank receipt, commercial invoice, inspection certificate), a 10-day deadline, and a named arbitrator. The contract&apos;s hash is registered.</li>
                <li>The buyer reviews the terms and funds the escrow. The seller can now see the money is committed.</li>
                <li>The seller registers the tank receipt and invoice. The registry confirms neither has been registered before.</li>
                <li>The independent inspector dips the tank, tests the product against the EN590 specification and signs an attestation of volume and quality.</li>
                <li>The escrow verifies the inspector&apos;s signature and checks the results against the contract. All conditions are met, so funds release to the seller in the same transaction, and the terminal is instructed to transfer title on injection.</li>
              </ol>
              <p>The same sequence under a letter of credit involves an issuing bank, an advising bank, often a confirming bank, a courier and a document examination that can take days after the product has already moved.</p>

              <h3 id="disputes">Disputes</h3>
              <p>A dispute freezes the escrow. The arbitrator named in the trade terms, initially an independent trade arbitration professional and later a panel of bonded verifiers, reviews the registered documents and evidence and directs a full release, a full refund or a split. Arbitration is backed by the trade&apos;s governing-law contract, so the on-chain ruling and the legal position point the same way.</p>

              <h3 id="privacy">Privacy and data</h3>
              <p>Prices, counterparties and volumes are commercially sensitive. CrossLedger writes no documents or party names to the public chain. Originals are stored encrypted off-chain and shared only with the parties to the trade, and registry entries are hashes, document types, trade identifiers and wallet addresses. Personal data from identity checks stays with the regulated verification provider.</p><p>Settlement itself is not private. Escrow funding and release amounts, and the wallet addresses involved, are public on Ethereum and can be linked by anyone who learns which wallet belongs to which party. Participants who need payment confidentiality should use dedicated settlement wallets, and a confidential settlement option is a later-phase research item, not a current feature.</p>

              <h3 id="legal-effect">Legal effect of electronic records</h3>
              <p>A registry entry is evidence; it is not, on its own, a negotiable document of title. The law is moving to recognise electronic equivalents. UNCITRAL&apos;s Model Law on Electronic Transferable Records (2017) sets out when an electronic record can function like a paper bill of lading, and the United Kingdom&apos;s Electronic Trade Documents Act 2023 and Singapore&apos;s amended Electronic Transactions Act give that effect in law.<Fn n={6} /> CrossLedger is designed to work alongside paper and electronic bills of lading issued on recognised platforms, registering their fingerprints rather than replacing them, until the legal framework in each corridor supports more.</p>

              <h2 id="token">The CLXT token</h2>
              <h3 id="token-facts">On-chain facts</h3>
              <p>The following figures were read from Ethereum mainnet on {UPDATED}.</p>
              <div className="table-wrap">
                <table className="data">
                  <tbody>
                    <tr><td>Name / symbol</td><td>CrossLedger Token (CLXT)</td></tr>
                    <tr><td>Standard</td><td>ERC-20, 18 decimals</td></tr>
                    <tr><td>Token contract</td><td><Addr a={CONTRACTS.clxt} kind="token" /> (source verified on Etherscan)</td></tr>
                    <tr><td>Initial supply</td><td>1,000,000,000 CLXT, minted once to the treasury at creation</td></tr>
                    <tr><td>Reported total supply</td><td>1,000,000,000 CLXT (a fixed constant; see <a href="#supply">Supply accounting</a>)</td></tr>
                    <tr><td>Transfers</td><td>Enabled</td></tr>
                    <tr><td>Owner and treasury</td><td><Addr a={CONTRACTS.owner} /></td></tr>
                    <tr><td>Held by owner address</td><td>About 823.9 million CLXT (82.4%)</td></tr>
                    <tr><td>Held by V1 presale contract</td><td>20,000,000 CLXT</td></tr>
                    <tr><td>Registered escrow contract</td><td><Addr a={CONTRACTS.escrow} /> (not independently audited)</td></tr>
                  </tbody>
                </table>
              </div>

              <h3 id="utility">Intended utility</h3>
              <p>CLXT is designed for three uses on the platform. None is live yet.</p>
              <ul>
                <li><strong>Fees.</strong> Platform fees can be paid in CLXT at a discount to paying in stablecoins.</li>
                <li><strong>Verifier bonds.</strong> Inspectors, verifiers and arbitrators post CLXT as a bond that can be forfeited for false attestations or rulings.</li>
                <li><strong>Governance (later phase).</strong> Holders may vote on fee schedules and corridor priorities once the platform is operating.</li>
              </ul>
              <p>CLXT is not a settlement currency for trades, does not represent a share of GDN Group or of platform revenue, and carries no right to dividends, interest or redemption.</p>

              <h3 id="allocation">Allocation</h3>
              <div className="table-wrap">
                <table className="data">
                  <thead><tr><th>Category</th><th className="num">Share</th><th className="num">CLXT</th><th>Purpose</th></tr></thead>
                  <tbody>
                    <tr><td>Ecosystem and trade incentives</td><td className="num">35%</td><td className="num">350,000,000</td><td>Rebates for early trades, corridor onboarding, verifier incentives</td></tr>
                    <tr><td>Treasury and compliance</td><td className="num">20%</td><td className="num">200,000,000</td><td>Licensing, audits, legal, operating reserve</td></tr>
                    <tr><td>Founders and team</td><td className="num">15%</td><td className="num">150,000,000</td><td>Planned 12-month cliff, then 24-month linear vesting</td></tr>
                    <tr><td>Strategic investors (includes public presale)</td><td className="num">15%</td><td className="num">150,000,000</td><td>Seed partners and the staged public presale</td></tr>
                    <tr><td>Exchange and liquidity</td><td className="num">10%</td><td className="num">100,000,000</td><td>Liquidity pools and market-making at listing, to be time-locked</td></tr>
                    <tr><td>Operations and partnerships</td><td className="num">5%</td><td className="num">50,000,000</td><td>Integrations and commercial partnerships</td></tr>
                  </tbody>
                </table>
              </div>
              <p><strong>These allocations are plans, not on-chain controls.</strong> As of {UPDATED} no vesting or lock contracts hold the team, treasury or liquidity allocations; most of the supply sits in the owner address shown above. GDN will move allocations into published, time-locked contracts before any exchange listing and will publish those addresses here.</p>

              <h3 id="supply">Supply accounting and staking</h3>
              <p>The token contract includes a staking function that pays a 10 percent annual reward. When a holder unstakes, the reward is added to their balance as newly created tokens, but the contract&apos;s <code>totalSupply()</code> returns a hard-coded 1,000,000,000 and no transfer event is emitted for the new tokens. If staking is used, the real number of tokens in existence can rise above one billion while every explorer and exchange still reports one billion.</p>
              <p>CrossLedger treats this as a defect, not a feature. GDN does not promote staking and will not use it. The token contract cannot be upgraded, so the only technical fix is migrating to a corrected token contract, with balances carried across one for one. An independent audit can measure the exposure but cannot remove it. GDN will publish its remedy before any listing. Until then, the fixed one-billion figure should be read as the initial supply, not a guaranteed cap.</p>

              <h3 id="presale">Presale</h3>
              <p>The public presale sells CLXT for USDT on Ethereum through a contract that delivers tokens to the buyer in the same transaction. The published plan has four stages:</p>
              <div className="table-wrap">
                <table className="data">
                  <thead><tr><th>Stage</th><th className="num">Price per CLXT</th><th className="num">CLXT per USDT</th><th className="num">Planned allocation</th></tr></thead>
                  <tbody>
                    <tr><td>Stage 1</td><td className="num">US$0.10</td><td className="num">10</td><td className="num">5,000,000</td></tr>
                    <tr><td>Stage 2</td><td className="num">US$0.20</td><td className="num">5</td><td className="num">5,000,000</td></tr>
                    <tr><td>Stage 3</td><td className="num">US$0.25</td><td className="num">4</td><td className="num">4,000,000</td></tr>
                    <tr><td>Stage 4</td><td className="num">US$0.50</td><td className="num">2</td><td className="num">3,000,000</td></tr>
                  </tbody>
                </table>
              </div>
              <p>Be clear about what the contract enforces. It sells at a single rate set by the owner; it does not enforce stage allocations or move between stages automatically. The owner can change the rate, pause the sale and withdraw unsold tokens. The website applies a 200 USDT minimum, and the corrected contract will also enforce that minimum on-chain. Stage pricing is a commitment by GDN, not a property of the code.</p>
              <p>Each stage price is a sale price, not a valuation. CrossLedger publishes no listing price, target price or expected return, and nothing guarantees that CLXT will be listed on any exchange or trade at or above the price paid.</p>

              <h3 id="presale-defect">The V1 presale defect</h3>
              <p>The first presale contract, <Addr a={CONTRACTS.presaleV1} />, cannot complete a purchase. It declares USDT&apos;s <code>transferFrom</code> as returning a boolean:</p>
              <pre><code>{`interface IUSDT {
    function transferFrom(address from, address to, uint256 amount)
        external returns (bool);   // mainnet USDT returns nothing
}`}</code></pre>
              <p>Mainnet USDT predates the final ERC-20 standard and returns no value from <code>transfer</code> or <code>transferFrom</code>. Since Solidity 0.8, a call declared to return a value reverts if the callee returns nothing. Every <code>buyWithUSDT</code> call therefore reverts, even for a buyer who holds enough USDT and has approved the contract. No buyer funds can be lost to this defect; the transaction simply fails and only gas is spent.</p>
              <p>GDN reproduced the failure against live mainnet state on 3 October 2026, confirming the contract was active, funded and given full approval, and that the revert carries none of the contract&apos;s own error messages. The corrected contract, CLXPresaleV2, keeps the same purchase flow but makes token calls through a wrapper that accepts both standard tokens and USDT&apos;s empty return. It also adds an on-chain minimum and a buyer-set minimum output that protects a pending purchase against a rate change. In a mainnet-fork test it completed a 200 USDT purchase, paying the treasury and delivering 2,000 CLXT to the buyer, and correctly rolled back every failure case tested. The website checkout stays disabled until V2 is deployed, funded and has passed a live test purchase.</p>

              <h2 id="business">Business model</h2>
              <p>CrossLedger earns revenue from use, not from token sales.</p>
              <ul>
                <li><strong>Settlement fees</strong> on escrowed trade value, targeted at 0.2 to 0.4 percent.</li>
                <li><strong>Document registration</strong> fees for financiers and parties registering documents outside a CrossLedger escrow.</li>
                <li><strong>Registry checks</strong> for banks and trade financiers who query the registry before funding a cargo.</li>
                <li><strong>Enterprise integration</strong> for traders and terminals connecting their own systems.</li>
              </ul>
              <p>GDN Group&apos;s trade desk, active in refined petroleum products, sugar and agricultural commodities across Asia-Pacific, the Middle East and the Americas, provides the first trades. The platform has to earn its place on that desk before it asks anyone else to use it.</p>

              <h2 id="roadmap">Status and roadmap</h2>
              <div className="table-wrap">
                <table className="data">
                  <thead><tr><th>Component</th><th>Status at {UPDATED}</th></tr></thead>
                  <tbody>
                    <tr><td>CLXT token</td><td>Live on Ethereum mainnet. Staking supply defect disclosed; remedy pending.</td></tr>
                    <tr><td>Presale V1</td><td>Deployed; cannot complete purchases. Website checkout disabled.</td></tr>
                    <tr><td>Presale V2</td><td>Written and fork-tested. Awaiting deployment and live verification.</td></tr>
                    <tr><td>Escrow contract</td><td>First version deployed to mainnet and registered with the token. Not audited; not in commercial use.</td></tr>
                    <tr><td>Document registry</td><td>Prototype deployed to the Polygon Amoy test network.</td></tr>
                    <tr><td>Trade platform and dashboard</td><td>In development.</td></tr>
                    <tr><td>Independent security audit</td><td>Not yet completed. Required before the escrow handles third-party funds.</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="roadmap" style={{ marginTop: 24 }}>
                <div className="road active"><div className="phase">PHASE 1 · NOW</div><h4>Foundation</h4><ul><li>Deploy and verify presale V2</li><li>Complete independent audit</li><li>Remedy staking supply defect</li><li>Obtain Australian legal advice</li></ul></div>
                <div className="road"><div className="phase">PHASE 2</div><h4>First trades</h4><ul><li>Registry on mainnet</li><li>Audited escrow</li><li>Pilot trades on GDN&apos;s desk</li><li>Inspector attestation format</li></ul></div>
                <div className="road"><div className="phase">PHASE 3</div><h4>Open corridors</h4><ul><li>Third-party traders onboarded</li><li>Financier registry checks</li><li>Verifier bonding in CLXT</li><li>Time-locked allocations</li></ul></div>
                <div className="road"><div className="phase">PHASE 4</div><h4>Network</h4><ul><li>Bonded arbitration panel</li><li>Enterprise integrations</li><li>Governance for fee schedules</li><li>Additional corridors</li></ul></div>
              </div>
              <p>Phases are sequenced by readiness, not by date. Each starts only when the previous phase&apos;s deliverables exist and can be verified.</p>

              <h2 id="team">Team</h2>
              <p><strong>Guilherme (Gui) Di Nardo</strong>, Founder and CEO, Brisbane. Leads GDN Group&apos;s trading and advisory work across petroleum products, agricultural commodities and sovereign advisory engagements.</p>
              <p><strong>Tom Young</strong>, Co-founder and CTO. Leads smart-contract development and platform engineering across the token, presale and verification layers.</p>
              <p><strong>Fernando Nicola</strong>, United States commercial representative, Orlando. Commodity trading background with international energy trading houses, focused on North and Latin American markets.</p>
              <p><strong>Mathew Dunn</strong>, UAE and Gulf representative, Dubai. Leads Gulf relationships and blockchain integration for CrossLedger.</p>
              <p><strong>Marcos &quot;Kito&quot; Vianna</strong>, Brazil and South America representative, São Paulo. Over twenty years in trading, freight forwarding and port logistics.</p>

              <h2 id="regulatory">Regulatory position and restrictions</h2>
              <p>CrossLedger is a product of GDN Enterprise Pty Ltd (ACN {SITE.acn}), an Australian proprietary company registered with ASIC. GDN does not hold an Australian Financial Services Licence and is not an authorised representative of a licence holder.</p>
              <p>Australia is reforming the regulation of digital assets and digital asset platforms. Whether CLXT, the presale or the escrow service is a financial product or financial service under Australian law has not been determined. GDN is obtaining Australian legal advice and will publish its position when that advice is received. Until then, Australia is a restricted jurisdiction.</p>
              <p>CLXT is not offered to residents of the United States, Canada, the People&apos;s Republic of China, Australia, North Korea, Iran, Syria, Cuba, or any jurisdiction subject to comprehensive sanctions or where the offer would require a licence or registration GDN does not hold. The purchase interface is disabled for visitors whose IP address resolves to a restricted jurisdiction. That screen is not proof of residence, and each participant remains responsible for confirming eligibility under their own law. GDN will apply identity verification through a regulated provider above thresholds that it will publish before purchases reopen.</p>

              <h2 id="risks">Risk factors</h2>
              <ul>
                <li><strong>Total loss.</strong> CLXT may become worthless. Commit only what you can afford to lose entirely.</li>
                <li><strong>Development risk.</strong> The platform described here may never be completed, or may work differently.</li>
                <li><strong>Smart-contract risk.</strong> Two defects have already been found in deployed contracts. Others may exist. No independent audit has been completed.</li>
                <li><strong>Supply risk.</strong> Until the staking defect is remedied, the number of tokens in existence can exceed the reported supply.</li>
                <li><strong>Concentration and control.</strong> Most of the supply is held by one owner address, and the owner can change presale terms. Planned vesting and locks are not yet enforced on-chain.</li>
                <li><strong>Regulatory risk.</strong> Laws may change or be applied in ways that restrict CLXT, the presale or the platform, including in Australia.</li>
                <li><strong>Liquidity risk.</strong> There may be no market in which to sell CLXT. No exchange listing is guaranteed.</li>
                <li><strong>Adoption risk.</strong> Traders, inspectors and financiers may not use the platform.</li>
                <li><strong>Key and wallet risk.</strong> Lost keys and mistaken transfers cannot be reversed.</li>
              </ul>

              <h2 id="conclusion">Conclusion</h2>
              <p>Physical commodity trade does not need a new kind of money. It needs a shared, neutral record of which documents exist and who relied on them, and a way to commit payment that releases on proof rather than on paper arriving. Those are narrow, achievable goals, and public blockchains are now mature enough to meet them without asking an industry to join a consortium first.</p>
              <p>CrossLedger is early. This paper tries to be precise about that: what is deployed, what is broken and being fixed, and what is still a plan. The test of the project is simple and public. Watch the registry and the escrow contracts. When real cargoes settle through them, the design is working.</p>

              <hr />
              <h2 id="notes">Notes and references</h2>
              <ol className="footnotes">
                <li id="fn-1">International Chamber of Commerce, <em>Uniform Customs and Practice for Documentary Credits</em>, ICC Publication No. 600 (2007). <a href="#ref-1">↩</a></li>
                <li id="fn-2">Asian Development Bank, <em>2023 Trade Finance Gaps, Growth, and Jobs Survey</em> (September 2023). <a href="#ref-2">↩</a></li>
                <li id="fn-3">ICC Digital Standards Initiative, estimate of documents per cross-border transaction. <a href="#ref-3">↩</a></li>
                <li id="fn-4">Public reporting on the 2014 Qingdao port metals financing fraud and the 2020 insolvency of Hin Leong Trading (Pte) Ltd. <a href="#ref-4">↩</a></li>
                <li id="fn-5">we.trade ceased operations in 2022; TradeLens was discontinued in early 2023; Marco Polo entered insolvency and Contour ceased operations in 2023. <a href="#ref-5">↩</a></li>
                <li id="fn-6">UNCITRAL Model Law on Electronic Transferable Records (2017); Electronic Trade Documents Act 2023 (UK); Electronic Transactions Act 2010 (Singapore), as amended in 2021. <a href="#ref-6">↩</a></li>
              </ol>
              <p className="small muted">This whitepaper is general information about a project in development. It is not financial, legal or tax advice, not a prospectus or product disclosure statement, and not an offer of securities or financial products in any jurisdiction. © {new Date().getFullYear()} {SITE.entity}. Questions: <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>
            </div>
          </article>

          <aside className="doc-toc" aria-label="On this page">
            <h2>On this page</h2>
            <Toc active={active} />
          </aside>
        </div>
      </div>
    </Layout>
  );
}
