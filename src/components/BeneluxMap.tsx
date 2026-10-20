import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Institution } from '../context/DataContext';

interface MapProps {
  institutions: Institution[];
  selectedInstitution: Institution | null;
  onInstitutionClick: (inst: Institution) => void;
}

const BeneluxMap: React.FC<MapProps> = ({
  institutions,
  onInstitutionClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.CircleMarker }>({});

  useEffect(() => {
    // Only initialize once
    if (mapRef.current) return;
    
    if (!containerRef.current) return;

    // Create map with explicit options
    const map = L.map(containerRef.current, {
      center: [51.5, 4.75],
      zoom: 8,
      zoomControl: true,
      attributionControl: true,
      preferCanvas: true,
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      minZoom: 6,
    }).addTo(map);

    // Set bounds
    const beneluxBounds = L.latLngBounds(
      [50.7, 2.3],  // Southwest
      [53.5, 7.2]   // Northeast
    );
    
    map.setMaxBounds(beneluxBounds);
    map.fitBounds(beneluxBounds, { padding: [50, 50] });

    mapRef.current = map;

    // Ensure map size is correct after initialization
    setTimeout(() => {
      map.invalidateSize(false);
    }, 100);

    return () => {
      // Cleanup on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Add/update markers when institutions change
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    // Remove old markers
    Object.values(markersRef.current).forEach(marker => {
      map.removeLayer(marker);
    });
    markersRef.current = {};

    // Add new markers
    institutions.forEach((institution) => {
      const count = institution.publications.length;
      const color = count > 50 ? '#dc2626' : count > 20 ? '#ea580c' : count > 10 ? '#eab308' : '#3b82f6';

      const marker = L.circleMarker([institution.coordinates[0], institution.coordinates[1]], {
        radius: 16,
        fillColor: color,
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
      })
        .bindPopup(`
          <div style="font-family: sans-serif;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold;">${institution.name}</h3>
            <p style="margin: 0 0 4px 0; color: #666;">${institution.city}, ${institution.country}</p>
            <p style="margin: 8px 0 0 0;"><strong>${count}</strong> publications</p>
          </div>
        `)
        .on('click', () => onInstitutionClick(institution))
        .addTo(map);

      markersRef.current[`${institution.name}-${institution.city}`] = marker;
    });
  }, [institutions, onInstitutionClick]);

  return (
    <div 
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        margin: 0,
        padding: 0,
      }}
    />
  );
};

export default BeneluxMap;
