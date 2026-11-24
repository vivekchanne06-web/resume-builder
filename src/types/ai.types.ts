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

export interface GenerateImproveContentBody{
    content: string;
}

export interface ImprovedContentResponse {
    improved: string[];       
    ats_keywords: string[];   
    improvement_note: string; 
}

export interface AtsScoreBody {
    resumeText: string;
}

export interface AtsScoreResponse {
    overall_score: number;               // 0–100
    grade: "Excellent" | "Good" | "Fair" | "Poor";
    sections: {
        keywords:      AtsSection;
        formatting:    AtsSection;
        impact:        AtsSection;
        readability:   AtsSection;
        completeness:  AtsSection;
    };
    found_keywords:   string[];
    missing_keywords: string[];
    critical_issues:  string[];
    quick_wins:       string[];
}

interface AtsSection {
    score:    number;    // 0–100
    feedback: string;    // one specific sentence
}