import { Types } from "mongoose";

export interface IPersonalInfo {
    fullname: string;
    email: string;
    mobile: string;
    address: string;
    github?: string;
    linkedin?: string;
    portfolio?: string;
    leetcode?: string;
}

export interface IWorkExperience {
    company: string;
    position: string;
    startDate:string;
    endDate: string;
    description: string;
}

export interface IProject {
    title: string;
    description: string;
    githubUrl?: string;
    liveUrl?: string;
    techStack: string[];
}

export interface IEducation {
    institution: string;
    degree: string;
    startDate: string;
    endDate: string;
    description: string;
}

export interface IResume {
    id?: string;
    user_id: Types.ObjectId;
    title: string;
    summary: string;
    personalInfo: IPersonalInfo;
    workExperience?: IWorkExperience[];
    projects: IProject[];
    education: IEducation[];
    skills: string[];
    certifications?: string[];
    createdAt?: Date;
    updatedAt?: Date;
}