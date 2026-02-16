# 🎓 Student Learning Tracker - Complete Project

Full-stack application with **separated frontend and backend** + comprehensive error handling.

## 📦 Project Structure

```
student-learning-tracker/
├── backend/                      # Next.js API Backend
│   ├── app/api/                 # API routes
│   ├── lib/                     # Utilities (MongoDB, validators, error handler)
│   ├── models/                  # Mongoose schemas
│   └── README.md                # Backend documentation
│
├── frontend/                     # Next.js React Frontend
│   ├── app/                     # Pages and layouts
│   ├── components/              # React components
│   ├── lib/                     # API helper
│   └── README.md                # Frontend documentation
│
└── README.md                     # This file
```

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (free tier) OR local MongoDB
- Two terminal windows

### Step 1: Setup Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local and add your MongoDB URI
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/student-tracker

# Start backend server
npm run dev
```

Backend will run on: **http://localhost:3000**

### Step 2: Setup Frontend

Open a **new terminal window**:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local (backend URL already set to localhost:3000)

# Start frontend server
npm run dev
```

Frontend will run on: **http://localhost:3001**

### Step 3: Access Application

Open your browser to: **http://localhost:3001**

**Test Accounts:**
- Student: `student@test.com` / `password123`
- Teacher: `teacher@test.com` / `password123`

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Port 3001)                  │
│                   React/Next.js Frontend                │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ HTTP Requests (fetch API)
                        │
┌───────────────────────▼─────────────────────────────────┐
│                  Backend API (Port 3000)                │
│                   Next.js API Routes                    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  /api/login    /api/register                    │  │
│  │  /api/courses  /api/marks                       │  │
│  └─────────────────────┬───────────────────────────┘  │
│                        │                               │
│  ┌─────────────────────▼───────────────────────────┐  │
│  │  Error Handler + Validators                     │  │
│  └─────────────────────┬───────────────────────────┘  │
└────────────────────────┼───────────────────────────────┘
                         │
                         │ Mongoose ODM
                         │
┌────────────────────────▼───────────────────────────────┐
│                    MongoDB Atlas                       │
│                  (Cloud Database)                      │
│                                                        │
│  Collections: users, courses, marks                   │
└────────────────────────────────────────────────────────┘
```

## 📋 Features

### 🔐 Authentication
- Login with email/password
- Register new users (student or teacher)
- Role-based access control
- Password hashing with bcrypt
- Session management with localStorage

### 👨‍🎓 Student Features
- View enrolled courses
- See grades and scores
- Performance visualization with charts
- Statistics (average, highest score)
- Grade calculation (A-F)

### 👨‍🏫 Teacher Features
- Add new courses
- View all courses
- Assign marks to students
- Course management

### 🛡️ Error Handling
- Client-side validation
- Server-side validation
- Database error handling
- Network error handling
- User-friendly error messages
- Toast notifications
- Comprehensive logging

## 🔍 API Endpoints

### Authentication
- `POST /api/login` - Login user
- `POST /api/register` - Register new user

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses?teacherId={id}` - Get teacher's courses
- `POST /api/courses` - Create new course

### Marks
- `GET /api/marks` - Get all marks
- `GET /api/marks?studentId={id}` - Get student marks
- `GET /api/marks?courseId={id}` - Get course marks
- `POST /api/marks` - Add new mark
- `PUT /api/marks` - Update existing mark

## 🛡️ Error Handling Features

### Three-Layer Validation

1. **Frontend Validation**
   - Email format
   - Password length
   - Required fields
   - Real-time feedback

2. **API Validation**
   - Request body parsing
   - Data type checking
   - Business logic validation
   - ObjectId validation

3. **Database Validation**
   - Schema constraints
   - Unique indexes
   - Data integrity
   - Relationship validation

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation errors |
| 401 | Unauthorized | Wrong credentials |
| 409 | Conflict | Duplicate entry |
| 500 | Server Error | Internal errors |

### Error Response Format

```json
{
  "success": false,
  "error": "User-friendly error message"
}
```

## 🎨 Tech Stack

### Frontend
- **Framework:** Next.js 14 (React)
- **Styling:** Tailwind CSS
- **HTTP Client:** Fetch API
- **State Management:** React Hooks
- **Storage:** localStorage

