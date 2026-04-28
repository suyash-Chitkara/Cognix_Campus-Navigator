import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Sparkles, ArrowDown, Clock, Zap, MapPin, Route, Building2, Compass, Brain, Mic, MicOff, Copy, Check, ChevronRight, RotateCcw } from 'lucide-react';
import { useVoiceInput } from '../hooks/useVoiceInput';

// ─── Markdown-lite renderer ───
function RichText({ text }) {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    // Parse **bold**, *italic*, and inline code `code`
    const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**'))
        return <strong key={j} style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
      if (part.startsWith('*') && part.endsWith('*'))
        return <em key={j} style={{ opacity: 0.8, fontStyle: 'italic' }}>{part.slice(1, -1)}</em>;
      if (part.startsWith('`') && part.endsWith('`'))
        return <code key={j} style={{
          background: 'rgba(99,102,241,0.12)', padding: '1px 5px', borderRadius: 4,
          fontSize: '0.85em', fontFamily: 'JetBrains Mono, monospace', color: 'var(--brand-light)',
        }}>{part.slice(1, -1)}</code>;
      return part;
    });
    // Bullet point styling
    const isBullet = line.trimStart().startsWith('•');
    return (
      <div key={i} style={{
        ...(isBullet ? { paddingLeft: 4, display: 'flex', gap: 6 } : {}),
        minHeight: line.trim() === '' ? 8 : undefined,
      }}>
        {parts}
      </div>
    );
  });
}

