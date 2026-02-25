// src/components/common/AuditTrailModal.jsx
import React, { useMemo } from "react";

export default function AuditTrailModal({
  isOpen,
  onClose,
  historyLoading,
  history,
  selectedAnimal,
}) {
  if (!isOpen) return null;

  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    return new Date(isoString).toLocaleString();
  };

  // --- ORIGIN TRACE LOGIC ---
  // 1. Sort history chronologically (oldest to newest)
  // 2. Extract locations, ignoring consecutive duplicates
  const movementPath = useMemo(() => {
    if (!history || history.length === 0) return [];

    const chronological = [...history].sort(
      (a, b) => new Date(a.data.timestamp) - new Date(b.data.timestamp),
    );

    const path = [];
    chronological.forEach((item) => {
      const loc = item.data.location;
      if (loc && (path.length === 0 || path[path.length - 1] !== loc)) {
        path.push(loc);
      }
    });
    return path;
  }, [history]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* HEADER */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h3 className="text-2xl font-black text-slate-900">
              Blockchain Audit Trail
            </h3>
            {selectedAnimal && (
              <p className="text-emerald-500 text-sm font-bold uppercase tracking-tighter">
                {selectedAnimal.batchId || "Legacy"} - {selectedAnimal.species}{" "}
                ({selectedAnimal.quantity} heads)
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors font-bold"
          >
            ✕
          </button>
        </div>

        <div className="p-8 overflow-y-auto bg-slate-50/30">
          {historyLoading ? (
            <div className="flex flex-col items-center py-20">
              <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-400 font-medium">
                Fetching from Peer Nodes...
              </p>
            </div>
          ) : history.length === 0 ? (
            <p className="text-center text-slate-400 py-10 italic">
              No blockchain records found.
            </p>
          ) : (
            <>
              {/* --- NEW: VISUAL MOVEMENT TRACE --- */}
              {movementPath.length > 0 && (
                <div className="mb-8 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">
                    Chain of Custody (Origin Trace)
                  </h4>
                  <div className="flex flex-wrap items-center gap-2">
                    {movementPath.map((loc, idx) => (
                      <React.Fragment key={idx}>
                        <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-100">
                          {idx === 0 ? "📍 Origin: " : ""}
                          {loc}
                        </div>
                        {idx < movementPath.length - 1 && (
                          <span className="text-slate-300 font-black">➔</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}

              {/* TIMELINE */}
              <div className="space-y-0 mt-4">
                {history.map((item, i) => (
                  <div key={i} className="relative pl-10 pb-10 group">
                    {/* Timeline Line */}
                    {i !== history.length - 1 && (
                      <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-slate-200 group-hover:bg-emerald-200 transition-colors"></div>
                    )}

                    {/* Node Dot */}
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white bg-emerald-500 shadow-md shadow-emerald-200 z-10"></div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-emerald-500/30 transition-all hover:shadow-xl hover:shadow-slate-200/50">
                      <div className="flex justify-between items-start mb-4">
                        <span className="bg-slate-900 text-white text-[10px] px-2 py-1 rounded font-mono uppercase tracking-widest">
                          TX: {item.txId.substring(0, 12)}...
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                          {formatDate(item.data.timestamp)}
                        </span>
                      </div>

                      <p className="text-lg font-black text-slate-800 mb-4">
                        {item.data.status || "State Update"}
                      </p>

                      <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-500 font-medium">
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <span className="block text-slate-400 uppercase text-[9px] mb-1">
                            Species
                          </span>
                          <span className="text-slate-800 font-bold">
                            {item.data.species}
                          </span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <span className="block text-slate-400 uppercase text-[9px] mb-1">
                            Quantity
                          </span>
                          <span className="text-slate-800 font-bold">
                            {item.data.quantity} heads
                          </span>
                        </div>
                        <div className="col-span-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <span className="block text-slate-400 uppercase text-[9px] mb-1">
                            Location / Custody
                          </span>
                          <span className="text-slate-800">
                            {item.data.location}
                          </span>
                        </div>
                        <div className="col-span-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <span className="block text-slate-400 uppercase text-[9px] mb-1">
                            {!item.data.severity ||
                            item.data.severity === "Ongoing"
                              ? "Initial Observation (Farmer)"
                              : "Official Health Status (Vet)"}
                          </span>
                          <span className="text-slate-800">
                            {!item.data.severity ||
                            item.data.severity === "Ongoing" ? (
                              <span className="italic text-slate-600">
                                "{item.data.healthStatus}"
                              </span>
                            ) : item.data.severity === "safe" ? (
                              <span className="font-bold text-emerald-600">
                                ✅ Verified Healthy
                              </span>
                            ) : item.data.severity === "mild" ? (
                              <span className="font-bold text-amber-600">
                                ⚠️ Mild Illness
                              </span>
                            ) : (
                              <span className="font-bold text-red-600">
                                ⛔ Dangerous Disease
                              </span>
                            )}
                          </span>
                        </div>
                      </div>

                      {item.data.diagnosedDisease &&
                        item.data.severity !== "safe" &&
                        item.data.severity !== "Ongoing" && (
                          <div className="mt-3 bg-red-50 border border-red-100 p-3 rounded-lg flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                            <span className="text-xs font-black text-red-600">
                              DIAGNOSIS: {item.data.diagnosedDisease}
                            </span>
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
