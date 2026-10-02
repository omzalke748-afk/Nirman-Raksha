/**
 * Environmental Telemetry & Building Vulnerability Analytics
 * Computes:
 * 1. Iron Rebar Atmospheric Rusting / Corrosion Kinetics (Open-Meteo RH% > 60% threshold, temperature, rain)
 * 2. Nagpur Black Cotton Soil Swell-Shrink Foundation Distress Index (GSDA Groundwater & Soil Moisture)
 */

import { EnvironmentalTelemetry, BuildingRecord } from '../types';

export interface CorrosionAndSoilAnalysis {
  timestamp: string;
  // Iron Rusting & Atmospheric Corrosion Kinetics
  corrosionRiskScore: number; // 0 - 100
  corrosionRiskCategory: 'LOW' | 'MODERATE' | 'ELEVATED' | 'CRITICAL_CORROSION';
  criticalHumidityExceeded: boolean; // RH > 60% threshold
  relativeHumidityPct: number;
  temperatureC: number;
  corrosionRateMmPerYear: number; // Estimated rebar loss mm/yr
  corrosionSummary: string;
  chemicalMechanisms: string[];

  // Nagpur Black Cotton Soil Mechanics
  soilType: 'BLACK_COTTON_SOIL' | 'MURRUM_BASALT';
  soilMoisturePct: number;
  groundWaterDepthM: number;
  soilSwellingPressureKpa: number;
  soilThreatCategory: 'OPTIMAL_STABILITY' | 'MODERATE_HEAVE_RISK' | 'HIGH_SWELLING_PRESSURE' | 'SEVERE_DESICCATION_SHRINKAGE';
  soilSummary: string;
  foundationImpactDetails: string[];

  // Actionable Mitigation
  mitigationRecommendations: string[];
}

/**
 * Evaluates corrosion kinetics and soil swell pressure based on live weather + building specifics
 */
