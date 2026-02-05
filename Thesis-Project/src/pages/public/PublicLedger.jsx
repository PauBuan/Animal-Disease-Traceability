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

  const barangays = [
    "Brgy Aplaya",
    "Brgy Balibago",
    "Brgy Caingin",
    "Brgy Dila",
    "Brgy Dita",
    "Brgy Don Jose",
    "Brgy Ibaba",
    "Brgy Kanluran",
    "Brgy Labas",
    "Brgy Macabling",
    "Brgy Malitlit",
    "Brgy Malusak",
    "Brgy Market Area",
    "Brgy Pooc",
    "Brgy Pulong Santa Cruz",
    "Brgy Santo Domingo",
    "Brgy Sinalhan",
    "Brgy Tagapo",
  ];

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const loggedInUser = localStorage.getItem("username");
        const userMsp = localStorage.getItem("mspId");
        if (!loggedInUser) return;

        setUsername(loggedInUser);
        setMspId(userMsp);

        const res = await fetch(
          `http://localhost:3001/api/transactions/${loggedInUser}`,
        );
        const data = await res.json();
        setTransactions(data || []);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    const storedName = localStorage.getItem("fullName") || "";
    const storedContact = localStorage.getItem("contactNumber") || "";
    let storedLocation = localStorage.getItem("barangay") || "";
    if (storedLocation && !storedLocation.toLowerCase().includes("brgy")) {
      storedLocation = `Brgy ${storedLocation}`;
    }
    setFormData((prev) => ({
      ...prev,
      fullName: storedName,
      contactNumber: storedContact,
      location: storedLocation,
    }));

    fetchTransactions();
  }, []);

  const viewBlockchainHistory = async (mongoId) => {
    setHistoryLoading(true);
    setShowHistoryModal(true);
    try {
      const res = await fetch(
        `http://localhost:3001/api/transactions/history/${mongoId}?username=${username}&mspId=${mspId}`,
      );
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

    const newTx = {
      ...formData,
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
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-12">
      <header className="max-w-7xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-black text-emerald-900 tracking-tight">
          Animal Health Ledger
        </h1>
        <p className="mt-3 text-lg text-emerald-600 font-medium">
          Secure Traceability Protocol
        </p>
      </header>

      <div className="max-w-7xl mx-auto grid gap-10 lg:grid-cols-2">
        {/* Form Section */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
            Register Asset
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <input
                name="fullName"
                value={formData.fullName}
                readOnly
                className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-semibold outline-none cursor-not-allowed"
                placeholder="Full Name"
              />
              <input
                name="contactNumber"
                value={formData.contactNumber}
                readOnly
                className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-semibold outline-none cursor-not-allowed"
                placeholder="Contact"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">
                  Species
                </label>
                <select
                  name="species"
                  value={formData.species}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition bg-white text-slate-700"
                >
                  <option value="" disabled>
                    Select Species
                  </option>
                  {["Hog", "Cow", "Chicken", "Sheep", "Goat"].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="0"
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">
                Health Condition
              </label>
              <textarea
                name="healthStatus"
                value={formData.healthStatus}
                onChange={handleChange}
                placeholder="Describe health observations..."
                rows={3}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition resize-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">
                Barangay Location
              </label>
              <input
                name="location"
                value={formData.location}
                readOnly
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-semibold outline-none cursor-not-allowed"
                placeholder="Auto-filled Barangay"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]"
            >
              Save to Blockchain
            </button>
          </form>
        </section>

        {/* Local History Table */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            Record History
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="py-4 px-2 text-emerald-600">Audit</th>
                  <th className="py-4 px-2">Species</th>
                  <th className="py-4 px-2">Location</th>
                  <th className="py-4 px-2 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {transactions.map((tx) => (
                  <tr
                    key={tx._id}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition"
                  >
                    <td className="py-4 px-2">
                      <button
                        onClick={() => viewBlockchainHistory(tx._id)}
                        className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase hover:bg-emerald-100 transition"
                      >
                        Trail
                      </button>
                    </td>
                    <td className="py-4 px-2 font-semibold text-slate-700">
                      {tx.species}
                    </td>
                    <td className="py-4 px-2 text-slate-600">{tx.location}</td>
                    <td className="py-4 px-2 text-right text-slate-400 text-xs">
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Improved Audit Trail Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0">
              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  Blockchain Audit Trail
                </h3>
                <p className="text-emerald-500 text-sm font-bold uppercase tracking-tighter">
                  Cryptographic History
                </p>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-8 overflow-y-auto bg-slate-50/30">
              {historyLoading ? (
                <div className="flex flex-col items-center py-20">
                  <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-slate-400 font-medium">
                    Fetching from Peer Nodes...
                  </p>
                </div>
              ) : history.length === 0 ? (
                <p className="text-center text-slate-400 py-10 italic">
                  No blockchain records found.
                </p>
              ) : (
                <div className="space-y-0">
                  {history.map((item, i) => (
                    <div key={i} className="relative pl-10 pb-10 group">
                      {/* Timeline Line */}
                      {i !== history.length - 1 && (
                        <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-slate-200 group-hover:bg-emerald-200 transition-colors"></div>
                      )}

                      {/* Node Dot */}
                      <div className="absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white bg-emerald-500 shadow-md shadow-emerald-200 z-10"></div>

                      <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-emerald-500/30 transition-all hover:shadow-xl hover:shadow-slate-200/50">
                        <div className="flex justify-between items-start mb-4">
                          <span className="bg-slate-900 text-white text-[10px] px-2 py-1 rounded font-mono uppercase tracking-widest">
                            TX: {item.txId.substring(0, 12)}...
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                            {formatDate(item.data.timestamp)}
                          </span>
                        </div>

                        <p className="text-lg font-black text-slate-800 mb-4">
                          {item.data.status || "State Update"}
                        </p>

                        <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-500 font-medium">
                          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <span className="block text-slate-400 uppercase text-[9px] mb-1">
                              Species
                            </span>
                            <span className="text-slate-800 font-bold">
                              {item.data.species}
                            </span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <span className="block text-slate-400 uppercase text-[9px] mb-1">
                              Quantity
                            </span>
                            <span className="text-slate-800 font-bold">
                              {item.data.quantity} heads
                            </span>
                          </div>
                          <div className="col-span-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <span className="block text-slate-400 uppercase text-[9px] mb-1">
                              Origin
                            </span>
                            <span className="text-slate-800">
                              {item.data.location}
                            </span>
                          </div>
                          <div className="col-span-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <span className="block text-slate-400 uppercase text-[9px] mb-1">
                              Condition
                            </span>
                            <span className="text-slate-800 italic">
                              "{item.data.healthStatus}"
                            </span>
                          </div>
                        </div>

                        {item.data.diagnosedDisease && (
                          <div className="mt-3 bg-red-50 border border-red-100 p-3 rounded-lg flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                            <span className="text-xs font-black text-red-600">
                              DIAGNOSIS: {item.data.diagnosedDisease}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-12 text-center">
        <button
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
          className="bg-white text-slate-400 border border-slate-200 px-8 py-3 rounded-2xl hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all font-bold text-sm"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
