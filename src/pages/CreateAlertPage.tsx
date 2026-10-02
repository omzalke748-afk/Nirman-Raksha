import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AlertType, AlertSeverity } from '../types';
import {
  ShieldAlert,
  Radio,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  PhoneCall,
  UserCheck,
  Building2,
  Layers,
  Send,
  Bell,
  Smartphone,
  Mail,
  Info
} from 'lucide-react';

interface Props {
  setActiveTab: (tab: string) => void;
}

export const CreateAlertPage: React.FC<Props> = ({ setActiveTab }) => {
  const {
    buildings,
    activeBuildingId,
    createAlert,
    publishAlert,
    userRole
  } = useApp();

  const [selectedBuildingId, setSelectedBuildingId] = useState(activeBuildingId || (buildings[0]?.id ?? 'NMC-SAT-2026-089'));
  const [alertType, setAlertType] = useState<AlertType>('RESTRICT_ACCESS');
  const [severity, setSeverity] = useState<AlertSeverity>('CRITICAL');
  // Default: 2 km diameter = 1000 meters radius
  const [geoRadius, setGeoRadius] = useState<number>(1000);
  const [reason, setReason] = useState('Severe diagonal shear distress exceeding 8mm recorded at ground floor load-bearing plinth. Visible risk of localized structural failure.');
  const [instructions, setInstructions] = useState('Maintain a cordon clearance from exterior perimeter. Evacuate ground floor occupancy immediately and contact NMC Disaster Management Cell (0712-2567035).');
  const [officerName, setOfficerName] = useState('Shri Manoj S. Talware');
  const [designation, setDesignation] = useState('Executive Engineer (Hazardous Buildings Cell), NMC');
  const [contact, setContact] = useState('NMC Disaster Cell: 0712-2567035 / Control Room: 101');
  const [isSuccess, setIsSuccess] = useState(false);

  const selectedBuilding = buildings.find(b => b.id === selectedBuildingId) || buildings[0];

  // Calculate actual mapped buildings within the selected radius
  const calculateBuildingsInRadius = (centerLat: number, centerLng: number, radiusM: number) => {
    return buildings.filter(b => {
      // Haversine approximate distance
      const R = 6371e3; // metres
      const φ1 = centerLat * Math.PI/180;
      const φ2 = b.latitude * Math.PI/180;
      const Δφ = (b.latitude - centerLat) * Math.PI/180;
      const Δλ = (b.longitude - centerLng) * Math.PI/180;

      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const d = R * c;

      return d <= radiusM;
    });
  };

  const affectedBuildings = selectedBuilding ? calculateBuildingsInRadius(selectedBuilding.latitude, selectedBuilding.longitude, geoRadius) : [];
  const affectedAreaSqKm = ((Math.PI * Math.pow(geoRadius / 1000, 2))).toFixed(2);

  const handleCreateAndPublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBuilding) return;

    const newAlert = createAlert({
      buildingId: selectedBuilding.id,
      buildingName: selectedBuilding.name,
      ward: selectedBuilding.ward,
      area: selectedBuilding.area,
      latitude: selectedBuilding.latitude,
      longitude: selectedBuilding.longitude,
      alertType,
      severity,
      geoRadiusMeters: geoRadius,
      reasonForAlert: reason,
      officialInstructions: instructions,
      emergencyContact: contact,
      verificationOfficer: officerName,
      officerDesignation: designation,
      verificationDate: new Date().toISOString().split('T')[0],
      authorityApprovalBadge: `NMC-AUTH-SEAL-2026/${selectedBuilding.id.slice(-6)}`
    });

    publishAlert(newAlert.id);
    setIsSuccess(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16 max-w-4xl mx-auto text-slate-800">
      
      {/* Title */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-2">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 bg-red-50 border border-red-200 rounded-full text-xs font-mono font-bold text-red-700 flex items-center space-x-1.5">
            <Radio className="w-3.5 h-3.5 text-red-600" />
            <span>AUTHORITY EARLY WARNING WORKFLOW</span>
          </span>
          <span className="text-xs font-mono text-slate-500">NMC Disaster Management Protocol</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Issue Geographic Safety Warning
        </h1>
        <p className="text-xs text-slate-500">
          Authorize and broadcast a verified location-based structural emergency notice to citizens residing within the defined geo-fenced radius in Nagpur.
        </p>
      </div>

      {isSuccess ? (
        <div className="bg-white p-8 rounded-2xl border border-emerald-300 text-center space-y-4 shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Public Safety Alert Published & Broadcast!</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            The emergency alert has been verified by the authority and published to the public portal. A <strong>{(geoRadius * 2 / 1000).toFixed(1)} km diameter</strong> ({geoRadius}m radius) broadcast zone is now active around <strong>{selectedBuilding?.name}</strong>.
          </p>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 max-w-md mx-auto text-xs text-left space-y-2">
            <span className="font-bold text-slate-800 block">Broadcast Channel Status:</span>
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5"><Bell className="w-3.5 h-3.5 text-teal-700" /> In-App Civic Alert</span>
              <span className="text-emerald-700 font-bold font-mono">ACTIVE</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5 text-slate-400" /> Cellular Broadcast (SMS)</span>
              <span className="text-slate-500 font-mono text-[11px]">Simulation / provider not configured</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> Civic Authority Email Wire</span>
              <span className="text-slate-500 font-mono text-[11px]">Simulation / provider not configured</span>
            </div>
          </div>

          <div className="flex justify-center space-x-3 pt-4">
            <button
              onClick={() => setActiveTab('alerts')}
              className="px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              View in Public Alerts Portal
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold border border-slate-300 transition"
            >
              Return to Map
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleCreateAndPublish} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          
          {/* Step 1: Target Structure Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs flex items-center justify-center font-bold">1</span>
              <span>Select Hazardous Building for Warning</span>
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Target Building / Complex
              </label>
              <select
                value={selectedBuildingId}
                onChange={e => setSelectedBuildingId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
              >
                {buildings.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.id} • {b.name} ({b.ward} - {b.riskIndicator} RISK)
                  </option>
                ))}
              </select>
            </div>

            {selectedBuilding && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between font-semibold text-slate-900">
                  <span>{selectedBuilding.name}</span>
                  <span className="font-mono text-red-700 font-bold">{selectedBuilding.riskIndicator}</span>
                </div>
                <p className="text-slate-500">{selectedBuilding.address} • Ward: {selectedBuilding.ward}</p>
                <p className="text-[11px] font-mono text-slate-400">
                  Coordinates: {selectedBuilding.latitude.toFixed(5)}° N, {selectedBuilding.longitude.toFixed(5)}° E
                </p>
              </div>
            )}
          </div>

          {/* Step 2: Warning Type & Severity */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs flex items-center justify-center font-bold">2</span>
              <span>Statutory Directive & Severity</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-slate-600 mb-1">Alert Classification</label>
                <select
                  value={alertType}
                  onChange={e => setAlertType(e.target.value as AlertType)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                >
                  <option value="IMMEDIATE_EVACUATION">Immediate Evacuation (C1 Dangerous)</option>
                  <option value="RESTRICT_ACCESS">Restrict Perimeter Access (Cordon)</option>
                  <option value="SHORING_REQUIRED">Structural Shoring Required (C2)</option>
                  <option value="ENGINEERING_AUDIT_DUE">Mandatory Structural Audit Due</option>
                  <option value="PUBLIC_CAUTION">General Public Safety Caution</option>
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-600 mb-1">Severity Level</label>
                <select
                  value={severity}
                  onChange={e => setSeverity(e.target.value as AlertSeverity)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                >
                  <option value="CRITICAL">Critical Danger (Red)</option>
                  <option value="HIGH">High Alert (Orange)</option>
                  <option value="MODERATE">Moderate Caution (Yellow)</option>
                  <option value="ADVISORY">Informational Advisory (Blue)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Step 3: Geographic Broadcast Zone (Default 2 km Diameter / 1000m Radius) */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs flex items-center justify-center font-bold">3</span>
              <span>Geographic Warning Broadcast Radius (Default: 2 km Diameter)</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold">Broadcast Radius from Structure:</span>
                <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {geoRadius} meters ({(geoRadius * 2 / 1000).toFixed(1)} km diameter)
                </span>
              </div>

              <input
                type="range"
                min={200}
                max={3000}
                step={100}
                value={geoRadius}
                onChange={e => setGeoRadius(Number(e.target.value))}
                className="w-full accent-teal-700"
              />

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">AFFECTED GEOGRAPHIC AREA</span>
                  <span className="font-bold text-slate-900">{affectedAreaSqKm} sq km</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">MAPPED STRUCTURES IN BUFFER</span>
                  <span className="font-mono font-bold text-teal-800">{affectedBuildings.length} registered buildings</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">BROADCAST METHOD</span>
                  <span className="font-mono text-slate-700">Geo-fenced Push & Portal</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 italic">
                * Note: The broadcast radius is an authority-defined emergency zone for citizen safety alerts and does not represent direct structural debris reach.
              </p>
            </div>
          </div>

          {/* Step 4: Reasons & Public Directives */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs flex items-center justify-center font-bold">4</span>
              <span>Official Reason & Citizen Directive</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold uppercase text-slate-600 mb-1">Reason for Public Alert</label>
                <textarea
                  rows={2}
                  required
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-600 mb-1">Mandatory Citizen Safety Instructions</label>
                <textarea
                  rows={2}
                  required
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>
            </div>
          </div>

          {/* Step 5: Authority Verification Seal */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs flex items-center justify-center font-bold">5</span>
              <span>Authorizing Officer Credentials</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Officer Name</label>
                <input
                  type="text"
                  required
                  value={officerName}
                  onChange={e => setOfficerName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Designation</label>
                <input
                  type="text"
                  required
                  value={designation}
                  onChange={e => setDesignation(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Control Room Hotline</label>
                <input
                  type="text"
                  required
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('authority')}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center space-x-2"
            >
              <Radio className="w-4 h-4" />
              <span>Publish & Broadcast 2km Safety Alert</span>
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
