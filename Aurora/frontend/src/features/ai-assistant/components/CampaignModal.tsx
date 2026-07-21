import { useEffect, useState } from 'react';
import { X, Send, Sparkles, Users, MessageSquare, CheckCircle2 } from 'lucide-react';

interface CampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTitle?: string;
  initialMessage?: string;
}

type AudienceSegment = 'all' | 'frequent' | 'inactive_30' | 'inactive_45' | 'inactive_60' | 'custom';

export function CampaignModal({
  isOpen,
  onClose,
  initialTitle = 'Happy Hour Spa Offer',
  initialMessage = '✨ Special Offer! Get 15% OFF on all morning Hair Spa & HydraFacial services (Tue-Thu, 10 AM - 1 PM). Book your slot today: glowlogic.app/book/spa15',
}: CampaignModalProps) {
  const [campaignName, setCampaignName] = useState(initialTitle);
  const [messageText, setMessageText] = useState(initialMessage);
  const [channel, setChannel] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [segment, setSegment] = useState<AudienceSegment>('inactive_60');
  const [customDays, setCustomDays] = useState('90');
  const [isSent, setIsSent] = useState(false);

  useEffect(() => {
  if (isOpen) {
    setCampaignName(initialTitle);
    setMessageText(initialMessage);
    setIsSent(false);
  }
}, [isOpen, initialTitle, initialMessage]);

  if (!isOpen) return null;

  // Estimated recipient count based on segment selection
  const getRecipientCount = () => {
    switch (segment) {
      case 'all':
        return 420;
      case 'frequent':
        return 85;
      case 'inactive_30':
        return 64;
      case 'inactive_45':
        return 42;
      case 'inactive_60':
        return 28;
      case 'custom':
        return 19;
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0F0B1E] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold">AI Promo Campaign Builder</h3>
              <p className="text-[11px] text-purple-200/80">Customize message & target specific client segments</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSent ? (
          /* Success Screen */
          <div className="p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Campaign Sent Successfully!</h3>
            <p className="text-xs text-slate-500">
              Dispatched via {channel.toUpperCase()} to <span className="font-bold text-slate-800">{getRecipientCount()} clients</span>.
            </p>
          </div>
        ) : (
          /* Form Content */
          <form onSubmit={handleSend} className="p-6 space-y-4">
            {/* Campaign Name */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Campaign Name
              </label>
              <input
                type="text"
                required
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 text-slate-900"
              />
            </div>

            {/* Target Audience Segment Selection */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-purple-600" />
                Target Audience Filter
              </label>
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value as AudienceSegment)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 bg-white text-slate-900"
              >
                <option value="inactive_60">Clients not visited in last 60 days (28 clients)</option>
                <option value="inactive_45">Clients not visited in last 45 days (42 clients)</option>
                <option value="inactive_30">Clients not visited in last 30 days (64 clients)</option>
                <option value="frequent">Frequent & High-VIP Visitors (85 clients)</option>
                <option value="all">All Registered Clients (420 clients)</option>
                <option value="custom">Custom Inactivity Threshold</option>
              </select>

              {/* Custom Days Input if selected */}
              {segment === 'custom' && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-slate-500">Has not visited in over:</span>
                  <input
                    type="number"
                    value={customDays}
                    onChange={(e) => setCustomDays(e.target.value)}
                    className="w-20 px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  />
                  <span className="text-xs text-slate-500">days</span>
                </div>
              )}
            </div>

            {/* Channel Selection */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                Delivery Channel
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setChannel('whatsapp')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                    channel === 'whatsapp'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  WhatsApp Direct
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('sms')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                    channel === 'sms'
                      ? 'bg-purple-50 border-purple-500 text-purple-800 ring-2 ring-purple-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  SMS Broadcast
                </button>
              </div>
            </div>

            {/* Message Body Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">Message Copy</label>
                <span className="text-[10px] text-slate-400">
                  {messageText.length} characters
                </span>
              </div>
              <textarea
                rows={4}
                required
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 leading-relaxed text-slate-900"
              />
            </div>

            {/* Target Summary Footer */}
            <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 flex items-center justify-between text-xs text-purple-950">
              <span className="font-medium">Estimated Audience Reach:</span>
              <span className="font-bold text-purple-900 bg-white px-2.5 py-0.5 rounded-lg border border-purple-200">
                {getRecipientCount()} Recipients
              </span>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors shadow-md shadow-purple-900/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch Campaign Now</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}