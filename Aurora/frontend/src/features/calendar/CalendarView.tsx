// views/calendar/CalendarView.tsx
import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Filter, Calendar as CalendarIcon, Loader2, Package } from 'lucide-react';
import { NewBookingModal } from '../bookingModal/NewBookingModal';
import { cn, formatCurrency } from '../../lib/utils';
import { api } from '../../services/api';
import type { Appointment } from '../../shared/types';

const generateTimeSlots = () => {
  const slots: string[] = [];

  for (let hour = 9; hour < 21; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour;
      const displayMinute = minute.toString().padStart(2, '0');

      slots.push(
        `${displayHour.toString().padStart(2, '0')}:${displayMinute} ${period}`
      );
    }
  }

  return slots;
};

const TIME_SLOTS = generateTimeSlots();
const SLOT_MINUTES = 15;
const BLOCK_HEIGHT_PX = 36;

// ✅ FIXED: Get local date string without timezone issues
const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const normalizeTime = (time: string): string => {
  if (!time) return '';
  
  const parts = time.trim().split(' ');
  if (parts.length !== 2) return time;
  
  const timePart = parts[0];
  const period = parts[1];
  const [hours, minutes] = timePart.split(':').map(Number);
  
  const hourStr = hours < 10 ? `0${hours}` : `${hours}`;
  const minuteStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  
  return `${hourStr}:${minuteStr} ${period}`;
};

const getAppointmentDuration = (apt: any): number => {
  const parsed = Number(apt.durationMinutes ?? apt.duration ?? apt.serviceDuration);
  return !isNaN(parsed) && parsed > 0 ? parsed : 15;
};

const getBlockSpan = (durationMinutes: number): number => {
  return Math.max(1, Math.round(durationMinutes / SLOT_MINUTES));
};

