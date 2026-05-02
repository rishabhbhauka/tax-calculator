// Pure tax calculation engine — FY 2025-26
// No side effects. No I/O. Safe to call on every keystroke.

// ── Types ────────────────────────────────────────────────────────────────────

export type AgeGroup = "below60" | "senior" | "superSenior";

export interface TaxInputs {
  ageGroup: AgeGroup;
  annualGross: number;
  monthlyBasic: number;
  paysRent: boolean;
  monthlyRent: number;
  isMetro: boolean;
  receivesHRA: boolean;
  monthlyHRA: number;
  hasEPF: boolean;
  monthlyEPF: number;
  otherEightyC: number;
  selfHealthInsurance: number;
  parentsHealthInsurance: number;
  parentsSenior: boolean;
  employerNPS: number;
  selfNPS1B: number;
  homeLoanInterest: number;
  savingsInterest: number;
  fdInterest: number;
  professionalTax: number;
}

export interface SlabBreakdownRow {
  range: string;
  rate: number;
  incomeInSlab: number;
  tax: number;
}

export interface DeductionLineItems {
  standardDeduction: number;
  professionalTax: number;
  hraExemption: number;
  employerNPSDeduction: number;
  eightyC: number;
  selfNPS1B: number;
  eightyD: number;
  homeLoanInterest: number;
  interestDeduction: number;
  eightyGG: number;
}

export interface RegimeResult {
  grossSalary: number;
  netSalary: number;
  otherIncome: number;
  grossTotalIncome: number;
  totalChapterVIADeductions: number;
  taxableIncome: number;
  taxBeforeRebate: number;
  rebate: number;
  netTax: number;
  cess: number;
  totalTax: number;
  slabBreakdown: SlabBreakdownRow[];
  deductions: DeductionLineItems;
}

export interface TaxResult {
  oldRegime: RegimeResult;
  newRegime: RegimeResult;
  recommendation: "old" | "new" | "equal";
  savingsAmount: number;
  marginallyClose: boolean;
}

// ── Internal helpers ──────────────────────────────────────────────────────────

interface SlabEntry {
  limit: number;
  rate: number;
}

function computeTaxFromSlabs(income: number, slabs: SlabEntry[]): number {
  let tax = 0;
  let prevLimit = 0;
  for (const slab of slabs) {
    if (income <= prevLimit) break;
    const taxableInSlab = Math.min(income, slab.limit) - prevLimit;
    tax += taxableInSlab * slab.rate;
    prevLimit = slab.limit;
  }
  return Math.round(tax);
}

function slabRangeLabel(from: number, to: number): string {
  const fmt = (n: number) =>
    n >= 10_00_000
      ? `₹${(n / 10_00_000).toFixed(0)}L`
      : n >= 1_00_000
      ? `₹${(n / 1_00_000).toFixed(1).replace(".0", "")}L`
      : `₹${n.toLocaleString("en-IN")}`;
  return to === Infinity ? `Above ${fmt(from)}` : `${fmt(from)} – ${fmt(to)}`;
}

export function getSlabBreakdown(
  income: number,
  slabs: SlabEntry[]
): SlabBreakdownRow[] {
  const rows: SlabBreakdownRow[] = [];
  let prevLimit = 0;
  for (const slab of slabs) {
    const incomeInSlab =
      income <= prevLimit ? 0 : Math.min(income, slab.limit) - prevLimit;
    const tax = Math.round(incomeInSlab * slab.rate);
    rows.push({
      range: slabRangeLabel(prevLimit, slab.limit),
      rate: slab.rate,
      incomeInSlab,
      tax,
    });
    prevLimit = slab.limit;
    if (income <= slab.limit) break;
  }
  return rows;
}

// ── Slab tables ───────────────────────────────────────────────────────────────

const NEW_REGIME_SLABS: SlabEntry[] = [
  { limit: 4_00_000, rate: 0 },
  { limit: 8_00_000, rate: 0.05 },
  { limit: 12_00_000, rate: 0.1 },
  { limit: 16_00_000, rate: 0.15 },
  { limit: 20_00_000, rate: 0.2 },
  { limit: 24_00_000, rate: 0.25 },
  { limit: Infinity, rate: 0.3 },
];

