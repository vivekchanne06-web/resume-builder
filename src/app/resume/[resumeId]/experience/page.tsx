"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  Briefcase,
  Plus,
  Trash2,
  Pencil,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Building2,
  Calendar,
  Layers,
} from "lucide-react";
import apiClient from "@/lib/apiClient";
import { IWorkExperience } from "@/types/resume.types";
import { GenerateWorkExperienceDescriptionBody } from "@/types/ai.types";
import { IApiResponse } from "@/types/api.types";

interface ExperienceEntry extends IWorkExperience {
  _id?: string;
}

interface ResumeExperiencePayload {
  _id: string;
  jobTitle?: string;
  experienceLevel?: string;
  workExperience?: ExperienceEntry[];
}

interface ExperienceFormErrors {
  company?: string;
  position?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  ai?: string;
}

const emptyExperience = (): ExperienceEntry => ({
  company: "",
  position: "",
  startDate: "",
  endDate: "",
  description: "",
});

interface ExperienceModalProps {
  initial: ExperienceEntry;
  editIndex: number | null;
  defaultJobTitle: string;
  defaultExperienceLevel: string;
  onSave: (entry: ExperienceEntry) => void;
  onClose: () => void;
}

function ExperienceFormModal({
  initial,
  editIndex,
  defaultJobTitle,
  defaultExperienceLevel,
  onSave,
  onClose,
}: ExperienceModalProps) {
  const [form, setForm] = useState<ExperienceEntry>(initial);
  const [techInput, setTechInput] = useState<string>("");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [numberOfYears, setNumberOfYears] = useState<number>(1);
  const [errors, setErrors] = useState<ExperienceFormErrors>({});
  const [generating, setGenerating] = useState<boolean>(false);

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ExperienceFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleAddTech = () => {
    const cleaned = techInput.trim();
    if (!cleaned) return;

    const duplicate = techStack.some(
      (t) => t.toLowerCase() === cleaned.toLowerCase()
    );
    if (duplicate) {
      setErrors((prev) => ({
        ...prev,
        ai: `"${cleaned}" is already added to AI tech stack.`,
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, ai: undefined }));
    setTechStack((prev) => [...prev, cleaned]);
    setTechInput("");
  };

  const handleTechKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTech();
    }
  };

  const handleRemoveTech = (idx: number) => {
    setTechStack((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleGenerateExperience = async () => {
    setErrors((prev) => ({ ...prev, ai: undefined, description: undefined }));

    const roleToUse = (form.position || defaultJobTitle).trim();
    const levelToUse = (defaultExperienceLevel || "Entry-Level").trim();

    if (!roleToUse) {
      setErrors((prev) => ({
        ...prev,
        ai: "Enter a Position / Role (or set Job Title in Personal Info) to generate with AI.",
      }));
      return;
    }

    if (techStack.length === 0) {
      setErrors((prev) => ({
        ...prev,
        ai: "Add at least one technology for this role before generating with AI.",
      }));
      return;
    }

    if (!numberOfYears || numberOfYears < 1 || numberOfYears > 50) {
      setErrors((prev) => ({
        ...prev,
        ai: "Years of experience must be between 1 and 50.",
      }));
      return;
    }

    setGenerating(true);
    try {
      const payload: GenerateWorkExperienceDescriptionBody = {
        experienceLevel: levelToUse,
        jobTitle: roleToUse,
        techStack,
        numberOfYears,
      };

      const { data } = await apiClient.post<IApiResponse<string[]>>(
        "/api/ai/generateWorkExperienceDescription",
        payload
      );

      if (data.success && Array.isArray(data.data)) {
        const formatted = data.data
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => (line.startsWith("•") ? line : `• ${line}`))
          .join("\n");

        setForm((prev) => ({ ...prev, description: formatted }));
      } else {
        setErrors((prev) => ({
          ...prev,
          ai: data.message || "Could not generate experience description.",
        }));
      }
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? "AI experience generation failed.")
        : "AI experience generation failed. Please try again.";
      setErrors((prev) => ({ ...prev, ai: msg }));
    } finally {
      setGenerating(false);
    }
  };

  const validate = (): boolean => {
    const nextErrors: ExperienceFormErrors = {};
    if (!form.company.trim()) nextErrors.company = "Company name is required";
    if (!form.position.trim()) nextErrors.position = "Position is required";
    if (!form.startDate) nextErrors.startDate = "Start date is required";
    if (!form.endDate.trim()) nextErrors.endDate = "End date or Present is required";
    if (!form.description.trim())
      nextErrors.description = "Role description is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSaveEntry = () => {
    if (!validate()) return;
    onSave({
      ...form,
      company: form.company.trim(),
      position: form.position.trim(),
      endDate: form.endDate.trim(),
      description: form.description.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-accent-foreground" />
            </div>
            <h2 className="text-base font-semibold text-foreground">
              {editIndex !== null ? "Edit Work Experience" : "Add Work Experience"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errors.ai && (
          <div className="mb-4 flex items-start gap-2.5 bg-destructive/10 border border-destructive/30 rounded-xl p-3.5">
            <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-xs text-destructive">{errors.ai}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Company & Position */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Company <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  name="company"
                  value={form.company}
                  onChange={handleFieldChange}
                  placeholder="e.g. Acme Tech"
                  className={`w-full bg-muted border ${
                    errors.company ? "border-red-500/70" : "border-border"
                  } rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all`}
                />
              </div>
              {errors.company && (
                <p className="text-xs text-destructive mt-1">{errors.company}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Position / Role <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                name="position"
                value={form.position}
                onChange={handleFieldChange}
                placeholder="e.g. Full-Stack Developer"
                className={`w-full bg-muted border ${
                  errors.position ? "border-red-500/70" : "border-border"
                } rounded-xl px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all`}
              />
              {errors.position && (
                <p className="text-xs text-destructive mt-1">{errors.position}</p>
              )}
            </div>
          </div>

          {/* Start & End Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Start Date <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="month"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleFieldChange}
                  className={`w-full bg-muted border ${
                    errors.startDate ? "border-red-500/70" : "border-border"
                  } rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all`}
                />
              </div>
              {errors.startDate && (
                <p className="text-xs text-destructive mt-1">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                End Date <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                name="endDate"
                value={form.endDate}
                onChange={handleFieldChange}
                placeholder="e.g. 2026-10 or Present"
                className={`w-full bg-muted border ${
                  errors.endDate ? "border-red-500/70" : "border-border"
                } rounded-xl px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all`}
              />
              {errors.endDate && (
                <p className="text-xs text-destructive mt-1">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* AI Context Controls: Tech Stack + Years */}
          <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-accent-foreground">
                AI Generation Parameters
              </span>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="years-input"
                  className="text-xs text-muted-foreground"
                >
                  Years:
                </label>
                <input
                  id="years-input"
                  type="number"
                  min={1}
                  max={50}
                  value={numberOfYears}
                  onChange={(e) =>
                    setNumberOfYears(Math.max(1, Number(e.target.value) || 1))
                  }
                  className="w-16 bg-card border border-border rounded-lg px-2.5 py-1 text-xs text-foreground text-center focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={handleTechKeyDown}
                  placeholder="Add tech used in role (e.g. React, Node.js, MongoDB)"
                  className="w-full bg-card border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <button
                type="button"
                onClick={handleAddTech}
                className="px-3 py-2 rounded-xl text-xs font-medium bg-card hover:bg-muted/80 text-foreground border border-border transition-all"
              >
                Add Tech
              </button>
            </div>

            {techStack.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {techStack.map((tech, idx) => (
                  <span
                    key={`${tech}-${idx}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-accent-foreground border border-primary/20"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(idx)}
                      aria-label={`Remove ${tech}`}
                      className="text-accent-foreground/70 hover:text-foreground"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Description + AI Button */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-foreground">
                Description <span className="text-destructive">*</span>
              </label>
              <button
                type="button"
                onClick={handleGenerateExperience}
                disabled={generating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {generating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                {generating ? "Generating…" : "Generate with AI"}
              </button>
            </div>

            <textarea
              name="description"
              value={form.description}
              onChange={handleFieldChange}
              rows={6}
              disabled={generating}
              placeholder="Key responsibilities, delivered features, and quantified outcomes..."
              className={`w-full bg-muted border ${
                errors.description ? "border-red-500/70" : "border-border"
              } rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground resize-none leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 transition-all`}
            />
            {errors.description && (
              <p className="text-xs text-destructive mt-1">{errors.description}</p>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={generating}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-muted hover:bg-muted/80 text-muted-foreground border border-border transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveEntry}
            disabled={generating}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
          >
            {editIndex !== null ? "Update Experience" : "Add Experience"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ExperiencePage() {
  const params = useParams();
  const resumeId = params.resumeId as string;
  const router = useRouter();

  const [experiences, setExperiences] = useState<ExperienceEntry[]>([]);
  const [defaultJobTitle, setDefaultJobTitle] = useState<string>("");
  const [defaultExperienceLevel, setDefaultExperienceLevel] =
    useState<string>("");

  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formInitial, setFormInitial] = useState<ExperienceEntry>(
    emptyExperience()
  );

  useEffect(() => {
    if (!resumeId) return;

    const fetchResume = async () => {
      try {
        const { data } = await apiClient.get<
          IApiResponse<ResumeExperiencePayload>
        >(`/api/resume/${resumeId}`);
        if (data.success && data.data) {
          setDefaultJobTitle(data.data.jobTitle ?? "");
          setDefaultExperienceLevel(data.data.experienceLevel ?? "");
          setExperiences(
            Array.isArray(data.data.workExperience)
              ? data.data.workExperience
              : []
          );
        }
      } catch {
        setError("Could not load work experience data. Please refresh.");
      } finally {
        setPageLoading(false);
      }
    };

    fetchResume();
  }, [resumeId]);

  const openAddModal = () => {
    setFormInitial(emptyExperience());
    setEditIndex(null);
    setModalOpen(true);
  };

  const openEditModal = (index: number) => {
    setFormInitial({ ...experiences[index] });
    setEditIndex(index);
    setModalOpen(true);
  };

  const handleSaveModal = (entry: ExperienceEntry) => {
    if (editIndex !== null) {
      setExperiences((prev) =>
        prev.map((item, idx) => (idx === editIndex ? entry : item))
      );
    } else {
      setExperiences((prev) => [...prev, entry]);
    }
    setModalOpen(false);
    setEditIndex(null);
  };

  const handleDeleteExperience = (index: number) => {
    setExperiences((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSave = async (andContinue = false) => {
    setError("");
    setSuccessMsg("");
    setSaving(true);

    try {
      const { data } = await apiClient.patch<IApiResponse>(
        `/api/resume/${resumeId}`,
        { workExperience: experiences }
      );

      if (data.success) {
        if (andContinue) {
          router.push(`/resume/${resumeId}/achievements`);
        } else {
          setSuccessMsg("Work experience saved successfully!");
          setTimeout(() => setSuccessMsg(""), 3000);
        }
      } else {
        setError(data.message || "Failed to save work experience.");
      }
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? "Failed to save work experience.")
        : "Failed to save work experience. Please try again.";
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
        {modalOpen && (
          <ExperienceFormModal
            initial={formInitial}
            editIndex={editIndex}
            defaultJobTitle={defaultJobTitle}
            defaultExperienceLevel={defaultExperienceLevel}
            onSave={handleSaveModal}
            onClose={() => {
              setModalOpen(false);
              setEditIndex(null);
            }}
          />
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Work Experience</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Step 5 of 8 · Resume Builder
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
            Add internships, full-time roles, or freelance work with measurable
            outcomes. Generate ATS-aligned bullet points using AI.
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

        {/* Experience Cards or Empty State */}
        {experiences.length > 0 ? (
          <div className="space-y-4 mb-5">
            {experiences.map((exp, index) => (
              <div
                key={exp._id ?? `${exp.company}-${index}`}
                className="bg-card border border-border hover:border-primary/30 rounded-2xl p-5 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-base font-semibold text-foreground">
                        {exp.position}
                      </h3>
                      <span className="text-xs font-medium text-accent-foreground">
                        @ {exp.company}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground mt-1">
                      {exp.startDate} → {exp.endDate}
                    </p>

                    <p className="text-xs text-foreground mt-3 whitespace-pre-line leading-relaxed">
                      {exp.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditModal(index)}
                      aria-label={`Edit ${exp.position}`}
                      className="w-8 h-8 rounded-xl flex items-center justify-center bg-muted hover:bg-primary/10 text-muted-foreground hover:text-accent-foreground border border-border transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteExperience(index)}
                      aria-label={`Delete ${exp.position}`}
                      className="w-8 h-8 rounded-xl flex items-center justify-center bg-muted hover:bg-destructive/10 text-muted-foreground hover:text-destructive border border-border transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border-2 border-dashed border-border rounded-2xl p-10 flex flex-col items-center justify-center text-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Briefcase className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              No work experience added yet
            </h3>
            <p className="text-xs text-muted-foreground mb-5 max-w-xs">
              Add internships or jobs, specify tech stack and years, and let AI
              generate action-packed bullet points.
            </p>
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Experience
            </button>
          </div>
        )}

        {experiences.length > 0 && (
          <button
            type="button"
            onClick={openAddModal}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium text-accent-foreground border border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all mb-8"
          >
            <Plus className="w-4 h-4" />
            Add Another Experience
          </button>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push(`/resume/${resumeId}/projects`)}
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
              disabled={saving}
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
              disabled={saving}
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