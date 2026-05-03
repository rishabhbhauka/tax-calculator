import Link from "next/link";
import { SupportSection } from "./results/SupportSection";
import { ScrollReveal } from "./components/ScrollReveal";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <SiteHeader />
      <HeroSection />
      <MockResultSection />
      <HowItWorksSection />
      <div className="py-12 px-6" style={{ background: "var(--color-bg)" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <SupportSection />
        </div>
      </div>
      <Footer />
    </main>
  );
}

/* ── 0. Site Header ──────────────────────────── */

function SiteHeader() {
  return (
    <header
      className="anim-slide-down"
      style={{
        background: "#0F172A",
        borderBottom: "1px solid #1E293B",
        padding: "12px 24px",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Tool name */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#F1F5F9",
              letterSpacing: "-0.01em",
            }}
          >
            India Tax Regime Calculator
          </span>
          <span style={{ fontSize: 11, color: "#64748B", marginTop: 1 }}>
            FY 2025-26 · Updated for Budget 2025
          </span>
        </div>

        {/* Creator identity */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            RB
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#E2E8F0" }}>
              Rishabh Bhauka, CA
            </span>
            <a
              href="https://carishabh.in"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 11,
                color: "#60A5FA",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              carishabh.in ↗
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ── 1. Hero ─────────────────────────────────── */

function HeroSection() {
  return (
    <section
      className="relative flex flex-col items-center justify-center text-center px-6 py-24 md:py-36"
      style={{
        background:
          "linear-gradient(160deg, #0F172A 0%, #1E3A8A 55%, #1D4ED8 100%)",
        overflow: "hidden",
      }}
    >
      {/* Subtle background orbs */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-80px",
          left: "50%",
          transform: "translateX(-50%)",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
          animation: "fadeIn 1.2s ease both",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: "-60px",
          right: "5%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
          animation: "fadeIn 1.4s ease 0.2s both",
        }}
      />

      {/* Badge */}
      <span
        className="float-badge inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-6"
        style={{
          background: "rgba(255,255,255,0.12)",
          color: "#93C5FD",
          border: "1px solid rgba(255,255,255,0.15)",
          position: "relative",
          zIndex: 1,
        }}
      >
        FY 2025-26 · Updated for Budget 2025
      </span>

      {/* Headline */}
      <h1
        className="anim-fade-up-1 text-4xl md:text-6xl font-bold leading-tight max-w-3xl"
        style={{ color: "#FFFFFF", position: "relative", zIndex: 1 }}
      >
        Find out which tax regime{" "}
        <span style={{ color: "#60A5FA" }}>saves you more money.</span>
      </h1>

      {/* Sub-headline */}
      <p
        className="anim-fade-up-2 mt-6 text-lg md:text-xl max-w-xl leading-relaxed"
        style={{ color: "#CBD5E1", position: "relative", zIndex: 1 }}
      >
        Old Regime or New Regime? Answer{" "}
        <strong style={{ color: "#FFFFFF" }}>8 simple questions</strong>. Get
        your answer in 2 minutes. No jargon. No CA required.
      </p>

      {/* Primary CTA */}
      <Link
        href="/calculator"
        className="btn-pulse mt-10 inline-flex items-center gap-2 text-base font-semibold px-8 py-4 transition-transform hover:scale-[1.03] active:scale-[0.97]"
        style={{
          background: "var(--color-primary)",
          color: "#FFFFFF",
          borderRadius: "var(--radius-button)",
          boxShadow: "0 4px 24px rgba(0,87,255,0.45)",
          position: "relative",
          zIndex: 1,
        }}
      >
        Calculate My Tax
        <ArrowRight />
      </Link>

      {/* Trust signals */}
      <div
        className="anim-fade-up-4 mt-10 flex flex-col sm:flex-row gap-4 sm:gap-8 items-center"
        style={{ position: "relative", zIndex: 1 }}
      >
        <TrustBadge icon="🔒" text="100% Private — nothing leaves your device" />
        <TrustBadge icon="✓" text="Updated for FY 2025-26" />
        <TrustBadge icon="⚡" text="Results in under 2 minutes" />
      </div>
    </section>
  );
}

function TrustBadge({ icon, text }: { icon: string; text: string }) {
  return (
    <span className="flex items-center gap-2 text-sm" style={{ color: "#94A3B8" }}>
      <span>{icon}</span>
      <span>{text}</span>
    </span>
  );
}

/* ── 2. Mock Result Preview ──────────────────── */

function MockResultSection() {
  return (
    <section className="py-20 px-6" style={{ background: "var(--color-bg)" }}>
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-10">
            <h2
              className="text-2xl md:text-3xl font-bold"
              style={{ color: "var(--color-text-primary)" }}
            >
              Here&rsquo;s what your result will look like
            </h2>
            <p className="mt-2 text-base" style={{ color: "var(--color-text-secondary)" }}>
              Your real result will be based on your actual numbers.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100} className="mock-card-enter">
          {/* Mock card */}
          <div
            className="rounded-[16px] overflow-hidden"
            style={{
              background: "var(--color-surface)",
              boxShadow: "var(--shadow-card)",
              border: "1px solid var(--color-border)",
            }}
          >
            {/* Verdict banner */}
            <div
              className="px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              style={{
                background: "linear-gradient(90deg, #F0FDF4 0%, #DCFCE7 100%)",
                borderBottom: "1px solid #BBF7D0",
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "#15803D" }}
                  >
                    Recommended
                  </p>
                  <p className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                    New Tax Regime
                  </p>
                </div>
              </div>
              <div className="sm:text-right" style={{ color: "var(--color-accent-green)" }}>
                <p className="text-sm font-medium">You save</p>
                <p className="text-3xl font-bold">₹48,672</p>
                <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                  this financial year
                </p>
              </div>
            </div>

            {/* Comparison table */}
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--color-border)" }}>
                      <th
                        className="text-left py-2 font-semibold pb-3"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        Item
                      </th>
                      <th
                        className="text-right py-2 font-semibold pb-3"
                        style={{ color: "var(--color-old-regime)" }}
                      >
                        🏛 Old Regime
                      </th>
                      <th
                        className="text-right py-2 font-semibold pb-3"
                        style={{ color: "var(--color-new-regime)" }}
                      >
                        ✨ New Regime
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_ROWS.map((row, i) => (
                      <tr
                        key={row.label}
                        style={{
                          borderBottom: "1px solid var(--color-border)",
                          background: i % 2 === 0 ? "transparent" : "#FAFAFA",
                        }}
                      >
                        <td
                          className="py-2 pr-4 font-medium"
                          style={{
                            color: "var(--color-text-primary)",
                            filter: row.blur ? "blur(4px)" : "none",
                            userSelect: row.blur ? "none" : "auto",
                          }}
                        >
                          {row.label}
                        </td>
                        <td
                          className="py-2 text-right"
                          style={{
                            color: "var(--color-text-secondary)",
                            filter: row.blur ? "blur(4px)" : "none",
                            userSelect: row.blur ? "none" : "auto",
                          }}
                        >
                          {row.old}
                        </td>
                        <td
                          className="py-2 text-right"
                          style={{
                            color: "var(--color-text-secondary)",
                            filter: row.blur ? "blur(4px)" : "none",
                            userSelect: row.blur ? "none" : "auto",
                          }}
                        >
                          {row.new}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Why this recommendation */}
              <div
                className="mt-6 rounded-[12px] p-4"
                style={{
                  background: "var(--color-primary-light)",
                  border: "1px solid #BFDBFE",
                }}
              >
                <p
                  className="text-sm font-semibold mb-2"
                  style={{ color: "var(--color-primary)" }}
                >
                  Why this recommendation?
                </p>
                <ul className="space-y-1">
                  {[
                    "The New Regime's lower slab rates offset your deductions",
                    "Your HRA exemption in the Old Regime is smaller than the limit",
                    "Employer NPS contribution is deductible in both regimes",
                  ].map((line) => (
                    <li
                      key={line}
                      className="text-sm blur-[3px] select-none"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      • {line}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <div className="text-center mt-8">
            <Link
              href="/calculator"
              className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 transition-transform hover:scale-[1.02]"
              style={{
                background: "var(--color-primary-light)",
                color: "var(--color-primary)",
                borderRadius: "var(--radius-button)",
                border: "1.5px solid var(--color-primary)",
              }}
            >
              Get My Actual Result
              <ArrowRight />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

const MOCK_ROWS = [
  { label: "Gross Salary", old: "₹9,00,000", new: "₹9,00,000", blur: false },
  { label: "Standard Deduction", old: "−₹50,000", new: "−₹75,000", blur: false },
  { label: "HRA Exemption", old: "−₹72,000", new: "₹0 (not allowed)", blur: true },
  { label: "80C Investments", old: "−₹1,50,000", new: "₹0 (not allowed)", blur: true },
  { label: "Taxable Income", old: "₹5,20,000", new: "₹7,05,000", blur: true },
  { label: "Tax on Slabs", old: "₹13,500", new: "₹15,250", blur: true },
  { label: "Health & Ed. Cess (4%)", old: "₹540", new: "₹610", blur: true },
  { label: "Total Tax Payable", old: "₹14,040", new: "₹15,860", blur: false },
];

/* ── 3. How It Works ─────────────────────────── */

const HOW_IT_WORKS_STEPS = [
  {
    icon: "📋",
    number: "01",
    title: "Answer simple questions",
    body: "We ask about your salary, rent, and a few investments. No finance degree needed. You can skip anything you're unsure about.",
  },
  {
    icon: "📊",
    number: "02",
    title: "Watch the math update live",
    body: "See your tax estimate for both regimes change in real time as you answer each question.",
  },
  {
    icon: "🎯",
    number: "03",
    title: "Get your recommendation",
    body: "A clear verdict, a slab-by-slab breakdown of exactly how much you pay, and personalised tips to reduce your tax further.",
  },
];

function HowItWorksSection() {
  return (
    <section
      className="py-20 px-6"
      style={{
        background:
          "linear-gradient(180deg, var(--color-bg) 0%, #EEF2FF 100%)",
      }}
    >
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2
              className="text-2xl md:text-3xl font-bold"
              style={{ color: "var(--color-text-primary)" }}
            >
              How it works
            </h2>
            <p className="mt-2 text-base" style={{ color: "var(--color-text-secondary)" }}>
              Three steps. Two minutes. One clear answer.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HOW_IT_WORKS_STEPS.map((step, i) => (
            <ScrollReveal key={step.number} delay={i * 120}>
              <div
                className="flex flex-col p-6 rounded-[16px] h-full"
                style={{
                  background: "var(--color-surface)",
                  boxShadow: "var(--shadow-card)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{step.icon}</span>
                  <span
                    className="text-xs font-bold tracking-widest"
                    style={{ color: "var(--color-primary)" }}
                  >
                    STEP {step.number}
                  </span>
                </div>
                <h3
                  className="text-base font-semibold mb-2"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {step.body}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={200}>
          <div className="text-center mt-12">
            <Link
              href="/calculator"
              className="inline-flex items-center gap-2 text-base font-semibold px-8 py-4 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "var(--color-primary)",
                color: "#FFFFFF",
                borderRadius: "var(--radius-button)",
                boxShadow: "0 4px 24px rgba(0,87,255,0.35)",
              }}
            >
              Calculate My Tax
              <ArrowRight />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ── 4. Footer ───────────────────────────────── */

function Footer() {
  return (
    <footer
      className="mt-auto py-8 px-6"
      style={{ background: "#0F172A", borderTop: "1px solid #1E293B" }}
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <p className="text-sm" style={{ color: "#94A3B8" }}>
            Built for Indian salaried taxpayers · FY 2025-26 (AY 2026-27)
          </p>
          <p className="text-xs mt-1" style={{ color: "#64748B" }}>
            Not financial advice. Verify with a CA for complex situations.
          </p>
        </div>
        <a
          href="https://carishabh.in"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs hover:underline"
          style={{ color: "#60A5FA", fontWeight: 600 }}
        >
          carishabh.in ↗
        </a>
      </div>
    </footer>
  );
}

/* ── Shared ──────────────────────────────────── */

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
