'use client';

import { useState, useEffect } from 'react';
import { getCourses, createCourse, addMark, lookupStudent, getMarks } from '@/lib/apiHelper';
import Toast from './Toast';

export default function TeacherDashboard({ user }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [assignedMarks, setAssignedMarks] = useState([]);

  const [courseTitle, setCourseTitle] = useState('');
  const [markForm, setMarkForm] = useState({
    studentEmail: '',
    courseId: '',
    score: ''
  });
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadCourses();
  }, [user]);

  const loadCourses = async () => {
    setLoading(true);
    const result = await getCourses(user.id);
    setLoading(false);

    if (result.success) {
      setCourses(result.data);
    } else {
      setError(result.error);
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();

    if (!courseTitle || courseTitle.length < 3) {
      setError('Course title must be at least 3 characters');
      return;
    }

    const result = await createCourse(courseTitle, user.id);

    if (result.success) {
      setSuccess('Course added successfully!');
      setCourseTitle('');
      loadCourses();
    } else {
      setError(result.error);
    }
  };

  const handleAddMark = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!markForm.studentEmail || !markForm.courseId || !markForm.score) {
      setError('Please fill in all fields');
      return;
    }

    const score = parseInt(markForm.score);
    if (isNaN(score) || score < 0 || score > 100) {
      setError('Score must be between 0 and 100');
      return;
    }

    setAssigning(true);

    // Step 1: Look up student by email
    const studentResult = await lookupStudent(markForm.studentEmail);

    if (!studentResult.success) {
      setAssigning(false);
      setError(studentResult.error || 'Student not found with this email');
      return;
    }

    const studentId = studentResult.data.id;

    // Step 2: Assign the mark
    const markResult = await addMark(studentId, markForm.courseId, score);
    setAssigning(false);

    if (markResult.success) {
      setSuccess(`Mark assigned successfully to ${studentResult.data.name}!`);
      setMarkForm({ studentEmail: '', courseId: '', score: '' });
    } else {
      setError(markResult.error);
    }
  };

  return (
    <div>
      {error && (
        <Toast
          message={error}
          type="error"
          onClose={() => setError(null)}
        />
      )}

      {success && (
        <Toast
          message={success}
          type="success"
          onClose={() => setSuccess(null)}
        />
      )}

      {/* Welcome Banner */}
      <div className="card">
        <h2 className="section-title-lg">Teacher Dashboard</h2>
        <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
          Welcome, {user.name}. Manage your courses, add new subjects, and assign marks to students from this dashboard.
        </p>
      </div>

      {/* Add Course Section */}
      <div className="card">
        <h2 className="section-title-lg">Add New Course</h2>
        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '20px' }}>
          Create a new course to start tracking student performance. Enter the course title below.
        </p>
        <form onSubmit={handleAddCourse} className="form-row">
          <input
            type="text"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            className="form-input"
            placeholder="Enter course title (e.g., Web Development)"
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-purple">
            Add Course
          </button>
        </form>
      </div>

      {/* Courses List */}
      <div className="card">
        <h2 className="section-title-lg">My Courses</h2>
        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '20px' }}>
          All courses you have created are listed below. Select a course when assigning marks to students.
        </p>

        {loading ? (
          <div className="loading-text">Loading your courses...</div>
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-title">No courses created yet</p>
            <p className="empty-state-text">
              Use the form above to add your first course and start tracking student performance.
            </p>
          </div>
        ) : (
          <div className="course-grid">
            {courses.map((course) => (
              <div key={course._id} className="course-card">
                <h3>{course.title}</h3>
                <p className="course-card-id">Course ID: {course._id}</p>
                <p className="course-card-date">
                  Created: {new Date(course.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign Marks Section */}
      <div className="card">
        <h2 className="section-title-lg">Assign Marks to Students</h2>
        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '20px' }}>
          Enter the student's registered email address, select a course, and assign a score between 0 and 100.
          The student will be automatically looked up by their email.
        </p>
        <form onSubmit={handleAddMark} className="marks-form-grid">
          <div>
            <label className="form-label">Student Email</label>
            <input
              type="email"
              value={markForm.studentEmail}
              onChange={(e) => setMarkForm({ ...markForm, studentEmail: e.target.value })}
              className="form-input"
              placeholder="student@example.com"
              disabled={assigning}
            />
          </div>
          <div>
            <label className="form-label">Course</label>
            <select
              value={markForm.courseId}
              onChange={(e) => setMarkForm({ ...markForm, courseId: e.target.value })}
              className="form-select"
              disabled={assigning}
            >
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Score</label>
            <input
              type="number"
              value={markForm.score}
              onChange={(e) => setMarkForm({ ...markForm, score: e.target.value })}
              className="form-input"
              placeholder="0-100"
              min="0"
              max="100"
              disabled={assigning}
            />
          </div>
          <div>
            <button
              type="submit"
              className="btn btn-orange"
              style={{ marginTop: '24px' }}
              disabled={assigning}
            >
              {assigning ? 'Assigning...' : 'Assign Mark'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
