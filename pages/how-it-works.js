import Link from "next/link";
import Layout from "../components/Layout";
import Seo from "../components/Seo";

const STEPS = [
  { title: "Agree the terms", body: "The seller opens a trade: commodity, quantity and tolerance, price, the stablecoin it settles in, the documents required, the inspection standard, a delivery deadline and a named arbitrator. The sale contract's fingerprint is registered so both sides are bound to the same version." },
  { title: "Fund the escrow", body: "The buyer deposits USDT or USDC into an escrow created for this one trade. From that moment neither party can take the money back alone, and the seller can see on-chain that payment is committed before releasing the cargo." },
  { title: "Register the documents", body: "As documents are issued (tank receipt, bill of lading, invoice, certificate of origin) their SHA-256 fingerprints are written to the registry. The registry rejects a file that is already registered, and in a later phase will match documents by their issuer's reference number too, so the same paper cannot quietly back two deals." },
  { title: "Inspect and attest", body: "The independent inspector both parties named in the contract checks quantity and quality and signs a structured attestation with a key bound to their verified identity. No anonymous oracle, no unsigned data." },
  { title: "Release, or resolve", body: "When every required document is verified and the inspection is within tolerance, the escrow pays the seller in the same transaction. If the deadline passes the buyer can reclaim the funds. If either side disputes, the escrow freezes until the arbitrator rules." },
];

export default function HowItWorks() {
  return (
    <Layout>
      <Seo
        title="How CrossLedger Works | Document Registry and Conditional Escrow"
        description="How a commodity trade settles on CrossLedger: agreed terms, stablecoin escrow, registered document fingerprints, a signed inspection, and release on proof."
        path="/how-it-works"
        type="article"
      />

      <section className="hero" style={{ paddingBottom: 56 }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">crossledger.trade</Link><span>/</span><span aria-current="page">How it works</span></nav>
          <h1 className="display" style={{ marginTop: 22 }}>How a trade settles on CrossLedger.</h1>
          <p className="lede" style={{ marginTop: 20 }}>The buyer wants documents before paying. The seller wants payment before shipping. Both are right, and many first deals stall there. CrossLedger commits the buyer&apos;s money first and releases it only on proof, so neither side has to move on trust.</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 24 }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <ol style={{ listStyle: "none", display: "grid", gap: 16 }}>
            {STEPS.map((s, i) => (
              <li key={s.title} className="card" style={{ display: "grid", gridTemplateColumns: "56px 1fr", gap: 20, alignItems: "start" }}>
                <div className="card-icon" style={{ fontFamily: "var(--mono)", fontWeight: 700 }}>{String(i + 1).padStart(2, "0")}</div>
                <div><h2 className="h-card" style={{ marginTop: 10 }}>{s.title}</h2><p>{s.body}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Compared with a letter of credit</span>
            <h2 className="h-section">Same protection, fewer hands.</h2>
            <p className="lede">CrossLedger figures below are design targets for a platform still in development, not measured results.</p>
          </div>
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th>&nbsp;</th><th>Documentary letter of credit</th><th>CrossLedger (target)</th></tr></thead>
              <tbody>
                <tr><td>Who holds the money</td><td>Issuing bank&apos;s undertaking</td><td className="hl">Per-trade escrow; neither party alone</td></tr>
                <tr><td>What triggers payment</td><td>Bank examination of paper documents</td><td className="hl">Registered documents plus signed inspection</td></tr>
                <tr><td>Typical time to pay</td><td>5 to 14 business days after presentation</td><td className="hl">Same transaction as the final condition</td></tr>
                <tr><td>Typical cost</td><td>Often 1 to 3% for emerging-market trades</td><td className="hl">0.2 to 0.4% platform fee</td></tr>
                <tr><td>Duplicate documents</td><td>Hard to detect across banks</td><td className="hl">Rejected by the registry</td></tr>
                <tr><td>Disputes</td><td>Bank discrepancy process, then courts</td><td className="hl">Named arbitrator; governing-law contract</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Where CLXT fits</span>
            <h2 className="h-section">Trades settle in dollars. CLXT runs the platform.</h2>
          </div>
          <div className="grid grid-3">
            <div className="card"><span className="tag">Planned</span><h3 className="h-card">Fee discounts</h3><p>Platform fees can be paid in CLXT at a discount to paying in stablecoins.</p></div>
            <div className="card"><span className="tag">Planned</span><h3 className="h-card">Verifier bonds</h3><p>Inspectors and arbitrators post CLXT that can be forfeited for false attestations or rulings.</p></div>
            <div className="card"><span className="tag">Later phase</span><h3 className="h-card">Fee governance</h3><p>Holders may vote on fee schedules and corridor priorities once trades are flowing.</p></div>
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container" style={{ maxWidth: 900 }}>
          <div className="callout">
            <span className="badge-outline">Where this stands</span>
            <h2>Honest status</h2>
            <p>No commercial trade has settled through CrossLedger yet. An escrow contract is deployed on Ethereum and a document registry prototype runs on a test network; neither has completed an independent audit. The platform will handle third-party funds only after that audit.</p>
            <div className="actions">
              <Link href="/whitepaper" className="btn btn-primary">Read the whitepaper</Link>
              <Link href="/contact" className="btn btn-outline">Discuss a pilot trade</Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
