# 🔧 Backend - Student Learning Tracker API

Complete Next.js API with MongoDB and comprehensive error handling.

## 📂 Project Structure

```
backend/
├── app/
│   └── api/
│       ├── login/
│       │   └── route.js          # POST /api/login
│       ├── register/
│       │   └── route.js          # POST /api/register
│       ├── courses/
│       │   └── route.js          # GET, POST /api/courses
│       └── marks/
│           └── route.js          # GET, POST, PUT /api/marks
├── lib/
│   ├── mongodb.js                # Database connection with error handling
│   ├── errorHandler.js           # Centralized error response handler
│   └── validators.js             # Input validation utilities
├── models/
│   ├── User.js                   # User schema (student/teacher)
│   ├── Course.js                 # Course schema
│   └── Mark.js                   # Mark schema with constraints
├── .env.example                  # Environment variables template
├── package.json                  # Dependencies
└── README.md                     # This file
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Create `.env.local` file:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/student-tracker?retryWrites=true&w=majority
```

### 3. Run Development Server

```bash
npm run dev
```

Server will start at: **http://localhost:3000**

## 📋 API Endpoints

### Authentication

#### POST /api/login
Login with email and password.

**Request:**
```json
{
  "email": "student@test.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Student",
    "email": "student@test.com",
    "role": "student"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

#### POST /api/register
Register a new user (student or teacher).

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

**Error Responses:**
- 400: Validation error (missing fields, weak password, invalid email)
- 409: Email already registered

---

### Courses

#### GET /api/courses
Fetch all courses or filter by teacher.

**Query Parameters:**
- `teacherId` (optional): Filter courses by teacher ID

**Example:**
```
GET /api/courses?teacherId=507f1f77bcf86cd799439012
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Web Development",
      "teacherId": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Jane Teacher",
        "email": "teacher@test.com"
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

#### POST /api/courses
Create a new course (teacher only).

**Request:**
```json
{
  "title": "Web Development",
  "teacherId": "507f1f77bcf86cd799439012"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Web Development",
    "teacherId": "507f1f77bcf86cd799439012",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- 400: Missing title/teacherId, invalid teacherId format, title too short

---

### Marks

#### GET /api/marks
Fetch marks with optional filters.

**Query Parameters:**
- `studentId` (optional): Filter by student
- `courseId` (optional): Filter by course

**Example:**
```
GET /api/marks?studentId=507f1f77bcf86cd799439011
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "studentId": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Student",
        "email": "student@test.com"
      },
      "courseId": {
        "_id": "507f1f77bcf86cd799439014",
        "title": "Web Development"
      },
      "score": 85,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

#### POST /api/marks
Assign marks to a student for a course.

