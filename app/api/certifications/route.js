import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Certification from "@/models/Certification";

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("studentId");

        if (studentId) {
            const certs = await Certification.find({ studentId })
                .populate("studentId", "name email")
                .sort({ issueDate: -1 })
                .lean();
            return NextResponse.json(certs);
        }

        const certs = await Certification.find({})
            .populate("studentId", "name email")
            .sort({ issueDate: -1 })
            .lean();
        return NextResponse.json(certs);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const { title, issuedBy, studentId, category, credentialId, issueDate, expiryDate, status } = body;

        if (!title || !issuedBy || !studentId) {
            return NextResponse.json({ error: "title, issuedBy, and studentId are required" }, { status: 400 });
        }

        const cert = await Certification.create({
            title,
            issuedBy,
            studentId,
            category: category || "technical",
            credentialId: credentialId || "",
            issueDate: issueDate || new Date(),
            expiryDate: expiryDate || undefined,
            status: status || "active",
        });

        return NextResponse.json(cert, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
