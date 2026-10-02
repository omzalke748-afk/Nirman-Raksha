import React from 'react';
import { useApp } from '../../context/AppContext';
import { BuildingRecord } from '../../types';
import { RiskBadge } from './RiskBadge';
import {
  Building,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Calendar,
  Users,
  Wrench,
  Compass
} from 'lucide-react';

interface Props {
  building: BuildingRecord;
  onSelectBuilding?: (buildingId: string) => void;
  variant?: 'detailed' | 'compact' | 'banner';
}

export const CampusBlockNavigator: React.FC<Props> = ({
  building,
  onSelectBuilding,
  variant = 'detailed'
}) => {
  const { buildings, setActiveBuildingId } = useApp();

  // If this building is not part of a campus / complex, don't render
  if (!building.campusId) {
    return null;
  }

  // Find all buildings belonging to this campus
  const campusBlocks = buildings.filter(
    b => b.campusId === building.campusId
  );

  // If only 1 building found in state, try building's own affiliatedBlocks fallback
  const totalBlocksCount = Math.max(
    campusBlocks.length,
    building.totalCampusBlocks || (building.affiliatedBlocks?.length || 0)
  );

  const campusName = building.campusName || building.name;

  const handleBlockClick = (blockId: string) => {
    if (onSelectBuilding) {
      onSelectBuilding(blockId);
    } else {
      setActiveBuildingId(blockId);
    }
  };

  if (variant === 'compact') {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 font-bold text-slate-800">
            <Building className="w-3.5 h-3.5 text-teal-600" />
            <span>Campus: {campusName}</span>
          </div>
          <span className="px-2 py-0.5 bg-teal-100/70 text-teal-800 rounded font-mono text-[10px] font-bold">
            {totalBlocksCount} Blocks
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
          {campusBlocks.map(blk => {
            const isCurrent = blk.id === building.id;
            return (
              <button
                key={blk.id}
                onClick={() => handleBlockClick(blk.id)}
                className={`text-left p-2 rounded-lg border text-xs transition flex items-center justify-between gap-1.5 ${
                  isCurrent
                    ? 'bg-teal-700 text-white border-teal-800 shadow-sm font-semibold'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300 hover:bg-teal-50/40'
                }`}
              >
                <div className="truncate">
                  <div className="font-bold text-[11px] truncate">
                    {blk.blockCode ? `[${blk.blockCode.replace(/_/g, ' ')}]` : ''} {blk.blockName || blk.name}
                  </div>
                  <div className={`text-[10px] ${isCurrent ? 'text-teal-100' : 'text-slate-500'}`}>
                    {blk.numberOfFloors?.value || 3} Flrs • {blk.constructionYear?.value || 2010}
                  </div>
                </div>
                <RiskBadge level={blk.riskIndicator} score={blk.riskScore} size="sm" showScore={false} />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-teal-200/90 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden">
      {/* Decorative background aura */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-teal-50/50 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-start sm:items-center space-x-3">
          <div className="p-2.5 bg-teal-700 text-white rounded-xl shadow-sm shrink-0">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded text-[11px] font-bold font-mono tracking-wider">
                MULTI-BLOCK COMPLEX DOSSIER
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {totalBlocksCount} Dedicated Municipal Building Records
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
              {campusName}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-slate-500">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[11px]">Individual Block Telemetry Synchronized</span>
        </div>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed relative z-10">
        This institutional campus contains multiple structurally independent blocks. NIRMAN-RAKSHA tracks sanctioned plans, structural framing, defect logs, and stability certificates for each individual block. Click any block below to switch inspection dossiers.
      </p>

      {/* Block Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 relative z-10">
        {campusBlocks.map((blk) => {
          const isCurrent = blk.id === building.id;
          const defectCount = blk.observations?.length || (blk.riskFactors?.filter(r => r.type === 'NEGATIVE').length || 0);

          return (
            <div
              key={blk.id}
              onClick={() => handleBlockClick(blk.id)}
              className={`cursor-pointer rounded-xl p-4 border transition-all relative flex flex-col justify-between ${
                isCurrent
                  ? 'bg-gradient-to-b from-teal-50/80 to-white border-teal-600 ring-2 ring-teal-500/20 shadow-md'
                  : 'bg-slate-50/70 hover:bg-white border-slate-200 hover:border-teal-400 hover:shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-1.5">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                      isCurrent
                        ? 'bg-teal-700 text-white'
                        : 'bg-slate-200 text-slate-800'
                    }`}>
                      {blk.blockCode ? blk.blockCode.replace(/_/g, ' ') : 'BLOCK'}
                    </span>
                    {blk.isCampusMaster && (
                      <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-[10px] font-semibold">
                        Master Dossier
                      </span>
                    )}
                  </div>
                  <RiskBadge level={blk.riskIndicator} score={blk.riskScore} size="sm" />
                </div>

                <h4 className="text-sm font-bold text-slate-900 line-clamp-1 mb-1">
                  {blk.blockName || blk.name}
                </h4>

                <p className="text-[11px] text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                  {blk.occupancyType?.value || blk.structuralSystem?.value?.replace(/_/g, ' ') || 'Institutional Academic & Administrative Wing'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/80 space-y-1.5 text-[11px] text-slate-500 font-mono">
                <div className="flex items-center justify-between">
                  <span>Built: {blk.constructionYear?.value || 'N/A'}</span>
                  <span>Floors: {blk.numberOfFloors?.value || 3} (G+{((blk.numberOfFloors?.value || 3) - 1)})</span>
                  <span>Cap: {blk.approximateCapacity?.value?.toLocaleString() || '1,000+'}</span>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className={defectCount > 0 ? 'text-amber-700 font-semibold' : 'text-emerald-700 font-semibold'}>
                    {defectCount === 0 ? '✓ No Active Defects' : `⚠ ${defectCount} Defect${defectCount > 1 ? 's' : ''} Flagged`}
                  </span>

                  <span className={`font-sans font-bold flex items-center space-x-1 ${
                    isCurrent ? 'text-teal-700' : 'text-slate-600 hover:text-teal-700'
                  }`}>
                    <span>{isCurrent ? 'Viewing Dossier' : 'Select Block'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>

              {isCurrent && (
                <div className="absolute top-2 right-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600" />
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Block-by-Block Comparison Table */}
      <div className="mt-4 pt-3 border-t border-slate-200/80">
        <div className="text-xs font-bold text-slate-700 mb-2 flex items-center space-x-1.5">
          <Layers className="w-3.5 h-3.5 text-teal-600" />
          <span>Campus Blocks Structural Summary & Compliance Matrix</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 font-mono text-[11px]">
                <th className="py-2 px-3">Block / Wing</th>
                <th className="py-2 px-3">Structure Type</th>
                <th className="py-2 px-3">Sanction Blueprint</th>
                <th className="py-2 px-3">Floors & Year</th>
                <th className="py-2 px-3">Capacity</th>
                <th className="py-2 px-3">Risk Level</th>
                <th className="py-2 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campusBlocks.map((blk) => (
                <tr
                  key={blk.id}
                  className={`hover:bg-teal-50/50 transition ${
                    blk.id === building.id ? 'bg-teal-50/70 font-semibold' : ''
                  }`}
                >
                  <td className="py-2 px-3">
                    <div className="font-bold text-slate-800">
                      {blk.blockCode ? `[${blk.blockCode.replace(/_/g, ' ')}] ` : ''}{blk.blockName || blk.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">{blk.id}</div>
                  </td>
                  <td className="py-2 px-3 text-slate-600">
                    {blk.structuralSystem?.value?.replace(/_/g, ' ') || 'RCC Frame'}
                  </td>
                  <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                    {blk.sanctionedPlanNo?.value || 'MahaVastu Sanctioned'}
                  </td>
                  <td className="py-2 px-3 text-slate-600">
                    {blk.numberOfFloors?.value} Floors ({blk.constructionYear?.value})
                  </td>
                  <td className="py-2 px-3 text-slate-600">
                    {blk.approximateCapacity?.value?.toLocaleString()} occupants
                  </td>
                  <td className="py-2 px-3">
                    <RiskBadge level={blk.riskIndicator} score={blk.riskScore} size="sm" />
                  </td>
                  <td className="py-2 px-3 text-right">
                    {blk.id === building.id ? (
                      <span className="px-2 py-0.5 bg-teal-100 text-teal-800 rounded text-[10px] font-bold">
                        ACTIVE
                      </span>
                    ) : (
                      <button
                        onClick={() => handleBlockClick(blk.id)}
                        className="px-2.5 py-1 bg-white hover:bg-teal-700 hover:text-white text-teal-800 border border-teal-300 rounded text-[11px] font-medium transition"
                      >
                        Inspect Block
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
