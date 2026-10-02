import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Database,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Code,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';

export const DataSourcesPage: React.FC = () => {
  const { dataSources, refreshSource, isRefreshingSource } = useApp();
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ id: string; msg: string; success: boolean } | null>(null);
  const [inspectedPayloadId, setInspectedPayloadId] = useState<string | null>(null);

  const handleRefreshSingle = async (sourceId: string) => {
    setRefreshingId(sourceId);
    setStatusMessage(null);
    const res = await refreshSource(sourceId);
    setRefreshingId(null);
    setStatusMessage({ id: sourceId, msg: res.message, success: res.success });
  };

  const handleRefreshAll = async () => {
    for (const src of dataSources) {
      await refreshSource(src.id);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-800/60 rounded-2xl p-6 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 bg-blue-900/80 border border-blue-700/80 rounded-full text-xs font-mono font-bold text-blue-200 flex items-center space-x-1.5">
                <Database className="w-3.5 h-3.5 text-blue-400" />
                <span>DATA PROVENANCE & INGESTION TRANSPARENCY</span>
              </span>
              <span className="text-xs font-mono text-slate-400">Zero Fabricated Data Guarantee</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Connected Nagpur Data Sources & Connectors
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Real-time connectors to municipal gazettes, Open-Meteo live Nagpur weather telemetry, MRSAC geospatial layers, and accredited structural engineer audit networks.
            </p>
          </div>

          <button
            onClick={handleRefreshAll}
            disabled={isRefreshingSource}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition flex items-center space-x-2 shrink-0 self-start sm:self-auto"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshingSource ? 'animate-spin' : ''}`} />
            <span>Synchronize All Sources</span>
          </button>
        </div>
      </div>

      {/* Connected Sources Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {dataSources.map(src => (
          <div
            key={src.id}
            className={`glass-card rounded-2xl p-5 flex flex-col justify-between space-y-4 border transition ${
              src.connectionStatus === 'LIVE' ? 'border-emerald-700/60' :
              src.connectionStatus === 'UNAVAILABLE' ? 'border-red-700/60 bg-red-950/20' :
              'border-slate-800'
            }`}
          >
            {/* Top Meta */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-slate-400 block">{src.organization}</span>
                  <h3 className="text-base font-bold text-white leading-snug">{src.name}</h3>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border shrink-0 ${
                  src.connectionStatus === 'LIVE' ? 'bg-emerald-950 text-emerald-400 border-emerald-800 animate-pulse' :
                  src.connectionStatus === 'STATIC_OFFICIAL_RECORD' ? 'bg-blue-950 text-blue-400 border-blue-800' :
                  src.connectionStatus === 'CONNECTED' ? 'bg-cyan-950 text-cyan-400 border-cyan-800' :
                  'bg-red-950 text-red-400 border-red-800'
                }`}>
                  ● {src.connectionStatus.replace(/_/g, ' ')}
                </span>
              </div>

              {/* URL Reference */}
              <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 space-y-1.5 text-xs">
                <span className="text-slate-400 block text-[11px]">Endpoint / Official Document Reference:</span>
                <a
                  href={src.endpointOrReference.startsWith('http') ? src.endpointOrReference : '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:underline flex items-center space-x-1 font-mono text-[11px] break-all"
                >
                  <span className="truncate">{src.endpointOrReference}</span>
                  {src.endpointOrReference.startsWith('http') && <ExternalLink className="w-3 h-3 shrink-0" />}
                </a>
              </div>

              {/* Parameters / Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/80 p-3 rounded-xl border border-slate-800 font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">Data Type</span>
                  <span className="text-slate-300 font-semibold">{src.dataType.replace(/_/g, ' ')}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Records Cached</span>
                  <span className="text-cyan-400 font-bold">{src.recordCount} Records</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Refresh Frequency</span>
                  <span className="text-slate-300">{src.refreshFrequency}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Response Latency</span>
                  <span className="text-emerald-400">{src.latencyMs ? `${src.latencyMs} ms` : 'N/A'}</span>
                </div>
              </div>

              {/* Data Fields */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Provided Schema Fields:</span>
                <div className="flex flex-wrap gap-1.5">
                  {src.fieldsProvided.map((f, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[10px] font-mono text-slate-300">
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Status Message if refreshed */}
              {statusMessage && statusMessage.id === src.id && (
                <div className={`p-2.5 rounded-lg text-xs font-mono border ${
                  statusMessage.success ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300' : 'bg-red-950/80 border-red-800 text-red-300'
                }`}>
                  {statusMessage.msg}
                </div>
              )}

              {src.errorMessage && (
                <div className="p-2.5 rounded-lg text-xs font-mono bg-red-950/80 border border-red-800 text-red-300">
                  {src.errorMessage}
                </div>
              )}

              {/* Raw Payload Inspector if present */}
              {src.rawPayloadSnippet && (
                <div>
                  <button
                    onClick={() => setInspectedPayloadId(inspectedPayloadId === src.id ? null : src.id)}
                    className="text-[11px] font-mono text-blue-400 hover:underline flex items-center space-x-1"
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>{inspectedPayloadId === src.id ? 'Hide Raw JSON Response' : 'Inspect Raw Live JSON Response'}</span>
                  </button>
                  {inspectedPayloadId === src.id && (
                    <pre className="mt-2 p-3 bg-slate-950 border border-slate-800 rounded-xl text-[10px] font-mono text-emerald-400 overflow-x-auto max-h-40">
                      {src.rawPayloadSnippet}
                    </pre>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px] font-mono">
                Last Sync: {new Date(src.lastFetchedAt).toLocaleTimeString('en-IN')}
              </span>
              <button
                onClick={() => handleRefreshSingle(src.id)}
                disabled={refreshingId === src.id}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold border border-slate-700 transition flex items-center space-x-1.5 shadow"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshingId === src.id ? 'animate-spin text-blue-400' : ''}`} />
                <span>Refresh Now</span>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
