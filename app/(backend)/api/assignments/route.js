import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Assignment from "@/models/Assignment";

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const teacherId = searchParams.get("teacherId");
        const courseId = searchParams.get("courseId");
        const studentId = searchParams.get("studentId");

        let filter = {};
        if (teacherId) filter.teacherId = teacherId;
        if (courseId) filter.courseId = courseId;

        let assignments = await Assignment.find(filter)
            .populate("courseId", "title")
            .populate("submissions.studentId", "name email")
            .sort({ dueDate: -1 })
            .lean();

        // If studentId filter, only show relevant submissions
        if (studentId) {
            assignments = assignments.map(a => ({
                ...a,
                submissions: a.submissions.filter(
                    s => s.studentId?._id?.toString() === studentId
                ),
            }));
        }

        return NextResponse.json(assignments);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const { title, courseId, teacherId, dueDate, totalMarks, type, description } = body;

        if (!title || !courseId || !teacherId || !dueDate) {
            return NextResponse.json({ error: "title, courseId, teacherId, and dueDate are required" }, { status: 400 });
        }

        const assignment = await Assignment.create({
            title,
            description: description || "",
            courseId,
            teacherId,
            dueDate,
            totalMarks: totalMarks || 100,
            type: type || "homework",
        });

        return NextResponse.json(assignment, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const { assignmentId, studentId, score, feedback, status } = body;

        if (!assignmentId || !studentId) {
            return NextResponse.json({ error: "assignmentId and studentId are required" }, { status: 400 });
        }

        // Check if submission exists
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
        }

        const existingIdx = assignment.submissions.findIndex(
            s => s.studentId?.toString() === studentId
        );

        if (existingIdx >= 0) {
            // Update existing submission
            if (score !== undefined) assignment.submissions[existingIdx].score = score;
            if (feedback) assignment.submissions[existingIdx].feedback = feedback;
            if (status) assignment.submissions[existingIdx].status = status;
        } else {
            // Add new submission
            assignment.submissions.push({
                studentId,
                status: status || "submitted",
                score: score || null,
                feedback: feedback || "",
            });
        }

        await assignment.save();
        return NextResponse.json(assignment);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
