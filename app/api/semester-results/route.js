import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import SemesterResult from "@/models/SemesterResult";

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("studentId");

        if (studentId) {
            const results = await SemesterResult.find({ studentId })
                .populate("studentId", "name email")
                .sort({ semester: 1 })
                .lean();
            return NextResponse.json(results);
        }

        const results = await SemesterResult.find({})
            .populate("studentId", "name email")
            .sort({ semester: 1 })
            .lean();
        return NextResponse.json(results);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const { studentId, semester, sgpa, cgpa, totalCredits, earnedCredits, backlogs, status, academicYear } = body;

        if (!studentId || !semester || sgpa === undefined) {
            return NextResponse.json({ error: "studentId, semester, and sgpa are required" }, { status: 400 });
        }

        // Upsert: one result per student per semester
        const result = await SemesterResult.findOneAndUpdate(
            { studentId, semester },
            {
                sgpa,
                cgpa: cgpa || undefined,
                totalCredits: totalCredits || 0,
                earnedCredits: earnedCredits || 0,
                backlogs: backlogs || 0,
                status: status || "pass",
                academicYear: academicYear || "",
            },
            { upsert: true, new: true, runValidators: true }
        );

        return NextResponse.json(result, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
