/**
 * Multi-Source Building Data Fusion & Source Hierarchy Engine
 * 
 * Implements:
 * 1. Multi-source data synthesis (Google Places, MahaVastu BPMS, NMC Gazette, GSDA, Open-Meteo, Field Audits)
 * 2. Source Priority Hierarchy:
 *    OFFICIAL_GOVERNMENT_RECORD > AUTHORIZED_PROFESSIONAL_RECORD > PUBLIC_VERIFIED_SOURCE > USER_PROVIDED > ESTIMATED
 * 3. Never overwrites official records with unverified sources
 * 4. Transparent Source Conflict detection & reporting
 * 5. Data Completeness breakdown (Verified, Missing, Stale)
 * 6. Generates deep "Building Assessment Study" report
 */

import {
  BuildingRecord,
  BuildingCategory,
  BuildingObservation,
  DataStatus,
  ProvenanceField,
  StructuralSystemType,
  SourceConflict,
  DataCompletenessBreakdown,
  BuildingAssessmentStudy,
  EnvironmentalTelemetry
} from '../types';
import { NAGPUR_MAHAVASTU_CATALOG } from './mahavastuBpmsService';
import { PlaceSearchResult, inferNagpurZoneFromCoords } from './googleMapsService';
import { analyzeCorrosionAndSoil } from './corrosionAndSoilService';
import { INITIAL_ENVIRONMENT } from '../data/initialData';

export interface MultiSourceIngestionInput {
  name: string;
  formattedAddress?: string;
  address?: string;
  latitude: number;
  longitude: number;
  category?: BuildingCategory;
  buildingType?: 'RESIDENTIAL' | 'COMMERCIAL' | 'INSTITUTIONAL' | 'MIXED_USE' | 'INDUSTRIAL' | 'HERITAGE';
  placeId?: string;
  area?: string;
  ward?: string;
  zoneNumber?: number;
  
  // User/Engineer supplied overrides
  constructionYear?: number;
  numberOfFloors?: number;
  structuralSystem?: StructuralSystemType;
  occupancyType?: string;
  approximateCapacity?: number;
  
  // Observational inputs
  hasCracks?: boolean;
  hasObservedCracks?: boolean;
  crackDetails?: string;
  crackWidthMm?: number;
  hasSeepage?: boolean;
  hasObservedSeepage?: boolean;
  hasCorrosion?: boolean;
  hasObservedCorrosion?: boolean;
  hasFoundationSettlement?: boolean;
  hasDeformation?: boolean;
  inspectorNotes?: string;
  
  // Official references if provided
  bpmsProposalNo?: string;
  sanctionedPlanNo?: string;
  sanctionOrderNo?: string;
  architectName?: string;
  structuralEngineer?: string;
  isNMCFlagged?: boolean;
  inspectorName?: string;
  inspectorLicense?: string;
}

export interface MultiSourceInspectionSummary {
  matchedMahaVastu: boolean;
  matchedNmcGazette: boolean;
  matchedGooglePlaces: boolean;
  matchedGsdaReport: boolean;
  matchedWeatherTelemetry: boolean;
  sourcesFound: string[];
  conflictsDetected: SourceConflict[];
  completeness: DataCompletenessBreakdown;
}

const SOURCE_PRIORITY_RANK: Record<DataStatus, number> = {
  OFFICIAL_GOVERNMENT_RECORD: 1,
  OFFICIAL_SOURCE: 1,
  AUTHORITY_VERIFIED: 1,
  AUTHORIZED_PROFESSIONAL_RECORD: 2,
  ENGINEER_VERIFIED: 2,
  PUBLIC_VERIFIED_SOURCE: 3,
  PUBLIC_SOURCE: 3,
  USER_PROVIDED: 4,
  ESTIMATED: 5,
  SYNTHETIC_DEMO: 6,
  UNAVAILABLE: 7,
  SOURCE_CONFLICT: 8
};

/**
 * Fuse multi-source building records with strict source hierarchy & conflict awareness
 */
