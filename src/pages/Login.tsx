import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Truck, Eye, EyeOff, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

type Role = 'ops' | 'vendor';

const AsiaNowLogo: React.FC = () => (
  <div className="flex items-center gap-3 justify-center mb-8">
    <div className="w-12 h-12 bg-asianow-red rounded-xl flex items-center justify-center shadow-lg">
      <svg viewBox="0 0 24 24" fill="white" width="28" height="28" aria-hidden="true">
        <circle cx="15" cy="3.5" r="1.5"/>
        <path d="M11.5 11l-1.5 7H8l1.5-5.5L8 11l-2-1 1-3.5C7.5 5.5 9 5 10.5 5.5l2 1c.8.4 1.5 1 1.5 2l.5 2.5 2.5.5-.5 2-3.5-.5z"/>
        <path d="M12 18l1 4H11l-.5-3L12 18z"/>
        <path d="M10.5 18l-.5 3H8l1-3H10.5z"/>
      </svg>
    </div>
    <div>
      <div className="flex items-baseline gap-0.5">
        <span className="text-3xl font-extrabold text-asianow-red leading-none">Asia</span>
        <span className="text-3xl font-extrabold text-asianow-dark leading-none">Now</span>
      </div>
      <p className="text-xs text-gray-500 tracking-wider uppercase">Logistics Philippines</p>
    </div>
  </div>
);

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>('ops');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    if (role === 'vendor') {
      navigate('/onboarding');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-asianow-dark via-asianow-blue to-asianow-dark p-4"
      role="main"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-5 bg-white"
            style={{
              width: `${60 + i * 30}px`,
              height: `${60 + i * 30}px`,
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <AsiaNowLogo />

          <h1 className="sr-only">Sign in to AsiaNow Portal</h1>

          {/* AI badge */}
          <div className="flex items-center justify-center gap-1.5 mb-6">
            <Zap size={14} className="text-asianow-red" aria-hidden="true" />
            <span className="text-xs font-medium text-gray-500">AI-Enabled Vendor & Workforce Platform</span>
          </div>

          {/* Role selector */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 text-center">Sign in as</p>
            <div className="grid grid-cols-2 gap-3" role="group" aria-label="Select role">
              <button
                type="button"
                onClick={() => setRole('ops')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  role === 'ops'
                    ? 'border-asianow-blue bg-asianow-blue/5 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                aria-pressed={role === 'ops'}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${role === 'ops' ? 'bg-asianow-blue' : 'bg-gray-100'}`}>
                  <Shield size={18} className={role === 'ops' ? 'text-white' : 'text-gray-500'} aria-hidden="true" />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${role === 'ops' ? 'text-asianow-blue' : 'text-gray-700'}`}>Operations Admin</p>
                  <p className="text-xs text-gray-400">Full platform access</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('vendor')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  role === 'vendor'
                    ? 'border-asianow-red bg-asianow-red/5 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                aria-pressed={role === 'vendor'}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${role === 'vendor' ? 'bg-asianow-red' : 'bg-gray-100'}`}>
                  <Truck size={18} className={role === 'vendor' ? 'text-white' : 'text-gray-500'} aria-hidden="true" />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${role === 'vendor' ? 'text-asianow-red' : 'text-gray-700'}`}>Vendor Portal</p>
                  <p className="text-xs text-gray-400">Apply & manage access</p>
                </div>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4" aria-label="Login form">
            <Input
              label="Email Address"
              type="email"
              placeholder={role === 'ops' ? 'admin@asianow.ph' : 'vendor@company.ph'}
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="w-full border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 pl-3 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-asianow-blue focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-asianow-blue" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <button type="button" className="text-sm text-asianow-blue hover:underline">
                Forgot password?
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3" role="alert">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              loading={loading}
              variant={role === 'vendor' ? 'secondary' : 'primary'}
              size="lg"
            >
              {loading ? 'Signing in...' : `Sign in as ${role === 'ops' ? 'Operations Admin' : 'Vendor'}`}
            </Button>
          </form>

          {/* Demo hint */}
          <div className="mt-5 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              <strong>Demo:</strong> Any email & password. Select role above.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-white/50 mt-6">
          © 2026 AsiaNow Logistics Philippines. All rights reserved.
        </p>
      </div>
    </div>
  );
};
