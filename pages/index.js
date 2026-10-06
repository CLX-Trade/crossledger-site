import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { mainnet } from "@reown/appkit/networks";
import { useChainId, useSwitchChain, useReadContracts, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { parseUnits, formatUnits, parseAbi, parseEventLogs } from "viem";
import Layout from "../components/Layout";
import Seo from "../components/Seo";
import HeroArt from "../components/HeroArt";
import { CONTRACTS, SITE, RESTRICTED_JURISDICTIONS, shortAddr } from "../lib/site";

/* ==========================================================
   PRESALE CONFIGURATION
   The checkout is enabled only when NEXT_PUBLIC_PRESALE_V2_ADDRESS is set,
   i.e. after CLXPresaleV2 is deployed, funded and has passed a live test
   purchase. V1 (0xABCA…8B35) reverts on every purchase because it declares
   USDT's transferFrom as returning bool; it is used for reads only.
   ========================================================= */
const IS_V2 = Boolean(CONTRACTS.presaleV2);
const PRESALE_ADDRESS = CONTRACTS.presale;
const CHECKOUT_UNAVAILABLE = !IS_V2;
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mlgpnvbk";
const MIN_PURCHASE_USD = 200;

// These must go through viem's parseAbi(). Human-readable strings passed straight
// to wagmi make viem evaluate `'name' in "function ..."`, which throws and
// silently fails every read and write.
const PRESALE_READ_ABI = parseAbi([
  "function clxtPerUsdt() view returns (uint256)",
  "function presaleActive() view returns (bool)",
]);
const PRESALE_V2_ABI = parseAbi([
  "function buyWithUSDT(uint256 usdtAmount, uint256 minClxtOut)",
]);
const PRESALE_EVENTS_ABI = parseAbi([
  "event TokensPurchased(address indexed buyer, uint256 usdtSpent, uint256 clxtReceived)",
]);
const ERC20_ABI = parseAbi([
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
]);

const ALLOCATION = [
  { title: "Ecosystem and trade incentives", pct: 35, color: "#3355ff", desc: "Rebates for early trades, corridor onboarding and verifier incentives." },
  { title: "Treasury and compliance", pct: 20, color: "#7b5cff", desc: "Licensing, audits, legal work and operating reserve." },
  { title: "Founders and team", pct: 15, color: "#14b8a6", desc: "Planned 12-month cliff, then 24-month linear vesting." },
  { title: "Strategic investors", pct: 15, color: "#f59e0b", desc: "Seed partners and the staged public presale." },
  { title: "Exchange and liquidity", pct: 10, color: "#ec4899", desc: "Liquidity at listing, to be time-locked." },
  { title: "Operations and partnerships", pct: 5, color: "#64748b", desc: "Integrations and commercial partnerships." },
];

const STAGES = [
  { name: "Stage 1", price: "US$0.10", rate: 10, cap: "5,000,000" },
  { name: "Stage 2", price: "US$0.20", rate: 5, cap: "5,000,000" },
  { name: "Stage 3", price: "US$0.25", rate: 4, cap: "4,000,000" },
  { name: "Stage 4", price: "US$0.50", rate: 2, cap: "3,000,000" },
];

const Icon = {
  doc: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></svg>,
  lock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /><path d="M9 12l2 2 4-4" /></svg>,
  layers: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 2 8l10 5 10-5z" /><path d="M2 13l10 5 10-5" /></svg>,
  globe: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z" /></svg>,
  one: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h4l3-8 4 16 3-8h2" /></svg>,
  desk: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18h18M5 18V9l7-5 7 5v9M9 18v-5h6v5" /></svg>,
  warn: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 2 20h20z" /><path d="M12 10v4M12 17h.01" /></svg>,
};

export default function HomePage() {
  /* ====== APPKIT + WAGMI ====== */
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const publicClient = usePublicClient({ chainId: mainnet.id });
  const chainOk = chainId === mainnet.id;

  /* ====== CONTRACT READS ======
     No fallbacks: if the rate or status read fails, the widget shows "—" and
     stays disabled rather than quoting an assumed price. */
  const { data: presaleReads } = useReadContracts({
    contracts: [
      { address: PRESALE_ADDRESS, abi: PRESALE_READ_ABI, functionName: "clxtPerUsdt", chainId: mainnet.id },
      { address: PRESALE_ADDRESS, abi: PRESALE_READ_ABI, functionName: "presaleActive", chainId: mainnet.id },
    ],
    query: { refetchInterval: 30_000 },
  });
  const rate = presaleReads?.[0]?.status === "success" && presaleReads[0].result > 0n ? presaleReads[0].result : null;
  const presaleActive = presaleReads?.[1]?.status === "success" && presaleReads[1].result === true;
  const saleOpen = IS_V2 && presaleActive && rate !== null;

  const { data: usdtBalance, refetch: refetchBalance } = useReadContract({
    address: CONTRACTS.usdt, abi: ERC20_ABI, functionName: "balanceOf", chainId: mainnet.id,
    args: address ? [address] : undefined,
    query: { enabled: !!address && chainOk },
  });
  const { data: usdtAllowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACTS.usdt, abi: ERC20_ABI, functionName: "allowance", chainId: mainnet.id,
    args: address ? [address, PRESALE_ADDRESS] : undefined,
    query: { enabled: !!address && chainOk },
  });

  /* ====== CONTRACT WRITES ======
     All writes and receipt tracking are pinned to mainnet. A mined receipt is
     not proof of success: viem returns reverted receipts without throwing, so
     every receipt's status is checked before reporting anything. */
  const { writeContractAsync: writeApprove, data: approveTxHash, isPending: approving } = useWriteContract();
  const { data: approveReceipt, isLoading: approveConfirming, isError: approveWaitFailed } = useWaitForTransactionReceipt({ hash: approveTxHash, chainId: mainnet.id });
  const { writeContractAsync: writeBuy, data: buyTxHash, isPending: buying } = useWriteContract();
  const { data: buyReceipt, isLoading: buyConfirming, isError: buyWaitFailed } = useWaitForTransactionReceipt({ hash: buyTxHash, chainId: mainnet.id });
  const [resetting, setResetting] = useState(false);

  /* ====== UI STATE ====== */
  const [usdtAmount, setUsdtAmount] = useState("");
  const [tosChecked, setTosChecked] = useState(false);
  // Status is plain text plus an optional transaction link. Never HTML: wallet
  // and RPC error strings are rendered as text, not markup.
  const [statusMsg, setStatusMsg] = useState(null);
  const [contactStatus, setContactStatus] = useState(null);
  const [contactSending, setContactSending] = useState(false);
  const setMsg = (kind, text, txHash) => setStatusMsg(text ? { kind, text, txHash } : null);

  /* ====== JURISDICTION SCREEN ======
     middleware.js stamps the visitor's IP country into a readable cookie on
     every homepage load. Fail CLOSED: until the cookie is read, or if it is
     missing (for example, cookies blocked), the purchase interface stays
     disabled, as it does for a restricted country. */
  const [geoCountry, setGeoCountry] = useState(null);
  useEffect(() => {
    const m = document.cookie.match(/(?:^|;\s*)clxt_geo=([A-Za-z]{2})/);
    setGeoCountry(m ? m[1].toUpperCase() : "UNKNOWN");
  }, []);
  const geoUnknown = geoCountry === null || geoCountry === "UNKNOWN";
  const geoBlocked = geoUnknown || RESTRICTED_JURISDICTIONS.includes(geoCountry);

  /* ====== RECEIPT HANDLING ====== */
  useEffect(() => {
    if (!approveReceipt) return;
    if (approveReceipt.status === "success") {
      setMsg("info", "USDT approved. You can now buy CLXT.", approveReceipt.transactionHash);
    } else {
      setMsg("error", "The approval transaction failed on-chain. No allowance was set.", approveReceipt.transactionHash);
    }
    refetchAllowance(); refetchBalance();
  }, [approveReceipt]); // eslint-disable-line

  useEffect(() => {
    if (approveWaitFailed) setMsg("error", "Could not confirm the approval. Check your wallet's activity before trying again.", approveTxHash);
  }, [approveWaitFailed]); // eslint-disable-line

  useEffect(() => {
    if (!buyReceipt) return;
    // Report only what the chain says: the TokensPurchased event emitted by
    // the presale contract for this buyer. A cancelled or replaced transaction
    // has no such event and is not reported as a purchase.
    let bought = null;
    if (buyReceipt.status === "success") {
      try {
        const events = parseEventLogs({ abi: PRESALE_EVENTS_ABI, logs: buyReceipt.logs, eventName: "TokensPurchased" })
          .filter((ev) => ev.address.toLowerCase() === PRESALE_ADDRESS.toLowerCase() && ev.args.buyer.toLowerCase() === (address || "").toLowerCase());
        if (events.length) bought = events[0].args.clxtReceived;
      } catch { /* no matching event */ }
    }
    if (bought !== null) {
      const n = Number(formatUnits(bought, 18)).toLocaleString("en-US", { maximumFractionDigits: 2 });
      setMsg("info", `Purchase confirmed: ${n} CLXT sent to your wallet.`, buyReceipt.transactionHash);
      setUsdtAmount("");
    } else {
      setMsg("error", "The transaction did not complete a purchase. No CLXT was delivered and your USDT was not taken.", buyReceipt.transactionHash);
    }
    refetchBalance(); refetchAllowance();
  }, [buyReceipt]); // eslint-disable-line

  useEffect(() => {
    if (buyWaitFailed) setMsg("error", "Could not confirm the purchase transaction. Check your wallet's activity before trying again.", buyTxHash);
  }, [buyWaitFailed]); // eslint-disable-line

  /* ====== DERIVED ====== */
  const displayPrice = rate ? "US$" + (1 / Number(rate)).toFixed(2) : "—";
  // Strict decimal with at most 6 places (USDT precision). Rejects "2e2",
  // negatives and anything parseUnits would choke on.
  const amountWei = useMemo(() => {
    const t = usdtAmount.trim();
    if (!/^\d{1,12}(\.\d{1,6})?$/.test(t)) return 0n;
    try { return parseUnits(t, 6); } catch { return 0n; }
  }, [usdtAmount]);
  const amountValid = amountWei >= BigInt(MIN_PURCHASE_USD) * 10n ** 6n;
  // Exact CLXT the buyer expects at the rate shown, passed as the V2 slippage
  // guard: a rate change before mining makes the purchase revert instead of
  // filling at a worse rate.
  const expectedClxtWei = rate && amountValid ? amountWei * rate * 10n ** 12n : 0n;
  const estimatedClxt = rate && amountWei > 0n
    ? Number(formatUnits(amountWei * rate * 10n ** 12n, 18)).toLocaleString("en-US", { maximumFractionDigits: 0 }) + " CLXT"
    : "—";
  const hasBalance = amountValid && usdtBalance !== undefined && usdtBalance >= amountWei;
  const hasAllowance = amountValid && usdtAllowance !== undefined && usdtAllowance >= amountWei;
  const pending = approving || approveConfirming || buying || buyConfirming || resetting;

  const fmtUsdt = (n) => (n === undefined || n === null ? "—" :
    Number(formatUnits(n, 6)).toLocaleString("en-US", { maximumFractionDigits: 2 }) + " USDT");

  /* ====== ACTIONS ====== */
  async function switchToMainnet() {
    try { await switchChainAsync({ chainId: mainnet.id }); }
    catch (e) { setMsg("error", "Could not switch network: " + (e.shortMessage || e.message)); }
  }

  const friendly = (e, fallback) => {
    const m = e?.shortMessage || e?.message || fallback;
    return e?.code === 4001 || e?.code === "ACTION_REJECTED" || /rejected|denied/i.test(m) ? null : m;
  };

  async function handleApproveUSDT() {
    if (!saleOpen || geoBlocked || !chainOk || !amountValid || !hasBalance || pending) return;
    const amount = amountWei;
    try {
      // USDT rejects approve() from one non-zero allowance to another. Reset to
      // zero first, or the approval reverts for anyone with a leftover allowance.
      if ((usdtAllowance ?? 0n) > 0n) {
        setResetting(true);
        setMsg("info", "Your wallet has an existing USDT allowance. Confirm resetting it to zero first.");
        const resetHash = await writeApprove({ chainId: mainnet.id, address: CONTRACTS.usdt, abi: ERC20_ABI, functionName: "approve", args: [PRESALE_ADDRESS, 0n] });
        const r = await publicClient.waitForTransactionReceipt({ hash: resetHash });
        setResetting(false);
        if (r.status !== "success") { setMsg("error", "Resetting the allowance failed on-chain.", resetHash); return; }
      }
      setMsg("info", "Confirm the USDT approval in your wallet.");
      const hash = await writeApprove({ chainId: mainnet.id, address: CONTRACTS.usdt, abi: ERC20_ABI, functionName: "approve", args: [PRESALE_ADDRESS, amount] });
      setMsg("info", "Approval submitted. Waiting for confirmation.", hash);
    } catch (e) {
      setResetting(false);
      const m = friendly(e, "Unknown error");
      setMsg("error", m ? `Approval failed: ${m}` : "Approval cancelled.");
    }
  }

  async function handleBuy() {
    if (!saleOpen || geoBlocked || !chainOk || !amountValid || !hasBalance || !hasAllowance || pending || expectedClxtWei === 0n) return;
    setMsg("info", "Confirm the purchase in your wallet.");
    try {
      const hash = await writeBuy({ chainId: mainnet.id, address: PRESALE_ADDRESS, abi: PRESALE_V2_ABI, functionName: "buyWithUSDT", args: [amountWei, expectedClxtWei] });
      setMsg("info", "Purchase submitted. Waiting for confirmation.", hash);
    } catch (e) {
      let m = friendly(e, "Unknown error");
      if (m === null) m = "Purchase cancelled.";
      else if (m.includes("Presale not active")) m = "The presale is paused.";
      else if (m.includes("Insufficient CLXT")) m = "The presale contract does not hold enough CLXT for this purchase.";
      else if (m.includes("Rate changed")) m = "The sale rate changed before your transaction. Refresh and try again.";
      else if (m.includes("Below minimum")) m = `The minimum purchase is ${MIN_PURCHASE_USD} USDT.`;
      else if (m.includes("USDT transfer failed")) m = "USDT transfer failed. Check your USDT balance and approval.";
      else m = `Purchase failed: ${m}`;
      setMsg("error", m);
    }
  }

  async function handleContactSubmit(e) {
    e.preventDefault();
    if (contactSending) return;
    setContactSending(true); setContactStatus(null);
    const form = e.currentTarget;
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      if (res.ok) {
        setContactStatus({ kind: "ok", text: "Thanks. Your message has been sent and we will reply within two business days." });
        form.reset();
      } else {
        setContactStatus({ kind: "error", text: `Your message could not be sent. Please email ${SITE.email}.` });
      }
    } catch {
      setContactStatus({ kind: "error", text: `Your message could not be sent. Please email ${SITE.email}.` });
    } finally {
      setContactSending(false);
    }
  }

  /* ====== BUTTON STATE ======
     Recomputed on every render (no memo), so the handlers always see the
     current amount, rate and allowance. */
  let btn;
  if (CHECKOUT_UNAVAILABLE) btn = { left: "Approve USDT", leftDisabled: true, right: "Buy CLXT", rightDisabled: true };
  else if (geoBlocked) btn = { left: geoUnknown ? "Region not confirmed" : "Not available in your region", leftDisabled: true, right: "Buy CLXT", rightDisabled: true };
  else if (!isConnected) btn = { left: "Connect wallet", leftAction: () => open(), right: "Buy CLXT", rightDisabled: true };
  else if (!chainOk) btn = { left: "Switch to Ethereum", leftAction: switchToMainnet, right: "Buy CLXT", rightDisabled: true };
  else if (!saleOpen) btn = { left: "Presale paused", leftDisabled: true, right: "Buy CLXT", rightDisabled: true };
  else if (!tosChecked || !amountValid || !hasBalance) btn = { left: "Approve USDT", leftDisabled: true, right: "Buy CLXT", rightDisabled: true };
  else if (!hasAllowance) btn = {
    left: resetting ? "Resetting allowance…" : approving ? "Awaiting wallet…" : approveConfirming ? "Approving…" : "Approve USDT",
    leftAction: handleApproveUSDT, leftDisabled: pending, right: "Buy CLXT", rightDisabled: true,
  };
  else btn = {
    left: "✓ USDT approved", leftDisabled: true,
    right: buying ? "Awaiting wallet…" : buyConfirming ? "Buying…" : "Buy CLXT",
    rightAction: handleBuy, rightDisabled: pending,
  };

  const walletStatus = !isConnected ? ["Not connected", "muted"] : !chainOk ? [`${shortAddr(address)} · wrong network`, "warn"] : [shortAddr(address), "success"];

  return (
    <Layout>
      <Seo
        title="CrossLedger (CLXT) | Settlement Infrastructure for Commodity Trade"
        description="CrossLedger registers trade documents on Ethereum and holds payment in escrow that releases on verified documents and independent inspection. Built by GDN Group."
        path="/"
        jsonLd={{ "@context": "https://schema.org", "@type": "WebSite", name: "CrossLedger", url: SITE.url }}
      />

      {/* ── Hero ── */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <Link href="/contact" className="pill" style={{ textDecoration: "none" }}><span className="dot" style={{ background: "var(--primary)" }} />In development · now inviting pilot partners</Link>
            <h1 className="display">Commodity trade, settled on proof.</h1>
            <p className="lede">CrossLedger is building settlement infrastructure for physical commodity trade: documents fingerprinted on Ethereum, and payment held in escrow that releases only when the documents and an independent inspection check out. Built by GDN Group, a commodity trading house, for the trades it does every day.</p>
            <div className="hero-actions">
              <Link href="/contact" className="btn btn-primary btn-lg">Discuss a pilot trade</Link>
              <Link href="/whitepaper" className="btn btn-outline btn-lg">Read the whitepaper</Link>
              <Link href="/how-it-works" className="btn btn-ghost btn-lg">How it works →</Link>
            </div>
            <p className="small muted" style={{ marginTop: 20 }}>
              CLXT presale: {saleOpen ? <>open at {displayPrice} per CLXT.</> : <>{CHECKOUT_UNAVAILABLE ? "purchases paused while the presale contract is replaced." : "paused."}</>}{" "}
              <a href="#presale"><strong>Buy CLXT →</strong></a> · <a href="#security">Security status</a>
            </p>
          </div>
          <div className="hero-art"><HeroArt /></div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ padding: "0 0 24px" }}>
        <div className="container">
          <div className="stats">
            <div className="stat"><div className="v">US$2.5T</div><div className="l">Global trade finance gap</div><div className="s">Asian Development Bank, 2023</div></div>
            <div className="stat"><div className="v">5–14 days</div><div className="l">Typical letter of credit settlement</div><div className="s">After document presentation</div></div>
            <div className="stat"><div className="v">Up to 36</div><div className="l">Original documents per shipment</div><div className="s">ICC Digital Standards Initiative</div></div>
            <div className="stat"><div className="v">0.2–0.4%</div><div className="l">Target platform fee</div><div className="s">Design target, not yet in operation</div></div>
          </div>
        </div>
      </section>

      {/* ── Two paths ── */}
      <section style={{ padding: "48px 0 0" }}>
        <div className="container grid grid-2">
          <div className="card">
            <span className="tag">Traders, inspectors, financiers</span>
            <h2 className="h-card">Settle a trade on proof</h2>
            <p>We are inviting pilot partners on the corridors GDN already trades. See how a trade settles, then tell us your commodity, parcel size and route.</p>
            <div className="hero-actions" style={{ marginTop: 18 }}>
              <Link href="/contact" className="btn btn-primary">Discuss a pilot trade</Link>
              <Link href="/how-it-works" className="btn btn-outline">How it works</Link>
            </div>
          </div>
          <div className="card">
            <span className="tag">CLXT holders and followers</span>
            <h2 className="h-card">Token, presale and security status</h2>
            <p>On-chain facts, the planned allocation, the presale contract status and every known contract issue, stated plainly.</p>
            <div className="hero-actions" style={{ marginTop: 18 }}>
              <a href="#token" className="btn btn-outline">CLXT token</a>
              <a href="#presale" className="btn btn-outline">Presale status</a>
              <a href="#security" className="btn btn-ghost">Security →</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── What it does ── */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">What CrossLedger does</span>
            <h2 className="h-section">Four building blocks for settling physical trade.</h2>
            <p className="lede">No new money for settlement, and no consortium to join. Trades settle in dollar stablecoins between the two parties, with a public record both can check.</p>
          </div>
          <div className="grid grid-4">
            <Link href="/whitepaper#registry" className="card card-link"><div className="card-icon">{Icon.doc}</div><h3 className="h-card">Document registry</h3><p>Every bill of lading, invoice and certificate is fingerprinted on-chain when issued, and a second filing of the same document is flagged.</p><span className="more">Read more →</span></Link>
            <Link href="/whitepaper#escrow" className="card card-link"><div className="card-icon">{Icon.lock}</div><h3 className="h-card">Conditional escrow</h3><p>The buyer funds a per-trade escrow up front. Neither side can pull the money alone; it moves only on the agreed conditions.</p><span className="more">Read more →</span></Link>
            <Link href="/whitepaper#attestations" className="card card-link"><div className="card-icon">{Icon.check}</div><h3 className="h-card">Inspection attestations</h3><p>The independent inspector both parties already trust signs the quantity and quality result. That signature, not paper, releases funds.</p><span className="more">Read more →</span></Link>
            <Link href="/whitepaper#disputes" className="card card-link"><div className="card-icon">{Icon.layers}</div><h3 className="h-card">Disputes with an exit</h3><p>A dispute freezes the escrow until a named arbitrator rules, backed by a governing-law contract that works without the platform.</p><span className="more">Read more →</span></Link>
          </div>
        </div>
      </section>

      {/* ── Flow ── */}
      <section className="section section-soft">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">A trade, end to end</span>
            <h2 className="h-section">30,000 tonnes of diesel, paid on the dip test.</h2>
            <p className="lede">An in-tank EN590 sale at a storage terminal, the kind of trade GDN&apos;s desk handles. Five steps, no couriers, no document examination queue.</p>
          </div>
          <div className="flow">
            <div className="flow-step"><h4>Terms fixed</h4><p>Seller sets quantity, price, documents, tolerances, deadline and arbitrator.</p></div>
            <div className="flow-step"><h4>Escrow funded</h4><p>Buyer funds USDT into the trade&apos;s escrow. The seller can see it is committed.</p></div>
            <div className="flow-step"><h4>Documents registered</h4><p>Tank receipt and invoice are fingerprinted. The registry confirms neither was filed before.</p></div>
            <div className="flow-step"><h4>Inspection signed</h4><p>The inspector dips and tests the tank and signs volume and quality.</p></div>
            <div className="flow-step"><h4>Funds released</h4><p>Conditions are met, so the escrow pays the seller in the same transaction.</p></div>
          </div>
          <p style={{ marginTop: 28 }}><Link href="/how-it-works" className="btn btn-ghost">See how it works in detail →</Link></p>
        </div>
      </section>

      {/* ── Why this works now ── */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Why this time is different</span>
            <h2 className="h-section">The consortium era ended. The problem did not.</h2>
            <p className="lede">we.trade, Marco Polo, Contour and TradeLens all built trade networks on private blockchains, and all four have closed. The technology worked; asking every bank and carrier to join one private network first did not.</p>
          </div>
          <div className="grid grid-3">
            <div className="card"><div className="card-icon">{Icon.globe}</div><h3 className="h-card">Public and neutral</h3><p>Built on Ethereum. Nobody has to be invited, and no competitor controls the record.</p></div>
            <div className="card"><div className="card-icon">{Icon.one}</div><h3 className="h-card">Useful from trade one</h3><p>Two parties and an inspector get value from a single trade. No network effect needed to start.</p></div>
            <div className="card"><div className="card-icon">{Icon.desk}</div><h3 className="h-card">Built on a trading desk</h3><p>GDN trades refined products, sugar and agricultural commodities. The platform must work there first.</p></div>
          </div>
        </div>
      </section>

      {/* ── Corridors ── */}
      <section id="corridors" className="section section-soft">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Target corridors</span>
            <h2 className="h-section">Starting where GDN already trades.</h2>
          </div>
          <div className="grid grid-3">
            <div className="card"><span className="tag">Australia → Asia</span><h3 className="h-card">Energy and bulk</h3><p>EN590 diesel, sugar and bulk commodities between Australian and Asian ports, where letter of credit costs weigh hardest on mid-tier exporters.</p></div>
            <div className="card"><span className="tag">East Africa → Europe</span><h3 className="h-card">Specialty agriculture</h3><p>Coffee, tea and cashews from producer cooperatives that often wait weeks after delivery to be paid.</p></div>
            <div className="card"><span className="tag">South America → Asia</span><h3 className="h-card">Metals and biofuels</h3><p>Copper, lithium concentrate, bioethanol and sugar, where volatile prices make milestone-based release valuable.</p></div>
          </div>
        </div>
      </section>

      {/* ── Token ── */}
      <section id="token" className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">The CLXT token</span>
            <h2 className="h-section">A utility token with a narrow job.</h2>
            <p className="lede">Trades settle in stablecoins. CLXT is designed to pay platform fees at a discount and, later, to bond the inspectors and verifiers whose signatures release funds. It is not a share, and pays no dividend or interest.</p>
          </div>
          <div className="grid grid-4" style={{ marginBottom: 40 }}>
            <div className="card"><div className="muted small">Standard</div><h3 className="h-card" style={{ marginTop: 6 }}>ERC-20 · Ethereum</h3></div>
            <div className="card"><div className="muted small">Initial supply</div><h3 className="h-card" style={{ marginTop: 6 }}>1,000,000,000</h3></div>
            <div className="card"><div className="muted small">Token contract</div><h3 className="h-card" style={{ marginTop: 6 }}><a href={`https://etherscan.io/token/${CONTRACTS.clxt}`} target="_blank" rel="noopener" className="mono">{shortAddr(CONTRACTS.clxt)} ↗</a></h3></div>
            <div className="card"><div className="muted small">Platform utility</div><h3 className="h-card" style={{ marginTop: 6 }}>Fees · verifier bonds</h3></div>
          </div>
          <h3 className="h-card">Planned allocation</h3>
          <div className="alloc-bar" role="img" aria-label="Allocation: 35% ecosystem, 20% treasury, 15% team, 15% investors, 10% liquidity, 5% operations">
            {ALLOCATION.map((a) => <span key={a.title} style={{ width: `${a.pct}%`, background: a.color }} />)}
          </div>
          <div className="alloc-legend">
            {ALLOCATION.map((a) => (
              <div className="alloc-item" key={a.title}>
                <span className="sw" style={{ background: a.color }} />
                <b><span className="pct">{a.pct}%</span> {a.title}</b>
                <p>{a.desc}</p>
              </div>
            ))}
          </div>
          <div className="notice" style={{ marginTop: 32 }}>
            {Icon.warn}
            <div>
              <p><strong>Allocations are plans, not on-chain locks yet.</strong> No vesting or lock contracts hold these allocations today, and most of the supply sits in the owner address. GDN will move them into published time-locked contracts before any exchange listing.</p>
              <p>The token&apos;s staking function creates rewards without updating the reported total supply. GDN does not promote or use staking and will publish a remedy before any listing. <Link href="/whitepaper#supply">Details in the whitepaper →</Link></p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Presale ── */}
      <section className="section section-soft">
        <div className="container presale">
          <div>
            <span className="eyebrow">Presale</span>
            <h2 className="h-section">{CHECKOUT_UNAVAILABLE ? "Purchases are paused while the contract is replaced." : "Buy CLXT with USDT on Ethereum."}</h2>
            {CHECKOUT_UNAVAILABLE ? (
              <>
                <p className="lede" style={{ marginTop: 16 }}>The first presale contract cannot complete a purchase: it expects USDT to return a value that mainnet USDT never returns, so every purchase reverts. No buyer funds were taken. A corrected contract has been written and tested against a copy of mainnet and goes live only after deployment and a live test purchase.</p>
                <div className="notice warn" style={{ marginTop: 24 }}>
                  {Icon.warn}
                  <div><p><strong>Do not send USDT or ETH directly to any contract address.</strong> Purchases will reopen here, and the new contract address will be announced on this site and on <a href="https://x.com/CrossLedgerCLX" target="_blank" rel="noopener">@CrossLedgerCLX</a>.</p></div>
                </div>
              </>
            ) : (
              <div className="steps">
                <div className="step"><div className="n">01</div><h4>Connect wallet</h4><p>MetaMask, WalletConnect, Coinbase Wallet and others, on desktop or mobile.</p></div>
                <div className="step"><div className="n">02</div><h4>Approve USDT</h4><p>Authorise the presale contract to spend the amount you enter.</p></div>
                <div className="step"><div className="n">03</div><h4>Buy</h4><p>Calls <code className="mono">buyWithUSDT</code> on the verified contract.</p></div>
                <div className="step"><div className="n">04</div><h4>Receive CLXT</h4><p>Tokens arrive in your wallet in the same transaction.</p></div>
              </div>
            )}
            <h3 className="h-card" style={{ marginTop: 40, marginBottom: 14 }}>Published stage plan</h3>
            <div className="table-wrap">
              <table className="data">
                <thead><tr><th>Stage</th><th className="num">Price</th><th className="num">CLXT per USDT</th><th className="num">Planned allocation</th></tr></thead>
                <tbody>{STAGES.map((s) => <tr key={s.name}><td>{s.name}</td><td className="num">{s.price}</td><td className="num">{s.rate}</td><td className="num">{s.cap} CLXT</td></tr>)}</tbody>
              </table>
            </div>
            <p className="small muted" style={{ marginTop: 12 }}>The contract sells at one owner-set rate; stages are a GDN commitment, not enforced in code. Stage prices are sale prices, not valuations. CrossLedger publishes no listing or target price.</p>
          </div>

          <div id="presale" className="widget">
            <h3>CLXT presale</h3>
            <div className="sub">{CHECKOUT_UNAVAILABLE ? "CHECKOUT PAUSED · CONTRACT REPLACEMENT IN PROGRESS" : `CONTRACT ${shortAddr(PRESALE_ADDRESS)} · ETHEREUM`}</div>
            <div className="row"><span className="k">Current price</span><span className="v">{displayPrice}</span></div>
            <div className="row"><span className="k">Minimum purchase</span><span className="v">{MIN_PURCHASE_USD} USDT</span></div>
            <div className="row"><span className="k">Wallet</span><span className={`v ${walletStatus[1]}`}>{walletStatus[0]}</span></div>
            <div className="row"><span className="k">USDT balance</span><span className="v">{isConnected && chainOk ? fmtUsdt(usdtBalance) : "—"}</span></div>
            <div className="row"><span className="k">Approved allowance</span><span className="v">{isConnected && chainOk ? fmtUsdt(usdtAllowance) : "—"}</span></div>
            <div className="pills">
              {[200, 500, 1000, 2500].map((amt) => (
                <button key={amt} type="button" disabled={CHECKOUT_UNAVAILABLE} onClick={() => setUsdtAmount(String(amt))}>{amt}</button>
              ))}
            </div>
            <label className="visually-hidden" htmlFor="usdt-amount">Amount in USDT</label>
            <input id="usdt-amount" type="text" inputMode="decimal" autoComplete="off" placeholder="Amount in USDT" value={usdtAmount} disabled={CHECKOUT_UNAVAILABLE} onChange={(e) => setUsdtAmount(e.target.value.replace(/[^0-9.]/g, ""))} />
            <div className="row"><span className="k">You receive</span><span className="v">{estimatedClxt}</span></div>
            <div className="tos">
              <label>
                <input type="checkbox" checked={tosChecked} disabled={CHECKOUT_UNAVAILABLE} onChange={(e) => setTosChecked(e.target.checked)} />
                <span>I have read the <a href="#risk">risk disclosure</a> and <a href="#security">jurisdictional restrictions</a>, I am not a resident of a restricted jurisdiction, and I am using funds I can afford to lose.</span>
              </label>
            </div>
            <div className="actions">
              <button type="button" className="btn btn-outline" onClick={btn.leftAction} disabled={btn.leftDisabled}>{btn.left}</button>
              <button type="button" className="btn btn-primary" onClick={btn.rightAction} disabled={btn.rightDisabled}>{btn.right}</button>
            </div>
            {statusMsg && (
              <div className={`widget-msg ${statusMsg.kind}`} role="status">
                {statusMsg.text}
                {statusMsg.txHash && <> <a href={`https://etherscan.io/tx/${statusMsg.txHash}`} target="_blank" rel="noopener">View transaction ↗</a></>}
              </div>
            )}
            <div className="widget-note">
              {CHECKOUT_UNAVAILABLE
                ? <>Purchases are paused. Questions: <a href={`mailto:${SITE.email}?subject=CLXT%20presale`}>{SITE.email}</a>.</>
                : <>The minimum is enforced by the contract. Your purchase reverts, rather than filling at a different price, if the rate changes before it confirms.</>}
            </div>
          </div>
        </div>
      </section>

      {/* ── Security & compliance ── */}
      <section id="security" className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Security and compliance</span>
            <h2 className="h-section">What is verified, what is broken, what is next.</h2>
            <p className="lede">A plain statement of where the contracts and the company stand today, updated when anything changes.</p>
          </div>
          <div className="grid grid-3">
            <div className="card"><span className="tag ok">Defect · fixed</span><h3 className="h-card">Presale V1 purchase failure</h3><p>V1 could not complete a purchase because of how it called USDT. It is retired and replaced by V2, deployed on 5 October 2026 with source verified on Etherscan.</p><div className="card-meta"><a href={`https://etherscan.io/address/${CONTRACTS.presaleV1}#code`} target="_blank" rel="noopener">V1 (retired) ↗</a> · <a href="https://etherscan.io/address/0x8F190E1764bfE57ddd2Daff5F55a79C64760c14F#code" target="_blank" rel="noopener">V2 (live) ↗</a></div></div>
            <div className="card"><span className="tag warn">Disclosed · remedy pending</span><h3 className="h-card">Token supply accounting</h3><p>Staking rewards add to balances without updating the reported 1 billion supply. GDN does not use staking; a remedy will be published before any listing.</p><div className="card-meta"><Link href="/whitepaper#supply">Whitepaper section →</Link></div></div>
            <div className="card"><span className="tag warn">Not yet completed</span><h3 className="h-card">Independent audit</h3><p>No independent professional audit has been completed. One is required before the escrow handles any third-party funds.</p><div className="card-meta">Earlier reviews were internal and AI-assisted</div></div>
            <div className="card"><span className="tag ok">Verified source</span><h3 className="h-card">On-chain transparency</h3><p>Token and presale source code is published on Etherscan. The owner can set the sale rate and treasury, pause sales and withdraw unsold tokens.</p><div className="card-meta"><a href={`https://etherscan.io/token/${CONTRACTS.clxt}`} target="_blank" rel="noopener">Token ↗</a> · <a href={`https://etherscan.io/address/${CONTRACTS.presale}`} target="_blank" rel="noopener">Presale ↗</a></div></div>
            <div className="card"><span className="tag ok">Advice received</span><h3 className="h-card">Australian regulatory position</h3><p>GDN Enterprise Pty Ltd is ASIC-registered and does not hold an Australian Financial Services Licence. GDN has received Australian legal advice and, on that advice, Australian residents may take part in the presale.</p><div className="card-meta">ACN {SITE.acn}</div></div>
            <div className="card"><span className="tag ok">Open</span><h3 className="h-card">Vulnerability disclosure</h3><p>Report vulnerabilities in the deployed contracts through the contact form. Reproducible findings are eligible for CLXT bounty rewards graded by severity.</p><div className="card-meta"><Link href="/contact">Report an issue →</Link></div></div>
          </div>
          <div className="card" style={{ marginTop: 20 }}>
            <h3 className="h-card" style={{ marginTop: 0 }}>Jurisdictional restrictions</h3>
            <p>CLXT is <strong>not offered</strong> to residents of the United States, Canada, the People&apos;s Republic of China, North Korea, Iran, Syria, Cuba, or any jurisdiction subject to comprehensive sanctions or where the offer would require a licence or registration GDN does not hold. The purchase interface is disabled for visitors whose IP address resolves to a restricted jurisdiction. That screen is not proof of residence or identity, and each participant is responsible for confirming eligibility under their own law.</p>
          </div>
        </div>
      </section>

      {/* ── Roadmap ── */}
      <section className="section section-soft">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Roadmap</span>
            <h2 className="h-section">Sequenced by readiness, not by date.</h2>
            <p className="lede">Each phase starts when the previous one&apos;s deliverables exist and can be checked on-chain.</p>
          </div>
          <div className="roadmap">
            <div className="road active"><div className="phase">PHASE 1 · NOW</div><h4>Foundation</h4><ul><li>✓ Presale V2 deployed and verified</li><li>Complete independent audit</li><li>Remedy staking supply defect</li><li>✓ Australian legal advice received</li></ul></div>
            <div className="road"><div className="phase">PHASE 2</div><h4>First trades</h4><ul><li>Registry on mainnet</li><li>Audited escrow</li><li>Pilot trades on GDN&apos;s desk</li><li>Inspector attestation format</li></ul></div>
            <div className="road"><div className="phase">PHASE 3</div><h4>Open corridors</h4><ul><li>Third-party traders</li><li>Financier registry checks</li><li>Verifier bonding in CLXT</li><li>Time-locked allocations</li></ul></div>
            <div className="road"><div className="phase">PHASE 4</div><h4>Network</h4><ul><li>Bonded arbitration panel</li><li>Enterprise integrations</li><li>Fee governance</li><li>More corridors</li></ul></div>
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section id="team" className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Team</span>
            <h2 className="h-section">Built around trade, not crypto cycles.</h2>
          </div>
          <div className="grid grid-3">
            <div className="card person"><div className="avatar">GD</div><div className="role">Founder &amp; CEO · Brisbane</div><h4>Guilherme Di Nardo</h4><p>Leads GDN Group&apos;s trading and advisory work across petroleum products, agricultural commodities and sovereign advisory engagements.</p></div>
            <div className="card person"><div className="avatar">TY</div><div className="role">Co-founder &amp; CTO</div><h4>Tom Young</h4><p>Leads smart-contract development and platform engineering across the token, presale and verification layers.</p></div>
            <div className="card person"><div className="avatar">FN</div><div className="role">United States · Orlando</div><h4>Fernando Nicola</h4><p>Commodity trading background with international energy trading houses, focused on North and Latin American markets.</p></div>
            <div className="card person"><div className="avatar">MD</div><div className="role">UAE &amp; Gulf · Dubai</div><h4>Mathew Dunn</h4><p>Leads Gulf relationships and blockchain integration for CrossLedger.</p></div>
            <div className="card person"><div className="avatar">MV</div><div className="role">Brazil &amp; South America · São Paulo</div><h4>Marcos &quot;Kito&quot; Vianna</h4><p>Over twenty years in trading, freight forwarding and port logistics across South America.</p></div>
            <Link href="/contact" className="card card-link"><div className="card-icon">{Icon.globe}</div><h3 className="h-card">Work with us</h3><p>Traders, inspectors, terminals and financiers interested in pilot trades: get in touch.</p><span className="more">Contact the team →</span></Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="section section-soft">
        <div className="container" style={{ maxWidth: 900 }}>
          <div className="section-head">
            <span className="eyebrow">FAQ</span>
            <h2 className="h-section">Straight answers.</h2>
          </div>
          <details className="faq" open><summary>What is CrossLedger?</summary><div className="answer"><p>Settlement infrastructure for cross-border commodity trade: a public registry of trade document fingerprints, a per-trade escrow that releases on verified documents and a signed inspection, and a dispute path. It is built by GDN Group, an Australian trade and advisory group, and is in development.</p></div></details>
          <details className="faq"><summary>Can I buy CLXT right now?</summary><div className="answer"><p>{CHECKOUT_UNAVAILABLE ? "Not yet. The first presale contract cannot complete purchases, so the checkout is paused. A corrected contract has been tested and will go live after deployment and a live test purchase. Do not send funds directly to any contract." : "Yes, from the presale widget on this page, unless you are in a restricted jurisdiction."}</p></div></details>
          <details className="faq"><summary>Did anyone lose money in the V1 presale?</summary><div className="answer"><p>No buyer funds can be taken by the defect. Purchase transactions revert, so the USDT never leaves the buyer&apos;s wallet; only the network fee for the failed transaction is spent.</p></div></details>
          <details className="faq"><summary>What are the presale prices?</summary><div className="answer"><p>The published plan is US$0.10, US$0.20, US$0.25 and US$0.50 across four stages. The contract sells at a single owner-set rate and does not enforce stages; the plan is a commitment by GDN. These are sale prices, not valuations, and CrossLedger publishes no listing or target price.</p></div></details>
          <details className="faq"><summary>What is the minimum purchase?</summary><div className="answer"><p>200 USDT, which buys 2,000 CLXT at Stage 1. The corrected contract enforces the minimum on-chain.</p></div></details>
          <details className="faq"><summary>Is the code audited?</summary><div className="answer"><p>No independent professional audit has been completed. Internal and AI-assisted reviews found the presale purchase defect and the staking supply-accounting issue, both disclosed on this page and in the whitepaper. An independent audit is required before the escrow handles third-party funds.</p></div></details>
          <details className="faq"><summary>What wallets work?</summary><div className="answer"><p>Any Ethereum wallet supporting WalletConnect, including MetaMask, Coinbase Wallet, Trust Wallet, Rainbow and Ledger. On mobile, open this site in your wallet&apos;s browser or scan the WalletConnect QR code.</p></div></details>
          <details className="faq"><summary>How is GDN regulated in Australia?</summary><div className="answer"><p>GDN Enterprise Pty Ltd is an Australian proprietary company registered with ASIC. It does not hold an Australian Financial Services Licence. GDN has received Australian legal advice and, on that advice, Australian residents may take part in the presale. Digital asset regulation in Australia is being reformed and the position may change.</p></div></details>
          <details className="faq"><summary>Who can take part?</summary><div className="answer"><p>CLXT is not offered to residents of the United States, Canada, China, North Korea, Iran, Syria, Cuba or other comprehensively sanctioned jurisdictions. The IP-based screen is not proof of residence, so confirming eligibility under your own law is your responsibility.</p></div></details>
          <details className="faq"><summary>What are the main risks?</summary><div className="answer"><p>Total loss, development risk, smart-contract risk (two defects already found, no independent audit yet), supply risk from the staking defect, concentration of supply in one owner address, regulatory change, and no guaranteed exchange listing. Read the <Link href="/whitepaper#risks">full risk factors</Link>.</p></div></details>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="section">
        <div className="container contact-grid">
          <div>
            <span className="eyebrow">Get in touch</span>
            <h2 className="h-section">Let&apos;s talk trade.</h2>
            <p className="lede" style={{ marginTop: 16 }}>Traders, inspectors, terminals, financiers and press: tell us what you need.</p>
            <dl className="dl">
              <dt>Email</dt><dd><a href={`mailto:${SITE.email}?subject=CrossLedger%20enquiry`}>{SITE.email}</a></dd>
              <dt>Office</dt><dd>{SITE.address}</dd>
              <dt>Hours</dt><dd>Monday to Friday, 9am to 5pm AEST</dd>
            </dl>
          </div>
          <form onSubmit={handleContactSubmit} className="form card">
            <div className="form-row">
              <label>First name<input type="text" name="firstName" autoComplete="given-name" required /></label>
              <label>Last name<input type="text" name="lastName" autoComplete="family-name" required /></label>
            </div>
            <div className="form-row">
              <label>Email<input type="email" name="email" autoComplete="email" required /></label>
              <label>Organisation<input type="text" name="organisation" autoComplete="organization" /></label>
            </div>
            <label>Enquiry type
              <select name="enquiryType" defaultValue="">
                <option value="" disabled>Select one…</option>
                <option>Trade or corridor partnership</option>
                <option>Inspector or terminal</option>
                <option>Token enquiry</option>
                <option>Press or media</option>
                <option>Security disclosure</option>
                <option>Other</option>
              </select>
            </label>
            <label>Message<textarea name="message" rows={5} required /></label>
            <button type="submit" className="btn btn-primary btn-lg" disabled={contactSending}>{contactSending ? "Sending…" : "Send enquiry"}</button>
            {contactStatus && <div className={`form-status ${contactStatus.kind === "error" ? "error" : ""}`} role="status">{contactStatus.text}</div>}
          </form>
        </div>
      </section>
    </Layout>
  );
}
