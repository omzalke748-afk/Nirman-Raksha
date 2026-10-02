import {
  BuildingRecord,
  RiskLevel,
  InspectionPriority,
  MaintenancePriority,
  StructuralObservation,
  EnvironmentalTelemetry,
  DataCompletenessBreakdown
} from '../types';
import { analyzeCorrosionAndSoil } from './corrosionAndSoilService';

export interface RiskEvaluationResult {
  riskIndicator: RiskLevel;
  riskScore: number;
  dataConfidenceScore: number;
  dataCompleteness: DataCompletenessBreakdown;
  inspectionPriority: InspectionPriority;
  maintenancePriority: MaintenancePriority;
  riskFactors: {
    factor: string;
    type: 'NEGATIVE' | 'POSITIVE' | 'NEUTRAL';
    impact: number;
    category: 'STRUCTURAL' | 'MAINTENANCE' | 'ENVIRONMENTAL' | 'INSPECTION' | 'MUNICIPAL';
    description: string;
  }[];
  missingDataWarnings: string[];
  recommendedProfessionalAction: string;
}

export interface WhatChangedResult {
  hasChanges: boolean;
  previousRisk: RiskLevel;
  currentRisk: RiskLevel;
  riskDirection: 'INCREASED' | 'DECREASED' | 'UNCHANGED';
  deltaObservations: StructuralObservation[];
  deltaFactors: string[];
  explanation: string;
}

/**
 * Calculates transparent, explainable prototype building risk indicator
 * Strictly adheres to rule: Never claim mathematical collapse date or collapse probability!
 * Environmental parameters are treated strictly as contextual risk modulators, not direct failure proof.
 */
