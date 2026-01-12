import React from "react";

export default function VetOverview() {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Veterinary Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Action: Log Vaccination */}
        <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-green-500">
          <h3 className="text-xl font-bold mb-2">Health Management</h3>
          <p className="text-gray-600 mb-4">
            Log new vaccinations, inspections, or update animal health status.
          </p>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            Log Health Event
          </button>
        </div>

        {/* Quick Action: Report Outbreak */}
        <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-red-500">
          <h3 className="text-xl font-bold mb-2">Emergency Response</h3>
          <p className="text-gray-600 mb-4">
            Immediately report suspected ASF or Avian Influenza cases.
          </p>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
            Report Outbreak
          </button>
        </div>
      </div>
    </div>
  );
}
