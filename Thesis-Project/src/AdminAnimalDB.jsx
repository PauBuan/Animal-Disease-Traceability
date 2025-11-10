// src/pages/AdminAnimalDB.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { tableData } from "./data";

export default function AdminAnimalDB() {
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

  tableData.forEach(row => {
    totals.dita.healthy += row.dita.healthy;
    totals.dita.sick += row.dita.sick;
    totals.dita.quarantined += row.dita.quarantined;

    totals.pooc.healthy += row.pooc.healthy;
    totals.pooc.sick += row.pooc.sick;
    totals.pooc.quarantined += row.pooc.quarantined;

    totals.macabling.healthy += row.macabling.healthy;
    totals.macabling.sick += row.macabling.sick;
    totals.macabling.quarantined += row.macabling.quarantined;
  });

  totalAnimals = Object.values(totals).reduce((sum, b) => 
    sum + b.healthy + b.sick + b.quarantined, 0
  );
  totalSick = Object.values(totals).reduce((sum, b) => sum + b.sick, 0);
  totalQuarantined = Object.values(totals).reduce((sum, b) => sum + b.quarantined, 0);

  const handleDownload = () => {
    alert("Animal Database Report downloaded!");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="max-w-screen-2xl mx-auto">
        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-emerald-800">
            Animal Database
          </h1>
          <p className="text-gray-600 mt-2">
            Complete health status of all registered livestock in Santa Rosa City
          </p>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
                  <th rowSpan="2" className="p-5 font-bold text-left align-middle">Animal</th>
                  <th colSpan="3" className="p-5 font-bold text-center">Brgy. Dita</th>
                  <th colSpan="3" className="p-5 font-bold text-center">Brgy. Pooc</th>
                  <th colSpan="3" className="p-5 font-bold text-center">Brgy. Macabling</th>
                </tr>
                <tr className="bg-emerald-50 text-gray-800 border-b-2 border-emerald-200">
                  <th className="p-4 text-sm font-medium">Healthy</th>
                  <th className="p-4 text-sm font-medium text-red-600">Sick</th>
                  <th className="p-4 text-sm font-medium text-orange-600">Quarantined</th>
                  <th className="p-4 text-sm font-medium">Healthy</th>
                  <th className="p-4 text-sm font-medium text-red-600">Sick</th>
                  <th className="p-4 text-sm font-medium text-orange-600">Quarantined</th>
                  <th className="p-4 text-sm font-medium">Healthy</th>
                  <th className="p-4 text-sm font-medium text-red-600">Sick</th>
                  <th className="p-4 text-sm font-medium text-orange-600">Quarantined</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, idx) => (
                  <tr
                    key={row.animal}
                    className={`border-b border-gray-200 transition-all ${
                      idx % 2 === 0 ? "bg-white" : "bg-emerald-50"
                    } hover:bg-emerald-100`}
                  >
                    <td className="p-5 font-medium text-gray-800">{row.animal}</td>

                    <td className="p-4 text-center text-emerald-700">{row.dita.healthy}</td>
                    <td className="p-4 text-center text-red-600">{row.dita.sick}</td>
                    <td className="p-4 text-center text-orange-600">{row.dita.quarantined}</td>

                    <td className="p-4 text-center text-emerald-700">{row.pooc.healthy}</td>
                    <td className="p-4 text-center text-red-600">{row.pooc.sick}</td>
                    <td className="p-4 text-center text-orange-600">{row.pooc.quarantined}</td>

                    <td className="p-4 text-center text-emerald-700">{row.macabling.healthy}</td>
                    <td className="p-4 text-center text-red-600">{row.macabling.sick}</td>
                    <td className="p-4 text-center text-orange-600">{row.macabling.quarantined}</td>
                  </tr>
                ))}

                {/* TOTAL ROW */}
                <tr className="bg-gradient-to-r from-emerald-100 to-emerald-50 font-bold text-gray-800 border-t-4 border-emerald-300">
                  <td className="p-5 text-left">TOTAL</td>
                  <td className="p-4 text-center text-emerald-700">{totals.dita.healthy}</td>
                  <td className="p-4 text-center text-red-600">{totals.dita.sick}</td>
                  <td className="p-4 text-center text-orange-600">{totals.dita.quarantined}</td>
                  <td className="p-4 text-center text-emerald-700">{totals.pooc.healthy}</td>
                  <td className="p-4 text-center text-red-600">{totals.pooc.sick}</td>
                  <td className="p-4 text-center text-orange-600">{totals.pooc.quarantined}</td>
                  <td className="p-4 text-center text-emerald-700">{totals.macabling.healthy}</td>
                  <td className="p-4 text-center text-red-600">{totals.macabling.sick}</td>
                  <td className="p-4 text-center text-orange-600">{totals.macabling.quarantined}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary Stats */}
          <div className="p-8 bg-gradient-to-r from-emerald-50 to-white border-t border-emerald-200">
            <h3 className="text-2xl font-bold text-emerald-700 mb-6 text-center">
              Health Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white p-5 rounded-xl shadow-md border border-emerald-200 text-center">
                <p className="text-sm font-medium text-gray-700">Total Animals</p>
                <p className="text-3xl font-bold text-emerald-700 mt-1">{totalAnimals.toLocaleString()}</p>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-md border border-red-200 text-center">
                <p className="text-sm font-medium text-gray-700">Total Sick</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{totalSick}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {totalAnimals > 0 ? ((totalSick / totalAnimals) * 100).toFixed(2) : 0}% of population
                </p>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-md border border-orange-200 text-center">
                <p className="text-sm font-medium text-gray-700">Total Quarantined</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{totalQuarantined}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {totalAnimals > 0 ? ((totalQuarantined / totalAnimals) * 100).toFixed(2) : 0}% of population
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handleDownload}
            className="bg-emerald-600 text-white px-8 py-3 rounded-xl hover:bg-emerald-700 transition font-medium shadow-md"
          >
            Download Database
          </button>
        </div>
      </div>
    </div>
  );
}