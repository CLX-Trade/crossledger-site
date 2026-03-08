import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0xCA30Cbe4D511Dd283e0FDe62d2215c42C358Ba4c";

/*
  IMPORTANT
  This assumes your contract has:
  function buyTokens() external payable

  If your actual function is different, replace the ABI and the call in buyTokens().
*/
const CONTRACT_ABI = [
  {
    inputs: [],
    name: "buyTokens",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];

/*
  EDIT THESE DETAILS TO MATCH YOUR FINAL TOKEN INFORMATION
*/
const TOKEN_CONFIG = {
  name: "CrossLedger",
  symbol: "CLX",
  network: "Ethereum",
  launchTag: "CrossLedger Token Presale",
  headline: "The next-generation trade ecosystem token",
  subheadline:
    "CLX is designed to power a modern digital ecosystem focused on international trade, transparency, access, and scalable blockchain utility.",
  contractAddress: CONTRACT_ADDRESS,
  tokenPrice: "TBA",
  listingPrice: "TBA",
  softCap: "TBA",
  hardCap: "TBA",
  minBuy: "0.01 ETH",
  maxBuy: "TBA",
  totalSupply: "TBA",
  presaleAllocation: "TBA",
  liquidityAllocation: "TBA",
  ecosystemAllocation: "TBA",
  teamAllocation: "TBA",
  treasuryAllocation: "TBA",
  vestingNote: "Subject to final launch structure and smart contract settings.",
  acceptedCurrency: "ETH",
};

const PRESALE_PHASES = [
  {
    phase: "Phase 1",
    price: "TBA",
    allocation: "TBA",
    status: "Current",
    description:
      "Initial allocation for early participants entering the CrossLedger ecosystem at the foundation stage.",
  },
  {
    phase: "Phase 2",
    price: "TBA",
    allocation: "TBA",
    status: "Upcoming",
    description:
      "Expanded access phase with revised pricing and continued ecosystem participation.",
  },
  {
    phase: "Phase 3",
    price: "TBA",
    allocation: "TBA",
    status: "Upcoming",
    description:
      "Final presale release prior to broader market rollout and ecosystem expansion.",
  },
];

const TOKEN_FEATURES = [
  {
    title: "Trade Utility",
    text: "Designed to support a blockchain-driven ecosystem tailored to international trade workflows and value transfer.",
  },
  {
    title: "Transparent Access",
    text: "Smart contract-based transactions reduce friction and improve clarity for participants entering the ecosystem.",
  },
  {
    title: "Scalable Architecture",
    text: "Positioned for future expansion across services, integrations, and broader digital trade infrastructure.",
  },
];

const ROADMAP = [
  {
    stage: "Stage 1",
    title: "Presale Launch",
    text: "Launch CLX presale page, wallet connectivity, initial smart contract integration, and early community access.",
  },
  {
    stage: "Stage 2",
    title: "Ecosystem Buildout",
    text: "Expand token utility, community presence, strategic positioning, and infrastructure readiness.",
  },
  {
    stage: "Stage 3",
    title: "Broader Rollout",
    text: "Move into wider market activation, platform integration, and longer-term ecosystem growth.",
  },
];

const FAQS = [
  {
    q: "How do I buy CLX?",
    a: "Connect your wallet, enter the amount of ETH you want to use, and confirm the transaction in MetaMask.",
  },
  {
    q: "Where do purchased tokens go?",
    a: "If the contract is configured for direct delivery, tokens are sent to the connected wallet after the transaction confirms.",
  },
  {
    q: "What wallet should I use?",
    a: "A browser wallet such as MetaMask is recommended for the current purchase flow.",
  },
  {
    q: "What network is this on?",
    a: `This page is currently configured for ${TOKEN_CONFIG.network}. Always confirm the correct network before purchasing.`,
  },
];

export default function Home() {
  const [walletAddress, setWalletAddress] = useState("");
  const [ethAmount, setEthAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [txHash, setTxHash] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [isCheckingWallet, setIsCheckingWallet] = useState(true);

  const fallbackActivity = [
    { buyer: "0x71...9ab4", amount: "12,500 CLX", status: "Preview" },
    { buyer: "0x93...1fd2", amount: "4,800 CLX", status: "Preview" },
    { buyer: "0x28...7ce1", amount: "18,200 CLX", status: "Preview" },
  ];

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

  async function connectWallet() {
    try {
      setError("");
      setSuccess("");
      setTxHash("");
      setIsConnecting(true);

      if (!window.ethereum) {
        setError("MetaMask is not installed");
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
      setError(err?.message || "Wallet connection failed");
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
        setError("MetaMask is not installed");
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

      setIsBuying(true);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.buyTokens({
        value: ethers.parseEther(ethAmount),
      });

      setTxHash(tx.hash);
      setSuccess("Transaction submitted. Waiting for confirmation...");

      const receipt = await tx.wait();

      if (receipt.status === 1) {
        setSuccess(`Purchase successful. ${TOKEN_CONFIG.symbol} should arrive in your wallet.`);
      } else {
        setError("Transaction failed");
      }
    } catch (err) {
      console.error(err);

      if (err?.code === "ACTION_REJECTED") {
        setError("Transaction was rejected in MetaMask");
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

  function shortAddress(address) {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  function StatCard({ label, value }) {
    return (
      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "18px",
          padding: "18px",
        }}
      >
        <div style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "6px" }}>
          {label}
        </div>
        <div style={{ fontSize: "22px", fontWeight: 800 }}>{value}</div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #1e293b 0%, #0f172a 40%, #020617 100%)",
        color: "#fff",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "28px 18px 70px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "16px",
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: "24px",
          }}
        >
          <div>
            <div style={{ fontSize: "32px", fontWeight: 900 }}>
              {TOKEN_CONFIG.symbol} Presale
            </div>
            <div style={{ color: "#94a3b8", marginTop: "6px" }}>
              {TOKEN_CONFIG.name} • {TOKEN_CONFIG.network}
            </div>
          </div>

          <button
            onClick={connectWallet}
            disabled={isConnecting || isCheckingWallet}
            style={{
              padding: "14px 20px",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.15)",
              background: walletAddress ? "#14532d" : "#2563eb",
              color: "#fff",
              fontWeight: 800,
              cursor: "pointer",
              minWidth: "185px",
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
            gridTemplateColumns: "1.4fr 0.8fr",
            gap: "24px",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "26px",
              padding: "28px",
              backdropFilter: "blur(8px)",
            }}
          >
            <div
              style={{
                display: "inline-block",
                background: "rgba(59,130,246,0.18)",
                color: "#93c5fd",
                fontWeight: 800,
                fontSize: "13px",
                borderRadius: "999px",
                padding: "8px 14px",
                marginBottom: "16px",
              }}
            >
              {TOKEN_CONFIG.launchTag}
            </div>

            <h1
              style={{
                fontSize: "54px",
                lineHeight: 1.02,
                margin: "0 0 14px",
                fontWeight: 900,
                maxWidth: "860px",
              }}
            >
              {TOKEN_CONFIG.headline}
            </h1>

            <p
              style={{
                color: "#cbd5e1",
                fontSize: "18px",
                lineHeight: 1.65,
                marginBottom: "24px",
                maxWidth: "860px",
              }}
            >
              {TOKEN_CONFIG.subheadline}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(80px, 1fr))",
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
                    padding: "18px 14px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "30px", fontWeight: 900 }}>
                    {String(item.value).padStart(2, "0")}
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: "13px" }}>{item.label}</div>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "14px",
              }}
            >
              <StatCard label="Token Price" value={TOKEN_CONFIG.tokenPrice} />
              <StatCard label="Listing Price" value={TOKEN_CONFIG.listingPrice} />
              <StatCard label="Soft Cap" value={TOKEN_CONFIG.softCap} />
              <StatCard label="Hard Cap" value={TOKEN_CONFIG.hardCap} />
            </div>
          </div>

          <div
            style={{
              background: "#fff",
              color: "#0f172a",
              borderRadius: "26px",
              padding: "28px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.28)",
            }}
          >
            <div style={{ fontSize: "28px", fontWeight: 900, marginBottom: "8px" }}>
              Buy {TOKEN_CONFIG.symbol}
            </div>
            <div style={{ color: "#475569", lineHeight: 1.6, marginBottom: "18px" }}>
              Connect your wallet and purchase directly with {TOKEN_CONFIG.acceptedCurrency}.
            </div>

            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                padding: "14px",
                marginBottom: "16px",
              }}
            >
              <div style={{ color: "#64748b", fontSize: "13px" }}>Contract</div>
              <div style={{ fontWeight: 800, wordBreak: "break-all", marginTop: "5px" }}>
                {TOKEN_CONFIG.contractAddress}
              </div>
            </div>

            <label
              style={{ display: "block", fontWeight: 800, marginBottom: "8px" }}
            >
              Amount in ETH
            </label>

            <input
              type="number"
              placeholder="0.10"
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
              {["0.05", "0.10", "0.25", "0.50"].map((value) => (
                <button
                  key={value}
                  onClick={() => setEthAmount(value)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "12px",
                    border: "1px solid #cbd5e1",
                    background: "#fff",
                    cursor: "pointer",
                    fontWeight: 700,
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
                background: "#111827",
                color: "#fff",
                fontWeight: 900,
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              {isBuying ? "Processing..." : `Buy ${TOKEN_CONFIG.symbol}`}
            </button>

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
              Minimum buy: {TOKEN_CONFIG.minBuy}
              <br />
              Maximum buy: {TOKEN_CONFIG.maxBuy}
            </div>
          </div>
        </div>

        <div style={{ marginTop: "26px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "18px",
            }}
          >
            {TOKEN_FEATURES.map((item) => (
              <div
                key={item.title}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "22px",
                  padding: "22px",
                }}
              >
                <div style={{ fontSize: "20px", fontWeight: 900, marginBottom: "10px" }}>
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
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "24px",
              padding: "24px",
            }}
          >
            <div style={{ fontSize: "28px", fontWeight: 900, marginBottom: "18px" }}>
              Presale Phases
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
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
                          : "rgba(59,130,246,0.18)",
                      color: phase.status === "Current" ? "#86efac" : "#93c5fd",
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
                  <div style={{ color: "#94a3b8", marginBottom: "12px" }}>
                    Allocation: <strong style={{ color: "#fff" }}>{phase.allocation}</strong>
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
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "24px",
                padding: "24px",
              }}
            >
              <div style={{ fontSize: "28px", fontWeight: 900, marginBottom: "18px" }}>
                Tokenomics
              </div>

              <div style={{ display: "grid", gap: "12px" }}>
                {[
                  ["Total Supply", TOKEN_CONFIG.totalSupply],
                  ["Presale Allocation", TOKEN_CONFIG.presaleAllocation],
                  ["Liquidity Allocation", TOKEN_CONFIG.liquidityAllocation],
                  ["Ecosystem Allocation", TOKEN_CONFIG.ecosystemAllocation],
                  ["Team Allocation", TOKEN_CONFIG.teamAllocation],
                  ["Treasury Allocation", TOKEN_CONFIG.treasuryAllocation],
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
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "24px",
                padding: "24px",
              }}
            >
              <div style={{ fontSize: "28px", fontWeight: 900, marginBottom: "18px" }}>
                Roadmap
              </div>

              <div style={{ display: "grid", gap: "16px" }}>
                {ROADMAP.map((item) => (
                  <div
                    key={item.stage}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      borderRadius: "16px",
                      padding: "16px",
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
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "24px",
              padding: "24px",
            }}
          >
            <div style={{ fontSize: "28px", fontWeight: 900, marginBottom: "18px" }}>
              Recent Activity
            </div>

            <div style={{ display: "grid", gap: "12px" }}>
              {fallbackActivity.map((item, index) => (
                <div
                  key={`${item.buyer}-${index}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr auto",
                    gap: "12px",
                    alignItems: "center",
                    padding: "14px 16px",
                    borderRadius: "16px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
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
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "24px",
              padding: "24px",
            }}
          >
            <div style={{ fontSize: "28px", fontWeight: 900, marginBottom: "18px" }}>
              Frequently Asked Questions
            </div>

            <div style={{ display: "grid", gap: "14px" }}>
              {FAQS.map((item) => (
                <div
                  key={item.q}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: "16px",
                    padding: "18px",
                  }}
                >
                  <div style={{ fontWeight: 900, fontSize: "18px", marginBottom: "8px" }}>
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
            marginTop: "30px",
            color: "#94a3b8",
            textAlign: "center",
            lineHeight: 1.7,
            fontSize: "14px",
          }}
        >
          Always verify the contract address and network before confirming a transaction.
          <br />
          Contract: {TOKEN_CONFIG.contractAddress}
        </div>
      </div>
    </div>
  );
}
