'use client';

import { useState } from 'react';
import { login } from '@/lib/apiHelper';
import Toast from './Toast';

export default function LoginForm({ onLoginSuccess }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    const result = await login(formData.email, formData.password);
    setLoading(false);

    if (result.success) {
      localStorage.setItem('user', JSON.stringify(result.data));
      onLoginSuccess(result.data);
    } else {
      setError(result.error);
    }
  };

  return (
    <div>
      <h2 className="section-title">Sign In to Your Account</h2>
      <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '24px' }}>
        Enter your credentials to access your personalized dashboard and track your academic progress.
      </p>

      {error && (
        <Toast
          message={error}
          type="error"
          onClose={() => setError(null)}
        />
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="form-input"
            placeholder="your@email.com"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="form-input"
            placeholder="Enter your password"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-full"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="info-box">
        <p className="info-box-title">Demo Test Accounts</p>
        <div className="info-box-content">
          <p>Student: student@test.com / password123</p>
          <p>Teacher: teacher@test.com / password123</p>
        </div>
      </div>
    </div>
  );
}
