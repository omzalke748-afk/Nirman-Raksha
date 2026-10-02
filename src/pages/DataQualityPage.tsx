import React from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  BarChart2
} from 'lucide-react';

interface Props {
  setActiveTab: (tab: string) => void;
}

export const DataQualityPage: React.FC<Props> = ({ setActiveTab }) => {
  const { buildings, setActiveBuildingId } = useApp();

  const handleOpenBuilding = (bId: string) => {
    setActiveBuildingId(bId);
    setActiveTab('health-passport');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          <span>Nagpur Building Data Completeness & Quality Audit</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Verification audits, missing baseline parameters, stale certificates, and integrity monitoring across 10 NMC zones.
        </p>
      </div>

      {/* City-Wide Completeness Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="glass-card p-5 rounded-2xl space-y-2 border-cyan-900/40">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Average Completeness</span>
          <div className="text-3xl font-extrabold text-cyan-400 font-mono">
            {Math.round(buildings.reduce((acc, b) => acc + b.dataConfidenceScore, 0) / (buildings.length || 1))}%
          </div>
          <p className="text-[11px] text-slate-400">Calculated over 7 verifiable core categories.</p>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-2 border-emerald-900/40">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Fully Documented (&gt;80%)</span>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">
            {buildings.filter(b => b.dataConfidenceScore >= 80).length} Buildings
          </div>
          <p className="text-[11px] text-slate-400">Complete municipal and structural baseline.</p>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-2 border-amber-900/40">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Incomplete Baseline (&lt;50%)</span>
          <div className="text-3xl font-extrabold text-amber-400 font-mono">
            {buildings.filter(b => b.dataConfidenceScore < 50).length} Buildings
          </div>
          <p className="text-[11px] text-slate-400">Baseline structural audit required.</p>
        </div>

      </div>

      {/* Buildings Data Quality Table */}
      <div className="glass-panel rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white">Building Data Quality Breakdown</h3>

        <div className="divide-y divide-slate-800">
          {buildings.map(b => (
            <div key={b.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white text-sm hover:text-blue-400 transition cursor-pointer" onClick={() => handleOpenBuilding(b.id)}>
                    {b.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{b.id} • {b.ward}</span>
                </div>

                {b.missingDataWarnings.length > 0 ? (
                  <div className="text-amber-300 text-[11px] flex items-start space-x-1 mt-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>Missing: {b.missingDataWarnings.join(' • ')}</span>
                  </div>
                ) : (
                  <div className="text-emerald-400 text-[11px] flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>All core structural and municipal records verified.</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4 shrink-0 self-end md:self-center">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-mono">Completeness</span>
                  <span className={`font-mono font-bold text-sm ${
                    b.dataConfidenceScore >= 80 ? 'text-emerald-400' :
                    b.dataConfidenceScore >= 50 ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {b.dataConfidenceScore}%
                  </span>
                </div>

                <button
                  onClick={() => handleOpenBuilding(b.id)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium border border-slate-700 transition flex items-center space-x-1"
                >
                  <span>Audit</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
