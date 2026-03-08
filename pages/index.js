import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0xCA30Cbe4D511Dd283e0FDe62d2215c42C358Ba4c";

/*
  IMPORTANT:
  Replace this ABI with your real ABI when you have it.
  This example assumes:
  function buyTokens() external payable
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

export default function Home() {
  const [walletAddress, setWalletAddress] = useState("");
  const [ethAmount, setEthAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [txHash, setTxHash] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [isCheckingWallet, setIsCheckingWallet] = useState(true);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

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
        if (!window.ethereum) {
          return;
        }

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
        setSuccess("Purchase successful. Tokens should arrive in your wallet.");
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

  function formatWallet(address) {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #1f2937 0%, #0f172a 35%, #020617 100%)",
        color: "#ffffff",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "32px 20px 60px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            marginBottom: "30px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "30px",
                fontWeight: 800,
                letterSpacing: "0.5px",
              }}
            >
              CLX Presale
            </div>
            <div style={{ color: "#94a3b8", marginTop: "6px" }}>
              Secure wallet connection and direct token purchase
            </div>
          </div>

          <button
            onClick={connectWallet}
            disabled={isConnecting || isCheckingWallet}
            style={{
              padding: "14px 22px",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.15)",
              background: walletAddress ? "#14532d" : "#2563eb",
              color: "#fff",
              fontWeight: 700,
              fontSize: "15px",
              cursor: "pointer",
              minWidth: "180px",
            }}
          >
            {isCheckingWallet
              ? "Checking Wallet..."
              : isConnecting
              ? "Connecting..."
              : walletAddress
              ? `Connected: ${formatWallet(walletAddress)}`
              : "Connect Wallet"}
          </button>
        </div>

        {/* Hero */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: "24px",
            alignItems: "stretch",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "24px",
              padding: "28px",
              backdropFilter: "blur(12px)",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "8px 14px",
                borderRadius: "999px",
                background: "rgba(59,130,246,0.16)",
                color: "#93c5fd",
                fontWeight: 700,
                fontSize: "13px",
                marginBottom: "16px",
              }}
            >
              CrossLedger Token Launch
            </div>

            <h1
              style={{
                fontSize: "48px",
                lineHeight: 1.05,
                margin: "0 0 14px",
                fontWeight: 800,
              }}
            >
              Buy CLX in the presale
            </h1>

            <p
              style={{
                color: "#cbd5e1",
                fontSize: "18px",
                lineHeight: 1.6,
                maxWidth: "700px",
                marginBottom: "28px",
              }}
            >
              Connect your wallet, enter your ETH amount, and purchase CLX
              directly through the smart contract.
            </p>

            {/* Countdown */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(80px, 1fr))",
                gap: "12px",
                marginBottom: "28px",
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
                  <div style={{ fontSize: "30px", fontWeight: 800 }}>
                    {String(item.value).padStart(2, "0")}
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: "13px" }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "14px",
              }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: "18px",
                  padding: "18px",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div style={{ color: "#94a3b8", fontSize: "13px" }}>
                  Token Price
                </div>
                <div style={{ fontSize: "22px", fontWeight: 800 }}>
                  TBA
                </div>
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: "18px",
                  padding: "18px",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div style={{ color: "#94a3b8", fontSize: "13px" }}>
                  Network
                </div>
                <div style={{ fontSize: "22px", fontWeight: 800 }}>
                  Ethereum
                </div>
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: "18px",
                  padding: "18px",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div style={{ color: "#94a3b8", fontSize: "13px" }}>
                  Contract
                </div>
                <div style={{ fontSize: "16px", fontWeight: 800 }}>
                  {formatWallet(CONTRACT_ADDRESS)}
                </div>
              </div>
            </div>
          </div>

          {/* Buy Card */}
          <div
            style={{
              background: "#ffffff",
              color: "#0f172a",
              borderRadius: "24px",
              padding: "28px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.30)",
            }}
          >
            <div
              style={{
                fontSize: "26px",
                fontWeight: 800,
                marginBottom: "8px",
              }}
            >
              Buy CLX
            </div>
            <div style={{ color: "#475569", marginBottom: "20px" }}>
              Enter the amount of ETH you want to use.
            </div>

            <label
              style={{
                display: "block",
                fontWeight: 700,
                marginBottom: "8px",
              }}
            >
              ETH Amount
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
                fontWeight: 800,
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              {isBuying ? "Processing..." : "Buy CLX"}
            </button>

            {walletAddress && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "12px",
                  borderRadius: "12px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
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
                  padding: "14px",
                  borderRadius: "12px",
                  background: "#dcfce7",
                  color: "#166534",
                  fontSize: "14px",
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
                  padding: "14px",
                  borderRadius: "12px",
                  background: "#fee2e2",
                  color: "#991b1b",
                  fontSize: "14px",
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
                  padding: "14px",
                  borderRadius: "12px",
                  background: "#eff6ff",
                  color: "#1e3a8a",
                  fontSize: "14px",
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
                marginTop: "22px",
                paddingTop: "18px",
                borderTop: "1px solid #e2e8f0",
                color: "#64748b",
                fontSize: "13px",
                lineHeight: 1.6,
              }}
            >
              Ensure you are using the correct wallet and network before
              confirming any transaction.
            </div>
          </div>
        </div>

        {/* Activity */}
        <div style={{ marginTop: "28px" }}>
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "24px",
              padding: "24px",
            }}
          >
            <div
              style={{
                fontSize: "22px",
                fontWeight: 800,
                marginBottom: "16px",
              }}
            >
              Recent Activity
            </div>

            <div
              style={{
                display: "grid",
                gap: "12px",
              }}
            >
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
                    <div style={{ color: "#94a3b8", fontSize: "12px" }}>
                      Buyer
                    </div>
                    <div style={{ fontWeight: 700 }}>{item.buyer}</div>
                  </div>

                  <div>
                    <div style={{ color: "#94a3b8", fontSize: "12px" }}>
                      Amount
                    </div>
                    <div style={{ fontWeight: 700 }}>{item.amount}</div>
                  </div>

                  <div
                    style={{
                      padding: "8px 12px",
                      borderRadius: "999px",
                      background: "rgba(59,130,246,0.18)",
                      color: "#93c5fd",
                      fontWeight: 700,
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
      </div>
    </div>
  );
}
