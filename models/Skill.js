import mongoose from "mongoose";

const SkillSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    category: {
        type: String,
        enum: ["programming", "framework", "database", "devops", "soft-skill", "language", "tools", "other"],
        default: "programming",
    },
    proficiency: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    verified: { type: Boolean, default: false },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

SkillSchema.index({ studentId: 1, name: 1 }, { unique: true });

export default mongoose.models.Skill || mongoose.model("Skill", SkillSchema);
