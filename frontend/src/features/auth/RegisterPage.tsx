import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Lock, Mail, User as UserIcon, ArrowRight, ShieldCheck } from 'lucide-react';
import { UserRole } from '../../types';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'USER' as UserRole,
    department: 'Computer Science',
  });
  const [consentAgreed, setConsentAgreed] = useState(true);
  const [error, setError] = useState('');
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentAgreed) {
      setError('Please agree to the non-diagnostic and privacy terms.');
      return;
    }
    setError('');
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-100 mb-2">Create an account</h2>
      <p className="text-sm text-slate-400 mb-6">Join MindPulse for early mental wellness support</p>

      {error && (
        <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
          <div className="relative">
            <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Alex Rivera"
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Contact Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="alex.r@support.portal"
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Role / Persona</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
            className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-teal-500"
          >
            <option value="USER">Victim / Protected Witness (Distress Logging & AI Companion)</option>
            <option value="COUNSELOR">Counselor / Case Worker (Triage & Support Pathways)</option>
            <option value="ADMIN">District / State Welfare Official (Aggregated Telemetry)</option>
          </select>
        </div>

        {/* Consent Checkbox */}
        <div className="pt-2">
          <label className="flex items-start gap-2 text-xs text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={consentAgreed}
              onChange={(e) => setConsentAgreed(e.target.checked)}
              className="mt-0.5 rounded border-slate-700 text-teal-500 focus:ring-teal-500 bg-slate-900"
            />
            <span>
              I understand MindPulse is a non-diagnostic early intervention platform and consent to private baseline telemetry.
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-4 py-2.5 px-4 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50"
        >
          {isLoading ? 'Creating account...' : 'Create Account'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="text-teal-400 hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
};
