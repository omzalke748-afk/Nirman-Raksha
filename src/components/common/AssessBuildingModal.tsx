import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { NAGPUR_ZONES } from '../../data/initialData';
import { BuildingCategory, StructuralSystemType, DataStatus } from '../../types';
import { searchNagpurPlaces, reverseGeocodeNagpur, isGoogleMapsConfigured, PlaceSearchResult } from '../../services/googleMapsService';
import { searchMahaVastuRecords, MahaVastuRecord } from '../../services/mahavastuBpmsService';
import { fuseMultiSourceBuildingData } from '../../services/multiSourceService';
import { analyzeCorrosionAndSoil } from '../../services/corrosionAndSoilService';
import {
  Building2,
  X,
  Search,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Compass,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Info,
  ExternalLink,
  Droplets,
  Layers,
  Thermometer,
  FileCheck2,
  FileText,
  MapPin,
  Database,
  HelpCircle,
  Activity,
  UserCheck,
  Check
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  onSuccess: (buildingId: string) => void;
}

export const AssessBuildingModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialQuery = '',
  onSuccess
}) => {
  const { assessAndRegisterBuilding, environment, userRole } = useApp();

  // Wizard Step: 1 = Search, 2 = Confirm Location & Category, 3 = Multi-source Probe, 4 = Data Breakdown, 5 = Observations & Submit, 6 = Completed
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Search & Selection State
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Selected Place/Building Data
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [ward, setWard] = useState('Dharampeth');
  const [zoneNumber, setZoneNumber] = useState<number>(2);
  const [latitude, setLatitude] = useState<number>(21.1458);
  const [longitude, setLongitude] = useState<number>(79.0882);
  const [category, setCategory] = useState<BuildingCategory>('Educational');
  const [buildingType, setBuildingType] = useState<'RESIDENTIAL' | 'COMMERCIAL' | 'INSTITUTIONAL' | 'MIXED_USE' | 'INDUSTRIAL' | 'HERITAGE'>('INSTITUTIONAL');

  // Multi-source Checked Data
  const [matchedBpms, setMatchedBpms] = useState<MahaVastuRecord | null>(null);
  const [fusedDataBreakdown, setFusedDataBreakdown] = useState<any>(null);
  const [probingSources, setProbingSources] = useState(false);

  // Structural & Observations
  const [constructionYear, setConstructionYear] = useState<number | undefined>(undefined);
  const [structuralSystem, setStructuralSystem] = useState<StructuralSystemType>('RCC_FRAME');
  const [numberOfFloors, setNumberOfFloors] = useState<number>(4);
  const [occupancyType, setOccupancyType] = useState('Active Institutional & Administrative Campus');
  const [approximateCapacity, setApproximateCapacity] = useState<number>(500);

  // Distress flags
  const [hasCracks, setHasCracks] = useState(false);
  const [crackDetails, setCrackDetails] = useState('');
  const [hasSeepage, setHasSeepage] = useState(false);
  const [hasCorrosion, setHasCorrosion] = useState(false);
  const [hasSpalling, setHasSpalling] = useState(false);
  const [inspectorNotes, setInspectorNotes] = useState('');

  // Generated building ID upon completion
  const [createdBuildingId, setCreatedBuildingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialQuery) {
        setSearchQuery(initialQuery);
        handleSearch(initialQuery);
      }
    } else {
      // Reset on close
      setCurrentStep(1);
      setMatchedBpms(null);
      setFusedDataBreakdown(null);
      setCreatedBuildingId(null);
    }
  }, [isOpen, initialQuery]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setIsSearching(true);
    const places = await searchNagpurPlaces(query);
    setSearchResults(places);
    setIsSearching(false);
  };

  const handleSelectPlace = (place: PlaceSearchResult) => {
    setName(place.name);
    setAddress(place.formattedAddress || place.address || '');
    setLatitude(place.latitude);
    setLongitude(place.longitude);
    if (place.category) setCategory(place.category);

    const rev = reverseGeocodeNagpur(place.latitude, place.longitude);
    setWard(rev.ward);
    setZoneNumber(rev.zoneNumber);

    setCurrentStep(2);
  };

  const handleRunSourceProbe = async () => {
    setProbingSources(true);
    setCurrentStep(3);

    // Simulate multi-source probe delay for realistic audit experience
    setTimeout(() => {
      // Check BPMS
      const bpmsMatches = searchMahaVastuRecords(name);
      const bpms = bpmsMatches.length > 0 ? bpmsMatches[0] : null;
      setMatchedBpms(bpms);

      // Create fused record draft
      const fused = fuseMultiSourceBuildingData(
        {
          name,
          address,
          ward,
          zoneNumber,
          latitude,
          longitude,
          category,
          buildingType,
          constructionYear,
          numberOfFloors,
          structuralSystem,
          occupancyType,
          approximateCapacity,
          bpmsProposalNo: bpms?.bpmsProposalNo,
          sanctionOrderNo: bpms?.sanctionOrderNo,
          hasObservedCracks: hasCracks,
          hasObservedSeepage: hasSeepage,
          hasObservedCorrosion: hasCorrosion,
          inspectorNotes
        },
        environment
      );

      setFusedDataBreakdown(fused);
      setProbingSources(false);
      setCurrentStep(4);
    }, 900);
  };

  const handleFinalSubmit = () => {
    if (!name.trim()) return;

    const newBuilding = assessAndRegisterBuilding({
      name,
      address,
      ward,
      zoneNumber,
      latitude,
      longitude,
      category,
      buildingType,
      constructionYear,
      structuralSystem,
      numberOfFloors,
      occupancyType,
      approximateCapacity,
      bpmsProposalNo: matchedBpms?.bpmsProposalNo,
      sanctionOrderNo: matchedBpms?.sanctionOrderNo,
      architectName: matchedBpms ? `${matchedBpms.architectName} (${matchedBpms.architectCoaNo})` : undefined,
      structuralEngineer: matchedBpms ? `${matchedBpms.structuralEngineerName} [Lic: ${matchedBpms.structuralEngineerLicense}]` : undefined,
      hasObservedCracks: hasCracks,
      crackDetails: hasCracks ? crackDetails : undefined,
      hasObservedSeepage: hasSeepage,
      hasObservedCorrosion: hasCorrosion,
      inspectorNotes: inspectorNotes || undefined
    });

    setCreatedBuildingId(newBuilding.id);
    setCurrentStep(6);
  };

  if (!isOpen) return null;

  const categories: BuildingCategory[] = [
    'Educational',
    'Healthcare',
    'Residential',
    'Hostel / PG',
    'Commercial',
    'Shopping Mall',
    'Banking / Financial',
    'Government',
    'Court / Legal',
    'Industrial',
    'Public Infrastructure',
    'Examination Centre',
    'Religious',
    'Mixed Use',
    'Other'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-6 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-700 text-white rounded-xl shadow-sm">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Universal Nagpur Building Assessment
                <span className="text-xs font-mono font-medium px-2 py-0.5 bg-teal-100 text-teal-800 rounded-md border border-teal-200">
                  Step {currentStep} of 6
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Identify any structure in Nagpur, probe multi-source verified public datasets & generate an explainable Health Passport.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Tracker Bar */}
        <div className="bg-slate-100 px-6 py-2 border-b border-slate-200 flex items-center justify-between text-xs font-medium text-slate-500 overflow-x-auto">
          <span className={`flex items-center gap-1.5 ${currentStep >= 1 ? 'text-teal-700 font-bold' : ''}`}>
            <span className="w-5 h-5 rounded-full flex items-center justify-center bg-teal-100 text-teal-800 text-[10px]">1</span>
            Search Place
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className={`flex items-center gap-1.5 ${currentStep >= 2 ? 'text-teal-700 font-bold' : ''}`}>
            <span className="w-5 h-5 rounded-full flex items-center justify-center bg-teal-100 text-teal-800 text-[10px]">2</span>
            Confirm Location
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className={`flex items-center gap-1.5 ${currentStep >= 3 ? 'text-teal-700 font-bold' : ''}`}>
            <span className="w-5 h-5 rounded-full flex items-center justify-center bg-teal-100 text-teal-800 text-[10px]">3</span>
            Probe Sources
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className={`flex items-center gap-1.5 ${currentStep >= 4 ? 'text-teal-700 font-bold' : ''}`}>
            <span className="w-5 h-5 rounded-full flex items-center justify-center bg-teal-100 text-teal-800 text-[10px]">4</span>
            Data Breakdown
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className={`flex items-center gap-1.5 ${currentStep >= 5 ? 'text-teal-700 font-bold' : ''}`}>
            <span className="w-5 h-5 rounded-full flex items-center justify-center bg-teal-100 text-teal-800 text-[10px]">5</span>
            Observations
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className={`flex items-center gap-1.5 ${currentStep >= 6 ? 'text-teal-700 font-bold' : ''}`}>
            <span className="w-5 h-5 rounded-full flex items-center justify-center bg-teal-100 text-teal-800 text-[10px]">6</span>
            Health Passport
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* STEP 1: Search / Select Place */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                  Search Any Nagpur Building, Landmark, Institution or Address
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                      placeholder="e.g., VNIT Nagpur, GMC Nagpur, Empress Mall, Sitabuldi, High Court, Sadar..."
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSearch(searchQuery)}
                    disabled={isSearching}
                    className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-xl shadow-sm transition shrink-0"
                  >
                    {isSearching ? 'Searching...' : 'Find Place'}
                  </button>
                </div>
              </div>

              {!isGoogleMapsConfigured() && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Info className="w-4 h-4 text-slate-400" />
                    Using Nagpur municipal geospatial catalog. (Configure <code>VITE_GOOGLE_MAPS_API_KEY</code> for live Google Places API).
                  </span>
                  <span className="text-[11px] font-mono text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    NMC GIS Active
                  </span>
                </div>
              )}

              {/* Search Results list */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                  Select Identified Structure:
                </h4>
                {searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
                    {searchResults.map((place, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectPlace(place)}
                        className="p-3.5 bg-white border border-slate-200 hover:border-teal-500 hover:shadow-md rounded-xl cursor-pointer transition flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-slate-100 text-slate-700 rounded group-hover:bg-teal-50 group-hover:text-teal-700">
                              {place.category || 'Structure'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {place.latitude.toFixed(4)}° N, {place.longitude.toFixed(4)}° E
                            </span>
                          </div>
                          <h5 className="font-bold text-slate-900 text-sm group-hover:text-teal-800">
                            {place.name}
                          </h5>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                            {place.formattedAddress || place.address}
                          </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-teal-700 font-medium">
                          <span>Source: {place.source}</span>
                          <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition">
                            Assess Location <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl">
                    <p className="text-xs text-slate-500">
                      Search above for any college, hospital, mall, government office, bank, school, or address in Nagpur.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Confirm Location & Classification */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-xl flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{name}</h3>
                  <p className="text-xs text-slate-600 mt-0.5">{address}</p>
                  <p className="text-[11px] text-teal-700 font-mono mt-1">
                    Geo-coordinates: {latitude.toFixed(5)}° N, {longitude.toFixed(5)}° E • Ward: {ward} (Zone {zoneNumber})
                  </p>
                </div>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-lg"
                >
                  Change Place
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold uppercase text-slate-600 mb-1">
                    Building Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as BuildingCategory)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-600 mb-1">
                    Municipal Zone (NMC)
                  </label>
                  <select
                    value={zoneNumber}
                    onChange={(e) => {
                      const zn = Number(e.target.value);
                      setZoneNumber(zn);
                      const z = NAGPUR_ZONES.find(z => z.zoneNumber === zn);
                      if (z) setWard(z.name);
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    {NAGPUR_ZONES.map((z) => (
                      <option key={z.zoneNumber} value={z.zoneNumber}>
                        Zone {z.zoneNumber}: {z.name} ({z.officeAddress})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2">
                <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <p>
                  Next, the system will probe all configured public datasets (MahaVastu BPMS, NMC Town Planning, GSDA Hydrogeology, and Open-Meteo Weather telemetry) for available verified records.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: Multi-Source Probe Animation */}
          {currentStep === 3 && (
            <div className="p-12 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <h3 className="text-base font-bold text-slate-800">
                Probing Multi-Source Nagpur Repositories...
              </h3>
              <div className="max-w-md mx-auto space-y-1.5 text-xs text-slate-500 font-mono">
                <p>✓ Checking Google Places / Geocoding metadata</p>
                <p>✓ Querying MahaVastu BPMS Building Sanction Registry</p>
                <p>✓ Retrieving NMC Ward & Zone Boundaries</p>
                <p>✓ Fetching GSDA Maharashtra Groundwater Table</p>
                <p>✓ Sampling Open-Meteo Nagpur Weather Telemetry</p>
              </div>
            </div>
          )}

          {/* STEP 4: Available vs Missing Data Breakdown */}
          {currentStep === 4 && fusedDataBreakdown && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Multi-Source Data Provenance Audit
                  </h4>
                  <p className="text-xs text-slate-500">
                    Authoritative data hierarchy: Official Government Record &gt; Professional Verified &gt; Public Verified &gt; User Provided.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 bg-teal-100 text-teal-800 rounded-lg border border-teal-200">
                  {fusedDataBreakdown.completenessBreakdown.overallPercentage}% Completeness
                </span>
              </div>

              {/* Data Provenance Items */}
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 block">MahaVastu BPMS Record</span>
                    <span className="text-slate-500 text-[11px]">
                      {matchedBpms ? `Proposal: ${matchedBpms.bpmsProposalNo} • Sanction: ${matchedBpms.sanctionOrderNo}` : 'No verified public BPMS file found'}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${matchedBpms ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                    {matchedBpms ? 'OFFICIAL_GOVERNMENT_RECORD' : 'NO PUBLIC RECORD'}
                  </span>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 block">NMC Zone & Ward Jurisdictional Data</span>
                    <span className="text-slate-500 text-[11px]">
                      Zone {zoneNumber} ({ward}) • Municipal Corporation of Nagpur
                    </span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    OFFICIAL_GOVERNMENT_RECORD
                  </span>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 block">Hydrogeology & Soil Context</span>
                    <span className="text-slate-500 text-[11px]">
                      Groundwater: {fusedDataBreakdown.groundwaterDepthMeters}m bgl • Soil: Deep Black Cotton (Vertisol)
                    </span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-700 border border-blue-200">
                    PUBLIC_VERIFIED_SOURCE
                  </span>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 block">Structural Defect Audit</span>
                    <span className="text-slate-500 text-[11px]">
                      Requires physical engineer / field inspection
                    </span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-50 text-amber-700 border border-amber-200">
                    REQUIRES PROFESSIONAL AUDIT
                  </span>
                </div>
              </div>

              {!matchedBpms && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                  <span className="font-bold">Real Data Principle: </span>
                  Verified municipal building sanction records were not found for this specific place. The system will record baseline coordinates and environmental telemetry without fabricating construction dates or floor plans.
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Observational Input & Submit */}
          {currentStep === 5 && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  Structural & Observable Inputs ({name})
                </h4>
                <p className="text-slate-500">
                  Enter observable structural parameters or engineer field notes. Leave unverified fields empty.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Structural System
                  </label>
                  <select
                    value={structuralSystem}
                    onChange={(e) => setStructuralSystem(e.target.value as StructuralSystemType)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="RCC_FRAME">RCC Frame Structure</option>
                    <option value="LOAD_BEARING_BRICK_MASONRY">Load-Bearing Brick Masonry</option>
                    <option value="STEEL_TRUSS_PORTAL">Structural Steel Framing</option>
                    <option value="HERITAGE_STONE_COMPOSITE">Heritage Stone / Composite</option>
                    <option value="PRECAST_CONCRETE">Precast Concrete System</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Number of Floors
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={numberOfFloors}
                    onChange={(e) => setNumberOfFloors(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Approximate Capacity (Persons)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={approximateCapacity}
                    onChange={(e) => setApproximateCapacity(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              {/* Observable Defects Checkboxes */}
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2.5">
                <label className="block font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                  Visual Distress & Field Observations:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={hasCracks}
                      onChange={(e) => setHasCracks(e.target.checked)}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span className="font-medium text-slate-800">Visible Structural / Shear Cracks</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={hasSeepage}
                      onChange={(e) => setHasSeepage(e.target.checked)}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span className="font-medium text-slate-800">Severe Water Seepage / Dampness</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={hasCorrosion}
                      onChange={(e) => setHasCorrosion(e.target.checked)}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span className="font-medium text-slate-800">Exposed / Corroded Rebars (Spalling)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={hasSpalling}
                      onChange={(e) => setHasSpalling(e.target.checked)}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span className="font-medium text-slate-800">Plaster Delamination / Settlement</span>
                  </label>
                </div>

                {hasCracks && (
                  <input
                    type="text"
                    value={crackDetails}
                    onChange={(e) => setCrackDetails(e.target.value)}
                    placeholder="Describe crack location & approximate width (e.g. 3.2mm diagonal shear crack on ground floor column C-4)..."
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg mt-2"
                  />
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Professional / Field Notes
                </label>
                <textarea
                  rows={2}
                  value={inspectorNotes}
                  onChange={(e) => setInspectorNotes(e.target.value)}
                  placeholder="Additional notes regarding foundation settlement, unauthorized modifications, or maintenance condition..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          )}

          {/* STEP 6: Health Passport Created */}
          {currentStep === 6 && createdBuildingId && (
            <div className="p-8 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Check className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Building Health Passport Created Successfully
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-1">
                  Passport ID: {createdBuildingId} • {name}
                </p>
              </div>
              <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                The building has been registered into the Nagpur Universal Safety System. All multi-source verified attributes, environmental baselines, and initial risk indicators are now catalogued in the permanent lifecycle ledger.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => {
                    onSuccess(createdBuildingId);
                    onClose();
                  }}
                  className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-xl shadow-sm transition flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  View Building Health Passport
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div>
            {currentStep > 1 && currentStep < 6 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-xl flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Previous Step
              </button>
            )}
          </div>

          <div className="flex gap-2">
            {currentStep === 1 && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
            )}

            {currentStep === 2 && (
              <button
                type="button"
                onClick={handleRunSourceProbe}
                className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
              >
                Probe Multi-Source Repositories <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {currentStep === 4 && (
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
              >
                Continue to Observations <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {currentStep === 5 && (
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="px-6 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Generate Building Health Passport
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
