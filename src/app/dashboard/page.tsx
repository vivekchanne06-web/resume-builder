"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  FileText,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Calendar,
  Trash2,
  Eye,
  X,
  Columns2,
  AlignLeft,
  Sparkles,
} from "lucide-react";
import apiClient from "@/lib/apiClient";
import { IApiResponse } from "@/types/api.types";
import ThemeToggle from "@/components/ThemeToggle";

type TemplateId = "classic" | "modern" | "editorial";

const TEMPLATE_OPTIONS: {
  id: TemplateId;
  label: string;
  desc: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "classic",
    label: "ATS Classic",
    desc: "Single-column, high ATS parseability. Ideal for Fortune-500 & ATS screening.",
    icon: <AlignLeft className="w-5 h-5" />,
  },
  {
    id: "modern",
    label: "Mint Signal Modern",
    desc: "Contemporary mint accent, pill skill tags & clickable profile links.",
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    id: "editorial",
    label: "Executive Two-Column",
    desc: "Lora serif headings, IBM Plex Mono dates, sidebar layout for senior roles.",
    icon: <Columns2 className="w-5 h-5" />,
  },
];

interface ResumeDashboardItem {
  _id: string;
  title?: string;
  jobTitle?: string;
  summary?: string;
  updatedAt?: string;
}

