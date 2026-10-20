import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLng } from 'leaflet';
import type { Institution } from '../context/DataContext';
import L from 'leaflet';

interface MapProps {
  institutions: Institution[];
  selectedInstitution: Institution | null;
  onInstitutionClick: (inst: Institution) => void;
}

const BeneluxMap: React.FC<MapProps> = ({
  institutions,
  selectedInstitution,
  onInstitutionClick,
}) => {
  const center: [number, number] = [50.8, 4.3];
  const zoom = 8;

  const getMarkerColor = (count: number): string => {
    if (count > 50) return '#dc2626';
    if (count > 20) return '#ea580c';
    if (count > 10) return '#eab308';
    return '#3b82f6';
  };

  const getMarkerIcon = (institution: Institution) => {
    const isSelected = selectedInstitution?.name === institution.name;
    const color = getMarkerColor(institution.publications.length);
    
    return L.divIcon({
      html: `<div class="flex items-center justify-center w-8 h-8 rounded-full text-white text-xs font-bold" style="background-color: ${color}; border: ${
        isSelected ? '3px solid white' : 'none'
      }; box-shadow: 0 2px 4px rgba(0,0,0,0.3)">
        ${institution.publications.length}
      </div>`,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  return (
    <div className="w-full h-full">
      <MapContainer center={center} zoom={zoom} className="w-full h-full" style={{ height: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {institutions.map((institution) => (
          <Marker
            key={`${institution.name}-${institution.city}`}
            position={new LatLng(institution.coordinates[0], institution.coordinates[1])}
            icon={getMarkerIcon(institution)}
            eventHandlers={{
              click: () => onInstitutionClick(institution),
            }}
          >
            <Popup>
              <div className="w-48">
                <h3 className="font-bold text-sm">{institution.name}</h3>
                <p className="text-xs text-gray-600">{institution.city}, {institution.country}</p>
                <p className="text-xs mt-2">
                  <strong>{institution.publications.length}</strong> publications
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default BeneluxMap;
