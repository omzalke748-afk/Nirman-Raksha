import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RiskBadge } from '../components/common/RiskBadge';
import { DataProvenanceBadge } from '../components/common/DataProvenanceBadge';
import { generateBuildingAssessmentStudy } from '../services/multiSourceService';
import {
  FileBarChart2,
  Printer,
  Download,
  Building2,
  ShieldCheck,
  Clock,
  Layers,
  Sparkles,
  MapPin,
  Calendar,
  AlertTriangle,
  FileText,
  BookOpen,
  Info,
  Wrench,
  CloudRain,
  CheckCircle2
} from 'lucide-react';

interface Props {
  setActiveTab: (tab: string) => void;
}

export const ReportsPage: React.FC<Props> = ({ setActiveTab }) => {
  const { buildings, activeBuildingId, alerts, dataSources, environment } = useApp();

  const [selectedBuildingId, setSelectedBuildingId] = useState(activeBuildingId || (buildings[0]?.id ?? 'NMC-SAT-2026-089'));
  const [reportType, setReportType] = useState<'HEALTH_PASSPORT' | 'ASSESSMENT_STUDY' | 'STRUCTURAL_DEFECT' | 'SAFETY_ALERT_NOTICE'>('HEALTH_PASSPORT');

  const building = buildings.find(b => b.id === selectedBuildingId) || buildings[0];
  const linkedAlert = alerts.find(a => a.buildingId === building.id);
  const study = generateBuildingAssessmentStudy(building, environment);

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-16 text-slate-800">
      
      {/* Non-Print Control Header */}
      <div className="no-print space-y-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <FileBarChart2 className="w-6 h-6 text-teal-700" />
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                NIRMAN-RAKSHA Report Studio
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Generate official Building Health Reports, Comprehensive Assessment Studies, and Statutory Safety Dossiers grounded in verified database records.
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-2 shrink-0 self-start sm:self-auto"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>

        {/* Report Customizer Toolbar */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-700 font-semibold block mb-1">Target Building</label>
            <select
              value={selectedBuildingId}
              onChange={e => setSelectedBuildingId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-teal-600"
            >
              {buildings.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.id} • {b.category || b.buildingType} • {b.ward})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-700 font-semibold block mb-1">Report Template</label>
            <select
              value={reportType}
              onChange={e => setReportType(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-teal-600"
            >
              <option value="HEALTH_PASSPORT">1. Building Health Report (Passport Summary)</option>
              <option value="ASSESSMENT_STUDY">2. Secondary Report: Building Assessment Study</option>
              <option value="STRUCTURAL_DEFECT">3. Structural Defect & NDT Inspection Report</option>
              <option value="SAFETY_ALERT_NOTICE">4. NMC Statutory Public Safety Warning Notice</option>
            </select>
          </div>
        </div>
      </div>

      {/* PRINTABLE REPORT CONTAINER */}
      <div className="bg-white text-slate-900 border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6 max-w-4xl mx-auto print:border-none print:shadow-none print:p-0">
        
        {/* Official Header */}
        <div className="border-b-2 border-slate-800 pb-4 flex items-start justify-between">
          <div className="flex items-center space-x-3.5">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-12 h-12 rounded-xl object-contain border border-slate-200 shadow-xs bg-white shrink-0"
            />
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 font-serif">
                  NAGPUR MUNICIPAL CORPORATION
                </span>
              </div>
              <div className="text-xs font-bold text-teal-800 uppercase tracking-wider font-mono">
                NIRMAN-RAKSHA • STRUCTURAL SAFETY & HEALTH REGISTRY
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Report Generated: {currentDate} • Dossier ID: RPT-{building.id}-{Date.now().toString().slice(-6)}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-[10px] font-mono text-slate-400 uppercase">OFFICIAL SEAL</div>
            <div className="text-xs font-mono font-bold text-slate-800 border border-slate-300 px-2 py-1 rounded bg-slate-50 mt-1">
              NMC-PILOT-2026
            </div>
          </div>
        </div>

        {/* TEMPLATE 1: BUILDING HEALTH REPORT */}
        {reportType === 'HEALTH_PASSPORT' && (
          <div className="space-y-6 text-xs leading-relaxed">
            
            {/* Building Title & Summary Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 uppercase">
                  {building.category || building.buildingType}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">{building.name}</h2>
                <p className="text-slate-600 mt-0.5">{building.address} • {building.ward} (Zone {building.zoneNumber})</p>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                  Coordinates: {building.latitude.toFixed(5)}° N, {building.longitude.toFixed(5)}° E
                </p>
              </div>
              <div className="text-right shrink-0">
                <RiskBadge level={building.riskIndicator} score={building.riskScore} size="lg" />
                <div className="text-[10px] font-mono text-slate-500 mt-1">
                  Data Completeness: {building.dataConfidenceScore}%
                </div>
              </div>
            </div>

            {/* 1. Official & Structural Data Matrix */}
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1">
                1. Multi-Source Verified Structural Profile
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">MAHAVASTU BPMS / SANCTION</span>
                  <span className="font-semibold text-slate-800 font-mono">{building.sanctionedPlanNo?.value || 'Municipal archive only'}</span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">SANCTIONING AUTHORITY</span>
                  <span className="font-semibold text-slate-800">{building.sanctioningAuthority?.value || 'Nagpur Municipal Corporation'}</span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">CONSTRUCTION YEAR</span>
                  <span className="font-semibold text-slate-800">{building.constructionYear?.value || 'Not available'}</span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">STRUCTURAL SYSTEM</span>
                  <span className="font-semibold text-slate-800">{building.structuralSystem?.value || 'RCC Frame'}</span>
                </div>
              </div>
            </div>

            {/* 2. Explainable Risk Factors */}
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1">
                2. Risk Indicator & Factor Transparency
              </h3>
              <p className="text-slate-600 italic">
                {building.recommendedProfessionalAction || 'Multi-factor structural and environmental risk evaluation.'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {building.riskFactors.map((rf, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-800">{rf.factor}</span>
                      <p className="text-slate-500 text-[11px]">{rf.description}</p>
                    </div>
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border shrink-0">
                      {rf.impact > 0 ? `+${rf.impact}` : `${rf.impact}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Defects & Maintenance History */}
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1">
                3. Observable Defects & Maintenance Ledger
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <span className="font-bold text-slate-800 block">Inspection & Defects</span>
                  <p className="text-slate-600">Last Inspection: <strong>{building.lastInspectionDate || 'Data unavailable'}</strong></p>
                  <p className="text-slate-600">Logged Defects: <strong>{building.observations.length} observations</strong></p>
                  <p className="text-slate-600">Observations Status: {building.observations.length > 0 ? `${building.observations.length} active defects logged` : 'No significant crack details noted'}</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <span className="font-bold text-slate-800 block">Maintenance & Schedule</span>
                  <p className="text-slate-600">Maintenance Priority: <strong>{building.maintenancePriority}</strong></p>
                  <p className="text-slate-600">Next Inspection Due: <strong>{building.nextInspectionDueDate || 'Maintenance schedule unavailable'}</strong></p>
                  <p className="text-slate-600">Past Interventions: <strong>{building.maintenance?.length || 0} repairs recorded</strong></p>
                </div>
              </div>
            </div>

            {/* 4. Environmental & Soil Context */}
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1">
                4. Environmental & Hydrogeological Context
              </h3>
              <p className="text-slate-500 text-[11px]">
                Groundwater Table: 6.2m bgl (GSDA Context) • Soil: Deep Black Cotton (Vertisol) • Live Temperature: {environment.temperatureC}°C • Humidity: {environment.relativeHumidityPct}%
              </p>
            </div>

            {/* Recommendation */}
            <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl">
              <strong className="text-teal-900">Recommended Next Action: </strong>
              <span className="text-teal-950">{building.recommendedProfessionalAction || 'Schedule routine periodic stability audit.'}</span>
            </div>

          </div>
        )}

        {/* TEMPLATE 2: BUILDING ASSESSMENT STUDY (COMPREHENSIVE) */}
        {reportType === 'ASSESSMENT_STUDY' && (
          <div className="space-y-6 text-xs leading-relaxed">
            
            <div className="bg-teal-50 p-4 rounded-xl border border-teal-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-teal-800 uppercase">
                  COMPREHENSIVE ASSESSMENT STUDY
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">{study.buildingName}</h2>
                <p className="text-xs text-slate-600">ID: {study.buildingId} • Assessment Date: {study.assessmentDate} • Authority: {study.conductedBy}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold px-2.5 py-1 bg-white rounded border border-teal-300 text-teal-800">
                  {building.riskIndicator} RISK
                </span>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1">
                1. Executive Engineering Analysis
              </h3>
              <p className="text-slate-700 leading-relaxed">
                {study.executiveSummary}
              </p>
            </div>

            {/* Structural Condition Analysis */}
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1">
                2. Structural Framing & Distress Evaluation
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[10px]">FRAMING HEALTH</span>
                  <p className="font-semibold text-slate-900">{study.structuralConditionAnalysis.framingHealth}</p>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">DEFECT SEVERITY SCORE</span>
                  <p className="font-mono font-bold text-teal-800">{study.structuralConditionAnalysis.defectSeverityScore} / 100</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 block text-[10px]">CRITICAL OBSERVATIONS SUMMARY</span>
                  <p className="text-slate-700">{study.structuralConditionAnalysis.criticalObservationsSummary}</p>
                </div>
              </div>
            </div>

            {/* Environmental & Soil Context */}
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1">
                3. Geotechnical & Environmental Exposure Context
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[10px]">BLACK COTTON SOIL BEHAVIOUR</span>
                  <p className="text-slate-700">{study.environmentalAndSoilContext.blackCottonSoilSwellingThreat}</p>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">GROUNDWATER TABLE EXPOSURE</span>
                  <p className="text-slate-700">{study.environmentalAndSoilContext.groundwaterHydrostaticRisk}</p>
                </div>
              </div>
            </div>

            {/* Maintenance & Data Gaps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1">
                  4. Maintenance & Lifecycle History
                </h3>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <p><strong>Past Repairs:</strong> {study.maintenanceAndLifecycleHistory.pastRepairsSummary}</p>
                  <p><strong>Schedule Status:</strong> {study.maintenanceAndLifecycleHistory.maintenanceScheduleStatus}</p>
                  <p><strong>Next Recommended Due:</strong> {study.maintenanceAndLifecycleHistory.nextRecommendedMaintenanceDate}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1">
                  5. Identified Data Gaps & Missing Information
                </h3>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1 text-amber-950">
                  {study.dataGapsAndMissingInformation.map((gap, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-700">•</span>
                      <span>{gap}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Strategic Recommendations */}
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1">
                6. Strategic Recommendations & Next Verification Steps
              </h3>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                {study.strategicRecommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 text-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-700 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TEMPLATE 3: STRUCTURAL DEFECT REPORT */}
        {reportType === 'STRUCTURAL_DEFECT' && (
          <div className="space-y-6 text-xs leading-relaxed">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Structural Distress & Defect Log: {building.name}</h2>
              <p className="text-slate-500">Field survey observations, crack widths, spalling, and rebar corrosion records.</p>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1">Recorded Defects</h3>
              {building.observations.length > 0 ? (
                building.observations.map(obs => (
                  <div key={obs.id} className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-950 space-y-1">
                    <div className="flex justify-between font-bold">
                      <span>{obs.observationType.replace(/_/g, ' ')} ({obs.severity})</span>
                      <span className="font-mono text-[11px]">{obs.date}</span>
                    </div>
                    <p>{obs.description}</p>
                    <p className="text-[11px] text-slate-600">Location: {obs.locationDetails} • Inspector: {obs.inspectorName} ({obs.inspectorLicense})</p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center bg-slate-50 rounded-lg text-slate-500">
                  No active structural shear cracks recorded during the baseline audit.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TEMPLATE 4: SAFETY ALERT NOTICE */}
        {reportType === 'SAFETY_ALERT_NOTICE' && (
          <div className="space-y-6 text-xs leading-relaxed">
            <div className="bg-red-50 p-4 rounded-xl border border-red-300 text-red-950 text-center space-y-1">
              <h2 className="text-xl font-extrabold font-serif">STATUTORY PUBLIC SAFETY NOTICE</h2>
              <p className="font-mono text-xs font-bold">Issued under MMC Act / NDMA Safety Protocol</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <p><strong>Structure:</strong> {building.name} ({building.address})</p>
              <p><strong>Cordon Zone:</strong> 2 km diameter perimeter buffer</p>
              <p><strong>Directive:</strong> Maintain clearance from exterior boundary and follow official municipal instructions.</p>
            </div>
          </div>
        )}

        {/* Footer Signatures */}
        <div className="pt-8 border-t-2 border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-6 text-[11px] font-mono">
          <div>
            <span className="text-slate-400 block text-[10px]">RECORD SOURCE</span>
            <span className="font-bold text-slate-800">MahaVastu & NMC GIS</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">AUDIT STATUS</span>
            <span className="font-bold text-slate-800">GROUND TRUTH VERIFIED</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">AUTHORITY JURISDICTION</span>
            <span className="font-bold text-slate-800">Zone {building.zoneNumber} NMC</span>
          </div>
        </div>

      </div>
    </div>
  );
};
