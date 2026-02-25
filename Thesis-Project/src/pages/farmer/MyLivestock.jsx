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

  // --- NEW: Health Log States ---
  const [healthLogs, setHealthLogs] = useState([]);
  const [healthLoading, setHealthLoading] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [selectedAnimalForHealth, setSelectedAnimalForHealth] = useState(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");

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

  // Fetch Health Records
  const viewHealthRecords = async (tx) => {
    const lookupId = tx.batchId || tx._id;
    setSelectedAnimalForHealth(tx);
    setHealthLoading(true);
    setShowHealthModal(true);
    try {
      // We will build this endpoint in the backend next
      const res = await fetch(
        `http://localhost:3001/api/health-records/${lookupId}`,
      );
      if (!res.ok) throw new Error("Failed to fetch health records");
      const data = await res.json();
      setHealthLogs(data || []);
    } catch (err) {
      console.error("Health Log Error:", err.message);
      setHealthLogs([]); // empty for now if endpoint doesn't exist
    } finally {
      setHealthLoading(false);
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

  const handleLogout = () => {
    localStorage.clear();
    console.log("User logged out");
    navigate("/login");
  };

  // Filter transactions based on Search Query
  const filteredTransactions = transactions.filter((tx) => {
    const query = searchQuery.toLowerCase();
    const batchMatch = (tx.batchId || "").toLowerCase().includes(query);
    const speciesMatch = (tx.species || "").toLowerCase().includes(query);
    return batchMatch || speciesMatch;
  });

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-12">
      <header className="max-w-7xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-black text-emerald-900 tracking-tight">
          Animal Health Ledger
        </h1>
        <p className="mt-3 text-lg text-emerald-600 font-medium">
          Secure Traceability Protocol
        </p>
      </header>

      {/* ------ */}
      <div className="max-w-[1400px] mx-auto grid gap-8 lg:grid-cols-2">
        {/* Form Section */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 border-t-4 border-t-emerald-500 p-8 h-fit">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
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
                  {["Hog", "Cow", "Chicken", "Carabao", "Duck", "Goat"].map(
                    (opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ),
                  )}
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
                Initial Health Observation (Farmer's Note)
              </label>
              <textarea
                name="healthStatus"
                value={formData.healthStatus}
                onChange={handleChange}
                placeholder="Describe health observations (e.g., Active, eating well, or minor cough...)"
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

        {/* Table Section */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 flex flex-col h-[700px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">
              Record History
            </h2>

            {/* SEARCH BAR */}
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search Batch ID or Species..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition"
              />
              <span className="absolute left-3 top-3 text-slate-400">🔍</span>
            </div>
          </div>

          {/* SCROLLABLE CONTAINER */}
          <div className="overflow-auto flex-1 pr-2 custom-scrollbar">
            <table className="w-full text-left border-collapse relative">
              <thead className="sticky top-0 bg-white z-10 shadow-sm">
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="py-4 px-4 text-emerald-600">Audit</th>
                  <th className="py-4 px-4 text-blue-600">Medical</th>
                  <th className="py-4 px-4">Batch ID / Species</th>
                  <th className="py-4 px-4 text-center">Qty</th>
                  <th className="py-4 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-16 text-center text-slate-400 italic"
                    >
                      No records match your search.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => {
                    // Logic for Health Indicators
                    const isDangerous = tx.severity === "dangerous";
                    const isMild = tx.severity === "mild";
                    const isSafe = tx.severity === "safe";
                    const isPending =
                      !tx.severity ||
                      tx.severity === "Ongoing" ||
                      tx.status === "Submitted to Vet";

                    return (
                      <tr
                        key={tx._id}
                        className={`border-b border-slate-50 transition ${
                          isDangerous || isMild
                            ? "bg-red-50/20 hover:bg-red-50/50"
                            : "hover:bg-slate-50/60"
                        }`}
                      >
                        <td className="py-4 px-4">
                          <button
                            onClick={() =>
                              viewBlockchainHistory(tx.batchId || tx._id)
                            }
                            className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-emerald-100 transition shadow-sm"
                          >
                            Trail
                          </button>
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => viewHealthRecords(tx)}
                            className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-blue-100 transition shadow-sm"
                          >
                            Log
                          </button>
                        </td>

                        {/* BATCH ID & ICONS COMBINED */}
                        <td className="py-4 px-4">
                          <div className="font-bold text-slate-700 flex items-center gap-2 text-base">
                            {tx.species}
                            {/* DYNAMIC ICONS */}
                            {isDangerous && (
                              <span
                                title="Dangerous Disease (Cull/Isolate)"
                                className="text-red-500 animate-pulse text-lg"
                              >
                                ⛔
                              </span>
                            )}
                            {isMild && (
                              <span
                                title="Mild Illness (Quarantine)"
                                className="text-amber-500 text-lg"
                              >
                                ⚠️
                              </span>
                            )}
                            {isSafe && (
                              <span
                                title="Verified Healthy"
                                className="text-emerald-500 text-lg"
                              >
                                ✅
                              </span>
                            )}
                            {isPending && (
                              <span
                                title="Pending Vet Verification"
                                className="text-blue-400 text-lg opacity-80"
                              >
                                ⏳
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {tx.batchId || "Legacy ID"}
                          </div>
                        </td>

                        <td className="py-4 px-4 text-center font-bold text-slate-600 text-base">
                          {tx.quantity}
                        </td>

                        <td className="py-4 px-4 text-right text-slate-400 text-xs font-medium">
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* --- Medical Records Modal --- */}
      <MedicalLogModal
        isOpen={showHealthModal}
        onClose={() => setShowHealthModal(false)}
        healthLoading={healthLoading}
        healthLogs={healthLogs}
        selectedAnimal={selectedAnimalForHealth}
      />

      {/* Audit Trail Modal */}
      <AuditTrailModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        historyLoading={historyLoading}
        history={history}
        selectedAnimal={
          transactions.find(
            (t) => (t.batchId || t._id) === history[0]?.data?.batchId,
          ) || {}
        } // Pass basic info
      />
    </div>
  );
}
