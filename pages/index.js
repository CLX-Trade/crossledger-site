import { useMemo, useState } from 'react';

export default function Home() {
  const now = new Date();
  const presaleStart = new Date(now);
  presaleStart.setDate(now.getDate() + 1);
  presaleStart.setHours(0, 0, 0, 0);

  const countdownMs = Math.max(presaleStart.getTime() - now.getTime(), 0);
  const days = Math.floor(countdownMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((countdownMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((countdownMs / (1000 * 60)) % 60);

  const walletAddress = '0x7A92fe17ec50e705C28FB93BB201A8317fdC39A7';
  const stagePriceUsd = 0.1;
  const minimumUsd = 300;

  const [ethPrice, setEthPrice] = useState('3500');
  const [usdAmount, setUsdAmount] = useState('1000');
  const [copied, setCopied] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [buyerWallet, setBuyerWallet] = useState('');
  const [email, setEmail] = useState('');
  const [amountSent, setAmountSent] = useState('');
  const [txHash, setTxHash] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const fallbackActivity = [
    { buyer: '0x71...9ab4', amount: '12,500 USDT', status: 'Fallback preview' },
    { buyer: '0x93...1fd2', amount: '4,800 USDT', status: 'Fallback preview' },
    { buyer: '0x28...7ce1', amount: '18,200 USDT', status: 'Fallback preview' },
  ];

  const totalSupply = 1000000000;
  const currentCampaignTokens = 22000000;
  const stage1Tokens = 20000000;
  const stage2Tokens = 2000000;
  const stage1Price = 0.1;
  const stage2Price = 0.5;
  const stage1Raise = stage1Tokens * stage1Price;
  const stage2Raise = stage2Tokens * stage2Price;
  const campaignRaise = stage1Raise + stage2Raise;

  const allocationCards = [
    ['Presale & Launch Reserve', '22%', '220,000,000 CLX'],
    ['Ecosystem & Utility', '28%', '280,000,000 CLX'],
    ['Treasury', '18%', '180,000,000 CLX'],
    ['Liquidity', '12%', '120,000,000 CLX'],
    ['Team & Advisors', '10%', '100,000,000 CLX'],
    ['Marketing & Partnerships', '10%', '100,000,000 CLX'],
  ];

  const campaignMath = [
    ['Stage 1', '20,000,000 CLX', '$0.10', `$${stage1Raise.toLocaleString()}`],
    ['Stage 2', '2,000,000 CLX', '$0.50', `$${stage2Raise.toLocaleString()}`],
    ['Campaign Total', '22,000,000 CLX', 'Weighted', `$${campaignRaise.toLocaleString()}`],
  ];

  const calc = useMemo(() => {
    const usd = Number(usdAmount) || 0;
    const eth = Number(ethPrice) || 0;
    const clx = usd > 0 ? usd / stagePriceUsd : 0;
    const ethNeeded = eth > 0 ? usd / eth : 0;
    return { usd, eth, clx, ethNeeded };
  }, [usdAmount, ethPrice]);

  const copyWallet = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('No Ethereum wallet detected. Please open with MetaMask or another Ethereum wallet.');
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts?.[0]) {
        setWalletConnected(true);
        setBuyerWallet(accounts[0]);
      }
    } catch (error) {
      console.error(error);
      alert('Wallet connection was not completed.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-slate-950" />
        <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-sm text-cyan-200">
                CrossLedger Presale • Stage 1 Manual Allocation
              </div>

              <div className="mb-6 flex flex-wrap items-center gap-4">
                <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-5 py-3 text-2xl font-semibold tracking-tight">
                  CrossLedger
                </div>
                <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 text-2xl font-semibold tracking-tight text-cyan-300">
                  CLX
                </div>
              </div>

              <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
                Blockchain infrastructure for global trade settlement.
              </h1>

              <p className="mt-6 text-lg leading-8 text-slate-300">
                CrossLedger is built to modernise cross-border commodity trading by replacing paper-heavy workflows with smart escrow, verified digital documentation, immutable audit trails, and real-time transaction visibility. Stage 1 is currently being processed manually while the full contract-based presale and claim flow are finalised.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="#presale-panel"
                  className="rounded-2xl bg-cyan-400 px-6 py-3 font-medium text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:scale-[1.02]"
                >
                  Continue to Presale
                </a>
                <a
                  href="#tokenomics"
                  className="rounded-2xl border border-white/15 px-6 py-3 font-medium text-white transition hover:bg-white/5"
                >
                  View Tokenomics
                </a>
              </div>

              <p className="mt-4 text-sm text-slate-400">
                Designed around real international trading use cases including smart escrow, document verification, KYC/AML-linked validation, shipment tracking, settlement logging, and platform service payments.
              </p>
            </div>

            <div className="rounded-[2rem] border border-cyan-400/20 bg-white/5 p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur">
              <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">Countdown to Presale</div>
              <div className="mt-5 grid grid-cols-3 gap-4 text-center">
                {[
                  ['Days', String(days)],
                  ['Hours', String(hours)],
                  ['Minutes', String(minutes)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
                    <div className="text-3xl font-semibold sm:text-4xl">{value}</div>
                    <div className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">{label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/80 p-5">
                <div className="text-sm text-slate-400">Stage 1 • 14 Days</div>
                <div className="mt-2 text-2xl font-semibold">20,000,000 CLX at $0.10</div>
                <div className="mt-2 text-sm text-slate-400">Stage 1 raise target: ${stage1Raise.toLocaleString()}</div>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/80 p-5">
                <div className="text-sm text-slate-400">Stage 2</div>
                <div className="mt-2 text-2xl font-semibold">2,000,000 CLX at $0.50</div>
                <div className="mt-2 text-sm text-slate-400">Stage 2 raise target: ${stage2Raise.toLocaleString()}</div>
              </div>

              <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5">
                <div className="text-sm text-cyan-200">Current Campaign Raise Target</div>
                <div className="mt-2 text-3xl font-semibold">${campaignRaise.toLocaleString()}</div>
                <div className="mt-2 text-sm text-cyan-100/80">Structured from the current 22,000,000 CLX campaign allocation.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-6 md:grid-cols-4">
          {[
            ['Utility', 'Transaction fees, escrow deposits, service payments'],
            ['Validation', 'Digital documents, KYC/AML checks, audit trails'],
            ['Use Case', 'Commodity trades, SME finance workflows, smart settlement'],
            ['Launch Focus', 'Presale conversion, ecosystem traction, platform rollout'],
          ].map(([title, text]) => (
            <div key={title} className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20">
              <div className="text-sm font-medium text-cyan-300">{title}</div>
              <div className="mt-3 text-base text-slate-200">{text}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Why CrossLedger</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Built for the real friction points in international trade.</h2>
            <p className="mt-5 text-slate-300">
              Traditional trade still depends on fragmented intermediaries, costly manual checks, and slow paper-based approvals. CrossLedger brings buyers, sellers, and financiers into one connected environment where contracts, documents, tracking, escrow, and settlement can be viewed and validated in a single workflow.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-8">
            <div className="space-y-5">
              {[
                'Smart escrow holds funds until pre-set trade conditions are met',
                'Trade documents are digitised, hashed, and verified on-chain',
                'Shipment status can be linked through API or logistics integrations',
                'Completed trades create an immutable record for audits and finance partners',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-300" />
                  <p className="text-slate-200">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="tokenomics" className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 lg:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Tokenomics</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Supply, allocation, and campaign math.</h2>

          <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
              <div className="text-sm text-slate-400">Total Supply</div>
              <div className="mt-2 text-4xl font-semibold">{totalSupply.toLocaleString()} CLX</div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full w-[22%] rounded-full bg-cyan-400" />
              </div>
              <div className="mt-4 text-sm text-slate-400">Current two-stage campaign allocation</div>
              <div className="mt-2 text-2xl font-semibold">{currentCampaignTokens.toLocaleString()} CLX</div>
              <div className="mt-2 text-sm text-slate-500">This is 2.2% of total supply and sits inside the broader presale and launch reserve.</div>
              <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
                <div className="text-sm text-cyan-200">Launch Funding Goal</div>
                <div className="mt-2 text-3xl font-semibold">$3,000,000</div>
                <div className="mt-2 text-sm text-cyan-100/80">Calculated from Stage 1 and Stage 2 pricing and allocations below.</div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {allocationCards.map(([title, pct, amt]) => (
                <div key={title} className="rounded-3xl border border-white/10 bg-slate-900/70 p-5">
                  <div className="text-sm text-cyan-300">{title}</div>
                  <div className="mt-2 text-2xl font-semibold">{pct}</div>
                  <div className="mt-1 text-sm text-slate-400">{amt}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-3xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/90 text-slate-300">
                <tr>
                  <th className="px-5 py-4">Round</th>
                  <th className="px-5 py-4">Tokens</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">Raise</th>
                </tr>
              </thead>
              <tbody>
                {campaignMath.map(([round, tokens, price, raise]) => (
                  <tr key={round} className="border-t border-white/10 bg-slate-950/60">
                    <td className="px-5 py-4">{round}</td>
                    <td className="px-5 py-4">{tokens}</td>
                    <td className="px-5 py-4">{price}</td>
                    <td className="px-5 py-4">{raise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="presale-panel" className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-8 lg:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Presale</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Direct access to the CrossLedger presale.</h2>
            <p className="mt-5 text-slate-300">
              Stage 1 is currently processed manually using Ethereum. Connect your wallet, review the ETH send instructions, estimate your CLX allocation, and then submit your transaction details for verification.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                ['Stage', 'Stage 1'],
                ['Minimum', '$300 Equivalent'],
                ['Accepted', 'ETH on Ethereum'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="text-sm text-slate-400">{label}</div>
                  <div className="mt-2 text-xl font-semibold">{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/80 p-5">
              <div className="text-sm text-slate-400">Official ETH Wallet</div>
              <div className="mt-3 break-all font-mono text-cyan-300">{walletAddress}</div>
              <button
                type="button"
                onClick={copyWallet}
                className="mt-4 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-400/20"
              >
                {copied ? 'Wallet Copied' : 'Copy Wallet Address'}
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
              Stage 1 allocations are recorded manually. Token claim and automated contract flow will follow after the formal smart contract rollout is finalised.
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <h3 className="text-2xl font-semibold">Presale Checkout</h3>

            <button
              type="button"
              onClick={connectWallet}
              className="mt-4 w-full rounded-2xl bg-cyan-400 px-5 py-3 font-medium text-slate-950 transition hover:scale-[1.01]"
            >
              {walletConnected ? 'Wallet Connected' : 'Connect Wallet'}
            </button>

            <p className="mt-3 text-sm text-slate-400">
              {buyerWallet
                ? `Connected: ${buyerWallet}`
                : 'Connect your Ethereum wallet before submitting your details.'}
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <input
                value={ethPrice}
                onChange={(e) => setEthPrice(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 outline-none placeholder:text-slate-500"
                placeholder="ETH price in USD"
              />
              <input
                value={usdAmount}
                onChange={(e) => setUsdAmount(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 outline-none placeholder:text-slate-500"
                placeholder="USD purchase amount"
              />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <div className="text-sm text-slate-400">Estimated ETH</div>
                <div className="mt-2 text-xl font-semibold">{calc.ethNeeded.toFixed(6)} ETH</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <div className="text-sm text-slate-400">Estimated CLX</div>
                <div className="mt-2 text-xl font-semibold">
                  {calc.clx.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <div className="text-sm text-slate-400">Minimum Buy</div>
                <div className="mt-2 text-xl font-semibold">${minimumUsd}</div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <input
                value={buyerWallet}
                onChange={(e) => setBuyerWallet(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 outline-none placeholder:text-slate-500"
                placeholder="Your Ethereum wallet address"
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 outline-none placeholder:text-slate-500"
                placeholder="Email address"
              />
              <input
                value={amountSent}
                onChange={(e) => setAmountSent(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 outline-none placeholder:text-slate-500"
                placeholder="ETH amount sent"
              />
              <input
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 outline-none placeholder:text-slate-500"
                placeholder="Transaction hash"
              />
              <button
                type="submit"
                className="w-full rounded-2xl bg-cyan-400 px-5 py-3 font-medium text-slate-950 transition hover:scale-[1.01]"
              >
                Submit Presale Details
              </button>
            </form>

            {submitted && (
              <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm leading-6 text-emerald-100">
                Submission captured on-page. The next step is to connect this form to Formspree, Tally, Zapier, Airtable, or your own API so buyer details are saved automatically.
              </div>
            )}

            <p className="mt-4 text-xs leading-6 text-slate-400">
              By submitting a checkout request, the applicant acknowledges that eligibility may depend on jurisdiction, identity verification, source-of-funds review, sanctions screening, and other applicable compliance requirements.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">How to Participate</p>
            <h2 className="mt-3 text-3xl font-semibold">Step-by-step with Ethereum wallet.</h2>
            <div className="mt-6 space-y-4">
              {[
                'Connect your Ethereum wallet using the button in the presale section.',
                'Copy the official ETH wallet shown on this page.',
                'Send enough ETH to meet at least the minimum USD equivalent.',
                'Keep your transaction hash for reference.',
                'Submit your wallet, amount sent, email, and transaction hash for allocation review.',
              ].map((step, index) => (
                <div key={step} className="flex gap-4 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-400 font-semibold text-slate-950">
                    {index + 1}
                  </div>
                  <div className="pt-2 text-slate-200">{step}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Recent Activity</p>
            <h2 className="mt-3 text-3xl font-semibold">Blockchain-linked transaction feed.</h2>
            <p className="mt-3 text-sm text-slate-400">
              Use a block explorer API or indexer endpoint to replace fallback preview rows with real on-chain transfers for the presale wallet.
            </p>
            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-xs text-slate-400">
              Suggested data source: Etherscan-compatible API. Endpoint to wire later: <span className="font-mono text-cyan-300">/api/presale-activity</span>
            </div>

            <div className="mt-6 space-y-4">
              {fallbackActivity.map((tx) => (
                <div key={tx.buyer + tx.amount} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-mono text-cyan-300">{tx.buyer}</div>
                      <div className="mt-1 text-sm text-slate-400">{tx.status}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">{tx.amount}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">Fallback only</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Roadmap</p>
            <h2 className="mt-3 text-3xl font-semibold">Three phases of platform rollout.</h2>
            <div className="mt-6 space-y-4">
              {[
                ['Phase 1 • Presale & Core Build', 'Launch the CLX presale, finalise the wallet architecture, deploy the first CrossLedger trade dashboard, and prepare smart escrow plus verified digital documentation modules for pilot users.'],
                ['Phase 2 • Pilot Trade Corridors', 'Run pilot transactions across priority trade corridors such as Brazil, UAE, and Asia-focused routes, connect shipment tracking feeds, and validate KYC/AML-linked trade workflows with early counterparties.'],
                ['Phase 3 • Scale Network Effects', 'Expand into enterprise wallet tiers, API integrations, compliance tooling, service marketplace layers, and broader transaction volumes across commodity and SME trade flows.'],
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                  <div className="text-lg font-semibold text-white">{title}</div>
                  <div className="mt-2 text-sm leading-7 text-slate-300">{text}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Market Narrative</p>
            <h2 className="mt-3 text-3xl font-semibold">A digital layer for a massive trade market.</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                ['Global trade opportunity', '$32T'],
                ['Trade finance gap', '$2.5T'],
                ['Target model', '$50M–$500M GMV'],
                ['Core regions', 'APAC, Middle East, LATAM'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                  <div className="text-sm text-slate-400">{label}</div>
                  <div className="mt-2 text-2xl font-semibold">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 lg:p-12">
          <h2 className="text-3xl font-semibold">Important Notice</h2>
          <p className="mt-5 max-w-4xl text-sm leading-7 text-slate-300">
            Stage 1 is currently handled as a manual allocation round. Any future automated wallet-connect sale flow, public payment handling, or token claim system should only go live after smart contract development, testing, legal review, jurisdiction screening, terms, privacy, and full compliance controls are complete. Nothing on this page should promise price appreciation, future returns, or performance.
          </p>
        </div>
      </section>
    </div>
  );
}
