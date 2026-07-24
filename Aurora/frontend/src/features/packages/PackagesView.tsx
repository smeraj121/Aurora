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
  
} from 'lucide-react';
import { api } from '../../services/api';
import { cn, formatCurrency } from '../../lib/utils';
//import { PackageModal } from './components/PackageModal';
//import type { type Package, PackageStats, PopularPackage } from '../../shared/types/package';
import type { Package, PackageStats, PopularPackage } from '../../shared/types/packages';
import { PackageModal } from './components/PackageModal';

export function PackagesView() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [stats, setStats] = useState<PackageStats | null>(null);
  const [popularPackages, setPopularPackages] = useState<PopularPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
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

  const handleEditPackage = (pkg: Package) => {
    setEditingPackage(pkg);
    setIsModalOpen(true);
  };

  const filteredPackages = packages.filter(pkg =>
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pkg.description && pkg.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <div className="w-6 h-6 text-purple-600" />
            Packages & Bundles
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create and manage service packages, bundles, and memberships
          </p>
        </div>

        <button
          onClick={() => {
            setEditingPackage(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-900/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Package</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-[10px] font-medium text-slate-500">Total Packages</p>
            <p className="text-xl font-bold text-slate-900">{stats.totalPackages}</p>
            <p className="text-[10px] text-emerald-600">{stats.activePackages} active</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-[10px] font-medium text-slate-500">Total Purchases</p>
            <p className="text-xl font-bold text-slate-900">{stats.totalPurchases}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-[10px] font-medium text-slate-500">Revenue</p>
            <p className="text-xl font-bold text-emerald-600">{formatCurrency(stats.totalRevenue)}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-[10px] font-medium text-slate-500">Unique Customers</p>
            <p className="text-xl font-bold text-slate-900">{stats.uniqueCustomers}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-[10px] font-medium text-slate-500">Avg. Package Price</p>
            <p className="text-xl font-bold text-purple-600">
              {stats.totalPackages > 0 
                ? formatCurrency( stats.totalRevenue / stats.totalPurchases || 0)
                : formatCurrency(0)}
            </p>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search packages by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowInactive(!showInactive)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors',
              showInactive
                ? 'border-purple-600 bg-purple-50 text-purple-700'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            )}
          >
            <Filter className="w-3.5 h-3.5" />
            {showInactive ? 'Showing All' : 'Active Only'}
          </button>
          <button
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            {showStats ? 'Hide Stats' : 'Show Stats'}
          </button>
        </div>
      </div>

      {/* Popular Packages */}
      {showStats && popularPackages.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-500" />
            Most Popular Packages
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {popularPackages.map((pkg) => (
              <div key={pkg.id} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <p className="text-xs font-bold text-slate-900 truncate">{pkg.name}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {pkg.purchases} purchases • {formatCurrency(pkg.revenue)}
                </p>
                <p className="text-[10px] font-semibold text-purple-600 mt-1">
                  {formatCurrency(pkg.totalPrice)} per package
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Packages Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredPackages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-600">No packages found</p>
          <p className="text-xs text-slate-500 mt-1">
            {searchTerm ? 'Try adjusting your search' : 'Create your first package to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={cn(
                'bg-white rounded-xl border transition-all hover:shadow-md',
                pkg.isActive ? 'border-slate-200' : 'border-rose-200 bg-rose-50/30'
              )}
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {pkg.name}
                    </h3>
                    {pkg.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {pkg.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-2 shrink-0">
                    {!pkg.isActive && (
                      <span className="text-[10px] font-medium bg-rose-100 text-rose-700 px-2 py-0.5 rounded">
                        Inactive
                      </span>
                    )}
                    <button
                      onClick={() => handleEditPackage(pkg)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePackage(pkg.id, pkg.name)}
                      className="p-1.5 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Package Details */}
                <div className="mt-3 flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1 text-slate-600">
                    <div className="w-3.5 h-3.5 text-purple-600" />
                    <span className="font-medium">{pkg.totalSessions} sessions</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-bold text-emerald-600">{formatCurrency(pkg.totalPrice)}</span>
                  </div>
                  {pkg.discountPercentage > 0 && (
                    <div className="flex items-center gap-1 text-amber-600">
                      <span className="font-medium">{pkg.discountPercentage}% off</span>
                    </div>
                  )}
                </div>

                {/* Services List */}
                {pkg.services && pkg.services.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-[10px] font-medium text-slate-500 mb-1.5">Included Services:</p>
                    <div className="flex flex-wrap gap-1 justify-center items-center">
                      {pkg.services.map((service, index) => (
                        <span
                          key={index}
                          className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
                        >
                          {service.serviceName} {service.quantity > 1 && `×${service.quantity}`}
                          {service.discount > 0 && ` (${service.discount}% off)`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
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