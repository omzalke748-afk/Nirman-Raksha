import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RiskBadge } from '../components/common/RiskBadge';
import { DataProvenanceBadge } from '../components/common/DataProvenanceBadge';
import { CampusBlockNavigator } from '../components/common/CampusBlockNavigator';
import { generateAIAnalysis } from '../services/aiAnalyst';
import { computeWhatChanged } from '../services/riskEngine';
import { analyzeCorrosionAndSoil } from '../services/corrosionAndSoilService';
import { BuildingCategory } from '../types';
import {
  Building2,
  HeartPulse,
  MapPin,
  Calendar,
  Layers,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Activity,
  PlusCircle,
  Sparkles,
  Bot,
  Send,
  HelpCircle,
  Printer,
  ChevronRight,
  Clock,
  Wrench,
  CloudRain,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Camera,
  Droplets,
  Thermometer,
  CheckCircle2,
  FileCheck2,
  Compass,
  Info,
  Building,
  UserCheck,
  ZapOff
} from 'lucide-react';
import { DemolitionDecisionModal } from '../components/common/DemolitionDecisionModal';
import { IssueMaintenanceNoticeModal } from '../components/common/IssueMaintenanceNoticeModal';

interface Props {
  setActiveTab: (tab: string) => void;
}

export const HealthPassportPage: React.FC<Props> = ({ setActiveTab }) => {
  const {
    buildings,
    activeBuildingId,
    setActiveBuildingId,
    alerts,
    maintenanceNotices,
    demolitionOrders,
    userRole,
    addObservation,
    addMaintenance,
    environment,
    updateBuildingCategory
  } = useApp();

  const [activeSection, setActiveSection] = useState<'OVERVIEW' | 'TIMELINE' | 'STRUCTURAL' | 'INSPECTIONS' | 'MAINTENANCE' | 'ENVIRONMENT' | 'AI_ANALYST' | 'PROVENANCE'>('OVERVIEW');
  const [aiQuery, setAiQuery] = useState('');
  const [aiConversation, setAiConversation] = useState<{ role: 'user' | 'assistant'; text: string; confidence?: string; points?: string[] }[]>([]);
  
  // Modals
  const [showAddObsModal, setShowAddObsModal] = useState(false);
  const [showAddMaintModal, setShowAddMaintModal] = useState(false);
  const [showDemolitionModal, setShowDemolitionModal] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState<BuildingCategory>('Educational');

  // Defect Logger Form State
  const [obsType, setObsType] = useState<'HAIRLINE_CRACK' | 'STRUCTURAL_SHEAR_CRACK' | 'DIAGONAL_MASONRY_CRACK' | 'CONCRETE_SPALLING' | 'REINFORCEMENT_CORROSION' | 'FOUNDATION_SETTLEMENT' | 'SEEPAGE_DAMPNESS'>('STRUCTURAL_SHEAR_CRACK');
  const [obsSeverity, setObsSeverity] = useState<'MINOR' | 'MODERATE' | 'SEVERE' | 'CRITICAL'>('CRITICAL');
  const [obsLocation, setObsLocation] = useState('Ground floor external plinth & Column C-4');
  const [obsDesc, setObsDesc] = useState('Wide continuous structural shear crack (8.2mm) propagating through load-bearing brickwork with visible horizontal mortar slip.');
  const [obsImage, setObsImage] = useState('https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&q=80&w=800');

  // Maintenance Logger Form State
  const [maintProblem, setMaintProblem] = useState('');
  const [maintAction, setMaintAction] = useState('');
  const [maintContractor, setMaintContractor] = useState('');
  const [maintCost, setMaintCost] = useState<number | undefined>(undefined);
  const [maintNextDue, setMaintNextDue] = useState('');

  const building = buildings.find(b => b.id === activeBuildingId) || buildings[0];
  const whatChanged = computeWhatChanged(building);
  const envAnalysis = analyzeCorrosionAndSoil(environment, building);

  const currentYear = 2026;
  const constructionYear = building.constructionYear?.value || 1970;
  const buildingAge = currentYear - constructionYear;
  const designLife = building.designLifeYears || 50;
  const isPastDesignLife = buildingAge >= designLife;
  const activeDemolition = demolitionOrders.find(d => d.buildingId === building.id) || building.demolitionOrder;
  const buildingNotices = maintenanceNotices.filter(n => n.buildingId === building.id);

  const hasBpms = building.sanctionedPlanNo?.sourceUrl?.includes('mahavastu') || building.sanctionedPlanNo?.source?.includes('MahaVastu') || building.sanctionedPlanNo?.status === 'OFFICIAL_GOVERNMENT_RECORD';

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

  const handleAskAI = (promptText: string) => {
    const res = generateAIAnalysis(building, promptText);
    setAiConversation(prev => [
      ...prev,
      { role: 'user', text: promptText },
      { role: 'assistant', text: res.answer, confidence: res.confidenceNote, points: res.recommendedChecklist }
    ]);
    setAiQuery('');
  };

  const handleCustomQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    handleAskAI(aiQuery);
  };

  const handleSubmitObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    await addObservation(building.id, {
      date: new Date().toISOString().split('T')[0],
      inspectorName: userRole === 'ENGINEER' ? 'Er. Rajesh S. Deshmukh' : 'Field Structural Auditor',
      inspectorLicense: userRole === 'ENGINEER' ? 'NMC-STR-LIC-4482' : 'NMC-AUD-8821',
      observationType: obsType,
      severity: obsSeverity,
      locationDetails: obsLocation,
      description: obsDesc,
      imageUrl: obsImage
    }, true);
    setShowAddObsModal(false);
  };

  const handleSubmitMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintProblem || !maintAction) return;

    addMaintenance(building.id, {
      date: new Date().toISOString().split('T')[0],
      contractorName: maintContractor || 'Municipal Approved Contractor',
      repairType: 'STRUCTURAL_RETROFITTING',
      problemDescription: maintProblem,
      description: maintAction,
      actionTaken: maintAction,
      costInr: maintCost,
      status: 'COMPLETED',
      nextInspectionDue: maintNextDue || undefined
    });

    setMaintProblem('');
    setMaintAction('');
    setMaintContractor('');
    setMaintCost(undefined);
    setMaintNextDue('');
    setShowAddMaintModal(false);
  };

  const handleSaveCategory = () => {
    if (newCategory) {
      updateBuildingCategory(building.id, newCategory);
      setIsEditingCategory(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16 text-slate-800">
      
      {/* Philosophy Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/10 rounded-xl">
            <Building2 className="w-5 h-5 text-teal-200" />
          </div>
          <div>
            <h4 className="font-bold text-sm sm:text-base text-teal-50">
              Universal Building Health Passport
            </h4>
            <p className="text-xs text-teal-100/80 italic font-serif mt-0.5">
              "Built for today's assessment. Designed for tomorrow's building history."
            </p>
          </div>
        </div>
        <div className="text-right font-mono text-[11px] text-teal-200/90 self-end sm:self-center">
          Continuous Digital Lifecycle Dossier • Nagpur Pilot
        </div>
      </div>

      {/* TOP EMERGENCY CONDEMNED / DEMOLITION BANNER */}
      {(building.isCondemned || activeDemolition) && (
        <div className="bg-red-950 border-2 border-red-500 rounded-3xl p-6 text-white shadow-2xl space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-800 pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-red-600 rounded-2xl animate-bounce">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 bg-red-500/30 text-red-300 border border-red-400/40 rounded font-mono text-[10px] font-bold uppercase tracking-wider">
                  STATUTORY CONDEMNATION ORDER (MMC ACT SECTION 264)
                </span>
                <h3 className="text-lg font-extrabold text-white mt-0.5">
                  CONDEMNED STRUCTURE (CATEGORY C-1) — DEMOLITION MANDATED
                </h3>
              </div>
            </div>

            <div className="text-right font-mono text-xs text-red-300">
              Order: <strong className="text-white">{activeDemolition?.orderNumber || 'NMC/T&CP/SEC264/C1/2026/089'}</strong>
            </div>
          </div>

          <p className="text-xs text-red-200 leading-relaxed">
            This structure has exceeded its design lifespan (<strong>{buildingAge} years old</strong> vs {designLife}-year design life) with severe irreversible foundation settlement and core concrete degradation. Renovation is technically impossible and economically unviable (Retrofit cost ratio: <strong>{activeDemolition?.repairToReplacementCostRatio || 88}%</strong>).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-red-900/60 p-3 rounded-2xl border border-red-700">
              <span className="text-[10px] text-red-300 font-mono block">EVACUATION STATUS</span>
              <strong className="text-white text-xs">{activeDemolition?.evacuationDeadline || 'Immediate Evacuation Complete'}</strong>
            </div>
            <div className="bg-red-900/60 p-3 rounded-2xl border border-red-700">
              <span className="text-[10px] text-red-300 font-mono block">DEMOLITION METHOD</span>
              <strong className="text-white text-xs">{activeDemolition?.demolitionMethod?.replace(/_/g, ' ') || 'High-Reach Excavator Controlled Dismantling'}</strong>
            </div>
            <div className="bg-red-900/60 p-3 rounded-2xl border border-red-700">
              <span className="text-[10px] text-red-300 font-mono block">SCHEDULED DATE</span>
              <strong className="text-amber-300 text-xs">{activeDemolition?.demolitionExecutionDate || '2026-10-15'}</strong>
            </div>
            <div className="bg-red-900/60 p-3 rounded-2xl border border-red-700">
              <span className="text-[10px] text-red-300 font-mono block">CORDON RADIUS</span>
              <strong className="text-white text-xs">{activeDemolition?.safetyPerimeterRadiusMeters || 1000}m Buffer</strong>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[11px] text-red-300 font-mono">
            <div>
              Rehabilitation Transit Camp: <strong className="text-white">{activeDemolition?.rehabilitationCampLocation || `NMC Community Centre, Zone ${building.zoneNumber}`}</strong>
            </div>
            <div className="flex items-center space-x-2 text-emerald-400">
              <ZapOff className="w-3.5 h-3.5" />
              <span>Utilities Disconnected (Power, Water, PNG)</span>
            </div>
          </div>
        </div>
      )}

      {/* TOP LIFESPAN END WARNING (IF AGED AND NOT CONDEMNED) */}
      {isPastDesignLife && !building.isCondemned && !activeDemolition && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 text-amber-950 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-200 text-amber-900 rounded-2xl shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm text-amber-950">
                  STRUCTURE HAS EXCEEDED DESIGN LIFESPAN ({buildingAge} YRS &gt; {designLife} YRS)
                </span>
                <span className="px-2 py-0.2 bg-amber-200 text-amber-900 rounded text-[10px] font-mono font-bold">
                  MMC ACT SEC 264 REVIEW
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-0.5">
                Constructed in {constructionYear}. Structural stability and economic retrofit viability must be formally evaluated by NMC municipal authorities.
              </p>
            </div>
          </div>

          {(userRole === 'AUTHORITY' || userRole === 'ADMIN') && (
            <button
              onClick={() => setShowDemolitionModal(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center space-x-1.5 shrink-0 self-start sm:self-center"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Evaluate for Demolition (Sec 264)</span>
            </button>
          )}
        </div>
      )}

      {/* Top Building Identity & Navigation Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded-lg text-xs font-mono font-bold">
                {building.id}
              </span>
              <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200">
                {building.category || building.buildingType}
              </span>
              <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200">
                {building.ward} (Zone {building.zoneNumber})
              </span>
              {building.isCondemned && (
                <span className="px-2.5 py-0.5 bg-red-600 text-white rounded-lg text-xs font-mono font-bold">
                  CONDEMNED C-1
                </span>
              )}
              {hasBpms ? (
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-mono font-bold flex items-center gap-1">
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>MahaVastu BPMS Sanctioned</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs">
                  Municipal Record
                </span>
              )}
              {building.isSynthetic && (
                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-mono font-bold">
                  SYNTHETIC DEMO DATA
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {building.name}
            </h1>
            <p className="text-xs text-slate-500 flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{building.address} • {building.latitude.toFixed(5)}° N, {building.longitude.toFixed(5)}° E</span>
            </p>
          </div>

          {/* Risk Level & Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="text-right mr-2 hidden sm:block">
              <div className="text-[11px] font-mono text-slate-500">Risk Indicator</div>
              <RiskBadge level={building.riskIndicator} score={building.riskScore} size="lg" />
            </div>

            {userRole !== 'CITIZEN' && (
              <>
                <button
                  onClick={() => setShowAddObsModal(true)}
                  className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center space-x-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Log Defect</span>
                </button>

                <button
                  onClick={() => setShowAddMaintModal(true)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center space-x-1.5"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Log Maintenance</span>
                </button>
              </>
            )}

            {(userRole === 'AUTHORITY' || userRole === 'ADMIN') && (
              <>
                <button
                  onClick={() => setShowNoticeModal(true)}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center space-x-1.5"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Issue Notice (Sec 265)</span>
                </button>

                {!building.isCondemned && (
                  <button
                    onClick={() => setShowDemolitionModal(true)}
                    className="px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center space-x-1.5"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Order Demolition (Sec 264)</span>
                  </button>
                )}

                <button
                  onClick={() => setActiveTab('create-alert')}
                  className="px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center space-x-1.5"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Issue 2km Warning</span>
                </button>
              </>
            )}

            <button
              onClick={() => setActiveTab('reports')}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-300 transition flex items-center space-x-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Export Dossier</span>
            </button>
          </div>

        </div>

        {/* Passport Tab Navigation */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-200 text-xs font-medium">
          {[
            { id: 'OVERVIEW', label: '12-Section Overview', icon: HeartPulse },
            { id: 'TIMELINE', label: 'Lifecycle Timeline', icon: Clock },
            { id: 'STRUCTURAL', label: 'Structural Distress & NDT', icon: Layers },
            { id: 'INSPECTIONS', label: 'Inspection History', icon: FileText },
            { id: 'MAINTENANCE', label: 'Maintenance Ledger', icon: Wrench },
            { id: 'ENVIRONMENT', label: 'Environment & Soil Context', icon: CloudRain },
            { id: 'AI_ANALYST', label: 'NIRMAN AI Decision Support', icon: Bot },
            { id: 'PROVENANCE', label: 'Multi-Source Provenance', icon: ShieldCheck }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-xs font-bold'
                    : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Multi-Block Campus / Complex Navigator */}
      <CampusBlockNavigator building={building} />

      {/* SECTION 1: 12-SECTION PASSPORT OVERVIEW */}
      {activeSection === 'OVERVIEW' && (
        <div className="space-y-6">
          
          {/* Risk Engine Factor Contribution Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-teal-700 font-bold">
                  EXPLAINABLE RISK INTELLIGENCE (IS-456 GROUNDED)
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Building Risk Indicator & Factor Contributions
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-slate-500">Data Completeness:</span>
                <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 text-xs">
                  {building.dataConfidenceScore}%
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {building.recommendedProfessionalAction || 'Multi-factor risk evaluation based on observable distress, maintenance frequency, and environmental context.'}
            </p>

            {/* Contributing Factors */}
            <div className="space-y-2">
              <span className="text-xs text-slate-600 font-semibold">Factor Breakdown:</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {building.riskFactors.map((rf, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs flex flex-col justify-between space-y-1 ${
                      rf.type === 'NEGATIVE' ? 'bg-red-50/80 border-red-200 text-red-900' :
                      rf.type === 'POSITIVE' ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' :
                      'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span>{rf.factor}</span>
                      <span className="font-mono font-bold text-[11px]">
                        {rf.impact > 0 ? `+${rf.impact}` : `${rf.impact}`} pts
                      </span>
                    </div>
                    <p className="text-[11px] opacity-90">{rf.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendation Banner */}
            <div className="p-3.5 bg-teal-50/80 border border-teal-200 rounded-xl text-xs text-teal-950 flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <div>
                <strong>Recommended Next Action: </strong>
                {building.recommendedProfessionalAction || 'Schedule regular structural verification audit with a licensed engineer.'}
              </div>
            </div>
          </div>

          {/* 12-Section Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* 1. Identity & Classification */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-teal-700" />
                  1. Identity & Classification
                </span>
                <span className="text-[10px] text-teal-700 font-mono">SEC-01</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">CATEGORY</span>
                  <span className="font-semibold text-slate-900">{building.category || building.buildingType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">OCCUPANCY</span>
                  <span className="text-slate-700">{building.occupancyType?.value || 'Active Occupancy'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">ESTIMATED CAPACITY</span>
                  <span className="font-mono text-slate-800">{building.approximateCapacity?.value || 80} occupants</span>
                </div>
              </div>
            </div>

            {/* 2. Geographic & Municipal Jurisdiction */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-teal-700" />
                  2. Location & Jurisdiction
                </span>
                <span className="text-[10px] text-teal-700 font-mono">SEC-02</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">NMC WARD & ZONE</span>
                  <span className="font-semibold text-slate-900">{building.ward} (Zone {building.zoneNumber})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">GEOGRAPHIC COORDINATES</span>
                  <span className="font-mono text-slate-800">{building.latitude.toFixed(5)}° N, {building.longitude.toFixed(5)}° E</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">AREA / LOCALITY</span>
                  <span className="text-slate-700">{building.area}</span>
                </div>
              </div>
            </div>

            {/* 3. Official Records & BPMS */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-teal-700" />
                  3. Official Records
                </span>
                <span className="text-[10px] text-teal-700 font-mono">SEC-03</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">SANCTION ORDER / BPMS</span>
                  <span className="font-mono font-semibold text-slate-900">{building.sanctionedPlanNo?.value || 'Municipal archive only'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">SANCTIONING AUTHORITY</span>
                  <span className="text-slate-700">{building.sanctioningAuthority?.value || 'Nagpur Municipal Corporation'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">PROVENANCE STATUS</span>
                  <DataProvenanceBadge sourceName="Municipal Registry" status={hasBpms ? 'OFFICIAL_GOVERNMENT_RECORD' : 'UNAVAILABLE'} />
                </div>
              </div>
            </div>

            {/* 4. Construction & Design */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-teal-700" />
                  4. Construction Details
                </span>
                <span className="text-[10px] text-teal-700 font-mono">SEC-04</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">YEAR OF CONSTRUCTION</span>
                  <span className="font-semibold text-slate-900">{building.constructionYear?.value || 'Data unavailable'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">OFFICIAL STATUS</span>
                  <span className="text-slate-700">{building.officialMunicipalStatus?.value || 'Regularized'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">CONFIDENCE SCORE</span>
                  <span className="font-mono text-teal-700 font-bold">{building.dataConfidenceScore}%</span>
                </div>
              </div>
            </div>

            {/* 5. Structural System */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-teal-700" />
                  5. Structural System
                </span>
                <span className="text-[10px] text-teal-700 font-mono">SEC-05</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">FRAMING SYSTEM</span>
                  <span className="font-semibold text-slate-900">{building.structuralSystem?.value || 'RCC Frame'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">STOREYS / FLOORS</span>
                  <span className="font-mono text-slate-800">{building.numberOfFloors?.value || 4} Floors</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">FOUNDATION SYSTEM</span>
                  <span className="text-slate-700">Isolated / Raft in Vertisol</span>
                </div>
              </div>
            </div>

            {/* 6. Inspection & Defect History */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-teal-700" />
                  6. Inspection & Defects
                </span>
                <span className="text-[10px] text-teal-700 font-mono">SEC-06</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">LAST INSPECTION DATE</span>
                  <span className="font-semibold text-slate-900">{building.lastInspectionDate || 'Data unavailable'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">RECORDED DEFECTS</span>
                  <span className="font-mono text-slate-800">{building.observations.length} defects logged</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">NEXT SCHEDULED AUDIT</span>
                  <span className="text-slate-700">{building.nextInspectionDueDate || 'Maintenance schedule unavailable'}</span>
                </div>
              </div>
            </div>

            {/* 7. Maintenance History */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-teal-700" />
                  7. Maintenance Ledger
                </span>
                <span className="text-[10px] text-teal-700 font-mono">SEC-07</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">MAINTENANCE PRIORITY</span>
                  <span className="font-bold text-teal-800">{building.maintenancePriority}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">COMPLETED REPAIRS</span>
                  <span className="font-mono text-slate-800">{building.maintenance?.length || 0} entries</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">NEXT DUE</span>
                  <span className="text-slate-700">{building.nextInspectionDueDate || 'Maintenance schedule unavailable'}</span>
                </div>
              </div>
            </div>

            {/* 8. Environmental & Soil Context */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <CloudRain className="w-4 h-4 text-teal-700" />
                  8. Environmental & Soil
                </span>
                <span className="text-[10px] text-teal-700 font-mono">SEC-08</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">SOIL STRATA</span>
                  <span className="font-semibold text-slate-900">Deep Black Cotton (Vertisol)</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">GROUNDWATER TABLE (GSDA)</span>
                  <span className="font-mono text-slate-800">6.2m bgl</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">SEEPAGE STATUS</span>
                  <span className="text-slate-700">Monitored</span>
                </div>
              </div>
            </div>

            {/* 9. Risk & Public Safety Status */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-teal-700" />
                  9. Risk & Warning Status
                </span>
                <span className="text-[10px] text-teal-700 font-mono">SEC-09</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">INDICATOR LEVEL</span>
                  <span className="font-bold text-slate-900">{building.riskIndicator}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">ACTIVE MUNICIPAL CORDON</span>
                  <span className="font-semibold text-slate-800">{building.hasActiveAlert ? '🚨 2km Alert Active' : 'None'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">NDMA DISASTER VULNERABILITY</span>
                  <span className="text-slate-700">Moderate Seismic Zone II</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SECTION 2: LIFECYCLE TIMELINE */}
      {activeSection === 'TIMELINE' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-teal-700 font-bold">
              CONTINUOUS LIFECYCLE HISTORY
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Building Timeline: Construction → Inspection → Defect → Maintenance → Reinspection
            </h3>
          </div>

          <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-6">
            {building.timeline && building.timeline.length > 0 ? (
              building.timeline.map((evt, idx) => (
                <div key={idx} className="relative group">
                  <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-white ${
                    evt.category === 'OBSERVATION' ? 'bg-red-600' :
                    evt.category === 'INSPECTION' ? 'bg-teal-600' :
                    evt.category === 'MAINTENANCE' ? 'bg-amber-600' :
                    evt.category === 'ALERT' ? 'bg-purple-600' : 'bg-slate-700'
                  }`} />
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{evt.title}</span>
                      <span className="text-[11px] font-mono text-slate-500">{evt.date}</span>
                    </div>
                    <p className="text-xs text-slate-600">{evt.description}</p>
                    <div className="text-[10px] text-slate-400 font-mono pt-1">
                      Actor: {evt.personOrOrg} • Status: {evt.status}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 italic">
                Initial baseline record registered. Subsequent field audits and maintenance logs will append sequentially here.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: MAINTENANCE LEDGER */}
      {activeSection === 'MAINTENANCE' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-teal-700 font-bold">
                MUNICIPAL STRUCTURAL REPAIRS & DIRECTIVES
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                Maintenance & Remediation History
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              {(userRole === 'AUTHORITY' || userRole === 'ADMIN') && (
                <button
                  onClick={() => setShowNoticeModal(true)}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
                >
                  <Wrench className="w-4 h-4" />
                  <span>+ Issue Sec 265 Notice</span>
                </button>
              )}
              {userRole !== 'CITIZEN' && (
                <button
                  onClick={() => setShowAddMaintModal(true)}
                  className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Log Repair</span>
                </button>
              )}
            </div>
          </div>

          {/* Official Municipal Directives for this Building */}
          {buildingNotices.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-mono font-bold text-amber-900 uppercase tracking-wider flex items-center space-x-1.5">
                <Wrench className="w-4 h-4 text-amber-700" />
                <span>Active Municipal Section 265 Directives ({buildingNotices.length})</span>
              </div>

              {buildingNotices.map(not => (
                <div key={not.id} className="p-4 bg-amber-50/70 border border-amber-300 rounded-2xl space-y-2 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded font-mono text-[10px] font-bold">
                        {not.id}
                      </span>
                      <span className="font-bold text-slate-900">{not.noticeType.replace(/_/g, ' ')}</span>
                      <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded font-mono text-[10px] font-bold">
                        {not.priority} PRIORITY
                      </span>
                    </div>
                    <span className="font-mono text-slate-600">Compliance Deadline: <strong className="text-slate-900">{not.complianceDeadline}</strong></span>
                  </div>

                  <p className="text-slate-700 leading-relaxed">{not.description}</p>

                  <div className="bg-white p-3 rounded-xl border border-amber-200 text-[11px] space-y-1">
                    <span className="font-bold text-slate-700 font-mono uppercase">Required Actions ({not.statutoryReference}):</span>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                      {not.mandatoryActions.map((act, i) => (
                        <li key={i}>{act}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Completed Repairs History */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
              Completed Repairs & Maintenance Log
            </div>

            {building.maintenance && building.maintenance.length > 0 ? (
              building.maintenance.map((m, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{m.problemDescription || m.repairType}</span>
                    <span className="font-mono text-[11px] text-slate-500">{m.date}</span>
                  </div>
                  <p className="text-slate-700"><strong>Action Taken:</strong> {m.actionTaken || m.description}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                    <div><strong>Contractor:</strong> {m.contractorName || 'Unspecified'}</div>
                    <div><strong>Cost:</strong> {m.costInr ? `₹${m.costInr.toLocaleString()}` : 'Unavailable'}</div>
                    <div><strong>Status:</strong> {m.status}</div>
                    <div><strong>Next Due:</strong> {m.nextInspectionDue || 'Unavailable'}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
                No past maintenance interventions recorded in the registry for this structure.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 4: ENVIRONMENT & SOIL */}
      {activeSection === 'ENVIRONMENT' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-teal-700 font-bold">
              GROUND & ATMOSPHERIC CONTEXT
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Live Weather Telemetry, Groundwater & Vertisol Soil Strata
            </h3>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
            <strong>Contextual Principle: </strong>
            Environmental metrics provide localized geotechnical context. Extreme rainfall or Black Cotton Vertisol soil expansion are considered as environmental stressors, not direct proof of structural collapse.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="font-bold text-slate-900 block">Atmospheric Telemetry (Open-Meteo)</span>
              <div className="space-y-1 text-slate-600">
                <p>Temperature: <strong className="font-mono text-slate-900">{environment.temperatureC}°C</strong></p>
                <p>Relative Humidity: <strong className="font-mono text-slate-900">{environment.relativeHumidityPct}%</strong></p>
                <p>24h Rainfall: <strong className="font-mono text-slate-900">{environment.precipitation24hMm} mm</strong></p>
                <p>Wind Speed: <strong className="font-mono text-slate-900">{environment.windSpeedKmh} km/h</strong></p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="font-bold text-slate-900 block">Soil & Geotechnical Strata</span>
              <div className="space-y-1 text-slate-600">
                <p>Soil Type: <strong className="text-slate-900">Deep Black Cotton (Vertisol)</strong></p>
                <p>Shrink-Swell Potential: <strong className="text-amber-700">High Swelling Index</strong></p>
                <p>Corrosion Exposure: <strong className="text-slate-900">Moderate Carbonation</strong></p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="font-bold text-slate-900 block">Hydrogeology (GSDA Maharashtra)</span>
              <div className="space-y-1 text-slate-600">
                <p>Water Table Depth: <strong className="font-mono text-slate-900">6.2m bgl</strong></p>
                <p>Seasonal Fluctuations: <strong className="text-slate-900">±2.4m post-monsoon</strong></p>
                <p>Plinth Moisture Level: <strong className="text-slate-900">Normal / Monitored</strong></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: AI DECISION SUPPORT */}
      {activeSection === 'AI_ANALYST' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-teal-700 font-bold">
              AI STRUCTURAL DECISION SUPPORT
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              NIRMAN Assistant (IS-456, IS-1893 & CPWD Maintenance Guidelines)
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => handleAskAI('What are the primary structural risk drivers for this building?')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200"
              >
                Risk drivers?
              </button>
              <button
                onClick={() => handleAskAI('Explain how Nagpur black cotton soil impacts this structure.')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200"
              >
                Black Cotton Soil impact?
              </button>
              <button
                onClick={() => handleAskAI('Recommend non-destructive testing (NDT) protocol.')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200"
              >
                Recommended NDT tests?
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto p-1">
              {aiConversation.map((msg, i) => (
                <div key={i} className={`p-4 rounded-xl text-xs ${
                  msg.role === 'user' ? 'bg-teal-50 border border-teal-200 ml-8 text-teal-950 font-medium' : 'bg-slate-50 border border-slate-200 mr-8 text-slate-800'
                }`}>
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                  {msg.points && (
                    <ul className="list-disc list-inside mt-2 space-y-1 text-slate-700">
                      {msg.points.map((p, j) => <li key={j}>{p}</li>)}
                    </ul>
                  )}
                  {msg.confidence && (
                    <div className="text-[10px] text-slate-400 font-mono mt-2 pt-1 border-t border-slate-200">
                      Confidence & Standards: {msg.confidence}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleCustomQuery} className="flex gap-2 pt-2">
              <input
                type="text"
                value={aiQuery}
                onChange={e => setAiQuery(e.target.value)}
                placeholder="Ask structural engineering questions about this building..."
                className="flex-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-xl"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DEFECT LOGGER MODAL */}
      {showAddObsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="font-bold text-slate-900 text-base">Record Defect / Field Observation</h3>
            
            <form onSubmit={handleSubmitObservation} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Defect Type</label>
                <select
                  value={obsType}
                  onChange={(e: any) => setObsType(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                >
                  <option value="STRUCTURAL_SHEAR_CRACK">Structural / Shear Crack</option>
                  <option value="HAIRLINE_CRACK">Hairline Plaster Crack</option>
                  <option value="DIAGONAL_MASONRY_CRACK">Diagonal Masonry Crack</option>
                  <option value="CONCRETE_SPALLING">Concrete Spalling / Delamination</option>
                  <option value="REINFORCEMENT_CORROSION">Exposed Corroded Rebars</option>
                  <option value="FOUNDATION_SETTLEMENT">Foundation Settlement / Plinth Shift</option>
                  <option value="SEEPAGE_DAMPNESS">Severe Water Seepage / Dampness</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Severity</label>
                <select
                  value={obsSeverity}
                  onChange={(e: any) => setObsSeverity(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                >
                  <option value="CRITICAL">Critical (Immediate Hazard)</option>
                  <option value="SEVERE">Severe</option>
                  <option value="MODERATE">Moderate</option>
                  <option value="MINOR">Minor</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location Details</label>
                <input
                  type="text"
                  value={obsLocation}
                  onChange={e => setObsLocation(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  value={obsDesc}
                  onChange={e => setObsDesc(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddObsModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg"
                >
                  Save to Health Passport
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MAINTENANCE LOGGER MODAL */}
      {showAddMaintModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="font-bold text-slate-900 text-base">Record Maintenance / Repair Action</h3>
            
            <form onSubmit={handleSubmitMaintenance} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Problem Reported</label>
                <input
                  type="text"
                  required
                  value={maintProblem}
                  onChange={e => setMaintProblem(e.target.value)}
                  placeholder="e.g. Epoxy pressure grouting on shear cracks & rebar rust passivator..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Action Taken</label>
                <textarea
                  rows={2}
                  required
                  value={maintAction}
                  onChange={e => setMaintAction(e.target.value)}
                  placeholder="e.g. Injected low-viscosity structural epoxy under 4 bar pressure and applied zinc-rich primer..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contractor / Agency</label>
                  <input
                    type="text"
                    value={maintContractor}
                    onChange={e => setMaintContractor(e.target.value)}
                    placeholder="e.g. Nagpur Structural Retrofitters Ltd."
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cost (INR)</label>
                  <input
                    type="number"
                    value={maintCost || ''}
                    onChange={e => setMaintCost(Number(e.target.value))}
                    placeholder="e.g. 145000"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Next Inspection Due</label>
                <input
                  type="date"
                  value={maintNextDue}
                  onChange={e => setMaintNextDue(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMaintModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg"
                >
                  Save to Maintenance Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Demolition Decision Modal */}
      <DemolitionDecisionModal
        isOpen={showDemolitionModal}
        onClose={() => setShowDemolitionModal(false)}
        building={building}
      />

      {/* Issue Maintenance Notice Modal */}
      <IssueMaintenanceNoticeModal
        isOpen={showNoticeModal}
        onClose={() => setShowNoticeModal(false)}
        preselectedBuilding={building}
      />

    </div>
  );
};
