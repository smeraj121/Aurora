import React, { useState } from 'react';
import { Menu, Sparkles, User, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useClickOutside } from '../../hooks/useClickOutside';

interface HeaderProps {
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function Header({ setMobileOpen }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useClickOutside<HTMLDivElement>(() => setDropdownOpen(false));
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const initials = user?.fullName
    ? user.fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
    : 'U';
  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <header className="h-16 px-4 md:px-8 bg-slate-50/50 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between sticky top-0 z-20">
      {/* Mobile Hamburger Menu */}
      <button
        className="md:hidden p-2 text-slate-600 hover:text-slate-900"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Brand / Logo Section */}
      <div className="flex items-center gap-3 absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-900/20">
          <Sparkles className="w-5 h-5 fill-white/20" />
        </div>
        <div>
          <h2 className="text-xl m-0 font-bold tracking-tight text-slate-900 flex items-center gap-1.5 leading-none">
            Aurora
          </h2>
        </div>
      </div>

      {/* Profile Avatar & Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-200/50 transition-colors focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-600 text-white font-semibold flex items-center justify-center text-xs shadow-sm">
            {initials}
          </div>
          <ChevronDown className="w-4 h-4 text-slate-500 hidden md:block" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200/80 py-1.5 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-4 py-2 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-900 truncate">{user?.fullName || ''}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email || ''}</p>
            </div>

            <button
              onClick={() => {
                setDropdownOpen(false);
                navigate('/profile');
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <User className="w-4 h-4 text-slate-500" />
              My Profile
            </button>

            <div className="my-1 border-t border-slate-100" />

            <button
              onClick={() => {
                setDropdownOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}