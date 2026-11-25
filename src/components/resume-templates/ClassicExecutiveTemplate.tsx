// Template 1: Classic Executive (ATS Classic)
// Single-column, high-parseability Fortune-500 ATS layout
import React from "react";
import { ResumeTemplateProps } from "./types";

export default function ClassicExecutiveTemplate({ resume }: ResumeTemplateProps) {
  const info = resume.personalInfo ?? {};

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="mb-2 mt-5 first:mt-0">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 border-b border-slate-300 pb-1">
        {title}
      </h3>
    </div>
  );

  const links = [
    info.email,
    info.mobile,
    info.address,
    info.github,
    info.linkedin,
    info.portfolio,
    info.leetcode,
  ].filter(Boolean);

  return (
    <article
      className="resume-sheet bg-white text-slate-900 font-sans"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="text-center pb-4 border-b-2 border-slate-900 mb-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">
          {info.fullname || "Your Full Name"}
        </h1>
        {resume.jobTitle && (
          <p className="text-sm font-semibold text-slate-600 mt-0.5 tracking-wide">
            {resume.jobTitle}
            {resume.experienceLevel ? ` · ${resume.experienceLevel}` : ""}
          </p>
        )}
        {links.length > 0 && (
          <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
            {links.join("  |  ")}
          </p>
        )}
      </header>

      {/* ── Summary ────────────────────────────────────────────────── */}
      {resume.summary && (
        <>
          <SectionHeader title="Professional Summary" />
          <p className="text-xs text-slate-700 leading-relaxed">{resume.summary}</p>
        </>
      )}

      {/* ── Skills ─────────────────────────────────────────────────── */}
      {resume.skills && resume.skills.length > 0 && (
        <>
          <SectionHeader title="Technical Skills" />
          <p className="text-xs text-slate-700 leading-relaxed">
            {resume.skills.join("  ·  ")}
          </p>
        </>
      )}

      {/* ── Work Experience ─────────────────────────────────────────── */}
      {resume.workExperience && resume.workExperience.length > 0 && (
        <>
          <SectionHeader title="Work Experience" />
          <div className="space-y-3.5">
            {resume.workExperience.map((exp, i) => (
              <div key={i}>
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-sm font-bold text-slate-900">{exp.position}</span>
                    <span className="text-xs text-slate-600"> — {exp.company}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0 ml-2">
                    {exp.startDate} – {exp.endDate}
                  </span>
                </div>
                {exp.description && (
                  <p className="text-xs text-slate-700 mt-1 whitespace-pre-line leading-relaxed ml-2">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Projects ───────────────────────────────────────────────── */}
      {resume.projects && resume.projects.length > 0 && (
        <>
          <SectionHeader title="Projects" />
          <div className="space-y-3.5">
            {resume.projects.map((proj, i) => (
              <div key={i}>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-bold text-slate-900">{proj.title}</span>
                  {proj.techStack?.length > 0 && (
                    <span className="text-[10px] font-mono text-slate-500 shrink-0 ml-2">
                      {proj.techStack.join(", ")}
                    </span>
                  )}
                </div>
                {(proj.githubUrl || proj.liveUrl) && (
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {proj.githubUrl && <span>GitHub: {proj.githubUrl}</span>}
                    {proj.githubUrl && proj.liveUrl && "  |  "}
                    {proj.liveUrl && <span>Live: {proj.liveUrl}</span>}
                  </p>
                )}
                {proj.description && (
                  <p className="text-xs text-slate-700 mt-1 whitespace-pre-line leading-relaxed ml-2">
                    {proj.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Education ──────────────────────────────────────────────── */}
      {resume.education && resume.education.length > 0 && (
        <>
          <SectionHeader title="Education" />
          <div className="space-y-2">
            {resume.education.map((edu, i) => (
              <div key={i} className="flex items-baseline justify-between">
                <div>
                  <span className="text-sm font-bold text-slate-900">{edu.degree}</span>
                  <span className="text-xs text-slate-600"> — {edu.institution}</span>
                  {edu.description && (
                    <p className="text-[10px] text-slate-500 mt-0.5">{edu.description}</p>
                  )}
                </div>
                <span className="text-[10px] font-mono text-slate-500 shrink-0 ml-2">
                  {edu.startDate} – {edu.endDate}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Certifications ─────────────────────────────────────────── */}
      {resume.certifications && resume.certifications.length > 0 && (
        <>
          <SectionHeader title="Certifications &amp; Achievements" />
          <ul className="space-y-0.5">
            {resume.certifications.map((cert, i) => (
              <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                <span className="text-slate-400 font-bold shrink-0">▪</span>
                {cert}
              </li>
            ))}
          </ul>
        </>
      )}
    </article>
  );
}
