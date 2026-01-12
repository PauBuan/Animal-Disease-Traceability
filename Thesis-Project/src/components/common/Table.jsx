// src/Table.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { tableData } from "../../config/data";

export default function Table() {
  const navigate = useNavigate();

  // === CALCULATE STATS ===
  const totals = {
    dita: { healthy: 0, sick: 0, quarantined: 0 },
    pooc: { healthy: 0, sick: 0, quarantined: 0 },
    macabling: { healthy: 0, sick: 0, quarantined: 0 },
  };

  let totalAnimals = 0;
  let totalSick = 0;
  let totalQuarantined = 0;

  tableData.forEach((row) => {
    // Dita
    totals.dita.healthy += row.dita.healthy;
    totals.dita.sick += row.dita.sick;
    totals.dita.quarantined += row.dita.quarantined;

    // Pooc
    totals.pooc.healthy += row.pooc.healthy;
    totals.pooc.sick += row.pooc.sick;
    totals.pooc.quarantined += row.pooc.quarantined;

    // Macabling
    totals.macabling.healthy += row.macabling.healthy;
    totals.macabling.sick += row.macabling.sick;
    totals.macabling.quarantined += row.macabling.quarantined;
  });

  totalAnimals = Object.values(totals).reduce(
    (sum, b) => sum + b.healthy + b.sick + b.quarantined,
    0
  );
  totalSick = Object.values(totals).reduce((sum, b) => sum + b.sick, 0);
  totalQuarantined = Object.values(totals).reduce(
    (sum, b) => sum + b.quarantined,
    0
  );

  const handleDownload = () => {
    alert("Animal Health Report downloaded!");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* HEADER */}
      <header className="bg-[var(--green)] text-white shadow-xl fixed top-0 left-0 right-0 z-50">
        <div className="px-6 lg:px-16 py-5 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Animal Disease Traceability
          </h1>
          <nav className="flex space-x-8 text-lg font-medium">
            <a href="/" className="hover:text-[var(--light-green)] transition">
              Home
            </a>
            <a
              href="/dashboard"
              className="hover:text-[var(--light-green)] transition"
            >
              Dashboards
            </a>
            <a
              href="/login"
              className="hover:text-[var(--light-green)] transition"
            >
              Login
            </a>
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow pt-32 pb-16 px-4 sm:px-8 lg:px-16">
        <div className="max-w-screen-2xl mx-auto">
          {/* TITLE */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[var(--green)] mb-4">
              Animal Health Status by Barangay
            </h2>
            <p className="text-lg text-gray-700 max-w-4xl mx-auto">
              Detailed breakdown across Brgy. Dita, Brgy. Pooc, and Brgy.
              Macabling.
            </p>
          </div>

          {/* TABLE CARD */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse">
                <thead>
                  {/* ROW 1: BARANGAY NAMES */}
                  <tr className="bg-gradient-to-r from-[var(--green)] to-green-700 text-white">
                    <th
                      rowSpan="2"
                      className="p-5 font-bold text-left align-middle"
                    >
                      Animal
                    </th>
                    <th colSpan="3" className="p-5 font-bold text-center">
                      Brgy. Dita
                    </th>
                    <th colSpan="3" className="p-5 font-bold text-center">
                      Brgy. Pooc
                    </th>
                    <th colSpan="3" className="p-5 font-bold text-center">
                      Brgy. Macabling
                    </th>
                  </tr>

                  {/* ROW 2: STATUS */}
                  <tr className="bg-green-50 text-gray-800 border-b-2 border-green-200">
                    <th className="p-4 text-sm font-medium">Healthy</th>
                    <th className="p-4 text-sm font-medium text-red-600">
                      Sick
                    </th>
                    <th className="p-4 text-sm font-medium text-orange-600">
                      Quarantined
                    </th>

                    <th className="p-4 text-sm font-medium">Healthy</th>
                    <th className="p-4 text-sm font-medium text-red-600">
                      Sick
                    </th>
                    <th className="p-4 text-sm font-medium text-orange-600">
                      Quarantined
                    </th>

                    <th className="p-4 text-sm font-medium">Healthy</th>
                    <th className="p-4 text-sm font-medium text-red-600">
                      Sick
                    </th>
                    <th className="p-4 text-sm font-medium text-orange-600">
                      Quarantined
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {tableData.map((row, idx) => (
                    <tr
                      key={row.animal}
                      className={`border-b border-gray-200 transition-all duration-200 ${
                        idx % 2 === 0 ? "bg-white" : "bg-green-50"
                      } hover:bg-green-100 hover:shadow-md`}
                    >
                      <td className="p-5 font-medium text-gray-800">
                        {row.animal}
                      </td>

                      {/* DITA */}
                      <td className="p-4 text-center text-green-700">
                        {row.dita.healthy}
                      </td>
                      <td className="p-4 text-center text-red-600">
                        {row.dita.sick}
                      </td>
                      <td className="p-4 text-center text-orange-600">
                        {row.dita.quarantined}
                      </td>

                      {/* POOC */}
                      <td className="p-4 text-center text-green-700">
                        {row.pooc.healthy}
                      </td>
                      <td className="p-4 text-center text-red-600">
                        {row.pooc.sick}
                      </td>
                      <td className="p-4 text-center text-orange-600">
                        {row.pooc.quarantined}
                      </td>

                      {/* MACABLING */}
                      <td className="p-4 text-center text-green-700">
                        {row.macabling.healthy}
                      </td>
                      <td className="p-4 text-center text-red-600">
                        {row.macabling.sick}
                      </td>
                      <td className="p-4 text-center text-orange-600">
                        {row.macabling.quarantined}
                      </td>
                    </tr>
                  ))}

                  {/* === DESCRIPTIVE STATS ROW === */}
                  <tr className="bg-gradient-to-r from-green-100 to-green-50 font-bold text-gray-800 border-t-4 border-green-300">
                    <td className="p-5 text-left">TOTAL</td>

                    {/* DITA */}
                    <td className="p-4 text-center text-green-700">
                      {totals.dita.healthy}
                    </td>
                    <td className="p-4 text-center text-red-600">
                      {totals.dita.sick}
                    </td>
                    <td className="p-4 text-center text-orange-600">
                      {totals.dita.quarantined}
                    </td>

                    {/* POOC */}
                    <td className="p-4 text-center text-green-700">
                      {totals.pooc.healthy}
                    </td>
                    <td className="p-4 text-center text-red-600">
                      {totals.pooc.sick}
                    </td>
                    <td className="p-4 text-center text-orange-600">
                      {totals.pooc.quarantined}
                    </td>

                    {/* MACABLING */}
                    <td className="p-4 text-center text-green-700">
                      {totals.macabling.healthy}
                    </td>
                    <td className="p-4 text-center text-red-600">
                      {totals.macabling.sick}
                    </td>
                    <td className="p-4 text-center text-orange-600">
                      {totals.macabling.quarantined}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* === SUMMARY STATS BELOW TABLE === */}
            <div className="p-8 bg-gradient-to-r from-green-50 to-white border-t border-green-200">
              <h3 className="text-2xl font-bold text-green-700 mb-6 text-center">
                Health Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="bg-white p-5 rounded-xl shadow-md border border-green-200 text-center">
                  <p className="text-sm font-medium text-gray-700">
                    Total Animals
                  </p>
                  <p className="text-3xl font-bold text-green-700 mt-1">
                    {totalAnimals.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-md border border-red-200 text-center">
                  <p className="text-sm font-medium text-gray-700">
                    Total Sick
                  </p>
                  <p className="text-3xl font-bold text-red-600 mt-1">
                    {totalSick}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {totalAnimals > 0
                      ? ((totalSick / totalAnimals) * 100).toFixed(2)
                      : 0}
                    % of population
                  </p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-md border border-orange-200 text-center">
                  <p className="text-sm font-medium text-gray-700">
                    Total Quarantined
                  </p>
                  <p className="text-3xl font-bold text-orange-600 mt-1">
                    {totalQuarantined}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {totalAnimals > 0
                      ? ((totalQuarantined / totalAnimals) * 100).toFixed(2)
                      : 0}
                    % of population
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 bg-gray-600 text-white px-8 py-3 rounded-xl text-base font-medium shadow-md hover:bg-gray-700 transform hover:scale-105 transition-all duration-300"
            >
              Back to Dashboard
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 bg-[var(--green)] text-white px-8 py-3 rounded-xl text-base font-medium shadow-md hover:bg-[var(--light-green)] hover:text-[var(--green)] transform hover:scale-105 transition-all duration-300"
            >
              Download Report
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
