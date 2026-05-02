"use client";

import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  type ReactNode,
} from "react";
import { calculateTax, type TaxInputs, type TaxResult } from "@/lib/taxCalculator";

// ── Types ────────────────────────────────────────────────────────────────────

export interface StepAnswers {
  hasInvestments?: boolean;
  hasHealthInsurance?: boolean;
  hasNPS?: boolean;
  hasHomeLoan?: boolean;
  hasOtherIncome?: boolean;
  hasProfTax?: boolean;
}

export interface WizardState {
  currentStep: number;
  inputs: Partial<TaxInputs>;
  stepAnswers: StepAnswers;
  skippedSteps: number[];
}

export type WizardAction =
  | { type: "SET_INPUT"; key: keyof TaxInputs; value: TaxInputs[keyof TaxInputs] }
  | { type: "SET_INPUTS"; values: Partial<TaxInputs> }
  | { type: "SET_ANSWER"; key: keyof StepAnswers; value: boolean }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "GOTO_STEP"; step: number }
  | { type: "SKIP_STEP" }
  | { type: "RESET" };

export const TOTAL_STEPS = 12;

// ── Reducer ───────────────────────────────────────────────────────────────────

const INITIAL: WizardState = {
  currentStep: 1,
  inputs: {},
  stepAnswers: {},
  skippedSteps: [],
};

function reducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "SET_INPUT":
      return { ...state, inputs: { ...state.inputs, [action.key]: action.value } };
    case "SET_INPUTS":
      return { ...state, inputs: { ...state.inputs, ...action.values } };
    case "SET_ANSWER":
      return { ...state, stepAnswers: { ...state.stepAnswers, [action.key]: action.value } };
    case "NEXT_STEP":
      return { ...state, currentStep: Math.min(state.currentStep + 1, TOTAL_STEPS) };
    case "PREV_STEP":
      return { ...state, currentStep: Math.max(state.currentStep - 1, 1) };
    case "GOTO_STEP":
      return { ...state, currentStep: Math.max(1, Math.min(action.step, TOTAL_STEPS)) };
    case "SKIP_STEP":
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, TOTAL_STEPS),
        skippedSteps: [...state.skippedSteps, state.currentStep],
      };
    case "RESET":
      return INITIAL;
    default:
      return state;
  }
}

// ── Defaults for live preview with partial inputs ─────────────────────────────

export function withDefaults(p: Partial<TaxInputs>): TaxInputs {
  const annualGross = p.annualGross ?? 0;
  const monthlyBasic = p.monthlyBasic ?? Math.round((annualGross * 0.4) / 12);
  return {
    ageGroup:               p.ageGroup               ?? "below60",
    annualGross,
    monthlyBasic,
    paysRent:               p.paysRent               ?? false,
    monthlyRent:            p.monthlyRent             ?? 0,
    isMetro:                p.isMetro                 ?? false,
    receivesHRA:            p.receivesHRA             ?? false,
    monthlyHRA:             p.monthlyHRA              ?? 0,
    hasEPF:                 p.hasEPF                  ?? false,
    monthlyEPF:             p.monthlyEPF              ?? 0,
    otherEightyC:           p.otherEightyC            ?? 0,
    selfHealthInsurance:    p.selfHealthInsurance     ?? 0,
    parentsHealthInsurance: p.parentsHealthInsurance  ?? 0,
    parentsSenior:          p.parentsSenior           ?? false,
    employerNPS:            p.employerNPS             ?? 0,
    selfNPS1B:              p.selfNPS1B               ?? 0,
    homeLoanInterest:       p.homeLoanInterest        ?? 0,
    savingsInterest:        p.savingsInterest         ?? 0,
    fdInterest:             p.fdInterest              ?? 0,
    professionalTax:        p.professionalTax         ?? 0,
  };
}

// ── Context ───────────────────────────────────────────────────────────────────

interface CtxValue {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
  liveResult: TaxResult | null;
}

const WizardCtx = createContext<CtxValue | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  const liveResult = useMemo<TaxResult | null>(() => {
    if (!state.inputs.annualGross) return null;
    try {
      return calculateTax(withDefaults(state.inputs));
    } catch {
      return null;
    }
  }, [state.inputs]);

  return (
    <WizardCtx.Provider value={{ state, dispatch, liveResult }}>
      {children}
    </WizardCtx.Provider>
  );
}

export function useWizard() {
  const ctx = useContext(WizardCtx);
  if (!ctx) throw new Error("useWizard must be used inside WizardProvider");
  return ctx;
}
