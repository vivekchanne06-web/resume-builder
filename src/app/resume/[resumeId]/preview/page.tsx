"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  ChevronLeft,
  Download,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Award,
  LayoutDashboard,
} from "lucide-react";
import apiClient from "@/lib/apiClient";
import {
  IPersonalInfo,
  IWorkExperience,
  IProject,
  IEducation,
} from "@/types/resume.types";
import { AtsScoreBody, AtsScoreResponse } from "@/types/ai.types";
import { IApiResponse } from "@/types/api.types";
import ClassicExecutiveTemplate from "@/components/resume-templates/ClassicExecutiveTemplate";
import ModernMinimalTemplate from "@/components/resume-templates/ModernMinimalTemplate";
import EditorialSplitTemplate from "@/components/resume-templates/EditorialSplitTemplate";
import ThemeToggle from "@/components/ThemeToggle";

type TemplateId = "classic" | "modern" | "editorial";

const TEMPLATES: { id: TemplateId; label: string; desc: string }[] = [
  { id: "classic", label: "ATS Classic", desc: "Single-col, ATS-optimised" },
  { id: "modern", label: "Mint Signal", desc: "Mint accent, pill skills" },
  { id: "editorial", label: "Executive Split", desc: "Two-column, Lora serif" },
];

interface FullResumeDocument {
  _id: string;
  title?: string;
  jobTitle?: string;
  experienceLevel?: string;
  summary?: string;
  personalInfo?: Partial<IPersonalInfo>;
  workExperience?: IWorkExperience[];
  projects?: IProject[];
  education?: IEducation[];
  skills?: string[];
  certifications?: string[];
}

function buildResumePlainText(resume: FullResumeDocument): string {
  const info = resume.personalInfo ?? {};
  const lines: string[] = [];

  if (info.fullname) lines.push(info.fullname);
  if (resume.jobTitle) lines.push(`Target Role: ${resume.jobTitle}`);
  if (resume.experienceLevel)
    lines.push(`Experience Level: ${resume.experienceLevel}`);

  const contactParts = [
    info.email,
    info.mobile,
    info.address,
    info.github,
    info.linkedin,
    info.portfolio,
    info.leetcode,
  ].filter(Boolean);
  if (contactParts.length > 0) lines.push(contactParts.join(" | "));

  if (resume.summary) {
    lines.push("\nSUMMARY");
    lines.push(resume.summary);
  }

  if (resume.skills && resume.skills.length > 0) {
    lines.push("\nSKILLS");
    lines.push(resume.skills.join(", "));
  }

  if (resume.workExperience && resume.workExperience.length > 0) {
    lines.push("\nWORK EXPERIENCE");
    for (const exp of resume.workExperience) {
      lines.push(
        `${exp.position} - ${exp.company} (${exp.startDate} to ${exp.endDate})`
      );
      if (exp.description) lines.push(exp.description);
    }
  }

  if (resume.projects && resume.projects.length > 0) {
    lines.push("\nPROJECTS");
    for (const proj of resume.projects) {
      const stack = proj.techStack?.length
        ? ` [${proj.techStack.join(", ")}]`
        : "";
      lines.push(`${proj.title}${stack}`);
      if (proj.githubUrl) lines.push(`GitHub: ${proj.githubUrl}`);
      if (proj.liveUrl) lines.push(`Live: ${proj.liveUrl}`);
      if (proj.description) lines.push(proj.description);
    }
  }

  if (resume.education && resume.education.length > 0) {
    lines.push("\nEDUCATION");
    for (const edu of resume.education) {
      lines.push(
        `${edu.degree} - ${edu.institution} (${edu.startDate} to ${edu.endDate})`
      );
      if (edu.description) lines.push(edu.description);
    }
  }

  if (resume.certifications && resume.certifications.length > 0) {
    lines.push("\nCERTIFICATIONS & ACHIEVEMENTS");
    for (const cert of resume.certifications) {
      lines.push(`- ${cert}`);
    }
  }

  return lines.join("\n").trim();
}

