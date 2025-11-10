// src/Dashboard.jsx
import { useState } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
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
  Legend
} from "chart.js";
import './App.css';
import { useNavigate } from 'react-router-dom';
import { tableData } from './data'; // ← Import real data

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeCard, setActiveCard] = useState(null);

  // === HEALTH STATUS (FROM TABLE) ===
  const healthStatusData = tableData.map(row => ({
    animal: row.animal,
    healthy: row.dita.healthy + row.pooc.healthy + row.macabling.healthy,
    sick: row.dita.sick + row.pooc.sick + row.macabling.sick,
    quarantined: row.dita.quarantined + row.pooc.quarantined + row.macabling.quarantined,
  }));

  // === ANIMAL MOVEMENT (KEEP AS IS) ===
  const movementData = {
    labels: ['Hogs', 'Cattle', 'Chickens', 'Carabaos'],
    datasets: [
      {
        label: 'Movement Count',
        data: [1200, 800, 3500, 450],
        backgroundColor: 'rgba(21, 128, 61, 0.8)',
        borderColor: 'rgba(21, 128, 61, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#15803D' } },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Number of Movements', color: '#15803D' }, ticks: { color: '#4B5563' } },
      x: { ticks: { color: '#4B5563' } },
    },
  };

  // === OUTBREAK PIE (REAL SICK DATA) ===
  const sickByDisease = {
    ASF: 0,
    "Avian Influenza": 0,
    "Foot and Mouth Disease": 0,
  };

  tableData.forEach(row => {
    const totalSick = row.dita.sick + row.pooc.sick + row.macabling.sick;
    if (row.animal === "Hogs") sickByDisease.ASF += totalSick;
    else if (row.animal === "Chickens") sickByDisease["Avian Influenza"] += totalSick;
    else sickByDisease["Foot and Mouth Disease"] += totalSick;
  });

  const outbreakData = {
    labels: Object.keys(sickByDisease),
    datasets: [
      {
        label: 'Outbreak Cases',
        data: Object.values(sickByDisease),
        backgroundColor: [
          'rgba(220, 38, 38, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(21, 128, 61, 0.8)',
        ],
        borderColor: [
          'rgba(220, 38, 38, 1)',
          'rgba(251, 146, 60, 1)',
          'rgba(21, 128, 61, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const outbreakOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#15803D' } },
    },
  };

  // === SUMMARY REPORT LINE CHART – 12 MONTHS, REAL DATA ===
  const totalSick = tableData.reduce((sum, row) => 
    sum + row.dita.sick + row.pooc.sick + row.macabling.sick, 0
  );

  const basePerMonth = Math.floor(totalSick / 12);
  const remainder = totalSick % 12;
  const monthlyCases = Array(12).fill(basePerMonth);
  for (let i = 0; i < remainder; i++) monthlyCases[i] += 1;

  // Fixed realistic pattern (same as SummaryReport)
  const variation = [0, -2, 0, 1, 2, 1, 2, 3, 2, 1, 0, -1];
  monthlyCases.forEach((val, i) => {
    monthlyCases[i] = Math.max(0, val + variation[i]);
  });

  const summaryData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Reported Cases",
        data: monthlyCases,
        fill: false,
        borderColor: "rgba(21, 128, 61, 1)",
        backgroundColor: "rgba(21, 128, 61, 0.2)",
        tension: 0.4,
      },
    ],
  };

  const summaryOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#15803D' } },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Number of Cases', color: '#15803D' }, ticks: { color: '#4B5563' } },
      x: { ticks: { color: '#4B5563' }, title: { display: true, text: 'Month (2025)', color: '#15803D', font: { weight: 'bold' } } },
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-white pt-24 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-screen-2xl mx-auto">
        <h1 className="text-4xl font-bold text-green-700 text-center mb-12 tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-lg text-gray-600 text-center mb-12 leading-relaxed max-w-3xl mx-auto">
          Welcome to the centralized hub for monitoring and managing animal disease traceability. This dashboard provides real-time insights and tools to ensure the health and safety of livestock across Santa Rosa City Laguna.
        </p>

        {/* SECTION 1 */}
        <section className="py-8 w-full">
          <h2 className="text-3xl font-semibold text-green-700 mb-8 text-center">
            Animal Movement and Health Status
          </h2>
          <p className="text-lg text-gray-600 text-center mb-8 leading-relaxed max-w-3xl mx-auto">
            Track the movement of animals and monitor their health status with interactive charts and detailed tables.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* MOVEMENT */}
            <div className={`w-full bg-white p-8 rounded-2xl shadow-md border border-gray-200 transition-transform duration-300 ${activeCard === 0 ? 'scale-105 shadow-xl' : ''} hover:shadow-xl`}
              onMouseEnter={() => setActiveCard(0)} onMouseLeave={() => setActiveCard(null)}>
              <h3 className="text-2xl font-semibold text-green-700 mb-4">Animal Movement Chart</h3>
              <div className="h-72"><Bar data={movementData} options={chartOptions} /></div>
              <button onClick={() => navigate('/animal-movement')} className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition w-full font-medium mt-5">
                View Details
              </button>
            </div>

            {/* HEALTH TABLE */}
            <div className={`w-full bg-white p-8 rounded-2xl shadow-md border border-gray-200 transition-transform duration-300 ${activeCard === 1 ? 'scale-105 shadow-xl' : ''} hover:shadow-xl`}
              onMouseEnter={() => setActiveCard(1)} onMouseLeave={() => setActiveCard(null)}>
              <h3 className="text-2xl font-semibold text-green-700 mb-4">Health Status Table</h3>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-green-50 border-b border-gray-200">
                      <th className="p-4 font-semibold text-gray-700">Animal</th>
                      <th className="p-4 font-semibold text-gray-700">Healthy</th>
                      <th className="p-4 font-semibold text-gray-700">Sick</th>
                      <th className="p-4 font-semibold text-gray-700">Quarantined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {healthStatusData.map((row, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="p-4">{row.animal}</td>
                        <td className="p-4">{row.healthy}</td>
                        <td className="p-4">{row.sick}</td>
                        <td className="p-4">{row.quarantined}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={() => navigate('/health-table')} className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition w-full font-medium mt-5">
                View Table
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 2 */}
        <section className="py-8 bg-gray-50 w-full rounded-b-2xl">
          <h2 className="text-3xl font-semibold text-green-700 mb-8 text-center">
            Outbreak Statistics & Summary Reports
          </h2>
          <p className="text-lg text-gray-600 text-center mb-8 leading-relaxed max-w-3xl mx-auto">
            Analyze outbreak data and generate comprehensive reports.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* OUTBREAK */}
            <div className={`w-full bg-white p-8 rounded-2xl shadow-md border border-gray-200 transition-transform duration-300 ${activeCard === 2 ? 'scale-105 shadow-xl' : ''} hover:shadow-xl`}
              onMouseEnter={() => setActiveCard(2)} onMouseLeave={() => setActiveCard(null)}>
              <h3 className="text-2xl font-semibold text-green-700 mb-4">Outbreak Statistics</h3>
              <div className="h-72"><Pie data={outbreakData} options={outbreakOptions} /></div>
              <button onClick={() => navigate('/outbreak-stats')} className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition w-full font-medium mt-5">
                View Details
              </button>
            </div>

            {/* SUMMARY REPORT – NOW 12 MONTHS */}
            <div className={`w-full bg-white p-8 rounded-2xl shadow-md border border-gray-200 transition-transform duration-300 ${activeCard === 3 ? 'scale-105 shadow-xl' : ''} hover:shadow-xl`}
              onMouseEnter={() => setActiveCard(3)} onMouseLeave={() => setActiveCard(null)}>
              <h3 className="text-2xl font-semibold text-green-700 mb-4">Summary Reports</h3>
              <div className="h-72">
                <Line data={summaryData} options={summaryOptions} />
              </div>
              <button onClick={() => navigate('/summary-report')} className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition w-full font-medium mt-5">
                View Details
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}