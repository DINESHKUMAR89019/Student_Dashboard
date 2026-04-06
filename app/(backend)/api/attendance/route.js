import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Attendance from "@/models/Attendance";
import Course from "@/models/Course";

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("studentId");
        const courseId = searchParams.get("courseId");
        const teacherId = searchParams.get("teacherId");

        let filter = {};
        if (studentId) filter.studentId = studentId;
        if (courseId) filter.courseId = courseId;

        if (teacherId) {
            const courses = await Course.find({ teacherId }).select("_id");
            const courseIds = courses.map(c => c._id);
            filter.courseId = { $in: courseIds };
        }

        const records = await Attendance.find(filter)
            .populate("studentId", "name email")
            .populate("courseId", "title")
            .sort({ date: -1 })
            .lean();

        return NextResponse.json(records);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const { studentId, courseId, date, status, remarks } = body;

        if (!studentId || !courseId || !date) {
            return NextResponse.json({ error: "studentId, courseId, and date are required" }, { status: 400 });
        }

        const record = await Attendance.findOneAndUpdate(
            { studentId, courseId, date: new Date(date) },
            { status: status || "present", remarks: remarks || "" },
            { upsert: true, new: true, runValidators: true }
        );

        return NextResponse.json(record, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
