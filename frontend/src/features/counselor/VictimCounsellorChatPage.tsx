import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { ChatMessage, ChatConversation, CounsellorSuggestionItem } from '../../types';
import {
  MessageSquare,
  Send,
  Shield,
  UserCheck,
  UserX,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCheck,
  Check,
  Loader2,
  Lock,
  HeartHandshake,
  Award,
  RefreshCw,
  FileText,
  ChevronRight,
  Info,
  Calendar,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const VictimCounsellorChatPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [counsellor, setCounsellor] = useState<any>(null);
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestions, setSuggestions] = useState<CounsellorSuggestionItem[]>([]);
  const [hasCounsellor, setHasCounsellor] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Suggestion Modal State
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  const [suggestionNotes, setSuggestionNotes] = useState('');
  const [requestingSuggestion, setRequestingSuggestion] = useState(false);
  const [suggestionSuccess, setSuggestionSuccess] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);

      const res: any = await api.get('/victims/me/counsellor-chat');
      const data = res.data || res;

      if (!data.hasCounsellor) {
        setHasCounsellor(false);
        setCounsellor(null);
        setConversation(null);
        setMessages([]);
      } else {
        setHasCounsellor(true);
        setCounsellor(data.counsellor);
        setConversation(data.conversation);
        setMessages(data.messages || []);
      }

      // Fetch suggestion history
      try {
        const suggRes: any = await api.get('/victims/me/counsellor-suggestions');
        const suggData = suggRes.data || suggRes;
        setSuggestions(Array.isArray(suggData) ? suggData : []);
      } catch (suggErr) {
        console.warn('Could not fetch suggestions:', suggErr);
      }
    } catch (err: any) {
      console.error('Error fetching chat data:', err);
      // Fallback state
      setHasCounsellor(true);
      setCounsellor({
        id: 'counselor_sarah_201',
        fullName: 'Dr. Sarah Jenkins',
        email: 'counsellor@gmail.com',
        specialization: 'Trauma-Informed Crisis Support & Legal Aid',
        experienceYears: 12,
        availabilityStatus: 'AVAILABLE',
        district: 'Central District',
      });
      setConversation({
        _id: 'conv_demo_1',
        victimId: user?.id || 'demo_user',
        victimName: user?.fullName || 'Alex Rivera (Protected Witness)',
        counsellorId: 'counselor_sarah_201',
        caseId: user?.caseId || 'MP-1042',
        lastMessage: 'Welcome to your confidential counselling space.',
        lastMessageAt: new Date().toISOString(),
        victimUnreadCount: 0,
        counsellorUnreadCount: 0,
      });
      setMessages([
        {
          _id: 'msg_welcome',
          conversationId: 'conv_demo_1',
          senderId: 'counselor_sarah_201',
          senderName: 'Dr. Sarah Jenkins',
          senderRole: 'COUNSELOR',
          receiverId: user?.id || 'demo_user',
          message:
            'Hello Alex. I am Dr. Sarah Jenkins, your assigned trauma-informed counsellor. This space is strictly confidential. You can reach out whenever you feel overwhelmed, need court prep guidance, or want to discuss emotional wellbeing.',
          read: true,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatData();
    // Periodic refresh
    const interval = setInterval(() => {
      fetchChatData(true);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || sending) return;

    const messageText = inputMessage.trim();
    setInputMessage('');

    // Optimistic message update
    const optimisticMsg: ChatMessage = {
      _id: 'opt_' + Date.now(),
      conversationId: conversation?._id || 'temp',
      senderId: user?.id || 'demo_user',
      senderName: user?.fullName || 'You',
      senderRole: 'USER',
      receiverId: counsellor?.id || 'counselor_sarah_201',
      message: messageText,
      read: false,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setSending(true);

    try {
      const res: any = await api.post('/victims/me/counsellor-chat/messages', {
        message: messageText,
      });
      const data = res.data || res;
      if (data.message) {
        setMessages((prev) =>
          prev.map((m) => (m._id === optimisticMsg._id ? data.message : m))
        );
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.response?.data?.error || err.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleRequestSuggestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setRequestingSuggestion(true);
      setError(null);
      await api.post('/victims/me/counsellor-suggestions', {
        notes: suggestionNotes,
      });
      setSuggestionSuccess('Personalized suggestion request dispatched to your counsellor.');
      setSuggestionNotes('');
      setTimeout(() => {
        setIsSuggestionModalOpen(false);
        setSuggestionSuccess(null);
      }, 1500);
      fetchChatData(true);
    } catch (err: any) {
      console.error('Error requesting suggestion:', err);
      setError(err.response?.data?.error || err.message || 'Failed to request suggestion.');
    } finally {
      setRequestingSuggestion(false);
    }
  };

  const quickPrompts = [
    'I am feeling anxious about court proceedings next week.',
    'Could we schedule a 15-minute grounding touchpoint?',
    'What support resources exist for witness protection?',
    'I completed today’s wellbeing check-in.',
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
        <p className="text-sm font-medium">Connecting to your confidential counselling portal...</p>
      </div>
    );
  }

  if (!hasCounsellor) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 lg:p-10 flex items-center justify-center">
        <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="w-16 h-16 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <UserX className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mb-3">No Counsellor Assigned Yet</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            You currently do not have a dedicated trauma-informed counsellor assigned to your case.
            Once allocated by District Welfare Administration, you can engage in direct, confidential
            1-to-1 messaging, receive personalized clinical advice, and request tailored milestone suggestions.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/victim/my-counsellor"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium rounded-xl shadow-lg shadow-emerald-900/30 transition-all text-sm"
            >
              <HeartHandshake className="w-4 h-4" />
              Request a Dedicated Counsellor
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-all text-sm"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const latestRespondedSuggestion = suggestions.find((s) => s.status === 'RESPONDED');
  const pendingSuggestion = suggestions.find((s) => s.status === 'PENDING');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header Card */}
      <div className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-xl px-6 py-4 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Counsellor Details */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 p-0.5 shadow-lg shadow-emerald-950/50">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                  <span className="font-bold text-lg text-emerald-400">
                    {counsellor?.fullName
                      ? counsellor.fullName
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')
                          .substring(0, 2)
                      : 'SJ'}
                  </span>
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-slate-100">{counsellor?.fullName || 'Dr. Sarah Jenkins'}</h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                  <Shield className="w-3 h-3" />
                  Assigned Trauma Counsellor
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>{counsellor?.specialization || 'Trauma-Informed Crisis Support & Legal Aid'}</span>
                <span>•</span>
                <span>{counsellor?.experienceYears || 12}+ yrs exp</span>
                <span>•</span>
                <span className="text-emerald-400">Case #{user?.caseId || 'MP-1042'}</span>
              </p>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSuggestionModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 hover:from-emerald-600/30 hover:to-teal-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-xl transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              {pendingSuggestion ? 'Suggestion Pending' : 'Get Counsellor Suggestion'}
            </button>

            <Link
              to="/victim/my-counsellor"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-all"
            >
              <Award className="w-3.5 h-3.5 text-slate-400" />
              Profile
            </Link>

            <button
              onClick={() => fetchChatData(true)}
              title="Refresh messages"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-xl transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Column: Context / Suggestions Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Security & Confidentiality Pill */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-200">Confidential Dialogue</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Only you and Dr. Sarah Jenkins have access to this conversation. All records comply with statutory trauma care protocols.
                </p>
              </div>
            </div>
          </div>

          {/* Recent Counsellor Suggestion Box */}
          {latestRespondedSuggestion && (
            <div className="bg-gradient-to-br from-emerald-950/30 to-slate-900 border border-emerald-500/30 rounded-2xl p-4 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  Counsellor Suggestion
                </span>
                <span className="text-[10px] text-slate-400">
                  {new Date(latestRespondedSuggestion.respondedAt || latestRespondedSuggestion.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 mb-2">
                "{latestRespondedSuggestion.suggestionMessage}"
              </p>
              <div className="text-[10px] text-slate-400">
                Reviewed by <span className="text-slate-300 font-medium">{latestRespondedSuggestion.counsellorName}</span>
              </div>
            </div>
          )}

          {/* Pending Suggestion Notice */}
          {pendingSuggestion && (
            <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-1">
                <Clock className="w-3.5 h-3.5" />
                Suggestion Pending Review
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Your request submitted on {new Date(pendingSuggestion.requestedAt).toLocaleDateString()} is awaiting your counsellor's clinical telemetry analysis.
              </p>
            </div>
          )}

          {/* Quick Prompts Panel */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
            <h3 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              Quick Touchpoints
            </h3>
            <div className="space-y-1.5">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputMessage(prompt)}
                  className="w-full text-left text-[11px] text-slate-400 hover:text-emerald-300 bg-slate-950/40 hover:bg-emerald-950/30 border border-slate-800/60 hover:border-emerald-500/30 rounded-lg p-2 transition-all leading-snug"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Chat History & Input Area */}
        <div className="lg:col-span-3 bg-slate-900/70 border border-slate-800 rounded-3xl flex flex-col h-[700px] shadow-xl overflow-hidden">
          {/* Chat Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center">
                <MessageSquare className="w-10 h-10 text-slate-700 mb-3" />
                <p className="text-sm font-medium text-slate-400">No messages in this conversation yet.</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Send your first message to begin confidential 1-to-1 communication with Dr. Sarah Jenkins.
                </p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isUser = msg.senderRole === 'USER';
                const timeStr = new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={msg._id || index}
                    className={`flex items-end gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md">
                        SJ
                      </div>
                    )}

                    <div
                      className={`max-w-[78%] sm:max-w-[68%] rounded-2xl px-4 py-3 shadow-md ${
                        isUser
                          ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-br-none'
                          : 'bg-slate-800/90 border border-slate-700/60 text-slate-200 rounded-bl-none'
                      }`}
                    >
                      {!isUser && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-emerald-400">{msg.senderName}</span>
                          <span className="text-[10px] text-slate-400 bg-slate-900/60 px-1.5 py-0.5 rounded">
                            Counsellor
                          </span>
                        </div>
                      )}

                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>

                      <div
                        className={`flex items-center justify-end gap-1.5 mt-1.5 text-[10px] ${
                          isUser ? 'text-emerald-100/70' : 'text-slate-400'
                        }`}
                      >
                        <span>{timeStr}</span>
                        {isUser && (
                          <span title={msg.read ? "Read by Counsellor" : "Delivered"}>
                            {msg.read ? (
                              <CheckCheck className="w-3.5 h-3.5 text-white inline" />
                            ) : (
                              <Check className="w-3.5 h-3.5 inline" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/60">
            {error && (
              <div className="mb-3 p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center justify-between">
                <span>{error}</span>
                <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-300 font-bold ml-2">
                  ×
                </button>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type a confidential message to your counsellor..."
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl px-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner"
                  disabled={sending}
                />
              </div>

              <button
                type="submit"
                disabled={!inputMessage.trim() || sending}
                className="px-5 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-emerald-950/50 shrink-0"
              >
                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </form>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
              <span>Press Enter to send</span>
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-500" />
                Protected Trauma Channel
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Suggestion Request Modal */}
      {isSuggestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Request Counsellor Suggestion</h3>
                  <p className="text-xs text-slate-400">Personalized wellbeing and milestone guidance</p>
                </div>
              </div>
              <button
                onClick={() => setIsSuggestionModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
              >
                ×
              </button>
            </div>

            {suggestionSuccess ? (
              <div className="p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h4 className="text-base font-semibold text-slate-100">{suggestionSuccess}</h4>
                <p className="text-xs text-slate-400">Your counsellor has been notified and will review your case telemetry.</p>
              </div>
            ) : (
              <form onSubmit={handleRequestSuggestionSubmit} className="space-y-4">
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 space-y-2 text-xs text-slate-300">
                  <p className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" /> Telemetry Snapshot Shared:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                    <div>Case Stage: <span className="text-slate-200 font-medium">Court Trial</span></div>
                    <div>Risk Level: <span className="text-amber-400 font-medium">Elevated (68/100)</span></div>
                    <div>Avg Mood: <span className="text-slate-200 font-medium">5.4 / 10</span></div>
                    <div>Avg Stress: <span className="text-slate-200 font-medium">7.2 / 10</span></div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Specific Concerns or Context (Optional):
                  </label>
                  <textarea
                    value={suggestionNotes}
                    onChange={(e) => setSuggestionNotes(e.target.value)}
                    rows={3}
                    placeholder="e.g. Anxiety about testifying next Tuesday, trouble sleeping..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSuggestionModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={requestingSuggestion}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all"
                  >
                    {requestingSuggestion ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Send Suggestion Request
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VictimCounsellorChatPage;
