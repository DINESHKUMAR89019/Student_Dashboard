import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import SpecialCourse from "@/models/SpecialCourse";

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("studentId");

        if (studentId) {
            const courses = await SpecialCourse.find({ studentId })
                .populate("studentId", "name email")
                .sort({ createdAt: -1 })
                .lean();
            return NextResponse.json(courses);
        }

        // Return all special courses
        const courses = await SpecialCourse.find({})
            .populate("studentId", "name email")
            .sort({ createdAt: -1 })
            .lean();
        return NextResponse.json(courses);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const { title, studentId, category, description, platform, status } = body;

        if (!title || !studentId) {
            return NextResponse.json({ error: "title and studentId are required" }, { status: 400 });
        }

        const course = await SpecialCourse.create({
            title,
            studentId,
            category: category || "workshop",
            description: description || "",
            platform: platform || "",
            status: status || "enrolled",
        });

        return NextResponse.json(course, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
