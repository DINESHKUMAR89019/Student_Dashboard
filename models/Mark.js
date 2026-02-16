import mongoose from "mongoose";

const MarkSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
});

export default mongoose.models.Mark || mongoose.model("Mark", MarkSchema);
