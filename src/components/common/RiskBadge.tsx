import React from 'react';
import { RiskLevel } from '../../types';
import { AlertOctagon, AlertTriangle, CheckCircle, HelpCircle, ShieldAlert } from 'lucide-react';

interface Props {
  level: RiskLevel;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
}

export const RiskBadge: React.FC<Props> = ({
  level,
  score,
  size = 'md',
  showScore = true
}) => {
  const getConfig = () => {
    switch (level) {
      case 'CRITICAL':
        return {
          bg: 'bg-red-50 text-red-700 border-red-300 shadow-xs',
          icon: <AlertOctagon className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />,
          pulse: 'animate-pulse ring-2 ring-red-400/40',
          label: 'CRITICAL RISK'
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-50 text-orange-700 border-orange-300 shadow-xs',
          icon: <ShieldAlert className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />,
          pulse: '',
          label: 'HIGH RISK'
        };
      case 'MODERATE':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs',
          icon: <AlertTriangle className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />,
          pulse: '',
          label: 'MODERATE RISK'
        };
      case 'LOW':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs',
          icon: <CheckCircle className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />,
          pulse: '',
          label: 'LOW RISK'
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          icon: <HelpCircle className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />,
          pulse: '',
          label: 'INSUFFICIENT DATA'
        };
    }
  };

  const config = getConfig();
  const sizeClasses =
    size === 'sm' ? 'px-2 py-0.5 text-xs' :
    size === 'lg' ? 'px-4 py-2 text-sm font-semibold tracking-wide' :
    'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center space-x-1.5 rounded-full border shadow-sm font-mono transition-all ${config.bg} ${config.pulse} ${sizeClasses}`}
    >
      {config.icon}
      <span>{config.label}</span>
      {showScore && score !== undefined && level !== 'INSUFFICIENT_DATA' && (
        <span className="font-bold opacity-90 pl-1 border-l border-current/30">
          {score}/100
        </span>
      )}
    </span>
  );
};
