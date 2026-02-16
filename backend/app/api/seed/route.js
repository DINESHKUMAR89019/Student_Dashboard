import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Course from '@/models/Course';
import Mark from '@/models/Mark';
import bcrypt from 'bcryptjs';
import { successResponse, errorResponse } from '@/lib/errorHandler';

// POST - Seed the database with sample data
export async function POST() {
    try {
        await connectDB();

        // Create sample teacher
        const hashedPassword = await bcrypt.hash('password123', 10);

        let teacher = await User.findOne({ email: 'teacher@test.com' });
        if (!teacher) {
            teacher = await User.create({
                name: 'Dr. John Smith',
                email: 'teacher@test.com',
                password: hashedPassword,
                role: 'teacher'
            });
        }

        // Create sample student
        let student = await User.findOne({ email: 'student@test.com' });
        if (!student) {
            student = await User.create({
                name: 'Alice Johnson',
                email: 'student@test.com',
                password: hashedPassword,
                role: 'student'
            });
        }

        // Create sample courses
        const courseData = [
            { title: 'Web Development', teacherId: teacher._id },
            { title: 'Data Structures & Algorithms', teacherId: teacher._id },
            { title: 'Database Management Systems', teacherId: teacher._id },
            { title: 'Operating Systems', teacherId: teacher._id },
            { title: 'Computer Networks', teacherId: teacher._id },
            { title: 'Software Engineering', teacherId: teacher._id },
        ];

        const createdCourses = [];
        for (const course of courseData) {
            let existing = await Course.findOne({ title: course.title, teacherId: course.teacherId });
            if (!existing) {
                existing = await Course.create(course);
            }
            createdCourses.push(existing);
        }

        // Create sample marks for the student
        const markData = [
            { studentId: student._id, courseId: createdCourses[0]._id, score: 92 },
            { studentId: student._id, courseId: createdCourses[1]._id, score: 85 },
            { studentId: student._id, courseId: createdCourses[2]._id, score: 78 },
            { studentId: student._id, courseId: createdCourses[3]._id, score: 88 },
            { studentId: student._id, courseId: createdCourses[4]._id, score: 65 },
            { studentId: student._id, courseId: createdCourses[5]._id, score: 95 },
        ];

        for (const mark of markData) {
            const existing = await Mark.findOne({
                studentId: mark.studentId,
                courseId: mark.courseId
            });
            if (!existing) {
                await Mark.create(mark);
            }
        }

        return successResponse({
            message: 'Database seeded successfully',
            teacher: { id: teacher._id, email: teacher.email, name: teacher.name },
            student: { id: student._id, email: student.email, name: student.name },
            coursesCount: createdCourses.length,
            accounts: {
                teacher: 'teacher@test.com / password123',
                student: 'student@test.com / password123'
            }
        }, 201);

    } catch (error) {
        console.error('Seed error:', error);
        return errorResponse(error, 'Failed to seed database');
    }
}
