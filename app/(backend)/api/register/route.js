import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        await dbConnect();
        const { name, email, password, role } = await req.json();

        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return NextResponse.json({ error: "Email already registered" }, { status: 409 });
        }

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashed, role });

        return NextResponse.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        }, { status: 201 });
    } catch (err) {
        console.error("Register error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