interface ExtendedAppointment extends Appointment {
  services?: Array<{
    serviceId: number;
    serviceName: string;
    price: number;
    isPackage: boolean;
  }>;
  paidAmount?: number;
  paymentStatus?: string;
  paymentMethod?: string;
  isPackageAppointment?: boolean;
  customerPackageId?: number;
  packageName?: string;
  balanceDue?: number;
}

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [editingAppointmentId, setEditingAppointmentId] = useState<number | null>(null);
  const [appointments, setAppointments] = useState<ExtendedAppointment[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<ExtendedAppointment | null>(null);
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>('all');

  // ✅ FIXED: Use local date string
   const formattedDateString = getLocalDateString(currentDate);

  useEffect(() => {
    fetchScheduleData();
  }, [formattedDateString]);

  const fetchScheduleData = async () => {
    setLoading(true);
    try {
      const [calRes, staffRes] = await Promise.all([
        api.getSchedule(formattedDateString),
        api.getStaff(),
      ]);

      if (calRes.success) {
        const normalizedAppointments = calRes.data.map((apt: any) => {
          const duration = getAppointmentDuration(apt);
          return {
            ...apt,
            startTime: normalizeTime(apt.startTime),
            durationMinutes: duration,
          };
        });
        setAppointments(normalizedAppointments);
      }
      if (staffRes.success) {
        setStaffList(staffRes.data);
      }
    } catch (err) {
      console.error('Failed to load schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  const changeDate = (days: number) => {
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + days);
    setCurrentDate(nextDate);
  };

  const filteredStaff = useMemo(() => {
    return selectedStaffFilter === 'all'
      ? staffList
      : staffList.filter((s) => String(s.id) === String(selectedStaffFilter));
  }, [selectedStaffFilter, staffList]);

  const handleSaveAppointment = async (savedApt: any) => {
    try {
      await api.createAppointment({
        ...savedApt,
        date: formattedDateString,
      });
      await fetchScheduleData();
    } catch (err) {
      console.error('Failed to save appointment:', err);
      throw err;
    }
  };

  const handleOpenModal = (apt: ExtendedAppointment | null = null) => {
    setEditingAppointmentId(apt?.id||null);
    setEditingAppointment(apt);
    setIsModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-violet-50 border-violet-200 text-violet-950';
      case 'confirmed':
        return 'bg-blue-50/80 border-blue-200 text-blue-950';
      case 'in_progress':
        return 'bg-purple-50 border-purple-300 text-purple-950 ring-2 ring-purple-500/20';
      case 'completed':
        return 'bg-emerald-50/80 border-emerald-200 text-emerald-950';
      case 'cancelled':
        return 'bg-rose-50/80 border-rose-200 text-rose-950';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-950';
    }
  };

  const getPaymentBadge = (paymentStatus?: string) => {
    switch (paymentStatus) {
      case 'paid':
        return <span className="text-[10px] font-medium bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">Paid</span>;
      case 'partial':
        return <span className="text-[10px] font-medium bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Partial</span>;
      case 'pending':
        return <span className="text-[10px] font-medium bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Pending</span>;
      default:
        return null;
    }
  };

  const getServiceNames = (appointment: ExtendedAppointment) => {
    if (appointment.services && appointment.services.length > 0) {
      return appointment.services.map((s) => s.serviceName).join(', ');
    }
    return appointment.serviceName || 'Service';
  };

  const getServiceCount = (appointment: ExtendedAppointment) => {
    if (appointment.services && appointment.services.length > 0) {
      return appointment.services.length;
    }
    return appointment.serviceName ? 1 : 0;
  };

  const getAppointmentsForStaffAtTime = (staffId: number, timeSlot: string) => {
    return appointments.filter(
      (a) => String(a.staffId) === String(staffId) && a.startTime === timeSlot
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Schedule & Calendar</h1>
          <p className="text-xs text-slate-500 mt-1">Manage staff timetables & daily bookings</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 shadow-sm">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedStaffFilter}
              onChange={(e) => setSelectedStaffFilter(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="all">All Staff</option>
              {staffList.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm text-xs font-semibold text-slate-800">
            <button onClick={() => changeDate(-1)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-600">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-purple-600" />
              {currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <button onClick={() => changeDate(1)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-600">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors shadow-md shadow-purple-900/20"
          >
            <Plus className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3">
          <p className="text-[10px] font-medium text-slate-500">Total Appointments</p>
          <p className="text-lg font-bold text-slate-900">{appointments.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3">
          <p className="text-[10px] font-medium text-slate-500">Total Revenue</p>
          <p className="text-lg font-bold text-emerald-600">
            {formatCurrency(appointments.reduce((sum, apt) => sum + Number(apt.amount || 0), 0))}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3">
          <p className="text-[10px] font-medium text-slate-500">Collected</p>
          <p className="text-lg font-bold text-blue-600">
            {formatCurrency(appointments.reduce((sum, apt) => sum + Number(apt.paidAmount || 0), 0))}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3">
          <p className="text-[10px] font-medium text-slate-500">Pending Payments</p>
          <p className="text-lg font-bold text-amber-600">
            {formatCurrency(appointments.reduce((sum, apt) => sum + (Number(apt.amount || 0) - Number(apt.paidAmount || 0)), 0))}
          </p>
        </div>
      </div>

      {/* Grid view */}
      {loading ? (
        <div className="p-12 flex justify-center items-center bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          {/* Staff Header */}
          <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-50/80 sticky top-0 z-20">
            <div className="col-span-2 p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-r border-slate-200">
              Time Slot
            </div>
            <div className="col-span-10 grid" style={{ gridTemplateColumns: `repeat(${Math.max(filteredStaff.length, 1)}, 1fr)` }}>
              {filteredStaff.map((staff) => (
                <div key={staff.id} className="p-3 flex items-center gap-3 border-r border-slate-200 last:border-r-0">
                  <div className="w-8 h-8 rounded-full bg-purple-600/20 text-purple-600 font-bold flex items-center justify-center text-xs">
                    {staff.name?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{staff.name}</h4>
                    <p className="text-[10px] text-slate-500 truncate">{staff.role || 'Staff'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Slots Grid */}
          <div>
            {TIME_SLOTS.map((slot) => {
              const appointmentsAtSlot = appointments.filter((a) => a.startTime === slot);

              return (
                <div
                  key={slot}
                  style={{ height: `${BLOCK_HEIGHT_PX}px` }}
                  className={cn(
                    'grid grid-cols-12',
                    slot.endsWith(':00 AM') || slot.endsWith(':00 PM')
                      ? 'border-t border-slate-300'
                      : 'border-t border-slate-100'
                  )}
                >
                  <div
                    className={cn(
                      'col-span-2 border-r border-slate-200/80 bg-slate-50/40 flex items-center px-3',
                      slot.endsWith(':00 AM') || slot.endsWith(':00 PM')
                        ? 'text-xs font-semibold text-slate-500'
                        : 'text-[10px] text-slate-300'
                    )}
                  >
                    {slot.endsWith(':00 AM') || slot.endsWith(':00 PM') ? slot : ''}
                    {appointmentsAtSlot.length > 0 && (
                      <span className="ml-1 text-[9px] text-purple-600 font-bold">
                        ({appointmentsAtSlot.length})
                      </span>
                    )}
                  </div>

                  <div
                    className="col-span-10 grid relative"
                    style={{ gridTemplateColumns: `repeat(${Math.max(filteredStaff.length, 1)}, 1fr)` }}
                  >
                    {filteredStaff.map((staff) => {
                      const staffAppointments = getAppointmentsForStaffAtTime(staff.id, slot);

                      return (
                        <div
                          key={staff.id}
                          className="relative group hover:bg-slate-50/50 transition-colors border-r border-slate-100 last:border-r-0 h-full"
                        >
                          <button
                            onClick={() => handleOpenModal()}
                            className="w-full h-full border border-dashed border-transparent group-hover:border-slate-300 flex items-center justify-center text-slate-400 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Plus className="w-3.5 h-3.5 text-slate-400" />
                          </button>

                          {staffAppointments.map((apt) => {
                            const blocksCount = getBlockSpan(apt.durationMinutes || 15);
                            const cardHeight = blocksCount * BLOCK_HEIGHT_PX - 2;

                            return (
                              <div
                                key={apt.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenModal(apt);
                                }}
                                style={{
                                  height: `${cardHeight}px`,
                                  zIndex: 10,
                                }}
                                className={cn(
                                  'absolute top-0.5 left-0.5 right-0.5 p-2 rounded-xl border text-xs flex flex-col justify-between shadow-sm transition-all hover:scale-[1.01] hover:z-20 cursor-pointer overflow-hidden',
                                  getStatusColor(apt.status || 'scheduled')
                                )}
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="font-bold text-slate-900 text-xs truncate">
                                      {apt.customerName}
                                    </span>
                                    <div className="flex items-center gap-1 shrink-0">
                                      {apt.isPackageAppointment && (
                                        <Package className="w-3 h-3 text-purple-600" />
                                      )}
                                      {getPaymentBadge(apt.paymentStatus)}
                                    </div>
                                  </div>

                                  <p className="text-[10px] font-medium text-slate-600 mt-0.5 truncate">
                                    {getServiceNames(apt)}
                                    {getServiceCount(apt) > 1 && (
                                      <span className="ml-1 text-[10px] font-bold text-purple-600">
                                        (+{getServiceCount(apt) - 1})
                                      </span>
                                    )}
                                  </p>

                                  {apt.isPackageAppointment && apt.packageName && (
                                    <p className="text-[9px] font-medium text-purple-600 mt-0.5 truncate">
                                      📦 {apt.packageName}
                                    </p>
                                  )}
                                </div>

                                <div className="mt-1 flex items-center justify-between text-[10px] font-semibold border-t border-slate-200/40 pt-1">
                                  <div className="flex items-center gap-1 flex-wrap">
                                    <span>{formatCurrency(apt.amount || 0)}</span>
                                    {apt.paidAmount !== undefined && apt.paidAmount > 0 && (
                                      <span className="text-[9px] text-slate-400">
                                        (₹{apt.paidAmount})
                                      </span>
                                    )}
                                    {apt.balanceDue !== undefined && apt.balanceDue > 0 && (
                                      <span className="text-[9px] text-amber-600 font-bold">
                                        Bal: ₹{apt.balanceDue}
                                      </span>
                                    )}
                                  </div>
                                  <span className="capitalize text-[9px] opacity-75">
                                    {apt.durationMinutes}m
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* New Booking Form Modal - Pass currentDate */}
      <NewBookingModal
    isOpen={isModalOpen}
    onClose={() => {
      setIsModalOpen(false);
      setEditingAppointment(null);
      setEditingAppointmentId(null);
      fetchScheduleData(); // Refresh
    }}
    onSave={handleSaveAppointment}
    appointmentId={editingAppointmentId}
    initialData={editingAppointment}
    currentDate={formattedDateString}
  />
    </div>
  );
}