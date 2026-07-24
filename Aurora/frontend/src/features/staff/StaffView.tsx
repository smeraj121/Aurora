// views/staff/StaffView.tsx
import { useState, useEffect, useMemo } from 'react';
import {
  UserPlus,
  Search,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
  Pencil,
  Eye,
  UserX,
  Star,
  TrendingUp,
  Users,
  CalendarDays,
  Award,
  Filter,
  ChevronRight,
  Loader2,
  BarChart3,
  Clock3,
  CheckCheck,
  IndianRupee,
} from 'lucide-react';
import { StaffModal } from './components/StaffModal';
import { api } from '../../services/api';
import { cn, formatCurrency } from '../../lib/utils';
import type { StaffMember, StaffSchedule, StaffStats, TopStaff } from '../../shared/types/staff';

export function StaffView() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [todaySchedule, setTodaySchedule] = useState<StaffSchedule[]>([]);
  const [staffStats, setStaffStats] = useState<StaffStats | null>(null);
  const [topStaff, setTopStaff] = useState<TopStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all staff with stats
      const staffResponse = await api.getStaff(false, true);
      if (staffResponse.success) {
        setStaffList(staffResponse.data);
        if (staffResponse.data.length > 0 && !selectedStaff) {
          // Load first staff with full stats
          await loadStaffDetails(staffResponse.data[0].id);
        }
      }

      // Load staff stats
      const statsResponse = await api.getStaffStats();
      if (statsResponse.success) {
        setStaffStats(statsResponse.data);
      }

      // Load top staff
      const topResponse = await api.getTopStaff(5);
      if (topResponse.success) {
        setTopStaff(topResponse.data);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load staff data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load staff details with full stats using the /:id?stats=true endpoint
  const loadStaffDetails = async (staffId: number) => {
    try {
      // This uses the GET /staff/:id?stats=true endpoint
      const response = await api.getStaffDetails(staffId, true);
      if (response.success) {
        setSelectedStaff(response.data);
        // Load schedule after getting staff details
        await loadStaffSchedule(staffId);
      }
    } catch (err) {
      console.error('Failed to load staff details:', err);
    }
  };

  // Load today's schedule for a staff member
  const loadStaffSchedule = async (staffId: number) => {
    try {
      const response = await api.getStaffSchedule(staffId);
      if (response.success) {
        setTodaySchedule(response.data);
      }
    } catch (err) {
      console.error('Failed to load schedule:', err);
    }
  };

  const handleSelectStaff = async (staff: StaffMember) => {
    await loadStaffDetails(staff.id);
  };

  const handleOpenAddModal = () => {
    setEditingStaff(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (staff: StaffMember) => {
    setEditingStaff(staff);
    setIsModalOpen(true);
  };

  const handleSaveStaff = async (savedStaff: StaffMember) => {
    try {
      let response;
      if (savedStaff.id) {
        response = await api.updateStaff(savedStaff.id, savedStaff);
      } else {
        response = await api.createStaff(savedStaff);
      }

      if (response.success) {
        await loadAllData();
        setIsModalOpen(false);
        setEditingStaff(null);
      }
    } catch (err: any) {
      console.error('Failed to save staff:', err);
      throw err;
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`;
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-700';
      case 'in_progress':
      case 'in progress':
        return 'bg-purple-100 text-purple-700';
      case 'confirmed':
        return 'bg-blue-100 text-blue-700';
      case 'scheduled':
        return 'bg-amber-100 text-amber-700';
      case 'cancelled':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const filteredStaff = useMemo(() => {
    let filtered = staffList;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.role.toLowerCase().includes(term) ||
          s.phone.includes(term)
      );
    }
    
    if (!showInactive) {
      filtered = filtered.filter((s) => s.isActive);
    }
    
    return filtered;
  }, [staffList, searchTerm, showInactive]);

  const inactiveStaff = staffList.filter((s) => !s.isActive);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Staff Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage your team, schedule, and performance</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-900/20 transition-all shrink-0 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Staff</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Staff List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, role or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
            />
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {filteredStaff.map((staff) => (
                <div
                  key={staff.id}
                  onClick={() => handleSelectStaff(staff)}
                  className={cn(
                    'p-3 cursor-pointer transition-all hover:bg-slate-50',
                    selectedStaff?.id === staff.id && 'bg-purple-50 border-l-4 border-purple-600'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {getInitials(staff.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{staff.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{staff.role}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-400 truncate">{staff.phone}</span>
                        <span
                          className={cn(
                            'w-1.5 h-1.5 rounded-full',
                            staff.isActive ? 'bg-emerald-500' : 'bg-amber-500'
                          )}
                        />
                        <span className="text-[10px] font-medium text-slate-600">
                          {staff.isActive ? 'Active' : 'On Leave'}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>

            {inactiveStaff.length > 0 && (
              <div className="p-3 border-t border-slate-200">
                <button
                  onClick={() => setShowInactive(!showInactive)}
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                >
                  <UserX className="w-3.5 h-3.5" />
                  {showInactive ? 'Hide' : 'View'} Inactive Staff ({inactiveStaff.length})
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Staff Details */}
        <div className="lg:col-span-3 space-y-4">
          {selectedStaff ? (
            <>
              {/* Profile Card */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold text-xl">
                      {getInitials(selectedStaff.name)}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">{selectedStaff.name}</h2>
                      <p className="text-sm text-purple-700 font-semibold">{selectedStaff.role}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {selectedStaff.phone}
                        </span>
                        {selectedStaff.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" />
                            {selectedStaff.email}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Joined {new Date(selectedStaff.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleOpenEditModal(selectedStaff)}
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                      title="Edit Staff"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors">
                      <UserX className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Stats from the /staff/:id?stats=true endpoint */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-emerald-600" />
                      Total Appointments
                    </p>
                    <p className="text-lg font-bold text-slate-900">
                      {selectedStaff.totalAppointments || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                      <CheckCheck className="w-3 h-3 text-emerald-600" />
                      Completed
                    </p>
                    <p className="text-lg font-bold text-slate-900">
                      {selectedStaff.completedAppointments || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                      <IndianRupee className="w-3 h-3 text-purple-600" />
                      Total Revenue
                    </p>
                    <p className="text-lg font-bold text-emerald-600">
                      {formatCurrency(selectedStaff.totalRevenue || 0)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-500" />
                      Average Rating
                    </p>
                    <p className="text-lg font-bold text-amber-500">
                      {selectedStaff.averageRating || 0} / 5
                    </p>
                    <p className="text-[10px] text-slate-400">
                      From {selectedStaff.totalReviews || 0} reviews
                    </p>
                  </div>
                </div>
              </div>

              {/* Today's Schedule */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  Today's Schedule
                </h3>
                {todaySchedule.length > 0 ? (
                  <div className="space-y-2">
                    {todaySchedule.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60 hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-bold text-slate-700 w-20">{item.time}</span>
                          <div>
                            <p className="text-xs font-semibold text-slate-900">{item.customer}</p>
                            <p className="text-[10px] text-slate-500">{item.service}</p>
                          </div>
                        </div>
                        <span className={cn(
                          'text-[10px] font-medium px-2 py-0.5 rounded-full',
                          getStatusColor(item.status)
                        )}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 text-center py-4">No appointments scheduled for today</p>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-semibold text-slate-600">Select a staff member</p>
              <p className="text-xs text-slate-500 mt-1">Choose a staff member from the list to view their details</p>
            </div>
          )}
        </div>
      </div>

      {/* Staff Modal */}
      <StaffModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingStaff(null);
        }}
        onSave={handleSaveStaff}
        initialData={editingStaff}
      />
    </div>
  );
}