import { useState, useRef, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useApp } from '../../contexts/AppContext';
import { GRI_METRICS } from '../../data/gri-metrics';
import {
  Send,
  Sparkles,
  Plus,
  Trash2,
} from 'lucide-react';

// Reuse the response generator
function generateResponse(input, { stats, activeMetrics, dataEntries, company }) {
  const lower = input.toLowerCase();

  if (lower.includes('progress') || lower.includes('status') || lower.includes('how are we doing')) {
    const pct = stats.totalMetrics > 0 ? Math.round((stats.approved / stats.totalMetrics) * 100) : 0;
    return `📊 **Here's your current progress:**\n\n• **${stats.totalMetrics}** active metrics\n• **${stats.collected}** data points collected\n• **${stats.pendingReview}** pending review\n• **${stats.approved}** approved (${pct}%)\n• **${stats.rejected || 0}** rejected\n\n${pct < 50 ? "You're still in the early stages. Keep going! 💪" : pct < 100 ? "Great progress! You're over halfway there. 🎯" : "All metrics approved! You're ready to generate your report. 🎉"}`;
  }

  if (lower.includes('pending') || lower.includes('what\'s left') || lower.includes('remaining') || lower.includes('todo')) {
    const pending = activeMetrics.filter(m => {
      const entry = dataEntries[m.id];
      return !entry || entry.status === 'pending';
    });
    if (pending.length === 0) return "✅ No pending metrics! All data has been entered.";
    const list = pending.slice(0, 8).map(m => `• **${m.code}** — ${m.name}`).join('\n');
    return `📋 **${pending.length} metrics are still pending:**\n\n${list}${pending.length > 8 ? `\n• ...and ${pending.length - 8} more` : ''}\n\nWould you like me to help you fill in any of these?`;
  }

  if (lower.includes('help') || lower.includes('explain') || lower.includes('what is')) {
    const metric = GRI_METRICS.find(m =>
      lower.includes(m.code.toLowerCase()) ||
      lower.includes(m.name.toLowerCase().substring(0, 20))
    );
    if (metric) {
      return `📖 **${metric.code} — ${metric.name}**\n\n${metric.description}\n\n• **Category:** ${metric.category}\n• **Unit:** ${metric.unit}\n• **Data type:** ${metric.dataType}`;
    }
  }

  if (lower.includes('environment') || lower.includes('emission') || lower.includes('carbon') || lower.includes('energy')) {
    const envMetrics = activeMetrics.filter(m => m.category === 'Environmental');
    const collected = envMetrics.filter(m => dataEntries[m.id]?.value).length;
    return `🌱 **Environmental Metrics:**\n\n• **${envMetrics.length}** tracked, **${collected}** collected\n• Key areas: Energy, GHG Emissions, Water, Waste`;
  }

  if (lower.includes('social') || lower.includes('employee') || lower.includes('safety')) {
    const socMetrics = activeMetrics.filter(m => m.category === 'Social');
    const collected = socMetrics.filter(m => dataEntries[m.id]?.value).length;
    return `👥 **Social Metrics:**\n\n• **${socMetrics.length}** tracked, **${collected}** collected\n• Key areas: Employment, Health & Safety, Training, Diversity`;
  }

  if (lower.includes('governance') || lower.includes('corruption')) {
    const govMetrics = activeMetrics.filter(m => m.category === 'Governance');
    const collected = govMetrics.filter(m => dataEntries[m.id]?.value).length;
    return `🏛️ **Governance Metrics:**\n\n• **${govMetrics.length}** tracked, **${collected}** collected\n• Key areas: General Disclosures, Anti-corruption`;
  }

  if (lower.includes('gri') || lower.includes('framework')) {
    return `📜 **GRI Standards 2021** — The world's most widely used sustainability reporting framework. Your registry includes **${activeMetrics.length}** key disclosures.`;
  }

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower === 'start') {
    return `👋 Hi ${company.name || 'there'}! I'm **Oneput AI**. Ask me about progress, pending metrics, or any GRI disclosure!`;
  }

  if (lower.includes('remind') || lower.includes('nudge')) {
    return `📨 **Reminder noted!** In the full version, I'll send automated reminders via LINE, email, or Slack. _Coming soon!_`;
  }

  if (lower.includes('csv') || lower.includes('upload') || lower.includes('import')) {
    return `📄 **CSV Import:** Go to Data Collection → Import CSV. Download the template first for correct formatting.`;
  }

  return `I can help with:\n• **"What's our progress?"** — Stats\n• **"Show pending metrics"** — What needs data\n• **"Help with GRI 305-1"** — Metric details\n• **"Environmental overview"** — Category info\n\nJust ask! 🤖`;
}

