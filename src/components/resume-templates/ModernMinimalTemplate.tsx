// Template 2: Modern Minimal (Mint Signal Modern)
// Contemporary layout with emerald/mint accent bar, pill skills, clean hierarchy
import React from "react";
import { ResumeTemplateProps } from "./types";

export default function ModernMinimalTemplate({ resume }: ResumeTemplateProps) {
  const info = resume.personalInfo ?? {};

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="mt-5 first:mt-0">
      <div className="flex items-center gap-3 mb-2.5">
        <span
          className="w-1 h-4 rounded-full shrink-0"
          style={{ background: "#51f0a8" }}
        />
        <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
          {title}
        </h3>
      </div>
      {children}
    </section>
  );

  const profileLinks = [
    info.github && { label: "GitHub", url: info.github },
    info.linkedin && { label: "LinkedIn", url: info.linkedin },
    info.portfolio && { label: "Portfolio", url: info.portfolio },
    info.leetcode && { label: "LeetCode", url: info.leetcode },
  ].filter(Boolean) as { label: string; url: string }[];

  return (
    <article
      className="resume-sheet bg-white text-slate-900"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* ── Accent top bar ───────────────────────────────────────── */}
      <div
        className="h-1 w-full mb-5 rounded-t-sm"
        style={{ background: "linear-gradient(90deg, #51f0a8, #0d9f5d)" }}
      />

      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="pb-4 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {info.fullname || "Your Full Name"}
            </h1>
            {resume.jobTitle && (
              <p
                className="text-sm font-semibold mt-0.5"
                style={{ color: "#0d9f5d" }}
              >
                {resume.jobTitle}
                {resume.experienceLevel ? ` · ${resume.experienceLevel}` : ""}
              </p>
            )}
          </div>
          <div className="text-right text-[10px] text-slate-500 space-y-0.5 leading-relaxed">
            {info.email && <div>{info.email}</div>}
            {info.mobile && <div>{info.mobile}</div>}
            {info.address && <div>{info.address}</div>}
          </div>
        </div>

        {/* Profile links row */}
        {profileLinks.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-2">
            {profileLinks.map(({ label, url }) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-medium underline"
                style={{ color: "#0d9f5d" }}
              >
                {label}
              </a>
            ))}
          </div>
        )}
      </header>

      {/* ── Summary ─────────────────────────────────────────────── */}
      {resume.summary && (
        <Section title="Professional Summary">
          <p className="text-xs text-slate-700 leading-relaxed">{resume.summary}</p>
        </Section>
      )}

      {/* ── Skills — pill tags ───────────────────────────────────── */}
      {resume.skills && resume.skills.length > 0 && (
        <Section title="Technical Skills">
          <div className="flex flex-wrap gap-1.5">
            {resume.skills.map((skill, i) => (
              <span
                key={i}
                className="px-2.5 py-0.5 rounded-full text-[10px] font-medium border"
                style={{
                  background: "#f0fdf8",
                  color: "#0d9f5d",
                  borderColor: "#6ee7b7",
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* ── Work Experience ──────────────────────────────────────── */}
      {resume.workExperience && resume.workExperience.length > 0 && (
        <Section title="Work Experience">
          <div className="space-y-3.5">
            {resume.workExperience.map((exp, i) => (
              <div key={i}>
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-sm font-bold text-slate-900">{exp.position}</span>
                    <span className="text-xs text-slate-500"> @ {exp.company}</span>
                  </div>
                  <span
                    className="text-[10px] font-mono shrink-0 ml-2"
                    style={{ color: "#0d9f5d" }}
                  >
                    {exp.startDate} – {exp.endDate}
                  </span>
                </div>
                {exp.description && (
                  <p className="text-xs text-slate-600 mt-1 whitespace-pre-line leading-relaxed">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Projects ────────────────────────────────────────────── */}
      {resume.projects && resume.projects.length > 0 && (
        <Section title="Projects">
          <div className="space-y-3.5">
            {resume.projects.map((proj, i) => (
              <div key={i}>
                <div className="flex items-baseline justify-between flex-wrap gap-1">
                  <span className="text-sm font-bold text-slate-900">{proj.title}</span>
                  <div className="flex items-center gap-3 text-[10px]" style={{ color: "#0d9f5d" }}>
                    {proj.githubUrl && (
                      <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="underline">
                        GitHub
                      </a>
                    )}
                    {proj.liveUrl && (
                      <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="underline">
                        Live
                      </a>
                    )}
                  </div>
                </div>
                {proj.techStack?.length > 0 && (
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Stack: {proj.techStack.join(", ")}
                  </p>
                )}
                {proj.description && (
                  <p className="text-xs text-slate-600 mt-1 whitespace-pre-line leading-relaxed">
                    {proj.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Education ────────────────────────────────────────────── */}
      {resume.education && resume.education.length > 0 && (
        <Section title="Education">
          <div className="space-y-2">
            {resume.education.map((edu, i) => (
              <div key={i}>
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-sm font-bold text-slate-900">{edu.degree}</span>
                    <span className="text-xs text-slate-500"> · {edu.institution}</span>
                  </div>
                  <span
                    className="text-[10px] font-mono shrink-0 ml-2"
                    style={{ color: "#0d9f5d" }}
                  >
                    {edu.startDate} – {edu.endDate}
                  </span>
                </div>
                {edu.description && (
                  <p className="text-[10px] text-slate-500 mt-0.5">{edu.description}</p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Certifications ───────────────────────────────────────── */}
      {resume.certifications && resume.certifications.length > 0 && (
        <Section title="Certifications &amp; Achievements">
          <ul className="space-y-0.5">
            {resume.certifications.map((cert, i) => (
              <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                <span className="shrink-0 mt-0.5" style={{ color: "#51f0a8" }}>✓</span>
                {cert}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </article>
  );
}