export default function DashboardPage() {
  const router = useRouter();

  const [resumes, setResumes] = useState<ResumeDashboardItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [creating, setCreating] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  // Template selection modal
  const [showTemplateModal, setShowTemplateModal] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateId>("classic");

  const loadResumes = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const { data } = await apiClient.get<IApiResponse<ResumeDashboardItem[]>>(
        "/api/resume"
      );
      if (data.success && Array.isArray(data.data)) {
        setResumes(data.data);
      } else {
        setError(
          data.message || "Failed to load resumes. Please refresh the page."
        );
      }
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.message ??
          "Failed to load resumes. Please refresh the page.")
        : "Failed to load resumes. Please refresh the page.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const runInitialFetch = async () => {
      try {
        const { data } = await apiClient.get<
          IApiResponse<ResumeDashboardItem[]>
        >("/api/resume");
        if (!active) return;

        if (data.success && Array.isArray(data.data)) {
          setResumes(data.data);
          setError("");
        } else {
          setError(
            data.message || "Failed to load resumes. Please refresh the page."
          );
        }
      } catch (err: unknown) {
        if (!active) return;
        const msg = axios.isAxiosError(err)
          ? (err.response?.data?.message ??
            "Failed to load resumes. Please refresh the page.")
          : "Failed to load resumes. Please refresh the page.";
        setError(msg);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void runInitialFetch();

    return () => {
      active = false;
    };
  }, []);

  const handleCreateResume = async () => {
    setError("");
    setSuccessMsg("");
    setCreating(true);
    try {
      const { data } = await apiClient.post<IApiResponse<ResumeDashboardItem>>(
        "/api/resume/create"
      );
      if (data.success && data.data?._id) {
        // Persist selected template so preview page picks it up
        localStorage.setItem(
          `resumeTemplate_${data.data._id}`,
          selectedTemplate
        );
        setShowTemplateModal(false);
        router.push(`/resume/${data.data._id}/personal-info`);
      } else {
        setError(data.message || "Could not create resume.");
      }
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? "Failed to create resume.")
        : "Failed to create resume. Please try again.";
      setError(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteResume = async (resumeId: string) => {
    setError("");
    setSuccessMsg("");
    setDeletingId(resumeId);

    try {
      const { data } = await apiClient.delete<IApiResponse>(
        `/api/resume/${resumeId}`
      );
      if (data.success) {
        setResumes((prev) => prev.filter((item) => item._id !== resumeId));
        setConfirmDeleteId(null);
        setSuccessMsg("Resume deleted.");
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setError(data.message || "Failed to delete resume.");
      }
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? "Failed to delete resume.")
        : "Failed to delete resume. Please try again.";
      setError(msg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Top Nav ───────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border print:hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground text-sm tracking-tight">
              ResumeAI
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Resumes</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Create, edit, score with ATS, and export resumes to PDF.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowTemplateModal(true)}
            disabled={creating}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                       bg-primary hover:bg-primary/90 text-primary-foreground
                       border border-primary/40 shadow-lg shadow-primary/20
                       disabled:opacity-50 transition-all shrink-0"
          >
            {creating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {creating ? "Creating…" : "Create New Resume"}
          </button>
        </div>

        {/* Error & Success Banners */}
        {error && (
          <div className="mb-6 flex items-center justify-between gap-4 bg-destructive/10 border border-destructive/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => void loadResumes()}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-destructive/20 hover:bg-destructive/30 text-destructive transition-colors shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 flex items-center gap-3 bg-primary/10 border border-primary/30 rounded-xl p-4">
            <CheckCircle2 className="w-5 h-5 text-accent-foreground shrink-0" />
            <p className="text-sm text-accent-foreground">{successMsg}</p>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : resumes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {resumes.map((item) => {
              const isConfirming = confirmDeleteId === item._id;
              const isDeleting = deletingId === item._id;

              return (
                <div
                  key={item._id}
                  className="bg-card border border-border hover:border-primary/40 rounded-2xl p-5 flex flex-col justify-between transition-all shadow-sm"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-accent-foreground" />
                      </div>

                      {!isConfirming ? (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(item._id)}
                          disabled={isDeleting}
                          aria-label={`Delete ${item.title || "Resume"}`}
                          className="w-8 h-8 rounded-xl flex items-center justify-center bg-muted hover:bg-destructive/15 text-muted-foreground hover:text-destructive border border-border hover:border-destructive/30 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDeleteResume(item._id)}
                            disabled={isDeleting}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-destructive hover:bg-destructive/90 text-destructive-foreground disabled:opacity-50 transition-all"
                          >
                            {isDeleting ? "Deleting…" : "Confirm"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            disabled={isDeleting}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-muted hover:bg-muted/80 text-muted-foreground border border-border transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>

                    <h2 className="text-base font-semibold text-foreground truncate">
                      {item.title || "Untitled Resume"}
                    </h2>
                    {item.jobTitle && (
                      <p className="text-xs font-medium text-accent-foreground mt-0.5 truncate">
                        {item.jobTitle}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2.5 line-clamp-3 leading-relaxed">
                      {item.summary || "No summary added yet."}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-border flex items-center justify-between gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.updatedAt
                        ? new Date(item.updatedAt).toLocaleDateString()
                        : "Draft"}
                    </span>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/resume/${item._id}/preview`)
                        }
                        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground font-medium transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/resume/${item._id}/personal-info`)
                        }
                        className="inline-flex items-center gap-1 text-accent-foreground hover:text-primary font-semibold transition-colors"
                      >
                        Edit
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          !error && (
            <div className="border-2 border-dashed border-border rounded-2xl p-12 text-center">
              <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <h2 className="text-base font-semibold text-foreground">
                No resumes yet
              </h2>
              <p className="text-xs text-muted-foreground mt-1 mb-5">
                Create your first resume to start adding personal info, skills,
                projects, and AI summaries.
              </p>
              <button
                type="button"
                onClick={() => setShowTemplateModal(true)}
                disabled={creating}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
              >
                <Plus className="w-4 h-4" />
                Create Resume
              </button>
            </div>
          )
        )}
      </div>

      {/* ── Template Selection Modal ─────────────────────────────────── */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-5">
            {/* Modal header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Choose a Template
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Pick a style for your new resume. You can switch anytime in
                  the preview.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center bg-muted hover:bg-muted/80 text-muted-foreground transition-all shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Template cards */}
            <div className="space-y-2.5">
              {TEMPLATE_OPTIONS.map(({ id, label, desc, icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedTemplate(id)}
                  className={`w-full flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                    selectedTemplate === id
                      ? "bg-primary/10 border-primary/40 ring-1 ring-primary/30"
                      : "bg-muted/40 border-border hover:bg-muted/70"
                  }`}
                >
                  <span
                    className={`mt-0.5 shrink-0 ${
                      selectedTemplate === id
                        ? "text-accent-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {icon}
                  </span>
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        selectedTemplate === id
                          ? "text-foreground"
                          : "text-foreground/80"
                      }`}
                    >
                      {label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {desc}
                    </p>
                  </div>
                  {selectedTemplate === id && (
                    <CheckCircle2 className="w-4 h-4 text-primary ml-auto shrink-0 mt-0.5" />
                  )}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-muted hover:bg-muted/80 text-muted-foreground border border-border transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateResume}
                disabled={creating}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 transition-all"
              >
                {creating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {creating ? "Creating…" : "Create Resume"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
