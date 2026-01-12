// src/AdminTransaction.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, subDays } from "date-fns";

/* -------------------------------------------------
   HARD-CODED MOCK DATA – same as TransactionsPage.jsx
   ------------------------------------------------- */
const MOCK_TRANSACTIONS = [
  {
    username: "Epoy@farm.ph",
    animalID: "A001",
    species: "Hog",
    location: "Brgy. Dita",
    healthStatus: "Healthy",
    timestamp: new Date().toISOString(),
  },
  {
    username: "Junnie@farm.ph",
    animalID: "C123",
    species: "Cattle",
    location: "Brgy. Pooc",
    healthStatus: "Sick",
    timestamp: subDays(new Date(), 1).toISOString(),
  },
  {
    username: "Lebron@farm.ph",
    animalID: "CH456",
    species: "Chicken",
    location: "Brgy. Macabling",
    healthStatus: "Healthy",
    timestamp: subDays(new Date(), 2).toISOString(),
  },
  {
    username: "Charlie@farm.ph",
    animalID: "A789",
    species: "Hog",
    location: "Brgy. Dita",
    healthStatus: "Quarantined",
    timestamp: subDays(new Date(), 3).toISOString(),
  },
  {
    username: "Susan@farm.ph",
    animalID: "CAR001",
    species: "Carabao",
    location: "Brgy. Pooc",
    healthStatus: "Healthy",
    timestamp: subDays(new Date(), 4).toISOString(),
  },
];

export default function AdminTransaction() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTransactions(MOCK_TRANSACTIONS);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleDownload = () => {
    alert("Transaction data downloaded! (CSV export coming soon)");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-emerald-800">
            Transaction History
          </h1>
          <p className="text-gray-600 mt-2">
            All animal health records submitted by users
          </p>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-emerald-100">
                <thead className="bg-emerald-50">
                  <tr>
                    {[
                      "Username",
                      "Animal ID",
                      "Species",
                      "Location (Brgy.)",
                      "Health Status",
                      "Date & Time",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-5 py-3 text-center text-xs font-bold text-emerald-800 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((tx, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                    >
                      <td className="px-5 py-3 text-sm text-gray-900 text-center">
                        {tx.username}
                      </td>
                      <td className="px-5 py-3 text-sm text-emerald-700 font-medium text-center">
                        {tx.animalID}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-900 text-center">
                        {tx.species}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-900 text-center">
                        {tx.location}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            tx.healthStatus === "Healthy"
                              ? "bg-emerald-100 text-emerald-800"
                              : tx.healthStatus === "Sick"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {tx.healthStatus}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-600 text-center">
                        {format(new Date(tx.timestamp), "PPp")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={handleDownload}
            className="bg-emerald-600 text-white px-8 py-3 rounded-xl hover:bg-emerald-700 transition font-medium shadow-md"
          >
            Download Transaction Data
          </button>
        </div>
      </div>
    </div>
  );
}