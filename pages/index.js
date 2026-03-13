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

const fallbackActivity = [
  { buyer: "0x71...9ab4", amount: "12,500 USDT", status: "Confirmed" },
  { buyer: "0x93...1fd2", amount: "4,800 USDT", status: "Confirmed" },
  { buyer: "0x28...7ce1", amount: "18,200 USDT", status: "Confirmed" },
  { buyer: "0x84...ab19", amount: "7,100 USDT", status: "Confirmed" },
  { buyer: "0x16...ce42", amount: "25,000 USDT", status: "Confirmed" },
];

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
  const [contactStatus, setContactStatus] = useState("");
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });

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

  function handleContactChange(event) {
    const { name, value } = event.target;
    setContactForm((prev) => ({
      ...prev,
      [name]: value,
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

      // This expects an /api/contact endpoint if you already have one.
      // If you do not have one yet, the form UI will still show but submission will fail until that endpoint exists.
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactForm),
      });

      if (!response.ok) {
        throw new Error("Contact form submission failed");
      }

      setContactForm({
        name: "",
        email: "",
        message: "",
      });

      setContactStatus("Message sent successfully.");
    } catch (error) {
      console.error("Contact form error:", error);
      setContactStatus("Contact form is not connected yet. The box is now back on the page, but the API route still needs to exist for live sending.");
    } finally {
      setIsSubmittingContact(false);
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
              global commodity markets, with a premium presale experience for desktop
              and mobile investors.
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

            <button onClick={copyWalletAddress} style={styles.secondaryTopButton}>
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

        <section style={styles.mainGrid}>
          <div style={styles.leftColumn}>
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

            <section style={styles.infoCard}>
              <p style={styles.cardEyebrow}>How To Participate</p>
              <h3 style={styles.infoTitle}>Simple participation flow</h3>
              <div style={styles.stepsList}>
                <div style={styles.stepItem}>
                  <span style={styles.stepNumber}>1</span>
                  <span style={styles.stepText}>Download MetaMask or Trust Wallet</span>
                </div>
                <div style={styles.stepItem}>
                  <span style={styles.stepNumber}>2</span>
                  <span style={styles.stepText}>Connect wallet and choose your ETH amount</span>
                </div>
                <div style={styles.stepItem}>
                  <span style={styles.stepNumber}>3</span>
                  <span style={styles.stepText}>Approve your transaction securely in wallet</span>
                </div>
                <div style={styles.stepItem}>
                  <span style={styles.stepNumber}>4</span>
                  <span style={styles.stepText}>Receive CLX allocation through the presale flow</span>
                </div>
              </div>
            </section>

            <section style={styles.visionCard}>
              <p style={styles.cardEyebrow}>Vision</p>
              <h3 style={styles.visionTitle}>Infrastructure for global commodity trade</h3>
              <p style={styles.visionText}>
                CrossLedger is designed to support secure and transparent transaction verification
                across oil, sugar, metals and agricultural markets, bridging digital infrastructure
                with real-world trade execution.
              </p>
            </section>
          </div>

          <div style={styles.rightColumn}>
            <section style={styles.activityCard}>
              <p style={styles.cardEyebrow}>Recent Purchases</p>
              <h3 style={styles.infoTitle}>Latest activity</h3>
              <div style={styles.activityList}>
                {fallbackActivity.map((item, index) => (
                  <div key={`${item.buyer}-${index}`} style={styles.activityRow}>
                    <div>
                      <div style={styles.activityBuyer}>{item.buyer}</div>
                      <div style={styles.activityStatus}>{item.status}</div>
                    </div>
                    <div style={styles.activityAmount}>{item.amount}</div>
                  </div>
                ))}
              </div>
            </section>

            <section style={styles.phaseCard}>
              <p style={styles.cardEyebrow}>Phases</p>
              <h3 style={styles.infoTitle}>Project phases</h3>

              <div style={styles.phaseItem}>
                <div style={styles.phaseBadge}>Phase 1</div>
                <div style={styles.phaseBody}>
                  <div style={styles.phaseTitle}>Token Launch & Presale</div>
                  <div style={styles.phaseText}>
                    Initial launch, investor access, token distribution and early ecosystem building.
                  </div>
                </div>
              </div>

              <div style={styles.phaseItem}>
                <div style={styles.phaseBadge}>Phase 2</div>
                <div style={styles.phaseBody}>
                  <div style={styles.phaseTitle}>Trade Validation Platform</div>
                  <div style={styles.phaseText}>
                    Development of validation systems to support secure trade participation.
                  </div>
                </div>
              </div>

              <div style={styles.phaseItem}>
                <div style={styles.phaseBadge}>Phase 3</div>
                <div style={styles.phaseBody}>
                  <div style={styles.phaseTitle}>Commodity Network Expansion</div>
                  <div style={styles.phaseText}>
                    Broader ecosystem deployment across global commodity and infrastructure markets.
                  </div>
                </div>
              </div>
            </section>

            <section style={styles.roadmapCard}>
              <p style={styles.cardEyebrow}>Roadmap</p>
              <h3 style={styles.infoTitle}>Execution roadmap</h3>

              <div style={styles.roadmapItem}>
                <div style={styles.roadmapDot} />
                <div>
                  <div style={styles.roadmapPhase}>Q1</div>
                  <div style={styles.roadmapText}>Launch website, presale and wallet integration</div>
                </div>
              </div>

              <div style={styles.roadmapItem}>
                <div style={styles.roadmapDot} />
                <div>
                  <div style={styles.roadmapPhase}>Q2</div>
                  <div style={styles.roadmapText}>Expand product architecture and market outreach</div>
                </div>
              </div>

              <div style={styles.roadmapItem}>
                <div style={styles.roadmapDot} />
                <div>
                  <div style={styles.roadmapPhase}>Q3</div>
                  <div style={styles.roadmapText}>Deploy trade verification functionality</div>
                </div>
              </div>

              <div style={styles.roadmapItem}>
                <div style={styles.roadmapDot} />
                <div>
                  <div style={styles.roadmapPhase}>Q4</div>
                  <div style={styles.roadmapText}>Scale the CrossLedger commodity network globally</div>
                </div>
              </div>
            </section>

            <section style={styles.contactCard}>
              <p style={styles.cardEyebrow}>Communication Box</p>
              <h3 style={styles.infoTitle}>Contact us</h3>

              <form onSubmit={handleContactSubmit} style={styles.contactForm}>
                <input
                  name="name"
                  value={contactForm.name}
                  onChange={handleContactChange}
                  placeholder="Your name"
                  style={styles.contactInput}
                />
                <input
                  name="email"
                  type="email"
                  value={contactForm.email}
                  onChange={handleContactChange}
                  placeholder="Your email"
                  style={styles.contactInput}
                />
                <textarea
                  name="message"
                  value={contactForm.message}
                  onChange={handleContactChange}
                  placeholder="Your message"
                  style={styles.contactTextarea}
                />
                <button
                  type="submit"
                  style={styles.contactButton}
                  disabled={isSubmittingContact}
                >
                  {isSubmittingContact ? "Sending..." : "Send Message"}
                </button>
              </form>

              {contactStatus ? <div style={styles.contactStatus}>{contactStatus}</div> : null}
            </section>
          </div>
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
    maxWidth: "1280px",
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
    width: "88px",
    height: "88px",
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
    maxWidth: "900px",
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
    maxWidth: "800px",
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
    maxWidth: "1080px",
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

  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1.25fr 0.9fr",
    gap: "28px",
    alignItems: "start",
  },

  leftColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "28px",
  },

  rightColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "28px",
  },

  buyCard: {
    width: "100%",
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

  infoCard: {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "28px",
    padding: "26px",
    backdropFilter: "blur(14px)",
    boxShadow: "0 20px 45px rgba(0,0,0,0.15)",
  },

  phaseCard: {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "28px",
    padding: "26px",
    backdropFilter: "blur(14px)",
    boxShadow: "0 20px 45px rgba(0,0,0,0.15)",
  },

  roadmapCard: {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "28px",
    padding: "26px",
    backdropFilter: "blur(14px)",
    boxShadow: "0 20px 45px rgba(0,0,0,0.15)",
  },

  activityCard: {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "28px",
    padding: "26px",
    backdropFilter: "blur(14px)",
    boxShadow: "0 20px 45px rgba(0,0,0,0.15)",
  },

  contactCard: {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "28px",
    padding: "26px",
    backdropFilter: "blur(14px)",
    boxShadow: "0 20px 45px rgba(0,0,0,0.15)",
  },

  visionCard: {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "28px",
    padding: "28px",
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

  activityList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  activityRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    padding: "14px 0",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },

  activityBuyer: {
    color: "#ffffff",
    fontWeight: 700,
    fontSize: "16px",
  },

  activityStatus: {
    color: "rgba(255,255,255,0.66)",
    fontSize: "14px",
    marginTop: "4px",
  },

  activityAmount: {
    color: "#8be2b5",
    fontWeight: 800,
    fontSize: "16px",
    textAlign: "right",
  },

  phaseItem: {
    display: "flex",
    gap: "14px",
    alignItems: "flex-start",
    padding: "14px 0",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },

  phaseBadge: {
    minWidth: "78px",
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(103, 162, 255, 0.14)",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: "14px",
    textAlign: "center",
  },

  phaseBody: {
    flex: 1,
  },

  phaseTitle: {
    color: "#ffffff",
    fontSize: "18px",
    fontWeight: 800,
    marginBottom: "6px",
  },

  phaseText: {
    color: "rgba(255,255,255,0.82)",
    fontSize: "16px",
    lineHeight: 1.6,
  },

  roadmapItem: {
    display: "flex",
    gap: "14px",
    alignItems: "flex-start",
    padding: "12px 0",
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
    fontSize: "17px",
    lineHeight: 1.6,
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

  contactForm: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  contactInput: {
    width: "100%",
    height: "58px",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.08)",
    color: "#ffffff",
    padding: "0 16px",
    boxSizing: "border-box",
    outline: "none",
    fontSize: "16px",
  },

  contactTextarea: {
    width: "100%",
    minHeight: "140px",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.08)",
    color: "#ffffff",
    padding: "16px",
    boxSizing: "border-box",
    outline: "none",
    fontSize: "16px",
    resize: "vertical",
    fontFamily: "inherit",
  },

  contactButton: {
    height: "56px",
    borderRadius: "16px",
    border: "none",
    background: "linear-gradient(135deg, #3f77ff 0%, #2c57e0 100%)",
    color: "#ffffff",
    fontWeight: 800,
    fontSize: "17px",
  },

  contactStatus: {
    marginTop: "14px",
    color: "rgba(255,255,255,0.8)",
    fontSize: "15px",
    lineHeight: 1.5,
  },
};
import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";

