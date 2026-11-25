"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  Award,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Trophy,
} from "lucide-react";
import apiClient from "@/lib/apiClient";
import { IApiResponse } from "@/types/api.types";

interface ResumeAchievementsPayload {
  _id: string;
  certifications?: string[];
}

export default function AchievementsPage() {
  const params = useParams();
  const resumeId = params.resumeId as string;
  const router = useRouter();

  const [items, setItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState<string>("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");

  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  // ── 1. Fetch existing certifications / achievements on mount ─────────────
  useEffect(() => {
    if (!resumeId) return;

    const fetchResume = async () => {
      try {
        const { data } = await apiClient.get<
          IApiResponse<ResumeAchievementsPayload>
        >(`/api/resume/${resumeId}`);

        if (data.success && data.data) {
          setItems(
            Array.isArray(data.data.certifications)
              ? data.data.certifications
              : []
          );
        }
      } catch {
        setError("Could not load achievements data. Please refresh the page.");
      } finally {
        setPageLoading(false);
      }
    };

    fetchResume();
  }, [resumeId]);

  // ── 2. Add new certification or achievement ──────────────────────────────
  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleaned = newItem.trim();

    if (!cleaned) {
      setError("Please enter a certification or achievement before adding.");
      return;
    }

    const isDuplicate = items.some(
      (entry) => entry.toLowerCase() === cleaned.toLowerCase()
    );
    if (isDuplicate) {
      setError("This item is already in your achievements list.");
      return;
    }

    setError("");
    setItems((prev) => [...prev, cleaned]);
    setNewItem("");
  };

  // ── 3. Inline edit & delete handlers ─────────────────────────────────────
  const startEditing = (index: number) => {
    setError("");
    setEditingIndex(index);
    setEditingValue(items[index]);
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditingValue("");
  };

  const saveEditedItem = (index: number) => {
    const cleaned = editingValue.trim();
    if (!cleaned) {
      setError("Achievement text cannot be empty.");
      return;
    }

    setError("");
    setItems((prev) =>
      prev.map((entry, idx) => (idx === index ? cleaned : entry))
    );
    setEditingIndex(null);
    setEditingValue("");
  };

  const handleDeleteItem = (index: number) => {
    setError("");
    setItems((prev) => prev.filter((_, idx) => idx !== index));
    if (editingIndex === index) {
      cancelEditing();
    }
  };

  // ── 4. Save to backend (PATCH /api/resume/:resumeId) ─────────────────────
  const handleSave = async (andContinue = false) => {
    setError("");
    setSuccessMsg("");
    setSaving(true);

    try {
      const { data } = await apiClient.patch<IApiResponse>(
        `/api/resume/${resumeId}`,
        { certifications: items }
      );

      if (data.success) {
        if (andContinue) {
          router.push(`/resume/${resumeId}/summary`);
        } else {
          setSuccessMsg("Achievements saved successfully!");
          setTimeout(() => setSuccessMsg(""), 3000);
        }
      } else {
        setError(data.message || "Failed to save achievements.");
      }
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? "Failed to save achievements.")
        : "Failed to save achievements. Please try again.";
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
              <Award className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Certifications & Achievements
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Step 6 of 8 · Resume Builder
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
            Highlight verified certifications, hackathon wins, coding contest
            ranks, or academic honors that strengthen your credibility.
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
          {/* Add Form */}
          <form onSubmit={handleAddItem} className="space-y-2">
            <label
              htmlFor="achievement-input"
              className="block text-sm font-medium text-foreground"
            >
              Add Certification or Achievement
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                id="achievement-input"
                type="text"
                value={newItem}
                onChange={(e) => {
                  setNewItem(e.target.value);
                  if (error) setError("");
                }}
                placeholder="e.g. AWS Certified Cloud Practitioner (2026) or 1st Prize at Smart India Hackathon"
                className="flex-1 bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/40 transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>
          </form>

          {/* List or Empty State */}
          {items.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Saved Items ({items.length})
                </span>
              </div>

              {items.map((entry, index) => (
                <div
                  key={`${index}-${entry.slice(0, 12)}`}
                  className="bg-muted/60 border border-border rounded-xl p-4 flex items-center justify-between gap-3"
                >
                  {editingIndex === index ? (
                    <div className="flex-1 flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            saveEditedItem(index);
                          }
                          if (e.key === "Escape") {
                            cancelEditing();
                          }
                        }}
                        className="flex-1 bg-card border border-primary/60 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => saveEditedItem(index)}
                          aria-label="Save edit"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600/20 text-accent-foreground border border-green-500/30 hover:bg-green-600/30 transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          aria-label="Cancel edit"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-700 text-foreground hover:bg-gray-600 transition-all"
                        >
                          <X className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <Trophy className="w-4 h-4 text-amber-400" />
                        </div>
                        <p className="text-sm text-foreground leading-relaxed break-words">
                          {entry}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEditing(index)}
                          aria-label={`Edit item ${index + 1}`}
                          className="w-8 h-8 rounded-xl flex items-center justify-center bg-card hover:bg-primary/10 text-muted-foreground hover:text-accent-foreground border border-border transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(index)}
                          aria-label={`Delete item ${index + 1}`}
                          className="w-8 h-8 rounded-xl flex items-center justify-center bg-card hover:bg-destructive/10 text-muted-foreground hover:text-destructive border border-border transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-border rounded-2xl p-10 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
                <Award className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">
                No certifications or achievements yet
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Add relevant cloud/developer certificates, hackathon placements,
                or milestones above—or continue if none apply yet.
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            type="button"
            onClick={() => router.push(`/resume/${resumeId}/experience`)}
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