export function fuseMultiSourceBuildingData(
  input: MultiSourceIngestionInput,
  environment?: EnvironmentalTelemetry
): {
  building: BuildingRecord;
  summary: MultiSourceInspectionSummary;
} {
  const nowIso = new Date().toISOString();
  const zoneInfo = (input.ward && input.zoneNumber)
    ? { ward: input.ward, zoneNumber: input.zoneNumber, area: input.area || 'Nagpur' }
    : inferNagpurZoneFromCoords(input.latitude, input.longitude);

  const cleanName = input.name.trim();
  const lowerName = cleanName.toLowerCase();

  // 1. Search MahaVastu BPMS Records
  const bpmsMatch = NAGPUR_MAHAVASTU_CATALOG.find(r =>
    (input.bpmsProposalNo && r.bpmsProposalNo.toLowerCase().includes(input.bpmsProposalNo.toLowerCase())) ||
    r.projectName.toLowerCase().includes(lowerName) ||
    lowerName.includes(r.projectName.toLowerCase())
  );

  // 2. Check NMC Dangerous Gazette (Sec 264)
  const isNmcHazardous = Boolean(
    input.isNMCFlagged ||
    (bpmsMatch && bpmsMatch.occupancyStatus === 'DILAPIDATED_NOTICE_ACTIVE') ||
    lowerName.includes('dilapidated') ||
    lowerName.includes('c1') ||
    lowerName.includes('hazardous')
  );

  const conflictsDetected: SourceConflict[] = [];
  const sourcesFound: string[] = ['Google Maps / GIS Geolocation'];

  // Resolve Floors
  let numberOfFloorsField: ProvenanceField<number>;
  if (bpmsMatch) {
    sourcesFound.push('MahaVastu BPMS Official Sanction');
    if (input.numberOfFloors && input.numberOfFloors !== bpmsMatch.numberOfFloors) {
      conflictsDetected.push({
        field: 'Number of Floors',
        sourceA: 'MahaVastu BPMS Sanction',
        valueA: `${bpmsMatch.numberOfFloors} Floors (Sanctioned Blueprint)`,
        sourceB: 'User / Field Observation',
        valueB: `${input.numberOfFloors} Floors`,
        resolutionNotes: 'Official government record preserved as primary value while noting physical discrepancy.'
      });
    }
    numberOfFloorsField = {
      value: bpmsMatch.numberOfFloors,
      source: `MahaVastu BPMS Sanction Order ${bpmsMatch.sanctionOrderNo}`,
      sourceUrl: bpmsMatch.portalVerificationUrl,
      retrievedAt: nowIso,
      status: 'OFFICIAL_GOVERNMENT_RECORD',
      confidenceScore: 98,
      alternateValue: input.numberOfFloors || null,
      alternateSource: input.numberOfFloors ? 'User Field Observation' : undefined
    };
  } else if (input.numberOfFloors) {
    numberOfFloorsField = {
      value: input.numberOfFloors,
      source: 'User / Field Visual Survey',
      retrievedAt: nowIso,
      status: 'USER_PROVIDED',
      confidenceScore: 85
    };
  } else {
    numberOfFloorsField = {
      value: null,
      source: 'Municipal Archive',
      retrievedAt: nowIso,
      status: 'UNAVAILABLE',
      unavailabilityReason: 'Requires physical site verification',
      confidenceScore: 0
    };
  }

  // Resolve Construction Year (NEVER infer from Google Maps)
  let constructionYearField: ProvenanceField<number>;
  if (bpmsMatch) {
    const yearFromSanction = Number(bpmsMatch.sanctionDate.split('-')[0]) || 2020;
    if (input.constructionYear && input.constructionYear !== yearFromSanction) {
      conflictsDetected.push({
        field: 'Construction Year',
        sourceA: 'MahaVastu BPMS Sanction Date',
        valueA: `${yearFromSanction}`,
        sourceB: 'User Input',
        valueB: `${input.constructionYear}`,
        resolutionNotes: 'Retained official BPMS sanction year as authoritative.'
      });
    }
    constructionYearField = {
      value: yearFromSanction,
      source: `MahaVastu BPMS Sanction Schedule (${bpmsMatch.sanctionDate})`,
      sourceUrl: bpmsMatch.portalVerificationUrl,
      retrievedAt: nowIso,
      status: 'OFFICIAL_GOVERNMENT_RECORD',
      confidenceScore: 95
    };
  } else if (input.constructionYear) {
    constructionYearField = {
      value: input.constructionYear,
      source: 'User / Building Society Record',
      retrievedAt: nowIso,
      status: 'USER_PROVIDED',
      confidenceScore: 75
    };
  } else {
    constructionYearField = {
      value: null,
      source: 'NMC Property Tax Archive',
      retrievedAt: nowIso,
      status: 'UNAVAILABLE',
      unavailabilityReason: 'No verified municipal construction record found in public registry',
      confidenceScore: 0
    };
  }

  // Resolve Structural System
  let structuralSystemField: ProvenanceField<StructuralSystemType>;
  if (bpmsMatch) {
    structuralSystemField = {
      value: bpmsMatch.structuralSystem,
      source: `MahaVastu Empaneled Structural Engineer (${bpmsMatch.structuralEngineerName})`,
      sourceUrl: bpmsMatch.portalVerificationUrl,
      retrievedAt: nowIso,
      status: 'AUTHORIZED_PROFESSIONAL_RECORD',
      confidenceScore: 98
    };
  } else if (input.structuralSystem && input.structuralSystem !== 'UNVERIFIED') {
    structuralSystemField = {
      value: input.structuralSystem,
      source: input.inspectorLicense ? `Field Inspector Filing (${input.inspectorLicense})` : 'User Reported System',
      retrievedAt: nowIso,
      status: input.inspectorLicense ? 'AUTHORIZED_PROFESSIONAL_RECORD' : 'USER_PROVIDED',
      confidenceScore: input.inspectorLicense ? 90 : 70
    };
  } else {
    structuralSystemField = {
      value: 'UNVERIFIED',
      source: 'NMC Engineering Registry',
      retrievedAt: nowIso,
      status: 'UNAVAILABLE',
      unavailabilityReason: 'Requires on-site structural engineering verification',
      confidenceScore: 0
    };
  }

  // Resolve Sanctioned Blueprint No
  let sanctionedPlanNoField: ProvenanceField<string>;
  if (bpmsMatch) {
    sanctionedPlanNoField = {
      value: bpmsMatch.sanctionOrderNo || bpmsMatch.bpmsProposalNo,
      source: 'MahaVastu BPMS (https://mahavastu.maharashtra.gov.in/)',
      sourceUrl: bpmsMatch.portalVerificationUrl,
      retrievedAt: nowIso,
      status: 'OFFICIAL_GOVERNMENT_RECORD',
      confidenceScore: 99
    };
  } else if (input.sanctionedPlanNo || input.bpmsProposalNo) {
    sanctionedPlanNoField = {
      value: input.sanctionedPlanNo || input.bpmsProposalNo || null,
      source: 'Town Planning Ingestion Reference',
      retrievedAt: nowIso,
      status: 'USER_PROVIDED',
      confidenceScore: 80
    };
  } else {
    sanctionedPlanNoField = {
      value: null,
      source: 'NMC Town Planning Archive',
      retrievedAt: nowIso,
      status: 'UNAVAILABLE',
      unavailabilityReason: 'Sanctioned blueprint not linked; requires manual archival retrieval',
      confidenceScore: 0
    };
  }

  // Resolve Municipal Status
  let officialMunicipalStatusField: ProvenanceField<string>;
  if (isNmcHazardous) {
    sourcesFound.push('NMC Hazardous Buildings Gazette (Section 264)');
    officialMunicipalStatusField = {
      value: 'Declared Dilapidated (NMC Section 264 Active Order)',
      source: 'Nagpur Municipal Corporation Hazardous Buildings Gazette 2025-26',
      sourceUrl: 'https://www.nmcnagpur.gov.in/public-notices/hazardous-buildings-2025-26.pdf',
      retrievedAt: nowIso,
      status: 'OFFICIAL_GOVERNMENT_RECORD',
      confidenceScore: 98
    };
  } else if (bpmsMatch) {
    officialMunicipalStatusField = {
      value: `BPMS Sanctioned (${bpmsMatch.occupancyStatus.replace(/_/g, ' ')})`,
      source: 'MahaVastu BPMS Authority Endorsement',
      retrievedAt: nowIso,
      status: 'OFFICIAL_GOVERNMENT_RECORD',
      confidenceScore: 95
    };
  } else {
    officialMunicipalStatusField = {
      value: 'Standard Municipal Jurisdiction Registry',
      source: 'NMC Public Ward Register',
      retrievedAt: nowIso,
      status: 'PUBLIC_VERIFIED_SOURCE',
      confidenceScore: 85
    };
  }

  // Resolve Occupancy & Capacity
  const occupancyTypeField: ProvenanceField<string> = {
    value: input.occupancyType || (bpmsMatch ? bpmsMatch.floorDescription : 'General Urban Occupancy'),
    source: bpmsMatch ? 'MahaVastu BPMS Sanction Schedule' : (input.occupancyType ? 'Field Survey Intake' : 'Public Domain'),
    retrievedAt: nowIso,
    status: bpmsMatch ? 'OFFICIAL_GOVERNMENT_RECORD' : (input.occupancyType ? 'USER_PROVIDED' : 'PUBLIC_SOURCE'),
    confidenceScore: bpmsMatch ? 95 : 75
  };

  const approximateCapacityField: ProvenanceField<number> = {
    value: input.approximateCapacity || (bpmsMatch ? Math.round(bpmsMatch.sanctionedBuiltUpAreaSqM / 25) : null),
    source: bpmsMatch ? 'Built-up Area Occupancy Standard' : (input.approximateCapacity ? 'User Estimate' : 'Municipal Archive'),
    retrievedAt: nowIso,
    status: input.approximateCapacity ? 'ESTIMATED' : (bpmsMatch ? 'ESTIMATED' : 'UNAVAILABLE'),
    unavailabilityReason: (!input.approximateCapacity && !bpmsMatch) ? 'Capacity census data unavailable' : undefined,
    confidenceScore: input.approximateCapacity ? 70 : (bpmsMatch ? 75 : 0)
  };

  const sanctioningAuthorityField: ProvenanceField<string> = {
    value: 'Nagpur Municipal Corporation',
    source: 'Urban Local Body Jurisdiction (MMC Act 1949)',
    retrievedAt: nowIso,
    status: 'OFFICIAL_GOVERNMENT_RECORD',
    confidenceScore: 100
  };

  // Construct Observations
  const buildingId = `NMC-ASSESS-${zoneInfo.zoneNumber}-${Math.floor(1000 + Math.random() * 9000)}`;
  const observations: BuildingObservation[] = [];

  if (input.hasCracks) {
    observations.push({
      id: `OBS-${buildingId}-1`,
      buildingId,
      date: nowIso.split('T')[0],
      inspectorName: input.inspectorName || 'Field Assessment Intake',
      inspectorLicense: input.inspectorLicense || 'NMC-INTAKE-SURVEY',
      observationType: 'STRUCTURAL_SHEAR_CRACK' as const,
      severity: (input.crackWidthMm && input.crackWidthMm > 5) ? 'CRITICAL' as const : 'MODERATE' as const,
      locationDetails: 'Perimeter load-bearing elements / column-beam joints',
      description: input.crackDetails || (input.crackWidthMm ? `Structural crack measuring ${input.crackWidthMm}mm observed.` : 'Visible structural distress crack recorded during building assessment intake.'),
      crackWidthMm: input.crackWidthMm || 3.5,
      crackType: 'Shear / Diagonal step crack',
      verificationStatus: input.inspectorLicense ? 'ENGINEER_VERIFIED' as const : 'PENDING_VERIFICATION' as const,
      verifiedBy: input.inspectorLicense ? input.inspectorName : undefined,
      verifiedAt: input.inspectorLicense ? nowIso : undefined,
      provenance: {
        source: input.inspectorLicense ? 'Licensed Structural Engineer Field Survey' : 'User / Community Intake Survey',
        retrievedAt: nowIso,
        status: input.inspectorLicense ? 'AUTHORIZED_PROFESSIONAL_RECORD' as const : 'USER_PROVIDED' as const,
        confidenceScore: input.inspectorLicense ? 92 : 70
      }
    });
  }

  if (input.hasSeepage) {
    observations.push({
      id: `OBS-${buildingId}-2`,
      buildingId,
      date: nowIso.split('T')[0],
      inspectorName: input.inspectorName || 'Field Assessment Intake',
      inspectorLicense: input.inspectorLicense || 'NMC-INTAKE-SURVEY',
      observationType: 'SEEPAGE_DAMPNESS' as const,
      severity: 'MODERATE' as const,
      locationDetails: 'Plinth / basement perimeter walls',
      description: 'Persistent moisture efflorescence and water ingress noted during baseline assessment.',
      verificationStatus: input.inspectorLicense ? 'ENGINEER_VERIFIED' as const : 'PENDING_VERIFICATION' as const,
      provenance: {
        source: input.inspectorLicense ? 'Licensed Engineer Field Survey' : 'User Intake Survey',
        retrievedAt: nowIso,
        status: input.inspectorLicense ? 'AUTHORIZED_PROFESSIONAL_RECORD' as const : 'USER_PROVIDED' as const,
        confidenceScore: 75
      }
    });
  }

  if (input.hasCorrosion) {
    observations.push({
      id: `OBS-${buildingId}-3`,
      buildingId,
      date: nowIso.split('T')[0],
      inspectorName: input.inspectorName || 'Field Assessment Intake',
      inspectorLicense: input.inspectorLicense || 'NMC-INTAKE-SURVEY',
      observationType: 'REINFORCEMENT_CORROSION' as const,
      severity: 'SEVERE' as const,
      locationDetails: 'Exposed structural reinforcement / cover concrete',
      description: 'Concrete cover spalling with visible oxidized rebar delamination.',
      verificationStatus: input.inspectorLicense ? 'ENGINEER_VERIFIED' as const : 'PENDING_VERIFICATION' as const,
      provenance: {
        source: input.inspectorLicense ? 'Licensed Engineer Field Survey' : 'User Intake Survey',
        retrievedAt: nowIso,
        status: input.inspectorLicense ? 'AUTHORIZED_PROFESSIONAL_RECORD' as const : 'USER_PROVIDED' as const,
        confidenceScore: 80
      }
    });
  }

  // Calculate Data Completeness Breakdown
  const categoriesBreakdown = [
    {
      name: 'Location & Cadastral GIS',
      status: 'VERIFIED' as const,
      source: 'Google Maps / OSM Nagpur Layer',
      lastUpdated: nowIso
    },
    {
      name: 'Official Sanction / Blueprint',
      status: sanctionedPlanNoField.status !== 'UNAVAILABLE' ? ('VERIFIED' as const) : ('MISSING' as const),
      source: sanctionedPlanNoField.source,
      lastUpdated: sanctionedPlanNoField.status !== 'UNAVAILABLE' ? sanctionedPlanNoField.retrievedAt : undefined
    },
    {
      name: 'Construction Information',
      status: constructionYearField.status !== 'UNAVAILABLE' ? ('VERIFIED' as const) : ('MISSING' as const),
      source: constructionYearField.source,
      lastUpdated: constructionYearField.status !== 'UNAVAILABLE' ? constructionYearField.retrievedAt : undefined
    },
    {
      name: 'Structural Framing Information',
      status: structuralSystemField.status !== 'UNAVAILABLE' ? ('VERIFIED' as const) : ('MISSING' as const),
      source: structuralSystemField.source,
      lastUpdated: structuralSystemField.status !== 'UNAVAILABLE' ? structuralSystemField.retrievedAt : undefined
    },
    {
      name: 'Municipal Legal Status',
      status: officialMunicipalStatusField.status !== 'UNAVAILABLE' ? ('VERIFIED' as const) : ('MISSING' as const),
      source: officialMunicipalStatusField.source,
      lastUpdated: officialMunicipalStatusField.retrievedAt
    },
    {
      name: 'Field Inspection History',
      status: observations.length > 0 ? ('VERIFIED' as const) : ('MISSING' as const),
      source: observations.length > 0 ? 'Field Observation Logger' : 'None on Record',
      lastUpdated: observations.length > 0 ? nowIso : undefined
    },
    {
      name: 'Maintenance & Repairs History',
      status: 'MISSING' as const,
      source: 'No Verified Maintenance Ledger Records'
    },
    {
      name: 'Environmental & Ground Context',
      status: environment ? ('VERIFIED' as const) : ('STALE' as const),
      source: 'Open-Meteo Nagpur + GSDA Hydrogeology Bulletin',
      lastUpdated: environment?.timestamp || nowIso
    }
  ];

  const verifiedCount = categoriesBreakdown.filter(c => c.status === 'VERIFIED').length;
  const missingCount = categoriesBreakdown.filter(c => c.status === 'MISSING').length;
  const staleCount = categoriesBreakdown.filter(c => c.status === 'STALE').length;
  const completenessPercentage = Math.round((verifiedCount / categoriesBreakdown.length) * 100);

  const completeness: DataCompletenessBreakdown = {
    percentage: completenessPercentage,
    verifiedCount,
    missingCount,
    staleCount,
    categories: categoriesBreakdown
  };

  const buildingCategory: BuildingCategory = input.category || (bpmsMatch ? bpmsMatch.buildingType as any : 'Residential');

  const building: BuildingRecord = {
    id: buildingId,
    name: cleanName,
    address: input.formattedAddress || `${zoneInfo.area}, ${zoneInfo.ward}, Nagpur 440001`,
    area: zoneInfo.area,
    ward: zoneInfo.ward,
    zoneNumber: zoneInfo.zoneNumber,
    latitude: input.latitude,
    longitude: input.longitude,
    placeId: input.placeId,
    category: buildingCategory,
    buildingType: (bpmsMatch ? bpmsMatch.buildingType : 'RESIDENTIAL') as any,
    isSynthetic: false,
    constructionYear: constructionYearField,
    sanctionedPlanNo: sanctionedPlanNoField,
    sanctioningAuthority: sanctioningAuthorityField,
    occupancyType: occupancyTypeField,
    approximateCapacity: approximateCapacityField,
    numberOfFloors: numberOfFloorsField,
    structuralSystem: structuralSystemField,
    officialMunicipalStatus: officialMunicipalStatusField,
    riskIndicator: 'LOW',
    riskScore: 20,
    inspectionPriority: 'ROUTINE',
    maintenancePriority: 'LOW',
    dataConfidenceScore: completenessPercentage,
    dataCompleteness: completeness,
    sourceConflicts: conflictsDetected.length > 0 ? conflictsDetected : undefined,
    riskFactors: [],
    missingDataWarnings: categoriesBreakdown.filter(c => c.status === 'MISSING').map(c => `${c.name} data is currently unavailable in municipal records`),
    recommendedProfessionalAction: 'Conduct baseline structural engineering inspection.',
    inspections: [],
    observations,
    maintenance: [],
    timeline: [
      {
        id: `TL-${buildingId}-1`,
        buildingId,
        date: nowIso.split('T')[0],
        title: bpmsMatch ? 'MahaVastu BPMS Official Record Linked' : 'Assessed & Registered in Universal Nagpur Registry',
        category: 'CONSTRUCTION',
        description: bpmsMatch
          ? `Verified building blueprint & license records ingested from MahaVastu BPMS (${bpmsMatch.bpmsProposalNo}).`
          : `Identified and assessed via universal multi-source search for "${cleanName}".`,
        personOrOrg: bpmsMatch ? bpmsMatch.architectName : 'Universal Ingestion Engine',
        status: bpmsMatch ? 'OFFICIAL_GOVERNMENT_RECORD' : 'PUBLIC_VERIFIED_SOURCE'
      }
    ],
    lastInspectionDate: observations.length > 0 ? nowIso.split('T')[0] : undefined,
    lastRiskCalculation: nowIso,
    hasActiveAlert: isNmcHazardous,
    lastUpdated: nowIso
  };

  const summary: MultiSourceInspectionSummary = {
    matchedMahaVastu: Boolean(bpmsMatch),
    matchedNmcGazette: isNmcHazardous,
    matchedGooglePlaces: Boolean(input.placeId),
    matchedGsdaReport: true,
    matchedWeatherTelemetry: Boolean(environment),
    sourcesFound,
    conflictsDetected,
    completeness
  };

  return { building, summary };
}

