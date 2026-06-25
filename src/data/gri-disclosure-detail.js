// GRI 2021 disclosure detail — the "strong GRI" reference layer.
//
// For each disclosure this captures, faithfully to the GRI Standards:
//   type                  — Quantitative | Qualitative | Mixed
//   coreDataSummary       — one line: what to actually collect
//   reportingRequirements — the lettered requirements of the disclosure
//   guidance              — a short, practical note for the data owner
//
// Merged into GRI_METRICS by id in gri-metrics.js (kept separate so the registry
// objects stay lean and this richer content lives in one place). GRI-only by MVP
// scope — no IFRS/TGO/ISO/SEC content here.

export const DISCLOSURE_DETAIL = {
  // ===== GOVERNANCE — GRI 2: General Disclosures =====
  'gri-2-1': {
    type: 'Qualitative',
    coreDataSummary: 'Legal name, ownership/legal form, HQ location, countries of operation',
    reportingRequirements: [
      'a. Legal name of the organization',
      'b. Nature of ownership and legal form',
      'c. Location of headquarters',
      'd. Countries of operation',
    ],
    guidance: 'Report the entity the sustainability information relates to and align the reporting boundary with your financial reporting where possible.',
  },
  'gri-2-9': {
    type: 'Mixed',
    coreDataSummary: 'Governance structure, committees overseeing impacts, board composition',
    reportingRequirements: [
      'a. Governance structure, including committees of the highest governance body',
      'b. Committees responsible for decision-making on and overseeing the management of impacts',
      'c. Composition: executive/non-executive, independence, tenure, other significant positions, gender, under-represented groups, relevant competencies, stakeholder representation',
    ],
    guidance: 'Name the committee (e.g. Sustainability/ESG Committee) that owns ESG topics and its reporting line to the board.',
  },
  'gri-2-12': {
    type: 'Qualitative',
    coreDataSummary: 'Board/senior-exec role in strategy, due diligence, and reviewing effectiveness',
    reportingRequirements: [
      'a. Role of the highest governance body and senior executives in developing, approving and updating purpose, strategy, policies and goals related to sustainable development',
      'b. Role in overseeing the due diligence and other processes to identify and manage impacts',
      'c. Role in reviewing the effectiveness of these processes',
    ],
    guidance: 'Describe the cadence (e.g. quarterly board review) and how impacts feed into strategy decisions.',
  },
  'gri-2-15': {
    type: 'Qualitative',
    coreDataSummary: 'Processes to prevent/mitigate conflicts of interest, and disclosure to stakeholders',
    reportingRequirements: [
      'a. Processes for the highest governance body to ensure conflicts of interest are prevented and mitigated',
      'b. Whether conflicts of interest are disclosed to stakeholders (cross-board membership, cross-shareholding, related-party transactions, controlling shareholders)',
    ],
    guidance: 'Reference your annual declaration process and how material conflicts are escalated and recorded.',
  },
  'gri-2-22': {
    type: 'Qualitative',
    coreDataSummary: 'Statement from senior decision-maker on the sustainable-development strategy',
    reportingRequirements: [
      'a. A statement from the highest governance body or most senior executive about the relevance of sustainable development to the organization and its strategy',
    ],
    guidance: 'Keep it specific: name commitments and time-bound targets rather than generic intent.',
  },
  'gri-2-27': {
    type: 'Quantitative',
    coreDataSummary: 'Significant instances of non-compliance and associated fines',
    reportingRequirements: [
      'a. Total number of significant instances of non-compliance with laws and regulations',
      'b. Total number and monetary value of fines for those instances (paid vs. accrued from previous periods)',
      'c. How "significant" instances are determined',
    ],
    guidance: 'Count instances during the reporting period; separate fines paid this period from those carried over.',
  },
  'gri-2-29': {
    type: 'Qualitative',
    coreDataSummary: 'Approach to stakeholder engagement and how it is made meaningful',
    reportingRequirements: [
      'a. Approach to engaging with stakeholders, including categories of stakeholders, how they are identified, the purpose of engagement, and how engagement is made meaningful',
    ],
    guidance: 'List stakeholder categories and the channels used (surveys, forums, grievance mechanisms).',
  },
  'gri-205-1': {
    type: 'Quantitative',
    coreDataSummary: '% of operations assessed for corruption risk, and significant risks found',
    reportingRequirements: [
      'a. Total number and percentage of operations assessed for risks related to corruption',
      'b. Significant risks related to corruption identified through the risk assessment',
    ],
    guidance: 'Percentage = operations assessed ÷ total operations. Describe the most significant risks qualitatively.',
  },
  'gri-205-3': {
    type: 'Mixed',
    coreDataSummary: 'Confirmed corruption incidents and actions taken',
    reportingRequirements: [
      'a. Total number and nature of confirmed incidents of corruption',
      'b. Confirmed incidents in which employees were dismissed or disciplined',
      'c. Confirmed incidents when contracts with business partners were terminated or not renewed',
      'd. Public legal cases regarding corruption against the organization or its employees, and outcomes',
    ],
    guidance: 'Only "confirmed" incidents count. Describe nature and the disciplinary/contractual actions taken.',
  },
  'gri-206-1': {
    type: 'Mixed',
    coreDataSummary: 'Legal actions for anti-competitive behavior and their outcomes',
    reportingRequirements: [
      'a. Number of legal actions pending or completed during the reporting period regarding anti-competitive behavior and violations of anti-trust and monopoly legislation',
      'b. Main outcomes of completed legal actions, including any decisions or judgments',
    ],
    guidance: 'Include actions in which the organization was identified as a participant.',
  },

  // ===== ENVIRONMENTAL =====
  'gri-302-1': {
    type: 'Quantitative',
    coreDataSummary: 'Total energy (GJ): non-renewable vs renewable fuel, electricity/heating/cooling/steam',
    reportingRequirements: [
      'a. Total fuel consumption from non-renewable sources, including fuel types',
      'b. Total fuel consumption from renewable sources, including fuel types',
      'c. Electricity, heating, cooling and steam consumption',
      'd. Electricity, heating, cooling and steam sold',
      'e. Total energy consumption within the organization',
      'f. Standards, methodologies, assumptions and tools used',
      'g. Source of the conversion factors used',
    ],
    guidance: 'Report in joules or multiples (GJ). Split renewable vs non-renewable; total = consumption − energy sold.',
  },
  'gri-302-3': {
    type: 'Quantitative',
    coreDataSummary: 'Energy intensity ratio and its organization-specific denominator',
    reportingRequirements: [
      'a. Energy intensity ratio',
      'b. Organization-specific metric (the denominator) chosen to calculate the ratio',
      'c. Types of energy included (fuel, electricity, heating, cooling, steam, or all)',
      'd. Whether the ratio uses energy consumption within the organization, outside, or both',
    ],
    guidance: 'Pick a denominator that fits the business (per unit produced, per FTE, per $ revenue) and keep it consistent year-on-year.',
  },
  'gri-302-4': {
    type: 'Quantitative',
    coreDataSummary: 'Energy reductions achieved vs a stated baseline',
    reportingRequirements: [
      'a. Amount of reductions in energy consumption achieved as a direct result of conservation and efficiency initiatives',
      'b. Types of energy included',
      'c. Basis for calculating reductions (base year or baseline) and rationale',
      'd. Standards, methodologies, assumptions and tools used',
    ],
    guidance: 'Reductions are versus a baseline — state the base year and whether reductions are estimated or measured.',
  },
  'gri-303-3': {
    type: 'Quantitative',
    coreDataSummary: 'Water withdrawal (ML) by source, incl. water-stress areas and freshwater split',
    reportingRequirements: [
      'a. Total water withdrawal from all areas (ML) by source: surface water, groundwater, seawater, produced water, third-party water',
      'b. Total water withdrawal from all areas with water stress, by the same sources',
      'c. Breakdown of total withdrawal into freshwater (≤1,000 mg/L TDS) and other water (>1,000 mg/L TDS)',
      'd. Standards, methodologies and assumptions used',
    ],
    guidance: 'Report in megalitres (ML). Identify water-stress areas using a recognized tool (e.g. WRI Aqueduct).',
  },
  'gri-303-5': {
    type: 'Quantitative',
    coreDataSummary: 'Water consumption (ML), incl. water-stress areas',
    reportingRequirements: [
      'a. Total water consumption from all areas (ML)',
      'b. Total water consumption from all areas with water stress (ML)',
      'c. Change in water storage if it is a significant factor',
      'd. Standards, methodologies and assumptions used',
    ],
    guidance: 'Consumption = withdrawal − discharge. Report storage change only where significant.',
  },
  'gri-305-1': {
    type: 'Quantitative',
    coreDataSummary: 'Gross Scope 1 (tCO₂e), gases included, biogenic CO₂, base year, GWP source',
    reportingRequirements: [
      'a. Gross direct (Scope 1) GHG emissions in metric tons of CO₂ equivalent',
      'b. Gases included in the calculation (CO₂, CH₄, N₂O, HFCs, PFCs, SF₆, NF₃, or all)',
      'c. Biogenic CO₂ emissions reported separately',
      'd. Base year: rationale, emissions in the base year, and context for recalculations',
      'e. Source of the emission factors and global warming potential (GWP) rates used',
      'f. Consolidation approach (equity share, financial control, operational control)',
      'g. Standards, methodologies, assumptions and tools used',
    ],
    guidance: 'Most organizations use operational control. Report biogenic CO₂ separately from the gross figure; state the GWP source (e.g. IPCC AR5).',
  },
  'gri-305-2': {
    type: 'Quantitative',
    coreDataSummary: 'Scope 2 (tCO₂e) location-based and market-based, gases, base year',
    reportingRequirements: [
      'a. Gross location-based energy indirect (Scope 2) GHG emissions (tCO₂e)',
      'b. Gross market-based energy indirect (Scope 2) GHG emissions, if applicable (tCO₂e)',
      'c. Gases included in the calculation',
      'd. Base year: rationale, base-year emissions, context for recalculations',
      'e. Source of the emission factors and GWP rates used',
      'f. Consolidation approach',
      'g. Standards, methodologies, assumptions and tools used',
    ],
    guidance: 'Report location-based always; add market-based where you have contractual instruments (e.g. RECs, green tariffs).',
  },
  'gri-305-3': {
    type: 'Mixed',
    coreDataSummary: 'Scope 3 (tCO₂e) by category, with method and data coverage',
    reportingRequirements: [
      'a. Gross other indirect (Scope 3) GHG emissions (tCO₂e)',
      'b. Gases included in the calculation',
      'c. Biogenic CO₂ emissions reported separately',
      'd. Scope 3 categories and activities included',
      'e. Base year: rationale, base-year emissions, context for recalculations',
      'f. Source of the emission factors and GWP rates used',
      'g. Standards, methodologies, assumptions and tools used',
    ],
    guidance: 'List which of the 15 GHG Protocol categories are included and state data coverage and estimation methods.',
  },
  'gri-305-4': {
    type: 'Quantitative',
    coreDataSummary: 'GHG intensity ratio, denominator, scopes & gases included',
    reportingRequirements: [
      'a. GHG emissions intensity ratio',
      'b. Organization-specific metric (the denominator) chosen',
      'c. Types of GHG emissions included (Scope 1, 2 and/or 3)',
      'd. Gases included in the calculation',
    ],
    guidance: 'State exactly which scopes are in the numerator so the ratio is comparable.',
  },
  'gri-306-3': {
    type: 'Quantitative',
    coreDataSummary: 'Total waste generated (tonnes) by composition',
    reportingRequirements: [
      'a. Total weight of waste generated in metric tons, with a breakdown by composition',
      'b. Contextual information on how the data was compiled',
    ],
    guidance: 'Break down by waste stream/composition (e.g. paper, plastics, e-waste, hazardous) where known.',
  },
  'gri-306-4': {
    type: 'Quantitative',
    coreDataSummary: 'Waste diverted from disposal (tonnes) by recovery operation and on/off-site',
    reportingRequirements: [
      'a. Total weight of waste diverted from disposal (metric tons), hazardous and non-hazardous',
      'b. Hazardous waste diverted by recovery operation: preparation for reuse, recycling, other',
      'c. Non-hazardous waste diverted by recovery operation',
      'd. Breakdown of the above into on-site and off-site',
    ],
    guidance: 'Diverted = waste recovered (reuse/recycling) rather than landfilled/incinerated. Split hazardous vs non-hazardous.',
  },

  // ===== SOCIAL =====
  'gri-401-1': {
    type: 'Quantitative',
    coreDataSummary: 'New hires and turnover counts/rates by age, gender, region',
    reportingRequirements: [
      'a. Total number and rate of new employee hires during the period, by age group, gender and region',
      'b. Total number and rate of employee turnover during the period, by age group, gender and region',
    ],
    guidance: 'Rate = number ÷ total employees at period end. Break down by the three dimensions where available.',
  },
  'gri-401-3': {
    type: 'Quantitative',
    coreDataSummary: 'Parental-leave entitlement, take-up, return-to-work and retention by gender',
    reportingRequirements: [
      'a. Employees entitled to parental leave, by gender',
      'b. Employees that took parental leave, by gender',
      'c. Employees that returned to work after parental leave ended, by gender',
      'd. Employees that returned and were still employed 12 months later, by gender',
      'e. Return-to-work and retention rates, by gender',
    ],
    guidance: 'Track the cohort across periods — retention is measured 12 months after return.',
  },
  'gri-403-9': {
    type: 'Quantitative',
    coreDataSummary: 'Fatalities, high-consequence and recordable injuries, rates, and hours worked',
    reportingRequirements: [
      'a. For all employees: number and rate of fatalities, high-consequence work-related injuries, recordable work-related injuries; main types; hours worked',
      'b. The same for workers who are not employees but whose work/workplace is controlled by the organization',
      'c. The work-related hazards that pose a risk of high-consequence injury',
      'd. Whether rates are calculated based on 200,000 or 1,000,000 hours worked',
    ],
    guidance: 'State the rate basis (per 200,000 or 1,000,000 hours). Report employees and non-employee workers separately.',
  },
  'gri-403-10': {
    type: 'Quantitative',
    coreDataSummary: 'Work-related ill-health fatalities and recordable cases, with main types',
    reportingRequirements: [
      'a. For all employees: number of fatalities and cases of recordable work-related ill health; main types',
      'b. The same for workers who are not employees but whose work/workplace is controlled by the organization',
      'c. The work-related hazards that pose a risk of ill health',
    ],
    guidance: 'Distinguish ill health (e.g. occupational disease) from injuries reported under 403-9.',
  },
  'gri-404-1': {
    type: 'Quantitative',
    coreDataSummary: 'Average training hours per employee, by gender and employee category',
    reportingRequirements: [
      'a. Average hours of training that employees have undertaken during the period, by gender and by employee category',
    ],
    guidance: 'Average = total training hours ÷ total employees in the group. Report by gender and category where possible.',
  },
  'gri-405-1': {
    type: 'Quantitative',
    coreDataSummary: '% of governance bodies and employees by gender, age and diversity indicators',
    reportingRequirements: [
      'a. Percentage of individuals within governance bodies by gender, age group, and other diversity indicators',
      'b. Percentage of employees per employee category by gender, age group, and other diversity indicators',
    ],
    guidance: 'Use consistent age bands (e.g. <30, 30–50, >50). Report governance bodies and employees separately.',
  },
  'gri-405-2': {
    type: 'Quantitative',
    coreDataSummary: 'Ratio of basic salary and remuneration of women to men by category and location',
    reportingRequirements: [
      'a. Ratio of the basic salary and remuneration of women to men for each employee category, by significant locations of operation',
      'b. The definition used for "significant locations of operation"',
    ],
    guidance: 'A ratio of 1.0 means parity. Report per employee category and define "significant location".',
  },
  'gri-413-1': {
    type: 'Quantitative',
    coreDataSummary: '% of operations with community engagement, impact assessments or programs',
    reportingRequirements: [
      'a. Percentage of operations with implemented local community engagement, impact assessments, and/or development programs, including the use of: social impact assessments, environmental impact assessments, public disclosure, community consultation, local development programs, grievance processes',
    ],
    guidance: 'Percentage = operations with such programs ÷ total operations.',
  },
  'gri-418-1': {
    type: 'Quantitative',
    coreDataSummary: 'Substantiated privacy complaints and identified data leaks/losses',
    reportingRequirements: [
      'a. Total number of substantiated complaints concerning breaches of customer privacy: from outside parties and substantiated, and from regulatory bodies',
      'b. Total number of identified leaks, thefts, or losses of customer data',
      'c. If no substantiated complaints, a brief statement of that fact',
    ],
    guidance: 'Only "substantiated" complaints count. Report data leaks/thefts/losses separately from complaints.',
  },
};
