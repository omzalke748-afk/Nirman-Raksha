import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  ShieldAlert,
  Wrench,
  AlertTriangle,
  Clock,
  MapPin,
  FileText,
  PhoneCall,
  CheckCircle2,
  X,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Building2,
  Calendar,
  ZapOff,
  Flame,
  Droplets,
  Radio,
  Search,
  Filter
} from 'lucide-react';
import { RiskBadge } from './RiskBadge';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: string) => void;
}

export const NotificationCenterModal: React.FC<Props> = ({
  isOpen,
  onClose,
  setActiveTab
}) => {
  const {
    alerts,
    maintenanceNotices,
    demolitionOrders,
    userRole,
    setActiveBuildingId,
    markAllNotificationsAsRead,
    updateNoticeStatus
  } = useApp();

  const [activeTabFilter, setActiveTabFilter] = useState<'ALL' | 'ALERTS' | 'NOTICES' | 'DEMOLITION'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE' || a.status === 'VERIFIED');
  const pendingNotices = maintenanceNotices.filter(n => n.status === 'PENDING_ACTION' || n.status === 'IN_COMPLIANCE');
  const activeDemolitions = demolitionOrders.filter(d => d.status !== 'DEMOLISHED');

  const totalCount = activeAlerts.length + pendingNotices.length + activeDemolitions.length;

  const handleOpenBuilding = (buildingId: string) => {
    setActiveBuildingId(buildingId);
    setActiveTab('health-passport');
    onClose();
  };

  const filteredNotices = maintenanceNotices.filter(n => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return n.buildingName.toLowerCase().includes(q) || n.ward.toLowerCase().includes(q) || n.description.toLowerCase().includes(q);
  });

  const filteredAlerts = alerts.filter(a => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return a.buildingName.toLowerCase().includes(q) || a.ward.toLowerCase().includes(q) || a.reasonForAlert.toLowerCase().includes(q);
  });

  const filteredDemolitions = demolitionOrders.filter(d => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return d.buildingName.toLowerCase().includes(q) || d.ward.toLowerCase().includes(q) || d.orderNumber.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative text-slate-800">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-teal-500/20 border border-teal-400/30 rounded-2xl">
              <Bell className="w-6 h-6 text-teal-300 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                  Nagpur Municipal Broadcast & Notice Center
                </h2>
                <span className="px-2 py-0.5 bg-teal-400/20 text-teal-300 border border-teal-400/30 rounded-full font-mono text-xs font-bold">
                  {totalCount} Active
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Official real-time safety warnings, municipal maintenance directives, and statutory Section 264 demolition orders.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={markAllNotificationsAsRead}
              className="hidden sm:inline-block px-3 py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 rounded-xl text-xs font-medium transition"
            >
              Mark All Read
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition"
              title="Close Notification Center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          
          {/* Tabs */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveTabFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTabFilter === 'ALL'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>All Broadcasts</span>
              <span className="px-1.5 py-0.2 bg-white/20 rounded text-[10px] font-mono">
                {totalCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTabFilter('ALERTS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTabFilter === 'ALERTS'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span>Safety Alerts</span>
              <span className="px-1.5 py-0.2 bg-red-100 text-red-800 rounded text-[10px] font-mono">
                {activeAlerts.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTabFilter('NOTICES')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTabFilter === 'NOTICES'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              <span>Maintenance Directives</span>
              <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded text-[10px] font-mono">
                {pendingNotices.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTabFilter('DEMOLITION')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTabFilter === 'DEMOLITION'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              <span>Section 264 Demolitions</span>
              <span className="px-1.5 py-0.2 bg-slate-200 text-slate-800 rounded text-[10px] font-mono">
                {activeDemolitions.length}
              </span>
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter by building or zone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
            />
          </div>

        </div>

        {/* Scrollable Notifications Stream */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 divide-y divide-slate-100">

          {/* SECTION 1: EMERGENCY DEMOLITION ORDERS */}
          {(activeTabFilter === 'ALL' || activeTabFilter === 'DEMOLITION') && (
            <div className="space-y-3">
              {filteredDemolitions.map(dem => (
                <div
                  key={dem.id}
                  className="bg-red-50/70 border-2 border-red-500/70 rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-mono font-bold px-3 py-1 rounded-bl-xl tracking-wider uppercase flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <span>NMC SEC 264 DEMOLITION ORDER</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="px-2.5 py-0.5 bg-red-100 text-red-900 border border-red-300 rounded font-mono text-xs font-bold">
                      {dem.orderNumber}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-900 text-white rounded text-[10px] font-mono font-bold">
                      Condemned C-1
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      Zone {dem.zoneNumber} • {dem.ward}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-slate-950">
                      {dem.buildingName}
                    </h3>
                    <p className="text-xs text-red-950 font-medium mt-1 leading-relaxed">
                      Structure age has passed design life (<strong>{dem.buildingAgeYears} years old</strong> vs 50-year design life). Condition score is <strong>{dem.structuralConditionScore}/100</strong>. Engineering board certified that renovation is technically infeasible and economically unviable (Retrofit cost ratio: <strong>{dem.repairToReplacementCostRatio}%</strong>).
                    </p>
                  </div>

                  {/* Failure Mechanisms */}
                  <div className="bg-white/80 p-3 rounded-xl border border-red-200 text-xs space-y-1.5">
                    <div className="font-bold text-red-900 uppercase tracking-wider text-[10px] font-mono">
                      Certified Failure Mechanisms & Board Findings:
                    </div>
                    <ul className="list-disc list-inside text-slate-700 space-y-0.5 text-[11px]">
                      {dem.primaryFailureMechanisms.map((mech, idx) => (
                        <li key={idx}>{mech}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Demolition & Evacuation Directive Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="bg-red-100/60 p-2.5 rounded-xl border border-red-200">
                      <span className="text-[10px] text-red-700 font-mono font-bold block">EVACUATION DEADLINE</span>
                      <strong className="text-red-950 text-xs">{dem.evacuationDeadline}</strong>
                    </div>
                    <div className="bg-red-100/60 p-2.5 rounded-xl border border-red-200">
                      <span className="text-[10px] text-red-700 font-mono font-bold block">SCHEDULED DEMOLITION</span>
                      <strong className="text-slate-900 text-xs">{dem.demolitionExecutionDate} ({dem.demolitionMethod.replace(/_/g, ' ')})</strong>
                    </div>
                    <div className="bg-red-100/60 p-2.5 rounded-xl border border-red-200">
                      <span className="text-[10px] text-red-700 font-mono font-bold block">TRANSIT REHABILITATION</span>
                      <strong className="text-slate-900 text-xs truncate block">{dem.rehabilitationCampLocation}</strong>
                    </div>
                  </div>

                  {/* Actions & Authority Footer */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-red-200/80 text-xs">
                    <div className="text-[11px] text-slate-600 font-mono">
                      Authorizing Commissioner: <strong>{dem.authorizingCommissioner}</strong>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenBuilding(dem.buildingId)}
                        className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-xs transition flex items-center space-x-1"
                      >
                        <span>View Condemned Health Passport</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SECTION 2: EMERGENCY SAFETY ALERTS */}
          {(activeTabFilter === 'ALL' || activeTabFilter === 'ALERTS') && (
            <div className="space-y-3 pt-3">
              {filteredAlerts.map(alt => (
                <div
                  key={alt.id}
                  className={`rounded-2xl p-5 border shadow-sm space-y-3 ${
                    alt.status === 'ACTIVE'
                      ? 'bg-red-50/50 border-red-300 ring-1 ring-red-200'
                      : 'bg-slate-50 border-slate-200 opacity-80'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 bg-red-100 text-red-800 border border-red-200 rounded font-mono text-xs font-bold flex items-center space-x-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                        <span>{alt.id}</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        alt.status === 'ACTIVE' ? 'bg-red-600 text-white border-red-600' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}>
                        {alt.status}
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        {alt.ward} • {alt.area}
                      </span>
                    </div>

                    <span className="text-xs font-mono text-slate-500">
                      Buffer Radius: <strong>{alt.geoRadiusMeters}m</strong> ({(alt.geoRadiusMeters * 2) / 1000} km diameter)
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {alt.buildingName}
                    </h3>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                      {alt.reasonForAlert}
                    </p>
                  </div>

                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-950 font-mono space-y-1">
                    <div className="font-bold uppercase tracking-wider text-[10px] text-amber-800">
                      Official Public Safety Directive:
                    </div>
                    <div>{alt.officialInstructions}</div>
                    <div className="text-[11px] text-amber-800 pt-1 flex items-center space-x-1">
                      <PhoneCall className="w-3.5 h-3.5 shrink-0" />
                      <span>Control Room: {alt.emergencyContact}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 text-xs text-slate-500 border-t border-slate-100">
                    <span className="text-[11px] font-mono">
                      Verified by: {alt.verificationOfficer} ({alt.officerDesignation})
                    </span>
                    <button
                      onClick={() => handleOpenBuilding(alt.buildingId)}
                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs transition flex items-center space-x-1"
                    >
                      <span>Review Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SECTION 3: MUNICIPAL MAINTENANCE DIRECTIVES */}
          {(activeTabFilter === 'ALL' || activeTabFilter === 'NOTICES') && (
            <div className="space-y-3 pt-3">
              {filteredNotices.map(not => (
                <div
                  key={not.id}
                  className={`rounded-2xl p-5 border shadow-sm space-y-3 ${
                    not.status === 'OVERDUE'
                      ? 'bg-orange-50 border-orange-300'
                      : not.status === 'COMPLIED'
                      ? 'bg-emerald-50/50 border-emerald-200 opacity-80'
                      : 'bg-white border-amber-200 ring-1 ring-amber-100'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-200 rounded font-mono text-xs font-bold flex items-center space-x-1">
                        <Wrench className="w-3.5 h-3.5 text-amber-700" />
                        <span>{not.id}</span>
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-800 border border-slate-200 rounded text-[10px] font-mono font-bold">
                        {not.noticeType.replace(/_/g, ' ')}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        not.priority === 'URGENT'
                          ? 'bg-red-100 text-red-800 border-red-200'
                          : not.priority === 'HIGH'
                          ? 'bg-orange-100 text-orange-800 border-orange-200'
                          : 'bg-blue-100 text-blue-800 border-blue-200'
                      }`}>
                        {not.priority} PRIORITY
                      </span>
                    </div>

                    <div className="text-xs font-mono text-slate-500">
                      Deadline: <strong className="text-slate-800">{not.complianceDeadline}</strong>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {not.buildingName} ({not.ward})
                    </h3>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                      {not.description}
                    </p>
                  </div>

                  {/* Mandatory Action Items */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                    <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px] font-mono">
                      Mandatory Statutory Compliance Actions ({not.statutoryReference}):
                    </div>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11px]">
                      {not.mandatoryActions.map((act, idx) => (
                        <li key={idx}>{act}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                    <div className="text-[11px] text-slate-500 font-mono">
                      Issued by: {not.issuingOfficer} • {not.issuingAuthority}
                    </div>

                    <div className="flex items-center space-x-2">
                      {userRole !== 'CITIZEN' && not.status === 'PENDING_ACTION' && (
                        <button
                          onClick={() => updateNoticeStatus(not.id, 'IN_COMPLIANCE')}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-xs transition"
                        >
                          Mark in Progress
                        </button>
                      )}
                      {userRole !== 'CITIZEN' && not.status === 'IN_COMPLIANCE' && (
                        <button
                          onClick={() => updateNoticeStatus(not.id, 'COMPLIED')}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition"
                        >
                          Verify & Complete
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenBuilding(not.buildingId)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium border border-slate-300 text-xs transition flex items-center space-x-1"
                      >
                        <span>Passport →</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalCount === 0 && (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">All Clear Across Nagpur</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No active municipal safety warnings, overdue maintenance directives, or Section 264 demolition orders at this time.
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="font-mono text-[11px]">
            NMC Early Warning & Structural Safety Network • 24x7 Control Helpline: <strong className="text-slate-800">0712-2567014</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition"
          >
            Close Notification Center
          </button>
        </div>

      </div>
    </div>
  );
};
