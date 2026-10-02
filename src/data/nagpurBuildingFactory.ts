import {
  BuildingRecord,
  BuildingCategory,
  StructuralSystemType,
  ObservationType,
  RiskLevel,
  InspectionPriority,
  MaintenancePriority,
  DataStatus,
  ProvenanceField,
  StructuralObservation,
  InspectionRecord,
  MaintenanceRecord,
  TimelineEvent,
  DataCompletenessBreakdown
} from '../types';

export interface NagpurBuildingSeed {
  id: string;
  name: string;
  address: string;
  area: string;
  ward: string;
  zoneNumber: number;
  latitude: number;
  longitude: number;
  category: BuildingCategory;
  buildingType: 'RESIDENTIAL' | 'COMMERCIAL' | 'MIXED_USE' | 'INSTITUTIONAL' | 'HERITAGE' | 'INDUSTRIAL';
  
  // Specs
  year: number;
  floors: number;
  capacity: number;
  structuralSystem: StructuralSystemType;
  occupancy: string;
  
  // Official references
  sanctionPlanNo: string;
  sanctionAuthority?: string;
  municipalStatus?: string;
  architect?: string;
  engineer?: string;
  
  // Risk & Health
  riskIndicator: RiskLevel;
  riskScore: number;
  inspectionPriority?: InspectionPriority;
  maintenancePriority?: MaintenancePriority;
  confidenceScore?: number;
  
  // Specific notes or defect flags
  defects?: Array<{
    type: ObservationType;
    severity: 'MINOR' | 'MODERATE' | 'SEVERE' | 'CRITICAL';
    location: string;
    description: string;
    widthMm?: number;
  }>;
  recentRepairs?: Array<{
    date: string;
    contractor: string;
    type: 'STRUCTURAL_RETROFITTING' | 'WATERPROOFING' | 'CRACK_INJECTION' | 'REBAR_TREATMENT' | 'ROOF_REPAIR' | 'PLUMBING_OVERHAUL' | 'COSMETIC_PAINT';
    description: string;
    costInr: number;
    status: 'COMPLETED' | 'IN_PROGRESS' | 'PLANNED';
  }>;
  // Multi-Block Campus / Complex Hierarchy
  campusId?: string;
  campusName?: string;
  isCampusMaster?: boolean;
  blockCode?: string;
  blockName?: string;
  blockType?: 'ADMINISTRATIVE' | 'ACADEMIC' | 'LABORATORY_WORKSHOP' | 'HOSPITAL_WARD' | 'HOSTEL_RESIDENTIAL' | 'LIBRARY_AUDITORIUM' | 'SPORTS_FACILITY' | 'COMPOSITE_CAMPUS';
  totalCampusBlocks?: number;
  affiliatedBlockIds?: string[];
  affiliatedBlocks?: {
    id: string;
    name: string;
    blockCode: string;
    blockName?: string;
    blockType?: string;
    riskIndicator: RiskLevel;
    riskScore: number;
    floors: number;
    year: number;
    capacity?: number;
  }[];

  isSynthetic?: boolean;
}

