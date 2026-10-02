import {
  BuildingRecord,
  SafetyAlert,
  DataSourceConnector,
  EnvironmentalTelemetry,
  NMCZoneInfo,
  AuditLogEntry,
  MaintenanceNotice,
  DemolitionDecision
} from '../types';
import { NAGPUR_MEGA_BUILDINGS } from './nagpurMegaDataset';

export const NAGPUR_ZONES: NMCZoneInfo[] = [
  { zoneNumber: 1, name: 'Laxmi Nagar', officeAddress: 'NMC Zone 1 Office, Near Water Tank, Laxmi Nagar', assistantCommissioner: 'Shri R. P. Kapse', controlRoomPhone: '0712-2567031', wardCount: 12, totalTrackedBuildings: 320 },
  { zoneNumber: 2, name: 'Dharampeth', officeAddress: 'NMC Zone 2 Office, WHC Road, Dharampeth', assistantCommissioner: 'Smt. P. M. Joshi', controlRoomPhone: '0712-2567032', wardCount: 14, totalTrackedBuildings: 410 },
  { zoneNumber: 3, name: 'Hanuman Nagar', officeAddress: 'NMC Zone 3 Office, Medical Square, Hanuman Nagar', assistantCommissioner: 'Shri S. V. Patil', controlRoomPhone: '0712-2567033', wardCount: 15, totalTrackedBuildings: 280 },
  { zoneNumber: 4, name: 'Dhantoli', officeAddress: 'NMC Zone 4 Office, Near Yashwant Stadium, Dhantoli', assistantCommissioner: 'Shri A. N. Deshmukh', controlRoomPhone: '0712-2567034', wardCount: 13, totalTrackedBuildings: 340 },
  { zoneNumber: 5, name: 'Nehru Nagar', officeAddress: 'NMC Zone 5 Office, Nandanvan Road, Nehru Nagar', assistantCommissioner: 'Smt. V. K. Sharma', controlRoomPhone: '0712-2567035', wardCount: 14, totalTrackedBuildings: 290 },
  { zoneNumber: 6, name: 'Gandhibagh', officeAddress: 'NMC Zone 6 Office, Mahal Road, Gandhibagh', assistantCommissioner: 'Shri M. K. Bhende', controlRoomPhone: '0712-2567036', wardCount: 16, totalTrackedBuildings: 480 },
  { zoneNumber: 7, name: 'Satranjipura', officeAddress: 'NMC Zone 7 Office, Itwari Road, Satranjipura', assistantCommissioner: 'Shri D. R. Raut', controlRoomPhone: '0712-2567037', wardCount: 15, totalTrackedBuildings: 520 },
  { zoneNumber: 8, name: 'Lakadganj', officeAddress: 'NMC Zone 8 Office, CA Road, Lakadganj', assistantCommissioner: 'Smt. S. T. Wankhede', controlRoomPhone: '0712-2567038', wardCount: 14, totalTrackedBuildings: 390 },
  { zoneNumber: 9, name: 'Ashi Nagar', officeAddress: 'NMC Zone 9 Office, Kamptee Road, Ashi Nagar', assistantCommissioner: 'Shri K. G. Meshram', controlRoomPhone: '0712-2567039', wardCount: 16, totalTrackedBuildings: 310 },
  { zoneNumber: 10, name: 'Mangalwari', officeAddress: 'NMC Zone 10 Office, Sadar Bazar, Mangalwari', assistantCommissioner: 'Shri P. B. Gedam', controlRoomPhone: '0712-2567040', wardCount: 13, totalTrackedBuildings: 360 },
];

