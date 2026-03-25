import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    date: { type: Date, required: true },
    status: {
        type: String,
        enum: ["present", "absent", "late", "excused"],
        default: "present",
    },
    remarks: { type: String, default: "" },
}, { timestamps: true });

AttendanceSchema.index({ studentId: 1, courseId: 1, date: 1 }, { unique: true });

export default mongoose.models.Attendance || mongoose.model("Attendance", AttendanceSchema);
