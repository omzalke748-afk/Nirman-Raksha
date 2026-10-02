import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AssessBuildingModal } from './AssessBuildingModal';
import {
  Map,
  Building2,
  HeartPulse,
  ClipboardCheck,
  Wrench,
  CloudRain,
  ShieldAlert,
  FileBarChart2,
  Database,
  CheckCircle2,
  FileText,
  Sliders,
  Radio,
  PlusCircle,
  Activity,
  ChevronLeft,
  ChevronRight,
  Layers,
  Search,
  Lock,
  Compass
} from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  const { userRole, alerts, dataSources, setActiveBuildingId } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAssessModalOpen, setIsAssessModalOpen] = useState(false);

  const activeAlertsCount = alerts.filter(a => a.status === 'ACTIVE').length;

  interface NavItem {
    id: string;
    label: string;
    icon: any;
    category: string;
    badge?: number | string;
    badgeColor?: string;
    roleRestricted?: string[];
    isAssessTrigger?: boolean;
  }

  const navItems: NavItem[] = [
    // MAIN NAVIGATION
    { id: 'dashboard', label: 'Civic Overview & Map', icon: Map, category: 'MAIN' },
    { id: 'buildings', label: 'Building Registry', icon: Building2, category: 'MAIN' },
    { id: 'assess-trigger', label: '+ Assess Any Building', icon: PlusCircle, category: 'MAIN', isAssessTrigger: true },
    { id: 'health-passport', label: 'Health Passport', icon: HeartPulse, category: 'MAIN' },
    { id: 'inspections', label: 'Inspections & Defects', icon: ClipboardCheck, category: 'MAIN', roleRestricted: ['ENGINEER', 'INSPECTOR', 'AUTHORITY', 'ADMIN'] },
    { id: 'maintenance', label: 'Maintenance Ledger', icon: Wrench, category: 'MAIN', roleRestricted: ['ENGINEER', 'INSPECTOR', 'AUTHORITY', 'ADMIN'] },
    { id: 'environment', label: 'Live Environment & Soil', icon: CloudRain, category: 'MAIN' },
    { id: 'reports', label: 'Reports & Assessment Study', icon: FileBarChart2, category: 'MAIN' },

    // CITIZEN SPECIFIC
    { id: 'alerts', label: 'Public Safety Alerts', icon: ShieldAlert, badge: activeAlertsCount > 0 ? activeAlertsCount : undefined, badgeColor: 'bg-red-600', category: 'PUBLIC SAFETY' },

    // AUTHORITY WORKFLOW ONLY
    { id: 'authority', label: 'Authority Command & Queue', icon: Radio, category: 'MUNICIPAL AUTHORITY', roleRestricted: ['AUTHORITY', 'ADMIN'] },
    { id: 'create-alert', label: 'Issue 2km Geo-Warning', icon: ShieldAlert, category: 'MUNICIPAL AUTHORITY', roleRestricted: ['AUTHORITY', 'ADMIN'] },

    // SYSTEM ADMIN
    { id: 'data-sources', label: 'Data Sources & Provenance', icon: Database, category: 'ADMINISTRATION', roleRestricted: ['ADMIN', 'AUTHORITY'] },
    { id: 'data-quality', label: 'Data Quality & Provenance', icon: CheckCircle2, category: 'ADMINISTRATION', roleRestricted: ['ADMIN'] },
    { id: 'documents', label: 'Document Vault', icon: FileText, category: 'ADMINISTRATION', roleRestricted: ['ADMIN', 'AUTHORITY', 'ENGINEER'] },
    { id: 'settings', label: 'System Settings & Audit Log', icon: Sliders, category: 'ADMINISTRATION', roleRestricted: ['ADMIN'] },
  ];

  const categories = Array.from(new Set(navItems.map(item => item.category)));

  const handleItemClick = (item: NavItem) => {
    if (item.isAssessTrigger) {
      setIsAssessModalOpen(true);
    } else {
      setActiveTab(item.id);
    }
  };

  return (
    <>
      <aside
        className={`${
          isCollapsed ? 'w-16' : 'w-64'
        } bg-white border-r border-slate-200 shrink-0 hidden md:flex flex-col justify-between overflow-y-auto h-[calc(100vh-4rem)] sticky top-16 select-none p-3 transition-all duration-300 shadow-xs`}
      >
        <div className="space-y-4">
          
          {/* Sidebar Header with Collapse / Expand Toggle */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            {!isCollapsed && (
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-teal-700" />
                <span>NAGPUR SYSTEM</span>
              </span>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition ${
                isCollapsed ? 'mx-auto' : ''
              }`}
              title={isCollapsed ? 'Expand Navigation Sidebar' : 'Collapse Sidebar to Maximize Map'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Grouped Nav Items */}
          {categories.map(category => {
            const items = navItems.filter(item => {
              if (item.category !== category) return false;
              if (item.roleRestricted && !item.roleRestricted.includes(userRole)) return false;
              return true;
            });

            if (items.length === 0) return null;

            return (
              <div key={category} className="space-y-1">
                {!isCollapsed && (
                  <div className="px-2.5 text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                    {category}
                  </div>
                )}
                {items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      title={isCollapsed ? item.label : undefined}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        item.isAssessTrigger
                          ? 'bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100'
                          : isActive
                          ? 'bg-teal-700 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${
                          item.isAssessTrigger
                            ? 'text-teal-700'
                            : isActive
                            ? 'text-white'
                            : 'text-slate-500'
                        }`} />
                        {!isCollapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </div>

                      {!isCollapsed && item.badge !== undefined && (
                        <span className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] text-white font-bold ${
                          item.badgeColor || 'bg-teal-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}

        </div>

        {/* Footer Philosophy Tagline */}
        {!isCollapsed && (
          <div className="pt-3 border-t border-slate-200 text-center space-y-1.5 flex flex-col items-center">
            <img src="/logo.png" alt="Logo" className="w-7 h-7 rounded-lg object-contain opacity-80 hover:opacity-100 transition" />
            <p className="text-[10px] text-slate-500 font-medium italic">
              "Built for today's assessment. Designed for tomorrow's building history."
            </p>
            <p className="text-[9px] font-mono text-slate-400">
              NIRMAN-RAKSHA v2.4 • Nagpur Pilot
            </p>
          </div>
        )}
      </aside>

      <AssessBuildingModal
        isOpen={isAssessModalOpen}
        onClose={() => setIsAssessModalOpen(false)}
        onSuccess={(id) => {
          setActiveBuildingId(id);
          setActiveTab('health-passport');
        }}
      />
    </>
  );
};
