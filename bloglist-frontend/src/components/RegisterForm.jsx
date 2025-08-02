import { useState } from "react";
import Notification from "./Notification";
import PropTypes from "prop-types";

/**
 * RegisterForm Component
 * 
 * Modern, professional registration form with improved UX and validation.
 * Features comprehensive form validation, loading states, and responsive design.
 */

const RegisterForm = ({
  handleRegister,
  notificationMessage,
  switchToLogin,
}) => {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Username validation
    if (!formData.username.trim()) {
      errors.username = "Username is required";
    } else if (formData.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = "Username can only contain letters, numbers, and underscores";
    }

    // Name validation
    if (!formData.name.trim()) {
      errors.name = "Name is required";
    } else if (formData.name.length < 3) {
      errors.name = "Name must be at least 3 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 3) {
      errors.password = "Password must be at least 3 characters";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await handleRegister({
        username: formData.username.trim(),
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });
      
      // Reset form on successful registration
      setFormData({
        username: "",
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = 
    formData.username.trim() &&
    formData.name.trim() &&
    formData.email.trim() &&
    formData.password &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword &&
    Object.keys(validationErrors).length === 0;

  return (
    <div className="form-container animate-slideUp">
      <div className="form-title">Create Account</div>
      
      <Notification notificationMessage={notificationMessage} />
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label htmlFor="reg-username" className="form-label">
            Username *
          </label>
          <input
            id="reg-username"
            name="username"
            type="text"
            className={`form-input ${validationErrors.username ? 'border-red-500' : ''}`}
            placeholder="Choose a unique username"
            value={formData.username}
            onChange={handleChange}
            required
            autoComplete="username"
            maxLength={20}
          />
          {validationErrors.username && (
            <p className="text-xs text-red-500 mt-1">{validationErrors.username}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="reg-name" className="form-label">
            Full Name *
          </label>
          <input
            id="reg-name"
            name="name"
            type="text"
            className={`form-input ${validationErrors.name ? 'border-red-500' : ''}`}
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            required
            autoComplete="name"
            maxLength={50}
          />
          {validationErrors.name && (
            <p className="text-xs text-red-500 mt-1">{validationErrors.name}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="reg-email" className="form-label">
            Email *
          </label>
          <input
            id="reg-email"
            name="email"
            type="email"
            className={`form-input ${validationErrors.email ? 'border-red-500' : ''}`}
            placeholder="Enter your email address"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
          {validationErrors.email && (
            <p className="text-xs text-red-500 mt-1">{validationErrors.email}</p>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="reg-password" className="form-label">
            Password *
          </label>
          <input
            id="reg-password"
            name="password"
            type="password"
            className={`form-input ${validationErrors.password ? 'border-red-500' : ''}`}
            placeholder="Create a secure password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
            minLength={3}
          />
          {validationErrors.password && (
            <p className="text-xs text-red-500 mt-1">{validationErrors.password}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="reg-confirm-password" className="form-label">
            Confirm Password *
          </label>
          <input
            id="reg-confirm-password"
            name="confirmPassword"
            type="password"
            className={`form-input ${validationErrors.confirmPassword ? 'border-red-500' : ''}`}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />
          {validationErrors.confirmPassword && (
            <p className="text-xs text-red-500 mt-1">{validationErrors.confirmPassword}</p>
          )}
        </div>
        
        <button 
          id="register-btn"
          type="submit"
          className={`btn btn-primary btn-lg btn-full ${isSubmitting || !isFormValid ? 'opacity-50' : ''}`}
          disabled={isSubmitting || !isFormValid}
        >
          {isSubmitting ? '🔄 Creating Account...' : '✨ Create Account'}
        </button>
      </form>
      
      <div className="text-center mt-6">
        <p className="text-sm text-gray-600 mb-3">
          Join BlogSpace and start sharing your stories
        </p>
        <button
          onClick={switchToLogin}
          className="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
        >
          Already have an account? Sign In
        </button>
      </div>
    </div>
  );
};

RegisterForm.propTypes = {
  handleRegister: PropTypes.func.isRequired,
  notificationMessage: PropTypes.object.isRequired,
  switchToLogin: PropTypes.func.isRequired,
};

export default RegisterForm;
