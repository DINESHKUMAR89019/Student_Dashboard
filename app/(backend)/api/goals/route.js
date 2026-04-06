import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import StudyGoal from "@/models/StudyGoal";

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("studentId");

        const filter = studentId ? { studentId } : {};
        const goals = await StudyGoal.find(filter)
            .populate("studentId", "name email")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(goals);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const { studentId, title, description, category, priority, targetDate, milestones } = body;

        if (!studentId || !title) {
            return NextResponse.json({ error: "studentId and title are required" }, { status: 400 });
        }

        const goal = await StudyGoal.create({
            studentId,
            title,
            description: description || "",
            category: category || "academic",
            priority: priority || "medium",
            targetDate: targetDate || undefined,
            milestones: milestones || [],
        });

        return NextResponse.json(goal, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const { goalId, status, progress, milestones } = body;

        if (!goalId) {
            return NextResponse.json({ error: "goalId is required" }, { status: 400 });
        }

        const updates = {};
        if (status) updates.status = status;
        if (progress !== undefined) updates.progress = progress;
        if (milestones) updates.milestones = milestones;

        const goal = await StudyGoal.findByIdAndUpdate(goalId, updates, { new: true });
        return NextResponse.json(goal);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