**Request:**
```json
{
  "studentId": "507f1f77bcf86cd799439011",
  "courseId": "507f1f77bcf86cd799439014",
  "score": 85
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "studentId": "507f1f77bcf86cd799439011",
    "courseId": "507f1f77bcf86cd799439014",
    "score": 85,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- 400: Missing fields, invalid IDs, score out of range (0-100)
- 409: Mark already exists for this student-course combination

#### PUT /api/marks
Update an existing mark.

**Request:**
```json
{
  "markId": "507f1f77bcf86cd799439013",
  "score": 90
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "score": 90,
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

**Error Responses:**
- 400: Invalid markId format, score out of range
- 404: Mark not found

---

## 🛡️ Error Handling

### HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation errors, invalid input |
| 401 | Unauthorized | Wrong credentials |
| 403 | Forbidden | Access denied |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate entry (email, mark) |
| 500 | Server Error | Database/server issues |

### Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "error": "User-friendly error message"
}
```

### Common Error Scenarios

**Validation Errors (400):**
- Missing required fields
- Invalid email format
- Password too short (< 6 characters)
- Invalid ObjectId format
- Score out of range (0-100)
- Invalid role (not student/teacher)

**Authentication Errors (401):**
- Wrong email or password
- User not found

**Conflict Errors (409):**
- Email already registered
- Mark already exists for student-course pair

**Server Errors (500):**
- Database connection failed
- Unexpected server error

---

## 🔒 Security Features

✅ **Password Security**
- Passwords hashed with bcrypt (10 rounds)
- Never stored in plain text
- Never returned in API responses

✅ **Input Validation**
- Email format validation
- Password strength requirements
- ObjectId format validation
- Score range validation (0-100)
- Required fields checking

✅ **Error Messages**
- Generic messages for authentication (don't reveal if email exists)
- No sensitive data in error responses
- Detailed errors logged server-side only

✅ **Database Security**
- MongoDB injection prevention
- Parameterized queries
- Schema validation
- Unique constraints

---

## 📦 MongoDB Collections

### users
```javascript
{
  _id: ObjectId,
  name: "John Student",
  email: "john@test.com",
  password: "hashed_password",
  role: "student" | "teacher",
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### courses
```javascript
{
  _id: ObjectId,
  title: "Web Development",
  teacherId: ObjectId,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### marks
```javascript
{
  _id: ObjectId,
  studentId: ObjectId,
  courseId: ObjectId,
  score: 85,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Indexes:**
- users: unique index on `email`
- marks: compound unique index on `(studentId, courseId)`

---

## 🧪 Testing with cURL

### Login Test
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@test.com","password":"password123"}'
```

### Register Test
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","role":"student"}'
```

### Create Course Test
```bash
curl -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -d '{"title":"Web Development","teacherId":"507f1f77bcf86cd799439012"}'
```

### Get Courses Test
```bash
curl http://localhost:3000/api/courses
```

### Add Mark Test
```bash
curl -X POST http://localhost:3000/api/marks \
  -H "Content-Type: application/json" \
  -d '{"studentId":"507f1f77bcf86cd799439011","courseId":"507f1f77bcf86cd799439014","score":85}'
```

### Get Marks Test
```bash
curl "http://localhost:3000/api/marks?studentId=507f1f77bcf86cd799439011"
```

---

## 🌐 CORS Configuration (Optional)

If you need to allow requests from a separate frontend:

Create `middleware.js` in the root:

```javascript
import { NextResponse } from 'next/server';

export function middleware(request) {
  const response = NextResponse.next();
  
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variable:
   - `MONGODB_URI`: Your MongoDB connection string
4. Deploy

### Environment Variables

Required:
- `MONGODB_URI`: MongoDB connection string

Optional:
- `NODE_ENV`: production/development
- `DEBUG`: Enable detailed logging

---

## 📊 Database Setup (MongoDB Atlas)

1. Create free cluster at [mongodb.com](https://www.mongodb.com/cloud/atlas)
2. Create database user
3. Whitelist IP (0.0.0.0/0 for development)
4. Get connection string
5. Add to `.env.local`

---

## 🔧 Development Tips

### Hot Reload
Changes to API routes trigger automatic reload.

### Debugging
- Check terminal for server-side logs
- Use `console.log()` in route handlers
- MongoDB errors show in console

### Testing
- Use Postman or cURL for API testing
- Check MongoDB Atlas for data verification

---

## 📚 Key Files Explained

### lib/mongodb.js
- Handles database connection
- Connection pooling (reuses connections)
- Automatic reconnection
- Error handling

### lib/errorHandler.js
- Centralized error handling
- Status code mapping
- Secure error messages
- Logging

### lib/validators.js
- Input validation functions
- Reusable validators
- Clear error messages

### models/
- Mongoose schemas
- Built-in validation
- Relationships between collections

---

## 💡 Best Practices

✅ **Always validate input** at API level
✅ **Use try-catch** in all async operations
✅ **Return appropriate status codes**
✅ **Log errors** with context
✅ **Never expose sensitive data** in errors
✅ **Hash passwords** before storing
✅ **Validate ObjectIds** before queries
✅ **Use indexes** for frequently queried fields

---

## 📞 Support

For issues or questions:
1. Check error logs in terminal
2. Verify MongoDB connection
3. Test with cURL commands
4. Review API documentation above

---

**Built with Next.js 14, MongoDB, and Mongoose** 🚀
