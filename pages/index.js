import { useState } from "react";
import { ethers } from "ethers";

export default function Home() {

  const [walletAddress, setWalletAddress] = useState("");
  const [error, setError] = useState("");

  async function connectWallet() {

    try {

      if (!window.ethereum) {
        setError("MetaMask is not installed");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);

      const accounts = await provider.send("eth_requestAccounts", []);

      setWalletAddress(accounts[0]);

    } catch (err) {
      console.error(err);
      setError("Wallet connection failed");
    }

  }

  return (
    <div style={{padding:40,fontFamily:"Arial"}}>

      <h1>CLX Presale</h1>

      <button onClick={connectWallet}>
        Connect Wallet
      </button>

      {walletAddress && (
        <p>Connected: {walletAddress}</p>
      )}

      {error && (
        <p style={{color:"red"}}>{error}</p>
      )}

    </div>
  );
}
