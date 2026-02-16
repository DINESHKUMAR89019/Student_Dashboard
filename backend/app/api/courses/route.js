import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import { validateObjectId } from '@/lib/validators';
import { errorResponse, successResponse } from '@/lib/errorHandler';
import { ObjectId } from 'mongodb';

// GET - Fetch all courses
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');

    let query = {};
    if (teacherId) {
      if (!validateObjectId(teacherId)) {
        return NextResponse.json(
          { success: false, error: 'Invalid teacher ID format' },
          { status: 400 }
        );
      }
      query.teacherId = new ObjectId(teacherId);
    }

    const courses = await Course.find(query)
      .populate('teacherId', 'name email')
      .sort({ createdAt: -1 });

    return successResponse(courses);

  } catch (error) {
    console.error('Fetch courses error:', error);
    return errorResponse(error, 'Failed to fetch courses');
  }
}

// POST - Create new course
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, teacherId } = body;

    // VALIDATION
    if (!title || !teacherId) {
      return NextResponse.json(
        { success: false, error: 'Title and teacher ID are required' },
        { status: 400 }
      );
    }

    if (!validateObjectId(teacherId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid teacher ID format' },
        { status: 400 }
      );
    }

    await connectDB();

    const course = await Course.create({
      title,
      teacherId: new ObjectId(teacherId)
    });

    return successResponse(course, 201);

  } catch (error) {
    console.error('Create course error:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return errorResponse(error, 'Failed to create course');
  }
}
