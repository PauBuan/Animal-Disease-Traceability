import React from "react";

/**
 * AdminReports Component
 * This implements the "Compliance and Reporting Module" (Use Case 5).
 * Allows the admin to generate audit-ready reports from blockchain data.
 */
export default function AdminReports() {
  const handleGenerateReport = (reportType) => {
    alert(
      `Generating ${reportType}...\n\n(This would query the blockchain and export a PDF/Excel file.)`
    );
  };

  const reports = [
    {
      title: "Disease Surveillance Summary",
      description: "Overview of all reported diseases within a time frame.",
      type: "Disease Summary",
    },
    {
      title: "Vaccination Compliance",
      description:
        "Report on vaccination status vs. registered livestock population.",
      type: "Vaccination Report",
    },
    {
      title: "Movement Tracking Report",
      description: "Complete chain of custody for livestock movement.",
      type: "Movement Report",
    },
    {
      title: "Outbreak Response Audit",
      description: "Timeline of all actions taken for a specific outbreak.",
      type: "Outbreak Audit",
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Compliance & Reporting
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Generate official, audit-ready reports from the immutable blockchain
        ledger.
      </p>

      {/* Report Generation Form (Prototype) */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Generate New Report
        </h2>
        <form className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Type
            </label>
            <select className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--green)]">
              <option>Disease Surveillance Summary</option>
              <option>Vaccination Compliance</option>
              <option>Movement Tracking Report</option>
              <option>Outbreak Response Audit</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Range
            </label>
            <select className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--green)]">
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
              <option>All Time</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() => handleGenerateReport("Selected Report")}
            className="w-full bg-[var(--green)] text-white py-3 rounded-xl hover:bg-[var(--light-green)] hover:text-[var(--green)] transition font-medium shadow-md"
          >
            Generate & Export
          </button>
        </form>
      </div>

      {/* Available Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => (
          <div
            key={report.type}
            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex justify-between items-center"
          >
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                {report.title}
              </h3>
              <p className="text-gray-600">{report.description}</p>
            </div>
            <button
              onClick={() => handleGenerateReport(report.title)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
            >
              Quick Export
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
