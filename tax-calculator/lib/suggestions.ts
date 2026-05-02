// Personalised suggestion engine — Section 13 of PRD
// Pure function: (inputs, result) → Suggestion[]

import type { TaxInputs, TaxResult } from "./taxCalculator";

export interface Suggestion {
  id: string;
  icon: string;
  title: string;
  body: string;
}

function marginalRate(taxableIncome: number, ageGroup: TaxInputs["ageGroup"]): number {
  if (ageGroup === "superSenior") {
    if (taxableIncome <= 5_00_000) return 0;
    if (taxableIncome <= 10_00_000) return 0.2;
    return 0.3;
  }
  const exemption = ageGroup === "senior" ? 3_00_000 : 2_50_000;
  if (taxableIncome <= exemption) return 0;
  if (taxableIncome <= 5_00_000) return 0.05;
  if (taxableIncome <= 10_00_000) return 0.2;
  return 0.3;
}

export function generateSuggestions(
  inputs: TaxInputs,
  result: TaxResult
): Suggestion[] {
  const { oldRegime, newRegime, recommendation, savingsAmount, marginallyClose } = result;
  const suggestions: Suggestion[] = [];

  const epfAnnual = Math.min(inputs.monthlyEPF * 12, 21_600);
  const total80C = Math.min(epfAnnual + inputs.otherEightyC, 1_50_000);
  const mRate = marginalRate(oldRegime.taxableIncome, inputs.ageGroup);
  const mRateNew = marginalRate(newRegime.taxableIncome, inputs.ageGroup);

  // Zero tax in both
  if (oldRegime.totalTax === 0 && newRegime.totalTax === 0) {
    suggestions.push({
      id: "zero-tax",
      icon: "🎉",
      title: "You don't owe any tax this year!",
      body:
        "Your income is below the tax-free threshold in both regimes. No action needed.",
    });
    return suggestions;
  }

  // New regime recommended
  if (recommendation === "new") {
    // NPS note — only show if old regime is competitive
    if (inputs.selfNPS1B < 50_000 && savingsAmount < 20_000) {
      const extra = 50_000 - inputs.selfNPS1B;
      const saving = Math.round(extra * mRate * 1.04);
      suggestions.push({
        id: "nps-1b-note",
        icon: "🏦",
        title: "NPS gives you an extra ₹50,000 deduction — but only in the Old Regime",
        body: `Investing ₹${extra.toLocaleString("en-IN")} in NPS Tier-1 under 80CCD(1B) would save ₹${saving.toLocaleString("en-IN")} in the Old Regime. Even then, the New Regime wins for you by ₹${savingsAmount.toLocaleString("en-IN")}.`,
      });
    }

    if (oldRegime.deductions.hraExemption > 0 && oldRegime.deductions.hraExemption < 30_000) {
      suggestions.push({
        id: "hra-low",
        icon: "🏠",
        title: "Your HRA saves less than expected",
        body:
          "Your rent is low relative to your salary, so the HRA exemption is modest. The New Regime's lower slab rates outweigh it.",
      });
    }
  }

  // Old regime recommended
  if (recommendation === "old") {
    if (total80C < 1_00_000) {
      const more = 1_50_000 - total80C;
      const saving = Math.round(more * mRate * 1.04);
      suggestions.push({
        id: "80c-more",
        icon: "📈",
        title: `Invest ₹${more.toLocaleString("en-IN")} more in 80C to save ₹${saving.toLocaleString("en-IN")}`,
        body: `You're using ₹${total80C.toLocaleString("en-IN")} of the ₹1.5L available under 80C. Topping it up with PPF or ELSS could save you an extra ₹${saving.toLocaleString("en-IN")} in taxes.`,
      });
    }

    if (inputs.selfNPS1B < 50_000) {
      const extra = 50_000 - inputs.selfNPS1B;
      const saving = Math.round(extra * mRate * 1.04);
      suggestions.push({
        id: "nps-1b",
        icon: "🏦",
        title: `NPS can save you another ₹${saving.toLocaleString("en-IN")}`,
        body: `Investing ₹${extra.toLocaleString("en-IN")} in NPS Tier-1 under 80CCD(1B) gives you a deduction over and above your ₹1.5L 80C limit.`,
      });
    }
  }

  // Parents insurance — suggest if not claimed
  if (
    inputs.parentsHealthInsurance === 0 &&
    inputs.ageGroup !== "superSenior" &&
    recommendation === "old"
  ) {
    suggestions.push({
      id: "parents-health",
      icon: "🩺",
      title: "Are your parents insured? You could save tax on their premium.",
      body:
        "If you pay health insurance for your parents, you get an extra ₹25,000 (or ₹50,000 if they're seniors) deduction — on top of your own policy.",
    });
  }

  // Marginally close
  if (marginallyClose) {
    suggestions.push({
      id: "consult-ca",
      icon: "⚖️",
      title: "The difference is small — confirm with a CA before filing",
      body:
        "Both regimes give you nearly the same result. A CA can factor in advance tax, TDS, and future investment plans to give you a definitive answer.",
    });
  }

  // Always: new regime is now default
  if (recommendation === "new" || recommendation === "equal") {
    suggestions.push({
      id: "new-regime-default",
      icon: "ℹ️",
      title: "The New Regime is now the default",
      body:
        "From FY 2023-24, the New Regime is the default. You need to actively opt for the Old Regime while filing your ITR. No action needed to use the New Regime.",
    });
  }

  return suggestions;
}
