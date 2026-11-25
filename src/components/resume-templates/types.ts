// ── Shared Resume Template Types ─────────────────────────────────────────────
export interface IPersonalInfoProps {
  fullname?: string;
  email?: string;
  mobile?: string;
  address?: string;
  github?: string;
  linkedin?: string;
  portfolio?: string;
  leetcode?: string;
}

export interface IWorkExperienceProps {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface IProjectProps {
  title: string;
  description: string;
  githubUrl?: string;
  liveUrl?: string;
  techStack: string[];
}

export interface IEducationProps {
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface ResumeTemplateProps {
  resume: {
    _id?: string;
    title?: string;
    jobTitle?: string;
    experienceLevel?: string;
    summary?: string;
    personalInfo?: Partial<IPersonalInfoProps>;
    workExperience?: IWorkExperienceProps[];
    projects?: IProjectProps[];
    education?: IEducationProps[];
    skills?: string[];
    certifications?: string[];
  };
}