function getOldRegimeSlabs(ageGroup: AgeGroup): SlabEntry[] {
  if (ageGroup === "superSenior") {
    return [
      { limit: 5_00_000, rate: 0 },
      { limit: 10_00_000, rate: 0.2 },
      { limit: Infinity, rate: 0.3 },
    ];
  }
  if (ageGroup === "senior") {
    return [
      { limit: 3_00_000, rate: 0 },
      { limit: 5_00_000, rate: 0.05 },
      { limit: 10_00_000, rate: 0.2 },
      { limit: Infinity, rate: 0.3 },
    ];
  }
  return [
    { limit: 2_50_000, rate: 0 },
    { limit: 5_00_000, rate: 0.05 },
    { limit: 10_00_000, rate: 0.2 },
    { limit: Infinity, rate: 0.3 },
  ];
}

// ── Marginal relief (new regime only) ────────────────────────────────────────

function marginalRelief_NewRegime(
  income: number,
  taxBeforeRebate: number
): number {
  if (income > 12_00_000 && income <= 12_75_000) {
    const excess = income - 12_00_000;
    return Math.max(0, taxBeforeRebate - excess);
  }
  return 0;
}

// ── New Regime ────────────────────────────────────────────────────────────────

function calculateNewRegime(inputs: TaxInputs): RegimeResult {
  const { annualGross, monthlyBasic, employerNPS, savingsInterest, fdInterest, professionalTax } = inputs;

  const annualBasic = monthlyBasic * 12;
  const standardDeduction = 75_000;
  const profTax = professionalTax;
  const employerNPSDeduction = Math.min(employerNPS, annualBasic * 0.14);

  const netSalary = Math.max(
    0,
    annualGross - standardDeduction - profTax - employerNPSDeduction
  );
  const otherIncome = savingsInterest + fdInterest;
  const grossTotalIncome = netSalary + otherIncome;
  const taxableIncome = grossTotalIncome; // no Chapter VI-A in new regime

  const taxBeforeRebate = computeTaxFromSlabs(taxableIncome, NEW_REGIME_SLABS);

  let rebate = 0;
  if (taxableIncome <= 12_00_000) {
    rebate = Math.min(taxBeforeRebate, 60_000);
  } else {
    rebate = marginalRelief_NewRegime(taxableIncome, taxBeforeRebate);
  }

  const netTax = Math.max(0, taxBeforeRebate - rebate);
  const cess = Math.round(netTax * 0.04);
  const totalTax = netTax + cess;

  return {
    grossSalary: annualGross,
    netSalary,
    otherIncome,
    grossTotalIncome,
    totalChapterVIADeductions: 0,
    taxableIncome,
    taxBeforeRebate,
    rebate,
    netTax,
    cess,
    totalTax,
    slabBreakdown: getSlabBreakdown(taxableIncome, NEW_REGIME_SLABS),
    deductions: {
      standardDeduction,
      professionalTax: profTax,
      hraExemption: 0,
      employerNPSDeduction,
      eightyC: 0,
      selfNPS1B: 0,
      eightyD: 0,
      homeLoanInterest: 0,
      interestDeduction: 0,
      eightyGG: 0,
    },
  };
}

// ── Old Regime ────────────────────────────────────────────────────────────────

