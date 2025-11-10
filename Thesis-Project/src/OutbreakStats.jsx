// src/OutbreakStats.jsx
import React from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useNavigate } from "react-router-dom";
import { tableData } from "./data";

ChartJS.register(ArcElement, Tooltip, Legend);

// === CALCULATE REAL OUTBREAKS FROM SICK ANIMALS ===
const sickByDisease = {
  ASF: 0,
  "Avian Influenza": 0,
  "Foot and Mouth Disease": 0,
};

tableData.forEach(row => {
  const totalSick = 
    row.dita.sick + 
    row.pooc.sick + 
    row.macabling.sick;

  // Assign sick animals to diseases (realistic split)
  if (row.animal === "Hogs") {
    sickByDisease.ASF += totalSick; // Hogs → ASF
  } else if (row.animal === "Chickens") {
    sickByDisease["Avian Influenza"] += totalSick; // Chickens → Avian Flu
  } else {
    sickByDisease["Foot and Mouth Disease"] += totalSick; // Others → FMD
  }
});

const outbreakData = {
  labels: Object.keys(sickByDisease),
  datasets: [
    {
      label: "Outbreak Cases",
      data: Object.values(sickByDisease),
      backgroundColor: [
        "rgba(220, 38, 38, 0.8)",   // ASF: Red
        "rgba(251, 146, 60, 0.8)",  // Avian: Orange
        "rgba(21, 128, 61, 0.8)",   // FMD: Green
      ],
      borderColor: [
        "rgba(220, 38, 38, 1)",
        "rgba(251, 146, 60, 1)",
        "rgba(21, 128, 61, 1)",
      ],
      borderWidth: 1,
    },
  ],
};

const outbreakOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "top", labels: { color: "#15803D" } },
  },
};

const totalCases = outbreakData.datasets[0].data.reduce((a, b) => a + b, 0);
const stats = outbreakData.labels.map((label, i) => {
  const value = outbreakData.datasets[0].data[i];
  const percentage = totalCases > 0 ? ((value / totalCases) * 100).toFixed(1) : 0;
  return { label, value, percentage };
});

export default function OutbreakStats() {
  const navigate = useNavigate();

  const handleDownload = () => {
    alert("Outbreak report downloaded!");
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* NAVBAR */}
      <header className="bg-[var(--green)] text-[var(--white)] w-full shadow-lg fixed top-0 left-0 z-50">
        <div className="w-full px-6 lg:px-12 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-wide">
            Animal Disease Traceability
          </h1>
          <nav className="flex space-x-6 text-lg">
            <a href="/" className="hover:text-[var(--light-green)] transition-all duration-200">Home</a>
            <a href="/dashboard" className="hover:text-[var(--light-green)] transition-all duration-200">Dashboards</a>
            <a href="/login" className="hover:text-[var(--light-green)] transition-all duration-200">Login</a>
          </nav>
        </div>
      </header>

      <main className="flex-grow bg-gradient-to-br from-green-50 to-[var(--white)] pt-28 pb-12 px-4 sm:px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-[var(--green)] text-center mb-8">
            Outbreak Statistics Report
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-2xl font-semibold text-green-700 mb-4 text-center">
                Outbreak Distribution (2025)
              </h3>
              <div className="h-80">
                <Pie data={outbreakData} options={outbreakOptions} />
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-2xl font-semibold text-green-700 mb-6">
                Detailed Breakdown
              </h3>
              <div className="space-y-4">
                {stats.map((item) => (
                  <div key={item.label} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="font-medium text-gray-800">{item.label}</span>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-700">{item.value} cases</p>
                      <p className="text-sm text-gray-600">{item.percentage}% of total</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-center font-semibold text-green-800">
                  Total Outbreak Cases: <span className="text-2xl">{totalCases}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={() => navigate("/dashboard")} className="bg-gray-600 text-white px-8 py-3 rounded-xl hover:bg-gray-700 transition font-medium shadow-md">
              Back to Dashboard
            </button>
            <button onClick={handleDownload} className="bg-[var(--green)] text-white px-8 py-3 rounded-xl hover:bg-[var(--light-green)] hover:text-[var(--green)] transition font-medium shadow-md">
              Download Report
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}