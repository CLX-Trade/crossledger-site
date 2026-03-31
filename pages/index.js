import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";

const PRESALE_CONTRACT_ADDRESS = "0xABCA8F71BA5f0e500A7e9c470048472c0B982B35";
const USDT_TOKEN_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const CLX_TOKEN_ADDRESS = "0xDa23800A2fc8d345Af55d9Bf88a7A910B2f90A6d";
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mlgpnvbk";

const TOKEN_NAME = "CrossLedger";
const TOKEN_SYMBOL = "CLXT";
const TAGLINE = "Global Trade Infrastructure Token";
const CURRENT_PRICE_USD = 0.1;
const PROJECTED_LAUNCH_USD = 13.5;
const MIN_PURCHASE_USD = 200;

const PRESALE_ABI = [
  "function buyWithUSDT(uint256 usdtAmount) external",
  "function claimTokens() external",
  "function currentPrice() view returns (uint256)",
  "function remainingInStage() view returns (uint256)",
  "function minPurchase() view returns (uint256)",
  "function stage() view returns (uint256)",
  "function salePaused() view returns (bool)",
  "function claimEnabled() view returns (bool)",
  "function buyerInfo(address account) view returns (uint256 usdtSpent, uint256 totalPurchased, uint256 totalClaimed, uint256 claimable)"
];

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)"
];

const RECENT_ACTIVITY = [
  { buyer: "0x71...9ab4", amount: "12,500 USDT", status: "Confirmed" },
  { buyer: "0x93...1fd2", amount: "4,800 USDT", status: "Confirmed" },
  { buyer: "0x28...7ce1", amount: "18,200 USDT", status: "Confirmed" },
  { buyer: "0x84...ab19", amount: "7,100 USDT", status: "Confirmed" },
  { buyer: "0x16...ce42", amount: "25,000 USDT", status: "Confirmed" }
];

const TOKEN_ALLOCATION = [
  {
    title: "Ecosystem & Trade Incentives",
    percent: "35%",
    desc: "User rewards, trade stimulation, rebates and referrals."
  },
  {
    title: "Treasury & Compliance",
    percent: "20%",
    desc: "Regulatory readiness and operational reserves."
  },
  {
    title: "Founders & Team",
    percent: "15%",
    desc: "Long-term alignment and execution support."
  },
  {
    title: "Strategic Investors",
    percent: "15%",
    desc: "Seed and strategic capital partners."
  },
  {
    title: "Exchange & Liquidity",
    percent: "10%",
    desc: "Liquidity, market making and listing support."
  },
  {
    title: "Operations & Partnerships",
    percent: "5%",
    desc: "Commercial growth and ecosystem integrations."
  }
];

const SOCIAL_LINKS = [
  { label: "Website", href: "https://www.crossledger.trade" },
  { label: "Presale Contract", href: `https://etherscan.io/address/${PRESALE_CONTRACT_ADDRESS}` },
  { label: "Token Contract", href: `https://etherscan.io/address/${CLX_TOKEN_ADDRESS}` }
  // Add more when ready:
  // { label: "X", href: "https://x.com/yourhandle" },
  // { label: "Telegram", href: "https://t.me/yourgroup" }
];

const FAQS = [
  {
    q: "What token is being sold in this presale?",
    a: "The presale is for CLXT, the CrossLedger token designed to support global trade infrastructure, platform services, and ecosystem utility."
  },
  {
    q: "What currency do buyers use?",
    a: "Purchases are made in USDT through the live Ethereum presale contract."
  },
  {
    q: "Can buyers claim immediately?",
    a: "Claims depend on whether claim functionality has been enabled in the presale contract. The page reads this status live."
  },
  {
    q: "What is the current minimum purchase?",
    a: "The site reads the minimum purchase from the presale contract so buyers see the live configured threshold."
  },
  {
    q: "Where can I verify the contracts?",
    a: "The transparency section below provides direct links to the presale contract and token contract on Etherscan."
  }
];

