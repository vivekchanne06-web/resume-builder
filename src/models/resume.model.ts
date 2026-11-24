import mongoose from "mongoose";
import { IResume } from "../types/resume.types";

const resumeSchema = new mongoose.Schema<IResume>({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        default: "My Resume"
    },
    summary: {
        type: String,
        default: "A brief summary of my professional background and goals."
    },
    personalInfo: {
        type: {
                fullname: String,
                email: String,
                mobile: String,
                address:String ,
                github:String,
                linkedin: String,
                portfolio: String,
                leetcode: String
        },
        default: {}
    },
    workExperience: {
        type: [
            {
            company: String,
            position: String,
            startDate: String,
            endDate: String,
            description: String,
        }
    ],
        default: [],
    },
    projects: {
        type: [
            {
                title: String,
                description: String,
                githubUrl: String,
                liveUrl: String,
                techStack: [String]
            }
        ],
        default: [],
    },
    skills: {
        type: [String],
        default: []
    },
    education: {
        type: [{
            institution: String,
            degree: String,
            startDate: String,
            endDate: String,
            description: String,
        }],
        default: [],
    },
    certifications: {
        type: [String],
        default: []
    }
},{
    timestamps: true
});

const ResumeModel = mongoose.model("Resume", resumeSchema);

export default ResumeModel;