import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLng, Map as LeafletMap } from 'leaflet';
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
  const mapRef = useRef<LeafletMap>(null);
  const center: [number, number] = [50.8, 4.3];
  const zoom = 8;

  // Ensure map is properly sized after mounting
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 100);
    }
  }, []);

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
      html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; border: ${
        isSelected ? '3px solid white' : '2px solid rgba(0,0,0,0.2)'
      }; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; color: white;">
        ${institution.publications.length}
      </div>`,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  return (
    <MapContainer 
      ref={mapRef}
      center={center} 
      zoom={zoom} 
      style={{ width: '100%', height: '100%', minHeight: '600px' }}
      className="benelux-map"
    >
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
            <div style={{ width: '200px' }}>
              <h3 style={{ fontWeight: 'bold', fontSize: '14px' }}>{institution.name}</h3>
              <p style={{ fontSize: '12px', color: '#666' }}>{institution.city}, {institution.country}</p>
              <p style={{ fontSize: '12px', marginTop: '8px' }}>
                <strong>{institution.publications.length}</strong> publications
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default BeneluxMap;
