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
    severity: "safe",
    diseasePreset: "", // "African Swine Fever (ASF)", "Avian Influenza", "Foot and Mouth Disease (FMD)", "Other"
    customDisease: "",
  });
  const [healthLogForm, setHealthLogForm] = useState({
    type: "Vaccination",
    name: "",
    notes: "",
    nextDueDate: "",
    proofFile: null,
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/transactions");
      const data = await res.json();
      const activeData = (data || []).filter(
        (tx) => !["Slaughtered", "Exported"].includes(tx.status),
      );
      setTransactions(activeData);
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
    // Logic to map existing custom diseases to the dropdown
    const existingDisease = tx.diagnosedDisease || "";
    const standardDiseases = [
      "African Swine Fever (ASF)",
      "Avian Influenza",
      "Foot and Mouth Disease (FMD)",
      "",
    ];
    const isStandard = standardDiseases.includes(existingDisease);

    // Reset Forms
    setDiagnosisForm({
      severity: tx.severity === "Ongoing" ? "safe" : tx.severity,
      diseasePreset: isStandard ? existingDisease : "Other",
      customDisease: isStandard ? "" : existingDisease,
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
    // Determine final disease string based on dropdown
    const finalDisease =
      diagnosisForm.severity === "safe"
        ? "None"
        : diagnosisForm.diseasePreset === "Other"
          ? diagnosisForm.customDisease
          : diagnosisForm.diseasePreset;

    // Validation
    if (diagnosisForm.severity !== "safe" && !finalDisease.trim()) {
      return alert("Please select or type a specific disease.");
    }

    try {
      const res = await fetch(
        `http://localhost:3001/api/transactions/${selectedTx._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "Verified by Vet", // Standardize status
            diagnosedDisease: finalDisease,
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
      // Use FormData instead of JSON to handle the file
      const formData = new FormData();
      formData.append("batchId", selectedTx.batchId || selectedTx._id);
      formData.append("type", healthLogForm.type);
      formData.append("name", healthLogForm.name);
      formData.append("notes", healthLogForm.notes);
      formData.append("nextDueDate", healthLogForm.nextDueDate);
      formData.append("vetUsername", currentUser.username);
      formData.append("mspId", currentUser.mspId);
      formData.append("status", "Valid");

      // Append the file if it exists
      if (healthLogForm.proofFile) {
        formData.append("proofFile", healthLogForm.proofFile);
      }

      const res = await fetch("http://localhost:3001/api/health-records", {
        method: "POST",
        // Do NOT set Content-Type to application/json.
        // Fetch will automatically set it to multipart/form-data when using FormData.
        body: formData,
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
              ).map((tx) => {
                // If it is in any state regarding transfer, lock the buttons.
                const isLocked = [
                  "Pending Transfer",
                  "Pending Regulator Verification",
                  "Pending Vet Review",
                ].includes(tx.status);

                return (
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
                      <div className="text-xs text-slate-500">
                        {tx.location}
                      </div>
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
                      {/* RENDER LOGIC BASED ON isLocked */}
                      {isLocked ? (
                        <div className="relative group inline-block">
                          <button
                            disabled
                            className="cursor-not-allowed bg-slate-100 text-slate-400 px-4 py-2 rounded-lg text-xs font-bold border border-slate-200 flex items-center gap-2"
                          >
                            🔒 Locked
                          </button>
                          {/* Hover Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 bg-slate-800 text-white text-[10px] p-2 rounded shadow-lg text-center z-10">
                            Action disabled. This asset is currently undergoing
                            a Transfer or Exit workflow.
                          </div>
                        </div>
                      ) : (
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
                      )}
                    </td>
                  </tr>
                );
              })}
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
                          diseasePreset: "",
                          customDisease: "",
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

                  {/* --- DYNAMIC DISEASE DROPDOWN --- */}
                  {diagnosisForm.severity !== "safe" && (
                    <div className="space-y-4 bg-red-50/50 p-4 rounded-xl border border-red-100">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                          {diagnosisForm.severity === "mild"
                            ? "Condition Category"
                            : "Select Disease"}
                        </label>
                        <select
                          value={diagnosisForm.diseasePreset}
                          onChange={(e) =>
                            setDiagnosisForm({
                              ...diagnosisForm,
                              diseasePreset: e.target.value,
                            })
                          }
                          className="w-full border border-red-200 rounded-lg p-3 text-red-700 bg-white focus:ring-2 focus:ring-red-500 outline-none font-medium"
                        >
                          <option value="" disabled>
                            -- Select an Option --
                          </option>

                          {/* RENDER "MILD" OPTIONS */}
                          {diagnosisForm.severity === "mild" && (
                            <>
                              <option value="Respiratory Infection">
                                Respiratory Infection
                              </option>
                              <option value="Parasitic Infection">
                                Parasitic Infection (Worms/Ticks)
                              </option>
                              <option value="Digestive Issue / Scours">
                                Digestive Issue / Scours
                              </option>
                              <option value="Skin Condition / Mange">
                                Skin Condition / Mange
                              </option>
                              <option value="Physical Injury / Lameness">
                                Physical Injury / Lameness
                              </option>
                            </>
                          )}

                          {/* RENDER "DANGEROUS" OPTIONS */}
                          {diagnosisForm.severity === "dangerous" && (
                            <>
                              <option value="African Swine Fever (ASF)">
                                African Swine Fever (ASF)
                              </option>
                              <option value="Avian Influenza">
                                Avian Influenza (Bird Flu)
                              </option>
                              <option value="Foot and Mouth Disease (FMD)">
                                Foot and Mouth Disease (FMD)
                              </option>
                            </>
                          )}

                          {/* "OTHER" IS ALWAYS AVAILABLE */}
                          <option value="Other">Other (Specify)</option>
                        </select>
                      </div>

                      {/* Custom Disease Input (Only shows if "Other" is selected) */}
                      {diagnosisForm.diseasePreset === "Other" && (
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                            Specify Condition
                          </label>
                          <input
                            type="text"
                            placeholder="Type specific diagnosis..."
                            value={diagnosisForm.customDisease}
                            onChange={(e) =>
                              setDiagnosisForm({
                                ...diagnosisForm,
                                customDisease: e.target.value,
                              })
                            }
                            className="w-full border border-red-200 bg-white rounded-lg p-3 text-red-700 placeholder-red-300 focus:ring-2 focus:ring-red-500 outline-none"
                          />
                        </div>
                      )}
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
                        className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
                      >
                        <option>Vaccination</option>
                        <option>Deworming</option>
                        <option>Lab Test</option>
                        <option>Vitamin</option>
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
                        className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
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
                      className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
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
                      className="w-full border border-slate-300 rounded-lg p-3 h-20 resize-none outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
                    />
                  </div>
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <label className="block text-xs font-bold text-blue-600 uppercase mb-2">
                      Upload Proof (Optional)
                    </label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-blue-200 border-dashed rounded-lg cursor-pointer bg-white hover:bg-blue-50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg
                            className="w-6 h-6 mb-2 text-blue-400"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 20 16"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                            />
                          </svg>
                          <p className="mb-1 text-xs text-slate-500">
                            <span className="font-bold text-blue-600">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-[10px] text-slate-400">
                            PDF, PNG, or JPG (MAX. 5MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,.pdf"
                          onChange={(e) =>
                            setHealthLogForm({
                              ...healthLogForm,
                              proofFile: e.target.files[0],
                            })
                          }
                        />
                      </label>
                    </div>
                    {/* Show selected file name */}
                    {healthLogForm.proofFile && (
                      <p className="text-xs text-emerald-600 font-bold mt-2 text-center flex items-center justify-center gap-1">
                        ✅ {healthLogForm.proofFile.name}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleHealthLogSubmit}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-wider py-4 rounded-xl mt-2 shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
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
