// src/pages/public/PublicLedger.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PublicLedger() {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [mspId, setMspId] = useState("");
  
  // Blockchain History States
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    contactNumber: "",
    species: "",
    quantity: "",
    healthStatus: "",
    location: "",
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const loggedInUser = localStorage.getItem("username");
        const userMsp = localStorage.getItem("mspId");
        if (!loggedInUser) return;

        setUsername(loggedInUser);
        setMspId(userMsp);

        const res = await fetch(`http://localhost:3001/api/transactions/${loggedInUser}`);
        const data = await res.json();
        setTransactions(data || []);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    // Prefill and ensure state is updated
    const storedName = localStorage.getItem("fullName") || "";
    const storedContact = localStorage.getItem("contactNumber") || "";

    setFormData((prev) => ({
      ...prev,
      fullName: storedName,
      contactNumber: storedContact,
    }));

    fetchTransactions();
  }, []);

  const viewBlockchainHistory = async (mongoId) => {
    setHistoryLoading(true);
    setShowHistoryModal(true);
    try {
      const res = await fetch(`http://localhost:3001/api/transactions/history/${mongoId}?username=${username}&mspId=${mspId}`);
      if (!res.ok) throw new Error("Blockchain data unreachable");
      const data = await res.json();
      setHistory(data || []);
    } catch (err) {
      console.error("Blockchain Error:", err.message);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username) return alert("No user logged in");

    // Construct transaction explicitly to ensure contactNumber is included
    const newTx = {
      ...formData, // This now includes fullName and contactNumber from state
      status: "Submitted to Vet",
      severity: "Ongoing",
      username: username,
      mspId: localStorage.getItem("mspId"),
      quantity: Number(formData.quantity),
      timestamp: new Date().toISOString(),
      blockchainTxId: null,
    };

    try {
      const response = await fetch("http://localhost:3001/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTx),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save transaction");
      }

      const savedTx = await response.json();
      setTransactions((prev) => [savedTx, ...prev]);
      alert("Record added successfully to Ledger and Blockchain!");

      // Reset fields but KEEP fullName and contactNumber
      setFormData((prev) => ({
        ...prev,
        species: "",
        quantity: "",
        healthStatus: "",
        location: "",
      }));
    } catch (err) {
      alert("Error adding transaction: " + err.message);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 py-12 px-4 sm:px-6 lg:px-12">
      <header className="max-w-7xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-extrabold text-emerald-800">Animal Health Records</h1>
        <p className="mt-3 text-lg text-emerald-600">Secure Traceability Powered by Hyperledger Fabric</p>
      </header>

      <div className="max-w-7xl mx-auto grid gap-10 lg:grid-cols-2">
        {/* Form */}
        <section className="bg-white rounded-2xl shadow-xl p-8 border border-emerald-100">
          <h2 className="text-2xl font-bold text-emerald-700 mb-6">Add New Record</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <input name="fullName" value={formData.fullName} readOnly className="px-4 py-3 bg-gray-50 border border-emerald-100 rounded-lg text-gray-500 cursor-not-allowed" placeholder="Full Name" />
              <input name="contactNumber" value={formData.contactNumber} readOnly className="px-4 py-3 bg-gray-50 border border-emerald-100 rounded-lg text-gray-500 cursor-not-allowed" placeholder="Contact" />
            </div>
            <input name="species" value={formData.species} onChange={handleChange} placeholder="Species (e.g. Hog, Chicken)" required className="w-full px-4 py-3 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 transition" />
            <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="Quantity" required className="w-full px-4 py-3 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 transition" />
            <textarea name="healthStatus" value={formData.healthStatus} onChange={handleChange} placeholder="Health Condition Description" rows={3} required className="w-full px-4 py-3 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 transition resize-none" />
            
            <select name="location" value={formData.location} onChange={handleChange} required className="w-full px-4 py-3 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 transition">
              <option value="" disabled>Select Barangay</option>
              {["Brgy Aplaya", "Brgy Balibago", "Brgy Caingin", "Brgy Dila", "Brgy Dita", "Brgy Don Jose", "Brgy Ibaba", "Brgy Kanluran", "Brgy Labas", "Brgy Macabling", "Brgy Malitlit", "Brgy Malusak", "Brgy Market Area", "Brgy Pooc", "Brgy Pulong Santa Cruz", "Brgy Santo Domingo", "Brgy Sinalhan", "Brgy Tagapo"].map(brgy => (
                <option key={brgy} value={brgy}>{brgy}</option>
              ))}
            </select>

            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 rounded-lg shadow-md transition">
              Save to Blockchain
            </button>
          </form>
        </section>

        {/* History Table */}
        <section className="bg-white rounded-2xl shadow-xl p-8 border border-emerald-100">
          <h2 className="text-2xl font-bold text-emerald-700 mb-6">Record History</h2>
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-emerald-100">
              <thead className="bg-emerald-50">
                <tr className="text-left text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  <th className="px-4 py-3">Audit</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Species</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <button onClick={() => viewBlockchainHistory(tx._id)} className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold hover:bg-emerald-200">Trail</button>
                    </td>
                    <td className="px-4 py-3 font-medium text-emerald-600">{tx.status}</td>
                    <td className="px-4 py-3 text-gray-700">{tx.species}</td>
                    <td className="px-4 py-3 text-gray-700">{tx.location}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(tx.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Adjusted Timeline Item Mapping */}
{history.length === 0 ? (
  <p className="text-center text-gray-400 italic">No blockchain records found.</p>
) : (
  history.map((item, i) => (
    <div key={i} className="relative pl-8 border-l-2 border-emerald-500 py-1 pb-6">
      {/* The Node Dot */}
      <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-50"></div>
      
      {/* Blockchain Proof */}
      <p className="text-[10px] font-mono text-emerald-500 mb-1 flex items-center gap-1">
        <span className="bg-emerald-100 px-1 rounded">BLOCKCHAIN PROOF</span>
        {item.txId.substring(0, 16)}...
      </p>

      {/* Transaction Content */}
      <p className="font-bold text-gray-800 leading-none mb-2 text-lg">
        {item.data.status || "Record Created"}
      </p>

      <div className="bg-gray-50 p-3 rounded-xl text-xs border border-gray-100 shadow-sm space-y-1">
        <p><span className="text-gray-400">Origin:</span> {item.data.location}</p>
        <p><span className="text-gray-400">Species:</span> {item.data.species} ({item.data.quantity} heads)</p>
        <p><span className="text-gray-400">Health:</span> {item.data.healthStatus}</p>
        {item.data.diagnosedDisease && (
          <p className="text-red-600 font-semibold bg-red-50 p-1 rounded">
            Diagnosis: {item.data.diagnosedDisease}
          </p>
        )}
      </div>

      {/* Timestamp Fix: Pulling from item.data since Go contract includes it there */}
      <p className="text-[10px] text-gray-400 mt-2">
        Validated on: {formatDate(item.data.timestamp)}
      </p>
    </div>
  ))
)}
      <div className="mt-12 text-center">
        <button onClick={() => { localStorage.clear(); navigate("/login"); }} className="bg-gray-100 text-gray-600 px-8 py-3 rounded-xl hover:bg-red-50 hover:text-red-600 transition font-bold">Sign Out</button>
      </div>
    </div>
  );
}