import mongoose from "mongoose";

const StudyGoalSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    category: {
        type: String,
        enum: ["academic", "skill", "career", "personal", "certification"],
        default: "academic",
    },
    status: {
        type: String,
        enum: ["not-started", "in-progress", "completed", "abandoned"],
        default: "not-started",
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
    },
    targetDate: { type: Date },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    milestones: [{
        title: { type: String },
        completed: { type: Boolean, default: false },
    }],
}, { timestamps: true });

export default mongoose.models.StudyGoal || mongoose.model("StudyGoal", StudyGoalSchema);
