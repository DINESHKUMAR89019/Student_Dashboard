import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import EventParticipation from "@/models/EventParticipation";

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("studentId");

        if (studentId) {
            const events = await EventParticipation.find({ studentId })
                .populate("studentId", "name email")
                .sort({ eventDate: -1 })
                .lean();
            return NextResponse.json(events);
        }

        const events = await EventParticipation.find({})
            .populate("studentId", "name email")
            .sort({ eventDate: -1 })
            .lean();
        return NextResponse.json(events);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const { title, studentId, eventDate, eventType, role, description, achievement, venue } = body;

        if (!title || !studentId || !eventDate) {
            return NextResponse.json({ error: "title, studentId, and eventDate are required" }, { status: 400 });
        }

        const event = await EventParticipation.create({
            title,
            studentId,
            eventDate,
            eventType: eventType || "other",
            role: role || "participant",
            description: description || "",
            achievement: achievement || "",
            venue: venue || "",
        });

        return NextResponse.json(event, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
