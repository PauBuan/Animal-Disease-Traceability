import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Updated import path based on your file tree
import santaRosaData from "../../assets/data/santa_rosa.json";

export default function AdminOverview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDisease: 0,
    critical: 0,
    mild: 0,
    healthy: 0
  });
  const [barangayMapStats, setBarangayMapStats] = useState({});
  const santaRosaCenter = [14.311, 121.11];

  const VALID_BARANGAYS = [
    "Aplaya", "Balibago", "Caingin", "Dila", "Dita", "Don Jose", "Ibaba",
    "Kanluran", "Labas", "Macabling", "Malitlit", "Malusak", "Market Area",
    "Pooc", "Pulong Santa Cruz", "Santo Domingo", "Sinalhan", "Tagapo"
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

      if (loc.includes("slaughterhouse") || loc.includes("exported")) return;

      const match = VALID_BARANGAYS.find(b => loc.includes(b.toLowerCase()));
      if (match) {
        brgyGroup[match].total += qty;
        if (severity === "safe" || severity === "healthy") {
          gHealthy += qty;
          brgyGroup[match].healthy += qty;
        } else if (severity === "dangerous" || severity === "critical" || severity === "sick") {
          // If severity is critical/dangerous, mark as critical
          gCritical += qty;
          brgyGroup[match].critical += qty;
          brgyGroup[match].sick += qty;
        } else if (severity === "mild") {
          gMild += qty;
          brgyGroup[match].mild += qty;
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

  // --- UPDATED GEOGRAPHIC COLOR LOGIC ---
  const getColor = (brgyStats) => {
    if (brgyStats.critical > 0) return '#ef4444'; // Red if any critical cases exist
    if (brgyStats.mild > 0) return '#f97316';     // Orange if only mild cases exist
    return '#10b981';                             // Green if 0 sick
  };

  const mapStyle = (feature) => {
    const brgyName = feature.properties.NAME_3;
    const brgyStats = barangayMapStats[brgyName] || { mild: 0, critical: 0 };
    return {
      fillColor: getColor(brgyStats),
      weight: 1.5,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.7
    };
  };

  const onEachBarangay = (feature, layer) => {
    const brgyName = feature.properties.NAME_3;
    const stats = barangayMapStats[brgyName] || { healthy: 0, mild: 0, critical: 0, unverified: 0, total: 0 };

    layer.on({
      mouseover: (e) => {
        const l = e.target;
        l.setStyle({ weight: 3, color: '#6366f1', fillOpacity: 0.85 });
      },
      mouseout: (e) => {
        const l = e.target;
        l.setStyle({ weight: 1.5, color: 'white', fillOpacity: 0.7 });
      }
    });

    layer.bindTooltip(`
      <div style="font-family: sans-serif; padding: 8px; min-width: 160px;">
        <strong style="text-transform: uppercase; border-bottom: 1px solid #eee; display: block; margin-bottom: 5px; font-size: 13px;">
          Brgy ${brgyName}
        </strong>
        <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
          <span style="color: #64748b; font-weight: bold;">HEALTHY:</span> 
          <span style="font-weight: 900; color: #059669;">${stats.healthy.toLocaleString()}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
          <span style="color: #64748b; font-weight: bold;">MILD:</span> 
          <span style="font-weight: 900; color: #f97316;">${stats.mild.toLocaleString()}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
          <span style="color: #64748b; font-weight: bold;">CRITICAL:</span> 
          <span style="font-weight: 900; color: #dc2626;">${stats.critical.toLocaleString()}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
          <span style="color: #64748b; font-weight: bold;">UNVERIFIED:</span> 
          <span style="font-weight: 900; color: #d97706;">${stats.unverified.toLocaleString()}</span>
        </div>
        <div style="border-top: 1px solid #eee; padding-top: 4px; display: flex; justify-content: space-between; font-size: 12px; font-weight: 900;">
          <span>TOTAL:</span> <span>${stats.total.toLocaleString()}</span>
        </div>
      </div>
    `, { sticky: true, opacity: 0.95 });
  };

  if (loading) return <div className="p-10 text-center font-bold">Syncing Disease Data...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-black text-gray-800 mb-6 uppercase tracking-tight">
        Disease Monitoring Dashboard
      </h1>

      {/* KPIs Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100">
          <h2 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-2">Vaccination</h2>
          <p className="text-4xl font-black text-gray-900">0%</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">No Data Available</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-red-100">
          <h2 className="text-xs font-black text-red-500 uppercase tracking-widest mb-2">Total Sick</h2>
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
        <div className="rounded-xl overflow-hidden border border-slate-200 shadow-inner relative">
          <MapContainer
            center={santaRosaCenter}
            zoom={12.5}
            zoomControl={false}
            style={{ height: "500px", width: "100%", zIndex: 10 }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            <GeoJSON 
              data={santaRosaData} 
              style={mapStyle} 
              onEachFeature={onEachBarangay} 
            />

            <ZoomControl position="bottomright" />

            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white z-[1000] pointer-events-none">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Disease Legend</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></div>
                  <span className="text-[10px] font-black text-slate-700">No Cases (Healthy)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#f97316]"></div>
                  <span className="text-[10px] font-black text-slate-700">Warning (Mild)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></div>
                  <span className="text-[10px] font-black text-slate-700">Critical (ASF/Flu)</span>
                </div>
              </div>
            </div>
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
                    <td className="py-4 px-4 font-bold text-slate-700">{name}</td>
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