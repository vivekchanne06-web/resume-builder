"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Layers,
  GitBranch,
  Link2,
  Globe,
  Code2,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileText,
} from "lucide-react";
import apiClient from "@/lib/apiClient";
import { IPersonalInfo } from "@/types/resume.types";
import { IApiResponse } from "@/types/api.types";

interface ResumePersonalInfoPayload {
  _id: string;
  title?: string;
  jobTitle?: string;
  experienceLevel?: string;
  personalInfo?: Partial<IPersonalInfo>;
}

interface PersonalInfoFormErrors {
  fullname?: string;
  email?: string;
  mobile?: string;
  address?: string;
  jobTitle?: string;
  experienceLevel?: string;
}

const EXPERIENCE_LEVELS = [
  "Fresher / Entry-Level",
  "Junior (1–2 yrs)",
  "Mid-Level (2–5 yrs)",
  "Senior (5+ yrs)",
];

const emptyPersonalInfo = (): IPersonalInfo => ({
  fullname: "",
  email: "",
  mobile: "",
  address: "",
  github: "",
  linkedin: "",
  portfolio: "",
  leetcode: "",
});

export default function PersonalInfoPage() {
  const params = useParams();
  const resumeId = params.resumeId as string;
  const router = useRouter();

  const [title, setTitle] = useState<string>("My Resume");
  const [jobTitle, setJobTitle] = useState<string>("");
  const [experienceLevel, setExperienceLevel] = useState<string>(
    "Fresher / Entry-Level"
  );
  const [form, setForm] = useState<IPersonalInfo>(emptyPersonalInfo());

  const [errors, setErrors] = useState<PersonalInfoFormErrors>({});
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  useEffect(() => {
    if (!resumeId) return;
    let active = true;

    const loadResume = async () => {
      try {
        const { data } = await apiClient.get<
          IApiResponse<ResumePersonalInfoPayload>
        >(`/api/resume/${resumeId}`);

        if (!active) return;

        if (data.success && data.data) {
          setTitle(data.data.title ?? "My Resume");
          setJobTitle(data.data.jobTitle ?? "");
          setExperienceLevel(
            data.data.experienceLevel ?? "Fresher / Entry-Level"
          );
          const info = data.data.personalInfo ?? {};
          setForm({
            fullname: info.fullname ?? "",
            email: info.email ?? "",
            mobile: info.mobile ?? "",
            address: info.address ?? "",
            github: info.github ?? "",
            linkedin: info.linkedin ?? "",
            portfolio: info.portfolio ?? "",
            leetcode: info.leetcode ?? "",
          });
          setErrorMsg("");
        } else {
          setErrorMsg(data.message || "Could not load personal info.");
        }
      } catch {
        if (!active) return;
        setErrorMsg("Could not load resume details. Please refresh.");
      } finally {
        if (active) {
          setPageLoading(false);
        }
      }
    };

    void loadResume();

    return () => {
      active = false;
    };
  }, [resumeId]);

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "title") {
      setTitle(value);
      return;
    }

    if (name === "jobTitle") {
      setJobTitle(value);
      if (errors.jobTitle) setErrors((prev) => ({ ...prev, jobTitle: undefined }));
      return;
    }

    if (name === "experienceLevel") {
      setExperienceLevel(value);
      if (errors.experienceLevel)
        setErrors((prev) => ({ ...prev, experienceLevel: undefined }));
      return;
    }

    if (name === "mobile") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
      setForm((prev) => ({ ...prev, mobile: digitsOnly }));
      if (errors.mobile) setErrors((prev) => ({ ...prev, mobile: undefined }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof PersonalInfoFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const nextErrors: PersonalInfoFormErrors = {};

    if (!form.fullname.trim()) nextErrors.fullname = "Full name is required";
    if (!form.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email address";
    }
    if (!form.mobile.trim()) {
      nextErrors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(form.mobile.trim())) {
      nextErrors.mobile = "Mobile number must be 10 digits";
    }
    if (!form.address.trim()) nextErrors.address = "Location / address is required";
    if (!jobTitle.trim())
      nextErrors.jobTitle = "Target job title is required for AI generation";
    if (!experienceLevel.trim())
      nextErrors.experienceLevel = "Experience level is required";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async (andContinue = false) => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!validate()) return;

    setSaving(true);
    try {
      const { data } = await apiClient.patch<IApiResponse>(
        `/api/resume/${resumeId}`,
        {
          title: title.trim() || "My Resume",
          jobTitle: jobTitle.trim(),
          experienceLevel: experienceLevel.trim(),
          personalInfo: {
            fullname: form.fullname.trim(),
            email: form.email.trim(),
            mobile: form.mobile.trim(),
            address: form.address.trim(),
            github: form.github?.trim() || "",
            linkedin: form.linkedin?.trim() || "",
            portfolio: form.portfolio?.trim() || "",
            leetcode: form.leetcode?.trim() || "",
          },
        }
      );

      if (data.success) {
        if (andContinue) {
          router.push(`/resume/${resumeId}/education`);
        } else {
          setSuccessMsg("Personal info saved successfully!");
          setTimeout(() => setSuccessMsg(""), 3000);
        }
      } else {
        setErrorMsg(data.message || "Failed to save personal info.");
      }
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? "Failed to save personal info.")
        : "Failed to save personal info. Please try again.";
      setErrorMsg(msg);
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
              <User className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Personal Info</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Step 1 of 8 · Resume Builder
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
            Set your resume title, target role, experience level, contact
            details, and developer profile links. Later AI steps use your{" "}
            <span className="text-accent-foreground font-medium">Job Title</span> and{" "}
            <span className="text-accent-foreground font-medium">Experience Level</span>.
          </p>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-5 flex items-start gap-3 bg-destructive/10 border border-destructive/30 rounded-xl p-4">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{errorMsg}</p>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 flex items-start gap-3 bg-primary/10 border border-primary/30 rounded-xl p-4">
            <CheckCircle2 className="w-5 h-5 text-accent-foreground shrink-0 mt-0.5" />
            <p className="text-sm text-accent-foreground">{successMsg}</p>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
          {/* Resume Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Resume Title
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                id="title"
                name="title"
                type="text"
                value={title}
                onChange={handleFieldChange}
                placeholder="e.g. Full-Stack Developer Resume"
                className="w-full bg-muted border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>
          </div>

          {/* Target Job Title & Experience Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="jobTitle"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Target Job Title <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  id="jobTitle"
                  name="jobTitle"
                  type="text"
                  value={jobTitle}
                  onChange={handleFieldChange}
                  placeholder="e.g. Full-Stack Developer"
                  className={`w-full bg-muted border ${
                    errors.jobTitle ? "border-red-500/70" : "border-border"
                  } rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all`}
                />
              </div>
              {errors.jobTitle && (
                <p className="text-xs text-destructive mt-1">{errors.jobTitle}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="experienceLevel"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Experience Level <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <select
                  id="experienceLevel"
                  name="experienceLevel"
                  value={experienceLevel}
                  onChange={handleFieldChange}
                  className={`w-full bg-muted border ${
                    errors.experienceLevel
                      ? "border-red-500/70"
                      : "border-border"
                  } rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all`}
                >
                  {EXPERIENCE_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>
              {errors.experienceLevel && (
                <p className="text-xs text-destructive mt-1">
                  {errors.experienceLevel}
                </p>
              )}
            </div>
          </div>

          {/* Full Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="fullname"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Full Name <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  id="fullname"
                  name="fullname"
                  type="text"
                  value={form.fullname}
                  onChange={handleFieldChange}
                  placeholder="Your full name"
                  className={`w-full bg-muted border ${
                    errors.fullname ? "border-red-500/70" : "border-border"
                  } rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all`}
                />
              </div>
              {errors.fullname && (
                <p className="text-xs text-destructive mt-1">{errors.fullname}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Email <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleFieldChange}
                  placeholder="you@example.com"
                  className={`w-full bg-muted border ${
                    errors.email ? "border-red-500/70" : "border-border"
                  } rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Mobile & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="mobile"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Mobile (10 digits) <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  inputMode="numeric"
                  value={form.mobile}
                  onChange={handleFieldChange}
                  placeholder="9876543210"
                  className={`w-full bg-muted border ${
                    errors.mobile ? "border-red-500/70" : "border-border"
                  } rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all`}
                />
              </div>
              {errors.mobile && (
                <p className="text-xs text-destructive mt-1">{errors.mobile}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                City / Location <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={form.address}
                  onChange={handleFieldChange}
                  placeholder="Pune, Maharashtra"
                  className={`w-full bg-muted border ${
                    errors.address ? "border-red-500/70" : "border-border"
                  } rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all`}
                />
              </div>
              {errors.address && (
                <p className="text-xs text-destructive mt-1">{errors.address}</p>
              )}
            </div>
          </div>

          {/* Social & Coding Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
            <div>
              <label
                htmlFor="github"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                GitHub URL
              </label>
              <div className="relative">
                <GitBranch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  id="github"
                  name="github"
                  type="url"
                  value={form.github ?? ""}
                  onChange={handleFieldChange}
                  placeholder="https://github.com/username"
                  className="w-full bg-muted border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="linkedin"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                LinkedIn URL
              </label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  id="linkedin"
                  name="linkedin"
                  type="url"
                  value={form.linkedin ?? ""}
                  onChange={handleFieldChange}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full bg-muted border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="portfolio"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Portfolio URL
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  id="portfolio"
                  name="portfolio"
                  type="url"
                  value={form.portfolio ?? ""}
                  onChange={handleFieldChange}
                  placeholder="https://yourportfolio.dev"
                  className="w-full bg-muted border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="leetcode"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                LeetCode / Coding Profile
              </label>
              <div className="relative">
                <Code2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  id="leetcode"
                  name="leetcode"
                  type="url"
                  value={form.leetcode ?? ""}
                  onChange={handleFieldChange}
                  placeholder="https://leetcode.com/u/username"
                  className="w-full bg-muted border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-end gap-3 mt-8">
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
  );
}