import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Shield,
  Activity,
  Building2,
  HeartPulse,
  Radio,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Bot,
  Database,
  CheckCircle2,
  FileText,
  Search,
  Layers
} from 'lucide-react';

interface Props {
  setActiveTab: (tab: string) => void;
}

export const LandingPage: React.FC<Props> = ({ setActiveTab }) => {
  const { buildings, alerts, dataSources } = useApp();

  const totalBuildings = buildings.length;
  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE').length;

  return (
    <div className="space-y-16 animate-fadeIn pb-24 text-slate-800">
      
      {/* Hero Section */}
      <div className="relative pt-8 sm:pt-12 text-center space-y-6 max-w-4xl mx-auto px-4">
        
        {/* Scope Pill */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-bold shadow-sm">
          <MapPin className="w-3.5 h-3.5 text-blue-600" />
          <span>LOCKED OPERATING REGION: NAGPUR MUNICIPAL CORPORATION (10 ZONES)</span>
        </div>

        {/* Main Title & Tagline */}
        <div className="space-y-4 flex flex-col items-center">
          <img
            src="/logo.png"
            alt="NIRMAN-RAKSHA Emblem"
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-contain shadow-lg border border-slate-200 bg-white p-1 hover:scale-105 transition-transform"
          />
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              NIRMAN-RAKSHA
            </h1>
            <p className="text-xl sm:text-2xl font-bold text-teal-700">
              AI-Powered Building Health, Risk Intelligence & Early Warning System
            </p>
          </div>
        </div>

        {/* Philosophy Card */}
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-2 text-left">
          <div className="text-base sm:text-lg font-bold text-slate-900 font-sans italic tracking-wide text-center">
            “Know the condition. Track the change. Warn before the danger.”
          </div>
          <p className="text-xs text-slate-600 leading-relaxed text-center">
            Buildings do not suddenly collapse. Their condition degrades progressively over time. NIRMAN-RAKSHA connects official <strong>MahaVastu BPMS</strong> sanctioned records, <strong>Open-Meteo</strong> atmospheric corrosion modeling, and professional NDT inspections to safeguard Nagpur citizens.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 text-xs sm:text-sm transition flex items-center space-x-2 active:scale-95"
          >
            <Activity className="w-4 h-4" />
            <span>Open Nagpur Command Map</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTab('buildings')}
            className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-300 text-xs sm:text-sm transition flex items-center space-x-2 shadow-sm"
          >
            <Search className="w-4 h-4 text-blue-600" />
            <span>Search & Ingest Buildings</span>
          </button>

          <button
            onClick={() => setActiveTab('environment')}
            className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-300 text-xs sm:text-sm transition flex items-center space-x-2 shadow-sm"
          >
            <Layers className="w-4 h-4 text-amber-600" />
            <span>Corrosion & Soil Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className="px-6 py-3 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-xl border border-red-200 text-xs sm:text-sm transition flex items-center space-x-2"
          >
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <span>Public Safety Alerts ({activeAlerts})</span>
          </button>
        </div>

      </div>

      {/* 6 Civic Intelligence Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-1">
          <span className="text-xs font-mono text-blue-600 uppercase tracking-wider font-bold">
            CIVIC INFRASTRUCTURE INTELLIGENCE
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How NIRMAN-RAKSHA Protects Nagpur
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">1. MahaVastu BPMS Official Data</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ingests official building proposals, architect COA registrations, and structural engineer licenses directly from Maharashtra's Building Plan Management System (BPMS).
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <HeartPulse className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">2. Building Health Passport</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Medical-style continuous health records for structures in Nagpur, featuring chronological timelines of sanctions, inspections, crack observations, and structural retrofitting.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">3. Explainable Risk Engine</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Transparent, weighted scoring based strictly on evidence. The system does not claim mathematical collapse dates, but provides clear positive and negative factor contributions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <Radio className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">4. Location-Based Early Warnings</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Authorized municipal authorities issue geo-fenced safety alerts (100m, 200m, 500m buffers) with official citizen directives and emergency cell helpline integration.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">5. Corrosion & Soil Telemetry</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Live Open-Meteo monitoring for Nagpur: evaluates the critical 60% relative humidity iron rebar rusting threshold and GSDA black cotton soil swelling pressure.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">6. Human Authority in the Loop</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No alert is automatically broadcast purely on an AI score. Qualified engineers review, and authorized municipal officers verify before public safety actions are taken.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
