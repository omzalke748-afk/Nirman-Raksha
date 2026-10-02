import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NagpurMap } from '../components/map/NagpurMap';
import { NAGPUR_ZONES } from '../data/initialData';
import {
  Map as MapIcon,
  Layers,
  Filter,
  ShieldAlert,
  Sparkles,
  MapPin,
  ArrowRight,
  Info
} from 'lucide-react';

interface Props {
  setActiveTab: (tab: string) => void;
}

export const RiskMapPage: React.FC<Props> = ({ setActiveTab }) => {
  const { buildings, alerts, setActiveBuildingId, demoMode } = useApp();

  const [selectedWard, setSelectedWard] = useState('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [showAlertRadii, setShowAlertRadii] = useState(true);

  // Filter buildings
  const displayedBuildings = buildings.filter(b => {
    if (!demoMode && b.isSynthetic) return false;
    if (selectedWard !== 'ALL' && b.ward !== selectedWard) return false;
    if (selectedRisk !== 'ALL' && b.riskIndicator !== selectedRisk) return false;
    return true;
  });

  const handleOpenBuilding = (id: string) => {
    setActiveBuildingId(id);
    setActiveTab('health-passport');
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-12 text-slate-800">
      
      {/* Map Header & Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <MapIcon className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Nagpur Municipal GIS Risk Map
            </h1>
            <span className="px-2.5 py-0.5 bg-blue-50 border border-blue-200 rounded-full text-xs font-mono text-blue-700 font-semibold">
              Live Geospatial Layer
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real coordinates across 10 NMC administrative zones with official Section 264 municipal notices & emergency geo-fenced alert buffers.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
          <span className="text-slate-500 text-[11px] font-bold">Legend:</span>
          <span className="inline-flex items-center space-x-1 text-red-700"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /><span>Critical</span></span>
          <span className="inline-flex items-center space-x-1 text-orange-700"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /><span>High</span></span>
          <span className="inline-flex items-center space-x-1 text-amber-800"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /><span>Moderate</span></span>
          <span className="inline-flex items-center space-x-1 text-emerald-700"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span>Low</span></span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          
          <div>
            <select
              value={selectedWard}
              onChange={e => setSelectedWard(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 font-sans"
            >
              <option value="ALL">All NMC Zones (1 to 10)</option>
              {NAGPUR_ZONES.map(z => (
                <option key={z.zoneNumber} value={`Zone ${z.zoneNumber} - ${z.name}`}>
                  Zone {z.zoneNumber} - {z.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedRisk}
              onChange={e => setSelectedRisk(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 font-mono"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="CRITICAL">Critical Risk</option>
              <option value="HIGH">High Risk</option>
              <option value="MODERATE">Moderate Risk</option>
              <option value="LOW">Low Risk</option>
              <option value="INSUFFICIENT_DATA">Insufficient Data</option>
            </select>
          </div>

          <label className="flex items-center space-x-2 text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showAlertRadii}
              onChange={e => setShowAlertRadii(e.target.checked)}
              className="rounded border-slate-300 text-red-600 focus:ring-0"
            />
            <span className="font-medium">Active Geo-Fenced Alert Radii</span>
          </label>

        </div>

        <div className="text-[11px] font-mono text-slate-500">
          Showing <strong className="text-slate-900 font-bold">{displayedBuildings.length}</strong> markers on map
        </div>
      </div>

      {/* GIS Leaflet Map Container */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 h-[620px] relative">
        <NagpurMap
          buildings={displayedBuildings}
          alerts={alerts}
          showAlertRadii={showAlertRadii}
          onSelectBuilding={handleOpenBuilding}
        />
      </div>

    </div>
  );
};
