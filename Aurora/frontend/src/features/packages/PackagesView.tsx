// views/PackagesView.tsx
import { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  X,
  Check,
  AlertCircle,
  Crown,
  TrendingUp,
  Users,
  IndianRupee,
  Calendar,
  ChevronDown,
  ChevronUp,
  Package as PackageIcon,
  Sparkles,
  ShoppingBag,
  User,
  Clock,
  Percent,
  Layers,
} from 'lucide-react';
import { api } from '../../services/api';
import { cn, formatCurrency } from '../../lib/utils';
import type { PackageModel, PackageStats, PopularPackage } from '../../shared/types/packages';
import { PackageModal } from './components/PackageModal';

export function PackagesView() {
  const [packages, setPackages] = useState<PackageModel[]>([]);
  const [stats, setStats] = useState<PackageStats | null>(null);
  const [popularPackages, setPopularPackages] = useState<PopularPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageModel | null>(null);
  const [showStats, setShowStats] = useState(true);

  useEffect(() => {
    loadData();
  }, [showInactive]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [packagesRes, statsRes, popularRes] = await Promise.all([
        api.getPackages(showInactive),
        api.getPackageStats(),
        api.getPopularPackages(5),
      ]);

      if (packagesRes.success) setPackages(packagesRes.data || []);
      if (statsRes.success) setStats(statsRes.data);
      if (popularRes.success) setPopularPackages(popularRes.data || []);
    } catch (error) {
      console.error('Failed to load packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePackage = async (data: any) => {
    try {
      if (editingPackage) {
        await api.updatePackage(editingPackage.id, data);
      } else {
        await api.createPackage(data);
      }
      await loadData();
      setIsModalOpen(false);
      setEditingPackage(null);
    } catch (error) {
      console.error('Failed to save package:', error);
      throw error;
    }
  };

  const handleDeletePackage = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await api.deletePackage(id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete package:', error);
      alert('Failed to delete package. It may be in use by customers.');
    }
  };

  const handleEditPackage = (pkg: PackageModel) => {
    setEditingPackage(pkg);
    setIsModalOpen(true);
  };

  const filteredPackages = packages.filter(pkg =>
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pkg.description && pkg.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Helper function to get gradient based on index
  const getCardGradient = (index: number) => {
    const gradients = [
      'from-violet-50 to-purple-50/50',
      'from-rose-50 to-pink-50/50',
      'from-emerald-50 to-teal-50/50',
      'from-amber-50 to-orange-50/50',
      'from-cyan-50 to-sky-50/50',
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-900/20">
              <PackageIcon className="w-4 h-4 text-white" />
            </div>
            Packages & Bundles
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Create and manage service packages, bundles, and memberships
          </p>
        </div>

        <button
          onClick={() => {
            setEditingPackage(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-xs font-bold shadow-md shadow-purple-900/20 transition-all shrink-0 hover:shadow-lg hover:shadow-purple-900/30"
        >
          <Plus className="w-4 h-4" />
          <span>Create Package</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Packages</p>
              <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
                <PackageIcon className="w-3.5 h-3.5 text-violet-600" />
              </div>
            </div>
            <p className="text-xl font-bold text-slate-900 mt-1">{stats.totalPackages}</p>
            <p className="text-[10px] text-emerald-600 font-medium">{stats.activePackages} active</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Purchases</p>
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
              </div>
            </div>
            <p className="text-xl font-bold text-slate-900 mt-1">{stats.totalPurchases}</p>
            <p className="text-[10px] text-slate-500">This month</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Revenue</p>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
              </div>
            </div>
            <p className="text-xl font-bold text-emerald-600 mt-1">{formatCurrency(stats.totalRevenue)}</p>
            <p className="text-[10px] text-slate-500">This month</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Unique Customers</p>
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-amber-600" />
              </div>
            </div>
            <p className="text-xl font-bold text-slate-900 mt-1">{stats.uniqueCustomers}</p>
            <p className="text-[10px] text-slate-500">This month</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-violet-50/50 rounded-xl border border-purple-200/60 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold text-purple-700 uppercase tracking-wider">Avg. Package Price</p>
              <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
                <Percent className="w-3.5 h-3.5 text-purple-600" />
              </div>
            </div>
            <p className="text-xl font-bold text-purple-700 mt-1">
              {formatCurrency(stats.avgPackagePrice)}
            </p>
            <p className="text-[10px] text-purple-500">Per package</p>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white rounded-xl border border-slate-200/80 p-3 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search packages by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <button
            onClick={() => setShowInactive(!showInactive)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all flex-1 sm:flex-none justify-center',
              showInactive
                ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            )}
          >
            <Filter className="w-3.5 h-3.5" />
            {showInactive ? 'Showing All' : 'Active Only'}
          </button>
          <button
            onClick={() => setShowStats(!showStats)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all flex-1 sm:flex-none justify-center',
              showStats
                ? 'border-purple-600 bg-purple-50 text-purple-700'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            )}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            {showStats ? 'Hide Stats' : 'Show Stats'}
          </button>
        </div>
      </div>

      {/* Popular Packages */}
      {showStats && popularPackages.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center">
                <Crown className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Most Popular Packages</h4>
            </div>
            <span className="text-[10px] text-slate-400">Top 5</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {popularPackages.map((pkg, index) => (
              <div
                key={pkg.id}
                className={cn(
                  'bg-gradient-to-br rounded-xl border p-4 transition-all hover:shadow-md hover:scale-[1.02]',
                  getCardGradient(index),
                  'border-slate-200/60'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{pkg.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-600 flex items-center gap-0.5">
                        <ShoppingBag className="w-3 h-3" />
                        {pkg.purchases}
                      </span>
                      <span className="text-[10px] text-slate-300">•</span>
                      <span className="text-[10px] font-medium text-emerald-600">
                        {formatCurrency(pkg.revenue)}
                      </span>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-white/60 border border-slate-200/60 flex items-center justify-center shrink-0 ml-2">
                    <span className="text-[8px] font-bold text-purple-600">#{index + 1}</span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200/60">
                  <p className="text-[10px] font-semibold text-purple-700">
                    {formatCurrency(pkg.totalPrice)} <span className="font-normal text-slate-500">per package</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Packages Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500">Loading packages...</p>
          </div>
        </div>
      ) : filteredPackages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
            <PackageIcon className="w-8 h-8 text-slate-300" />
          </div>
          <p className="font-semibold text-slate-600">No packages found</p>
          <p className="text-sm text-slate-500 mt-1">
            {searchTerm ? 'Try adjusting your search terms' : 'Create your first package to get started'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => {
                setEditingPackage(null);
                setIsModalOpen(true);
              }}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Package
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={cn(
                'bg-white rounded-xl border transition-all hover:shadow-lg hover:border-purple-200/60 group',
                pkg.isActive ? 'border-slate-200/80' : 'border-rose-200/60 bg-rose-50/20'
              )}
            >
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {pkg.name}
                      </h4>
                      {!pkg.isActive && (
                        <span className="text-[9px] font-medium bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full shrink-0">
                          Inactive
                        </span>
                      )}
                      {pkg.isActive && (
                        <span className="text-[9px] font-medium bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full shrink-0">
                          Active
                        </span>
                      )}
                    </div>
                    {pkg.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {pkg.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 ml-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditPackage(pkg)}
                      className="p-1.5 rounded-lg hover:bg-purple-50 text-slate-400 hover:text-purple-600 transition-colors"
                      title="Edit package"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePackage(pkg.id, pkg.name)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete package"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Package Details */}
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg">
                    <Layers className="w-3.5 h-3.5 text-purple-600" />
                    <span className="font-medium">{pkg.totalSessions} sessions</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-bold text-emerald-700">{formatCurrency(pkg.totalPrice)}</span>
                  </div>
                  {pkg.discountPercentage > 0 && (
                    <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
                      <Percent className="w-3.5 h-3.5" />
                      <span className="font-medium">{pkg.discountPercentage}% off</span>
                    </div>
                  )}
                </div>

                {/* Services List */}
                {pkg.services && pkg.services.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-[10px] font-medium text-slate-500 mb-1.5 uppercase tracking-wider">
                      Included Services
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {pkg.services.map((service, index) => (
                        <span
                          key={index}
                          className="text-[10px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full flex items-center gap-1"
                        >
                          {service.serviceName}
                          {service.quantity > 1 && (
                            <span className="font-semibold text-purple-600">×{service.quantity}</span>
                          )}
                          {service.discount > 0 && (
                            <span className="text-[8px] font-medium text-emerald-600 bg-emerald-50 px-1.5 rounded">
                              {service.discount}% off
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Date Created */}
                <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-400">
                  <Calendar className="w-3 h-3" />
                  <span>Created: {new Date(pkg.createdAt).toLocaleDateString('en-IN', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                  })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Package Modal */}
      <PackageModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPackage(null);
        }}
        onSave={handleSavePackage}
        initialData={editingPackage}
      />
    </div>
  );
}