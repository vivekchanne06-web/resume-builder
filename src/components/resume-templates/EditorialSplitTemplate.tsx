// Template 3: Editorial Split (Executive Two-Column)
// Two-column layout: Lora serif headings, IBM Plex Mono dates, sidebar + main
import React from "react";
import { ResumeTemplateProps } from "./types";

export default function EditorialSplitTemplate({ resume }: ResumeTemplateProps) {
  const info = resume.personalInfo ?? {};

  const SidebarSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="mb-5">
      <h3
        className="text-[9px] font-bold uppercase tracking-[0.2em] mb-2 pb-1 border-b"
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          color: "#0d9f5d",
          borderColor: "#d1fae5",
        }}
      >
        {title}
      </h3>
      {children}
    </section>
  );

  const MainSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="mb-5">
      <h3
        className="text-xs font-bold uppercase tracking-[0.14em] text-slate-700 border-b border-slate-200 pb-1 mb-2.5"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {title}
      </h3>
      {children}
    </section>
  );

  const DateSpan = ({ children }: { children: React.ReactNode }) => (
    <span
      className="text-[9px] text-slate-500 shrink-0"
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
    >
      {children}
    </span>
  );

  return (
    <article
      className="resume-sheet bg-white text-slate-900 template-editorial"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* ── Full-width header ─────────────────────────────────────── */}
      <header className="pb-4 mb-4 border-b-2 border-slate-900">
        <h1
          className="text-2xl font-bold tracking-tight text-slate-900"
          style={{ fontFamily: "'Lora', serif" }}
        >
          {info.fullname || "Your Full Name"}
        </h1>
        {resume.jobTitle && (
          <p
            className="text-sm font-semibold mt-0.5"
            style={{ color: "#0d9f5d", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {resume.jobTitle}
            {resume.experienceLevel ? ` · ${resume.experienceLevel}` : ""}
          </p>
        )}
      </header>

      {/* ── Two-column body ───────────────────────────────────────── */}
      <div className="grid grid-cols-[200px_1fr] gap-6">

        {/* LEFT SIDEBAR ─────────────────────────────────────────── */}
        <aside
          className="sidebar-col rounded-lg p-4"
          style={{ background: "#f5f5f5" }}
        >
          {/* Contact */}
          <SidebarSection title="Contact">
            <div className="space-y-1 text-[9.5px] text-slate-600 leading-relaxed">
              {info.email && <div className="break-all">{info.email}</div>}
              {info.mobile && <div>{info.mobile}</div>}
              {info.address && <div>{info.address}</div>}
              {info.github && (
                <a
                  href={info.github}
                  target="_blank"
                  rel="noreferrer"
                  className="block underline"
                  style={{ color: "#0d9f5d" }}
                >
                  GitHub
                </a>
              )}
              {info.linkedin && (
                <a
                  href={info.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="block underline"
                  style={{ color: "#0d9f5d" }}
                >
                  LinkedIn
                </a>
              )}
              {info.portfolio && (
                <a
                  href={info.portfolio}
                  target="_blank"
                  rel="noreferrer"
                  className="block underline"
                  style={{ color: "#0d9f5d" }}
                >
                  Portfolio
                </a>
              )}
              {info.leetcode && (
                <a
                  href={info.leetcode}
                  target="_blank"
                  rel="noreferrer"
                  className="block underline"
                  style={{ color: "#0d9f5d" }}
                >
                  LeetCode
                </a>
              )}
            </div>
          </SidebarSection>

          {/* Technical Skills */}
          {resume.skills && resume.skills.length > 0 && (
            <SidebarSection title="Technical Skills">
              <div className="flex flex-wrap gap-1">
                {resume.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-1.5 py-0.5 rounded text-[9px] font-medium"
                    style={{
                      background: "#ecfdf5",
                      color: "#065f46",
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </SidebarSection>
          )}

          {/* Education */}
          {resume.education && resume.education.length > 0 && (
            <SidebarSection title="Education">
              <div className="space-y-2.5">
                {resume.education.map((edu, i) => (
                  <div key={i}>
                    <div className="text-[10px] font-bold text-slate-800 leading-tight">
                      {edu.degree}
                    </div>
                    <div className="text-[9.5px] text-slate-600 leading-tight mt-0.5">
                      {edu.institution}
                    </div>
                    <DateSpan>
                      {edu.startDate} – {edu.endDate}
                    </DateSpan>
                    {edu.description && (
                      <p className="text-[9px] text-slate-500 mt-0.5">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </SidebarSection>
          )}

          {/* Certifications */}
          {resume.certifications && resume.certifications.length > 0 && (
            <SidebarSection title="Certifications">
              <ul className="space-y-1">
                {resume.certifications.map((cert, i) => (
                  <li key={i} className="text-[9.5px] text-slate-600 leading-snug">
                    <span style={{ color: "#51f0a8" }}>▪ </span>
                    {cert}
                  </li>
                ))}
              </ul>
            </SidebarSection>
          )}
        </aside>

        {/* RIGHT MAIN ───────────────────────────────────────────── */}
        <main>
          {/* Summary */}
          {resume.summary && (
            <MainSection title="Professional Summary">
              <p className="text-xs text-slate-700 leading-relaxed">{resume.summary}</p>
            </MainSection>
          )}

          {/* Work Experience */}
          {resume.workExperience && resume.workExperience.length > 0 && (
            <MainSection title="Work Experience">
              <div className="space-y-4">
                {resume.workExperience.map((exp, i) => (
                  <div key={i}>
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span
                          className="text-sm font-bold text-slate-900"
                          style={{ fontFamily: "'Lora', serif" }}
                        >
                          {exp.position}
                        </span>
                        <span className="text-xs text-slate-500 ml-1.5">@ {exp.company}</span>
                      </div>
                      <DateSpan>
                        {exp.startDate} – {exp.endDate}
                      </DateSpan>
                    </div>
                    {exp.description && (
                      <p className="text-xs text-slate-600 mt-1.5 whitespace-pre-line leading-relaxed">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </MainSection>
          )}

          {/* Projects */}
          {resume.projects && resume.projects.length > 0 && (
            <MainSection title="Projects">
              <div className="space-y-4">
                {resume.projects.map((proj, i) => (
                  <div key={i}>
                    <div className="flex items-baseline justify-between flex-wrap gap-1">
                      <span
                        className="text-sm font-bold text-slate-900"
                        style={{ fontFamily: "'Lora', serif" }}
                      >
                        {proj.title}
                      </span>
                      {proj.techStack?.length > 0 && (
                        <DateSpan>{proj.techStack.join(" · ")}</DateSpan>
                      )}
                    </div>
                    {(proj.githubUrl || proj.liveUrl) && (
                      <div className="flex gap-3 mt-0.5">
                        {proj.githubUrl && (
                          <a
                            href={proj.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] underline"
                            style={{ color: "#0d9f5d" }}
                          >
                            GitHub
                          </a>
                        )}
                        {proj.liveUrl && (
                          <a
                            href={proj.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] underline"
                            style={{ color: "#0d9f5d" }}
                          >
                            Live Demo
                          </a>
                        )}
                      </div>
                    )}
                    {proj.description && (
                      <p className="text-xs text-slate-600 mt-1 whitespace-pre-line leading-relaxed">
                        {proj.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </MainSection>
          )}
        </main>
      </div>
    </article>
  );
}
