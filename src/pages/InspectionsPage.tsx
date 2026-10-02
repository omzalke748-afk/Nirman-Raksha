import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RiskBadge } from '../components/common/RiskBadge';
import { DataProvenanceBadge } from '../components/common/DataProvenanceBadge';
import {
  ClipboardCheck,
  PlusCircle,
  Layers,
  Calendar,
  User,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Camera
} from 'lucide-react';

interface Props {
  setActiveTab: (tab: string) => void;
}

export const InspectionsPage: React.FC<Props> = ({ setActiveTab }) => {
  const {
    buildings,
    activeBuildingId,
    setActiveBuildingId,
    userRole,
    addObservation
  } = useApp();

  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(activeBuildingId || 'NMC-SAT-2026-089');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [obsType, setObsType] = useState<any>('STRUCTURAL_SHEAR_CRACK');
  const [obsSeverity, setObsSeverity] = useState<any>('CRITICAL');
  const [obsLocation, setObsLocation] = useState('Ground floor external plinth & Column C-4');
  const [obsDesc, setObsDesc] = useState('Wide continuous structural shear crack (8.2mm) propagating through load-bearing brickwork with visible horizontal mortar slip.');
  const [obsImage, setObsImage] = useState('https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&q=80&w=800');

  // Collect all observations across buildings
  const allObservations = buildings.flatMap(b =>
    b.observations.map(o => ({ ...o, buildingName: b.name, buildingWard: b.ward, isSynthetic: b.isSynthetic }))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addObservation(selectedBuildingId, {
      date: new Date().toISOString().split('T')[0],
      inspectorName: userRole === 'ENGINEER' ? 'Er. Rajesh S. Deshmukh' : 'Field Structural Auditor',
      inspectorLicense: userRole === 'ENGINEER' ? 'NMC-STR-LIC-4482' : 'NMC-AUD-8821',
      observationType: obsType,
      severity: obsSeverity,
      locationDetails: obsLocation,
      description: obsDesc,
      imageUrl: obsImage
    }, true);
    setShowModal(false);
  };

  const handleOpenBuilding = (bId: string) => {
    setActiveBuildingId(bId);
    setActiveTab('health-passport');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 text-slate-800">
      
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ClipboardCheck className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Nagpur Structural Inspections & Observations Ledger
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Certified field audits, defect tracking, and photographic evidence records across NMC jurisdiction.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center space-x-2 shrink-0 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Log Structural Observation</span>
        </button>
      </div>

      {/* Observations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {allObservations.map(obs => (
          <div key={obs.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                  {obs.id} • {obs.date}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                  obs.severity === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-200' :
                  obs.severity === 'SEVERE' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                  'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {obs.severity}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 hover:text-blue-600 transition cursor-pointer" onClick={() => handleOpenBuilding(obs.buildingId)}>
                  {obs.buildingName}
                </h3>
                <p className="text-xs text-slate-500">{obs.buildingWard}</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1 text-xs">
                <span className="font-bold text-slate-800 block">{obs.observationType.replace(/_/g, ' ')}</span>
                <p className="text-slate-600 leading-relaxed">{obs.description}</p>
                <div className="text-[11px] text-slate-500 font-mono pt-1">
                  Location: <strong className="text-slate-800">{obs.locationDetails}</strong>
                </div>
              </div>

              {obs.imageUrl && (
                <div className="rounded-xl overflow-hidden border border-slate-200 relative group">
                  <img src={obs.imageUrl} alt="Defect evidence" className="w-full h-36 object-cover" />
                  <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 p-1 text-[9px] text-slate-200 font-mono text-center backdrop-blur-sm">
                    Visual observation attached by licensed auditor
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">{obs.inspectorName}</span>
              <button
                onClick={() => handleOpenBuilding(obs.buildingId)}
                className="text-blue-600 hover:text-blue-700 font-bold flex items-center space-x-1"
              >
                <span>Passport</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-left text-slate-800">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Log Structural Defect Observation</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-700 block mb-1 font-semibold">Select Target Building (Nagpur)</label>
                <select
                  value={selectedBuildingId}
                  onChange={e => setSelectedBuildingId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                >
                  {buildings.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.id} - {b.ward})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-semibold">Defect Classification</label>
                  <select
                    value={obsType}
                    onChange={e => setObsType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="STRUCTURAL_SHEAR_CRACK">Structural Shear Crack</option>
                    <option value="DIAGONAL_MASONRY_CRACK">Diagonal Masonry Step Crack</option>
                    <option value="CONCRETE_SPALLING">Concrete Spalling / Delamination</option>
                    <option value="REINFORCEMENT_CORROSION">Reinforcement Corrosion</option>
                    <option value="FOUNDATION_SETTLEMENT">Foundation Settlement</option>
                    <option value="SEEPAGE_DAMPNESS">Seepage / Active Dampness</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 block mb-1 font-semibold">Severity</label>
                  <select
                    value={obsSeverity}
                    onChange={e => setObsSeverity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="SEVERE">SEVERE</option>
                    <option value="MODERATE">MODERATE</option>
                    <option value="MINOR">MINOR</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-semibold">Specific Location in Building</label>
                <input
                  type="text"
                  value={obsLocation}
                  onChange={e => setObsLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-semibold">Description & Crack Width / Depth</label>
                <textarea
                  value={obsDesc}
                  onChange={e => setObsDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 font-sans"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20">
                  Save & Trigger Risk Recalculation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
