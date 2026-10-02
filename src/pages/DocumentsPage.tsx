import React from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  ShieldCheck,
  Download,
  ExternalLink,
  PlusCircle,
  FileCheck2,
  Calendar,
  Building2
} from 'lucide-react';

export const DocumentsPage: React.FC = () => {
  const { buildings } = useApp();

  const documents = [
    {
      id: 'DOC-NMC-2025-089',
      buildingName: 'Itwari Cotton Ginning Mill Staff Quarters (Block C)',
      docType: 'Structural Audit Report (Preliminary)',
      uploadedBy: 'Er. Rajesh S. Deshmukh (NMC-STR-LIC-4482)',
      date: '2024-06-18',
      status: 'ENGINEER_VERIFIED',
      fileSize: '4.2 MB PDF'
    },
    {
      id: 'DOC-NMC-2025-102',
      buildingName: 'Old Civil Lines Municipal Staff Quarters (Block 8)',
      docType: 'Section 264 Dangerous Building Demolition Notice',
      uploadedBy: 'NMC Town Planning & Hazardous Cell',
      date: '2025-06-12',
      status: 'OFFICIAL_SOURCE',
      fileSize: '1.8 MB PDF'
    },
    {
      id: 'DOC-NMC-2025-204',
      buildingName: 'Sahakar Co-operative Housing Society',
      docType: 'Structural Stability Certificate (5-Year Cycle)',
      uploadedBy: 'Er. Anand V. Kulkarni (NMC-STR-LIC-3291)',
      date: '2024-11-10',
      status: 'VERIFIED',
      fileSize: '3.1 MB PDF'
    },
    {
      id: 'DOC-NMC-2025-318',
      buildingName: 'Dhantoli Medicare Polyclinic Building',
      docType: 'Healthcare Structural Safety & Fire NOC Certificate',
      uploadedBy: 'NMC Fire & Safety Cell',
      date: '2025-02-14',
      status: 'VERIFIED',
      fileSize: '2.9 MB PDF'
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <FileText className="w-6 h-6 text-blue-400" />
            <span>Nagpur Structural Document Vault</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Certified structural stability certificates, municipal notices, architectural plans, and NDT laboratory test sheets.
          </p>
        </div>

        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition flex items-center space-x-2 shrink-0 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Upload Structural Certificate</span>
        </button>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map(doc => (
          <div key={doc.id} className="glass-card rounded-2xl p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {doc.id}
                </span>
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded text-[10px] font-mono font-bold">
                  {doc.status}
                </span>
              </div>

              <h3 className="text-base font-bold text-white">{doc.docType}</h3>
              <p className="text-xs text-slate-300 font-semibold">{doc.buildingName}</p>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Authorized Signatory:</span>
                <strong className="text-slate-200">{doc.uploadedBy}</strong>
              </div>
              <div className="flex justify-between">
                <span>Submission Date:</span>
                <span className="font-mono text-slate-300">{doc.date}</span>
              </div>
              <div className="flex justify-between">
                <span>File Format:</span>
                <span className="font-mono text-cyan-400">{doc.fileSize}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition flex items-center space-x-1.5">
                <Download className="w-3.5 h-3.5" />
                <span>Download Verified PDF</span>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
