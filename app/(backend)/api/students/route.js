import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function GET() {
    try {
        await dbConnect();
        const students = await User.find({ role: "student" }).select("_id name email");
        return NextResponse.json(students);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
