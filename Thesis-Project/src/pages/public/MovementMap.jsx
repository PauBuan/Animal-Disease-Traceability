import React, { useState, useEffect } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { MapContainer, TileLayer, GeoJSON, ZoomControl } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Climbing out of /public, out of /pages, into /assets/data
import santaRosaData from "../../assets/data/santa_rosa.json";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function AnimalMovement() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState({
    healthy: 0,
    sick: 0,
    unverified: 0,
    speciesCounts: {},
    logistics: { exported: 0, slaughtered: 0 },
    verifiedRatio: "0%"
  });
  const [barangayMapStats, setBarangayMapStats] = useState({});
  const [topBarangays, setTopBarangays] = useState([]);

  // --- DATE FILTER STATES ---
  const [rawTransactions, setRawTransactions] = useState([]);
  const currentYear = new Date().getFullYear();
  const [filterMode, setFilterMode] = useState("preset");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  // --------------------------

  const SPECIES_LIST = ["Hog", "Cow", "Chicken", "Carabao", "Goat", "Ducks"];
  const VALID_BARANGAYS = [
    "Aplaya", "Balibago", "Caingin", "Dila", "Dita", "Don Jose", "Ibaba",
    "Kanluran", "Labas", "Macabling", "Malitlit", "Malusak", "Market Area",
    "Pooc", "Pulong Santa Cruz", "Santo Domingo", "Sinalhan", "Tagapo"
  ];

  useEffect(() => {
    fetchData();
  }, []);

  // Sync data processing with filters
  useEffect(() => {
    if (rawTransactions.length > 0 || !loading) {
      applyFilters();
    }
  }, [rawTransactions, selectedMonth, selectedYear, customStart, customEnd, filterMode]);

  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/transactions");
      const data = await res.json();
      const txData = Array.isArray(data) ? data : [];
      setRawTransactions(txData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = rawTransactions.filter(tx => {
      const txDate = new Date(tx.timestamp);
      if (isNaN(txDate)) return false;

      if (filterMode === "custom") {
        const start = customStart ? new Date(customStart) : new Date("1900-01-01");
        const end = customEnd ? new Date(customEnd) : new Date("2100-12-31");
        end.setHours(23, 59, 59, 999);
        return txDate >= start && txDate <= end;
      } else {
        const yearMatch = txDate.getFullYear() === Number(selectedYear);
        const monthMatch = selectedMonth === "all" || txDate.getMonth() === Number(selectedMonth);
        return yearMatch && monthMatch;
      }
    });
    processData(filtered);
  };

  const handleReset = () => {
    setFilterMode("preset");
    setSelectedMonth("all");
    setSelectedYear(currentYear);
    setCustomStart("");
    setCustomEnd("");
  };

  const processData = (txList) => {
    const brgyGroup = {};
    const speciesCounts = {};
    let exp = 0, slaught = 0, gHealthy = 0, gSick = 0, gUnverified = 0;

    SPECIES_LIST.forEach(s => speciesCounts[s] = 0);
    VALID_BARANGAYS.forEach(name => {
      brgyGroup[name] = { total: 0, healthy: 0, mild: 0, critical: 0, sick: 0, unverified: 0 };
    });

    txList.forEach((tx) => {
      const loc = (tx.location || "").toLowerCase().trim();
      const spec = tx.species;
      const qty = Number(tx.quantity) || 0;
      const severity = (tx.severity || "").toLowerCase().trim();

      if (loc.includes("slaughterhouse")) { slaught += qty; return; }
      if (loc.includes("exported") || loc.includes("outside")) { exp += qty; return; }

      const match = VALID_BARANGAYS.find(b => loc.includes(b.toLowerCase()));
      if (match) {
        if (severity === "safe" || severity === "healthy") {
          gHealthy += qty;
          brgyGroup[match].healthy += qty;
        } else if (severity === "critical" || severity === "dangerous") {
          gSick += qty;
          brgyGroup[match].sick += qty;
          brgyGroup[match].critical += qty;
        } else if (severity === "mild" || severity === "sick") {
          gSick += qty;
          brgyGroup[match].sick += qty;
          brgyGroup[match].mild += qty;
        } else {
          gUnverified += qty;
          brgyGroup[match].unverified += qty;
        }

        if (SPECIES_LIST.includes(spec)) {
          speciesCounts[spec] += qty;
        }
        brgyGroup[match].total += qty;
      }
    });

    const verified = gHealthy + gSick;
    const verifiedRatio = (verified + gUnverified) > 0 ? ((verified / (verified + gUnverified)) * 100).toFixed(1) + "%" : "0%";

    const topBrgys = Object.entries(brgyGroup)
      .sort(([,a], [,b]) => b.total - a.total)
      .slice(0, 5)
      .map(([name, data]) => ({ name, ...data }));

    setTransactions({
      healthy: gHealthy,
      sick: gSick,
      unverified: gUnverified,
      speciesCounts,
      logistics: { exported: exp, slaughtered: slaught },
      verifiedRatio,
    });
    setBarangayMapStats(brgyGroup);
    setTopBarangays(topBrgys);
  };

  const getColor = (stats) => {
    if (stats.critical > 0) return '#ef4444'; 
    if (stats.mild > 0) return '#f97316';     
    return '#10b981';                         
  };

  const mapStyle = (feature) => {
    const brgyName = feature.properties.NAME_3;
    const stats = barangayMapStats[brgyName] || { mild: 0, critical: 0 };
    return {
      fillColor: getColor(stats),
      weight: 1.5,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.7
    };
  };

  const onEachBarangay = (feature, layer) => {
    const brgyName = feature.properties.NAME_3;
    
    // We bind the tooltip, but we need to make sure the content 
    // is generated based on the LATEST barangayMapStats
    layer.on({
      mouseover: (e) => {
        const l = e.target;
        l.setStyle({ weight: 3, color: '#6366f1', fillOpacity: 0.85 });
        
        // Refresh the tooltip content on every hover to get filtered data
        const currentStats = barangayMapStats[brgyName] || { total: 0, healthy: 0, mild: 0, critical: 0, unverified: 0 };
        
        l.setTooltipContent(`
          <div style="font-family: sans-serif; padding: 8px; min-width: 160px;">
            <strong style="text-transform: uppercase; border-bottom: 1px solid #eee; display: block; margin-bottom: 5px; font-size: 13px;">
              Brgy ${brgyName}
            </strong>
            <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
              <span style="color: #64748b; font-weight: bold;">HEALTHY:</span> 
              <span style="font-weight: 900; color: #059669;">${currentStats.healthy.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
              <span style="color: #64748b; font-weight: bold;">MILD:</span> 
              <span style="font-weight: 900; color: #f97316;">${currentStats.mild.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
              <span style="color: #64748b; font-weight: bold;">CRITICAL:</span> 
              <span style="font-weight: 900; color: #dc2626;">${currentStats.critical.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
              <span style="color: #64748b; font-weight: bold;">UNVERIFIED:</span> 
              <span style="font-weight: 900; color: #d97706;">${currentStats.unverified.toLocaleString()}</span>
            </div>
            <div style="border-top: 1px solid #eee; padding-top: 4px; display: flex; justify-content: space-between; font-size: 12px; font-weight: 900;">
              <span>TOTAL:</span> <span>${currentStats.total.toLocaleString()}</span>
            </div>
          </div>
        `);
      },
      mouseout: (e) => {
        const l = e.target;
        l.setStyle({ weight: 1.5, color: 'white', fillOpacity: 0.7 });
      }
    });

    // Initial binding
    layer.bindTooltip("", { sticky: true, opacity: 0.95 });
  };

  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-50/30 backdrop-blur-sm z-[1000]">
      <div className="bg-white/80 p-10 rounded-[2.5rem] shadow-2xl border border-white flex flex-col items-center">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-green-600 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.6)]"></div>
          </div>
        </div>
        <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">System Syncing</h2>
        <p className="text-slate-500 font-bold text-xs mt-2 tracking-[0.2em] animate-pulse">
          Fetching Movement data...
        </p>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 via-green-50/20 to-emerald-50/10 min-h-screen pt-12 pb-16 px-6 lg:px-10 font-sans relative">
      
      {/* --- CENTERED DATE FILTER --- */}
      <div className="max-w-7xl mx-auto mb-10 flex justify-center print:hidden">
        <div className="w-full bg-white rounded-[2.5rem] shadow-lg border border-slate-200/60 p-6 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1">
              <button 
                onClick={() => setFilterMode("preset")}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${filterMode === 'preset' ? 'bg-white shadow-sm text-green-600' : 'text-slate-400'}`}
              >
                Standard
              </button>
              <button 
                onClick={() => setFilterMode("custom")}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${filterMode === 'custom' ? 'bg-white shadow-sm text-green-600' : 'text-slate-400'}`}
              >
                Custom Range
              </button>
            </div>

            <div className={`flex gap-3 transition-all ${filterMode === 'custom' ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-green-500/20"
              >
                <option value="all">Full Year</option>
                {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
              </select>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-700 outline-none"
              >
                {[currentYear, currentYear-1, currentYear-2].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <div className={`flex items-center gap-3 transition-all ${filterMode === 'preset' ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
              <input 
                type="date" 
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-700 outline-none"
              />
              <span className="text-slate-300 font-black">TO</span>
              <input 
                type="date" 
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-700 outline-none"
              />
            </div>
          </div>

          <button 
            onClick={handleReset}
            className="text-slate-400 hover:text-red-500 font-black text-xs uppercase tracking-widest transition-colors flex items-center gap-2"
          >
            <span>🔄</span> Reset to {currentYear}
          </button>
        </div>
      </div>
      {/* ---------------------------- */}

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12 items-stretch">
        
        {/* SIDEBAR */}
        <aside className="sidebar-section w-full lg:w-[420px] bg-white/95 backdrop-blur-md rounded-[3rem] border border-slate-200/80 p-8 lg:p-10 shadow-xl sticky top-24 h-fit flex flex-col transition-all z-20">
          <h1 className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight mb-2">Animal Movement</h1>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-green-600">Santa Rosa City • Real-Time Traceability</p>

          <div className="grid grid-cols-1 gap-4 mt-10 sm:grid-cols-3">
            <div className="bg-emerald-50 p-4 rounded-3xl border border-emerald-100 text-center">
              <p className="text-[10px] font-black uppercase text-emerald-700 mb-1">Healthy</p>
              <p className="text-2xl font-black text-emerald-800">{transactions.healthy.toLocaleString()}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-3xl border border-red-100 text-center">
              <p className="text-[10px] font-black uppercase text-red-700 mb-1">At-Risk</p>
              <p className="text-2xl font-black text-red-800">{transactions.sick.toLocaleString()}</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-3xl border border-amber-100 text-center">
              <p className="text-[10px] font-black uppercase text-amber-700 mb-1">Pending</p>
              <p className="text-2xl font-black text-amber-800">{transactions.unverified.toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-8 bg-slate-50/80 rounded-3xl p-6 border border-slate-200 space-y-3">
            <div className="flex justify-between items-center px-3 py-2 bg-white/60 rounded-xl text-xs font-bold uppercase text-slate-600">
              <span>Exported</span>
              <span className="text-lg text-slate-800">{transactions.logistics.exported.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center px-3 py-2 bg-white/60 rounded-xl text-xs font-bold uppercase text-red-700">
              <span>Slaughtered</span>
              <span className="text-lg text-red-800">{transactions.logistics.slaughtered.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center px-3 py-2 bg-white/60 rounded-xl text-xs font-bold uppercase text-amber-600">
              <span>Verified Ratio</span>
              <span className="text-lg text-amber-700">{transactions.verifiedRatio}</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 mt-8 p-6 shadow-sm">
            <h3 className="text-base font-black uppercase tracking-widest text-slate-500 mb-6 text-center">
              Livestock Species Distribution
            </h3>
            <div className="h-64">
              {transactions?.speciesCounts ? (
                <Pie
                  data={{
                    labels: SPECIES_LIST,
                    datasets: [{
                      data: SPECIES_LIST.map(s => transactions.speciesCounts[s] || 0),
                      backgroundColor: ["#f59e0b", "#3b82f6", "#ef4444", "#06b6d4", "#10b981", "#6366f1"],
                      hoverBackgroundColor: ["#d97706", "#2563eb", "#dc2626", "#0891b2", "#059669", "#4f46e5"],
                      borderWidth: 2,
                      borderColor: '#ffffff',
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                      legend: { 
                        display: true, 
                        position: 'bottom',
                        labels: {
                          usePointStyle: true,
                          padding: 15,
                          font: { size: 10, weight: 'bold' },
                          color: '#475569'
                        }
                      }
                    }
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 font-bold uppercase text-[10px]">
                  Synchronizing Species Data...
                </div>
              )}
            </div>
          </div>

          <div className="mt-10 space-y-4">
            <button onClick={() => window.print()} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-sm tracking-widest transition-all shadow-lg hover:shadow-xl">
              Download Movement Report
            </button>
            <button onClick={() => navigate("/home")} className="w-full bg-slate-100 text-slate-700 py-5 rounded-2xl font-black uppercase text-sm tracking-widest transition-all">
              Return to Dashboard
            </button>
          </div>
        </aside>

        {/* MAP + TOP BARANGAYS */}
        <div className="flex-1 flex flex-col gap-8">
          <div className="group bg-white rounded-[3.5rem] border border-slate-200 shadow-xl p-8 lg:p-10 flex flex-col flex-grow min-h-[750px] relative z-0">
            <div className="mb-8 px-2">
              <h2 className="text-4xl font-black text-slate-900">Livestock Geographic Map</h2>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.25em] mt-2">
                Real-Time Health Monitoring
              </p>
            </div>

            <div className="rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-inner flex-grow relative z-0">
              <MapContainer
                center={[14.311, 121.11]}
                zoom={12.5}
                zoomControl={false}
                style={{ height: "100%", width: "100%", zIndex: 0 }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                
                <GeoJSON 
                  key={`geojson-${JSON.stringify(barangayMapStats)}`} 
                  data={santaRosaData} 
                  style={mapStyle} 
                  onEachFeature={onEachBarangay} 
                />

                <ZoomControl position="bottomright" />

                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md p-5 rounded-3xl shadow-2xl border border-white z-[1000] pointer-events-none">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Health Legend</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
                      <span className="text-xs font-black text-slate-700">No Cases (Healthy)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-[#f97316]"></div>
                      <span className="text-xs font-black text-slate-700">Warning (Mild Cases)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
                      <span className="text-xs font-black text-slate-700">Critical (ASF/Flu/FMD)</span>
                    </div>
                  </div>
                </div>
              </MapContainer>
            </div>
          </div>

          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl p-8 lg:p-10">
            <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">
              Top 5 Movement Activity Barangays
            </h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
              {topBarangays.length > 0 ? topBarangays.map((brgy) => (
                <div 
                  key={brgy.name}
                  className="flex justify-between items-center bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-all hover:shadow-md"
                >
                  <div>
                    <p className="font-bold text-slate-900 text-lg">Brgy {brgy.name}</p>
                    <p className="text-sm text-slate-600">
                      {brgy.critical > 0 ? (
                        <span className="text-red-600 font-bold">{brgy.critical} CRITICAL CASES</span>
                      ) : brgy.mild > 0 ? (
                        <span className="text-orange-600 font-bold">{brgy.mild} mild cases</span>
                      ) : "All healthy"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-slate-900">{brgy.total.toLocaleString()}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Total Heads</p>
                  </div>
                </div>
              )) : (
                <div className="p-10 text-center text-slate-400 font-black uppercase text-xs">
                  No data found for selected date range
                </div>
              )}
            </div>
          </div>
          {/* MOVEMENT ANALYTICS SUMMARY SECTION */}
          <div className="mt-16 flex justify-center max-w-7xl mx-auto">
            <div className="group bg-gradient-to-r from-indigo-50 via-emerald-50 to-blue-50 p-10 lg:p-12 rounded-[3rem] border border-indigo-200/60 shadow-2xl w-full transition-all duration-500 hover:shadow-3xl hover:-translate-y-2 text-center">
              <h3 className="text-3xl lg:text-4xl font-black text-indigo-900 mb-6 tracking-tight uppercase">
                Movement Analytics Summary
              </h3>
              
              <div className="space-y-6 text-slate-800 leading-relaxed text-lg max-w-4xl mx-auto">
                <p>
                  Current tracking confirms <strong>{transactions.healthy.toLocaleString()}</strong> healthy heads and 
                  <strong> {transactions.sick.toLocaleString()}</strong> at-risk animals in transit. 
                  The verified data integrity ratio currently stands at <strong>{transactions.verifiedRatio}</strong>.
                </p>

                {transactions.sick > 0 ? (
                  <p className="text-red-700 font-medium bg-red-50/50 py-3 rounded-2xl border border-red-100 px-6">
                    <strong>Containment Protocol:</strong> {transactions.sick} heads detected with potential pathogens. 
                    Movements in high-risk Barangays (Red Zones) should be restricted to prevent cross-contamination.
                  </p>
                ) : (
                  <p className="text-emerald-700 font-medium bg-emerald-50/50 py-3 rounded-2xl border border-emerald-100 px-6">
                    <strong>Clean Transit:</strong> No critical infections detected in current movements. 
                    Biosecurity certificates are clear for the selected period.
                  </p>
                )}

                <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-slate-600 font-bold uppercase text-sm pt-4 border-t border-indigo-100/50">
                  <span>Total Slaughtered: <span className="text-slate-900">{transactions.logistics.slaughtered.toLocaleString()}</span></span>
                  <span className="hidden sm:inline text-indigo-200">•</span>
                  <span>Total Exported: <span className="text-slate-900">{transactions.logistics.exported.toLocaleString()}</span></span>
                </div>

                <p className="text-slate-500 italic mt-6 text-sm">
                  Geo-spatial movement data verified via Santa Rosa Livestock Blockchain Surveillance. 
                  Always cross-reference with Bureau of Animal Industry (BAI) transit permits.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}