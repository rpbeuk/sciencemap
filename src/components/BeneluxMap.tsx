import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLng, LatLngBounds, Map as LeafletMap } from 'leaflet';
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

  // Benelux bounds: Southwest corner (50.7, 2.3) to Northeast corner (53.5, 7.2)
  const beneluxBounds = new LatLngBounds(
    [50.7, 2.3],  // Southwest
    [53.5, 7.2]   // Northeast
  );
  
  const center: [number, number] = [51.5, 4.75];
  const zoom = 8;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
        mapRef.current.fitBounds(beneluxBounds, { padding: [50, 50] });
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [beneluxBounds]);

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
      maxBounds={beneluxBounds}
      maxBoundsViscosity={1.0}
      style={{ width: '100%', height: '100%' }}
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
              <h3 style={{ fontWeight: 'bold', fontSize: '14px', margin: '0 0 4px 0' }}>{institution.name}</h3>
              <p style={{ fontSize: '12px', color: '#666', margin: '0 0 4px 0' }}>{institution.city}, {institution.country}</p>
              <p style={{ fontSize: '12px', margin: '8px 0 0 0' }}>
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
