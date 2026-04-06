import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Course from "@/models/Course";
import Mark from "@/models/Mark";

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const teacherId = searchParams.get("teacherId");
        const studentId = searchParams.get("studentId");

        if (teacherId) {
            // Teacher view: courses they created
            const courses = await Course.find({ teacherId });
            return NextResponse.json(courses);
        }

        if (studentId) {
            // Student view: courses they have marks in
            const marks = await Mark.find({ studentId }).select("courseId");
            const courseIds = marks.map((m) => m.courseId);
            const courses = await Course.find({ _id: { $in: courseIds } });
            return NextResponse.json(courses);
        }

        // Default: all courses
        const courses = await Course.find({});
        return NextResponse.json(courses);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const { title, teacherId } = await req.json();

        if (!title || !teacherId) {
            return NextResponse.json({ error: "Title and teacherId are required" }, { status: 400 });
        }

        const course = await Course.create({ title, teacherId });
        return NextResponse.json(course, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
