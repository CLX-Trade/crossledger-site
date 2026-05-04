

export default function HomePage() {

  /* ====== APPKIT + WAGMI ====== */

  const { open } = useAppKit();

  const { address, isConnected } = useAppKitAccount();

  const { connector } = useAccount();

  const chainId = useChainId();

  const { switchChainAsync } = useSwitchChain();

  const chainOk = chainId === mainnet.id;

  /* ====== CONTRACT READS (always-on via wagmi public client) ====== */

  // Presale state — runs on page load whether connected or not

  const { data: presaleReads } = useReadContracts({

    contracts: [

      { address: PRESALE_CONTRACT_ADDRESS, abi: PRESALE_ABI, functionName: "clxtPerUsdt" },

      { address: PRESALE_CONTRACT_ADDRESS, abi: PRESALE_ABI, functionName: "presaleActive" },

    ],

    query: { refetchInterval: 30_000 },

  });

  const clxtPerUsdt   = presaleReads?.[0]?.result ?? 10n;

  const presaleActive = presaleReads?.[1]?.result ?? true;

  // Wallet-specific reads — only run when connected

  const { data: usdtBalance, refetch: refetchBalance } = useReadContract({

    address: USDT_TOKEN_ADDRESS,

    abi: ERC20_ABI,

    functionName: "balanceOf",

    args: address ? [address] : undefined,

    query: { enabled: !!address && chainOk },

  });

  const { data: usdtAllowance, refetch: refetchAllowance } = useReadContract({

    address: USDT_TOKEN_ADDRESS,

    abi: ERC20_ABI,

    functionName: "allowance",

    args: address ? [address, PRESALE_CONTRACT_ADDRESS] : undefined,

    query: { enabled: !!address && chainOk },

  });

  /* ====== CONTRACT WRITES ====== */

  const { writeContractAsync: approveUSDT, data: approveTxHash, isPending: approving } = useWriteContract();

  const { isLoading: approveConfirming, isSuccess: approveConfirmed } = useWaitForTransactionReceipt({ hash: approveTxHash });

  const { writeContractAsync: buyCLXT, data: buyTxHash, isPending: buying } = useWriteContract();

  const { isLoading: buyConfirming, isSuccess: buyConfirmed } = useWaitForTransactionReceipt({ hash: buyTxHash });

  /* ====== UI STATE ====== */

  const [usdtAmount, setUsdtAmount]               = useState("");

  const [tosChecked, setTosChecked]               = useState(false);

  const [statusMsg, setStatusMsg]                 = useState(null); // {kind, html}

  const [contactStatus, setContactStatus]         = useState(null);

  const [contactSending, setContactSending]       = useState(false);

  /* ====== AFTER-CONFIRMATION REFETCHES ====== */

  useEffect(() => {

    if (approveConfirmed) {

      setMsg("info", "<strong>USDT approved.</strong> You can now click Buy CLXT to commit the purchase.");

      refetchAllowance();

      refetchBalance();

    }

  }, [approveConfirmed]); // eslint-disable-line

  useEffect(() => {

    if (buyConfirmed && buyTxHash) {

      const v = parseFloat(usdtAmount) || 0;

      const clxtReceived = (v * Number(clxtPerUsdt)).toLocaleString("en-US");

      setMsg(

        "info",

        `<strong>Purchase confirmed.</strong> ${clxtReceived} CLXT sent to your wallet. <a href="https://etherscan.io/tx/${buyTxHash}" target="_blank" rel="noopener">View transaction ↗</a>`

      );

      setUsdtAmount("");

      refetchBalance();

      refetchAllowance();

    }

  }, [buyConfirmed]); // eslint-disable-line

  /* ====== DERIVED ====== */

  const displayPrice = useMemo(() => {

    const r = Number(clxtPerUsdt);

    if (r <= 0) return "—";

    return "US$" + (1 / r).toFixed(2);

  }, [clxtPerUsdt]);

  const amountValid = useMemo(() => {

    const v = parseFloat(usdtAmount);

    return v && v >= MIN_PURCHASE_USD;

  }, [usdtAmount]);

  const amountWei = useMemo(() => {

    if (!amountValid) return 0n;

    try { return parseUnits(String(usdtAmount), 6); } catch { return 0n; }

  }, [usdtAmount, amountValid]);

  const estimatedClxt = useMemo(() => {

    const v = parseFloat(usdtAmount);

    if (!v || v <= 0) return "—";

    const clxt = v * Number(clxtPerUsdt);

    return clxt.toLocaleString("en-US", { maximumFractionDigits: 0 }) + " CLXT";

  }, [usdtAmount, clxtPerUsdt]);

  const hasBalance   = amountValid && (usdtBalance ?? 0n) >= amountWei;

  const hasAllowance = amountValid && (usdtAllowance ?? 0n) >= amountWei;

  const pending      = approving || approveConfirming || buying || buyConfirming;

  /* ====== HELPERS ====== */

  const setMsg = (kind, html) => setStatusMsg(html ? { kind, html } : null);

  const shortAddr = (a) => a ? a.slice(0, 6) + "…" + a.slice(-4) : "";

  const fmtUsdt = (n) => {

    if (n === undefined || n === null) return "—";

    return parseFloat(formatUnits(n, 6)).toLocaleString("en-US", { maximumFractionDigits: 2 }) + " USDT";

  };

  /* ====== ACTIONS ====== */

  async function connectWallet() {

    // Opens Reown AppKit modal — supports MetaMask extension, WalletConnect QR for mobile,

    // Coinbase Wallet, and dozens of other wallets via deep linking.

    open();

  }

  async function switchToMainnet() {

    try {

      await switchChainAsync({ chainId: mainnet.id });

    } catch (e) {

      setMsg("error", "Could not switch network: " + (e.shortMessage || e.message));

    }

  }

  async function handleApproveUSDT() {

    if (!amountValid || !hasBalance || pending) return;

    setMsg("info", "Confirm the USDT approval in your wallet…");

    try {

      const hash = await approveUSDT({

        address: USDT_TOKEN_ADDRESS,

        abi: ERC20_ABI,

        functionName: "approve",

        args: [PRESALE_CONTRACT_ADDRESS, amountWei],

      });

      setMsg("info", `Approval submitted: <a href="https://etherscan.io/tx/${hash}" target="_blank" rel="noopener">${shortAddr(hash)} ↗</a>`);

    } catch (e) {

      console.error("approve failed", e);

      const m = e.shortMessage || e.message || "Unknown error";

      const friendly = (e.code === "ACTION_REJECTED" || /rejected|denied/i.test(m)) ? "Approval cancelled." : m;

      setMsg("error", "<strong>Approval failed.</strong> " + friendly);

    }

  }

  async function handleBuy() {

    if (!amountValid || !hasBalance || !hasAllowance || pending) return;

    setMsg("info", "Confirm the purchase in your wallet…");

    try {

      const hash = await buyCLXT({

        address: PRESALE_CONTRACT_ADDRESS,

        abi: PRESALE_ABI,

        functionName: "buyWithUSDT",

        args: [amountWei],

      });

      setMsg("info", `Purchase submitted: <a href="https://etherscan.io/tx/${hash}" target="_blank" rel="noopener">${shortAddr(hash)} ↗</a>`);

    } catch (e) {

      console.error("buy failed", e);

      let m = e.shortMessage || e.message || "Unknown error";

      if (e.code === "ACTION_REJECTED" || /rejected|denied/i.test(m)) m = "Purchase cancelled.";

      else if (m.includes("Presale not active")) m = "The presale has been paused.";

      else if (m.includes("Insufficient CLXT")) m = "The presale contract is out of CLXT for this stage.";

      else if (m.includes("USDT transfer failed")) m = "USDT transfer failed — check your USDT balance and approval.";

      setMsg("error", "<strong>Purchase failed.</strong> " + m);

    }

  }

  async function handleContactSubmit(e) {

    e.preventDefault();

    if (contactSending) return;

    setContactSending(true);

    setContactStatus(null);

    const form = e.currentTarget;

    const data = new FormData(form);

    try {

      const res = await fetch(FORMSPREE_ENDPOINT, {

        method: "POST",

        body: data,

        headers: { Accept: "application/json" },

      });

      if (res.ok) {

        setContactStatus({ kind: "info", text: "Thanks — your message has been sent. We'll be in touch within two business days." });

        form.reset();

      } else {

        setContactStatus({ kind: "error", text: "Could not send. Please try again or email hello@crossledger.trade." });

      }

    } catch {

      setContactStatus({ kind: "error", text: "Could not send. Please check your connection and try again." });

    } finally {

      setContactSending(false);

    }

  }

  /* ====== BUTTON STATE MACHINE ====== */

  const buttonState = useMemo(() => {

    if (!isConnected) {

      return { left: "Connect Wallet", leftAction: connectWallet, leftDisabled: false, right: "Buy CLXT", rightDisabled: true };

    }

    if (!chainOk) {

      return { left: "Switch to Ethereum", leftAction: switchToMainnet, leftDisabled: false, right: "Buy CLXT", rightDisabled: true };

    }

    if (!presaleActive) {

      return { left: "Presale Paused", leftDisabled: true, right: "Buy CLXT", rightDisabled: true };

    }

    if (!tosChecked || !amountValid || !hasBalance) {

      return { left: "Approve USDT", leftDisabled: true, right: "Buy CLXT", rightDisabled: true };

    }

    if (!hasAllowance) {

      return {

        left: approving ? "Awaiting wallet…" : approveConfirming ? "Approving…" : "Approve USDT",

        leftAction: handleApproveUSDT,

        leftDisabled: pending,

        right: "Buy CLXT",

        rightDisabled: true,

      };

    }

    return {

      left: "✓ USDT Approved",

      leftDisabled: true,

      right: buying ? "Awaiting wallet…" : buyConfirming ? "Buying…" : "Buy CLXT",

      rightAction: handleBuy,

      rightDisabled: pending,

    };

  }, [isConnected, chainOk, presaleActive, tosChecked, amountValid, hasBalance, hasAllowance, approving, approveConfirming, buying, buyConfirming, pending]);

  /* ====== WALLET STATUS DISPLAY ====== */

  const walletStatusText = !isConnected

    ? "Not connected"

    : !chainOk

      ? `${shortAddr(address)} · Wrong network`

      : shortAddr(address);

  const walletStatusClass = !isConnected

    ? "muted"

    : !chainOk

      ? "warn"

      : "success";

  /* ====== RENDER ====== */

  return (

    <>

      <Head>

        <title>CrossLedger (CLXT) — Trade Infrastructure by GDN Group | Presale Live</title>

        <meta name="description" content="CrossLedger is a blockchain-anchored settlement platform purpose-built for cross-border commodity trade. Built by GDN Group. CLXT presale Stage 1 live on Ethereum mainnet at US$0.10." />

        <meta property="og:title" content="CrossLedger (CLXT) — Trade Infrastructure by GDN Group" />

        <meta property="og:description" content="Smart contract infrastructure for real-world commodity transactions. CLXT presale Stage 1 live on Ethereum mainnet." />

        <meta property="og:image" content="/clxt-hero.png" />

        <meta name="twitter:card" content="summary_large_image" />

      </Head>

      <div className="meta-strip">

        <div className="wrap">

          <div className="geo"><span>BRISBANE</span>·<span>DUBAI</span>·<span>ORLANDO</span>·<span>SÃO PAULO</span></div>

          <div>EST. 2014 · ACN 666 495 263</div>

        </div>

      </div>

      <nav className="nav-bar">

        <div className="wrap">

          <a href="#" className="logo">

            <span className="mark">CrossLedger</span>

            <span className="sub">A GDN Group Product</span>

          </a>

          <div className="nav-links">

            <a href="https://gdngroup.com.au">GDN Group</a>

            <a href="#problem">Problem</a>

            <a href="#token">Token</a>

            <a href="#corridors">Corridors</a>

            <a href="#security">Security</a>

            <a href="#faq">FAQ</a>

            <a href="#presale" className="btn-primary">Buy CLXT →</a>

          </div>

        </div>

      </nav>

      <div className="status-bar">

        <div className="wrap">

          <div className="left">

            <span className="dot"></span>

            <span>CrossLedger Presale · Stage 1 of 4 · Live on Ethereum at {displayPrice}</span>

          </div>

          <a href="#presale">View live contract →</a>

        </div>

      </div>

      <section className="hero">

        <div className="wrap hero-wrap">

          <div>

            <div className="hero-eyebrow">CROSSLEDGER · INFRASTRUCTURE · BUILT BY GDN GROUP</div>

            <h1 className="h-display">Settlement infrastructure for cross-border commodity trade.</h1>

            <p className="hero-lede">A blockchain-anchored platform purpose-built by GDN Group to modernise the world&apos;s commodity corridors. Smart escrow, verified documentation, real-time visibility, and token-enabled settlement. CLXT presale Stage 1 live on Ethereum mainnet.</p>

            <div className="hero-actions">

              <a href="#presale" className="btn-primary">Enter presale</a>

              <a href="#token" className="btn-link">Platform overview →</a>

            </div>

          </div>

          <div>

            {/* eslint-disable-next-line @next/next/no-img-element */}

            <img src="/clxt-hero.png" alt="CrossLedger CLXT — verified smart contract on Ethereum, smart contract infrastructure for real-world commodity transactions" className="hero-image" />

          </div>

        </div>

      </section>

      <section className="cream tight">

        <div className="wrap">

          <div className="hero-stats">

            <div className="hero-stat"><div className="v">US$18T</div><div className="l">Annual global trade</div></div>

            <div className="hero-stat"><div className="v">US$2.5T</div><div className="l">Trade-finance gap</div></div>

            <div className="hero-stat"><div className="v">5–14 days</div><div className="l">Typical settlement</div></div>

            <div className="hero-stat"><div className="v">60–80%</div><div className="l">Target cost reduction</div></div>

          </div>

        </div>

      </section>

      <section id="problem" className="cream-deep">

        <div className="wrap">

          <div className="eyebrow">THE PROBLEM</div>

          <h2 className="h-section" style={{ marginBottom: 24, maxWidth: "24ch" }}>Global commodity trade is broken.</h2>

          <p className="lede">Cross-border commodity transactions still depend on paper letters of credit, manual verification across four or more banking intermediaries, and settlement windows of 5 to 14 business days. The result is friction at every step — and exporters in emerging markets pay the heaviest price.</p>

          <div className="ps-grid">

            <div className="ps-block problem">

              <h3 className="h-block">The friction today.</h3>

              <ul className="ps-list">

                <li>Fraud risk from unverified trade documentation and paper-based bills of lading.</li>

                <li>Slow, expensive letter-of-credit settlement across 4+ institutions.</li>

                <li>No real-time supply-chain visibility for exporters, financiers, or buyers.</li>

                <li>High counterparty risk for buyers and sellers in cross-border deals.</li>

                <li>SMEs in developing Asia face a US$2.5T trade-finance gap; ~40% rejection rate.</li>

              </ul>

            </div>

            <div className="ps-block solution">

              <h3 className="h-block">The CrossLedger solution.</h3>

              <ul className="ps-list">

                <li>On-chain verification of SGS certificates, bills of lading, and trade documents.</li>

                <li>Smart escrow: funds released automatically when delivery conditions are met.</li>

                <li>Real-time supply-chain visibility for every participant in the trade.</li>

                <li>Settlement reduced from days to hours — measured against confirmed delivery.</li>

                <li>CLXT unlocks platform tiers, fee discounts, and trade-credit incentives.</li>

              </ul>

            </div>

          </div>

        </div>

      </section>

      <section className="white tight">

        <div className="wrap">

          <div className="eyebrow">MARKET CONTEXT</div>

          <h2 className="h-section" style={{ marginBottom: 32, maxWidth: "28ch" }}>A measurable opportunity at the intersection of three structural gaps.</h2>

          <div className="context-grid">

            <div className="context-cell">

              <div className="num">40%</div>

              <div className="lab">ASIA-PACIFIC TRADE SHARE</div>

              <div className="desc">Asia-Pacific accounts for ~40% of global merchandise trade. Intra-regional flows alone exceed US$2T annually — and remain documentarily analogue.</div>

            </div>

            <div className="context-cell">

              <div className="num">40%</div>

              <div className="lab">SME REJECTION RATE</div>

              <div className="desc">Asian Development Bank data: 40% of rejected trade-finance applications come from SMEs in developing Asia. CrossLedger targets this segment directly.</div>

            </div>

            <div className="context-cell">

              <div className="num">7+</div>

              <div className="lab">INTERMEDIARIES PER SHIPMENT</div>

              <div className="desc">A typical bulk-commodity transaction touches shipping, customs, insurance, and four+ banks. Each step is a reconciliation cost we collapse on-chain.</div>

            </div>

          </div>

        </div>

      </section>

      <section id="token" className="navy">

        <div className="wrap">

          <div className="purchase">

            <div>

              <div className="eyebrow">STAGE 1 PRESALE · USDT ON ETHEREUM</div>

              <h2 className="h-section">Direct-send purchase. Tokens land on confirmation.</h2>

              <p>The CrossLedger presale is live on the Ethereum mainnet through a verified, publicly-readable smart contract. Purchases are made in USDT — CLXT transfers to your wallet within the same transaction. No claim portal, no waiting period, no intermediaries.</p>

              <div className="quick-stats">

                <div><div className="l">Stage 1 Price</div><div className="v gold-text">{displayPrice}</div></div>

                <div><div className="l">Stage</div><div className="v">1 of 4</div></div>

                <div><div className="l">Token</div><div className="v">CLXT (ERC-20)</div></div>

                <div><div className="l">Network</div><div className="v">Ethereum</div></div>

              </div>

              <div className="steps">

                <div className="step"><div className="n">01</div><h4>Connect wallet</h4><p>MetaMask, WalletConnect, Coinbase Wallet, Trust, Rainbow — desktop or mobile.</p></div>

                <div className="step"><div className="n">02</div><h4>Approve USDT</h4><p>Authorise the presale contract to spend your USDT.</p></div>

                <div className="step"><div className="n">03</div><h4>Commit purchase</h4><p>Calls <code className="mono">buyWithUSDT</code> on the verified contract.</p></div>

                <div className="step"><div className="n">04</div><h4>Receive CLXT</h4><p>Tokens transfer to your wallet in the same transaction.</p></div>

              </div>

            </div>

            <div id="presale" className="widget">

              <h3>Buy CLXT</h3>

              <div className="sub">STAGE 1 ACTIVE · USDT ON ETHEREUM</div>

              <div className="row"><span className="k">Current Price</span><span className="v acc">{displayPrice}</span></div>

              <div className="row"><span className="k">Stage</span><span className="v">1 of 4</span></div>

              <div className="row"><span className="k">Minimum Purchase</span><span className="v">{MIN_PURCHASE_USD} USDT</span></div>

              <div className="row"><span className="k">Wallet Status</span><span className={`v ${walletStatusClass}`}>{walletStatusText}</span></div>

              <div className="row"><span className="k">USDT Balance</span><span className="v">{isConnected && chainOk ? fmtUsdt(usdtBalance) : "—"}</span></div>

              <div className="row"><span className="k">Approved Allowance</span><span className="v">{isConnected && chainOk ? fmtUsdt(usdtAllowance) : "—"}</span></div>

              <div className="pills">

                {[200, 500, 1000, 2500].map(amt => (

                  <button key={amt} type="button" onClick={() => setUsdtAmount(String(amt))}>{amt}</button>

                ))}

              </div>

              <div className="input-row">

                <input

                  type="number"

                  placeholder="Amount in USDT"

                  min="0"

                  step="any"

                  value={usdtAmount}

                  onChange={(e) => setUsdtAmount(e.target.value)}

                />

              </div>

              <div className="row"><span className="k">Estimated CLXT</span><span className="v">{estimatedClxt}</span></div>

              <div className="tos">

                <label>

                  <input

                    type="checkbox"

                    checked={tosChecked}

                    onChange={(e) => setTosChecked(e.target.checked)}

                  />

                  <span>I have read and accept the <a href="#risk">Risk Disclosure</a> and <a href="#security">Jurisdictional Restrictions</a>. I confirm I am not a resident of a restricted jurisdiction and am participating with funds I can afford to lose.</span>

                </label>

              </div>

              <div className="actions">

                <button

                  type="button"

                  className="approve"

                  onClick={buttonState.leftAction}

                  disabled={buttonState.leftDisabled}

                >

                  {buttonState.left}

                </button>

                <button

                  type="button"

                  className="buy"

                  onClick={buttonState.rightAction}

                  disabled={buttonState.rightDisabled}

                >

                  {buttonState.right}

                </button>

              </div>

              {statusMsg && (

                <div className={`widget-msg ${statusMsg.kind}`} dangerouslySetInnerHTML={{ __html: statusMsg.html }} />

              )}

              <div className="widget-note">

                ✓ Tokens sent directly to your wallet on purchase — no claim step required.<br />

                ✓ Works on desktop (MetaMask) and mobile (WalletConnect QR scan).<br />

                ⚠ All transactions are final. Presale tokens are non-refundable.

              </div>

            </div>

          </div>

        </div>

      </section>

      <section className="cream-deep">

        <div className="wrap">

          <div className="eyebrow">PRESALE STAGES</div>

          <h2 className="h-section" style={{ marginBottom: 24, maxWidth: "24ch" }}>A staged price ladder. Hard caps at every step.</h2>

          <p className="lede">Each stage carries a fixed price and a dedicated allocation. When a stage caps out, the contract advances. Earlier participants benefit from the lower entry; later participants buy into a more developed platform. The reference listing price is indicative, not guaranteed.</p>

          <div className="ladder">

            <div className="ladder-row head"><div>Stage</div><div>Round</div><div>Price (USD)</div><div>vs Stage 1</div><div>Allocation Cap</div></div>

            {PRESALE_STAGES.map((s, i) => (

              <div key={i} className={`ladder-row ${s.live ? "live" : ""} ${s.target ? "target" : ""}`}>

                <div className="stage-n">{s.stage}</div>

                <div className="stage-name">{s.name}{s.live && <span className="b">LIVE</span>}</div>

                <div className="pr">{s.price}</div>

                <div className="dl">{s.delta}</div>

                <div className="cap">{s.cap}</div>

              </div>

            ))}

          </div>

          <p className="ladder-note">The Listing Reference is an indicative target tied to platform progress, market conditions, and final tokenomics at the time of DEX listing. It is not a guarantee of value and should not be interpreted as a forecast of future market price. Stage allocations are subject to adjustment by the contract operator before a stage opens; once a stage is live, its parameters are immutable.</p>

        </div>

      </section>

      <section className="cream">

        <div className="wrap">

          <div className="eyebrow">TOKEN ALLOCATION</div>

          <h2 className="h-section" style={{ marginBottom: 24, maxWidth: "26ch" }}>Structured for adoption. Weighted toward the ecosystem.</h2>

          <p className="lede">Total CLXT supply is fixed at 1 billion tokens at issuance. Allocations are weighted toward ecosystem incentives and treasury / compliance reserves — the buckets that fund real platform usage and underpin regulatory readiness. Vesting schedules will be published in the technical addendum prior to Stage 4 close.</p>

          <div className="alloc-grid">

            {TOKEN_ALLOCATION.map((a, i) => (

              <div key={i} className="alloc-cell">

                <div className="pct">{a.percent}</div>

                <h4>{a.title}</h4>

                <p>{a.desc}</p>

              </div>

            ))}

          </div>

        </div>

      </section>

      <section className="white tight">

        <div className="wrap">

          <div className="eyebrow">CROSSLEDGER VS TRADITIONAL</div>

          <h2 className="h-section" style={{ marginBottom: 24, maxWidth: "24ch" }}>A like-for-like comparison.</h2>

          <p className="lede">Mid-market exporters are the audience. They move enough volume to feel correspondent-banking friction, but not enough to access prime-bank rates. The arithmetic is what makes the platform inevitable for them.</p>

          <div className="compare">

            <table>

              <thead><tr><th>Variable</th><th>Traditional Trade Finance</th><th className="cl">CrossLedger</th></tr></thead>

              <tbody>

                <tr><td>Settlement window</td><td className="dim">5 – 14 business days</td><td className="cl">Hours after delivery confirmation</td></tr>

                <tr><td>Letter-of-credit cost</td><td className="dim">1.0 – 3.0% of transaction value</td><td className="cl">0.2 – 0.4% in platform fees (CLXT-discounted)</td></tr>

                <tr><td>Document reconciliation</td><td className="dim">Manual across 4+ institutions</td><td className="cl">Single shared on-chain record</td></tr>

                <tr><td>SME accessibility</td><td className="dim">~40% rejection rate (ADB data)</td><td className="cl">Open to verified KYC&apos;d participants</td></tr>

                <tr><td>Counterparty risk</td><td className="dim">Bank credit-risk dependent</td><td className="cl">Smart-escrow + oracle delivery proof</td></tr>

                <tr><td>Audit trail</td><td className="dim">Fragmented, paper-based</td><td className="cl">Immutable, public on Ethereum</td></tr>

                <tr><td>Dispute resolution</td><td className="dim">Litigation, weeks to months</td><td className="cl">Staked verifier arbitration, days</td></tr>

              </tbody>

            </table>

          </div>

        </div>

      </section>

      <section id="corridors" className="cream-deep">

        <div className="wrap">

          <div className="eyebrow">TRADE CORRIDORS</div>

          <h2 className="h-section" style={{ marginBottom: 24, maxWidth: "26ch" }}>Three live target corridors at platform launch.</h2>

          <p className="lede">CrossLedger is built around real trade routes — not theoretical use cases. Each corridor below has been selected for the friction it removes and the strength of partner conversations underway through GDN Group&apos;s existing trade desk.</p>

          <div className="card-grid">

            <div className="card">

              <div className="tag">AUSTRALIA ⟶ ASIA</div>

              <h4>Bulk commodity export financing</h4>

              <p>EN590 diesel, ICUMSA 45 sugar, iron ore and LNG flows from Australian ports to South Korea, Japan, and Vietnam. Mid-tier exporters currently absorb 1.5–2.5% in trade-finance costs the platform compresses to under 0.5%.</p>

            </div>

            <div className="card">

              <div className="tag">EAST AFRICA ⟶ EU</div>

              <h4>Specialty agricultural exports</h4>

              <p>Ethiopian coffee, Kenyan tea, Tanzanian cashews, and halal poultry to European processors. Smallholder cooperatives currently wait 30+ days for payment; smart escrow targets payment within 24 hours of delivery.</p>

            </div>

            <div className="card">

              <div className="tag">SOUTH AMERICA ⟶ ASIA</div>

              <h4>Energy and metals logistics</h4>

              <p>Lithium concentrate, copper cathode, bioethanol and ICUMSA 45 sugar from Chile, Peru, and Brazil into Asia-Pacific processors. Pricing volatility makes oracle-verified milestone settlement particularly valuable here.</p>

            </div>

          </div>

        </div>

      </section>

      <section className="navy">

        <div className="wrap">

          <div className="eyebrow">ROADMAP</div>

          <h2 className="h-section" style={{ marginBottom: 24, maxWidth: "24ch" }}>Four phases. Sequenced to credibility.</h2>

          <p className="lede">Each phase produces verifiable artefacts before the next opens. Phase 1 establishes the token-holder foundation; Phase 4 is the commercially-deployed network operating at scale across GDN Group&apos;s existing corridors.</p>

          <div className="road-grid">

            <div className="road-cell active"><div className="num">PHASE 01 · IN PROGRESS</div><h4>Token Launch &amp; Presale</h4><p>Brand, four-stage public presale, wallet integration, smart-contract deployment, audit engagement, and early community formation.</p></div>

            <div className="road-cell"><div className="num">PHASE 02</div><h4>Trade Validation Platform</h4><p>Document workflows, escrow logic, oracle integrations, delivery-confirmation rails, and pilot transactions on the first two corridors.</p></div>

            <div className="road-cell"><div className="num">PHASE 03</div><h4>Verification &amp; Operations</h4><p>Verifier-node onboarding, dispute arbitration go-live, exchange listing process, and corridor expansion from pilot to production.</p></div>

            <div className="road-cell"><div className="num">PHASE 04</div><h4>Global Commodity Network</h4><p>Network scaling, enterprise commercial agreements, partnership integrations, and progressive decentralisation toward governance.</p></div>

          </div>

        </div>

      </section>

      <section id="security" className="cream">

        <div className="wrap">

          <div className="eyebrow">SECURITY &amp; COMPLIANCE</div>

          <h2 className="h-section" style={{ marginBottom: 24, maxWidth: "26ch" }}>Verifiable on-chain. Operating in good faith offline.</h2>

          <p className="lede">Smart-contract security and regulatory positioning are not optional. Below is an honest, current statement of where CrossLedger sits on both — what is live, what is in progress, and what is queued for completion before commercial launch.</p>

          <div className="sec-grid">

            <div className="sec-cell"><span className="tag pending">AUDIT · IN ENGAGEMENT</span><h4>Smart Contract Audit</h4><p>Audit engagement under negotiation with an Australian-based independent security firm with prior protocol-level work on Sushi, Gala, and Redbelly Network. Pre-audit code is publicly verifiable on Etherscan now; the formal audit report will be published prior to Stage 2 opening.</p><div className="meta">Engagement target: Q2 2025 · Publication: prior to Stage 2 close</div></div>

            <div className="sec-cell"><span className="tag live">CONTRACTS · VERIFIED</span><h4>On-Chain Transparency</h4><p>The presale contract and CLXT token contract are both deployed and verified on Ethereum mainnet. Source code, ABIs, and full transaction history are visible on Etherscan. No upgradeable proxies, no admin mint backdoors, no transfer pause functions.</p><div className="meta"><a href={`https://etherscan.io/address/${PRESALE_CONTRACT_ADDRESS}`}>Presale ↗</a> · <a href={`https://etherscan.io/address/${CLX_TOKEN_ADDRESS}`}>Token ↗</a></div></div>

            <div className="sec-cell"><span className="tag pending">REGULATORY · AUSTRALIA</span><h4>Australian Regulatory Position</h4><p>GDN Enterprise Pty Ltd (ACN 666 495 263) operates from Queensland under ASIC&apos;s transitional sector-wide no-action position (in effect to 30 June 2026) while the Digital Assets Framework regime is implemented. AUSTRAC scope and AML/CTF programme requirements are under review with Australian counsel.</p><div className="meta">Memo: under review · ACN 666 495 263</div></div>

            <div className="sec-cell"><span className="tag">KYC · AVAILABLE</span><h4>Buyer KYC (Threshold-Based)</h4><p>Identity verification is required for purchases above platform thresholds and for participants requesting allocation outside standard public-stage pricing. KYC is processed through a regulated third-party provider; data is segregated from the smart-contract layer.</p><div className="meta">Threshold disclosure published with Stage 2 opening</div></div>

            <div className="sec-cell"><span className="tag pending">LIQUIDITY · LOCK PLANNED</span><h4>Liquidity Lock at TGE</h4><p>The 10% Exchange &amp; Liquidity allocation will be deployed into a DEX liquidity pool at the Token Generation Event and locked through a third-party time-lock contract. Lock duration and provider will be disclosed prior to TGE.</p><div className="meta">TGE-gated · Public lock receipt</div></div>

            <div className="sec-cell"><span className="tag live">BUG BOUNTY · OPEN</span><h4>Vulnerability Disclosure</h4><p>Security researchers are invited to submit findings through the contact form below. Reproducible vulnerabilities in the deployed presale or token contracts are eligible for CLXT bounty rewards graded by severity, with high-severity findings reviewed within 48 hours.</p><div className="meta">Contact: security report via form below</div></div>

          </div>

          <div className="restrict">

            <h4>Jurisdictional Restrictions</h4>

            <p>CLXT is <strong>not offered</strong> to residents of: the United States of America, Canada, the People&apos;s Republic of China, the Democratic People&apos;s Republic of Korea, the Islamic Republic of Iran, Syrian Arab Republic, Cuba, and any other jurisdiction subject to comprehensive sanctions or where such offering would require registration or licensing not currently held by GDN Enterprise Pty Ltd. Geo-IP screening is enforced at the purchase flow, but it remains the participant&apos;s responsibility to confirm eligibility under their own jurisdiction&apos;s rules. This list is subject to expansion based on final legal review.</p>

          </div>

        </div>

      </section>

      <section id="team" className="cream-deep">

        <div className="wrap">

          <div className="eyebrow">LEADERSHIP</div>

          <h2 className="h-section" style={{ marginBottom: 24, maxWidth: "26ch" }}>A founding team built around trade, not crypto cycles.</h2>

          <p className="lede">CrossLedger is led by GDN Group&apos;s commercial leadership and the technical team responsible for the platform&apos;s smart-contract and infrastructure layer. Backed by the broader GDN Group bench across Brisbane, Dubai, Orlando and São Paulo.</p>

          <div className="team-grid">

            <div className="team-cell">

              <div className="role">CHIEF EXECUTIVE OFFICER · BRISBANE</div>

              <h4>Guilherme Di Nardo</h4>

              <p>Guilherme leads GDN Group&apos;s commercial and advisory operations and serves as Co-Founder and CEO of CrossLedger. Over a decade of international trade and investment experience across petroleum product trading, agricultural commodity markets, and sovereign advisory — including sovereign nations sugar industry revitalisation and agricultural infrastructure projects.</p>

              <div className="skills"><span className="skill">International Trade</span><span className="skill">Commodity Markets</span><span className="skill">Sovereign Advisory</span></div>

            </div>

            <div className="team-cell">

              <div className="role">U.S. COMMERCIAL REPRESENTATIVE · ORLANDO</div>

              <h4>Fernando Nicola</h4>

              <p>Fernando brings deep commodity trading experience from major international energy trading houses including Vitol and Cockett Group, with a primary focus on North and Latin American markets. He leads GDN&apos;s U.S. commercial presence and manages trade relationships across the Americas corridor.</p>

              <div className="skills"><span className="skill">Commodity Trading</span><span className="skill">North &amp; Latin America</span><span className="skill">Trade Origination</span></div>

            </div>

            <div className="team-cell">

              <div className="role">UAE &amp; GULF REPRESENTATIVE · DUBAI</div>

              <h4>Matt Dunn</h4>

              <p>Matt operates from Dubai as GDN&apos;s Gulf and Middle East representative, bringing expertise in cryptocurrency, blockchain infrastructure and CrossLedger integration. He maintains high-level networks including royal family offices and high-profile private individuals, with a strong emphasis on discretion and sovereign-grade engagement.</p>

              <div className="skills"><span className="skill">Blockchain &amp; Crypto</span><span className="skill">CrossLedger Integration</span><span className="skill">Gulf Networks</span></div>

            </div>

            <div className="team-cell">

              <div className="role">BRAZIL &amp; SOUTH AMERICA · SÃO PAULO</div>

              <h4>Marcos Vianna &quot;Kito&quot;</h4>

              <p>Marcos brings over twenty years of experience in trading and freight forwarding across South America, with deep expertise in port logistics and supply-chain operations. Based in São Paulo, he leads GDN&apos;s Brazil and South America commercial activities across agricultural and commodity trade flows.</p>

              <div className="skills"><span className="skill">Freight &amp; Logistics</span><span className="skill">Port Operations</span><span className="skill">South America Trade</span></div>

            </div>

            <div className="team-cell">

              <div className="role">CO-FOUNDER &amp; CTO · CROSSLEDGER</div>

              <h4>Tom Young</h4>

              <p>Blockchain architect and full-stack developer specialising in Ethereum smart-contract development, digital asset infrastructure, and decentralised application deployment. Tom leads CrossLedger&apos;s technical architecture, smart-contract security posture, and platform engineering across the presale, token, and verification layers.</p>

              <div className="skills"><span className="skill">Smart Contracts</span><span className="skill">Ethereum / EVM</span><span className="skill">Platform Engineering</span></div>

            </div>

          </div>

        </div>

      </section>

      <section className="cream tight">

        <div className="wrap">

          <div className="eyebrow">TRANSPARENCY</div>

          <h2 className="h-section" style={{ marginBottom: 48, maxWidth: "28ch" }}>Public references. Verifiable, on-chain, primary sources.</h2>

          <div className="trans-grid">

            <a className="trans-cell" href={`https://etherscan.io/address/${PRESALE_CONTRACT_ADDRESS}`}><div className="k">PRESALE CONTRACT</div><div className="v">0xABCA…8B35 ↗</div></a>

            <a className="trans-cell" href={`https://etherscan.io/address/${CLX_TOKEN_ADDRESS}`}><div className="k">TOKEN CONTRACT</div><div className="v">0xDa23…0A6d ↗</div></a>

            <a className="trans-cell" href={`https://etherscan.io/token/${USDT_TOKEN_ADDRESS}`}><div className="k">PAYMENT TOKEN (USDT)</div><div className="v">0xdAC1…1ec7 ↗</div></a>

            <a className="trans-cell" href={`https://etherscan.io/address/${PRESALE_CONTRACT_ADDRESS}#tokentxns`}><div className="k">LIVE TRANSACTIONS</div><div className="v">View on Etherscan ↗</div></a>

            <a className="trans-cell" href="https://x.com/CrossLedgerCLX"><div className="k">OFFICIAL UPDATES</div><div className="v">@CrossLedgerCLX ↗</div></a>

            <a className="trans-cell" href="https://gdngroup.com.au"><div className="k">PARENT GROUP</div><div className="v">gdngroup.com.au ↗</div></a>

          </div>

        </div>

      </section>

      <section id="faq" className="cream-deep">

        <div className="wrap">

          <div className="eyebrow">FAQ</div>

          <h2 className="h-section" style={{ marginBottom: 24, maxWidth: "26ch" }}>Direct answers to the questions buyers ask first.</h2>

          <div className="faq-list">

            <details className="faq" open><summary>What is CrossLedger and what problem does it solve?</summary><div className="answer"><p>CrossLedger is a blockchain-powered platform for cross-border commodity trade, built and operated as the infrastructure pillar of GDN Group. It addresses slow manual documentation, fragmented trade verification, lengthy multi-day settlement, and high intermediary costs through smart-escrow contracts, on-chain document integrity, oracle-verified delivery confirmation, and CLXT-token settlement. The audience is mid-market exporters who feel correspondent-banking friction but cannot access prime-bank trade-finance rates.</p></div></details>

            <details className="faq"><summary>What is the relationship between CrossLedger and GDN Group?</summary><div className="answer"><p>CrossLedger is a product of GDN Group (GDN Enterprise Pty Ltd, ACN 666 495 263), an Australian trade, advisory, and technology house headquartered in Brisbane with regional offices in Dubai, Orlando and São Paulo. GDN Group&apos;s existing physical commodity trade desk (petroleum, sugar, agri-protein) provides the corridor relationships, deal flow, and counterparty network that CrossLedger uses as its initial deployment surface.</p></div></details>

            <details className="faq"><summary>What is the CLXT presale price and what are the stages?</summary><div className="answer"><p>Stage 1 is live at US$0.10 per CLXT. The four-stage ladder runs $0.10 → $0.20 → $0.25 → $0.50, with each stage carrying a fixed allocation cap. The Listing Reference price of $1.00 is an indicative target tied to platform progress and market conditions at the time of DEX listing — it is not a guarantee of value.</p></div></details>

            <details className="faq"><summary>What wallets can I use to buy?</summary><div className="answer"><p>Any Ethereum wallet that supports the WalletConnect protocol — including MetaMask (browser extension and mobile app), Coinbase Wallet, Trust Wallet, Rainbow, Ledger, and many others. On desktop, the wallet picker will detect installed browser extensions automatically. On mobile, you can either open this site inside your wallet&apos;s built-in browser, or scan a WalletConnect QR code from any wallet app.</p></div></details>

            <details className="faq"><summary>Do buyers receive tokens immediately?</summary><div className="answer"><p>Yes. This is a direct-send presale. When your <code>buyWithUSDT</code> transaction is confirmed on-chain, CLXT tokens transfer to your wallet within the same transaction. There is no separate claim step, no portal log-in, and no waiting period.</p></div></details>

            <details className="faq"><summary>What is the minimum purchase?</summary><div className="answer"><p>200 USDT, which yields 2,000 CLXT at the Stage 1 price of US$0.10. The minimum is enforced at the website level. The smart contract itself accepts any amount greater than zero.</p></div></details>

            <details className="faq"><summary>Is the smart contract audited?</summary><div className="answer"><p>Audit engagement is in negotiation with an Australian-based independent security firm at the time of writing. The pre-audit contract code is publicly verifiable on Etherscan now, and the full audit report will be published prior to Stage 2 opening.</p></div></details>

            <details className="faq"><summary>How is GDN Enterprise positioned under Australian regulation?</summary><div className="answer"><p>GDN Enterprise Pty Ltd operates under ASIC&apos;s transitional sector-wide no-action position (in effect to 30 June 2026) while the Digital Assets Framework regime is implemented. AUSTRAC registration scope and AML/CTF programme requirements are under active review with Australian counsel specialising in digital assets.</p></div></details>

            <details className="faq"><summary>Is the presale available to US, Canadian, or Chinese residents?</summary><div className="answer"><p>No. CLXT is not offered to residents of the United States, Canada, China, North Korea, Iran, Syria, Cuba, or other comprehensively-sanctioned jurisdictions. Geo-IP screening is enforced at the purchase flow, but it remains your responsibility to confirm eligibility under your own jurisdiction&apos;s rules before participating.</p></div></details>

            <details className="faq"><summary>What are the risks of participating?</summary><div className="answer"><p>Material risks include market risk (token price may decline, including to zero), liquidity risk (limited secondary market until exchange listing), regulatory risk (digital-asset rules continue to evolve in Australia and other jurisdictions), smart-contract risk (despite audits, no smart contract is risk-free), platform-execution risk, and total-loss risk. Participate only with funds you can afford to lose. This is not financial advice.</p></div></details>

          </div>

        </div>

      </section>

      <section className="cream">

        <div className="wrap">

          <div className="eyebrow">GET IN TOUCH</div>

          <h2 className="h-section" style={{ marginBottom: 24 }}>Let&apos;s talk trade.</h2>

          <div className="contact-grid">

            <div>

              <p className="lede" style={{ marginBottom: 32 }}>Whether you&apos;re a buyer, seller, institution, or government entity — we&apos;d welcome the opportunity to understand your needs and explore how CrossLedger and GDN Group can support you.</p>

              <dl className="contact-info">

                <dt>HEADQUARTERS</dt>

                <dd>Southport Central Tower 3, Level 5<br />9 Lawson Street, Southport QLD 4215<br />Australia</dd>

                <dt>BUSINESS HOURS</dt>

                <dd>Monday – Friday<br />9:00 AM – 5:00 PM AEST</dd>

                <dt>GDN GROUP</dt>

                <dd><a href="https://gdngroup.com.au">gdngroup.com.au</a> — parent group</dd>

              </dl>

            </div>

            <form onSubmit={handleContactSubmit} className="contact-form">

              <div className="form-row">

                <label>FIRST NAME<input type="text" name="firstName" required /></label>

                <label>LAST NAME<input type="text" name="lastName" required /></label>

              </div>

              <div className="form-row">

                <label>EMAIL ADDRESS<input type="email" name="email" required /></label>

                <label>ORGANISATION<input type="text" name="organisation" /></label>

              </div>

              <label>ENQUIRY TYPE

                <select name="enquiryType" defaultValue="">

                  <option value="" disabled>Select one…</option>

                  <option>Presale / Token enquiry</option>

                  <option>Enterprise / Trade corridor partnership</option>

                  <option>Press / Media</option>

                  <option>Security disclosure</option>

                  <option>Other</option>

                </select>

              </label>

              <label>MESSAGE

                <textarea name="message" rows={5} required></textarea>

              </label>

              <button type="submit" className="btn-primary" disabled={contactSending}>

                {contactSending ? "Sending…" : "Send enquiry"}

              </button>

              {contactStatus && (

                <div className={`contact-status ${contactStatus.kind}`}>{contactStatus.text}</div>

              )}

            </form>

          </div>

        </div>

      </section>

      <div id="risk" className="risk">

        <div className="wrap">

          <h4>RISK DISCLOSURE &amp; IMPORTANT NOTICE</h4>

          <p><strong>CLXT is a utility token issued by GDN Enterprise Pty Ltd.</strong> Participation in the presale or any subsequent purchase, sale, or transfer of CLXT involves material risks including but not limited to: market risk, liquidity risk, regulatory risk, smart-contract risk, platform-execution risk, counterparty risk, and total-loss risk. Forward-looking statements regarding future listing prices, platform adoption, transaction volumes, or revenue are projections only and are not guarantees. Past performance of comparable projects is not indicative of future results.</p>

          <p>CLXT is <strong>not</strong> a financial product in every jurisdiction; classification varies by country of residence. Australian residents: GDN Enterprise Pty Ltd is operating under ASIC&apos;s transitional sector-wide no-action position (in effect to 30 June 2026) and is preparing for compliance with the Digital Assets Framework regime. This page does not constitute personal financial advice, a securities offering, or an invitation to invest. Information presented here is general in nature and does not take account of your individual objectives, financial situation, or needs.</p>

          <p>Conduct your own research and obtain independent legal, tax, and financial advice from licensed professionals before participating. Only commit funds you can afford to lose entirely. By connecting a wallet and committing a transaction, you confirm acceptance of these terms and the jurisdictional restrictions set out above.</p>

        </div>

      </div>

      <footer>

        <div className="wrap">

          <div className="foot-grid">

            <div className="foot-brand">

              <div className="gdn-tag">A GDN GROUP PRODUCT</div>

              <h5>CrossLedger</h5>

              <p>Blockchain-anchored settlement infrastructure for cross-border commodity trade. Smart escrow, verified digital documentation, token-enabled settlement.</p>

              <div className="addr">GDN Enterprise Pty Ltd · ACN 666 495 263<br />Southport Central Tower 3, Level 5<br />9 Lawson Street, Southport QLD 4215, Australia</div>

            </div>

            <div className="foot-col">

              <h6>PLATFORM</h6>

              <ul>

                <li><a href="#problem">The Problem</a></li>

                <li><a href="#token">CLXT Token</a></li>

                <li><a href="#corridors">Trade Corridors</a></li>

                <li><a href="#security">Security &amp; Audit</a></li>

                <li><a href="#presale">Buy CLXT</a></li>

              </ul>

            </div>

            <div className="foot-col">

              <h6>TOKEN</h6>

              <ul>

                <li><a href={`https://etherscan.io/address/${PRESALE_CONTRACT_ADDRESS}`}>Presale Contract ↗</a></li>

                <li><a href={`https://etherscan.io/address/${CLX_TOKEN_ADDRESS}`}>Token Contract ↗</a></li>

                <li><a href={`https://etherscan.io/token/${USDT_TOKEN_ADDRESS}`}>Payment Token (USDT) ↗</a></li>

                <li><a href="#faq">FAQ</a></li>

                <li><a href="#risk">Risk Disclosure</a></li>

              </ul>

            </div>

            <div className="foot-col">

              <h6>GDN GROUP</h6>

              <ul>

                <li><a href="https://gdngroup.com.au">gdngroup.com.au ↗</a></li>

                <li><a href="https://gdngroup.com.au/pages/trading.html">Trading ↗</a></li>

                <li><a href="https://gdngroup.com.au/pages/advisory.html">Advisory ↗</a></li>

                <li><a href="https://x.com/CrossLedgerCLX">Follow on X ↗</a></li>

                <li><a href="mailto:hello@crossledger.trade">hello@crossledger.trade</a></li>

              </ul>

            </div>

          </div>

          <div className="foot-bottom">

            <div>© 2025 GDN Enterprise Pty Ltd · CrossLedger &amp; CLXT Token · Powered by Ethereum</div>

            <div className="gdn-line">CrossLedger is a product of <a href="https://gdngroup.com.au">GDN Group</a> · <span className="geo"><span>Brisbane</span>·<span>Dubai</span>·<span>Orlando</span>·<span>São Paulo</span></span></div>

          </div>

        </div>

      </footer>

      {/* Reown AppKit Web Component — provides the wallet connect button anywhere in the page */}

      {/* Not strictly required since we use useAppKit().open() but kept here for reference */}

      {/* ============ STYLES ============ */}

      <style jsx global>{`

        :root {

          --cream:        #f5efe5;

          --cream-deep:   #ebe2d3;

          --navy:         #13283f;

          --navy-deep:    #0d1d2f;

          --white:        #ffffff;

          --ink:          #13283f;

          --ink-mute:     #5a6b7d;

          --ink-dim:      #8595a6;

          --ink-line:     rgba(19,40,63,0.12);

          --gold:         #c9a449;

          --gold-deep:    #a4842f;

          --gold-soft:    rgba(201,164,73,0.14);

          --positive:     #5e8c6f;

          --warn:         #b48342;

          --danger:       #b54a40;

          --sans:         'Inter', system-ui, -apple-system, sans-serif;

          --mono:         'JetBrains Mono', ui-monospace, monospace;

        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        html { scroll-behavior: smooth; }

        body { font-family: var(--sans); background: var(--cream); color: var(--ink); line-height: 1.65; font-weight: 400; -webkit-font-smoothing: antialiased; overflow-x: hidden; }

        .wrap { max-width: 1280px; margin: 0 auto; padding: 0 32px; }

        @media (max-width: 700px) { .wrap { padding: 0 20px; } }

        .mono { font-family: var(--mono); font-size: 11px; color: var(--gold); }

        .meta-strip { background: var(--navy); color: var(--gold); padding: 14px 0; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 500; }

        .meta-strip .wrap { display: flex; justify-content: space-between; align-items: center; gap: 24px; flex-wrap: wrap; }

        .meta-strip .geo span { margin: 0 10px; color: var(--gold); }

        .meta-strip .geo span:first-child { margin-left: 0; }

        .nav-bar { background: rgba(255,255,255,0.96); border-bottom: 1px solid var(--ink-line); padding: 26px 0; position: sticky; top: 0; z-index: 50; backdrop-filter: blur(8px); }

        .nav-bar .wrap { display: flex; align-items: center; justify-content: space-between; gap: 24px; }

        .logo { text-decoration: none; display: flex; align-items: baseline; gap: 14px; color: var(--ink); }

        .logo .mark { font-family: var(--sans); font-weight: 700; font-size: 22px; letter-spacing: -0.01em; color: var(--ink); }

        .logo .sub { font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--ink-dim); font-weight: 500; }

        .nav-links { display: flex; gap: 36px; align-items: center; }

        .nav-links a { color: var(--ink); text-decoration: none; font-size: 14px; font-weight: 400; transition: color 0.2s; }

        .nav-links a:hover { color: var(--gold-deep); }

        @media (max-width: 900px) { .nav-links a:not(.btn-primary):not(.btn-link) { display: none; } .logo .sub { display: none; } }

        .btn-primary { background: var(--gold); color: var(--navy); padding: 14px 26px; border-radius: 0; font-weight: 600; font-size: 14px; letter-spacing: 0.02em; text-decoration: none; border: none; cursor: pointer; transition: background 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-family: var(--sans); }

        .btn-primary:hover:not(:disabled) { background: var(--gold-deep); color: var(--white); }

        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

        .btn-link { background: transparent; color: var(--ink); padding: 14px 0; margin-left: 8px; font-weight: 500; font-size: 14px; text-decoration: none; border: none; border-bottom: 1px solid var(--ink); transition: color 0.2s, border-color 0.2s; display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font-family: var(--sans); }

        .btn-link:hover:not(:disabled) { color: var(--gold-deep); border-color: var(--gold-deep); }

        .navy .btn-link { color: var(--white); border-bottom-color: var(--white); }

        .navy .btn-link:hover:not(:disabled) { color: var(--gold); border-bottom-color: var(--gold); }

        .eyebrow { font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--gold-deep); font-weight: 600; margin-bottom: 24px; }

        .navy .eyebrow { color: var(--gold); }

        h1, h2, h3, h4, h5 { font-weight: 600; letter-spacing: -0.018em; line-height: 1.1; color: var(--ink); }

        .navy h1, .navy h2, .navy h3, .navy h4, .navy h5 { color: var(--white); }

        .h-display { font-size: clamp(48px, 6.4vw, 86px); font-weight: 600; letter-spacing: -0.025em; line-height: 1.02; }

        .h-section { font-size: clamp(34px, 4.4vw, 54px); font-weight: 600; line-height: 1.08; letter-spacing: -0.02em; }

        .h-block { font-size: 28px; font-weight: 600; letter-spacing: -0.015em; line-height: 1.15; }

        section { padding: 120px 0; }

        section.tight { padding: 80px 0; }

        section.cream { background: var(--cream); }

        section.cream-deep { background: var(--cream-deep); }

        section.white { background: var(--white); }

        section.navy { background: var(--navy); color: var(--white); }

        section.navy p { color: rgba(255,255,255,0.78); }

        .lede { font-size: 18px; color: var(--ink-mute); max-width: 64ch; line-height: 1.65; margin-bottom: 56px; }

        .navy .lede { color: rgba(255,255,255,0.72); }

        .hero { position: relative; color: var(--white); padding: 140px 0 120px; overflow: hidden; background: linear-gradient(105deg, rgba(13,29,47,0.92) 0%, rgba(13,29,47,0.78) 55%, rgba(13,29,47,0.62) 100%), url('https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=2400&q=80'); background-size: cover; background-position: center 40%; border-bottom: 1px solid var(--ink-line); }

        .hero-wrap { position: relative; z-index: 1; display: grid; grid-template-columns: 1fr 1.05fr; gap: 64px; align-items: center; }

        @media (max-width: 1000px) { .hero-wrap { grid-template-columns: 1fr; gap: 48px; } .hero { padding: 120px 0 96px; } }

        .hero-image { width: 100%; height: auto; display: block; box-shadow: 0 30px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(201,164,73,0.18); }

        .hero-eyebrow { font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: rgba(255,255,255,0.85); font-weight: 500; margin-bottom: 28px; }

        .hero h1 { color: var(--white); max-width: 14ch; margin-bottom: 32px; font-weight: 600; }

        .hero-lede { font-size: 17px; color: rgba(255,255,255,0.86); max-width: 56ch; line-height: 1.65; margin-bottom: 44px; font-weight: 400; }

        .hero-actions { display: flex; gap: 4px; flex-wrap: wrap; align-items: center; }

        .hero-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }

        .hero-stat { padding: 0 28px 0 0; }

        .hero-stat:not(:last-child) { border-right: 1px solid var(--ink-line); }

        .hero-stat .v { font-size: 44px; font-weight: 600; letter-spacing: -0.025em; line-height: 1; margin-bottom: 12px; color: var(--ink); }

        .hero-stat .l { font-size: 13px; color: var(--ink-mute); letter-spacing: 0.02em; font-weight: 400; }

        @media (max-width: 700px) { .hero-stat:not(:last-child) { border-right: none; border-bottom: 1px solid var(--ink-line); padding-bottom: 24px; margin-bottom: 24px; } }

        .status-bar { background: var(--gold); color: var(--navy); padding: 14px 0; font-size: 13px; font-weight: 500; }

        .status-bar .wrap { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }

        .status-bar .left { display: inline-flex; align-items: center; gap: 12px; }

        .status-bar .dot { width: 8px; height: 8px; background: var(--navy); border-radius: 50%; animation: pulse 2.5s infinite; }

        @keyframes pulse { 0%,100% { opacity: 1; box-shadow: 0 0 0 0 rgba(19,40,63,0.5); } 50% { opacity: 0.5; box-shadow: 0 0 0 8px rgba(19,40,63,0); } }

        .status-bar a { color: var(--navy); text-decoration: none; font-weight: 600; border-bottom: 1px solid var(--navy); padding-bottom: 1px; }

        .ps-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; margin-top: 24px; }

        @media (max-width: 900px) { .ps-grid { grid-template-columns: 1fr; gap: 56px; } }

        .ps-block .h-block { margin-bottom: 28px; }

        .ps-list { list-style: none; display: flex; flex-direction: column; gap: 18px; }

        .ps-list li { display: flex; gap: 16px; align-items: flex-start; font-size: 15.5px; line-height: 1.6; color: var(--ink); }

        .ps-list li::before { font-weight: 600; font-size: 12px; width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; flex-shrink: 0; margin-top: 2px; }

        .ps-block.problem .ps-list li::before { content: 'X'; background: rgba(181,74,64,0.12); color: var(--danger); }

        .ps-block.solution .ps-list li::before { content: 'V'; background: var(--gold-soft); color: var(--gold-deep); }

        .card-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; margin-top: 16px; }

        @media (max-width: 900px) { .card-grid { grid-template-columns: 1fr 1fr; } }

        @media (max-width: 600px) { .card-grid { grid-template-columns: 1fr; } }

        .card { background: var(--white); padding: 36px 32px; transition: transform 0.2s, box-shadow 0.2s; }

        .card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(19,40,63,0.06); }

        .card .tag { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold-deep); font-weight: 600; margin-bottom: 16px; }

        .card h4 { font-size: 22px; font-weight: 600; margin-bottom: 12px; line-height: 1.25; letter-spacing: -0.01em; }

        .card p { font-size: 14.5px; color: var(--ink-mute); line-height: 1.6; }

        .context-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 0; border-top: 1px solid var(--ink-line); margin-top: 24px; }

        .context-cell { padding: 40px 32px 0 0; border-right: 1px solid var(--ink-line); }

        .context-cell:last-child { border-right: none; padding-right: 0; }

        .context-cell .num { font-size: 56px; font-weight: 600; letter-spacing: -0.03em; line-height: 1; margin-bottom: 14px; color: var(--ink); }

        .context-cell .lab { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold-deep); font-weight: 600; margin-bottom: 12px; }

        .context-cell .desc { font-size: 14.5px; color: var(--ink-mute); line-height: 1.55; }

        @media (max-width: 700px) { .context-cell { border-right: none; border-bottom: 1px solid var(--ink-line); padding: 32px 0; } .context-cell:last-child { border-bottom: none; } }

        .purchase { display: grid; grid-template-columns: 1fr 1.05fr; gap: 80px; align-items: start; }

        @media (max-width: 1000px) { .purchase { grid-template-columns: 1fr; gap: 48px; } }

        .purchase h2 { color: var(--white); margin-bottom: 24px; max-width: 18ch; }

        .quick-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 0; margin: 36px 0; border: 1px solid rgba(255,255,255,0.16); }

        .quick-stats > div { padding: 22px 24px; border-right: 1px solid rgba(255,255,255,0.10); border-bottom: 1px solid rgba(255,255,255,0.10); }

        .quick-stats > div:nth-child(2n) { border-right: none; }

        .quick-stats > div:nth-last-child(-n+2) { border-bottom: none; }

        .quick-stats .l { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold); font-weight: 500; margin-bottom: 8px; }

        .quick-stats .v { font-size: 22px; font-weight: 600; color: var(--white); letter-spacing: -0.01em; }

        .quick-stats .v.gold-text { color: var(--gold); }

        .steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); border-top: 1px solid rgba(255,255,255,0.16); padding-top: 8px; }

        .step { padding: 28px 24px 0 0; border-right: 1px solid rgba(255,255,255,0.08); }

        .step:last-child { border-right: none; }

        .step .n { font-family: var(--mono); font-size: 11px; color: var(--gold); margin-bottom: 12px; letter-spacing: 0.1em; }

        .step h4 { font-size: 16px; font-weight: 600; margin-bottom: 8px; line-height: 1.3; color: var(--white); }

        .step p { font-size: 13.5px; color: rgba(255,255,255,0.65); line-height: 1.5; }

        @media (max-width: 700px) { .step { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.08); padding: 24px 0; } .step:last-child { border-bottom: none; } }

        .widget { background: var(--navy-deep); border: 1px solid rgba(201,164,73,0.32); padding: 38px; position: relative; }

        .widget::before { content: 'STAGE 1 · LIVE'; position: absolute; top: -1px; left: -1px; background: var(--gold); color: var(--navy); font-size: 10px; font-weight: 700; letter-spacing: 0.18em; padding: 7px 14px; }

        .widget h3 { font-size: 26px; font-weight: 600; letter-spacing: -0.01em; margin: 30px 0 6px; color: var(--white); }

        .widget .sub { font-size: 11px; color: var(--gold); letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 26px; font-weight: 500; }

        .row { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 13px; gap: 12px; }

        .row:last-of-type { border-bottom: none; }

        .row .k { color: rgba(255,255,255,0.65); letter-spacing: 0.04em; flex-shrink: 0; }

        .row .v { font-family: var(--mono); color: var(--white); text-align: right; word-break: break-all; font-weight: 500; }

        .row .v.acc { color: var(--gold); font-weight: 600; }

        .row .v.muted { color: rgba(255,255,255,0.50); }

        .row .v.success { color: var(--positive); }

        .row .v.warn { color: var(--warn); }

        .pills { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin: 22px 0; }

        .pills button { background: transparent; border: 1px solid rgba(255,255,255,0.18); color: var(--white); padding: 12px; font-family: var(--mono); font-size: 12px; cursor: pointer; transition: all 0.2s; }

        .pills button:hover { border-color: var(--gold); color: var(--gold); }

        .input-row { margin: 16px 0; }

        .input-row input { width: 100%; background: rgba(0,0,0,0.30); border: 1px solid rgba(255,255,255,0.18); color: var(--white); padding: 14px 16px; font-family: var(--mono); font-size: 14px; }

        .input-row input:focus { outline: none; border-color: var(--gold); }

        .tos { background: rgba(201,164,73,0.08); border: 1px solid rgba(201,164,73,0.30); padding: 16px 18px; margin: 22px 0; font-size: 12.5px; color: rgba(255,255,255,0.78); line-height: 1.55; }

        .tos label { display: flex; gap: 12px; align-items: flex-start; cursor: pointer; }

        .tos input[type="checkbox"] { margin-top: 3px; accent-color: var(--gold); flex-shrink: 0; width: 14px; height: 14px; }

        .tos a { color: var(--gold); text-decoration: underline; }

        .actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

        .actions button { width: 100%; padding: 16px; font-family: var(--sans); font-weight: 600; font-size: 13px; letter-spacing: 0.04em; cursor: pointer; transition: all 0.2s; }

        .actions .approve { background: transparent; color: var(--white); border: 1px solid rgba(255,255,255,0.30); }

        .actions .approve:hover:not(:disabled) { border-color: var(--gold); color: var(--gold); }

        .actions .approve:disabled { opacity: 0.35; cursor: not-allowed; }

        .actions .buy { background: var(--gold); color: var(--navy); border: none; }

        .actions .buy:hover:not(:disabled) { background: var(--white); }

        .actions .buy:disabled { opacity: 0.35; cursor: not-allowed; }

        .widget-note { margin-top: 18px; padding: 14px 16px; background: rgba(0,0,0,0.30); font-size: 11.5px; color: rgba(255,255,255,0.65); line-height: 1.6; border-left: 2px solid var(--gold); }

        .widget-msg { margin-top: 18px; padding: 14px 16px; font-size: 12.5px; line-height: 1.55; border-left-width: 2px; border-left-style: solid; color: var(--white); }

        .widget-msg.info { background: rgba(94,140,111,0.12); border-left-color: var(--positive); }

        .widget-msg.warn { background: rgba(180,131,66,0.12); border-left-color: var(--warn); }

        .widget-msg.error { background: rgba(181,74,64,0.12); border-left-color: var(--danger); }

        .widget-msg a { color: var(--gold); text-decoration: underline; }

        .ladder { background: var(--white); border: 1px solid var(--ink-line); }

        .ladder-row { display: grid; grid-template-columns: 70px 1fr 130px 130px 200px; gap: 28px; padding: 22px 28px; border-bottom: 1px solid var(--ink-line); align-items: center; }

        .ladder-row:last-child { border-bottom: none; }

        .ladder-row.head { background: var(--cream-deep); font-size: 10px; color: var(--ink-dim); letter-spacing: 0.18em; text-transform: uppercase; font-weight: 600; padding: 16px 28px; }

        .ladder-row.live { background: var(--gold-soft); }

        .ladder-row.target { background: var(--cream-deep); border-top: 1px solid var(--ink-line); }

        .ladder-row .stage-n { font-family: var(--mono); font-size: 13px; color: var(--ink); }

        .ladder-row .stage-name { font-size: 17px; font-weight: 600; letter-spacing: -0.01em; }

        .ladder-row .stage-name .b { display: inline-block; margin-left: 12px; background: var(--gold); color: var(--navy); font-size: 9px; font-weight: 700; padding: 3px 8px; letter-spacing: 0.14em; vertical-align: 2px; }

        .ladder-row .pr { font-family: var(--mono); font-size: 18px; color: var(--gold-deep); font-weight: 600; }

        .ladder-row .dl { font-family: var(--mono); font-size: 13px; color: var(--positive); }

        .ladder-row .cap { font-family: var(--mono); font-size: 13px; color: var(--ink-mute); }

        @media (max-width: 900px) { .ladder-row { grid-template-columns: 1fr; gap: 6px; } .ladder-row.head { display: none; } .ladder-row .pr { font-size: 22px; } }

        .ladder-note { margin-top: 24px; font-size: 13px; color: var(--ink-dim); font-style: italic; line-height: 1.65; max-width: 80ch; }

        .alloc-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }

        @media (max-width: 900px) { .alloc-grid { grid-template-columns: 1fr 1fr; } }

        @media (max-width: 600px) { .alloc-grid { grid-template-columns: 1fr; } }

        .alloc-cell { background: var(--white); padding: 32px 30px; }

        .alloc-cell .pct { font-size: 44px; font-weight: 600; letter-spacing: -0.025em; line-height: 1; color: var(--gold-deep); margin-bottom: 4px; }

        .alloc-cell h4 { font-size: 18px; font-weight: 600; margin: 14px 0 8px; letter-spacing: -0.005em; }

        .alloc-cell p { font-size: 14px; color: var(--ink-mute); line-height: 1.55; }

        .compare { background: var(--white); overflow-x: auto; border: 1px solid var(--ink-line); }

        .compare table { width: 100%; border-collapse: collapse; min-width: 720px; }

        .compare th, .compare td { text-align: left; padding: 20px 28px; border-bottom: 1px solid var(--ink-line); font-size: 14px; }

        .compare th { background: var(--cream-deep); font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--ink-mute); font-weight: 600; }

        .compare th.cl { color: var(--gold-deep); }

        .compare td.dim { color: var(--ink-dim); }

        .compare td.cl { color: var(--ink); font-weight: 500; }

        .compare td:first-child { color: var(--ink); font-weight: 500; }

        .compare tr:last-child td { border-bottom: none; }

        .road-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-top: 24px; }

        @media (max-width: 900px) { .road-grid { grid-template-columns: 1fr 1fr; } }

        @media (max-width: 600px) { .road-grid { grid-template-columns: 1fr; } }

        .road-cell { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.10); padding: 32px 28px; position: relative; }

        .road-cell.active { background: rgba(201,164,73,0.10); border-color: var(--gold); }

        .road-cell .num { font-family: var(--mono); font-size: 10px; color: var(--gold); letter-spacing: 0.18em; margin-bottom: 18px; text-transform: uppercase; font-weight: 500; }

        .road-cell h4 { color: var(--white); font-size: 18px; font-weight: 600; margin-bottom: 14px; line-height: 1.25; }

        .road-cell p { font-size: 13.5px; color: rgba(255,255,255,0.70); line-height: 1.6; }

        .sec-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }

        @media (max-width: 900px) { .sec-grid { grid-template-columns: 1fr 1fr; } }

        @media (max-width: 600px) { .sec-grid { grid-template-columns: 1fr; } }

        .sec-cell { background: var(--white); padding: 32px; }

        .sec-cell .tag { display: inline-block; background: var(--cream-deep); color: var(--ink-mute); font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; padding: 5px 10px; margin-bottom: 18px; font-weight: 600; }

        .sec-cell .tag.pending { color: var(--warn); background: rgba(180,131,66,0.14); }

        .sec-cell .tag.live { color: var(--positive); background: rgba(94,140,111,0.14); }

        .sec-cell h4 { font-size: 19px; font-weight: 600; margin-bottom: 12px; }

        .sec-cell p { font-size: 14px; color: var(--ink-mute); line-height: 1.6; margin-bottom: 16px; }

        .sec-cell .meta { font-family: var(--mono); font-size: 11.5px; color: var(--ink-dim); padding-top: 14px; border-top: 1px dashed var(--ink-line); letter-spacing: 0.04em; }

        .sec-cell .meta a { color: var(--gold-deep); text-decoration: none; }

        .sec-cell .meta a:hover { text-decoration: underline; }

        .restrict { margin-top: 36px; background: rgba(181,74,64,0.06); border: 1px solid rgba(181,74,64,0.28); padding: 28px 32px; }

        .restrict h4 { color: var(--danger); font-size: 17px; font-weight: 600; margin-bottom: 12px; }

        .restrict p { color: var(--ink-mute); font-size: 14px; line-height: 1.65; }

        .restrict strong { color: var(--ink); font-weight: 600; }

        .team-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px 64px; margin-top: 24px; }

        @media (max-width: 700px) { .team-grid { grid-template-columns: 1fr; gap: 48px; } }

        .team-cell { padding-bottom: 32px; border-bottom: 1px solid var(--ink-line); }

        .team-cell .role { font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--gold-deep); font-weight: 600; margin-bottom: 14px; }

        .team-cell h4 { font-size: 26px; font-weight: 600; margin-bottom: 18px; letter-spacing: -0.015em; }

        .team-cell p { font-size: 14.5px; color: var(--ink-mute); line-height: 1.65; margin-bottom: 20px; }

        .team-cell .skills { display: flex; flex-wrap: wrap; gap: 8px; }

        .team-cell .skill { font-size: 12px; color: var(--ink-mute); letter-spacing: 0.04em; }

        .team-cell .skill::after { content: '·'; margin-left: 8px; color: var(--ink-dim); }

        .team-cell .skill:last-child::after { content: ''; }

        .trans-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 4px; background: var(--ink-line); border: 1px solid var(--ink-line); }

        .trans-cell { background: var(--white); padding: 26px 28px; text-decoration: none; color: var(--ink); transition: background 0.2s; display: block; }

        .trans-cell:hover { background: var(--cream); }

        .trans-cell .k { font-size: 11px; color: var(--ink-dim); letter-spacing: 0.18em; text-transform: uppercase; font-weight: 600; margin-bottom: 10px; }

        .trans-cell .v { font-family: var(--mono); font-size: 13px; color: var(--gold-deep); word-break: break-all; font-weight: 500; }

        .faq-list { border-top: 1px solid var(--ink-line); margin-top: 24px; }

        details.faq { border-bottom: 1px solid var(--ink-line); transition: background 0.2s; }

        details.faq[open] { background: var(--white); }

        details.faq summary { list-style: none; cursor: pointer; padding: 28px 0; font-size: 18px; font-weight: 600; display: flex; align-items: center; justify-content: space-between; gap: 24px; letter-spacing: -0.01em; color: var(--ink); }

        details.faq[open] summary { padding-left: 28px; padding-right: 28px; }

        details.faq summary::-webkit-details-marker { display: none; }

        details.faq summary::after { content: '+'; font-weight: 300; font-size: 28px; color: var(--gold-deep); flex-shrink: 0; line-height: 1; }

        details.faq[open] summary::after { content: '−'; }

        details.faq .answer { padding: 0 28px 28px; color: var(--ink-mute); font-size: 14.5px; line-height: 1.7; }

        .contact-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 80px; margin-top: 24px; }

        @media (max-width: 900px) { .contact-grid { grid-template-columns: 1fr; gap: 48px; } }

        .contact-info dt { font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--gold-deep); font-weight: 600; margin-bottom: 8px; }

        .contact-info dd { margin-bottom: 28px; font-size: 15px; line-height: 1.65; color: var(--ink); }

        .contact-info dd a { color: var(--gold-deep); text-decoration: none; border-bottom: 1px solid var(--gold-deep); }

        .contact-form { display: flex; flex-direction: column; gap: 18px; }

        .contact-form .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }

        @media (max-width: 600px) { .contact-form .form-row { grid-template-columns: 1fr; } }

        .contact-form label { display: flex; flex-direction: column; gap: 8px; font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--gold-deep); font-weight: 600; }

        .contact-form input, .contact-form select, .contact-form textarea { background: var(--white); border: 1px solid var(--ink-line); padding: 14px 16px; font-family: var(--sans); font-size: 14px; color: var(--ink); font-weight: 400; letter-spacing: 0; text-transform: none; }

        .contact-form input:focus, .contact-form select:focus, .contact-form textarea:focus { outline: none; border-color: var(--gold-deep); }

        .contact-form button { align-self: flex-start; }

        .contact-status { padding: 14px 16px; font-size: 13.5px; line-height: 1.55; border-left-width: 2px; border-left-style: solid; }

        .contact-status.info { background: rgba(94,140,111,0.10); border-left-color: var(--positive); color: var(--ink); }

        .contact-status.error { background: rgba(181,74,64,0.10); border-left-color: var(--danger); color: var(--ink); }

        .risk { background: var(--navy-deep); padding: 72px 0; color: rgba(255,255,255,0.78); }

        .risk h4 { font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--warn); font-weight: 600; margin-bottom: 24px; }

        .risk p { font-size: 13.5px; line-height: 1.75; max-width: 90ch; margin-bottom: 14px; }

        .risk strong { color: var(--white); font-weight: 600; }

        footer { background: var(--navy); color: rgba(255,255,255,0.78); padding: 80px 0 32px; border-top: 1px solid var(--ink-line); }

        .foot-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 56px; margin-bottom: 56px; }

        @media (max-width: 900px) { .foot-grid { grid-template-columns: 1fr 1fr; gap: 40px; } }

        @media (max-width: 600px) { .foot-grid { grid-template-columns: 1fr; gap: 32px; } }

        .foot-brand .gdn-tag { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--gold); font-weight: 600; margin-bottom: 16px; }

        .foot-brand h5 { font-size: 22px; font-weight: 600; margin-bottom: 14px; letter-spacing: -0.01em; color: var(--white); }

        .foot-brand p { color: rgba(255,255,255,0.65); font-size: 14px; line-height: 1.65; max-width: 38ch; margin-bottom: 20px; }

        .foot-brand .addr { font-size: 12.5px; color: rgba(255,255,255,0.50); line-height: 1.7; font-family: var(--mono); }

        .foot-col h6 { font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--gold); margin-bottom: 18px; font-weight: 600; }

        .foot-col ul { list-style: none; display: flex; flex-direction: column; gap: 12px; }

        .foot-col a { color: rgba(255,255,255,0.78); text-decoration: none; font-size: 13.5px; transition: color 0.2s; }

        .foot-col a:hover { color: var(--gold); }

        .foot-bottom { padding-top: 28px; border-top: 1px solid rgba(255,255,255,0.10); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; font-size: 12px; color: rgba(255,255,255,0.45); letter-spacing: 0.04em; }

        .foot-bottom .gdn-line { color: rgba(255,255,255,0.65); }

        .foot-bottom .gdn-line a { color: var(--gold); text-decoration: none; }

        .foot-bottom .geo span { margin: 0 8px; }

        .foot-bottom .geo span:first-child { margin-left: 0; }

      `}</style>

    </>

  );

}