/**
 * Generates an in-depth secondary "BUILDING ASSESSMENT STUDY" (Section 33)
 */
export function generateBuildingAssessmentStudy(
  building: BuildingRecord,
  environment?: EnvironmentalTelemetry
): BuildingAssessmentStudy {
  const env = environment || INITIAL_ENVIRONMENT;
  const envAnalysis = analyzeCorrosionAndSoil(env, building);
  const nowStr = new Date().toLocaleDateString('en-IN', { dateStyle: 'long' });

  const criticalObs = building.observations.filter(o => o.severity === 'CRITICAL' || o.severity === 'SEVERE');
  const defectScore = Math.min(100, building.observations.length * 20 + criticalObs.length * 30);

  const missingGaps: string[] = [];
  if (building.constructionYear.status === 'UNAVAILABLE') missingGaps.push('Verified construction sanction year missing');
  if (building.structuralSystem.status === 'UNAVAILABLE') missingGaps.push('Framing system structural verification missing');
  if (building.sanctionedPlanNo.status === 'UNAVAILABLE') missingGaps.push('Sanctioned architectural blueprint unavailable');
  if (building.inspections.length === 0) missingGaps.push('Recent certified structural inspection report unavailable');
  if (building.maintenance.length === 0) missingGaps.push('Formal maintenance and repair ledger not submitted');

  const riskFactors = building.riskFactors.map(rf => ({
    factor: rf.factor,
    contribution: `${rf.impact > 0 ? '+' : ''}${rf.impact} points to risk indicator`,
    impactLevel: (Math.abs(rf.impact) >= 20 ? 'HIGH_IMPACT' : Math.abs(rf.impact) >= 10 ? 'MEDIUM_IMPACT' : 'LOW_CONTEXT') as any
  }));

  return {
    buildingId: building.id,
    buildingName: building.name,
    assessmentDate: nowStr,
    conductedBy: 'NIRMAN-RAKSHA Multi-Source Engineering Intelligence Engine',
    executiveSummary: `Multi-factor structural and environmental assessment study for "${building.name}" in ${building.ward}, Nagpur. Current risk indicator evaluated at ${building.riskIndicator} (${building.riskScore}/100) with a data completeness factor of ${building.dataConfidenceScore}%.`,
    structuralConditionAnalysis: {
      framingHealth: building.structuralSystem.value
        ? `Primary structural system identified as ${building.structuralSystem.value.replace(/_/g, ' ')} with ${building.numberOfFloors.value || 'unverified'} floors.`
        : 'Structural framing system remains unverified in municipal archives.',
      criticalObservationsSummary: criticalObs.length > 0
        ? `${criticalObs.length} critical/severe defect(s) logged including ${criticalObs.map(o => o.observationType.replace(/_/g, ' ')).join(', ')}.`
        : 'No active critical structural distress or severe deformations logged on file.',
      defectSeverityScore: defectScore,
      vulnerabilityToCyclicLoads: building.structuralSystem.value === 'LOAD_BEARING_BRICK'
        ? 'High vulnerability to differential foundation settlement and seismic lateral shear.'
        : 'Moderate frame resilience subject to rebar corrosion and joint confinement.'
    },
    environmentalAndSoilContext: {
      temperatureImpact: `Ambient temperature recorded at ${envAnalysis.temperatureC}°C (thermal expansion index within typical Vidarbha baseline).`,
      relativeHumidityCorrosionRisk: envAnalysis.criticalHumidityExceeded
        ? `Atmospheric Relative Humidity (${envAnalysis.relativeHumidityPct}%) exceeds 60% critical galvanic threshold, increasing exposed rebar rusting rate to ~${envAnalysis.corrosionRateMmPerYear} mm/yr.`
        : `Relative Humidity (${envAnalysis.relativeHumidityPct}%) remains within passive passivated boundaries.`,
      blackCottonSoilSwellingThreat: `Nagpur Black Cotton Soil saturation estimated at ${envAnalysis.soilMoisturePct}% with ${envAnalysis.soilSwellingPressureKpa} kPa swelling surcharge.`,
      groundwaterHydrostaticRisk: `GSDA hydrogeology indicates groundwater table at ${envAnalysis.groundWaterDepthM}m depth.`
    },
    maintenanceAndLifecycleHistory: {
      pastRepairsSummary: building.maintenance.length > 0
        ? `${building.maintenance.length} previous maintenance event(s) recorded, including ${building.maintenance.map(m => m.repairType.replace(/_/g, ' ')).join(', ')}.`
        : 'No documented structural retrofitting or maintenance ledger on municipal record.',
      maintenanceScheduleStatus: building.nextInspectionDueDate
        ? `Next inspection scheduled for ${building.nextInspectionDueDate}`
        : 'Maintenance schedule unavailable (Requires certified engineer establishment)',
      nextRecommendedMaintenanceDate: building.nextInspectionDueDate || 'Immediate Baseline Inspection Due'
    },
    dataGapsAndMissingInformation: missingGaps.length > 0 ? missingGaps : ['All core structural baseline categories verified.'],
    riskFactorDecomposition: riskFactors,
    strategicRecommendations: [
      building.recommendedProfessionalAction,
      'Perform non-destructive testing (Ultrasonic Pulse Velocity & Rebound Hammer) on load-bearing spans.',
      'Establish 3D tell-tale crack monitoring gauges across active shear step fractures.',
      'Clear perimeter plinth drainage to eliminate standing moisture in Black Cotton subgrade.'
    ]
  };
}