/*
  =========================
  CROSSLEDGER PAGE SETTINGS
  =========================
*/

// If your sale currently works by sending ETH directly to the presale address,
// leave PURCHASE_MODE as "direct".
// If your sale requires a smart contract function call, change PURCHASE_MODE to "contract"
// and paste the ABI + function name below.
const PURCHASE_MODE = "direct"; // "direct" | "contract"

const PRESALE_ADDRESS = "0x264C542aDC1447E3a75aF2B8e2C758D73E562571";
const CONTRACT_ADDRESS = "0x264C542aDC1447E3a75aF2B8e2C758D73E562571";
const CONTRACT_FUNCTION_NAME = "buyTokens";

// Paste your Remix ABI here if/when needed for contract mode
const CONTRACT_ABI = [
  // Example:
  // "function buyTokens() payable"
];

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mlgpnvbk"; 

const TOKEN_NAME = "CrossLedger";
const TOKEN_SYMBOL = "CLX";
const TAGLINE = "Global Trade Infrastructure Token";
const CURRENT_PRICE_USD = 0.10;
const PROJECTED_LAUNCH_USD = 13.5;
const MIN_PURCHASE_USD = 300;
const MAX_PURCHASE_TEXT = "TBA";
const FALLBACK_ETH_USD = 2500;

