import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RiskBadge } from '../components/common/RiskBadge';
import { DataProvenanceBadge } from '../components/common/DataProvenanceBadge';
import { AssessBuildingModal } from '../components/common/AssessBuildingModal';
import { NAGPUR_ZONES } from '../data/initialData';
import { BuildingCategory } from '../types';
import {
  Building2,
  Search,
  Filter,
  MapPin,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  PlusCircle,
  Calendar,
  Layers,
  FileCheck2,
  Compass
} from 'lucide-react';

interface Props {
  setActiveTab: (tab: string) => void;
}

export const BuildingsPage: React.FC<Props> = ({ setActiveTab }) => {
  const { buildings, setActiveBuildingId, demoMode } = useApp();

  const [search, setSearch] = useState('');
  const [selectedWard, setSelectedWard] = useState('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isAssessModalOpen, setIsAssessModalOpen] = useState(false);

  const categories: BuildingCategory[] = [
    'Educational',
    'Healthcare',
    'Residential',
    'Hostel / PG',
    'Commercial',
    'Shopping Mall',
    'Banking / Financial',
    'Government',
    'Court / Legal',
    'Industrial',
    'Public Infrastructure',
    'Examination Centre',
    'Religious',
    'Mixed Use',
    'Other'
  ];

  // Filter Logic
  const filteredBuildings = buildings.filter(b => {
    if (!demoMode && b.isSynthetic) return false;

    // Search query matches name, ID, address, ward, area, campus, block, bpms, or category
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        b.name.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q) ||
        b.ward.toLowerCase().includes(q) ||
        b.area.toLowerCase().includes(q) ||
        (b.campusName && b.campusName.toLowerCase().includes(q)) ||
        (b.blockName && b.blockName.toLowerCase().includes(q)) ||
        (b.blockCode && b.blockCode.toLowerCase().includes(q)) ||
        (b.sanctionedPlanNo?.value && b.sanctionedPlanNo.value.toLowerCase().includes(q)) ||
        (b.category && b.category.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Ward
    if (selectedWard !== 'ALL' && b.ward !== selectedWard) return false;

    // Risk
    if (selectedRisk !== 'ALL' && b.riskIndicator !== selectedRisk) return false;

    // Category
    if (selectedCategory !== 'ALL' && (b.category || b.buildingType) !== selectedCategory) return false;

    return true;
  });

  const handleOpenPassport = (id: string) => {
    setActiveBuildingId(id);
    setActiveTab('health-passport');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 text-slate-800">
      
      {/* Page Title & Scope */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-xl text-teal-700">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Nagpur Universal Building Registry
                </h1>
                <span className="px-2.5 py-0.5 bg-teal-50 border border-teal-200 rounded-full text-xs font-mono text-teal-800 font-bold">
                  NMC Scope
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Official municipal records, colleges, hospitals, malls, schools, courts & multi-source assessed structures across Nagpur.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAssessModalOpen(true)}
            className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ ASSESS ANY BUILDING</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          {/* Universal Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search building, CTS, BPMS, ward..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 font-medium"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 font-medium"
            >
              <option value="ALL">🏢 All Categories ({categories.length})</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Municipal Zone Filter */}
          <div>
            <select
              value={selectedWard}
              onChange={e => setSelectedWard(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 font-medium"
            >
              <option value="ALL">📍 All Municipal Zones (10 Zones)</option>
              {NAGPUR_ZONES.map(z => (
                <option key={z.zoneNumber} value={z.name}>
                  Zone {z.zoneNumber} - {z.name}
                </option>
              ))}
            </select>
          </div>

          {/* Risk Level Filter */}
          <div>
            <select
              value={selectedRisk}
              onChange={e => setSelectedRisk(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 font-medium"
            >
              <option value="ALL">⚡ All Risk Levels</option>
              <option value="CRITICAL">🚨 Critical Danger</option>
              <option value="HIGH">⚠️ High Risk</option>
              <option value="MODERATE">⚡ Moderate Risk</option>
              <option value="LOW">✓ Low Risk / Structurally Sound</option>
            </select>
          </div>

        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>Showing <strong>{filteredBuildings.length}</strong> of <strong>{buildings.length}</strong> assessed structures</span>
          <span className="font-mono text-[11px] text-teal-700 font-semibold">Nagpur Urban Registry</span>
        </div>
      </div>

      {/* Buildings Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBuildings.map(b => (
          <div
            key={b.id}
            className="bg-white border border-slate-200 hover:border-teal-500 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between group space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                    {b.category || b.buildingType}
                  </span>
                  {b.campusId && (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded">
                      {b.blockCode ? b.blockCode.replace(/_/g, ' ') : 'CAMPUS'}
                    </span>
                  )}
                </div>
                <RiskBadge level={b.riskIndicator} score={b.riskScore} />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-800 transition line-clamp-1">
                  {b.name}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{b.address} • {b.ward}</span>
                </p>
              </div>

              {/* Data Completeness Bar */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Data Completeness:</span>
                  <span className="font-mono font-bold text-teal-700">{b.dataConfidenceScore}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-teal-600 h-full rounded-full" style={{ width: `${b.dataConfidenceScore}%` }} />
                </div>
              </div>

              {/* Attributes */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">FLOORS & SYSTEM</span>
                  <span className="font-semibold text-slate-800">{b.numberOfFloors?.value || 4} Fl • {b.structuralSystem?.value || 'RCC'}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">MAHAVASTU BPMS</span>
                  <span className="font-mono text-slate-800 font-semibold">{b.sanctionedPlanNo?.value ? 'Sanctioned' : 'Not linked'}</span>
                </div>
              </div>

              {b.hasActiveAlert && (
                <div className="p-2 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold text-center">
                  🚨 ACTIVE 2KM SAFETY CORDON
                </div>
              )}
            </div>

            <button
              onClick={() => handleOpenPassport(b.id)}
              className="w-full py-2 bg-teal-50 hover:bg-teal-700 hover:text-white text-teal-800 font-semibold text-xs rounded-xl border border-teal-200 transition flex items-center justify-center gap-1.5"
            >
              <span>View Health Passport</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {filteredBuildings.length === 0 && (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-3">
          <p className="text-slate-500 text-sm">No buildings match your active search filters.</p>
          <button
            onClick={() => setIsAssessModalOpen(true)}
            className="px-5 py-2.5 bg-teal-700 text-white text-xs font-bold rounded-xl"
          >
            + Assess a New Building in Nagpur
          </button>
        </div>
      )}

      <AssessBuildingModal
        isOpen={isAssessModalOpen}
        onClose={() => setIsAssessModalOpen(false)}
        onSuccess={(id) => {
          setActiveBuildingId(id);
          setActiveTab('health-passport');
        }}
      />
    </div>
  );
};
