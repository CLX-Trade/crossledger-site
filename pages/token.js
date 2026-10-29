// Token facts: who holds CLXT, what is locked, and what the contracts can and
// cannot do. Figures come from lib/site.js (HOLDINGS, LOCKS) so the whitepaper
// and this page cannot drift apart. Update both when holdings change.
import Link from "next/link";
import Layout from "../components/Layout";
import Seo from "../components/Seo";
import AddTokenButton from "../components/AddTokenButton";
import { CONTRACTS, HOLDINGS, HOLDINGS_DATE, LOCKS, SITE, lockUrl, lockNftUrl, shortAddr } from "../lib/site";

const TOTAL = 1_000_000_000;
const fmt = (n) => n.toLocaleString("en-US");
const pct = (n) => `${((n / TOTAL) * 100).toFixed(1)}%`;
const Addr = ({ a, kind = "address" }) => (
  <a href={`https://etherscan.io/${kind}/${a}`} target="_blank" rel="noopener"><code>{shortAddr(a)}</code></a>
);
const V2 = CONTRACTS.presaleV2 || CONTRACTS.presaleCurrent;

export default function TokenFacts() {
  const locked = LOCKS.reduce((s, l) => s + l.amount, 0);
  return (
    <Layout>
      <Seo
        title="CLXT Token Facts | Holders, Vesting Locks and Contract Controls"
        description="Every CLXT holder labelled, the public vesting locks that hold 60% of supply, the 13 October 2026 token migration, and what the contracts can and cannot do."
        path="/token"
        type="article"
      />

      <section className="hero" style={{ paddingBottom: 48 }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">crossledger.trade</Link><span>/</span><span aria-current="page">Token facts</span></nav>
          <img className="coin" src="/clxt-logo-cmc.png" width="88" height="88" alt="CLXT token logo" style={{ marginTop: 24 }} />
          <h1 className="display" style={{ marginTop: 18 }}>CLXT token facts.</h1>
          <p className="lede" style={{ marginTop: 20 }}>Who holds CLXT, what is locked and until when, and what the contracts allow. Every figure links to the chain so you can check it yourself. Holdings were read from Ethereum mainnet on {HOLDINGS_DATE}.</p>
          <div className="stats" style={{ marginTop: 32 }}>
            <div className="stat"><div className="v">{pct(locked)}</div><div className="l">of supply locked in vesting</div></div>
            <div className="stat"><div className="v" style={{ fontSize: "clamp(22px, 2.6vw, 30px)" }}>No owner</div><div className="l">on the token contract</div></div>
            <div className="stat"><div className="v">1B</div><div className="l">CLXT, fixed supply</div></div>
            <div className="stat"><div className="v">1</div><div className="l">live presale contract</div></div>
          </div>
        </div>
      </section>

      <section id="migration" className="section" style={{ paddingTop: 24, paddingBottom: 24 }}>
        <div id="wallet-warning" />
        <div className="container" style={{ maxWidth: 900 }}>
          <div className="callout">
            <span className="badge-outline">Token migration · 13 October 2026</span>
            <h2>CLXT moved to a new contract</h2>
            <p>On 13 October 2026 CLXT moved to a new token contract, <Addr a={CONTRACTS.clxt} kind="token" />. The original contract, <Addr a={CONTRACTS.clxtRetired} kind="token" />, is retired. Use only the new address.</p>
            <AddTokenButton />
            <ul>
              <li><strong>Why.</strong> Wallet security scanners, including the one MetaMask uses, labelled the original contract &quot;malicious&quot;, citing a &quot;token backdoor&quot; and &quot;suspicious code&quot;. Two things in its code caused that: a staking feature that credited rewards as new tokens without a transfer record or a change to the reported supply, and a trading switch controlled by the owner. Staking was never used and trading was switched on at launch, but the contract could not be changed, so the token was reissued.</li>
              <li><strong>What the new contract is.</strong> The standard OpenZeppelin ERC-20, unmodified. All 1,000,000,000 CLXT were created once, at deployment. It has no owner and no admin functions: nobody, including GDN, can create more tokens, pause transfers, block an address or charge a fee. Its source code is verified on Etherscan as an exact match.</li>
              <li><strong>What carried over.</strong> The three vesting locks were re-created on the new token with the same amounts and the same release dates, and the presale moved to a new contract running the same verified code. No other balances were carried over: wallets outside the owner address that held the original token received no new CLXT, and the equivalent amount is part of the owner address&apos;s unlocked balance.</li>
              <li><strong>If you hold the original token.</strong> CrossLedger no longer uses it, and no purchase was ever completed through a presale contract for it. Questions: <a href={`mailto:${SITE.email}?subject=CLXT%20migration`}>{SITE.email}</a>.</li>
            </ul>
            <p><strong>About scanner labels.</strong> Security scanners assess each contract address separately, and labels on a new address can take time to settle. Warnings you saw earlier refer to the original address. Check the address before you add or buy CLXT: <a href={`https://etherscan.io/address/${CONTRACTS.clxt}#code`} target="_blank" rel="noopener">token source code on Etherscan</a>.</p>
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
          <p className="small" style={{ marginTop: 12 }}>The owner address&apos;s unlocked balance holds the treasury, compliance and operations allocations and the 125,001,000 CLXT strategic allocation, which sat in a separate wallet on the original token and was not carried over. Live balances are always on <a href={`https://etherscan.io/token/${CONTRACTS.clxt}#balances`} target="_blank" rel="noopener">Etherscan</a>.</p>
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
          <p className="small" style={{ marginTop: 12 }}>Sablier Lockup contract: <Addr a={CONTRACTS.sablierLockup} />. These locks were created on 13 October 2026 with the same amounts and release dates as the original locks #{LOCKS.map((l) => l.replaces).join(", #")}, which remain on the retired token and stay locked.</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 900 }}>
          <h2 className="h-section">What the contracts can and cannot do</h2>
          <div className="grid grid-2" style={{ marginTop: 20 }}>
            <div className="card"><span className="tag ok">No owner</span><h3 className="h-card">Token ownership</h3><p>The CLXT contract has no owner and no admin functions, so there is nothing to renounce and no account, including GDN&apos;s, can change it.</p><div className="card-meta"><a href={`https://etherscan.io/address/${CONTRACTS.clxt}#code`} target="_blank" rel="noopener">Token source ↗</a></div></div>
            <div className="card"><span className="tag ok">Cannot be paused</span><h3 className="h-card">Transfers</h3><p>The contract has no pause, trading switch, blocklist or transfer fee. Transfers work the same way for every holder.</p><div className="card-meta"><a href={`https://etherscan.io/address/${CONTRACTS.clxt}#code`} target="_blank" rel="noopener">Token source ↗</a></div></div>
            <div className="card"><span className="tag ok">Fixed</span><h3 className="h-card">Supply</h3><p>All 1,000,000,000 CLXT were created once, at deployment. There is no mint function and no staking, so the reported supply is the actual supply.</p><div className="card-meta"><a href="#migration">Why the token was reissued →</a></div></div>
            <div className="card"><span className="tag">Owner controlled</span><h3 className="h-card">Presale V2</h3><p>The presale sells at a single rate. Its owner can change the rate, minimum purchase and treasury, pause the sale and withdraw unsold tokens. It was funded with 20,000,000 CLXT. The four published stages allocate 17,000,000 CLXT; the remaining 3,000,000 CLXT has no allocation in that stage plan.</p><div className="card-meta"><a href={`https://etherscan.io/address/${V2}#code`} target="_blank" rel="noopener">V2 source ↗</a></div></div>
          </div>

          <h3 className="h-card" style={{ marginTop: 40 }}>Retired contracts</h3>
          <div className="table-wrap" style={{ marginTop: 12 }}>
            <table className="data">
              <thead><tr><th>Contract</th><th>Status</th></tr></thead>
              <tbody>
                <tr><td>Original CLXT token <Addr a={CONTRACTS.clxtRetired} kind="token" /></td><td>Retired on 13 October 2026 and replaced by the current token. Its ownership was renounced on 6 October 2026, so it can no longer be changed. Do not buy it or accept it as CLXT.</td></tr>
                <tr><td>Presale V2 on the original token <Addr a={CONTRACTS.presaleV2Retired} /></td><td>Never sold a token. Closed and emptied on 13 October 2026.</td></tr>
                <tr><td>Presale V1 <Addr a={CONTRACTS.presaleV1} /></td><td>Could not complete purchases. Switched off and emptied on 6 October 2026.</td></tr>
                <tr><td>Earlier presale <Addr a={CONTRACTS.presaleLegacy} /></td><td>Never sold a token. Switched off and emptied on 6 October 2026.</td></tr>
                <tr><td>Uniswap V4 CLXT/USDT position</td><td>A small, unlocked pool of the original token, created from the owner address. Liquidity withdrawn on 6 October 2026. CLXT has no exchange listing and GDN provides no trading liquidity; anyone can create a pool, so treat unofficial prices with caution.</td></tr>
              </tbody>
            </table>
          </div>
          <p className="small" style={{ marginTop: 16 }}>Buy only through <Link href="/#presale">crossledger.trade</Link> or the verified presale contract. No independent audit has been completed yet. See the <Link href="/whitepaper#risks">risk factors</Link>.</p>
        </div>
      </section>
    </Layout>
  );
}
