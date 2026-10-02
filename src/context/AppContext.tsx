import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  BuildingRecord,
  SafetyAlert,
  DataSourceConnector,
  EnvironmentalTelemetry,
  AuditLogEntry,
  UserRole,
  StructuralObservation,
  InspectionRecord,
  MaintenanceRecord,
  BuildingCategory,
  StructuralSystemType,
  MaintenanceNotice,
  DemolitionDecision
} from '../types';
import {
  INITIAL_BUILDINGS,
  INITIAL_ALERTS,
  INITIAL_DATA_SOURCES,
  INITIAL_ENVIRONMENT,
  INITIAL_AUDIT_LOGS,
  INITIAL_MAINTENANCE_NOTICES,
  INITIAL_DEMOLITION_ORDERS
} from '../data/initialData';
import { evaluateBuildingRisk } from '../services/riskEngine';
import { fetchLiveNagpurTelemetry } from '../services/dataSourcesService';
import { fuseMultiSourceBuildingData, MultiSourceIngestionInput } from '../services/multiSourceService';

interface AppContextType {
  buildings: BuildingRecord[];
  alerts: SafetyAlert[];
  maintenanceNotices: MaintenanceNotice[];
  demolitionOrders: DemolitionDecision[];
  dataSources: DataSourceConnector[];
  environment: EnvironmentalTelemetry;
  auditLogs: AuditLogEntry[];
  userRole: UserRole;
  demoMode: boolean;
  currentDemoStep: number;
  activeBuildingId: string | null;
  activeAlertNotification: SafetyAlert | null;
  activeNoticeNotification: MaintenanceNotice | null;
  activeDemolitionNotification: DemolitionDecision | null;
  isNotificationCenterOpen: boolean;
  isRefreshingSource: boolean;
  unreadCount: number;
  
  // Actions
  setUserRole: (role: UserRole) => void;
  setDemoMode: (enabled: boolean) => void;
  setCurrentDemoStep: (step: number) => void;
  setActiveBuildingId: (id: string | null) => void;
  dismissAlertNotification: () => void;
  dismissNoticeNotification: () => void;
  dismissDemolitionNotification: () => void;
  toggleNotificationCenter: (open?: boolean) => void;
  markAllNotificationsAsRead: () => void;
  
  addObservation: (
    buildingId: string,
    observation: Omit<StructuralObservation, 'id' | 'buildingId' | 'provenance' | 'verificationStatus'>,
    verifyNow?: boolean
  ) => Promise<StructuralObservation>;
  
  addInspection: (
    buildingId: string,
    inspection: Omit<InspectionRecord, 'id' | 'buildingId' | 'provenance'>
  ) => void;
  
  addMaintenance: (
    buildingId: string,
    maintenanceData: Omit<MaintenanceRecord, 'id' | 'buildingId' | 'provenance'>
  ) => void;

  updateBuildingCategory: (
    buildingId: string,
    newCategory: BuildingCategory
  ) => void;
  
  createAlert: (
    alertData: Omit<SafetyAlert, 'id' | 'status' | 'publishedAt' | 'resolvedAt' | 'auditTrail' | 'broadcastSimulation'>
  ) => SafetyAlert;
  
  verifyAlert: (alertId: string, officerName: string) => void;
  publishAlert: (alertId: string) => void;
  resolveAlert: (alertId: string, resolutionReason: string) => void;

  // Maintenance Notices Actions
  issueMaintenanceNotice: (notice: Omit<MaintenanceNotice, 'id' | 'createdAt'>) => MaintenanceNotice;
  updateNoticeStatus: (noticeId: string, status: MaintenanceNotice['status']) => void;

  // End-of-Life Demolition Actions
  issueDemolitionOrder: (order: Omit<DemolitionDecision, 'id' | 'createdAt'>) => DemolitionDecision;
  updateDemolitionStatus: (orderId: string, status: DemolitionDecision['status']) => void;
  
