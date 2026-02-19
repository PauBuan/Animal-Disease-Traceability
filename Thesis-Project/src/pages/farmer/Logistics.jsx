import { useState, useEffect, useRef } from "react";

export default function Logistics() {
  const [animals, setAnimals] = useState([]);
  const [activeTab, setActiveTab] = useState("apply");
  const [outgoing, setOutgoing] = useState([]);
  const [incoming, setIncoming] = useState([]);

  // FILE UPLOAD STATE
  const fileInputRef = useRef(null);
  const [uploadingId, setUploadingId] = useState(null);

  // Form State
  const [selectedBatch, setSelectedBatch] = useState("");
  const [formData, setFormData] = useState({
    destinationType: "Internal",
    receiverUsername: "",
    receiverName: "",
    receiverAddress: "",
    purpose: "Sales",
    transportDate: "",
  });
  

  const currentUser = localStorage.getItem("username");

  // Helper to get "Tomorrow" in YYYY-MM-DD format
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1); // Give Vet 24hr buffer
    return tomorrow.toISOString().split("T")[0];
  };

  useEffect(() => {
    fetchInventory();
    fetchMovements();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await fetch(
        `http://localhost:3001/api/transactions/${currentUser}`,
      );
      const data = await res.json();
      setAnimals(data || []);
    } catch (err) {
      console.error("Inventory Error");
    }
  };

  const fetchMovements = async () => {
    try {
      const res = await fetch(
        `http://localhost:3001/api/transfers/${currentUser}`,
      );
      const data = await res.json();
      const out = data.filter((r) => r.farmerUsername === currentUser);
      const inc = data.filter((r) => r.receiverUsername === currentUser);
      setOutgoing(out);
      setIncoming(inc);
    } catch (err) {
      console.error("History Error");
    }
  };

  const triggerFileUpload = (requestId) => {
    setUploadingId(requestId);
    fileInputRef.current.click(); // Opens the system file dialog
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !uploadingId) return;

    // SIMULATION: Use the filename as the "URL".
    // In a real app, you would FormData.append('file', file) and POST to a storage server.
    const fakeUrl = `http://cloud-storage.com/uploads/${encodeURIComponent(file.name)}`;

    try {
      const res = await fetch(
        "http://localhost:3001/api/transfers/upload-proof",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requestId: uploadingId, proofUrl: fakeUrl }),
        },
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Upload failed");
      }

      alert(`File "${file.name}" uploaded successfully! Sent to Regulator.`);
      fetchMovements(); // Refresh UI
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      // Reset
      setUploadingId(null);
      e.target.value = null; // Allow selecting the same file again
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBatch) return alert("Please select an animal batch");

    const payload = {
      batchId: selectedBatch,
      farmerUsername: currentUser,
      destinationType: formData.destinationType,
      receiverUsername:
        formData.destinationType === "Internal"
          ? formData.receiverUsername
          : null,
      receiverDetails:
        formData.destinationType !== "Internal"
          ? { name: formData.receiverName, address: formData.receiverAddress }
          : null,
      purpose: formData.purpose,
      transportDate: formData.transportDate,
    };

    try {
      const res = await fetch("http://localhost:3001/api/transfers/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to submit");
      }

      alert("Transport Request Submitted!");
      setActiveTab("outgoing");
      fetchMovements();
    } catch (err) {
      alert("Submission Error: " + err.message);
    }
  };

  const handleReceive = async (requestId) => {
    if (
      !confirm(
        "Confirm receipt? This will transfer ownership on the Blockchain.",
      )
    )
      return;

    try {
      const res = await fetch(
        "http://localhost:3001/api/transfers/receiver-confirm",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requestId, userMsp: "FarmerMSP" }),
        },
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to receive");
      }

      alert("Transfer Successful! Animal is now in your inventory.");
      fetchMovements();
      fetchInventory();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const StatusBadge = ({ status }) => {
    let color = "bg-slate-100 text-slate-600 border-slate-200";
    if (status === "Pending Vet Review")
      color = "bg-amber-100 text-amber-700 border-amber-200";
    if (status === "Approved (VHC Issued)")
      color = "bg-blue-100 text-blue-700 border-blue-200 animate-pulse";
    if (status.includes("Completed"))
      color = "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (status === "Rejected") color = "bg-red-100 text-red-700 border-red-200";

    return (
      <span
        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${color}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="p-8 lg:p-12 max-w-6xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-slate-800">
          Logistics & Movement
        </h1>
        <p className="text-slate-500 font-medium mt-2">
          Manage asset transfers, VHCs, and receipts.
        </p>
      </header>

      {/* --- HIDDEN FILE INPUT --- */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,.pdf"
      />

      <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-2xl w-fit border border-slate-200 shadow-sm">
        <button
          onClick={() => setActiveTab("apply")}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "apply" ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}
        >
          📤 New Request
        </button>
        <button
          onClick={() => setActiveTab("outgoing")}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "outgoing" ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}
        >
          🛫 Outgoing ({outgoing.length})
        </button>
        <button
          onClick={() => setActiveTab("incoming")}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "incoming" ? "bg-emerald-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}
        >
          🛬 Incoming (
          {incoming.filter((i) => i.status === "Approved (VHC Issued)").length})
        </button>
      </div>

      {activeTab === "apply" && (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 max-w-3xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                Select Asset
              </label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="w-full p-4 border border-slate-200 rounded-2xl bg-white text-slate-700 font-bold outline-none"
              >
                <option value="">-- Choose Animal --</option>
                {animals.map((a) => (
                  <option
                    key={a.batchId}
                    value={a.batchId}
                    disabled={
                      a.severity !== "safe" || a.status === "Pending Transfer"
                    }
                  >
                    [{a.batchId}] {a.species} ({a.quantity}) -{" "}
                    {a.status === "Pending Transfer"
                      ? "🔒 Pending Transfer"
                      : a.severity === "safe"
                        ? "✅ Ready"
                        : a.severity === "Ongoing"
                          ? "⏳ Unverified" // NEW LABEL
                          : "⛔ Sick"}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Destination Type
                </label>
                <select
                  value={formData.destinationType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      destinationType: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-slate-200 rounded-xl outline-none"
                >
                  <option value="Internal">Internal (Local Farmer)</option>
                  <option value="Slaughter">Slaughterhouse</option>
                  <option value="External">External (Export)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Transport Date
                </label>
                <input
                  type="date"
                  required
                  min={getMinDate()}
                  value={formData.transportDate}
                  onChange={(e) =>
                    setFormData({ ...formData, transportDate: e.target.value })
                  }
                  className="w-full p-3 border border-slate-200 rounded-xl outline-none"
                />
              </div>
            </div>

            <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">
                Receiver Information
              </h3>
              {formData.destinationType === "Internal" ? (
                <input
                  type="text"
                  placeholder="e.g. buyer@gmail.com"
                  className="w-full p-4 border border-blue-200 rounded-xl outline-none"
                  value={formData.receiverUsername}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      receiverUsername: e.target.value,
                    })
                  }
                />
              ) : (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Name"
                    className="w-full p-4 border border-blue-200 rounded-xl outline-none"
                    value={formData.receiverName}
                    onChange={(e) =>
                      setFormData({ ...formData, receiverName: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    className="w-full p-4 border border-blue-200 rounded-xl outline-none"
                    value={formData.receiverAddress}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        receiverAddress: e.target.value,
                      })
                    }
                  />
                </div>
              )}
            </div>
            <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-blue-700 transition">
              Submit Application
            </button>
          </form>
        </div>
      )}

      {/* OUTGOING & INCOMING TABS (Use your previous code, no changes needed there) */}
      {activeTab === "outgoing" && (
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-6 text-xs font-bold text-slate-400 uppercase">
                  Batch ID
                </th>
                <th className="p-6 text-xs font-bold text-slate-400 uppercase">
                  To
                </th>
                <th className="p-6 text-xs font-bold text-slate-400 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {outgoing.map((r) => (
                <tr key={r._id}>
                  <td className="p-6 font-mono text-xs font-bold text-slate-600">
                    {r.batchId}
                  </td>
                  <td className="p-6 text-sm">
                    {r.destinationType === "Internal"
                      ? r.receiverUsername
                      : r.receiverDetails?.name}
                  </td>
                  <td className="p-6">
                    <StatusBadge status={r.status} />
                    {/* ---UPLOAD BUTTON LOGIC --- */}
                    {r.destinationType !== "Internal" &&
                      (r.status === "Approved (VHC Issued)" ||
                        r.status === "Proof Rejected") && (
                        <div className="mt-2">
                          <button
                            onClick={() => triggerFileUpload(r._id)}
                            className="text-[10px] font-bold bg-slate-800 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 transition shadow-sm flex items-center gap-1"
                          >
                            📄 Upload Proof
                          </button>
                          {r.status === "Proof Rejected" && (
                            <p className="text-[10px] text-red-500 mt-1">
                              {r.rejectionReason}
                            </p>
                          )}
                        </div>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "incoming" && (
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-6 text-xs font-bold text-slate-400 uppercase">
                  From
                </th>
                <th className="p-6 text-xs font-bold text-slate-400 uppercase">
                  Batch ID
                </th>
                <th className="p-6 text-xs font-bold text-slate-400 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {incoming.map((r) => (
                <tr key={r._id}>
                  <td className="p-6 font-bold text-slate-700">
                    {r.farmerUsername}
                  </td>
                  <td className="p-6 font-mono text-xs font-bold text-slate-600">
                    {r.batchId}
                  </td>
                  <td className="p-6">
                    {r.status === "Approved (VHC Issued)" ? (
                      <button
                        onClick={() => handleReceive(r._id)}
                        className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-600 shadow-md transition"
                      >
                        📥 Confirm Receipt
                      </button>
                    ) : (
                      <StatusBadge status={r.status} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
