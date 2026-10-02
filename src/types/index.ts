export type DataStatus =
  | 'OFFICIAL_GOVERNMENT_RECORD'
  | 'OFFICIAL_SOURCE'
  | 'AUTHORIZED_PROFESSIONAL_RECORD'
  | 'ENGINEER_VERIFIED'
  | 'AUTHORITY_VERIFIED'
  | 'PUBLIC_VERIFIED_SOURCE'
  | 'PUBLIC_SOURCE'
  | 'USER_PROVIDED'
  | 'ESTIMATED'
  | 'SYNTHETIC_DEMO'
  | 'UNAVAILABLE'
  | 'SOURCE_CONFLICT';

export type RiskLevel =
  | 'LOW'
  | 'MODERATE'
  | 'HIGH'
  | 'CRITICAL'
  | 'INSUFFICIENT_DATA';

export type InspectionPriority =
  | 'ROUTINE'
  | 'MONITOR_NEXT_CYCLE'
  | 'URGENT_INSPECTION'
  | 'IMMEDIATE_ASSESSMENT';

export type MaintenancePriority =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'IMMEDIATE_REPAIR';

export type UserRole =
  | 'CITIZEN'
  | 'ENGINEER'
  | 'INSPECTOR'
  | 'AUTHORITY'
  | 'ADMIN';

export type AlertSeverity =
  | 'LOW'
  | 'MODERATE'
  | 'HIGH'
  | 'CRITICAL';

export type AlertType =
  | 'MONITOR'
  | 'INSPECTION_REQUIRED'
  | 'RESTRICT_ACCESS'
  | 'EVACUATION_RECOMMENDED'
  | 'EMERGENCY_EVACUATION';

export type AlertStatus =
  | 'DRAFT'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'PUBLISHED'
  | 'ACTIVE'
  | 'RESOLVED'
  | 'EXPIRED';

export type BuildingCategory =
  | 'Educational'
  | 'Healthcare'
  | 'Residential'
  | 'Hostel / PG'
  | 'Commercial'
  | 'Shopping Mall'
  | 'Banking / Financial'
  | 'Government'
  | 'Court / Legal'
  | 'Industrial'
  | 'Public Infrastructure'
  | 'Examination Centre'
  | 'Religious'
  | 'Mixed Use'
  | 'Other';

export interface ProvenanceField<T> {
  value: T | null;
  source: string;
  sourceUrl?: string;
  retrievedAt: string; // ISO format
  status: DataStatus;
  confidenceScore: number; // 0 - 100
  unavailabilityReason?: string;
  notes?: string;
  alternateValue?: T | null;
  alternateSource?: string;
}

export type StructuralSystemType =
  | 'RCC_FRAME'
  | 'LOAD_BEARING_BRICK'
  | 'COMPOSITE_STEEL_RCC'
  | 'TRADITIONAL_WOOD_MASONRY'
  | 'PRECAST_CONCRETE'
  | 'UNVERIFIED';

export type ObservationType =
  | 'HAIRLINE_CRACK'
  | 'STRUCTURAL_SHEAR_CRACK'
  | 'DIAGONAL_MASONRY_CRACK'
  | 'BEAM_COLUMN_JUNCTION_CRACK'
  | 'CONCRETE_SPALLING'
  | 'REINFORCEMENT_CORROSION'
  | 'FOUNDATION_SETTLEMENT'
  | 'BEAM_SLAB_DEFLECTION'
  | 'SEEPAGE_DAMPNESS'
  | 'ROOF_WATER_PONDING'
  | 'VEGETATION_GROWTH'
  | 'UNAUTHORIZED_STRUCTURAL_MODIFICATION'
  | 'UNAPPROVED_ADDITIONAL_FLOOR'
  | 'STRUCTURAL_DEFORMATION'
  | 'OTHER_DEFECT';

export interface StructuralObservation {
  id: string;
  buildingId: string;
  date: string;
  inspectorName: string;
  inspectorLicense: string;
  observationType: ObservationType;
  severity: 'MINOR' | 'MODERATE' | 'SEVERE' | 'CRITICAL';
  locationDetails: string;
  description: string;
  crackWidthMm?: number;
  crackType?: string;
  imageUrl?: string;
  verificationStatus: 'PENDING_VERIFICATION' | 'ENGINEER_VERIFIED' | 'AUTHORITY_APPROVED' | 'REJECTED';
  verifiedBy?: string;
  verifiedAt?: string;
  provenance: {
    source: string;
    sourceUrl?: string;
    retrievedAt: string;
    status: DataStatus;
    confidenceScore: number;
  };
}