export function analyzeCorrosionAndSoil(
  telemetry: EnvironmentalTelemetry,
  building?: BuildingRecord
): CorrosionAndSoilAnalysis {
  const rh = telemetry.relativeHumidityPct;
  const temp = telemetry.temperatureC;
  const precip24h = telemetry.precipitation24hMm;
  const soilMoisture = telemetry.soilMoisturePct;
  const gwDepth = telemetry.groundWaterDepthM;

  // 1. Critical Relative Humidity (RH > 60%) Threshold
  // Scientific consensus: Below 60% RH, atmospheric rusting of mild steel is passivated.
  // Above 60% RH, electrolytic thin-film condensation enables continuous oxidation.
  const criticalHumidityExceeded = rh > 60;
  
  let baseCorrosion = 15; // baseline indoor dry corrosion
  if (criticalHumidityExceeded) {
    const rhExcess = rh - 60;
    // Exponential acceleration with RH above 60%
    baseCorrosion += rhExcess * 1.4;
  }

  // Thermal acceleration (Arrhenius factor for tropical climates like Nagpur)
  if (temp > 28) {
    baseCorrosion += (temp - 28) * 1.1;
  }

  // Active rainfall washing away concrete passivating alkalinity
  if (precip24h > 5) {
    baseCorrosion += Math.min(25, precip24h * 1.5);
  }

  // Building distress modifier
  if (building) {
    const hasCorrosionObs = building.observations.some(o => o.observationType === 'REINFORCEMENT_CORROSION');
    const hasSpallingObs = building.observations.some(o => o.observationType === 'CONCRETE_SPALLING');
    const hasSeepageObs = building.observations.some(o => o.observationType === 'SEEPAGE_DAMPNESS');

    if (hasCorrosionObs) baseCorrosion += 25;
    if (hasSpallingObs) baseCorrosion += 18;
    if (hasSeepageObs) baseCorrosion += 12;

    const buildingAge = building.constructionYear.value ? (2026 - building.constructionYear.value) : 25;
    if (buildingAge > 40) baseCorrosion += 10;
  }

  const corrosionRiskScore = Math.max(5, Math.min(98, Math.round(baseCorrosion)));

  let corrosionRiskCategory: CorrosionAndSoilAnalysis['corrosionRiskCategory'] = 'LOW';
  let corrosionRateMmPerYear = 0.02;

  if (corrosionRiskScore >= 75) {
    corrosionRiskCategory = 'CRITICAL_CORROSION';
    corrosionRateMmPerYear = 0.18;
  } else if (corrosionRiskScore >= 55) {
    corrosionRiskCategory = 'ELEVATED';
    corrosionRateMmPerYear = 0.09;
  } else if (corrosionRiskScore >= 35) {
    corrosionRiskCategory = 'MODERATE';
    corrosionRateMmPerYear = 0.05;
  }

  const chemicalMechanisms = [
    `Relative Humidity: ${rh}% (${criticalHumidityExceeded ? 'EXCEEDS 60% critical threshold for electrolytic film condensation' : 'Below 60% critical threshold — passive atmospheric state'})`,
    `Thermal Kinetics: ${temp}°C ambient accelerates oxygen diffusion and oxidation velocity (Arrhenius Q10 factor)`,
    `Concrete Carbonation: Atmospheric CO₂ reduces concrete pore solution pH from ~13.0 to < 9.0, depassivating steel rebar`,
    `Hydrostatic Plinth Rise: Groundwater at ${gwDepth}m depth creates capillary suction into un-damp-proofed footing members`
  ];

  // 2. Nagpur Black Cotton Soil Mechanics (Vertisols with Montmorillonite Clay)
  // Optimal soil moisture in Nagpur is ~25-35%.
  // Above 45% moisture: heavy volumetric swelling (swelling pressure up to 250 kPa).
  // Below 15% moisture: severe desiccation cracking & foundation subsidence.
  let soilThreatCategory: CorrosionAndSoilAnalysis['soilThreatCategory'] = 'OPTIMAL_STABILITY';
  let soilSwellingPressureKpa = 85; // baseline

  if (soilMoisture > 50) {
    soilThreatCategory = 'HIGH_SWELLING_PRESSURE';
    soilSwellingPressureKpa = 240;
  } else if (soilMoisture > 38) {
    soilThreatCategory = 'MODERATE_HEAVE_RISK';
    soilSwellingPressureKpa = 160;
  } else if (soilMoisture < 18) {
    soilThreatCategory = 'SEVERE_DESICCATION_SHRINKAGE';
    soilSwellingPressureKpa = 40;
  }

  const foundationImpactDetails = [
    `Soil Moisture Saturation: ${soilMoisture}% (Nagpur Black Cotton Soil Clay)`,
    `Swelling Pressure: ~${soilSwellingPressureKpa} kPa calculated against sub-structure footing`,
    `Groundwater Table: ${gwDepth}m below ground level (GSDA Nagpur Zone Monitoring Well)`,
    `Foundation Risk: ${
      soilThreatCategory === 'HIGH_SWELLING_PRESSURE'
        ? 'High moisture surcharge causing upward plinth heave & diagonal masonry shear stress.'
        : soilThreatCategory === 'SEVERE_DESICCATION_SHRINKAGE'
        ? 'Soil shrinkage and tension cracks causing differential settlement at building corners.'
        : 'Stable moisture equilibrium in foundation zone.'
    }`
  ];

  const mitigationRecommendations = [
    criticalHumidityExceeded
      ? 'Perform Half-Cell Electrical Potential Survey (ASTM C876) to identify active rebar corrosion zones before external spalling appears.'
      : 'Maintain routine monsoon drainage inspection and roof downspout clearances.',
    'Apply breathable crystalline penetrative silane-siloxane hydrophobic coating to exterior concrete covers.',
    'Clear 1.5m perimeter plinth apron to prevent direct rainwater ponding on expansive black cotton soil around footings.',
    'Inspect plinth beams for rust staining and micro-cracking exceeding 0.3mm width (IS 456 allowable crack limit).'
  ];

  return {
    timestamp: telemetry.timestamp,
    corrosionRiskScore,
    corrosionRiskCategory,
    criticalHumidityExceeded,
    relativeHumidityPct: rh,
    temperatureC: temp,
    corrosionRateMmPerYear,
    corrosionSummary: criticalHumidityExceeded 
      ? `Atmospheric Relative Humidity (${rh}%) exceeds the 60% critical corrosion initiation threshold. High ambient temperature (${temp}°C) accelerates steel rebar oxidation.`
      : `Atmospheric Relative Humidity (${rh}%) is within safe baseline threshold (<= 60%). Low atmospheric rebar rusting risk.`,
    chemicalMechanisms,
    soilType: 'BLACK_COTTON_SOIL',
    soilMoisturePct: soilMoisture,
    groundWaterDepthM: gwDepth,
    soilSwellingPressureKpa,
    soilThreatCategory,
    soilSummary: `Nagpur Black Cotton clay currently at ${soilMoisture}% moisture with ~${soilSwellingPressureKpa} kPa swelling pressure against foundation footings.`,
    foundationImpactDetails,
    mitigationRecommendations
  };
}
