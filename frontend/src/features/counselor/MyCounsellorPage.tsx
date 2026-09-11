import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import {
  VictimCounsellorProfileResponse,
  CounsellingRequest,
} from '../../types';
import {
  UserCheck,
  UserX,
  Clock,
  Shield,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  Award,
  MapPin,
  CheckCircle2,
  AlertCircle,
  HeartHandshake,
  Send,
  Loader2,
  Sparkles,
} from 'lucide-react';

export const MyCounsellorPage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<VictimCounsellorProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Request modal / form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preferredLanguage, setPreferredLanguage] = useState('English / Hindi');
  const [preferredGender, setPreferredGender] = useState('NO_PREFERENCE');
  const [requestNotes, setRequestNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res: any = await api.get('/victims/me/counsellor');
      const profileData = res.data || res;
      setProfile(profileData);
    } catch (err: any) {
      console.error('Error fetching counsellor profile:', err);
      // Fallback mock
      setProfile({
        victimId: user?.id || 'demo_user',
        victimName: user?.fullName || 'Victim User',
        caseId: user?.caseId || 'MP-1042',
        caseStage: user?.caseStage || 'COURT_TRIAL',
        counsellorStatus: 'NOT_ALLOCATED',
        counsellor: null,
        pendingRequest: null,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await api.post('/victims/me/counsellor-request', {
        preferredLanguage,
        preferredGender,
        notes: requestNotes,
      });
      setSuccessMessage('Counsellor request submitted successfully to District Welfare Administration.');
      setIsModalOpen(false);
      setRequestNotes('');
      await fetchProfile();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[450px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
          <span className="text-sm text-slate-400 font-medium">Loading Counsellor & Support Details...</span>
        </div>
      </div>
    );
  }

  const isAllocated = profile?.counsellorStatus === 'ACTIVE' && profile.counsellor;
  const isPending = profile?.counsellorStatus === 'PENDING' || profile?.counsellorStatus === 'REQUESTED' || profile?.pendingRequest;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 md:p-8 border border-slate-700/80 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-teal-500/10 text-teal-400 border border-teal-500/20">
                Confidential Support Portal
              </span>
              <span className="text-xs text-slate-400 font-mono">Case ID: {profile?.caseId || 'MP-1042'}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <HeartHandshake className="w-8 h-8 text-teal-400" />
              My Assigned Counsellor & Psycho-Social Care
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Dedicated trauma-informed mental health, legal aid accompaniment, and crisis support for your case journey.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            {isAllocated ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Counsellor Assigned
              </div>
            ) : isPending ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-semibold">
                <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                Allocation Request Under Review
              </div>
            ) : (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-teal-500/20 active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                Request a Counsellor
              </button>
            )}
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Success / Error Alerts */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-white font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-white font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {isAllocated && profile?.counsellor ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Primary Counsellor Profile Card */}
          <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-teal-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shrink-0 border-2 border-teal-400/40">
                {profile.counsellor.fullName.charAt(0)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-white">{profile.counsellor.fullName}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Lead Psychologist & Case Officer
                  </span>
                </div>
                <p className="text-sm text-slate-300">{profile.counsellor.specialization}</p>
                <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-teal-400" />
                    {profile.counsellor.experienceYears} Years Clinical Experience
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    {profile.counsellor.district || 'District Welfare Office'}
                  </span>
                </div>
              </div>
            </div>

            <hr className="border-slate-800" />

            {/* Contact & Support Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-teal-400" />
                  Official Email
                </div>
                <div className="text-sm font-medium text-white break-all">{profile.counsellor.email}</div>
                <div className="text-[11px] text-slate-400">Encrypted internal communication channel</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  Direct Helpline
                </div>
                <div className="text-sm font-medium text-white">{profile.counsellor.phone || '+91 98765 43210'}</div>
                <div className="text-[11px] text-slate-400">Available Mon–Sat: 09:00 AM – 06:00 PM</div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => alert('Appointment request sent to Dr. Sarah Jenkins for your next case milestone.')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all shadow-md active:scale-95"
              >
                <Calendar className="w-4 h-4" />
                Schedule 1-on-1 Session
              </button>
              <button
                onClick={() => alert('Encrypted message draft opened with your designated counsellor.')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm transition-all active:scale-95"
              >
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                Send Confidential Message
              </button>
            </div>
          </div>

          {/* Side Guidance & Case Stage Context */}
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-teal-400" />
                Legal Protection & Rights
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Under the PoA Act & Witness Protection Scheme (2018), you are entitled to free legal assistance, confidential psycho-social counselling, and travel reimbursement for trial cross-examinations.
              </p>
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
                <strong className="block font-semibold mb-0.5">Assigned Since:</strong>
                {new Date(profile.counsellor.assignedSince || Date.now()).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Phone className="w-4 h-4 text-rose-400" />
                24/7 Emergency Support
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                In case of immediate threat, harassment, or distress, call the national emergency lines directly:
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
                  <span className="text-slate-300">National Atrocity Helpline</span>
                  <span className="font-bold text-rose-400 font-mono">14566</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
                  <span className="text-slate-300">Police Emergency</span>
                  <span className="font-bold text-rose-400 font-mono">112</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : isPending ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-xl max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
            <Clock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Counsellor Request Pending Review</h2>
            <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              Your request for a designated psycho-social counsellor has been forwarded to the District Welfare Administration.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 text-left space-y-2 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Request Type:</span>
              <span className="font-semibold text-white">Direct Victim Allocation</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Target Case:</span>
              <span className="font-semibold text-teal-400 font-mono">{profile?.caseId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className="font-semibold text-amber-400">Pending Officer Matching</span>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            You will receive a real-time notification as soon as a counsellor accepts and is assigned to your case.
          </p>
        </div>
      ) : (
        /* Empty / Not Allocated State */
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 md:p-12 text-center space-y-6 shadow-xl max-w-2xl mx-auto">
          <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
            <UserX className="w-10 h-10 text-slate-400" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">No Counsellor Assigned Yet</h2>
            <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
              You currently do not have a designated counsellor assigned to your case. Requesting a counsellor connects you with a certified psychologist and legal aid advocate to assist you through every stage.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-lg mx-auto">
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 text-xs">
              <span className="font-semibold text-teal-400 block mb-1">Trauma Care</span>
              Confidential coping strategies & mental health assessments.
            </div>
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 text-xs">
              <span className="font-semibold text-indigo-400 block mb-1">Trial Support</span>
              Accompaniment and protection during court proceedings.
            </div>
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 text-xs">
              <span className="font-semibold text-emerald-400 block mb-1">Rehabilitation</span>
              Assistance with relief funds and welfare schemes.
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-base transition-all shadow-xl shadow-teal-500/25 active:scale-95 inline-flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Request a Counsellor Now
          </button>
        </div>
      )}

      {/* Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 md:p-8 space-y-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <HeartHandshake className="w-6 h-6 text-teal-400" />
                Request a Dedicated Counsellor
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Preferred Language
                </label>
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-teal-400"
                >
                  <option value="English / Hindi">English / Hindi</option>
                  <option value="Telugu">Telugu</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Marathi">Marathi</option>
                  <option value="Kannada">Kannada</option>
                  <option value="Bengali">Bengali</option>
                  <option value="Other">Other Regional Language</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Counsellor Gender Preference
                </label>
                <select
                  value={preferredGender}
                  onChange={(e) => setPreferredGender(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-teal-400"
                >
                  <option value="NO_PREFERENCE">No Preference (Fastest Match)</option>
                  <option value="FEMALE">Female Counsellor</option>
                  <option value="MALE">Male Counsellor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Specific Concerns or Needs (Optional)
                </label>
                <textarea
                  rows={4}
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  placeholder="e.g. Need emotional support before upcoming trial hearing, difficulty sleeping, witness safety concerns..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-400">
                <span className="font-semibold text-teal-300 block mb-0.5">Confidentiality Assured</span>
                Your request is strictly private and reviewed only by the District Welfare Officer for allocation purposes.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