export const INITIAL_DATA_SOURCES: DataSourceConnector[] = [
  {
    id: 'src-google-maps-places',
    name: 'Google Maps & Places Geocoding Engine',
    organization: 'Google Maps Platform / Nagpur Municipal Spatial Layer',
    dataType: 'GOOGLE_MAPS_PLACES',
    endpointOrReference: 'https://maps.googleapis.com/maps/api/place',
    connectionStatus: 'CONNECTED',
    lastFetchedAt: '2026-09-29T10:00:00.000Z',
    nextScheduledRefresh: 'Continuous On-Demand Geocoding',
    refreshFrequency: 'Real-time query execution',
    recordCount: 150000,
    fieldsProvided: ['Exact Geolocation (Lat/Lng)', 'Place ID', 'Formatted Street Address', 'Landmark & Category Metadata'],
    reliabilityVerification: 'PUBLIC_VERIFIED_SOURCE',
    latencyMs: 95
  },
  {
    id: 'src-mahavastu-bpms',
    name: 'MahaVastu — Building Plan Management System (BPMS)',
    organization: 'Urban Development Department, Govt of Maharashtra / NMC Town Planning',
    dataType: 'OFFICIAL_BPMS_PORTAL',
    endpointOrReference: 'https://mahavastu.maharashtra.gov.in/',
    connectionStatus: 'CONNECTED',
    lastFetchedAt: '2026-09-29T10:15:00.000Z',
    nextScheduledRefresh: '2026-09-29T14:15:00.000Z',
    refreshFrequency: 'Continuous sanction schedule sync',
    recordCount: 8420,
    fieldsProvided: [
      'Sanctioned Plan / Proposal No',
      'COA Licensed Architect Details',
      'NMC Empaneled Structural Engineer License',
      'Sanctioned Built-Up Area & Height',
      'Occupancy Certificate (OC) Status',
      'Soil Investigation Safe Bearing Capacity (SBC)'
    ],
    reliabilityVerification: 'OFFICIAL_GOVERNMENT_RECORD',
    latencyMs: 82,
    rawPayloadSnippet: '{"portal":"https://mahavastu.maharashtra.gov.in","jurisdiction":"Nagpur Municipal Corporation (NMC)","system":"BPAS/BPMS v2.4","status":"ACTIVE_SYNCHRONIZED"}'
  },
  {
    id: 'src-open-meteo-nagpur',
    name: 'Open-Meteo Nagpur Live Weather & Atmospheric Feed',
    organization: 'Open-Meteo / WMO Global Telecommunication System',
    dataType: 'LIVE_REST_API',
    endpointOrReference: 'https://api.open-meteo.com/v1/forecast?latitude=21.1458&longitude=79.0882&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&hourly=soil_moisture_0_to_1cm',
    connectionStatus: 'LIVE',
    lastFetchedAt: '2026-09-29T09:45:00.000Z',
    nextScheduledRefresh: '2026-09-29T10:45:00.000Z',
    refreshFrequency: 'Hourly automated poll',
    recordCount: 144,
    fieldsProvided: ['Temperature (°C)', 'Relative Humidity (%)', 'Precipitation 24h (mm)', 'Wind Speed (km/h)', 'Soil Saturation Index'],
    reliabilityVerification: 'PUBLIC_VERIFIED_SOURCE',
    latencyMs: 142,
    rawPayloadSnippet: '{"latitude":21.1458,"longitude":79.0882,"current":{"temperature_2m":31.4,"relative_humidity_2m":64,"precipitation":0.0}}'
  },
  {
    id: 'src-nmc-dangerous-register',
    name: 'NMC Dangerous & Dilapidated Buildings Gazette (Section 264/265/268)',
    organization: 'Nagpur Municipal Corporation (Town Planning & Encroachment Cell)',
    dataType: 'OFFICIAL_MUNICIPAL_REGISTER',
    endpointOrReference: 'https://www.nmcnagpur.gov.in/public-notices/hazardous-buildings-2025-26.pdf',
    connectionStatus: 'STATIC_OFFICIAL_RECORD',
    lastFetchedAt: '2026-09-15T11:30:00.000Z',
    nextScheduledRefresh: '2026-10-15T11:30:00.000Z',
    refreshFrequency: 'Monthly municipal gazette synchronization',
    recordCount: 184,
    fieldsProvided: ['Building Name/Survey No', 'NMC Zone/Ward', 'Owner/Occupant Record', 'Statutory Classification (C1/C2A/C2B/C3)', 'Notice Date'],
    reliabilityVerification: 'OFFICIAL_GOVERNMENT_RECORD',
    latencyMs: 38
  },
  {
    id: 'src-mrsac-gis-nagpur',
    name: 'MRSAC Maharashtra Geospatial Cadastral Layer',
    organization: 'Maharashtra Remote Sensing Application Centre (VNIT Campus, Nagpur)',
    dataType: 'GOVERNMENT_GIS_PORTAL',
    endpointOrReference: 'https://mrsac.gov.in/geoportal/nagpur_urban_settlement_v2',
    connectionStatus: 'STATIC_OFFICIAL_RECORD',
    lastFetchedAt: '2026-08-01T08:00:00.000Z',
    nextScheduledRefresh: '2026-11-01T08:00:00.000Z',
    refreshFrequency: 'Quarterly satellite spatial synchronization',
    recordCount: 52400,
    fieldsProvided: ['Cadastral Polygon Boundaries', 'Digital Elevation Model (DEM)', 'Geological Fault Lines', 'Basalt Hard-Stratum Depth'],
    reliabilityVerification: 'OFFICIAL_GOVERNMENT_RECORD',
    latencyMs: 110
  },
  {
    id: 'src-gsda-nagpur-groundwater',
    name: 'GSDA Hydrogeological Observation Well Network',
    organization: 'Groundwater Surveys and Development Agency (Govt of Maharashtra, Nagpur)',
    dataType: 'GOVERNMENT_GIS_PORTAL',
    endpointOrReference: 'https://gsda.maharashtra.gov.in/nagpur_piezometers',
    connectionStatus: 'CONNECTED',
    lastFetchedAt: '2026-09-01T10:00:00.000Z',
    nextScheduledRefresh: '2026-10-01T10:00:00.000Z',
    refreshFrequency: 'Monthly piezometric water table logging',
    recordCount: 86,
    fieldsProvided: ['Groundwater Level (m below ground level)', 'Seasonal Fluctuation (m)', 'Soil Clay Mineralogy Index', 'Foundation Moisture Stress'],
    reliabilityVerification: 'OFFICIAL_GOVERNMENT_RECORD',
    latencyMs: 65
  }
];

