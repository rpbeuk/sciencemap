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
  selectedInstitution,
  onInstitutionClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.CircleMarker }>({});
  const departmentMarkersRef = useRef<L.CircleMarker[]>([]);
  const departmentLabelsRef = useRef<L.Marker[]>([]);

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
      const color = '#ea580c'; // Always orange

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
        .addTo(map);
      
      // Add click handler to the marker's DOM element
      const markerElement = marker.getElement();
      if (markerElement) {
        markerElement.addEventListener('click', () => {
          onInstitutionClick(institution as any);
        });
        markerElement.style.cursor = 'pointer';
      }
      
      // Create a popup-like tooltip for hover
      marker.bindTooltip(`
        <div style="font-family: sans-serif; white-space: nowrap;">
          <strong>${institution.name}</strong><br/>
          ${institution.city}, ${institution.country}<br/>
          ${count} publications
        </div>
      `, { permanent: false, direction: 'top', offset: [0, -10] });

      markersRef.current[`${institution.name}-${institution.city}`] = marker as any;
    });
  }, [institutions, onInstitutionClick]);

  // Render department nodes around selected institution
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Clear existing department markers and labels
    departmentMarkersRef.current.forEach(marker => {
      map.removeLayer(marker);
    });
    departmentLabelsRef.current.forEach(label => {
      map.removeLayer(label);
    });
    departmentMarkersRef.current = [];
    departmentLabelsRef.current = [];

    if (!selectedInstitution || !selectedInstitution.departments) return;

    const instLat = selectedInstitution.coordinates[0];
    const instLng = selectedInstitution.coordinates[1];
    const departments = selectedInstitution.departments;
    
    // Calculate positions in a circle around the main marker
    const radius = 0.05; // degrees, approximately 5km at the equator
    const count = departments.length;
    
    departments.forEach((dept: any, idx: number) => {
      const angle = (idx / count) * (2 * Math.PI);
      const deptLat = instLat + radius * Math.sin(angle);
      const deptLng = instLng + radius * Math.cos(angle);
      
      // Create department marker (smaller than main marker)
      const deptIcon = L.divIcon({
        html: `
          <div style="
            background-color: #ea580c;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #fff;
            color: white;
            font-weight: bold;
            font-size: 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            font-family: Arial, sans-serif;
          ">
            ${dept.publications.length}
          </div>
        `,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      
      const deptMarker = L.marker([deptLat, deptLng], {
        icon: deptIcon,
      }).addTo(map);
      
      deptMarker.bindTooltip(`${dept.name}: ${dept.publications.length} publications`, {
        permanent: false,
        direction: 'top',
        offset: [0, -10],
      });
      
      departmentMarkersRef.current.push(deptMarker as any);
      
      // Add department name label
      const labelIcon = L.divIcon({
        html: `
          <div style="
            font-size: 10px;
            font-weight: 700;
            color: #333;
            text-align: center;
            max-width: 65px;
            word-break: break-word;
            font-family: Arial, sans-serif;
            white-space: normal;
            line-height: 1.3;
            background-color: rgba(255, 255, 255, 0.9);
            padding: 4px 6px;
            border-radius: 3px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
          ">
            ${dept.name.substring(0, 22)}${dept.name.length > 22 ? '...' : ''}
          </div>
        `,
        className: '',
        iconSize: [75, 50],
        iconAnchor: [37, 25],
      });
      
      const labelOffset = 0.065;
      const labelLat = instLat + (labelOffset * 1.15) * Math.sin(angle);
      const labelLng = instLng + (labelOffset * 1.15) * Math.cos(angle);
      
      const labelMarker = L.marker([labelLat, labelLng], {
        icon: labelIcon,
        interactive: false,
      }).addTo(map);
      
      departmentLabelsRef.current.push(labelMarker);
    });
  }, [selectedInstitution]);

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
