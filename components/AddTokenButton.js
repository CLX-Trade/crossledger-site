// "Add CLXT to wallet": asks the connected wallet to list CLXT, with its logo,
// through wallet_watchAsset (EIP-747). Wallets otherwise take token logos from
// token lists that follow a trading market, which CLXT does not have, so a
// holder sees a blank icon. This adds the logo only; wallets still show no price.
//
// A wallet adds the token on whatever network it is on, so the request is sent
// only on Ethereum mainnet. Off mainnet the button switches network first.
// The network comes from the wallet connection, not useChainId(): wagmi's
// chain state ignores networks this site does not configure, so with the
// wallet on Base useChainId() still reports mainnet.
//
// The switch goes through AppKit, not wagmi's switchChain: AppKit opens its
// own "Switch Network" sheet for unsupported networks, and a switch it did
// not make can leave that sheet stuck open. AppKit swallows wallet errors
// there, so the outcome is read back from the wallet.
import { useState } from "react";
import { useAppKit, useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { mainnet } from "@reown/appkit/networks";
import { useConnection, useWatchAsset } from "wagmi";
import { CONTRACTS, SITE } from "../lib/site";
import { trackEvent } from "../lib/analytics";

// Absolute production URL: the wallet saves this address and fetches the image
// itself, long after the visit. Preview deployments sit behind Vercel login,
// so a relative or preview URL would leave the icon blank. Do not rename or
// remove this file while holders may have it saved.
const TOKEN_IMAGE = `${SITE.url}/clxt-logo-cmc.png`;

export default function AddTokenButton() {
  const { open } = useAppKit();
  const { isConnected } = useAppKitAccount();
  const { chainId, connector } = useConnection();
  const { switchNetwork } = useAppKitNetwork();
  const { mutateAsync: watchAssetAsync } = useWatchAsset();
  const [busy, setBusy] = useState(false);
  // Plain text only: wallet error strings are rendered as text, not markup.
  const [msg, setMsg] = useState(null);
  const chainOk = chainId === mainnet.id;

  async function handleClick() {
    if (busy) return;
    setMsg(null);
    if (!isConnected || !connector) { open(); return; }
    setBusy(true);
    let switching = false;
    try {
      // Asked of the wallet at click time, so a network change the page has
      // not caught up with cannot add CLXT on the wrong network.
      if ((await connector.getChainId()) !== mainnet.id) {
        switching = true;
        await switchNetwork(mainnet);
        if ((await connector.getChainId()) !== mainnet.id) {
          setMsg({ kind: "network", text: "The network was not switched. Switch your wallet to Ethereum and try again." });
        }
        return;
      }
      const added = await watchAssetAsync({
        type: "ERC20",
        options: { address: CONTRACTS.clxt, symbol: "CLXT", decimals: 18, image: TOKEN_IMAGE },
      });
      setMsg(added ? { kind: "ok", text: "CLXT added to your wallet." } : { kind: "error", text: "Your wallet did not add CLXT." });
      trackEvent("add_token", { result: added ? "added" : "declined" });
    } catch (e) {
      const code = e?.code ?? e?.cause?.code;
      const text = e?.shortMessage || e?.message || "Unknown error";
      if (code === 4001 || code === "ACTION_REJECTED" || /rejected|denied/i.test(text)) {
        setMsg({ kind: "error", text: "Cancelled in your wallet." });
        if (!switching) trackEvent("add_token", { result: "rejected" });
      } else if (switching) {
        setMsg({ kind: "error", text: `Could not switch network: ${text}` });
      } else if ([4200, -32601, -32004].includes(code) || /not supported|unsupported|does not support|method not found/i.test(text)) {
        setMsg({ kind: "unsupported" });
        trackEvent("add_token", { result: "unsupported" });
      } else {
        setMsg({ kind: "error", text: `Could not add CLXT: ${text}` });
        trackEvent("add_token", { result: "error" });
      }
    } finally {
      setBusy(false);
    }
  }

  const label = busy ? "Check your wallet…"
    : !isConnected ? "Connect wallet to add CLXT"
    : !chainOk ? "Switch to Ethereum to add CLXT"
    : "Add CLXT to wallet";

  return (
    <div className="add-token">
      <button type="button" className="btn btn-outline" onClick={handleClick} disabled={busy}>
        <img src="/clxt-coin-64.png" width="20" height="20" alt="" />{label}
      </button>
      {/* A "network" notice is stale once the wallet is on Ethereum, however it got there. */}
      {msg && !(msg.kind === "network" && chainOk) && (
        <p className={`small ${msg.kind === "ok" ? "muted" : "add-token-error"}`} role="status">
          {msg.kind === "unsupported"
            ? <>This wallet cannot add tokens from a website. Add CLXT by hand with the contract address <code>{CONTRACTS.clxt}</code>.</>
            : msg.text}
        </p>
      )}
    </div>
  );
}