export default function HomePage() {
  const [walletAddress, setWalletAddress] = useState("");
  const [networkName, setNetworkName] = useState("");
  const [usdtAmount, setUsdtAmount] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const [isConnecting, setIsConnecting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const [contactStatus, setContactStatus] = useState("");
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: ""
  });

  const [presaleInfo, setPresaleInfo] = useState({
    minPurchase: MIN_PURCHASE_USD,
    stage: 1,
    salePaused: false,
    claimEnabled: false,
    remainingInStage: "0"
  });

  const [walletData, setWalletData] = useState({
    usdtBalance: "0",
    allowance: "0",
    usdtSpent: "0",
    totalPurchased: "0",
    totalClaimed: "0",
    claimable: "0"
  });

  const currentProgress = 33.33;
  const projectedProgress = 58.33;

  const isMobile = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }, []);

  const numericUsdtAmount = useMemo(() => Number(usdtAmount || 0), [usdtAmount]);

  const estimatedTokens = useMemo(() => {
    if (!numericUsdtAmount || CURRENT_PRICE_USD <= 0) return 0;
    return numericUsdtAmount / CURRENT_PRICE_USD;
  }, [numericUsdtAmount]);

  const hasEnoughAllowance = useMemo(() => {
    return Number(walletData.allowance || 0) >= Number(usdtAmount || 0) && Number(usdtAmount || 0) > 0;
  }, [walletData.allowance, usdtAmount]);

  useEffect(() => {
    restorePendingAmount();
    restoreExistingWallet();
  }, []);

  useEffect(() => {
    loadPresaleInfo();
    if (walletAddress) {
      loadWalletData();
    }
  }, [walletAddress]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
      } else {
        setWalletAddress("");
      }
      clearMessages();
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on?.("accountsChanged", handleAccountsChanged);
    window.ethereum.on?.("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener?.("chainChanged", handleChainChanged);
    };
  }, []);

  function clearMessages() {
    setErrorMessage("");
    setSuccessMessage("");
    setStatusMessage("");
  }

  function savePendingAmount(value) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("clxt_pending_usdt_amount", value);
    } catch (error) {
      console.error(error);
    }
  }

  function restorePendingAmount() {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("clxt_pending_usdt_amount");
      if (saved) setUsdtAmount(saved);
    } catch (error) {
      console.error(error);
    }
  }

  function formatWallet(address) {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  function openInMetaMask() {
    if (typeof window === "undefined") return;
    const cleanUrl = window.location.href.replace(/^https?:\/\//, "");
    window.location.href = `https://link.metamask.io/dapp/${cleanUrl}`;
  }

  async function getProvider() {
    if (typeof window === "undefined" || typeof window.ethereum === "undefined") {
      throw new Error("MetaMask is not installed");
    }
    return new ethers.BrowserProvider(window.ethereum);
  }

  async function restoreExistingWallet() {
    if (typeof window === "undefined" || !window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_accounts", []);
      const network = await provider.getNetwork();

      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
      }

      setNetworkName(network?.name || "Ethereum");
    } catch (error) {
      console.error("Wallet restore failed:", error);
    }
  }

  async function connectWallet() {
    clearMessages();

    if (typeof window === "undefined") return;

    if (typeof window.ethereum === "undefined") {
      if (isMobile) {
        openInMetaMask();
        return;
      }
      setErrorMessage("MetaMask is not installed");
      return;
    }

    try {
      setIsConnecting(true);

      const provider = await getProvider();
      const accounts = await provider.send("eth_requestAccounts", []);
      const network = await provider.getNetwork();

      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setSuccessMessage("Wallet connected successfully");
      }

      setNetworkName(network?.name || "Ethereum");
    } catch (error) {
      if (error?.code === 4001) return;
      console.error("Connect wallet error:", error);
      setErrorMessage("Wallet connection failed");
    } finally {
      setIsConnecting(false);
    }
  }

  async function loadPresaleInfo() {
    try {
      if (typeof window === "undefined" || !window.ethereum) return;

      const provider = await getProvider();
      const presale = new ethers.Contract(PRESALE_CONTRACT_ADDRESS, PRESALE_ABI, provider);

      const [minPurchase, stage, salePaused, claimEnabled, remainingInStage] = await Promise.all([
        presale.minPurchase(),
        presale.stage(),
        presale.salePaused(),
        presale.claimEnabled(),
        presale.remainingInStage()
      ]);

      setPresaleInfo({
        minPurchase: Number(ethers.formatUnits(minPurchase, 6)),
        stage: Number(stage),
        salePaused,
        claimEnabled,
        remainingInStage: Number(ethers.formatUnits(remainingInStage, 18)).toLocaleString(undefined, {
          maximumFractionDigits: 0
        })
      });
    } catch (error) {
      console.error("Failed to load presale info:", error);
    }
  }

  async function loadWalletData() {
    try {
      if (!walletAddress) return;

      const provider = await getProvider();
      const presale = new ethers.Contract(PRESALE_CONTRACT_ADDRESS, PRESALE_ABI, provider);
      const usdt = new ethers.Contract(USDT_TOKEN_ADDRESS, ERC20_ABI, provider);

      const [balanceRaw, allowanceRaw, buyerInfo] = await Promise.all([
        usdt.balanceOf(walletAddress),
        usdt.allowance(walletAddress, PRESALE_CONTRACT_ADDRESS),
        presale.buyerInfo(walletAddress)
      ]);

      setWalletData({
        usdtBalance: Number(ethers.formatUnits(balanceRaw, 6)).toFixed(2),
        allowance: Number(ethers.formatUnits(allowanceRaw, 6)).toFixed(2),
        usdtSpent: Number(ethers.formatUnits(buyerInfo[0], 6)).toFixed(2),
        totalPurchased: Number(ethers.formatUnits(buyerInfo[1], 18)).toLocaleString(undefined, {
          maximumFractionDigits: 2
        }),
        totalClaimed: Number(ethers.formatUnits(buyerInfo[2], 18)).toLocaleString(undefined, {
          maximumFractionDigits: 2
        }),
        claimable: Number(ethers.formatUnits(buyerInfo[3], 18)).toLocaleString(undefined, {
          maximumFractionDigits: 2
        })
      });
    } catch (error) {
      console.error("Failed to load wallet data:", error);
    }
  }

  function handleUsdtAmountChange(event) {
    const value = event.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setUsdtAmount(value);
      savePendingAmount(value);
      clearMessages();
    }
  }

  function handlePresetAmountSelect(value) {
    setUsdtAmount(value);
    savePendingAmount(value);
    clearMessages();
  }

  async function handleApproveUSDT() {
    clearMessages();

    if (!walletAddress) {
      await connectWallet();
      return;
    }

    if (!numericUsdtAmount || numericUsdtAmount <= 0) {
      setErrorMessage("Please enter a valid USDT amount");
      return;
    }

    try {
      setIsApproving(true);

      const provider = await getProvider();
      const signer = await provider.getSigner();
      const usdt = new ethers.Contract(USDT_TOKEN_ADDRESS, ERC20_ABI, signer);

      const amount = ethers.parseUnits(usdtAmount, 6);

      setStatusMessage("Waiting for USDT approval confirmation...");
      const tx = await usdt.approve(PRESALE_CONTRACT_ADDRESS, amount);

      setStatusMessage("Approval submitted. Waiting for blockchain confirmation...");
      await tx.wait();

      setStatusMessage("");
      setSuccessMessage("USDT approved successfully");
      await loadWalletData();
    } catch (error) {
      if (error?.code === 4001) return;

      console.error("Approve error:", error);
      const friendlyMessage =
        error?.reason ||
        error?.shortMessage ||
        error?.message ||
        "USDT approval failed";

      setStatusMessage("");
      setErrorMessage(friendlyMessage);
    } finally {
      setIsApproving(false);
    }
  }

  async function handleBuy() {
    clearMessages();

    if (!walletAddress) {
      await connectWallet();
      return;
    }

    if (!numericUsdtAmount || numericUsdtAmount <= 0) {
      setErrorMessage("Please enter a valid USDT amount");
      return;
    }

    if (numericUsdtAmount < Number(presaleInfo.minPurchase || MIN_PURCHASE_USD)) {
      setErrorMessage(`Minimum purchase is ${Number(presaleInfo.minPurchase || MIN_PURCHASE_USD).toFixed(2)} USDT`);
      return;
    }

    if (!hasEnoughAllowance) {
      setErrorMessage("Please approve USDT first");
      return;
    }

    try {
      setIsBuying(true);

      const provider = await getProvider();
      const signer = await provider.getSigner();
      const presale = new ethers.Contract(PRESALE_CONTRACT_ADDRESS, PRESALE_ABI, signer);

      const amount = ethers.parseUnits(usdtAmount, 6);

      setStatusMessage("Waiting for purchase confirmation...");
      const tx = await presale.buyWithUSDT(amount);

      setStatusMessage("Purchase submitted. Waiting for blockchain confirmation...");
      await tx.wait();

      setStatusMessage("");
      setSuccessMessage("Purchase completed successfully");

      await loadPresaleInfo();
      await loadWalletData();
    } catch (error) {
      if (error?.code === 4001) return;

      console.error("Purchase error:", error);
      const friendlyMessage =
        error?.reason ||
        error?.shortMessage ||
        error?.message ||
        "Purchase failed";

      setStatusMessage("");
      setErrorMessage(friendlyMessage);
    } finally {
      setIsBuying(false);
    }
  }

  async function handleClaimTokens() {
    clearMessages();

    if (!walletAddress) {
      await connectWallet();
      return;
    }

    try {
      setIsClaiming(true);

      const provider = await getProvider();
      const signer = await provider.getSigner();
      const presale = new ethers.Contract(PRESALE_CONTRACT_ADDRESS, PRESALE_ABI, signer);

      setStatusMessage("Waiting for claim confirmation...");
      const tx = await presale.claimTokens();

      setStatusMessage("Claim submitted. Waiting for blockchain confirmation...");
      await tx.wait();

      setStatusMessage("");
      setSuccessMessage("Tokens claimed successfully");

      await loadWalletData();
    } catch (error) {
      if (error?.code === 4001) return;

      console.error("Claim error:", error);
      const friendlyMessage =
        error?.reason ||
        error?.shortMessage ||
        error?.message ||
        "Claim failed";

      setStatusMessage("");
      setErrorMessage(friendlyMessage);
    } finally {
      setIsClaiming(false);
    }
  }

  function handleContactChange(event) {
    const { name, value } = event.target;
    setContactForm((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleContactSubmit(event) {
    event.preventDefault();
    setContactStatus("");

    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      setContactStatus("Please complete all contact fields.");
      return;
    }

    try {
      setIsSubmittingContact(true);

      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          name: contactForm.name,
          email: contactForm.email,
          message: contactForm.message
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "Failed to send message.");
      }

      setContactForm({
        name: "",
        email: "",
        message: ""
      });

      setContactStatus("Message sent successfully.");
    } catch (error) {
      console.error("Contact form error:", error);
      setContactStatus("Failed to send message. Please try again.");
    } finally {
      setIsSubmittingContact(false);
    }
  }

  return (
    <div className="page-shell">
      <main className="container">
        <section className="topbar">
          <div className="topbar-left">
            <div className="topbar-logo">CLXT</div>
            <div className="topbar-meta">
              <strong>{TOKEN_NAME}</strong>
              <span>Ethereum Presale Live</span>
            </div>
          </div>

          <div className="topbar-right"><a href="/onboard.html" style={{marginRight:"8px",padding:"8px 16px",background:"transparent",border:"1px solid #00C2D4",color:"#00C2D4",borderRadius:"8px",fontSize:"0.8rem",fontWeight:"700",textDecoration:"none",fontFamily:"Montserrat,sans-serif"}}>Apply for Access</a><a href="/platform.html" style={{marginRight:"12px",padding:"8px 16px",background:"linear-gradient(135deg,#00C2D4,#0099aa)",color:"#0A1628",borderRadius:"8px",fontSize:"0.8rem",fontWeight:"700",textDecoration:"none",fontFamily:"Montserrat,sans-serif"}}>Trade Platform</a>
            <a href={`https://etherscan.io/address/${PRESALE_CONTRACT_ADDRESS}`} target="_blank" rel="noreferrer">
              Presale
            </a>
            <a href={`https://etherscan.io/address/${CLX_TOKEN_ADDRESS}`} target="_blank" rel="noreferrer">
              Token
            </a>
          </div>
        </section>

        <section className="hero">
          <div className="hero-badge">
            <span className="hero-logo">CLXT</span>
            <span>CrossLedger</span>
          </div>

          <p className="eyebrow">CrossLedger & CLXT</p>
          <h1>{TAGLINE}</h1>
          <p className="hero-copy">
            A blockchain-powered platform designed to modernise cross-border commodity trade
            through smart escrow, verified digital documentation, real-time visibility and
            token-enabled settlement.
          </p>

          <div className="hero-actions">
            <button
              className="primary-btn"
              onClick={connectWallet}
              disabled={isConnecting}
            >
              {walletAddress
                ? `Connected: ${formatWallet(walletAddress)}`
                : isConnecting
                ? "Connecting..."
                : "Connect Wallet"}
            </button>
          </div>

          <div className="hero-highlights">
            <div className="highlight-box">
              <span>Current Price</span>
              <strong>US${CURRENT_PRICE_USD.toFixed(2)}</strong>
            </div>
            <div className="highlight-box">
              <span>Projected Launch</span>
              <strong>US${PROJECTED_LAUNCH_USD.toFixed(2)}</strong>
            </div>
            <div className="highlight-box">
              <span>Token</span>
              <strong>{TOKEN_SYMBOL}</strong>
            </div>
            <div className="highlight-box">
              <span>Network</span>
              <strong>{networkName || "Ethereum"}</strong>
            </div>
          </div>
        </section>

        <section className="progress-card glass">
          <div className="progress-top">
            <div>
              <span className="mini-label">Current progress</span>
              <div className="stat-value">{currentProgress.toFixed(2)}%</div>
            </div>
            <div>
              <span className="mini-label">If this round completes</span>
              <div className="stat-value">{projectedProgress.toFixed(2)}%</div>
            </div>
          </div>

          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${currentProgress}%` }} />
          </div>

          <p className="progress-text">
            Current progress: <strong>{currentProgress.toFixed(2)}%</strong> of total raise target.
            If the current pre-launch round completes, progress would move to{" "}
            <strong>{projectedProgress.toFixed(2)}%</strong>.
          </p>
        </section>

        <section className="transparency-strip">
          <div className="transparency-box glass">
            <span className="mini-label">Presale Contract</span>
            <strong>{formatWallet(PRESALE_CONTRACT_ADDRESS)}</strong>
            <a href={`https://etherscan.io/address/${PRESALE_CONTRACT_ADDRESS}`} target="_blank" rel="noreferrer">
              View on Etherscan
            </a>
          </div>

          <div className="transparency-box glass">
            <span className="mini-label">Token Contract</span>
            <strong>{formatWallet(CLX_TOKEN_ADDRESS)}</strong>
            <a href={`https://etherscan.io/address/${CLX_TOKEN_ADDRESS}`} target="_blank" rel="noreferrer">
              View on Etherscan
            </a>
          </div>

          <div className="transparency-box glass">
            <span className="mini-label">Payment Token</span>
            <strong>USDT</strong>
            <a href={`https://etherscan.io/address/${USDT_TOKEN_ADDRESS}`} target="_blank" rel="noreferrer">
              View Token
            </a>
          </div>
        </section>

        <section className="main-grid">
          <div className="left-col">
            <section className="buy-card white-card">
              <div className="section-head">
                <p className="section-kicker">USDT Presale</p>
                <h2>Buy {TOKEN_SYMBOL}</h2>
                <p className="section-copy">
                  This presale purchases {TOKEN_SYMBOL} using USDT. Connect your wallet, approve USDT,
                  commit the purchase, and claim tokens once claims are enabled.
                </p>
              </div>

              <div className="metric-grid">
                <div className="metric-box">
                  <span className="metric-label">Current Price</span>
                  <span className="metric-value">US${CURRENT_PRICE_USD.toFixed(2)}</span>
                </div>

                <div className="metric-box">
                  <span className="metric-label">Projected Launch</span>
                  <span className="metric-value">US${PROJECTED_LAUNCH_USD.toFixed(2)}</span>
                </div>

                <div className="metric-box">
                  <span className="metric-label">Current Stage</span>
                  <span className="metric-value">Stage {presaleInfo.stage}</span>
                </div>

                <div className="metric-box">
                  <span className="metric-label">Remaining This Stage</span>
                  <span className="metric-value small">{presaleInfo.remainingInStage} {TOKEN_SYMBOL}</span>
                </div>
              </div>

              <label className="input-label">Amount in USDT</label>
              <input
                className="usdt-input"
                type="text"
                inputMode="decimal"
                value={usdtAmount}
                onChange={handleUsdtAmountChange}
                placeholder={String(presaleInfo.minPurchase || MIN_PURCHASE_USD)}
              />

              <div className="preset-grid">
                {["200", "500", "1000", "2500"].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    className={`preset-btn ${usdtAmount === amount ? "active" : ""}`}
                    onClick={() => handlePresetAmountSelect(amount)}
                  >
                    {amount} USDT
                  </button>
                ))}
              </div>

              <div className="action-grid">
                <button
                  className="approve-btn"
                  onClick={handleApproveUSDT}
                  disabled={isApproving || isConnecting}
                >
                  {isApproving ? "Approving..." : "Approve USDT"}
                </button>

                <button
                  className="buy-btn"
                  onClick={handleBuy}
                  disabled={isBuying || isConnecting || presaleInfo.salePaused}
                >
                  {isBuying ? "Processing..." : "Commit Purchase"}
                </button>
              </div>

              <button
                className="claim-btn"
                onClick={handleClaimTokens}
                disabled={isClaiming || !presaleInfo.claimEnabled}
              >
                {isClaiming ? "Claiming..." : presaleInfo.claimEnabled ? "Claim Tokens" : "Claim Not Enabled Yet"}
              </button>

              {statusMessage ? <div className="status-box info">{statusMessage}</div> : null}
              {successMessage ? <div className="status-box success">{successMessage}</div> : null}
              {errorMessage ? <div className="status-box error">{errorMessage}</div> : null}

              <div className="summary-list">
                <div className="summary-row">
                  <span>Minimum purchase</span>
                  <strong>{Number(presaleInfo.minPurchase || MIN_PURCHASE_USD).toFixed(2)} USDT</strong>
                </div>

                <div className="summary-row">
                  <span>Estimated {TOKEN_SYMBOL}</span>
                  <strong>
                    {estimatedTokens > 0
                      ? Number(estimatedTokens).toLocaleString(undefined, {
                          maximumFractionDigits: 2
                        })
                      : "—"}
                  </strong>
                </div>

                <div className="summary-row">
                  <span>Wallet status</span>
                  <strong>{walletAddress ? `Connected (${formatWallet(walletAddress)})` : "Not connected"}</strong>
                </div>

                <div className="summary-row">
                  <span>Network</span>
                  <strong>{networkName || "Ethereum"}</strong>
                </div>

                <div className="summary-row">
                  <span>Sale status</span>
                  <strong>{presaleInfo.salePaused ? "Paused" : "Active"}</strong>
                </div>

                <div className="summary-row">
                  <span>Claim status</span>
                  <strong>{presaleInfo.claimEnabled ? "Enabled" : "Disabled"}</strong>
                </div>

                <div className="summary-row">
                  <span>USDT balance</span>
                  <strong>{walletData.usdtBalance} USDT</strong>
                </div>

                <div className="summary-row">
                  <span>Approved allowance</span>
                  <strong>{walletData.allowance} USDT</strong>
                </div>

                <div className="summary-row">
                  <span>Total USDT spent</span>
                  <strong>{walletData.usdtSpent} USDT</strong>
                </div>

                <div className="summary-row">
                  <span>Total {TOKEN_SYMBOL} purchased</span>
                  <strong>{walletData.totalPurchased}</strong>
                </div>

                <div className="summary-row">
                  <span>Total {TOKEN_SYMBOL} claimed</span>
                  <strong>{walletData.totalClaimed}</strong>
                </div>

                <div className="summary-row">
                  <span>Claimable {TOKEN_SYMBOL}</span>
                  <strong>{walletData.claimable}</strong>
                </div>
              </div>
            </section>

            <section className="content-card glass">
              <p className="section-kicker light">How The Purchase Works</p>
              <h3>Real presale flow from your smart contract</h3>
              <div className="steps">
                <div className="step">
                  <span>1</span>
                  <div>
                    <strong>Connect wallet</strong>
                    <p>Users connect MetaMask on desktop or mobile.</p>
                  </div>
                </div>
                <div className="step">
                  <span>2</span>
                  <div>
                    <strong>Enter USDT amount</strong>
                    <p>The contract accepts USDT with a minimum purchase threshold.</p>
                  </div>
                </div>
                <div className="step">
                  <span>3</span>
                  <div>
                    <strong>Approve USDT</strong>
                    <p>The user authorises the presale contract to spend the selected amount of USDT.</p>
                  </div>
                </div>
                <div className="step">
                  <span>4</span>
                  <div>
                    <strong>Commit purchase</strong>
                    <p>The website calls <code>buyTokens(uint256 usdtAmount)</code> on the presale contract.</p>
                  </div>
                </div>
                <div className="step">
                  <span>5</span>
                  <div>
                    <strong>Claim later</strong>
                    <p>When claims are enabled, the buyer can claim purchased tokens directly from the site.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="content-card glass">
              <p className="section-kicker light">The Problem</p>
              <h3>Trade still depends on outdated infrastructure</h3>
              <div className="bullet-list">
                <div>Manual documentation slows transactions and increases risk.</div>
                <div>Settlement can take too long across multiple jurisdictions.</div>
                <div>Trade verification is fragmented and expensive.</div>
                <div>Smaller businesses struggle to access reliable cross-border infrastructure.</div>
              </div>
            </section>

            <section className="content-card glass">
              <p className="section-kicker light">The Solution</p>
              <h3>CrossLedger Platform + {TOKEN_SYMBOL} Utility</h3>
              <div className="bullet-list">
                <div>Smart escrow and conditional release of funds.</div>
                <div>Blockchain-backed document integrity and visibility.</div>
                <div>Tiered wallets and tools for trade participants.</div>
                <div>{TOKEN_SYMBOL} utility across fees, services, incentives and platform access.</div>
              </div>
            </section>

            <section className="content-card glass">
              <p className="section-kicker light">Why CrossLedger</p>
              <h3>Infrastructure with real commercial use case</h3>
              <div className="adv-grid">
                <div className="adv-box">
                  <strong>Trade Utility</strong>
                  <p>Designed around real-world global trade activity rather than short-term hype alone.</p>
                </div>
                <div className="adv-box">
                  <strong>Transparent Access</strong>
                  <p>Contract references and investor-facing information are placed clearly on the website.</p>
                </div>
                <div className="adv-box">
                  <strong>On-Chain Workflow</strong>
                  <p>Approval, purchase and claim flow are all tied directly to your live contract logic.</p>
                </div>
                <div className="adv-box">
                  <strong>Scalable Platform Vision</strong>
                  <p>Built to grow into broader settlement, verification and trade support infrastructure.</p>
                </div>
              </div>
            </section>

            <section className="content-card glass">
              <p className="section-kicker light">Product Advantages</p>
              <h3>Why CrossLedger is differentiated</h3>
              <div className="adv-grid">
                <div className="adv-box">
                  <strong>Speed & Efficiency</strong>
                  <p>Settlement and validation are faster than traditional workflows.</p>
                </div>
                <div className="adv-box">
                  <strong>Lower Costs</strong>
                  <p>Reduced dependency on paper-heavy and intermediary-heavy processes.</p>
                </div>
                <div className="adv-box">
                  <strong>Security & Trust</strong>
                  <p>Smart escrow and transparent on-chain records strengthen confidence.</p>
                </div>
                <div className="adv-box">
                  <strong>Global Accessibility</strong>
                  <p>Built for real trade corridors, including underserved markets.</p>
                </div>
                <div className="adv-box">
                  <strong>Service Access</strong>
                  <p>Wallet tiers and token utility connect users to premium platform functions.</p>
                </div>
                <div className="adv-box">
                  <strong>Scalable Infrastructure</strong>
                  <p>Designed for expansion across global commodity and trade networks.</p>
                </div>
              </div>
            </section>

            <section className="allocation-card white-card">
              <div className="section-head">
                <p className="section-kicker">Token Allocation</p>
                <h2>Structured for adoption and growth</h2>
              </div>

              <div className="allocation-grid">
                {TOKEN_ALLOCATION.map((item) => (
                  <div key={item.title} className="allocation-box">
                    <div className="allocation-top">
                      <strong>{item.title}</strong>
                      <span>{item.percent}</span>
                    </div>
                    <p>{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="content-card glass">
              <p className="section-kicker light">FAQ</p>
              <h3>Frequently asked questions</h3>
              <div className="faq-list">
                {FAQS.map((item) => (
                  <details key={item.q} className="faq-item">
                    <summary>{item.q}</summary>
                    <p>{item.a}</p>
                  </details>
                ))}
              </div>
            </section>
          </div>

          <div className="right-col">
            <section className="content-card glass">
              <p className="section-kicker light">Recent Purchases</p>
              <h3>Latest activity</h3>
              <div className="activity-list">
                {RECENT_ACTIVITY.map((item, index) => (
                  <div key={`${item.buyer}-${index}`} className="activity-row">
                    <div>
                      <div className="activity-buyer">{item.buyer}</div>
                      <div className="activity-status">{item.status}</div>
                    </div>
                    <div className="activity-amount">{item.amount}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="content-card glass">
              <p className="section-kicker light">Transparency</p>
              <h3>Project references</h3>
              <div className="link-card-list">
                {SOCIAL_LINKS.map((item) => (
                  <a key={item.label} href={item.href} target="_blank" rel="noreferrer" className="link-card">
                    <span>{item.label}</span>
                    <strong>Open</strong>
                  </a>
                ))}
              </div>
            </section>

            <section className="content-card glass">
              <p className="section-kicker light">Phases</p>
              <h3>Project phases</h3>
              <div className="phase-item">
                <div className="phase-badge">Phase 1</div>
                <div>
                  <strong>Token Launch & Presale</strong>
                  <p>Brand, token distribution, early investor participation and platform onboarding.</p>
                </div>
              </div>
              <div className="phase-item">
                <div className="phase-badge">Phase 2</div>
                <div>
                  <strong>Trade Validation Platform</strong>
                  <p>Digital document workflows, escrow and transaction support functions.</p>
                </div>
              </div>
              <div className="phase-item">
                <div className="phase-badge">Phase 3</div>
                <div>
                  <strong>Global Commodity Network</strong>
                  <p>Expansion into broader trade corridors, enterprise users and strategic integrations.</p>
                </div>
              </div>
            </section>

            <section className="content-card glass">
              <p className="section-kicker light">Business Model</p>
              <h3>Where the token fits</h3>
              <div className="bullet-list">
                <div>Platform service fees including smart escrow and verification workflows.</div>
                <div>Utility access for different wallet tiers and services.</div>
                <div>Token-enabled discounts, incentives and retention mechanisms.</div>
                <div>Scalable commercial adoption through enterprise and trade users.</div>
              </div>
            </section>

            <section className="content-card glass">
              <p className="section-kicker light">Target Market</p>
              <h3>Cross-border trade corridors</h3>
              <div className="bullet-list">
                <div>Asia-Pacific, the Middle East and Latin America.</div>
                <div>Commodity, agriculture, metals and SME trade flows.</div>
                <div>Markets where documentation and settlement delays create major pain points.</div>
                <div>Trade participants requiring transparency, speed and verifiable workflows.</div>
              </div>
            </section>

            <section className="content-card glass">
              <p className="section-kicker light">Roadmap</p>
              <h3>Execution roadmap</h3>
              <div className="roadmap-item">
                <div className="dot" />
                <div>
                  <strong>Q1</strong>
                  <p>Website launch, presale, wallet integration and early community buildout.</p>
                </div>
              </div>
              <div className="roadmap-item">
                <div className="dot" />
                <div>
                  <strong>Q2</strong>
                  <p>Platform architecture, strategic outreach and pilot development.</p>
                </div>
              </div>
              <div className="roadmap-item">
                <div className="dot" />
                <div>
                  <strong>Q3</strong>
                  <p>Trade verification workflows, document systems and operational deployment.</p>
                </div>
              </div>
              <div className="roadmap-item">
                <div className="dot" />
                <div>
                  <strong>Q4</strong>
                  <p>Network scaling, commercial growth and broader market integration.</p>
                </div>
              </div>
            </section>

            <section className="content-card glass">
              <p className="section-kicker light">Leadership</p>
              <h3>Core team</h3>
              <div className="team-item">
                <strong>Gui Di Nardo — Co-Founder & CEO</strong>
                <p>International trade specialist with broad commodity and cross-border execution experience.</p>
              </div>
              <div className="team-item">
                <strong>Tom Young — Co-Founder & CTO</strong>
                <p>Blockchain and technology lead focused on digital asset infrastructure and execution.</p>
              </div>
            </section>

            <section className="content-card glass">
              <p className="section-kicker light">Communication Box</p>
              <h3>Contact us</h3>

              <form onSubmit={handleContactSubmit} className="contact-form">
                <input
                  name="name"
                  value={contactForm.name}
                  onChange={handleContactChange}
                  placeholder="Your name"
                />
                <input
                  name="email"
                  type="email"
                  value={contactForm.email}
                  onChange={handleContactChange}
                  placeholder="Your email"
                />
                <textarea
                  name="message"
                  value={contactForm.message}
                  onChange={handleContactChange}
                  placeholder="Your message"
                />
                <button className="primary-btn contact-btn" type="submit" disabled={isSubmittingContact}>
                  {isSubmittingContact ? "Sending..." : "Send Message"}
                </button>
              </form>

              {contactStatus ? <div className="contact-status">{contactStatus}</div> : null}
            </section>
          </div>
        </section>

        <footer className="footer">
          <div>© GDN Enterprise Pty Ltd</div>
          <div>Powered by Ethereum</div>
          <a href="https://x.com/CrossLedgerCLX" target="_blank" rel="noreferrer" style={{color: "inherit", textDecoration: "none"}}>Follow us on X</a>
        </footer>
      </main>

      <style jsx>{`
        .page-shell {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(74, 132, 255, 0.18), transparent 28%),
            radial-gradient(circle at bottom right, rgba(30, 116, 255, 0.14), transparent 30%),
            linear-gradient(180deg, #081226 0%, #07142d 45%, #061a3f 100%);
          color: #fff;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          padding: 24px 16px 40px;
        }

        .container {
          max-width: 1320px;
          margin: 0 auto;
        }

        .glass {
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(14px);
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.18);
        }

        .white-card {
          background: #f7f8fb;
          color: #0a1734;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25);
        }

        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          padding: 8px 0 18px;
        }

        .topbar-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .topbar-logo {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #2b63ff, #123a8c);
          font-weight: 800;
          font-size: 13px;
        }

        .topbar-meta {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .topbar-meta strong {
          font-size: 15px;
        }

        .topbar-meta span {
          color: rgba(255, 255, 255, 0.6);
          font-size: 13px;
        }

        .topbar-right {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .topbar-right a {
          color: rgba(255, 255, 255, 0.82);
          text-decoration: none;
          padding: 10px 14px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.05);
          font-size: 14px;
          font-weight: 600;
        }

        .hero {
          text-align: center;
          padding: 18px 0 28px;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 18px;
          font-weight: 700;
        }

        .hero-logo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 12px;
          background: linear-gradient(135deg, #2b63ff, #123a8c);
        }

        .eyebrow,
        .section-kicker,
        .mini-label {
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-size: 12px;
          font-weight: 700;
        }

        .eyebrow {
          color: rgba(255, 255, 255, 0.75);
          margin: 0 0 10px;
        }

        .hero h1 {
          margin: 0 0 16px;
          font-size: clamp(38px, 7vw, 76px);
          line-height: 1.02;
          letter-spacing: -0.04em;
          font-weight: 800;
        }

        .hero-copy {
          margin: 0 auto;
          max-width: 900px;
          font-size: clamp(18px, 2.5vw, 24px);
          line-height: 1.65;
          color: rgba(255, 255, 255, 0.84);
        }

        .hero-actions {
          margin-top: 26px;
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 14px;
        }

        .hero-highlights {
          margin-top: 22px;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }

        .highlight-box {
          padding: 16px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.08);
          text-align: center;
        }

        .highlight-box span {
          display: block;
          color: rgba(255, 255, 255, 0.62);
          font-size: 13px;
          margin-bottom: 6px;
        }

        .highlight-box strong {
          font-size: 20px;
          font-weight: 800;
        }

        .primary-btn,
        .buy-btn,
        .approve-btn,
        .claim-btn,
        .preset-btn {
          transition: transform 0.15s ease, opacity 0.15s ease, box-shadow 0.15s ease;
        }

        .primary-btn:hover,
        .buy-btn:hover,
        .approve-btn:hover,
        .claim-btn:hover,
        .preset-btn:hover {
          transform: translateY(-1px);
        }

        .primary-btn {
          min-width: 260px;
          height: 66px;
          padding: 0 22px;
          border-radius: 18px;
          border: none;
          background: linear-gradient(135deg, #3f77ff 0%, #2b57df 100%);
          color: #fff;
          font-size: 18px;
          font-weight: 800;
          box-shadow: 0 16px 36px rgba(42, 88, 224, 0.35);
        }

        .progress-card {
          border-radius: 28px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .progress-top {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
          margin-bottom: 18px;
        }

        .mini-label {
          color: rgba(255, 255, 255, 0.7);
        }

        .stat-value {
          font-size: clamp(24px, 4vw, 34px);
          font-weight: 800;
          margin-top: 6px;
        }

        .progress-bar {
          height: 14px;
          background: rgba(255, 255, 255, 0.12);
          border-radius: 999px;
          overflow: hidden;
          margin-bottom: 14px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #69a6ff 0%, #8be2b5 100%);
          border-radius: 999px;
        }

        .progress-text {
          margin: 0;
          color: rgba(255, 255, 255, 0.83);
          line-height: 1.7;
        }

        .transparency-strip {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 28px;
        }

        .transparency-box {
          border-radius: 22px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .transparency-box strong {
          font-size: 18px;
          font-weight: 800;
        }

        .transparency-box a {
          color: #9fd0ff;
          text-decoration: none;
          font-weight: 700;
          font-size: 14px;
        }

        .main-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.18fr) minmax(0, 0.82fr);
          gap: 28px;
          align-items: start;
        }

        .left-col,
        .right-col {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .buy-card,
        .content-card,
        .allocation-card {
          border-radius: 30px;
          padding: 26px;
        }

        .section-head {
          margin-bottom: 10px;
        }

        .section-kicker {
          margin: 0 0 8px;
          color: #607290;
        }

        .section-kicker.light {
          color: rgba(255, 255, 255, 0.68);
        }

        .buy-card h2,
        .allocation-card h2 {
          margin: 0 0 10px;
          font-size: clamp(34px, 6vw, 58px);
          line-height: 1.04;
          letter-spacing: -0.03em;
          font-weight: 800;
        }

        .content-card h3,
        .allocation-card h2 {
          color: #fff;
        }

        .white-card h2,
        .white-card h3,
        .white-card .section-copy,
        .white-card .section-kicker,
        .white-card .input-label {
          color: #0a1734;
        }

        .content-card h3 {
          margin: 0 0 16px;
          font-size: clamp(26px, 4vw, 36px);
          font-weight: 800;
        }

        .section-copy {
          margin: 0 0 22px;
          font-size: clamp(18px, 3vw, 26px);
          line-height: 1.55;
          color: #4a5d7c;
        }

        .metric-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }

        .metric-box {
          background: #f2f5fa;
          border: 2px solid #d8e0ec;
          border-radius: 22px;
          padding: 20px 18px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .metric-label {
          color: #64748f;
          font-size: 18px;
        }

        .metric-value {
          color: #0a1734;
          font-size: clamp(26px, 4vw, 34px);
          font-weight: 800;
        }

        .metric-value.small {
          font-size: clamp(18px, 3vw, 24px);
          line-height: 1.35;
        }

        .input-label {
          display: block;
          margin-bottom: 12px;
          font-size: clamp(22px, 4vw, 32px);
          font-weight: 800;
        }

        .usdt-input {
          width: 100%;
          height: 88px;
          border-radius: 22px;
          border: 2px solid #d8e0ec;
          padding: 0 22px;
          font-size: clamp(22px, 4vw, 30px);
          color: #0a1734;
          outline: none;
          box-sizing: border-box;
          background: #fff;
          margin-bottom: 18px;
        }

        .preset-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 18px;
        }

        .preset-btn {
          height: 74px;
          border-radius: 20px;
          border: 2px solid #d8e0ec;
          background: #fff;
          color: #0a1734;
          font-size: 22px;
          font-weight: 800;
        }

        .preset-btn.active {
          border-color: #2d57e0;
          box-shadow: 0 10px 22px rgba(45, 87, 224, 0.14);
        }

        .action-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 14px;
        }

        .approve-btn,
        .buy-btn {
          width: 100%;
          height: 86px;
          border: none;
          border-radius: 24px;
          color: #fff;
          font-size: clamp(20px, 3vw, 28px);
          font-weight: 800;
        }

        .approve-btn {
          background: linear-gradient(135deg, #305bc6 0%, #274699 100%);
        }

        .buy-btn {
          background: linear-gradient(90deg, #071225 0%, #162b48 100%);
        }

        .claim-btn {
          width: 100%;
          height: 76px;
          border: none;
          border-radius: 22px;
          background: linear-gradient(135deg, #2f7d6b 0%, #22594b 100%);
          color: #fff;
          font-size: 20px;
          font-weight: 800;
          margin-bottom: 18px;
        }

        .status-box {
          border-radius: 20px;
          padding: 18px 20px;
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 14px;
          word-break: break-word;
        }

        .status-box.info {
          background: #e8eefc;
          color: #2048a2;
        }

        .status-box.success {
          background: #def4e7;
          color: #17623f;
        }

        .status-box.error {
          background: #f7dddd;
          color: #a12626;
        }

        .summary-list {
          border-top: 1px solid #d8e0ec;
          padding-top: 16px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          padding: 8px 0;
          align-items: flex-start;
          flex-wrap: wrap;
          color: #5f7190;
        }

        .summary-row strong {
          color: #0a1734;
          text-align: right;
        }

        .bullet-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .bullet-list > div {
          color: rgba(255, 255, 255, 0.86);
          line-height: 1.65;
          padding-left: 18px;
          position: relative;
        }

        .bullet-list > div::before {
          content: "";
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: linear-gradient(135deg, #69a6ff, #8be2b5);
          position: absolute;
          left: 0;
          top: 11px;
        }

        .steps {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .step {
          display: flex;
          gap: 14px;
          align-items: flex-start;
        }

        .step span {
          min-width: 34px;
          height: 34px;
          border-radius: 999px;
          background: rgba(103, 162, 255, 0.16);
          border: 1px solid rgba(255, 255, 255, 0.12);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
        }

        .step p,
        .phase-item p,
        .team-item p,
        .roadmap-item p,
        .adv-box p,
        .allocation-box p,
        .faq-item p {
          margin: 6px 0 0;
          color: rgba(255, 255, 255, 0.82);
          line-height: 1.65;
        }

        .step code {
          color: #9fd0ff;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        }

        .adv-grid,
        .allocation-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .adv-box {
          padding: 18px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .allocation-box {
          padding: 18px;
          border-radius: 20px;
          background: #f2f5fa;
          border: 1px solid #dde4ef;
          color: #0a1734;
        }

        .allocation-box p {
          color: #5b6d88;
        }

        .allocation-top {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 8px;
        }

        .allocation-top span {
          font-weight: 800;
          color: #2d57e0;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
        }

        .activity-row {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: center;
          padding: 14px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .activity-buyer {
          font-weight: 700;
        }

        .activity-status {
          margin-top: 4px;
          color: rgba(255, 255, 255, 0.64);
          font-size: 14px;
        }

        .activity-amount {
          color: #8be2b5;
          font-weight: 800;
          text-align: right;
        }

        .link-card-list {
          display: grid;
          gap: 12px;
        }

        .link-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 16px 18px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.08);
          text-decoration: none;
          color: #fff;
        }

        .link-card strong {
          color: #9fd0ff;
        }

        .phase-item,
        .roadmap-item,
        .team-item {
          padding: 12px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .phase-item {
          display: flex;
          gap: 14px;
        }

        .phase-badge {
          min-width: 78px;
          height: fit-content;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(103, 162, 255, 0.14);
          text-align: center;
          font-weight: 700;
        }

        .roadmap-item {
          display: flex;
          gap: 14px;
          align-items: flex-start;
        }

        .dot {
          width: 12px;
          height: 12px;
          border-radius: 999px;
          background: linear-gradient(135deg, #69a6ff, #8be2b5);
          margin-top: 8px;
          flex-shrink: 0;
        }

        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .faq-item {
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.04);
          border-radius: 18px;
          padding: 16px 18px;
        }

        .faq-item summary {
          cursor: pointer;
          font-weight: 700;
          list-style: none;
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .contact-form input,
        .contact-form textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
          border-radius: 16px;
          padding: 16px;
          outline: none;
          font-size: 16px;
        }

        .contact-form input {
          height: 58px;
        }

        .contact-form textarea {
          min-height: 140px;
          resize: vertical;
          font-family: inherit;
        }

        .contact-btn {
          width: 100%;
        }

        .contact-status {
          margin-top: 14px;
          color: rgba(255, 255, 255, 0.82);
          line-height: 1.6;
        }

        .footer {
          margin-top: 36px;
          padding: 24px 8px 8px;
          display: flex;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          color: rgba(255, 255, 255, 0.62);
          font-size: 14px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        @media (max-width: 1080px) {
          .main-grid {
            grid-template-columns: 1fr;
          }

          .transparency-strip,
          .hero-highlights {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 760px) {
          .page-shell {
            padding: 18px 12px 32px;
          }

          .topbar {
            flex-direction: column;
            align-items: flex-start;
          }

          .progress-top,
          .metric-grid,
          .adv-grid,
          .allocation-grid,
          .preset-grid,
          .action-grid,
          .transparency-strip,
          .hero-highlights {
            grid-template-columns: 1fr;
          }

          .buy-card,
          .content-card,
          .allocation-card,
          .progress-card {
            padding: 20px;
            border-radius: 24px;
          }

          .primary-btn {
            width: 100%;
            min-width: 0;
          }

          .hero-actions {
            width: 100%;
          }

          .hero-copy {
            font-size: 17px;
          }

          .usdt-input {
            height: 82px;
          }

          .approve-btn,
          .buy-btn {
            height: 78px;
          }

          .claim-btn {
            height: 72px;
          }

          .footer {
            flex-direction: column;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
}