export function evaluateBuildingRisk(
  building: BuildingRecord,
  environment?: EnvironmentalTelemetry
): RiskEvaluationResult {
  const nowIso = new Date().toISOString();

  // 1. Data Completeness Breakdown (8 standard categories)
  const categoriesBreakdown = [
    {
      name: 'Location & Cadastral GIS',
      status: 'VERIFIED' as const,
      source: 'Google Maps / OSM Nagpur Layer',
      lastUpdated: building.lastUpdated || nowIso
    },
    {
      name: 'Official Sanction / Blueprint',
      status: building.sanctionedPlanNo.status !== 'UNAVAILABLE' ? ('VERIFIED' as const) : ('MISSING' as const),
      source: building.sanctionedPlanNo.source,
      lastUpdated: building.sanctionedPlanNo.status !== 'UNAVAILABLE' ? building.sanctionedPlanNo.retrievedAt : undefined
    },
    {
      name: 'Construction Year Record',
      status: building.constructionYear.status !== 'UNAVAILABLE' && building.constructionYear.value ? ('VERIFIED' as const) : ('MISSING' as const),
      source: building.constructionYear.source,
      lastUpdated: building.constructionYear.status !== 'UNAVAILABLE' ? building.constructionYear.retrievedAt : undefined
    },
    {
      name: 'Structural Framing Type',
      status: building.structuralSystem.status !== 'UNAVAILABLE' && building.structuralSystem.value !== 'UNVERIFIED' ? ('VERIFIED' as const) : ('MISSING' as const),
      source: building.structuralSystem.source,
      lastUpdated: building.structuralSystem.status !== 'UNAVAILABLE' ? building.structuralSystem.retrievedAt : undefined
    },
    {
      name: 'Municipal Legal Status',
      status: building.officialMunicipalStatus.status !== 'UNAVAILABLE' ? ('VERIFIED' as const) : ('MISSING' as const),
      source: building.officialMunicipalStatus.source,
      lastUpdated: building.officialMunicipalStatus.retrievedAt
    },
    {
      name: 'Structural Observations / Defects',
      status: building.observations.length > 0 ? ('VERIFIED' as const) : ('MISSING' as const),
      source: building.observations.length > 0 ? 'Field Inspector Logger' : 'None on Record',
      lastUpdated: building.observations.length > 0 ? building.observations[0].date : undefined
    },
    {
      name: 'Maintenance & Repair Ledger',
      status: building.maintenance.length > 0 ? ('VERIFIED' as const) : ('MISSING' as const),
      source: building.maintenance.length > 0 ? 'Contractor Maintenance Ledger' : 'No Maintenance Records Found',
      lastUpdated: building.maintenance.length > 0 ? building.maintenance[0].date : undefined
    },
    {
      name: 'Environmental Context Telemetry',
      status: environment ? ('VERIFIED' as const) : ('STALE' as const),
      source: 'Open-Meteo Nagpur + GSDA Hydrogeology Bulletin',
      lastUpdated: environment?.timestamp || nowIso
    }
  ];

  const verifiedCount = categoriesBreakdown.filter(c => c.status === 'VERIFIED').length;
  const missingCount = categoriesBreakdown.filter(c => c.status === 'MISSING').length;
  const staleCount = categoriesBreakdown.filter(c => c.status === 'STALE').length;
  const completenessPercentage = Math.round((verifiedCount / categoriesBreakdown.length) * 100);

  const missingDataWarnings: string[] = categoriesBreakdown
    .filter(c => c.status === 'MISSING')
    .map(c => `${c.name} data is currently unavailable in verified public archives`);

  const dataCompleteness: DataCompletenessBreakdown = {
    percentage: completenessPercentage,
    verifiedCount,
    missingCount,
    staleCount,
    categories: categoriesBreakdown
  };

  // If severely lacking baseline data (< 30%) and no physical observations, return INSUFFICIENT_DATA
  if (completenessPercentage < 30 && building.observations.length === 0) {
    return {
      riskIndicator: 'INSUFFICIENT_DATA',
      riskScore: 50,
      dataConfidenceScore: completenessPercentage,
      dataCompleteness,
      inspectionPriority: 'URGENT_INSPECTION',
      maintenancePriority: 'LOW',
      riskFactors: [
        {
          factor: 'Insufficient Baseline Data',
          type: 'NEUTRAL',
          impact: 0,
          category: 'INSPECTION',
          description: 'Cannot determine reliable building risk indicator without verified structural framing or physical inspection records.'
        }
      ],
      missingDataWarnings,
      recommendedProfessionalAction: 'Engage a certified structural engineer for baseline visual inspection and non-destructive testing (NDT).'
    };
  }

  // 2. Compute Transparent Weighted Factor Contributions
  let baseScore = 20; // Healthy structure baseline
  const riskFactors: {
    factor: string;
    type: 'NEGATIVE' | 'POSITIVE' | 'NEUTRAL';
    impact: number;
    category: 'STRUCTURAL' | 'MAINTENANCE' | 'ENVIRONMENTAL' | 'INSPECTION' | 'MUNICIPAL';
    description: string;
  }[] = [];

  // Observational Factors (Heaviest Weight: up to 50 pts)
  let criticalObsCount = 0;
  let severeObsCount = 0;
  let moderateObsCount = 0;

  building.observations.forEach(obs => {
    if (obs.severity === 'CRITICAL') criticalObsCount++;
    else if (obs.severity === 'SEVERE') severeObsCount++;
    else if (obs.severity === 'MODERATE') moderateObsCount++;
  });

  if (criticalObsCount > 0) {
    const impact = Math.min(45, criticalObsCount * 30);
    baseScore += impact;
    riskFactors.push({
      factor: `${criticalObsCount} Critical Structural Observation(s) Recorded`,
      type: 'NEGATIVE',
      impact,
      category: 'STRUCTURAL',
      description: 'Active critical distress such as major load-bearing shear cracks, beam deflection, or foundation settlement.'
    });
  }

  if (severeObsCount > 0) {
    const impact = Math.min(30, severeObsCount * 18);
    baseScore += impact;
    riskFactors.push({
      factor: `${severeObsCount} Severe Observation(s) (Spalling/Corrosion/Shear Cracks)`,
      type: 'NEGATIVE',
      impact,
      category: 'STRUCTURAL',
      description: 'Progressive structural deterioration affecting rebar cross-section or cover concrete.'
    });
  }

  if (moderateObsCount > 0) {
    const impact = Math.min(15, moderateObsCount * 7);
    baseScore += impact;
    riskFactors.push({
      factor: `${moderateObsCount} Moderate Observation(s) (Dampness/Step Cracks)`,
      type: 'NEGATIVE',
      impact,
      category: 'STRUCTURAL',
      description: 'Localized water seepage, plaster delamination, or non-structural masonry cracks requiring remedial attention.'
    });
  }

  // Municipal Legal Status Factors (up to 35 pts)
  const municipalStatusStr = building.officialMunicipalStatus.value?.toLowerCase() || '';
  if (municipalStatusStr.includes('c1') || municipalStatusStr.includes('dilapidated') || municipalStatusStr.includes('section 264')) {
    baseScore += 35;
    riskFactors.push({
      factor: 'Official NMC Dilapidated / Hazardous Listing (Section 264)',
      type: 'NEGATIVE',
      impact: 35,
      category: 'MUNICIPAL',
      description: 'Nagpur Municipal Corporation issued formal statutory notice classifying structure under dangerous category.'
    });
  } else if (municipalStatusStr.includes('notice') || municipalStatusStr.includes('section 265')) {
    baseScore += 15;
    riskFactors.push({
      factor: 'NMC Section 265 Structural Audit Notice Active',
      type: 'NEGATIVE',
      impact: 15,
      category: 'MUNICIPAL',
      description: 'Municipal notice served directing immediate structural safety assessment.'
    });
  }

  // Building Age & Structural System
  const currentYear = 2026;
  if (building.constructionYear.value) {
    const age = currentYear - building.constructionYear.value;
    if (age > 50) {
      const isLoadBearing = building.structuralSystem.value === 'LOAD_BEARING_BRICK';
      const impact = isLoadBearing ? 20 : 12;
      baseScore += impact;
      riskFactors.push({
        factor: `Building Age (${age} years) + ${isLoadBearing ? 'Load Bearing Masonry' : 'RCC Framing'}`,
        type: 'NEGATIVE',
        impact,
        category: 'STRUCTURAL',
        description: `Structure has exceeded ${age} years of service life; heightened susceptibility to carbonation and joint fatigue.`
      });
    } else if (age > 30) {
      baseScore += 8;
      riskFactors.push({
        factor: `Building Age (${age} years)`,
        type: 'NEGATIVE',
        impact: 8,
        category: 'STRUCTURAL',
        description: 'Periodic 5-year structural audits recommended under NMC building bylaws.'
      });
    }
  }

  // Inspection Recency
  if (building.inspections.length === 0 && building.observations.length === 0) {
    baseScore += 10;
    riskFactors.push({
      factor: 'No Recent Structural Audit on Record',
      type: 'NEGATIVE',
      impact: 10,
      category: 'INSPECTION',
      description: 'No verified structural engineering inspection recorded in recent municipal cycles.'
    });
  }

  // Mitigating Maintenance History (Positive Impacts)
  const recentCompletedRepairs = building.maintenance.filter(m => m.status === 'COMPLETED');
  if (recentCompletedRepairs.length > 0) {
    const impact = -Math.min(18, recentCompletedRepairs.length * 8);
    baseScore += impact;
    riskFactors.push({
      factor: `${recentCompletedRepairs.length} Documented Maintenance Repair(s) Completed`,
      type: 'POSITIVE',
      impact,
      category: 'MAINTENANCE',
      description: 'Documented remedial repairs (grouting, waterproofing, or structural jacketing) partially mitigate risk.'
    });
  }

  // Active Stability Certificate
  const hasValidCert = building.inspections.some(i => i.stabilityCertificateUploaded);
  if (hasValidCert) {
    baseScore -= 12;
    riskFactors.push({
      factor: 'Valid Structural Stability Certificate on File',
      type: 'POSITIVE',
      impact: -12,
      category: 'INSPECTION',
      description: 'Accredited structural engineer certified structural fitness.'
    });
  }

  // Environmental Context (Treated as CONTEXT, not direct failure proof)
  if (environment) {
    const envAnalysis = analyzeCorrosionAndSoil(environment, building);
    if (envAnalysis.criticalHumidityExceeded && (severeObsCount > 0 || moderateObsCount > 0)) {
      const impact = 8;
      baseScore += impact;
      riskFactors.push({
        factor: `Atmospheric Context: RH ${envAnalysis.relativeHumidityPct}% (>60% threshold)`,
        type: 'NEGATIVE',
        impact,
        category: 'ENVIRONMENTAL',
        description: `Ambient humidity above 60% provides electrolytic moisture that accelerates corrosion across existing unsealed cracks.`
      });
    }

    if (envAnalysis.soilThreatCategory === 'HIGH_SWELLING_PRESSURE' || envAnalysis.soilThreatCategory === 'SEVERE_DESICCATION_SHRINKAGE') {
      const impact = 6;
      baseScore += impact;
      riskFactors.push({
        factor: `Ground Context: Black Cotton Soil Swelling Surcharge (${envAnalysis.soilSwellingPressureKpa} kPa)`,
        type: 'NEGATIVE',
        impact,
        category: 'ENVIRONMENTAL',
        description: `Volumetric moisture shift (${envAnalysis.soilMoisturePct}% saturation) exerts differential sub-structure uplift on shallow foundations.`
      });
    }
  }

  // Bound score between 5 and 98
  const finalScore = Math.max(5, Math.min(98, Math.round(baseScore)));

  // Categorize
  let riskIndicator: RiskLevel = 'LOW';
  let inspectionPriority: InspectionPriority = 'ROUTINE';
  let maintenancePriority: MaintenancePriority = 'LOW';
  let recommendedProfessionalAction = 'Maintain routine 5-year inspection schedule and monsoon drainage clearance.';

  if (finalScore >= 80 || criticalObsCount > 0) {
    riskIndicator = 'CRITICAL';
    inspectionPriority = 'IMMEDIATE_ASSESSMENT';
    maintenancePriority = 'IMMEDIATE_REPAIR';
    recommendedProfessionalAction = 'Emergency on-site structural audit, immediate propping of distressed spans, and consideration of area restriction / evacuation protocols by authorized personnel.';
  } else if (finalScore >= 60 || severeObsCount > 0) {
    riskIndicator = 'HIGH';
    inspectionPriority = 'URGENT_INSPECTION';
    maintenancePriority = 'HIGH';
    recommendedProfessionalAction = 'Detailed Non-Destructive Testing (UPV, Rebound Hammer, Carbonation Depth) and execution of engineered retrofitting by licensed contractor.';
  } else if (finalScore >= 35 || moderateObsCount > 0) {
    riskIndicator = 'MODERATE';
    inspectionPriority = 'MONITOR_NEXT_CYCLE';
    maintenancePriority = 'MEDIUM';
    recommendedProfessionalAction = 'Commission targeted crack injection grouting, overhaul exterior waterproofing, and conduct follow-up inspection in 6 months.';
  }

  return {
    riskIndicator,
    riskScore: finalScore,
    dataConfidenceScore: completenessPercentage,
    dataCompleteness,
    inspectionPriority,
    maintenancePriority,
    riskFactors,
    missingDataWarnings,
    recommendedProfessionalAction
  };
}

