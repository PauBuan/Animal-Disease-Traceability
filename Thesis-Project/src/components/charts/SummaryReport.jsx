import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { useNavigate } from "react-router-dom";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function SummaryReport() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [stats, setStats] = useState({
    total: 0,
    average: 0,
    max: 0,
    maxMonth: "N/A",
    min: 0,
    minMonth: "N/A",
    trend: "Stable",
    riskLevel: "Low",
    peakPercentage: 0,
    momChange: 0
  });
  const [topDiseases, setTopDiseases] = useState([]);

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
      console.error("Error fetching summary data:", err);
    } finally {
      setLoading(false);
    }
  };

  const processData = (txList) => {
    const monthsCount = Array(12).fill(0);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const diseaseMap = {
      "African Swine Fever (ASF)": 0,
      "Avian Influenza": 0,
      "Foot and Mouth Disease (FMD)": 0,
      "Other": 0
    };

    txList.forEach((tx) => {
      const severity = (tx.severity || "").toLowerCase();
      if (severity === "mild" || severity === "dangerous") {
        const date = new Date(tx.date || tx.timestamp);
        if (!isNaN(date.getTime())) {
          const monthIndex = date.getMonth();
          monthsCount[monthIndex] += Number(tx.quantity) || 1;
        }

        if (severity === "dangerous") {
          const diag = tx.diagnosedDisease || "Other";
          if (diseaseMap.hasOwnProperty(diag)) {
            diseaseMap[diag] += Number(tx.quantity) || 1;
          } else {
            diseaseMap["Other"] += Number(tx.quantity) || 1;
          }
        }
      }
    });

    const total = monthsCount.reduce((a, b) => a + b, 0);
    const maxVal = Math.max(...monthsCount);
    const minVal = Math.min(...monthsCount);
    const maxIdx = monthsCount.indexOf(maxVal);
    const minIdx = monthsCount.indexOf(minVal);
    let trend = "Stable";
    let momChange = 0;
    if (monthsCount[11] > monthsCount[10]) {
      trend = "Increasing";
      momChange = ((monthsCount[11] - monthsCount[10]) / (monthsCount[10] || 1)) * 100;
    } else if (monthsCount[11] < monthsCount[10]) {
      trend = "Decreasing";
      momChange = ((monthsCount[11] - monthsCount[10]) / (monthsCount[10] || 1)) * 100;
    }

    const riskLevel = total > 500 ? "High" : total > 200 ? "Medium" : "Low";
    const peakPercentage = total > 0 ? ((maxVal / total) * 100).toFixed(1) : 0;

    const sortedDiseases = Object.entries(diseaseMap)
      .sort(([,a], [,b]) => b - a)
      .map(([disease, count]) => ({ disease, count }));

    setTopDiseases(sortedDiseases);
    setStats({
      total,
      average: total > 0 ? (total / 12).toFixed(1) : "0.0",
      max: maxVal,
      maxMonth: monthNames[maxIdx],
      min: minVal,
      minMonth: monthNames[minIdx],
      trend,
      riskLevel,
      peakPercentage,
      momChange: momChange.toFixed(1)
    });

    setChartData({
      labels: monthNames,
      datasets: [{
        label: "Confirmed Sick Cases",
        data: monthsCount,
        fill: true,
        borderColor: "#dc2626",
        backgroundColor: "rgba(220, 38, 38, 0.12)",
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: "#dc2626",
        pointBorderColor: "#fff",
        pointBorderWidth: 3
      }]
    });
  };

  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-50/80 backdrop-blur-sm z-50">
      <div className="bg-white/90 p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col items-center">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-red-600 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-300"></div>
          </div>
        </div>
        <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Generating Report</h2>
        <p className="text-slate-500 font-medium text-sm mt-2 animate-pulse">Analyzing blockchain-verified data...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/20 to-rose-50/10">
      <main className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 lg:py-16">
        {/* Header */}
        <header className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-3 px-6 py-3 mb-6 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-red-100">
            <span className="text-red-600 text-xl">📉🦠</span>
            <span className="font-bold text-slate-800 uppercase tracking-wider text-sm">Santa Rosa Disease Intelligence</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight mb-4">
            Disease Summary Report
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto font-medium">
            Annual epidemiological overview of confirmed sick cases (mild + dangerous severity) across Santa Rosa City
          </p>
        </header>

        {/* KPI Cards – more colorful & varied */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          <div className="bg-gradient-to-br from-red-600 to-rose-700 p-8 rounded-3xl text-white shadow-2xl shadow-red-200/40 transition-all hover:scale-[1.02] hover:shadow-red-300/50">
            <p className="text-red-100 text-sm font-semibold uppercase tracking-wider mb-2">Total Confirmed Cases</p>
            <p className="text-5xl sm:text-6xl font-black">{stats.total.toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-8 rounded-3xl text-white shadow-2xl shadow-indigo-200/40 transition-all hover:scale-[1.02] hover:shadow-indigo-300/50">
            <p className="text-indigo-100 text-sm font-semibold uppercase tracking-wider mb-2">Monthly Average</p>
            <p className="text-5xl sm:text-6xl font-black">{stats.average}</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-lg p-8 transition-all hover:shadow-xl hover:-translate-y-1">
            <p className="text-slate-600 font-medium mb-2">Peak Month</p>
            <p className="text-4xl font-black text-red-700">
              {stats.maxMonth} <span className="text-2xl text-slate-400">({stats.max})</span>
            </p>
            <p className="text-sm text-slate-500 mt-2">
              {stats.peakPercentage}% of yearly total
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-lg p-8 transition-all hover:shadow-xl hover:-translate-y-1">
            <p className="text-slate-600 font-medium mb-2">Month-over-Month Change</p>
            <p className={`text-4xl font-black ${stats.momChange > 0 ? "text-red-600" : "text-emerald-600"}`}>
              {stats.momChange > 0 ? "+" : ""}{stats.momChange}%
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-lg p-8 transition-all hover:shadow-xl hover:-translate-y-1">
            <p className="text-slate-600 font-medium mb-2">Risk Level</p>
            <span
              className={`inline-block px-6 py-3 rounded-full text-xl font-bold ${
                stats.riskLevel === "High"
                  ? "bg-red-100 text-red-700 border-2 border-red-300"
                  : stats.riskLevel === "Medium"
                  ? "bg-orange-100 text-orange-700 border-2 border-orange-300"
                  : "bg-emerald-100 text-emerald-700 border-2 border-emerald-300"
              }`}
            >
              {stats.riskLevel}
            </span>
          </div>
        </div>

        {/* Main Chart + Top Cases */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Line Chart */}
          <div className="lg:col-span-8 bg-white rounded-3xl shadow-xl border border-slate-100/80 p-8 lg:p-10">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-6 tracking-tight">
              Monthly Sick Cases Trend – Full Year
            </h3>
            <div className="h-[380px] sm:h-[420px] lg:h-[480px]">
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: { mode: "index", intersect: false }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: "rgba(0,0,0,0.04)" },
                      ticks: { color: "#64748b", font: { weight: "500" } }
                    },
                    x: {
                      grid: { display: false },
                      ticks: { color: "#64748b", font: { weight: "500" } }
                    }
                  },
                  animation: {
                    duration: 2000,
                    easing: "easeOutQuart"
                  }
                }}
              />
            </div>
          </div>

          {/* Top Cases */}
          <div className="lg:col-span-4 bg-white rounded-3xl shadow-xl border border-slate-100/80 p-8 lg:p-10">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-6 tracking-tight">
              Top Reported Diseases
            </h3>
            <div className="space-y-4">
              {topDiseases.slice(0, 5).map(({ disease, count }) => (
                <div 
                  key={disease}
                  className="flex justify-between items-center bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-all hover:shadow-md"
                >
                  <div>
                    <p className="font-bold text-slate-900">{disease}</p>
                    <p className="text-sm text-slate-500">{count.toLocaleString()} cases</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                    disease.includes("ASF") || disease.includes("Avian") || disease.includes("FMD")
                      ? "bg-red-100 text-red-700 border border-red-200"
                      : "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}>
                    {disease.includes("ASF") || disease.includes("Avian") || disease.includes("FMD") ? "High Risk" : "Notified"}
                  </span>
                </div>
              ))}
              {topDiseases.length === 0 && (
                <p className="text-center text-slate-500 py-8">No dangerous cases recorded this year.</p>
              )}
            </div>
          </div>
        </div>

        {/* Descriptive Analytics */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100/80 p-8 lg:p-10 mb-12">
          <h3 className="text-2xl font-black text-slate-900 mb-6">Key Insights & Recommendations</h3>
          <div className="space-y-6 text-slate-700 leading-relaxed text-lg">
            <p>
              This year recorded <strong>{stats.total.toLocaleString()}</strong> confirmed sick cases, averaging <strong>{stats.average}</strong> per month.
              The peak occurred in <strong>{stats.maxMonth}</strong> ({stats.max} cases, {stats.peakPercentage}% of annual total).
            </p>

            {stats.trend === "Increasing" && (
              <p className="text-red-700 font-medium">
                <strong>Alert:</strong> Cases are increasing month-over-month ({stats.momChange > 0 ? "+" : ""}{stats.momChange}% last change). 
                Prioritize enhanced surveillance, vaccination drives, and biosecurity audits in high-risk barangays.
              </p>
            )}

            {stats.trend === "Decreasing" && (
              <p className="text-emerald-700 font-medium">
                <strong>Positive Trend:</strong> Cases have decreased compared to previous periods ({stats.momChange < 0 ? "" : "-"}{Math.abs(stats.momChange)}% last change). 
                Current control measures appear effective — maintain momentum.
              </p>
            )}

            {stats.trend === "Stable" && (
              <p className="text-slate-700">
                Trend remains stable — a good indicator of consistent monitoring and response capabilities. 
                Continue routine surveillance to prevent any resurgence.
              </p>
            )}

            {stats.riskLevel === "High" && (
              <p className="text-red-700 font-medium">
                Current risk level is <strong>High</strong> — recommend immediate escalation of response protocols and stakeholder briefings.
              </p>
            )}

            <p className="text-slate-600 italic">
              Data is sourced from blockchain-verified field reports and veterinary diagnoses. Always cross-reference with local health advisories.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row justify-center gap-6">
          <button
            onClick={() => navigate("/home")}
            className="px-10 py-5 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-3 transform hover:scale-105"
          >
            ← Return to Home
          </button>
          <button
            onClick={() => window.print()}
            className="px-10 py-5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-red-200/40 flex items-center justify-center gap-3 transform hover:scale-105"
          >
            Download / Print Report
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          </button>
        </div>
      </main>
    </div>
  );
}