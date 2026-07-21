import { useState } from 'react';
import {
  Search,
  Phone,
  Mail,
  Crown,
  Calendar,
  IndianRupee,
  History,
  MessageSquare,
  Sparkles,
  ChevronRight,
  UserPlus,
} from 'lucide-react';
import { CUSTOMERS_DATA, type CustomerDetail } from './data/customerData';
import { cn, formatCurrency } from '../../lib/utils';
import { AddCustomerDrawer } from './components/AddCustomerDrawer';
import defaultAvatar from "C:\\sampleproject\\Aurora\\frontend\\src\\assets\\user.png";

export function CustomersView() {
  const [customers, setCustomers] = useState<CustomerDetail[]>(CUSTOMERS_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(CUSTOMERS_DATA[0].id);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);

  const handleAddCustomer = (newCust: CustomerDetail) => {
    setCustomers((prev) => [newCust, ...prev]);
    setSelectedCustomerId(newCust.id);
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedCustomer =
    customers.find((c) => c.id === selectedCustomerId) || customers[0];

  const avgOrderValue = Math.round(
    selectedCustomer.totalSpent / (selectedCustomer.totalVisits || 1)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Customer Directory & CRM
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage client profiles, lifetime spending & visit history
          </p>
        </div>

        {/* Working Add Customer Button */}
        <button
          onClick={() => setIsAddDrawerOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-900/20 transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* 2-Column CRM Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Customer Directory List */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[680px]">
          {/* Search Box Header */}
          <div className="p-4 border-b border-slate-200/80 bg-slate-50/50">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 shadow-xs"
              />
            </div>
          </div>

          {/* Customer Item List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredCustomers.map((customer) => {
              const isSelected = customer.id === selectedCustomerId;
              return (
                <div
                  key={customer.id}
                  onClick={() => setSelectedCustomerId(customer.id)}
                  className={cn(
                    'p-4 cursor-pointer transition-all flex items-center justify-between group',
                    isSelected
                      ? 'bg-purple-50/60 border-l-4 border-purple-600'
                      : 'hover:bg-slate-50/80'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={customer.avatar}
                      alt={customer.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500/20"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.alt = 'dds';
                      }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-900 transition-colors">
                          {customer.name}
                        </h4>
                        {customer.vipTag && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                            <Crown className="w-2.5 h-2.5 fill-amber-500" />
                            VIP
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{customer.phone}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-900">
                      {formatCurrency(customer.totalSpent)}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {customer.totalVisits} visits
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Customer Profile Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            {/* Header Profile Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <img
                  src={selectedCustomer.avatar}
                  alt={selectedCustomer.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-4 ring-purple-500/10"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">{selectedCustomer.name}</h2>
                    {selectedCustomer.vipTag && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        <Crown className="w-3 h-3 fill-amber-500" />
                        VIP Client
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1.5">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {selectedCustomer.phone}
                    </span>
                    {selectedCustomer.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {selectedCustomer.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors">
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button className="px-3 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors shadow-xs">
                  Book Service
                </button>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-4 my-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
                  <IndianRupee className="w-3.5 h-3.5 text-purple-600" />
                  <span>Lifetime Value</span>
                </div>
                <p className="text-lg font-extrabold text-slate-900 mt-1">
                  {formatCurrency(selectedCustomer.totalSpent)}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-purple-600" />
                  <span>Total Visits</span>
                </div>
                <p className="text-lg font-extrabold text-slate-900 mt-1">
                  {selectedCustomer.totalVisits} Times
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Avg. Ticket Size</span>
                </div>
                <p className="text-lg font-extrabold text-slate-900 mt-1">
                  {formatCurrency(avgOrderValue)}
                </p>
              </div>
            </div>

            {/* Notes Section */}
            {selectedCustomer.notes && (
              <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-100 text-xs text-purple-900">
                <span className="font-bold block mb-0.5">Preferences & Notes:</span>
                {selectedCustomer.notes}
              </div>
            )}
          </div>

          {/* Visit History Timeline */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
              <History className="w-4 h-4 text-purple-600" />
              Visit History ({selectedCustomer.history.length})
            </h3>

            <div className="space-y-3">
              {selectedCustomer.history.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{item.serviceName}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Served by <span className="font-semibold text-slate-700">{item.staffName}</span> • {item.startTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-900">
                      {formatCurrency(item.amount)}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Slide-Over Drawer Component */}
      <AddCustomerDrawer
        isOpen={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
        onAddCustomer={handleAddCustomer}
      />
    </div>
  );
}