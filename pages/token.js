// Token facts: who holds CLXT, what is locked, and what the contracts can and
// cannot do. Figures come from lib/site.js (HOLDINGS, LOCKS) so the whitepaper
// and this page cannot drift apart. Update both when holdings change.
import Link from "next/link";
import Layout from "../components/Layout";
import Seo from "../components/Seo";
import { CONTRACTS, HOLDINGS, HOLDINGS_DATE, LOCKS, lockUrl, lockNftUrl, shortAddr } from "../lib/site";

const TOTAL = 1_000_000_000;
const fmt = (n) => n.toLocaleString("en-US");
const pct = (n) => `${((n / TOTAL) * 100).toFixed(1)}%`;
const Addr = ({ a, kind = "address" }) => (
  <a href={`https://etherscan.io/${kind}/${a}`} target="_blank" rel="noopener"><code>{shortAddr(a)}</code></a>
);
const V2 = CONTRACTS.presaleV2 || "0x8F190E1764bfE57ddd2Daff5F55a79C64760c14F";

export default function TokenFacts() {
  const locked = LOCKS.reduce((s, l) => s + l.amount, 0);
  return (
    <Layout>
      <Seo
        title="CLXT Token Facts | Holders, Vesting Locks and Contract Controls"
        description="Every large CLXT holder labelled, the public vesting locks that hold 60% of supply, renounced token ownership, and what the contracts can and cannot do."
        path="/token"
        type="article"
      />

      <section className="hero" style={{ paddingBottom: 48 }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">crossledger.trade</Link><span>/</span><span aria-current="page">Token facts</span></nav>
          <h1 className="display" style={{ marginTop: 22 }}>CLXT token facts.</h1>
          <p className="lede" style={{ marginTop: 20 }}>Who holds CLXT, what is locked and until when, and what the contracts allow. Every figure links to the chain so you can check it yourself. Holdings were read from Ethereum mainnet on {HOLDINGS_DATE}.</p>
          <div className="stats" style={{ marginTop: 32 }}>
            <div className="stat"><div className="v">{pct(locked)}</div><div className="l">of supply locked in vesting</div></div>
            <div className="stat"><div className="v" style={{ fontSize: "clamp(22px, 2.6vw, 30px)" }}>Renounced</div><div className="l">token contract ownership</div></div>
            <div className="stat"><div className="v">1B</div><div className="l">CLXT reported supply</div></div>
            <div className="stat"><div className="v">1</div><div className="l">live presale contract</div></div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 24 }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <h2 className="h-section">Who holds CLXT</h2>
          <div className="table-wrap" style={{ marginTop: 20 }}>
            <table className="data">
              <thead><tr><th>Holder</th><th className="num">CLXT</th><th className="num">Share</th></tr></thead>
              <tbody>
                {HOLDINGS.map((h) => {
                  const href = h.address ? `https://etherscan.io/address/${h.address}` : h.href || `https://etherscan.io/token/${CONTRACTS.clxt}#balances`;
                  return (
                    <tr key={h.label}>
                      <td><a href={href} target="_blank" rel="noopener">{h.label} ↗</a>{h.address && <><br /><code className="small">{shortAddr(h.address)}</code></>}</td>
                      <td className="num">{fmt(h.amount)}</td>
                      <td className="num">{pct(h.amount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="small" style={{ marginTop: 12 }}>The strategic allocation wallet belongs to a senior manager and is not locked. Live balances are always on <a href={`https://etherscan.io/token/${CONTRACTS.clxt}#balances`} target="_blank" rel="noopener">Etherscan</a>.</p>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container" style={{ maxWidth: 900 }}>
          <h2 className="h-section">Vesting locks</h2>
          <p className="lede" style={{ marginTop: 12 }}>{fmt(locked)} CLXT sit in three Sablier vesting streams. None of them can be cancelled, by GDN or anyone else, and the stream positions cannot be transferred. Tokens return to the owner address only on the schedule below.</p>
          <div className="grid grid-3" style={{ marginTop: 20 }}>
            {LOCKS.map((l) => (
              <div key={l.id} className="card">
                <span className="tag ok">Locked · non-cancelable</span>
                <h3 className="h-card">{l.name}</h3>
                <div style={{ marginTop: 6 }}><div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1 }}>{fmt(l.amount)}</div><div className="small" style={{ marginTop: 6, color: "var(--text-muted)" }}>CLXT · {pct(l.amount)} of supply</div></div>
                <p style={{ marginTop: 14 }}>{l.schedule}.</p>
                <div className="card-meta"><a href={lockUrl(l.id)} target="_blank" rel="noopener">Sablier #{l.id} ↗</a> · <a href={lockNftUrl(l.id)} target="_blank" rel="noopener">Etherscan ↗</a></div>
              </div>
            ))}
          </div>
          <p className="small" style={{ marginTop: 12 }}>Sablier Lockup contract: <Addr a={CONTRACTS.sablierLockup} />. It also holds a 10 CLXT one-day test stream (#1782) that released back to the owner. The treasury, compliance and operations allocations are drawn from the owner address&apos;s unlocked balance.</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 900 }}>
          <h2 className="h-section">What the contracts can and cannot do</h2>
          <div className="grid grid-2" style={{ marginTop: 20 }}>
            <div className="card"><span className="tag ok">Renounced</span><h3 className="h-card">Token ownership</h3><p>On 6 October 2026 ownership of the CLXT contract was transferred to the dead address <code>{shortAddr(CONTRACTS.dead)}</code>, which nobody controls. No one can call the token&apos;s owner functions again.</p><div className="card-meta"><a href={`https://etherscan.io/address/${CONTRACTS.clxt}#readContract`} target="_blank" rel="noopener">Read owner() on Etherscan ↗</a></div></div>
            <div className="card"><span className="tag ok">Cannot be paused</span><h3 className="h-card">Transfers</h3><p>Trading was switched on at launch and the contract has no function to switch it off. Some scanners still flag the original switch; it can only ever be turned on.</p><div className="card-meta"><a href={`https://etherscan.io/address/${CONTRACTS.clxt}#code`} target="_blank" rel="noopener">Token source ↗</a></div></div>
            <div className="card"><span className="tag warn">Disclosed defect</span><h3 className="h-card">Staking rewards</h3><p>There is no mint function, but the staking feature credits rewards as new tokens without updating the reported supply, which is why scanners label CLXT &quot;mintable&quot;. GDN has not used staking, does not promote it, and will publish a remedy before any GDN-supported exchange listing.</p><div className="card-meta"><Link href="/whitepaper#supply">Whitepaper: supply accounting →</Link></div></div>
            <div className="card"><span className="tag">Owner controlled</span><h3 className="h-card">Presale V2</h3><p>The presale sells at a single rate. Its owner can change the rate and treasury, pause the sale and withdraw unsold tokens. It holds only the 20,000,000 CLXT offered for sale.</p><div className="card-meta"><a href={`https://etherscan.io/address/${V2}#code`} target="_blank" rel="noopener">V2 source ↗</a></div></div>
          </div>

          <h3 className="h-card" style={{ marginTop: 40 }}>Retired contracts</h3>
          <div className="table-wrap" style={{ marginTop: 12 }}>
            <table className="data">
              <thead><tr><th>Contract</th><th>Status</th></tr></thead>
              <tbody>
                <tr><td>Presale V1 <Addr a={CONTRACTS.presaleV1} /></td><td>Could not complete purchases. Switched off and emptied on 6 October 2026.</td></tr>
                <tr><td>Earlier presale <Addr a={CONTRACTS.presaleLegacy} /></td><td>Never sold a token. Switched off and emptied on 6 October 2026.</td></tr>
                <tr><td>Uniswap V4 CLXT/USDT position</td><td>A small, unlocked pool created from the owner address. Liquidity withdrawn on 6 October 2026. CLXT has no exchange listing and GDN provides no trading liquidity; anyone can create a pool, so treat unofficial prices with caution.</td></tr>
              </tbody>
            </table>
          </div>
          <p className="small" style={{ marginTop: 16 }}>Buy only through <Link href="/#presale">crossledger.trade</Link> or the verified V2 contract. No independent audit has been completed yet. See the <Link href="/whitepaper#risks">risk factors</Link>.</p>
        </div>
      </section>
    </Layout>
  );
}
