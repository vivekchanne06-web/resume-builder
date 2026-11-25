import React from "react";
import Link from "next/link";
import {
  FileText,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Layers,
  Award,
  Download,
  ShieldCheck,
} from "lucide-react";

const WORKFLOW_STEPS = [
  { step: "01", label: "Personal Info" },
  { step: "02", label: "Education" },
  { step: "03", label: "Skills (AI)" },
  { step: "04", label: "Projects (AI)" },
  { step: "05", label: "Experience (AI)" },
  { step: "06", label: "Achievements" },
  { step: "07", label: "Summary (AI)" },
  { step: "08", label: "ATS & PDF" },
];

const FEATURE_CARDS = [
  {
    icon: Sparkles,
    title: "AI-Assisted Bullet & Summary Writer",
    description:
      "Generate action-verb project bullets, role-tailored work experience, technical skills, and a 50–80 word ATS-ready summary in seconds.",
  },
  {
    icon: Award,
    title: "Real-Time ATS Score Breakdown",
    description:
      "Evaluate keywords, formatting, impact metrics, readability, and completeness along with missing keywords and quick wins.",
  },
  {
    icon: Layers,
    title: "Structured Step-by-Step Builder",
    description:
      "Move through focused sections with instant save, edit, and delete controls backed by MongoDB and Mongoose.",
  },
  {
    icon: Download,
    title: "Print-Ready PDF Export",
    description:
      "Preview your complete resume in a clean layout and export a sharp PDF directly from your browser when ready.",
  },
];

export default function HomePage() {
  return (
    <div
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
        fontFamily: "var(--font-sans)",
      }}
      className="min-h-screen flex flex-col transition-colors"
    >
      {/* Top Navigation */}
      <header
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
        }}
        className="border-b sticky top-0 z-20 backdrop-blur"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
            >
              <FileText className="w-5 h-5" />
            </div>
            <span
              style={{ color: "var(--foreground)" }}
              className="text-base font-bold tracking-tight"
            >
              AI Resume Builder
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              style={{ color: "var(--muted-foreground)" }}
              className="px-4 py-2 rounded-xl text-sm font-medium hover:opacity-80 transition-opacity"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-14">
          <div className="max-w-3xl">
            <div
              style={{
                backgroundColor: "var(--accent)",
                borderColor: "var(--ring)",
                color: "var(--accent-foreground)",
              }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold mb-6"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mint Signal · AI-Powered ATS Resume Builder</span>
            </div>

            <h1
              style={{
                color: "var(--foreground)",
                fontFamily: "var(--font-serif)",
              }}
              className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight"
            >
              Build an{" "}
              <span
                style={{
                  backgroundColor: "var(--accent)",
                  color: "var(--accent-foreground)",
                }}
                className="px-2 py-0.5 rounded-lg"
              >
                ATS-ready resume
              </span>{" "}
              step by step with AI guidance.
            </h1>

            <p
              style={{ color: "var(--muted-foreground)" }}
              className="text-base mt-5 leading-relaxed max-w-2xl"
            >
              New here? Create a free account to manage multiple resumes,
              generate quantified bullets and summaries with AI, check your ATS
              score, and download a clean PDF whenever you are ready.
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-8">
              <Link
                href="/auth/register"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "var(--primary-foreground)",
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Create Free Account
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/auth/login"
                style={{
                  backgroundColor: "var(--card)",
                  color: "var(--card-foreground)",
                  borderColor: "var(--border)",
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium border hover:opacity-90 transition-opacity"
              >
                Already have an account? Login
              </Link>
            </div>

            <div
              style={{ color: "var(--muted-foreground)" }}
              className="flex flex-wrap items-center gap-6 mt-8 text-xs"
            >
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2
                  style={{ color: "var(--accent-foreground)" }}
                  className="w-4 h-4"
                />
                8 Guided Resume Steps
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2
                  style={{ color: "var(--accent-foreground)" }}
                  className="w-4 h-4"
                />
                ATS Keyword & Impact Scoring
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck
                  style={{ color: "var(--accent-foreground)" }}
                  className="w-4 h-4"
                />
                JWT & HTTP-Only Cookie Auth
              </span>
            </div>
          </div>
        </section>

        {/* 8-Step Flow Strip */}
        <section
          style={{
            backgroundColor: "var(--muted)",
            borderColor: "var(--border)",
          }}
          className="border-y py-10"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2
                  style={{ color: "var(--accent-foreground)" }}
                  className="text-sm font-semibold uppercase tracking-wider"
                >
                  How It Works
                </h2>
                <p
                  style={{ color: "var(--foreground)" }}
                  className="text-lg font-bold mt-0.5"
                >
                  From raw details to a polished PDF in 8 steps
                </p>
              </div>
              <Link
                href="/dashboard"
                style={{ color: "var(--accent-foreground)" }}
                className="text-xs font-semibold hover:underline inline-flex items-center gap-1"
              >
                Open Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {WORKFLOW_STEPS.map((item) => (
                <div
                  key={item.step}
                  style={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                  }}
                  className="border rounded-xl p-3.5"
                >
                  <span
                    style={{
                      color: "var(--accent-foreground)",
                      fontFamily: "var(--font-mono)",
                    }}
                    className="text-xs font-semibold"
                  >
                    {item.step}
                  </span>
                  <p
                    style={{ color: "var(--card-foreground)" }}
                    className="text-xs font-medium mt-1"
                  >
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FEATURE_CARDS.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  style={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                  }}
                  className="border rounded-2xl p-6 transition-all"
                >
                  <div
                    style={{
                      backgroundColor: "var(--accent)",
                      borderColor: "var(--ring)",
                      color: "var(--accent-foreground)",
                    }}
                    className="w-10 h-10 rounded-xl border flex items-center justify-center mb-4"
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3
                    style={{ color: "var(--card-foreground)" }}
                    className="text-base font-semibold"
                  >
                    {feature.title}
                  </h3>
                  <p
                    style={{ color: "var(--muted-foreground)" }}
                    className="text-xs sm:text-sm mt-2 leading-relaxed"
                  >
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderColor: "var(--border)",
          color: "var(--muted-foreground)",
        }}
        className="border-t py-6 text-center text-xs"
      >
        AI Resume Builder · Next.js App Router, TypeScript & Tailwind CSS
      </footer>
    </div>
  );
}