import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { ethers, JsonRpcProvider } from "ethers";

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
  "function presaleActive() view returns (bool)"
];

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)"
];

const RECENT_ACTIVITY = [];

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
  { q: "What token is being sold in this presale?", a: "The presale is for CLXT, the CrossLedger token designed to support global trade infrastructure, platform services, and ecosystem utility." },
  { q: "What currency do buyers use?", a: "Purchases are made in USDT through the live Ethereum presale contract." },
  { q: "Do buyers receive tokens immediately?", a: "Yes. This is a direct-send presale. When your buyWithUSDT transaction is confirmed on-chain, CLXT tokens are transferred directly to your wallet in the same transaction. There is no separate claim step." },
  { q: "What is the current minimum purchase?", a: "The minimum purchase is 200 USDT, which gives you 2,000 CLXT at the Stage 1 presale price of US$0.10 per token." },
  { q: "Where can I verify the contracts?", a: "The transparency section below provides direct links to the presale contract and token contract on Etherscan." },
  { q: "What is CrossLedger and what problem does it solve?", a: "CrossLedger is a blockchain-powered platform designed to modernise cross-border commodity trade. It addresses slow manual documentation, fragmented trade verification, lengthy settlement periods, and high intermediary costs by deploying smart escrow contracts, blockchain-backed document integrity, and CLXT token-enabled settlement workflows." },
  { q: "What is the CLXT presale price and projected launch price?", a: "During Stage 1 of the presale, CLXT is available at US$0.10 per token. The projected platform launch price is US$13.50. Always conduct your own research before participating." },
  { q: "How many presale stages are there?", a: "The presale is structured in stages, with Stage 1 currently active. Each stage may have a different token price and allocation limit. Buyers who participate earlier benefit from the lowest available price." },
  { q: "Is the presale contract audited or verified?", a: "The presale contract and token contract are deployed on the Ethereum mainnet and are publicly verifiable on Etherscan. Links to both contracts are provided in the Transparency section of this page." },
  { q: "What network does CLXT run on?", a: "CLXT is an ERC-20 token deployed on the Ethereum mainnet. All presale transactions and claims are processed on-chain. You will need a compatible Ethereum wallet such as MetaMask to participate." },
  { q: "What wallets are compatible with the CrossLedger presale?", a: "The CrossLedger presale supports MetaMask on both desktop and mobile. Ensure you are connected to the Ethereum mainnet and have sufficient USDT and ETH for gas fees before purchasing." },
  { q: "Are there risks involved in participating in the presale?", a: "All token presales carry risk including market risk, liquidity risk, regulatory risk, and technology risk. CLXT is a utility token and should not be considered a guaranteed investment. Only commit funds you can afford to lose." },
  { q: "When will CLXT be listed on exchanges?", a: "Exchange listing plans will be announced following completion of presale stages and platform launch milestones. 10% of the total token allocation is reserved for exchange liquidity. Follow @CrossLedgerCLX on X for official announcements." },
  { q: "What is the total token allocation breakdown?", a: "The CLXT supply is allocated as: Ecosystem & Trade Incentives 35%, Treasury & Compliance 20%, Founders & Team 15%, Strategic Investors 15%, Exchange & Liquidity 10%, Operations & Partnerships 5%." },
  { q: "How do I contact the CrossLedger team?", a: "Use the Contact Us form at the bottom of this page, or follow and message CrossLedger on X at @CrossLedgerCLX. The team aims to respond to genuine enquiries within 2 business days." }
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
    if (typeof window !== "undefined" && window.ethereum) {
      return new ethers.BrowserProvider(window.ethereum);
    }
    return new JsonRpcProvider("https://ethereum.publicnode.com");
  }

  function getReadProvider() {
    return new JsonRpcProvider("https://ethereum.publicnode.com");
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
      const provider = getReadProvider();
      const presale = new ethers.Contract(PRESALE_CONTRACT_ADDRESS, PRESALE_ABI, provider);
      const clxtToken = new ethers.Contract(CLX_TOKEN_ADDRESS, ERC20_ABI, provider);
      const [isActive, remainingRaw] = await Promise.all([
        presale.presaleActive(),
        clxtToken.balanceOf(PRESALE_CONTRACT_ADDRESS)
      ]);
      const remainingFormatted = Number(ethers.formatUnits(remainingRaw, 18)).toLocaleString(undefined, { maximumFractionDigits: 0 });
      setPresaleInfo({
        minPurchase: MIN_PURCHASE_USD,
        stage: 1,
        salePaused: !isActive,
        claimEnabled: false,
        remainingInStage: remainingFormatted
      });
    } catch (error) {
      console.error("Failed to load presale info:", error);
    }
  }

  async function loadWalletData() {
    try {
      if (!walletAddress) return;
      const provider = getReadProvider();
      const usdt = new ethers.Contract(USDT_TOKEN_ADDRESS, ERC20_ABI, provider);
      const [balanceRaw, allowanceRaw] = await Promise.all([
        usdt.balanceOf(walletAddress),
        usdt.allowance(walletAddress, PRESALE_CONTRACT_ADDRESS)
      ]);
      setWalletData({
        usdtBalance: Number(ethers.formatUnits(balanceRaw, 6)).toFixed(2),
        allowance: Number(ethers.formatUnits(allowanceRaw, 6)).toFixed(2),
        usdtSpent: "0",
        totalPurchased: "0",
        totalClaimed: "0",
        claimable: "0"
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
      <Head>
          <title>CrossLedger (CLXT) — Blockchain Trade Infrastructure Token | Presale Live</title>
          <meta name="description" content="CrossLedger (CLXT) is a blockchain-powered platform modernising cross-border commodity trade with smart escrow, digital documentation, and token-enabled settlement. Stage 1 presale now live at US$0.10." />
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href="https://www.crossledger.trade/" />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://www.crossledger.trade/" />
          <meta property="og:site_name" content="CrossLedger" />
          <meta property="og:title" content="CrossLedger (CLXT) — Blockchain Trade Infrastructure Token | Presale Live" />
          <meta property="og:description" content="CrossLedger (CLXT) modernises cross-border commodity trade with smart escrow, digital documentation, and token-enabled settlement on Ethereum. Stage 1 presale live at US$0.10." />
          <meta property="og:image" content="https://www.crossledger.trade/og-image.png" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@CrossLedgerCLX" />
          <meta name="twitter:title" content="CrossLedger (CLXT) — Blockchain Trade Infrastructure Token" />
          <meta name="twitter:description" content="Modernising cross-border commodity trade with smart escrow, digital documentation and token-enabled settlement. Stage 1 presale live at US$0.10." />
          <meta name="twitter:image" content="https://www.crossledger.trade/og-image.png" />
          <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context":"https://schema.org","@graph":[{"@type":"Organization","@id":"https://www.crossledger.trade/#organization","name":"CrossLedger","url":"https://www.crossledger.trade/","legalName":"GDN Enterprise Pty Ltd","description":"CrossLedger is a blockchain-powered platform modernising cross-border commodity trade through smart escrow, verified digital documentation, real-time visibility and token-enabled settlement.","foundingDate":"2025","sameAs":["https://x.com/CrossLedgerCLX"],"founders":[{"@type":"Person","name":"Gui Di Nardo","jobTitle":"Co-Founder & CEO"},{"@type":"Person","name":"Tom Young","jobTitle":"Co-Founder & CTO"}]},{"@type":"WebSite","@id":"https://www.crossledger.trade/#website","url":"https://www.crossledger.trade/","name":"CrossLedger","publisher":{"@id":"https://www.crossledger.trade/#organization"}}]})}} />
        </Head>
        
      <main className="container">
        {/* ===== ANNOUNCEMENT BANNER ===== */}
      <div style={{background:"linear-gradient(90deg,#00C2D4,#0099aa)",color:"#0A1628",textAlign:"center",padding:"10px 20px",fontSize:"0.82rem",fontWeight:"700",letterSpacing:"0.04em",fontFamily:"Montserrat,sans-serif"}}>
        🌐 CrossLedger Presale Stage 1 LIVE &mdash; CLXT at US$0.10 &nbsp;·&nbsp; <a href="/onboard.html" style={{color:"#0A1628",textDecoration:"underline",fontWeight:"800"}}>Apply for Early Access →</a>
      </div>
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
      {/* ===== STATS STRIP ===== */}
      <section style={{background:"rgba(0,194,212,0.05)",borderTop:"1px solid rgba(0,194,212,0.12)",borderBottom:"1px solid rgba(0,194,212,0.12)",padding:"16px 24px"}}>
        <div style={{maxWidth:"960px",margin:"0 auto",display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"center",gap:"24px"}}>
          <div style={{textAlign:"center"}}><div style={{fontSize:"1.3rem",fontWeight:"800",color:"#00C2D4",fontFamily:"Montserrat,sans-serif"}}>On-Chain</div><div style={{fontSize:"0.67rem",color:"#64748b",letterSpacing:"0.07em",textTransform:"uppercase"}}>Smart Escrow</div></div>
          <div style={{width:"1px",height:"30px",background:"rgba(255,255,255,0.07)"}}></div>
          <div style={{textAlign:"center"}}><div style={{fontSize:"1.3rem",fontWeight:"800",color:"#00C2D4",fontFamily:"Montserrat,sans-serif"}}>USDT</div><div style={{fontSize:"0.67rem",color:"#64748b",letterSpacing:"0.07em",textTransform:"uppercase"}}>Settlement</div></div>
          <div style={{width:"1px",height:"30px",background:"rgba(255,255,255,0.07)"}}></div>
          <div style={{textAlign:"center"}}><div style={{fontSize:"1.3rem",fontWeight:"800",color:"#00C2D4",fontFamily:"Montserrat,sans-serif"}}>Ethereum</div><div style={{fontSize:"0.67rem",color:"#64748b",letterSpacing:"0.07em",textTransform:"uppercase"}}>Network</div></div>
          <div style={{width:"1px",height:"30px",background:"rgba(255,255,255,0.07)"}}></div>
          <div style={{textAlign:"center"}}><div style={{fontSize:"1.3rem",fontWeight:"800",color:"#00C2D4",fontFamily:"Montserrat,sans-serif"}}>Stage 1</div><div style={{fontSize:"0.67rem",color:"#64748b",letterSpacing:"0.07em",textTransform:"uppercase"}}>Presale Active</div></div>
          <div style={{width:"1px",height:"30px",background:"rgba(255,255,255,0.07)"}}></div>
          <div style={{textAlign:"center"}}><div style={{fontSize:"1.3rem",fontWeight:"800",color:"#00C2D4",fontFamily:"Montserrat,sans-serif"}}>3</div><div style={{fontSize:"0.67rem",color:"#64748b",letterSpacing:"0.07em",textTransform:"uppercase"}}>Trade Corridors</div></div>
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
                  This presale purchases {TOKEN_SYMBOL} using USDT. Connect your wallet, approve USDT, and commit the purchase. Tokens are sent directly to your wallet upon confirmation.
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

              <div style={{padding:"14px 18px",borderRadius:"18px",background:"rgba(139,226,181,0.12)",border:"1px solid rgba(139,226,181,0.25)",color:"#8be2b5",fontSize:"0.88rem",fontWeight:"600",textAlign:"center",marginBottom:"18px"}}>
          ✓ Tokens sent directly to your wallet on purchase — no claim step needed
        </div>

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
                  <span>USDT balance</span>
                  <strong>{walletData.usdtBalance} USDT</strong>
                </div>

                <div className="summary-row">
                  <span>Approved allowance</span>
                  <strong>{walletData.allowance} USDT</strong>
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
                    <p>The website calls <code>buyWithUSDT(uint256 usdtAmount)</code> on the presale contract.</p>
                  </div>
                </div>
                <div className="step">
                  <span>5</span>
                  <div>
                    <strong>Receive tokens</strong>
                <p>Tokens are transferred directly to your wallet as part of the purchase transaction. No separate claim step required.</p>
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
              <h3 style={{marginBottom:"20px"}}>Infrastructure with real commercial use</h3>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"14px"}}>
                <div style={{background:"rgba(0,194,212,0.08)",border:"1px solid rgba(0,194,212,0.18)",borderRadius:"12px",padding:"18px"}}>
                  <div style={{fontSize:"1.6rem",marginBottom:"8px"}}>⚡</div>
                  <div style={{fontWeight:"700",color:"#00C2D4",marginBottom:"5px",fontFamily:"Montserrat,sans-serif",fontSize:"0.88rem"}}>Trade Utility</div>
                  <div style={{color:"#94a3b8",fontSize:"0.8rem",lineHeight:"1.5"}}>Designed around real-world global trade, not short-term speculation.</div>
                </div>
                <div style={{background:"rgba(0,194,212,0.08)",border:"1px solid rgba(0,194,212,0.18)",borderRadius:"12px",padding:"18px"}}>
                  <div style={{fontSize:"1.6rem",marginBottom:"8px"}}>🔍</div>
                  <div style={{fontWeight:"700",color:"#00C2D4",marginBottom:"5px",fontFamily:"Montserrat,sans-serif",fontSize:"0.88rem"}}>Transparent Access</div>
                  <div style={{color:"#94a3b8",fontSize:"0.8rem",lineHeight:"1.5"}}>Contract references and investor information on-chain and visible on-site.</div>
                </div>
                <div style={{background:"rgba(0,194,212,0.08)",border:"1px solid rgba(0,194,212,0.18)",borderRadius:"12px",padding:"18px"}}>
                  <div style={{fontSize:"1.6rem",marginBottom:"8px"}}>⛓️</div>
                  <div style={{fontWeight:"700",color:"#00C2D4",marginBottom:"5px",fontFamily:"Montserrat,sans-serif",fontSize:"0.88rem"}}>On-Chain Workflow</div>
                  <div style={{color:"#94a3b8",fontSize:"0.8rem",lineHeight:"1.5"}}>Approval, purchase and claim tied directly to live smart contract logic.</div>
                </div>
                <div style={{background:"rgba(0,194,212,0.08)",border:"1px solid rgba(0,194,212,0.18)",borderRadius:"12px",padding:"18px"}}>
                  <div style={{fontSize:"1.6rem",marginBottom:"8px"}}>🌐</div>
                  <div style={{fontWeight:"700",color:"#00C2D4",marginBottom:"5px",fontFamily:"Montserrat,sans-serif",fontSize:"0.88rem"}}>Scalable Platform</div>
                  <div style={{color:"#94a3b8",fontSize:"0.8rem",lineHeight:"1.5"}}>Built to expand into settlement, verification and broader trade infrastructure.</div>
                </div>
              </div>
              </section>

            <section className="content-card glass">
              <p className="section-kicker light">Product Advantages</p>
              <h2 style={{marginBottom:"20px"}}>Why CrossLedger is differentiated</h2>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"14px"}}>
                <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"12px",padding:"18px"}}>
                  <div style={{fontSize:"1.6rem",marginBottom:"8px"}}>🚀</div>
                  <div style={{fontWeight:"700",color:"#e2e8f0",marginBottom:"5px",fontFamily:"Montserrat,sans-serif",fontSize:"0.88rem"}}>Speed &amp; Efficiency</div>
                  <div style={{color:"#94a3b8",fontSize:"0.8rem",lineHeight:"1.5"}}>Settlement and validation faster than traditional workflows.</div>
                </div>
                <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"12px",padding:"18px"}}>
                  <div style={{fontSize:"1.6rem",marginBottom:"8px"}}>💰</div>
                  <div style={{fontWeight:"700",color:"#e2e8f0",marginBottom:"5px",fontFamily:"Montserrat,sans-serif",fontSize:"0.88rem"}}>Lower Costs</div>
                  <div style={{color:"#94a3b8",fontSize:"0.8rem",lineHeight:"1.5"}}>Reduced dependency on paper-heavy intermediary processes.</div>
                </div>
                <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"12px",padding:"18px"}}>
                  <div style={{fontSize:"1.6rem",marginBottom:"8px"}}>🔒</div>
                  <div style={{fontWeight:"700",color:"#e2e8f0",marginBottom:"5px",fontFamily:"Montserrat,sans-serif",fontSize:"0.88rem"}}>Security &amp; Trust</div>
                  <div style={{color:"#94a3b8",fontSize:"0.8rem",lineHeight:"1.5"}}>Smart escrow and transparent on-chain records build confidence.</div>
                </div>
                <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"12px",padding:"18px"}}>
                  <div style={{fontSize:"1.6rem",marginBottom:"8px"}}>🌍</div>
                  <div style={{fontWeight:"700",color:"#e2e8f0",marginBottom:"5px",fontFamily:"Montserrat,sans-serif",fontSize:"0.88rem"}}>Global Accessibility</div>
                  <div style={{color:"#94a3b8",fontSize:"0.8rem",lineHeight:"1.5"}}>Built for real trade corridors including underserved markets.</div>
                </div>
                <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"12px",padding:"18px"}}>
                  <div style={{fontSize:"1.6rem",marginBottom:"8px"}}>🎫</div>
                  <div style={{fontWeight:"700",color:"#e2e8f0",marginBottom:"5px",fontFamily:"Montserrat,sans-serif",fontSize:"0.88rem"}}>Service Access</div>
                  <div style={{color:"#94a3b8",fontSize:"0.8rem",lineHeight:"1.5"}}>Wallet tiers and token utility connect to premium platform functions.</div>
                </div>
                <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"12px",padding:"18px"}}>
                  <div style={{fontSize:"1.6rem",marginBottom:"8px"}}>📈</div>
                  <div style={{fontWeight:"700",color:"#e2e8f0",marginBottom:"5px",fontFamily:"Montserrat,sans-serif",fontSize:"0.88rem"}}>Scalable Infrastructure</div>
                  <div style={{color:"#94a3b8",fontSize:"0.8rem",lineHeight:"1.5"}}>Designed for expansion across global commodity and trade networks.</div>
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
              <h2>Frequently asked questions</h2>
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
              <h2>Latest activity</h2>
              <div className="activity-list">
                <div style={{textAlign:"center",padding:"18px 0",color:"rgba(255,255,255,0.65)",fontSize:"0.88rem",lineHeight:"1.7"}}>
                  All purchases are processed on-chain and publicly verifiable.<br />
                  <a href={`https://etherscan.io/address/${PRESALE_CONTRACT_ADDRESS}#tokentxns`} target="_blank" rel="noreferrer" style={{color:"#9fd0ff",fontWeight:"700",textDecoration:"none"}}>
                    View all transactions on Etherscan ↗
                  </a>
                </div>
              </div>
            </section>

            <section className="content-card glass">
              <p className="section-kicker light">Transparency</p>
              <h2>Project references</h2>
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
              <h2>Project phases</h2>
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
              <h2>Where the token fits</h2>
              <div className="bullet-list">
                <div>Platform service fees including smart escrow and verification workflows.</div>
                <div>Utility access for different wallet tiers and services.</div>
                <div>Token-enabled discounts, incentives and retention mechanisms.</div>
                <div>Scalable commercial adoption through enterprise and trade users.</div>
              </div>
            </section>

            <section className="content-card glass">
              <p className="section-kicker light">Target Market</p>
              <h2>Cross-border trade corridors</h2>
              <div className="bullet-list">
                <div>Asia-Pacific, the Middle East and Latin America.</div>
                <div>Commodity, agriculture, metals and SME trade flows.</div>
                <div>Markets where documentation and settlement delays create major pain points.</div>
                <div>Trade participants requiring transparency, speed and verifiable workflows.</div>
              </div>
            </section>

            <section className="content-card glass">
              <p className="section-kicker light">Roadmap</p>
              <h2>Execution roadmap</h2>
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
              <h2>Core team</h2>
              <div className="team-item">
                <strong>Gui Di Nardo — Co-Founder & CEO</strong>
                <p>International trade specialist with extensive experience in commodity trading, cross-border deal execution, and trade finance across Asia-Pacific and emerging markets. Gui brings deep commercial networks and operational expertise to guide CrossLedger's go-to-market strategy and enterprise partnerships. <a href="https://www.linkedin.com/in/guidinardo" target="_blank" rel="noopener noreferrer" style={{color:"#00d4aa",fontWeight:600,textDecoration:"none"}}>View LinkedIn Profile &rarr;</a></p>
              </div>
              <div className="team-item">
                <strong>Tom Young — Co-Founder & CTO</strong>
                <p>Blockchain architect and full-stack developer specialising in Ethereum smart contract development, digital asset infrastructure, and decentralised application deployment. Tom leads CrossLedger's technical architecture, smart contract security, and platform engineering. <a href="https://www.linkedin.com/in/tomyoung-blockchain" target="_blank" rel="noopener noreferrer" style={{color:"#00d4aa",fontWeight:600,textDecoration:"none"}}>View LinkedIn Profile &rarr;</a></p>
              </div>
            </section>

            <section className="content-card glass">
              <p className="section-kicker light">Communication Box</p>
              <h2>Contact us</h2>

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

        
        {/* ===== BLOG SECTION ===== */}
        <section id="blog" style={{padding:"60px 20px",maxWidth:"1100px",margin:"0 auto"}}>
          <p style={{textTransform:"uppercase",fontSize:"0.75rem",fontWeight:700,letterSpacing:"0.1em",color:"#00C2D4",marginBottom:"8px"}}>INSIGHTS</p>
          <h2 style={{fontSize:"2rem",fontWeight:800,color:"#fff",marginBottom:"12px"}}>CrossLedger Blog</h2>
          <p style={{color:"rgba(255,255,255,0.65)",marginBottom:"40px",maxWidth:"600px"}}>Insights on blockchain adoption in global trade finance, cross-border payments, and the CLXT token presale.</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"28px"}}>
            <article style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"16px",padding:"28px",display:"flex",flexDirection:"column"}}>
              <p style={{fontSize:"0.75rem",color:"#00C2D4",fontWeight:600,marginBottom:"10px",textTransform:"uppercase"}}>Trade Finance &bull; June 2025</p>
              <h3 style={{fontSize:"1.15rem",fontWeight:700,color:"#fff",marginBottom:"12px",lineHeight:1.4}}>Why Cross-Border Commodity Trade Needs Blockchain Now</h3>
              <p style={{fontSize:"0.9rem",color:"rgba(255,255,255,0.7)",lineHeight:1.7,marginBottom:"16px",flexGrow:1}}>Global commodity trade moves over $18 trillion annually, yet most transactions still rely on paper letters of credit, manual reconciliation across three or more banking intermediaries, and settlement windows of 5 to 14 business days. A single iron ore shipment from Australia to South Korea can involve a shipping company, an export credit agency, two correspondent banks, an insurance provider, and a customs authority — each maintaining separate ledgers, each introducing friction, cost, and counterparty risk. Blockchain changes this by creating a shared, immutable record that all parties read simultaneously. CrossLedger applies this to real trade corridors: Australia-Asia bulk commodities, East Africa agricultural exports, and South America energy logistics. By tokenising the letter of credit process on-chain, CrossLedger eliminates the need for multiple reconciliation steps, reduces settlement from days to hours, and cuts transaction costs by an estimated 60 to 80 percent for mid-market exporters who currently cannot access prime bank rates.</p>
              <span style={{fontSize:"0.82rem",color:"#00C2D4",fontWeight:600}}>Read Article &rarr;</span>
            </article>
            <article style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"16px",padding:"28px",display:"flex",flexDirection:"column"}}>
              <p style={{fontSize:"0.75rem",color:"#00C2D4",fontWeight:600,marginBottom:"10px",textTransform:"uppercase"}}>Smart Contracts &bull; July 2025</p>
              <h3 style={{fontSize:"1.15rem",fontWeight:700,color:"#fff",marginBottom:"12px",lineHeight:1.4}}>How Smart Escrow Eliminates Counterparty Risk in Global Trade</h3>
              <p style={{fontSize:"0.9rem",color:"rgba(255,255,255,0.7)",lineHeight:1.7,marginBottom:"16px",flexGrow:1}}>Counterparty risk — the possibility that the other side of a trade deal will default or fail to deliver — is the single largest friction point in international commerce. Traditional trade finance addresses this through letters of credit issued by banks, but these instruments are expensive (typically 1 to 3 percent of transaction value), slow to issue, and inaccessible to smaller exporters in emerging markets. Smart escrow contracts deployed on a public blockchain provide an alternative: funds are locked in a verifiable on-chain escrow and released automatically only when delivery conditions are confirmed. CrossLedger's smart escrow module uses oracle-verified shipping data, port arrival confirmations, and quality inspection certificates to trigger fund release without requiring manual bank intervention. For a coffee exporter in Ethiopia shipping to European buyers, this means receiving payment within 24 hours of confirmed delivery rather than waiting 30 days for bank processing. The CLXT token serves as the gas and governance token within this escrow system, aligning incentives between platform users and long-term token holders.</p>
              <span style={{fontSize:"0.82rem",color:"#00C2D4",fontWeight:600}}>Read Article &rarr;</span>
            </article>
            <article style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"16px",padding:"28px",display:"flex",flexDirection:"column"}}>
              <p style={{fontSize:"0.75rem",color:"#00C2D4",fontWeight:600,marginBottom:"10px",textTransform:"uppercase"}}>Token Economics &bull; August 2025</p>
              <h3 style={{fontSize:"1.15rem",fontWeight:700,color:"#fff",marginBottom:"12px",lineHeight:1.4}}>CLXT Token Utility: Beyond Speculation, Real Trade Infrastructure</h3>
              <p style={{fontSize:"0.9rem",color:"rgba(255,255,255,0.7)",lineHeight:1.7,marginBottom:"16px",flexGrow:1}}>Most utility tokens described at launch never develop genuine on-chain utility. CLXT is designed differently: token demand is directly tied to transaction volume on the CrossLedger platform, not to speculative market sentiment. Every trade financed through the platform requires CLXT for fee settlement, staking collateral, and dispute arbitration. As transaction volume grows — driven by real commercial trade flows in agriculture, energy, and industrial goods — demand for CLXT increases proportionally. The tokenomics are structured to prevent early dumping: 40 percent of the total supply is allocated to the ecosystem and liquidity reserves with a 24-month vesting schedule, team tokens are locked for 18 months post-launch, and presale participants receive a staking bonus for holding rather than selling immediately. The presale price of $0.003 per CLXT reflects the early-stage risk premium, with projected platform revenue providing a fundamental valuation anchor once live trade volumes are established. Investors who understand trade finance fundamentals — not just crypto cycles — represent CrossLedger's core audience.</p>
              <span style={{fontSize:"0.82rem",color:"#00C2D4",fontWeight:600}}>Read Article &rarr;</span>
            </article>
            <article style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"16px",padding:"28px",display:"flex",flexDirection:"column"}}>
              <p style={{fontSize:"0.75rem",color:"#00C2D4",fontWeight:600,marginBottom:"10px",textTransform:"uppercase"}}>Market Analysis &bull; September 2025</p>
              <h3 style={{fontSize:"1.15rem",fontWeight:700,color:"#fff",marginBottom:"12px",lineHeight:1.4}}>Asia-Pacific Trade Corridors: A $2T Opportunity for Blockchain Infrastructure</h3>
              <p style={{fontSize:"0.9rem",color:"rgba(255,255,255,0.7)",lineHeight:1.7,marginBottom:"16px",flexGrow:1}}>The Asia-Pacific region accounts for approximately 40 percent of global merchandise trade, with intra-regional flows exceeding $2 trillion annually. Despite this scale, the documentary infrastructure supporting these flows remains largely analogue: paper bills of lading, fax-based instructions to freight forwarders, and correspondent banking chains that can involve four or five institutions between an Indonesian palm oil exporter and a Chinese processor. The Asian Development Bank estimates the global trade finance gap — the difference between demand for financing and what banks currently supply — at $2.5 trillion, with 40 percent of rejected applications coming from SMEs in developing Asia. CrossLedger targets precisely this gap. By providing blockchain-verified documentary trade services at a fraction of traditional bank costs, the platform opens trade finance access to mid-market exporters in Vietnam, Indonesia, the Philippines, and across East Africa. Early pilot corridors include Australian iron ore to South Korea, and Ethiopian specialty coffee to EU buyers. These are not theoretical use cases — they are active negotiations with logistics partners and commodity brokers who have committed to testing the platform on live shipments in Q1 2026.</p>
              <span style={{fontSize:"0.82rem",color:"#00C2D4",fontWeight:600}}>Read Article &rarr;</span>
            </article>
          </div>
        </section>
        <footer className="footer">
        <div style={{maxWidth:"960px",margin:"0 auto",padding:"40px 24px 24px"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:"28px",marginBottom:"36px"}}>
            <div>
              <div style={{fontWeight:"800",color:"#00C2D4",fontSize:"0.95rem",fontFamily:"Montserrat,sans-serif",marginBottom:"10px"}}>CrossLedger</div>
              <p style={{color:"#475569",fontSize:"0.78rem",lineHeight:"1.6"}}>Blockchain-powered cross-border commodity trade infrastructure. Smart escrow, digital documentation, token-enabled settlement.</p>
            </div>
            <div>
              <div style={{fontWeight:"700",color:"#94a3b8",fontSize:"0.72rem",fontFamily:"Montserrat,sans-serif",marginBottom:"10px",textTransform:"uppercase",letterSpacing:"0.07em"}}>Platform</div>
              <div style={{display:"flex",flexDirection:"column",gap:"7px"}}>
                <a href="/platform.html" style={{color:"#475569",fontSize:"0.8rem",textDecoration:"none"}}>Trade Platform</a>
                <a href="/onboard.html" style={{color:"#475569",fontSize:"0.8rem",textDecoration:"none"}}>Apply for Access</a>
                <a href="#presale" style={{color:"#475569",fontSize:"0.8rem",textDecoration:"none"}}>Buy CLXT</a>
              </div>
            </div>
            <div>
              <div style={{fontWeight:"700",color:"#94a3b8",fontSize:"0.72rem",fontFamily:"Montserrat,sans-serif",marginBottom:"10px",textTransform:"uppercase",letterSpacing:"0.07em"}}>Token</div>
              <div style={{display:"flex",flexDirection:"column",gap:"7px"}}>
                <a href={`https://etherscan.io/address/${PRESALE_CONTRACT_ADDRESS}`} target="_blank" rel="noreferrer" style={{color:"#475569",fontSize:"0.8rem",textDecoration:"none"}}>Presale Contract ↗</a>
                <a href={`https://etherscan.io/token/${CLX_TOKEN_ADDRESS}`} target="_blank" rel="noreferrer" style={{color:"#475569",fontSize:"0.8rem",textDecoration:"none"}}>Token Contract ↗</a>
                <a href={`https://etherscan.io/token/${USDT_TOKEN_ADDRESS}`} target="_blank" rel="noreferrer" style={{color:"#475569",fontSize:"0.8rem",textDecoration:"none"}}>USDT on Etherscan ↗</a>
                <a href="/CrossLedger-CLXT-Whitepaper.pdf" target="_blank" rel="noreferrer" style={{color:"#475569",fontSize:"0.8rem",textDecoration:"none"}}>Whitepaper ↗</a>
              </div>
            </div>
            <div>
              <div style={{fontWeight:"700",color:"#94a3b8",fontSize:"0.72rem",fontFamily:"Montserrat,sans-serif",marginBottom:"10px",textTransform:"uppercase",letterSpacing:"0.07em"}}>Connect</div>
              <div style={{display:"flex",flexDirection:"column",gap:"7px"}}>
                <a href="https://x.com/CrossLedgerCLX" target="_blank" rel="noreferrer" style={{color:"#475569",fontSize:"0.8rem",textDecoration:"none"}}>Follow on X ↗</a>
                <span style={{color:"#475569",fontSize:"0.8rem"}}>GDN Enterprise Pty Ltd</span>
                <span style={{color:"#475569",fontSize:"0.8rem"}}>Powered by Ethereum</span>
              </div>
            </div>
          </div>
          <div style={{borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:"18px",display:"flex",flexWrap:"wrap",justifyContent:"space-between",alignItems:"center",gap:"10px"}}>
            <span style={{color:"#334155",fontSize:"0.73rem"}}>© 2025 GDN Enterprise Pty Ltd · CrossLedger &amp; CLXT Token</span>
            <span style={{color:"#334155",fontSize:"0.73rem"}}>Presale Stage 1 Active · Network: Ethereum</span>
          </div>
        </div>
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
