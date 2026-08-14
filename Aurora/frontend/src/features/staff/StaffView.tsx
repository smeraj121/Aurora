// views/staff/StaffView.tsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  UserPlus,
  Search,
  Phone,
  Mail,
  Calendar,
  Pencil,
  UserX,
  Star,
  TrendingUp,
  Users,
  ChevronRight,
  Loader2,
  CheckCheck,
  IndianRupee,
  AlertCircle,
  UserCheck,
  Plus,
} from 'lucide-react';
import { StaffModal } from './components/StaffModal';
import { api } from '../../services/api';
import { cn, formatCurrency } from '../../lib/utils';
import type { StaffMember, StaffSchedule, StaffStats, TopStaff } from '../../types/staff.types';
import { BookingModal } from '../bookingModal/BookingModal';

export function StaffView() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [todaySchedule, setTodaySchedule] = useState<StaffSchedule[]>([]);
  const [, setStaffStats] = useState<StaffStats | null>(null);
  const [, setTopStaff] = useState<TopStaff[]>([]);

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [editingAppointmentId, setEditingAppointmentId] = useState<number | null>(null);
  const [selectedStartTime, setSelectedStartTime] = useState('');
  const [modalBackendError, setModalBackendError] = useState<string | null>(null);

  // Load schedule for a staff member
  const loadStaffSchedule = async (staffId: number) => {
    try {
      const response = await api.getStaffSchedule(staffId);
      if (response && response.success) {
        setTodaySchedule(response.data || []);
      } else {
        setTodaySchedule([]);
      }
    } catch (err) {
      console.error('Failed to load schedule:', err);
      setTodaySchedule([]);
    }
  };

  // Load detailed info for selected staff
  const loadStaffDetails = useCallback(async (staffId: number) => {
    try {
      setDetailsLoading(true);
      const response = await api.getStaffDetailsWithStats(staffId);

      if (response && response.success && response.data) {
        setSelectedStaff(response.data);
      } else {
        // Fallback to local list item if full detail fails
        const fallback = staffList.find((s) => s.id === staffId) || null;
        setSelectedStaff(fallback);
      }

      await loadStaffSchedule(staffId);
    } catch (err) {
      console.error('Failed to load staff details:', err);
      const fallback = staffList.find((s) => s.id === staffId) || null;
      setSelectedStaff(fallback);
    } finally {
      setDetailsLoading(false);
    }
  }, [staffList]);

  // Load main dashboard data
  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch Staff List
      const staffResponse = await api.getStaff(false, true);
      let loadedStaff: StaffMember[] = [];

      if (staffResponse && staffResponse.success && Array.isArray(staffResponse.data)) {
        loadedStaff = staffResponse.data;
        setStaffList(loadedStaff);
      }

      // Fetch Global Staff Statistics
      const statsResponse = await api.getStaffStats();
      if (statsResponse && statsResponse.success) {
        setStaffStats(statsResponse.data);
      }

      // Fetch Top Performing Staff
      const topResponse = await api.getTopStaff(5);
      if (topResponse && topResponse.success) {
        setTopStaff(topResponse.data);
      }

      // Select first available staff if none is currently selected
      if (loadedStaff.length > 0) {
        const targetId = selectedStaff ? selectedStaff.id : loadedStaff[0].id;
        await loadStaffDetails(targetId);
      } else {
        setSelectedStaff(null);
      }
    } catch (err) {
      console.error('Failed to load staff data:', err);
      setError('Unable to reach the server. Please check your network or try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedStaff, loadStaffDetails]);

  useEffect(() => {
    loadAllData();
  }, []);

  const handleSelectStaff = async (staff: StaffMember) => {
    if (selectedStaff?.id === staff.id) return;
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

  const handleOpenNewBooking = () => {
    if (!selectedStaff) return;

    setEditingAppointmentId(null);
    setSelectedStartTime('');
    setModalBackendError(null);
    setIsBookingModalOpen(true);
  };

  const handleSaveAppointment = async (bookingData: any) => {
    try {
      const response = editingAppointmentId
        ? await api.updateAppointment(
          editingAppointmentId,
          bookingData
        )
        : await api.createAppointment({
          ...bookingData,
          staffId: selectedStaff?.id,
        });

      if (!response.success) {
        throw new Error(
          response.message || 'Failed to save appointment.'
        );
      }

      setIsBookingModalOpen(false);
      setEditingAppointmentId(null);
      setModalBackendError(null);

      if (selectedStaff) {
        await loadStaffSchedule(selectedStaff.id);
      }
    } catch (error: any) {
      console.error('Failed to save appointment:', error);
      setModalBackendError(
        error.message || 'Failed to save appointment.'
      );
    }
  };

  const handleOpenEditBooking = (appointment: StaffSchedule) => {
    setEditingAppointmentId(appointment.id);
    setSelectedStartTime(appointment.time || '');
    setModalBackendError(null);
    setIsBookingModalOpen(true);
  };

  const handleToggleStatus = async (staff: StaffMember) => {
    try {
      const updatedPayload = { ...staff, isActive: !staff.isActive };
      const response = await api.updateStaff(staff.id, updatedPayload);

      if (response && response.success) {
        await loadAllData();
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleSaveStaff = async (savedStaff: StaffMember) => {
    try {
      let response;
      if (savedStaff.id) {
        response = await api.updateStaff(savedStaff.id, savedStaff);
      } else {
        response = await api.createStaff(savedStaff);
      }

      if (response && response.success) {
        setIsModalOpen(false);
        setEditingStaff(null);
        await loadAllData();
      }
    } catch (err: any) {
      console.error('Failed to save staff:', err);
      throw err;
    }
  };

  const getInitials = (name: string = '') => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
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
          s.name?.toLowerCase().includes(term) ||
          s.role?.toLowerCase().includes(term) ||
          s.phone?.includes(term)
      );
    }

    if (!showInactive) {
      filtered = filtered.filter((s) => s.isActive);
    }

    return filtered;
  }, [staffList, searchTerm, showInactive]);

  const inactiveStaff = useMemo(() => staffList.filter((s) => !s.isActive), [staffList]);

  // Safely extract stats regardless of backend nesting schema
  const currentStats = useMemo(() => {
    if (!selectedStaff) return { appointments: 0, completed: 0, revenue: 0, rating: 0, reviews: 0 };

    const statsObj = (selectedStaff as any).stats || selectedStaff;
    return {
      appointments: statsObj.totalAppointments || statsObj.appointmentsCount || 0,
      completed: statsObj.completedAppointments || statsObj.completedCount || 0,
      revenue: statsObj.totalRevenue || statsObj.revenue || 0,
      rating: statsObj.averageRating || statsObj.rating || 0,
      reviews: statsObj.totalReviews || statsObj.reviewCount || 0,
    };
  }, [selectedStaff]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <p className="text-xs text-slate-500 font-medium">Loading staff details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Staff Directory</h2>
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

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

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
              {filteredStaff.length > 0 ? (
                filteredStaff.map((staff) => (
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
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">No staff members found</div>
              )}
            </div>

            {inactiveStaff.length > 0 && (
              <div className="p-3 border-t border-slate-200 bg-slate-50/50">
                <button
                  onClick={() => setShowInactive(!showInactive)}
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1 w-full justify-center"
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
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm relative">
                {detailsLoading && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-2xl z-10">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                  </div>
                )}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold text-xl shrink-0">
                      {getInitials(selectedStaff.name)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{selectedStaff.name}</h3>
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
                        {selectedStaff.createdAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Joined {new Date(selectedStaff.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleOpenEditModal(selectedStaff)}
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                      title="Edit Staff"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(selectedStaff)}
                      className={cn(
                        'p-2 rounded-xl border transition-colors cursor-pointer',
                        selectedStaff.isActive
                          ? 'border-rose-200 hover:bg-rose-50 text-rose-600'
                          : 'border-emerald-200 hover:bg-emerald-50 text-emerald-600'
                      )}
                      title={selectedStaff.isActive ? 'Deactivate Staff' : 'Activate Staff'}
                    >
                      {selectedStaff.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Stats Section */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-emerald-600" />
                      Total Appointments
                    </p>
                    <p className="text-lg font-bold text-slate-900">{currentStats.appointments}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                      <CheckCheck className="w-3 h-3 text-emerald-600" />
                      Completed
                    </p>
                    <p className="text-lg font-bold text-slate-900">{currentStats.completed}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                      <IndianRupee className="w-3 h-3 text-purple-600" />
                      Total Revenue
                    </p>
                    <p className="text-lg font-bold text-emerald-600">
                      {formatCurrency(currentStats.revenue)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-500" />
                      Average Rating
                    </p>
                    <p className="text-lg font-bold text-amber-500">{currentStats.rating} / 5</p>
                    <p className="text-[10px] text-slate-400">
                      From {currentStats.reviews} reviews
                    </p>
                  </div>
                </div>
              </div>

              {/* Today's Schedule */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    Today's Schedule
                  </h4>

                  <button
                    onClick={handleOpenNewBooking}
                    disabled={!selectedStaff}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white text-[11px] font-semibold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Booking
                  </button>
                </div>
                {todaySchedule.length > 0 ? (
                  <div className="space-y-2">
                    {todaySchedule.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleOpenEditBooking(item)}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60 hover:bg-purple-50/40 hover:border-purple-200 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          {/* Time */}
                          <div className="w-28 shrink-0">
                            <p className="text-xs font-bold text-slate-800">
                              {item.start_time}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              to {item.end_time}
                            </p>
                          </div>

                          {/* Appointment details */}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-semibold text-slate-900">
                                {item.customer}
                              </p>

                              <span
                                className={cn(
                                  'text-[10px] font-medium px-2 py-0.5 rounded-full',
                                  getStatusColor(item.status)
                                )}
                              >
                                {item.status}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-[10px] text-slate-500">
                                {item.service}
                              </p>

                              {item.isPackage && (
                                <>
                                  <span className="text-slate-300">•</span>
                                  <span className="text-[10px] font-medium text-purple-600">
                                    Package
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Appointment ID */}
                        <span className="text-[10px] text-slate-400">
                          #{item.id}
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
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setEditingAppointmentId(null);
          setModalBackendError(null);
        }}
        onSave={handleSaveAppointment}
        appointmentId={editingAppointmentId}
        staffId={selectedStaff?.id ?? null}
        slot={selectedStartTime}
        initialError={modalBackendError}
      />
    </div>
  );
}