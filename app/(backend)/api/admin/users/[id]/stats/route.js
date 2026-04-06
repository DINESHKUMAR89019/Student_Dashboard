import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Mark from "@/models/Mark";
import Course from "@/models/Course";
import Attendance from "@/models/Attendance";
import Assignment from "@/models/Assignment";

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = params;

        const user = await User.findById(id).select("-password");
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        let stats = { role: user.role, name: user.name, metrics: {} };

        if (user.role === "student") {
            const [marks, attendance, assignments] = await Promise.all([
                Mark.countDocuments({ student: id }),
                Attendance.countDocuments({ student: id }),
                // assignments submitted by student (Assuming assignment model tracks submissions or we just count attendance)
                // Wait! Let's check schemas if we have student links
                Mark.aggregate([
                    { $match: { student: user._id } },
                    { $group: { _id: null, avg: { $avg: "$score" } } }
                ])
            ]);
            
            stats.metrics = {
                totalGrades: marks,
                averageScore: assignments[0]?.avg ? Math.round(assignments[0].avg) : 0,
                attendanceRecords: attendance
            };
        } else if (user.role === "teacher") {
            const [courses, assignments] = await Promise.all([
                Course.countDocuments({ teacher: id }),
                Assignment.countDocuments({ teacher: id })
            ]);

            stats.metrics = {
                coursesCreated: courses,
                assignmentsPosted: assignments
            };
        } else {
             stats.metrics = { info: "Administrator accounts do not have academic analytics." };
        }

        return NextResponse.json(stats);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
