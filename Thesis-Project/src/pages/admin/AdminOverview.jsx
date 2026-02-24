import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Tooltip as MapTooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// Leaflet icon fix
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function AdminOverview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDisease: 0,
    critical: 0,
    mild: 0,
    healthy: 0
  });
  const [barangayMapStats, setBarangayMapStats] = useState({});
  const santaRosaCenter = [14.28, 121.09];

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
      processData(data);
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const processData = (txList) => {
    const brgyGroup = {};
    let gHealthy = 0, gMild = 0, gCritical = 0;

    VALID_BARANGAYS.forEach(name => {
      brgyGroup[name] = { total: 0, healthy: 0, sick: 0, mild: 0, critical: 0, unverified: 0 };
    });

    txList.forEach((tx) => {
      const loc = (tx.location || "").toLowerCase().trim();
      const qty = Number(tx.quantity) || 0;
      const severity = (tx.severity || "").toLowerCase().trim();

      // Skip logistics
      if (loc.includes("slaughterhouse") || loc.includes("exported")) return;

      const match = VALID_BARANGAYS.find(b => loc.includes(b.toLowerCase()));
      if (match) {
        brgyGroup[match].total += qty;
        if (severity === "safe" || severity === "healthy") {
          gHealthy += qty;
          brgyGroup[match].healthy += qty;
        } else if (severity === "mild") {
          gMild += qty;
          brgyGroup[match].mild += qty;
          brgyGroup[match].sick += qty;
        } else if (severity === "dangerous" || severity === "critical") {
          gCritical += qty;
          brgyGroup[match].critical += qty;
          brgyGroup[match].sick += qty;
        } else {
          brgyGroup[match].unverified += qty;
        }
      }
    });

    setStats({
      totalDisease: gMild + gCritical,
      critical: gCritical,
      mild: gMild,
      healthy: gHealthy
    });
    setBarangayMapStats(brgyGroup);
  };

  if (loading) return <div className="p-10 text-center font-bold">Syncing Disease Data...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-black text-gray-800 mb-6 uppercase tracking-tight">
        Disease Monitoring Dashboard
      </h1>

      {/* KPIs Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        {/* Static Vaccination KPI */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100">
          <h2 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-2">Vaccination</h2>
          <p className="text-4xl font-black text-gray-900">0%</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">No Data Available</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-red-100">
          <h2 className="text-xs font-black text-red-500 uppercase tracking-widest mb-2">Total Disease</h2>
          <p className="text-4xl font-black text-gray-900">{stats.totalDisease.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Confirmed Cases</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-orange-100">
          <h2 className="text-xs font-black text-orange-500 uppercase tracking-widest mb-2">Critical</h2>
          <p className="text-4xl font-black text-gray-900">{stats.critical.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">High-Risk Alerts</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100">
          <h2 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-2">Mild Cases</h2>
          <p className="text-4xl font-black text-gray-900">{stats.mild.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Stable Monitoring</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-emerald-100">
          <h2 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-2">Healthy</h2>
          <p className="text-4xl font-black text-gray-900">{stats.healthy.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Verified Population</p>
        </div>
      </div>

      {/* Heatmap Section */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 border border-slate-100">
        <h2 className="text-2xl font-black text-gray-800 mb-4 uppercase">Barangay Outbreak Heatmap</h2>
        <div className="rounded-xl overflow-hidden border border-slate-200 shadow-inner">
          <MapContainer
            center={santaRosaCenter}
            zoom={13}
            style={{ height: "500px", width: "100%", zIndex: 10 }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {barangayMarkers.map((brgy) => {
              const bStats = barangayMapStats[brgy.name] || { healthy: 0, sick: 0, total: 0, unverified: 0 };
              return (
                <Marker key={brgy.name} position={brgy.pos}>
                  <MapTooltip direction="top" offset={[0, -20]} opacity={0.9}>
                    <div className="p-2 min-w-[150px]">
                      <p className="font-black border-b pb-1 mb-2 uppercase text-slate-800">Brgy. {brgy.name}</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between"><span>Healthy:</span> <span className="font-bold text-emerald-600">{bStats.healthy}</span></div>
                        <div className="flex justify-between"><span>Sick:</span> <span className="font-bold text-red-600">{bStats.sick}</span></div>
                        <div className="flex justify-between"><span>Unverified:</span> <span className="font-bold text-slate-500">{bStats.unverified}</span></div>
                        <div className="flex justify-between border-t pt-1 mt-1"><strong>Total:</strong> <strong>{bStats.total}</strong></div>
                      </div>
                    </div>
                  </MapTooltip>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>

      {/* Comprehensive Barangay Status Table */}
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
        <h2 className="text-2xl font-black text-gray-800 mb-6 uppercase">Barangay Health Surveillance</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-slate-100 text-slate-400 text-xs font-black uppercase tracking-widest">
                <th className="py-4 px-4">Barangay</th>
                <th className="py-4 px-4">Mild Cases</th>
                <th className="py-4 px-4">Critical Cases</th>
                <th className="py-4 px-4">Total Sick</th>
                <th className="py-4 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {VALID_BARANGAYS.map((name) => {
                const bStats = barangayMapStats[name] || { mild: 0, critical: 0, sick: 0 };
                const isActive = bStats.sick > 0;
                return (
                  <tr key={name} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-700">Brgy. {name}</td>
                    <td className="py-4 px-4 font-semibold text-blue-600">{bStats.mild.toLocaleString()}</td>
                    <td className="py-4 px-4 font-semibold text-red-600">{bStats.critical.toLocaleString()}</td>
                    <td className="py-4 px-4 font-black text-slate-900">{bStats.sick.toLocaleString()}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        isActive ? "bg-red-100 text-red-600 animate-pulse" : "bg-slate-100 text-slate-400"
                      }`}>
                        {isActive ? "Active Outbreak" : "None"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}