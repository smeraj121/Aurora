import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Building2,
  Users,
  CalendarDays,
  Loader2,
} from 'lucide-react';
import { api } from '../../services/api';
import { TenantModal } from './component/TenantModal';
import type { Tenant, TenantFormData } from '../../types/tenant.types';

export function TenantManagement() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<'all' | 'active' | 'inactive'>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

  const loadTenants = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.getTenants();

      if (!response.success) {
        throw new Error(
          response.message || 'Failed to load tenants.'
        );
      }

      setTenants(response.data || []);
    } catch (err: any) {
      console.error('Failed to load tenants:', err);
      setError(
        err.message || 'Unable to load tenants.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  const filteredTenants = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return tenants.filter((tenant) => {
      const matchesSearch =
        !term ||
        tenant.name.toLowerCase().includes(term) ||
        tenant.slug.toLowerCase().includes(term) ||
        tenant.email?.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && tenant.isActive) ||
        (statusFilter === 'inactive' && !tenant.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [tenants, searchTerm, statusFilter]);

  const handleOpenAdd = () => {
    setEditingTenant(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setIsModalOpen(true);
  };

  const handleSave = async (data: TenantFormData) => {
    try {
      setError(null);

      const response = editingTenant
        ? await api.updateTenant(editingTenant.id, data)
        : await api.createTenant(data);

      if (!response.success) {
        throw new Error(
          response.message || 'Failed to save tenant.'
        );
      }

      setIsModalOpen(false);
      setEditingTenant(null);

      await loadTenants();
    } catch (err: any) {
      console.error('Failed to save tenant:', err);

      setError(
        err.message || 'Failed to save tenant.'
      );
    }
  };

  const handleToggleStatus = async (tenantId: number) => {
    try {
      setError(null);

      const tenant = tenants.find((x) => x.id === tenantId);

      if (!tenant) {
        throw new Error('Tenant not found.');
      }

      const response = await api.updateTenantStatus(
        tenant.id,
        !tenant.isActive
      );

      if (!response.success) {
        throw new Error(
          response.message || 'Failed to update tenant status.'
        );
      }

      await loadTenants();
    } catch (err: any) {
      console.error(
        'Failed to update tenant status:',
        err
      );

      setError(
        err.message || 'Failed to update tenant status.'
      );
    }
  };
  function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon className="w-4 h-4" />
        <span className="text-[10px] font-bold uppercase tracking-wider">
          {label}
        </span>
      </div>

      <p className="text-xl font-extrabold text-slate-900 mt-2">
        {value}
      </p>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-slate-400" />

      <div>
        <p className="text-[10px] text-slate-400">
          {label}
        </p>

        <p className="text-xs font-bold text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">
            Tenant Management
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            Manage salons, clinics and their platform access
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                     bg-purple-600 hover:bg-purple-700 text-white
                     text-xs font-bold shadow-md shadow-purple-900/20"
        >
          <Plus className="w-4 h-4" />
          Add Tenant
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SummaryCard
          icon={Building2}
          label="Total Tenants"
          value={tenants.length}
        />

        <SummaryCard
          icon={Building2}
          label="Active"
          value={tenants.filter((x) => x.isActive).length}
        />

        <SummaryCard
          icon={Building2}
          label="Inactive"
          value={tenants.filter((x) => !x.isActive).length}
        />
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <input
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              placeholder="Search tenants..."
              className="w-full pl-9 pr-4 py-2.5 text-xs
                         bg-slate-50 border border-slate-200 rounded-xl
                         focus:outline-none focus:ring-2
                         focus:ring-purple-500/20 focus:border-purple-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as typeof statusFilter
              )
            }
            className="px-3 py-2.5 text-xs font-semibold
                       bg-slate-50 border border-slate-200
                       rounded-xl focus:outline-none"
          >
            <option value="all">All Tenants</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Tenant list */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">

        {loading ? (
          <div className="py-16 flex items-center justify-center gap-2 text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs">
              Loading tenants...
            </span>
          </div>
        ) : filteredTenants.length === 0 ? (
          <div className="py-16 text-center">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />

            <p className="text-sm font-semibold text-slate-600">
              No tenants found
            </p>

            <p className="text-xs text-slate-400 mt-1">
              Try changing your search or filter.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTenants.map((tenant) => (
              <div
                key={tenant.id}
                className="p-5 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">

                  {/* Tenant */}
                  <div className="flex items-center gap-4 min-w-0">

                    <div className="w-11 h-11 rounded-xl bg-purple-100
                                    text-purple-700 flex items-center
                                    justify-center font-bold shrink-0">
                      {tenant.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 truncate">
                          {tenant.name}
                        </h3>

                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            tenant.isActive
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {tenant.isActive
                            ? 'Active'
                            : 'Inactive'}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 mt-0.5">
                        /{tenant.slug}
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        {tenant.email ||
                          'No email configured'}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="hidden md:flex items-center gap-6">

                    <Stat
                      icon={Users}
                      label="Customers"
                      value={tenant.customerCount ?? 0}
                    />

                    <Stat
                      icon={CalendarDays}
                      label="Staff"
                      value={tenant.staffCount ?? 0}
                    />

                    <div className="text-right">
                      <p className="text-[10px] text-slate-400">
                        Created
                      </p>

                      <p className="text-xs font-semibold text-slate-700">
                        {tenant.createdAt
                          ? new Date(
                              tenant.createdAt
                            ).toLocaleDateString()
                          : '-'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">

                    <button
                      onClick={() =>
                        handleOpenEdit(tenant)
                      }
                      className="p-2 rounded-lg text-slate-400
                                 hover:text-purple-600 hover:bg-purple-50"
                      title="Edit tenant"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() =>
                        handleToggleStatus(tenant.id)
                      }
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold ${
                        tenant.isActive
                          ? 'text-rose-600 bg-rose-50 hover:bg-rose-100'
                          : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                      }`}
                    >
                      {tenant.isActive
                        ? 'Deactivate'
                        : 'Activate'}
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <TenantModal
  isOpen={isModalOpen}
  tenant={editingTenant}
  onClose={() => {
    setIsModalOpen(false);
    setEditingTenant(null);
  }}
  onSave={handleSave}
  onToggleStatus={handleToggleStatus}
/>
      )}
    </div>
  );
}
