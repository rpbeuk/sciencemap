import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Institution } from '../context/DataContext';

interface MapProps {
  institutions: Institution[];
  selectedInstitution: Institution | null;
  selectedDepartment: any | null;
  onInstitutionClick: (inst: Institution) => void;
  onDepartmentClick: (dept: any) => void;
}

const BeneluxMap: React.FC<MapProps> = ({
  institutions,
  selectedInstitution,
  onInstitutionClick,
  onDepartmentClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.CircleMarker }>({});
  const departmentMarkersRef = useRef<L.CircleMarker[]>([]);
  const departmentLabelsRef = useRef<L.Marker[]>([]);
  const isAnimatingRef = useRef(false); // Track if we're zooming due to selection

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
      maxZoom: 14, // Default max zoom
      minZoom: 2,
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      minZoom: 2,
      zIndex: 1,
    }).addTo(map);

    // Handle zoom changes to hide department nodes when zooming out
    map.on('zoom', () => {
      const currentZoom = map.getZoom();
      // Only clear if user is manually zooming out (not during animation)
      if (currentZoom < 11 && !isAnimatingRef.current) {
        onInstitutionClick(null as any);
        map.setMaxZoom(14); // Reset to default max zoom
      }
    });
    
    map.on('move', () => {
      // Don't clear on move, only on zoom
    });

    mapRef.current = map;

    // Ensure map size is correct after initialization
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
  }, [onInstitutionClick]);

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

  // Zoom to institution when selected
  useEffect(() => {
    if (!mapRef.current || !selectedInstitution) return;
    
    const map = mapRef.current;
    const targetZoom = 11; // Zoom level to show department details perfectly
    
    // Set flag to prevent zoom event from clearing selection during animation
    isAnimatingRef.current = true;
    
    // Zoom to institution coordinates with smooth animation
    map.flyTo(
      [selectedInstitution.coordinates[0], selectedInstitution.coordinates[1]],
      targetZoom,
      { 
        duration: 1,
        easeLinearity: 0.25,
      }
    );
    
    // Set max zoom to 11 when institution is selected (prevent zooming in further)
    map.setMaxZoom(11);
    
    // Clear animation flag after zoom completes
    const onZoomEnd = () => {
      isAnimatingRef.current = false;
      map.off('zoomend', onZoomEnd);
    };
    map.on('zoomend', onZoomEnd);
  }, [selectedInstitution]);

  // Render department nodes vertically stacked to the right of selected institution
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
    // Sort departments by publication count (ascending) - do this early
    const sortedDepartments = [...departments].sort((a: any, b: any) => {
      return (a.publications?.length || 0) - (b.publications?.length || 0);
    });
    
    console.log('DEBUG: Departments before sorting:', departments.map((d: any) => ({ name: d.name, count: d.publications?.length })));
    console.log('DEBUG: Departments after sorting:', sortedDepartments.map((d: any) => ({ name: d.name, count: d.publications?.length })));
    
    // Add CRM Level 1 label above all departments
    if (sortedDepartments.length > 0 && sortedDepartments[0].publications && sortedDepartments[0].publications.length > 0) {
      const crmLevel1 = sortedDepartments[0].publications[0].crm_level_1;
      console.log('DEBUG: CRM Level 1:', crmLevel1);
      if (crmLevel1) {
        const verticalSpacing = 0.015; // Same spacing as departments
        const count = sortedDepartments.length;
        
        // Position above the first department (which is at the top on map)
        const firstDeptLat = instLat - (verticalSpacing * (count - 1) / 2);
        const labelLat = firstDeptLat - verticalSpacing; // Subtract to go above (north)
        const labelLng = instLng + 0.035; // Slightly left from departments (reduced from 0.04)
        
        const crmLabel = L.divIcon({
          html: `
            <div style="
              background-color: transparent;
              color: #000000;
              padding: 0;
              border-radius: 0;
              font-size: 14px;
              font-weight: 700;
              white-space: nowrap;
              font-family: Arial, sans-serif;
              box-shadow: none;
              border: none;
              z-index: 1000;
            ">
              ${crmLevel1}
            </div>
          `,
          className: 'crm-label',
          iconSize: [240, 20],
          iconAnchor: [0, 10],
        });
        
        const crmMarker = L.marker([labelLat, labelLng], {
          icon: crmLabel,
          zIndexOffset: 1000,
        }).addTo(map);
        
        departmentLabelsRef.current.push(crmMarker as any);
      }
    }
    
    // Stack departments vertically to the right
    const horizontalOffset = 0.04; // degrees, moves nodes to the right
    const verticalSpacing = 0.015; // degrees between each department row
    
    const count = sortedDepartments.length;
    
    sortedDepartments.forEach((dept: any, idx: number) => {
      // Position vertically stacked, offset to the right
      const deptLat = instLat - (verticalSpacing * (count - 1) / 2) + (verticalSpacing * idx);
      const deptLng = instLng + horizontalOffset;
      
      const pubCount = dept.publications.length;
      const deptName = dept.name;
      
      // Create circle with count + label with dept name
      const circleRadius = 20; // 40px diameter
      const minRectWidth = 250; // Minimum width for text box
      const overlapOffset = -10; // Negative value makes box overlap the circle
      const totalWidth = circleRadius * 2 + minRectWidth + overlapOffset;
      
      const deptIcon = L.divIcon({
        html: `
          <div style="display: flex; align-items: center; gap: 0; margin: 0; padding: 0; position: relative;">
            <div style="background-color: #ea580c; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #000; color: white; font-weight: bold; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.3); font-family: Arial, sans-serif; flex-shrink: 0; z-index: 2;">${pubCount}</div>
            <div style="background-color: white; padding: 6px 14px; border-radius: 8px; color: black; font-weight: normal; font-size: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); font-family: Arial, sans-serif; white-space: nowrap; margin-left: ${overlapOffset}px; z-index: 1;">${deptName}</div>
          </div>
        `,
        className: 'dept-marker',
        iconSize: [totalWidth, 50],
        iconAnchor: [circleRadius, 25], // Anchor on left circle
      });
      
      const deptMarker = L.marker([deptLat, deptLng], {
        icon: deptIcon,
      }).addTo(map);
      
      // Add click handler to department marker
      const markerElement = deptMarker.getElement();
      if (markerElement) {
        markerElement.addEventListener('click', () => {
          onDepartmentClick(dept);
        });
        markerElement.style.cursor = 'pointer';
      }
      
      deptMarker.bindTooltip(`${dept.name}: ${pubCount} publications`, {
        permanent: false,
        direction: 'right',
        offset: [10, 0],
      });
      
      departmentMarkersRef.current.push(deptMarker as any);
    });
  }, [selectedInstitution, onDepartmentClick]);

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
