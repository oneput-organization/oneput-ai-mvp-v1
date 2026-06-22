import { useState, useRef, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useApp } from '../../contexts/AppContext';
import { GRI_METRICS } from '../../data/gri-metrics';
import { X, Send, Sparkles, Maximize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Simulated AI response engine
function generateResponse(input, { stats, activeMetrics, dataEntries, company }) {
  const lower = input.toLowerCase();

  // Progress queries
  if (lower.includes('progress') || lower.includes('status') || lower.includes('how are we doing')) {
    const pct = stats.totalMetrics > 0 ? Math.round((stats.approved / stats.totalMetrics) * 100) : 0;
    return `📊 **Here's your current progress:**\n\n• **${stats.totalMetrics}** active metrics\n• **${stats.collected}** data points collected\n• **${stats.pendingReview}** pending review\n• **${stats.approved}** approved (${pct}%)\n• **${stats.rejected || 0}** rejected\n\n${pct < 50 ? "You're still in the early stages. Keep going! 💪" : pct < 100 ? "Great progress! You're over halfway there. 🎯" : "All metrics approved! You're ready to generate your report. 🎉"}`;
  }

  // Pending metrics
  if (lower.includes('pending') || lower.includes('what\'s left') || lower.includes('remaining') || lower.includes('todo')) {
    const pending = activeMetrics.filter(m => {
      const entry = dataEntries[m.id];
      return !entry || entry.status === 'pending';
    });
    if (pending.length === 0) return "✅ No pending metrics! All data has been entered.";
    const list = pending.slice(0, 8).map(m => `• **${m.code}** — ${m.name}`).join('\n');
    return `📋 **${pending.length} metrics are still pending:**\n\n${list}${pending.length > 8 ? `\n• ...and ${pending.length - 8} more` : ''}\n\nWould you like me to help you fill in any of these?`;
  }

  // Help with specific metric
  if (lower.includes('help') || lower.includes('explain') || lower.includes('what is')) {
    const metric = GRI_METRICS.find(m =>
      lower.includes(m.code.toLowerCase()) ||
      lower.includes(m.name.toLowerCase().substring(0, 20))
    );
    if (metric) {
      return `📖 **${metric.code} — ${metric.name}**\n\n${metric.description}\n\n• **Category:** ${metric.category}\n• **Unit:** ${metric.unit}\n• **Data type:** ${metric.dataType}${metric.validationRules.min !== undefined ? `\n• **Min value:** ${metric.validationRules.min}` : ''}${metric.validationRules.max !== undefined ? `\n• **Max value:** ${metric.validationRules.max}` : ''}`;
    }
  }

  // Environmental focus
  if (lower.includes('environment') || lower.includes('emission') || lower.includes('carbon') || lower.includes('energy')) {
    const envMetrics = activeMetrics.filter(m => m.category === 'Environmental');
    const collected = envMetrics.filter(m => dataEntries[m.id]?.value).length;
    return `🌱 **Environmental Metrics Overview:**\n\n• **${envMetrics.length}** environmental metrics tracked\n• **${collected}** have data entered\n• **${envMetrics.length - collected}** still need data\n\nKey areas: Energy consumption, GHG emissions (Scope 1/2/3), Water, and Waste management.`;
  }

  // Social focus
  if (lower.includes('social') || lower.includes('employee') || lower.includes('safety') || lower.includes('training')) {
    const socMetrics = activeMetrics.filter(m => m.category === 'Social');
    const collected = socMetrics.filter(m => dataEntries[m.id]?.value).length;
    return `👥 **Social Metrics Overview:**\n\n• **${socMetrics.length}** social metrics tracked\n• **${collected}** have data entered\n• **${socMetrics.length - collected}** still need data\n\nKey areas: Employment, Health & Safety, Training, Diversity, and Community engagement.`;
  }

  // Governance focus
  if (lower.includes('governance') || lower.includes('corruption') || lower.includes('compliance')) {
    const govMetrics = activeMetrics.filter(m => m.category === 'Governance');
    const collected = govMetrics.filter(m => dataEntries[m.id]?.value).length;
    return `🏛️ **Governance Metrics Overview:**\n\n• **${govMetrics.length}** governance metrics tracked\n• **${collected}** have data entered\n• **${govMetrics.length - collected}** still need data\n\nKey areas: General disclosures, Anti-corruption, and Anti-competitive behavior.`;
  }

  // GRI info
  if (lower.includes('gri') || lower.includes('framework') || lower.includes('standard')) {
    return `📜 **GRI Standards 2021**\n\nThe Global Reporting Initiative (GRI) is the most widely used sustainability reporting framework globally. Your registry includes **${activeMetrics.length}** key disclosures across:\n\n• **Environmental** (GRI 300 series): Energy, Water, Emissions, Waste\n• **Social** (GRI 400 series): Employment, Health & Safety, Training, Diversity\n• **Governance** (GRI 2): General disclosures, Anti-corruption\n\nNeed help with a specific disclosure? Just ask!`;
  }

  // Greeting
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower === 'start') {
    const name = company.name || 'there';
    return `👋 Hi ${name}! I'm **Oneput AI**, your ESG reporting assistant.\n\nI can help you with:\n• 📊 Check your data collection progress\n• 📋 See what metrics are pending\n• 📖 Explain any GRI metric\n• 🌱 Environmental, 👥 Social, or 🏛️ Governance overviews\n\nJust ask me anything!`;
  }

  // Remind / nudge
  if (lower.includes('remind') || lower.includes('nudge') || lower.includes('notify')) {
    return `📨 **Reminder noted!**\n\nIn the full version, I'll automatically send reminders via LINE, email, or Slack to the responsible departments. For now, I've logged this reminder.\n\n_Feature coming soon: automated follow-ups and escalation to managers._`;
  }

  // CSV help
  if (lower.includes('csv') || lower.includes('upload') || lower.includes('import')) {
    return `📄 **CSV Import Guide:**\n\n1. Go to **Data Collection** page\n2. Click **Download Template** to get the pre-formatted CSV\n3. Fill in the data with columns: \`metric_code\`, \`metric_name\`, \`value\`, \`unit\`, \`notes\`\n4. Click **Import CSV** and upload your file\n5. Review the validation results and import\n\nThe system validates each row against the metric's rules automatically.`;
  }

  // Default
  return `I appreciate the question! Here's what I can help with right now:\n\n• **"What's our progress?"** — Overall completion stats\n• **"Show pending metrics"** — Metrics that need data\n• **"Help with GRI 305-1"** — Explain any specific metric\n• **"Environmental overview"** — Category breakdown\n\nAs your AI ESG assistant, I'll learn more about your specific context over time. 🤖`;
}

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

  const { stats, activeMetrics, dataEntries } = useData();
  const { company } = useApp();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      type: 'user',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    const query = input;
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const response = generateResponse(query, { stats, activeMetrics, dataEntries, company });
      const botMsg = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 800);
  };

  const quickActions = [
    "What's our progress?",
    "Show pending metrics",
    "Environmental overview",
    "Help with GRI 305-1",
  ];

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
        <button onClick={handleSend} disabled={!input.trim()}>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
