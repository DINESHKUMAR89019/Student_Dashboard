import mongoose from "mongoose";

const AssignmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: "" },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    dueDate: { type: Date, required: true },
    totalMarks: { type: Number, default: 100 },
    type: {
        type: String,
        enum: ["homework", "lab", "quiz", "midterm", "final", "project", "presentation"],
        default: "homework",
    },
    submissions: [{
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        submittedAt: { type: Date, default: Date.now },
        status: {
            type: String,
            enum: ["submitted", "late", "graded", "returned"],
            default: "submitted",
        },
        score: { type: Number, default: null },
        feedback: { type: String, default: "" },
        fileUrl: { type: String, default: "" },
    }],
}, { timestamps: true });

export default mongoose.models.Assignment || mongoose.model("Assignment", AssignmentSchema);
