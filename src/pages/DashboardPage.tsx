import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { NagpurMap } from '../components/map/NagpurMap';
import { NAGPUR_ZONES } from '../data/initialData';
import { RiskBadge } from '../components/common/RiskBadge';
import { AssessBuildingModal } from '../components/common/AssessBuildingModal';
import { BuildingAssessmentPanel } from '../components/common/BuildingAssessmentPanel';
import { searchNagpurPlaces } from '../services/googleMapsService';
import { BuildingRecord, BuildingCategory } from '../types';
import {
  MapPin,
  ShieldAlert,
  AlertTriangle,
  Wrench,
  Sparkles,
  Search,
  ChevronRight,
  X,
  FileText,
  CloudSun,
  Flame,
  Compass,
  PlusCircle,
  Building2,
  CheckCircle2,
  Layers,
  Database,
  Info,
  Droplets,
  Activity,
  ArrowUpRight
} from 'lucide-react';

interface Props {
  setActiveTab: (tab: string) => void;
}

export const DashboardPage: React.FC<Props> = ({ setActiveTab }) => {
  const {
    buildings,
    alerts,
    environment,
    activeBuildingId,
    setActiveBuildingId,
    demoMode,
    userRole,
    dataSources
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MAINTENANCE' | 'ALERT'>('ALL');
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [flyToCoords, setFlyToCoords] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);
  const [isAssessModalOpen, setIsAssessModalOpen] = useState(false);
  const [assessPrefillName, setAssessPrefillName] = useState('');
  const [selectedBuildingForPanel, setSelectedBuildingForPanel] = useState<BuildingRecord | null>(null);

  // Filtered Buildings
  const filteredBuildings = useMemo(() => {
    return buildings.filter(b => {
      if (!demoMode && b.isSynthetic) return false;
      if (selectedZone !== 'ALL' && !b.ward.includes(selectedZone)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = b.name.toLowerCase().includes(q) ||
          b.ward.toLowerCase().includes(q) ||
          b.address.toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q) ||
          (b.category && b.category.toLowerCase().includes(q));
        if (!match) return false;
      }
      if (activeFilter === 'CRITICAL') return b.riskIndicator === 'CRITICAL';
      if (activeFilter === 'HIGH') return b.riskIndicator === 'HIGH';
      if (activeFilter === 'MAINTENANCE') return b.maintenancePriority === 'IMMEDIATE_REPAIR' || b.maintenancePriority === 'HIGH';
      if (activeFilter === 'ALERT') return b.hasActiveAlert;
      return true;
    });
  }, [buildings, demoMode, selectedZone, searchQuery, activeFilter]);

  // Selected building object for panel
  const activeBuilding = useMemo(() => {
    return buildings.find(b => b.id === activeBuildingId) || buildings[0];
  }, [buildings, activeBuildingId]);

  // City metrics
  const criticalCount = buildings.filter(b => b.riskIndicator === 'CRITICAL').length;
  const highCount = buildings.filter(b => b.riskIndicator === 'HIGH').length;
  const attentionCount = buildings.filter(b => b.maintenancePriority === 'IMMEDIATE_REPAIR' || b.maintenancePriority === 'HIGH' || b.riskIndicator === 'CRITICAL' || b.riskIndicator === 'HIGH').length;
  const alertCount = alerts.filter(a => a.status === 'ACTIVE').length;

  const handleSelectBuildingOnMap = (id: string) => {
    setActiveBuildingId(id);
    const b = buildings.find(item => item.id === id);
    if (b) {
      setSelectedBuildingForPanel(b);
      setFlyToCoords({ lat: b.latitude, lng: b.longitude, zoom: 16 });
    }
  };

  const handleQuickSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Check if matching registered building
    const matched = buildings.find(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (matched) {
      handleSelectBuildingOnMap(matched.id);
    } else {
      setAssessPrefillName(searchQuery.trim());
      setIsAssessModalOpen(true);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* 1. TOP: Global Search & Primary Action Hero */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          <form onSubmit={handleQuickSearchSubmit} className="flex-1 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search any building, institution, landmark or address in Nagpur..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-12 pr-28 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition font-medium"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg transition"
            >
              Search
            </button>
          </form>

          <button
            onClick={() => {
              setAssessPrefillName('');
              setIsAssessModalOpen(true);
            }}
            className="px-5 py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-2 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ ASSESS ANY BUILDING</span>
          </button>
        </div>
      </div>

      {/* 2. Nagpur Risk Map & Interactive Command Center */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white min-h-[580px] flex flex-col">
        
        {/* Floating HUD Bar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 z-10">
          
          {/* Ward Selector & Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-medium">
              <Compass className="w-3.5 h-3.5 text-teal-700" />
              <select
                value={selectedZone}
                onChange={e => {
                  const val = e.target.value;
                  setSelectedZone(val);
                  if (val === 'ALL') {
                    setFlyToCoords({ lat: 21.1458, lng: 79.0882, zoom: 13 });
                  } else {
                    const z = NAGPUR_ZONES.find(item => item.name.toLowerCase().includes(val.toLowerCase()));
                    if (z) {
                      const zoneCoords: Record<number, [number, number]> = {
                        1: [21.1214, 79.0732],
                        2: [21.1518, 79.0763],
                        3: [21.1305, 79.0985],
                        4: [21.1332, 79.0818],
                        5: [21.1380, 79.1150],
                        6: [21.1441, 79.1028],
                        7: [21.1568, 79.1124],
                        8: [21.1492, 79.1245],
                        9: [21.1750, 79.1050],
                        10: [21.1624, 79.0812],
                      };
                      const coords = zoneCoords[z.zoneNumber] || [21.1458, 79.0882];
                      setFlyToCoords({ lat: coords[0], lng: coords[1], zoom: 15 });
                    }
                  }
                }}
                className="bg-transparent text-slate-800 text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL">📍 All Nagpur (10 Zones)</option>
                {NAGPUR_ZONES.map(z => (
                  <option key={z.zoneNumber} value={z.name}>
                    Zone {z.zoneNumber}: {z.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 bg-white border border-slate-300 p-1 rounded-xl">
              <button
                onClick={() => setActiveFilter('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  activeFilter === 'ALL' ? 'bg-teal-700 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({buildings.length})
              </button>
              <button
                onClick={() => setActiveFilter('CRITICAL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  activeFilter === 'CRITICAL' ? 'bg-red-700 text-white font-bold' : 'text-red-700 hover:bg-red-50'
                }`}
              >
                Critical ({criticalCount})
              </button>
              <button
                onClick={() => setActiveFilter('HIGH')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  activeFilter === 'HIGH' ? 'bg-orange-700 text-white font-bold' : 'text-orange-700 hover:bg-orange-50'
                }`}
              >
                High Risk ({highCount})
              </button>
              <button
                onClick={() => setActiveFilter('ALERT')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  activeFilter === 'ALERT' ? 'bg-purple-700 text-white font-bold' : 'text-purple-700 hover:bg-purple-50'
                }`}
              >
                Active Alerts ({alertCount})
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
            <span>Click any map marker to view Building Assessment Panel</span>
          </div>

        </div>

        {/* Map Body */}
        <div className="flex-1 w-full h-full min-h-[520px] relative">
          <NagpurMap
            buildings={filteredBuildings}
            alerts={alerts}
            showAlertRadii={true}
            onSelectBuilding={handleSelectBuildingOnMap}
            selectedBuildingId={selectedBuildingForPanel?.id || activeBuildingId || undefined}
            flyToLocation={flyToCoords}
            heightClass="h-full w-full min-h-[520px]"
          />

          {/* Overlay Building Assessment Panel when a building is selected */}
          {selectedBuildingForPanel && (
            <div className="absolute top-4 right-4 z-[1000] w-full max-w-md">
              <BuildingAssessmentPanel
                building={selectedBuildingForPanel}
                onClose={() => setSelectedBuildingForPanel(null)}
                onOpenPassport={(id) => {
                  setActiveBuildingId(id);
                  setActiveTab('health-passport');
                }}
                onStartInspection={(id) => {
                  setActiveBuildingId(id);
                  setActiveTab('inspections');
                }}
                onOpenReport={(id) => {
                  setActiveBuildingId(id);
                  setActiveTab('reports');
                }}
              />
            </div>
          )}
        </div>

      </div>

      {/* 3. Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Assessed Structures
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {buildings.length}
            </div>
            <span className="text-[11px] text-teal-700 font-medium">
              Across 10 Municipal Zones
            </span>
          </div>
          <div className="p-3 bg-teal-50 text-teal-700 rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Critical & High Risk
            </span>
            <div className="text-2xl font-bold text-red-700 mt-1">
              {criticalCount + highCount}
            </div>
            <span className="text-[11px] text-slate-500">
              {criticalCount} Critical • {highCount} High
            </span>
          </div>
          <div className="p-3 bg-red-50 text-red-700 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Attention Required
            </span>
            <div className="text-2xl font-bold text-amber-700 mt-1">
              {attentionCount}
            </div>
            <span className="text-[11px] text-slate-500">
              Overdue inspection / structural defect
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
            <Wrench className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Active Cordon Warnings
            </span>
            <div className="text-2xl font-bold text-purple-700 mt-1">
              {alertCount}
            </div>
            <span className="text-[11px] text-slate-500">
              2 km geo-broadcast buffer
            </span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-700 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 4. Recent Assessments & Registry Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Recent Building Assessments in Nagpur
            </h3>
            <p className="text-xs text-slate-500">
              Identifiable public structures, institutions, and residential complexes with verified data completeness.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('buildings')}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            View Full Registry ({buildings.length}) <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Building / Institution</th>
                <th className="p-3">Category</th>
                <th className="p-3">Zone / Ward</th>
                <th className="p-3">Risk Indicator</th>
                <th className="p-3">Data Completeness</th>
                <th className="p-3">MahaVastu Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {buildings.slice(0, 6).map(b => (
                <tr key={b.id} className="hover:bg-slate-50/70 transition">
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{b.name}</div>
                    <div className="text-[11px] text-slate-500 truncate max-w-xs">{b.address}</div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200 font-mono text-[10px]">
                      {b.category || b.buildingType}
                    </span>
                  </td>
                  <td className="p-3">
                    <div>{b.ward}</div>
                    <div className="text-[10px] text-slate-400">Zone {b.zoneNumber}</div>
                  </td>
                  <td className="p-3">
                    <RiskBadge level={b.riskIndicator} score={b.riskScore} />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-teal-600 h-full rounded-full" style={{ width: `${b.dataConfidenceScore}%` }} />
                      </div>
                      <span className="font-mono text-teal-700 font-bold">{b.dataConfidenceScore}%</span>
                    </div>
                  </td>
                  <td className="p-3">
                    {b.sanctionedPlanNo?.value ? (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-mono">
                        BPMS Verified
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px]">
                        Municipal Record
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        setActiveBuildingId(b.id);
                        setActiveTab('health-passport');
                      }}
                      className="px-3 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold rounded-lg border border-teal-200 transition"
                    >
                      Health Passport →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Live Environmental Telemetry & Data Sources Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Environment & Ground Context */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CloudSun className="w-4 h-4 text-amber-600" />
              Nagpur Live Environmental & Soil Context
            </h4>
            <span className="text-[10px] font-mono font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded border border-teal-200">
              Open-Meteo & GSDA
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Environmental factors serve as structural context rather than direct proof of failure.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <span className="text-slate-400 block text-[10px]">TEMPERATURE</span>
              <span className="font-bold text-slate-800 text-sm font-mono">{environment.temperatureC}°C</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <span className="text-slate-400 block text-[10px]">HUMIDITY</span>
              <span className="font-bold text-slate-800 text-sm font-mono">{environment.relativeHumidityPct}%</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <span className="text-slate-400 block text-[10px]">SOIL TYPE</span>
              <span className="font-bold text-slate-800 text-xs truncate">Black Cotton</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <span className="text-slate-400 block text-[10px]">GROUNDWATER</span>
              <span className="font-bold text-slate-800 text-xs font-mono">6.2m bgl</span>
            </div>
          </div>
        </div>

        {/* Multi-Source Connectors Status */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-teal-700" />
              Multi-Source Repository Provenance
            </h4>
            <span className="text-[10px] font-mono text-slate-500">6 Connected Sources</span>
          </div>

          <div className="space-y-1.5 text-xs">
            {dataSources.slice(0, 4).map(ds => (
              <div key={ds.id} className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800">{ds.name}</span>
                  <span className="text-[10px] text-slate-400 block">{ds.refreshFrequency} update</span>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                  ds.connectionStatus === 'LIVE' || ds.connectionStatus === 'STATIC_OFFICIAL_RECORD'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {ds.connectionStatus}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Assess Building Modal */}
      <AssessBuildingModal
        isOpen={isAssessModalOpen}
        onClose={() => setIsAssessModalOpen(false)}
        initialQuery={assessPrefillName}
        onSuccess={(id) => {
          setActiveBuildingId(id);
          setActiveTab('health-passport');
        }}
      />
    </div>
  );
};
