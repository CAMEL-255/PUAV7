import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Shield, GraduationCap, AlertCircle, UserPlus, Stethoscope, Users } from 'lucide-react';

interface LoginProps {
  onShowRegistration: () => void;
}

export default function Login({ onShowRegistration }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: signInError } = await signIn(email, password);
    
    if (signInError) {
      setError(signInError.message);
    }
    
    setLoading(false);
  };

  const quickLogin = (userEmail: string, userPassword: string = 'password123') => {
    setEmail(userEmail);
    setPassword(userPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-white rounded-full flex items-center justify-center mb-4">
            <GraduationCap className="h-8 w-8 text-blue-800" />
          </div>
          <h2 className="text-3xl font-bold text-white">University Attendance</h2>
          <p className="mt-2 text-blue-100">Sign in to your account</p>
        </div>

        <form className="mt-8 space-y-6 bg-white rounded-xl p-8 shadow-xl" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="your.email@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={onShowRegistration}
              className="text-blue-600 hover:text-blue-500 text-sm font-medium"
            >
              New student? Register here
            </button>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-600 mb-3">Demo Accounts:</p>
            <div className="grid gap-2">
              <button
                type="button"
                onClick={() => quickLogin('admin@university.edu')}
                className="flex items-center gap-2 w-full p-2 text-left rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
              >
                <Shield className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-purple-800">Admin Dashboard</span>
              </button>
              <button
                type="button"
                onClick={() => quickLogin('teacher@university.edu')}
                className="flex items-center gap-2 w-full p-2 text-left rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
              >
                <GraduationCap className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800">Teacher Dashboard</span>
              </button>
              <button
                type="button"
                onClick={() => quickLogin('security@university.edu')}
                className="flex items-center gap-2 w-full p-2 text-left rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors"
              >
                <Shield className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-orange-800">Security Dashboard</span>
              </button>
              <button
                type="button"
                onClick={() => quickLogin('doctor@university.edu')}
                className="flex items-center gap-2 w-full p-2 text-left rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <Stethoscope className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800">Doctor Dashboard</span>
              </button>
              <button
                type="button"
                onClick={() => quickLogin('assistant@university.edu')}
                className="flex items-center gap-2 w-full p-2 text-left rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors"
              >
                <Users className="h-4 w-4 text-indigo-600" />
                <span className="text-sm text-indigo-800">Assistant Dashboard</span>
              </button>
              <button
                type="button"
                onClick={() => quickLogin('alice.johnson@student.edu')}
                className="flex items-center gap-2 w-full p-2 text-left rounded-lg bg-pink-50 hover:bg-pink-100 transition-colors"
              >
                <UserPlus className="h-4 w-4 text-pink-600" />
                <span className="text-sm text-pink-800">Student Dashboard</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}