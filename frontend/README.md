# 🎨 Frontend - Student Learning Tracker

React/Next.js frontend application with comprehensive error handling.

## 📂 Project Structure

```
frontend/
├── app/
│   ├── page.js                   # Main page with routing
│   ├── layout.js                 # Root layout
│   └── globals.css               # Global styles
├── components/
│   ├── LoginForm.jsx             # Login form with validation
│   ├── RegisterForm.jsx          # Registration form
│   ├── StudentDashboard.jsx      # Student view
│   ├── TeacherDashboard.jsx      # Teacher view
│   └── Toast.jsx                 # Toast notifications
├── lib/
│   └── apiHelper.js              # API call utilities
├── .env.example                  # Environment variables template
├── package.json                  # Dependencies
└── README.md                     # This file
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Backend URL

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Important:** Make sure your backend is running on port 3000!

### 3. Run Development Server

```bash
npm run dev
```

Frontend will start at: **http://localhost:3001**

## 🔗 Connecting to Backend

The frontend expects the backend API to be running at the URL specified in `NEXT_PUBLIC_API_URL`.

### Local Development Setup

1. **Start Backend** (in backend directory):
   ```bash
   npm run dev
   ```
   Backend runs on: `http://localhost:3000`

2. **Start Frontend** (in frontend directory):
   ```bash
   npm run dev
   ```
   Frontend runs on: `http://localhost:3001`

3. **Access Application**:
   Open browser to: `http://localhost:3001`

### Production Setup

1. Deploy backend to Vercel/Railway/Render
2. Get backend URL (e.g., `https://your-api.vercel.app`)
3. Update frontend `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=https://your-api.vercel.app
   ```
4. Deploy frontend to Vercel

## 🎨 Components Overview

### LoginForm.jsx
- Email and password validation
- Client-side error checking
- Loading states
- Toast notifications
- Test account information

### RegisterForm.jsx
- Multi-field validation (name, email, password, role)
- Password strength checking
- Email format validation
- Success/error feedback
- Auto-switch to login on success

### StudentDashboard.jsx
- View enrolled courses
- Display grades and scores
- Performance visualization
- Progress bars
- Statistics (average, highest score)
- Grade calculation (A, B, C, D, F)

### TeacherDashboard.jsx
- Add new courses
- View all courses
- Assign marks to students
- Course management
- Form validation

### Toast.jsx
- Reusable notification component
- Auto-dismiss after 5 seconds
- Multiple types (error, success, warning, info)
- Smooth animations
- Manual dismiss option

## 📡 API Integration

All API calls go through `lib/apiHelper.js` for:
- Centralized error handling
- Consistent response format
- Loading state management
- Network error catching

### Available API Functions

```javascript
// Authentication
login(email, password)
register({ name, email, password, role })

// Courses
getCourses(teacherId?)
createCourse(title, teacherId)

// Marks
getMarks(studentId?, courseId?)
addMark(studentId, courseId, score)
updateMark(markId, score)
```

### Example Usage

```javascript
import { login, getCourses } from '@/lib/apiHelper';

// Login
const result = await login('student@test.com', 'password123');
if (result.success) {
  console.log('User:', result.data);
} else {
  console.error('Error:', result.error);
}

// Get courses
const courses = await getCourses();
if (courses.success) {
  console.log('Courses:', courses.data);
}
```

## 🛡️ Error Handling

### Client-Side Validation

**Before API Call:**
- Email format checking
- Required fields validation
- Password length validation
- Score range validation (0-100)
- Input sanitization

**User Feedback:**
- Toast notifications for all errors
- Inline form validation
- Loading states during API calls
- Clear error messages

### Error Types Handled

| Error Type | Handling |
|------------|----------|
| Network Error | "Network error. Please check your connection." |
| 400 Bad Request | Display validation error from API |
| 401 Unauthorized | "Invalid email or password" |
| 409 Conflict | "Email already registered" |
| 500 Server Error | "Something went wrong. Please try again." |

### Error Display

All errors are shown using the Toast component:
```jsx
<Toast 
  message="Error message here" 
  type="error" 
  onClose={() => setError(null)} 
/>
```

Types: `error`, `success`, `warning`, `info`

## 🎯 User Flows

### Student Flow
1. Login with credentials
2. View dashboard with courses and grades
3. See performance visualization
4. Check statistics
5. Logout

### Teacher Flow
1. Login with credentials
2. Add new courses
3. View all courses
4. Assign marks to students
5. Logout

### Registration Flow
1. Fill registration form
2. Choose role (student/teacher)
3. Submit and validate
4. Get success message
5. Redirect to login

## 🎨 Styling

- **Framework:** Tailwind CSS
- **Color Scheme:** Blue/Indigo gradient
- **Components:** Fully responsive
- **Animations:** Smooth transitions

### Key Classes

```css
/* Gradient Background */
bg-gradient-to-br from-blue-50 to-indigo-100

/* Card Style */
bg-white rounded-2xl shadow-xl p-8

/* Button Styles */
bg-blue-600 hover:bg-blue-700 text-white rounded-lg

/* Toast Animation */
animate-slide-in
```

## 📱 Responsive Design

The application is fully responsive:
- **Mobile:** Single column layout
- **Tablet:** Two column layouts
- **Desktop:** Multi-column with optimal spacing

Breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## 🔒 Security Features

✅ **Client-Side Security**
- Input validation before API calls
- XSS prevention (React automatic escaping)
- No sensitive data in localStorage (only user ID and role)
- HTTPS enforcement in production

✅ **Best Practices**
- No hardcoded credentials
- Environment variables for API URLs
- Proper error handling
- Loading states to prevent double submissions

## 🧪 Testing

### Manual Testing Checklist

**Login:**
- [ ] Valid credentials
- [ ] Invalid email format
- [ ] Wrong password
- [ ] Empty fields
- [ ] Network error simulation

**Registration:**
- [ ] All valid fields
- [ ] Duplicate email
- [ ] Short password (< 6 chars)
- [ ] Invalid email format
- [ ] Missing fields
- [ ] Invalid role

**Student Dashboard:**
- [ ] Load courses successfully
- [ ] Handle empty state
- [ ] Display correct grades
- [ ] Show statistics correctly

**Teacher Dashboard:**
- [ ] Add course successfully
- [ ] Title validation (< 3 chars)
- [ ] Load courses
- [ ] Assign marks validation

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL`: Your backend URL
4. Deploy

### Manual Build

```bash
npm run build
npm start
```

## 🔧 Configuration Files

### tailwind.config.js
```javascript
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
```

## 💡 Development Tips

### Hot Reload
Changes to components trigger automatic reload.

### Debugging
- Use React DevTools
- Check browser console for errors
- Network tab for API calls
- Component props inspection

### Code Organization
- Keep components small and focused
- Extract reusable logic to utilities
- Use meaningful component and variable names
- Comment complex logic

## 📞 Common Issues

### Backend Connection Failed
**Problem:** "Network error. Please check your connection."
**Solution:** 
1. Make sure backend is running on port 3000
2. Check `NEXT_PUBLIC_API_URL` in `.env.local`
3. Verify backend is accessible

### CORS Errors
**Problem:** CORS policy blocking requests
**Solution:** Backend needs to allow frontend origin (already configured in backend middleware)

### Build Errors
**Problem:** Module not found errors
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

---

**Built with React, Next.js, and Tailwind CSS** 🎨
