import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// GET — list all users with optional role filter
export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const role = searchParams.get("role");
        const search = searchParams.get("search");

        const query = {};
        if (role && role !== "all") query.role = role;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        const users = await User.find(query).select("-password").sort({ _id: -1 }).limit(200);
        return NextResponse.json(users);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST — create a new user (admin can create any role including admin)
export async function POST(req) {
    try {
        await dbConnect();
        const { name, email, password, role } = await req.json();
        if (!name || !email || !password || !role)
            return NextResponse.json({ error: "All fields required" }, { status: 400 });

        const existing = await User.findOne({ email });
        if (existing)
            return NextResponse.json({ error: "Email already exists" }, { status: 409 });

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashed, role });
        return NextResponse.json({ _id: user._id, name: user.name, email: user.email, role: user.role }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// PUT — update a user's role or name
export async function PUT(req) {
    try {
        await dbConnect();
        const { userId, role, name } = await req.json();
        if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

        const update = {};
        if (role) update.role = role;
        if (name) update.name = name;

        const user = await User.findByIdAndUpdate(userId, update, { new: true }).select("-password");
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
        return NextResponse.json(user);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// DELETE — remove a user
export async function DELETE(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

        await User.findByIdAndDelete(userId);
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
