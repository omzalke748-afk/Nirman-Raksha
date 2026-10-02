import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  CheckCircle2,
  Minimize2,
  Maximize2,
  ArrowRight,
  ShieldCheck,
  Radio,
  FileDown
} from 'lucide-react';

interface Props {
  setActiveTab: (tab: string) => void;
}

export const DemoStoryGuide: React.FC<Props> = ({ setActiveTab }) => {
  const {
    currentDemoStep,
    setCurrentDemoStep,
    setUserRole,
    setActiveBuildingId,
    addObservation,
    createAlert,
    publishAlert,
    resolveAlert,
    resetDemoData,
    buildings,
    alerts
  } = useApp();

  const [collapsed, setCollapsed] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const demoBuildingId = 'NMC-SAT-2026-089'; // Itwari Cotton Ginning Mill Quarter (Satranjipura)

  const steps = [
    {
      step: 1,
      title: 'Step 1: Open Nagpur Dashboard',
      description: 'Review city-wide building health metrics, NMC 10 zones, live weather telemetry, and data transparency health.',
      targetTab: 'dashboard',
      actionLabel: 'View Dashboard',
      action: async () => {
        setActiveTab('dashboard');
      }
    },
    {
      step: 2,
      title: 'Step 2: Select a Building from Registry',
      description: 'Select Itwari Cotton Ginning Mill Staff Quarters (Block C) in Zone 7 Satranjipura from the Building Registry.',
      targetTab: 'buildings',
      actionLabel: 'Select Building',
      action: async () => {
        setActiveBuildingId(demoBuildingId);
        setActiveTab('buildings');
      }
    },
    {
      step: 3,
      title: 'Step 3: Open Building Health Passport',
      description: 'Inspect the 12-section medical-style Health Passport, provenance badges, and historical timeline.',
      targetTab: 'health-passport',
      actionLabel: 'Open Health Passport',
      action: async () => {
        setActiveBuildingId(demoBuildingId);
        setActiveTab('health-passport');
      }
    },
    {
      step: 4,
      title: 'Step 4: Review Previous Inspection Baseline',
      description: 'Observe baseline audit from Er. Rajesh Deshmukh with condition score 58/100 and moderate step cracks.',
      targetTab: 'inspections',
      actionLabel: 'View Prior Inspection',
      action: async () => {
        setActiveBuildingId(demoBuildingId);
        setActiveTab('inspections');
      }
    },
    {
      step: 5,
      title: 'Step 5: Switch to Engineer Role & Log New Critical Observation',
      description: 'Licensed Structural Engineer logs a newly emerged severe shear crack and foundation distress on Block C.',
      targetTab: 'inspections',
      actionLabel: 'Log Structural Observation',
      action: async () => {
        setUserRole('ENGINEER');
        setActiveBuildingId(demoBuildingId);
        setActiveTab('inspections');
        // Add observation
        await addObservation(demoBuildingId, {
          date: '2026-09-29',
          inspectorName: 'Er. Rajesh S. Deshmukh',
          inspectorLicense: 'NMC-STR-LIC-4482',
          observationType: 'STRUCTURAL_SHEAR_CRACK',
          severity: 'CRITICAL',
          locationDetails: 'Ground floor external plinth & Column C-4 junction',
          description: 'Wide continuous structural shear crack (8.2mm) propagating through load-bearing brickwork with visible horizontal mortar shear slip.',
          imageUrl: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&q=80&w=800'
        }, false);
      }
    },
    {
      step: 6,
      title: 'Step 6: Attach Visual Engineering Evidence',
      description: 'Photographic evidence with GPS metadata and disclaimer attached for authority review.',
      targetTab: 'health-passport',
      actionLabel: 'View Evidence Ledger',
      action: async () => {
        setActiveBuildingId(demoBuildingId);
        setActiveTab('health-passport');
      }
    },
    {
      step: 7,
      title: 'Step 7: Explainable Risk Engine Recalculates Score',
      description: 'Watch the Prototype Risk Engine automatically elevate risk from HIGH (78/100) to CRITICAL (94/100) with factor breakdowns.',
      targetTab: 'health-passport',
      actionLabel: 'Check Recalculated Risk',
      action: async () => {
        setActiveBuildingId(demoBuildingId);
        setActiveTab('health-passport');
      }
    },
    {
      step: 8,
      title: 'Step 8: Ask NIRMAN AI Analyst "What Changed?"',
      description: 'Interact with NIRMAN AI to query why the building was flagged and what differential changed since the previous inspection.',
      targetTab: 'health-passport',
      actionLabel: 'Consult NIRMAN AI',
      action: async () => {
        setActiveBuildingId(demoBuildingId);
        setActiveTab('health-passport');
      }
    },
    {
      step: 9,
      title: 'Step 9: Engineer Verifies & Approves Observation',
      description: 'Er. Rajesh Deshmukh formally signs and verifies the observation with license stamp NMC-STR-LIC-4482.',
      targetTab: 'inspections',
      actionLabel: 'Sign Observation',
      action: async () => {
        setUserRole('ENGINEER');
        setActiveBuildingId(demoBuildingId);
        setActiveTab('inspections');
      }
    },
    {
      step: 10,
      title: 'Step 10: Switch to Authority Role & Review Command Center',
      description: 'NMC Executive Engineer reviews the urgent flagged building on the Authority Dashboard.',
      targetTab: 'authority',
      actionLabel: 'Open Authority Command',
      action: async () => {
        setUserRole('AUTHORITY');
        setActiveTab('authority');
      }
    },
    {
      step: 11,
      title: 'Step 11: Authority Creates Early Safety Alert',
      description: 'Draft an official Municipal Early Warning Alert with statutory instructions and emergency cell helplines.',
      targetTab: 'create-alert',
      actionLabel: 'Draft Safety Alert',
      action: async () => {
        setUserRole('AUTHORITY');
        setActiveBuildingId(demoBuildingId);
        setActiveTab('create-alert');
      }
    },
    {
      step: 12,
      title: 'Step 12: Define Geo-Fenced Alert Radius on Nagpur Map',
      description: 'Establish a 200m cordon buffer around the Cotton Market coordinates to protect surrounding citizens.',
      targetTab: 'risk-map',
      actionLabel: 'Inspect GIS Geo-Fence',
      action: async () => {
        setActiveTab('risk-map');
      }
    },
    {
      step: 13,
      title: 'Step 13: Publish Safety Alert & Trigger Broadcast Simulation',
      description: 'Publish the alert: simulated web push, SMS broadcast, and public feed delivery executed.',
      targetTab: 'authority',
      actionLabel: 'Publish Alert',
      action: async () => {
        setUserRole('AUTHORITY');
        const targetAlert = alerts.find(a => a.buildingId === demoBuildingId) || alerts[0];
        if (targetAlert && targetAlert.status !== 'ACTIVE') {
          publishAlert(targetAlert.id);
        } else {
          // If not created yet, create and publish
          const newAlt = createAlert({
            buildingId: demoBuildingId,
            buildingName: 'Itwari Cotton Ginning Mill Staff Quarters (Block C)',
            ward: 'Zone 7 - Satranjipura',
            area: 'Itwari / Cotton Market',
            latitude: 21.1568,
            longitude: 79.1124,
            alertType: 'RESTRICT_ACCESS',
            severity: 'CRITICAL',
            geoRadiusMeters: 200,
            reasonForAlert: 'Active 8.2mm shear distress at ground plinth. NMC Town Planning & Disaster Cell enforced immediate perimeter cordon.',
            officialInstructions: 'Evacuate ground floor godowns. Maintain a 200m clearance from external masonry walls. Contact NMC Disaster Cell at 0712-2567035.',
            emergencyContact: 'NMC Disaster Cell: 0712-2567035 / Control Room: 101',
            verificationOfficer: 'Shri Manoj S. Talware',
            officerDesignation: 'Executive Engineer (Town Planning & Hazardous Cell), NMC',
            verificationDate: '2026-09-29',
            authorityApprovalBadge: 'NMC-AUTH-SEAL-2026/SAT-89'
          });
          publishAlert(newAlt.id);
        }
        setActiveTab('alerts');
      }
    },
    {
      step: 14,
      title: 'Step 14: Switch to Citizen View & Check Public Safety Portal',
      description: 'Switch to Citizen mode to view the published emergency safety alert banner, affected zone map, and instructions.',
      targetTab: 'alerts',
      actionLabel: 'Switch to Citizen View',
      action: async () => {
        setUserRole('CITIZEN');
        setActiveTab('alerts');
      }
    },
    {
      step: 15,
      title: 'Step 15: Generate Official PDF Report with Provenance',
      description: 'Generate high-fidelity, printable Building Health & Safety Alert PDF report from real database values.',
      targetTab: 'reports',
      actionLabel: 'Open Report Studio',
      action: async () => {
        setActiveBuildingId(demoBuildingId);
        setActiveTab('reports');
      }
    },
    {
      step: 16,
      title: 'Step 16: Authority Resolves Alert Post Structural Retrofitting',
      description: 'Following structural propping and engineered jacketing, Authority formally resolves the emergency alert.',
      targetTab: 'authority',
      actionLabel: 'Resolve Safety Alert',
      action: async () => {
        setUserRole('AUTHORITY');
        const activeAlt = alerts.find(a => a.buildingId === demoBuildingId && a.status === 'ACTIVE') || alerts.find(a => a.status === 'ACTIVE');
        if (activeAlt) {
          resolveAlert(activeAlt.id, 'Structural jacketing and steel shoring completed by licensed engineering contractor. Re-inspection confirmed stability.');
        }
        setActiveTab('authority');
      }
    },
    {
      step: 17,
      title: 'Step 17: Review Complete Health Passport Medical History',
      description: 'Open Health Passport to observe the complete, immutable historical audit trail of all 17 events.',
      targetTab: 'health-passport',
      actionLabel: 'Review Complete Passport',
      action: async () => {
        setActiveBuildingId(demoBuildingId);
        setActiveTab('health-passport');
      }
    }
  ];

  const currentStepObj = steps[currentDemoStep - 1] || steps[0];

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      await currentStepObj.action();
      if (currentDemoStep < steps.length) {
        setCurrentDemoStep(currentDemoStep + 1);
      }
    } finally {
      setIsExecuting(false);
    }
  };

  const handlePrev = () => {
    if (currentDemoStep > 1) {
      setCurrentDemoStep(currentDemoStep - 1);
      const prevObj = steps[currentDemoStep - 2];
      if (prevObj) prevObj.action();
    }
  };

  const handleNext = () => {
    if (currentDemoStep < steps.length) {
      setCurrentDemoStep(currentDemoStep + 1);
      const nextObj = steps[currentDemoStep];
      if (nextObj) nextObj.action();
    }
  };

  if (collapsed) {
    return (
      <div className="bg-purple-50 border-b border-purple-200 shadow-xs text-purple-950 sticky top-0 z-30 py-1 px-4 transition-all">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2 truncate">
            <div className="p-1 bg-purple-600 rounded-md text-white shrink-0">
              <Sparkles className="w-3 h-3" />
            </div>
            <span className="font-mono text-[11px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded shrink-0">
              Step {currentDemoStep}/{steps.length}
            </span>
            <span className="font-bold text-purple-950 truncate text-[11px] sm:text-xs">
              {currentStepObj.title}
            </span>
          </div>

          <div className="flex items-center space-x-1 shrink-0">
            <button
              onClick={handlePrev}
              disabled={currentDemoStep === 1}
              className="p-1 bg-white hover:bg-slate-100 disabled:opacity-40 border border-purple-200 text-purple-900 rounded-md text-xs transition"
              title="Previous Step"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>

            <button
              onClick={handleExecute}
              disabled={isExecuting}
              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-[11px] font-bold shadow-xs transition flex items-center space-x-1"
            >
              <span>{currentStepObj.actionLabel}</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            <button
              onClick={handleNext}
              disabled={currentDemoStep === steps.length}
              className="p-1 bg-white hover:bg-slate-100 disabled:opacity-40 border border-purple-200 text-purple-900 rounded-md text-xs transition"
              title="Next Step"
            >
              <ChevronRight className="w-3 h-3" />
            </button>

            <button
              onClick={() => setCollapsed(false)}
              className="p-1 px-2 bg-white hover:bg-slate-100 border border-purple-200 text-purple-700 rounded-md text-[11px] font-semibold transition flex items-center space-x-1"
              title="Expand Walkthrough Bar"
            >
              <Maximize2 className="w-3 h-3" />
              <span className="hidden sm:inline">Expand Bar</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-purple-50/90 border-b border-purple-200 shadow-xs text-purple-950 relative z-30 transition-all">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Header & Step Counter */}
          <div className="flex items-center space-x-3">
            <div className="p-1.5 bg-purple-600 rounded-lg shadow-sm text-white shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 font-mono">
                  IDEATHON DEMO WALKTHROUGH
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-purple-100 border border-purple-200 rounded-full text-purple-800 font-bold">
                  {currentDemoStep} / {steps.length}
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-purple-950 tracking-tight">
                {currentStepObj.title}
              </h4>
            </div>
          </div>

          <p className="text-xs text-purple-800/90 max-w-xl hidden xl:block leading-snug">
            {currentStepObj.description}
          </p>

          {/* Controls */}
          <div className="flex items-center space-x-1.5 shrink-0 self-end md:self-auto">
            <button
              onClick={handlePrev}
              disabled={currentDemoStep === 1}
              className="px-2 py-1 bg-white hover:bg-slate-100 disabled:opacity-40 border border-purple-200 text-purple-900 rounded-lg text-xs font-medium transition flex items-center shadow-xs"
              title="Previous Step"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleExecute}
              disabled={isExecuting}
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1.5 active:scale-95"
            >
              <span>{currentStepObj.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleNext}
              disabled={currentDemoStep === steps.length}
              className="px-2 py-1 bg-white hover:bg-slate-100 disabled:opacity-40 border border-purple-200 text-purple-900 rounded-lg text-xs font-medium transition flex items-center shadow-xs"
              title="Next Step"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={resetDemoData}
              className="p-1.5 bg-white hover:bg-slate-100 border border-purple-200 text-purple-700 rounded-lg text-xs transition shadow-xs"
              title="Reset Demo Database & Steps"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setCollapsed(true)}
              className="p-1.5 px-2 bg-white hover:bg-slate-100 border border-purple-200 text-purple-700 rounded-lg text-xs font-semibold transition shadow-xs flex items-center space-x-1"
              title="Collapse Bar to Maximize Screen"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Collapse Bar</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
