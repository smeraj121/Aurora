import { useState } from 'react';
import { X, UserPlus, Phone, Mail, Tag, AlignLeft } from 'lucide-react';
import type { CustomerDetail } from '../data/customerData';

interface AddCustomerDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onAddCustomer: (customer: CustomerDetail) => void;
}

export function AddCustomerDrawer({
    isOpen,
    onClose,
    onAddCustomer,
}: AddCustomerDrawerProps) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [selectedTag, setSelectedTag] = useState<'VIP' | 'Regular' | 'New Client'>('New Client');
    const [notes, setNotes] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !phone.trim()) return;

        const newCustomer: CustomerDetail = {
            id: `cust-${Date.now()}`,
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim() || 'N/A',
            totalSpent: 0,
            totalVisits: 0,
            lastVisitAt: 'N/A',
            vipTag: selectedTag === 'VIP',
            joinDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            history: [],
            notes: notes.trim(),
        };

        onAddCustomer(newCustomer);

        // Reset fields & close
        setName('');
        setPhone('');
        setEmail('');
        setSelectedTag('New Client');
        setNotes('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end">
            <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
                {/* Header */}
                <div>
                    <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300">
                                <UserPlus className="w-4 h-4" />
                            </div>
                            <h3 className="text-base font-bold">Add New Customer</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Form Content */}
                    <form id="add-customer-form" onSubmit={handleSubmit} className="p-6 space-y-4">
                        {/* Full Name */}
                        <div>
                            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                                Full Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Pooja Hegde"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                            />
                        </div>

                        {/* Mobile Number */}
                        <div>
                            <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                Phone Number <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="tel"
                                required
                                placeholder="e.g. +91 98765 43210"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                            />
                        </div>

                        {/* Email Address */}
                        <div>
                            <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                Email Address
                            </label>
                            <input
                                type="email"
                                placeholder="e.g. pooja@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                            />
                        </div>

                        {/* Client Category / Tag */}
                        <div>
                            <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                                <Tag className="w-3.5 h-3.5 text-slate-400" />
                                Customer Tag
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['New Client', 'Regular', 'VIP'] as const).map((tag) => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => setSelectedTag(tag)}
                                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${selectedTag === tag
                                            ? 'bg-purple-50 border-purple-500 text-purple-800 ring-2 ring-purple-500/20'
                                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Notes / Preferences */}
                        <div>
                            <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                                <AlignLeft className="w-3.5 h-3.5 text-slate-400" />
                                Preferences / Allergies Note
                            </label>
                            <textarea
                                rows={3}
                                placeholder="e.g. Sensitive scalp, prefers tea over coffee..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                            />
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="add-customer-form"
                        className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors shadow-md shadow-purple-900/20"
                    >
                        Save Customer Profile
                    </button>
                </div>
            </div>
        </div>
    );
}