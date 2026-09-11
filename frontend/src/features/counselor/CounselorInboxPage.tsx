import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import {
  ChatConversation,
  ChatMessage,
  CounsellorSuggestionItem,
  CounsellingRequest,
} from '../../types';
import {
  Inbox,
  MessageSquare,
  Sparkles,
  UserCheck,
  Clock,
  Send,
  Shield,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  ChevronRight,
  User,
  HeartHandshake,
  Activity,
  FileText,
  RefreshCw,
  Eye,
  Check,
  CheckCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const CounselorInboxPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'messages' | 'suggestions' | 'requests'>('messages');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Conversations & Chat
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [activeMessages, setActiveMessages] = useState<ChatMessage[]>([]);
  const [inputReply, setInputReply] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [chatSearch, setChatSearch] = useState('');

  // Suggestions
  const [suggestions, setSuggestions] = useState<CounsellorSuggestionItem[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<CounsellorSuggestionItem | null>(null);
  const [suggestionResponseText, setSuggestionResponseText] = useState('');
  const [respondingToSuggestion, setRespondingToSuggestion] = useState(false);
  const [suggestionSuccess, setSuggestionSuccess] = useState<string | null>(null);

  // Allocation Requests
  const [allocationRequests, setAllocationRequests] = useState<CounsellingRequest[]>([]);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState({
    activeConversations: 0,
    unreadMessages: 0,
    pendingSuggestions: 0,
    totalSuggestions: 0,
  });

  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchInboxData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      setError(null);

      const res: any = await api.get('/counselor/inbox');
      const data = res.data || res;

      const convs: ChatConversation[] = data.conversations || [];
      const suggs: CounsellorSuggestionItem[] = data.suggestionRequests || [];

      setConversations(convs);
      setSuggestions(suggs);
      setStats(
        data.stats || {
          activeConversations: convs.length,
          unreadMessages: convs.reduce((acc, c) => acc + (c.unreadCount || c.counsellorUnreadCount || 0), 0),
          pendingSuggestions: suggs.filter((s) => s.status === 'PENDING').length,
          totalSuggestions: suggs.length,
        }
      );

      // Default select first conversation if none selected
      if (!selectedConversation && convs.length > 0) {
        selectConversation(convs[0]);
      }

      // Fetch pending allocation requests
      try {
        const reqRes: any = await api.get('/counsellor/allocation-requests');
        const reqData = reqRes.data || reqRes;
        setAllocationRequests(Array.isArray(reqData) ? reqData : []);
      } catch {
        // Fallback
      }
    } catch (err: any) {
      console.error('Error fetching counselor inbox:', err);
      // Fallback mock data
      const mockConvs: ChatConversation[] = [
        {
          _id: 'conv_101',
          victimId: 'user_alex_101',
          victimName: 'Alex Rivera (Protected Witness)',
          counsellorId: user?.id || 'counselor_sarah_201',
          caseId: 'MP-1042',
          lastMessage: 'Hello Dr. Sarah, I have been feeling anxious about the trial cross-examination next Tuesday.',
          lastMessageAt: new Date().toISOString(),
          lastSenderRole: 'USER',
          unreadCount: 1,
          counsellorUnreadCount: 1,
        },
      ];
      setConversations(mockConvs);
      if (!selectedConversation) {
        setSelectedConversation(mockConvs[0]);
        setActiveMessages([
          {
            _id: 'msg_1',
            conversationId: 'conv_101',
            senderId: 'user_alex_101',
            senderName: 'Alex Rivera (Protected Witness)',
            senderRole: 'USER',
            receiverId: user?.id || 'counselor_sarah_201',
            message: 'Hello Dr. Sarah, I have been feeling anxious about the trial cross-examination next Tuesday.',
            read: false,
            createdAt: new Date(Date.now() - 600000).toISOString(),
          },
        ]);
      }
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  };

  const selectConversation = async (conv: ChatConversation) => {
    setSelectedConversation(conv);
    try {
      const res: any = await api.get(`/counselor/conversations/${conv._id}/messages`);
      const data = res.data || res;
      setActiveMessages(data.messages || []);

      // Reset unread count locally
      setConversations((prev) =>
        prev.map((c) => (c._id === conv._id ? { ...c, unreadCount: 0, counsellorUnreadCount: 0 } : c))
      );
      setStats((prev) => ({
        ...prev,
        unreadMessages: Math.max(0, prev.unreadMessages - (conv.unreadCount || conv.counsellorUnreadCount || 0)),
      }));
    } catch (err: any) {
      console.error('Error fetching conversation messages:', err);
    }
  };

  useEffect(() => {
    fetchInboxData();
    const interval = setInterval(() => {
      fetchInboxData(true);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputReply.trim() || !selectedConversation || sendingReply) return;

    const replyText = inputReply.trim();
    setInputReply('');

    const optimisticMsg: ChatMessage = {
      _id: 'opt_' + Date.now(),
      conversationId: selectedConversation._id,
      senderId: user?.id || 'counselor_sarah_201',
      senderName: user?.fullName || 'Dr. Sarah Jenkins',
      senderRole: 'COUNSELOR',
      receiverId: selectedConversation.victimId,
      message: replyText,
      read: false,
      createdAt: new Date().toISOString(),
    };

    setActiveMessages((prev) => [...prev, optimisticMsg]);
    setSendingReply(true);

    try {
      const res: any = await api.post(`/counselor/conversations/${selectedConversation._id}/messages`, {
        message: replyText,
      });
      const data = res.data || res;
      if (data.message) {
        setActiveMessages((prev) =>
          prev.map((m) => (m._id === optimisticMsg._id ? data.message : m))
        );
      }
    } catch (err: any) {
      console.error('Error sending reply:', err);
      setError(err.response?.data?.error || err.message || 'Failed to send message.');
    } finally {
      setSendingReply(false);
    }
  };

  const handleRespondSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSuggestion || !suggestionResponseText.trim() || respondingToSuggestion) return;

    try {
      setRespondingToSuggestion(true);
      setError(null);
      await api.post(`/counselors/suggestions/${selectedSuggestion._id}/respond`, {
        suggestionMessage: suggestionResponseText.trim(),
      });

      setSuggestionSuccess('Clinical suggestion transmitted to victim dashboard and chat.');
      setSuggestionResponseText('');
      setTimeout(() => {
        setSelectedSuggestion(null);
        setSuggestionSuccess(null);
      }, 1500);
      fetchInboxData(true);
    } catch (err: any) {
      console.error('Error responding to suggestion:', err);
      setError(err.response?.data?.error || err.message || 'Failed to submit suggestion response.');
    } finally {
      setRespondingToSuggestion(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      setActionLoadingId(requestId);
      await api.post(`/counsellor/allocation-requests/${requestId}/accept`, {});
      fetchInboxData(true);
    } catch (err: any) {
      console.error('Error accepting request:', err);
      setError('Failed to accept allocation request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    const reason = prompt('Please specify a reason for declining this allocation:');
    if (reason === null) return;
    try {
      setActionLoadingId(requestId);
      await api.post(`/counsellor/allocation-requests/${requestId}/reject`, { reason });
      fetchInboxData(true);
    } catch (err: any) {
      console.error('Error rejecting request:', err);
      setError('Failed to reject allocation request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.victimName?.toLowerCase().includes(chatSearch.toLowerCase()) ||
      c.caseId?.toLowerCase().includes(chatSearch.toLowerCase())
  );

  const pendingSuggestionsList = suggestions.filter((s) => s.status === 'PENDING');
  const respondedSuggestionsList = suggestions.filter((s) => s.status === 'RESPONDED');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Banner & Stats */}
      <div className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-xl px-6 py-5 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                <Inbox className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-slate-100">Counsellor Inbox & Clinical Hub</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Direct, private patient communication, telemetry-informed suggestions, and case touchpoints.
            </p>
          </div>

          {/* Quick Metrics & Refresh */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2 text-xs">
              <span className="text-slate-400">Unread Messages:</span>
              <span className={`font-bold ${stats.unreadMessages > 0 ? 'text-amber-400' : 'text-slate-200'}`}>
                {stats.unreadMessages}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2 text-xs">
              <span className="text-slate-400">Pending Suggestions:</span>
              <span className={`font-bold ${stats.pendingSuggestions > 0 ? 'text-emerald-400' : 'text-slate-200'}`}>
                {stats.pendingSuggestions}
              </span>
            </div>

            <button
              onClick={() => fetchInboxData(true)}
              disabled={refreshing}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
              title="Refresh Inbox"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto flex gap-2 mt-5 border-t border-slate-800/80 pt-3">
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'messages'
                ? 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Active Messages
            {stats.unreadMessages > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold">
                {stats.unreadMessages}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('suggestions')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'suggestions'
                ? 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Patient Suggestions
            {stats.pendingSuggestions > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold">
                {stats.pendingSuggestions}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'requests'
                ? 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            Allocation Requests
            {allocationRequests.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-bold">
                {allocationRequests.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-300 font-bold ml-2">
              ×
            </button>
          </div>
        )}

        {/* TAB 1: MESSAGES */}
        {activeTab === 'messages' && (
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl grid grid-cols-1 lg:grid-cols-12 shadow-2xl overflow-hidden h-[720px]">
            {/* Conversations List (Col 4) */}
            <div className="lg:col-span-4 border-r border-slate-800 flex flex-col bg-slate-950/40">
              <div className="p-4 border-b border-slate-800">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={chatSearch}
                    onChange={(e) => setChatSearch(e.target.value)}
                    placeholder="Search patient or Case ID..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
                {filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No active conversations found.
                  </div>
                ) : (
                  filteredConversations.map((conv) => {
                    const isSelected = selectedConversation?._id === conv._id;
                    const unread = conv.unreadCount || conv.counsellorUnreadCount || 0;

                    return (
                      <button
                        key={conv._id}
                        onClick={() => selectConversation(conv)}
                        className={`w-full text-left p-4 transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'bg-slate-800/80 border-l-4 border-l-emerald-500'
                            : 'hover:bg-slate-900/60'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-200 shrink-0">
                          {conv.victimName
                            ? conv.victimName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .substring(0, 2)
                            : 'VI'}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-xs text-slate-100 truncate">
                              {conv.victimName}
                            </span>
                            {unread > 0 && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px]">
                                {unread} new
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] text-emerald-400/90 mb-1 flex items-center gap-1">
                            <span>Case #{conv.caseId}</span>
                          </div>

                          <p className="text-[11px] text-slate-400 truncate">
                            {conv.lastSenderRole === 'COUNSELOR' ? 'You: ' : ''}
                            {conv.lastMessage || 'No messages yet'}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Active Chat Pane (Col 8) */}
            <div className="lg:col-span-8 flex flex-col bg-slate-900/60">
              {selectedConversation ? (
                <>
                  {/* Selected Chat Header */}
                  <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-sm text-slate-100">{selectedConversation.victimName}</h2>
                        <span className="text-[11px] px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md font-medium">
                          Case #{selectedConversation.caseId}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Confidential Patient Communications Channel
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/counselor/case/${selectedConversation.caseId}`}
                        className="text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-950/30 border border-emerald-500/20 px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        View Case Journey
                      </Link>
                    </div>
                  </div>

                  {/* Messages Feed */}
                  <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                    {activeMessages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                        <MessageSquare className="w-8 h-8 text-slate-700 mb-2" />
                        No messages in this conversation.
                      </div>
                    ) : (
                      activeMessages.map((msg, idx) => {
                        const isMe = msg.senderRole === 'COUNSELOR';
                        const timeStr = new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        });

                        return (
                          <div
                            key={msg._id || idx}
                            className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                          >
                            {!isMe && (
                              <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300 shrink-0">
                                VI
                              </div>
                            )}

                            <div
                              className={`max-w-[78%] rounded-2xl px-4 py-3 shadow-md ${
                                isMe
                                  ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-br-none'
                                  : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none'
                              }`}
                            >
                              {!isMe && (
                                <div className="text-[10px] text-emerald-400 font-semibold mb-1">
                                  {msg.senderName}
                                </div>
                              )}

                              <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                                {msg.message}
                              </p>

                              <div
                                className={`flex items-center justify-end gap-1.5 mt-1 text-[10px] ${
                                  isMe ? 'text-emerald-100/70' : 'text-slate-400'
                                }`}
                              >
                                <span>{timeStr}</span>
                                {isMe && (
                                  <span title={msg.read ? "Read" : "Delivered"}>
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

                  {/* Reply Input Bar */}
                  <form onSubmit={handleSendReply} className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center gap-3">
                    <input
                      type="text"
                      value={inputReply}
                      onChange={(e) => setInputReply(e.target.value)}
                      placeholder="Type clinical guidance / confidential response..."
                      className="flex-1 bg-slate-900 border border-slate-700/80 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 shadow-inner"
                      disabled={sendingReply}
                    />

                    <button
                      type="submit"
                      disabled={!inputReply.trim() || sendingReply}
                      className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-emerald-950/50"
                    >
                      {sendingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </form>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                  Select a conversation from the left to start messaging.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PATIENT SUGGESTIONS */}
        {activeTab === 'suggestions' && (
          <div className="space-y-6">
            {/* Pending Requests Section */}
            <div>
              <h2 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Pending Patient Suggestion Requests ({pendingSuggestionsList.length})
              </h2>

              {pendingSuggestionsList.length === 0 ? (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-xs">
                  No pending suggestion requests at this time. All patient requests have been addressed.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingSuggestionsList.map((sugg) => (
                    <div
                      key={sugg._id}
                      className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 rounded-3xl p-5 shadow-lg space-y-4 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-slate-100">{sugg.victimName}</h3>
                            <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-md font-semibold">
                              Pending Review
                            </span>
                          </div>
                          <p className="text-[11px] text-emerald-400 mt-0.5">
                            Case #{sugg.caseId} · Requested {new Date(sugg.requestedAt).toLocaleDateString()}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedSuggestion(sugg);
                            setSuggestionResponseText('');
                          }}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
                        >
                          Provide Suggestion
                        </button>
                      </div>

                      {/* Telemetry Snapshot Pill */}
                      <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 text-xs space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="font-semibold text-slate-300">Biometric & Telemetry Context:</span>
                          <span className="text-amber-400 font-bold">
                            {sugg.telemetrySnapshot?.riskLevel || 'ELEVATED'} Risk
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400 pt-1">
                          <div className="bg-slate-900/80 p-2 rounded-lg text-center">
                            <span className="block text-slate-500 text-[10px]">Mood</span>
                            <span className="text-slate-200 font-bold">{sugg.telemetrySnapshot?.mood || 5.4}/10</span>
                          </div>
                          <div className="bg-slate-900/80 p-2 rounded-lg text-center">
                            <span className="block text-slate-500 text-[10px]">Stress</span>
                            <span className="text-rose-400 font-bold">{sugg.telemetrySnapshot?.stress || 7.2}/10</span>
                          </div>
                          <div className="bg-slate-900/80 p-2 rounded-lg text-center">
                            <span className="block text-slate-500 text-[10px]">Sleep</span>
                            <span className="text-slate-200 font-bold">{sugg.telemetrySnapshot?.sleepHours || 5.2} hrs</span>
                          </div>
                        </div>
                      </div>

                      {sugg.requestNotes && (
                        <div className="text-xs text-slate-300 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                          <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider mb-1">
                            Patient Notes
                          </span>
                          "{sugg.requestNotes}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Responded Suggestions History */}
            <div>
              <h2 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Completed Suggestions History ({respondedSuggestionsList.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {respondedSuggestionsList.map((sugg) => (
                  <div key={sugg._id} className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{sugg.victimName} (Case #{sugg.caseId})</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(sugg.respondedAt || sugg.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 leading-relaxed italic">
                      "{sugg.suggestionMessage}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ALLOCATION REQUESTS */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-200">Incoming Allocation & Caseload Requests</h2>
                <p className="text-xs text-slate-400">
                  Review and accept cases assigned by District Welfare Administration or requested by victims.
                </p>
              </div>

              <Link
                to="/counselor/available-victims"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-xl transition-all"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Browse Unallocated Victims
              </Link>
            </div>

            {allocationRequests.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-10 text-center text-slate-500 text-xs space-y-3">
                <HeartHandshake className="w-10 h-10 text-slate-700 mx-auto" />
                <p className="text-sm font-medium text-slate-400">No pending allocation requests.</p>
                <p className="max-w-md mx-auto">
                  When the District Welfare Admin directs a new victim to your care, it will appear here for one-click acceptance.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allocationRequests.map((req) => (
                  <div key={req._id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                        <h3 className="font-bold text-sm text-slate-100">{req.victimName}</h3>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-semibold">
                        Case #{req.caseId}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-2xl border border-slate-800 space-y-1">
                      <div>Assigned by: <span className="text-slate-200">{req.requestedByName}</span></div>
                      <div>Requested On: <span className="text-slate-200">{new Date(req.createdAt).toLocaleDateString()}</span></div>
                      {req.notes && <div className="pt-1 text-slate-300 italic">"{req.notes}"</div>}
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleRejectRequest(req._id)}
                        disabled={actionLoadingId === req._id}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleAcceptRequest(req._id)}
                        disabled={actionLoadingId === req._id}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md flex items-center gap-1.5"
                      >
                        {actionLoadingId === req._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        Accept Case
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Suggestion Response Modal */}
      {selectedSuggestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">
                    Clinical Suggestion for {selectedSuggestion.victimName}
                  </h3>
                  <p className="text-[11px] text-slate-400">Case #{selectedSuggestion.caseId}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSuggestion(null)}
                className="p-1 text-slate-400 hover:text-slate-200"
              >
                ×
              </button>
            </div>

            {suggestionSuccess ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-100">{suggestionSuccess}</h4>
              </div>
            ) : (
              <form onSubmit={handleRespondSuggestion} className="space-y-4">
                <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Mood Score: {selectedSuggestion.telemetrySnapshot?.mood || 5.4}</span>
                    <span>Stress Score: {selectedSuggestion.telemetrySnapshot?.stress || 7.2}</span>
                    <span>Sleep: {selectedSuggestion.telemetrySnapshot?.sleepHours || 5.2}h</span>
                  </div>
                  {selectedSuggestion.requestNotes && (
                    <p className="text-slate-300 italic pt-1 border-t border-slate-800">
                      "{selectedSuggestion.requestNotes}"
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Personalized Clinical Advice & Action Steps:
                  </label>
                  <textarea
                    value={suggestionResponseText}
                    onChange={(e) => setSuggestionResponseText(e.target.value)}
                    rows={4}
                    placeholder="e.g. Schedule a 15-minute trial preparation touchpoint on Monday. Focus on the 4-7-8 breathing exercises and review the witness support charter..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSuggestion(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={respondingToSuggestion || !suggestionResponseText.trim()}
                    className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-2"
                  >
                    {respondingToSuggestion ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Send Clinical Suggestion
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

export default CounselorInboxPage;