export default function ChatbotPage() {
  const { stats, activeMetrics, dataEntries } = useData();
  const { company } = useApp();

  const [conversations, setConversations] = useState([
    {
      id: '1',
      title: 'ESG Progress Check',
      messages: [
        { id: '1', type: 'bot', text: "👋 Welcome to **Oneput AI** — your full-page ESG assistant!\n\nI can help you track progress, explain GRI metrics, and guide your data collection process.\n\nWhat would you like to know?", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ],
    },
  ]);
  const [activeConvId, setActiveConvId] = useState('1');
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const activeConv = conversations.find(c => c.id === activeConvId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages, isTyping]);

  const handleSend = () => {
    if (!input.trim() || isTyping) return;

    const userMsg = {
      id: Date.now().toString(),
      type: 'user',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setConversations(prev => prev.map(c =>
      c.id === activeConvId
        ? { ...c, messages: [...c.messages, userMsg] }
        : c
    ));

    const query = input;
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateResponse(query, { stats, activeMetrics, dataEntries, company });
      const botMsg = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setConversations(prev => prev.map(c =>
        c.id === activeConvId
          ? { ...c, messages: [...c.messages, botMsg] }
          : c
      ));
      setIsTyping(false);
    }, 800 + Math.random() * 800);
  };

  const newConversation = () => {
    const newConv = {
      id: Date.now().toString(),
      title: `New Chat ${conversations.length + 1}`,
      messages: [
        { id: '1', type: 'bot', text: "👋 New conversation started. What can I help you with?", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ],
    };
    setConversations(prev => [...prev, newConv]);
    setActiveConvId(newConv.id);
  };

  const deleteConversation = (id) => {
    if (conversations.length <= 1) return;
    const remaining = conversations.filter(c => c.id !== id);
    setConversations(remaining);
    if (activeConvId === id) setActiveConvId(remaining[0].id);
  };

  const quickActions = [
    "What's our progress?",
    "Show pending metrics",
    "Environmental overview",
    "Governance overview",
    "Help with GRI 305-1",
    "How to import CSV?",
  ];

  const renderText = (text) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line.split(/(\*\*.*?\*\*)/).map((part, j) => (
          part.startsWith('**') && part.endsWith('**')
            ? <strong key={j}>{part.slice(2, -2)}</strong>
            : part.startsWith('`') && part.endsWith('`')
            ? <code key={j} style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 4px', borderRadius: 3, fontSize: '0.85em' }}>{part.slice(1, -1)}</code>
            : part
        ))}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className="page-shell" style={{ height: 'calc(100vh - var(--topbar-height) - 64px)' }}>
      <div className="chatbot-page">
        {/* Left - Conversations */}
        <div className="chatbot-conversations">
          <div className="chatbot-conversations-header">
            <h4 style={{ fontSize: 'var(--font-sm)' }}>Conversations</h4>
            <button className="btn btn-ghost btn-sm" onClick={newConversation}>
              <Plus size={14} />
            </button>
          </div>
          <div className="chatbot-conv-list">
            {conversations.map(conv => (
              <div
                key={conv.id}
                className={`chatbot-conv-item ${activeConvId === conv.id ? 'active' : ''}`}
                onClick={() => setActiveConvId(conv.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h5>{conv.title}</h5>
                  {conversations.length > 1 && (
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ padding: 2, height: 'auto', opacity: 0.5 }}
                      onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                <p>{conv.messages[conv.messages.length - 1]?.text.substring(0, 50)}...</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right - Chat */}
        <div className="chatbot-main">
          <div className="chatbot-main-header">
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-500)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: 'var(--font-base)' }}>Oneput AI</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <div className="online-dot"></div>
                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--neutral-500)' }}>Online — ESG Assistant</span>
              </div>
            </div>
          </div>

          <div className="chat-messages" style={{ flex: 1 }}>
            {activeConv?.messages.map(msg => (
              <div key={msg.id} className={`chat-message ${msg.type}`}>
                <div className="chat-message-avatar">
                  {msg.type === 'bot' ? '✨' : 'U'}
                </div>
                <div>
                  <div className="chat-message-bubble">{renderText(msg.text)}</div>
                  <div className="chat-message-time">{msg.time}</div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="chat-typing">
                <div className="chat-typing-dot"></div>
                <div className="chat-typing-dot"></div>
                <div className="chat-typing-dot"></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-quick-actions" style={{ paddingTop: 'var(--space-2)' }}>
            {quickActions.map(action => (
              <button key={action} className="chat-quick-action" onClick={() => setInput(action)}>
                {action}
              </button>
            ))}
          </div>

          <div className="chat-input-area" style={{ padding: 'var(--space-4) var(--space-5)' }}>
            <input
              type="text"
              placeholder="Ask Oneput AI anything about your ESG reporting..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              style={{ height: 42, fontSize: 'var(--font-base)' }}
            />
            <button onClick={handleSend} disabled={!input.trim() || isTyping} style={{ width: 42, height: 42 }}>
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
