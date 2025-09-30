import { useState } from 'react';
import { useAuth } from "../context/AuthContext";
import { handleErrorResponse } from '../utils/handleResponse';

const AuthPage = () => {
  const { signUp, login } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setisLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      if (!formData.email || !formData.password) {
        return handleErrorResponse("Please fill in all required fields.");
      }
      setisLoading(true);
      const result = await login(formData);
      if (result.success) {
        setTimeout(() => {
          setFormData({
            name: '',
            email: '',
            password: '',
            confirmPassword: ''
          });
          setisLoading(false);
          window.location.href = '/dashboard';
        }, 2000);
      } else {
        setisLoading(false);
        return handleErrorResponse(result.message || "Login failed. Please try again.");
      }
    } catch (error) {
      setisLoading(false);
      return handleErrorResponse(error.message || "Login failed. Please try again.");
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        return handleErrorResponse("Please fill in all required fields.");
      }
      if (formData.password !== formData.confirmPassword) {
        return handleErrorResponse("Passwords do not match.");
      } else if (formData.password.length < 6) {
        return handleErrorResponse("Password should be at least 6 characters long.");
      }
      setisLoading(true);
      const result = await signUp(formData);
      if (result.success) {
        alert("Signup successful! Please log in.");
        setisLoading(false);
        setIsSignup(false);
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
      } else {
        setisLoading(false);
        return handleErrorResponse(result.message || "Sign up failed. Please try again.");
      }
    } catch (error) {
      setisLoading(false);
      return handleErrorResponse(error.message || "Sign up failed. Please try again.");
    }
  }

  const handleChange = () => {
    setIsSignup(!isSignup);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    })
  }

  const EyeIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  const EyeOffIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="text-4xl mr-3">💰</div>
            <h1 className="text-2xl font-semibold text-teal-600">Finance Tracker</h1>
          </div>
          <p className="text-gray-600 text-sm">
            {isSignup
              ? "Create your account to start tracking your finances."
              : "Welcome back! Please sign in to your account."
            }
          </p>
        </div>

        {/* Form */}
        <form onSubmit={isSignup ? handleSignUp : handleLogin} className="space-y-6">
          {/* Full name - Only for signup */}
          {isSignup && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                autoComplete='username'
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-colors text-gray-700 placeholder-gray-400"
              />
            </div>
          )}

          {/* Email Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              autoComplete='email'
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-colors text-gray-700 placeholder-gray-400"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={isSignup ? "Create a password" : "Enter your password"}
                value={formData.password}
                autoComplete='current-password'
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full px-3 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-colors text-gray-700 placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {/* Confirm Password - Only for signup */}
          {isSignup && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  autoComplete='new-password'
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full px-3 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-colors text-gray-700 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
          )}

          {/* Forgot Password Link - Only for login */}
          {!isSignup && (
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-blue-500 hover:text-blue-600 font-medium"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-gradient-to-r from-green-400 to-blue-500 text-white py-3 px-4 rounded-lg font-medium text-base 
              hover:from-green-500 hover:to-blue-600 transition-all duration-200 transform hover:scale-[1.02] shadow-sm
              ${isLoading ? "opacity-70 cursor-not-allowed" : "hover:cursor-pointer"}`}
          >
            {isLoading ? (
              <svg
                className="animate-spin h-5 w-5 mx-auto text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            ) : (
              isSignup ? "Create Account" : "Sign In"
            )}
          </button>

          {/* Toggle between login and signup */}
          <div className="text-center">
            <span className="text-gray-600 text-sm">
              {isSignup ? 'Already have an account? ' : "Don't have an account? "}
            </span>
            <button
              type="button"
              onClick={handleChange}
              className="text-sm font-medium text-blue-500 hover:text-blue-600 cursor-pointer"
            >
              {isSignup ? 'Log in' : 'Sign up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;