const PRESET_AMOUNTS = ["0.10", "0.25", "0.50", "1.00"];

const TOKEN_ALLOCATION = [
  {
    title: "Ecosystem & Trade Incentives",
    percent: "35%",
    desc: "User rewards, rebates, trade stimulation and referrals.",
  },
  {
    title: "Treasury & Compliance",
    percent: "20%",
    desc: "Regulatory reserves and operational buffer.",
  },
  {
    title: "Founders & Team",
    percent: "15%",
    desc: "Vested over 3 years for long-term alignment.",
  },
  {
    title: "Strategic Investors",
    percent: "15%",
    desc: "Token-based incentives for seed and growth partners.",
  },
  {
    title: "Exchange & Liquidity",
    percent: "10%",
    desc: "Market making and exchange liquidity support.",
  },
  {
    title: "Operations & Partnerships",
    percent: "5%",
    desc: "Enterprise integrations and onboarding support.",
  },
];

const RECENT_ACTIVITY = [
  { buyer: "0x71...9ab4", amount: "12,500 USDT", status: "Confirmed" },
  { buyer: "0x93...1fd2", amount: "4,800 USDT", status: "Confirmed" },
  { buyer: "0x28...7ce1", amount: "18,200 USDT", status: "Confirmed" },
  { buyer: "0x84...ab19", amount: "7,100 USDT", status: "Confirmed" },
  { buyer: "0x16...ce42", amount: "25,000 USDT", status: "Confirmed" },
];

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

  const [contactStatus, setContactStatus] = useState("");
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const currentProgress = 33.33;
  const projectedProgress = 58.33;

  const isMobile = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }, []);

  const minEthAmount = useMemo(() => {
    if (!ethPriceUsd || Number(ethPriceUsd) <= 0) return "0.1200";
    return (MIN_PURCHASE_USD / ethPriceUsd).toFixed(4);
  }, [ethPriceUsd]);

  const estimatedUsdValue = useMemo(() => {
    const amount = Number(ethAmount);
    if (!amount || amount <= 0) return 0;
    return amount * ethPriceUsd;
  }, [ethAmount, ethPriceUsd]);

  const estimatedTokens = useMemo(() => {
    if (!estimatedUsdValue || CURRENT_PRICE_USD <= 0) return 0;
    return estimatedUsdValue / CURRENT_PRICE_USD;
  }, [estimatedUsdValue]);

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
      if (savedAmount) setEthAmount(savedAmount);
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
      if (error?.code === 4001) return;
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
      await navigator.clipboard.writeText(PRESALE_ADDRESS);
      setCopiedWallet(true);
      setTimeout(() => setCopiedWallet(false), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  }

  function handleContactChange(event) {
    const { name, value } = event.target;
    setContactForm((prev) => ({
      ...prev,
      [name]: value,
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
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: contactForm.name,
          email: contactForm.email,
          message: contactForm.message,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "Failed to send message.");
      }

      setContactForm({
        name: "",
        email: "",
        message: "",
      });

      setContactStatus("Message sent successfully.");
    } catch (error) {
      console.error("Contact form error:", error);
      setContactStatus("Failed to send message. Please try again.");
    } finally {
      setIsSubmittingContact(false);
    }
  }

  async function executeDirectPurchase(signer, value) {
    return signer.sendTransaction({
      to: PRESALE_ADDRESS,
      value,
    });
  }

  async function executeContractPurchase(signer, value) {
    if (!CONTRACT_ABI.length) {
      throw new Error("Contract ABI is missing. Paste your Remix ABI and try again.");
    }

    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    if (typeof contract[CONTRACT_FUNCTION_NAME] !== "function") {
      throw new Error(
        `Contract function "${CONTRACT_FUNCTION_NAME}" was not found. Update the function name or ABI.`
      );
    }

    return contract[CONTRACT_FUNCTION_NAME]({ value });
  }

  async function handleBuy() {
    clearMessages();

    const numericAmount = Number(ethAmount);

    if (!numericAmount || numericAmount <= 0) {
      setErrorMessage("Please enter a valid ETH amount");
      return;
    }

    if (estimatedUsdValue < MIN_PURCHASE_USD) {
      setErrorMessage(`Minimum purchase is approximately US$${MIN_PURCHASE_USD}`);
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
        accounts = await provider.send("eth_requestAccounts", []);
      }

      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
      }

      const signer = await provider.getSigner();
      const value = ethers.parseEther(ethAmount);

      setStatusMessage("Waiting for wallet confirmation...");

      let tx;
      if (PURCHASE_MODE === "contract") {
        tx = await executeContractPurchase(signer, value);
      } else {
        tx = await executeDirectPurchase(signer, value);
      }

      setStatusMessage("Transaction submitted. Waiting for blockchain confirmation...");
      await tx.wait();

      setStatusMessage("");
      setSuccessMessage("Transaction submitted successfully.");
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

  return (
    <div className="page-shell">
      <main className="container">
        <section className="hero">
          <div className="hero-badge">
            <span className="hero-logo">CLX</span>
            <span>CrossLedger</span>
          </div>

          <p className="eyebrow">CrossLedger & CLX</p>
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

            <button className="secondary-btn" onClick={copyWalletAddress}>
              {copiedWallet ? "Wallet Copied" : "Copy Presale Wallet"}
            </button>
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

        <section className="main-grid">
          <div className="left-col">
            <section className="buy-card white-card">
              <div className="section-head">
                <p className="section-kicker">Token Presale</p>
                <h2>Buy {TOKEN_SYMBOL}</h2>
                <p className="section-copy">
                  Stage 1 pricing is live. Connect your wallet and participate directly with ETH.
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
              </div>

              <label className="input-label">Amount in ETH</label>
              <input
                className="eth-input"
                type="text"
                inputMode="decimal"
                value={ethAmount}
                onChange={handleEthAmountChange}
                placeholder={minEthAmount}
              />

              <div className="preset-grid">
                {PRESET_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    className={`preset-btn ${ethAmount === amount ? "active" : ""}`}
                    onClick={() => handlePresetAmountSelect(amount)}
                  >
                    {amount} ETH
                  </button>
                ))}
              </div>

              <button
                className="buy-btn"
                onClick={handleBuy}
                disabled={isBuying || isConnecting}
              >
                {isBuying ? "Processing..." : `Buy ${TOKEN_SYMBOL}`}
              </button>

              {statusMessage ? <div className="status-box info">{statusMessage}</div> : null}
              {successMessage ? <div className="status-box success">{successMessage}</div> : null}
              {errorMessage ? <div className="status-box error">{errorMessage}</div> : null}

              <div className="summary-list">
                <div className="summary-row">
                  <span>Minimum purchase</span>
                  <strong>US${MIN_PURCHASE_USD}</strong>
                </div>
                <div className="summary-row">
                  <span>Approximate minimum in ETH</span>
                  <strong>{minEthAmount} ETH</strong>
                </div>
                <div className="summary-row">
                  <span>Maximum purchase</span>
                  <strong>{MAX_PURCHASE_TEXT}</strong>
                </div>
                <div className="summary-row">
                  <span>ETH/USD reference</span>
                  <strong>
                    {isLoadingPrice ? "Loading..." : `US$${Number(ethPriceUsd).toLocaleString()}`}
                  </strong>
                </div>
                <div className="summary-row">
                  <span>Estimated value</span>
                  <strong>{estimatedUsdValue > 0 ? `US$${estimatedUsdValue.toFixed(2)}` : "—"}</strong>
                </div>
                <div className="summary-row">
                  <span>Estimated {TOKEN_SYMBOL}</span>
                  <strong>
                    {estimatedTokens > 0
                      ? Number(estimatedTokens).toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })
                      : "—"}
                  </strong>
                </div>
                <div className="summary-row">
                  <span>Wallet status</span>
                  <strong>{walletAddress ? `Connected (${formatWallet(walletAddress)})` : "Not connected"}</strong>
                </div>
                <div className="summary-row">
                  <span>Purchase mode</span>
                  <strong>{PURCHASE_MODE === "contract" ? "Contract call" : "Direct transfer"}</strong>
                </div>
                <div className="summary-row wallet-row">
                  <span>Presale wallet</span>
                  <strong>{PRESALE_ADDRESS}</strong>
                </div>
              </div>
            </section>

            <section className="content-card glass">
              <p className="section-kicker light">The Problem</p>
              <h3>Global trade is still slowed by outdated systems</h3>
              <div className="bullet-list">
                <div>Paper-heavy documentation creates delays, errors and fraud risk.</div>
                <div>Cross-border transactions often involve many intermediaries and manual checks.</div>
                <div>Traditional trade finance adds friction and cost, especially for SMEs.</div>
                <div>Opaque workflows reduce trust and slow financing approvals.</div>
              </div>
            </section>

            <section className="content-card glass">
              <p className="section-kicker light">The Solution</p>
              <h3>CrossLedger Platform + CLX Token</h3>
              <div className="bullet-list">
                <div>Tiered digital wallets from entry-level to enterprise-grade use.</div>
                <div>Smart escrow contracts for conditional release of funds.</div>
                <div>Digitised and verified documentation with blockchain integrity.</div>
                <div>Real-time tracking and a single transparent ledger for all parties.</div>
                <div>CLX for fees, escrow, service access, rewards and platform utility.</div>
              </div>
            </section>

            <section className="content-card glass">
              <p className="section-kicker light">How It Works</p>
              <h3>Step-by-step trade flow</h3>
              <div className="steps">
                <div className="step">
                  <span>1</span>
                  <div>
                    <strong>Onboarding & Agreement</strong>
                    <p>Buyer and seller agree to the trade terms on-platform.</p>
                  </div>
                </div>
                <div className="step">
                  <span>2</span>
                  <div>
                    <strong>Smart Escrow Initiation</strong>
                    <p>Funds are locked into escrow using CLX or supported settlement flows.</p>
                  </div>
                </div>
                <div className="step">
                  <span>3</span>
                  <div>
                    <strong>Shipment & Tracking</strong>
                    <p>Documents are uploaded, hashed and tracked alongside the shipment.</p>
                  </div>
                </div>
                <div className="step">
                  <span>4</span>
                  <div>
                    <strong>Automatic Settlement</strong>
                    <p>Payment is released after milestone confirmation and validation.</p>
                  </div>
                </div>
                <div className="step">
                  <span>5</span>
                  <div>
                    <strong>Post-Trade Incentives</strong>
                    <p>The record stays immutable and rewards can be granted to participants.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="content-card glass">
              <p className="section-kicker light">Product Advantages</p>
              <h3>Why CrossLedger wins</h3>
              <div className="adv-grid">
                <div className="adv-box">
                  <strong>Speed & Efficiency</strong>
                  <p>Trade settlement in hours, not weeks.</p>
                </div>
                <div className="adv-box">
                  <strong>Lower Costs</strong>
                  <p>Reduced administrative overhead and lower platform fee model.</p>
                </div>
                <div className="adv-box">
                  <strong>Security & Trust</strong>
                  <p>Smart escrow and blockchain-backed transparency.</p>
                </div>
                <div className="adv-box">
                  <strong>Inclusivity & Access</strong>
                  <p>Designed to open trade access for SMEs and underserved markets.</p>
                </div>
                <div className="adv-box">
                  <strong>Integration & Flexibility</strong>
                  <p>Built for API integrations and multi-asset settlement pathways.</p>
                </div>
                <div className="adv-box">
                  <strong>User-Friendly Design</strong>
                  <p>Tiered wallets, dashboards and real-time status visibility.</p>
                </div>
              </div>
            </section>

            <section className="content-card glass">
              <p className="section-kicker light">Token Utility</p>
              <h3>What CLX is used for</h3>
              <div className="bullet-list">
                <div>Transaction fees such as smart escrow and document verification.</div>
                <div>Collateral inside escrow between counterparties.</div>
                <div>Unlocking platform services, wallet tiers, document minting and tracking tools.</div>
                <div>Volume and loyalty discounts through non-governance staking models.</div>
                <div>Early user rewards, referrals and premium service access.</div>
              </div>
            </section>

            <section className="allocation-card white-card">
              <div className="section-head">
                <p className="section-kicker">Token Allocation</p>
                <h2>Aligned for trade adoption</h2>
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
              <p className="section-kicker light">Phases</p>
              <h3>Project phases</h3>
              <div className="phase-item">
                <div className="phase-badge">Phase 1</div>
                <div>
                  <strong>Token Launch & Presale</strong>
                  <p>Early access, branding, wallet connection and initial token participation.</p>
                </div>
              </div>
              <div className="phase-item">
                <div className="phase-badge">Phase 2</div>
                <div>
                  <strong>Trade Validation Platform</strong>
                  <p>Escrow, documentation validation and transaction workflow deployment.</p>
                </div>
              </div>
              <div className="phase-item">
                <div className="phase-badge">Phase 3</div>
                <div>
                  <strong>Global Commodity Network</strong>
                  <p>Broader rollout into real trade corridors and enterprise partnerships.</p>
                </div>
              </div>
            </section>

            <section className="content-card glass">
              <p className="section-kicker light">Business Model</p>
              <h3>Wallet tiers, fees and utility</h3>
              <div className="bullet-list">
                <div>Basic, Professional and Enterprise wallet tiers.</div>
                <div>Transaction fees for smart escrow and document verification.</div>
                <div>CLX-based discounts, rewards and service access.</div>
                <div>Long-term expansion into additional trade services and integrations.</div>
              </div>
            </section>

            <section className="content-card glass">
              <p className="section-kicker light">Target Market</p>
              <h3>Where CrossLedger is focused</h3>
              <div className="bullet-list">
                <div>Emerging trade hubs across Southeast Asia, Africa and Latin America.</div>
                <div>Commodity, agri-product, minerals and SME trade flows.</div>
                <div>Major corridors including Asia-Pacific, the Middle East and Latin America.</div>
                <div>High-friction trades where paperwork and settlement delay create the biggest pain.</div>
              </div>
            </section>

            <section className="content-card glass">
              <p className="section-kicker light">Roadmap</p>
              <h3>Execution roadmap</h3>
              <div className="roadmap-item">
                <div className="dot" />
                <div>
                  <strong>Q1</strong>
                  <p>Launch website, presale, branding and wallet integration.</p>
                </div>
              </div>
              <div className="roadmap-item">
                <div className="dot" />
                <div>
                  <strong>Q2</strong>
                  <p>Expand outreach, pilots and strategic infrastructure development.</p>
                </div>
              </div>
              <div className="roadmap-item">
                <div className="dot" />
                <div>
                  <strong>Q3</strong>
                  <p>Deploy trade verification, documentation and workflow tooling.</p>
                </div>
              </div>
              <div className="roadmap-item">
                <div className="dot" />
                <div>
                  <strong>Q4</strong>
                  <p>Scale network participation and partnership-led market expansion.</p>
                </div>
              </div>
            </section>

            <section className="content-card glass">
              <p className="section-kicker light">Leadership</p>
              <h3>Team</h3>
              <div className="team-item">
                <strong>Gui Di Nardo — Co-Founder & CEO</strong>
                <p>
                  International trade specialist with broad cross-border commodity experience
                  across Brazil, China and Australia.
                </p>
              </div>
              <div className="team-item">
                <strong>Tom Young — Co-Founder & CTO</strong>
                <p>
                  Blockchain and digital asset infrastructure lead focused on token architecture,
                  legal alignment and technology execution.
                </p>
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
          padding: 24px 16px 72px;
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

        .primary-btn,
        .secondary-btn,
        .buy-btn,
        .preset-btn {
          transition: transform 0.15s ease, opacity 0.15s ease, box-shadow 0.15s ease;
        }

        .primary-btn:hover,
        .secondary-btn:hover,
        .buy-btn:hover,
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

        .secondary-btn {
          min-width: 220px;
          height: 66px;
          padding: 0 22px;
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
          font-size: 17px;
          font-weight: 700;
        }

        .progress-card {
          border-radius: 28px;
          padding: 24px;
          margin-bottom: 28px;
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
        .white-card .section-kicker {
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
          font-size: clamp(28px, 4vw, 34px);
          font-weight: 800;
        }

        .input-label {
          display: block;
          margin-bottom: 12px;
          font-size: clamp(22px, 4vw, 32px);
          font-weight: 800;
        }

        .eth-input {
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

        .buy-btn {
          width: 100%;
          height: 92px;
          border: none;
          border-radius: 24px;
          background: linear-gradient(90deg, #071225 0%, #162b48 100%);
          color: #fff;
          font-size: clamp(24px, 4vw, 34px);
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

        .wallet-row strong {
          word-break: break-all;
          max-width: 100%;
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
        .allocation-box p {
          margin: 6px 0 0;
          color: rgba(255, 255, 255, 0.82);
          line-height: 1.65;
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

        @media (max-width: 1080px) {
          .main-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 760px) {
          .page-shell {
            padding: 18px 12px 56px;
          }

          .progress-top,
          .metric-grid,
          .adv-grid,
          .allocation-grid,
          .preset-grid {
            grid-template-columns: 1fr;
          }

          .buy-card,
          .content-card,
          .allocation-card,
          .progress-card {
            padding: 20px;
            border-radius: 24px;
          }

          .primary-btn,
          .secondary-btn {
            width: 100%;
            min-width: 0;
          }

          .hero-actions {
            width: 100%;
          }

          .hero-copy {
            font-size: 17px;
          }

          .eth-input {
            height: 82px;
          }

          .buy-btn {
            height: 84px;
          }
        }
      `}</style>
    </div>
  );
}
