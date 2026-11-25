"use client";

import { useParams, usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { FileText, ChevronRight, ArrowLeft } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

// ── Step config ───────────────────────────────────────────────────────────────
const STEPS = [
  { label: "Personal Info", path: "personal-info" },
  { label: "Education",     path: "education"      },
  { label: "Skills",        path: "skills"         },
  { label: "Projects",      path: "projects"       },
  { label: "Experience",    path: "experience"     },
  { label: "Achievements",  path: "achievements"   },
  { label: "Summary",       path: "summary"        },
  { label: "Preview",       path: "preview"        },
];

// ─────────────────────────────────────────────────────────────────────────────
export default function ResumeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params     = useParams();
  const pathname   = usePathname();
  const router     = useRouter();
  const resumeId   = params.resumeId as string;

  const currentIdx = STEPS.findIndex((s) => pathname.includes(s.path));
  const pct        = Math.round(((currentIdx + 1) / STEPS.length) * 100);

  return (
    <div className="min-h-screen bg-background">

      {/* ── Sticky top nav ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-background/90 backdrop-blur-sm border-b border-border print:hidden">

        {/* Brand row */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>

            <span className="text-border text-xs">|</span>

            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
                <FileText className="w-3 h-3 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground text-sm hidden sm:block">
                ResumeAI
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Step counter */}
            <span className="text-xs text-muted-foreground">
              Step{" "}
              <span className="text-primary font-semibold">
                {currentIdx + 1}
              </span>{" "}
              of {STEPS.length}
            </span>
            <div className="text-xs font-semibold text-primary-foreground bg-primary/90 px-2.5 py-1 rounded-full">
              {pct}%
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-border">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Step pills — horizontal scroll on mobile */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-2.5">
            {STEPS.map((step, i) => {
              const isActive    = pathname.includes(step.path);
              const isCompleted = i < currentIdx;

              return (
                <div key={step.path} className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() =>
                      router.push(`/resume/${resumeId}/${step.path}`)
                    }
                    className={`
                      px-2.5 py-1 rounded-full text-xs font-medium transition-all
                      ${isActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : isCompleted
                        ? "bg-primary/10 text-accent-foreground border border-primary/20 hover:bg-primary/20"
                        : "text-muted-foreground cursor-default"
                      }
                    `}
                    disabled={!isActive && !isCompleted}
                  >
                    <span className="text-[10px] mr-1 opacity-70">{i + 1}.</span>
                    {step.label}
                  </button>

                  {i < STEPS.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-border shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Page content */}
      {children}
    </div>
  );
}
