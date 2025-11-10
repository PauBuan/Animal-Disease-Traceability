// src/AdminAlert.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminAlert() {
  const navigate = useNavigate();
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) {
      alert("Please enter an alert message.");
      return;
    }

    // Simulate sending alert
    console.log("Alert sent:", description);
    alert("Alert sent successfully to farmers, stakeholders, and relevant parties!");

    // Reset form
    setDescription("");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="max-w-3xl mx-auto">
        {/* Title & Description */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-emerald-800 mb-3">
            Send Alert
          </h1>
          <p className="text-gray-600 text-lg">
            The alert will be sent to <strong>farmers, stakeholders, local officials, and relevant parties</strong> in Santa Rosa, Laguna.
          </p>
        </div>

        {/* Alert Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Alert Description
              </label>
              <textarea
                id="description"
                name="description"
                rows="6"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter your alert message here... (e.g., 'Avian Influenza detected in Brgy. Dita. Avoid movement of poultry.')"
                className="w-full px-4 py-3 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition resize-none"
                required
              />
            </div>

            <div className="flex gap-4 justify-center">
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-xl shadow-md transition transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Send Alert
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}