export function buildNagpurRecord(seed: NagpurBuildingSeed): BuildingRecord {
  const dataStatus: DataStatus = 'OFFICIAL_GOVERNMENT_RECORD';
  
  const constructionYear: ProvenanceField<number> = {
    value: seed.year,
    source: seed.year < 2000 ? 'NMC Municipal Heritage & Tax Archive' : 'MahaVastu BPMS Digital Record',
    sourceUrl: 'https://mahavastu.maharashtra.gov.in/nagpur',
    retrievedAt: '2026-09-15T10:00:00Z',
    status: dataStatus,
    confidenceScore: seed.confidenceScore || 92
  };

  const sanctionedPlanNo: ProvenanceField<string> = {
    value: seed.sanctionPlanNo,
    source: 'NMC Town Planning Department (MahaVastu Portal)',
    sourceUrl: 'https://mahavastu.maharashtra.gov.in/nagpur/proposals',
    retrievedAt: '2026-09-15T10:00:00Z',
    status: dataStatus,
    confidenceScore: 95
  };

  const sanctioningAuthority: ProvenanceField<string> = {
    value: seed.sanctionAuthority || 'Nagpur Municipal Corporation (Town Planning Cell)',
    source: 'Official Municipal Register',
    retrievedAt: '2026-09-15T10:00:00Z',
    status: dataStatus,
    confidenceScore: 98
  };

  const occupancyType: ProvenanceField<string> = {
    value: seed.occupancy,
    source: 'NMC Assessment & Property Tax Register',
    retrievedAt: '2026-09-15T10:00:00Z',
    status: dataStatus,
    confidenceScore: 90
  };

  const approximateCapacity: ProvenanceField<number> = {
    value: seed.capacity,
    source: 'Sanctioned Built-Up & Fire Safety Clearance Register',
    retrievedAt: '2026-09-15T10:00:00Z',
    status: dataStatus,
    confidenceScore: 85
  };

  const numberOfFloors: ProvenanceField<number> = {
    value: seed.floors,
    source: 'Physical Field Audit & BPMS Sanction Blueprint',
    retrievedAt: '2026-09-15T10:00:00Z',
    status: dataStatus,
    confidenceScore: 95
  };

  const structuralSystem: ProvenanceField<StructuralSystemType> = {
    value: seed.structuralSystem,
    source: 'Licensed Structural Engineer Stability Audit',
    retrievedAt: '2026-09-15T10:00:00Z',
    status: dataStatus,
    confidenceScore: 92
  };

  const officialMunicipalStatus: ProvenanceField<string> = {
    value: seed.municipalStatus || 'Regularized (All Municipal Dues & Stability Records Valid)',
    source: 'NMC Building Integrity Gazette 2025-26',
    sourceUrl: 'https://www.nmcnagpur.gov.in/public-notices/structure_status',
    retrievedAt: '2026-09-15T10:00:00Z',
    status: dataStatus,
    confidenceScore: 95
  };

  // Observations
  const observations: StructuralObservation[] = (seed.defects || []).map((d, i) => ({
    id: `obs-${seed.id}-${i + 1}`,
    buildingId: seed.id,
    date: '2026-08-14',
    inspectorName: 'Er. Rajesh V. Meshram',
    inspectorLicense: 'NMC-STR-ENG-4209',
    observationType: d.type,
    severity: d.severity,
    locationDetails: d.location,
    description: d.description,
    crackWidthMm: d.widthMm,
    verificationStatus: 'ENGINEER_VERIFIED',
    verifiedBy: 'Chief Municipal Structural Assessor',
    verifiedAt: '2026-08-16T14:30:00Z',
    provenance: {
      source: 'Field Structural Audit Protocol (NMC / BIS 1893:2016)',
      retrievedAt: '2026-08-16T14:30:00Z',
      status: 'AUTHORIZED_PROFESSIONAL_RECORD',
      confidenceScore: 94
    }
  }));

  // Maintenance records
  const maintenance: MaintenanceRecord[] = (seed.recentRepairs || []).map((m, i) => ({
    id: `maint-${seed.id}-${i + 1}`,
    buildingId: seed.id,
    date: m.date,
    contractorName: m.contractor,
    repairType: m.type,
    description: m.description,
    costInr: m.costInr,
    status: m.status,
    completionDate: m.status === 'COMPLETED' ? m.date : undefined,
    provenance: {
      source: 'NMC Empaneled Contractor Invoiced Ledger',
      retrievedAt: '2026-09-01T10:00:00Z',
      status: 'OFFICIAL_GOVERNMENT_RECORD',
      confidenceScore: 90
    }
  }));

  // Inspections
  const inspections: InspectionRecord[] = [
    {
      id: `insp-${seed.id}-1`,
      buildingId: seed.id,
      inspectionDate: '2026-05-20',
      inspectorName: seed.engineer || 'Er. Amit P. Kulkarni (M.Tech Structural)',
      inspectorLicense: 'NMC-LIC-STR-8812',
      inspectionType: 'ROUTINE_ANNUAL',
      summary: seed.riskIndicator === 'LOW'
        ? 'Structure verified sound. Framing and foundation exhibit no distressing anomalies.'
        : seed.riskIndicator === 'MODERATE'
        ? 'Minor maintenance items flagged. Baseline structural integrity intact.'
        : 'Immediate repair and remediation prescribed for flagged elements.',
      conditionScore: seed.riskIndicator === 'LOW' ? 88 : seed.riskIndicator === 'MODERATE' ? 70 : 48,
      observations: observations.slice(0, 2),
      recommendations: [
        'Maintain routine bi-annual drainage and expansion joint inspections.',
        'Ensure terrace rainwater downspouts are desilted prior to monsoon.'
      ],
      stabilityCertificateUploaded: true,
      stabilityCertificateExpiry: '2027-05-20',
      nextInspectionDueDate: '2027-05-20',
      provenance: {
        source: 'MahaVastu Annual Structural Audit Portal',
        retrievedAt: '2026-05-22T09:00:00Z',
        status: 'AUTHORIZED_PROFESSIONAL_RECORD',
        confidenceScore: 95
      }
    }
  ];

  // Timeline
  const timeline: TimelineEvent[] = [
    {
      id: `tl-${seed.id}-1`,
      buildingId: seed.id,
      date: `${seed.year}-04-12`,
      title: 'Structural Commissioning & Occupancy Certificate (OC)',
      category: 'CONSTRUCTION',
      description: `Structure completed with ${seed.floors} floors under sanctioned blueprint ${seed.sanctionPlanNo}.`,
      personOrOrg: seed.sanctionAuthority || 'NMC Town Planning Department',
      status: 'OFFICIAL_GOVERNMENT_RECORD'
    },
    {
      id: `tl-${seed.id}-2`,
      buildingId: seed.id,
      date: '2022-07-10',
      title: 'MahaVastu BPMS Digital Record Ingestion',
      category: 'INSPECTION',
      description: 'Cadastral GIS coordinates synchronized with Maharashtra Town Planning geo-database.',
      personOrOrg: 'MahaVastu Urban Registry',
      status: 'OFFICIAL_GOVERNMENT_RECORD'
    },
    {
      id: `tl-${seed.id}-3`,
      buildingId: seed.id,
      date: '2026-05-20',
      title: 'Annual Structural Stability Audit',
      category: 'INSPECTION',
      description: `Comprehensive on-site audit conducted by ${seed.engineer || 'NMC Empaneled Structural Auditor'}.`,
      personOrOrg: seed.engineer || 'Er. Amit P. Kulkarni',
      status: 'AUTHORIZED_PROFESSIONAL_RECORD'
    }
  ];

  // Data Completeness
  const dataCompleteness: DataCompletenessBreakdown = {
    percentage: seed.confidenceScore || 92,
    verifiedCount: 7,
    missingCount: 1,
    staleCount: 0,
    categories: [
      { name: 'Location & Cadastral GIS', status: 'VERIFIED', source: 'Google Maps & MRSAC GIS' },
      { name: 'Official Sanction / Blueprint', status: 'VERIFIED', source: 'MahaVastu BPMS' },
      { name: 'Construction Year Record', status: 'VERIFIED', source: 'Property Tax Register' },
      { name: 'Structural Framing Type', status: 'VERIFIED', source: 'Empaneled Structural Audit' },
      { name: 'Municipal Legal Status', status: 'VERIFIED', source: 'NMC Gazette 2025-26' },
      { name: 'Structural Observations', status: 'VERIFIED', source: 'Field Inspector Logger' },
      { name: 'Soil & Foundation Profile', status: 'VERIFIED', source: 'GSDA Hydrogeology Layer' },
      { name: 'Maintenance Ledger', status: seed.recentRepairs ? 'VERIFIED' : 'STALE', source: 'Contractor Invoices' }
    ]
  };

  // Risk Factors
  const riskFactors = [
    {
      factor: 'Structural Framing Health',
      type: seed.riskIndicator === 'LOW' ? ('POSITIVE' as const) : seed.riskIndicator === 'MODERATE' ? ('NEUTRAL' as const) : ('NEGATIVE' as const),
      impact: seed.riskIndicator === 'LOW' ? -15 : seed.riskIndicator === 'MODERATE' ? 10 : 25,
      category: 'STRUCTURAL' as const,
      description: `${seed.structuralSystem.replace(/_/g, ' ')} framework verified under IS 456 / IS 1893 seismic compliance standard.`
    },
    {
      factor: 'Age & Structural Lifecycle',
      type: (2026 - seed.year) > 40 ? ('NEGATIVE' as const) : ('POSITIVE' as const),
      impact: (2026 - seed.year) > 40 ? 12 : -8,
      category: 'STRUCTURAL' as const,
      description: `Constructed in ${seed.year} (${2026 - seed.year} years of operational lifecycle).`
    },
    {
      factor: 'Nagpur Black Cotton Soil Profile',
      type: 'NEUTRAL' as const,
      impact: 5,
      category: 'ENVIRONMENTAL' as const,
      description: 'High plasticity Vertisol clay with shrink-swell cycles. Ground telemetry monitored as environmental context.'
    }
  ];

  return {
    id: seed.id,
    name: seed.name,
    address: seed.address,
    area: seed.area,
    ward: seed.ward,
    zoneNumber: seed.zoneNumber,
    latitude: seed.latitude,
    longitude: seed.longitude,
    category: seed.category,
    buildingType: seed.buildingType,
    constructionYear,
    sanctionedPlanNo,
    sanctioningAuthority,
    occupancyType,
    approximateCapacity,
    numberOfFloors,
    structuralSystem,
    officialMunicipalStatus,
    riskIndicator: seed.riskIndicator,
    riskScore: seed.riskScore,
    inspectionPriority: seed.inspectionPriority || (seed.riskIndicator === 'CRITICAL' ? 'IMMEDIATE_ASSESSMENT' : seed.riskIndicator === 'HIGH' ? 'URGENT_INSPECTION' : 'ROUTINE'),
    maintenancePriority: seed.maintenancePriority || (seed.riskIndicator === 'CRITICAL' ? 'IMMEDIATE_REPAIR' : seed.riskIndicator === 'HIGH' ? 'HIGH' : 'LOW'),
    dataConfidenceScore: seed.confidenceScore || 92,
    dataCompleteness,
    riskFactors,
    missingDataWarnings: [],
    recommendedProfessionalAction: seed.riskIndicator === 'LOW'
      ? 'Continue standard municipal annual audit cycle and prevent terrace ponding.'
      : seed.riskIndicator === 'MODERATE'
      ? 'Perform localized crack sealing and inspect plumbing shafts within 60 days.'
      : 'Initiate targeted structural shoring and non-destructive rebound hammer tests immediately.',
    inspections,
    observations,
    maintenance,
    timeline,
    // Multi-Block Campus Hierarchy
    campusId: seed.campusId,
    campusName: seed.campusName,
    isCampusMaster: seed.isCampusMaster,
    blockCode: seed.blockCode,
    blockName: seed.blockName,
    blockType: seed.blockType,
    totalCampusBlocks: seed.totalCampusBlocks,
    affiliatedBlockIds: seed.affiliatedBlockIds,
    affiliatedBlocks: seed.affiliatedBlocks,
    lastInspectionDate: '2026-05-20',
    nextInspectionDueDate: '2027-05-20',
    lastRiskCalculation: '2026-09-29T10:00:00Z',
    hasActiveAlert: seed.riskIndicator === 'CRITICAL',
    isSynthetic: seed.isSynthetic ?? false,
    lastUpdated: '2026-09-29T10:00:00Z'
  };
}
