import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Mark from '@/models/Mark';
import { validateObjectId, validateScore } from '@/lib/validators';
import { errorResponse, successResponse } from '@/lib/errorHandler';
import { ObjectId } from 'mongodb';

// GET - Fetch marks
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const courseId = searchParams.get('courseId');

    let query = {};

    if (studentId) {
      if (!validateObjectId(studentId)) {
        return NextResponse.json(
          { success: false, error: 'Invalid student ID' },
          { status: 400 }
        );
      }
      query.studentId = new ObjectId(studentId);
    }

    if (courseId) {
      if (!validateObjectId(courseId)) {
        return NextResponse.json(
          { success: false, error: 'Invalid course ID' },
          { status: 400 }
        );
      }
      query.courseId = new ObjectId(courseId);
    }

    const marks = await Mark.find(query)
      .populate('studentId', 'name email')
      .populate('courseId', 'title');

    return successResponse(marks);

  } catch (error) {
    console.error('Fetch marks error:', error);
    return errorResponse(error, 'Failed to fetch marks');
  }
}

// POST - Add marks
export async function POST(request) {
  try {
    const body = await request.json();
    const { studentId, courseId, score } = body;

    // VALIDATION
    if (!studentId || !courseId || score === undefined) {
      return NextResponse.json(
        { success: false, error: 'Student ID, course ID, and score are required' },
        { status: 400 }
      );
    }

    if (!validateObjectId(studentId) || !validateObjectId(courseId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    // SCORE VALIDATION
    const scoreCheck = validateScore(score);
    if (!scoreCheck.valid) {
      return NextResponse.json(
        { success: false, error: scoreCheck.error },
        { status: 400 }
      );
    }

    await connectDB();

    // CHECK FOR DUPLICATE MARKS
    const existingMark = await Mark.findOne({
      studentId: new ObjectId(studentId),
      courseId: new ObjectId(courseId)
    });

    if (existingMark) {
      return NextResponse.json(
        { success: false, error: 'Mark already exists for this student in this course' },
        { status: 409 }
      );
    }

    const mark = await Mark.create({
      studentId: new ObjectId(studentId),
      courseId: new ObjectId(courseId),
      score
    });

    return successResponse(mark, 201);

  } catch (error) {
    console.error('Add marks error:', error);
    return errorResponse(error, 'Failed to add marks');
  }
}

// PUT - Update marks
export async function PUT(request) {
  try {
    const body = await request.json();
    const { markId, score } = body;

    if (!markId || score === undefined) {
      return NextResponse.json(
        { success: false, error: 'Mark ID and score are required' },
        { status: 400 }
      );
    }

    if (!validateObjectId(markId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid mark ID format' },
        { status: 400 }
      );
    }

    const scoreCheck = validateScore(score);
    if (!scoreCheck.valid) {
      return NextResponse.json(
        { success: false, error: scoreCheck.error },
        { status: 400 }
      );
    }

    await connectDB();

    const mark = await Mark.findByIdAndUpdate(
      markId,
      { score },
      { new: true, runValidators: true }
    );

    if (!mark) {
      return NextResponse.json(
        { success: false, error: 'Mark not found' },
        { status: 404 }
      );
    }

    return successResponse(mark);

  } catch (error) {
    console.error('Update marks error:', error);
    return errorResponse(error, 'Failed to update marks');
  }
}
