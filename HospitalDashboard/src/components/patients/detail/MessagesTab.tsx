import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import { supabase, hasSupabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/authStore';
import type { DirectMessage } from '../../../types';

interface MessagesTabProps {
  patientId: string;
  patientName: string;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function MessagesTab({ patientId, patientName }: MessagesTabProps) {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const userId = useAuthStore((s) => s.userId);
  const profile = useAuthStore((s) => s.profile);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    });
  }, []);

  const loadMessages = useCallback(async () => {
    if (!hasSupabase || !supabase) return;

    const { data, error } = await supabase
      .from('direct_messages')
      .select('id, patient_id, sender_type, sender_id, content, read_at, created_at')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) {
      console.error('Failed to load messages:', error);
      setLoading(false);
      return;
    }

    setMessages(data ?? []);
    setLoading(false);

    // Mark unread patient messages as read
    const unreadPatientMsgs = (data ?? [])
      .filter((m) => m.sender_type === 'patient' && !m.read_at)
      .map((m) => m.id);

    if (unreadPatientMsgs.length > 0 && supabase) {
      const { error: updateErr } = await supabase
        .from('direct_messages')
        .update({ read_at: new Date().toISOString() })
        .in('id', unreadPatientMsgs);
      if (updateErr) {
        console.error('Failed to mark messages as read:', updateErr);
      }
    }
  }, [patientId]);

  // Initial load
  useEffect(() => {
    loadMessages().then(scrollToBottom);
  }, [loadMessages, scrollToBottom]);

  // Polling fallback: refetch messages every 5 seconds to catch anything
  // realtime misses (network issues, subscription gaps)
  useEffect(() => {
    const interval = setInterval(() => {
      loadMessages().then(() => {
        // Only scroll if we're near the bottom already
        if (scrollRef.current) {
          const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
          if (scrollHeight - scrollTop - clientHeight < 100) {
            scrollToBottom();
          }
        }
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [loadMessages, scrollToBottom]);

  // Realtime subscription for new messages (instant delivery when it works)
  useEffect(() => {
    if (!hasSupabase || !supabase) return;

    const channel = supabase
      .channel(`dm-${patientId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `patient_id=eq.${patientId}`,
        },
        (payload) => {
          const newMsg = payload.new as DirectMessage;
          setMessages((prev) => {
            // Deduplicate: skip if we already have this message
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          scrollToBottom();

          // Auto-mark patient messages as read
          if (newMsg.sender_type === 'patient' && !newMsg.read_at && supabase) {
            supabase
              .from('direct_messages')
              .update({ read_at: new Date().toISOString() })
              .eq('id', newMsg.id)
              .then(({ error }) => {
                if (error) console.error('Failed to mark message as read:', error);
              });
          }
        },
      )
      .subscribe();

    return () => {
      supabase!.removeChannel(channel);
    };
  }, [patientId, scrollToBottom]);

  async function handleSend() {
    const text = input.trim();
    if (!text || !hasSupabase || !supabase || !userId || sending) return;
    setSending(true);
    setInput('');

    // Optimistic add
    const tempId = `temp-${Date.now()}`;
    const optimistic: DirectMessage = {
      id: tempId,
      patient_id: patientId,
      sender_type: 'coordinator',
      sender_id: userId,
      content: text,
      read_at: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    scrollToBottom();

    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .insert({
          patient_id: patientId,
          sender_type: 'coordinator',
          sender_id: userId,
          content: text,
        })
        .select('id, created_at')
        .single();

      if (error) {
        console.error('Failed to send message:', error);
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      } else if (data) {
        // Replace optimistic message with real data
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId ? { ...optimistic, id: data.id, created_at: data.created_at } : m,
          ),
        );
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setSending(false);
      inputRef.current?.focus();
      // Refetch to ensure consistency after send
      setTimeout(() => loadMessages(), 500);
    }
  }

  if (loading) {
    return (
      <div className="p-5 text-center">
        <p className="text-sm text-slate-400 font-sans">Loading messages…</p>
      </div>
    );
  }

  const coordinatorName = profile?.display_name ?? 'You';

  return (
    <div className="flex flex-col h-full">
      {/* Messages thread */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle size={32} className="text-slate-300 mx-auto mb-3" aria-hidden="true" />
            <p className="text-sm text-slate-400 font-sans mb-1">No messages yet</p>
            <p className="text-xs text-slate-400 font-sans">
              Send a message to {patientName}. They'll see it in their app.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isCoord = msg.sender_type === 'coordinator';
            return (
              <div key={msg.id} className={`flex ${isCoord ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${isCoord ? 'items-end' : 'items-start'}`}>
                  {!isCoord && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-slate-500 font-sans">P</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-sans">{patientName}</span>
                    </div>
                  )}
                  {isCoord && (
                    <div className="flex items-center justify-end gap-1.5 mb-1">
                      <span className="text-[11px] text-slate-400 font-sans">{coordinatorName}</span>
                    </div>
                  )}
                  <div
                    className={`rounded-xl px-3.5 py-2.5 text-sm font-sans leading-relaxed ${
                      isCoord
                        ? 'bg-forest text-white rounded-br-sm'
                        : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                    }`}
                    style={!isCoord ? { userSelect: 'none' } : undefined}
                    onCopy={
                      !isCoord
                        ? (e) => {
                            e.preventDefault();
                            alert('Copying patient messages is restricted per privacy policy.');
                          }
                        : undefined
                    }
                  >
                    {msg.content}
                  </div>
                  <div className={`flex items-center gap-1 mt-0.5 px-1 ${isCoord ? 'justify-end' : ''}`}>
                    <span className="text-[10px] text-slate-400 font-sans">
                      {formatTime(msg.created_at)}
                    </span>
                    {isCoord && msg.read_at && (
                      <span className="text-[10px] text-green-600 font-sans font-medium">· Read</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Compose area */}
      <div className="border-t border-slate-100 p-3 flex items-end gap-2 bg-white shrink-0">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={`Message ${patientName}…`}
          rows={1}
          className="flex-1 resize-none rounded-lg border border-slate-200 bg-slate-50
            px-3 py-2 text-sm font-sans text-slate-800 placeholder:text-slate-400
            focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest transition
            leading-snug"
          style={{ minHeight: '36px', maxHeight: '100px' }}
          aria-label="Message input"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="w-9 h-9 rounded-lg bg-forest flex items-center justify-center text-white
            shrink-0 transition-all hover:bg-forest-light
            disabled:opacity-40 disabled:cursor-not-allowed
            focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-1"
          aria-label="Send message"
        >
          <Send size={15} strokeWidth={2.5} className={sending ? 'animate-pulse' : ''} />
        </button>
      </div>
    </div>
  );
}