### Backend
- **Framework:** Next.js 14 API Routes
- **Database:** MongoDB with Mongoose
- **Authentication:** bcryptjs
- **Validation:** Custom validators

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String (2-50 chars),
  email: String (unique, lowercase),
  password: String (hashed),
  role: "student" | "teacher",
  createdAt: Date,
  updatedAt: Date
}
```

### Courses Collection
```javascript
{
  _id: ObjectId,
  title: String (3-100 chars),
  teacherId: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Marks Collection
```javascript
{
  _id: ObjectId,
  studentId: ObjectId (ref: User),
  courseId: ObjectId (ref: Course),
  score: Number (0-100),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- users: unique on `email`
- marks: compound unique on `(studentId, courseId)`

## 🧪 Testing

### Manual Testing

**Backend API Testing (with cURL):**
```bash
# Test login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@test.com","password":"password123"}'

# Test registration
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"password123","role":"student"}'
```

**Frontend Testing:**
1. Open http://localhost:3001
2. Try logging in with wrong password
3. Try registering with duplicate email
4. Try submitting forms with missing fields
5. Check toast notifications appear
6. Verify dashboard loads correctly

### Error Scenarios to Test

- [ ] Wrong login credentials (401)
- [ ] Duplicate email registration (409)
- [ ] Short password (400)
- [ ] Invalid email format (400)
- [ ] Missing required fields (400)
- [ ] Invalid ObjectId format (400)
- [ ] Score out of range (400)
- [ ] Duplicate mark entry (409)
- [ ] Network disconnection (simulate offline)

## 🚀 Deployment

### Option 1: Separate Deployment (Recommended)

**Backend (Vercel):**
1. Push backend code to GitHub
2. Import in Vercel
3. Add environment variable: `MONGODB_URI`
4. Deploy
5. Note the backend URL (e.g., `https://api.vercel.app`)

**Frontend (Vercel):**
1. Push frontend code to GitHub
2. Import in Vercel
3. Add environment variable: `NEXT_PUBLIC_API_URL=https://api.vercel.app`
4. Deploy

### Option 2: Combined Deployment

You can also combine both in a monorepo structure if preferred.

## 📁 File Organization

### Backend Key Files
```
backend/
├── app/api/
│   ├── login/route.js       # Login endpoint
│   ├── register/route.js    # Registration endpoint
│   ├── courses/route.js     # Courses CRUD
│   └── marks/route.js       # Marks CRUD
├── lib/
│   ├── mongodb.js           # DB connection
│   ├── errorHandler.js      # Error utilities
│   └── validators.js        # Input validators
└── models/
    ├── User.js              # User schema
    ├── Course.js            # Course schema
    └── Mark.js              # Mark schema
```

### Frontend Key Files
```
frontend/
├── app/
│   ├── page.js              # Main page
│   └── layout.js            # Root layout
├── components/
│   ├── LoginForm.jsx        # Login UI
│   ├── RegisterForm.jsx     # Register UI
│   ├── StudentDashboard.jsx # Student view
│   ├── TeacherDashboard.jsx # Teacher view
│   └── Toast.jsx            # Notifications
└── lib/
    └── apiHelper.js         # API utilities
```

## 💡 Interview Talking Points

### Why Separate Frontend and Backend?

1. **Scalability:** Can scale independently
2. **Deployment:** Deploy to different servers/CDNs
3. **Team Organization:** Different teams can work independently
4. **Technology Flexibility:** Can swap frontend framework without touching backend
5. **Security:** Backend API can be locked down separately

### Error Handling Strategy

1. **Three-layer validation** prevents bad data at every level
2. **Consistent response format** makes frontend handling predictable
3. **User-friendly messages** improve UX
4. **Security-first** approach doesn't expose sensitive info
5. **Comprehensive logging** helps debugging

### Technology Choices

1. **Next.js:** Full-stack framework, great DX, easy deployment
2. **MongoDB:** Flexible schema, great for rapid development
3. **Tailwind CSS:** Rapid UI development, consistent design
4. **Mongoose:** Schema validation, relationship management

## 🔒 Security Features

✅ **Implemented:**
- Password hashing (bcrypt)
- Input validation and sanitization
- Generic error messages for security
- No sensitive data in responses
- ObjectId validation
- CORS configuration ready

🔄 **Production Recommendations:**
- Add JWT authentication
- Implement rate limiting
- Add HTTPS enforcement
- Set up monitoring (Sentry)
- Add API key authentication
- Implement refresh tokens

## 📚 Documentation

- **Backend:** See `backend/README.md`
- **Frontend:** See `frontend/README.md`
- **API Documentation:** In backend README
- **Component Documentation:** In frontend README

## 🆘 Common Issues

### MongoDB Connection Failed
**Solution:** Check MongoDB URI in backend `.env.local`

### CORS Errors
**Solution:** Backend allows all origins by default. For production, configure specific origins.

### Frontend Can't Connect to Backend
**Solution:** Verify `NEXT_PUBLIC_API_URL` in frontend `.env.local`

### Port Already in Use
**Solution:** 
```bash
# Kill process on port 3000
kill -9 $(lsof -t -i:3000)

# Or use different port
npm run dev -- -p 3002
```

## 📝 License

MIT License - Free to use for learning and portfolio projects!

## 🎉 Ready for Interviews!

This project demonstrates:
- ✅ Full-stack development
- ✅ Error handling best practices
- ✅ Clean code organization
- ✅ Security awareness
- ✅ User experience focus
- ✅ Production-ready architecture
- ✅ Comprehensive documentation

---

**Built with ❤️ using Next.js, MongoDB, React, and Tailwind CSS**

For questions or issues, refer to individual README files in backend/ and frontend/ directories.
#   S t u d e n t _ D a s h b o a r d  
 #   S t u d e n t _ D a s h b o a r d  
 