"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  FileText,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  Info,
} from "lucide-react";
import apiClient from "@/lib/apiClient";
import { GenerateSummeryBody } from "@/types/ai.types";
import { IApiResponse } from "@/types/api.types";

interface ResumeSummaryPayload {
  _id: string;
  summary?: string;
  jobTitle?: string;
  experienceLevel?: string;
  skills?: string[];
}

function getWordCountColor(count: number): string {
  if (count === 0) return "text-muted-foreground";
  if (count < 50) return "text-yellow-400";
  if (count <= 80) return "text-green-400";
  return "text-destructive";
}

function getWordCountLabel(count: number): string {
  if (count === 0) return "· start writing or generate with AI";
  if (count < 50) return `· too short — add ${50 - count} more words`;
  if (count <= 80) return "· ideal ATS length ✓";
  return `· too long — trim ${count - 80} words`;
}

export default function SummaryPage() {
  const params = useParams();
  const resumeId = params.resumeId as string;
  const router = useRouter();

  const [resumeMeta, setResumeMeta] = useState<{
    jobTitle: string;
    experienceLevel: string;
    skills: string[];
  }>({
    jobTitle: "",
    experienceLevel: "",
    skills: [],
  });

  const [summary, setSummary] = useState<string>("");
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  const wordCount =
    summary.trim() === "" ? 0 : summary.trim().split(/\s+/).length;
  const isIdealLength = wordCount >= 50 && wordCount <= 80;

  // ── 1. Fetch resume context & existing summary on mount ───────────────────
  useEffect(() => {
    if (!resumeId) return;

    const fetchResume = async () => {
      try {
        const { data } = await apiClient.get<
          IApiResponse<ResumeSummaryPayload>
        >(`/api/resume/${resumeId}`);

        if (data.success && data.data) {
          setResumeMeta({
            jobTitle: data.data.jobTitle ?? "",
            experienceLevel: data.data.experienceLevel ?? "",
            skills: Array.isArray(data.data.skills) ? data.data.skills : [],
          });
          setSummary(data.data.summary ?? "");
        }
      } catch {
        setError("Could not load resume summary. Please refresh the page.");
      } finally {
        setPageLoading(false);
      }
    };

    fetchResume();
  }, [resumeId]);

  // ── 2. Generate summary via AI (POST /api/ai/generateSummary) ─────────────
  const handleGenerateSummary = async () => {
    setError("");
    setSuccessMsg("");

    if (!resumeMeta.jobTitle.trim() || !resumeMeta.experienceLevel.trim()) {
      setError(
        "Job Title or Experience Level is missing. Complete Personal Info first before generating a summary."
      );
      return;
    }

    setGenerating(true);
    try {
      const payload: GenerateSummeryBody = {
        jobTitle: resumeMeta.jobTitle.trim(),
        experienceLevel: resumeMeta.experienceLevel.trim(),
        skills: resumeMeta.skills,
      };

      const { data } = await apiClient.post<IApiResponse<string>>(
        "/api/ai/generateSummary",
        payload
      );

      if (data.success && typeof data.data === "string") {
        setSummary(data.data.trim());
        setSuccessMsg("Summary generated — review and customize as needed.");
        setTimeout(() => setSuccessMsg(""), 3500);
      } else {
        setError(data.message || "Could not generate summary.");
      }
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? "AI summary generation failed.")
        : "AI summary generation failed. Please try again.";
      setError(msg);
    } finally {
      setGenerating(false);
    }
  };

  // ── 3. Save summary via PATCH /api/resume/:resumeId ────────────────────────
  const handleSave = async (andContinue = false) => {
    setError("");
    setSuccessMsg("");

    const trimmed = summary.trim();
    if (!trimmed) {
      setError("Summary cannot be empty. Write a summary or generate with AI.");
      return;
    }

    setSaving(true);
    try {
      const { data } = await apiClient.patch<IApiResponse>(
        `/api/resume/${resumeId}`,
        { summary: trimmed }
      );

      if (data.success) {
        if (andContinue) {
          router.push(`/resume/${resumeId}/preview`);
        } else {
          setSuccessMsg("Summary saved successfully!");
          setTimeout(() => setSuccessMsg(""), 3000);
        }
      } else {
        setError(data.message || "Failed to save summary.");
      }
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? "Failed to save summary.")
        : "Failed to save summary. Please try again.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Professional Summary
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Step 7 of 8 · Resume Builder
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
            Synthesize your role focus, key technical skills, and measurable
            impact into a concise{" "}
            <span className="text-accent-foreground font-medium">50–80 word</span>{" "}
            opening statement for recruiters and ATS scanners.
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-5 flex items-start gap-3 bg-destructive/10 border border-destructive/30 rounded-xl p-4">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 flex items-start gap-3 bg-primary/10 border border-primary/30 rounded-xl p-4">
            <CheckCircle2 className="w-5 h-5 text-accent-foreground shrink-0 mt-0.5" />
            <p className="text-sm text-accent-foreground">{successMsg}</p>
          </div>
        )}

        {/* Editor Card */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <label
                htmlFor="summary-textarea"
                className="block text-sm font-semibold text-foreground"
              >
                Summary Statement
              </label>
              <p className="text-xs text-muted-foreground mt-0.5">
                {resumeMeta.jobTitle && resumeMeta.experienceLevel
                  ? `Context: ${resumeMeta.experienceLevel} · ${resumeMeta.jobTitle} (${resumeMeta.skills.length} skills)`
                  : "Set Job Title & Experience Level in Personal Info for best AI results"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleGenerateSummary}
              disabled={generating || saving}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-primary hover:bg-primary/90 border border-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
            >
              {generating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {generating ? "Generating…" : "Generate with AI"}
            </button>
          </div>

          <textarea
            id="summary-textarea"
            value={summary}
            onChange={(e) => {
              setSummary(e.target.value);
              if (error) setError("");
            }}
            rows={7}
            disabled={generating}
            placeholder="Write a crisp 50–80 word summary highlighting your core stack, experience, and impact, or click Generate with AI..."
            className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground resize-none leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 transition-all"
          />

          {/* Word & Character Counter */}
          <div className="flex items-center justify-between text-xs">
            <div
              className={`flex items-center gap-1.5 font-medium transition-colors ${getWordCountColor(
                wordCount
              )}`}
            >
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>
                {wordCount} words {getWordCountLabel(wordCount)}
              </span>
            </div>
            <span className="text-muted-foreground">{summary.length} chars</span>
          </div>

          {/* 80-Word Target Bar */}
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isIdealLength
                  ? "bg-green-500"
                  : wordCount > 80
                  ? "bg-red-500"
                  : "bg-indigo-500"
              }`}
              style={{ width: `${Math.min((wordCount / 80) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* ATS Guidelines Card */}
        <div className="mt-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-amber-300">
              ATS Summary Best Practices
            </h2>
          </div>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold mt-0.5 shrink-0">→</span>
              <span>
                Lead with your target role and experience profile so recruiters
                immediately see alignment.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold mt-0.5 shrink-0">→</span>
              <span>
                Weave your top technical skills and measurable outcomes into a
                tight 50–80 word block.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold mt-0.5 shrink-0">→</span>
              <span>
                Avoid first-person pronouns (&ldquo;I&rdquo;, &ldquo;my&rdquo;)
                and keep formatting clean plain text.
              </span>
            </li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            type="button"
            onClick={() => router.push(`/resume/${resumeId}/achievements`)}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-muted hover:bg-muted/80 text-muted-foreground border border-border disabled:opacity-50 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={saving || generating}
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-muted hover:bg-muted/80 text-muted-foreground border border-border disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {saving && !successMsg && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Save
            </button>

            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={saving || generating}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/40 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  Save & Preview
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}