import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { MapContainer, TileLayer, Marker, Tooltip as MapTooltip, ZoomControl } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Leaflet icon fix
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

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

  const SPECIES_LIST = ["Hog", "Cow", "Chicken", "Sheep", "Goat"];
  const VALID_BARANGAYS = [
    "Aplaya", "Balibago", "Caingin", "Dila", "Dita", "Don Jose", "Ibaba",
    "Kanluran", "Labas", "Macabling", "Malitlit", "Malusak", "Market Area",
    "Pooc", "Pulong Santa Cruz", "Santo Domingo", "Sinalhan", "Tagapo"
  ];

  const barangayMarkers = [
    { name: "Aplaya", pos: [14.311447647928247, 121.12295824505297] },
    { name: "Balibago", pos: [14.295631618456648, 121.10489172491852] },
    { name: "Caingin", pos: [14.299473223012534, 121.12806320633392] },
    { name: "Dila", pos: [14.289202184158825, 121.10832114496783] },
    { name: "Dita", pos: [14.282845067544617, 121.11142012167006] },
    { name: "Don Jose", pos: [14.257486081129576, 121.06580879098131] },
    { name: "Ibaba", pos: [14.315161825716983, 121.11809931407876] },
    { name: "Kanluran", pos: [14.313601325785083, 121.10764857202216] },
    { name: "Labas", pos: [14.307734048466843, 121.10983860633617] },
    { name: "Macabling", pos: [14.301199316348956, 121.09888438303827] },
    { name: "Malitlit", pos: [14.269970761081264, 121.11112449098484] },
    { name: "Malusak", pos: [14.309492293786986, 121.10986404497345] },
    { name: "Market Area", pos: [14.319987629123704, 121.11197280633958] },
    { name: "Pooc", pos: [14.301363073316246, 121.11165544497128] },
    { name: "Pulong Santa Cruz", pos: [14.278058523627218, 121.08216258303183] },
    { name: "Santo Domingo", pos: [14.229227246171881, 121.04817556767753] },
    { name: "Sinalhan", pos: [14.33095501762172, 121.11154140634267] },
    { name: "Tagapo", pos: [14.319751565876894, 121.10261444497627] }
  ];

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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const processData = (txList) => {
    const brgyGroup = {};
    const speciesCounts = {};
    let exp = 0, slaught = 0, gHealthy = 0, gSick = 0, gUnverified = 0;

    SPECIES_LIST.forEach(s => speciesCounts[s] = 0);
    VALID_BARANGAYS.forEach(name => {
      brgyGroup[name] = { total: 0, healthy: 0, sick: 0, unverified: 0 };
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
        } else if (severity === "mild" || severity === "dangerous" || severity === "sick") {
          gSick += qty;
          brgyGroup[match].sick += qty;
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

  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-50/80 backdrop-blur-sm z-50">
      <div className="bg-white/90 p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col items-center">
        <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Loading Movement Data</h2>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 via-green-50/20 to-emerald-50/10 min-h-screen pt-24 pb-16 px-6 lg:px-10 font-sans relative">
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

          {/* RESTORED: Species Bar Chart */}
          <div className="bg-white rounded-3xl border border-slate-200 mt-8 p-6 shadow-sm">
            <h3 className="text-base font-black uppercase tracking-widest text-slate-500 mb-6 text-center">Livestock Species Distribution</h3>
            <div className="h-56">
              <Bar
                data={{
                  labels: SPECIES_LIST,
                  datasets: [{
                    data: SPECIES_LIST.map(s => transactions.speciesCounts[s] || 0),
                    backgroundColor: ["#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6", "#10b981"],
                    borderRadius: 12,
                    hoverBackgroundColor: ["#d97706", "#2563eb", "#dc2626", "#7c3aed", "#059669"]
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { grid: { display: false }, ticks: { font: { size: 12, weight: 'bold' }, color: '#475569' } },
                    y: { display: false }
                  }
                }}
              />
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
              <h2 className="text-4xl font-black text-slate-900">Livestock Geographic Heatmap</h2>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.25em] mt-2">
                Real-Time Health Monitoring
              </p>
            </div>

            <div className="rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-inner flex-grow relative z-0">
              <MapContainer
                center={[14.28, 121.09]}
                zoom={13}
                zoomControl={false}
                style={{ height: "100%", width: "100%", zIndex: 0 }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {barangayMarkers.map((brgy) => {
                  const stats = barangayMapStats[brgy.name] || { total: 0, healthy: 0, sick: 0, unverified: 0 };
                  return (
                    <Marker key={brgy.name} position={brgy.pos}>
                      <MapTooltip direction="top" offset={[0, -32]} opacity={0.95}>
                        <div className="font-sans p-4 min-w-[220px] bg-white rounded-xl shadow-lg border border-slate-200">
                          <p className="font-black text-slate-900 uppercase text-sm border-b border-slate-200 pb-2 mb-2">
                            Brgy {brgy.name}
                          </p>
                          <div className="space-y-2 text-[11px]">
                            <div className="flex justify-between">
                              <span className="text-slate-500 font-bold uppercase">Healthy:</span>
                              <span className="font-black text-emerald-700">{stats.healthy.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500 font-bold uppercase">Sick:</span>
                              <span className="font-black text-red-700">{stats.sick.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500 font-bold uppercase">Unverified:</span>
                              <span className="font-black text-amber-600">{stats.unverified.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-slate-200 mt-1">
                              <span className="font-black text-slate-700 uppercase">Total:</span>
                              <span className="font-black text-slate-900 text-sm">{stats.total.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </MapTooltip>
                    </Marker>
                  );
                })}
                <ZoomControl position="bottomright" />
              </MapContainer>
            </div>
          </div>

          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl p-8 lg:p-10">
            <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">
              Top 5 Movement Activity Barangays
            </h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
              {topBarangays.map((brgy) => (
                <div 
                  key={brgy.name}
                  className="flex justify-between items-center bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-all hover:shadow-md"
                >
                  <div>
                    <p className="font-bold text-slate-900 text-lg">Brgy {brgy.name}</p>
                    <p className="text-sm text-slate-600">
                      {brgy.sick > 0 ? (
                        <span className="text-red-600 font-bold">{brgy.sick.toLocaleString()} at risk</span>
                      ) : "All healthy"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-slate-900">{brgy.total.toLocaleString()}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Total Heads</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}