export const INITIAL_ENVIRONMENT: EnvironmentalTelemetry = {
  timestamp: '2026-09-29T09:45:00.000Z',
  city: 'Nagpur',
  coordinates: { lat: 21.1458, lng: 79.0882 },
  temperatureC: 31.4,
  relativeHumidityPct: 64,
  precipitation24hMm: 0.0,
  precipitation7dMm: 12.4,
  windSpeedKmh: 14.2,
  airQualityIndex: 82,
  aqiCategory: 'MODERATE',
  soilMoisturePct: 38,
  groundWaterDepthM: 6.8,
  extremeWeatherWarning: undefined,
  sourceName: 'Open-Meteo Nagpur Live Meteorological API',
  sourceUrl: 'https://open-meteo.com',
  isLive: true,
  retrievedAt: '2026-09-29T09:45:00.000Z'
};

export const INITIAL_BUILDINGS: BuildingRecord[] = NAGPUR_MEGA_BUILDINGS;

export const INITIAL_ALERTS: SafetyAlert[] = [
  {
    id: 'ALERT-NMC-2026-01',
    buildingId: 'NMC-OFF-DHA-102',
    buildingName: 'Old Civil Lines Municipal Staff Quarters (Block 8)',
    ward: 'Zone 2 - Dharampeth',
    area: 'Civil Lines, Near RBI Square',
    latitude: 21.1518,
    longitude: 79.0763,
    alertType: 'RESTRICT_ACCESS',
    severity: 'CRITICAL',
    status: 'RESOLVED',
    geoRadiusMeters: 1000, // 2 km diameter default broadcast area
    reasonForAlert: 'Official Municipal Notice (Category C1 Dilapidated Structure). Severe roof slab collapse in east wing and progressive masonry disintegration.',
    officialInstructions: 'Authorities have verified a structural safety concern in this area. Avoid the affected/restricted zone (2 km diameter broadcast corridor) and follow official NMC Disaster Management directives.',
    emergencyContact: 'NMC Disaster Management Cell: 0712-2567035 / Control Room: 101',
    verificationOfficer: 'Shri Manoj S. Talware, Municipal Executive Engineer',
    officerDesignation: 'Executive Engineer (Town Planning & Hazardous Buildings Cell), NMC',
    verificationDate: '2026-09-20',
    authorityApprovalBadge: 'NMC-AUTH-SEAL-2026/DH-410',
    publishedAt: '2026-09-20T14:30:00Z',
    broadcastSimulation: {
      inAppDelivered: true,
      smsSimulated: false,
      webPushSimulated: false,
      recipientsCount: 420,
      deliveryTimestamp: '2026-09-20T14:35:00Z',
      providerNote: 'In-app notification active. SMS/Email gateway simulation provider not configured.'
    },
    auditTrail: [
      {
        timestamp: '2026-09-20T11:00:00Z',
        action: 'ALERT_DRAFTED',
        performedBy: 'Er. Rajesh Deshmukh',
        role: 'ENGINEER',
        notes: 'Submitted post-collapse inspection report recommending cordon.'
      },
      {
        timestamp: '2026-09-20T14:00:00Z',
        action: 'AUTHORITY_VERIFIED',
        performedBy: 'Shri Manoj S. Talware',
        role: 'AUTHORITY',
        notes: 'Verified field conditions against NMC Sec 264 order.'
      },
      {
        timestamp: '2026-09-20T14:30:00Z',
        action: 'ALERT_PUBLISHED',
        performedBy: 'Shri Manoj S. Talware',
        role: 'AUTHORITY',
        notes: 'Emergency broadcast triggered for 2 km diameter cordon region.'
      }
    ]
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'LOG-001',
    timestamp: '2026-09-29T09:45:00.000Z',
    userRole: 'ADMIN',
    userName: 'System Administrator (NMC Central Server)',
    action: 'LIVE_DATA_REFRESH',
    targetResource: 'Open-Meteo Nagpur Live API',
    details: 'Polled live weather telemetry for Nagpur (21.1458° N, 79.0882° E). Latency: 142ms. 144 data points cached.'
  },
  {
    id: 'LOG-002',
    timestamp: '2026-09-28T16:20:00.000Z',
    userRole: 'AUTHORITY',
    userName: 'Shri Manoj S. Talware (Executive Engineer, NMC)',
    action: 'ALERT_PUBLISH',
    targetResource: 'ALERT-NMC-2026-01',
    details: 'Published RESTRICT_ACCESS safety alert for Old Civil Lines Staff Quarters (Block 8).'
  },
  {
    id: 'LOG-003',
    timestamp: '2026-09-28T11:15:00.000Z',
    userRole: 'ENGINEER',
    userName: 'Er. Rajesh S. Deshmukh (NMC-STR-LIC-4482)',
    action: 'INSPECTION_SUBMITTED',
    targetResource: 'NMC-SAT-2026-089',
    details: 'Logged structural observation on Itwari Cotton Ginning Mill Block C.'
  }
];

