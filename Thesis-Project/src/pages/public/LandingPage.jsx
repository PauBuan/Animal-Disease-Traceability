import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUsers } from "../../config/api"; 
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import "./../../assets/styles/App.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export default function LandingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Data States
  const [speciesStats, setSpeciesStats] = useState({});
  const [monthlyTrend, setMonthlyTrend] = useState(Array(12).fill(0));
  // Updated state structure to hold combined health categories
  const [diseaseStats, setDiseaseStats] = useState({ healthy: 0, mild: 0, dangerous: 0, unverified: 0 });
  const [stakeholderCount, setStakeholderCount] = useState(0);
  const [totalAnimals, setTotalAnimals] = useState(0);
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState(new Date());
  const [timeAgo, setTimeAgo] = useState("Just now");

  const SPECIES_LIST = ["Hog", "Cow", "Chicken", "Sheep", "Goat"];

  const fetchDashboardData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res = await fetch("http://localhost:3001/api/transactions");
      const txData = await res.json();
      const transactions = Array.isArray(txData) ? txData : [];

      const userData = await fetchUsers();
      setStakeholderCount(Array.isArray(userData) ? userData.length : 0);

      const VALID_BARANGAYS = [
        "Aplaya", "Balibago", "Caingin", "Dila", "Dita", "Don Jose", "Ibaba",
        "Kanluran", "Labas", "Macabling", "Malitlit", "Malusak", "Market Area",
        "Pooc", "Pulong Santa Cruz", "Santo Domingo", "Sinalhan", "Tagapo"
      ];

      const stats = {};
      SPECIES_LIST.forEach(s => {
        stats[s] = { healthy: 0, sick: 0, unverified: 0, total: 0 };
      });

      const months = Array(12).fill(0);
      // Logic change: Initializing combined categories
      const healthSummary = { healthy: 0, mild: 0, dangerous: 0, unverified: 0 };
      let grandTotal = 0;

      transactions.forEach(tx => {
        const loc = (tx.location || "").toLowerCase().trim();
        const spec = tx.species || "Other";
        const qty = Number(tx.quantity) || 0;
        const sev = (tx.severity || "").toLowerCase().trim();
        const date = new Date(tx.timestamp);

        const isExternal = loc.includes("slaughterhouse") || loc.includes("exported") || loc.includes("outside");
        const isValidBrgy = VALID_BARANGAYS.some(b => loc.includes(b.toLowerCase()));

        if (isValidBrgy && !isExternal) {
          grandTotal += qty;

          // Process health summary for the Pie Chart
          if (sev === "safe" || sev === "healthy") {
            healthSummary.healthy += qty;
          } else if (sev === "mild") {
            healthSummary.mild += qty;
          } else if (sev === "dangerous") {
            healthSummary.dangerous += qty;
          } else {
            healthSummary.unverified += qty;
          }

          if (stats[spec]) {
            stats[spec].total += qty;
            
            if (sev === "safe" || sev === "healthy") {
              stats[spec].healthy += qty;
            } else if (sev === "mild" || sev === "dangerous" || sev === "sick") {
              stats[spec].sick += qty;
              months[date.getMonth()] += qty;
            } else {
              stats[spec].unverified += qty;
            }
          }
        }
      });

      setSpeciesStats(stats);
      setMonthlyTrend(months);
      setDiseaseStats(healthSummary);
      setTotalAnimals(grandTotal);
      
      setLastSyncTimestamp(new Date());
      setTimeAgo("Just now");
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const autoRefresh = setInterval(() => fetchDashboardData(), 300000);
    return () => clearInterval(autoRefresh);
  }, [fetchDashboardData]);

  useEffect(() => {
    const interval = setInterval(() => {
      const seconds = Math.floor((new Date() - lastSyncTimestamp) / 1000);
      if (seconds < 60) setTimeAgo("Just now");
      else if (seconds < 3600) setTimeAgo(`${Math.floor(seconds / 60)} min ago`);
      else setTimeAgo(`${Math.floor(seconds / 3600)} hr ago`);
    }, 30000);
    return () => clearInterval(interval);
  }, [lastSyncTimestamp]);

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { position: "top", labels: { color: "#374151", font: { weight: 'bold' } } } 
    },
    scales: {
      x: { ticks: { color: "#4b5563" }, grid: { display: false } },
      y: { ticks: { color: "#4b5563" }, grid: { color: "rgba(0,0,0,0.05)" } }
    }
  };

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
          Fetching ledger data...
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-slate-50/50 flex flex-col items-center">
      
      {/* HERO SECTION */}
      <section className="w-full max-w-7xl pt-32 pb-24 px-6">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-block px-5 py-2 mb-6 rounded-full bg-green-100 text-green-700 text-sm font-bold tracking-wide border border-green-200 shadow-sm">
              Powered by HyperLedger Fabric • Real-time • Immutable
            </div>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 tracking-tighter leading-none mb-8">
              Secure Animal <br/>
              <span className="text-green-600">Traceability Platform</span>
            </h2>
            <p className="text-gray-700 text-xl lg:text-2xl leading-relaxed font-medium max-w-3xl">
              Protecting Santa Rosa's livestock supply chain through blockchain-verified data. 
              Real-time monitoring of animal health, movement, and disease risks — empowering farmers, 
              veterinarians, and local authorities with transparent, tamper-proof insights.
            </p>

            <div className="mt-12 flex flex-wrap justify-center md:justify-start gap-5">
              <button 
                onClick={() => window.scrollTo({top: 900, behavior: 'smooth'})} 
                className="px-12 py-6 bg-gray-900 text-white rounded-[2rem] font-bold text-xl hover:bg-black transition-all shadow-2xl hover:shadow-3xl"
              >
                Explore Live Dashboard
              </button>
              <button 
                onClick={() => navigate("/login")} 
                className="px-12 py-6 bg-white text-gray-900 border-2 border-gray-200 rounded-[2rem] font-bold text-xl hover:bg-gray-50 transition-all shadow-lg"
              >
                Stakeholder Login
              </button>
            </div>
          </div>

          <div className="hidden lg:block w-1/3 bg-white p-10 rounded-[3rem] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.12)] border border-gray-100">
            <div className="space-y-10 text-center">
              <div className="pb-8 border-b border-gray-100">
                <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Registered Livestock</p>
                <p className="text-5xl font-black text-green-700">{totalAnimals.toLocaleString()}</p>
                <p className="text-sm text-gray-600 mt-1">Across all barangays</p>
              </div>

              <div className="pb-8 border-b border-gray-100">
                <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Authorized Stakeholders</p>
                <p className="text-4xl font-black text-gray-900">{stakeholderCount.toLocaleString()}</p>
                <p className="text-sm text-gray-600 mt-1">Farmers • Vets • LGU</p>
              </div>

              <div className="pb-8 border-b border-gray-100">
                <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Last Blockchain Sync</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                  <p className="text-3xl font-bold text-green-700">{timeAgo}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">System Status</p>
                <p className="text-3xl font-bold text-emerald-600">Fully Operational</p>
                <p className="text-sm text-gray-600 mt-1">99.98% uptime • No alerts</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DASHBOARD GRID */}
      <div className="w-full max-w-7xl mx-auto px-6 py-20">
        <div className="mb-20 text-center max-w-4xl mx-auto">
          <h1 className="text-sm font-black text-green-600 uppercase tracking-[0.4em] mb-5">
            Immutable • Transparent • Actionable
          </h1>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-8">
            Santa Rosa Livestock Dashboard
          </h2>
          <p className="text-gray-700 text-xl leading-relaxed font-medium">
            Real-time visibility into animal health, movement patterns, disease risks, and supply chain integrity. 
            Every record is cryptographically secured on the blockchain — ensuring data authenticity for farmers, 
            veterinarians, meat inspectors, and local government units in Santa Rosa City, Laguna.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-12">

          {/* CARD 1: MOVEMENT */}
          <div className="group bg-white rounded-[3rem] p-10 lg:p-12 shadow border border-gray-100/80 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 flex flex-col min-h-[720px]">
            <div>
              <div className="flex items-center justify-between mb-10">
                <div className="p-7 bg-green-50 rounded-[2.5rem] text-5xl shadow-inner">🚚</div>
                <div className="text-right">
                  <p className="text-xs font-black text-green-600 uppercase tracking-widest">Live Tracking</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">Movement</p>
                </div>
              </div>
              <h3 className="text-4xl font-black text-gray-900 mb-5">Movement and Population Census</h3>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Real-time tracking of livestock demographics and distribution across Santa Rosa. 
                By monitoring population shifts and species-specific data, authorities can 
                optimize resource allocation and ensure precise logistics for city-wide safety programs.
              </p>

              {/* Multi-colored Bar Chart */}
              <div className="h-64 mb-6">
                <Bar 
                  data={{
                    labels: SPECIES_LIST,
                    datasets: [{ 
                      label: "Registered Animals", 
                      data: SPECIES_LIST.map(s => speciesStats[s]?.total || 0), 
                      backgroundColor: [
                        "#f59e0b", // Hog - Amber
                        "#3b82f6", // Cow - Blue
                        "#ef4444", // Chicken - Red
                        "#8b5cf6", // Sheep - Purple
                        "#10b981"  // Goat - Emerald
                      ], 
                      borderRadius: 12 
                    }]
                  }} 
                  options={commonOptions} 
                />
              </div>

              {/* Animal Icon Row */}
              <div className="flex justify-around items-center bg-slate-50 rounded-2xl py-4 mb-6 border border-slate-100">
                {["🐖", "🐄", "🐓", "🐑", "🐐"].map((emoji, i) => (
                  <span key={i} className="text-3xl filter drop-shadow-sm">{emoji}</span>
                ))}
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-4">
                Data is updated in real-time from field reports and verified entries.
              </p>
              <button onClick={() => navigate("/animal-movement")} className="w-full py-5 bg-green-600 text-white rounded-2xl font-black text-lg transition-all hover:bg-green-700 shadow-xl">
                View Full Movement Map →
              </button>
            </div>
          </div>

          {/* CARD 2: HEALTH */}
          <div className="group bg-white rounded-[3rem] p-10 lg:p-12 shadow border border-gray-100/80 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 flex flex-col min-h-[720px]">
            <div>
              <div className="flex items-center justify-between mb-10">
                <div className="p-7 bg-emerald-50 rounded-[2.5rem] text-5xl shadow-inner">🩺</div>
                <div className="text-right">
                  <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Medical Records</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">Health Status</p>
                </div>
              </div>
              <h3 className="text-4xl font-black text-gray-900 mb-5">Animal Health Overview</h3>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Real-time breakdown of healthy vs. sick animals per species. 
                Critical for early warning of disease outbreaks and evaluating the effectiveness 
                of vaccination campaigns and biosecurity measures in Santa Rosa.
              </p>
              <div className="overflow-hidden rounded-3xl border border-gray-100 mb-6">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-xs font-black uppercase tracking-wider">
                    <tr>
                      <th className="py-5 px-8">Species</th>
                      <th className="py-5 text-center text-green-700">Healthy</th>
                      <th className="py-5 text-center text-red-600">Sick</th>
                      <th className="py-5 text-center text-amber-600">Unverified</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-lg font-semibold">
                    {SPECIES_LIST.map(s => (
                      <tr key={s}>
                        <td className="py-5 px-8 font-bold text-gray-800">{s}</td>
                        <td className="py-5 text-center text-green-700">{speciesStats[s]?.healthy?.toLocaleString() || "0"}</td>
                        <td className="py-5 text-center text-red-600">{speciesStats[s]?.sick?.toLocaleString() || "0"}</td>
                        <td className="py-5 text-center text-amber-600">{speciesStats[s]?.unverified?.toLocaleString() || "0"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-auto pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-4">
                All health classifications are based on field veterinary assessments.
              </p>
              <button onClick={() => navigate("/health-table")} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg transition-all hover:bg-emerald-700 shadow-xl">
                Explore Detailed Health Records →
              </button>
            </div>
          </div>

          {/* CARD 3: OUTBREAKS (UPDATED PIE CHART) */}
          <div className="group bg-white rounded-[3rem] p-10 lg:p-12 shadow border border-gray-100/80 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 flex flex-col min-h-[720px]">
            <div>
              <div className="flex items-center justify-between mb-10">
                <div className="p-7 bg-red-50 rounded-[2.5rem] text-5xl shadow-inner">🚨</div>
                <div className="text-right">
                  <p className="text-xs font-black text-red-600 uppercase tracking-widest">Early Warning</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">Disease Risk</p>
                </div>
              </div>
              <h3 className="text-4xl font-black text-gray-900 mb-5">Outbreak Statistics & Analytics</h3>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Real-time tracking of livestock health conditions across Santa Rosa. This data identifies 
                high-risk areas and severity levels, enabling rapid medical response and targeted 
                quarantine protocols to maintain city-wide biosecurity.
              </p>
              <div className="h-72 mb-6">
                <Pie 
                  data={{
                    labels: ["Healthy", "Mild Cases", "Dangerous Cases", "Unverified"],
                    datasets: [{ 
                      data: [
                        diseaseStats.healthy, 
                        diseaseStats.mild, 
                        diseaseStats.dangerous, 
                        diseaseStats.unverified
                      ], 
                      backgroundColor: ["#10b981", "#3b82f6", "#ef4444", "#f59e0b"], 
                      borderWidth: 0 
                    }]
                  }} 
                  options={commonOptions} 
                />
              </div>
            </div>
            <div className="mt-auto pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-4">
                Data reflects only confirmed veterinary diagnoses.
              </p>
              <button onClick={() => navigate("/outbreak-stats")} className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-lg transition-all hover:bg-red-700 shadow-xl">
                View Risk Mitigation Tools →
              </button>
            </div>
          </div>

          {/* CARD 4: TRENDS */}
          <div className="group bg-white rounded-[3rem] p-10 lg:p-12 shadow border border-gray-100/80 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 flex flex-col min-h-[720px]">
            <div>
              <div className="flex items-center justify-between mb-10">
                <div className="p-7 bg-blue-50 rounded-[2.5rem] text-5xl shadow-inner">📈</div>
                <div className="text-right">
                  <p className="text-xs font-black text-blue-600 uppercase tracking-widest">Trend Analysis</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">Disease Trends</p>
                </div>
              </div>
              <h3 className="text-4xl font-black text-gray-900 mb-5">Monthly Sick Cases Trend</h3>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                12-month historical view of confirmed sick cases. 
                Identify seasonal patterns, evaluate intervention success, 
                and forecast potential future risks for better preparedness.
              </p>
              <div className="h-72 mb-6">
                <Line 
                  data={{
                    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                    datasets: [{ 
                      label: "Confirmed Sick Cases", 
                      data: monthlyTrend, 
                      borderColor: "#16a34a", 
                      backgroundColor: "rgba(22, 163, 74, 0.15)", 
                      fill: true, 
                      tension: 0.4 
                    }]
                  }} 
                  options={commonOptions} 
                />
              </div>
            </div>
            <div className="mt-auto pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-4">
                Updated monthly with verified veterinary reports.
              </p>
              <button onClick={() => navigate("/summary-report")} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg transition-all hover:bg-blue-700 shadow-xl">
                Access Full Trend Reports →
              </button>
            </div>
          </div>

        </div>

        {/* NEW GLOBAL PREDICTION FLASH CARD – below both cards */}
        <div className="mt-20 flex justify-center">
          <div className="bg-gradient-to-r from-purple-100 via-indigo-100 to-blue-100 p-10 rounded-3xl border-2 border-indigo-300 shadow-2xl text-center max-w-3xl w-full transform hover:scale-105 transition-all duration-500">
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="text-5xl animate-pulse">🔮✨</span>
              <h3 className="text-4xl font-extrabold text-indigo-800 tracking-tight">
                Livestock Disease Prediction
              </h3>
            </div>
            <p className="text-gray-800 text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
              Leverage advanced AI models trained on historical outbreak data, seasonal patterns, 
              climate factors, and real-time health reports to forecast potential disease risks 
              across Santa Rosa barangays — up to 30 days in advance. Stay one step ahead of ASF, 
              Avian Influenza, FMD, and other threats.
            </p>
            <button 
              onClick={() => {
                // Show toast
                alert("Coming Soon!\n\nLivestock Disease Prediction feature is under development.\nStay tuned for powerful AI-powered outbreak forecasts!");
              }} 
              className="px-12 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-xl transform hover:scale-105"
            >
              Check Predictions Now →
            </button>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="mt-32 text-center max-w-4xl mx-auto space-y-8 pb-20">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900">
            Protecting Santa Rosa's Future
          </h2>
          <p className="text-xl text-gray-700 leading-relaxed">
            Our blockchain-powered platform ensures every animal movement, health check, 
            and disease report is permanently recorded and verifiable. 
            Together with farmers, veterinarians, and local government, 
            we're building a safer, more transparent livestock ecosystem in Santa Rosa City.
          </p>

          <div className="pt-8 flex flex-col sm:flex-row justify-center gap-6">
            <button 
              onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} 
              className="px-12 py-6 bg-green-600 text-white rounded-2xl font-black text-xl hover:bg-green-700 transition-all shadow-xl"
            >
              Back to Top ↑
            </button>
            <button 
              onClick={() => navigate("/login")} 
              className="px-12 py-6 bg-white border-2 border-green-600 text-green-700 rounded-2xl font-black text-xl hover:bg-green-50 transition-all shadow-lg"
            >
              Join as Stakeholder →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}