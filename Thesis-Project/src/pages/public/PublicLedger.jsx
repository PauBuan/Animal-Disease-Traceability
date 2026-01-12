// src/pages/TransactionsPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Mock data with new fields
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
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    username: "Lebron@farm.ph",
    animalID: "CH456",
    species: "Chicken",
    location: "Brgy. Macabling",
    healthStatus: "Healthy",
    timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
  },
  {
    username: "Charlie@farm.ph",
    animalID: "A789",
    species: "Hog",
    location: "Brgy. Dita",
    healthStatus: "Quarantined",
    timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), // 3 days ago
  },
  {
    username: "Susan@farm.ph",
    animalID: "CAR001",
    species: "Carabao",
    location: "Brgy. Pooc",
    healthStatus: "Healthy",
    timestamp: new Date(Date.now() - 4 * 86400000).toISOString(), // 4 days ago
  },
];

export default function TransactionsPage() {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    animalID: "",
    species: "",
    location: "",
    healthStatus: "",
  });

  // Load mock data with delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setTransactions(MOCK_TRANSACTIONS);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Mock submit – adds to history
  const handleSubmit = (e) => {
    e.preventDefault();

    const newTx = {
      ...formData,
      timestamp: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);

    alert("Transaction added successfully!");

    setFormData({
      username: "",
      animalID: "",
      species: "",
      location: "",
      healthStatus: "",
    });
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Format timestamp to readable string
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleString("en-US", options);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 py-12 px-4 sm:px-6 lg:px-12">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-emerald-800">
          Animal Health Transactions
        </h1>
        <p className="mt-3 text-lg text-emerald-600"></p>
      </header>

      <div className="max-w-7xl mx-auto grid gap-10 lg:grid-cols-2">
        {/* Form */}
        <section className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-emerald-100">
          <h2 className="text-2xl font-bold text-emerald-700 mb-6">
            Add New Record
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {[
              { name: "username", label: "Username (e.g., admin@farm.ph)" },
              { name: "animalID", label: "Animal ID (e.g., A001)" },
              { name: "species", label: "Species (e.g., Hog)" },
              { name: "location", label: "Location (Brgy.) (e.g., Brgy. Dita)" },
              { name: "healthStatus", label: "Health Status (e.g., Healthy)" },
            ].map((field) => (
              <div key={field.name} className="relative">
                <input
                  type="text"
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  placeholder=" "
                  required
                  className="peer w-full px-4 py-3 bg-transparent border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                />
                <label
                  className={`absolute left-4 -top-2.5 bg-white px-1 text-sm font-medium text-emerald-600 transition-all duration-200 transform origin-left ${
                    formData[field.name]
                      ? "scale-75 -translate-y-4"
                      : "scale-100 translate-y-3"
                  } peer-focus:scale-75 peer-focus:-translate-y-4`}
                >
                  {field.label}
                </label>
              </div>
            ))}

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 rounded-lg shadow-md transition transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Submit Transaction
            </button>
          </form>
        </section>

        {/* Transaction History */}
        <section className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-emerald-100">
          <h2 className="text-2xl font-bold text-emerald-700 mb-6">
            Transaction History
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-200 rounded animate-pulse"
                />
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
                      "Date & Time", // ← NEW HEADER
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-xs font-bold text-emerald-800 uppercase tracking-wider"
                      >
                        {h}
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
                      <td className="px-5 py-3 text-sm text-gray-900">
                        {tx.username}
                      </td>
                      <td className="px-5 py-3 text-sm text-emerald-700 font-medium">
                        {tx.animalID}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-900">
                        {tx.species}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-900">
                        {tx.location}
                      </td>
                      <td className="px-5 py-3">
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
                      {/* NEW TIME CELL */}
                      <td className="px-5 py-3 text-xs text-gray-600">
                        {formatDate(tx.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Back to Dashboard */}
      <div className="mt-12 text-center">
        <button
          onClick={() => navigate("/login")}
          className="bg-gray-600 text-white px-8 py-3 rounded-xl hover:bg-gray-700 transition font-medium shadow-md"
        >
          Log out
        </button>
      </div>
    </div>
  );
}