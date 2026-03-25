import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Skill from "@/models/Skill";

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("studentId");

        const filter = studentId ? { studentId } : {};
        const skills = await Skill.find(filter)
            .populate("studentId", "name email")
            .populate("verifiedBy", "name")
            .sort({ proficiency: -1 })
            .lean();

        return NextResponse.json(skills);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const { studentId, name, category, proficiency } = body;

        if (!studentId || !name || !proficiency) {
            return NextResponse.json({ error: "studentId, name, and proficiency are required" }, { status: 400 });
        }

        const skill = await Skill.findOneAndUpdate(
            { studentId, name },
            {
                category: category || "programming",
                proficiency: Math.min(5, Math.max(1, Number(proficiency))),
            },
            { upsert: true, new: true, runValidators: true }
        );

        return NextResponse.json(skill, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const { skillId, verified, verifiedBy } = body;

        if (!skillId) {
            return NextResponse.json({ error: "skillId is required" }, { status: 400 });
        }

        const skill = await Skill.findByIdAndUpdate(
            skillId,
            { verified: verified !== false, verifiedBy: verifiedBy || undefined },
            { new: true }
        );

        return NextResponse.json(skill);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
