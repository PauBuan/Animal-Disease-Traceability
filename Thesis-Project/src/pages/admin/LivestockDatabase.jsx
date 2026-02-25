// src/pages/admin/LivestockDatabase.jsx
import React, { useState, useEffect } from "react";
import AuditTrailModal from "../../components/common/AuditTrailModal";
import MedicalLogModal from "../../components/common/MedicalLogModal";

// === Main AdminAnimalDB Component ===
export default function AdminAnimalDB() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("active"); // 'active' or 'archived'
  const [farmerData, setFarmerData] = useState([]);

  // Blockchain History States
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);

  // Animal Selection States
  const [showAnimalListModal, setShowAnimalListModal] = useState(false);
  const [farmerAnimals, setFarmerAnimals] = useState([]);
  const [selectedAnimal, setSelectedAnimal] = useState(null);

  // --- NEW: Health Log States ---
  const [healthLogs, setHealthLogs] = useState([]);
  const [healthLoading, setHealthLoading] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);

  useEffect(() => {
    fetchAllTransactions();
  }, [activeTab]);

  const fetchAllTransactions = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/transactions");
      const data = await res.json();
      setTransactions(data || []);
      processTransactions(data || []);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const processTransactions = (txList) => {
    // 1. FILTER based on Active Tab
    const filteredList = txList.filter((tx) => {
      const isArchived = ["Slaughtered", "Exported"].includes(tx.status);
      return activeTab === "active" ? !isArchived : isArchived;
    });

    // 2. GROUP by Farmer + Location
    const grouped = {};
    filteredList.forEach((tx) => {
      const farmer = tx.fullName || "Unknown";
      const barangay = tx.location || "Unknown";
      const key = `${farmer}-${barangay}`;

      if (!grouped[key]) {
        grouped[key] = {
          farmer,
          barangay,
          verifiedHealthy: 0,
          unverified: 0,
          sick: 0,
          archivedCount: 0, // Track exited animals
          transactions: [],
        };
      }

      grouped[key].transactions.push(tx);

      // Count Logic
      if (["Slaughtered", "Exported"].includes(tx.status)) {
        grouped[key].archivedCount += tx.quantity || 1;
      } else {
        const severity = (tx.severity || "").toLowerCase();
        if (severity === "mild" || severity === "dangerous") {
          grouped[key].sick += tx.quantity || 1;
        } else if (severity === "safe") {
          grouped[key].verifiedHealthy += tx.quantity || 1;
        } else {
          grouped[key].unverified += tx.quantity || 1;
        }
      }
    });

    setFarmerData(Object.values(grouped));
  };
  const viewFarmerAnimals = (farmer, barangay) => {
    // Filter from the main list based on selection
    const animals = transactions.filter(
      (tx) => tx.fullName === farmer && tx.location === barangay,
    );
    // Double check we only show the right status for the current tab
    const currentTabAnimals = animals.filter((tx) => {
      const isArchived = ["Slaughtered", "Exported"].includes(tx.status);
      return activeTab === "active" ? !isArchived : isArchived;
    });

    setFarmerAnimals(currentTabAnimals);
    setSelectedFarmer({ farmer, barangay });
    setShowAnimalListModal(true);
  };

  const viewBlockchainHistory = async (transaction) => {
    setSelectedAnimal(transaction);
    setShowAnimalListModal(false);
    setHistoryLoading(true);
    setShowHistoryModal(true);

    try {
      if (transaction) {
        const adminUser = localStorage.getItem("username");
        const adminMsp = localStorage.getItem("mspId");

        const lookupId = transaction.batchId || transaction._id;
        const url = `http://localhost:3001/api/transactions/history/${lookupId}?username=${adminUser}&mspId=${adminMsp}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Blockchain data unreachable");

        const data = await res.json();
        setHistory(data || []);
      }
    } catch (err) {
      console.error("Blockchain Error:", err.message);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // --- NEW: Fetch Health Records ---
  const viewHealthRecords = async (transaction) => {
    setSelectedAnimal(transaction);
    setShowAnimalListModal(false);
    setHealthLoading(true);
    setShowHealthModal(true);

    const lookupId = transaction.batchId || transaction._id;

    try {
      const res = await fetch(
        `http://localhost:3001/api/health-records/${lookupId}`,
      );
      if (!res.ok) throw new Error("Failed to fetch health records");
      const data = await res.json();
      setHealthLogs(data || []);
    } catch (err) {
      console.error("Health Log Error:", err.message);
      setHealthLogs([]);
    } finally {
      setHealthLoading(false);
    }
  };

  const closeAllModals = () => {
    setShowAnimalListModal(false);
    setShowHistoryModal(false);
    setShowHealthModal(false);
    setSelectedFarmer(null);
    setSelectedAnimal(null);
    setHistory([]);
  };

  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const handleDownload = () => alert("Animal Database Report downloaded!");

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">
            Loading livestock data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="max-w-screen-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-emerald-800">
            Livestock Database
          </h1>
          <p className="text-gray-600 mt-2">
            Complete health status of all registered livestock in Santa Rosa
            City
          </p>
        </div>
        {/* --- TABS --- */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-6 py-2 rounded-full font-bold transition ${activeTab === "active" ? "bg-emerald-600 text-white shadow-lg" : "bg-white text-slate-500 hover:bg-slate-100"}`}
          >
            🟢 Active Inventory
          </button>
          <button
            onClick={() => setActiveTab("archived")}
            className={`px-6 py-2 rounded-full font-bold transition ${activeTab === "archived" ? "bg-slate-700 text-white shadow-lg" : "bg-white text-slate-500 hover:bg-slate-100"}`}
          >
            🗄️ Exited / Archived
          </button>
        </div>
        {/* SUMMARY STATS (Only show specific stats based on tab) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-10">
          {activeTab === "active" ? (
            <>
              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-emerald-500 text-center">
                <p className="text-sm font-bold text-gray-600 uppercase">
                  Verified Safe
                </p>
                <p className="text-4xl font-black text-emerald-600 mt-2">
                  {farmerData.reduce((sum, d) => sum + d.verifiedHealthy, 0)}
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-400 text-center">
                <p className="text-sm font-bold text-gray-600 uppercase">
                  Unverified
                </p>
                <p className="text-4xl font-black text-yellow-600 mt-2">
                  {farmerData.reduce((sum, d) => sum + d.unverified, 0)}
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500 text-center">
                <p className="text-sm font-bold text-gray-600 uppercase">
                  Confirmed Sick
                </p>
                <p className="text-4xl font-black text-red-600 mt-2">
                  {farmerData.reduce((sum, d) => sum + d.sick, 0)}
                </p>
              </div>
            </>
          ) : (
            <div className="col-span-3 bg-white p-6 rounded-xl shadow-md border-l-4 border-slate-500 text-center">
              <p className="text-sm font-bold text-gray-600 uppercase">
                Total Exited (Slaughtered/Exported)
              </p>
              <p className="text-4xl font-black text-slate-600 mt-2">
                {farmerData.reduce((sum, d) => sum + d.archivedCount, 0)}
              </p>
            </div>
          )}
        </div>

        {/* MAIN TABLE */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm uppercase tracking-wider">
                  <th className="p-5 font-bold text-left">Owner</th>
                  <th className="p-5 font-bold text-left">Location</th>
                  {activeTab === "active" ? (
                    <>
                      <th className="p-5 font-bold text-center">Verified</th>
                      <th className="p-5 font-bold text-center">Unverified</th>
                      <th className="p-5 font-bold text-center">Sick</th>
                    </>
                  ) : (
                    <th className="p-5 font-bold text-center">Total Exited</th>
                  )}
                  <th className="p-5 font-bold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {farmerData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">
                      No records found
                    </td>
                  </tr>
                ) : (
                  farmerData.map((data, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-emerald-50/50 transition-colors"
                    >
                      <td className="p-5 font-medium text-gray-800">
                        {data.farmer}
                      </td>
                      <td className="p-5 text-gray-600 text-sm">
                        {data.barangay}
                      </td>

                      {activeTab === "active" ? (
                        <>
                          <td className="p-5 text-center">
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-sm">
                              {data.verifiedHealthy}
                            </span>
                          </td>
                          <td className="p-5 text-center">
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full font-bold text-sm">
                              {data.unverified}
                            </span>
                          </td>
                          <td className="p-5 text-center">
                            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full font-bold text-sm">
                              {data.sick}
                            </span>
                          </td>
                        </>
                      ) : (
                        <td className="p-5 text-center">
                          <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full font-bold text-sm">
                            {data.archivedCount}
                          </span>
                        </td>
                      )}

                      <td className="p-5 text-center">
                        <button
                          onClick={() =>
                            viewFarmerAnimals(data.farmer, data.barangay)
                          }
                          className="text-emerald-600 hover:text-emerald-800 font-bold text-sm underline"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ANIMAL LIST MODAL */}
      {showAnimalListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0">
              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  Select Animal
                </h3>
                {selectedFarmer && (
                  <p className="text-emerald-500 text-sm font-bold uppercase tracking-tighter">
                    {selectedFarmer.farmer} - {selectedFarmer.barangay}
                  </p>
                )}
              </div>
              <button
                onClick={closeAllModals}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-8 overflow-y-auto bg-slate-50/30">
              {farmerAnimals.length === 0 ? (
                <p className="text-center text-slate-400 py-10 italic">
                  No animals found for this farmer.
                </p>
              ) : (
                <div className="space-y-4">
                  {farmerAnimals.map((animal, idx) => {
                    // Check if animal is sick for UI indicators
                    const isSick =
                      animal.severity === "mild" ||
                      animal.severity === "dangerous";

                    return (
                      <div
                        key={animal._id || idx}
                        className={`bg-white border rounded-2xl p-6 transition-all hover:shadow-xl group ${
                          isSick
                            ? "border-red-300 shadow-sm shadow-red-100"
                            : "border-slate-200 hover:border-emerald-500"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4
                                className={`text-xl font-black capitalize ${isSick ? "text-red-700" : "text-slate-900 group-hover:text-emerald-600 transition-colors"}`}
                              >
                                {isSick && (
                                  <span className="mr-2" title="Sick Asset">
                                    ⚠️
                                  </span>
                                )}
                                {animal.species}
                              </h4>
                              <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-1 rounded-md font-mono border border-slate-200">
                                {animal.batchId || "Legacy ID"}
                              </span>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">
                              Quantity:{" "}
                              <span className="font-bold text-slate-700">
                                {animal.quantity} heads
                              </span>
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              isSick
                                ? "bg-red-50 text-red-600"
                                : "bg-emerald-50 text-emerald-600"
                            }`}
                          >
                            {formatDate(animal.timestamp)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                          <div
                            className={`p-3 rounded-lg border ${isSick ? "bg-red-50/50 border-red-100" : "bg-slate-50 border-slate-100"}`}
                          >
                            <span className="block text-slate-400 text-xs mb-1">
                              Health Status
                            </span>
                            <span
                              className={`font-semibold ${isSick ? "text-red-700" : "text-slate-800"}`}
                            >
                              {isSick && animal.diagnosedDisease
                                ? animal.diagnosedDisease
                                : animal.healthStatus}
                            </span>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <span className="block text-slate-400 text-xs mb-1">
                              Location
                            </span>
                            <span className="text-slate-800 font-semibold">
                              {animal.location}
                            </span>
                          </div>
                        </div>

                        {/* ACTION BUTTONS ROW */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50">
                          {animal.proofDocumentUrl &&
                            ["Slaughtered", "Exported"].includes(
                              animal.status,
                            ) && (
                              <a
                                href={animal.proofDocumentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-purple-600 text-sm font-semibold hover:text-purple-700 bg-purple-50 border border-purple-100 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                📄 View Exit Proof
                              </a>
                            )}
                          <button
                            onClick={() => viewHealthRecords(animal)}
                            className="flex items-center text-blue-600 text-sm font-semibold hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Medical Log
                          </button>
                          <button
                            onClick={() => viewBlockchainHistory(animal)}
                            className="flex items-center text-emerald-600 text-sm font-semibold hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Audit Trail
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Medical Records Modal --- */}
      <MedicalLogModal
        isOpen={showHealthModal}
        onClose={closeAllModals}
        healthLoading={healthLoading}
        healthLogs={healthLogs}
        selectedAnimal={selectedAnimal}
      />
      {/* Blockchain History Modal */}
      <AuditTrailModal
        isOpen={showHistoryModal}
        onClose={closeAllModals}
        historyLoading={historyLoading}
        history={history}
        selectedAnimal={selectedAnimal}
      />
    </div>
  );
}
