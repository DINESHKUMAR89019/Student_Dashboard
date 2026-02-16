import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { errorResponse, successResponse } from '@/lib/errorHandler';

// GET - Lookup students by email
export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json(
                { success: false, error: 'Email parameter is required' },
                { status: 400 }
            );
        }

        const user = await User.findOne({
            email: email.toLowerCase(),
            role: 'student'
        }).select('_id name email role');

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Student not found with this email' },
                { status: 404 }
            );
        }

        return successResponse({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });

    } catch (error) {
        console.error('Student lookup error:', error);
        return errorResponse(error, 'Failed to lookup student');
    }
}
