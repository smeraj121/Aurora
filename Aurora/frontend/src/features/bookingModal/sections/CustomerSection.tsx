import { useState, useRef, useEffect } from 'react';
import { User, CheckCircle2 } from 'lucide-react';
import type { CustomerSearchResult } from '../../../types/booking.types';
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
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (value.trim().length <= 1) {
      setSearchResults([]);
      setShowDropdown(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setShowDropdown(true);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await api.getCustomers(value);
        if (res.success) setSearchResults(res.data || []);
      } catch (err) {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-purple-600" /> Customer
        </span>
        {isExistingCustomer && (
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Existing Customer ({phone})
          </span>
        )}
      </label>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            required
            value={customerName}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Type customer name or phone..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
          />
          {isSearching && (
            <div className="absolute right-3 top-2.5">
              <div className="w-3.5 h-3.5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Show phone field ONLY if not an existing match */}
        {!isExistingCustomer && (
          <div className="w-1/3">
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              placeholder="Phone number"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
            />
          </div>
        )}
      </div>

      {showDropdown && searchResults.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-40 overflow-y-auto divide-y divide-slate-100">
          {searchResults.map((cust) => (
            <div
              key={cust.id}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelectCustomer({
                  id: Number(cust.id),
                  fullName: cust.fullName || cust.name || '',
                  phone: cust.phone || '',
                });
                setShowDropdown(false);
              }}
              className="p-2 hover:bg-purple-50 cursor-pointer flex items-center justify-between transition-colors"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800">{cust.fullName || cust.name}</p>
                <p className="text-[10px] text-slate-500">{cust.phone}</p>
              </div>
              <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                Select
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}