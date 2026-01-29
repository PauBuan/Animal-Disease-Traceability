// src/pages/vet/VetTransactionLogs.jsx
import { useState, useEffect } from "react";
import { format } from "date-fns";

export default function VetTransactionLogs() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [currentTx, setCurrentTx] = useState(null);
  const [diagnosis, setDiagnosis] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/transactions");
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (tx) => {
    setCurrentTx(tx);
    setDiagnosis("");
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentTx(null);
    setDiagnosis("");
  };

  const handleSubmitDiagnosis = async () => {
    if (!diagnosis) return alert("Please type the diagnosed disease.");

    try {
      const res = await fetch(
        `http://localhost:3001/api/transactions/${currentTx._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "Submitted to Admin",
            diagnosedDisease: diagnosis,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to submit diagnosis");

      const updatedTx = await res.json();

      // Update the transaction list locally
      setTransactions((prev) =>
        prev.map((tx) => (tx._id === updatedTx._id ? updatedTx : tx))
      );

      handleCloseModal();
      alert("Diagnosis submitted to admin successfully!");
    } catch (err) {
      alert("Error: " + err.message);
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
    <div className="p-6 bg-gray-50 min-h-full">
      <h1 className="text-3xl font-bold text-emerald-800 mb-6 text-center">
        Veterinary Transaction Logs
      </h1>

      <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 overflow-x-auto">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No active disease reports
          </div>
        ) : (
          <table className="min-w-full divide-y divide-emerald-100">
            <thead className="bg-emerald-50">
              <tr>
                {[
                  "Status",
                  "Username",
                  "Full Name",
                  "Species",
                  "Quantity",
                  "Location",
                  "Health Status",
                  "Diagnosed Disease",
                  "Date & Time",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-center text-xs font-bold text-emerald-800 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.map((tx, idx) => (
                <tr
                  key={tx._id}
                  className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  <td className="px-5 py-3 text-sm text-center">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        tx.status === "Submitted to Admin"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {tx.status || "Ongoing"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-center">{tx.username}</td>
                  <td className="px-5 py-3 text-sm text-center">{tx.fullName}</td>
                  <td className="px-5 py-3 text-sm text-center">{tx.species}</td>
                  <td className="px-5 py-3 text-sm text-center">{tx.quantity}</td>
                  <td className="px-5 py-3 text-sm text-center">{tx.location}</td>
                  <td className="px-5 py-3 text-center">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        tx.healthStatus.toLowerCase().includes("healthy")
                          ? "bg-emerald-100 text-emerald-800"
                          : tx.healthStatus.toLowerCase().includes("sick")
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {tx.healthStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-center">
                    {tx.diagnosedDisease || "-"}
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-600 text-center">
                    {formatDate(tx.timestamp)}
                  </td>
                  <td className="px-5 py-3 text-center">
                    {tx.status === "Submitted to Admin" ? (
                      <span className="text-gray-500 text-sm">Submitted</span>
                    ) : (
                      <button
                        onClick={() => handleOpenModal(tx)}
                        className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700"
                      >
                        Diagnose
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Diagnostic Disease
            </h2>
            <textarea
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Type diagnosed disease here..."
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 resize-none"
              rows={4}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitDiagnosis}
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
