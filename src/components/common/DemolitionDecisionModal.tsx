import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BuildingRecord, DemolitionMethod } from '../../types';
import {
  AlertTriangle,
  Flame,
  ShieldAlert,
  ZapOff,
  Building2,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  X,
  FileText,
  Calculator,
  Layers,
  ArrowRight,
  ShieldCheck,
  PhoneCall,
  UserCheck
} from 'lucide-react';
import { RiskBadge } from './RiskBadge';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  building: BuildingRecord;
  onSuccess?: () => void;
}

export const DemolitionDecisionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  building,
  onSuccess
}) => {
  const { issueDemolitionOrder, userRole } = useApp();

  const currentYear = 2026;
  const constructionYear = building.constructionYear?.value || 1968;
  const buildingAge = currentYear - constructionYear;
  const designLife = building.designLifeYears || 50;
  const isPastDesignLife = buildingAge >= designLife;

  // Feasibility & cost calculations
  const defaultRetrofitCost = Math.round((building.numberOfFloors?.value || 3) * (building.approximateCapacity?.value || 200) * 125000);
  const defaultRebuildCost = Math.round(defaultRetrofitCost * 1.22);
  const defaultRatio = Math.round((defaultRetrofitCost / defaultRebuildCost) * 100);

  const [retrofitCost, setRetrofitCost] = useState(defaultRetrofitCost);
  const [rebuildCost, setRebuildCost] = useState(defaultRebuildCost);
  const costRatio = rebuildCost > 0 ? Math.round((retrofitCost / rebuildCost) * 100) : 85;

  const [orderNumber, setOrderNumber] = useState(`NMC/T&CP/SEC264/C1/2026/${building.id.split('-').pop() || '089'}`);
  const [evacuationDeadline, setEvacuationDeadline] = useState('Immediate Evacuation (Within 24 Hours)');
  const [demolitionDate, setDemolitionDate] = useState('2026-10-20');
  const [demolitionMethod, setDemolitionMethod] = useState<DemolitionMethod>('HIGH_REACH_EXCAVATOR_DISMANTLING');
  const [contractor, setContractor] = useState('M/s Vidarbha Demolition & Infrastructure Solutions Pvt Ltd (NMC Class A)');
  const [safetyRadius, setSafetyRadius] = useState(1000);
  const [rehabShelter, setRehabShelter] = useState(`NMC Community Centre & Transit Relief Camp, Zone ${building.zoneNumber}`);
  const [powerCut, setPowerCut] = useState(true);
  const [waterCut, setWaterCut] = useState(true);
  const [gasCut, setGasCut] = useState(true);
  const [telecomCut, setTelecomCut] = useState(true);

  const [selectedMechanisms, setSelectedMechanisms] = useState<string[]>([
    `Exceeded ${designLife}-Year Structural Design Life (Constructed ${constructionYear} - Age ${buildingAge} Years)`,
    'Severe Foundation Differential Settlement (>45mm) in Expansive Black Cotton Clay',
    'Core Concrete Compressive Strength Degraded Below 10 MPa (IS 516 Benchmark Min 20 MPa)',
    'Extensive Carbonation & Corrosion (>40% Rebar Cross-Section Loss)',
    `Retrofitting Economically Unviable (${costRatio}% Cost Ratio exceeds 70% statutory limit)`
  ]);

  const [customNotes, setCustomNotes] = useState(
    'Comprehensive structural audit by VNIT Structural Testing Lab and NMC Engineering Board confirmed building has reached catastrophic terminal state. No viable retrofit technique can guarantee life safety.'
  );

  if (!isOpen) return null;

  const handleToggleMechanism = (text: string) => {
    if (selectedMechanisms.includes(text)) {
      setSelectedMechanisms(selectedMechanisms.filter(m => m !== text));
    } else {
      setSelectedMechanisms([...selectedMechanisms, text]);
    }
  };

  const handleIssueOrder = (e: React.FormEvent) => {
    e.preventDefault();

    issueDemolitionOrder({
      orderNumber,
      buildingId: building.id,
      buildingName: building.name,
      ward: building.ward,
      zoneNumber: building.zoneNumber,
      buildingAgeYears: buildingAge,
      designLifeYears: designLife,
      structuralConditionScore: building.riskScore ? Math.max(10, 100 - building.riskScore) : 15,
      isRepairable: false,
      repairToReplacementCostRatio: costRatio,
      estimatedRetrofitCostInr: retrofitCost,
      estimatedReconstructionCostInr: rebuildCost,
      primaryFailureMechanisms: selectedMechanisms,
      condemnationCategory: 'C_1_IMMEDIATE_DEMOLITION',
      statutoryReference: 'Maharashtra Municipal Corporation (MMC) Act Section 264 (Dangerous & Dilapidated Buildings)',
      decisionDate: new Date().toISOString().split('T')[0],
      evacuationDeadline,
      demolitionExecutionDate: demolitionDate,
      demolitionMethod,
      contractorAssigned: contractor,
      safetyPerimeterRadiusMeters: safetyRadius,
      utilityCutoffChecklist: {
        powerDisconnected: powerCut,
        waterDisconnected: waterCut,
        gasPurged: gasCut,
        telecomRerouted: telecomCut
      },
      rehabilitationCampLocation: rehabShelter,
      authorizingCommissioner: 'Dr. Abhijit Chaudhari, IAS (Municipal Commissioner, NMC)',
      chiefStructuralEngineer: 'Shri Manoj S. Talware (Executive Engineer, Town Planning & Structural Safety)',
      status: 'ORDER_ISSUED',
      officialGazetteUrl: `https://www.nmcnagpur.gov.in/orders/demolition-sec264-${Date.now().toString().slice(-4)}.pdf`,
      notes: customNotes
    });

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative text-slate-800">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-red-200 bg-gradient-to-r from-red-950 via-slate-900 to-red-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-red-600/30 border border-red-400/40 rounded-2xl">
              <AlertTriangle className="w-7 h-7 text-red-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                  NMC Section 264 Condemnation & Demolition Order Decision
                </h2>
                <span className="px-2 py-0.5 bg-red-600 text-white rounded-full font-mono text-[10px] font-bold uppercase tracking-wider">
                  Category C-1 Dilapidated
                </span>
              </div>
              <p className="text-xs text-red-200/90 mt-0.5">
                Statutory municipal workflow for structures reaching end-of-life where retrofitting is structurally or economically infeasible.
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
        <form onSubmit={handleIssueOrder} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-800">

          {/* Building Overview & Age Telemetry Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-sm">{building.name}</span>
                <span className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded font-mono text-[10px] font-bold">
                  {building.id}
                </span>
              </div>
              <p className="text-slate-500">{building.address} • Zone {building.zoneNumber} ({building.ward})</p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-center">
                <div className="text-[10px] text-slate-400 font-mono">BUILDING AGE</div>
                <div className={`text-base font-extrabold font-mono ${isPastDesignLife ? 'text-red-700' : 'text-slate-800'}`}>
                  {buildingAge} Yrs
                </div>
              </div>

              <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-center">
                <div className="text-[10px] text-slate-400 font-mono">DESIGN LIFE</div>
                <div className="text-base font-extrabold font-mono text-slate-800">
                  {designLife} Yrs
                </div>
              </div>

              <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-center">
                <div className="text-[10px] text-slate-400 font-mono">RISK SCORE</div>
                <div className="text-base font-extrabold font-mono text-red-700">
                  {building.riskScore}/100
                </div>
              </div>
            </div>
          </div>

          {/* Feasibility & Cost Assessment Matrix */}
          <div className="bg-red-50/60 border-2 border-red-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center space-x-2 text-red-800 font-bold font-mono uppercase tracking-wider text-xs">
              <Calculator className="w-4 h-4" />
              <span>End-of-Life & Economic Feasibility Calculator (IS 456 / MMC Act Sec 264)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  Est. Structural Retrofitting Cost (₹)
                </label>
                <input
                  type="number"
                  value={retrofitCost}
                  onChange={e => setRetrofitCost(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono text-slate-900 focus:outline-none focus:border-red-500"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  ₹{(retrofitCost / 10000000).toFixed(2)} Crores (Jacketing, underpinning & shoring)
                </span>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  Est. Complete Reconstruction Cost (₹)
                </label>
                <input
                  type="number"
                  value={rebuildCost}
                  onChange={e => setRebuildCost(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono text-slate-900 focus:outline-none focus:border-red-500"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  ₹{(rebuildCost / 10000000).toFixed(2)} Crores (Modern earthquake/soil compliant structure)
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-red-200 flex flex-col justify-center">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Retrofit vs Rebuild Ratio:</span>
                  <span className="text-lg font-extrabold font-mono text-red-700">{costRatio}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className={`h-full ${costRatio >= 70 ? 'bg-red-600' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min(100, costRatio)}%` }}
                  />
                </div>
                <span className="text-[10px] text-red-700 font-bold mt-1">
                  {costRatio >= 70 ? '⚠️ Exceeds 70% threshold — Retrofit Unviable' : 'Under 70% threshold'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-red-100/70 border border-red-300 rounded-xl text-red-950 text-[11px] leading-relaxed">
              <strong>Statutory Finding:</strong> Because the structure has exceeded its design lifespan ({buildingAge} years &gt; {designLife} years) and the repair cost ({costRatio}%) exceeds the 70% statutory economic ceiling, the NMC Structural Safety Board certifies that <strong>no renovation is technically or economically viable</strong>. Condemnation & demolition order under Section 264 is justified.
            </div>
          </div>

          {/* Certified Failure Mechanisms Checkboxes */}
          <div className="space-y-2">
            <label className="text-slate-800 font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-teal-700" />
              <span>Primary Structural Failure Mechanisms & Board Observations</span>
            </label>
            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              {[
                `Exceeded ${designLife}-Year Structural Design Life (Constructed ${constructionYear} - Age ${buildingAge} Years)`,
                'Severe Foundation Differential Settlement (>45mm) in Expansive Black Cotton Clay',
                'Core Concrete Compressive Strength Degraded Below 10 MPa (IS 516 Benchmark Min 20 MPa)',
                'Extensive Carbonation & Corrosion (>40% Rebar Cross-Section Loss)',
                'Progressive Slab Delamination and Beam-Column Joint Diagonal Shear Failure',
                `Retrofitting Economically Unviable (${costRatio}% Cost Ratio exceeds 70% statutory limit)`
              ].map((mech, idx) => {
                const isChecked = selectedMechanisms.includes(mech);
                return (
                  <label
                    key={idx}
                    onClick={() => handleToggleMechanism(mech)}
                    className={`flex items-center space-x-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                      isChecked
                        ? 'bg-red-50/70 border-red-300 text-red-950 font-medium'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="rounded border-slate-300 text-red-600 focus:ring-red-500 w-4 h-4"
                    />
                    <span>{mech}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Demolition Order Specifications Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div>
              <label className="text-slate-700 font-semibold block mb-1">
                Statutory Order Gazette Number
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={e => setOrderNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
                required
              />
            </div>

            <div>
              <label className="text-slate-700 font-semibold block mb-1">
                Evacuation Directive Deadline
              </label>
              <select
                value={evacuationDeadline}
                onChange={e => setEvacuationDeadline(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
              >
                <option value="Immediate Evacuation (Within 24 Hours)">Immediate Evacuation (Within 24 Hours)</option>
                <option value="Evacuation within 48 Hours">Evacuation within 48 Hours</option>
                <option value="Evacuation within 7 Days (Emergency Relocation)">Evacuation within 7 Days (Emergency Relocation)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-700 font-semibold block mb-1">
                Target Demolition Execution Date
              </label>
              <input
                type="date"
                value={demolitionDate}
                onChange={e => setDemolitionDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
                required
              />
            </div>

            <div>
              <label className="text-slate-700 font-semibold block mb-1">
                Demolition Methodology
              </label>
              <select
                value={demolitionMethod}
                onChange={e => setDemolitionMethod(e.target.value as DemolitionMethod)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
              >
                <option value="HIGH_REACH_EXCAVATOR_DISMANTLING">High-Reach Excavator Controlled Dismantling (Recommended for urban zones)</option>
                <option value="CONTROLLED_MECHANICAL_IMPLOSION">Controlled Implosion (Open industrial zones)</option>
                <option value="MANUAL_DECONSTRUCTION_TOP_DOWN">Top-Down Manual Deconstruction (Adjacent heritage structures)</option>
                <option value="ROBOTIC_HYDRODEMOLITION">Robotic Hydrodemolition</option>
              </select>
            </div>

            <div>
              <label className="text-slate-700 font-semibold block mb-1">
                Assigned Demolition Agency / Contractor
              </label>
              <input
                type="text"
                value={contractor}
                onChange={e => setContractor(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
                required
              />
            </div>

            <div>
              <label className="text-slate-700 font-semibold block mb-1">
                Safety Cordon Buffer Radius
              </label>
              <select
                value={safetyRadius}
                onChange={e => setSafetyRadius(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
              >
                <option value={500}>500 meters (1 km diameter)</option>
                <option value={1000}>1000 meters (2 km diameter - Standard)</option>
                <option value={1500}>1500 meters (3 km diameter)</option>
                <option value={2000}>2000 meters (4 km diameter - Implosion)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-slate-700 font-semibold block mb-1">
                Designated Transit Rehabilitation & Shelter Center
              </label>
              <input
                type="text"
                value={rehabShelter}
                onChange={e => setRehabShelter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
                required
              />
            </div>

          </div>

          {/* Mandatory Utility Disconnection Checklist */}
          <div className="space-y-2">
            <label className="text-slate-800 font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5">
              <ZapOff className="w-4 h-4 text-amber-600" />
              <span>Mandatory Statutory Utility Disconnections Checklist</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={powerCut}
                  onChange={e => setPowerCut(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span>MSEDCL Power Isolated</span>
              </label>
              <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={waterCut}
                  onChange={e => setWaterCut(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span>NMC Water Cutoff</span>
              </label>
              <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={gasCut}
                  onChange={e => setGasCut(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span>PNG Gas Line Purged</span>
              </label>
              <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={telecomCut}
                  onChange={e => setTelecomCut(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span>Telecom Rerouted</span>
              </label>
            </div>
          </div>

          {/* Authority Signatories Note */}
          <div className="bg-slate-950 text-slate-300 p-4 rounded-2xl font-mono text-[11px] space-y-1">
            <div className="font-bold text-red-400">STATUTORY LEGAL EFFECT UPON SUBMISSION:</div>
            <div>1. Declares building Category C-1 Condemned under MMC Act Section 264.</div>
            <div>2. Updates Building Health Passport to CRITICAL (98/100) and displays prominent Condemned banner.</div>
            <div>3. Instantly broadcasts an emergency evacuation warning to all citizens within {safetyRadius}m buffer.</div>
            <div>4. Authorizing Signatures: Dr. Abhijit Chaudhari, IAS (Commissioner) &amp; Shri Manoj S. Talware (Executive Engineer).</div>
          </div>

          {/* Modal Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl shadow-lg shadow-red-600/30 transition flex items-center justify-center space-x-2"
            >
              <ShieldAlert className="w-4 h-4 text-white" />
              <span>🚨 Issue Section 264 Demolition Order & Broadcast Alert</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
