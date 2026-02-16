'use client';

import { useState } from 'react';
import { register } from '@/lib/apiHelper';
import Toast from './Toast';

export default function RegisterForm({ onRegisterSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!formData.name || !formData.email || !formData.password || !formData.role) {
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

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const result = await register(formData);
    setLoading(false);

    if (result.success) {
      setSuccess('Registration successful! Redirecting to sign in...');
      setFormData({ name: '', email: '', password: '', role: '' });
      if (onRegisterSuccess) {
        setTimeout(() => onRegisterSuccess(), 2000);
      }
    } else {
      setError(result.error);
    }
  };

  return (
    <div>
      <h2 className="section-title">Create a New Account</h2>
      <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '24px' }}>
        Join the platform to start tracking academic performance. Choose your role as a student or teacher.
      </p>

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

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="form-input"
            placeholder="Enter your full name"
            disabled={loading}
          />
        </div>

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
            placeholder="Minimum 6 characters"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Account Role</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="form-select"
            disabled={loading}
          >
            <option value="">Select your role</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-success btn-full"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}
