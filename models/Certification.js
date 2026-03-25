import mongoose from "mongoose";

const CertificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    issuedBy: { type: String, required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    issueDate: { type: Date, default: Date.now },
    expiryDate: { type: Date },
    credentialId: { type: String, default: "" },
    category: {
        type: String,
        enum: ["technical", "language", "soft-skills", "domain", "other"],
        default: "technical",
    },
    status: {
        type: String,
        enum: ["active", "expired", "in-progress"],
        default: "active",
    },
}, { timestamps: true });

export default mongoose.models.Certification || mongoose.model("Certification", CertificationSchema);
