import mongoose from "mongoose";

const SpecialCourseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: "" },
    category: {
        type: String,
        enum: ["workshop", "elective", "online", "summer", "bridge"],
        default: "workshop",
    },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    completedDate: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ["enrolled", "in-progress", "completed"],
        default: "enrolled",
    },
    platform: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.models.SpecialCourse || mongoose.model("SpecialCourse", SpecialCourseSchema);
