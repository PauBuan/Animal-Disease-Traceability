import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { MapContainer, TileLayer, Marker, Tooltip as MapTooltip, ZoomControl } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Standard Leaflet Icon Fix
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
    logistics: { exported: 0, slaughtered: 0 }
  });
  const [barangayMapStats, setBarangayMapStats] = useState({});

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

    setTransactions({
      healthy: gHealthy,
      sick: gSick,
      unverified: gUnverified,
      speciesCounts,
      logistics: { exported: exp, slaughtered: slaught },
    });
    setBarangayMapStats(brgyGroup);
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white text-green-600 font-black text-3xl uppercase">
      Loading Geo-Data...
    </div>
  );

  return (
    <div className="w-full bg-slate-50 min-h-screen pt-24 pb-16 px-8 font-sans relative">
      <style>
        {`
          @media print {
            .map-container-section { display: none !important; }
            .sidebar-section { width: 100% !important; border: none !important; box-shadow: none !important; }
            body { background: white !important; }
          }
          .leaflet-container {
            z-index: 0 !important;
            height: 100% !important;
            width: 100% !important;
          }
        `}
      </style>

      {/* Aligns items to the same height */}
      <div className="max-w-7xl mx-auto flex gap-10 items-stretch">
        
        {/* SIDEBAR */}
        <aside className="sidebar-section w-[420px] bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm sticky top-24 h-fit flex flex-col transition-all z-10">
          <h1 className="text-4xl font-black text-slate-900 leading-tight">Animal Movement</h1>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-600 mt-3">City of Santa Rosa</p>

          <div className="grid grid-cols-2 gap-5 mt-10">
            <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 flex flex-col items-center text-center">
              <p className="text-[10px] font-black uppercase text-emerald-600 mb-2">Healthy Heads</p>
              <p className="text-4xl font-black text-emerald-700">{transactions.healthy.toLocaleString()}</p>
            </div>
            <div className="bg-red-50/50 p-6 rounded-3xl border border-red-100 flex flex-col items-center text-center">
              <p className="text-[10px] font-black uppercase text-red-600 mb-2">Sick Heads</p>
              <p className="text-4xl font-black text-red-600">{transactions.sick.toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-8 bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4">
            <div className="flex justify-between items-center px-2">
              <span className="text-slate-500 font-bold text-sm uppercase tracking-wider">Exported</span>
              <span className="text-xl font-black text-slate-800">{transactions.logistics.exported.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center px-2 pt-4 border-t border-slate-200">
              <span className="text-red-700 font-black text-sm uppercase tracking-wider">Slaughtered</span>
              <span className="text-xl font-black text-red-700">{transactions.logistics.slaughtered.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 mt-8 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 text-center">Species Registry</h3>
            <div className="h-44">
              <Bar
                data={{
                  labels: SPECIES_LIST,
                  datasets: [{
                    data: SPECIES_LIST.map(s => transactions.speciesCounts[s] || 0),
                    backgroundColor: "#10b981",
                    borderRadius: 8,
                  }],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { grid: { display: false }, ticks: { font: { size: 11, weight: 'bold' }, color: '#64748b' } },
                    y: { display: false },
                  },
                }}
              />
            </div>
          </div>

          <div className="mt-10 space-y-4">
            <button onClick={() => window.print()} className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-2xl font-black uppercase text-sm tracking-widest transition-all shadow-lg active:scale-95">
              Download / Print Report
            </button>
            <button onClick={() => navigate("/home")} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-5 rounded-2xl font-black uppercase text-sm tracking-widest transition-all">
              ← Return to Home
            </button>
          </div>
        </aside>

        {/* MAP SECTION: Forced to stretch height */}
        <div className="flex-1 map-container-section relative z-0 flex">
          <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-xl p-10 flex flex-col w-full h-auto min-h-[750px]">
            <div className="mb-8 px-2">
              <h2 className="text-3xl font-black text-slate-800">Geographic Heatmap</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">Movement Statistics per Barangay</p>
            </div>
            
            {/* Map Container now fills the remaining space of the card */}
            <div className="rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-inner relative z-0 flex-grow">
              <MapContainer 
                center={[14.28, 121.09]} 
                zoom={13} 
                zoomControl={false} 
                style={{ height: "100%", width: "100%", position: "absolute", top: 0, bottom: 0 }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                
                {barangayMarkers.map((brgy) => {
                  const stats = barangayMapStats[brgy.name] || { total: 0, healthy: 0, sick: 0, unverified: 0 };
                  
                  return (
                    <Marker key={brgy.name} position={brgy.pos}>
                      <MapTooltip direction="top" offset={[0, -32]} opacity={1}>
                        <div className="font-sans p-3 min-w-[160px]">
                          <p className="font-black text-slate-900 uppercase text-sm border-b-2 border-slate-100 pb-2 mb-3">
                            Brgy {brgy.name}
                          </p>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500 font-bold">Healthy:</span>
                              <span className="font-black text-emerald-600">{stats.healthy}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500 font-bold">Unverified:</span>
                              <span className="font-black text-amber-500">{stats.unverified}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500 font-bold">Sick:</span>
                              <span className="font-black text-red-600">{stats.sick}</span>
                            </div>
                            <div className="flex justify-between text-sm pt-2 border-t border-slate-100 mt-2">
                              <span className="font-black text-slate-400 uppercase text-[10px]">Total Heads:</span>
                              <span className="font-black text-slate-900">{stats.total}</span>
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
        </div>
      </div>
    </div>
  );
}