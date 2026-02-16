import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { validateEmail, validatePassword, validateRole, validateRequiredFields } from '@/lib/validators';
import { errorResponse, successResponse } from '@/lib/errorHandler';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    // REQUIRED FIELDS VALIDATION
    const requiredCheck = validateRequiredFields(
      { name, email, password, role },
      ['name', 'email', 'password', 'role']
    );
    
    if (!requiredCheck.valid) {
      return NextResponse.json(
        { success: false, error: requiredCheck.error },
        { status: 400 }
      );
    }

    // EMAIL VALIDATION
    if (!validateEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // PASSWORD VALIDATION
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        { success: false, error: passwordCheck.error },
        { status: 400 }
      );
    }

    // ROLE VALIDATION
    const roleCheck = validateRole(role);
    if (!roleCheck.valid) {
      return NextResponse.json(
        { success: false, error: roleCheck.error },
        { status: 400 }
      );
    }

    // DATABASE CONNECTION
    await connectDB();

    // CHECK EXISTING USER
    const existingUser = await User.findOne({ 
      email: email.toLowerCase() 
    });
    
    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email already registered' 
        },
        { status: 409 }
      );
    }

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // CREATE USER
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role
    });

    // SUCCESS RESPONSE
    return successResponse({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }, 201);

  } catch (error) {
    console.error('Registration error:', {
      message: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    });

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 409 }
      );
    }

    return errorResponse(error, 'Registration failed. Please try again.');
  }
}
