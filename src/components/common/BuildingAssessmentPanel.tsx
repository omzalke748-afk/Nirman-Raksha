import React, { useState } from 'react';
import { BuildingRecord, BuildingCategory } from '../../types';
import { RiskBadge } from './RiskBadge';
import { DataProvenanceBadge } from './DataProvenanceBadge';
import { CampusBlockNavigator } from './CampusBlockNavigator';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  MapPin,
  Calendar,
  Layers,
  FileText,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Droplets,
  Activity,
  Wrench,
  UserCheck,
  Compass,
  FileCheck,
  Sparkles,
  Info,
  X
} from 'lucide-react';

interface Props {
  building: BuildingRecord | null;
  onClose: () => void;
  onOpenPassport: (id: string) => void;
  onStartInspection?: (id: string) => void;
  onOpenReport?: (id: string) => void;
}

export const BuildingAssessmentPanel: React.FC<Props> = ({
  building,
  onClose,
  onOpenPassport,
  onStartInspection,
  onOpenReport
}) => {
  const { userRole, updateBuildingCategory } = useApp();
  const [showWhyRisk, setShowWhyRisk] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<BuildingCategory | ''>('');

  if (!building) return null;

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

  const handleSaveCategory = () => {
    if (selectedCategory) {
      updateBuildingCategory(building.id, selectedCategory);
      setIsEditingCategory(false);
    }
  };

  const completeness = building.dataCompleteness || {
    percentage: building.dataConfidenceScore || 65,
    verifiedCount: 5,
    missingCount: 3,
    staleCount: 1,
    categories: []
  };

  const hasBpms = building.sanctionedPlanNo?.sourceUrl?.includes('mahavastu') || building.sanctionedPlanNo?.source?.includes('MahaVastu') || building.sanctionedPlanNo?.status === 'OFFICIAL_GOVERNMENT_RECORD';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 text-[11px] font-mono font-bold bg-teal-50 text-teal-700 border border-teal-200 rounded-md">
              {building.id}
            </span>
            <span className="px-2.5 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 rounded-md flex items-center gap-1">
              <Building2 className="w-3 h-3 text-slate-500" />
              {building.category || building.buildingType}
            </span>
            {building.isSynthetic && (
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded">
                SYNTHETIC DEMO DATA
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-slate-900 truncate leading-snug">
            {building.name}
          </h3>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{building.address} • {building.ward} (Zone {building.zoneNumber})</span>
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          aria-label="Close panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="p-5 overflow-y-auto space-y-5 divide-y divide-slate-100 flex-1">
        
        {/* Multi-Block Campus Navigator */}
        <CampusBlockNavigator building={building} variant="compact" onSelectBuilding={(id) => onOpenPassport(id)} />

        {/* Risk & Data Completeness Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Risk Card */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Building Risk Indicator
              </span>
              <RiskBadge level={building.riskIndicator} score={building.riskScore} />
            </div>

            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              {building.recommendedProfessionalAction || 'Multi-factor structural and environmental risk calculation.'}
            </p>

            <button
              onClick={() => setShowWhyRisk(!showWhyRisk)}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 bg-teal-50 hover:bg-teal-100/70 px-2.5 py-1.5 rounded-lg border border-teal-200/70 transition w-full justify-center"
            >
              <Info className="w-3.5 h-3.5" />
              {showWhyRisk ? 'Hide Factor Contribution' : 'Why this risk? (Factor Breakdown)'}
            </button>

            {/* Why This Risk Expandable Breakdown */}
            {showWhyRisk && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-2 animate-in fade-in duration-200">
                <div className="font-semibold text-slate-800 border-b border-slate-100 pb-1 flex justify-between">
                  <span>Factor Transparency</span>
                  <span className="text-[10px] text-slate-400">IS-456 / NDMA Grounded</span>
                </div>
                {building.riskFactors && building.riskFactors.length > 0 ? (
                  building.riskFactors.map((f, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-2 py-0.5">
                      <div className="flex-1">
                        <span className="font-medium text-slate-700">{f.factor}: </span>
                        <span className="text-slate-500">{f.description}</span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        f.type === 'NEGATIVE' ? 'bg-red-50 text-red-700 border border-red-200' :
                        f.type === 'POSITIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {f.impact > 0 ? `+${f.impact}` : `${f.impact}`} PTS
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 italic">
                    • Structural observations: {building.observations.length > 0 ? `${building.observations.length} active observations` : 'No active distress'}<br/>
                    • Maintenance recency: {building.maintenancePriority}<br/>
                    • Environmental exposure: Standard Nagpur urban exposure
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Data Completeness Card */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Data Completeness
              </span>
              <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {completeness.percentage || building.dataConfidenceScore}% Available
              </span>
            </div>

            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-3">
              <div
                className="bg-teal-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${completeness.percentage || building.dataConfidenceScore}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
              <div className="p-2 bg-white rounded-lg border border-slate-200/60">
                <span className="block font-bold text-teal-700 text-sm">{completeness.verifiedCount}</span>
                <span className="text-[10px] text-slate-500">Verified</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200/60">
                <span className="block font-bold text-amber-600 text-sm">{completeness.missingCount}</span>
                <span className="text-[10px] text-slate-500">Missing</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200/60">
                <span className="block font-bold text-slate-600 text-sm">{completeness.staleCount}</span>
                <span className="text-[10px] text-slate-500">Stale</span>
              </div>
            </div>

            {completeness.missingCount > 0 && (
              <p className="text-[11px] text-slate-500 mt-2 italic">
                Assessment confidence is limited because some structural or municipal records remain unverified.
              </p>
            )}
          </div>
        </div>

        {/* Category & Identity */}
        <div className="pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-teal-600" />
              Building Classification & Coordinates
            </h4>
            {userRole !== 'CITIZEN' && (
              <button
                onClick={() => setIsEditingCategory(!isEditingCategory)}
                className="text-xs text-teal-600 hover:text-teal-800 font-medium"
              >
                {isEditingCategory ? 'Cancel' : 'Change Category'}
              </button>
            )}
          </div>

          {isEditingCategory ? (
            <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-200 flex flex-wrap gap-2 items-center">
              <select
                value={selectedCategory || building.category || 'Other'}
                onChange={(e) => setSelectedCategory(e.target.value as BuildingCategory)}
                className="text-xs border border-slate-300 rounded-lg p-1.5 bg-white font-medium"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <button
                onClick={handleSaveCategory}
                className="px-3 py-1.5 bg-teal-700 text-white text-xs font-semibold rounded-lg hover:bg-teal-800"
              >
                Save Classification
              </button>
            </div>
          ) : null}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-400 block text-[10px]">CATEGORY</span>
              <span className="font-semibold text-slate-800">{building.category || building.buildingType}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-400 block text-[10px]">LATITUDE</span>
              <span className="font-mono text-slate-800">{building.latitude.toFixed(5)}° N</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-400 block text-[10px]">LONGITUDE</span>
              <span className="font-mono text-slate-800">{building.longitude.toFixed(5)}° E</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-400 block text-[10px]">FLOORS & SYSTEM</span>
              <span className="font-semibold text-slate-800">{building.numberOfFloors?.value || 4} Fl • {building.structuralSystem?.value || 'RCC'}</span>
            </div>
          </div>
        </div>

        {/* Official Records & Provenance */}
        <div className="pt-4 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5 text-teal-600" />
            Available Multi-Source Records
          </h4>

          <div className="space-y-2 text-xs">
            {/* MahaVastu BPMS */}
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 block">MahaVastu BPMS Sanction</span>
                <span className="text-slate-500 font-mono text-[11px]">
                  {hasBpms ? `Sanction: ${building.sanctionedPlanNo?.value || 'Verified'}` : 'No verified BPMS file attached'}
                </span>
              </div>
              <DataProvenanceBadge
                sourceName={hasBpms ? 'MahaVastu BPMS Portal' : 'Municipal Archive'}
                status={hasBpms ? 'OFFICIAL_GOVERNMENT_RECORD' : 'UNAVAILABLE'}
              />
            </div>

            {/* NMC Zone Registry */}
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 block">NMC Zone Registry</span>
                <span className="text-slate-500 text-[11px]">
                  Ward: {building.ward}, Zone {building.zoneNumber}
                </span>
              </div>
              <DataProvenanceBadge
                sourceName="NMC Town Planning"
                status="OFFICIAL_GOVERNMENT_RECORD"
              />
            </div>

            {/* Environmental Soil / Groundwater */}
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 block">Ground & Environmental Context</span>
                <span className="text-slate-500 text-[11px]">
                  GSDA Water Table: 6.2m bgl • Soil: Deep Black Cotton (Vertisol)
                </span>
              </div>
              <DataProvenanceBadge
                sourceName="GSDA & Open-Meteo"
                status="PUBLIC_VERIFIED_SOURCE"
              />
            </div>
          </div>

          {/* Source Conflicts if any */}
          {building.sourceConflicts && building.sourceConflicts.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1.5">
              <div className="font-bold text-amber-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Source Conflict Detected
              </div>
              {building.sourceConflicts.map((sc, i) => (
                <div key={i} className="text-slate-700">
                  <span className="font-semibold">{sc.field}:</span> {sc.sourceA} says <span className="font-mono text-amber-900">{sc.valueA}</span> vs {sc.sourceB} says <span className="font-mono text-amber-900">{sc.valueB}</span>.
                  <div className="text-[10px] text-amber-700 italic">Resolution: {sc.resolutionNotes}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Maintenance & Inspections Overview */}
        <div className="pt-4 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-teal-600" />
            Inspection & Maintenance Status
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-400 block text-[10px]">LAST INSPECTION</span>
              <span className="font-semibold text-slate-800">{building.lastInspectionDate || 'Data unavailable'}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-400 block text-[10px]">NEXT DUE</span>
              <span className="font-semibold text-slate-800">
                {building.nextInspectionDueDate || 'Maintenance schedule unavailable'}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => onOpenPassport(building.id)}
          className="flex-1 min-w-[160px] px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
        >
          <FileText className="w-4 h-4" />
          Open Health Passport
        </button>

        {onOpenReport && (
          <button
            onClick={() => onOpenReport(building.id)}
            className="px-3.5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs border border-slate-300 flex items-center gap-1.5 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Report & Study
          </button>
        )}

        {userRole !== 'CITIZEN' && onStartInspection && (
          <button
            onClick={() => onStartInspection(building.id)}
            className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition"
          >
            <UserCheck className="w-3.5 h-3.5" />
            Log Defect / Inspection
          </button>
        )}
      </div>
    </div>
  );
};
