'use client';

import { useState, useEffect } from 'react';
import LoginForm from '@/components/LoginForm';
import RegisterForm from '@/components/RegisterForm';
import StudentDashboard from '@/components/StudentDashboard';
import TeacherDashboard from '@/components/TeacherDashboard';

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('login');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
    setActiveTab('login');
  };

  return (
    <div className="page-wrapper">
      <div className="container">

        {/* Header */}
        <div className="card">
          <div className="header">
            <div>
              <h1 className="header-title">Student Learning Tracker</h1>
              <p className="header-subtitle">
                Monitor academic performance, track course progress, and manage grades seamlessly
              </p>
            </div>
            {currentUser && (
              <div className="header-right">
                <p className="header-user-label">Logged in as</p>
                <p className="header-user-name">{currentUser.name}</p>
                <span className="role-badge">
                  {currentUser.role.toUpperCase()}
                </span>
                <button onClick={handleLogout} className="btn btn-danger">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        {!currentUser ? (
          <div className="card">
            {/* Tabs */}
            <div className="tabs">
              <button
                onClick={() => setActiveTab('login')}
                className={`tab ${activeTab === 'login' ? 'active-login' : ''}`}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`tab ${activeTab === 'register' ? 'active-register' : ''}`}
              >
                Create Account
              </button>
            </div>

            {/* Forms */}
            <div className="auth-wrapper">
              {activeTab === 'login' ? (
                <LoginForm onLoginSuccess={handleLoginSuccess} />
              ) : (
                <RegisterForm onRegisterSuccess={() => setActiveTab('login')} />
              )}
            </div>
          </div>
        ) : (
          <>
            {currentUser.role === 'student' ? (
              <StudentDashboard user={currentUser} />
            ) : (
              <TeacherDashboard user={currentUser} />
            )}
          </>
        )}

        {/* Footer */}
        <div className="footer">
          <p>Built with Next.js, MongoDB, and modern web technologies</p>
          <p className="copyright">
            &copy; 2024 Student Learning Tracker. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