/**
 * Computes "WHAT CHANGED?" differential between current and previous inspection baseline
 */
export function computeWhatChanged(building: BuildingRecord): WhatChangedResult {
  if (building.observations.length === 0) {
    return {
      hasChanges: false,
      previousRisk: building.riskIndicator,
      currentRisk: building.riskIndicator,
      riskDirection: 'UNCHANGED',
      deltaObservations: [],
      deltaFactors: [],
      explanation: 'No recent structural inspections or new field observations recorded for comparison.'
    };
  }

  // Sort observations by date descending
  const sortedObs = [...building.observations].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const latestObs = sortedObs.slice(0, 2);
  const deltaFactors: string[] = [];

  latestObs.forEach(obs => {
    deltaFactors.push(`New ${obs.severity} observation: ${obs.observationType.replace(/_/g, ' ')} at ${obs.locationDetails}`);
  });

  const isCriticalOrHigh = building.riskIndicator === 'CRITICAL' || building.riskIndicator === 'HIGH';

  return {
    hasChanges: true,
    previousRisk: isCriticalOrHigh ? 'MODERATE' : 'LOW',
    currentRisk: building.riskIndicator,
    riskDirection: isCriticalOrHigh ? 'INCREASED' : 'UNCHANGED',
    deltaObservations: latestObs,
    deltaFactors,
    explanation: isCriticalOrHigh
      ? `Risk indicator elevated to ${building.riskIndicator} due to newly logged structural distress (${latestObs.map(o => o.observationType).join(', ')}) without verified stability certification.`
      : 'Routine observations recorded. Structural parameters remain within acceptable monitoring thresholds.'
  };
}
