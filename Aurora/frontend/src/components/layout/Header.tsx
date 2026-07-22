import { Search, Bell, Menu, Sparkles } from 'lucide-react';
interface HeaderProps {
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
export function Header({ setMobileOpen }: HeaderProps) {
  return (
    <header className="h-16 px-8 bg-slate-50/50 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between sticky top-0 z-10">
      <button className="md:hidden" onClick={() => setMobileOpen(true)}>
        <Menu className="w-6 h-6"/>
      </button>
      
      <div className="p-6 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-900/40">
              <Sparkles className="w-5 h-5 fill-white/20" />
            </div>
            <div>
              <h1 className="text-xl m-0 font-bold tracking-tight text-white flex items-center gap-1.5" style={{ margin: 0, fontWeight: 'bold', fontSize: '1.25rem', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                Aurora
              </h1>
            </div>
          </div>

      {/* Search Input */}
      <div className="relative w-80 md:block hidden">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search anything..."
          className="w-full pl-9 pr-12 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-sm"
        />
        <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
          ⌘K
        </kbd>
      </div>

      {/* Right Action Icons & Date Dropdown */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
}