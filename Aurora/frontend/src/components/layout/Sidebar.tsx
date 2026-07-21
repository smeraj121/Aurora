import { NavLink } from 'react-router-dom';
import { Sparkles, ChevronDown } from 'lucide-react';
import { NAV_ITEMS } from '../../shared/types/navigation';
import { cn } from '../../lib/utils';

export function Sidebar() {
  return (
    <aside className="w-64 bg-[#0F0B1E] text-slate-300 flex flex-col h-screen border-r border-slate-800/80 sticky top-0">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-900/40">
          <Sparkles className="w-5 h-5 fill-white/20" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5" style={{ color: 'white' }}>
            Aurora
          </h1>
          <p className="text-[11px] font-medium text-slate-400 -mt-1">Salon & Clinic OS</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-none py-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-semibold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Callout Banner */}
      <div className="p-3">
        <div className="p-4 rounded-2xl bg-gradient-to-b from-purple-900/40 to-indigo-950/60 border border-purple-500/20 relative overflow-hidden">
          <p className="text-xs font-semibold text-purple-200">Upgrade to Premium</p>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Unlock AI campaigns, advanced analytics & more.
          </p>
          <button className="mt-3 w-full py-1.5 px-3 rounded-lg bg-white text-purple-950 text-xs font-bold hover:bg-purple-50 transition-colors">
            Upgrade Now →
          </button>
        </div>
      </div>

      {/* User Account Footer */}
      <div className="p-3 border-t border-slate-800/80">
        <button className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors group">
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
              alt="Saba Meraj"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-500/30"
            />
            <div className="text-left">
              <p className="text-xs font-semibold text-white group-hover:text-purple-300 transition-colors">
                Saba Meraj
              </p>
              <p className="text-[11px] text-slate-400">Owner</p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </button>
      </div>
    </aside>
  );
}