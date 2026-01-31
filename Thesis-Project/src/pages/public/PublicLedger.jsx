// src/pages/public/PublicLedger.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PublicLedger() {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    contactNumber: "",
    species: "",
    quantity: "",
    healthStatus: "",
    location: "",
  });

  // Fetch transactions on page load
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const loggedInUser = localStorage.getItem("username");
        if (!loggedInUser) return;

        setUsername(loggedInUser);

        const res = await fetch(`http://localhost:3001/api/transactions/${loggedInUser}`);
        const data = await res.json();
        setTransactions(data || []);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    // Prefill fullName & contactNumber
    const fullName = localStorage.getItem("fullName") || "";
    const contactNumber = localStorage.getItem("contactNumber") || "";

    setFormData((prev) => ({
      ...prev,
      fullName,
      contactNumber,
    }));

    fetchTransactions();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username) return alert("No user logged in");

    const newTx = {
      status: "Submitted to Vet",
      severity: "Ongoing",
      username,
      ...formData,
      quantity: Number(formData.quantity),
      timestamp: new Date().toISOString(),
      blockchainTxId: null,
    };

    try {
      const response = await fetch("http://localhost:3001/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTx),
      });
      if (!response.ok) throw new Error("Failed to save transaction");

      const savedTx = await response.json();
      setTransactions((prev) => [savedTx, ...prev]);
      alert("Record added successfully!");

      setFormData({
        fullName: formData.fullName,
        contactNumber: formData.contactNumber,
        species: "",
        quantity: "",
        healthStatus: "",
        location: "",
      });
    } catch (err) {
      alert("Error adding transaction: " + err.message);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 py-12 px-4 sm:px-6 lg:px-12">
      <header className="max-w-7xl mx-auto mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-emerald-800">
          Animal Health Records
        </h1>
        <p className="mt-3 text-lg text-emerald-600">
          Livestock monitoring and health documentation
        </p>
      </header>

      <div className="max-w-7xl mx-auto grid gap-10 lg:grid-cols-2">
        {/* Form */}
        <section className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-emerald-100">
          <h2 className="text-2xl font-bold text-emerald-700 mb-6">
            Add New Record
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {[ // form fields
              { name: "fullName", label: "Full Name", type: "text" },
              { name: "contactNumber", label: "Contact Number", type: "text" },
              { name: "species", label: "Species (Ex. Hog, Chicken, etc.)", type: "text" },
              { name: "quantity", label: "Quantity", type: "number" },
              {
                name: "healthStatus",
                label: "Health Status (Detailed Description)",
                type: "textarea",
              },
            ].map((field) => (
              <div key={field.name} className="relative">
                {field.type === "textarea" ? (
                  <textarea
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder=" "
                    rows={4}
                    required
                    className="peer w-full px-4 py-3 bg-transparent border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition resize-none"
                  />
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder=" "
                    required
                    maxLength={field.name === "contactNumber" ? 11 : undefined}
                    pattern={field.name === "contactNumber" ? "\\d{11}" : undefined}
                    title={field.name === "contactNumber" ? "Must be exactly 11 digits" : undefined}
                    className="peer w-full px-4 py-3 bg-transparent border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                )}
                <label
                  className={`absolute left-4 -top-2.5 bg-white px-1 text-sm font-medium text-emerald-600 transition-all ${
                    formData[field.name] ? "scale-75 -translate-y-4" : "scale-100 translate-y-3"
                  } peer-focus:scale-75 peer-focus:-translate-y-4`}
                >
                  {field.label}
                </label>
              </div>
            ))}
            <div className="relative">
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="peer w-full px-4 py-3 bg-transparent border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              >
                <option value="" disabled>
              
                </option>
                {[
                  "Brgy Aplaya",
                  "Brgy Balibago",
                  "Brgy Caingin",
                  "Brgy Dila",
                  "Brgy Dita",
                  "Brgy Don Jose",
                  "Brgy Ibaba",
                  "Brgy Kanluran",
                  "Brgy Labas",
                  "Brgy Macabling",
                  "Brgy Malitlit",
                  "Brgy Malusak",
                  "Brgy Market Area",
                  "Brgy Pooc",
                  "Brgy Pulong Santa Cruz",
                  "Brgy Santo Domingo",
                  "Brgy Sinalhan",
                  "Brgy Tagapo",
                ].map((brgy) => (
                  <option key={brgy} value={brgy}>
                    {brgy}
                  </option>
                ))}
              </select>
              <label
                className={`absolute left-4 -top-2.5 bg-white px-1 text-sm font-medium text-emerald-600 transition-all ${
                  formData.location ? "scale-75 -translate-y-4" : "scale-100 translate-y-3"
                } peer-focus:scale-75 peer-focus:-translate-y-4`}
              >
                Location
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 rounded-lg shadow-md transition"
            >
              Save Record
            </button>
          </form>
        </section>

        {/* Transaction History */}
        <section className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-emerald-100">
          <h2 className="text-2xl font-bold text-emerald-700 mb-6">
            Record History
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-center text-gray-500">No records found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-max w-full divide-y divide-emerald-100">
                <thead className="bg-emerald-50">
                  <tr>
                    {[
                      "Status",
                      "Severity", 
                      "Full Name",
                      "Species",
                      "Quantity",
                      "Location",
                      "Health Status (Description)",
                      "Date & Time",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-xs font-bold text-emerald-800 uppercase tracking-wider whitespace-nowrap"
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
                      <td className="px-5 py-3 text-center">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            tx.status === "Submitted to Vet"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {tx.status || "Submitted to Vet"}
                        </span>
                      </td>

                      <td className="px-5 py-3 text-center">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            tx.severity === "safe"
                              ? "bg-green-100 text-green-800"
                              : tx.severity === "mild"
                              ? "bg-yellow-100 text-yellow-800"
                              : tx.severity === "dangerous"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {tx.severity || "Ongoing"} 
                        </span>
                      </td>

                      <td className="px-5 py-3 text-sm whitespace-nowrap">{tx.fullName}</td>
                      <td className="px-5 py-3 text-sm whitespace-nowrap">{tx.species}</td>
                      <td className="px-5 py-3 text-sm font-medium text-emerald-700 whitespace-nowrap">{tx.quantity}</td>
                      <td className="px-5 py-3 text-sm whitespace-nowrap">{tx.location}</td>
                      <td className="px-5 py-3 text-sm text-gray-700 whitespace-nowrap">{tx.healthStatus}</td>
                      <td className="px-5 py-3 text-xs text-gray-600 whitespace-nowrap">{formatDate(tx.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

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
