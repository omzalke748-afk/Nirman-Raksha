import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldAlert,
  Bell,
  MapPin,
  PhoneCall,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building2
} from 'lucide-react';

interface Props {
  setActiveTab: (tab: string) => void;
}

export const PublicAlertsPage: React.FC<Props> = ({ setActiveTab }) => {
  const { alerts, demolitionOrders, setActiveBuildingId } = useApp();
  const [filter, setFilter] = useState<'ACTIVE' | 'DEMOLITIONS' | 'RESOLVED' | 'ALL'>('ACTIVE');

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'ACTIVE') return a.status === 'ACTIVE' || a.status === 'VERIFIED';
    if (filter === 'RESOLVED') return a.status === 'RESOLVED';
    return true;
  });

  const activeDemolitions = demolitionOrders.filter(d => d.status !== 'DEMOLISHED');

  const handleOpenBuilding = (buildingId: string) => {
    setActiveBuildingId(buildingId);
    setActiveTab('health-passport');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16 text-slate-800">
      
      {/* Title & Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 bg-red-50 border border-red-200 rounded-full text-xs font-mono font-bold text-red-700 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
            <span>NMC PUBLIC SAFETY NOTICES</span>
          </span>
          <span className="text-xs text-slate-500 font-mono">Nagpur Early Warning System</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Nagpur Municipal Safety Warnings & Demolition Orders
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
          Official location-based safety warnings and statutory Section 264 demolition directives issued exclusively by authorized municipal engineers and disaster management authorities.
        </p>

        {/* Filter Toggle */}
        <div className="flex flex-wrap gap-2 pt-2">
          {[
            { id: 'ACTIVE', label: 'Active Warnings', count: alerts.filter(a => a.status === 'ACTIVE').length },
            { id: 'DEMOLITIONS', label: 'Section 264 Demolition Orders', count: activeDemolitions.length },
            { id: 'RESOLVED', label: 'Resolved Warnings', count: alerts.filter(a => a.status === 'RESOLVED').length },
            { id: 'ALL', label: 'All Records', count: alerts.length + demolitionOrders.length }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition flex items-center space-x-1.5 ${
                filter === t.id
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-200'
              }`}
            >
              <span>{t.label}</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                filter === t.id ? 'bg-white/20 text-white' : 'bg-white text-slate-700'
              }`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Alerts & Demolition Stream */}
      <div className="space-y-4">
        
        {/* SECTION 264 DEMOLITION ORDERS */}
        {(filter === 'DEMOLITIONS' || filter === 'ALL') && (
          <div className="space-y-4">
            {activeDemolitions.map(dem => (
              <div
                key={dem.id}
                className="rounded-2xl p-6 border-2 border-red-500/80 shadow-md space-y-4 bg-red-50/50"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-200 pb-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-red-900 bg-red-100 px-2 py-0.5 rounded border border-red-300">
                        {dem.orderNumber}
                      </span>
                      <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-red-600 text-white animate-pulse">
                        CONDEMNED C-1 DEMOLITION ORDER
                      </span>
                      <span className="px-2 py-0.5 bg-slate-900 text-white rounded text-xs font-mono">
                        {dem.demolitionMethod.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-950 tracking-tight mt-1">
                      {dem.buildingName}
                    </h3>
                  </div>

                  <div className="text-right text-xs font-mono text-slate-600">
                    <div>Zone: <strong className="text-slate-900">{dem.ward}</strong></div>
                    <div>Perimeter Cordon: <strong className="text-red-700">{dem.safetyPerimeterRadiusMeters}m</strong></div>
                  </div>
                </div>

                {/* Reason & Evacuation Specs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-white p-4 rounded-xl border border-red-200 space-y-2">
                    <span className="font-bold text-red-700 uppercase tracking-wider text-[11px] font-mono flex items-center space-x-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Condemnation Justification & Age</span>
                    </span>
                    <p className="text-slate-800 leading-relaxed font-medium">
                      Structure age has passed ({dem.buildingAgeYears} years old vs {dem.designLifeYears}-year design lifespan). Renovation is technically impossible and economically unviable ({dem.repairToReplacementCostRatio}% retrofit cost ratio exceeds 70% threshold).
                    </p>
                    <div className="text-[11px] text-red-700 font-mono pt-1">
                      Scheduled Demolition: <strong>{dem.demolitionExecutionDate}</strong>
                    </div>
                  </div>

                  <div className="bg-amber-50/80 p-4 rounded-xl border border-amber-300 space-y-2">
                    <span className="font-bold text-amber-900 uppercase tracking-wider text-[11px] font-mono flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Evacuation & Transit Relief Shelter</span>
                    </span>
                    <p className="text-slate-800 leading-relaxed">
                      <strong>Deadline:</strong> {dem.evacuationDeadline}. All occupants must relocate. Essential utilities (power, water, gas) isolated.
                    </p>
                    <div className="text-[11px] text-amber-950 font-mono pt-1">
                      Designated Shelter: <strong>{dem.rehabilitationCampLocation}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-red-200 text-[11px] text-slate-600 font-mono">
                  <span>Authorizing Authority: <strong className="text-slate-900">{dem.authorizingCommissioner}</strong></span>
                  <button
                    onClick={() => handleOpenBuilding(dem.buildingId)}
                    className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-xs transition"
                  >
                    View Condemned Passport →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SAFETY ALERTS */}
        {filter !== 'DEMOLITIONS' && filteredAlerts.map(alert => (
          <div
            key={alert.id}
            className={`rounded-2xl p-6 border shadow-sm transition space-y-4 bg-white ${
              alert.status === 'RESOLVED'
                ? 'border-slate-200 opacity-90'
                : 'border-red-300 ring-1 ring-red-100'
            }`}
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {alert.id}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold border ${
                    alert.status === 'RESOLVED'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                  }`}>
                    {alert.status === 'RESOLVED' ? 'RESOLVED' : 'ACTIVE SAFETY WARNING'}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded text-xs font-mono">
                    {alert.alertType.replace(/_/g, ' ')}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 tracking-tight mt-1">
                  {alert.buildingName}
                </h3>
              </div>

              <div className="text-right text-xs font-mono text-slate-500">
                <div>Zone: <strong className="text-slate-800">{alert.ward}</strong></div>
                <div>Area: <strong className="text-slate-800">{alert.area}</strong></div>
              </div>
            </div>

            {/* Core Distress Reason & Directive */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-red-50/60 p-4 rounded-xl border border-red-200 space-y-2">
                <span className="font-bold text-red-700 uppercase tracking-wider text-[11px] font-mono flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Reason for Municipal Alert</span>
                </span>
                <p className="text-red-950 leading-relaxed font-medium">{alert.reasonForAlert}</p>
                <div className="text-[11px] text-red-700 font-mono pt-1">
                  Enforced Cordon Buffer: <strong>{alert.geoRadiusMeters} meters radius</strong>
                </div>
              </div>

              <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 space-y-2">
                <span className="font-bold text-amber-800 uppercase tracking-wider text-[11px] font-mono flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Public Safety Instructions</span>
                </span>
                <p className="text-amber-950 leading-relaxed font-sans">{alert.officialInstructions}</p>
                <div className="flex items-center space-x-2 text-[11px] text-amber-900 font-mono pt-1">
                  <PhoneCall className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>Control Room: {alert.emergencyContact}</span>
                </div>
              </div>
            </div>

            {/* Resolution Rationale if resolved */}
            {alert.status === 'RESOLVED' && alert.resolutionReason && (
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-xs text-emerald-900 space-y-1">
                <span className="font-bold text-emerald-800 flex items-center space-x-1.5 font-mono">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Authority Resolution & Safety Confirmation:</span>
                </span>
                <p>{alert.resolutionReason}</p>
                <div className="text-[10px] text-emerald-700 font-mono pt-0.5">
                  Resolved At: {new Date(alert.resolvedAt || '').toLocaleString('en-IN')}
                </div>
              </div>
            )}

            {/* Verification Metadata Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
              <div className="flex items-center space-x-2">
                <span>Verified Officer: <strong className="text-slate-800">{alert.verificationOfficer}</strong> ({alert.officerDesignation})</span>
              </div>
              <div className="flex items-center space-x-3">
                <span>Published: {new Date(alert.publishedAt || alert.verificationDate).toLocaleDateString('en-IN')}</span>
                <button
                  onClick={() => handleOpenBuilding(alert.buildingId)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                >
                  View Passport →
                </button>
              </div>
            </div>

          </div>
        ))}

        {filteredAlerts.length === 0 && (filter === 'DEMOLITIONS' ? activeDemolitions.length === 0 : true) && (
          <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Warnings in this Category</h3>
            <p className="text-xs text-slate-500">All registered structures are currently within standard monitoring thresholds.</p>
          </div>
        )}
      </div>

    </div>
  );
};