  assessAndRegisterBuilding: (input: MultiSourceIngestionInput) => BuildingRecord;
  refreshSource: (sourceId: string) => Promise<{ success: boolean; message: string }>;
  resetDemoData: () => void;
  addAuditLog: (action: string, targetResource: string, details: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [buildings, setBuildings] = useState<BuildingRecord[]>(() => {
    const saved = localStorage.getItem('nirman_buildings_v5');
    if (saved) {
      try {
        const parsed: BuildingRecord[] = JSON.parse(saved);
        // Replace or add latest initial buildings so newly defined campus blocks and structures are up to date
        const map = new Map<string, BuildingRecord>();
        parsed.forEach(b => map.set(b.id, b));
        INITIAL_BUILDINGS.forEach(ib => {
          // If the initial building has campus/block info or is new, merge it
          if (!map.has(ib.id) || ib.campusId) {
            map.set(ib.id, { ...(map.get(ib.id) || {}), ...ib });
          }
        });
        return Array.from(map.values());
      } catch (e) {
        return INITIAL_BUILDINGS;
      }
    }
    return INITIAL_BUILDINGS;
  });

  const [alerts, setAlerts] = useState<SafetyAlert[]>(() => {
    const saved = localStorage.getItem('nirman_alerts_v6');
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
  });

  const [maintenanceNotices, setMaintenanceNotices] = useState<MaintenanceNotice[]>(() => {
    const saved = localStorage.getItem('nirman_notices_v5');
    return saved ? JSON.parse(saved) : INITIAL_MAINTENANCE_NOTICES;
  });

  const [demolitionOrders, setDemolitionOrders] = useState<DemolitionDecision[]>(() => {
    const saved = localStorage.getItem('nirman_demolitions_v5');
    return saved ? JSON.parse(saved) : INITIAL_DEMOLITION_ORDERS;
  });

  const [dataSources, setDataSources] = useState<DataSourceConnector[]>(() => {
    const saved = localStorage.getItem('nirman_sources_v5');
    return saved ? JSON.parse(saved) : INITIAL_DATA_SOURCES;
  });

  const [environment, setEnvironment] = useState<EnvironmentalTelemetry>(INITIAL_ENVIRONMENT);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [userRole, setUserRole] = useState<UserRole>('AUTHORITY'); // Default to Authority for seamless full inspection
  const [demoMode, setDemoMode] = useState<boolean>(true);
  const [currentDemoStep, setCurrentDemoStep] = useState<number>(1);
  const [activeBuildingId, setActiveBuildingId] = useState<string | null>('NMC-LAX-SVPCET-CAMPUS');
  const [activeAlertNotification, setActiveAlertNotification] = useState<SafetyAlert | null>(null);
  const [activeNoticeNotification, setActiveNoticeNotification] = useState<MaintenanceNotice | null>(null);
  const [activeDemolitionNotification, setActiveDemolitionNotification] = useState<DemolitionDecision | null>(null);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState<boolean>(false);
  const [isRefreshingSource, setIsRefreshingSource] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('nirman_buildings_v5', JSON.stringify(buildings));
  }, [buildings]);

  useEffect(() => {
    localStorage.setItem('nirman_alerts_v6', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('nirman_notices_v5', JSON.stringify(maintenanceNotices));
  }, [maintenanceNotices]);

  useEffect(() => {
    localStorage.setItem('nirman_demolitions_v5', JSON.stringify(demolitionOrders));
  }, [demolitionOrders]);

  useEffect(() => {
    localStorage.setItem('nirman_sources_v5', JSON.stringify(dataSources));
  }, [dataSources]);

  // Compute unread notifications count
  const unreadCount = 
    alerts.filter(a => a.status === 'ACTIVE').length +
    maintenanceNotices.filter(n => !n.isRead && n.status === 'PENDING_ACTION').length +
    demolitionOrders.filter(d => d.status !== 'DEMOLISHED').length;

  // Initial fetch of real Open-Meteo Nagpur weather on startup
  useEffect(() => {
    const initialFetch = async () => {
      const openMeteoSrc = dataSources.find(s => s.id === 'src-open-meteo-nagpur');
      if (openMeteoSrc) {
        const result = await fetchLiveNagpurTelemetry(openMeteoSrc);
        if (result.success && result.environmentTelemetry) {
          setEnvironment(result.environmentTelemetry);
          setDataSources(prev => prev.map(s => s.id === result.connector.id ? result.connector : s));
        }
      }
    };
    initialFetch();
  }, []);

  const addAuditLog = (action: string, targetResource: string, details: string) => {
    const newLog: AuditLogEntry = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      userRole,
      userName: userRole === 'AUTHORITY' ? 'Shri Manoj S. Talware (Executive Engineer, NMC)' :
                userRole === 'ENGINEER' ? 'Er. Rajesh S. Deshmukh (NMC-STR-LIC-4482)' :
                userRole === 'INSPECTOR' ? 'Field Structural Inspector (Zone 2 Team)' :
                userRole === 'ADMIN' ? 'System Administrator' : 'Citizen Portal User',
      action,
      targetResource,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const addObservation = async (
    buildingId: string,
    observationData: Omit<StructuralObservation, 'id' | 'buildingId' | 'provenance' | 'verificationStatus'>,
    verifyNow: boolean = true
  ): Promise<StructuralObservation> => {
    const targetBuilding = buildings.find(b => b.id === buildingId);
    if (!targetBuilding) throw new Error('Building not found');

    const newObsId = `OBS-${Date.now().toString().slice(-4)}`;
    const newObservation: StructuralObservation = {
      id: newObsId,
      buildingId,
      ...observationData,
      verificationStatus: verifyNow ? 'ENGINEER_VERIFIED' : 'PENDING_VERIFICATION',
      verifiedBy: verifyNow ? observationData.inspectorName : undefined,
      verifiedAt: verifyNow ? new Date().toISOString() : undefined,
      provenance: {
        source: 'NMC Licensed Engineer Field Observation',
        retrievedAt: new Date().toISOString(),
        status: targetBuilding.isSynthetic ? 'SYNTHETIC_DEMO' : 'ENGINEER_VERIFIED',
        confidenceScore: 92
      }
    };

    // Recalculate Building Health & Risk using Explainable Risk Engine
    const updatedObservations = [newObservation, ...targetBuilding.observations];
    const candidateBuilding: BuildingRecord = {
      ...targetBuilding,
      observations: updatedObservations,
      lastInspectionDate: new Date().toISOString().split('T')[0]
    };

    const riskResult = evaluateBuildingRisk(candidateBuilding, environment);

    const updatedBuilding: BuildingRecord = {
      ...candidateBuilding,
      riskIndicator: riskResult.riskIndicator,
      riskScore: riskResult.riskScore,
      inspectionPriority: riskResult.inspectionPriority,
      maintenancePriority: riskResult.maintenancePriority,
      dataConfidenceScore: riskResult.dataConfidenceScore,
      dataCompleteness: riskResult.dataCompleteness,
      riskFactors: riskResult.riskFactors,
      missingDataWarnings: riskResult.missingDataWarnings,
      recommendedProfessionalAction: riskResult.recommendedProfessionalAction,
      lastRiskCalculation: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      timeline: [
        {
          id: `TL-${Date.now().toString().slice(-4)}`,
          buildingId,
          date: new Date().toISOString().split('T')[0],
          title: `New Structural Observation Logged (${observationData.severity})`,
          category: 'OBSERVATION',
          description: `${observationData.observationType.replace(/_/g, ' ')}: ${observationData.description} at ${observationData.locationDetails}`,
          personOrOrg: `${observationData.inspectorName} (${observationData.inspectorLicense})`,
          status: targetBuilding.isSynthetic ? 'SYNTHETIC_DEMO' : 'ENGINEER_VERIFIED'
        },
        ...targetBuilding.timeline
      ]
    };

    setBuildings(prev => prev.map(b => b.id === buildingId ? updatedBuilding : b));

    addAuditLog(
      'STRUCTURAL_OBSERVATION_LOGGED',
      buildingId,
      `Logged ${observationData.severity} ${observationData.observationType} on ${targetBuilding.name}. Risk updated to ${riskResult.riskIndicator} (${riskResult.riskScore}/100).`
    );

    return newObservation;
  };

  const addInspection = (
    buildingId: string,
    inspectionData: Omit<InspectionRecord, 'id' | 'buildingId' | 'provenance'>
  ) => {
    const targetBuilding = buildings.find(b => b.id === buildingId);
    if (!targetBuilding) return;

    const newInspId = `INSP-${Date.now().toString().slice(-4)}`;
    const newInspection: InspectionRecord = {
      id: newInspId,
      buildingId,
      ...inspectionData,
      provenance: {
        source: 'NMC Licensed Engineer Inspection Submission',
        retrievedAt: new Date().toISOString(),
        status: targetBuilding.isSynthetic ? 'SYNTHETIC_DEMO' : 'ENGINEER_VERIFIED',
        confidenceScore: 95
      }
    };

    const candidateBuilding: BuildingRecord = {
      ...targetBuilding,
      inspections: [newInspection, ...targetBuilding.inspections],
      lastInspectionDate: inspectionData.inspectionDate,
      nextInspectionDueDate: inspectionData.nextInspectionDueDate
    };

    const riskResult = evaluateBuildingRisk(candidateBuilding, environment);

    const updatedBuilding: BuildingRecord = {
      ...candidateBuilding,
      riskIndicator: riskResult.riskIndicator,
      riskScore: riskResult.riskScore,
      inspectionPriority: riskResult.inspectionPriority,
      maintenancePriority: riskResult.maintenancePriority,
      dataConfidenceScore: riskResult.dataConfidenceScore,
      dataCompleteness: riskResult.dataCompleteness,
      riskFactors: riskResult.riskFactors,
      missingDataWarnings: riskResult.missingDataWarnings,
      recommendedProfessionalAction: riskResult.recommendedProfessionalAction,
      lastUpdated: new Date().toISOString(),
      timeline: [
        {
          id: `TL-INSP-${Date.now().toString().slice(-4)}`,
          buildingId,
          date: inspectionData.inspectionDate,
          title: `Certified Structural Audit Completed (${inspectionData.inspectionType.replace(/_/g, ' ')})`,
          category: 'INSPECTION',
          description: inspectionData.summary,
          personOrOrg: `${inspectionData.inspectorName} (${inspectionData.inspectorLicense})`,
          status: targetBuilding.isSynthetic ? 'SYNTHETIC_DEMO' : 'ENGINEER_VERIFIED'
        },
        ...targetBuilding.timeline
      ]
    };

    setBuildings(prev => prev.map(b => b.id === buildingId ? updatedBuilding : b));
    addAuditLog('INSPECTION_RECORD_ADDED', buildingId, `Added ${inspectionData.inspectionType} inspection for ${targetBuilding.name}. Condition score: ${inspectionData.conditionScore}/100.`);
  };

  const addMaintenance = (
    buildingId: string,
    maintenanceData: Omit<MaintenanceRecord, 'id' | 'buildingId' | 'provenance'>
  ) => {
    const targetBuilding = buildings.find(b => b.id === buildingId);
    if (!targetBuilding) return;

    const newMaintId = `MAINT-${Date.now().toString().slice(-4)}`;
    const newRecord: MaintenanceRecord = {
      id: newMaintId,
      buildingId,
      ...maintenanceData,
      provenance: {
        source: 'Contractor Maintenance Ledger Submission',
        retrievedAt: new Date().toISOString(),
        status: targetBuilding.isSynthetic ? 'SYNTHETIC_DEMO' : 'AUTHORIZED_PROFESSIONAL_RECORD',
        confidenceScore: 90
      }
    };

    const candidateBuilding: BuildingRecord = {
      ...targetBuilding,
      maintenance: [newRecord, ...targetBuilding.maintenance],
      nextInspectionDueDate: maintenanceData.nextInspectionDue || targetBuilding.nextInspectionDueDate
    };

    const riskResult = evaluateBuildingRisk(candidateBuilding, environment);

    const updatedBuilding: BuildingRecord = {
      ...candidateBuilding,
      riskIndicator: riskResult.riskIndicator,
      riskScore: riskResult.riskScore,
      inspectionPriority: riskResult.inspectionPriority,
      maintenancePriority: riskResult.maintenancePriority,
      dataConfidenceScore: riskResult.dataConfidenceScore,
      dataCompleteness: riskResult.dataCompleteness,
      riskFactors: riskResult.riskFactors,
      missingDataWarnings: riskResult.missingDataWarnings,
      recommendedProfessionalAction: riskResult.recommendedProfessionalAction,
      lastUpdated: new Date().toISOString(),
      timeline: [
        {
          id: `TL-MAINT-${Date.now().toString().slice(-4)}`,
          buildingId,
          date: maintenanceData.date,
          title: `Maintenance & Structural Repair (${maintenanceData.repairType.replace(/_/g, ' ')})`,
          category: 'MAINTENANCE',
          description: `${maintenanceData.description} - Executed by ${maintenanceData.contractorName}`,
          personOrOrg: maintenanceData.contractorName,
          status: targetBuilding.isSynthetic ? 'SYNTHETIC_DEMO' : 'AUTHORIZED_PROFESSIONAL_RECORD'
        },
        ...targetBuilding.timeline
      ]
    };

    setBuildings(prev => prev.map(b => b.id === buildingId ? updatedBuilding : b));
    addAuditLog('MAINTENANCE_RECORD_ADDED', buildingId, `Recorded ${maintenanceData.repairType} by ${maintenanceData.contractorName}.`);
  };

  const updateBuildingCategory = (buildingId: string, newCategory: BuildingCategory) => {
    setBuildings(prev => prev.map(b => {
      if (b.id === buildingId) {
        return {
          ...b,
          category: newCategory,
          lastUpdated: new Date().toISOString()
        };
      }
      return b;
    }));
    addAuditLog('BUILDING_CATEGORY_UPDATED', buildingId, `Category updated to "${newCategory}" by authorized user (${userRole}).`);
  };

  const createAlert = (
    alertData: Omit<SafetyAlert, 'id' | 'status' | 'publishedAt' | 'resolvedAt' | 'auditTrail' | 'broadcastSimulation'>
  ): SafetyAlert => {
    const newAlertId = `ALERT-NMC-2026-${Date.now().toString().slice(-4)}`;
    const radius = alertData.geoRadiusMeters || 1000; // Default 1000m (2 km diameter)
    const newAlert: SafetyAlert = {
      id: newAlertId,
      ...alertData,
      geoRadiusMeters: radius,
      status: 'VERIFIED',
      broadcastSimulation: {
        inAppDelivered: true,
        smsSimulated: false,
        webPushSimulated: false,
        recipientsCount: Math.round(radius * 0.42),
        deliveryTimestamp: new Date().toISOString(),
        providerNote: 'In-app notification delivered. External SMS/Email gateway provider not configured.'
      },
      auditTrail: [
        {
          timestamp: new Date().toISOString(),
          action: 'ALERT_CREATED_AND_VERIFIED',
          performedBy: alertData.verificationOfficer,
          role: 'AUTHORITY',
          notes: 'Authority verified structural safety concern.'
        }
      ]
    };

    setAlerts(prev => [newAlert, ...prev]);

    // Link alert to building
    setBuildings(prev => prev.map(b => {
      if (b.id === alertData.buildingId) {
        return {
          ...b,
          hasActiveAlert: true,
          activeAlertId: newAlertId,
          timeline: [
            {
              id: `TL-ALT-${Date.now().toString().slice(-4)}`,
              buildingId: b.id,
              date: new Date().toISOString().split('T')[0],
              title: `Official Public Safety Warning Issued (${alertData.alertType})`,
              category: 'ALERT',
              description: alertData.reasonForAlert,
              personOrOrg: alertData.verificationOfficer,
              status: 'AUTHORITY_VERIFIED'
            },
            ...b.timeline
          ]
        };
      }
      return b;
    }));

    addAuditLog('SAFETY_ALERT_CREATED', newAlertId, `Authority created ${alertData.alertType} alert for ${alertData.buildingName} with ${radius}m radius.`);
    return newAlert;
  };

  const verifyAlert = (alertId: string, officerName: string) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return {
          ...a,
          status: 'VERIFIED',
          verificationOfficer: officerName,
          verificationDate: new Date().toISOString().split('T')[0],
          auditTrail: [
            ...a.auditTrail,
            {
              timestamp: new Date().toISOString(),
              action: 'AUTHORITY_VERIFIED',
              performedBy: officerName,
              role: 'AUTHORITY',
              notes: 'Structural safety distress physically verified by authority.'
            }
          ]
        };
      }
      return a;
    }));
    addAuditLog('ALERT_VERIFIED', alertId, `Verified by ${officerName}.`);
  };

  const publishAlert = (alertId: string) => {
    let publishedAlertObj: SafetyAlert | null = null;
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        publishedAlertObj = {
          ...a,
          status: 'ACTIVE',
          publishedAt: new Date().toISOString(),
          broadcastSimulation: {
            inAppDelivered: true,
            smsSimulated: false,
            webPushSimulated: false,
            recipientsCount: Math.round(a.geoRadiusMeters * 0.42),
            deliveryTimestamp: new Date().toISOString(),
            providerNote: 'In-app notification active across Nagpur. SMS/Email simulation provider not configured.'
          },
          auditTrail: [
            ...a.auditTrail,
            {
              timestamp: new Date().toISOString(),
              action: 'ALERT_PUBLISHED_TO_CITIZENS',
              performedBy: a.verificationOfficer,
              role: 'AUTHORITY',
              notes: `Broadcast sent to geo-fenced region (${a.geoRadiusMeters}m radius / ${(a.geoRadiusMeters * 2) / 1000} km diameter).`
            }
          ]
        };
        return publishedAlertObj;
      }
      return a;
    }));

    if (publishedAlertObj) {
      setActiveAlertNotification(publishedAlertObj);
    }
    addAuditLog('ALERT_PUBLISHED', alertId, 'Safety alert published to public channels and geo-fenced region.');
  };

  const resolveAlert = (alertId: string, resolutionReason: string) => {
    let resolvedBuildingId: string | undefined;

    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        resolvedBuildingId = a.buildingId;
        return {
          ...a,
          status: 'RESOLVED',
          resolvedAt: new Date().toISOString(),
          resolutionReason,
          auditTrail: [
            ...a.auditTrail,
            {
              timestamp: new Date().toISOString(),
              action: 'ALERT_RESOLVED',
              performedBy: userRole === 'AUTHORITY' ? 'Shri Manoj S. Talware' : 'Authorized Officer',
              role: 'AUTHORITY',
              notes: resolutionReason
            }
          ]
        };
      }
      return a;
    }));

    if (resolvedBuildingId) {
      setBuildings(prev => prev.map(b => {
        if (b.id === resolvedBuildingId) {
          return {
            ...b,
            hasActiveAlert: false,
            activeAlertId: undefined,
            riskIndicator: 'MODERATE',
            riskScore: 45,
            timeline: [
              {
                id: `TL-RES-${Date.now().toString().slice(-4)}`,
                buildingId: b.id,
                date: new Date().toISOString().split('T')[0],
                title: 'Safety Alert Formally Resolved by Authority',
                category: 'ALERT',
                description: `Alert ${alertId} resolved: "${resolutionReason}"`,
                personOrOrg: 'NMC Town Planning & Disaster Cell',
                status: 'AUTHORITY_VERIFIED'
              },
              ...b.timeline
            ]
          };
        }
        return b;
      }));
    }

    addAuditLog('ALERT_RESOLVED', alertId, `Resolution recorded: ${resolutionReason}`);
  };

  const assessAndRegisterBuilding = (input: MultiSourceIngestionInput): BuildingRecord => {
    // Run multi-source data fusion
    const { building: fusedBuilding, summary } = fuseMultiSourceBuildingData(input, environment);

    // Evaluate Risk Engine
    const evaluation = evaluateBuildingRisk(fusedBuilding, environment);

    const completeBuilding: BuildingRecord = {
      ...fusedBuilding,
      riskIndicator: evaluation.riskIndicator,
      riskScore: evaluation.riskScore,
      riskFactors: evaluation.riskFactors,
      missingDataWarnings: evaluation.missingDataWarnings,
      recommendedProfessionalAction: evaluation.recommendedProfessionalAction,
      dataConfidenceScore: evaluation.dataConfidenceScore,
      dataCompleteness: evaluation.dataCompleteness,
      inspectionPriority: evaluation.inspectionPriority,
      maintenancePriority: evaluation.maintenancePriority
    };

    setBuildings(prev => {
      const updated = [completeBuilding, ...prev];
      localStorage.setItem('nirman_buildings_v2', JSON.stringify(updated));
      return updated;
    });

    setActiveBuildingId(completeBuilding.id);

    addAuditLog(
      'NEW_BUILDING_ASSESSED',
      completeBuilding.id,
      `Assessed & registered "${completeBuilding.name}" (${completeBuilding.category}) in ${completeBuilding.ward}. Sources checked: ${summary.sourcesFound.join(', ')}. Initial Risk: ${completeBuilding.riskIndicator} (${completeBuilding.riskScore}/100)`
    );

    return completeBuilding;
  };

  const refreshSource = async (sourceId: string) => {
    setIsRefreshingSource(true);
    const source = dataSources.find(s => s.id === sourceId);
    if (!source) {
      setIsRefreshingSource(false);
      return { success: false, message: 'Source not found' };
    }

    const result = await fetchLiveNagpurTelemetry(source);
    setDataSources(prev => prev.map(s => s.id === sourceId ? result.connector : s));

    if (result.environmentTelemetry) {
      setEnvironment(result.environmentTelemetry);
    }

    addAuditLog(
      'DATA_SOURCE_REFRESHED',
      source.name,
      result.success
        ? `Refreshed ${source.name} successfully. Latency: ${result.connector.latencyMs}ms.`
        : `Refresh failed for ${source.name}: ${result.connector.errorMessage}`
    );

    setIsRefreshingSource(false);
    return { success: result.success, message: result.message };
  };

  // MAINTENANCE NOTICES ACTIONS
  const issueMaintenanceNotice = (noticeData: Omit<MaintenanceNotice, 'id' | 'createdAt'>): MaintenanceNotice => {
    const newId = `NOT-NMC-${Date.now().toString().slice(-4)}`;
    const fullNotice: MaintenanceNotice = {
      ...noticeData,
      id: newId,
      createdAt: new Date().toISOString(),
      isRead: false
    };

    setMaintenanceNotices(prev => [fullNotice, ...prev]);
    setActiveNoticeNotification(fullNotice);

    setBuildings(prev => prev.map(b => {
      if (b.id === noticeData.buildingId) {
        return {
          ...b,
          activeNoticesCount: (b.activeNoticesCount || 0) + 1,
          timeline: [
            {
              id: `TL-NOT-${Date.now().toString().slice(-4)}`,
              buildingId: b.id,
              date: new Date().toISOString().split('T')[0],
              title: `Official Municipal Directive: ${noticeData.noticeType.replace(/_/g, ' ')}`,
              category: 'NOTICE',
              description: `${noticeData.description} (Statutory Ref: ${noticeData.statutoryReference}, Deadline: ${noticeData.complianceDeadline})`,
              personOrOrg: noticeData.issuingAuthority,
              status: 'OFFICIAL_GOVERNMENT_RECORD'
            },
            ...b.timeline
          ]
        };
      }
      return b;
    }));

    addAuditLog('MAINTENANCE_NOTICE_ISSUED', noticeData.buildingId, `Statutory notice ${newId} (${noticeData.noticeType}) issued to ${noticeData.buildingName}. Deadline: ${noticeData.complianceDeadline}`);

    return fullNotice;
  };

  const updateNoticeStatus = (noticeId: string, status: MaintenanceNotice['status']) => {
    setMaintenanceNotices(prev => prev.map(n => {
      if (n.id === noticeId) {
        return { ...n, status };
      }
      return n;
    }));
    addAuditLog('MAINTENANCE_NOTICE_STATUS_UPDATED', noticeId, `Status changed to ${status}`);
  };

  // END-OF-LIFE CONDEMNATION & DEMOLITION ORDER ACTIONS
  const issueDemolitionOrder = (orderData: Omit<DemolitionDecision, 'id' | 'createdAt'>): DemolitionDecision => {
    const newId = `DEM-NMC-SEC264-${Date.now().toString().slice(-4)}`;
    const fullOrder: DemolitionDecision = {
      ...orderData,
      id: newId,
      createdAt: new Date().toISOString()
    };

    // 1. Update Demolition Orders
    setDemolitionOrders(prev => [fullOrder, ...prev]);

    // 2. Update Target Building (Condemned Flag, Critical Risk, Municipal Status, Timeline)
    let buildingLat = 21.1458;
    let buildingLng = 79.0882;
    let buildingArea = `Zone ${orderData.zoneNumber}`;

    setBuildings(prev => prev.map(b => {
      if (b.id === orderData.buildingId) {
        buildingLat = b.latitude;
        buildingLng = b.longitude;
        buildingArea = b.area || b.address;

        return {
          ...b,
          isCondemned: true,
          demolitionOrder: fullOrder,
          riskIndicator: 'CRITICAL',
          riskScore: 98,
          hasActiveAlert: true,
          officialMunicipalStatus: {
            ...b.officialMunicipalStatus,
            value: 'Condemned - NMC Section 264 Demolition Order Issued',
            status: 'OFFICIAL_GOVERNMENT_RECORD',
            retrievedAt: new Date().toISOString(),
            confidenceScore: 100
          },
          timeline: [
            {
              id: `TL-DEM-${Date.now().toString().slice(-4)}`,
              buildingId: b.id,
              date: new Date().toISOString().split('T')[0],
              title: 'NMC Section 264 Demolition Order Issued (C-1 Condemned Structure)',
              category: 'AUTHORITY_ACTION',
              description: `Statutory order ${orderData.orderNumber} executed by ${orderData.authorizingCommissioner}. Structure exceeded design life (${orderData.buildingAgeYears} yrs vs ${orderData.designLifeYears} yrs). Retrofit economically and structurally unviable (${orderData.repairToReplacementCostRatio}% cost ratio). Evacuation deadline: ${orderData.evacuationDeadline}. Method: ${orderData.demolitionMethod.replace(/_/g, ' ')}.`,
              personOrOrg: 'Nagpur Municipal Corporation (Town Planning & Disaster Management Cell)',
              status: 'OFFICIAL_GOVERNMENT_RECORD'
            },
            ...b.timeline
          ]
        };
      }
      return b;
    }));

    // 3. Automatically spawn high-priority Evacuation Safety Alert across all user views
    const emergencyAlert: SafetyAlert = {
      id: `ALERT-DEM-${Date.now().toString().slice(-4)}`,
      buildingId: orderData.buildingId,
      buildingName: orderData.buildingName,
      ward: orderData.ward,
      area: buildingArea,
      latitude: buildingLat,
      longitude: buildingLng,
      alertType: 'EMERGENCY_EVACUATION',
      severity: 'CRITICAL',
      status: 'ACTIVE',
      geoRadiusMeters: orderData.safetyPerimeterRadiusMeters || 1000,
      reasonForAlert: `NMC SECTION 264 CONDEMNATION & DEMOLITION ORDER. Building age has passed (${orderData.buildingAgeYears} years) with irreparable foundation and concrete degradation. Structure declared unfit for human habitation.`,
      officialInstructions: `IMMEDIATE EVACUATION DIRECTIVE: All occupants must vacate premises immediately before ${orderData.evacuationDeadline}. 2 km safety buffer enforced. Essential utilities disconnected. Municipal Transit Shelter: ${orderData.rehabilitationCampLocation}.`,
      emergencyContact: 'NMC Disaster Management Cell: 0712-2567035 / Control Room: 101',
      verificationOfficer: orderData.chiefStructuralEngineer || 'Shri Manoj S. Talware',
      officerDesignation: 'Executive Engineer (Town Planning & Hazardous Structures Cell), NMC',
      verificationDate: new Date().toISOString().split('T')[0],
      authorityApprovalBadge: `NMC-SEAL-SEC264/${orderData.orderNumber}`,
      publishedAt: new Date().toISOString(),
      broadcastSimulation: {
        inAppDelivered: true,
        smsSimulated: false,
        webPushSimulated: false,
        recipientsCount: Math.round((orderData.safetyPerimeterRadiusMeters || 1000) * 0.48),
        deliveryTimestamp: new Date().toISOString(),
        providerNote: 'In-app emergency evacuation broadcast delivered to all Nagpur citizen perspectives.'
      },
      auditTrail: [
        {
          timestamp: new Date().toISOString(),
          action: 'SECTION_264_DEMOLITION_ALERT_ISSUED',
          performedBy: orderData.authorizingCommissioner,
          role: 'AUTHORITY',
          notes: `Demolition order ${orderData.orderNumber} published with ${orderData.safetyPerimeterRadiusMeters}m perimeter buffer.`
        }
      ]
    };

    setAlerts(prev => [emergencyAlert, ...prev]);
    setActiveAlertNotification(emergencyAlert);
    setActiveDemolitionNotification(fullOrder);

    addAuditLog('DEMOLITION_ORDER_ISSUED', orderData.buildingId, `Section 264 Demolition Order ${orderData.orderNumber} issued for ${orderData.buildingName}. Scheduled Date: ${orderData.demolitionExecutionDate}`);

    return fullOrder;
  };

  const updateDemolitionStatus = (orderId: string, status: DemolitionDecision['status']) => {
    setDemolitionOrders(prev => prev.map(d => {
      if (d.id === orderId) {
        return { ...d, status };
      }
      return d;
    }));
    addAuditLog('DEMOLITION_STATUS_UPDATED', orderId, `Demolition pipeline stage updated to ${status}`);
  };

  const toggleNotificationCenter = (open?: boolean) => {
    setIsNotificationCenterOpen(prev => (open !== undefined ? open : !prev));
  };

  const dismissAlertNotification = () => {
    setActiveAlertNotification(null);
  };

  const dismissNoticeNotification = () => {
    setActiveNoticeNotification(null);
  };

  const dismissDemolitionNotification = () => {
    setActiveDemolitionNotification(null);
  };

  const markAllNotificationsAsRead = () => {
    setMaintenanceNotices(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const resetDemoData = () => {
    localStorage.removeItem('nirman_buildings_v5');
    localStorage.removeItem('nirman_alerts_v5');
    localStorage.removeItem('nirman_notices_v5');
    localStorage.removeItem('nirman_demolitions_v5');
    localStorage.removeItem('nirman_sources_v5');
    localStorage.removeItem('nirman_buildings_v4');
    localStorage.removeItem('nirman_alerts_v4');
    localStorage.removeItem('nirman_sources_v4');
    localStorage.removeItem('nirman_buildings_v2');
    localStorage.removeItem('nirman_alerts_v2');
    localStorage.removeItem('nirman_sources_v2');
    setBuildings(INITIAL_BUILDINGS);
    setAlerts(INITIAL_ALERTS);
    setMaintenanceNotices(INITIAL_MAINTENANCE_NOTICES);
    setDemolitionOrders(INITIAL_DEMOLITION_ORDERS);
    setDataSources(INITIAL_DATA_SOURCES);
    setEnvironment(INITIAL_ENVIRONMENT);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCurrentDemoStep(1);
    setActiveBuildingId('NMC-LAX-SVPCET-CAMPUS');
    addAuditLog('DATABASE_RESET', 'System', 'Reset prototype database to initial baseline.');
  };

  return (
    <AppContext.Provider
      value={{
        buildings,
        alerts,
        maintenanceNotices,
        demolitionOrders,
        dataSources,
        environment,
        auditLogs,
        userRole,
        demoMode,
        currentDemoStep,
        activeBuildingId,
        activeAlertNotification,
        activeNoticeNotification,
        activeDemolitionNotification,
        isNotificationCenterOpen,
        isRefreshingSource,
        unreadCount,
        setUserRole,
        setDemoMode,
        setCurrentDemoStep,
        setActiveBuildingId,
        dismissAlertNotification,
        dismissNoticeNotification,
        dismissDemolitionNotification,
        toggleNotificationCenter,
        markAllNotificationsAsRead,
        addObservation,
        addInspection,
        addMaintenance,
        updateBuildingCategory,
        createAlert,
        verifyAlert,
        publishAlert,
        resolveAlert,
        issueMaintenanceNotice,
        updateNoticeStatus,
        issueDemolitionOrder,
        updateDemolitionStatus,
        assessAndRegisterBuilding,
        refreshSource,
        resetDemoData,
        addAuditLog
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

