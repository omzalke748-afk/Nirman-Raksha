import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  Sliders,
  UserCheck,
  ShieldCheck,
  RotateCcw,
  Activity,
  Sparkles,
  Lock,
  Clock,
  CheckCircle2
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    userRole,
    setUserRole,
    demoMode,
    setDemoMode,
    resetDemoData,
    auditLogs
  } = useApp();

  const roles: { id: UserRole; label: string; desc: string; color: string }[] = [
    { id: 'CITIZEN', label: 'Citizen View', desc: 'Public safety alerts, basic registry & open GIS map', color: 'text-emerald-400' },
    { id: 'ENGINEER', label: 'Licensed Engineer', desc: 'Add inspections, observations & stability certificates', color: 'text-cyan-400' },
    { id: 'INSPECTOR', label: 'Field Inspector', desc: 'Conduct routine surveys & photograph condition logs', color: 'text-blue-400' },
    { id: 'AUTHORITY', label: 'Municipal Authority (NMC)', desc: 'Full review, safety alert issuance, verification & resolution', color: 'text-purple-400' },
    { id: 'ADMIN', label: 'System Admin', desc: 'Data sources, API connectors, audit logs & system health', color: 'text-amber-400' }
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-16 max-w-5xl mx-auto">
      
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <Sliders className="w-6 h-6 text-blue-400" />
          <span>System Settings, RBAC & Audit Trail</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Role-based access permissions, non-falsification demo toggle, and immutable event logs.
        </p>
      </div>

      {/* Role-Based Access Control Switcher */}
      <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <UserCheck className="w-5 h-5 text-blue-400" />
          <span>Active Operating Perspective (Role-Based Access)</span>
        </h3>
        <p className="text-xs text-slate-400">
          Seamlessly switch roles to test authorization workflows, inspection submission, authority verifications, and citizen warnings.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {roles.map(r => (
            <button
              key={r.id}
              onClick={() => setUserRole(r.id)}
              className={`p-4 rounded-xl text-left border transition flex flex-col justify-between space-y-2 ${
                userRole === r.id
                  ? 'bg-blue-950/80 border-blue-600 shadow-lg shadow-blue-600/20 ring-1 ring-blue-500'
                  : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-bold font-mono text-xs ${r.color}`}>{r.label}</span>
                {userRole === r.id && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">{r.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Demo Mode & Database State Management */}
      <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <span>Demo Data Separation & Reset</span>
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-xl border border-slate-800">
          <div className="space-y-0.5">
            <span className="font-semibold text-white text-xs">Include Synthetic Demonstration Records</span>
            <p className="text-[11px] text-slate-400">
              When enabled, clearly labeled synthetic demo records are accessible for demonstrating the 17-step emergency workflow without affecting real records.
            </p>
          </div>
          <button
            onClick={() => setDemoMode(!demoMode)}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border transition shrink-0 ${
              demoMode
                ? 'bg-purple-950 text-purple-300 border-purple-700'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {demoMode ? 'Demo Mode: ACTIVE' : 'Official Records ONLY'}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-xl border border-slate-800">
          <div className="space-y-0.5">
            <span className="font-semibold text-white text-xs">Reset Database to Initial Baseline</span>
            <p className="text-[11px] text-slate-400">
              Clear local observations, newly drafted alerts, and reset the guided ideathon demo back to Step 1.
            </p>
          </div>
          <button
            onClick={resetDemoData}
            className="px-4 py-2 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 rounded-xl text-xs font-semibold transition shrink-0 flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Prototype Database</span>
          </button>
        </div>
      </div>

      {/* Immutable Audit Logs Ledger */}
      <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <span>System Audit Trail & Security Logs</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">{auditLogs.length} Logged Action(s)</span>
        </div>

        <div className="divide-y divide-slate-800 max-h-72 overflow-y-auto pr-2">
          {auditLogs.map(log => (
            <div key={log.id} className="py-2.5 text-xs space-y-0.5">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-blue-400 font-bold">{log.action}</span>
                <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString('en-IN')}</span>
              </div>
              <p className="text-slate-300">{log.details}</p>
              <div className="text-[10px] text-slate-500 font-mono">
                Initiated by: {log.userName} ({log.userRole}) • Target: {log.targetResource}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
