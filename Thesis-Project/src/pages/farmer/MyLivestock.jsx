import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuditTrailModal from "../../components/common/AuditTrailModal";
import MedicalLogModal from "../../components/common/MedicalLogModal";

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

  // Health Log States
  const [healthLogs, setHealthLogs] = useState([]);
  const [healthLoading, setHealthLoading] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [selectedAnimalForHealth, setSelectedAnimalForHealth] = useState(null);
  const [healthLogCounts, setHealthLogCounts] = useState({});

  // Search State
  const [searchQuery, setSearchQuery] = useState("");

  // --- NEW: Risk Assessment State ---
  const [farmRisk, setFarmRisk] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

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

  // --- ML RISK CALCULATION LOGIC ---
  const handleCalculateRisk = async () => {
    setIsCalculating(true);
    try {
      // 1. Database/State Tally: Count Total Population
      const totalPop = transactions.reduce(
        (acc, tx) => acc + Number(tx.quantity || 0),
        0,
      );

      // 2. Blockchain Data Tally: Severity Counts
      let safeCount = 0;
      let mildCount = 0;
      let dangerousCount = 0;

      transactions.forEach((tx) => {
        if (tx.severity === "safe") safeCount++;
        else if (tx.severity === "mild") mildCount++;
        else if (tx.severity === "dangerous") dangerousCount++;
      });

      const totalDiagnosed = safeCount + mildCount + dangerousCount;

      if (totalDiagnosed === 0) {
        alert("No verified blockchain health records found to perform assessment.");
        return;
      }

      // 3. Medical Log Tally: Count total logs from health-record entries
      const lookupIds = transactions
        .map((tx) => tx.batchId || tx._id)
        .filter(Boolean);

      const missingIds = lookupIds.filter((id) => healthLogCounts[id] === undefined);
      let fetchedCounts = {};

      if (missingIds.length > 0) {
        const fetchedEntries = await Promise.all(
          missingIds.map(async (id) => {
            try {
              const res = await fetch(`http://localhost:3001/api/health-records/${id}`);
              if (!res.ok) throw new Error("Health record count fetch failed");
              const data = await res.json();
              return [id, Array.isArray(data) ? data.length : 0];
            } catch {
              return [id, 0];
            }
          }),
        );

        fetchedCounts = Object.fromEntries(fetchedEntries);
        setHealthLogCounts((prev) => ({ ...prev, ...fetchedCounts }));
      }

      const mergedCounts = { ...healthLogCounts, ...fetchedCounts };
      const totalMedicalLogs = lookupIds.reduce(
        (sum, id) => sum + Number(mergedCounts[id] || 0),
        0,
      );

      // 4. Feature Engineering (Ratios)
      const sR = safeCount / totalDiagnosed;
      const mR = mildCount / totalDiagnosed;
      const dR = dangerousCount / totalDiagnosed;
      const pF = Math.min(totalPop / 500, 2);
      const logsPerDiagnosed = totalMedicalLogs / totalDiagnosed;
      const lF = Math.min(logsPerDiagnosed / 3, 1.5);

      // 5. Logistic Regression Simulation
      // Weights: Dangerous heavily increases z, Safe decreases it, frequent logs add signal.
      const z = (dR * 5.0) + (mR * 2.0) + (sR * -3.5) + (pF * 0.8) - (lF * 0.9) - 0.5;

      const probability = 1 / (1 + Math.exp(-z));
      const score = Math.round(probability * 100);

      // 6. Determine Level
      let level = "Low Risk";
      let color = "text-emerald-500";
      if (score >= 70) {
        level = "Critical";
        color = "text-red-600";
      } else if (score >= 35) {
        level = "Moderate";
        color = "text-amber-600";
      }

      await new Promise((resolve) => setTimeout(resolve, 800));
      setFarmRisk({
        score,
        level,
        color,
        totalPop,
        safeCount,
        mildCount,
        dangerousCount,
        totalMedicalLogs,
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const viewBlockchainHistory = async (lookupId) => {
    setHistoryLoading(true);
    setShowHistoryModal(true);
    try {
      const res = await fetch(
        `http://localhost:3001/api/transactions/history/${lookupId}?username=${username}&mspId=${mspId}`,
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

  const viewHealthRecords = async (tx) => {
    const lookupId = tx.batchId || tx._id;
    setSelectedAnimalForHealth(tx);
    setHealthLoading(true);
    setShowHealthModal(true);
    try {
      const res = await fetch(`http://localhost:3001/api/health-records/${lookupId}`);
      if (!res.ok) throw new Error("Failed to fetch health records");
      const data = await res.json();
      setHealthLogs(data || []);
      setHealthLogCounts((prev) => ({
        ...prev,
        [lookupId]: Array.isArray(data) ? data.length : 0,
      }));
    } catch {
      setHealthLogs([]);
      setHealthLogCounts((prev) => ({ ...prev, [lookupId]: 0 }));
    } finally {
      setHealthLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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
      if (!response.ok) throw new Error("Failed to save transaction");
      const savedTx = await response.json();
      setTransactions((prev) => [savedTx, ...prev]);
      alert("Record added successfully!");
      setFormData(prev => ({ ...prev, species: "", quantity: "", healthStatus: "" }));
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    const query = searchQuery.toLowerCase();
    return (tx.batchId || "").toLowerCase().includes(query) || (tx.species || "").toLowerCase().includes(query);
  });

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-12 bg-slate-50">
      <header className="max-w-7xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-black text-emerald-900 tracking-tight">Animal Health Ledger</h1>
        <p className="mt-3 text-lg text-emerald-600 font-medium">Secure Traceability Protocol</p>
      </header>

      <div className="max-w-[1400px] mx-auto grid gap-8 lg:grid-cols-2">
        {/* Form Section */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 border-t-4 border-t-emerald-500 p-8 h-fit">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Register Asset</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <input name="fullName" value={formData.fullName} readOnly className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-semibold outline-none" />
              <input name="contactNumber" value={formData.contactNumber} readOnly className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-semibold outline-none" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select name="species" value={formData.species} onChange={handleChange} required className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-700">
                <option value="" disabled>Select Species</option>
                {["Hog", "Cow", "Chicken", "Carabao", "Duck", "Goat"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="Quantity" required className="w-full px-4 py-3 border border-slate-200 rounded-xl" />
            </div>
            <textarea name="healthStatus" value={formData.healthStatus} onChange={handleChange} placeholder="Initial Health Observation..." rows={3} required className="w-full px-4 py-3 border border-slate-200 rounded-xl resize-none" />
            <input name="location" value={formData.location} readOnly className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-semibold" />
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98]">Save to Blockchain</button>
          </form>
        </section>

        {/* Table Section */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 flex flex-col h-[750px]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-slate-800">Record History</h2>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button 
                onClick={handleCalculateRisk}
                disabled={isCalculating}
                className="whitespace-nowrap bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {isCalculating ? "Analyzing..." : "Analyze Risk"}
              </button>
              <div className="relative flex-1 sm:w-64">
                <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                <span className="absolute left-3 top-2.5">🔍</span>
              </div>
            </div>
          </div>

          {/* --- RISK ASSESSMENT DASHBOARD --- */}
          {farmRisk && (
            <div className="mb-6 p-6 rounded-[2rem] bg-slate-900 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Farm Health Security Index</h3>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-black ${farmRisk.color}`}>{farmRisk.score}%</span>
                    <span className="text-sm font-bold text-slate-300">/ 100 Risk Score</span>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <div className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-bold">📍 Pop: {farmRisk.totalPop}</div>
                    <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-bold">✅ {farmRisk.safeCount} Safe</div>
                    <div className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-[10px] font-bold">⛔ {farmRisk.dangerousCount} Alert</div>
                    <div className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-[10px] font-bold">🩺 {farmRisk.totalMedicalLogs} Logs</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-black uppercase italic ${farmRisk.color}`}>{farmRisk.level}</div>
                  <p className="text-[9px] text-slate-400 mt-1 max-w-[120px] leading-tight">ML-Powered Probability based on Node Transactions</p>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-auto flex-1 pr-2 custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white z-10 border-b border-slate-100">
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="py-4 px-4">Audit</th>
                  <th className="py-4 px-4">Medical</th>
                  <th className="py-4 px-4">Batch / Species</th>
                  <th className="py-4 px-4 text-center">Qty</th>
                  <th className="py-4 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredTransactions.map((tx) => (
                  <tr key={tx._id} className={`border-b border-slate-50 hover:bg-slate-50/60 transition ${tx.severity === 'dangerous' ? 'bg-red-50/30' : ''}`}>
                    <td className="py-4 px-4">
                      <button onClick={() => viewBlockchainHistory(tx.batchId || tx._id)} className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-emerald-100 transition">Trail</button>
                    </td>
                    <td className="py-4 px-4">
                      <button onClick={() => viewHealthRecords(tx)} className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-blue-100 transition">Log</button>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-700 flex items-center gap-2">
                        {tx.species}
                        {tx.severity === "dangerous" && <span title="Dangerous">⛔</span>}
                        {tx.severity === "mild" && <span title="Mild">⚠️</span>}
                        {tx.severity === "safe" && <span title="Safe">✅</span>}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{tx.batchId || "Legacy"}</div>
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-slate-600">{tx.quantity}</td>
                    <td className="py-4 px-4 text-right text-slate-400 text-xs">{new Date(tx.timestamp).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <MedicalLogModal isOpen={showHealthModal} onClose={() => setShowHealthModal(false)} healthLoading={healthLoading} healthLogs={healthLogs} selectedAnimal={selectedAnimalForHealth} />
      <AuditTrailModal isOpen={showHistoryModal} onClose={() => setShowHistoryModal(false)} historyLoading={historyLoading} history={history} selectedAnimal={transactions.find((t) => (t.batchId || t._id) === history[0]?.data?.batchId) || {}} />
    </div>
  );
}