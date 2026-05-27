import Head from 'next/head';
import Link from 'next/link';

export default function HowItWorks() {
  return (
    <>
      <Head>
        <title>How Blockchain Commodity Trade Settlement Works | CrossLedger</title>
        <meta name="description" content="Learn how CrossLedger replaces paper letters of credit with smart escrow and on-chain document verification for cross-border commodity trade. Stage 1 presale live at US$0.10 CLXT." />
        <meta name="keywords" content="blockchain commodity trade settlement, smart escrow trade finance, on-chain document verification, cross-border commodity payments, CLXT token, trade finance blockchain" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.crossledger.trade/how-it-works" />
        <meta property="og:title" content="How Blockchain Commodity Trade Settlement Works | CrossLedger" />
        <meta property="og:description" content="CrossLedger replaces paper letters of credit with smart escrow and on-chain verification. Faster, cheaper, verifiable cross-border commodity settlement." />
        <meta property="og:url" content="https://www.crossledger.trade/how-it-works" />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://www.crossledger.trade/api/og" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "How Blockchain Commodity Trade Settlement Works",
          "description": "CrossLedger replaces paper letters of credit with smart escrow and on-chain document verification for cross-border commodity trade.",
          "url": "https://www.crossledger.trade/how-it-works",
          "publisher": {
            "@type": "Organization",
            "name": "CrossLedger / GDN Group",
            "url": "https://www.crossledger.trade"
          }
        })}} />
      </Head>

      {/* Nav */}
      <div className="meta-strip">
        <div className="wrap">
          <div className="geo"><span>BRISBANE</span>·<span>DUBAI</span>·<span>ORLANDO</span>·<span>SÃO PAULO</span></div>
          <div>EST. 2014 · ACN 666 495 263</div>
        </div>
      </div>
      <nav className="nav-bar">
        <div className="wrap">
          <Link href="/" className="logo">
            <span className="mark">CrossLedger</span>
            <span className="sub">A GDN Group Product</span>
          </Link>
          <div className="nav-links">
            <a href="https://gdngroup.com.au">GDN Group</a>
            <Link href="/#problem">Problem</Link>
            <Link href="/#token">Token</Link>
            <Link href="/#corridors">Corridors</Link>
            <Link href="/#security">Security</Link>
            <Link href="/#faq">FAQ</Link>
          </div>
          <Link href="/#token" className="btn-primary">Buy CLXT →</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: '#0d1b2a', padding: '80px 0 60px' }}>
        <div className="wrap">
          <div className="eyebrow" style={{ marginBottom: 16 }}>CROSSLEDGER · HOW IT WORKS</div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, color: '#fff', maxWidth: '22ch', lineHeight: 1.15, marginBottom: 24 }}>
            Blockchain Settlement for Cross-Border Commodity Trade
          </h1>
          <p className="lede" style={{ maxWidth: '60ch', marginBottom: 40 }}>
            Cross-border commodity transactions still run on paper letters of credit, manual bank intermediaries, and 5–30 day settlement windows. CrossLedger replaces that infrastructure with smart escrow, on-chain document verification, and token-enabled settlement — collapsing weeks into hours.
          </p>
          <Link href="/#token" className="btn-primary" style={{ display: 'inline-block' }}>
            Join Stage 1 Presale — US$0.10 CLXT →
          </Link>
        </div>
      </section>

      {/* The Problem */}
      <section style={{ background: '#fff', padding: '72px 0' }}>
        <div className="wrap">
          <div className="eyebrow" style={{ marginBottom: 12 }}>THE PROBLEM</div>
          <h2 className="h-section" style={{ marginBottom: 32 }}>Why commodity trade settlement is broken</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32 }}>
            {[
              { stat: '5–30 days', label: 'Average settlement window for cross-border commodity deals' },
              { stat: '4+ banks', label: 'Intermediaries involved in a single letter of credit transaction' },
              { stat: '$18T', label: 'Annual global trade finance gap — capital locked in legacy processes' },
              { stat: '80%', label: 'Of trade finance rejections hit SME commodity exporters hardest' },
            ].map(({ stat, label }) => (
              <div key={stat} style={{ padding: '28px 24px', border: '1px solid #e5e7eb', borderRadius: 8 }}>
                <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#c9a84c', marginBottom: 8 }}>{stat}</div>
                <div style={{ color: '#374151', lineHeight: 1.6 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Steps */}
      <section style={{ background: '#f8f9fa', padding: '72px 0' }}>
        <div className="wrap">
          <div className="eyebrow" style={{ marginBottom: 12 }}>THE SOLUTION</div>
          <h2 className="h-section" style={{ marginBottom: 48 }}>How CrossLedger settles a trade in three steps</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40 }}>
            {[
              {
                n: '01',
                title: 'Connect & Initiate',
                body: 'Buyer and seller connect wallets to the CrossLedger platform. Trade terms — commodity type, volume, price, delivery conditions — are encoded into a smart escrow contract deployed on Ethereum mainnet. No paperwork, no bank approval required to begin.',
              },
              {
                n: '02',
                title: 'Approve & Verify On-Chain',
                body: 'Shipping documents, certificates of origin, and inspection reports are hashed and written to the blockchain. Both parties approve the document set on-chain. The smart contract holds USDT escrow until verification is complete — no single party controls the funds.',
              },
              {
                n: '03',
                title: 'Execute & Settle with CLXT',
                body: 'On document approval, the smart contract releases funds to the seller automatically. CLXT token holders receive platform fee discounts, priority corridor access, and governance rights. Settlement that took weeks now completes on confirmation — typically under an hour.',
              },
            ].map(({ n, title, body }) => (
              <div key={n} style={{ background: '#fff', padding: '36px 28px', borderRadius: 10, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#c9a84c', letterSpacing: '0.1em', marginBottom: 12 }}>{n}</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0d1b2a', marginBottom: 16 }}>{title}</h3>
                <p style={{ color: '#4b5563', lineHeight: 1.7, fontSize: '0.95rem' }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLXT Token Utility */}
      <section className="navy" style={{ padding: '72px 0' }}>
        <div className="wrap">
          <div className="eyebrow" style={{ marginBottom: 12 }}>CLXT TOKEN</div>
          <h2 className="h-section" style={{ marginBottom: 24 }}>Why CLXT powers the settlement layer</h2>
          <p style={{ maxWidth: '60ch', marginBottom: 48, color: '#cbd5e1', lineHeight: 1.7 }}>
            CLXT is the utility token that drives CrossLedger's settlement infrastructure. It is not a speculative asset — it is a functional instrument for reducing friction in the $18T trade finance market.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            {[
              { title: 'Fee Reduction', body: 'Pay platform settlement fees in CLXT and receive up to 50% discount versus fiat payment methods.' },
              { title: 'Corridor Access', body: 'Priority access to high-volume trade corridors — Australia–UAE, Brazil–Asia, and US–Africa routes.' },
              { title: 'Governance', body: 'CLXT holders vote on protocol upgrades, new corridor additions, and platform fee parameters.' },
              { title: 'Escrow Collateral', body: 'Post CLXT as supplementary collateral in smart escrow contracts to reduce capital lock-up requirements.' },
            ].map(({ title, body }) => (
              <div key={title} style={{ background: 'rgba(255,255,255,0.07)', padding: '28px 24px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#c9a84c', marginBottom: 10 }}>{title}</h3>
                <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.9rem' }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#fff', padding: '72px 0', textAlign: 'center' }}>
        <div className="wrap">
          <div className="eyebrow" style={{ marginBottom: 12 }}>STAGE 1 PRESALE · LIVE NOW</div>
          <h2 className="h-section" style={{ marginBottom: 16, maxWidth: '28ch', margin: '0 auto 16px' }}>
            Get CLXT at US$0.10 before Stage 2 doubles the price
          </h2>
          <p style={{ color: '#6b7280', maxWidth: '50ch', margin: '0 auto 40px', lineHeight: 1.7 }}>
            Stage 1 allocation is filling. When it closes, Stage 2 price is US$0.20. Direct-send purchase on Ethereum mainnet — CLXT transfers to your wallet on confirmation.
          </p>
          <Link href="/#token" className="btn-primary" style={{ display: 'inline-block', fontSize: '1.1rem', padding: '16px 40px' }}>
            Buy CLXT Now — Stage 1 Price →
          </Link>
          <p style={{ marginTop: 20, fontSize: '0.85rem', color: '#9ca3af' }}>
            Verified smart contract · No claim portal · Instant delivery
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0d1b2a', padding: '40px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
            © 2026 CrossLedger · GDN Group · ACN 666 495 263
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <Link href="/" style={{ color: '#64748b', fontSize: '0.85rem', textDecoration: 'none' }}>Home</Link>
            <Link href="/#faq" style={{ color: '#64748b', fontSize: '0.85rem', textDecoration: 'none' }}>FAQ</Link>
            <Link href="/#token" style={{ color: '#64748b', fontSize: '0.85rem', textDecoration: 'none' }}>Buy CLXT</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
