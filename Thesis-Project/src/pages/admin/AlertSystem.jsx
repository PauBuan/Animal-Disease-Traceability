import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminAlert() {
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [targetBarangay, setTargetBarangay] = useState("All");
  const [isSending, setIsSending] = useState(false);

  const VALID_BARANGAYS = [
    "All", "Aplaya", "Balibago", "Caingin", "Dila", "Dita", "Don Jose", "Ibaba",
    "Kanluran", "Labas", "Macabling", "Malitlit", "Malusak", "Market Area",
    "Pooc", "Pulong Santa Cruz", "Santo Domingo", "Sinalhan", "Tagapo"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      alert("Please enter an alert message.");
      return;
    }

    const confirmBroadcast = window.confirm(
      `Are you sure you want to send this broadcast to ${
        targetBarangay === "All" ? "ALL registered users" : "Barangay " + targetBarangay
      }?`
    );
    if (!confirmBroadcast) return;

    setIsSending(true);

    try {
      const response = await fetch("http://localhost:3001/api/send-alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: description,
          targetBarangay: targetBarangay,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ Success! Alert broadcasted to ${data.count} users.`);
        setDescription("");
        setTargetBarangay("All");
      } else {
        alert(`❌ Error: ${data.error || "Failed to send alert"}`);
      }
    } catch (err) {
      console.error("Alert Error:", err);
      alert("Could not connect to the server. Please check if the backend is running.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl">
        {/* Alert Form Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-rose-200/40 overflow-hidden">
          <div className="bg-gradient-to-r from-rose-600/5 to-red-600/5 px-8 py-6 border-b border-rose-100">
            <h2 className="text-5xl font-bold text-rose-900 text-center flex items-center justify-center gap-3">
              <span className="text-4xl">🚨</span> Broadcast Alert
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-8 lg:p-10 space-y-8">
            
            {/* Barangay Filter Dropdown */}
            <div className="relative">
              <label className="block text-sm font-bold text-rose-800 mb-2 uppercase tracking-wide">
                Target Barangay
              </label>
              <select
                value={targetBarangay}
                onChange={(e) => setTargetBarangay(e.target.value)}
                className="w-full px-5 py-4 bg-white border border-rose-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-400 transition text-slate-900 shadow-sm hover:border-rose-300 appearance-none"
              >
                {VALID_BARANGAYS.map((brgy) => (
                  <option key={brgy} value={brgy}>
                    {brgy === "All" ? "Broadcast to All Barangays" : `Brgy. ${brgy}`}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-rose-600">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Alert Message */}
            <div className="relative">
              <label
                htmlFor="description"
                className="block text-sm font-bold text-rose-800 mb-2 uppercase tracking-wide"
              >
                Alert Description
              </label>
              <textarea
                id="description"
                name="description"
                rows="7"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter message (e.g., 'Health quarantine active in Brgy. Dita...')"
                className="w-full px-5 py-4 border border-rose-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-400 transition resize-none bg-white/80 text-slate-900 shadow-sm hover:border-rose-300"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex flex-col gap-4 items-center pt-4">
              <button
                type="submit"
                disabled={isSending}
                className={`w-full max-w-xs font-black py-4 px-8 rounded-2xl shadow-xl transition-all transform active:scale-95 text-white text-lg
                  ${isSending 
                    ? "bg-rose-400 cursor-not-allowed" 
                    : "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 hover:shadow-2xl hover:scale-[1.02]"
                  }`}
              >
                {isSending ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  "Send Broadcast"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}