// ─── Individual message bubble ───
function MessageBubble({ msg, onCopy }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === 'user';

  const handleCopy = () => {
    navigator.clipboard?.writeText(msg.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex gap-2.5 group ${isUser ? 'flex-row-reverse' : ''}`}
      style={{ animation: 'slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
    >
      {/* Avatar */}
      <div className="shrink-0 mt-0.5">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{
            background: isUser
              ? 'linear-gradient(135deg, var(--brand), var(--brand-dark))'
              : 'linear-gradient(135deg, #6366f1, #06b6d4)',
            boxShadow: isUser
              ? '0 3px 12px rgba(99,102,241,0.25)'
              : '0 3px 12px rgba(6,182,212,0.2)',
          }}
        >
          {isUser ? <User size={13} strokeWidth={2.5} /> : <Brain size={13} strokeWidth={2.5} />}
        </div>
      </div>

      {/* Bubble + metadata */}
      <div className={`max-w-[82%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Sender label */}
        <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '0 2px' }}>
          {isUser ? 'You' : 'Cognix AI'}
        </span>

        {/* Content bubble */}
        <div
          className={`rounded-2xl px-4 py-3 text-[13px] leading-[1.65] relative ${isUser ? 'rounded-tr-md' : 'rounded-tl-md'}`}
          style={{
            background: isUser
              ? 'linear-gradient(135deg, var(--brand), var(--brand-dark))'
              : 'var(--bg-tertiary)',
            color: isUser ? 'rgba(255,255,255,0.95)' : 'var(--text-secondary)',
            boxShadow: isUser
              ? '0 4px 20px rgba(99,102,241,0.2)'
              : '0 2px 8px rgba(0,0,0,0.08)',
            border: isUser ? 'none' : '1px solid var(--border)',
          }}
        >
          <RichText text={msg.text} />
        </div>

        {/* Footer: time + copy */}
        <div className={`flex items-center gap-2 px-1 ${isUser ? 'flex-row-reverse' : ''}`}>
          <span className="text-[9px] font-medium flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
            <Clock size={7} />
            {formatTime(msg.time)}
          </span>
          {!isUser && (
            <button
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-white/5"
              title="Copy message"
            >
              {copied
                ? <Check size={10} style={{ color: 'var(--success)' }} />
                : <Copy size={10} style={{ color: 'var(--text-muted)' }} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Building card shown when bot mentions buildings ───
function BuildingCards({ buildings, onBuildingClick }) {
  if (!buildings || buildings.length === 0) return null;
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 ml-10" style={{ scrollbarWidth: 'none' }}>
      {buildings.slice(0, 4).map((b) => (
        <button
          key={b.id}
          onClick={() => onBuildingClick?.(b)}
          className="shrink-0 px-3 py-2 rounded-xl text-left transition-all hover:scale-[1.03] hover:shadow-lg"
          style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            minWidth: 140,
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Building2 size={11} style={{ color: 'var(--brand-light)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>{b.name}</span>
          </div>
          <span style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
            {b.type}
          </span>
        </button>
      ))}
    </div>
  );
}

// ─── Typing indicator with shimmer ───
function TypingIndicator() {
  return (
    <div className="flex gap-2.5 animate-fade-in">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}
      >
        <Brain size={13} strokeWidth={2.5} className="text-white" />
      </div>
      <div className="flex flex-col gap-1 items-start">
        <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '0 2px' }}>
          Cognix AI
        </span>
        <div className="rounded-2xl rounded-tl-md px-5 py-3.5 flex items-center gap-2"
          style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}
        >
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full typing-dot" style={{ background: '#6366f1' }} />
            <div className="w-2 h-2 rounded-full typing-dot" style={{ background: '#818cf8' }} />
            <div className="w-2 h-2 rounded-full typing-dot" style={{ background: '#06b6d4' }} />
          </div>
          <span className="text-[10px] font-medium ml-1" style={{ color: 'var(--text-muted)' }}>Thinking...</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  MAIN CHATPANEL COMPONENT
// ═══════════════════════════════════════════════════
export default function ChatPanel({ onMapAction, selectedBuilding }) {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: `👋 Hi! I'm **Cognix**, your AI-powered campus navigator for Chitkara University.\n\nI can help you:\n• 📍 Find locations — *\"Where is Turing Block?\"*\n• 🗺️ Navigate — *\"Route from Library to Block C\"*\n• 🏥 Find facilities — *\"Nearest medical room\"*\n• 📋 Get info — *\"Tell me about the Auditorium\"*\n• 📏 Distances — *\"How far is Hostel from Gate 4?\"*\n\nWhat would you like to know?`,
      time: new Date(),
      buildings: [],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Voice input
  const voice = useVoiceInput();

  // When voice transcript changes, fill input
  useEffect(() => {
    if (voice.transcript) {
      setInput(voice.transcript);
    }
  }, [voice.transcript]);

  // Auto-send when voice stops and there's a transcript
  useEffect(() => {
    if (!voice.listening && voice.transcript.trim()) {
      // Small delay to let the last words finalize
      const t = setTimeout(() => {
        handleSend(voice.transcript.trim());
      }, 500);
      return () => clearTimeout(t);
    }
  }, [voice.listening]);

  // ── Trivia facts ──
  const triviaFacts = [
    "🎓 Chitkara University was established in 2010 by the Punjab State Legislature.",
    "🌳 The sprawling campus is spread over 50 acres on the Chandigarh-Patiala National Highway.",
    "🚀 The Exploretorium is an interactive science and tech museum built to stimulate curiosity.",
    "💡 Over 250+ patents have been filed by Chitkara students and faculty in recent years!",
    "🌍 Chitkara hosts a massive 'Global Week' where professors from 50+ international universities come to teach.",
    "🍕 Square One is the most popular hub for food, socializing, and student events.",
    "💼 The university has a strong focus on entrepreneurship, supported by the CEED incubator.",
  ];
  const [trivia, setTrivia] = useState('');
  useEffect(() => {
    setTrivia(triviaFacts[Math.floor(Math.random() * triviaFacts.length)]);
  }, []);

  // ── Auto-scroll on new message ──
  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, 100);
  }, [messages]);

  // ── Scroll detection for FAB ──
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
      setShowScrollBtn(!atBottom);
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // ── Building click auto-fill ──
  useEffect(() => {
    if (selectedBuilding) {
      setInput(`Tell me about ${selectedBuilding.name}`);
      inputRef.current?.focus();
    }
  }, [selectedBuilding]);

  const handleSend = useCallback(async (overrideMsg) => {
    const msg = (overrideMsg || input).trim();
    if (!msg || loading) return;

    const userMsg = { role: 'user', text: msg, time: new Date(), buildings: [] };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setMessageCount(c => c + 1);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: 'bot',
        text: data.text,
        time: new Date(),
        buildings: data.buildings || [],
      }]);
      if (data.actions?.length > 0) {
        onMapAction?.(data.actions);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'bot',
        text: '❌ Unable to connect to server. Make sure the backend is running on port 5000.',
        time: new Date(),
        buildings: [],
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, onMapAction]);

  const handleClearChat = () => {
    setMessages([messages[0]]); // Keep welcome message
    setMessageCount(0);
    setTrivia(triviaFacts[Math.floor(Math.random() * triviaFacts.length)]);
  };

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  };

  // ── Quick action chips ──
  const quickActions = [
    { text: 'Where is Turing Block?', emoji: '📍', color: '#6366f1' },
    { text: 'Route from Edison to Library', emoji: '🗺️', color: '#06b6d4' },
    { text: 'Nearest cafeteria', emoji: '🍔', color: '#f59e0b' },
    { text: 'Show all hostels', emoji: '🏠', color: '#10b981' },
    { text: 'How far is Gate 4 from Turing?', emoji: '📏', color: '#ec4899' },
  ];

  // ── Context-aware suggestions after conversation ──
  const contextSuggestions = [
    'Show me the nearest parking',
    'Route from here to Sportorium',
    'Tell me about Newton Block',
  ];

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-secondary)' }}>
      {/* ═══ HEADER ═══ */}
      <div className="px-4 py-3 shrink-0 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center relative animate-breathe"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
            }}
          >
            <Brain className="w-5 h-5 text-white" />
            {/* Online pulse */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
              style={{ background: 'var(--success)', borderColor: 'var(--bg-secondary)' }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'Outfit' }}>
                Cognix AI
              </h2>
              <span className="px-1.5 py-0.5 rounded text-[7px] font-bold uppercase tracking-wider"
                style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--brand-light)' }}
              >
                v2.0
              </span>
            </div>
            <p className="text-[10px] font-medium" style={{ color: 'var(--success)' }}>
              ● Online • Smart Campus Assistant
            </p>
          </div>
        </div>

        {/* Clear chat */}
        {messageCount > 0 && (
          <button
            onClick={handleClearChat}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
            title="Clear chat"
          >
            <RotateCcw size={13} />
          </button>
        )}
      </div>

      {/* ═══ MESSAGES ═══ */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-5 custom-scroll relative">
        {messages.map((msg, i) => (
          <React.Fragment key={i}>
            <MessageBubble msg={msg} />
            {/* Show building cards after bot messages that reference buildings */}
            {msg.role === 'bot' && msg.buildings?.length > 0 && (
              <BuildingCards buildings={msg.buildings} onBuildingClick={(b) => {
                onMapAction?.([{ type: 'zoom', building: b }]);
              }} />
            )}
          </React.Fragment>
        ))}

        {/* Typing indicator */}
        {loading && <TypingIndicator />}

        {/* ── Quick Actions & Trivia (initial state only) ── */}
        {messages.length <= 1 && (
          <div className="space-y-5 pt-2">
            {/* Quick actions */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                <Zap size={10} /> Try asking
              </p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q.text)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105 cursor-pointer flex items-center gap-2 group"
                    style={{
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <span style={{ fontSize: 13 }}>{q.emoji}</span>
                    <span className="group-hover:text-white transition-colors">{q.text}</span>
                    <ChevronRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: q.color }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Trivia card */}
            <div className="p-4 rounded-2xl relative overflow-hidden"
              style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}
            >
              {/* Shimmer accent */}
              <div className="absolute top-0 left-0 w-full h-[2px]"
                style={{ background: 'linear-gradient(90deg, transparent, var(--brand), var(--accent-cyan), transparent)' }}
              />
              <h3 className="text-[10px] font-extrabold uppercase tracking-widest mb-2 flex items-center gap-1.5 gradient-text">
                <Sparkles size={12} /> Did you know?
              </h3>
              <p className="text-xs font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {trivia}
              </p>
            </div>
          </div>
        )}

        {/* ── Context Suggestions (after 2+ messages) ── */}
        {!loading && messages.length > 2 && messages[messages.length - 1].role === 'bot' && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {contextSuggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSend(s)}
                className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all hover:scale-105 cursor-pointer"
                style={{
                  background: 'rgba(99,102,241,0.06)',
                  color: 'var(--brand-light)',
                  border: '1px solid rgba(99,102,241,0.1)',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Scroll-to-bottom FAB */}
        {showScrollBtn && (
          <button
            onClick={scrollToBottom}
            className="sticky bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 animate-scale-in z-20"
            style={{
              background: 'var(--brand)',
              color: 'white',
              boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
            }}
          >
            <ArrowDown size={14} />
          </button>
        )}
      </div>

      {/* ═══ INPUT BAR ═══ */}
      <div className="px-4 py-3 shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
        {/* Character count hint */}
        {input.length > 0 && (
          <div className="flex justify-end mb-1">
            <span className="text-[8px] font-medium" style={{ color: 'var(--text-muted)' }}>
              {input.length}/500
            </span>
          </div>
        )}
        {/* Voice listening indicator */}
        {voice.listening && (
          <div className="flex items-center gap-2 mb-2 px-2 py-1.5 rounded-xl animate-fade-in" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-bold" style={{ color: '#ef4444' }}>Listening... speak now</span>
          </div>
        )}

        <div className="flex gap-2 items-end">
          {/* Mic Button */}
          {voice.supported && (
            <button
              onClick={() => voice.listening ? voice.stopListening() : voice.startListening()}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 shrink-0 ${voice.listening ? 'animate-pulse' : ''}`}
              style={{
                background: voice.listening
                  ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                  : 'var(--bg-tertiary)',
                color: voice.listening ? 'white' : 'var(--text-muted)',
                border: voice.listening ? 'none' : '1px solid var(--border)',
                boxShadow: voice.listening ? '0 4px 20px rgba(239,68,68,0.35)' : 'none',
              }}
              title={voice.listening ? 'Stop listening' : 'Voice input'}
            >
              {voice.listening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          )}

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, 500))}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={voice.listening ? '🎤 Listening...' : loading ? 'Cognix is thinking...' : 'Ask about campus locations...'}
              disabled={loading}
              className="w-full px-4 py-3 pr-10 rounded-2xl text-sm font-medium transition-all focus:outline-none focus:ring-2 disabled:opacity-50"
              style={{
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                border: voice.listening ? '1px solid rgba(239,68,68,0.3)' : '1px solid var(--border)',
                '--tw-ring-color': 'rgba(99,102,241,0.3)',
              }}
            />
            {!input && !loading && !voice.listening && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded text-[8px] font-bold"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                >⏎</kbd>
              </div>
            )}
          </div>
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
            style={{
              background: input.trim()
                ? 'linear-gradient(135deg, #6366f1, #06b6d4)'
                : 'var(--bg-tertiary)',
              color: input.trim() ? 'white' : 'var(--text-muted)',
              boxShadow: input.trim() ? '0 4px 20px rgba(99,102,241,0.35)' : 'none',
              border: input.trim() ? 'none' : '1px solid var(--border)',
            }}
          >
            <Send size={16} className={loading ? 'animate-pulse' : ''} />
          </button>
        </div>
      </div>
    </div>
  );
}
