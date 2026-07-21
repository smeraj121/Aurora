import { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  TrendingUp,
  Calendar,
  Users,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';
import { CampaignModal } from './components/CampaignModal';
import { cn } from '../../lib/utils';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  actionCard?: {
    title: string;
    description: string;
    buttonText: string;
    suggestedMessage?: string;
  };
}

const SUGGESTED_PROMPTS = [
  {
    icon: TrendingUp,
    label: 'Analyze Month Revenue',
    prompt: 'How is our revenue looking for this month compared to last month?',
  },
  {
    icon: Calendar,
    label: 'Optimize Staff Schedule',
    prompt: 'Are there any idle staff time slots this Friday we should fill with discounts?',
  },
  {
    icon: Users,
    label: 'Inactive Client Campaign',
    prompt: 'Draft a SMS campaign to re-engage clients who haven’t visited in 60 days.',
  },
];

export function AIAssistantView() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: "Hello! I'm your GlowLogic AI Growth Advisor. I've analyzed your recent appointments and sales data. How can I help you boost salon revenue today?",
      timestamp: '10:00 AM',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Modal State
  const [isCampaignOpen, setIsCampaignOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleOpenCampaign = (title: string, message?: string) => {
    setModalTitle(title);
    if (message) setModalMessage(message);
    setIsCampaignOpen(true);
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      let aiResponseText =
        "I've analyzed your live data. Here is what I recommend based on current trends:";
      let actionCard;

      if (query.toLowerCase().includes('revenue')) {
        aiResponseText =
          "Your revenue hit ₹3,10,000 (+14.2% MoM)! Hair Spa & HydraFacials are driving 70% of gross margin. However, mid-week mornings (Tue-Thu 10 AM - 1 PM) still have 35% empty chair capacity.";
        actionCard = {
          title: 'Happy Hour Spa Offer',
          description: 'Offer a 15% discount on morning slots to boost fill rates by ~22%.',
          buttonText: 'Activate Promo Campaign',
          suggestedMessage:
            '✨ Morning Glow Deal! Get 15% OFF on all morning Hair Spa & HydraFacial appointments (Tue-Thu, 10 AM - 1 PM). Book now: glowlogic.app/book/spa15',
        };
      } else if (query.toLowerCase().includes('schedule') || query.toLowerCase().includes('slot')) {
        aiResponseText =
          "Rahul Kumar has 3 unbooked hours on Friday afternoon. Meera Das is completely booked for nail treatments.";
        actionCard = {
          title: 'Friday Grooming Special',
          description: 'Offer a complementary beard styling with any haircut to fill Rahul\'s schedule.',
          buttonText: 'Launch Friday Promo',
          suggestedMessage:
            '💈 Weekend Ready! Book a haircut with Rahul this Friday afternoon & get a complimentary Beard Styling session! Claim here: glowlogic.app/book/friday',
        };
      } else {
        aiResponseText =
          "I identified 28 VIP clients who haven't visited in 60+ days. Re-engaging them with a personalized perk could generate roughly ₹38,000 in additional bookings.";
        actionCard = {
          title: 'We Miss You VIP Offer',
          description: 'Broadcast a custom 20% discount link directly via WhatsApp or SMS.',
          buttonText: 'Send Re-engagement Offer',
          suggestedMessage:
            '👑 We miss seeing you at GlowLogic! Enjoy 20% OFF your next visit as our VIP treat. Use code WE-MISS-YOU at checkout: glowlogic.app/vip20',
        };
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionCard,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-md shadow-purple-900/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
              AI Growth Advisor
            </h1>
            <p className="text-xs text-slate-500">Instant answers, revenue tips & automated workflows</p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/80">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Online & Connected
        </span>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col overflow-hidden">
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn('flex gap-3 max-w-3xl', msg.sender === 'user' ? 'ml-auto flex-row-reverse' : '')}
            >
              {/* Avatar */}
              <div
                className={cn(
                  'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-xs',
                  msg.sender === 'ai' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-white'
                )}
              >
                {msg.sender === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Message Content */}
              <div className="space-y-3">
                <div
                  className={cn(
                    'p-4 rounded-2xl text-xs leading-relaxed shadow-xs',
                    msg.sender === 'ai'
                      ? 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-none'
                      : 'bg-purple-600 text-white rounded-tr-none font-medium'
                  )}
                >
                  {msg.text}
                  <span
                    className={cn(
                      'block text-[10px] mt-2 opacity-70',
                      msg.sender === 'user' ? 'text-purple-200 text-right' : 'text-slate-400'
                    )}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {/* Interactive AI Action Card Component */}
                {msg.actionCard && (
                  <div className="p-4 rounded-xl bg-purple-50/80 border border-purple-200/80 space-y-2.5 text-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-2 font-bold text-purple-950">
                      <Lightbulb className="w-4 h-4 text-purple-600" />
                      <span>{msg.actionCard.title}</span>
                    </div>
                    <p className="text-purple-800 text-[11px]">{msg.actionCard.description}</p>
                    <button
                      onClick={() =>
                        handleOpenCampaign(
                          msg.actionCard!.title,
                          msg.actionCard!.suggestedMessage
                        )
                      }
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 text-white font-bold text-[11px] hover:bg-purple-700 transition-colors shadow-xs"
                    >
                      <span>{msg.actionCard.buttonText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Animation Indicator */}
          {isTyping && (
            <div className="flex gap-3 max-w-3xl">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 text-xs shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 rounded-tl-none flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggested Prompts Toolbar */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 overflow-x-auto pb-3">
            {SUGGESTED_PROMPTS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(item.prompt)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 text-xs font-semibold hover:bg-purple-50 hover:border-purple-200 hover:text-purple-900 transition-all shrink-0"
                >
                  <Icon className="w-3.5 h-3.5 text-purple-600" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Query Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything (e.g. 'How can I increase staff utilization this weekend?')..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all shadow-xs"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isTyping}
              className="px-4 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-md shadow-purple-900/20 flex items-center gap-1.5"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Campaign Builder & Audience Modal */}
      <CampaignModal
        isOpen={isCampaignOpen}
        onClose={() => setIsCampaignOpen(false)}
        initialTitle={modalTitle}
        initialMessage={modalMessage}
      />
    </div>
  );
}