import { ObjectId } from 'mongodb';

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateObjectId(id) {
  return ObjectId.isValid(id);
}

export function validatePassword(password) {
  if (password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters' };
  }
  return { valid: true };
}

export function validateScore(score) {
  if (typeof score !== 'number') {
    return { valid: false, error: 'Score must be a number' };
  }
  if (score < 0 || score > 100) {
    return { valid: false, error: 'Score must be between 0 and 100' };
  }
  return { valid: true };
}

export function validateRole(role) {
  const validRoles = ['student', 'teacher'];
  if (!validRoles.includes(role)) {
    return { valid: false, error: 'Invalid role' };
  }
  return { valid: true };
}

export function validateRequiredFields(fields, requiredFields) {
  const missing = requiredFields.filter(field => !fields[field]);
  if (missing.length > 0) {
    return { 
      valid: false, 
      error: `Missing required fields: ${missing.join(', ')}` 
    };
  }
  return { valid: true };
}
