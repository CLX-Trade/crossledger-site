import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0xCA30Cbe4D511Dd283e0FDe62d2215c42C358Ba4c";
const BUY_FUNCTION_NAME = "buyTokens";

// Replace with your real ABI if needed
const CONTRACT_ABI = [
  "function buyTokens() payable",
];

const TOKEN_SYMBOL = "CLX";
const TOKEN_NAME = "CrossLedger";
const TOKEN_SUBTITLE = "Global Trade Infrastructure Token";
const TOKEN_PRICE_USD = 0.1;
const PROJECTED_LAUNCH_USD = 13.5;
const MIN_BUY_USD = 300;
const MAX_BUY_TEXT = "TBA";
const FALLBACK_ETH_USD = 2500;
const PRESET_AMOUNTS = ["0.10", "0.25", "0.50", "1.00"];
const PRESALE_WALLET = "0x264c542adc1447e3a75af2b8e2c758d73e562571";

export default function HomePage() {
  const [walletAddress, setWalletAddress] = useState("");
  const [ethAmount, setEthAmount] = useState("");
  const [ethPriceUsd, setEthPriceUsd] = useState(FALLBACK_ETH_USD);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);
  const [copiedWallet, setCopiedWallet] = useState(false);

  const isMobile = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }, []);

  const minEthAmount = useMemo(() => {
    if (!ethPriceUsd || Number(ethPriceUsd) <= 0) return "0.1200";
    return (MIN_BUY_USD / ethPriceUsd).toFixed(4);
  }, [ethPriceUsd]);

  const estimatedUsdValue = useMemo(() => {
    const amount = Number(ethAmount);
    if (!amount || amount <= 0) return 0;
    return amount * ethPriceUsd;
  }, [ethAmount, ethPriceUsd]);

  const estimatedTokens = useMemo(() => {
    if (!estimatedUsdValue || TOKEN_PRICE_USD <= 0) return 0;
    return estimatedUsdValue / TOKEN_PRICE_USD;
  }, [estimatedUsdValue]);

  const currentProgress = 33.33;
  const projectedProgress = 58.33;

  useEffect(() => {
    restorePendingAmount();
    loadEthPrice();
    restoreExistingWallet();
  }, []);

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

  async function loadEthPrice() {
    try {
      setIsLoadingPrice(true);
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
      );
      const data = await response.json();
      const livePrice = data?.ethereum?.usd;
      if (livePrice && Number(livePrice) > 0) {
        setEthPriceUsd(Number(livePrice));
      }
    } catch (error) {
      console.error("ETH price fetch failed:", error);
    } finally {
      setIsLoadingPrice(false);
    }
  }

  async function restoreExistingWallet() {
    if (typeof window === "undefined" || !window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_accounts", []);
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
      }
    } catch (error) {
      console.error("Wallet restore failed:", error);
    }
  }

  function restorePendingAmount() {
    if (typeof window === "undefined") return;

    try {
      const savedAmount = localStorage.getItem("clx_pending_eth_amount");
      if (savedAmount) {
        setEthAmount(savedAmount);
      }
    } catch (error) {
      console.error("Could not restore saved ETH amount:", error);
    }
  }

  function savePendingAmount(value) {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem("clx_pending_eth_amount", value);
    } catch (error) {
      console.error("Could not save ETH amount:", error);
    }
  }

  function clearMessages() {
    setErrorMessage("");
    setSuccessMessage("");
    setStatusMessage("");
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
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);

      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setSuccessMessage("Wallet connected successfully");
      }
    } catch (error) {
      if (error?.code === 4001) {
        return;
      }
      console.error("Connect wallet error:", error);
      setErrorMessage("Wallet connection failed");
    } finally {
      setIsConnecting(false);
    }
  }

  function handlePresetAmountSelect(value) {
    setEthAmount(value);
    savePendingAmount(value);
    clearMessages();
  }

  function handleEthAmountChange(event) {
    const value = event.target.value;

    if (/^\d*\.?\d*$/.test(value)) {
      setEthAmount(value);
      savePendingAmount(value);
      clearMessages();
    }
  }

  async function copyWalletAddress() {
    try {
      await navigator.clipboard.writeText(PRESALE_WALLET);
      setCopiedWallet(true);
      setTimeout(() => setCopiedWallet(false), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  }

  async function handleBuy() {
    clearMessages();

    const numericAmount = Number(ethAmount);

    if (!numericAmount || numericAmount <= 0) {
      setErrorMessage("Please enter a valid ETH amount");
      return;
    }

    if (estimatedUsdValue < MIN_BUY_USD) {
      setErrorMessage(`Minimum buy is approximately US$${MIN_BUY_USD}`);
      return;
    }

    savePendingAmount(ethAmount);

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
      setIsBuying(true);

      const provider = new ethers.BrowserProvider(window.ethereum);
      let accounts = await provider.send("eth_accounts", []);

      if (!accounts || accounts.length === 0) {
        try {
          accounts = await provider.send("eth_requestAccounts", []);
        } catch (error) {
          if (error?.code === 4001) {
            return;
          }
          throw error;
        }
      }

      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
      }

      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const value = ethers.parseEther(ethAmount);

      setStatusMessage("Waiting for wallet confirmation...");

      if (typeof contract[BUY_FUNCTION_NAME] !== "function") {
        throw new Error(
          `Contract function "${BUY_FUNCTION_NAME}" was not found. Update BUY_FUNCTION_NAME or ABI.`
        );
      }

      const transaction = await contract[BUY_FUNCTION_NAME]({ value });

      setStatusMessage("Transaction submitted. Waiting for blockchain confirmation...");
      await transaction.wait();

      setStatusMessage("");
      setSuccessMessage("Purchase completed successfully");
    } catch (error) {
      if (error?.code === 4001) {
        return;
      }

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

  return (
    <div style={styles.page}>
      <div style={styles.backgroundGlowLeft} />
      <div style={styles.backgroundGlowRight} />

      <main style={styles.container}>
        <section style={styles.heroSection}>
          <div style={styles.logoBadge}>CLX</div>

          <div style={styles.heroContent}>
            <p style={styles.kicker}>{TOKEN_NAME}</p>
            <h1 style={styles.mainTitle}>{TOKEN_SUBTITLE}</h1>
            <p style={styles.mainSubtitle}>
              Built to support secure and transparent transaction verification across
              global commodity markets, with a presale experience optimized for both
              desktop and mobile users.
            </p>
          </div>

          <div style={styles.heroActions}>
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              style={{
                ...styles.primaryTopButton,
                opacity: isConnecting ? 0.85 : 1,
                cursor: isConnecting ? "not-allowed" : "pointer",
              }}
            >
              {walletAddress
                ? `Connected: ${formatWallet(walletAddress)}`
                : isConnecting
                ? "Connecting..."
                : "Connect Wallet"}
            </button>

            <button
              onClick={copyWalletAddress}
              style={styles.secondaryTopButton}
            >
              {copiedWallet ? "Wallet Copied" : "Copy Presale Wallet"}
            </button>
          </div>
        </section>

        <section style={styles.progressCard}>
          <div style={styles.progressHeader}>
            <div>
              <div style={styles.progressLabel}>Current progress</div>
              <div style={styles.progressValue}>{currentProgress.toFixed(2)}%</div>
            </div>
            <div>
              <div style={styles.progressLabel}>If this round completes</div>
              <div style={styles.progressValue}>{projectedProgress.toFixed(2)}%</div>
            </div>
          </div>

          <div style={styles.progressTrack}>
            <div
              style={{
                ...styles.progressFill,
                width: `${currentProgress}%`,
              }}
            />
          </div>

          <p style={styles.progressText}>
            Current progress: <strong>{currentProgress.toFixed(2)}%</strong> of total raise target.
            If the current pre-launch round completes, progress would move to{" "}
            <strong>{projectedProgress.toFixed(2)}%</strong>.
          </p>
        </section>

        <section style={styles.buyCard}>
          <div style={styles.sectionHeaderRow}>
            <div>
              <p style={styles.sectionEyebrow}>Token Presale</p>
              <h2 style={styles.buyTitle}>Buy {TOKEN_SYMBOL}</h2>
              <p style={styles.buySubtitle}>
                Stage 1 pricing is live. Connect your wallet and participate directly with ETH.
              </p>
            </div>
          </div>

          <div style={styles.metricGrid}>
            <div style={styles.metricBox}>
              <span style={styles.metricLabel}>Stage 1 Price</span>
              <span style={styles.metricValue}>US${TOKEN_PRICE_USD.toFixed(2)}</span>
            </div>

            <div style={styles.metricBox}>
              <span style={styles.metricLabel}>Projected Launch</span>
              <span style={styles.metricValue}>US${PROJECTED_LAUNCH_USD.toFixed(2)}</span>
            </div>
          </div>

          <div style={styles.inputSection}>
            <label style={styles.inputLabel}>Amount in ETH</label>
            <input
              type="text"
              inputMode="decimal"
              value={ethAmount}
              onChange={handleEthAmountChange}
              placeholder={minEthAmount}
              style={styles.ethInput}
            />
          </div>

          <div style={styles.presetGrid}>
            {PRESET_AMOUNTS.map((amount) => (
              <button
                key={amount}
                onClick={() => handlePresetAmountSelect(amount)}
                style={{
                  ...styles.presetButton,
                  ...(ethAmount === amount ? styles.presetButtonActive : {}),
                }}
              >
                {amount} ETH
              </button>
            ))}
          </div>

          <button
            onClick={handleBuy}
            disabled={isBuying || isConnecting}
            style={{
              ...styles.buyButton,
              opacity: isBuying || isConnecting ? 0.85 : 1,
              cursor: isBuying || isConnecting ? "not-allowed" : "pointer",
            }}
          >
            {isBuying ? "Processing..." : `Buy ${TOKEN_SYMBOL}`}
          </button>

          {statusMessage ? <div style={styles.statusBox}>{statusMessage}</div> : null}
          {successMessage ? <div style={styles.successBox}>{successMessage}</div> : null}
          {errorMessage ? <div style={styles.errorBox}>{errorMessage}</div> : null}

          <div style={styles.summarySection}>
            <div style={styles.summaryRow}>
              <span style={styles.summaryKey}>Minimum purchase</span>
              <span style={styles.summaryValue}>US${MIN_BUY_USD}</span>
            </div>

            <div style={styles.summaryRow}>
              <span style={styles.summaryKey}>Approximate minimum in ETH</span>
              <span style={styles.summaryValue}>{minEthAmount} ETH</span>
            </div>

            <div style={styles.summaryRow}>
              <span style={styles.summaryKey}>Maximum buy</span>
              <span style={styles.summaryValue}>{MAX_BUY_TEXT}</span>
            </div>

            <div style={styles.summaryRow}>
              <span style={styles.summaryKey}>ETH/USD reference</span>
              <span style={styles.summaryValue}>
                {isLoadingPrice ? "Loading..." : `US$${Number(ethPriceUsd).toLocaleString()}`}
              </span>
            </div>

            <div style={styles.summaryRow}>
              <span style={styles.summaryKey}>Estimated value</span>
              <span style={styles.summaryValue}>
                {estimatedUsdValue > 0 ? `US$${estimatedUsdValue.toFixed(2)}` : "—"}
              </span>
            </div>

            <div style={styles.summaryRow}>
              <span style={styles.summaryKey}>Estimated {TOKEN_SYMBOL}</span>
              <span style={styles.summaryValue}>
                {estimatedTokens > 0
                  ? Number(estimatedTokens).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })
                  : "—"}
              </span>
            </div>

            <div style={styles.summaryRow}>
              <span style={styles.summaryKey}>Wallet status</span>
              <span style={styles.summaryValue}>
                {walletAddress ? `Connected (${formatWallet(walletAddress)})` : "Not connected"}
              </span>
            </div>

            <div style={styles.summaryRow}>
              <span style={styles.summaryKey}>Presale wallet</span>
              <span style={styles.summaryValueWallet}>{PRESALE_WALLET}</span>
            </div>
          </div>
        </section>

        <section style={styles.infoGrid}>
          <div style={styles.infoCard}>
            <p style={styles.cardEyebrow}>How To Participate</p>
            <h3 style={styles.infoTitle}>Simple entry flow</h3>
            <div style={styles.stepsList}>
              <div style={styles.stepItem}>
                <span style={styles.stepNumber}>1</span>
                <span style={styles.stepText}>Download Trust Wallet or MetaMask</span>
              </div>
              <div style={styles.stepItem}>
                <span style={styles.stepNumber}>2</span>
                <span style={styles.stepText}>Connect and send ETH into the presale flow</span>
              </div>
              <div style={styles.stepItem}>
                <span style={styles.stepNumber}>3</span>
                <span style={styles.stepText}>CLX tokens are distributed automatically</span>
              </div>
            </div>
          </div>

          <div style={styles.infoCard}>
            <p style={styles.cardEyebrow}>Roadmap</p>
            <h3 style={styles.infoTitle}>Execution phases</h3>
            <div style={styles.roadmapList}>
              <div style={styles.roadmapItem}>
                <div style={styles.roadmapDot} />
                <div>
                  <div style={styles.roadmapPhase}>Phase 1</div>
                  <div style={styles.roadmapText}>Token Launch & Presale</div>
                </div>
              </div>
              <div style={styles.roadmapItem}>
                <div style={styles.roadmapDot} />
                <div>
                  <div style={styles.roadmapPhase}>Phase 2</div>
                  <div style={styles.roadmapText}>Trade Validation Platform</div>
                </div>
              </div>
              <div style={styles.roadmapItem}>
                <div style={styles.roadmapDot} />
                <div>
                  <div style={styles.roadmapPhase}>Phase 3</div>
                  <div style={styles.roadmapText}>Global Commodity Transaction Network</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={styles.visionCard}>
          <p style={styles.cardEyebrow}>Vision</p>
          <h3 style={styles.visionTitle}>Infrastructure for global commodity trade</h3>
          <p style={styles.visionText}>
            CrossLedger aims to build the infrastructure layer for global commodity trade,
            enabling secure and transparent transaction verification across oil, sugar,
            metals and agricultural markets.
          </p>
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    background:
      "radial-gradient(circle at top left, #183b78 0%, #0d2553 30%, #07142d 65%, #051022 100%)",
    position: "relative",
    overflow: "hidden",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    padding: "24px 16px 64px",
    boxSizing: "border-box",
  },

  backgroundGlowLeft: {
    position: "absolute",
    top: "-120px",
    left: "-120px",
    width: "320px",
    height: "320px",
    borderRadius: "50%",
    background: "rgba(88, 137, 255, 0.18)",
    filter: "blur(60px)",
    pointerEvents: "none",
  },

  backgroundGlowRight: {
    position: "absolute",
    bottom: "-120px",
    right: "-120px",
    width: "340px",
    height: "340px",
    borderRadius: "50%",
    background: "rgba(32, 108, 255, 0.14)",
    filter: "blur(70px)",
    pointerEvents: "none",
  },

  container: {
    width: "100%",
    maxWidth: "1180px",
    margin: "0 auto",
    position: "relative",
    zIndex: 2,
  },

  heroSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "24px 0 28px",
  },

  logoBadge: {
    width: "84px",
    height: "84px",
    borderRadius: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, rgba(62,118,255,0.32), rgba(13,27,58,0.92))",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "#ffffff",
    fontSize: "30px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    boxShadow: "0 18px 40px rgba(0,0,0,0.25)",
    backdropFilter: "blur(10px)",
    marginBottom: "22px",
  },

  heroContent: {
    maxWidth: "860px",
  },

  kicker: {
    margin: "0 0 10px",
    color: "rgba(255,255,255,0.76)",
    fontSize: "14px",
    fontWeight: 700,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  },

  mainTitle: {
    margin: "0 0 16px",
    color: "#ffffff",
    fontSize: "clamp(36px, 7vw, 72px)",
    lineHeight: 1.02,
    fontWeight: 800,
    letterSpacing: "-0.03em",
  },

  mainSubtitle: {
    margin: "0 auto",
    maxWidth: "760px",
    color: "rgba(255,255,255,0.82)",
    fontSize: "clamp(17px, 2.8vw, 24px)",
    lineHeight: 1.6,
  },

  heroActions: {
    marginTop: "26px",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "14px",
  },

  primaryTopButton: {
    minWidth: "260px",
    height: "68px",
    padding: "0 24px",
    border: "none",
    borderRadius: "20px",
    background: "linear-gradient(135deg, #3f77ff 0%, #2c57e0 100%)",
    color: "#ffffff",
    fontWeight: 800,
    fontSize: "20px",
    boxShadow: "0 16px 36px rgba(42, 88, 224, 0.35)",
  },

  secondaryTopButton: {
    minWidth: "220px",
    height: "68px",
    padding: "0 24px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: "18px",
    backdropFilter: "blur(10px)",
  },

  progressCard: {
    margin: "10px auto 28px",
    maxWidth: "980px",
    borderRadius: "30px",
    padding: "24px",
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.10)",
    backdropFilter: "blur(14px)",
    boxShadow: "0 20px 45px rgba(0,0,0,0.15)",
  },

  progressHeader: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
    marginBottom: "18px",
  },

  progressLabel: {
    color: "rgba(255,255,255,0.68)",
    fontSize: "14px",
    marginBottom: "8px",
  },

  progressValue: {
    color: "#ffffff",
    fontSize: "clamp(24px, 4vw, 34px)",
    fontWeight: 800,
  },

  progressTrack: {
    width: "100%",
    height: "14px",
    background: "rgba(255,255,255,0.12)",
    borderRadius: "999px",
    overflow: "hidden",
    marginBottom: "16px",
  },

  progressFill: {
    height: "100%",
    borderRadius: "999px",
    background: "linear-gradient(90deg, #69a6ff 0%, #8be2b5 100%)",
  },

  progressText: {
    margin: 0,
    color: "rgba(255,255,255,0.82)",
    fontSize: "clamp(15px, 2.4vw, 20px)",
    lineHeight: 1.7,
  },

  buyCard: {
    width: "100%",
    maxWidth: "860px",
    margin: "0 auto 28px",
    background: "#f7f8fb",
    borderRadius: "34px",
    padding: "clamp(22px, 4vw, 34px)",
    boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
    boxSizing: "border-box",
  },

  sectionHeaderRow: {
    marginBottom: "8px",
  },

  sectionEyebrow: {
    margin: "0 0 8px",
    color: "#5f7190",
    fontSize: "14px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.14em",
  },

  buyTitle: {
    margin: "0 0 10px",
    color: "#0a1734",
    fontWeight: 800,
    fontSize: "clamp(34px, 6vw, 60px)",
    lineHeight: 1.05,
    letterSpacing: "-0.03em",
  },

  buySubtitle: {
    margin: "0 0 28px",
    color: "#4c5d7a",
    fontSize: "clamp(18px, 3vw, 28px)",
    lineHeight: 1.55,
  },

  metricGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
    marginBottom: "28px",
  },

  metricBox: {
    background: "#f3f5f9",
    border: "2px solid #d8e0ec",
    borderRadius: "22px",
    padding: "22px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  metricLabel: {
    color: "#64748f",
    fontSize: "clamp(16px, 2.4vw, 21px)",
  },

  metricValue: {
    color: "#0a1734",
    fontSize: "clamp(28px, 4vw, 36px)",
    fontWeight: 800,
  },

  inputSection: {
    marginBottom: "22px",
  },

  inputLabel: {
    display: "block",
    marginBottom: "14px",
    color: "#0a1734",
    fontSize: "clamp(24px, 4vw, 34px)",
    fontWeight: 800,
  },

  ethInput: {
    width: "100%",
    height: "96px",
    background: "#ffffff",
    border: "2px solid #d8e0ec",
    borderRadius: "24px",
    padding: "0 26px",
    color: "#0a1734",
    fontSize: "clamp(24px, 4vw, 34px)",
    outline: "none",
    boxSizing: "border-box",
  },

  presetGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "18px",
    marginBottom: "28px",
  },

  presetButton: {
    height: "78px",
    borderRadius: "22px",
    border: "2px solid #d8e0ec",
    background: "#ffffff",
    color: "#0a1734",
    fontSize: "clamp(20px, 3vw, 28px)",
    fontWeight: 800,
  },

  presetButtonActive: {
    border: "2px solid #2d57e0",
    boxShadow: "0 10px 22px rgba(45, 87, 224, 0.14)",
  },

  buyButton: {
    width: "100%",
    height: "96px",
    border: "none",
    borderRadius: "26px",
    background: "linear-gradient(90deg, #071225 0%, #162b48 100%)",
    color: "#ffffff",
    fontSize: "clamp(24px, 4vw, 38px)",
    fontWeight: 800,
    marginBottom: "22px",
  },

  statusBox: {
    background: "#e8eefc",
    color: "#2048a2",
    borderRadius: "22px",
    padding: "20px 22px",
    fontSize: "clamp(16px, 2.4vw, 21px)",
    lineHeight: 1.6,
    marginBottom: "18px",
    wordBreak: "break-word",
  },

  successBox: {
    background: "#def4e7",
    color: "#17623f",
    borderRadius: "22px",
    padding: "20px 22px",
    fontSize: "clamp(16px, 2.4vw, 21px)",
    lineHeight: 1.6,
    marginBottom: "18px",
    wordBreak: "break-word",
  },

  errorBox: {
    background: "#f7dddd",
    color: "#a12626",
    borderRadius: "22px",
    padding: "20px 22px",
    fontSize: "clamp(16px, 2.4vw, 21px)",
    lineHeight: 1.6,
    marginBottom: "18px",
    wordBreak: "break-word",
  },

  summarySection: {
    borderTop: "1px solid #d8e0ec",
    paddingTop: "22px",
  },

  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "18px",
    padding: "8px 0",
    flexWrap: "wrap",
  },

  summaryKey: {
    color: "#64748f",
    fontSize: "clamp(16px, 2.3vw, 21px)",
  },

  summaryValue: {
    color: "#0a1734",
    fontSize: "clamp(16px, 2.3vw, 21px)",
    fontWeight: 700,
    textAlign: "right",
  },

  summaryValueWallet: {
    color: "#0a1734",
    fontSize: "clamp(14px, 2vw, 18px)",
    fontWeight: 700,
    textAlign: "right",
    wordBreak: "break-all",
    maxWidth: "100%",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "24px",
    margin: "0 auto 28px",
    maxWidth: "1100px",
  },

  infoCard: {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "28px",
    padding: "26px",
    backdropFilter: "blur(14px)",
    boxShadow: "0 20px 45px rgba(0,0,0,0.15)",
  },

  cardEyebrow: {
    margin: "0 0 8px",
    color: "rgba(255,255,255,0.68)",
    fontSize: "14px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.14em",
  },

  infoTitle: {
    margin: "0 0 18px",
    color: "#ffffff",
    fontSize: "clamp(24px, 4vw, 34px)",
    fontWeight: 800,
  },

  stepsList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  stepItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
  },

  stepNumber: {
    minWidth: "34px",
    height: "34px",
    borderRadius: "50%",
    background: "rgba(103, 162, 255, 0.16)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
  },

  stepText: {
    color: "rgba(255,255,255,0.84)",
    fontSize: "18px",
    lineHeight: 1.6,
  },

  roadmapList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  roadmapItem: {
    display: "flex",
    gap: "14px",
    alignItems: "flex-start",
  },

  roadmapDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #69a6ff 0%, #8be2b5 100%)",
    marginTop: "8px",
    flexShrink: 0,
  },

  roadmapPhase: {
    color: "#ffffff",
    fontSize: "18px",
    fontWeight: 800,
    marginBottom: "4px",
  },

  roadmapText: {
    color: "rgba(255,255,255,0.82)",
    fontSize: "18px",
    lineHeight: 1.6,
  },

  visionCard: {
    maxWidth: "1100px",
    margin: "0 auto",
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "30px",
    padding: "28px",
    backdropFilter: "blur(14px)",
    boxShadow: "0 20px 45px rgba(0,0,0,0.15)",
  },

  visionTitle: {
    margin: "0 0 14px",
    color: "#ffffff",
    fontSize: "clamp(28px, 4vw, 40px)",
    fontWeight: 800,
  },

  visionText: {
    margin: 0,
    color: "rgba(255,255,255,0.84)",
    fontSize: "clamp(18px, 2.6vw, 22px)",
    lineHeight: 1.8,
    maxWidth: "980px",
  },
};