function calculateOldRegime(inputs: TaxInputs): RegimeResult {
  const {
    ageGroup,
    annualGross,
    monthlyBasic,
    paysRent,
    monthlyRent,
    isMetro,
    receivesHRA,
    monthlyHRA,
    monthlyEPF,
    otherEightyC,
    selfHealthInsurance,
    parentsHealthInsurance,
    parentsSenior,
    employerNPS,
    selfNPS1B,
    homeLoanInterest,
    savingsInterest,
    fdInterest,
    professionalTax,
  } = inputs;

  const annualBasic = monthlyBasic * 12;
  const annualHRA = monthlyHRA * 12;
  const annualRent = monthlyRent * 12;
  const epfAnnual = Math.min(monthlyEPF * 12, 21_600);

  // Section 16 deductions
  const standardDeduction = 50_000;
  const profTax = professionalTax;

  // HRA exemption — Section 10(13A)
  let hraExemption = 0;
  if (paysRent && receivesHRA && annualRent > 0 && annualHRA > 0) {
    const a = annualHRA;
    const b = annualRent - annualBasic * 0.1;
    const c = annualBasic * (isMetro ? 0.5 : 0.4);
    hraExemption = Math.max(0, Math.min(a, b, c));
  }
  // 80GG handled below in Chapter VI-A (not a Section 16 deduction)

  // Employer NPS — 80CCD(2), allowed in both regimes
  const employerNPSDeduction = Math.min(employerNPS, annualBasic * 0.14);

  const netSalary = Math.max(
    0,
    annualGross - standardDeduction - profTax - hraExemption - employerNPSDeduction
  );

  const otherIncome = savingsInterest + fdInterest;
  const grossTotalIncome = netSalary + otherIncome;

  // Chapter VI-A deductions
  const total80C = Math.min(epfAnnual + otherEightyC, 1_50_000);
  const nps1BDeduction = Math.min(selfNPS1B, 50_000);

  const selfLimit = ageGroup === "senior" || ageGroup === "superSenior" ? 50_000 : 25_000;
  const selfHealthDeduction = Math.min(selfHealthInsurance, selfLimit);
  const parentsLimit = parentsSenior ? 50_000 : 25_000;
  const parentsHealthDeduction = Math.min(parentsHealthInsurance, parentsLimit);
  const total80D = selfHealthDeduction + parentsHealthDeduction;

  const homeLoanDeduction = Math.min(homeLoanInterest, 2_00_000);

  let interestDeduction = 0;
  if (ageGroup === "below60") {
    interestDeduction = Math.min(savingsInterest, 10_000); // 80TTA
  } else {
    interestDeduction = Math.min(savingsInterest + fdInterest, 50_000); // 80TTB
  }

  // 80GG — rent deduction when no HRA in salary
  let eightyGG = 0;
  if (paysRent && !receivesHRA && annualRent > 0) {
    const a = 60_000;
    const b = grossTotalIncome * 0.25;
    const c = Math.max(0, annualRent - grossTotalIncome * 0.1);
    eightyGG = Math.min(a, b, c);
  }

  const totalChapterVIADeductions =
    total80C + nps1BDeduction + total80D + homeLoanDeduction + interestDeduction + eightyGG;

  const taxableIncome = Math.max(0, grossTotalIncome - totalChapterVIADeductions);

  const oldSlabs = getOldRegimeSlabs(ageGroup);
  const taxBeforeRebate = computeTaxFromSlabs(taxableIncome, oldSlabs);

  let rebate = 0;
  if (taxableIncome <= 5_00_000) {
    rebate = Math.min(taxBeforeRebate, 12_500);
  }

  const netTax = Math.max(0, taxBeforeRebate - rebate);
  const cess = Math.round(netTax * 0.04);
  const totalTax = netTax + cess;

  return {
    grossSalary: annualGross,
    netSalary,
    otherIncome,
    grossTotalIncome,
    totalChapterVIADeductions,
    taxableIncome,
    taxBeforeRebate,
    rebate,
    netTax,
    cess,
    totalTax,
    slabBreakdown: getSlabBreakdown(taxableIncome, oldSlabs),
    deductions: {
      standardDeduction,
      professionalTax: profTax,
      hraExemption,
      employerNPSDeduction,
      eightyC: total80C,
      selfNPS1B: nps1BDeduction,
      eightyD: total80D,
      homeLoanInterest: homeLoanDeduction,
      interestDeduction,
      eightyGG,
    },
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export function calculateTax(inputs: TaxInputs): TaxResult {
  const oldRegime = calculateOldRegime(inputs);
  const newRegime = calculateNewRegime(inputs);

  const diff = Math.abs(oldRegime.totalTax - newRegime.totalTax);

  let recommendation: TaxResult["recommendation"];
  if (diff <= 100) {
    recommendation = "equal";
  } else if (newRegime.totalTax < oldRegime.totalTax) {
    recommendation = "new";
  } else {
    recommendation = "old";
  }

  return {
    oldRegime,
    newRegime,
    recommendation,
    savingsAmount: diff,
    marginallyClose: diff > 0 && diff <= 5_000,
  };
}

// ── Utility: format a rupee amount ───────────────────────────────────────────

export function formatINR(n: number): string {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}
