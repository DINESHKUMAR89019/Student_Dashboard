import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Mark from "@/models/Mark";
import User from "@/models/User";

export async function GET() {
    try {
        await dbConnect();

        // Aggregate marks per student
        const aggregation = await Mark.aggregate([
            {
                $group: {
                    _id: "$studentId",
                    avgScore: { $avg: "$score" },
                    totalMarks: { $sum: 1 },
                    highestScore: { $max: "$score" },
                    lowestScore: { $min: "$score" },
                },
            },
            { $sort: { avgScore: -1 } },
        ]);

        // Populate student names
        const studentIds = aggregation.map(a => a._id);
        const students = await User.find({ _id: { $in: studentIds } }).select("name email").lean();
        const studentMap = {};
        students.forEach(s => { studentMap[s._id.toString()] = s; });

        const leaderboard = aggregation.map((entry, index) => ({
            rank: index + 1,
            studentId: entry._id,
            name: studentMap[entry._id.toString()]?.name || "Unknown",
            email: studentMap[entry._id.toString()]?.email || "",
            avgScore: Math.round(entry.avgScore * 10) / 10,
            totalMarks: entry.totalMarks,
            highestScore: entry.highestScore,
            lowestScore: entry.lowestScore,
        }));

        return NextResponse.json(leaderboard);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
