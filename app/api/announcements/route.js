import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Announcement from "@/models/Announcement";

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const teacherId = searchParams.get("teacherId");
        const courseId = searchParams.get("courseId");
        const active = searchParams.get("active");

        let filter = {};
        if (teacherId) filter.teacherId = teacherId;
        if (courseId) filter.courseId = courseId;
        if (active === "true") {
            filter.isActive = true;
            filter.$or = [
                { expiresAt: { $exists: false } },
                { expiresAt: null },
                { expiresAt: { $gt: new Date() } },
            ];
        }

        const announcements = await Announcement.find(filter)
            .populate("teacherId", "name email")
            .populate("courseId", "title")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(announcements);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const { title, content, teacherId, courseId, priority, targetAudience, expiresAt } = body;

        if (!title || !content || !teacherId) {
            return NextResponse.json({ error: "title, content, and teacherId are required" }, { status: 400 });
        }

        const announcement = await Announcement.create({
            title,
            content,
            teacherId,
            courseId: courseId || undefined,
            priority: priority || "medium",
            targetAudience: targetAudience || "all",
            expiresAt: expiresAt || undefined,
        });

        return NextResponse.json(announcement, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
