import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Login = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      setError('Invalid credentials');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-md neu-card bg-brand-gray/20">
        <div className="text-center mb-8 bg-white border-2 border-black p-4 rounded-lg shadow-neu-sm transform -rotate-1">
          <h2 className="text-3xl font-black text-black uppercase">Welcome Back</h2>
          <p className="text-gray-600 font-bold mt-1 uppercase text-sm tracking-wide">Please sign in to continue</p>
        </div>

        {error && (
          <div className="bg-red-400 border-2 border-black text-black font-bold p-3 rounded mb-6 text-sm text-center shadow-neu-sm uppercase">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-black text-black uppercase mb-2 ml-1">Username</label>
            <div className="relative group">
              <div className="absolute left-3 top-3.5 bg-brand-white border-2 border-black rounded p-0.5 z-10">
                 <User className="text-black" size={16} strokeWidth={3} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="neu-input pl-12"
                placeholder="ENTER USERNAME"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-black text-black uppercase mb-2 ml-1">Password</label>
            <div className="relative group">
              <div className="absolute left-3 top-3.5 bg-brand-white border-2 border-black rounded p-0.5 z-10">
                <Lock className="text-black" size={16} strokeWidth={3} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="neu-input pl-12"
                placeholder="ENTER PASSWORD"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="neu-btn w-full mt-4 justify-center text-lg hover:bg-brand-black hover:text-white"
          >
            Sign In
          </button>
          
          <div className="text-center text-xs font-bold text-gray-500 mt-6 bg-white border-2 border-black p-2 rounded shadow-[2px_2px_0px_0px_#000] inline-block mx-auto w-full">
            HINT: USE <span className="bg-brand-gray px-1 border border-black rounded">admin</span> / <span className="bg-brand-gray px-1 border border-black rounded">admin</span>
          </div>
        </form>
      </div>
    </div>
  );
};
