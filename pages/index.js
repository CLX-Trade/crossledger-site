import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0xCA30Cbe4D511Dd283e0FDe62d2215c42C358Ba4c";
const MIN_BUY_USD = 200;
const ASSUMED_ETH_USD = 2500;
const MIN_BUY_ETH = (MIN_BUY_USD / ASSUMED_ETH_USD).toFixed(4);

const CONTRACT_ABI = [
  {
    inputs: [],
    name: "buyTokens",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];

const TOKEN_CONFIG = {
  name: "CrossLedger",
  symbol: "CLX",
  network: "Ethereum",
  launchTag: "CrossLedger Pre-Launch & Presale",
  headline: "Blockchain infrastructure for the future of international trade",
  subheadline:
    "CrossLedger is being developed to support smart-contract-based international trade infrastructure. The current capital raise is structured toward a US$3,000,000 objective, with US$1,000,000 already secured, a live pre-launch round of US$750,000 at US$0.10 per token, and a second-stage presale balance of US$1,250,000 at US$0.50 per token.",
  currentPrice: "US$0.10",
  stageTwoPrice: "US$0.50",
  projectedLaunchPrice: "US$13.50",
  overallRaiseTarget: "US$3,000,000",
  alreadyRaised: "US$1,000,000",
  prelaunchTarget: "US$750,000",
  stageTwoTarget: "US$1,250,000",
  prelaunchTokens: "7,500,000 CLX",
  stageTwoTokens: "2,500,000 CLX",
  totalDefinedRoundTokens: "10,000,000 CLX",
  minBuy: "US$200",
  maxBuy: "TBA",
  acceptedCurrency: "ETH",
  vestingNote:
    "Current raise targets and active round pricing are defined. Broader tokenomics allocations and final vesting structure remain subject to final release settings.",
};

const RAISE_PROGRESS = {
  totalTarget: 3000000,
  alreadyRaised: 1000000,
  currentRoundTarget: 750000,
  nextStageTarget: 1250000,
};

const alreadyRaisedPct = (
  (RAISE_PROGRESS.alreadyRaised / RAISE_PROGRESS.totalTarget) *
  100
).toFixed(2);

const afterCurrentRoundPct = (
  ((RAISE_PROGRESS.alreadyRaised + RAISE_PROGRESS.currentRoundTarget) /
    RAISE_PROGRESS.totalTarget) *
  100
).toFixed(2);

const PRESALE_PHASES = [
  {
    phase: "Pre-Launch",
    price: "US$0.10",
    allocation: "7,500,000 CLX",
    raiseTarget: "US$750,000",
    status: "Current",
    description:
      "The current pre-launch round is structured to raise US$750,000 at US$0.10 per token, positioning early participants ahead of the wider presale.",
  },
  {
    phase: "Presale Stage 2",
    price: "US$0.50",
    allocation: "2,500,000 CLX",
    raiseTarget: "US$1,250,000",
    status: "Upcoming",
    description:
      "The second stage is designed to complete the remaining balance toward the US$3,000,000 raise target at US$0.50 per token.",
  },
  {
    phase: "Projected Launch",
    price: "US$13.50",
    allocation: "Market Release",
    raiseTarget: "N/A",
    status: "Projected",
    description:
      "The projected post-launch price is US$13.50 per token as the CrossLedger ecosystem expands through smart contract infrastructure built for international trade.",
  },
];

const TOKEN_FEATURES = [
  {
    title: "International Trade Utility",
    text: "CLX is intended to support a blockchain ecosystem where smart contracts can strengthen trust, execution, and transactional efficiency across international trade flows.",
  },
  {
    title: "Growth Through Smart Contracts",
    text: "The long-term value thesis for CLX is tied to the rollout of smart-contract infrastructure that supports real trade activity, settlement logic, and scalable commercial use cases.",
  },
  {
    title: "Structured Early Entry",
    text: "The pre-launch and staged presale model is designed to progressively fund ecosystem development while providing structured market entry ahead of broader launch.",
  },
];

const ROADMAP = [
  {
    stage: "Stage 1",
    title: "Pre-Launch Capital Raise",
    text: "Complete the current US$750,000 pre-launch round at US$0.10 per token while strengthening market confidence and ecosystem positioning.",
  },
  {
    stage: "Stage 2",
    title: "Presale Expansion",
    text: "Open the second-stage presale at US$0.50 per token to complete the remaining US$1,250,000 toward the US$3,000,000 raise objective.",
  },
  {
    stage: "Stage 3",
    title: "Launch and Utility Growth",
    text: "Support broader market rollout and expand smart contract functionality for international trade applications, with a projected launch reference of US$13.50 per token.",
  },
];

const FAQS = [
  {
    q: "How much is the current pre-launch price?",
    a: "The current pre-launch price is US$0.10 per CLX token.",
  },
  {
    q: "How much has already been raised?",
    a: "US$1,000,000 has already been raised toward the overall US$3,000,000 objective.",
  },
  {
    q: "What is the next presale stage price?",
    a: "The second presale stage is structured at US$0.50 per token.",
  },
  {
    q: "What is the projected launch price?",
    a: "The projected post-launch price referenced for CLX is US$13.50 per token.",
  },
];

function SectionTitle({ children, mobile }) {
  return (
    <h2
      style={{
        fontSize: mobile ? "24px" : "30px",
        fontWeight: 900,
        margin: "0 0 18px 0",
        letterSpacing: "-0.03em",
      }}
    >
      {children}
    </h2>
  );
}

function StatCard({ label, value, mobile }) {
  return (
    <div
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "18px",
        padding: mobile ? "16px" : "18px",
        boxSizing: "border-box",
        minWidth: 0,
      }}
    >
      <div
        style={{
          color: "#94a3b8",
          fontSize: mobile ? "12px" : "13px",
          marginBottom: "6px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: mobile ? "18px" : "22px",
          fontWeight: 800,
          lineHeight: 1.2,
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default function Home() {
  const [walletAddress, setWalletAddress] = useState("");
  const [ethAmount, setEthAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [txHash, setTxHash] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [isCheckingWallet, setIsCheckingWallet] = useState(true);

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactQuestion, setContactQuestion] = useState("");
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState("");
  const [contactError, setContactError] = useState("");

  const [screenWidth, setScreenWidth] = useState(1280);
  const [hasEthereum, setHasEthereum] = useState(false);

  const fallbackActivity = [
    { buyer: "0x71...9ab4", amount: "12,500 CLX", status: "Preview" },
    { buyer: "0x93...1fd2", amount: "4,800 CLX", status: "Preview" },
    { buyer: "0x28...7ce1", amount: "18,200 CLX", status: "Preview" },
  ];

  useEffect(() => {
    function handleResize() {
      setScreenWidth(window.innerWidth);
    }

    handleResize();
    setHasEthereum(typeof window !== "undefined" && !!window.ethereum);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const mobile = screenWidth < 768;
  const tablet = screenWidth >= 768 && screenWidth < 1100;

  const presaleStart = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() + 1);
    start.setHours(0, 0, 0, 0);
    return start;
  }, []);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.max(presaleStart.getTime() - now.getTime(), 0);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [presaleStart]);

  useEffect(() => {
    async function checkExistingWallet() {
      try {
        if (!window.ethereum) return;
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_accounts", []);
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
        }
      } catch (err) {
        console.error("Wallet check failed:", err);
      } finally {
        setIsCheckingWallet(false);
      }
    }

    checkExistingWallet();
  }, []);

  function openInMetaMask() {
    window.location.href = "https://link.metamask.io/dapp/crossledger.trade";
  }

  async function connectWallet() {
    try {
      setError("");
      setSuccess("");
      setTxHash("");
      setIsConnecting(true);

      if (!window.ethereum) {
        setError(
          "MetaMask is not installed in this browser. Use the Open in MetaMask button on mobile."
        );
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);

      if (!accounts || accounts.length === 0) {
        setError("No wallet account found");
        return;
      }

      setWalletAddress(accounts[0]);
    } catch (err) {
      console.error(err);

      if (err?.code === "ACTION_REJECTED" || err?.code === 4001) {
        setError("Wallet connection was cancelled.");
      } else {
        setError(err?.message || "Wallet connection failed");
      }
    } finally {
      setIsConnecting(false);
    }
  }

  async function buyTokens() {
    try {
      setError("");
      setSuccess("");
      setTxHash("");

      if (!window.ethereum) {
        setError(
          "MetaMask is not installed in this browser. Use the Open in MetaMask button on mobile."
        );
        return;
      }

      if (!walletAddress) {
        setError("Please connect your wallet first");
        return;
      }

      if (!ethAmount || Number(ethAmount) <= 0) {
        setError("Please enter a valid ETH amount");
        return;
      }

      if (Number(ethAmount) < Number(MIN_BUY_ETH)) {
        setError(
          `Minimum purchase is US$${MIN_BUY_USD} (approximately ${MIN_BUY_ETH} ETH based on ETH at US$${ASSUMED_ETH_USD}).`
        );
        return;
      }

      setIsBuying(true);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      const tx = await contract.buyTokens({
        value: ethers.parseEther(ethAmount),
      });

      setTxHash(tx.hash);
      setSuccess("Transaction submitted. Waiting for confirmation...");

      const receipt = await tx.wait();

      if (receipt.status === 1) {
        setSuccess(
          `Purchase successful. ${TOKEN_CONFIG.symbol} should arrive in your wallet.`
        );
      } else {
        setError("Transaction failed");
      }
    } catch (err) {
      console.error(err);

      if (err?.code === "ACTION_REJECTED" || err?.code === 4001) {
        setError("Transaction was cancelled in MetaMask.");
      } else if (err?.reason) {
        setError(err.reason);
      } else if (err?.shortMessage) {
        setError(err.shortMessage);
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError("Token purchase failed");
      }
    } finally {
      setIsBuying(false);
    }
  }

  async function submitContactForm(e) {
    e.preventDefault();
    setContactSuccess("");
    setContactError("");

    if (!contactName.trim() || !contactEmail.trim() || !contactQuestion.trim()) {
      setContactError("Please complete all contact form fields.");
      return;
    }

    try {
      setContactLoading(true);

      const response = await fetch("https://formspree.io/f/mlgpnvbk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          question: contactQuestion,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message.");
      }

      setContactSuccess("Thank you. Your message has been sent successfully.");
      setContactName("");
      setContactEmail("");
      setContactQuestion("");
    } catch (err) {
      console.error(err);
      setContactError(err.message || "Failed to send message.");
    } finally {
      setContactLoading(false);
    }
  }

  function shortAddress(address) {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  return (
    <>
      <Head>
        <title>CLX Presale</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          overflowX: "hidden",
          background:
            "radial-gradient(circle at top, #173055 0%, #0c1730 35%, #060b16 100%)",
          color: "#fff",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1280px",
            margin: "0 auto",
            padding: mobile ? "16px 14px 40px" : "28px 20px 72px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: mobile ? "column" : "row",
              justifyContent: "space-between",
              alignItems: mobile ? "stretch" : "center",
              gap: "18px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: mobile ? "12px" : "16px",
                minWidth: 0,
              }}
            >
              <img
                src="/B4FB988C-108A-4E70-9923-81BB722E9AB4.png"
                alt="CLX Logo"
                style={{
                  width: mobile ? "56px" : "72px",
                  height: mobile ? "56px" : "72px",
                  objectFit: "contain",
                  borderRadius: "14px",
                  background: "rgba(255,255,255,0.04)",
                  padding: "4px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                  flexShrink: 0,
                }}
              />

              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: mobile ? "26px" : "34px",
                    fontWeight: 900,
                    letterSpacing: "-0.03em",
                    lineHeight: 1.05,
                  }}
                >
                  {TOKEN_CONFIG.symbol} Presale
                </div>
                <div
                  style={{
                    color: "#94a3b8",
                    marginTop: "4px",
                    fontSize: mobile ? "13px" : "15px",
                    lineHeight: 1.4,
                  }}
                >
                  {TOKEN_CONFIG.name} • {TOKEN_CONFIG.network}
                </div>
              </div>
            </div>

            <button
              onClick={connectWallet}
              disabled={isConnecting || isCheckingWallet}
              style={{
                padding: mobile ? "14px 16px" : "14px 20px",
                borderRadius: "14px",
                border: "1px solid rgba(255,255,255,0.14)",
                background: walletAddress
                  ? "#14532d"
                  : "linear-gradient(135deg, #2563eb, #1d4ed8)",
                color: "#fff",
                fontWeight: 800,
                cursor: "pointer",
                width: mobile ? "100%" : "auto",
                minWidth: mobile ? "100%" : "210px",
                boxSizing: "border-box",
              }}
            >
              {isCheckingWallet
                ? "Checking Wallet..."
                : isConnecting
                ? "Connecting..."
                : walletAddress
                ? `Connected: ${shortAddress(walletAddress)}`
                : "Connect Wallet"}
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: mobile || tablet ? "1fr" : "1.35fr 0.82fr",
              gap: "24px",
              alignItems: "start",
            }}
          >
            <div
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: mobile ? "22px" : "28px",
                padding: mobile ? "20px 16px" : "30px",
                backdropFilter: "blur(10px)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
                boxSizing: "border-box",
                minWidth: 0,
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  background: "rgba(59,130,246,0.18)",
                  color: "#93c5fd",
                  fontWeight: 800,
                  fontSize: "12px",
                  borderRadius: "999px",
                  padding: "8px 14px",
                  marginBottom: "16px",
                }}
              >
                {TOKEN_CONFIG.launchTag}
              </div>

              <h1
                style={{
                  fontSize: mobile ? "34px" : tablet ? "44px" : "58px",
                  lineHeight: 1.02,
                  margin: "0 0 14px",
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                  maxWidth: "860px",
                }}
              >
                {TOKEN_CONFIG.headline}
              </h1>

              <p
                style={{
                  color: "#cbd5e1",
                  fontSize: mobile ? "15px" : "18px",
                  lineHeight: 1.7,
                  marginBottom: "24px",
                  maxWidth: "860px",
                }}
              >
                {TOKEN_CONFIG.subheadline}
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: mobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
                  gap: "12px",
                  marginBottom: "24px",
                }}
              >
                {[
                  { label: "Days", value: timeLeft.days },
                  { label: "Hours", value: timeLeft.hours },
                  { label: "Minutes", value: timeLeft.minutes },
                  { label: "Seconds", value: timeLeft.seconds },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "18px",
                      padding: mobile ? "14px 10px" : "18px 14px",
                      textAlign: "center",
                      boxSizing: "border-box",
                    }}
                  >
                    <div
                      style={{
                        fontSize: mobile ? "22px" : "30px",
                        fontWeight: 900,
                      }}
                    >
                      {String(item.value).padStart(2, "0")}
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: "12px" }}>
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: mobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
                  gap: "14px",
                  marginBottom: "24px",
                }}
              >
                <StatCard
                  label="Already Raised"
                  value={TOKEN_CONFIG.alreadyRaised}
                  mobile={mobile}
                />
                <StatCard
                  label="Current Round"
                  value={TOKEN_CONFIG.prelaunchTarget}
                  mobile={mobile}
                />
                <StatCard
                  label="Next Stage"
                  value={TOKEN_CONFIG.stageTwoTarget}
                  mobile={mobile}
                />
                <StatCard
                  label="Projected Launch"
                  value={TOKEN_CONFIG.projectedLaunchPrice}
                  mobile={mobile}
                />
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "20px",
                  padding: mobile ? "16px" : "18px",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                    marginBottom: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ fontWeight: 800 }}>Raise Progress</div>
                  <div style={{ color: "#93c5fd", fontWeight: 800 }}>
                    {TOKEN_CONFIG.alreadyRaised} of {TOKEN_CONFIG.overallRaiseTarget}
                  </div>
                </div>

                <div
                  style={{
                    width: "100%",
                    height: "14px",
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: "999px",
                    overflow: "hidden",
                    marginBottom: "10px",
                  }}
                >
                  <div
                    style={{
                      width: `${alreadyRaisedPct}%`,
                      height: "100%",
                      background:
                        "linear-gradient(90deg, #2563eb 0%, #22c55e 100%)",
                      borderRadius: "999px",
                    }}
                  />
                </div>

                <div style={{ color: "#cbd5e1", lineHeight: 1.7, fontSize: "14px" }}>
                  Current progress: <strong>{alreadyRaisedPct}%</strong> of total raise
                  target.
                  <br />
                  If the current pre-launch round completes, progress would move to{" "}
                  <strong>{afterCurrentRoundPct}%</strong>.
                </div>
              </div>
            </div>

            <div
              style={{
                background: "linear-gradient(180deg, #ffffff, #f5f8fc)",
                color: "#0f172a",
                borderRadius: mobile ? "22px" : "28px",
                padding: mobile ? "20px 16px" : "28px",
                boxShadow: "0 22px 60px rgba(0,0,0,0.28)",
                boxSizing: "border-box",
                minWidth: 0,
              }}
            >
              <div
                style={{
                  fontSize: mobile ? "24px" : "30px",
                  fontWeight: 900,
                  marginBottom: "8px",
                  letterSpacing: "-0.02em",
                }}
              >
                Buy {TOKEN_CONFIG.symbol}
              </div>

              <div style={{ color: "#475569", lineHeight: 1.6, marginBottom: "18px" }}>
                Connect your wallet and purchase directly with{" "}
                {TOKEN_CONFIG.acceptedCurrency}.
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "12px",
                    boxSizing: "border-box",
                  }}
                >
                  <div style={{ color: "#64748b", fontSize: "12px" }}>Current Price</div>
                  <div style={{ fontWeight: 900, marginTop: "4px" }}>
                    {TOKEN_CONFIG.currentPrice}
                  </div>
                </div>

                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "12px",
                    boxSizing: "border-box",
                  }}
                >
                  <div style={{ color: "#64748b", fontSize: "12px" }}>
                    Projected Launch
                  </div>
                  <div style={{ fontWeight: 900, marginTop: "4px" }}>
                    {TOKEN_CONFIG.projectedLaunchPrice}
                  </div>
                </div>
              </div>

              <label
                style={{
                  display: "block",
                  fontWeight: 800,
                  marginBottom: "8px",
                }}
              >
                Amount in ETH
              </label>

              <input
                type="number"
                placeholder={MIN_BUY_ETH}
                value={ethAmount}
                onChange={(e) => setEthAmount(e.target.value)}
                step="0.0001"
                min="0"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "15px 16px",
                  borderRadius: "14px",
                  border: "1px solid #cbd5e1",
                  fontSize: "16px",
                  marginBottom: "16px",
                  outline: "none",
                }}
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "10px",
                  marginBottom: "16px",
                }}
              >
                {[MIN_BUY_ETH, "0.10", "0.25", "0.50"].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setEthAmount(value)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "12px",
                      border: "1px solid #cbd5e1",
                      background: "#fff",
                      cursor: "pointer",
                      fontWeight: 700,
                      boxSizing: "border-box",
                    }}
                  >
                    {value} ETH
                  </button>
                ))}
              </div>

              <button
                onClick={buyTokens}
                disabled={isBuying}
                style={{
                  width: "100%",
                  padding: "15px 18px",
                  borderRadius: "14px",
                  border: "none",
                  background: "linear-gradient(135deg, #111827, #1f2937)",
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                {isBuying ? "Processing..." : `Buy ${TOKEN_CONFIG.symbol}`}
              </button>

              {!hasEthereum && (
                <button
                  onClick={openInMetaMask}
                  type="button"
                  style={{
                    width: "100%",
                    padding: "15px 18px",
                    borderRadius: "14px",
                    border: "1px solid #f59e0b",
                    background: "#f59e0b",
                    color: "#111827",
                    fontWeight: 900,
                    fontSize: "16px",
                    cursor: "pointer",
                    marginTop: "12px",
                  }}
                >
                  Open in MetaMask
                </button>
              )}

              {walletAddress && (
                <div
                  style={{
                    marginTop: "16px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "12px",
                    fontSize: "14px",
                    wordBreak: "break-all",
                  }}
                >
                  <strong>Connected wallet:</strong> {walletAddress}
                </div>
              )}

              {success && (
                <div
                  style={{
                    marginTop: "16px",
                    background: "#dcfce7",
                    color: "#166534",
                    borderRadius: "12px",
                    padding: "14px",
                    lineHeight: 1.5,
                  }}
                >
                  {success}
                </div>
              )}

              {error && (
                <div
                  style={{
                    marginTop: "16px",
                    background: "#fee2e2",
                    color: "#991b1b",
                    borderRadius: "12px",
                    padding: "14px",
                    lineHeight: 1.5,
                    wordBreak: "break-word",
                  }}
                >
                  {error}
                </div>
              )}

              {txHash && (
                <div
                  style={{
                    marginTop: "16px",
                    background: "#eff6ff",
                    color: "#1d4ed8",
                    borderRadius: "12px",
                    padding: "14px",
                    lineHeight: 1.5,
                    wordBreak: "break-all",
                  }}
                >
                  <strong>Transaction Hash:</strong>
                  <br />
                  {txHash}
                </div>
              )}

              <div
                style={{
                  marginTop: "18px",
                  borderTop: "1px solid #e2e8f0",
                  paddingTop: "16px",
                  color: "#64748b",
                  fontSize: "13px",
                  lineHeight: 1.6,
                }}
              >
                Minimum buy: US${MIN_BUY_USD}
                <br />
                Approximate minimum in ETH: {MIN_BUY_ETH} ETH
                <br />
                Maximum buy: {TOKEN_CONFIG.maxBuy}
              </div>
            </div>
          </div>

          <div style={{ marginTop: "26px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)",
                gap: "18px",
              }}
            >
              {TOKEN_FEATURES.map((item) => (
                <div
                  key={item.title}
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "22px",
                    padding: mobile ? "18px 16px" : "22px",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      fontSize: mobile ? "18px" : "20px",
                      fontWeight: 900,
                      marginBottom: "10px",
                    }}
                  >
                    {item.title}
                  </div>
                  <div style={{ color: "#cbd5e1", lineHeight: 1.7 }}>{item.text}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: "26px" }}>
            <div
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "24px",
                padding: mobile ? "20px 16px" : "24px",
                boxSizing: "border-box",
              }}
            >
              <SectionTitle mobile={mobile}>Presale Phases</SectionTitle>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)",
                  gap: "16px",
                }}
              >
                {PRESALE_PHASES.map((phase) => (
                  <div
                    key={phase.phase}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "20px",
                      padding: "20px",
                      boxSizing: "border-box",
                    }}
                  >
                    <div
                      style={{
                        display: "inline-block",
                        padding: "7px 12px",
                        borderRadius: "999px",
                        background:
                          phase.status === "Current"
                            ? "rgba(34,197,94,0.18)"
                            : phase.status === "Projected"
                            ? "rgba(168,85,247,0.18)"
                            : "rgba(59,130,246,0.18)",
                        color:
                          phase.status === "Current"
                            ? "#86efac"
                            : phase.status === "Projected"
                            ? "#d8b4fe"
                            : "#93c5fd",
                        fontWeight: 800,
                        fontSize: "12px",
                        marginBottom: "12px",
                      }}
                    >
                      {phase.status}
                    </div>

                    <div style={{ fontSize: "24px", fontWeight: 900, marginBottom: "8px" }}>
                      {phase.phase}
                    </div>
                    <div style={{ color: "#94a3b8", marginBottom: "6px" }}>
                      Price: <strong style={{ color: "#fff" }}>{phase.price}</strong>
                    </div>
                    <div style={{ color: "#94a3b8", marginBottom: "6px" }}>
                      Allocation: <strong style={{ color: "#fff" }}>{phase.allocation}</strong>
                    </div>
                    <div style={{ color: "#94a3b8", marginBottom: "12px" }}>
                      Raise Target:{" "}
                      <strong style={{ color: "#fff" }}>{phase.raiseTarget}</strong>
                    </div>
                    <div style={{ color: "#cbd5e1", lineHeight: 1.65 }}>
                      {phase.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: "26px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: mobile ? "1fr" : "1fr 1fr",
                gap: "20px",
              }}
            >
              <div
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "24px",
                  padding: mobile ? "20px 16px" : "24px",
                  boxSizing: "border-box",
                }}
              >
                <SectionTitle mobile={mobile}>Tokenomics & Raise Structure</SectionTitle>

                <div style={{ display: "grid", gap: "12px" }}>
                  {[
                    ["Overall Raise Target", "US$3,000,000"],
                    ["Already Raised", "US$1,000,000"],
                    ["Pre-Launch Raise", "US$750,000"],
                    ["Pre-Launch Price", "US$0.10"],
                    ["Pre-Launch Allocation", "7,500,000 CLX"],
                    ["Stage 2 Raise", "US$1,250,000"],
                    ["Stage 2 Price", "US$0.50"],
                    ["Stage 2 Allocation", "2,500,000 CLX"],
                    ["Defined Active Round Tokens", "10,000,000 CLX"],
                    ["Projected Launch Price", "US$13.50"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "10px",
                        background: "rgba(255,255,255,0.04)",
                        borderRadius: "14px",
                        padding: "14px 16px",
                        flexWrap: "wrap",
                        boxSizing: "border-box",
                      }}
                    >
                      <span style={{ color: "#cbd5e1" }}>{label}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>

                <div style={{ color: "#94a3b8", marginTop: "14px", lineHeight: 1.6 }}>
                  {TOKEN_CONFIG.vestingNote}
                </div>
              </div>

              <div
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "24px",
                  padding: mobile ? "20px 16px" : "24px",
                  boxSizing: "border-box",
                }}
              >
                <SectionTitle mobile={mobile}>Roadmap</SectionTitle>

                <div style={{ display: "grid", gap: "16px" }}>
                  {ROADMAP.map((item) => (
                    <div
                      key={item.stage}
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        borderRadius: "16px",
                        padding: "16px",
                        boxSizing: "border-box",
                      }}
                    >
                      <div style={{ color: "#93c5fd", fontWeight: 800, marginBottom: "6px" }}>
                        {item.stage}
                      </div>
                      <div style={{ fontSize: "20px", fontWeight: 900, marginBottom: "8px" }}>
                        {item.title}
                      </div>
                      <div style={{ color: "#cbd5e1", lineHeight: 1.65 }}>{item.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "26px" }}>
            <div
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "24px",
                padding: mobile ? "20px 16px" : "24px",
                boxSizing: "border-box",
              }}
            >
              <SectionTitle mobile={mobile}>Contact Us</SectionTitle>

              <form onSubmit={submitContactForm}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: mobile ? "1fr" : "1fr 1fr",
                    gap: "14px",
                    marginBottom: "14px",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Your name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    style={contactInputStyle}
                  />

                  <input
                    type="email"
                    placeholder="Your email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    style={contactInputStyle}
                  />
                </div>

                <textarea
                  placeholder="Your question"
                  value={contactQuestion}
                  onChange={(e) => setContactQuestion(e.target.value)}
                  rows={6}
                  style={{
                    ...contactInputStyle,
                    minHeight: mobile ? "150px" : "170px",
                    resize: "vertical",
                  }}
                />

                <button
                  type="submit"
                  disabled={contactLoading}
                  style={{
                    marginTop: "16px",
                    padding: "15px 22px",
                    borderRadius: "14px",
                    border: "none",
                    background: "#ffffff",
                    color: "#0f172a",
                    fontWeight: 900,
                    fontSize: "16px",
                    cursor: "pointer",
                    width: mobile ? "100%" : "auto",
                  }}
                >
                  {contactLoading ? "Sending..." : "Send Message"}
                </button>

                {contactSuccess && (
                  <div
                    style={{
                      marginTop: "16px",
                      background: "rgba(34,197,94,0.18)",
                      color: "#86efac",
                      borderRadius: "12px",
                      padding: "14px",
                      lineHeight: 1.5,
                    }}
                  >
                    {contactSuccess}
                  </div>
                )}

                {contactError && (
                  <div
                    style={{
                      marginTop: "16px",
                      background: "rgba(239,68,68,0.18)",
                      color: "#fca5a5",
                      borderRadius: "12px",
                      padding: "14px",
                      lineHeight: 1.5,
                    }}
                  >
                    {contactError}
                  </div>
                )}
              </form>
            </div>
          </div>

          <div style={{ marginTop: "26px" }}>
            <div
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "24px",
                padding: mobile ? "20px 16px" : "24px",
                boxSizing: "border-box",
              }}
            >
              <SectionTitle mobile={mobile}>Recent Activity</SectionTitle>

              <div style={{ display: "grid", gap: "12px" }}>
                {fallbackActivity.map((item, index) => (
                  <div
                    key={`${item.buyer}-${index}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: mobile ? "1fr" : "1fr 1fr auto",
                      gap: "12px",
                      alignItems: "center",
                      padding: "14px 16px",
                      borderRadius: "16px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      boxSizing: "border-box",
                    }}
                  >
                    <div>
                      <div style={{ color: "#94a3b8", fontSize: "12px" }}>Buyer</div>
                      <div style={{ fontWeight: 800 }}>{item.buyer}</div>
                    </div>

                    <div>
                      <div style={{ color: "#94a3b8", fontSize: "12px" }}>Amount</div>
                      <div style={{ fontWeight: 800 }}>{item.amount}</div>
                    </div>

                    <div
                      style={{
                        padding: "8px 12px",
                        borderRadius: "999px",
                        background: "rgba(59,130,246,0.18)",
                        color: "#93c5fd",
                        fontWeight: 800,
                        fontSize: "12px",
                        justifySelf: mobile ? "start" : "auto",
                      }}
                    >
                      {item.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: "26px" }}>
            <div
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "24px",
                padding: mobile ? "20px 16px" : "24px",
                boxSizing: "border-box",
              }}
            >
              <SectionTitle mobile={mobile}>Frequently Asked Questions</SectionTitle>

              <div style={{ display: "grid", gap: "14px" }}>
                {FAQS.map((item) => (
                  <div
                    key={item.q}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      borderRadius: "16px",
                      padding: "18px",
                      boxSizing: "border-box",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 900,
                        fontSize: mobile ? "17px" : "18px",
                        marginBottom: "8px",
                      }}
                    >
                      {item.q}
                    </div>
                    <div style={{ color: "#cbd5e1", lineHeight: 1.65 }}>{item.a}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: "34px",
              color: "rgba(255,255,255,0.34)",
              textAlign: "center",
              lineHeight: 1.7,
              fontSize: "12px",
              letterSpacing: "0.3px",
            }}
          >
            © {new Date().getFullYear()} GDN Enterprise Pty Ltd · Powered by CLX
          </div>
        </div>
      </div>
    </>
  );
}

const contactInputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "15px 16px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.04)",
  color: "#fff",
  fontSize: "16px",
  outline: "none",
};
