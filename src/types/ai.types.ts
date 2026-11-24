export interface GenerateSummeryBody{
    experienceLevel: string;
    skills: string[];
    jobTitle: string;
}

export interface GenerateSkillsBody{
    experienceLevel: string;
    jobTitle: string;   
}
export interface GenerateProjectDescriptionBody{
    experienceLevel: string;
    projectTitle: string;
    techStack: string[];
    jobTitle: string;
}

export interface GenerateWorkExperienceDescriptionBody{
    experienceLevel: string;
    jobTitle: string;
    techStack: string[];
    numberOfYears: number;
}