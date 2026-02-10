import React, { useState, useEffect } from "react";

export default function HealthRecord() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [farmerData, setFarmerData] = useState([]);

  // Modal State
  const [showAnimalListModal, setShowAnimalListModal] = useState(false);
  const [farmerAnimals, setFarmerAnimals] = useState([]);
  const [selectedFarmer, setSelectedFarmer] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/transactions");
      const data = await res.json();
      const txData = Array.isArray(data) ? data : [];
      setTransactions(txData);
      processFarmerStats(txData);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const processFarmerStats = (txList) => {
    if (!txList) return;
    const grouped = {};
    txList.forEach((tx) => {
      const key = `${tx.fullName || 'Unknown'}-${tx.location || 'Unknown'}`;
      if (!grouped[key]) {
        grouped[key] = {
          farmer: tx.fullName || "Unknown",
          barangay: tx.location || "Unknown",
          verifiedHealthy: 0,
          unverified: 0,
          sick: 0,
        };
      }
      const severity = (tx.severity || "").toLowerCase();
      const qty = Number(tx.quantity) || 1;
      
      if (severity === "mild" || severity === "dangerous") grouped[key].sick += qty;
      else if (severity === "safe") grouped[key].verifiedHealthy += qty;
      else grouped[key].unverified += qty;
    });
    setFarmerData(Object.values(grouped));
  };

  const viewFarmerAnimals = (farmer, barangay) => {
    const animals = transactions.filter(t => t.fullName === farmer && t.location === barangay);
    setFarmerAnimals(animals);
    setSelectedFarmer({ farmer, barangay });
    setShowAnimalListModal(true);
  };

  if (loading) return <div className="p-10 text-center font-bold text-green-600">Loading Records...</div>;

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-green-100">
        <h1 className="text-3xl font-black text-gray-800">Livestock Health Database</h1>
        <p className="text-gray-500 font-medium">City-wide monitoring of registered animal populations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50 border-2 border-emerald-200 p-6 rounded-3xl">
          <p className="text-xs font-black uppercase text-gray-500">Total Verified Safe</p>
          <p className="text-5xl font-black text-emerald-600 mt-2">{farmerData.reduce((s, d) => s + d.verifiedHealthy, 0)}</p>
        </div>
        <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-3xl">
          <p className="text-xs font-black uppercase text-gray-500">Pending Inspection</p>
          <p className="text-5xl font-black text-amber-600 mt-2">{farmerData.reduce((s, d) => s + d.unverified, 0)}</p>
        </div>
        <div className="bg-red-50 border-2 border-red-200 p-6 rounded-3xl">
          <p className="text-xs font-black uppercase text-gray-500">Confirmed Sick</p>
          <p className="text-5xl font-black text-red-600 mt-2">{farmerData.reduce((s, d) => s + d.sick, 0)}</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="p-6 text-xs font-bold uppercase">Farmer Name</th>
              <th className="p-6 text-xs font-bold uppercase">Barangay</th>
              <th className="p-6 text-center text-xs font-bold uppercase">Healthy</th>
              <th className="p-6 text-center text-xs font-bold uppercase">Sick</th>
              <th className="p-6 text-center text-xs font-bold uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {farmerData.map((data, idx) => (
              <tr key={idx} className="hover:bg-green-50/50 transition-all">
                <td className="p-6 font-bold text-gray-700">{data.farmer}</td>
                <td className="p-6 text-gray-500 font-medium">{data.barangay}</td>
                <td className="p-6 text-center font-black text-emerald-600">{data.verifiedHealthy + data.unverified}</td>
                <td className="p-6 text-center font-black text-red-600">{data.sick}</td>
                <td className="p-6 text-center">
                  <button 
                    onClick={() => viewFarmerAnimals(data.farmer, data.barangay)}
                    className="bg-green-600 text-white px-5 py-2 rounded-xl text-xs font-bold hover:shadow-md"
                  >
                    View Animals
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAnimalListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/30">
          <div className="bg-white rounded-[3rem] w-full max-w-xl max-h-[70vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-8 border-b flex justify-between items-center">
              <h2 className="text-2xl font-black">Livestock Details</h2>
              <button onClick={() => setShowAnimalListModal(false)} className="text-gray-400 font-bold hover:text-red-500">✕</button>
            </div>
            <div className="p-8 overflow-y-auto space-y-4 bg-gray-50">
              {farmerAnimals.map((animal, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-lg font-black text-gray-800">{animal.species}</p>
                      <p className="text-sm text-gray-500 font-medium">Quantity: {animal.quantity}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${animal.severity === 'safe' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {animal.healthStatus || animal.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}