export const INITIAL_MAINTENANCE_NOTICES: MaintenanceNotice[] = [
  {
    id: 'NOT-NMC-2026-081',
    buildingId: 'NMC-SAT-2026-089',
    buildingName: 'Itwari Cotton Ginning & Pressing Mill Complex (Block C)',
    ward: 'Zone 7 - Satranjipura',
    zoneNumber: 7,
    noticeType: 'CRACK_RETROFITTING_ORDER',
    priority: 'URGENT',
    issuingAuthority: 'NMC Town Planning & Structural Safety Division',
    issuingOfficer: 'Shri Manoj S. Talware',
    officerDesignation: 'Executive Engineer (Town Planning & Hazardous Structures Cell)',
    issuedDate: '2026-09-18',
    complianceDeadline: '2026-10-18',
    statutoryReference: 'Maharashtra Municipal Corporation (MMC) Act Section 265 / IS 456:2000',
    description: 'Mandatory structural steel propping and epoxy crack injection ordered for Column C-4 and south-facing load-bearing masonry wall with shear crack exceeding 8.2mm.',
    mandatoryActions: [
      'Appoint NMC Empaneled Structural Engineer within 7 days',
      'Install heavy-duty adjustable steel shores under deflected span',
      'Execute polymer-modified mortar and low-viscosity epoxy grouting',
      'Submit Post-Repair Structural Stability Certificate to Zone 7 Office'
    ],
    status: 'PENDING_ACTION',
    recipientRole: 'OWNER',
    createdAt: '2026-09-18T10:00:00Z',
    isRead: false
  },
  {
    id: 'NOT-NMC-2026-044',
    buildingId: 'NMC-COM-GAN-041',
    buildingName: 'Old Mahal Heritage Wada & Commercial Arcade',
    ward: 'Zone 6 - Gandhibagh',
    zoneNumber: 6,
    noticeType: 'STRUCTURAL_AUDIT_MANDATE',
    priority: 'HIGH',
    issuingAuthority: 'NMC Heritage Conservation & Disaster Management Cell',
    issuingOfficer: 'Shri M. K. Bhende',
    officerDesignation: 'Assistant Municipal Commissioner (Zone 6)',
    issuedDate: '2026-09-10',
    complianceDeadline: '2026-10-10',
    statutoryReference: 'Maharashtra Municipal Corporation Act Section 265(A) - Mandatory Audit for 30+ Yr Structures',
    description: 'Structure age exceeds 78 years. Complete Non-Destructive Testing (Rebound Hammer, Ultrasonic Pulse Velocity, Core extraction) mandated prior to winter assembly session.',
    mandatoryActions: [
      'Engage VNIT or VNIT-approved Structural Testing Laboratory',
      'Perform ultrasonic pulse velocity testing on weathered timber beams',
      'Submit structural health audit report to Municipal Commissioner'
    ],
    status: 'IN_COMPLIANCE',
    recipientRole: 'ALL',
    createdAt: '2026-09-10T09:30:00Z',
    isRead: true
  },
  {
    id: 'NOT-NMC-2026-029',
    buildingId: 'NMC-RES-DHA-008',
    buildingName: 'Ramdaspeth Elite Heights Apartment (Wing B)',
    ward: 'Zone 2 - Dharampeth',
    zoneNumber: 2,
    noticeType: 'MONSOON_WATERPROOFING_DIRECTIVE',
    priority: 'MEDIUM',
    issuingAuthority: 'NMC Public Health & Structural Cell',
    issuingOfficer: 'Smt. P. M. Joshi',
    officerDesignation: 'Assistant Municipal Commissioner (Zone 2)',
    issuedDate: '2026-09-05',
    complianceDeadline: '2026-10-05',
    statutoryReference: 'NMC Building By-Laws 2020 Clause 18.4 (Moisture Ingress Prevention)',
    description: 'Arrest terrace water ponding and repair leaking stormwater downspouts causing rebar corrosion on top-floor cantilever balconies.',
    mandatoryActions: [
      'Apply elastomeric polyurethane waterproofing membrane on terrace slab',
      'Replace cracked PVC rainwater pipes along external facade',
      'Chip spalled concrete and apply zinc-rich anti-corrosion rebar primer'
    ],
    status: 'COMPLIED',
    recipientRole: 'OWNER',
    createdAt: '2026-09-05T11:00:00Z',
    isRead: true
  }
];

