import mongoose from "mongoose";

const EventParticipationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: "" },
    eventDate: { type: Date, required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    eventType: {
        type: String,
        enum: ["hackathon", "seminar", "workshop", "sports", "cultural", "conference", "other"],
        default: "other",
    },
    role: {
        type: String,
        enum: ["participant", "organizer", "volunteer", "speaker", "winner"],
        default: "participant",
    },
    achievement: { type: String, default: "" },
    venue: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.models.EventParticipation || mongoose.model("EventParticipation", EventParticipationSchema);
