import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      await login(email, password);
      toast.success('Signed in successfully!');
      navigate('/');
    } catch (err) {
      const msg = err.message || 'Failed to log in';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="khataManager Logo" className="w-16 h-16 rounded-2xl shadow-sm" />
        </div>
        <h2 className="text-center text-3xl font-black tracking-tight text-text-primary" style={{ fontFamily: 'Roboto, sans-serif' }}>
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-text-secondary">
          Log in to manage your digital khata
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-border">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 text-center">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg/50 focus:bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all placeholder:text-text-muted"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full pl-4 pr-12 py-3 rounded-xl border border-border bg-bg/50 focus:bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all placeholder:text-text-muted"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-muted hover:text-text-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Logging in...' : (
                <>
                  <LogIn size={18} />
                  Log in
                </>
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-text-muted font-medium">New to khataManager?</span>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <Link to="/register" className="font-bold text-accent hover:text-accent/80 transition-colors">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
