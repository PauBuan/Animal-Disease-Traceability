// src/AdminAnimalDB.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { tableData } from "../../config/data";

function SimpleBlockchainChain({ animalType }) {
  // === ENHANCED MOCK BLOCKCHAIN DATA ===
  // Keys now match EXACTLY with data.js: "Hogs", "Cattle", "Chickens", "Carabaos"
  const mockEvents = {
    Hogs: [
      {
        id: 1,
        animalID: "H001",
        status: "Healthy",
        location: "Brgy. Dita",
        farmer: "Juan Dela Cruz",
        timestamp: "2025-10-15T08:30:00Z",
        hash: "0xabc123def456...",
        txType: "Registration",
      },
      {
        id: 2,
        animalID: "H001",
        status: "Quarantined",
        location: "Brgy. Dita",
        farmer: "Juan Dela Cruz",
        timestamp: "2025-10-18T14:20:00Z",
        hash: "0xdef456ghi789...",
        txType: "Health Alert",
        note: "Suspected ASF symptoms",
      },
      {
        id: 3,
        animalID: "H001",
        status: "Healthy",
        location: "Brgy. Pooc",
        farmer: "Maria Santos",
        timestamp: "2025-11-01T09:15:00Z",
        hash: "0xghi789jkl012...",
        txType: "Transfer",
      },
      {
        id: 4,
        animalID: "H001",
        status: "Healthy",
        location: "Brgy. Pooc",
        farmer: "Maria Santos",
        timestamp: "2025-11-10T11:00:00Z",
        hash: "0xjkl012mno345...",
        txType: "Vaccination",
        vaccine: "ASF Vaccine Batch #2025-PH-001",
      },
    ],
    Cattle: [
      {
        id: 1,
        animalID: "C123",
        status: "Healthy",
        location: "Brgy. Pooc",
        farmer: "Pedro Reyes",
        timestamp: "2025-09-20T07:45:00Z",
        hash: "0xmno345pqr678...",
        txType: "Registration",
      },
      {
        id: 2,
        animalID: "C123",
        status: "Sick",
        location: "Brgy. Pooc",
        farmer: "Pedro Reyes",
        timestamp: "2025-10-05T13:10:00Z",
        hash: "0xpqr678stu901...",
        txType: "Health Report",
        note: "Fever, loss of appetite",
      },
      {
        id: 3,
        animalID: "C123",
        status: "Healthy",
        location: "Brgy. Macabling",
        farmer: "Ana Lim",
        timestamp: "2025-10-25T10:30:00Z",
        hash: "0xstu901vwx234...",
        txType: "Transfer",
      },
    ],
    Chickens: [
      {
        id: 1,
        animalID: "CH456",
        status: "Healthy",
        location: "Brgy. Macabling",
        farmer: "Lito Tan",
        timestamp: "2025-11-01T06:00:00Z",
        hash: "0xvwx234yza567...",
        txType: "Batch Registration",
        count: 850,
      },
      {
        id: 2,
        animalID: "CH456",
        status: "Healthy",
        location: "Brgy. Macabling",
        farmer: "Lito Tan",
        timestamp: "2025-11-08T07:20:00Z",
        hash: "0xyza567bcd890...",
        txType: "Vaccination",
        vaccine: "NDV + IB Vaccine",
        count: 850,
      },
    ],
    // FIXED: "Carabaos" (plural) to match data.js
    Carabaos: [
      {
        id: 1,
        animalID: "CAR001",
        status: "Healthy",
        location: "Brgy. Dita",
        farmer: "Ramon Cruz",
        timestamp: "2025-08-10T09:00:00Z",
        hash: "0xbcd890efg123...",
        txType: "Registration",
      },
      {
        id: 2,
        animalID: "CAR001",
        status: "Healthy",
        location: "Brgy. Pooc",
        farmer: "Susan Go",
        timestamp: "2025-09-05T10:15:00Z",
        hash: "0xefg123hij456...",
        txType: "Transfer",
      },
      {
        id: 3,
        animalID: "CAR001",
        status: "Sick",
        location: "Brgy. Pooc",
        farmer: "Susan Go",
        timestamp: "2025-10-12T11:30:00Z",
        hash: "0xhij456klm789...",
        txType: "Health Report",
        note: "Lameness, treated with antibiotics",
      },
      {
        id: 4,
        animalID: "CAR001",
        status: "Healthy",
        location: "Brgy. Macabling",
        farmer: "Jose Rizal",
        timestamp: "2025-11-07T08:45:00Z",
        hash: "0xklm789nop012...",
        txType: "Transfer & Recovery",
      },
    ],
  };

  const events = mockEvents[animalType] || [];

  if (events.length === 0) {
    return (
      <p className="text-gray-500 text-center">No blockchain records found.</p>
    );
  }

  // Helper: Format ISO → PH Time (GMT+8)
  const formatPHTime = (iso) => {
    const date = new Date(iso);
    return date.toLocaleString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="relative border-l-4 border-emerald-500 pl-8 space-y-8 py-4">
      {events.map((event, idx) => (
        <div key={event.id} className="relative">
          {/* Circle */}
          <div className="absolute -left-10 top-2 w-6 h-6 bg-emerald-600 rounded-full border-4 border-white shadow-lg"></div>

          {/* Block Card */}
          <div className="bg-gradient-to-r from-emerald-50 to-white p-5 rounded-xl shadow-md border border-emerald-200 hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-emerald-800">
                Block #{event.id} – {event.animalID || "Batch"}
              </h4>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
                {event.txType}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    event.status === "Healthy"
                      ? "bg-emerald-100 text-emerald-800"
                      : event.status === "Sick"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {event.status}
                </span>
              </p>
              <p>
                <strong>Location:</strong> {event.location}
              </p>
              {event.farmer && (
                <p>
                  <strong>Farmer:</strong> {event.farmer}
                </p>
              )}
              <p>
                <strong>Time:</strong> {formatPHTime(event.timestamp)}
              </p>
              {event.vaccine && (
                <p className="md:col-span-2">
                  <strong>Vaccine:</strong> {event.vaccine}
                  {event.count && ` (${event.count} heads)`}
                </p>
              )}
              {event.note && (
                <p className="md:col-span-2 text-orange-700 italic">
                  <strong>Note:</strong> {event.note}
                </p>
              )}
            </div>

            <p className="text-xs text-gray-500 font-mono mt-3 bg-gray-50 p-2 rounded border">
              Hash: {event.hash} (Verified on-chain)
            </p>
          </div>

          {/* Arrow */}
          {idx < events.length - 1 && (
            <div className="absolute left-[-34px] top-20 w-1 h-20 bg-emerald-500"></div>
          )}
        </div>
      ))}

      <div className="mt-8 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
        <p className="text-sm text-emerald-800 text-center font-medium">
          This animal's full history is permanently recorded on the blockchain.
          <br />
          <span className="text-xs">
            Any change would break the hash chain.
          </span>
        </p>
      </div>
    </div>
  );
}

