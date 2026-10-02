import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { BuildingRecord, SafetyAlert, RiskLevel } from '../../types';
import { isGoogleMapsConfigured, loadGoogleMapsApi, NAGPUR_CENTER } from '../../services/googleMapsService';
import { Info, MapPin, Layers, ShieldAlert, Sparkles } from 'lucide-react';

interface Props {
  buildings: BuildingRecord[];
  alerts: SafetyAlert[];
  showAlertRadii?: boolean;
  onSelectBuilding: (id: string) => void;
  selectedBuildingId?: string;
  flyToLocation?: { lat: number; lng: number; zoom?: number } | null;
  heightClass?: string;
}

const createRiskIcon = (risk: RiskLevel, hasAlert: boolean, maintenancePriority?: string, isSelected?: boolean) => {
  let color = '#10b981'; // green
  let badgeIcon = '✓';

  if (risk === 'CRITICAL') {
    color = '#ef4444'; // red
    badgeIcon = '🚨';
  } else if (risk === 'HIGH') {
    color = '#f97316'; // orange
    badgeIcon = '⚠️';
  } else if (risk === 'MODERATE') {
    color = '#eab308'; // yellow
    badgeIcon = '⚡';
  } else if (risk === 'INSUFFICIENT_DATA') {
    color = '#64748b'; // slate
    badgeIcon = '?';
  }

  if (maintenancePriority === 'IMMEDIATE_REPAIR' || maintenancePriority === 'HIGH') {
    badgeIcon = '🔧';
  }

  const pulseHtml = (hasAlert || risk === 'CRITICAL')
    ? `<span style="position:absolute; width:36px; height:36px; top:-8px; left:-8px; border-radius:50%; background:${color}; opacity:0.35; animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></span>`
    : '';

  const selectedRing = isSelected
    ? `<div style="position:absolute; width:38px; height:38px; top:-9px; left:-9px; border-radius:50%; border:2.5px dashed #0d9488; animation:spin 4s linear infinite;"></div>`
    : '';

  const html = `
    <div style="position:relative; width:22px; height:22px;">
      ${pulseHtml}
      ${selectedRing}
      <div style="width:24px; height:24px; border-radius:50%; background:${color}; border:2.5px solid #ffffff; box-shadow:0 2px 6px rgba(0,0,0,0.25); display:flex; align-items:center; justify-content:center; cursor:pointer; transform:scale(${isSelected ? 1.25 : 1}); transition:transform 0.2s;">
        <span style="font-size:11px; line-height:1; font-weight:bold; color:#ffffff;">${badgeIcon}</span>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-risk-pin',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

export const NagpurMap: React.FC<Props> = ({
  buildings,
  alerts,
  showAlertRadii = true,
  onSelectBuilding,
  selectedBuildingId,
  flyToLocation,
  heightClass = 'h-full min-h-[520px]'
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const [googleMapsActive, setGoogleMapsActive] = useState<boolean>(false);
  const [apiConfigured, setApiConfigured] = useState<boolean>(false);

  useEffect(() => {
    const configured = isGoogleMapsConfigured();
    setApiConfigured(configured);

    if (configured) {
      loadGoogleMapsApi().then((gmaps) => {
        if (gmaps) {
          setGoogleMapsActive(true);
        }
      });
    }
  }, []);

  // Initialize Leaflet Map (Default & Fallback)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const container = mapContainerRef.current;
      if ((container as any)._leaflet_id) {
        (container as any)._leaflet_id = null;
      }

      const nagpurCenter: [number, number] = [NAGPUR_CENTER.lat, NAGPUR_CENTER.lng];
      const map = L.map(container, {
        center: nagpurCenter,
        zoom: 13,
        zoomControl: true,
      });

      // Standard Civic Street Map
      const osmStandard = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors • Nagpur Municipal GIS',
        maxZoom: 19
      });

      const esriStreets = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Nagpur Urban Grid',
        maxZoom: 19
      });

      const esriSatellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri, Earthstar Geographics',
        maxZoom: 19
      });

      osmStandard.addTo(map);

      const baseMaps = {
        '🗺️ Civic Street Map': osmStandard,
        '🏙️ Urban Topography': esriStreets,
        '🛰️ Satellite Imagery': esriSatellite
      };
      L.control.layers(baseMaps, undefined, { position: 'topright' }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;

      const timer = setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);

      return () => {
        clearTimeout(timer);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
        layerGroupRef.current = null;
        if (container && (container as any)._leaflet_id) {
          (container as any)._leaflet_id = null;
        }
      };
    } catch (err) {
      console.error('Error initializing Nagpur map:', err);
    }
  }, []);

  // Handle FlyTo Location Changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !flyToLocation) return;

    map.flyTo([flyToLocation.lat, flyToLocation.lng], flyToLocation.zoom || 15, {
      animate: true,
      duration: 1.2
    });
  }, [flyToLocation]);

  // Update Markers & Alert Buffers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // 1. Draw Active Alert Geo-Fenced Radii (Default 2 km diameter / 1000m radius)
    if (showAlertRadii) {
      alerts.filter(a => a.status === 'ACTIVE' || a.status === 'VERIFIED').forEach(alt => {
        const radiusMeters = alt.geoRadiusMeters || 1000;
        const circle = L.circle([alt.latitude, alt.longitude], {
          radius: radiusMeters,
          color: '#dc2626',
          fillColor: '#ef4444',
          fillOpacity: 0.18,
          weight: 2,
          dashArray: '6, 8'
        });

        circle.bindPopup(`
          <div style="padding:10px; font-family:Inter, sans-serif; color:#0f172a; font-size:12px; line-height:1.4;">
            <div style="font-weight:bold; color:#dc2626; font-family:monospace; margin-bottom:4px; display:flex; align-items:center; gap:4px;">
              <span>🚨</span> <span>MUNICIPAL CORDON BUFFER (${radiusMeters * 2 / 1000} KM DIA)</span>
            </div>
            <div style="font-weight:700; font-size:13px; margin-bottom:4px; color:#0f172a;">${alt.buildingName}</div>
            <p style="margin:0 0 6px 0; color:#475569; font-size:11px;">${alt.reasonForAlert}</p>
            <div style="background:#fef2f2; padding:6px; border-radius:6px; border:1px solid #fecaca; color:#991b1b; font-size:11px;">
              <strong>Directive:</strong> ${alt.officialInstructions}
            </div>
          </div>
        `);

        circle.addTo(layerGroup);
      });
    }

    // 2. Draw Building Markers
    buildings.forEach(b => {
      const isSelected = selectedBuildingId === b.id;
      const marker = L.marker([b.latitude, b.longitude], {
        icon: createRiskIcon(b.riskIndicator, b.hasActiveAlert, b.maintenancePriority, isSelected)
      });

      marker.on('click', () => {
        onSelectBuilding(b.id);
      });

      const popupContent = document.createElement('div');
      popupContent.style.padding = '12px';
      popupContent.style.fontFamily = 'Inter, sans-serif';
      popupContent.style.color = '#0f172a';
      popupContent.style.fontSize = '12px';
      popupContent.style.minWidth = '240px';
      popupContent.style.background = '#ffffff';

      const riskColor = b.riskIndicator === 'CRITICAL' ? '#b91c1c' :
        b.riskIndicator === 'HIGH' ? '#c2410c' :
        b.riskIndicator === 'MODERATE' ? '#a16207' :
        b.riskIndicator === 'INSUFFICIENT_DATA' ? '#475569' : '#15803d';

      const riskBg = b.riskIndicator === 'CRITICAL' ? '#fef2f2' :
        b.riskIndicator === 'HIGH' ? '#fff7ed' :
        b.riskIndicator === 'MODERATE' ? '#fefce8' :
        b.riskIndicator === 'INSUFFICIENT_DATA' ? '#f1f5f9' : '#f0fdf4';

      popupContent.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <span style="font-size:10px; font-family:monospace; color:#475569; background:#f1f5f9; padding:2px 6px; border-radius:4px; border:1px solid #cbd5e1; font-weight:600;">
            ${b.id}
          </span>
          <span style="font-size:10px; font-family:monospace; font-weight:bold; color:${riskColor}; background:${riskBg}; padding:2px 6px; border-radius:4px; border:1px solid #e2e8f0;">
            ${b.riskIndicator}
          </span>
        </div>
        <h4 style="font-size:13px; font-weight:bold; color:#0f172a; margin:4px 0 2px 0; line-height:1.3;">
          ${b.name}
        </h4>
        <p style="font-size:11px; color:#475569; margin:0 0 8px 0;">
          ${b.address} • <strong>${b.ward}</strong>
        </p>

        <div style="background:#f8fafc; padding:8px 10px; border-radius:8px; border:1px solid #e2e8f0; margin-bottom:8px; font-size:11px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span style="color:#64748b;">Category:</span>
            <span style="font-weight:600; color:#0f172a;">${b.category || b.buildingType}</span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="color:#64748b;">Data Completeness:</span>
            <span style="color:#0f766e; font-family:monospace; font-weight:bold;">${b.dataConfidenceScore}%</span>
          </div>
        </div>

        ${b.hasActiveAlert ? `<div style="background:#fef2f2; color:#b91c1c; padding:4px 8px; border-radius:6px; font-size:10px; font-family:monospace; font-weight:bold; margin-bottom:8px; border:1px solid #fecaca; text-align:center;">🚨 ACTIVE EMERGENCY CORDON</div>` : ''}
      `;

      const btn = document.createElement('button');
      btn.innerText = 'Assess Building & Passport →';
      btn.style.width = '100%';
      btn.style.padding = '7px 10px';
      btn.style.background = '#0f766e';
      btn.style.color = '#ffffff';
      btn.style.border = 'none';
      btn.style.borderRadius = '8px';
      btn.style.fontSize = '11px';
      btn.style.fontWeight = 'bold';
      btn.style.cursor = 'pointer';
      btn.onclick = () => onSelectBuilding(b.id);

      popupContent.appendChild(btn);

      marker.bindPopup(popupContent);
      marker.addTo(layerGroup);
    });

  }, [buildings, alerts, showAlertRadii, onSelectBuilding, selectedBuildingId]);

  return (
    <div className={`w-full ${heightClass} rounded-2xl overflow-hidden bg-white border border-slate-200 relative flex flex-col`}>
      {/* Top Status Banner */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-700">Nagpur Municipal GIS Layer</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500 font-mono text-[11px]">{buildings.length} mapped structures</span>
        </div>

        <div>
          {apiConfigured ? (
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[10px] font-bold rounded">
              Google Maps API Active
            </span>
          ) : (
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 font-mono text-[10px] font-medium rounded flex items-center gap-1">
              <Info className="w-3 h-3 text-slate-400" />
              Google Maps API not configured (Municipal GIS Fallback Active)
            </span>
          )}
        </div>
      </div>

      {/* Map Canvas Container */}
      <div
        ref={mapContainerRef}
        className="w-full flex-1 min-h-[460px] relative"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};
