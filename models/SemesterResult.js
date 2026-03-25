import mongoose from "mongoose";

const SemesterResultSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    semester: { type: Number, required: true, min: 1, max: 8 },
    sgpa: { type: Number, required: true, min: 0, max: 10 },
    cgpa: { type: Number, min: 0, max: 10 },
    totalCredits: { type: Number, default: 0 },
    earnedCredits: { type: Number, default: 0 },
    backlogs: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ["pass", "fail", "withheld", "pending"],
        default: "pass",
    },
    academicYear: { type: String, default: "" },
}, { timestamps: true });

// Ensure one result per student per semester
SemesterResultSchema.index({ studentId: 1, semester: 1 }, { unique: true });

export default mongoose.models.SemesterResult || mongoose.model("SemesterResult", SemesterResultSchema);
