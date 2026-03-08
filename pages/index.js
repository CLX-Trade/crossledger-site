export default function Home() {
  const now = new Date();
  const presaleStart = new Date(now);
  presaleStart.setDate(now.getDate() + 1);
  presaleStart.setHours(0, 0, 0, 0);

  const countdownMs = Math.max(presaleStart.getTime() - now.getTime(), 0);
  const days = Math.floor(countdownMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((countdownMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((countdownMs / (1000 * 60)) % 60);

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
                CrossLedger Presale • Starts Tomorrow
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
                CrossLedger is built to modernise cross-border commodity trading by replacing paper-heavy workflows with smart escrow, verified digital documentation, immutable audit trails, and real-time transaction visibility. CLX powers transaction fees, escrow deposits, service payments, and selected premium platform functions.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="#presale"
                  className="rounded-2xl bg-cyan-400 px-6 py-3 font-medium text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:scale-[1.02]"
                >
                  Join Presale
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

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 lg:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Real Use of CLX</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Token utility tied to trade execution.</h2>
            <div className="mt-8 space-y-4">
              {[
                ['Escrow Deposits', 'CLX can be used inside smart escrow structures so trade funds stay locked until agreed milestones are validated.'],
                ['Transaction Fees', 'Participants can use CLX for platform fees and selected processing costs linked to digital trade execution.'],
                ['Document Validation', 'Digitised invoices, bills of lading, certificates, and compliance files can be hashed and referenced against blockchain records.'],
                ['Service Payments', 'Premium workflows, enterprise support, API modules, and future marketplace services can be paid for inside the ecosystem.'],
                ['Compliance Trail', 'Each completed transaction leaves an immutable ledger record that can support audit, financing, and dispute review.'],
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                  <div className="text-lg font-semibold text-white">{title}</div>
                  <div className="mt-2 text-sm leading-7 text-slate-300">{text}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 lg:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Trade Flow</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">How CrossLedger works in practice.</h2>
            <div className="mt-8 space-y-4">
              {[
                '1. Buyer and seller agree the trade on-platform.',
                '2. Smart escrow is opened using CLX or supported settlement rails.',
                '3. Trade documents are uploaded, digitally signed, and verified.',
                '4. Shipment tracking updates are pulled into the trade dashboard.',
                '5. Delivery, customs, and document milestones are validated.',
                '6. Smart contract releases payment and records final settlement.',
              ].map((step) => (
                <div key={step} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-slate-200">{step}</div>
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

      <section id="presale" className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-8 lg:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Presale</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Direct access to the CrossLedger presale starts tomorrow.</h2>
            <p className="mt-5 text-slate-300">
              Minimum participation is 300 USDT. The current campaign is structured in two stages: 20,000,000 CLX at $0.10 for fourteen days, followed by 2,000,000 CLX at $0.50. Always verify the wallet address and terms before sending any funds.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                ['Stage', 'Stage 1'],
                ['Minimum', '300 USDT'],
                ['Accepted', 'USDT Wallet Transfer'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="text-sm text-slate-400">{label}</div>
                  <div className="mt-2 text-xl font-semibold">{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
              A real wallet-connect sale flow, automatic token delivery, and public payment handling should only go live after smart contract development, independent security audit, jurisdiction checks, risk disclosures, and full legal review are complete.
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <h3 className="text-2xl font-semibold">Presale Checkout</h3>
            <div className="mt-4 rounded-2xl border border-cyan-400/30 bg-slate-900 p-4">
              <div className="text-sm text-slate-400">Official Presale Wallet</div>
              <div className="mt-2 break-all font-mono text-cyan-300">0x264c542adc1447e3a75af2b8e2c758d73e562571</div>
              <div className="mt-2 text-xs text-slate-400">Send a minimum of 300 USDT to participate in the presale. Always confirm the wallet address before sending funds.</div>
            </div>

            <form className="mt-6 space-y-4">
              <input className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 outline-none placeholder:text-slate-500" placeholder="Full name / entity name" />
              <input className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 outline-none placeholder:text-slate-500" placeholder="Email address" />
              <input className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 outline-none placeholder:text-slate-500" placeholder="Country / jurisdiction" />
              <input className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 outline-none placeholder:text-slate-500" placeholder="Trust Wallet address" />
              <input className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 outline-none placeholder:text-slate-500" placeholder="Intended purchase amount" />
              <button type="button" className="w-full rounded-2xl bg-cyan-400 px-5 py-3 font-medium text-slate-950 transition hover:scale-[1.01]">
                Continue to Presale
              </button>
            </form>

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
            <h2 className="mt-3 text-3xl font-semibold">Step-by-step with Trust Wallet.</h2>
            <div className="mt-6 space-y-4">
              {[
                'Download Trust Wallet and complete wallet setup securely.',
                'Buy or transfer USDT into your Trust Wallet.',
                'Copy the official CrossLedger presale wallet address exactly as shown.',
                'Send at least 300 USDT and keep the transaction hash for reference.',
                'Submit your details so your participation can be matched and confirmed.',
              ].map((step, index) => (
                <div key={step} className="flex gap-4 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-400 font-semibold text-slate-950">{index + 1}</div>
                  <div className="pt-2 text-slate-200">{step}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Recent Activity</p>
            <h2 className="mt-3 text-3xl font-semibold">Blockchain-linked transaction feed.</h2>
            <p className="mt-3 text-sm text-slate-400">Use a block explorer API or indexer endpoint to replace fallback preview rows with real on-chain transfers for the presale wallet.</p>
            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-xs text-slate-400">
              Suggested data source: Etherscan-compatible token transfer API or a blockchain indexer service. Endpoint to wire later: <span className="font-mono text-cyan-300">/api/presale-activity</span>
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

            <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 p-6">
              <div className="text-sm text-slate-400">Illustrative traction bars</div>
              <div className="mt-5 space-y-4">
                {[
                  ['Digital documents and verification', '88%'],
                  ['Escrow and settlement workflows', '76%'],
                  ['Regional corridor activation', '62%'],
                  ['Enterprise wallet and API expansion', '48%'],
                ].map(([label, width]) => (
                  <div key={label}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-slate-200">{label}</span>
                      <span className="text-slate-400">{width}</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 lg:p-12">
          <h2 className="text-3xl font-semibold">Important Notice</h2>
          <p className="mt-5 max-w-4xl text-sm leading-7 text-slate-300">
            Any live transaction feed must reflect actual blockchain data only. A real wallet-connect sale flow, public payment handling, and automatic token delivery should be implemented only after smart contract development, independent audit, legal review, jurisdiction screening, terms, privacy, and full compliance controls are complete. Nothing on this page should promise price appreciation, future returns, or performance.
          </p>
        </div>
      </section>
    </div>
  );
}
