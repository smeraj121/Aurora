import { Sparkles, ArrowRight, Zap } from 'lucide-react';
import { AI_OPPORTUNITIES } from '../data/mockData';
import { formatCurrency } from '../../../lib/utils';
import { CampaignModal } from '../../ai-assistant/components/CampaignModal';
import { useState } from 'react';

export function AIOpportunityFeed() {
  const [isCampaignOpen, setIsCampaignOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('promoTitle');
  const [modalMessage, setModalMessage] = useState('promoDescription');
  const handleOpenCampaign = (title: string, message?: string) => {
    console.log('Opening Campaign Modal with title:', title, 'and message:', message);
    setModalTitle(title);
    if (message) setModalMessage(message);
    setIsCampaignOpen(true);
  };

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-950 text-white shadow-xl border border-purple-800/40 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-400/30 text-purple-300">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              AI Growth Advisor
            </h3>
            <p className="text-xs text-purple-200/70">Real-time revenue optimizations</p>
          </div>
        </div>
        <span className="text-[11px] font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-full">
          2 Active Insights
        </span>
      </div>

      {/* Opportunity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AI_OPPORTUNITIES.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-400/40 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded">
                  {item.badgeText}
                </span>
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  +{formatCurrency(item.lostRevenueOrPotential)}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-white group-hover:text-purple-200 transition-colors">
                {item.title}
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.description}</p>
            </div>

            <button className="mt-4 w-full py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-purple-600/30"
              onClick={() => handleOpenCampaign(item.promoTitle, item.promoDescription)} >
              <span>{item.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        ))}
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