export type BuildingObservation = StructuralObservation;

export interface InspectionRecord {
  id: string;
  buildingId: string;
  inspectionDate: string;
  inspectorName: string;
  inspectorLicense: string;
  inspectionType: 'ROUTINE_ANNUAL' | 'POST_MONSOON' | 'CITIZEN_COMPLAINT_TRIGGERED' | 'AUTHORITY_ORDERED' | 'STRUCTURAL_AUDIT';
  summary: string;
  conditionScore: number; // 0 - 100 where 100 is pristine
  observations: StructuralObservation[];
  recommendations: string[];
  stabilityCertificateUploaded: boolean;
  stabilityCertificateExpiry?: string;
  nextInspectionDueDate: string;
  provenance: {
    source: string;
    sourceUrl?: string;
    retrievedAt: string;
    status: DataStatus;
    confidenceScore: number;
  };
}

export interface MaintenanceRecord {
  id: string;
  buildingId: string;
  date: string;
  contractorName: string;
  repairType: 'STRUCTURAL_RETROFITTING' | 'WATERPROOFING' | 'CRACK_INJECTION' | 'REBAR_TREATMENT' | 'ROOF_REPAIR' | 'PLUMBING_OVERHAUL' | 'COSMETIC_PAINT';
  problemDescription?: string;
  description: string;
  actionTaken?: string;
  costInr?: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PLANNED' | 'DELAYED';
  completionDate?: string;
  verificationDocument?: string;
  nextInspectionDue?: string;
  provenance: {
    source: string;
    sourceUrl?: string;
    retrievedAt: string;
    status: DataStatus;
    confidenceScore: number;
  };
}

export interface TimelineEvent {
  id: string;
  buildingId: string;
  date: string;
  title: string;
  category: 'CONSTRUCTION' | 'INSPECTION' | 'MAINTENANCE' | 'OBSERVATION' | 'NOTICE' | 'ALERT' | 'RISK_CHANGE' | 'AUTHORITY_ACTION';
  description: string;
  personOrOrg: string;
  evidenceUrl?: string;
  status: DataStatus;
}

export interface SourceConflict {
  field: string;
  sourceA: string;
  valueA: string;
  sourceB: string;
  valueB: string;
  resolutionNotes?: string;
}

export interface DataCompletenessBreakdown {
  percentage: number;
  verifiedCount: number;
  missingCount: number;
  staleCount: number;
  categories: {
    name: string;
    status: 'VERIFIED' | 'MISSING' | 'STALE';
    source: string;
    lastUpdated?: string;
  }[];
}

export interface BuildingRecord {
  id: string;
  name: string;
  address: string;
  area: string;
  ward: string; // NMC Zone 1 - 10
  zoneNumber: number;
  latitude: number;
  longitude: number;
  placeId?: string; // Google Maps / Places ID where available
  category: BuildingCategory;
  buildingType: 'RESIDENTIAL' | 'COMMERCIAL' | 'MIXED_USE' | 'INSTITUTIONAL' | 'HERITAGE' | 'INDUSTRIAL';
  
  // Provenance-wrapped core fields
  constructionYear: ProvenanceField<number>;
  sanctionedPlanNo: ProvenanceField<string>;
  sanctioningAuthority: ProvenanceField<string>;
  occupancyType: ProvenanceField<string>;
  approximateCapacity: ProvenanceField<number>;
  numberOfFloors: ProvenanceField<number>;
  structuralSystem: ProvenanceField<StructuralSystemType>;
  officialMunicipalStatus: ProvenanceField<string>; // e.g. "Declared Dilapidated (NMC Section 264)", "Notice Issued (Section 265)", "Regularized", "Under Structural Audit"
  
  // Dynamic indicator fields calculated by Risk Engine
  riskIndicator: RiskLevel;
  riskScore: number; // 0 - 100
  inspectionPriority: InspectionPriority;
  maintenancePriority: MaintenancePriority;
  dataConfidenceScore: number; // 0 - 100%
  dataCompleteness: DataCompletenessBreakdown;
  sourceConflicts?: SourceConflict[];
  
  // Risk Explanation breakdown
  riskFactors: {
    factor: string;
    type: 'NEGATIVE' | 'POSITIVE' | 'NEUTRAL';
    impact: number; // points
    category: 'STRUCTURAL' | 'MAINTENANCE' | 'ENVIRONMENTAL' | 'INSPECTION' | 'MUNICIPAL';
    description: string;
  }[];
  missingDataWarnings: string[];
  recommendedProfessionalAction: string;
  
