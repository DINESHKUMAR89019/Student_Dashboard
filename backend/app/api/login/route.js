import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { validateEmail } from '@/lib/validators';
import { errorResponse, successResponse } from '@/lib/errorHandler';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // INPUT VALIDATION
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email and password are required' 
        },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid email format' 
        },
        { status: 400 }
      );
    }

    // DATABASE CONNECTION
    await connectDB();

    // USER LOOKUP
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid email or password' 
        },
        { status: 401 }
      );
    }

    // PASSWORD VERIFICATION
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid email or password' 
        },
        { status: 401 }
      );
    }

    // SUCCESS RESPONSE
    return successResponse({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });

  } catch (error) {
    console.error('Login error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    return errorResponse(error, 'An error occurred during login. Please try again.');
  }
}
