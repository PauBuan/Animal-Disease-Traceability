// src/pages/admin/LivestockDatabase.jsx
import React, { useState, useEffect } from "react";

// === Main AdminAnimalDB Component ===
export default function AdminAnimalDB() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
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

    fetchAllTransactions();
  }, []);

  // --- UPDATED LOGIC: STRICTER VERIFICATION ---
  const processTransactions = (txList) => {
    // Group transactions by farmer and barangay
    const grouped = {};

    txList.forEach((tx) => {
      const farmer = tx.fullName || "Unknown";
      const barangay = tx.location || "Unknown";
      const key = `${farmer}-${barangay}`;

      if (!grouped[key]) {
        grouped[key] = {
          farmer,
          barangay,
          verifiedHealthy: 0, // Green: Vet confirmed Safe
          unverified: 0, // Yellow: All Farmer reports (Healthy OR Sick) pending Vet check
          sick: 0, // Red: ONLY Vet confirmed Sick
          transactions: [],
        };
      }

      grouped[key].transactions.push(tx);

      // Extract Statuses
      const severity = (tx.severity || "").toLowerCase(); // From Vet

      // 1. CONFIRMED SICK (Strictly Vet Diagnosis: Mild or Dangerous)
      if (severity === "mild" || severity === "dangerous") {
        grouped[key].sick += tx.quantity || 1;
      }
      // 2. VERIFIED HEALTHY (Strictly Vet Diagnosis: Safe)
      else if (severity === "safe") {
        grouped[key].verifiedHealthy += tx.quantity || 1;
      }
      // 3. UNVERIFIED (Everything else falls here)
      else {
        grouped[key].unverified += tx.quantity || 1;
      }
    });

    setFarmerData(Object.values(grouped));
  };

  const viewFarmerAnimals = (farmer, barangay) => {
    // Get all transactions for this farmer and barangay
    const animals = transactions.filter(
      (tx) => tx.fullName === farmer && tx.location === barangay,
    );
    setFarmerAnimals(animals);
    setSelectedFarmer({ farmer, barangay });
    setShowAnimalListModal(true);
  };

  const viewBlockchainHistory = async (transaction) => {
    setSelectedAnimal(transaction);
    setShowAnimalListModal(false);
    setHistoryLoading(true);
    setShowHistoryModal(true);

    try {
      if (transaction && transaction._id) {
        // Use regulator credentials for admin access to view all transactions
        let mspId =
          transaction.mspId || localStorage.getItem("mspId") || "regulator";
        let username =
          transaction.username || localStorage.getItem("username") || "";

        // Ensure mspId is one of the valid connection profiles
        if (!["farmer", "vet", "regulator"].includes(mspId)) {
          mspId = "regulator";
        }

        const url = `http://localhost:3001/api/transactions/history/${transaction._id}?username=${username}&mspId=${mspId}`;

        const res = await fetch(url);

        if (!res.ok) {
          const errorText = await res.text();
          console.error("API Error Response:", errorText);
          throw new Error("Blockchain data unreachable");
        }

        const data = await res.json();
        setHistory(data || []);
      } else {
        console.error("Invalid transaction:", transaction);
        setHistory([]);
      }
    } catch (err) {
      console.error("Blockchain Error:", err.message);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const closeAllModals = () => {
    setShowAnimalListModal(false);
    setShowHistoryModal(false);
    setSelectedFarmer(null);
    setSelectedAnimal(null);
    setHistory([]);
  };

  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const handleDownload = () => {
    alert("Animal Database Report downloaded!");
  };

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
        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-emerald-800">
            Livestock Database
          </h1>
          <p className="text-gray-600 mt-2">
            Complete health status of all registered livestock in Santa Rosa
            City
          </p>
        </div>

        {/* --- UPDATED SUMMARY STATS (ICONS REMOVED) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-10">
          {/* CARD 1: VERIFIED HEALTHY */}
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-emerald-500 text-center">
            <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">
              Verified Safe
            </p>
            <p className="text-4xl font-black text-emerald-600 mt-2">
              {farmerData.reduce((sum, d) => sum + d.verifiedHealthy, 0)}
            </p>
            <p className="text-xs text-emerald-500 font-medium mt-1">
              Vet Certified
            </p>
          </div>

          {/* CARD 2: UNVERIFIED */}
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-400 text-center">
            <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">
              Pending Verification
            </p>
            <p className="text-4xl font-black text-yellow-600 mt-2">
              {farmerData.reduce((sum, d) => sum + d.unverified, 0)}
            </p>
            <p className="text-xs text-yellow-600 font-medium mt-1">
              Needs Vet Visit
            </p>
          </div>

          {/* CARD 3: SICK / FLAGGED */}
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500 text-center">
            <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">
              Confirmed Sick
            </p>
            <p className="text-4xl font-black text-red-600 mt-2">
              {farmerData.reduce((sum, d) => sum + d.sick, 0)}
            </p>
            <p className="text-xs text-red-500 font-medium mt-1">
              Medical Attention
            </p>
          </div>
        </div>

        {/* --- UPDATED TABLE --- */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm uppercase tracking-wider">
                  <th className="p-5 font-bold text-left">Farmer</th>
                  <th className="p-5 font-bold text-left">Barangay</th>
                  <th className="p-5 font-bold text-center bg-emerald-800/20">
                    Verified
                  </th>
                  <th className="p-5 font-bold text-center bg-yellow-600/20">
                    Unverified
                  </th>
                  <th className="p-5 font-bold text-center bg-red-800/20">
                    Sick
                  </th>
                  <th className="p-5 font-bold text-center">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {farmerData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">
                      No livestock records found
                    </td>
                  </tr>
                ) : (
                  farmerData.map((data, idx) => (
                    <tr
                      key={`${data.farmer}-${data.barangay}-${idx}`}
                      className="hover:bg-emerald-50/50 transition-colors"
                    >
                      <td className="p-5 font-medium text-gray-800">
                        {data.farmer}
                      </td>
                      <td className="p-5 text-gray-600 text-sm font-medium">
                        {data.barangay}
                      </td>

                      {/* Verified Column */}
                      <td className="p-5 text-center">
                        {data.verifiedHealthy > 0 ? (
                          <span className="inline-flex items-center justify-center px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-sm">
                            {data.verifiedHealthy}
                          </span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>

                      {/* Unverified Column (Includes Farmer-Reported Sick) */}
                      <td className="p-5 text-center">
                        {data.unverified > 0 ? (
                          <span className="inline-flex items-center justify-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full font-bold text-sm">
                            {data.unverified}
                          </span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>

                      {/* Sick Column (Vet Confirmed Only) */}
                      <td className="p-5 text-center">
                        {data.sick > 0 ? (
                          <span className="inline-flex items-center justify-center px-3 py-1 bg-red-100 text-red-800 rounded-full font-bold text-sm animate-pulse">
                            {data.sick}
                          </span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>

                      <td className="p-5 text-center">
                        <button
                          onClick={() =>
                            viewFarmerAnimals(data.farmer, data.barangay)
                          }
                          className="text-emerald-600 hover:text-emerald-800 font-semibold text-sm underline decoration-2 underline-offset-2 transition"
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

        {/* Download Button */}
        <div className="flex justify-center">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-slate-800 text-white px-6 py-3 rounded-xl hover:bg-slate-900 transition font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download Full Report
          </button>
        </div>
      </div>

      {/* Animal List Modal */}
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
                  {farmerAnimals.map((animal, idx) => (
                    <div
                      key={animal._id || idx}
                      onClick={() => viewBlockchainHistory(animal)}
                      className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-emerald-500 transition-all hover:shadow-xl cursor-pointer group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                            {animal.species}
                          </h4>
                          <p className="text-sm text-slate-500 mt-1">
                            Quantity:{" "}
                            <span className="font-bold text-slate-700">
                              {animal.quantity} heads
                            </span>
                          </p>
                        </div>
                        <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold">
                          {formatDate(animal.timestamp)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <span className="block text-slate-400 text-xs mb-1">
                            Health Status (Farmer)
                          </span>
                          <span className="text-slate-800 font-semibold">
                            {animal.healthStatus}
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

                      {animal.diagnosedDisease && (
                        <div className="mt-3 bg-red-50 border border-red-100 p-3 rounded-lg flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <span className="text-xs font-bold text-red-600">
                            DIAGNOSED: {animal.diagnosedDisease}
                          </span>
                        </div>
                      )}

                      {/* Show Verified Status in List */}
                      {animal.severity === "safe" && (
                        <div className="mt-3 bg-emerald-50 border border-emerald-100 p-3 rounded-lg flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                          <span className="text-xs font-bold text-emerald-600">
                            VET VERIFIED: Safe
                          </span>
                        </div>
                      )}

                      <div className="mt-4 flex items-center justify-end text-emerald-600 text-sm font-semibold group-hover:text-emerald-700">
                        View Blockchain Trail
                        <svg
                          className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Blockchain History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0">
              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  Blockchain Audit Trail
                </h3>
                {selectedAnimal && (
                  <p className="text-emerald-500 text-sm font-bold uppercase tracking-tighter">
                    {selectedAnimal.species} - {selectedAnimal.quantity} heads -{" "}
                    {selectedAnimal.location}
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
              {historyLoading ? (
                <div className="flex flex-col items-center py-20">
                  <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-slate-400 font-medium">
                    Fetching from Blockchain...
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
    </div>
  );
}