  // Collections
  inspections: InspectionRecord[];
  observations: StructuralObservation[];
  maintenance: MaintenanceRecord[];
  timeline: TimelineEvent[];
  
  // Multi-Block Campus / Complex Hierarchy
  campusId?: string;
  campusName?: string;
  isCampusMaster?: boolean;
  blockCode?: string; // e.g. "BLOCK_A", "BLOCK_B", "BLOCK_C", "OPD_WING", "TRAUMA_CARE"
  blockName?: string; // e.g. "Block A (Administrative & Applied Sciences)", "Block B (CSE & IT Complex)"
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

  // Lifecycle & Demolition Metadata
  designLifeYears?: number; // e.g. 50, 60 or 75 years
  isCondemned?: boolean; // Section 264 Condemned Structure
  demolitionOrder?: DemolitionDecision;
  activeNoticesCount?: number;

  // State metadata
  lastInspectionDate?: string;
  nextInspectionDueDate?: string;
  lastRiskCalculation: string;
  hasActiveAlert: boolean;
  activeAlertId?: string;
  isSynthetic: boolean; // Must be labeled "SYNTHETIC DEMO DATA" if true
  lastUpdated: string;
}

export interface SafetyAlert {
  id: string;
  buildingId: string;
  buildingName: string;
  ward: string;
  area: string;
  latitude: number;
  longitude: number;
  alertType: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  geoRadiusMeters: number; // Default 1000m (2 km diameter) or adjustable
  reasonForAlert: string;
  officialInstructions: string;
  emergencyContact: string;
  verificationOfficer: string;
  officerDesignation: string;
  verificationDate: string;
  evidenceDocumentUrl?: string;
  authorityApprovalBadge: string;
  publishedAt?: string;
  resolvedAt?: string;
  resolutionReason?: string;
  broadcastSimulation: {
    inAppDelivered: boolean;
    smsSimulated: boolean;
    webPushSimulated: boolean;
    recipientsCount: number;
    deliveryTimestamp: string;
    providerNote?: string;
  };
  auditTrail: {
    timestamp: string;
    action: string;
    performedBy: string;
    role: UserRole;
    notes?: string;
  }[];
}

export interface EnvironmentalTelemetry {
  timestamp: string;
  city: 'Nagpur';
  coordinates: { lat: number; lng: number };
  temperatureC: number;
  relativeHumidityPct: number;
  precipitation24hMm: number;
  precipitation7dMm: number;
  windSpeedKmh: number;
  airQualityIndex: number;
  aqiCategory: 'GOOD' | 'MODERATE' | 'POOR' | 'VERY_POOR' | 'SEVERE';
  soilMoisturePct: number;
  groundWaterDepthM: number;
  extremeWeatherWarning?: string;
  sourceName: string;
  sourceUrl: string;
  isLive: boolean;
  retrievedAt: string;
}

export interface DataSourceConnector {
  id: string;
  name: string;
  organization: string;
  dataType: 'OFFICIAL_BPMS_PORTAL' | 'LIVE_REST_API' | 'OFFICIAL_MUNICIPAL_REGISTER' | 'GOVERNMENT_GIS_PORTAL' | 'FIELD_INSPECTION_REPORTS' | 'GROUNDWATER_SURVEY_REPORT' | 'GOOGLE_MAPS_PLACES';
  endpointOrReference: string;
  connectionStatus: 'LIVE' | 'CONNECTED' | 'UNAVAILABLE' | 'CREDENTIALS_REQUIRED' | 'STATIC_OFFICIAL_RECORD';
  lastFetchedAt: string;
  nextScheduledRefresh: string;
  refreshFrequency: string;
  recordCount: number;
  fieldsProvided: string[];
  reliabilityVerification: string;
  latencyMs?: number;
  errorMessage?: string;
  rawPayloadSnippet?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userRole: UserRole;
  userName: string;
  action: string;
  targetResource: string;
  details: string;
}

export interface NMCZoneInfo {
  zoneNumber: number;
  name: string;
  officeAddress: string;
  assistantCommissioner: string;
  controlRoomPhone: string;
  wardCount: number;
  totalTrackedBuildings: number;
}

