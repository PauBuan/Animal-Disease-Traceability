// src/AnimalMovement.jsx
import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { MapContainer, TileLayer, Circle, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import { tableData } from "./data"; // NOW WORKS

// Fix Leaflet icons
if (typeof window !== "undefined") {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// === TOTAL BY ANIMAL TYPE ===
const totalByAnimal = { Hogs: 0, Cattle: 0, Chickens: 0, Carabaos: 0 };
tableData.forEach(row => {
  const total =
    row.dita.healthy + row.dita.sick + row.dita.quarantined +
    row.pooc.healthy + row.pooc.sick + row.pooc.quarantined +
    row.macabling.healthy + row.macabling.sick + row.macabling.quarantined;
  totalByAnimal[row.animal] += total;
});

const populationData = {
  labels: Object.keys(totalByAnimal),
  datasets: [
    {
      label: "Total Animals",
      data: Object.values(totalByAnimal),
      backgroundColor: "rgba(21, 128, 61, 0.8)",
      borderColor: "rgba(21, 128, 61, 1)",
      borderWidth: 1,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "top", labels: { color: "#15803D" } },
  },
  scales: {
    y: { beginAtZero: true, title: { display: true, text: "Count", color: "#15803D" } },
    x: { ticks: { color: "#4B5563" } },
  },
};

// === REAL BARANGAY COORDINATES (Santa Rosa City, Laguna) ===
const mapCenter = [14.3015, 121.1100];

const barangays = [
  { name: "Brgy. Dita", position: [14.282358324245413, 121.11142645683873], color: "blue", key: "dita" },
  { name: "Brgy. Pooc", position: [14.300708525997425, 121.11186580202454], color: "green", key: "pooc" },
  { name: "Brgy. Macabling", position: [14.300378210465363, 121.09871278073743], color: "red", key: "macabling" },
];

// === STATS ===
const totalAnimals = Object.values(totalByAnimal).reduce((a, b) => a + b, 0);
const maxAnimal = Object.entries(totalByAnimal).reduce((a, b) => (b[1] > a[1] ? b : a), ["", 0]);
const minAnimal = Object.entries(totalByAnimal).reduce((a, b) => (b[1] < a[1] ? b : a), ["", Infinity]);

export default function AnimalMovement() {
  const navigate = useNavigate();

  const handleDownload = () => {
    alert("Report downloaded!");
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* NAVBAR */}
      <header className="bg-green-700 text-white w-full shadow-lg fixed top-0 left-0 z-[1000]">
        <div className="px-6 lg:px-12 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Animal Disease Traceability</h1>
          <nav className="flex space-x-6 text-lg">
            <a href="/" className="hover:text-green-200">Home</a>
            <a href="/dashboard" className="hover:text-green-200">Dashboards</a>
            <a href="/login" className="hover:text-green-200">Login</a>
          </nav>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-grow bg-gradient-to-br from-green-50 to-white pt-28 pb-12 px-4 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-green-700 text-center mb-10">
            Animal Movement Report
          </h2>

          {/* GRID: CHART LEFT, MAP RIGHT */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            {/* LEFT: CHART */}
            <div className="bg-white p-5 rounded-2xl shadow-lg border">
              <h3 className="text-xl font-semibold text-green-700 mb-3 text-center">
                Animal Population by Type
              </h3>
              <div className="h-80 lg:h-96">
                <Bar data={populationData} options={chartOptions} />
              </div>
            </div>

            {/* RIGHT: MAP – REAL LOCATIONS */}
            <div className="bg-white p-5 rounded-2xl shadow-lg border">
              <h3 className="text-xl font-semibold text-green-700 mb-3 text-center">
                Movement Map (Santa Rosa City)
              </h3>
              <div className="h-80 lg:h-96 rounded-xl overflow-hidden border border-gray-300">
                <MapContainer
                  center={mapCenter}
                  zoom={13}
                  zoomControl={false} 
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap'
                  />
                  {barangays.map((loc) => {
                    const count = tableData.reduce((sum, row) => {
                      const b = row[loc.key];
                      return sum + (b.healthy + b.sick + b.quarantined);
                    }, 0);
                    const radius = Math.min(Math.sqrt(count) * 8, 100);

                    return (
                      <Circle
                        key={loc.key}
                        center={loc.position}
                        radius={radius}
                        pathOptions={{
                          color: loc.color,
                          fillColor: loc.color,
                          fillOpacity: 0.7,
                          weight: 2,
                        }}
                      >
                        <Popup>
                          <div className="text-center p-1">
                            <h4 className="font-bold text-sm">{loc.name}</h4>
                            <p className="text-xs">Animals: <strong>{count}</strong></p>
                          </div>
                        </Popup>
                      </Circle>
                    );
                  })}
                </MapContainer>
              </div>
            </div>
          </div>

          {/* STATS */}
          <div className="bg-white p-7 rounded-2xl shadow-lg border">
            <h3 className="text-2xl font-semibold text-green-700 mb-5 text-center">
              Population Statistics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl mx-auto">
              <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-center">
                <p className="text-sm font-medium text-gray-700">Total Animals</p>
                <p className="text-3xl font-bold text-green-700 mt-1">{totalAnimals.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-center">
                <p className="text-sm font-medium text-gray-700">Most Common</p>
                <p className="text-xl font-bold text-blue-700 mt-1">{maxAnimal[0]}</p>
                <p className="text-xs text-gray-600">{maxAnimal[1].toLocaleString()} heads</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-xl border border-orange-200 text-center">
                <p className="text-sm font-medium text-gray-700">Least Common</p>
                <p className="text-xl font-bold text-orange-700 mt-1">{minAnimal[0]}</p>
                <p className="text-xs text-gray-600">{minAnimal[1].toLocaleString()} heads</p>
              </div>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-gray-600 text-white px-7 py-3 rounded-xl hover:bg-gray-700 font-medium"
            >
              Back to Dashboard
            </button>
            <button
              onClick={handleDownload}
              className="bg-green-700 text-white px-7 py-3 rounded-xl hover:bg-green-600 font-medium"
            >
              Download Report
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}