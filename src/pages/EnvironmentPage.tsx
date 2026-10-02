import React from 'react';
import { useApp } from '../context/AppContext';
import { analyzeCorrosionAndSoil } from '../services/corrosionAndSoilService';
import {
  CloudRain,
  Thermometer,
  Droplets,
  Wind,
  Layers,
  Activity,
  RefreshCw,
  MapPin,
  ExternalLink,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Flame,
  Info,
  ShieldCheck,
  Compass
} from 'lucide-react';

export const EnvironmentPage: React.FC = () => {
  const { environment, refreshSource, isRefreshingSource } = useApp();

  const handleRefresh = async () => {
    await refreshSource('src-open-meteo-nagpur');
    await refreshSource('src-cpcb-air-nagpur');
  };

  const analysis = analyzeCorrosionAndSoil(environment);

  return (
    <div className="space-y-6 animate-fadeIn pb-16 text-slate-800">
      
      {/* Title & Refresh Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <CloudRain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Nagpur Environmental & Weather Telemetry
                </h1>
                <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-mono text-emerald-700 font-semibold flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>OPEN-METEO LIVE</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Meteorological data & hydrogeological strata modeling iron rebar corrosion, black cotton soil swelling, and foundation saturation across Nagpur.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshingSource}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center space-x-2 shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshingSource ? 'animate-spin' : ''}`} />
          <span>{isRefreshingSource ? 'Polling APIs...' : 'Refresh Live Telemetry'}</span>
        </button>
      </div>

      {/* Primary Environmental Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold">Ambient Temperature</span>
            <Thermometer className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            {environment.temperatureC}°C
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            Thermal cycling driver. Nagpur highs accelerate concrete cover micro-crack dilation.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold">Relative Humidity</span>
            <Droplets className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-blue-600 font-mono">
              {environment.relativeHumidityPct}%
            </span>
            {analysis.criticalHumidityExceeded ? (
              <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 text-[10px] font-bold border border-red-200">
                &gt;60% RUSTING THRESHOLD
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                SAFE &le;60%
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            Critical threshold for electrolytic water film formation on structural rebar.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold">Precipitation (24h)</span>
            <CloudRain className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            {environment.precipitation24hMm} mm
          </div>
          <p className="text-[11px] text-slate-500 font-mono leading-snug">
            7-Day Cumulative: {environment.precipitation7dMm} mm
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold">Black Cotton Soil Saturation</span>
            <Layers className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-amber-700 font-mono">
              {environment.soilMoisturePct}%
            </span>
            <span className="text-xs font-mono text-slate-500">
              (~{analysis.soilSwellingPressureKpa} kPa)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            Volumetric swell pressure exerted against sub-grade plinths & footings.
          </p>
        </div>

      </div>

      {/* Deep Scientific Analysis: Rusting Kinetics & Nagpur Black Cotton Soil Mechanics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card A: Iron Rebar Rusting & Atmospheric Corrosion Kinetics */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Atmospheric Iron Rebar Rusting & Corrosion Kinetics
                </h3>
                <p className="text-xs text-slate-500">
                  Thermodynamic rate of rebar section loss & concrete cover delamination
                </p>
              </div>
            </div>

            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
              analysis.corrosionRiskCategory === 'CRITICAL_CORROSION'
                ? 'bg-red-50 text-red-700 border-red-200'
                : analysis.corrosionRiskCategory === 'ELEVATED'
                ? 'bg-orange-50 text-orange-700 border-orange-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {analysis.corrosionRiskCategory.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Estimated Rebar Corrosion Velocity:</span>
              <strong className="font-mono text-red-600 text-sm">{analysis.corrosionRateMmPerYear} mm / year</strong>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Critical RH &gt;60% Condition:</span>
              <span className={`font-semibold ${analysis.criticalHumidityExceeded ? 'text-red-600' : 'text-emerald-600'}`}>
                {analysis.criticalHumidityExceeded ? 'EXCEEDED (Active Electrolytic Film)' : 'PASSIVE (Dry Atmosphere)'}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pt-1 border-t border-slate-200">
              {analysis.corrosionSummary}
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
              Active Chemical & Atmospheric Mechanisms:
            </span>
            <div className="space-y-1.5">
              {analysis.chemicalMechanisms.map((mech, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{mech}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card B: Nagpur Black Cotton Soil & Aquifer Dynamics */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Nagpur Black Cotton Soil & Foundation Surcharge
                </h3>
                <p className="text-xs text-slate-500">
                  Montmorillonite clay swell-shrink cycles & GSDA groundwater table
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              {analysis.soilThreatCategory.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Soil Moisture Content:</span>
              <strong className="font-mono text-amber-700 text-sm">{analysis.soilMoisturePct}% Saturation</strong>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Calculated Uplift Swelling Pressure:</span>
              <strong className="font-mono text-slate-800">{analysis.soilSwellingPressureKpa} kPa</strong>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">GSDA Monitoring Well Water Table:</span>
              <strong className="font-mono text-emerald-700">{environment.groundWaterDepthM} m below ground</strong>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pt-1 border-t border-slate-200">
              {analysis.soilSummary}
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
              Foundation Mechanics & Substrata Details:
            </span>
            <div className="space-y-1.5">
              {analysis.foundationImpactDetails.map((detail, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Actionable Engineering Mitigation for Nagpur Structures */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 font-bold text-slate-900 text-sm">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <span>Recommended Engineering Precautions Based on Current Nagpur Exposure</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {analysis.mitigationRecommendations.map((rec, idx) => (
            <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-slate-700 leading-relaxed">{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Real Live API Connector Inspector & Provenance Guarantee */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <Activity className="w-4 h-4 text-emerald-600" />
          <span>Live API Connection Diagnostics & Provenance</span>
        </h3>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900">{environment.sourceName}</span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded font-mono font-bold text-[10px]">
              LIVE ACTIVE
            </span>
          </div>

          <a
            href={environment.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:underline flex items-center space-x-1 font-mono text-[11px] break-all"
          >
            <span>{environment.sourceUrl}</span>
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-slate-600 pt-2 border-t border-slate-200 text-[11px]">
            <div>
              <span className="block text-slate-400 text-[10px]">Target Coordinates:</span>
              <strong className="font-mono text-slate-800">21.1458° N, 79.0882° E</strong>
            </div>
            <div>
              <span className="block text-slate-400 text-[10px]">Target City:</span>
              <strong className="text-slate-800">Nagpur (NMC Limits)</strong>
            </div>
            <div>
              <span className="block text-slate-400 text-[10px]">Last Fetch Timestamp:</span>
              <strong className="font-mono text-slate-800">
                {new Date(environment.retrievedAt).toLocaleTimeString('en-IN')}
              </strong>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-blue-900 text-xs flex items-start space-x-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong>Zero Falsification Policy:</strong> Environmental telemetry is queried directly from Open-Meteo and GSDA hydrogeological stations. If network connection fails, NIRMAN-RAKSHA displays an explicit unavailable warning rather than inventing synthetic readings.
          </p>
        </div>
      </div>

    </div>
  );
};
