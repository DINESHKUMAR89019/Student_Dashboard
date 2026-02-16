// API Base URL - Update this for production
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Centralized API call handler with error handling
export async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong');
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    return {
      success: false,
      error: error.message || 'Network error. Please check your connection.'
    };
  }
}

// Authentication APIs
export async function login(email, password) {
  return apiCall('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(userData) {
  return apiCall('/api/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

// Course APIs
export async function getCourses(teacherId = null) {
  const query = teacherId ? `?teacherId=${teacherId}` : '';
  return apiCall(`/api/courses${query}`);
}

export async function createCourse(title, teacherId) {
  return apiCall('/api/courses', {
    method: 'POST',
    body: JSON.stringify({ title, teacherId }),
  });
}

// Marks APIs
export async function getMarks(studentId = null, courseId = null) {
  const params = new URLSearchParams();
  if (studentId) params.append('studentId', studentId);
  if (courseId) params.append('courseId', courseId);

  const query = params.toString() ? `?${params.toString()}` : '';
  return apiCall(`/api/marks${query}`);
}

export async function addMark(studentId, courseId, score) {
  return apiCall('/api/marks', {
    method: 'POST',
    body: JSON.stringify({ studentId, courseId, score }),
  });
}

export async function updateMark(markId, score) {
  return apiCall('/api/marks', {
    method: 'PUT',
    body: JSON.stringify({ markId, score }),
  });
}

// Student Lookup API
export async function lookupStudent(email) {
  return apiCall(`/api/students?email=${encodeURIComponent(email)}`);
}

// Seed Database API
export async function seedDatabase() {
  return apiCall('/api/seed', {
    method: 'POST',
  });
}
