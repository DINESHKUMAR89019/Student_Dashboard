import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Mark from "@/models/Mark";
import Course from "@/models/Course";
import Attendance from "@/models/Attendance";
import Assignment from "@/models/Assignment";
import Project from "@/models/Project";
import Certification from "@/models/Certification";
import Announcement from "@/models/Announcement";
import SemesterResult from "@/models/SemesterResult";

export async function GET() {
    try {
        await dbConnect();

        const [
            totalUsers,
            students,
            teachers,
            admins,
            totalCourses,
            totalMarks,
            totalAttendance,
            totalAssignments,
            totalProjects,
            totalCertifications,
            totalAnnouncements,
            totalSemResults,
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: "student" }),
            User.countDocuments({ role: "teacher" }),
            User.countDocuments({ role: "admin" }),
            Course.countDocuments(),
            Mark.countDocuments(),
            Attendance.countDocuments(),
            Assignment.countDocuments(),
            Project.countDocuments(),
            Certification.countDocuments(),
            Announcement.countDocuments(),
            SemesterResult.countDocuments(),
        ]);

        // Average score across all marks
        const markAgg = await Mark.aggregate([
            { $group: { _id: null, avg: { $avg: "$score" } } }
        ]);
        const avgScore = markAgg[0]?.avg ? Math.round(markAgg[0].avg) : 0;

        // Attendance rate
        const presentCount = await Attendance.countDocuments({ status: { $in: ["present", "late"] } });
        const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

        // Recent registrations (last 7 days)
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentUsers = await User.countDocuments({ _id: { $gte: weekAgo } });

        return NextResponse.json({
            users: { total: totalUsers, students, teachers, admins, recentUsers },
            academics: { totalCourses, totalMarks, avgScore, totalSemResults },
            activity: { totalAttendance, attendanceRate, totalAssignments, totalProjects },
            content: { totalCertifications, totalAnnouncements },
        });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
