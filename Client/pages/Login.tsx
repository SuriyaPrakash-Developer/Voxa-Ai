import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MdEmail, MdLock, MdAutoAwesome, MdSend } from 'react-icons/md';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      // After successful login, navigate to the main app
      navigate('/');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-sky-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 sm:space-y-8 p-6 sm:p-8 bg-white rounded-lg sm:rounded-xl shadow-lg transform transition-all duration-300 hover:shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="p-2 sm:p-3 rounded-full bg-blue-50 animate-pulse">
            <MdAutoAwesome className="w-6 sm:w-8 h-6 sm:h-8 text-blue-600" />
          </div>
          <h2 className="text-center sm:text-left text-xl sm:text-2xl font-extrabold text-gray-900">
            Sign in to Voxa AI
          </h2>
        </div>
        <form className="mt-4 sm:mt-6 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-red-700">{error}</div>
            </div>
          )}
          <div className="space-y-3 sm:space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MdEmail className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-xl relative block w-full pl-5 pr-3 py-2 sm:py-2.5 border border-gray-200 placeholder-gray-400 text-gray-900 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-shadow duration-150 shadow-sm"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MdLock className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-xl relative block w-full pl-5 pr-3 py-2 sm:py-2.5 border border-gray-200 placeholder-gray-400 text-gray-900 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-shadow duration-150 shadow-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex items-center justify-center gap-2 py-2 sm:py-2.5 px-4 border border-transparent text-xs sm:text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform transition-transform duration-150 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <MdSend className="w-3 sm:w-4 h-3 sm:h-4 opacity-90" />
              <span>Sign in</span>
            </button>
          </div>

          <div className="text-xs sm:text-sm text-center">
            <a href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
              Don't have an account? Sign up
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;