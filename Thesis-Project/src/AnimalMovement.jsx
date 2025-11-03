import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const AnimalMovement = () => {
  // Center on Santa Rosa, Laguna
  const center = [14.3147, 121.1123];

  // Mock data for animal populations
  const animalData = [
    { position: [14.3165, 121.1110], type: 'Cattle', count: 580, color: 'blue' },
    { position: [14.3128, 121.1185], type: 'Swine', count: 950, color: 'red' },
    { position: [14.3192, 121.1078], type: 'Poultry', count: 2450, color: 'green' },
    { position: [14.3105, 121.1156], type: 'Carabaos', count: 395, color: 'orange' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white pt-24 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-screen-2xl mx-auto">
        <h1 className="text-4xl font-bold text-green-700 text-center mb-8 tracking-tight">
          Animal Movement Map
        </h1>
        <p className="text-lg text-gray-600 text-center mb-8 leading-relaxed max-w-3xl mx-auto">
          Visualize animal populations and movements across different locations. This interactive map shows real-time data for cattle, swine, poultry, and carabaos in Santa Rosa City, Laguna.
        </p>
        <div className="w-full h-96 lg:h-[600px] rounded-2xl overflow-hidden shadow-lg">
          <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {animalData.map((animal, index) => (
              <Circle
                key={index}
                center={animal.position}
                radius={animal.count * 0.1} // Scale radius based on count
                pathOptions={{ color: animal.color, fillColor: animal.color, fillOpacity: 0.5 }}
              >
                <Popup>
                  <div className="text-center">
                    <h3 className="font-semibold">{animal.type}</h3>
                    <p>Count: {animal.count}</p>
                  </div>
                </Popup>
              </Circle>
            ))}
          </MapContainer>
        </div>
        <div className="mt-8 text-center">
          <button
            onClick={() => window.history.back()}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnimalMovement;