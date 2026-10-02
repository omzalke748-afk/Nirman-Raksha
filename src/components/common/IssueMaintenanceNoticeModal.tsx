import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BuildingRecord, NoticeType, NoticePriority } from '../../types';
import {
  Wrench,
  Calendar,
  Clock,
  CheckCircle2,
  X,
  FileText,
  ShieldCheck,
  Building2,
  Plus,
  Trash2,
  AlertTriangle
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  preselectedBuilding?: BuildingRecord;
  onSuccess?: () => void;
}

export const IssueMaintenanceNoticeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  preselectedBuilding,
  onSuccess
}) => {
  const { buildings, issueMaintenanceNotice, userRole } = useApp();

  const [selectedBuildingId, setSelectedBuildingId] = useState(
    preselectedBuilding?.id || buildings[0]?.id || 'NMC-SAT-2026-089'
  );

  const selectedBuilding = buildings.find(b => b.id === selectedBuildingId) || buildings[0];

  const [noticeType, setNoticeType] = useState<NoticeType>('CRACK_RETROFITTING_ORDER');
  const [priority, setPriority] = useState<NoticePriority>('HIGH');
  const [deadline, setDeadline] = useState('2026-10-30');
  const [statutoryRef, setStatutoryRef] = useState('Maharashtra Municipal Corporation (MMC) Act Section 265 / IS 456:2000');
  const [recipient, setRecipient] = useState<'OWNER' | 'CITIZEN' | 'ENGINEER' | 'ALL'>('OWNER');
  const [description, setDescription] = useState(
    'Mandatory structural crack sealing, column steel propping, and concrete restoration required following physical structural safety audit.'
  );

  const [actions, setActions] = useState<string[]>([
    'Engage NMC Empaneled Structural Engineer for detailed retrofit scheme',
    'Execute low-viscosity epoxy grouting and polymer mortar plastering',
    'Submit Post-Repair Structural Stability Certificate to Ward Office'
  ]);
  const [newActionText, setNewActionText] = useState('');

  if (!isOpen) return null;

  const handleAddAction = () => {
    if (newActionText.trim()) {
      setActions([...actions, newActionText.trim()]);
      setNewActionText('');
    }
  };

  const handleRemoveAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const handleNoticeTypeChange = (type: NoticeType) => {
    setNoticeType(type);
    if (type === 'STRUCTURAL_AUDIT_MANDATE') {
      setDescription('Mandatory structural audit by licensed structural engineer for building exceeding 30 years age under MMC Act Section 265(A).');
      setActions([
        'Engage certified structural audit firm / VNIT testing laboratory',
        'Execute Non-Destructive Testing (Rebound hammer and ultrasonic velocity)',
        'Submit comprehensive Structural Stability Certificate within 30 days'
      ]);
      setStatutoryRef('MMC Act Section 265(A) - Mandatory Audit for Aging Buildings');
    } else if (type === 'MONSOON_WATERPROOFING_DIRECTIVE') {
      setDescription('Pre-monsoon waterproofing and drainage repair directive to prevent structural rebar corrosion and terrace moisture ponding.');
      setActions([
        'Apply elastomeric polymer waterproofing coating on terrace',
        'Replace cracked rainwater downspouts along exterior masonry',
        'Seal all parapet wall joints and exterior plaster cracks'
      ]);
      setStatutoryRef('NMC Building By-Laws 2020 Clause 18.4 (Moisture Ingress)');
    } else if (type === 'FOUNDATION_STABILIZATION') {
      setDescription('Urgent foundation stabilization and soil moisture control required due to Black Cotton soil differential settlement.');
      setActions([
        'Install perimeter cutoff apron to prevent subsoil moisture fluctuation',
        'Underpin foundation footings showing differential settlement > 20mm',
        'Install crack tell-tale monitors to observe structural movement'
      ]);
      setStatutoryRef('IS 1904:1986 / IS 2911 (Foundation Safety in Expansive Soils)');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    issueMaintenanceNotice({
      buildingId: selectedBuilding.id,
      buildingName: selectedBuilding.name,
      ward: selectedBuilding.ward,
      zoneNumber: selectedBuilding.zoneNumber,
      noticeType,
      priority,
      issuingAuthority: 'NMC Town Planning & Structural Safety Division',
      issuingOfficer: userRole === 'AUTHORITY' ? 'Shri Manoj S. Talware' : 'Authorized Municipal Officer',
      officerDesignation: 'Executive Engineer (Town Planning & Hazardous Structures Cell)',
      issuedDate: new Date().toISOString().split('T')[0],
      complianceDeadline: deadline,
      statutoryReference: statutoryRef,
      description,
      mandatoryActions: actions,
      status: 'PENDING_ACTION',
      recipientRole: recipient
    });

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative text-slate-800">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-amber-200 bg-gradient-to-r from-amber-900 via-slate-900 to-teal-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/20 border border-amber-400/30 rounded-2xl">
              <Wrench className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Issue Municipal Section 265 Maintenance Directive
              </h2>
              <p className="text-xs text-amber-200/90 mt-0.5">
                Official repair order, structural audit mandate, or waterproofing directive for building owners and occupants.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">

          {/* Building Selection */}
          <div>
            <label className="text-slate-700 font-semibold block mb-1">
              Select Target Building / Campus
            </label>
            <select
              value={selectedBuildingId}
              onChange={e => setSelectedBuildingId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-amber-600"
            >
              {buildings.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name} — {b.ward} ({b.id})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-700 font-semibold block mb-1">
                Directive / Notice Type
              </label>
              <select
                value={noticeType}
                onChange={e => handleNoticeTypeChange(e.target.value as NoticeType)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600"
              >
                <option value="CRACK_RETROFITTING_ORDER">Crack Retrofitting & Steel Jacketing Order</option>
                <option value="STRUCTURAL_AUDIT_MANDATE">Mandatory 30+ Yr Structural Health Audit</option>
                <option value="MONSOON_WATERPROOFING_DIRECTIVE">Monsoon Moisture & Waterproofing Directive</option>
                <option value="FOUNDATION_STABILIZATION">Foundation & Black Cotton Soil Underpinning</option>
                <option value="REBAR_CORROSION_TREATMENT">Rebar Rust Treatment & Spall Patching</option>
                <option value="UTILITY_SAFETY_AUDIT">Electrical & Fire Utility Safety Audit</option>
                <option value="UNAUTHORIZED_CONSTRUCTION_REMOVAL">Unauthorized Structure Removal Notice</option>
              </select>
            </div>

            <div>
              <label className="text-slate-700 font-semibold block mb-1">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as NoticePriority)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600 font-semibold"
              >
                <option value="URGENT">URGENT (Immediate compliance required)</option>
                <option value="HIGH">HIGH (15-30 days)</option>
                <option value="MEDIUM">MEDIUM (45-60 days)</option>
                <option value="LOW">LOW (Routine scheduled)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-700 font-semibold block mb-1">
                Statutory Compliance Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600"
                required
              />
            </div>

            <div>
              <label className="text-slate-700 font-semibold block mb-1">
                Target Recipient
              </label>
              <select
                value={recipient}
                onChange={e => setRecipient(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600"
              >
                <option value="OWNER">Building Owner / Society Management</option>
                <option value="CITIZEN">All Occupants & General Public</option>
                <option value="ENGINEER">Empaneled Structural Engineer</option>
                <option value="ALL">All Stakeholders (Public Notice)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-700 font-semibold block mb-1">
              Statutory Law Reference
            </label>
            <input
              type="text"
              value={statutoryRef}
              onChange={e => setStatutoryRef(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600"
              required
            />
          </div>

          <div>
            <label className="text-slate-700 font-semibold block mb-1">
              Directive Description & Municipal Findings
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600 font-sans"
              required
            />
          </div>

          {/* Mandatory Action Items */}
          <div className="space-y-2">
            <label className="text-slate-700 font-semibold block">
              Mandatory Action Checklist Items for Compliance
            </label>
            <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              {actions.map((act, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[10px] shrink-0 font-mono">
                      {idx + 1}
                    </span>
                    <span className="text-slate-700">{act}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAction(idx)}
                    className="text-slate-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add another required action..."
                  value={newActionText}
                  onChange={e => setNewActionText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAction();
                    }
                  }}
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-amber-600"
                />
                <button
                  type="button"
                  onClick={handleAddAction}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition"
                >
                  + Add
                </button>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md shadow-amber-600/20 transition flex items-center space-x-2"
            >
              <Wrench className="w-4 h-4" />
              <span>Issue Section 265 Notice</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