// === Main AdminAnimalDB Component ===
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

  tableData.forEach((row) => {
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
    alert("Animal Database Report downloaded!");
  };

  // === BLOCKCHAIN MODAL STATE ===
  const [showChain, setShowChain] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);

  const openChain = (animal) => {
    setSelectedAnimal(animal);
    setShowChain(true);
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
            Complete health status of all registered livestock in Santa Rosa
            City
          </p>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
                  <th
                    rowSpan="2"
                    className="p-5 font-bold text-left align-middle w-32"
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
                  <th rowSpan="2" className="p-5 font-bold text-center w-28">
                    Blockchain
                  </th>
                </tr>
                <tr className="bg-emerald-50 text-gray-800 border-b-2 border-emerald-200">
                  <th className="p-4 text-sm font-medium">Healthy</th>
                  <th className="p-4 text-sm font-medium text-red-600">Sick</th>
                  <th className="p-4 text-sm font-medium text-orange-600">
                    Quarantined
                  </th>
                  <th className="p-4 text-sm font-medium">Healthy</th>
                  <th className="p-4 text-sm font-medium text-red-600">Sick</th>
                  <th className="p-4 text-sm font-medium text-orange-600">
                    Quarantined
                  </th>
                  <th className="p-4 text-sm font-medium">Healthy</th>
                  <th className="p-4 text-sm font-medium text-red-600">Sick</th>
                  <th className="p-4 text-sm font-medium text-orange-600">
                    Quarantined
                  </th>
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
                    <td className="p-5 font-medium text-gray-800">
                      {row.animal}
                    </td>

                    <td className="p-4 text-center text-emerald-700">
                      {row.dita.healthy}
                    </td>
                    <td className="p-4 text-center text-red-600">
                      {row.dita.sick}
                    </td>
                    <td className="p-4 text-center text-orange-600">
                      {row.dita.quarantined}
                    </td>

                    <td className="p-4 text-center text-emerald-700">
                      {row.pooc.healthy}
                    </td>
                    <td className="p-4 text-center text-red-600">
                      {row.pooc.sick}
                    </td>
                    <td className="p-4 text-center text-orange-600">
                      {row.pooc.quarantined}
                    </td>

                    <td className="p-4 text-center text-emerald-700">
                      {row.macabling.healthy}
                    </td>
                    <td className="p-4 text-center text-red-600">
                      {row.macabling.sick}
                    </td>
                    <td className="p-4 text-center text-orange-600">
                      {row.macabling.quarantined}
                    </td>

                    {/* BLOCKCHAIN BUTTON */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => openChain(row.animal)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition shadow"
                      >
                        View Chain
                      </button>
                    </td>
                  </tr>
                ))}

                {/* TOTAL ROW */}
                <tr className="bg-gradient-to-r from-emerald-100 to-emerald-50 font-bold text-gray-800 border-t-4 border-emerald-300">
                  <td className="p-5 text-left">TOTAL</td>
                  <td className="p-4 text-center text-emerald-700">
                    {totals.dita.healthy}
                  </td>
                  <td className="p-4 text-center text-red-600">
                    {totals.dita.sick}
                  </td>
                  <td className="p-4 text-center text-orange-600">
                    {totals.dita.quarantined}
                  </td>
                  <td className="p-4 text-center text-emerald-700">
                    {totals.pooc.healthy}
                  </td>
                  <td className="p-4 text-center text-red-600">
                    {totals.pooc.sick}
                  </td>
                  <td className="p-4 text-center text-orange-600">
                    {totals.pooc.quarantined}
                  </td>
                  <td className="p-4 text-center text-emerald-700">
                    {totals.macabling.healthy}
                  </td>
                  <td className="p-4 text-center text-red-600">
                    {totals.macabling.sick}
                  </td>
                  <td className="p-4 text-center text-orange-600">
                    {totals.macabling.quarantined}
                  </td>
                  <td className="p-4"></td>
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
                <p className="text-sm font-medium text-gray-700">
                  Total Animals
                </p>
                <p className="text-3xl font-bold text-emerald-700 mt-1">
                  {totalAnimals.toLocaleString()}
                </p>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-md border border-red-200 text-center">
                <p className="text-sm font-medium text-gray-700">Total Sick</p>
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

      {/* BLOCKCHAIN MODAL */}
      {showChain && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-emerald-800">
                Blockchain Trace: {selectedAnimal}
              </h3>
              <button
                onClick={() => setShowChain(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <SimpleBlockchainChain animalType={selectedAnimal} />
          </div>
        </div>
      )}
    </div>
  );
}
