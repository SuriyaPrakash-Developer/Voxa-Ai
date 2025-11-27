import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MdPerson, MdEmail, MdPhone, MdLock, MdAutoAwesome } from 'react-icons/md';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    rePassword: ''
  });
  const [error, setError] = useState('');
  const { signup } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // send signup data to backend before proceeding with local auth
    try {
      const res = await fetch(`/api/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          password: formData.password
        })
      });

      if (!res.ok) {
        // try to parse JSON error, fall back to text
        const errBody = await res.json().catch(async () => ({ message: await res.text() }));
        setError(errBody?.message || 'Server returned an error');
        return;
      }
    } catch (err) {
      console.error('Signup backend error:', err);
      setError('Unable to connect to server. Please try again.');
      return;
    }

    if (formData.password !== formData.rePassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await signup({
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password
      });
      navigate('/');
    } catch (err) {
      setError('Failed to create account');
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-sky-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 sm:space-y-8 p-6 sm:p-8 bg-white rounded-lg sm:rounded-xl shadow-lg transform transition-all duration-300 hover:shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="p-2 sm:p-3 rounded-full bg-indigo-50 animate-pulse">
            <MdAutoAwesome className="w-6 sm:w-8 h-6 sm:h-8 text-indigo-600" />
          </div>
          <h2 className="text-center sm:text-left text-xl sm:text-2xl font-extrabold text-gray-900">
            Create your Voxa AI account
          </h2>
        </div>
        <form className="flex flex-col space-y-3 sm:space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-red-700">{error}</div>
            </div>
          )}
          <div className="flex flex-col">
            <label htmlFor="name" className="text-xs sm:text-sm font-medium mb-1.5"></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MdPerson className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-xl relative block w-full pl-5 pr-3 py-2 sm:py-2.5 border border-gray-200 placeholder-gray-400 text-gray-900 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-shadow duration-150 shadow-sm"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="flex flex-col">
            <label htmlFor="email" className="text-xs sm:text-sm font-medium mb-1.5"></label>
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
                className="appearance-none rounded-xl relative block w-full pl-5 pr-3 py-2 sm:py-2.5 border border-gray-200 placeholder-gray-400 text-gray-900 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-shadow duration-150 shadow-sm"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="flex flex-col">
            <label htmlFor="mobile" className="text-xs sm:text-sm font-medium mb-1.5"></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MdPhone className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
              </div>
              <input
                id="mobile"
                name="mobile"
                type="tel"
                required
                className="appearance-none rounded-xl relative block w-full pl-5 pr-3 py-2 sm:py-2.5 border border-gray-200 placeholder-gray-400 text-gray-900 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-shadow duration-150 shadow-sm"
                placeholder="Mobile.No"
                value={formData.mobile}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="flex flex-col">
            <label htmlFor="password" className="text-xs sm:text-sm font-medium mb-1.5"></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MdLock className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-xl relative block w-full pl-5 pr-3 py-2 sm:py-2.5 border border-gray-200 placeholder-gray-400 text-gray-900 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-shadow duration-150 shadow-sm"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="flex flex-col">
            <label htmlFor="rePassword" className="text-xs sm:text-sm font-medium mb-1.5"></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MdLock className="w-4 sm:w-5 h-4 sm:h-5 text-pink-400" />
              </div>
              <input
                id="rePassword"
                name="rePassword"
                type="password"
                required
                className="appearance-none rounded-xl relative block w-full pl-5 pr-3 py-2 sm:py-2.5 border border-gray-200 placeholder-gray-400 text-gray-900 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-shadow duration-150 shadow-sm"
                placeholder="Re-enter password"
                value={formData.rePassword}
                onChange={handleChange}
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 sm:py-2.5 px-4 border border-transparent text-xs sm:text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition-transform duration-150 hover:scale-[1.02]"

            >
              Sign up
            </button>
          </div>

          <div className="text-xs sm:text-sm text-center">
            <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Already have an account? Sign in
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;