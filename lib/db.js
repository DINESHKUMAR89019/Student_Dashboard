import mongoose from "mongoose";
import "@/models/User";
import "@/models/Certification";
import "@/models/Course";
import "@/models/Mark";
import "@/models/Project";
import "@/models/SemesterResult";
import "@/models/Skill";
import "@/models/SpecialCourse";
import "@/models/StudyGoal";
import "@/models/Attendance";
import "@/models/Assignment";
import "@/models/Announcement";
import "@/models/EventParticipation";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("Please define MONGODB_URI in .env.local");
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose
            .connect(MONGODB_URI, { bufferCommands: false })
            .then((m) => m);
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

export default dbConnect;
