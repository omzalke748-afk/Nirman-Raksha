import React, { useState } from 'react';
import { DataStatus, ProvenanceField } from '../../types';
import { ShieldCheck, FileText, AlertTriangle, HelpCircle, Sparkles, ExternalLink, X } from 'lucide-react';

interface Props<T> {
  field?: ProvenanceField<T>;
  status?: DataStatus;
  label?: string;
  sourceName?: string;
  sourceUrl?: string;
  retrievedAt?: string;
  confidenceScore?: number;
  unavailabilityReason?: string;
  inline?: boolean;
}

export const DataProvenanceBadge = <T,>({
  field,
  status: directStatus,
  label,
  sourceName,
  sourceUrl,
  retrievedAt,
  confidenceScore,
  unavailabilityReason,
  inline = false
}: Props<T>) => {
  const [showModal, setShowModal] = useState(false);

  const status = directStatus || field?.status || 'PUBLIC_SOURCE';
  const source = sourceName || field?.source || 'Public Government Database';
  const url = sourceUrl || field?.sourceUrl;
  const retrieved = retrievedAt || field?.retrievedAt || new Date().toISOString();
  const confidence = confidenceScore ?? field?.confidenceScore ?? 80;
  const unavail = unavailabilityReason || field?.unavailabilityReason;

  const getBadgeConfig = () => {
    switch (status) {
      case 'OFFICIAL_GOVERNMENT_RECORD':
      case 'OFFICIAL_SOURCE':
      case 'PUBLIC_VERIFIED_SOURCE':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-300',
          icon: <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />,
          title: 'Official / Verified'
        };
      case 'ENGINEER_VERIFIED':
      case 'AUTHORITY_VERIFIED':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-300',
          icon: <ShieldCheck className="w-3.5 h-3.5 mr-1 text-blue-600" />,
          title: 'Authority/Engineer Verified'
        };
      case 'SYNTHETIC_DEMO':
        return {
          bg: 'bg-purple-50 text-purple-700 border-purple-300',
          icon: <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-600" />,
          title: 'Synthetic Demo Data'
        };
      case 'UNAVAILABLE':
        return {
          bg: 'bg-slate-100 text-slate-600 border-slate-300',
          icon: <HelpCircle className="w-3.5 h-3.5 mr-1 text-slate-500" />,
          title: 'Data Unavailable'
        };
      case 'ESTIMATED':
      case 'USER_PROVIDED':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-300',
          icon: <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />,
          title: 'Estimated / User Sourced'
        };
      default:
        return {
          bg: 'bg-sky-50 text-sky-700 border-sky-300',
          icon: <FileText className="w-3.5 h-3.5 mr-1 text-sky-600" />,
          title: 'Public Record'
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-mono font-medium border transition hover:opacity-90 cursor-pointer shadow-xs ${config.bg} ${inline ? '' : 'my-0.5'}`}
        title="Click to view data provenance & verification source"
      >
        {config.icon}
        <span>{status.replace(/_/g, ' ')}</span>
        <span className="ml-1 opacity-75 font-bold">({confidence}%)</span>
      </button>

      {/* Provenance Transparency Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-left text-slate-800">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4 border-b border-slate-100 pb-3">
              <div className="p-2 bg-blue-50 border border-blue-200 rounded-xl text-blue-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Data Provenance & Source Transparency</h3>
                <p className="text-xs text-slate-500 font-mono">Field: {label || 'Building Attribute'}</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-slate-500 block mb-1 font-medium">Verification Status</span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg font-mono font-medium border ${config.bg}`}>
                  {config.icon} {status}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block mb-1 font-medium">Originating Source</span>
                <p className="text-slate-800 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {source}
                </p>
              </div>

              {url && (
                <div>
                  <span className="text-slate-500 block mb-1 font-medium">Source URL / Reference</span>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center space-x-1 break-all bg-slate-50 p-2.5 rounded-xl border border-slate-200 w-full"
                  >
                    <span className="truncate">{url}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-1" />
                  </a>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block mb-0.5 font-medium">Retrieved Timestamp</span>
                  <span className="text-slate-800 font-mono text-[11px]">
                    {new Date(retrieved).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block mb-0.5 font-medium">Confidence Score</span>
                  <span className="text-emerald-700 font-mono font-bold">{confidence} / 100</span>
                </div>
              </div>

              {unavail && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-900">
                  <span className="font-semibold block mb-0.5">Unavailability Rationale:</span>
                  <p>{unavail}</p>
                </div>
              )}

              {status === 'SYNTHETIC_DEMO' && (
                <div className="bg-purple-50 border border-purple-200 p-3 rounded-xl text-purple-900 font-mono text-[11px]">
                  ⚠️ SYNTHETIC DEMO DATA — NOT A REAL BUILDING RECORD. Generated strictly for simulation and testing of the 17-step early-warning workflow.
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
