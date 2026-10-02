import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RiskBadge } from '../components/common/RiskBadge';
import { DemolitionDecisionModal } from '../components/common/DemolitionDecisionModal';
import { IssueMaintenanceNoticeModal } from '../components/common/IssueMaintenanceNoticeModal';
import { BuildingRecord, DemolitionDecision, DemolitionStatus, NoticeStatus } from '../types';
import {
  Radio,
  ShieldAlert,
  AlertOctagon,
  ClipboardCheck,
  CheckCircle2,
  PlusCircle,
  Clock,
  ArrowRight,
  UserCheck,
  FileText,
  Building2,
  X,
  Wrench,
  AlertTriangle,
  ZapOff,
  Flame,
  Droplets,
  Building,
  Layers,
  Sparkles,
  Calendar
} from 'lucide-react';

interface Props {
  setActiveTab: (tab: string) => void;
}

export const AuthorityDashboardPage: React.FC<Props> = ({ setActiveTab }) => {
  const {
    buildings,
    alerts,
    maintenanceNotices,
    demolitionOrders,
    resolveAlert,
    setActiveBuildingId,
    userRole,
    updateDemolitionStatus,
    updateNoticeStatus
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'COMMAND' | 'DEMOLITIONS' | 'NOTICES' | 'CRITICAL'>('COMMAND');
  const [selectedAlertForResolution, setSelectedAlertForResolution] = useState<string | null>(null);
  const [resolutionText, setResolutionText] = useState('Structural jacketing and steel shoring completed by licensed engineering contractor. Re-inspection confirmed stability.');
  
  // Modals state
  const [demolitionBuildingTarget, setDemolitionBuildingTarget] = useState<BuildingRecord | null>(null);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [noticePreselectedBuilding, setNoticePreselectedBuilding] = useState<BuildingRecord | undefined>(undefined);

  const criticalBuildings = buildings.filter(b => b.riskIndicator === 'CRITICAL');
  const highRiskBuildings = buildings.filter(b => b.riskIndicator === 'HIGH');
  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE' || a.status === 'VERIFIED');
  const resolvedAlerts = alerts.filter(a => a.status === 'RESOLVED');
  
  // Aging structures (>45 years)
  const currentYear = 2026;
  const agingBuildings = buildings.filter(b => {
    const age = currentYear - (b.constructionYear?.value || 1990);
    return age >= 45 || b.isCondemned;
  });

  const handleOpenBuilding = (bId: string) => {
    setActiveBuildingId(bId);
    setActiveTab('health-passport');
  };

  const handleConfirmResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlertForResolution) return;
    resolveAlert(selectedAlertForResolution, resolutionText);
    setSelectedAlertForResolution(null);
  };

  const handleTriggerDemolitionModal = (b: BuildingRecord) => {
    setDemolitionBuildingTarget(b);
  };

  const handleTriggerNoticeModal = (b?: BuildingRecord) => {
    setNoticePreselectedBuilding(b);
    setIsNoticeModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16 text-slate-800">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 bg-blue-50 border border-blue-200 rounded-full text-xs font-mono font-bold text-blue-700 flex items-center space-x-1">
                <Radio className="w-3.5 h-3.5 text-blue-600" />
                <span>NMC AUTHORITY COMMAND</span>
              </span>
              <span className="text-xs font-mono text-slate-500">Maharashtra Municipal Corporation Act (MMC Sec 264 / 265 / 268)</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              Municipal Structural Safety Command & Triage
            </h1>
            <p className="text-xs text-slate-500">
              Authority control center for issuing 2km early warnings, ordering Section 264 demolitions for terminal structures, and mandating Section 265 repair directives.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleTriggerNoticeModal()}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center space-x-1.5"
            >
              <Wrench className="w-4 h-4" />
              <span>+ Issue Maintenance Notice</span>
            </button>

            <button
              onClick={() => setActiveTab('create-alert')}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center space-x-1.5"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>+ Issue 2km Geo-Warning</span>
            </button>
          </div>
        </div>

        {/* View Switcher Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          {[
            { id: 'COMMAND', label: 'Command Overview', count: activeAlerts.length },
            { id: 'DEMOLITIONS', label: 'Section 264 Demolition Pipeline', count: demolitionOrders.length, highlight: true },
            { id: 'NOTICES', label: 'Section 265 Maintenance Directives', count: maintenanceNotices.length },
            { id: 'CRITICAL', label: 'Critical / High Risk Triage', count: criticalBuildings.length + highRiskBuildings.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeSubTab === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                activeSubTab === tab.id ? 'bg-white/20 text-white' : 'bg-white text-slate-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Authority KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-red-50/60 border border-red-200 p-4 rounded-2xl">
          <div className="text-xs font-mono text-red-700 font-bold uppercase tracking-wider">Critical Structures</div>
          <div className="text-3xl font-bold text-red-900 font-mono mt-1">{criticalBuildings.length}</div>
          <div className="text-[11px] text-red-600 mt-1">Hazardous C-1 / C-2 Category</div>
        </div>

        <div className="bg-orange-50/60 border border-orange-200 p-4 rounded-2xl">
          <div className="text-xs font-mono text-orange-700 font-bold uppercase tracking-wider">Demolition Pipeline</div>
          <div className="text-3xl font-bold text-orange-900 font-mono mt-1">{demolitionOrders.length}</div>
          <div className="text-[11px] text-orange-600 mt-1">Sec 264 Condemnation Orders</div>
        </div>

        <div className="bg-blue-50/60 border border-blue-200 p-4 rounded-2xl">
          <div className="text-xs font-mono text-blue-700 font-bold uppercase tracking-wider">Active Safety Alerts</div>
          <div className="text-3xl font-bold text-blue-900 font-mono mt-1">{activeAlerts.length}</div>
          <div className="text-[11px] text-blue-600 mt-1">Broadcasting in Geo-Fence</div>
        </div>

        <div className="bg-amber-50/60 border border-amber-200 p-4 rounded-2xl">
          <div className="text-xs font-mono text-amber-700 font-bold uppercase tracking-wider">Maintenance Directives</div>
          <div className="text-3xl font-bold text-amber-900 font-mono mt-1">{maintenanceNotices.length}</div>
          <div className="text-[11px] text-amber-600 mt-1">Sec 265 Compliance Notices</div>
        </div>
      </div>

      {/* TAB 1: COMMAND OVERVIEW & ACTIVE WARNINGS */}
      {(activeSubTab === 'COMMAND') && (
        <div className="space-y-6">
          {/* Active Alerts Management Queue */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                <span>Active Safety Warning Queue</span>
              </h3>
              <span className="text-xs font-mono text-slate-500">{activeAlerts.length} Active Broadcast(s)</span>
            </div>

            <div className="space-y-3">
              {activeAlerts.map(alt => (
                <div key={alt.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-sm">{alt.buildingName}</span>
                      <span className="px-2 py-0.5 bg-red-100 text-red-800 border border-red-200 rounded text-[10px] font-mono font-bold">
                        {alt.alertType}
                      </span>
                      <span className="text-slate-500 font-mono">Buffer: {alt.geoRadiusMeters}m</span>
                    </div>
                    <p className="text-slate-600">{alt.reasonForAlert}</p>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Verified Officer: {alt.verificationOfficer} • {alt.officerDesignation}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => setSelectedAlertForResolution(alt.id)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm transition"
                    >
                      Resolve Alert
                    </button>
                    <button
                      onClick={() => handleOpenBuilding(alt.buildingId)}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium border border-slate-200 transition"
                    >
                      Passport →
                    </button>
                  </div>
                </div>
              ))}

              {activeAlerts.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No active municipal safety warnings in need of resolution.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SECTION 264 DEMOLITION PIPELINE & AGING BUILDINGS */}
      {(activeSubTab === 'DEMOLITIONS' || activeSubTab === 'COMMAND') && (
        <div className="space-y-6">
          
          {/* Active Demolitions Tracking */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span>NMC Section 264 Statutory Demolition Orders & Pipeline</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Controlled mechanical implosion & deconstruction tracking for condemned structures beyond renovation viability.
                </p>
              </div>

              <span className="text-xs font-mono font-bold bg-red-50 text-red-800 border border-red-200 px-2.5 py-1 rounded-lg">
                {demolitionOrders.length} Condemned Orders
              </span>
            </div>

            <div className="space-y-4">
              {demolitionOrders.map(dem => (
                <div
                  key={dem.id}
                  className="bg-red-50/40 border border-red-200 rounded-2xl p-5 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-sm text-slate-900">{dem.buildingName}</span>
                        <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded font-mono text-[10px] font-bold">
                          {dem.orderNumber}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Age: <strong>{dem.buildingAgeYears} Yrs</strong> • Condition Score: <strong>{dem.structuralConditionScore}/100</strong> • Retrofit Ratio: <strong>{dem.repairToReplacementCostRatio}%</strong> (Unviable)
                      </p>
                    </div>

                    {/* Pipeline Stage Badges */}
                    <div className="flex items-center space-x-2">
                      <select
                        value={dem.status}
                        onChange={e => updateDemolitionStatus(dem.id, e.target.value as DemolitionStatus)}
                        className="bg-white border border-red-300 text-red-950 font-mono text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-500"
                      >
                        <option value="ORDER_ISSUED">1. Order Issued</option>
                        <option value="EVACUATION_IN_PROGRESS">2. Evacuation in Progress</option>
                        <option value="CORDON_SECURED">3. 2km Cordon Secured</option>
                        <option value="DEMOLITION_SCHEDULED">4. Demolition Scheduled</option>
                        <option value="DEMOLISHED">5. Demolished & Cleared</option>
                      </select>

                      <button
                        onClick={() => handleOpenBuilding(dem.buildingId)}
                        className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
                      >
                        Passport →
                      </button>
                    </div>
                  </div>

                  {/* Operational Details Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px] bg-white p-3 rounded-xl border border-red-200">
                    <div>
                      <span className="text-slate-400 font-mono block">METHOD</span>
                      <strong className="text-slate-800">{dem.demolitionMethod.replace(/_/g, ' ')}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-mono block">EXECUTION DATE</span>
                      <strong className="text-red-700">{dem.demolitionExecutionDate}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-mono block">UTILITY CUTOFFS</span>
                      <strong className="text-emerald-700">MSEDCL • Water • Gas Purged</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-mono block">ASSIGNED CONTRACTOR</span>
                      <strong className="text-slate-800 truncate block">{dem.contractorAssigned}</strong>
                    </div>
                  </div>

                </div>
              ))}

              {demolitionOrders.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No active Section 264 demolition orders currently in progress.
                </div>
              )}
            </div>
          </div>

          {/* Aging Buildings Ready for Condemnation Decision */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <span>Aging Structures Near Design Life (Condemnation Decision Queue)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Structures exceeding 45–50+ years design lifecycle evaluated for terminal structural degradation.
                </p>
              </div>

              <span className="text-xs font-mono text-slate-500">
                {agingBuildings.length} Aged Structure(s) Tracked
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {agingBuildings.map(b => {
                const age = currentYear - (b.constructionYear?.value || 1970);
                const designLifespan = b.designLifeYears || 50;
                const isOver = age >= designLifespan;

                return (
                  <div key={b.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span
                          className="font-bold text-slate-900 text-sm hover:text-blue-600 cursor-pointer transition"
                          onClick={() => handleOpenBuilding(b.id)}
                        >
                          {b.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border">
                          {b.id}
                        </span>
                        {b.isCondemned ? (
                          <span className="px-2 py-0.5 bg-red-600 text-white rounded font-mono text-[10px] font-bold">
                            CONDEMNED C-1
                          </span>
                        ) : isOver ? (
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-800 border border-orange-300 rounded font-mono text-[10px] font-bold">
                            EXCEEDED LIFESPAN ({age} YRS)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded font-mono text-[10px]">
                            AGE {age} YRS
                          </span>
                        )}
                      </div>

                      <div className="text-slate-600">
                        {b.ward} • Structural System: {b.structuralSystem?.value || 'RCC Frame'} • Condition: {b.officialMunicipalStatus?.value}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Design Life: {designLifespan} Yrs • Action Needed: {b.recommendedProfessionalAction}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                      <RiskBadge level={b.riskIndicator} score={b.riskScore} size="sm" />
                      
                      {!b.isCondemned ? (
                        <button
                          onClick={() => handleTriggerDemolitionModal(b)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-xs transition flex items-center space-x-1"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Evaluate for Demolition</span>
                        </button>
                      ) : (
                        <span className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-300 rounded-xl font-bold font-mono">
                          Order Active
                        </span>
                      )}

                      <button
                        onClick={() => handleOpenBuilding(b.id)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium border border-slate-200 transition"
                      >
                        Passport →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: SECTION 265 MAINTENANCE DIRECTIVES */}
      {(activeSubTab === 'NOTICES' || activeSubTab === 'COMMAND') && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-amber-600" />
                <span>Section 265 Municipal Maintenance Notices & Directives</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Official statutory notices issued to building owners, societies, and citizens for compulsory structural repairs.
              </p>
            </div>

            <button
              onClick={() => handleTriggerNoticeModal()}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Issue New Notice</span>
            </button>
          </div>

          <div className="space-y-3">
            {maintenanceNotices.map(not => (
              <div
                key={not.id}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">{not.buildingName}</span>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 rounded text-[10px] font-mono font-bold">
                      {not.noticeType.replace(/_/g, ' ')}
                    </span>
                    <span className="text-slate-500 font-mono">Deadline: {not.complianceDeadline}</span>
                  </div>
                  <p className="text-slate-600">{not.description}</p>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Statutory Ref: {not.statutoryReference} • Issued by: {not.issuingOfficer}
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                  <select
                    value={not.status}
                    onChange={e => updateNoticeStatus(not.id, e.target.value as NoticeStatus)}
                    className="bg-white border border-slate-300 text-slate-800 font-mono text-xs font-semibold rounded-xl px-2.5 py-1.5"
                  >
                    <option value="PENDING_ACTION">Pending Action</option>
                    <option value="IN_COMPLIANCE">In Compliance</option>
                    <option value="COMPLIED">Complied</option>
                    <option value="OVERDUE">Overdue</option>
                    <option value="ESCALATED_TO_DEMOLITION">Escalated to Demolition</option>
                  </select>

                  <button
                    onClick={() => handleOpenBuilding(not.buildingId)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium border border-slate-200 transition"
                  >
                    Passport →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RESOLUTION MODAL */}
      {selectedAlertForResolution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-left text-slate-800">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Resolve Safety Alert</h3>
              <button onClick={() => setSelectedAlertForResolution(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">✕</button>
            </div>

            <form onSubmit={handleConfirmResolution} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-700 block mb-1 font-semibold">Resolution Rationale / Re-Inspection Certificate</label>
                <textarea
                  value={resolutionText}
                  onChange={e => setResolutionText(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 font-sans"
                  required
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] text-slate-600 font-mono">
                Signing Authority: Shri Manoj S. Talware, Executive Engineer (NMC)
                <br />
                Action: Marks alert RESOLVED, lowers risk indicator, and logs immutable event to building Health Passport.
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setSelectedAlertForResolution(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20">
                  Confirm & Archive Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEMOLITION DECISION MODAL */}
      {demolitionBuildingTarget && (
        <DemolitionDecisionModal
          isOpen={Boolean(demolitionBuildingTarget)}
          onClose={() => setDemolitionBuildingTarget(null)}
          building={demolitionBuildingTarget}
        />
      )}

      {/* ISSUE MAINTENANCE NOTICE MODAL */}
      <IssueMaintenanceNoticeModal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
        preselectedBuilding={noticePreselectedBuilding}
      />

    </div>
  );
};
