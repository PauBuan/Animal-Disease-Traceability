import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function BarangayHealthTable() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [barangayStats, setBarangayStats] = useState([]);
  const [cityWideSpecies, setCityWideSpecies] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [currentModalData, setCurrentModalData] = useState({});
  const [isCityWideView, setIsCityWideView] = useState(false);
  const [externalStats, setExternalStats] = useState({ exported: 0, slaughtered: 0 });
  const [grandTotals, setGrandTotals] = useState({ healthy: 0, sick: 0, unverified: 0, total: 0 });

  const VALID_BARANGAYS = [
    "Aplaya", "Balibago", "Caingin", "Dila", "Dita", "Don Jose", "Ibaba",
    "Kanluran", "Labas", "Macabling", "Malitlit", "Malusak", "Market Area",
    "Pooc", "Pulong Santa Cruz", "Santo Domingo", "Sinalhan", "Tagapo"
  ];

  const SPECIES_LIST = ["Hog", "Cow", "Chicken", "Sheep", "Goat"];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/transactions");
      const data = await res.json();
      const txData = Array.isArray(data) ? data : [];
      processData(txData);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const processData = (txList) => {
    const brgyGroup = {};
    const citySpecies = {};
    let exp = 0;
    let slaught = 0;
    let gHealthy = 0;
    let gSick = 0;
    let gUnverified = 0;
    let gTotal = 0;

    SPECIES_LIST.forEach(s => {
      citySpecies[s] = { healthy: 0, sick: 0, unverified: 0, exported: 0, slaughtered: 0 };
    });

    VALID_BARANGAYS.forEach(name => {
      brgyGroup[name] = {
        barangay: `Brgy ${name}`,
        healthy: 0,
        sick: 0,
        unverified: 0,
        total: 0,
        speciesBreakdown: {}
      };
      SPECIES_LIST.forEach(s => {
        brgyGroup[name].speciesBreakdown[s] = { healthy: 0, sick: 0, unverified: 0 };
      });
    });

    txList.forEach((tx) => {
      const loc = (tx.location || "").toLowerCase().trim();
      const spec = tx.species || "Other";
      const qty = Number(tx.quantity) || 0;
      const severity = (tx.severity || "").toLowerCase().trim();

      if (citySpecies[spec]) {
        if (loc.includes("exported") || loc.includes("outside")) {
          citySpecies[spec].exported += qty;
        } else if (loc.includes("slaughterhouse")) {
          citySpecies[spec].slaughtered += qty;
        } else {
          if (severity === "safe" || severity === "healthy") citySpecies[spec].healthy += qty;
          else if (severity === "mild" || severity === "dangerous" || severity === "sick") citySpecies[spec].sick += qty;
          else citySpecies[spec].unverified += qty;
        }
      }

      if (loc.includes("slaughterhouse")) {
        slaught += qty;
        return;
      }
      if (loc.includes("exported") || loc.includes("outside")) {
        exp += qty;
        return;
      }

      const match = VALID_BARANGAYS.find(b => loc.includes(b.toLowerCase()));
      if (match) {
        brgyGroup[match].total += qty;
        gTotal += qty;

        if (severity === "safe" || severity === "healthy") {
          brgyGroup[match].healthy += qty;
          gHealthy += qty;
        } else if (severity === "mild" || severity === "dangerous" || severity === "sick") {
          brgyGroup[match].sick += qty;
          gSick += qty;
        } else {
          brgyGroup[match].unverified += qty;
          gUnverified += qty;
        }

        if (SPECIES_LIST.includes(spec)) {
          const target = brgyGroup[match].speciesBreakdown[spec];
          if (severity === "safe" || severity === "healthy") target.healthy += qty;
          else if (severity === "mild" || severity === "dangerous" || severity === "sick") target.sick += qty;
          else target.unverified += qty;
        }
      }
    });

    setBarangayStats(Object.values(brgyGroup).sort((a, b) => a.barangay.localeCompare(b.barangay)));
    setCityWideSpecies(citySpecies);
    setExternalStats({ exported: exp, slaughtered: slaught });
    setGrandTotals({ healthy: gHealthy, sick: gSick, unverified: gUnverified, total: gTotal });
  };

  const openCityWideModal = () => {
    setModalTitle("All Barangays (City-Wide)");
    setCurrentModalData(cityWideSpecies);
    setIsCityWideView(true);
    setIsModalOpen(true);
  };

  const openBarangayModal = (row) => {
    setModalTitle(row.barangay);
    setCurrentModalData(row.speciesBreakdown);
    setIsCityWideView(false);
    setIsModalOpen(true);
  };

  const handlePrintReport = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-green-600 text-4xl font-black tracking-widest animate-pulse">
          LOADING...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 space-y-12 font-sans print:p-8 print:max-w-none bg-slate-50/30">
      
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-8 md:p-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 print:shadow-none print:border-0">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight uppercase">
            Livestock Registry
          </h1>
          <p className="mt-2 text-slate-500 font-semibold text-lg">
            Santa Rosa City Barangay Health Monitor
          </p>
        </div>
        <button
          onClick={openCityWideModal}
          className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-7 py-4 rounded-2xl font-black text-sm uppercase tracking-wider shadow-sm transition-colors flex items-center gap-3 whitespace-nowrap print:hidden"
        >
          <span>Animals</span>
          <span className="bg-white/25 px-2.5 py-1 rounded-lg text-xs font-bold">ALL BRGY</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 print:grid-cols-4">
        {[
          { label: "Healthy",   val: grandTotals.healthy,    color: "emerald" },
          { label: "Unverified", val: grandTotals.unverified, color: "amber"   },
          { label: "Sick",       val: grandTotals.sick,       color: "red"     },
          { label: "Total",      val: grandTotals.total,      color: "slate", isGray: true },
        ].map((card, i) => (
          <div
            key={i}
            className={`
              rounded-3xl border p-6 md:p-8 text-center shadow-sm transition-all print:shadow-none print:border
              ${card.isGray
                ? "bg-slate-700 border-slate-600 shadow-slate-200"
                : `bg-${card.color}-50 border-${card.color}-100`
              }
            `}
          >
            <p className={`
              text-[11px] font-black uppercase tracking-[0.15em] mb-2
              ${card.isGray ? "text-slate-300" : `text-${card.color}-600`}
            `}>
              {card.label}
            </p>
            <p className={`
              text-4xl md:text-5xl font-black
              ${card.isGray ? "text-white" : `text-${card.color}-700`}
            `}>
              {card.val.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl shadow-lg border border-slate-200/80 overflow-hidden print:shadow-none print:border print:rounded-none">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 print:bg-slate-200">
                <th className="p-6 md:p-8 text-xs font-black uppercase tracking-[0.15em]">Barangay</th>
                <th className="p-6 md:p-8 text-center text-xs font-black uppercase tracking-[0.15em]">Healthy</th>
                <th className="p-6 md:p-8 text-center text-xs font-black uppercase tracking-[0.15em]">Unverified</th>
                <th className="p-6 md:p-8 text-center text-xs font-black uppercase tracking-[0.15em]">Sick</th>
                <th className="p-6 md:p-8 text-center text-xs font-black uppercase tracking-[0.15em]">Total</th>
                <th className="p-6 md:p-8 text-center text-xs font-black uppercase tracking-[0.15em] w-32 print:hidden">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {barangayStats.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50/80 transition-colors duration-150 print:hover:bg-transparent"
                >
                  <td className="p-6 md:p-8 text-sm font-bold uppercase tracking-wide text-slate-700">
                    {row.barangay}
                  </td>
                  <td className="p-6 md:p-8 text-center text-lg font-black text-emerald-600">
                    {row.healthy || "–"}
                  </td>
                  <td className="p-6 md:p-8 text-center text-lg font-black text-amber-500">
                    {row.unverified || "–"}
                  </td>
                  <td className="p-6 md:p-8 text-center text-lg font-black text-red-500">
                    {row.sick || "–"}
                  </td>
                  <td className="p-6 md:p-8 text-center text-lg font-black text-slate-800">
                    {row.total || "–"}
                  </td>
                  <td className="p-6 md:p-8 text-center print:hidden">
                    <button
                      onClick={() => openBarangayModal(row)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition-colors border border-slate-200"
                    >
                      Animals
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer – External flows */}
        <div className="bg-slate-800 px-6 py-10 md:px-12 flex flex-col sm:flex-row justify-center gap-12 md:gap-24 items-center border-t-4 border-green-600 print:bg-slate-100 print:text-slate-800 print:border-t-2 print:border-green-700">
          <div className="text-center">
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-3 print:text-slate-500">Exported</p>
            <p className="text-4xl md:text-5xl font-black text-white print:text-slate-800">
              {externalStats.exported.toLocaleString()}
            </p>
          </div>
          <div className="hidden sm:block h-16 w-px bg-slate-600 print:hidden" />
          <div className="text-center">
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-3 print:text-slate-500">Slaughtered</p>
            <p className="text-4xl md:text-5xl font-black text-red-400 print:text-red-600">
              {externalStats.slaughtered.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Modal – Species Breakdown */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 print:hidden">
          <div className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-slate-50 px-8 py-7 flex justify-between items-center border-b border-slate-200">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight uppercase leading-none">
                  Species Breakdown
                </h2>
                <p className="text-green-600 font-bold text-xs uppercase tracking-[0.2em] mt-2">
                  {modalTitle}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-3xl text-slate-400 hover:text-slate-600 transition-colors font-light"
              >
                ✕
              </button>
            </div>

            <div className="p-6 md:p-8 overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                    <th className="pb-5 text-left">Animal Type</th>
                    <th className="pb-5 text-center">Healthy</th>
                    <th className="pb-5 text-center">Sick</th>
                    <th className="pb-5 text-center">Unverified</th>
                    {isCityWideView && (
                      <>
                        <th className="pb-5 text-center">Exported</th>
                        <th className="pb-5 text-center">Slaughtered</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  {SPECIES_LIST.map(name => (
                    <tr key={name} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-5 font-bold uppercase text-xs text-slate-500 tracking-wide">{name}</td>
                      <td className="py-5 text-center text-emerald-600 font-black text-lg">
                        {currentModalData[name]?.healthy || 0}
                      </td>
                      <td className="py-5 text-center text-red-500 font-black text-lg">
                        {currentModalData[name]?.sick || 0}
                      </td>
                      <td className="py-5 text-center text-amber-500 font-black text-lg">
                        {currentModalData[name]?.unverified || 0}
                      </td>
                      {isCityWideView && (
                        <>
                          <td className="py-5 text-center text-blue-500 font-black text-lg">
                            {currentModalData[name]?.exported || 0}
                          </td>
                          <td className="py-5 text-center text-rose-600 font-black text-lg">
                            {currentModalData[name]?.slaughtered || 0}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-8 py-6 bg-slate-50 text-center border-t border-slate-100">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-slate-700 hover:bg-slate-800 text-white px-10 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Buttons */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-6 pb-16 print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all min-w-[220px]"
        >
          ← Return to Home
        </button>

        <button
          onClick={handlePrintReport}
          className="bg-slate-700 hover:bg-slate-800 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-md min-w-[220px]"
        >
          Download / Print Report
        </button>
      </div>
    </div>
  );
}