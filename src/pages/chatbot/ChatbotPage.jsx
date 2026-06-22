import { useState, useRef, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useApp } from '../../contexts/AppContext';
import { respond } from '../../services/assistant';
import {
  Send,
  Sparkles,
  Plus,
  Trash2,
} from 'lucide-react';

const nowTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

export default function ChatbotPage() {
  const { stats, activeMetrics, dataEntries } = useData();
  const { company, settings } = useApp();

  const [conversations, setConversations] = useState([
    {
      id: '1',
      title: 'ESG Progress Check',
      messages: [
        { id: '1', type: 'bot', text: "👋 Welcome to **Oneput AI** — your full-page ESG assistant!\n\nI can help you track progress, explain GRI metrics, and chase data owners.\n\nWhat would you like to know?", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
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

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = { id: newId(), type: 'user', text: input, time: nowTime() };

    const history = [...(activeConv?.messages || []), userMsg];
    const botTime = nowTime();
    setConversations(prev => prev.map(c =>
      c.id === activeConvId ? { ...c, messages: history } : c
    ));
    setInput('');
    setIsTyping(true);

    const { text } = await respond(history, { company, settings, stats, activeMetrics, dataEntries });
    const botMsg = { id: `${userMsg.id}-bot`, type: 'bot', text, time: botTime };
    setConversations(prev => prev.map(c =>
      c.id === activeConvId ? { ...c, messages: [...c.messages, botMsg] } : c
    ));
    setIsTyping(false);
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
    "Chase the data owners",
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