function getScoreBadgeClass(score: number): string {
  if (score >= 85)
    return "bg-primary/15 text-accent-foreground border-primary/30";
  if (score >= 70)
    return "bg-primary/10 text-accent-foreground border-primary/20";
  if (score >= 50)
    return "bg-amber-500/15 text-amber-300 border-amber-500/30";
  return "bg-destructive/15 text-destructive border-destructive/30";
}

export default function ResumePreviewPage() {
  const params = useParams();
  const resumeId = params.resumeId as string;
  const router = useRouter();

  const [resume, setResume] = useState<FullResumeDocument | null>(null);
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const [atsLoading, setAtsLoading] = useState<boolean>(false);
  const [atsError, setAtsError] = useState<string>("");
  const [atsReport, setAtsReport] = useState<AtsScoreResponse | null>(null);
  const [downloaded, setDownloaded] = useState<boolean>(false);

  const [activeTemplate, setActiveTemplate] = useState<TemplateId>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`resumeTemplate_${resumeId}`);
      if (stored === "classic" || stored === "modern" || stored === "editorial")
        return stored;
    }
    return "classic";
  });

  // Persist template choice
  useEffect(() => {
    if (resumeId) {
      localStorage.setItem(`resumeTemplate_${resumeId}`, activeTemplate);
    }
  }, [activeTemplate, resumeId]);

  useEffect(() => {
    if (!resumeId) return;

    const fetchResume = async () => {
      try {
        const { data } = await apiClient.get<IApiResponse<FullResumeDocument>>(
          `/api/resume/${resumeId}`
        );
        if (data.success && data.data) {
          setResume(data.data);
        } else {
          setError(data.message || "Could not load resume.");
        }
      } catch {
        setError("Failed to load resume preview. Please refresh.");
      } finally {
        setPageLoading(false);
      }
    };

    fetchResume();
  }, [resumeId]);

  const handleEvaluateAts = async () => {
    if (!resume) return;
    setAtsError("");

    const resumeText = buildResumePlainText(resume);
    if (resumeText.length < 50) {
      setAtsError(
        "Add more details across your resume sections before running an ATS score check."
      );
      return;
    }

    setAtsLoading(true);
    try {
      const payload: AtsScoreBody = {
        resumeText: resumeText.slice(0, 10000),
      };
      const { data } = await apiClient.post<IApiResponse<AtsScoreResponse>>(
        "/api/ai/atsScore",
        payload
      );

      if (data.success && data.data) {
        setAtsReport(data.data);
      } else {
        setAtsError(data.message || "ATS score evaluation failed.");
      }
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? "ATS evaluation failed.")
        : "ATS evaluation failed. Please try again.";
      setAtsError(msg);
    } finally {
      setAtsLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    window.print();
    setDownloaded(true);
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-card border border-destructive/30 rounded-2xl p-6 text-center space-y-4">
          <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
          <p className="text-sm text-destructive">{error || "Resume not found."}</p>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
          >
            <LayoutDashboard className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground print:bg-white print:text-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 print:p-0 print:max-w-none">

        {/* ── Top Action Bar ─────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 print:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push(`/resume/${resumeId}/summary`)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-card hover:bg-muted text-foreground border border-border transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Edit Summary
            </button>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {resume.title || "Resume Preview"}
              </h1>
              <p className="text-xs text-muted-foreground">
                Step 8 of 8 · Preview, ATS Score &amp; Export PDF
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ThemeToggle />

            <button
              type="button"
              onClick={handleEvaluateAts}
              disabled={atsLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/40 disabled:opacity-50 transition-all"
            >
              {atsLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {atsLoading ? "Analyzing ATS…" : "Check ATS Score"}
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border transition-all"
            >
              <LayoutDashboard className="w-4 h-4 text-accent-foreground" />
              Finish &amp; Dashboard
            </button>
          </div>
        </div>

        {/* ── Template Selector Bar ───────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2 mb-6 print:hidden">
          <span className="text-xs font-medium text-muted-foreground mr-1">
            Template:
          </span>
          {TEMPLATES.map(({ id, label, desc }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTemplate(id)}
              className={`group flex flex-col px-4 py-2 rounded-xl text-xs font-medium transition-all border ${
                activeTemplate === id
                  ? "bg-primary text-primary-foreground border-primary/40 shadow-md shadow-primary/20"
                  : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
              }`}
            >
              <span className="font-semibold">{label}</span>
              <span
                className={`text-[10px] mt-0.5 ${
                  activeTemplate === id
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground/70"
                }`}
              >
                {desc}
              </span>
            </button>
          ))}
        </div>

        {/* ── Post-Download Completion Banner ─────────────────────────────── */}
        {downloaded && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-primary/10 border border-primary/30 rounded-2xl p-4 print:hidden">
            <div className="flex items-center gap-2.5 text-sm text-accent-foreground">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
              <span>
                Your resume is ready! Return to your dashboard to manage or
                create another resume.
              </span>
            </div>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all shrink-0"
            >
              <LayoutDashboard className="w-4 h-4" />
              Go to Dashboard
            </button>
          </div>
        )}

        {/* ── Layout Grid: Resume Document + ATS Score Sidebar ────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start print:block">

          {/* Printable Resume Sheet */}
          <div className="resume-sheet lg:col-span-2 bg-white rounded-2xl shadow-2xl print:shadow-none print:rounded-none">
            {activeTemplate === "classic" && (
              <ClassicExecutiveTemplate resume={resume} />
            )}
            {activeTemplate === "modern" && (
              <ModernMinimalTemplate resume={resume} />
            )}
            {activeTemplate === "editorial" && (
              <EditorialSplitTemplate resume={resume} />
            )}
          </div>

          {/* ATS Score Panel (Hidden when printing) */}
          <aside className="bg-card border border-border rounded-2xl p-6 space-y-5 print:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-accent-foreground" />
                <h2 className="text-base font-semibold text-foreground">
                  ATS Score Analyzer
                </h2>
              </div>
              {atsReport && (
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getScoreBadgeClass(
                    atsReport.overall_score
                  )}`}
                >
                  {atsReport.overall_score}/100 · {atsReport.grade}
                </span>
              )}
            </div>

            {atsError && (
              <div className="flex items-start gap-2.5 bg-destructive/10 border border-destructive/30 rounded-xl p-3.5 text-xs text-destructive">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{atsError}</span>
              </div>
            )}

            {!atsReport && !atsError && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                Click{" "}
                <strong className="text-foreground">Check ATS Score</strong> to
                evaluate keyword match, formatting, impact metrics, readability,
                and completeness.
              </p>
            )}

            {atsReport && (
              <div className="space-y-4 text-xs">
                <div className="space-y-2">
                  {Object.entries(atsReport.sections).map(([key, sec]) => (
                    <div
                      key={key}
                      className="bg-muted/60 border border-border rounded-xl p-3"
                    >
                      <div className="flex items-center justify-between font-semibold text-foreground capitalize">
                        <span>{key}</span>
                        <span className="text-accent-foreground">
                          {sec.score}%
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-1 leading-relaxed">
                        {sec.feedback}
                      </p>
                    </div>
                  ))}
                </div>

                {atsReport.missing_keywords?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-amber-500 dark:text-amber-300 mb-1.5">
                      Missing Keywords
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {atsReport.missing_keywords.map((kw, i) => (
                        <span
                          key={`${kw}-${i}`}
                          className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {atsReport.quick_wins?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-accent-foreground mb-1.5">
                      Quick Wins
                    </h3>
                    <ul className="space-y-1.5 text-muted-foreground">
                      {atsReport.quick_wins.map((win, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span>{win}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
