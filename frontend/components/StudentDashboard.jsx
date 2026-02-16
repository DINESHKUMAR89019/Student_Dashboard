'use client';

import { useState, useEffect } from 'react';
import { getMarks } from '@/lib/apiHelper';
import Toast from './Toast';

export default function StudentDashboard({ user }) {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMarks();
  }, [user]);

  const loadMarks = async () => {
    setLoading(true);
    const result = await getMarks(user.id);
    setLoading(false);

    if (result.success) {
      setMarks(result.data);
    } else {
      setError(result.error);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'score-green';
    if (score >= 75) return 'score-blue';
    if (score >= 60) return 'score-yellow';
    return 'score-red';
  };

  const getProgressColor = (score) => {
    if (score >= 90) return 'progress-green';
    if (score >= 75) return 'progress-blue';
    if (score >= 60) return 'progress-yellow';
    return 'progress-red';
  };

  const getGrade = (score) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const getGradeDescription = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Satisfactory';
    return 'Needs Improvement';
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

      {/* Welcome Banner */}
      <div className="card">
        <h2 className="section-title-lg">Welcome back, {user.name}</h2>
        <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
          Here is an overview of your enrolled courses, grades, and overall academic performance.
        </p>
      </div>

      {/* Courses and Grades */}
      <div className="card">
        <h2 className="section-title-lg">My Courses and Grades</h2>

        {loading ? (
          <div className="loading-text">Loading your courses and grades...</div>
        ) : marks.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-title">No grades available yet</p>
            <p className="empty-state-text">
              Your grades will appear here once your teacher has assigned them.
              Check back later or contact your teacher for more information.
            </p>
          </div>
        ) : (
          <div>
            {marks.map((mark) => (
              <div key={mark._id} className="mark-item">
                <div className="mark-item-info">
                  <h3>{mark.courseId?.title || 'Course'}</h3>
                  <p className="mark-item-grade">
                    Grade: <strong className={getScoreColor(mark.score)}>
                      {getGrade(mark.score)}
                    </strong>
                    {' — '}
                    <span style={{ fontStyle: 'italic' }}>
                      {getGradeDescription(mark.score)}
                    </span>
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className={`mark-score ${getScoreColor(mark.score)}`}>
                    {mark.score}
                  </div>
                  <div className="mark-score-label">out of 100</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Performance Overview */}
      {marks.length > 0 && (
        <div className="card">
          <h2 className="section-title-lg">Performance Overview</h2>
          <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '24px' }}>
            Visual representation of your scores across all enrolled courses.
          </p>

          <div>
            {marks.map((mark) => {
              const percentage = mark.score;
              return (
                <div key={mark._id} className="progress-item">
                  <div className="progress-header">
                    <span className="progress-label">
                      {mark.courseId?.title || 'Course'}
                    </span>
                    <span className="progress-value">{mark.score}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${getProgressColor(percentage)}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Statistics */}
          <div className="stats-grid">
            <div className="stat-card stat-card-blue">
              <div className="stat-value stat-value-blue">
                {marks.length}
              </div>
              <div className="stat-label stat-label-blue">Total Courses</div>
            </div>
            <div className="stat-card stat-card-green">
              <div className="stat-value stat-value-green">
                {(marks.reduce((sum, m) => sum + m.score, 0) / marks.length).toFixed(1)}
              </div>
              <div className="stat-label stat-label-green">Average Score</div>
            </div>
            <div className="stat-card stat-card-purple">
              <div className="stat-value stat-value-purple">
                {Math.max(...marks.map(m => m.score))}
              </div>
              <div className="stat-label stat-label-purple">Highest Score</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
