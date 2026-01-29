import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { format } from "date-fns";

// Default Leaflet Icon setup
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Mock data for map
const outbreakHotspots = [
  {
    id: 1,
    position: [14.282358324245413, 121.11142645683873], // Brgy. Dita
    name: "Brgy. Dita",
    details: "Avian Influenza - 3 Active Cases",
    status: "Active",
  },
  {
    id: 2,
    position: [14.300708525997425, 121.11186580202454], // Brgy. Pooc
    name: "Brgy. Pooc",
    details: "African Swine Fever (ASF) - 2 Farms Under Watch",
    status: "Monitoring",
  },
  {
    id: 3,
    position: [14.300378210465363, 121.09871278073743], // Brgy. Macabling
    name: "Brgy. Macabling",
    details: "Foot-and-Mouth Disease - 1 Farm Contained",
    status: "Contained",
  },
];

export default function AdminOverview() {
  const [transactions, setTransactions] = useState([]);
  const santaRosaCenter = [14.28, 121.09];

  // Fetch submitted vet diagnoses
  useEffect(() => {
    fetchSubmittedAlerts();
  }, []);

  const fetchSubmittedAlerts = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/transactions");
      const data = await res.json();
      // Filter to only show vet-submitted alerts (you can adjust field if needed)
      const submitted = data.filter((tx) => tx.status === "Submitted to Admin");
      setTransactions(submitted);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    return format(new Date(isoString), "yyyy-MM-dd");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Disease Monitoring Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-red-100">
          <h2 className="text-lg font-semibold text-gray-600 mb-2">Active Alerts</h2>
          <p className="text-4xl font-bold text-red-600">3</p>
          <p className="text-gray-500">New outbreaks reported</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100">
          <h2 className="text-lg font-semibold text-gray-600 mb-2">Quarantined Areas</h2>
          <p className="text-4xl font-bold text-blue-600">2</p>
          <p className="text-gray-500">Barangays: Dita, Pooc</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-green-100">
          <h2 className="text-lg font-semibold text-gray-600 mb-2">Vaccination Compliance</h2>
          <p className="text-4xl font-bold text-green-600">89%</p>
          <p className="text-gray-500">of registered livestock</p>
        </div>
      </div>

      {/* Outbreak Hotspot Map */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Outbreak Hotspot Map</h2>
        <MapContainer
          center={santaRosaCenter}
          zoom={13}
          style={{ height: "450px", width: "100%", zIndex: 10, borderRadius: "8px" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {outbreakHotspots.map((hotspot) => (
            <Marker key={hotspot.id} position={hotspot.position}>
              <Popup>
                <div className="font-sans">
                  <h3 className="font-bold text-base text-gray-800">{hotspot.name}</h3>
                  <p className="text-sm text-gray-600">{hotspot.details}</p>
                  <p
                    className={`text-sm font-semibold ${
                      hotspot.status === "Active" ? "text-red-600" : "text-gray-600"
                    }`}
                  >
                    Status: {hotspot.status}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Recent Alerts Log */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Recent Alerts Log (Use Case 4)
        </h2>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="py-2 px-3">Date</th>
              <th className="py-2 px-3">Location</th>
              <th className="py-2 px-3">Reported Disease</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 text-center text-gray-500">
                  No submitted alerts yet
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr
                  key={tx._id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-3">{formatDate(tx.timestamp)}</td>
                  <td className="py-3 px-3">{tx.location}</td>
                  <td className="py-3 px-3">{tx.diagnosedDisease}</td>
                  <td className="py-3 px-3">
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                      Active
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <button className="text-blue-600 hover:underline">View</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
