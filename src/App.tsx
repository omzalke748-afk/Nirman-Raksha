import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { DisclaimerBanner } from './components/common/DisclaimerBanner';
import { DemoStoryGuide } from './components/common/DemoStoryGuide';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { BuildingsPage } from './pages/BuildingsPage';
import { HealthPassportPage } from './pages/HealthPassportPage';
import { RiskMapPage } from './pages/RiskMapPage';
import { InspectionsPage } from './pages/InspectionsPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { EnvironmentPage } from './pages/EnvironmentPage';
import { PublicAlertsPage } from './pages/PublicAlertsPage';
import { AuthorityDashboardPage } from './pages/AuthorityDashboardPage';
import { CreateAlertPage } from './pages/CreateAlertPage';
import { ReportsPage } from './pages/ReportsPage';
import { DataSourcesPage } from './pages/DataSourcesPage';
import { DataQualityPage } from './pages/DataQualityPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { SettingsPage } from './pages/SettingsPage';

import { NotificationCenterModal } from './components/common/NotificationCenterModal';
import { ShieldAlert, X, ArrowRight, Wrench, AlertTriangle, Radio, Volume2 } from 'lucide-react';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const {
    activeAlertNotification,
    dismissAlertNotification,
    activeNoticeNotification,
    dismissNoticeNotification,
    activeDemolitionNotification,
    dismissDemolitionNotification,
    isNotificationCenterOpen,
    toggleNotificationCenter,
    setActiveBuildingId,
    alerts,
    demolitionOrders,
    userRole
  } = useApp();

  const handleOpenAlertBuilding = (buildingId: string) => {
    setActiveBuildingId(buildingId);
    dismissAlertNotification();
    dismissNoticeNotification();
    dismissDemolitionNotification();
    setActiveTab('health-passport');
  };

  const [dismissedAlertTicker, setDismissedAlertTicker] = useState(false);
  const activeEmergencyAlert = alerts.find(a => a.status === 'ACTIVE');

  const renderContent = () => {
    switch (activeTab) {
      case 'landing':
        return <LandingPage setActiveTab={setActiveTab} />;
      case 'dashboard':
        return <DashboardPage setActiveTab={setActiveTab} />;
      case 'buildings':
        return <BuildingsPage setActiveTab={setActiveTab} />;
      case 'health-passport':
        return <HealthPassportPage setActiveTab={setActiveTab} />;
      case 'risk-map':
        return <DashboardPage setActiveTab={setActiveTab} />;
      case 'inspections':
        return <InspectionsPage setActiveTab={setActiveTab} />;
      case 'maintenance':
        return <MaintenancePage setActiveTab={setActiveTab} />;
      case 'environment':
        return <EnvironmentPage />;
      case 'alerts':
        return <PublicAlertsPage setActiveTab={setActiveTab} />;
      case 'authority':
        return <AuthorityDashboardPage setActiveTab={setActiveTab} />;
      case 'create-alert':
        return <CreateAlertPage setActiveTab={setActiveTab} />;
      case 'reports':
        return <ReportsPage setActiveTab={setActiveTab} />;
      case 'data-sources':
        return <DataSourcesPage />;
      case 'data-quality':
        return <DataQualityPage setActiveTab={setActiveTab} />;
      case 'documents':
        return <DocumentsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage setActiveTab={setActiveTab} />;
    }
  };

  const isMapScreen = activeTab === 'dashboard' || activeTab === 'risk-map';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Top Statutory Civic Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Citizen Emergency Warning Ticker ONLY if an active high/critical broadcast alert was generated/published */}
      {activeEmergencyAlert && !dismissedAlertTicker && (
        <div className="bg-red-600 text-white px-4 py-2 text-xs font-medium flex items-center justify-between shadow-xs sticky top-0 z-50 animate-fadeIn">
          <div className="flex items-center space-x-2 truncate">
            <span className="flex h-2.5 w-2.5 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
            <span className="font-extrabold uppercase font-mono tracking-wider shrink-0">
              🚨 NMC EMERGENCY ALERT:
            </span>
            <span className="truncate">
              {activeEmergencyAlert.reasonForAlert || 'Statutory evacuation and safety cordons enforced in designated zones.'}
            </span>
          </div>

          <div className="flex items-center space-x-2 shrink-0 ml-3">
            <button
              onClick={() => toggleNotificationCenter(true)}
              className="px-2.5 py-0.5 bg-white text-red-700 hover:bg-red-50 rounded-lg font-bold font-mono text-[11px] transition shadow-xs"
            >
              View Broadcast Inbox →
            </button>
            <button
              onClick={() => setDismissedAlertTicker(true)}
              className="text-white/80 hover:text-white p-1 rounded hover:bg-red-700 transition"
              title="Dismiss warning banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Guided 17-Step Ideathon Presentation Tourbar */}
      <DemoStoryGuide setActiveTab={setActiveTab} />

      {/* Main Header with Search & Role Switcher */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Body Layout */}
      <div className="flex-1 flex max-w-[1800px] w-full mx-auto">
        {/* Collapsible / Expandable Sidebar for Extended Functions */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content Viewport */}
        <main className={`flex-1 ${isMapScreen ? 'p-2 sm:p-3 lg:p-4' : 'p-4 sm:p-6 lg:p-8'} overflow-y-auto max-w-full`}>
          {renderContent()}
        </main>
      </div>

      {/* Universal Notification Center Modal / Drawer */}
      <NotificationCenterModal
        isOpen={isNotificationCenterOpen}
        onClose={() => toggleNotificationCenter(false)}
        setActiveTab={setActiveTab}
      />

      {/* Broadcast Alert Popup Notification Toast */}
      {activeAlertNotification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-bounce">
          <div className="bg-red-950 border-2 border-red-500 rounded-2xl p-5 shadow-2xl space-y-3 text-left">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2 text-red-400 font-bold font-mono text-xs uppercase tracking-wider">
                <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse shrink-0" />
                <span>🚨 EMERGENCY SAFETY BROADCAST</span>
              </div>
              <button
                onClick={dismissAlertNotification}
                className="text-red-300 hover:text-white p-1 rounded hover:bg-red-900/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h4 className="text-sm font-bold text-white leading-snug">
              {activeAlertNotification.buildingName} ({activeAlertNotification.ward})
            </h4>

            <p className="text-xs text-red-200/90 leading-relaxed">
              {activeAlertNotification.reasonForAlert}
            </p>

            <div className="bg-slate-950/80 p-2.5 rounded-lg border border-red-900 text-[11px] text-amber-200 font-mono">
              <strong>Directive:</strong> {activeAlertNotification.officialInstructions}
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-[10px] text-red-300/80 font-mono">
                Cordon Buffer: {activeAlertNotification.geoRadiusMeters}m
              </span>
              <button
                onClick={() => handleOpenAlertBuilding(activeAlertNotification.buildingId)}
                className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold text-xs shadow transition flex items-center space-x-1"
              >
                <span>View Emergency Notice</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Demolition Order Broadcast Toast */}
      {activeDemolitionNotification && !activeAlertNotification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-bounce">
          <div className="bg-slate-950 border-2 border-red-500 rounded-2xl p-5 shadow-2xl space-y-3 text-left">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2 text-red-400 font-bold font-mono text-xs uppercase tracking-wider">
                <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse shrink-0" />
                <span>🏚️ SECTION 264 DEMOLITION ORDER</span>
              </div>
              <button
                onClick={dismissDemolitionNotification}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h4 className="text-sm font-bold text-white leading-snug">
              {activeDemolitionNotification.buildingName} (Zone {activeDemolitionNotification.zoneNumber})
            </h4>

            <p className="text-xs text-slate-300 leading-relaxed">
              Structure declared C-1 Condemned. Exceeded design lifespan ({activeDemolitionNotification.buildingAgeYears} yrs). Demolition scheduled on {activeDemolitionNotification.demolitionExecutionDate}.
            </p>

            <div className="bg-red-950/70 p-2.5 rounded-lg border border-red-800 text-[11px] text-red-200 font-mono">
              <strong>Evacuation Deadline:</strong> {activeDemolitionNotification.evacuationDeadline}
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-[10px] text-slate-400 font-mono">
                Cordon: {activeDemolitionNotification.safetyPerimeterRadiusMeters}m
              </span>
              <button
                onClick={() => handleOpenAlertBuilding(activeDemolitionNotification.buildingId)}
                className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold text-xs shadow transition flex items-center space-x-1"
              >
                <span>View Condemned Passport</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Directive Toast */}
      {activeNoticeNotification && !activeAlertNotification && !activeDemolitionNotification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-bounce">
          <div className="bg-white border-2 border-amber-500 rounded-2xl p-5 shadow-2xl space-y-3 text-left">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2 text-amber-700 font-bold font-mono text-xs uppercase tracking-wider">
                <Wrench className="w-5 h-5 text-amber-600 shrink-0" />
                <span>🛠️ SECTION 265 MAINTENANCE DIRECTIVE</span>
              </div>
              <button
                onClick={dismissNoticeNotification}
                className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h4 className="text-sm font-bold text-slate-900 leading-snug">
              {activeNoticeNotification.buildingName} ({activeNoticeNotification.ward})
            </h4>

            <p className="text-xs text-slate-600 leading-relaxed">
              {activeNoticeNotification.description}
            </p>

            <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-[11px] text-amber-950 font-mono">
              <strong>Statutory Compliance Deadline:</strong> {activeNoticeNotification.complianceDeadline}
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-[10px] text-slate-500 font-mono">
                {activeNoticeNotification.priority} Priority
              </span>
              <button
                onClick={() => handleOpenAlertBuilding(activeNoticeNotification.buildingId)}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-xs shadow transition flex items-center space-x-1"
              >
                <span>View Directives</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
