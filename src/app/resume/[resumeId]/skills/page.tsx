"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  Wrench,
  Sparkles,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import apiClient from "@/lib/apiClient";
import { GenerateSkillsBody } from "@/types/ai.types";
import { IApiResponse } from "@/types/api.types";

interface ResumeSkillsPayload {
  _id: string;
  jobTitle?: string;
  experienceLevel?: string;
  skills?: string[];
}

export default function SkillsPage() {
  const params = useParams();
  const resumeId = params.resumeId as string;
  const router = useRouter();

  const [jobTitle, setJobTitle] = useState<string>("");
  const [experienceLevel, setExperienceLevel] = useState<string>("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState<string>("");

  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  // ── 1. Load existing resume skills + context for AI ───────────────────────
  useEffect(() => {
    if (!resumeId) return;

    const fetchResume = async () => {
      try {
        const { data } = await apiClient.get<IApiResponse<ResumeSkillsPayload>>(
          `/api/resume/${resumeId}`
        );
        if (data.success && data.data) {
          setJobTitle(data.data.jobTitle ?? "");
          setExperienceLevel(data.data.experienceLevel ?? "");
          setSkills(Array.isArray(data.data.skills) ? data.data.skills : []);
        }
      } catch {
        setError("Could not load skills data. Please refresh the page.");
      } finally {
        setPageLoading(false);
      }
    };

    fetchResume();
  }, [resumeId]);

  // ── 2. Add / remove skills manually ──────────────────────────────────────
  const addSkill = (raw: string) => {
    const cleaned = raw.trim();
    if (!cleaned) return;

    const exists = skills.some(
      (s) => s.toLowerCase() === cleaned.toLowerCase()
    );
    if (exists) {
      setError(`"${cleaned}" is already in your skills list.`);
      return;
    }

    setError("");
    setSkills((prev) => [...prev, cleaned]);
    setSkillInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(skillInput);
    }
  };

  const removeSkill = (indexToRemove: number) => {
    setSkills((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // ── 3. Generate ATS-friendly technical skills via AI ──────────────────────
  const handleGenerateSkills = async () => {
    setError("");
    setSuccessMsg("");

    if (!jobTitle.trim() || !experienceLevel.trim()) {
      setError(
        "Job Title or Experience Level is missing. Complete Personal Info first or enter context."
      );
      return;
    }

    setGenerating(true);
    try {
      const payload: GenerateSkillsBody = {
        jobTitle: jobTitle.trim(),
        experienceLevel: experienceLevel.trim(),
      };

      const { data } = await apiClient.post<IApiResponse<string[]>>(
        "/api/ai/generateSkills",
        payload
      );

      if (data.success && Array.isArray(data.data)) {
        // Merge AI suggestions without case-insensitive duplicates
        setSkills((prev) => {
          const existingLower = new Set(prev.map((s) => s.toLowerCase()));
          const merged = [...prev];
          for (const item of data.data!) {
            const trimmed = item.trim();
            if (trimmed && !existingLower.has(trimmed.toLowerCase())) {
              existingLower.add(trimmed.toLowerCase());
              merged.push(trimmed);
            }
          }
          return merged;
        });
        setSuccessMsg("AI technical skills added. Review and save your changes.");
        setTimeout(() => setSuccessMsg(""), 3500);
      } else {
        setError(data.message || "Could not generate skills.");
      }
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? "AI skill generation failed.")
        : "AI skill generation failed. Please try again.";
      setError(msg);
    } finally {
      setGenerating(false);
    }
  };

  // ── 4. Save skills to resume ──────────────────────────────────────────────
  const handleSave = async (andContinue = false) => {
    setError("");
    setSuccessMsg("");
    setSaving(true);

    try {
      const { data } = await apiClient.patch<IApiResponse>(
        `/api/resume/${resumeId}`,
        { skills }
      );

      if (data.success) {
        if (andContinue) {
          router.push(`/resume/${resumeId}/projects`);
        } else {
          setSuccessMsg("Skills saved successfully!");
          setTimeout(() => setSuccessMsg(""), 3000);
        }
      } else {
        setError(data.message || "Failed to save skills.");
      }
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? "Failed to save skills.")
        : "Failed to save skills. Please try again.";
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
              <Wrench className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Technical Skills</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Step 3 of 8 · Resume Builder
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
            Add specific tools, frameworks, and languages that match your target
            role. Generate keyword-rich suggestions with AI or type your own.
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

        {/* Main Card */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
          {/* AI Generation Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                AI Skill Suggestions
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {jobTitle && experienceLevel
                  ? `Tailored for ${experienceLevel} · ${jobTitle}`
                  : "Uses your Job Title and Experience Level to suggest ATS skills"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleGenerateSkills}
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

          {/* Manual Input */}
          <div>
            <label
              htmlFor="skill-input"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Add a Skill
            </label>
            <div className="flex gap-2.5">
              <input
                id="skill-input"
                type="text"
                value={skillInput}
                onChange={(e) => {
                  setSkillInput(e.target.value);
                  if (error) setError("");
                }}
                onKeyDown={handleKeyDown}
                placeholder="e.g. TypeScript, Next.js, MongoDB (press Enter)"
                className="flex-1 bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => addSkill(skillInput)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium bg-muted hover:bg-gray-700 text-foreground border border-border transition-all"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>

          {/* Skill Chips */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-medium text-muted-foreground">
                Selected Skills ({skills.length})
              </span>
              {skills.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSkills([])}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-primary/10 text-accent-foreground border border-primary/20"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      aria-label={`Remove ${skill}`}
                      className="text-accent-foreground/70 hover:text-foreground transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-gray-800 rounded-xl p-6 text-center text-xs text-muted-foreground">
                No skills added yet. Click &ldquo;Generate with AI&rdquo; or add
                skills manually above.
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            type="button"
            onClick={() => router.push(`/resume/${resumeId}/education`)}
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
                  Save & Continue
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