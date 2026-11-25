"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  FolderGit2,
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
  GitBranch,
  Globe,
  Layers,
} from "lucide-react";
import apiClient from "@/lib/apiClient";
import { IProject } from "@/types/resume.types";
import { GenerateProjectDescriptionBody } from "@/types/ai.types";
import { IApiResponse } from "@/types/api.types";

interface ProjectEntry extends IProject {
  _id?: string;
}

interface ResumeProjectsPayload {
  _id: string;
  jobTitle?: string;
  experienceLevel?: string;
  projects?: ProjectEntry[];
}

interface ProjectFormErrors {
  title?: string;
  description?: string;
  techStack?: string;
  ai?: string;
}

const emptyProject = (): ProjectEntry => ({
  title: "",
  description: "",
  githubUrl: "",
  liveUrl: "",
  techStack: [],
});

interface ProjectModalProps {
  initial: ProjectEntry;
  editIndex: number | null;
  jobTitle: string;
  experienceLevel: string;
  onSave: (project: ProjectEntry) => void;
  onClose: () => void;
}

function ProjectFormModal({
  initial,
  editIndex,
  jobTitle,
  experienceLevel,
  onSave,
  onClose,
}: ProjectModalProps) {
  const [form, setForm] = useState<ProjectEntry>(initial);
  const [techInput, setTechInput] = useState<string>("");
  const [errors, setErrors] = useState<ProjectFormErrors>({});
  const [generating, setGenerating] = useState<boolean>(false);

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ProjectFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleAddTech = () => {
    const cleaned = techInput.trim();
    if (!cleaned) return;

    const alreadyAdded = form.techStack.some(
      (t) => t.toLowerCase() === cleaned.toLowerCase()
    );
    if (alreadyAdded) {
      setErrors((prev) => ({
        ...prev,
        techStack: `"${cleaned}" is already in tech stack`,
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, techStack: undefined, ai: undefined }));
    setForm((prev) => ({
      ...prev,
      techStack: [...prev.techStack, cleaned],
    }));
    setTechInput("");
  };

  const handleTechKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTech();
    }
  };

  const handleRemoveTech = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      techStack: prev.techStack.filter((_, i) => i !== idx),
    }));
  };

  const handleGenerateDescription = async () => {
    setErrors((prev) => ({ ...prev, ai: undefined, description: undefined }));

    if (!form.title.trim()) {
      setErrors((prev) => ({
        ...prev,
        ai: "Enter a Project Title before generating with AI.",
      }));
      return;
    }

    if (form.techStack.length === 0) {
      setErrors((prev) => ({
        ...prev,
        ai: "Add at least one technology to Tech Stack before generating with AI.",
      }));
      return;
    }

    if (!jobTitle.trim() || !experienceLevel.trim()) {
      setErrors((prev) => ({
        ...prev,
        ai: "Job Title or Experience Level is missing on your resume. Complete Personal Info first.",
      }));
      return;
    }

    setGenerating(true);
    try {
      const payload: GenerateProjectDescriptionBody = {
        experienceLevel: experienceLevel.trim(),
        projectTitle: form.title.trim(),
        techStack: form.techStack,
        jobTitle: jobTitle.trim(),
      };

      const { data } = await apiClient.post<IApiResponse<string[]>>(
        "/api/ai/generateProjectDescription",
        payload
      );

      if (data.success && Array.isArray(data.data)) {
        const formattedBullets = data.data
          .map((point) => point.trim())
          .filter(Boolean)
          .map((point) => (point.startsWith("•") ? point : `• ${point}`))
          .join("\n");

        setForm((prev) => ({ ...prev, description: formattedBullets }));
      } else {
        setErrors((prev) => ({
          ...prev,
          ai: data.message || "Could not generate project description.",
        }));
      }
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? "AI description generation failed.")
        : "AI description generation failed. Please try again.";
      setErrors((prev) => ({ ...prev, ai: msg }));
    } finally {
      setGenerating(false);
    }
  };

  const validate = (): boolean => {
    const nextErrors: ProjectFormErrors = {};
    if (!form.title.trim()) nextErrors.title = "Project title is required";
    if (!form.description.trim())
      nextErrors.description = "Project description is required";
    if (form.techStack.length === 0)
      nextErrors.techStack = "Add at least one technology";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSaveProject = () => {
    if (!validate()) return;
    onSave({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      githubUrl: form.githubUrl?.trim() || "",
      liveUrl: form.liveUrl?.trim() || "",
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
              <FolderGit2 className="w-4 h-4 text-accent-foreground" />
            </div>
            <h2 className="text-base font-semibold text-foreground">
              {editIndex !== null ? "Edit Project" : "Add Project"}
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
          {/* Project Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Project Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleFieldChange}
              placeholder="e.g. AI Battle Arena"
              className={`w-full bg-muted border ${
                errors.title ? "border-red-500/70" : "border-border"
              } rounded-xl px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all`}
            />
            {errors.title && (
              <p className="text-xs text-destructive mt-1">{errors.title}</p>
            )}
          </div>

          {/* Tech Stack Chips */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Tech Stack <span className="text-destructive">*</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => {
                    setTechInput(e.target.value);
                    if (errors.techStack)
                      setErrors((prev) => ({ ...prev, techStack: undefined }));
                  }}
                  onKeyDown={handleTechKeyDown}
                  placeholder="e.g. Next.js, TypeScript, MongoDB"
                  className={`w-full bg-muted border ${
                    errors.techStack ? "border-red-500/70" : "border-border"
                  } rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all`}
                />
              </div>
              <button
                type="button"
                onClick={handleAddTech}
                className="px-3.5 py-2.5 rounded-xl text-xs font-medium bg-muted hover:bg-gray-700 text-foreground border border-border transition-all"
              >
                Add
              </button>
            </div>
            {errors.techStack && (
              <p className="text-xs text-destructive mt-1">{errors.techStack}</p>
            )}

            {form.techStack.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {form.techStack.map((tech, idx) => (
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

          {/* GitHub & Live URLs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                GitHub URL
              </label>
              <div className="relative">
                <GitBranch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="url"
                  name="githubUrl"
                  value={form.githubUrl ?? ""}
                  onChange={handleFieldChange}
                  placeholder="https://github.com/..."
                  className="w-full bg-muted border border-border rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Live Demo URL
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="url"
                  name="liveUrl"
                  value={form.liveUrl ?? ""}
                  onChange={handleFieldChange}
                  placeholder="https://your-demo.app"
                  className="w-full bg-muted border border-border rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                />
              </div>
            </div>
          </div>

          {/* Description + AI Generate */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-foreground">
                Description <span className="text-destructive">*</span>
              </label>
              <button
                type="button"
                onClick={handleGenerateDescription}
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
              placeholder="Describe architecture, features built, and measurable impact..."
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
            onClick={handleSaveProject}
            disabled={generating}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
          >
            {editIndex !== null ? "Update Project" : "Add Project"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const params = useParams();
  const resumeId = params.resumeId as string;
  const router = useRouter();

  const [projects, setProjects] = useState<ProjectEntry[]>([]);
  const [jobTitle, setJobTitle] = useState<string>("");
  const [experienceLevel, setExperienceLevel] = useState<string>("");

  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formInitial, setFormInitial] = useState<ProjectEntry>(emptyProject());

  useEffect(() => {
    if (!resumeId) return;

    const fetchResume = async () => {
      try {
        const { data } = await apiClient.get<IApiResponse<ResumeProjectsPayload>>(
          `/api/resume/${resumeId}`
        );
        if (data.success && data.data) {
          setJobTitle(data.data.jobTitle ?? "");
          setExperienceLevel(data.data.experienceLevel ?? "");
          setProjects(
            Array.isArray(data.data.projects) ? data.data.projects : []
          );
        }
      } catch {
        setError("Could not load projects data. Please refresh the page.");
      } finally {
        setPageLoading(false);
      }
    };

    fetchResume();
  }, [resumeId]);

  const openAddModal = () => {
    setFormInitial(emptyProject());
    setEditIndex(null);
    setModalOpen(true);
  };

  const openEditModal = (index: number) => {
    setFormInitial({
      ...projects[index],
      techStack: [...(projects[index].techStack ?? [])],
    });
    setEditIndex(index);
    setModalOpen(true);
  };

  const handleSaveModal = (project: ProjectEntry) => {
    if (editIndex !== null) {
      setProjects((prev) =>
        prev.map((item, idx) => (idx === editIndex ? project : item))
      );
    } else {
      setProjects((prev) => [...prev, project]);
    }
    setModalOpen(false);
    setEditIndex(null);
  };

  const handleDeleteProject = (index: number) => {
    setProjects((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSave = async (andContinue = false) => {
    setError("");
    setSuccessMsg("");
    setSaving(true);

    try {
      const { data } = await apiClient.patch<IApiResponse>(
        `/api/resume/${resumeId}`,
        { projects }
      );

      if (data.success) {
        if (andContinue) {
          router.push(`/resume/${resumeId}/experience`);
        } else {
          setSuccessMsg("Projects saved successfully!");
          setTimeout(() => setSuccessMsg(""), 3000);
        }
      } else {
        setError(data.message || "Failed to save projects.");
      }
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? "Failed to save projects.")
        : "Failed to save projects. Please try again.";
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
          <ProjectFormModal
            initial={formInitial}
            editIndex={editIndex}
            jobTitle={jobTitle}
            experienceLevel={experienceLevel}
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
              <FolderGit2 className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Projects</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Step 4 of 8 · Resume Builder
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
            Highlight hands-on builds with clear tech stacks, repository/live
            links, and action-driven bullet points generated by AI.
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

        {/* Project Cards or Empty State */}
        {projects.length > 0 ? (
          <div className="space-y-4 mb-5">
            {projects.map((proj, index) => (
              <div
                key={proj._id ?? `${proj.title}-${index}`}
                className="bg-card border border-border hover:border-primary/30 rounded-2xl p-5 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-base font-semibold text-foreground">
                        {proj.title}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        #{index + 1}
                      </span>
                    </div>

                    {proj.techStack?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {proj.techStack.map((tech, tIdx) => (
                          <span
                            key={`${tech}-${tIdx}`}
                            className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-accent-foreground border border-primary/15"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-foreground mt-3 whitespace-pre-line leading-relaxed">
                      {proj.description}
                    </p>

                    {(proj.githubUrl || proj.liveUrl) && (
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-accent-foreground">
                        {proj.githubUrl && (
                          <a
                            href={proj.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 hover:underline"
                          >
                            <GitBranch className="w-3.5 h-3.5" />
                            GitHub Repo
                          </a>
                        )}
                        {proj.liveUrl && (
                          <a
                            href={proj.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 hover:underline"
                          >
                            <Globe className="w-3.5 h-3.5" />
                            Live Demo
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditModal(index)}
                      aria-label={`Edit ${proj.title}`}
                      className="w-8 h-8 rounded-xl flex items-center justify-center bg-muted hover:bg-primary/10 text-muted-foreground hover:text-accent-foreground border border-border transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProject(index)}
                      aria-label={`Delete ${proj.title}`}
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
              <FolderGit2 className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              No projects added yet
            </h3>
            <p className="text-xs text-muted-foreground mb-5 max-w-xs">
              Add your best software or full-stack projects and let AI craft
              ATS-ready bullet points.
            </p>
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Project
            </button>
          </div>
        )}

        {projects.length > 0 && (
          <button
            type="button"
            onClick={openAddModal}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium text-accent-foreground border border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all mb-8"
          >
            <Plus className="w-4 h-4" />
            Add Another Project
          </button>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push(`/resume/${resumeId}/skills`)}
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