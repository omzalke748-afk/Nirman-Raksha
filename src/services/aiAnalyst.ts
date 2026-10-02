import { BuildingRecord } from '../types';
import { computeWhatChanged } from './riskEngine';

export interface AIResponse {
  answer: string;
  evidencePoints: string[];
  missingPoints: string[];
  recommendedChecklist: string[];
  confidenceNote: string;
  disclaimer: string;
}

export function generateAIAnalysis(building: BuildingRecord, query: string): AIResponse {
  const normalizedQuery = query.toLowerCase();
  const whatChanged = computeWhatChanged(building);

  const evidencePoints: string[] = [];
  const missingPoints: string[] = [...building.missingDataWarnings];
  const recommendedChecklist: string[] = [];

  // Build grounded evidence base
  if (building.observations.length > 0) {
    building.observations.forEach(o => {
      evidencePoints.push(`Field Observation (${o.date}): ${o.severity} ${o.observationType.replace(/_/g, ' ')} located at "${o.locationDetails}". Recorded by ${o.inspectorName}.`);
    });
  } else {
    evidencePoints.push('No specific structural defects recorded in the active inspection log.');
  }

  if (building.constructionYear.value) {
    const age = 2026 - building.constructionYear.value;
    evidencePoints.push(`Building Age: ${age} years (Erected ${building.constructionYear.value}, Status: ${building.constructionYear.status}).`);
  } else {
    missingPoints.push('Construction year unverified in public municipal register.');
  }

  if (building.structuralSystem.value && building.structuralSystem.value !== 'UNVERIFIED') {
    evidencePoints.push(`Structural System: ${building.structuralSystem.value.replace(/_/g, ' ')} (Source: ${building.structuralSystem.source}).`);
  } else {
    missingPoints.push('Framing system unverified (RCC vs Load Bearing Masonry).');
  }

  if (building.officialMunicipalStatus.value) {
    evidencePoints.push(`Municipal Classification: ${building.officialMunicipalStatus.value} (Source: ${building.officialMunicipalStatus.source}).`);
  }

  let answer = '';

  if (normalizedQuery.includes('why') && (normalizedQuery.includes('flagged') || normalizedQuery.includes('risk') || normalizedQuery.includes('score'))) {
    answer = `Based strictly on verified stored records, **${building.name}** has been assigned a **${building.riskIndicator}** risk indicator (Score: ${building.riskScore}/100).\n\n` +
      `**Primary Contributing Factors:**\n` +
      building.riskFactors.map(f => `- **${f.factor}** (${f.type === 'NEGATIVE' ? 'Risk Factor' : 'Mitigating Factor'}): ${f.description}`).join('\n') + '\n\n' +
      `**Data Completeness:** Verified data is available for ${building.dataConfidenceScore}% of standard evaluation categories. ` +
      (missingPoints.length > 0 ? `Please note that critical parameters are still missing: ${missingPoints.slice(0, 2).join(', ')}.` : 'Comprehensive baseline documentation is available.');

    recommendedChecklist.push('Conduct on-site non-destructive rebound hammer / ultrasonic pulse velocity testing');
    recommendedChecklist.push('Inspect column-beam junctions for micro-cracking and rebar corrosion');
    recommendedChecklist.push('Verify plumbing lines for active moisture infiltration');
  } else if (normalizedQuery.includes('what changed') || normalizedQuery.includes('change') || normalizedQuery.includes('previous')) {
    answer = `**Inspection Differential ("What Changed?"):**\n\n` +
      `${whatChanged.explanation}\n\n` +
      `**Key Observed Deltas:**\n` +
      (whatChanged.deltaFactors.length > 0
        ? whatChanged.deltaFactors.map(d => `- ${d}`).join('\n')
        : '- No structural change detected between recent records.') + '\n\n' +
      `**Risk Indicator Transition:** Previous Assessment: **${whatChanged.previousRisk}** → Current Assessment: **${whatChanged.currentRisk}**.`;

    recommendedChecklist.push('Re-verify crack widths using calibrated optical crack comparator');
    recommendedChecklist.push('Check for secondary settlement cracks in adjacent structural bays');
  } else if (normalizedQuery.includes('missing') || normalizedQuery.includes('incomplete') || normalizedQuery.includes('data')) {
    answer = `**Missing Verified Records & Data Gaps:**\n\n` +
      (missingPoints.length > 0
        ? `The following required parameters are currently unrecorded or unavailable in public registers:\n` + missingPoints.map(m => `- ⚠️ ${m}`).join('\n')
        : 'All standard structural baseline parameters are documented and verified.') + '\n\n' +
      `**Important:** The system does NOT assume a building is safe merely because documentation is missing. Missing data limits the precision of our prototype indicators and necessitates physical inspection.`;

    recommendedChecklist.push('Retrieve original municipal sanctioned blueprint from NMC Town Planning Archive');
    recommendedChecklist.push('Upload accredited Structural Stability Certificate for the current cycle');
  } else if (normalizedQuery.includes('maintenance') || normalizedQuery.includes('repair') || normalizedQuery.includes('fix')) {
    answer = `**Maintenance Observations & Priorities:**\n\n` +
      `The recommended maintenance priority for this structure is **${building.maintenancePriority}**.\n\n` +
      `**Available Maintenance Records:** ${building.maintenance.length} documented repair event(s).\n` +
      (building.maintenance.length > 0
        ? building.maintenance.map(m => `- ${m.date}: ${m.repairType.replace(/_/g, ' ')} by ${m.contractorName} (${m.status}) - "${m.description}"`).join('\n')
        : '- No prior structural maintenance or repair logs uploaded.') + '\n\n' +
      `**Actionable Recommendations:**\n${building.recommendedProfessionalAction}`;

    recommendedChecklist.push('Engage a licensed structural repair contractor');
    recommendedChecklist.push('Apply polymer-modified mortar and anti-carbonation coating to exposed concrete');
    recommendedChecklist.push('Install crack tell-tale gauges to monitor live structural movement');
  } else if (normalizedQuery.includes('next') || normalizedQuery.includes('action') || normalizedQuery.includes('check')) {
    answer = `**Recommended Next Engineering Steps:**\n\n` +
      `1. **Immediate Inspection:** ${building.recommendedProfessionalAction}\n` +
      `2. **Inspection Priority:** Assigned as **${building.inspectionPriority}**.\n` +
      `3. **Authority Protocol:** ${building.hasActiveAlert ? 'An active official safety alert is linked to this structure. Follow published municipal cordon directives.' : 'No active public safety alert currently published for this structure.'}`;

    recommendedChecklist.push('Commission comprehensive 3D laser scan or physical level survey');
    recommendedChecklist.push('Check foundations for localized water table softening');
  } else {
    answer = `**Summary for ${building.name}:**\n\n` +
      `This building is located in **${building.ward} (${building.area})** and currently holds a **${building.riskIndicator}** risk indicator with a data completeness score of **${building.dataConfidenceScore}%**.\n\n` +
      `**Recorded Condition Summary:** ${building.recommendedProfessionalAction}\n\n` +
      `*You can ask me specific questions like: "Why was this flagged?", "What changed?", "What data is missing?", or "What should be checked next?"*`;

    recommendedChecklist.push('Review structural health timeline');
    recommendedChecklist.push('Check linked environmental rainfall and soil moisture readings');
  }

  return {
    answer,
    evidencePoints,
    missingPoints,
    recommendedChecklist,
    confidenceNote: `Analysis generated from ${evidencePoints.length} verified/stored evidence point(s) with ${building.dataConfidenceScore}% data completeness.`,
    disclaimer: 'AI-generated analysis is decision support only. Structural safety decisions require qualified professionals and authorized authorities. This system does NOT predict exact collapse timing.'
  };
}
