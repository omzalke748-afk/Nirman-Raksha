import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BuildingRecord, NoticePriority, NoticeStatus, MaintenanceNotice, DemolitionDecision } from '../types';
import {
  Wrench,
  PlusCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Building2,
  FileText,
  Filter,
  Search,
  ZapOff,
  Flame,
  UserCheck,
  Send,
  AlertOctagon,
  Layers,
  ChevronRight
} from 'lucide-react';
import { IssueMaintenanceNoticeModal } from '../components/common/IssueMaintenanceNoticeModal';
import { DemolitionDecisionModal } from '../components/common/DemolitionDecisionModal';
import { RiskBadge } from '../components/common/RiskBadge';

interface Props {
  setActiveTab: (tab: string) => void;
}

export const MaintenancePage: React.FC<Props> = ({ setActiveTab }) => {
  const {
    buildings,
    setActiveBuildingId,
    addMaintenance,
    userRole,
    maintenanceNotices,
    updateNoticeStatus,
    demolitionOrders
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'notices' | 'ledger' | 'demolitions'>('notices');
  const [selectedBuildingId, setSelectedBuildingId] = useState(buildings[0]?.id || 'NMC-SAT-2026-089');
  const [showLogModal, setShowLogModal] = useState(false);
  const [showIssueNoticeModal, setShowIssueNoticeModal] = useState(false);
  const [demolitionBuilding, setDemolitionBuilding] = useState<BuildingRecord | null>(null);

  // Search and filters for notices
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // Form states for manual maintenance entry
  const [problem, setProblem] = useState('');
  const [action, setAction] = useState('');
  const [contractor, setContractor] = useState('');
  const [cost, setCost] = useState<number | undefined>(undefined);
  const [nextDue, setNextDue] = useState('');

  const handleOpenBuilding = (bId: string) => {
    setActiveBuildingId(bId);
    setActiveTab('health-passport');
  };

  const handleSaveMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem || !action) return;

    addMaintenance(selectedBuildingId, {
      date: new Date().toISOString().split('T')[0],
      contractorName: contractor || 'Municipal Approved Agency',
      repairType: 'STRUCTURAL_RETROFITTING',
      problemDescription: problem,
      description: action,
      actionTaken: action,
      costInr: cost,
      status: 'COMPLETED',
      nextInspectionDue: nextDue || undefined
    });

    setProblem('');
    setAction('');
    setContractor('');
    setCost(undefined);
    setNextDue('');
    setShowLogModal(false);
  };

  // Filtered notices
  const filteredNotices = maintenanceNotices.filter(notice => {
    const matchesSearch =
      notice.buildingName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.ward.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || notice.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || notice.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const activeNoticesCount = maintenanceNotices.filter(n => n.status === 'PENDING_ACTION' || n.status === 'IN_COMPLIANCE').length;
  const overdueNoticesCount = maintenanceNotices.filter(n => n.status === 'OVERDUE').length;
  const compliedNoticesCount = maintenanceNotices.filter(n => n.status === 'COMPLIED').length;

  return (
    <div className="space-y-6 animate-fadeIn pb-12 text-slate-800">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-teal-50 border border-teal-200 rounded-xl text-teal-800">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Nagpur Structural Maintenance, Directives & Demolition Control
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Statutory repair directives (MMC Act Section 265), structural audit mandates, maintenance logs & Section 264 condemnation workflows.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          {userRole !== 'CITIZEN' && (
            <>
              <button
                onClick={() => setShowIssueNoticeModal(true)}
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>+ Issue Section 265 Notice</span>
              </button>
              <button
                onClick={() => setShowLogModal(true)}
                className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Log Repair Entry</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-amber-50/60 border border-amber-200 p-4 rounded-2xl space-y-1.5">
          <div className="text-xs font-mono font-bold text-amber-800 uppercase tracking-wider flex items-center justify-between">
            <span>Active Sec 265 Notices</span>
            <FileText className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-2xl font-bold text-amber-900 font-mono">
            {activeNoticesCount}
          </div>
          <p className="text-[11px] text-amber-700 leading-snug">
            Repair & retrofitting directives pending or under compliance.
          </p>
        </div>

        <div className="bg-red-50/60 border border-red-200 p-4 rounded-2xl space-y-1.5">
          <div className="text-xs font-mono font-bold text-red-700 uppercase tracking-wider flex items-center justify-between">
            <span>Section 264 Condemned</span>
            <AlertOctagon className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-900 font-mono">
            {demolitionOrders.length}
          </div>
          <p className="text-[11px] text-red-600 leading-snug">
            Category C-1 dangerous structures ordered for scheduled demolition.
          </p>
        </div>

        <div className="bg-rose-50/60 border border-rose-200 p-4 rounded-2xl space-y-1.5">
          <div className="text-xs font-mono font-bold text-rose-800 uppercase tracking-wider flex items-center justify-between">
            <span>Immediate Triage Repairs</span>
            <AlertTriangle className="w-4 h-4 text-rose-700" />
          </div>
          <div className="text-2xl font-bold text-rose-900 font-mono">
            {buildings.filter(b => b.maintenancePriority === 'IMMEDIATE_REPAIR').length}
          </div>
          <p className="text-[11px] text-rose-700 leading-snug">
            Columns requiring urgent steel propping or crack grouting.
          </p>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200 p-4 rounded-2xl space-y-1.5">
          <div className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider flex items-center justify-between">
            <span>Complied Directives</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-900 font-mono">
            {compliedNoticesCount}
          </div>
          <p className="text-[11px] text-emerald-600 leading-snug">
            Retrofitting verified with Stability Certificate submitted.
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-6 pt-3 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('notices')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeSubTab === 'notices'
              ? 'border-amber-600 text-amber-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Statutory Section 265 Directives ({maintenanceNotices.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ledger')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeSubTab === 'ledger'
              ? 'border-teal-700 text-teal-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Building Maintenance & Inspection Ledger ({buildings.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('demolitions')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeSubTab === 'demolitions'
              ? 'border-red-600 text-red-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          <span>Section 264 Demolition Pipeline ({demolitionOrders.length})</span>
        </button>
      </div>

      {/* TAB 1: SECTION 265 MAINTENANCE NOTICES */}
      {activeSubTab === 'notices' && (
        <div className="bg-white border border-slate-200 rounded-b-2xl p-6 shadow-sm space-y-6">
          
          {/* Controls & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search directives by building, ward, reference or keyword..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center space-x-1">
                <span className="text-slate-500 font-medium">Status:</span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING_ACTION">Pending Action</option>
                  <option value="IN_COMPLIANCE">In Compliance</option>
                  <option value="OVERDUE">Overdue</option>
                  <option value="COMPLIED">Complied</option>
                  <option value="ESCALATED_TO_DEMOLITION">Escalated</option>
                </select>
              </div>

              <div className="flex items-center space-x-1">
                <span className="text-slate-500 font-medium">Priority:</span>
                <select
                  value={priorityFilter}
                  onChange={e => setPriorityFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="URGENT">Urgent</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notices Grid */}
          <div className="space-y-4">
            {filteredNotices.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                <FileText className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <p className="font-semibold text-sm">No maintenance notices found matching filters.</p>
              </div>
            ) : (
              filteredNotices.map(notice => (
                <div
                  key={notice.id}
                  className={`border rounded-2xl p-5 space-y-4 transition ${
                    notice.priority === 'URGENT'
                      ? 'border-red-300 bg-red-50/20'
                      : notice.priority === 'HIGH'
                      ? 'border-amber-300 bg-amber-50/20'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-bold">
                          {notice.id}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                          notice.priority === 'URGENT'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : notice.priority === 'HIGH'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {notice.priority} PRIORITY
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                          notice.status === 'COMPLIED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : notice.status === 'IN_COMPLIANCE'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : notice.status === 'OVERDUE'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {notice.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">
                        {notice.buildingName} <span className="text-slate-500 text-xs font-normal">({notice.ward}, Zone {notice.zoneNumber})</span>
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <div className="text-right">
                        <div className="text-[11px] text-slate-500 font-medium">Compliance Deadline:</div>
                        <div className="font-mono font-bold text-red-700">{notice.complianceDeadline}</div>
                      </div>
                      <button
                        onClick={() => handleOpenBuilding(notice.buildingId)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold border border-slate-300 transition flex items-center space-x-1"
                      >
                        <span>Passport</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    {notice.description}
                  </p>

                  {/* Required Action Items */}
                  {notice.mandatoryActions && notice.mandatoryActions.length > 0 && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
                      <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider font-mono">
                        Statutory Checklist for Owner / Occupier:
                      </div>
                      <ul className="space-y-1.5 text-slate-600">
                        {notice.mandatoryActions.map((act, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <span className="text-teal-700 font-bold font-mono">[{idx + 1}]</span>
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Footer & Authority Compliance Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <div>
                      <span>Statutory Reference: </span>
                      <strong className="text-slate-700">{notice.statutoryReference}</strong>
                      <span className="mx-2">•</span>
                      <span>Issued: {notice.issuedDate} by {notice.issuingOfficer} ({notice.officerDesignation})</span>
                    </div>

                    {userRole !== 'CITIZEN' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-semibold text-slate-600">Update Status:</span>
                        <button
                          onClick={() => updateNoticeStatus(notice.id, 'IN_COMPLIANCE')}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg font-semibold transition"
                        >
                          In Compliance
                        </button>
                        <button
                          onClick={() => updateNoticeStatus(notice.id, 'COMPLIED')}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg font-semibold transition"
                        >
                          Mark Complied
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MAINTENANCE LEDGER */}
      {activeSubTab === 'ledger' && (
        <div className="bg-white border border-slate-200 rounded-b-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Documented Building Maintenance Ledger</h3>
              <p className="text-xs text-slate-500">IS-456 Grounded repair interventions, epoxy grouting, steel jacketing & inspection logs.</p>
            </div>
            <span className="text-xs font-mono text-slate-400">Total Structures: {buildings.length}</span>
          </div>

          <div className="divide-y divide-slate-100">
            {buildings.map(b => (
              <div key={b.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                      {b.id}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{b.name}</span>
                    <span className="text-slate-400 font-normal">({b.category || b.buildingType})</span>
                    {b.isCondemned && (
                      <span className="px-1.5 py-0.5 bg-red-100 text-red-800 font-mono font-bold text-[10px] rounded border border-red-200">
                        CONDEMNED (C-1)
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 font-medium">
                    {b.maintenance && b.maintenance.length > 0
                      ? `Latest: ${b.maintenance[b.maintenance.length - 1].problemDescription || b.maintenance[b.maintenance.length - 1].description}`
                      : 'No past repair history recorded in the registry.'}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                    <span>Priority: <strong className="text-slate-800">{b.maintenancePriority}</strong></span>
                    <span>•</span>
                    <span>
                      Next Inspection Due: <strong className="text-teal-800">{b.nextInspectionDueDate || 'Schedule pending'}</strong>
                    </span>
                    {b.maintenance && b.maintenance.length > 0 && (
                      <>
                        <span>•</span>
                        <span>Total Interventions: {b.maintenance.length}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {userRole !== 'CITIZEN' && !b.isCondemned && (
                    <button
                      onClick={() => setDemolitionBuilding(b)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-semibold border border-red-200 transition text-xs"
                    >
                      Evaluate Demolition
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenBuilding(b.id)}
                    className="px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl font-semibold border border-teal-200 transition flex items-center gap-1"
                  >
                    <span>View Passport</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SECTION 264 DEMOLITION PIPELINE */}
      {activeSubTab === 'demolitions' && (
        <div className="bg-white border border-slate-200 rounded-b-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-red-600" />
                <span>MMC Act Section 264 Demolition & Condemnation Register</span>
              </h3>
              <p className="text-xs text-slate-500">
                Structures beyond design lifespan with structural damage unviable for retrofitting, scheduled for controlled demolition.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-xl">
              {demolitionOrders.length} Condemned Assets
            </span>
          </div>

          <div className="space-y-4">
            {demolitionOrders.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                <ShieldCheck className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                <p className="font-semibold text-sm">No active demolition orders currently in force.</p>
              </div>
            ) : (
              demolitionOrders.map(order => (
                <div key={order.id} className="bg-slate-950 border-2 border-red-600 rounded-2xl p-5 space-y-4 text-white shadow-lg">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-red-900/60 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 bg-red-600 text-white font-mono font-extrabold text-[10px] rounded uppercase tracking-wider">
                          CATEGORY C-1 CONDEMNED
                        </span>
                        <span className="font-mono text-slate-400 text-xs">{order.orderNumber}</span>
                        <span className="text-xs text-red-300 font-mono">Zone {order.zoneNumber}</span>
                      </div>
                      <h4 className="text-lg font-bold text-white">{order.buildingName}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenBuilding(order.buildingId)}
                        className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-xs shadow transition flex items-center space-x-1"
                      >
                        <span>Open Passport</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Statutory condemnation under {order.statutoryReference}. Condition score: {order.structuralConditionScore}/100. Retrofit vs rebuild cost ratio: {order.repairToReplacementCostRatio}% (Unviable). Primary defect mechanisms: {order.primaryFailureMechanisms.join(', ')}.
                  </p>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-xs">
                    <div>
                      <div className="text-slate-400 text-[10px]">Building Age vs Design Life</div>
                      <div className="font-mono font-bold text-red-400">
                        {order.buildingAgeYears} yrs / {order.designLifeYears} yrs (Exceeded)
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px]">Evacuation Deadline</div>
                      <div className="font-mono font-bold text-amber-400">{order.evacuationDeadline}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px]">Demolition Date</div>
                      <div className="font-mono font-bold text-red-300">{order.demolitionExecutionDate}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px]">Safety Cordon</div>
                      <div className="font-mono font-bold text-teal-400">{order.safetyPerimeterRadiusMeters}m Radius</div>
                    </div>
                  </div>

                  {/* Utilities & Contractors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-red-950/40 p-3 rounded-xl border border-red-900/60 space-y-1.5">
                      <div className="text-[10px] font-mono font-bold text-red-400 uppercase">Utility Isolation Status:</div>
                      <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-300">
                        <span className={order.utilityCutoffChecklist.powerDisconnected ? 'text-emerald-400' : 'text-slate-400'}>
                          ⚡ MSEDCL Power: {order.utilityCutoffChecklist.powerDisconnected ? 'DISCONNECTED' : 'PENDING'}
                        </span>
                        <span className={order.utilityCutoffChecklist.waterDisconnected ? 'text-emerald-400' : 'text-slate-400'}>
                          💧 NMC Water: {order.utilityCutoffChecklist.waterDisconnected ? 'ISOLATED' : 'PENDING'}
                        </span>
                        <span className={order.utilityCutoffChecklist.gasPurged ? 'text-emerald-400' : 'text-slate-400'}>
                          🔥 PNG Gas: {order.utilityCutoffChecklist.gasPurged ? 'SEALED' : 'PENDING'}
                        </span>
                        <span className={order.utilityCutoffChecklist.telecomRerouted ? 'text-emerald-400' : 'text-slate-400'}>
                          📡 Telecom: {order.utilityCutoffChecklist.telecomRerouted ? 'REROUTED' : 'PENDING'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1 text-xs">
                      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">Execution Contractor:</div>
                      <div className="font-semibold text-slate-200">{order.contractorAssigned}</div>
                      <div className="text-[11px] text-slate-400">Method: {order.demolitionMethod.replace(/_/g, ' ')}</div>
                      {order.rehabilitationCampLocation && (
                        <div className="text-[11px] text-teal-400">Transit Shelter: {order.rehabilitationCampLocation}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* LOG MAINTENANCE ENTRY MODAL */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="font-bold text-slate-900 text-base">Record Maintenance / Repair Action</h3>
            
            <form onSubmit={handleSaveMaintenance} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Building</label>
                <select
                  value={selectedBuildingId}
                  onChange={e => setSelectedBuildingId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                >
                  {buildings.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.ward})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Problem / Defect Addressed</label>
                <input
                  type="text"
                  required
                  value={problem}
                  onChange={e => setProblem(e.target.value)}
                  placeholder="e.g. Epoxy pressure grouting on shear cracks..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Remedial Action Taken</label>
                <textarea
                  rows={2}
                  required
                  value={action}
                  onChange={e => setAction(e.target.value)}
                  placeholder="e.g. Injected low-viscosity structural epoxy under 4 bar pressure..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contractor / Agency</label>
                  <input
                    type="text"
                    value={contractor}
                    onChange={e => setContractor(e.target.value)}
                    placeholder="e.g. Nagpur Retrofitters Ltd."
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cost (INR)</label>
                  <input
                    type="number"
                    value={cost || ''}
                    onChange={e => setCost(Number(e.target.value))}
                    placeholder="e.g. 125000"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Next Recommended Inspection Due</label>
                <input
                  type="date"
                  value={nextDue}
                  onChange={e => setNextDue(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ISSUE MAINTENANCE NOTICE MODAL */}
      <IssueMaintenanceNoticeModal
        isOpen={showIssueNoticeModal}
        onClose={() => setShowIssueNoticeModal(false)}
      />

      {/* DEMOLITION DECISION MODAL */}
      {demolitionBuilding && (
        <DemolitionDecisionModal
          isOpen={true}
          onClose={() => setDemolitionBuilding(null)}
          building={demolitionBuilding}
        />
      )}

    </div>
  );
};
