import { useState, useRef, useEffect } from 'react';
import { User, Phone, CheckCircle2 } from 'lucide-react';
import type { CustomerSearchResult } from '../../../shared/types/booking';
import { api } from '../../../services/api';

interface CustomerSectionProps {
  customerName: string;
  phone: string;
  isExistingCustomer: boolean;
  onCustomerNameChange: (name: string) => void;
  onPhoneChange: (phone: string) => void;
  onSelectCustomer: (customer: { id: number; fullName: string; phone: string }) => void;
  onClearCustomer: () => void;
}

export function CustomerSection({
  customerName,
  phone,
  isExistingCustomer,
  onCustomerNameChange,
  onPhoneChange,
  onSelectCustomer,
  onClearCustomer,
}: CustomerSectionProps) {
  const [searchResults, setSearchResults] = useState<CustomerSearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNameChange = (value: string) => {
    onCustomerNameChange(value);
    onClearCustomer();

    if (value.trim().length > 1) {
      setIsSearching(true);
      setShowDropdown(true);

      const timer = setTimeout(async () => {
        try {
          const res = await api.getCustomers(value);
          if (res.success) setSearchResults(res.data || []);
        } catch (err) {
          console.error('Customer search error:', err);
        } finally {
          setIsSearching(false);
        }
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const handleSelect = (customer: CustomerSearchResult) => {
    onSelectCustomer({
      id: Number(customer.id),
      fullName: customer.fullName || customer.name || '',
      phone: customer.phone || '',
    });
    setShowDropdown(false);
    setSearchResults([]);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="relative" ref={dropdownRef}>
        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-purple-600" /> Customer <span className="text-rose-500">*</span>
          {isExistingCustomer && <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ml-1"><CheckCircle2 className="w-3 h-3" /></span>}
        </label>
        <div className="relative">
          <input type="text" required value={customerName} onChange={(e) => handleNameChange(e.target.value)} placeholder="Search customer..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600" />
          {isSearching && <div className="absolute right-3 top-3"><div className="w-3.5 h-3.5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>}
        </div>

        {showDropdown && searchResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-40 overflow-y-auto divide-y divide-slate-100">
            {searchResults.map((cust) => (
              <div key={cust.id} onMouseDown={(e) => { e.preventDefault(); handleSelect(cust); }} className="p-2 hover:bg-purple-50 cursor-pointer flex items-center justify-between transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 font-bold flex items-center justify-center text-[10px] shrink-0">{(cust.fullName || cust.name || 'C').charAt(0)}</div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{cust.fullName || cust.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{cust.phone || 'No phone'}</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md shrink-0 ml-2">Select</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-purple-600" /> Phone <span className="text-rose-500">*</span>
        </label>
        <input type="text" required value={phone} onChange={(e) => onPhoneChange(e.target.value)} placeholder="Phone number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600" />
      </div>
    </div>
  );
}