export const INITIAL_DEMOLITION_ORDERS: DemolitionDecision[] = [
  {
    id: 'DEM-NMC-SEC264-2026-012',
    orderNumber: 'NMC/T&CP/SEC264/C1/2026/012',
    buildingId: 'NMC-OFF-DHA-102',
    buildingName: 'Old Civil Lines Municipal Staff Quarters (Block 8)',
    ward: 'Zone 2 - Dharampeth',
    zoneNumber: 2,
    buildingAgeYears: 68,
    designLifeYears: 50,
    structuralConditionScore: 14,
    isRepairable: false,
    repairToReplacementCostRatio: 88.5,
    estimatedRetrofitCostInr: 38500000,
    estimatedReconstructionCostInr: 43500000,
    primaryFailureMechanisms: [
      'Exceeded 50-Year Design Lifespan (Constructed 1958 - Age 68 Years)',
      'Severe Foundation Differential Settlement (>48mm) in Expansive Black Cotton Clay',
      'Core Concrete Compressive Strength Degraded to 8.4 MPa (IS 516 Benchmark Min 20 MPa)',
      'Extensive Active Rebar Corrosion with >45% Cross-Sectional Area Loss and Widespread Slab Spalling',
      'Technical Infeasibility of Jacketing Due to Advanced Column Core Delamination'
    ],
    condemnationCategory: 'C_1_IMMEDIATE_DEMOLITION',
    statutoryReference: 'Maharashtra Municipal Corporation (MMC) Act Section 264 (Dangerous and Dilapidated Structures)',
    decisionDate: '2026-09-22',
    evacuationDeadline: '2026-09-25 18:00 IST (Immediate Evacuation Complete)',
    demolitionExecutionDate: '2026-10-15',
    demolitionMethod: 'HIGH_REACH_EXCAVATOR_DISMANTLING',
    contractorAssigned: 'M/s Vidarbha Demolition & Infrastructure Solutions Pvt Ltd (NMC Class A Contractor)',
    safetyPerimeterRadiusMeters: 1000,
    utilityCutoffChecklist: {
      powerDisconnected: true,
      waterDisconnected: true,
      gasPurged: true,
      telecomRerouted: true
    },
    rehabilitationCampLocation: 'NMC Community Centre, Civil Lines / Sadar Relief Transit Camp',
    authorizingCommissioner: 'Dr. Abhijit Chaudhari, IAS (Municipal Commissioner, NMC)',
    chiefStructuralEngineer: 'Shri Manoj S. Talware (Executive Engineer, Town Planning & Structural Safety)',
    status: 'CORDON_SECURED',
    createdAt: '2026-09-22T12:00:00Z',
    officialGazetteUrl: 'https://www.nmcnagpur.gov.in/orders/demolition-sec264-2026-012.pdf',
    notes: 'Order served under Section 264. All 18 residential quarters vacated. Electricity and water meters disconnected. Perimeter barricading completed.'
  }
];

