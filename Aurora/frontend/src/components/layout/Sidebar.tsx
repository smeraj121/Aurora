import { NavLink } from 'react-router-dom';
import { Sparkles, ChevronDown, PanelLeft } from 'lucide-react';
import { NAV_ITEMS } from '../../shared/types/navigation';
import { cn } from '../../lib/utils';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}: SidebarProps) {
  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside className={cn(
        "fixed md:sticky top-0 left-0 z-40 h-screen bg-[#0F0B1E] border-r border-slate-800/80 transition-all duration-300",
        collapsed ? "w-20" : "w-64",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )} >
        {/* Brand Header */}
        {collapsed ? (
          <div className="p-6 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-900/40">
              <Sparkles className="w-5 h-5 fill-white/20" />
            </div>
          </div>
        ) : (
          <div className="p-6 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-900/40">
              <Sparkles className="w-5 h-5 fill-white/20" />
            </div>
            <div>
              <h1 className="text-xl m-0 font-bold tracking-tight text-white flex items-center gap-1.5" style={{ color: 'white', margin: 0, fontWeight: 'bold', fontSize: '1.25rem', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                Aurora
              </h1>
              <p className="text-[11px] font-medium text-slate-400 -mt-1">Salon & Clinic OS</p>
            </div>
          </div>)}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-2 rounded-lg hover:bg-white/5 absolute top-3 right-3 transition-colors"
        >
          <PanelLeft className="w-5 h-5" />
        </button>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-none py-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  )
                }
              >
                <div
                  className={cn(
                    "flex items-center",
                    collapsed
                      ? "justify-center w-full"
                      : "gap-3"
                  )}
                >
                  <Icon
                    className={cn(
                      collapsed
                        ? "w-6 h-6"
                        : "w-4 h-4"
                    )}
                  />
                  {!collapsed && <span>{item.label}</span>}
                </div>
                {!collapsed && item.badge && (
                  <span className="text-[10px] font-semibold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 w-full">
          {/* Bottom Callout Banner */}
          {collapsed ? (
            <div className='p-1 rounded-2xl bg-gradient-to-b from-purple-900/40 to-indigo-950/60 border border-purple-500/20 relative overflow-hidden'>
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                Unlock AI campaigns, advanced analytics & more.
              </p>
              <div className="p-1">
                <button className="w-full py-1.5 px-1 rounded-lg bg-white text-purple-950 text-xs font-bold hover:bg-purple-50 transition-colors">
                  Upgrade Now
                </button>
              </div>
            </div>
          ) : (
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
          )}

          {/* User Account Footer */}
          <div className="p-3 border-t border-slate-800/80">
            <button className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors group">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
                  alt="Saba Meraj"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-500/30"
                />
                {!collapsed && (
                  <footer className="text-left">
                    <p className="text-xs font-semibold text-white group-hover:text-purple-300 transition-colors">
                      Saba Meraj
                    </p>
                    <p className="text-[11px] text-slate-400">Owner</p>
                  </footer>
                )}
              </div>
              {!collapsed && (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}