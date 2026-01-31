// src/pages/vet/VetTransactionLogs.jsx
import { useState, useEffect } from "react";

export default function VetTransactionLogs() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [currentTx, setCurrentTx] = useState(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [severity, setSeverity] = useState("Ongoing");

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
    setSeverity("Ongoing");
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentTx(null);
    setDiagnosis("");
    setSeverity("Ongoing");
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
            severity: severity,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to submit diagnosis");

      const updatedTx = await res.json();

      setTransactions((prev) =>
        prev.map((tx) => (tx._id === updatedTx._id ? updatedTx : tx))
      );

      handleCloseModal();
      alert("Diagnosis submitted successfully!");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    return new Date(isoString).toLocaleString();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <h1 className="text-3xl font-bold text-emerald-800 mb-6 text-center">
        Veterinary Transaction Logs
      </h1>

      <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No active disease reports
          </div>
        ) : (
          <table className="min-w-full divide-y divide-emerald-100">
            <thead className="bg-emerald-50">
              <tr>
                {[
                  "Username",
                  "Full Name",
                  "Contact Number", 
                  "Species",
                  "Quantity",
                  "Location",
                  "Health Status",
                  "Diagnosed Disease",
                  "Severity", 
                  "Date & Time",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-xs font-bold text-center text-emerald-800 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, idx) => (
                <tr
                  key={tx._id}
                  className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  <td className="px-4 py-3 text-center text-sm">{tx.username}</td>
                  <td className="px-4 py-3 text-center text-sm">{tx.fullName}</td>
                  <td className="px-4 py-3 text-center text-sm">{tx.contactNumber}</td>
                  <td className="px-4 py-3 text-center text-sm">{tx.species}</td>
                  <td className="px-4 py-3 text-center text-sm">{tx.quantity}</td>
                  <td className="px-4 py-3 text-center text-sm">{tx.location}</td>
                  <td className="px-4 py-3 text-center text-sm">{tx.healthStatus}</td>
                  <td className="px-4 py-3 text-center text-sm">
                    {tx.diagnosedDisease || "-"}
                  </td>
                  <td className="px-4 py-3 text-center text-sm">
                    {tx.severity || "Ongoing"}
                  </td>
                  <td className="px-4 py-3 text-center text-xs">
                    {formatDate(tx.timestamp)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {tx.status === "Submitted to Admin" ? (
                      <span className="text-gray-400 text-sm">Submitted</span>
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

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">Diagnosis</h2>

            <textarea
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full border rounded-lg p-3 mb-3"
              rows={4}
              placeholder="Type diagnosed disease..."
            />

            <label className="block text-sm font-semibold mb-1">
              Severity Level
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 mb-4"
            >
              <option value="Ongoing" disabled>
                Select severity
              </option>
              <option value="safe">Safe</option>
              <option value="mild">Mild</option>
              <option value="dangerous">Dangerous</option>
            </select>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitDiagnosis}
                className="px-4 py-2 bg-green-600 text-white rounded-lg"
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
