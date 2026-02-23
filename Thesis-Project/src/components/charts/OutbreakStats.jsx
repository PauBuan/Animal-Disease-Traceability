import React, { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useNavigate } from "react-router-dom";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function OutbreakStats() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBrgyModalOpen, setIsBrgyModalOpen] = useState(false);
  const [modalView, setModalView] = useState(""); 

  const VALID_BARANGAYS = [
    "Aplaya", "Balibago", "Caingin", "Dila", "Dita", "Don Jose", "Ibaba",
    "Kanluran", "Labas", "Macabling", "Malitlit", "Malusak", "Market Area",
    "Pooc", "Pulong Santa Cruz", "Santo Domingo", "Sinalhan", "Tagapo"
  ];

  const MILD_CATS = ["Respiratory Infection", "Parasitic Infection", "Digestive Issue / Scours", "Skin Condition / Mange", "Physical Injury / Lameness"];
  const DANGER_CATS = ["African Swine Fever (ASF)", "Avian Influenza", "Foot and Mouth Disease (FMD)"];

  // Animal Icons Mapping
  const animalIcons = {
    Hog: "🐖",
    Cow: "🐄",
    Chicken: "🐓",
    Sheep: "🐑",
    Goat: "🐐",
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/transactions");
        const data = await res.json();
        setTransactions(data || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const mildCounts = { "Respiratory Infection": 0, "Parasitic Infection": 0, "Digestive Issue / Scours": 0, "Skin Condition / Mange": 0, "Physical Injury / Lameness": 0, "Others": 0 };
  const dangerousCounts = { "African Swine Fever (ASF)": 0, "Avian Influenza": 0, "Foot and Mouth Disease (FMD)": 0, "Others": 0 };

  const animalStats = {
    Hog: { total: 0, mild: { ...mildCounts }, dangerous: { ...dangerousCounts } },
    Cow: { total: 0, mild: { ...mildCounts }, dangerous: { ...dangerousCounts } },
    Chicken: { total: 0, mild: { ...mildCounts }, dangerous: { ...dangerousCounts } },
    Sheep: { total: 0, mild: { ...mildCounts }, dangerous: { ...dangerousCounts } },
    Goat: { total: 0, mild: { ...mildCounts }, dangerous: { ...dangerousCounts } },
  };

  const brgyStats = {};
  VALID_BARANGAYS.forEach(name => {
    brgyStats[`Brgy ${name}`] = {
      mild: { ...mildCounts },
      dangerous: { ...dangerousCounts }
    };
  });

  transactions.forEach((tx) => {
    const qty = Number(tx.quantity) || 1;
    const disease = tx.diagnosedDisease || "";
    const species = tx.animalType || tx.species;
    const loc = (tx.location || "").toLowerCase().trim();

    if (loc.includes("exported") || loc.includes("slaughterhouse")) return;

    const match = VALID_BARANGAYS.find(b => loc.includes(b.toLowerCase()));
    if (match) {
      const brgyKey = `Brgy ${match}`;
      if (tx.severity === "mild") {
        const key = MILD_CATS.find(k => disease.includes(k)) || "Others";
        mildCounts[key] += qty;
        if (brgyStats[brgyKey]) brgyStats[brgyKey].mild[key] += qty;
        if (animalStats[species]) animalStats[species].mild[key] += qty;
      } else if (tx.severity === "dangerous") {
        const key = DANGER_CATS.find(k => disease.includes(k)) || "Others";
        dangerousCounts[key] += qty;
        if (brgyStats[brgyKey]) brgyStats[brgyKey].dangerous[key] += qty;
        if (animalStats[species]) animalStats[species].dangerous[key] += qty;
      }
    }
  });

  const openFilteredModal = (type) => { setModalView(type); setIsModalOpen(true); };
  const openBrgyModal = (type) => { setModalView(type); setIsBrgyModalOpen(true); };

  const createChartData = (counts, colors) => ({
    labels: Object.keys(counts),
    datasets: [{ data: Object.values(counts), backgroundColor: colors, borderColor: "#ffffff", borderWidth: 3, hoverOffset: 15 }]
  });

  const mildColors = ["#60A5FA", "#34D399", "#FBBF24", "#A78BFA", "#F472B6", "#94A3B8"];
  const dangerousColors = ["#EF4444", "#F97316", "#B91C1C", "#64748B"];

  const pieOptions = (title) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom", labels: { padding: 20, font: { size: 13, weight: "600" }, usePointStyle: true } },
      title: { display: true, text: title, font: { size: 20, weight: "bold" }, color: "#1F2937" }
    }
  });

  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-50/30 backdrop-blur-sm z-[1000]">
      <div className="bg-white/80 p-10 rounded-[2.5rem] shadow-2xl border border-white flex flex-col items-center">
        <div className="relative w-20 h-20 mb-6">
          {/* Outer Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
          {/* Animated Spinning Circle */}
          <div className="absolute inset-0 rounded-full border-4 border-t-green-600 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          {/* Center Pulsing Dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.6)]"></div>
          </div>
        </div>
        <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">System Syncing</h2>
        <p className="text-slate-500 font-bold text-xs mt-2 tracking-[0.2em] animate-pulse">
          Fetching Outbreak Statistics data...
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 pt-20 pb-16 px-5 sm:px-8 lg:px-12 font-sans">
      
      {/* MODERN ANIMAL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-[#F8FAFC] rounded-[2.5rem] w-full max-w-6xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-8 border-b bg-white/80 backdrop-blur-md sticky top-0 z-10 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${modalView === 'mild' ? 'bg-blue-600' : 'bg-red-600'} text-white text-2xl`}>🐾</div>
                <div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
                        {modalView === 'mild' ? 'Animal Health Profile' : 'High-Risk Animal Cases'}
                    </h2>
                    <p className="text-slate-500 font-medium">Categorized species surveillance data</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all text-2xl">✕</button>
            </div>
            
            <div className="p-8 overflow-y-auto scrollbar-hide">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(animalStats).map(([animal, data]) => {
                  const hasCases = Object.values(data[modalView]).some(c => c > 0);
                  return (
                    <div key={animal} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <span className="text-4xl">{animalIcons[animal] || "🐾"}</span>
                            <h4 className="text-2xl font-black text-slate-800">{animal}</h4>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${hasCases ? (modalView === 'mild' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600') : 'bg-slate-100 text-slate-400'}`}>
                          {hasCases ? 'Active' : 'Clear'}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(data[modalView]).map(([name, count]) => (
                          <div key={name} className={`flex justify-between items-center p-3 rounded-xl ${count > 0 ? 'bg-slate-50 border-slate-200 shadow-sm' : 'opacity-30 border-transparent'} border`}>
                            <span className="text-xs font-bold text-slate-600">{name}</span>
                            <span className={`text-lg font-black ${count > 0 ? (modalView === 'mild' ? 'text-blue-600' : 'text-red-600') : 'text-slate-400'}`}>{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODERN BARANGAY MODAL */}
      {isBrgyModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsBrgyModalOpen(false)}></div>
          <div className="relative bg-[#F8FAFC] rounded-[2.5rem] w-full max-w-7xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-8 border-b bg-white/80 backdrop-blur-md sticky top-0 z-10 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${modalView === 'mild' ? 'bg-blue-600' : 'bg-red-600'} text-white text-2xl`}>📍</div>
                <div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
                        {modalView === 'mild' ? 'Barangay Health Mapping' : 'Critical Area Surveillance'}
                    </h2>
                    <p className="text-slate-500 font-medium">Real-time status of all 18 administrative divisions</p>
                </div>
              </div>
              <button onClick={() => setIsBrgyModalOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all text-2xl">✕</button>
            </div>
            
            <div className="p-8 overflow-y-auto scrollbar-hide">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Object.entries(brgyStats).map(([brgy, data]) => {
                  const totalCount = Object.values(data[modalView]).reduce((a, b) => a + b, 0);
                  return (
                    <div key={brgy} className="bg-white rounded-2xl p-5 border border-slate-100 hover:border-blue-200 transition-all group shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-black text-slate-700 group-hover:text-slate-900">{brgy}</h4>
                        <div className={`flex items-center gap-2 px-2 py-1 rounded-lg ${totalCount > 0 ? (modalView === 'mild' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600') : 'bg-emerald-50 text-emerald-600'}`}>
                            <div className={`w-2 h-2 rounded-full ${totalCount > 0 ? (modalView === 'mild' ? 'bg-blue-500' : 'bg-red-500 animate-pulse') : 'bg-emerald-400'}`}></div>
                            <span className="text-[9px] font-black uppercase">{totalCount > 0 ? `${totalCount} Cases` : 'Safe'}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        {Object.entries(data[modalView]).map(([name, count]) => (
                           count > 0 && (
                            <div key={name} className="flex justify-between text-[10px] font-bold uppercase py-1 border-b border-slate-50">
                                <span className="text-slate-400 truncate pr-2">{name}</span>
                                <span className={modalView === 'mild' ? 'text-blue-500' : 'text-red-500'}>{count}</span>
                            </div>
                           )
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD LAYOUT */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 px-6 py-3 mb-6 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-slate-200">
            <span className="text-blue-600 text-xl">🦠📊</span>
            <span className="font-bold text-slate-800 uppercase tracking-widest text-xs">Santa Rosa Veterinary Surveillance</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-4 uppercase">Animal Outbreak Statistics Dashboard</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto font-medium">Live epidemiological overview of animal health conditions across all 18 barangays</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          
          {/* MILD CASES */}
          <div className="flex flex-col gap-8">
            <div className="group bg-white rounded-[3rem] p-10 lg:p-12 shadow border border-gray-100/80 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 flex flex-col h-[700px]">
              <h3 className="text-4xl font-black text-gray-900 mb-5 uppercase tracking-tight">Mild Conditions</h3>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">Overview of non-notifiable health issues observed across monitored species.</p>
              <div className="flex-grow">
                <Pie data={createChartData(mildCounts, mildColors)} options={pieOptions("Mild Condition Breakdown")} />
              </div>
            </div>

            <div className="group bg-gradient-to-br from-blue-50/90 to-indigo-50/70 rounded-[3rem] p-10 lg:p-12 border border-blue-200/60 shadow-lg transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 flex flex-col h-[520px]">
              <h3 className="text-3xl font-black text-blue-900 mb-6 flex items-center gap-3 uppercase">📊 Mild Cases Analytics</h3>
              <p className="text-blue-800 leading-relaxed mb-8 text-xl font-medium">
                Mild cases represent non-life-threatening health issues like respiratory infections or minor physical injuries. These reports require standard veterinary monitoring and improved farm-level hygiene to maintain local livestock stability.
              </p>
              <div className="flex flex-col gap-4 mt-auto">
                <button onClick={() => openFilteredModal('mild')} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg transition-all hover:bg-blue-700 shadow-xl active:scale-95">
                  View Animal Analytics →
                </button>
                <button onClick={() => openBrgyModal('mild')} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg transition-all hover:bg-slate-800 shadow-xl active:scale-95">
                  View Barangay Analytics →
                </button>
              </div>
            </div>
          </div>

          {/* DANGEROUS CASES */}
          <div className="flex flex-col gap-8">
            <div className="group bg-white rounded-[3rem] p-10 lg:p-12 shadow border border-gray-100/80 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 flex flex-col h-[700px]">
              <h3 className="text-4xl font-black text-gray-900 mb-5 uppercase tracking-tight">Critical Outbreaks</h3>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">Notifiable high-pathogenicity diseases requiring immediate attention and containment.</p>
              <div className="flex-grow">
                <Pie data={createChartData(dangerousCounts, dangerousColors)} options={pieOptions("Dangerous Outbreak Breakdown")} />
              </div>
            </div>

            <div className="group bg-gradient-to-br from-red-50/90 to-rose-50/70 rounded-[3rem] p-10 lg:p-12 border border-red-200/60 shadow-lg transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 flex flex-col h-[520px]">
              <h3 className="text-3xl font-black text-red-900 mb-6 flex items-center gap-3 uppercase">🚨 Critical Cases Analytics</h3>
              <p className="text-red-900 leading-relaxed mb-8 text-xl font-medium">
                Dangerous cases involve high-risk, notifiable pathogens like ASF or Bird Flu that threaten agricultural stability. Rapid response including quarantine and strict movement restrictions is mandatory to protect the city's livestock and economy.
              </p>
              <div className="flex flex-col gap-4 mt-auto">
                <button onClick={() => openFilteredModal('dangerous')} className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-lg transition-all hover:bg-red-700 shadow-xl active:scale-95">
                  View Animal Analytics →
                </button>
                <button onClick={() => openBrgyModal('dangerous')} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg transition-all hover:bg-slate-800 shadow-xl active:scale-95">
                  View Barangay Analytics →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Outbreak Analytics Summary */}
        <div className="mt-16 flex justify-center">
          <div className="group bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 p-10 lg:p-12 rounded-[3rem] border border-indigo-200/60 shadow-2xl max-w-5xl w-full transition-all duration-500 hover:shadow-3xl hover:-translate-y-2 text-center">
            <h3 className="text-3xl lg:text-4xl font-black text-indigo-900 mb-6 tracking-tight">
              Outbreak Analytics Summary
            </h3>

            <div className="space-y-6 text-slate-800 leading-relaxed text-lg max-w-4xl mx-auto">
              <p>
                Current data shows <strong>{Object.values(mildCounts).reduce((a,b)=>a+b,0).toLocaleString()}</strong> mild cases and 
                <strong> {Object.values(dangerousCounts).reduce((a,b)=>a+b,0).toLocaleString()}</strong> critical cases across Santa Rosa barangays.
              </p>

              {Object.values(dangerousCounts).reduce((a,b)=>a+b,0) > 0 ? (
                <p className="text-red-700 font-medium">
                  <strong>Critical Alert:</strong> Dangerous pathogens detected. Immediate containment (quarantine, movement restrictions, and emergency response) is required to prevent widespread impact on livestock and economy.
                </p>
              ) : (
                <p className="text-emerald-700 font-medium">
                  <strong>Positive Status:</strong> No active critical outbreaks recorded. Biosecurity measures appear effective — maintain vigilance.
                </p>
              )}

              {Object.values(mildCounts).reduce((a,b)=>a+b,0) > 50 ? (
                <p className="text-amber-700 font-medium">
                  Mild conditions are moderately elevated — focus on improved farm hygiene, ventilation, and routine veterinary checks to reduce future reports.
                </p>
              ) : (
                <p className="text-slate-700">
                  Mild cases remain low — good indicator of stable baseline health across monitored populations.
                </p>
              )}

              <p className="text-slate-600 italic mt-6">
                All data is sourced from verified field reports. Cross-reference with local advisories for real-time action.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-16 flex flex-col sm:flex-row justify-center items-center gap-6">
          <button onClick={() => navigate("/")} className="px-10 py-5 bg-slate-800 text-white rounded-2xl font-bold text-lg transition-all shadow-xl hover:bg-slate-700 active:scale-95">
            ← Return to Dashboard
          </button>
          <button onClick={() => window.print()} className="px-10 py-5 bg-emerald-600 text-white rounded-2xl font-bold text-lg transition-all shadow-xl hover:bg-emerald-500 active:scale-95">
            Generate Official PDF Report
          </button>
        </div>
      </div>
    </div>
  );
}