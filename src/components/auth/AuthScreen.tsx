import React, { useState } from 'react';
import { authService, AuthUserSession } from '../../lib/authService';
import {
  Coffee,
  Lock,
  Mail,
  User,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  Store,
} from 'lucide-react';

interface AuthScreenProps {
  onSuccess: (session: AuthUserSession, isNewUser?: boolean) => void;
  onOpenOnboarding: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess, onOpenOnboarding }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'magic_link'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        const res = await authService.signIn(email, password);
        if (res.success && res.session) {
          onSuccess(res.session, false);
        } else {
          setError(res.error || 'Invalid email or password.');
        }
      } else if (mode === 'signup') {
        const res = await authService.signUp(email, password, name);
        if (res.success && res.session) {
          onSuccess(res.session, true);
        } else {
          setError(res.error || 'Failed to create account.');
        }
      } else if (mode === 'magic_link') {
        const res = await authService.sendMagicLink(email);
        if (res.success) {
          setMessage(res.message);
        } else {
          setError(res.error || 'Failed to dispatch magic link.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (role: 'super_admin' | 'owner' | 'manager' | 'cashier') => {
    const demoEmail =
      role === 'super_admin'
        ? 'admin@tsos.dev'
        : role === 'owner'
        ? 'owner@coolkafe.com'
        : role === 'manager'
        ? 'manager@coolkafe.com'
        : 'cashier@coolkafe.com';
    const demoPass = role === 'super_admin' ? 'admin123456' : 'demo123456';
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);
    const res = await authService.signIn(demoEmail, demoPass);
    setLoading(false);
    if (res.session) {
      onSuccess(res.session, false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#E9E0D6] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Banner */}
        <div className="p-6 bg-gradient-to-br from-[#FFF1E6] via-[#FFF9F2] to-white border-b border-[#E9E0D6] text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#F97316] text-white flex items-center justify-center mx-auto shadow-md mb-3">
            <Coffee className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-black text-[#1C1917] tracking-tight">
            TSOS Cafe Operating System
          </h1>
          <p className="text-xs text-[#57534E] mt-1 font-medium">
            Multi-Tenant Point-of-Sale & Kitchen Management Platform
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-[#E9E0D6] bg-[#FFF9F2]/50 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
              setMessage(null);
            }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              mode === 'signin'
                ? 'border-[#F97316] text-[#F97316] bg-white font-bold'
                : 'border-transparent text-[#57534E] hover:text-[#1C1917]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
              setMessage(null);
            }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              mode === 'signup'
                ? 'border-[#F97316] text-[#F97316] bg-white font-bold'
                : 'border-transparent text-[#57534E] hover:text-[#1C1917]'
            }`}
          >
            Register Cafe
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('magic_link');
              setError(null);
              setMessage(null);
            }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              mode === 'magic_link'
                ? 'border-[#F97316] text-[#F97316] bg-white font-bold'
                : 'border-transparent text-[#57534E] hover:text-[#1C1917]'
            }`}
          >
            Magic Link
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{message}</span>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-[#57534E] uppercase tracking-wider mb-1">
                Your Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vikram Malhotra"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E9E0D6] bg-[#FFF9F2] focus:bg-white focus:border-[#F97316] focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#57534E] uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@yourcafe.com"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E9E0D6] bg-[#FFF9F2] focus:bg-white focus:border-[#F97316] focus:outline-none"
              />
            </div>
          </div>

          {mode !== 'magic_link' && (
            <div>
              <label className="block text-xs font-semibold text-[#57534E] uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E9E0D6] bg-[#FFF9F2] focus:bg-white focus:border-[#F97316] focus:outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-[#1C1917] hover:bg-black text-white shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>
                  {mode === 'signin' ? 'Sign In to Workspace' : mode === 'signup' ? 'Create Cafe Account' : 'Send Magic Link'}
                </span>
                <ArrowRight className="w-4 h-4 text-[#F97316]" />
              </>
            )}
          </button>

          {/* Quick Demo Access Bar */}
          <div className="pt-3 border-t border-[#E9E0D6]">
            <div className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider text-center mb-2">
              Quick One-Click Sign In
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('super_admin')}
                className="p-2 rounded-xl border border-[#E9E0D6] bg-[#FFF9F2] hover:bg-[#F5F0EB] text-center text-xs transition-colors"
              >
                <div className="font-bold text-[#F97316]">SuperAdmin</div>
                <div className="text-[10px] text-[#57534E]">Platform</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('owner')}
                className="p-2 rounded-xl border border-[#E9E0D6] bg-[#FFF9F2] hover:bg-[#F5F0EB] text-center text-xs transition-colors"
              >
                <div className="font-bold text-[#1C1917]">Owner</div>
                <div className="text-[10px] text-[#57534E]">Full Access</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('manager')}
                className="p-2 rounded-xl border border-[#E9E0D6] bg-[#FFF9F2] hover:bg-[#F5F0EB] text-center text-xs transition-colors"
              >
                <div className="font-bold text-[#1C1917]">Manager</div>
                <div className="text-[10px] text-[#57534E]">Shift Audit</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('cashier')}
                className="p-2 rounded-xl border border-[#E9E0D6] bg-[#FFF9F2] hover:bg-[#F5F0EB] text-center text-xs transition-colors"
              >
                <div className="font-bold text-[#1C1917]">Cashier</div>
                <div className="text-[10px] text-[#57534E]">POS / Tender</div>
              </button>
            </div>

            {/* Credentials Cheat-Sheet */}
            <div className="mt-3 p-2.5 rounded-xl bg-[#FFF9F2] border border-[#E9E0D6] text-[11px] text-[#57534E] space-y-1">
              <div className="font-semibold text-[#1C1917] flex items-center justify-between">
                <span>Default Credentials (Supabase Cloud + Local)</span>
                <span className="text-[10px] text-emerald-600 font-bold">Active</span>
              </div>
              <div className="grid grid-cols-2 gap-x-2 text-[10px] font-mono">
                <div>Admin: <span className="text-[#1C1917]">admin@tsos.dev</span></div>
                <div>Pass: <span className="text-[#1C1917]">admin123456</span></div>
                <div>Owner: <span className="text-[#1C1917]">owner@coolkafe.com</span></div>
                <div>Pass: <span className="text-[#1C1917]">demo123456</span></div>
              </div>
              <div className="text-[9px] text-[#78716C] pt-0.5 border-t border-[#E9E0D6]">
                Tip: You can also simply type username <span className="font-bold text-[#1C1917]">admin</span> or <span className="font-bold text-[#1C1917]">owner</span>.
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
