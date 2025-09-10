// public/js/auth-utils.js
// Lightweight client-side validation helpers for auth pages.
// Exposes window.authUtils = { validateField, checkPasswordStrength }

(function () {
  'use strict';

  /**
   * Validates a form field based on its name and value.
   * @param {string} name - The name of the field (e.g., 'username', 'password').
   * @param {string} value - The value of the field.
   * @returns {{valid: boolean, message: string}} - An object with validation status and an error message.
   */
  function validateField(name, value) {
    const trimmed = (value || '').trim();
    switch (name) {
      case 'username':
        if (!trimmed) return { valid: false, message: 'Username is required' };
        if (trimmed.length < 3) return { valid: false, message: 'Username must be at least 3 characters' };
        return { valid: true, message: '' };

      case 'email':
        if (!trimmed) return { valid: false, message: 'Email is required' };
        // Simple regex for client-side email format validation.
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmed)) return { valid: false, message: 'Please enter a valid email address' };
        return { valid: true, message: '' };

      case 'password':
        if (!trimmed) return { valid: false, message: 'Password is required' };
        if (trimmed.length < 6) return { valid: false, message: 'Password must be at least 6 characters' };
        return { valid: true, message: '' };

      default:
        return { valid: trimmed.length > 0, message: trimmed.length > 0 ? '' : `${name} is required` };
    }
  }

  /**
   * Checks the strength of a password based on a simple heuristic.
   * @param {string} pw - The password to check.
   * @returns {'weak'|'ok'|'strong'} - The calculated strength level.
   */
  function checkPasswordStrength(pw) {
    if (!pw || pw.length < 6) return 'weak';
    
    const hasNumbers = /[0-9]/.test(pw);
    const hasLowerCase = /[a-z]/.test(pw);
    const hasUpperCase = /[A-Z]/.test(pw);
    const hasSymbols = /[^A-Za-z0-9]/.test(pw);
    
    const score = [hasNumbers, hasLowerCase, hasUpperCase, hasSymbols].filter(Boolean).length;

    if (pw.length >= 12 && score >= 3) return 'strong';
    if (score >= 2) return 'ok';
    
    return 'weak';
  }

  // Export the validation utilities to the global window object.
  window.authUtils = { validateField, checkPasswordStrength };

})();