import { useState, useEffect } from "react";

export default function VetTransactionLogs() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending"); // 'pending' or 'managed'

  // MODAL STATES
  const [modalType, setModalType] = useState(null); // 'diagnose', 'update', 'healthLog'
  const [selectedTx, setSelectedTx] = useState(null);

  // FORM STATES
  const [diagnosisForm, setDiagnosisForm] = useState({
    diagnosis: "",
    severity: "safe",
  });
  const [healthLogForm, setHealthLogForm] = useState({
    type: "Vaccination",
    name: "",
    notes: "",
    nextDueDate: "",
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/transactions");
      const data = await res.json();
      setTransactions(data || []);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- FILTERS ---
  const pendingTransactions = transactions.filter(
    (t) => t.severity === "Ongoing" || !t.severity,
  );

  const managedTransactions = transactions.filter(
    (t) => t.severity && t.severity !== "Ongoing",
  );

  // --- ACTIONS ---
  const openModal = (type, tx) => {
    setModalType(type);
    setSelectedTx(tx);
    // Reset Forms
    setDiagnosisForm({
      diagnosis: tx.diagnosedDisease || "",
      severity: tx.severity === "Ongoing" ? "safe" : tx.severity,
    });
    setHealthLogForm({
      type: "Vaccination",
      name: "",
      notes: "",
      nextDueDate: "",
    });
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedTx(null);
  };

  // 1. SUBMIT INITIAL DIAGNOSIS or STATUS UPDATE
  const handleDiagnosisSubmit = async () => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return alert("You are not logged in.");
    const currentUser = JSON.parse(storedUser);

    if (currentUser.mspId !== "VetMSP") return alert("Access Denied.");

    try {
      const res = await fetch(
        `http://localhost:3001/api/transactions/${selectedTx._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "Verified by Vet", // Standardize status
            diagnosedDisease:
              diagnosisForm.severity === "safe" ? "" : diagnosisForm.diagnosis,
            severity: diagnosisForm.severity,
            username: currentUser.username,
            mspId: currentUser.mspId,
          }),
        },
      );

      if (!res.ok) throw new Error("Failed to update status");

      const updatedTx = await res.json();

      // Update Local State
      setTransactions((prev) =>
        prev.map((tx) => (tx._id === updatedTx._id ? updatedTx : tx)),
      );

      // If it was a 'Pending' item, switch tab to 'Managed' to show user where it went
      if (activeTab === "pending") setActiveTab("managed");

      closeModal();
      alert("Animal status updated successfully!");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // 2. SUBMIT HEALTH RECORD (Vaccine/Test)
  const handleHealthLogSubmit = async () => {
    const storedUser = localStorage.getItem("user");
    const currentUser = JSON.parse(storedUser);

    try {
      const payload = {
        batchId: selectedTx.batchId || selectedTx._id, // Smart Fallback
        type: healthLogForm.type,
        name: healthLogForm.name,
        notes: healthLogForm.notes,
        nextDueDate: healthLogForm.nextDueDate,
        vetUsername: currentUser.username,
        mspId: currentUser.mspId,
        status: "Valid",
      };

      const res = await fetch("http://localhost:3001/api/health-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save health record");

      closeModal();
      alert("Medical record added to digital log!");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    return new Date(isoString).toLocaleDateString();
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800">
            Veterinary Dashboard
          </h1>
          <p className="text-slate-500">Manage triage and medical records</p>
        </div>

        {/* TAB SWITCHER */}
        <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 flex">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "pending" ? "bg-emerald-500 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}
          >
            Pending Triage ({pendingTransactions.length})
          </button>
          <button
            onClick={() => setActiveTab("managed")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "managed" ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}
          >
            Managed Inventory ({managedTransactions.length})
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            Loading records...
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">
                  Batch ID
                </th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">
                  Farmer / Location
                </th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">
                  Animal
                </th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase text-center">
                  Status
                </th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(activeTab === "pending"
                ? pendingTransactions
                : managedTransactions
              ).map((tx) => (
                <tr key={tx._id} className="hover:bg-slate-50/80 transition">
                  <td className="p-4">
                    <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                      {tx.batchId || "LEGACY"}
                    </span>
                    <div className="text-xs text-slate-400 mt-1">
                      {formatDate(tx.timestamp)}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-700">
                      {tx.fullName}
                    </div>
                    <div className="text-xs text-slate-500">{tx.location}</div>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-slate-800">
                      {tx.quantity}x {tx.species}
                    </span>
                    <div className="text-xs text-slate-500 italic">
                      "{tx.healthStatus}"
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    {tx.severity === "safe" && (
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                        Healthy
                      </span>
                    )}
                    {(tx.severity === "mild" ||
                      tx.severity === "dangerous") && (
                      <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                        Sick: {tx.diagnosedDisease}
                      </span>
                    )}
                    {(!tx.severity || tx.severity === "Ongoing") && (
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                        Unverified
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      {activeTab === "pending" ? (
                        <button
                          onClick={() => openModal("diagnose", tx)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition"
                        >
                          Verify & Triage
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => openModal("healthLog", tx)}
                            className="bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 px-3 py-2 rounded-lg text-xs font-bold transition"
                          >
                            + Record
                          </button>
                          <button
                            onClick={() => openModal("update", tx)}
                            className="bg-slate-100 text-slate-600 hover:bg-slate-200 px-3 py-2 rounded-lg text-xs font-bold transition"
                          >
                            Update Status
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {(activeTab === "pending"
                ? pendingTransactions
                : managedTransactions
              ).length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="p-8 text-center text-slate-400 italic"
                  >
                    No records found in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* --- MODAL LOGIC --- */}
      {modalType && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* HEADER */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">
                {modalType === "diagnose" && "Initial Verification"}
                {modalType === "update" && "Update Health Status"}
                {modalType === "healthLog" && "Add Medical Record"}
              </h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-red-500"
              >
                ✕
              </button>
            </div>

            {/* BODY */}
            <div className="p-6">
              {/* 1. DIAGNOSIS / UPDATE FORM */}
              {(modalType === "diagnose" || modalType === "update") && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Status Verdict
                    </label>
                    <select
                      value={diagnosisForm.severity}
                      onChange={(e) =>
                        setDiagnosisForm({
                          ...diagnosisForm,
                          severity: e.target.value,
                        })
                      }
                      className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="safe">✅ Verified Healthy (Safe)</option>
                      <option value="mild">⚠️ Mild Illness (Quarantine)</option>
                      <option value="dangerous">
                        ⛔ Dangerous Disease (Cull/Isolate)
                      </option>
                    </select>
                  </div>

                  {diagnosisForm.severity !== "safe" && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        Diagnosed Disease
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Swine Flu, ASF, Infection"
                        value={diagnosisForm.diagnosis}
                        onChange={(e) =>
                          setDiagnosisForm({
                            ...diagnosisForm,
                            diagnosis: e.target.value,
                          })
                        }
                        className="w-full border border-red-200 bg-red-50 rounded-lg p-3 text-red-700 placeholder-red-300 focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                  )}

                  <button
                    onClick={handleDiagnosisSubmit}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl mt-4"
                  >
                    {modalType === "diagnose"
                      ? "Submit Verification"
                      : "Update Status"}
                  </button>
                </div>
              )}

              {/* 2. HEALTH LOG FORM */}
              {modalType === "healthLog" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        Record Type
                      </label>
                      <select
                        value={healthLogForm.type}
                        onChange={(e) =>
                          setHealthLogForm({
                            ...healthLogForm,
                            type: e.target.value,
                          })
                        }
                        className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                      >
                        <option>Vaccination</option>
                        <option>Deworming</option>
                        <option>Lab Test</option>
                        <option>Vitamin</option>
                        <option>VHC Issuance</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        Next Due (Opt)
                      </label>
                      <input
                        type="date"
                        value={healthLogForm.nextDueDate}
                        onChange={(e) =>
                          setHealthLogForm({
                            ...healthLogForm,
                            nextDueDate: e.target.value,
                          })
                        }
                        className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Name / Description
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Hog Cholera Vaccine (Batch 99)"
                      value={healthLogForm.name}
                      onChange={(e) =>
                        setHealthLogForm({
                          ...healthLogForm,
                          name: e.target.value,
                        })
                      }
                      className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Notes
                    </label>
                    <textarea
                      placeholder="Any observation during administration..."
                      value={healthLogForm.notes}
                      onChange={(e) =>
                        setHealthLogForm({
                          ...healthLogForm,
                          notes: e.target.value,
                        })
                      }
                      className="w-full border border-slate-300 rounded-lg p-3 text-sm h-20 resize-none outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    onClick={handleHealthLogSubmit}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl mt-4"
                  >
                    Save to Digital Log
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
