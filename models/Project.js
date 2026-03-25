import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: "" },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    techStack: [{ type: String }],
    status: {
        type: String,
        enum: ["planning", "in-progress", "completed", "presented"],
        default: "planning",
    },
    category: {
        type: String,
        enum: ["web", "mobile", "ml-ai", "iot", "data-science", "cybersecurity", "other"],
        default: "web",
    },
    repoUrl: { type: String, default: "" },
    liveUrl: { type: String, default: "" },
    teamMembers: [{ type: String }],
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    grade: { type: String, default: "" },
    mentor: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.models.Project || mongoose.model("Project", ProjectSchema);
