import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Mark from "@/models/Mark";
import Course from "@/models/Course";
import User from "@/models/User";

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("studentId");
        const teacherId = searchParams.get("teacherId");

        if (studentId) {
            // Get marks for a specific student
            const marks = await Mark.find({ studentId })
                .populate("courseId", "title")
                .lean();
            return NextResponse.json(marks);
        }

        if (teacherId) {
            // Get all marks for courses owned by this teacher
            const courses = await Course.find({ teacherId }).select("_id");
            const courseIds = courses.map((c) => c._id);
            const marks = await Mark.find({ courseId: { $in: courseIds } })
                .populate("studentId", "name email")
                .populate("courseId", "title")
                .lean();
            return NextResponse.json(marks);
        }

        return NextResponse.json({ error: "Provide studentId or teacherId" }, { status: 400 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const { studentId, courseId, score } = await req.json();

        if (!studentId || !courseId || score === undefined) {
            return NextResponse.json({ error: "studentId, courseId, and score are required" }, { status: 400 });
        }

        // Upsert: update if mark already exists for this student+course
        const mark = await Mark.findOneAndUpdate(
            { studentId, courseId },
            { score },
            { upsert: true, new: true, runValidators: true }
        );

        return NextResponse.json(mark, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
