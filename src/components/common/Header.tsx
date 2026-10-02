import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { AssessBuildingModal } from './AssessBuildingModal';
import { searchNagpurPlaces } from '../../services/googleMapsService';
import {
  Shield,
  Search,
  AlertTriangle,
  Sparkles,
  CloudSun,
  UserCheck,
  Building2,
  Bell,
  MapPin,
  ChevronDown,
  PlusCircle,
  ShieldCheck,
  Building,
  Info,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  const {
    userRole,
    setUserRole,
    demoMode,
    setDemoMode,
    environment,
    alerts,
    buildings,
    setActiveBuildingId,
    unreadCount,
    toggleNotificationCenter
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchWarning, setSearchWarning] = useState<string | null>(null);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [matchedPlaces, setMatchedPlaces] = useState<Array<{
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    category?: string;
    ward?: string;
    source: string;
    existingId?: string;
  }>>([]);
  const [isAssessModalOpen, setIsAssessModalOpen] = useState(false);
  const [assessPrefillName, setAssessPrefillName] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Fullscreen request failed:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const activeAlertCount = alerts.filter(a => a.status === 'ACTIVE').length;

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    const lower = val.toLowerCase();

    // Check outside Nagpur scope
    const outsideCities = ['mumbai', 'pune', 'delhi', 'bangalore', 'bengaluru', 'hyderabad', 'chennai', 'kolkata', 'ahmedabad', 'thane', 'nashik', 'aurangabad'];
    const matchedOutside = outsideCities.find(c => lower.includes(c));

    if (matchedOutside) {
      setSearchWarning(`"${val}" is outside operating scope. NIRMAN-RAKSHA is currently calibrated for Nagpur Municipal Corporation (NMC) jurisdiction.`);
      setMatchedPlaces([]);
    } else {
      setSearchWarning(null);
      if (val.trim().length > 1) {
        // Search registered buildings first
        const registered = buildings
          .filter(b =>
            b.name.toLowerCase().includes(lower) ||
            b.ward.toLowerCase().includes(lower) ||
            b.area.toLowerCase().includes(lower) ||
            b.id.toLowerCase().includes(lower) ||
            (b.category && b.category.toLowerCase().includes(lower))
          )
          .map(b => ({
            name: b.name,
            address: `${b.address} • ${b.ward}`,
            latitude: b.latitude,
            longitude: b.longitude,
            category: b.category || b.buildingType,
            ward: b.ward,
            source: 'Registered Health Passport',
            existingId: b.id
          }));

        // Search places catalog/geocoding
        const places = await searchNagpurPlaces(val);
        const externalPlaces = places
          .filter(p => !registered.some(r => r.name.toLowerCase() === p.name.toLowerCase()))
          .map(p => ({
            name: p.name,
            address: p.formattedAddress || p.address || '',
            latitude: p.latitude,
            longitude: p.longitude,
            category: p.category,
            ward: p.ward,
            source: p.source,
            existingId: undefined
          }));

        setMatchedPlaces([...registered, ...externalPlaces].slice(0, 8));
      } else {
        setMatchedPlaces([]);
      }
    }
  };

  const handleSelectResult = (item: typeof matchedPlaces[0]) => {
    if (item.existingId) {
      setActiveBuildingId(item.existingId);
      setActiveTab('health-passport');
    } else {
      setAssessPrefillName(item.name);
      setIsAssessModalOpen(true);
    }
    setSearchQuery('');
    setMatchedPlaces([]);
  };

  const handleOpenAssessWithQuery = () => {
    setAssessPrefillName(searchQuery.trim());
    setIsAssessModalOpen(true);
    setMatchedPlaces([]);
  };

  const roles: { id: UserRole; label: string; desc: string; color: string }[] = [
    { id: 'CITIZEN', label: '1. Citizen View', desc: 'Search buildings, view public safety alerts & safe zones', color: 'text-emerald-700' },
    { id: 'ENGINEER', label: '2. Licensed Structural Engineer', desc: 'Add inspections, defects, NDT tests & verify observations', color: 'text-teal-700' },
    { id: 'INSPECTOR', label: '3. Field Inspector', desc: 'Record field observations, take photos & submit condition reports', color: 'text-cyan-700' },
    { id: 'AUTHORITY', label: '4. NMC / Municipal Authority', desc: 'Triage high risks, approve findings & issue 2 km geo-broadcast warnings', color: 'text-slate-900' },
    { id: 'ADMIN', label: '5. System Admin', desc: 'Configure data sources, user roles & system parameters', color: 'text-amber-800' }
  ];

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            
            {/* Logo & Civic Identity */}
            <div
              className="flex items-center space-x-3 shrink-0 cursor-pointer group"
              onClick={() => setActiveTab('dashboard')}
            >
              <img
                src="/logo.png"
                alt="NIRMAN-RAKSHA"
                className="w-10 h-10 rounded-xl object-contain shadow-xs border border-slate-200/80 bg-white group-hover:scale-105 transition-transform"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-lg tracking-tight text-slate-900">
                    NIRMAN-RAKSHA
                  </span>
                  <span className="px-2 py-0.5 bg-teal-50 border border-teal-200 rounded-full text-[10px] font-mono text-teal-800 font-bold tracking-wide">
                    NAGPUR
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
                  Universal Building Health & Decision-Support System
                </p>
              </div>
            </div>

            {/* Universal Search Box */}
            <div className="flex-1 max-w-xl relative hidden md:block">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search any building, institution, landmark or address in Nagpur..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-16 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 font-sans shadow-xs transition"
                />
                <span className="absolute right-2.5 top-2 text-[10px] font-mono text-slate-500 border border-slate-200 bg-white rounded px-1.5 py-0.5 font-bold">
                  NMC GIS
                </span>
              </div>

              {/* Scope Restriction Warning */}
              {searchWarning && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-amber-900 shadow-xl z-50">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="font-medium">{searchWarning}</p>
                  </div>
                </div>
              )}

              {/* Search Dropdown Results */}
              {searchQuery.trim().length > 1 && matchedPlaces.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  
                  {matchedPlaces.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectResult(item)}
                      className="w-full px-3.5 py-2.5 text-left hover:bg-slate-50 flex items-center justify-between transition"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="text-xs font-bold text-slate-900 flex items-center space-x-2 truncate">
                          <span className="truncate">{item.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded border border-slate-200 shrink-0">
                            {item.category || 'Structure'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center space-x-2 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{item.address}</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded shrink-0 border ${
                        item.existingId
                          ? 'bg-teal-50 text-teal-800 border-teal-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {item.existingId ? 'HEALTH PASSPORT' : 'ASSESS PLACE →'}
                      </span>
                    </button>
                  ))}

                  {/* Direct Assess Action */}
                  <div
                    onClick={handleOpenAssessWithQuery}
                    className="p-3 bg-teal-50/80 hover:bg-teal-100/80 cursor-pointer flex items-center justify-between text-xs text-teal-900 font-medium transition"
                  >
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-teal-700 shrink-0" />
                      <span>
                        Assess & generate Health Passport for <strong>"{searchQuery}"</strong>
                      </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-700 text-white px-2.5 py-1 rounded-lg shadow-xs">
                      + Assess Now →
                    </span>
                  </div>

                </div>
              )}
            </div>

            {/* Right Action Icons & Controls */}
            <div className="flex items-center space-x-2.5">
              
              {/* Primary Action Button: + ASSESS ANY BUILDING */}
              <button
                onClick={() => {
                  setAssessPrefillName('');
                  setIsAssessModalOpen(true);
                }}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
                title="Universal intake: assess any structure, college, hospital, mall or complex across Nagpur"
              >
                <PlusCircle className="w-4 h-4 text-white" />
                <span>+ ASSESS ANY BUILDING</span>
              </button>

              {/* Live Nagpur Telemetry Capsule */}
              <button
                onClick={() => setActiveTab('environment')}
                className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 text-xs transition shadow-xs"
                title="Live Nagpur weather, groundwater & Black Cotton soil telemetry"
              >
                <CloudSun className="w-4 h-4 text-amber-600" />
                <div className="text-left font-mono text-[11px] leading-tight text-slate-700">
                  <span className="font-bold">{environment.temperatureC}°C</span>
                  <span className="ml-1.5 text-slate-500 font-medium">
                    RH {environment.relativeHumidityPct}%
                  </span>
                </div>
                <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
              </button>

              {/* Public Safety Alerts & Municipal Notices Pill */}
              <button
                onClick={() => toggleNotificationCenter(true)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                  unreadCount > 0
                    ? 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
                title="Open Municipal Broadcast & Notification Center"
              >
                <Bell className={`w-3.5 h-3.5 ${unreadCount > 0 ? 'text-red-600 animate-bounce' : 'text-slate-400'}`} />
                <span className="hidden sm:inline">Broadcasts</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-red-600 text-white font-mono text-[10px] rounded-full animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* RBAC Role Selector Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold transition shadow-xs"
                >
                  <UserCheck className="w-3.5 h-3.5 text-teal-700" />
                  <span className="hidden sm:inline capitalize">
                    {userRole === 'AUTHORITY' ? 'NMC Authority' : userRole.toLowerCase()}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>

                {showRoleDropdown && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                        SELECT ROLE PERSPECTIVE
                      </p>
                    </div>

                    <div className="p-1 space-y-1">
                      {roles.map(r => (
                        <button
                          key={r.id}
                          onClick={() => {
                            setUserRole(r.id);
                            setShowRoleDropdown(false);
                          }}
                          className={`w-full px-3 py-2 text-left rounded-xl text-xs transition flex flex-col ${
                            userRole === r.id
                              ? 'bg-teal-50 border border-teal-200 text-teal-900 font-bold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className={`font-bold ${r.color}`}>{r.label}</span>
                          <span className="text-[10px] text-slate-500 font-normal mt-0.5">{r.desc}</span>
                        </button>
                      ))}
                    </div>

                    <div className="px-3.5 pt-2 mt-1 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400">DEMO MODE</span>
                      <button
                        onClick={() => setDemoMode(!demoMode)}
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border transition ${
                          demoMode
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-slate-100 text-slate-600 border-slate-300'
                        }`}
                      >
                        {demoMode ? 'DEMO ACTIVE' : 'OFFICIAL REAL DATA'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Fullscreen & Immersion Toggle Button */}
              <button
                onClick={handleToggleFullscreen}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 hover:text-slate-950 text-xs font-bold transition shadow-xs flex items-center justify-center"
                title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Enter Fullscreen Presentation Mode (F11)'}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4 text-teal-700" />
                ) : (
                  <Maximize2 className="w-4 h-4 text-slate-600" />
                )}
              </button>

            </div>

          </div>
        </div>
      </header>

      {/* Universal Assess Building Modal */}
      <AssessBuildingModal
        isOpen={isAssessModalOpen}
        onClose={() => setIsAssessModalOpen(false)}
        initialQuery={assessPrefillName}
        onSuccess={(id) => {
          setActiveBuildingId(id);
          setActiveTab('health-passport');
        }}
      />
    </>
  );
};
