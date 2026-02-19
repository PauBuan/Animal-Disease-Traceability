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
    trend: "Stable"
  });

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

    txList.forEach((tx) => {
      const severity = (tx.severity || "").toLowerCase();
      if (severity === "mild" || severity === "dangerous") {
        const date = new Date(tx.date || tx.timestamp);
        if (!isNaN(date.getTime())) {
          const monthIndex = date.getMonth();
          monthsCount[monthIndex] += Number(tx.quantity) || 1;
        }
      }
    });

    const total = monthsCount.reduce((a, b) => a + b, 0);
    const maxVal = Math.max(...monthsCount);
    const minVal = Math.min(...monthsCount);
    const maxIdx = monthsCount.indexOf(maxVal);
    const minIdx = monthsCount.indexOf(minVal);

    let trend = "Stable";
    if (monthsCount[11] > monthsCount[0]) trend = "Increasing";
    else if (monthsCount[11] < monthsCount[0]) trend = "Decreasing";

    setStats({
      total,
      average: total > 0 ? (total / 12).toFixed(1) : "0.0",
      max: maxVal,
      maxMonth: monthNames[maxIdx],
      min: minVal,
      minMonth: monthNames[minIdx],
      trend
    });

    setChartData({
      labels: monthNames,
      datasets: [{
        label: "Confirmed Sick Cases",
        data: monthsCount,
        fill: true,
        borderColor: "#dc2626",
        backgroundColor: "rgba(220, 38, 38, 0.08)",
        tension: 0.38,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: "#dc2626",
        pointBorderColor: "#fff",
        pointBorderWidth: 2
      }]
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 mx-auto mb-4 border-4 border-red-500 border-t-transparent rounded-full"></div>
          <p className="text-slate-600 font-semibold tracking-wide">Loading disease trends...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70">
      <main className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8 lg:py-12">
        <header className="mb-10 lg:mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Disease Summary Report
          </h2>
          <p className="mt-2 text-slate-600 font-medium">
            Annual overview of confirmed sick cases (mild + dangerous severity)
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Chart - takes more space */}
          <div className="lg:col-span-8 bg-white rounded-3xl shadow border border-slate-100/80 p-6 lg:p-8">
            <h3 className="text-base font-bold text-slate-500 uppercase tracking-wider mb-6">
              Monthly Sick Cases Trend – Full Year
            </h3>
            <div className="h-[340px] sm:h-[380px] lg:h-[420px]">
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
                      ticks: { color: "#64748b" }
                    },
                    x: {
                      grid: { display: false },
                      ticks: { color: "#64748b" }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="lg:col-span-4 space-y-6">
            {/* Total Cases - prominent card */}
            <div className="bg-gradient-to-br from-red-600 to-red-700 p-8 rounded-3xl text-white shadow-xl shadow-red-200/40">
              <p className="text-red-100 text-sm font-semibold uppercase tracking-wider mb-2">
                Total Confirmed Cases
              </p>
              <div className="text-6xl sm:text-7xl font-black">
                {stats.total.toLocaleString()}
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7 space-y-6">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600 font-medium">Peak Month</span>
                <span className="font-bold text-red-600">
                  {stats.maxMonth} <span className="text-slate-400">({stats.max})</span>
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600 font-medium">Average per Month</span>
                <span className="font-bold text-slate-800">{stats.average}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600 font-medium">Lowest Month</span>
                <span className="font-bold text-blue-600">
                  {stats.minMonth} <span className="text-slate-400">({stats.min})</span>
                </span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-slate-600 font-medium">Yearly Trend</span>
                <span
                  className={`font-semibold px-4 py-1.5 rounded-full text-sm ${
                    stats.trend === "Increasing"
                      ? "bg-red-100 text-red-700 border border-red-200"
                      : stats.trend === "Decreasing"
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                      : "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  {stats.trend}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 lg:mt-16 flex flex-col sm:flex-row justify-center gap-5 sm:gap-6">
          <button
            onClick={() => navigate("/home")}
            className="px-10 py-4 bg-slate-700 hover:bg-slate-800 text-white font-semibold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
          >
            ← Return to Home
          </button>

          <button
            onClick={() => window.print()}
            className="px-10 py-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Download / Print Report
          </button>
        </div>
      </main>
    </div>
  );
}