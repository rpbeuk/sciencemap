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
      zoomAnimation: false,
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      minZoom: 6,
      zIndex: 1,
    }).addTo(map);

    // Set bounds but don't fit to them - just prevent panning outside
    const beneluxBounds = L.latLngBounds(
      [50.7, 2.3],  // Southwest
      [53.5, 7.2]   // Northeast
    );
    
    map.setMaxBounds(beneluxBounds);

    mapRef.current = map;

    // Ensure map size is correct after initialization
    // Use requestAnimationFrame to wait for next paint
    requestAnimationFrame(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize(false);
      }
    });

    return () => {
      // Cleanup on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Load institutions from matched publications JSON
  useEffect(() => {
    const loadInstitutions = async () => {
      try {
        await fetch('/institutions_data.json');
      } catch (error) {
        console.error('Failed to load institutions data:', error);
      }
    };
    loadInstitutions();
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

    // Add markers for all institutions
    institutions.forEach((institution) => {
      const count = institution.publications.length;
      const color = count > 50 ? '#dc2626' : count > 20 ? '#ea580c' : count > 10 ? '#eab308' : '#3b82f6';

      // Create custom icon with publication count
      const icon = L.divIcon({
        html: `
          <div style="
            background-color: ${color};
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #000;
            color: white;
            font-weight: bold;
            font-size: 14px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            font-family: Arial, sans-serif;
          ">
            ${count}
          </div>
        `,
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([institution.coordinates[0], institution.coordinates[1]], {
        icon: icon,
      })
        .bindPopup(`
          <div style="font-family: sans-serif;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold;">${institution.name}</h3>
            <p style="margin: 0 0 4px 0; color: #666;">${institution.city}, ${institution.country}</p>
            <p style="margin: 8px 0 0 0;"><strong>${count}</strong> publications</p>
          </div>
        `)
        .on('click', () => onInstitutionClick(institution as any))
        .addTo(map);

      markersRef.current[`${institution.name}-${institution.city}`] = marker as any;
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
