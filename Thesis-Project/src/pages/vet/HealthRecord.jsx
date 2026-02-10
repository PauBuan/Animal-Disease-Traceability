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
      
      // LOGIC: Stricter Verification based on Vet Severity
      if (severity === "mild" || severity === "dangerous") {
        grouped[key].sick += qty;
      } else if (severity === "safe") {
        grouped[key].verifiedHealthy += qty;
      } else {
        // Fallback: If no Vet severity is set, it is Unverified
        grouped[key].unverified += qty;
      }
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

      {/* Summary Flash Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50 border-2 border-emerald-200 p-6 rounded-3xl text-center">
          <p className="text-xs font-black uppercase text-gray-500 tracking-widest">Verified Healthy</p>
          <p className="text-5xl font-black text-emerald-600 mt-2">{farmerData.reduce((s, d) => s + d.verifiedHealthy, 0)}</p>
          <p className="text-[10px] font-bold text-emerald-400 mt-1 uppercase">Vet Certified Safe</p>
        </div>
        <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-3xl text-center">
          <p className="text-xs font-black uppercase text-gray-500 tracking-widest">Unverified</p>
          <p className="text-5xl font-black text-amber-600 mt-2">{farmerData.reduce((s, d) => s + d.unverified, 0)}</p>
          <p className="text-[10px] font-bold text-amber-400 mt-1 uppercase">Pending Inspection</p>
        </div>
        <div className="bg-red-50 border-2 border-red-200 p-6 rounded-3xl text-center">
          <p className="text-xs font-black uppercase text-gray-500 tracking-widest">Confirmed Sick</p>
          <p className="text-5xl font-black text-red-600 mt-2">{farmerData.reduce((s, d) => s + d.sick, 0)}</p>
          <p className="text-[10px] font-bold text-red-400 mt-1 uppercase">Medical Attention Needed</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-green-600 text-white">
              <th className="p-6 text-xs font-bold uppercase">Farmer Name</th>
              <th className="p-6 text-xs font-bold uppercase">Barangay</th>
              <th className="p-6 text-center text-xs font-bold uppercase bg-green-700/30">Healthy</th>
              <th className="p-6 text-center text-xs font-bold uppercase bg-amber-600/20">Unverified</th>
              <th className="p-6 text-center text-xs font-bold uppercase bg-red-700/30">Sick</th>
              <th className="p-6 text-center text-xs font-bold uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {farmerData.map((data, idx) => (
              <tr key={idx} className="hover:bg-green-50/50 transition-all">
                <td className="p-6 font-bold text-gray-700">{data.farmer}</td>
                <td className="p-6 text-gray-500 font-medium">{data.barangay}</td>
                
                {/* Healthy Count */}
                <td className="p-6 text-center font-black text-emerald-600 bg-emerald-50/30">
                  {data.verifiedHealthy || "-"}
                </td>

                {/* Unverified Count */}
                <td className="p-6 text-center font-black text-amber-600 bg-amber-50/30">
                  {data.unverified || "-"}
                </td>

                {/* Sick Count */}
                <td className="p-6 text-center font-black text-red-600 bg-red-50/30">
                  {data.sick || "-"}
                </td>

                <td className="p-6 text-center">
                  <button 
                    onClick={() => viewFarmerAnimals(data.farmer, data.barangay)}
                    className="bg-green-600 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-green-700 transition-colors shadow-sm"
                  >
                    View Animals
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Section (Corrected for z-index and Overlay) */}
      {showAnimalListModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 h-screen w-screen top-0 left-0">
          <div className="bg-white rounded-[3rem] w-full max-w-xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-2xl font-black text-gray-800">Livestock Details</h2>
                <p className="text-sm text-gray-400 font-bold uppercase tracking-tight">
                  {selectedFarmer?.farmer} — {selectedFarmer?.barangay}
                </p>
              </div>
              <button 
                onClick={() => setShowAnimalListModal(false)} 
                className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-4 bg-gray-50/50">
              {farmerAnimals.map((animal, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xl font-black text-gray-800 capitalize">{animal.species}</p>
                      <p className="text-sm text-gray-500 font-medium">Head Count: <span className="text-gray-800 font-bold">{animal.quantity}</span></p>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      animal.severity === 'safe' 
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                        : (animal.severity === 'mild' || animal.severity === 'dangerous')
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}>
                      {animal.severity === 'safe' ? 'Verified Healthy' : 
                       (animal.severity === 'mild' || animal.severity === 'dangerous') ? 'Confirmed Sick' : 
                       'Pending Review'}
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