export interface BuildingAssessmentStudy {
  buildingId: string;
  buildingName: string;
  assessmentDate: string;
  conductedBy: string;
  executiveSummary: string;
  structuralConditionAnalysis: {
    framingHealth: string;
    criticalObservationsSummary: string;
    defectSeverityScore: number;
    vulnerabilityToCyclicLoads: string;
  };
  environmentalAndSoilContext: {
    temperatureImpact: string;
    relativeHumidityCorrosionRisk: string;
    blackCottonSoilSwellingThreat: string;
    groundwaterHydrostaticRisk: string;
  };
  maintenanceAndLifecycleHistory: {
    pastRepairsSummary: string;
    maintenanceScheduleStatus: string;
    nextRecommendedMaintenanceDate: string;
  };
  dataGapsAndMissingInformation: string[];
  riskFactorDecomposition: {
    factor: string;
    contribution: string;
    impactLevel: 'HIGH_IMPACT' | 'MEDIUM_IMPACT' | 'LOW_CONTEXT';
  }[];
  strategicRecommendations: string[];
}

export type NoticePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type NoticeType =
  | 'STRUCTURAL_AUDIT_MANDATE'
  | 'CRACK_RETROFITTING_ORDER'
  | 'MONSOON_WATERPROOFING_DIRECTIVE'
  | 'FOUNDATION_STABILIZATION'
  | 'REBAR_CORROSION_TREATMENT'
  | 'UTILITY_SAFETY_AUDIT'
  | 'UNAUTHORIZED_CONSTRUCTION_REMOVAL'
  | 'DEMOLITION_PREPARATION_DIRECTIVE';

export type NoticeStatus =
  | 'PENDING_ACTION'
  | 'IN_COMPLIANCE'
  | 'COMPLIED'
  | 'OVERDUE'
  | 'ESCALATED_TO_DEMOLITION';

export interface MaintenanceNotice {
  id: string;
  buildingId: string;
  buildingName: string;
  ward: string;
  zoneNumber: number;
  noticeType: NoticeType;
  priority: NoticePriority;
  issuingAuthority: string;
  issuingOfficer: string;
  officerDesignation: string;
  issuedDate: string;
  complianceDeadline: string;
  statutoryReference: string; // e.g. "Maharashtra Municipal Corporation Act Section 265 / IS 456-2000"
  description: string;
  mandatoryActions: string[];
  status: NoticeStatus;
  recipientRole: 'CITIZEN' | 'OWNER' | 'ENGINEER' | 'ALL';
  createdAt: string;
  isRead?: boolean;
}

export type DemolitionMethod =
  | 'CONTROLLED_MECHANICAL_IMPLOSION'
  | 'HIGH_REACH_EXCAVATOR_DISMANTLING'
  | 'MANUAL_DECONSTRUCTION_TOP_DOWN'
  | 'ROBOTIC_HYDRODEMOLITION';

export type DemolitionStatus =
  | 'ORDER_ISSUED'
  | 'EVACUATION_IN_PROGRESS'
  | 'CORDON_SECURED'
  | 'DEMOLITION_SCHEDULED'
  | 'DEMOLISHED';

export interface DemolitionDecision {
  id: string;
  orderNumber: string; // e.g. "NMC/T&CP/SEC264/C1/2026/089"
  buildingId: string;
  buildingName: string;
  ward: string;
  zoneNumber: number;
  buildingAgeYears: number;
  designLifeYears: number;
  structuralConditionScore: number; // 0 - 100
  isRepairable: boolean; // false
  repairToReplacementCostRatio: number; // percentage, e.g. 84% (>70% triggers unviable retrofit)
  estimatedRetrofitCostInr?: number;
  estimatedReconstructionCostInr?: number;
  primaryFailureMechanisms: string[];
  condemnationCategory: 'C_1_IMMEDIATE_DEMOLITION' | 'C_2A_STRUCTURAL_EVACUATION';
  statutoryReference: string; // "Maharashtra Municipal Corporation (MMC) Act Section 264"
  decisionDate: string;
  evacuationDeadline: string;
  demolitionExecutionDate: string;
  demolitionMethod: DemolitionMethod;
  contractorAssigned: string;
  safetyPerimeterRadiusMeters: number; // default 500m - 2000m
  utilityCutoffChecklist: {
    powerDisconnected: boolean;
    waterDisconnected: boolean;
    gasPurged: boolean;
    telecomRerouted: boolean;
  };
  rehabilitationCampLocation: string;
  authorizingCommissioner: string;
  chiefStructuralEngineer: string;
  status: DemolitionStatus;
  createdAt: string;
  officialGazetteUrl?: string;
  notes?: string;
}

