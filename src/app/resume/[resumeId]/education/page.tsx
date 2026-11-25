"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  GraduationCap,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Pencil,
  X,
  Calendar,
  BookOpen,
  Building2,
} from "lucide-react";
import apiClient from "@/lib/apiClient";

// ── Types ─────────────────────────────────────────────────────────────────────
interface EducationEntry {
  _id?: string;        // exists after save (mongoose sub-doc id)
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface FormErrors {
  institution?: string;
  degree?: string;
  startDate?: string;
  endDate?: string;
  general?: string;
}

// ── Empty entry factory ───────────────────────────────────────────────────────
const emptyEntry = (): EducationEntry => ({
  institution: "",
  degree: "",
  startDate: "",
  endDate: "",
  description: "",
});

// ─────────────────────────────────────────────────────────────────────────────
// EDUCATION FORM MODAL
// ─────────────────────────────────────────────────────────────────────────────
interface EducationFormProps {
  initial: EducationEntry;
  onSave: (entry: EducationEntry) => void;
  onClose: () => void;
  editIndex: number | null;
}

function EducationForm({
  initial,
  onSave,
  onClose,
  editIndex,
}: EducationFormProps) {
  const [form, setForm] = useState<EducationEntry>(initial);
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.institution.trim()) e.institution = "Institution name is required";
    if (!form.degree.trim()) e.degree = "Degree / course name is required";
    if (!form.startDate) e.startDate = "Start date is required";
    if (!form.endDate) e.endDate = "End date / expected year is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave(form);
  };

  const inputBase = (field: keyof FormErrors) =>
    `w-full bg-muted border ${
      errors[field] ? "border-red-500/70" : "border-border"
    } rounded-xl py-2.5 text-sm text-foreground placeholder-muted-foreground
     focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
     transition-all duration-200`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-accent-foreground" />
            </div>
            <h2 className="text-base font-semibold text-foreground">
              {editIndex !== null ? "Edit Education" : "Add Education"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">

          {/* Institution */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Institution Name <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                name="institution"
                value={form.institution}
                onChange={handleChange}
                placeholder="e.g. Smt. Kashibai Navale College of Engineering"
                className={`${inputBase("institution")} pl-10 pr-4`}
              />
            </div>
            {errors.institution && (
              <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.institution}
              </p>
            )}
          </div>

          {/* Degree */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Degree / Course <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                name="degree"
                value={form.degree}
                onChange={handleChange}
                placeholder="e.g. B.E. in Electronics & Telecommunication"
                className={`${inputBase("degree")} pl-10 pr-4`}
              />
            </div>
            {errors.degree && (
              <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.degree}
              </p>
            )}
          </div>

          {/* Start + End Date */}
          <div className="grid grid-cols-2 gap-4">
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
                  onChange={handleChange}
                  className={`${inputBase("startDate")} pl-10 pr-4`}
                />
              </div>
              {errors.startDate && (
                <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {errors.startDate}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                End Date <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="month"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  placeholder="or Expected"
                  className={`${inputBase("endDate")} pl-10 pr-4`}
                />
              </div>
              {errors.endDate && (
                <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {errors.endDate}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Description
              <span className="text-xs text-muted-foreground font-normal ml-1.5">
                (optional — CGPA, relevant coursework, achievements)
              </span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="e.g. CGPA: 8.9 / 10 · Relevant coursework: DSA, OS, CN, DBMS"
              className="w-full bg-muted border border-border rounded-xl
                         py-2.5 px-4 text-sm text-foreground placeholder-muted-foreground resize-none
                         focus:outline-none focus:ring-2 focus:ring-ring
                         focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium
                       bg-muted hover:bg-muted/80 text-muted-foreground
                       border border-border transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold
                       bg-primary hover:bg-primary/90 text-primary-foreground
                       transition-all duration-200"
          >
            {editIndex !== null ? "Update" : "Add Education"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EDUCATION CARD (display only)
// ─────────────────────────────────────────────────────────────────────────────
interface EducationCardProps {
  entry: EducationEntry;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

function EducationCard({ entry, index, onEdit, onDelete }: EducationCardProps) {
  // Format "2021-08" → "Aug 2021"
  const formatDate = (d: string) => {
    if (!d) return "";
    const [year, month] = d.split("-");
    const monthName = new Date(
      Number(year),
      Number(month) - 1
    ).toLocaleString("en-US", { month: "short" });
    return `${monthName} ${year}`;
  };

  return (
    <div className="bg-card border border-border hover:border-primary/30 rounded-2xl p-5 transition-all duration-200">
      <div className="flex items-start justify-between gap-3">

        {/* Left */}
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
            <GraduationCap className="w-4 h-4 text-accent-foreground" />
          </div>

          <div className="min-w-0">
            <h3 className="font-semibold text-foreground text-sm leading-tight truncate">
              {entry.degree}
            </h3>
            <p className="text-xs text-accent-foreground mt-0.5 truncate">
              {entry.institution}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDate(entry.startDate)}
              {entry.endDate && ` → ${formatDate(entry.endDate)}`}
            </p>
            {entry.description && (
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-2">
                {entry.description}
              </p>
            )}
          </div>
        </div>

        {/* Right — actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] text-muted-foreground font-medium mr-1">
            #{index + 1}
          </span>
          <button
            onClick={onEdit}
            className="w-8 h-8 rounded-xl flex items-center justify-center
                       bg-muted hover:bg-primary/10 text-muted-foreground
                       hover:text-accent-foreground border border-border
                       hover:border-indigo-500/30 transition-all duration-200"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="w-8 h-8 rounded-xl flex items-center justify-center
                       bg-muted hover:bg-red-500/10 text-muted-foreground
                       hover:text-destructive border border-border
                       hover:border-red-500/30 transition-all duration-200"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function EducationPage() {
  const params   = useParams();
  const resumeId = params.resumeId as string;
  const router   = useRouter();

  const [entries, setEntries]         = useState<EducationEntry[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving]           = useState(false);
  const [successMsg, setSuccessMsg]   = useState("");
  const [globalError, setGlobalError] = useState("");

  // Modal state
  const [modalOpen, setModalOpen]   = useState(false);
  const [editIndex, setEditIndex]   = useState<number | null>(null);
  const [formInitial, setFormInitial] = useState<EducationEntry>(emptyEntry());

  // ── Fetch ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchResume = async () => {
      try {
        const { data } = await apiClient.get(`/api/resume/${resumeId}`);
        if (data.success && data.data?.education) {
          setEntries(data.data.education);
        }
      } catch {
        setGlobalError("Could not load education data. Please refresh.");
      } finally {
        setPageLoading(false);
      }
    };

    if (resumeId) fetchResume();
  }, [resumeId]);

  // ── Open modal helpers ────────────────────────────────────────────────
  const openAddModal = () => {
    setFormInitial(emptyEntry());
    setEditIndex(null);
    setModalOpen(true);
  };

  const openEditModal = (index: number) => {
    setFormInitial({ ...entries[index] });
    setEditIndex(index);
    setModalOpen(true);
  };

  // ── Modal save handler ────────────────────────────────────────────────
  const handleModalSave = (entry: EducationEntry) => {
    if (editIndex !== null) {
      // Edit existing
      setEntries((prev) =>
        prev.map((e, i) => (i === editIndex ? entry : e))
      );
    } else {
      // Add new
      setEntries((prev) => [...prev, entry]);
    }
    setModalOpen(false);
    setEditIndex(null);
  };

  // ── Delete ────────────────────────────────────────────────────────────
  const handleDelete = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Save to DB ────────────────────────────────────────────────────────
  const handleSave = async (andContinue = false) => {
    setGlobalError("");
    setSuccessMsg("");
    setSaving(true);

    try {
      await apiClient.patch(`/api/resume/${resumeId}`, {
        education: entries,
      });

      if (andContinue) {
        router.push(`/resume/${resumeId}/skills`);
      } else {
        setSuccessMsg("Education saved successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch {
      setGlobalError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 text-foreground">

      {/* Modal */}
      {modalOpen && (
        <EducationForm
          initial={formInitial}
          onSave={handleModalSave}
          onClose={() => {
            setModalOpen(false);
            setEditIndex(null);
          }}
          editIndex={editIndex}
        />
      )}

      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Education</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Step 2 of 8 · Resume Builder
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
          Add your educational background — degrees, diplomas, or certifications.
          Most recent first. Include CGPA if above{" "}
          <span className="text-accent-foreground font-medium">7.5</span>.
        </p>
      </div>

      {/* ── Global Error ──────────────────────────────────────────────── */}
      {globalError && (
        <div className="mb-5 flex items-start gap-3 bg-destructive/10 border border-destructive/30 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{globalError}</p>
        </div>
      )}

      {/* ── Success ───────────────────────────────────────────────────── */}
      {successMsg && (
        <div className="mb-5 flex items-start gap-3 bg-primary/10 border border-primary/30 rounded-xl p-4">
          <CheckCircle2 className="w-5 h-5 text-accent-foreground shrink-0 mt-0.5" />
          <p className="text-sm text-accent-foreground">{successMsg}</p>
        </div>
      )}

      {/* ── Entry List ────────────────────────────────────────────────── */}
      {entries.length > 0 ? (
        <div className="space-y-3 mb-5">
          {entries.map((entry, i) => (
            <EducationCard
              key={i}
              entry={entry}
              index={i}
              onEdit={() => openEditModal(i)}
              onDelete={() => handleDelete(i)}
            />
          ))}
        </div>
      ) : (
        /* ── Empty State ─────────────────────────────────────────────── */
        <div className="border-2 border-dashed border-border rounded-2xl p-10 flex flex-col items-center justify-center text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <GraduationCap className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-1">
            No education added yet
          </h3>
          <p className="text-xs text-muted-foreground mb-5 max-w-xs">
            Add your college, university, or any certification course.
          </p>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                       bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Add Education
          </button>
        </div>
      )}

      {/* ── Add More Button (shows when at least 1 entry exists) ─────── */}
      {entries.length > 0 && (
        <button
          onClick={openAddModal}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl
                     text-sm font-medium text-accent-foreground border border-dashed
                     border-indigo-500/30 hover:border-indigo-500/60
                     hover:bg-primary/5 transition-all duration-200 mb-8"
        >
          <Plus className="w-4 h-4" />
          Add Another Education
        </button>
      )}

      {/* ── Navigation ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push(`/resume/${resumeId}/personal-info`)}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
                     bg-muted hover:bg-muted/80 text-muted-foreground border border-border
                     disabled:opacity-50 transition-all duration-200"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-3">
          {/* Save only */}
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl text-sm font-medium
                       bg-muted hover:bg-muted/80 text-muted-foreground border border-border
                       disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
          >
            {saving && !successMsg ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : null}
            Save
          </button>

          {/* Save & Continue */}
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold
                       bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/40
                       shadow-lg shadow-primary/20
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
  );
}