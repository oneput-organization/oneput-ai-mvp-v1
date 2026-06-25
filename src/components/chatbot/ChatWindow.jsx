import { useState, useRef, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useApp } from '../../contexts/AppContext';
import { respond } from '../../services/assistant';
import { X, Send, Sparkles, Maximize2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const nowTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

export default function ChatWindow() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'bot',
      text: "👋 Hi! I'm **Oneput AI**, your ESG reporting assistant. Ask me about your progress, pending metrics, or any GRI disclosure!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { stats, activeMetrics, dataEntries } = useData();
  const { company, settings } = useApp();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = { id: newId(), type: 'user', text: input, time: nowTime() };
    const history = [...messages, userMsg];
    const botTime = nowTime();
    setMessages(history);
    setInput('');
    setIsTyping(true);

    const { text } = await respond(history, { company, settings, stats, activeMetrics, dataEntries });
    const botMsg = { id: `${userMsg.id}-bot`, type: 'bot', text, time: botTime };
    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  const quickActions = [
    "What's our progress?",
    "Show pending metrics",
    "Environmental overview",
    "Help with GRI 305-1",
  ];

  // Hide the floating widget on the full chat page — it would be redundant there.
  if (location.pathname.startsWith('/chatbot')) return null;

  if (!isOpen) {
    return (
      <button className="chat-fab" onClick={() => setIsOpen(true)} data-tooltip="Chat with Oneput AI">
        <Sparkles size={24} />
      </button>
    );
  }

  return (
    <div className="chat-panel">
      <div className="chat-panel-header">
        <div className="chat-panel-header-left">
          <div className="chat-panel-avatar"><Sparkles size={16} /></div>
          <div>
            <h4>Oneput AI</h4>
            <p>Your ESG Assistant</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button
            className="chat-panel-close"
            onClick={() => navigate('/chatbot')}
            title="Open full page"
          >
            <Maximize2 size={16} />
          </button>
          <button className="chat-panel-close" onClick={() => setIsOpen(false)}>
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`chat-message ${msg.type}`}>
            <div className="chat-message-avatar">
              {msg.type === 'bot' ? '✨' : 'U'}
            </div>
            <div>
              <div className="chat-message-bubble">
                {msg.text.split('\n').map((line, i) => (
                  <span key={i}>
                    {line.split(/(\*\*.*?\*\*)/).map((part, j) => (
                      part.startsWith('**') && part.endsWith('**')
                        ? <strong key={j}>{part.slice(2, -2)}</strong>
                        : part.startsWith('`') && part.endsWith('`')
                        ? <code key={j} style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 4px', borderRadius: 3, fontSize: '0.85em' }}>{part.slice(1, -1)}</code>
                        : part
                    ))}
                    {i < msg.text.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </div>
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

      <div className="chat-quick-actions">
        {quickActions.map(action => (
          <button
            key={action}
            className="chat-quick-action"
            onClick={() => { setInput(action); }}
          >
            {action}
          </button>
        ))}
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          placeholder="Ask Oneput AI..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} disabled={!input.trim() || isTyping}>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
