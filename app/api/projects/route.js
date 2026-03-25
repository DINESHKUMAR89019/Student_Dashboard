import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Project from "@/models/Project";

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("studentId");

        const filter = studentId ? { studentId } : {};
        const projects = await Project.find(filter)
            .populate("studentId", "name email")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(projects);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const { title, studentId, description, techStack, category, status, repoUrl, liveUrl, teamMembers, mentor } = body;

        if (!title || !studentId) {
            return NextResponse.json({ error: "title and studentId are required" }, { status: 400 });
        }

        const project = await Project.create({
            title,
            studentId,
            description: description || "",
            techStack: techStack || [],
            category: category || "web",
            status: status || "planning",
            repoUrl: repoUrl || "",
            liveUrl: liveUrl || "",
            teamMembers: teamMembers || [],
            mentor: mentor || "",
        });

        return NextResponse.json(project, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
