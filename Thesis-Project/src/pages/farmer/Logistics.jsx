import { useState, useEffect, useRef } from "react";

export default function Logistics() {
  const [animals, setAnimals] = useState([]);
  const [activeTab, setActiveTab] = useState("apply");
  const [outgoing, setOutgoing] = useState([]);
  const [incoming, setIncoming] = useState([]);

  // FILE UPLOAD STATE (For Senders - Exit Proofs & PODs)
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

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
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

  // --- SENDER UPLOADING PROOF (Internal POD or External Exit) ---
  const triggerFileUpload = (requestId) => {
    setUploadingId(requestId);
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !uploadingId) return;

    const fd = new FormData();
    fd.append("requestId", uploadingId);
    fd.append("proofFile", file);

    try {
      const res = await fetch(
        "http://localhost:3001/api/transfers/upload-proof",
        {
          method: "POST",
          body: fd,
        },
      );
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Upload failed");
      }
      alert(resData.message);
      fetchMovements();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setUploadingId(null);
      e.target.value = null;
    }
  };

  // --- RECEIVER CONFIRMING RECEIPT (Re-Added Function) ---
  const handleReceive = async (requestId) => {
    if (
      !confirm(
        "Confirm receipt? This will transfer ownership to you on the Blockchain.",
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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to receive");
      }

      alert("Transfer Successful! Animal is now in your inventory.");
      fetchMovements();
      fetchInventory();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // --- SENDER SUBMITTING NEW REQUEST ---
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

  const StatusBadge = ({ status }) => {
    let color = "bg-slate-100 text-slate-600 border-slate-200";
    if (status === "Pending Vet Review")
      color = "bg-amber-100 text-amber-700 border-amber-200";
    if (status === "Approved (VHC Issued)")
      color = "bg-blue-100 text-blue-700 border-blue-200 animate-pulse";
    if (status.includes("Completed"))
      color = "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (status === "Rejected") color = "bg-red-100 text-red-700 border-red-200";
    if (status === "Pending Regulator Verification")
      color = "bg-purple-100 text-purple-700 border-purple-200";

    return (
      <span
        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${color}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="p-8 lg:p-12 max-w-6xl mx-auto flex flex-col items-center">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-black text-slate-800 uppercase tracking-tight">
          Logistics & <span className="text-[var(--green)]">Movement</span>
        </h1>
        <p className="text-slate-500 font-medium mt-2">
          Manage asset transfers, Health Certificates, and receipts.
        </p>
      </header>

      {/* Hidden File Input for Senders */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,.pdf"
      />

      {/* TABS MENU */}
      <div className="flex gap-2 mb-12 bg-white p-2 rounded-2xl w-fit border border-slate-200 shadow-md">
        <button
          onClick={() => setActiveTab("apply")}
          className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${
            activeTab === "apply"
              ? "bg-[var(--green)] text-white shadow-lg scale-105"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          📤 New Request
        </button>
        <button
          onClick={() => setActiveTab("outgoing")}
          className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${
            activeTab === "outgoing"
              ? "bg-[var(--green)] text-white shadow-lg scale-105"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          🛫 Outgoing ({outgoing.length})
        </button>
        <button
          onClick={() => setActiveTab("incoming")}
          className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${
            activeTab === "incoming"
              ? "bg-[var(--green)] text-white shadow-lg scale-105"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          🛬 Incoming (
          {incoming.filter((i) => i.status === "Approved (VHC Issued)").length})
        </button>
      </div>

      {/* APPLY TAB */}
      {activeTab === "apply" && (
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 w-full max-w-2xl transform transition-all">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-green-50/50 p-6 rounded-3xl border border-green-100">
              <label className="block text-xs font-black text-[var(--green)] uppercase tracking-widest mb-3">
                Select Asset from Inventory
              </label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-white text-slate-700 font-bold outline-none focus:border-[var(--green)] transition-all"
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
                          ? "⏳ Unverified"
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
                  className="w-full p-4 border-2 border-slate-50 rounded-xl outline-none focus:border-[var(--green)] font-medium"
                >
                  <option value="Internal">Local Farmer</option>
                  <option value="Slaughter">Slaughterhouse</option>
                  <option value="External">Export / Other</option>
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
                  className="w-full p-4 border-2 border-slate-50 rounded-xl outline-none focus:border-[var(--green)] font-medium"
                />
              </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                Receiver Details
              </h3>
              {formData.destinationType === "Internal" ? (
                <input
                  type="text"
                  placeholder="Enter Buyer Username/Email"
                  className="w-full p-4 border-2 border-white rounded-xl outline-none focus:border-[var(--green)] shadow-sm font-bold"
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
                    placeholder="Receiver Name"
                    className="w-full p-4 border-2 border-white rounded-xl outline-none focus:border-[var(--green)] shadow-sm font-bold"
                    value={formData.receiverName}
                    onChange={(e) =>
                      setFormData({ ...formData, receiverName: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Full Destination Address"
                    className="w-full p-4 border-2 border-white rounded-xl outline-none focus:border-[var(--green)] shadow-sm font-bold"
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
            <button className="w-full bg-[var(--green)] text-white font-black py-5 rounded-2xl shadow-xl hover:opacity-90 active:scale-95 transition-all uppercase tracking-widest">
              Submit Transport Request
            </button>
          </form>
        </div>
      )}

      {/* TABLES SECTION */}
      {(activeTab === "outgoing" || activeTab === "incoming") && (
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden w-full">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">
                  Identification
                </th>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">
                  Counterparty
                </th>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">
                  Status / Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {activeTab === "outgoing" &&
                outgoing.map((r) => (
                  <tr
                    key={r._id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-6">
                      <span className="font-mono text-xs font-black text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {r.batchId}
                      </span>
                    </td>
                    <td className="p-6 font-bold text-slate-700">
                      {r.destinationType === "Internal"
                        ? r.receiverUsername
                        : r.receiverDetails?.name}
                    </td>
                    <td className="p-6 flex flex-col items-center gap-2">
                      <StatusBadge status={r.status} />

                      <div className="flex gap-2">
                        {/* SENDER PROOF UPLOAD (Works for Internal and External) */}
                        {((r.status === "Approved (VHC Issued)" &&
                          !r.proofDocumentUrl) ||
                          r.status === "Proof Rejected") && (
                          <button
                            onClick={() => triggerFileUpload(r._id)}
                            className="text-[10px] font-black bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-black transition shadow-md uppercase"
                          >
                            📄{" "}
                            {r.destinationType === "Internal"
                              ? "Upload POD"
                              : "Upload Exit Proof"}
                          </button>
                        )}

                        {/* VIEW UPLOADED PROOF */}
                        {r.proofDocumentUrl && (
                          <a
                            href={r.proofDocumentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-black bg-blue-50 text-blue-600 border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-100 transition shadow-sm uppercase"
                          >
                            👁️ View Proof
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

              {activeTab === "incoming" &&
                incoming.map((r) => (
                  <tr
                    key={r._id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-6">
                      <span className="font-mono text-xs font-black text-[var(--green)] bg-green-50 px-2 py-1 rounded">
                        {r.batchId}
                      </span>
                    </td>
                    <td className="p-6 font-bold text-slate-700">
                      {r.farmerUsername}
                    </td>
                    <td className="p-6 flex flex-col items-center gap-2">
                      <StatusBadge status={r.status} />

                      <div className="flex gap-2 items-center">
                        {/* VIEW SENDER'S UPLOADED PROOF */}
                        {r.proofDocumentUrl && (
                          <a
                            href={r.proofDocumentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-black bg-blue-50 text-blue-600 border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-100 transition shadow-sm uppercase"
                          >
                            👁️ View POD
                          </a>
                        )}

                        {/* RECEIVER CONFIRM */}
                        {r.status === "Approved (VHC Issued)" && (
                          <button
                            onClick={() => handleReceive(r._id)}
                            className="bg-[var(--green)] text-white px-6 py-2 rounded-xl text-xs font-black hover:opacity-90 shadow-md transition uppercase tracking-widest flex items-center gap-2"
                          >
                            📥 Confirm Receipt
                          </button>
                        )}
                      </div>
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
