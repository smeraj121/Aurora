import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Filter, Calendar as CalendarIcon, Loader2, AlertTriangle } from 'lucide-react';
import { BookingModal } from '../bookingModal/BookingModal';
import { formatCurrency } from '../../lib/utils';
import { api } from '../../services/api';
import type { ExtendedAppointment } from './types';
import { TIME_SLOTS } from '../bookingModal/types/constants';
import { getLocalDateString } from '../../lib/dateUtils';
import { StaffColumn } from './components/StaffColumn';
import { useAppointmentSchedule } from '../../hooks/useAppointmentSchedule';
import { useAuth } from '../../context/AuthContext';

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [editingAppointmentId, setEditingAppointmentId] = useState<number | null>(null);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>('all');
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [selectedStartTime, setSelectedStartTime] = useState('');
  const [modalBackendError, setModalBackendError] = useState<string | null>(null);
  const {
  appointments,
  loading,
  saveAppointment,
  finishAppointment,
  cancelAppointment,
} = useAppointmentSchedule(currentDate);

  // Partial Payment Confirmation Dialog State
  const [pendingPaymentWarning, setPendingPaymentWarning] = useState<{ id: number; due: number } | null>(null);
  const { user } = useAuth();
  const isCustomerActive = user?.systemRole.toLocaleLowerCase()==='customer';

  const formattedDateString = getLocalDateString(currentDate);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const staffRes = await api.getStaff();

      if (staffRes.success) {
        setStaffList(staffRes.data);
      }
    } catch (err) {
      console.error('Failed to load staff:', err);
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

  const handleOpenModal = (apt: ExtendedAppointment | null = null, staffId?: number, startTime?: string) => {
    //if(apt && isCustomerActive && apt?.customerId !== user.id) return;
    setModalBackendError(null);
    if (apt?.status === 'cancelled') {
      setEditingAppointmentId(null);
    } else {
      setEditingAppointmentId(apt?.id ?? null);
    }
    setSelectedStaffId(staffId ?? apt?.staffId ?? null);
    setSelectedStartTime(startTime ?? apt?.startTime ?? '');
    setIsModalOpen(true);
  };

  const handleFinishAppointment = async (
  id: number,
  e?: React.MouseEvent
) => {
  e?.stopPropagation();

  const apt = appointments.find((a) => a.id === id);

  if (!apt) return;

  const total = Number(apt.amount || 0);
  const paid = Number(apt.paidAmount || 0);
  const due = total - paid;

  if (due > 0) {
    setPendingPaymentWarning({
      id,
      due,
    });

    return;
  }

  try {
    await finishAppointment(id);
  } catch (err: any) {
    console.error(err);
    //handleOpenModal(apt);
    setModalBackendError(
      err.message || 'Failed to finish appointment.'
    );
  }
};

  const handleCancelAppointment = (
  apt: ExtendedAppointment,
  e: React.MouseEvent
) => {
  e.stopPropagation();

  //handleOpenModal(apt);
};

  const handleSaveAppointment = async (savedApt: any) => {
    try {
      await saveAppointment(savedApt, editingAppointmentId);

      setIsModalOpen(false);
      setEditingAppointmentId(null);
      setModalBackendError(null);
    } catch (err: any) {
      setModalBackendError(
        err.message || 'Failed to save appointment.'
      );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Schedule & Calendar</h2>
          <p className="text-xs text-slate-500 mt-1">Manage staff timetables & daily bookings</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 shadow-sm">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedStaffFilter}
              onChange={(e) => setSelectedStaffFilter(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer font-semibold"
            >
              <option value="all">All Staff</option>
              {staffList.map((staff) => (
                <option key={staff.id} value={staff.id}>{staff.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm text-xs font-semibold text-slate-800">
            <button onClick={() => changeDate(-1)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 flex items-center gap-1.5 font-bold">
              <CalendarIcon className="w-3.5 h-3.5 text-purple-600" />
              {currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <button onClick={() => changeDate(1)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
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
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Appointments</p>
          <p className="text-xl font-extrabold text-slate-900 mt-0.5">{appointments.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Value</p>
          <p className="text-xl font-extrabold text-emerald-600 mt-0.5">
            {formatCurrency(appointments.reduce((sum, apt) => sum + Number(apt.amount || 0), 0))}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Collected</p>
          <p className="text-xl font-extrabold text-blue-600 mt-0.5">
            {formatCurrency(appointments.reduce((sum, apt) => sum + Number(apt.paidAmount || 0), 0))}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Payments</p>
          <p className="text-xl font-extrabold text-rose-600 mt-0.5">
            {formatCurrency(appointments.reduce((sum, apt) => sum + (Number(apt.amount || 0) - Number(apt.paidAmount || 0)), 0))}
          </p>
        </div>
      </div>

      {/* Grid view */}
      {loading ? (
        <div className="p-12 flex justify-center items-center bg-white rounded-2xl border border-slate-200 shadow-xs">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-50/90 sticky top-0 z-20 backdrop-blur-xs">
            <div className="col-span-2 p-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider border-r border-slate-200">
              Time
            </div>
            <div className="col-span-10 grid" style={{ gridTemplateColumns: `repeat(${Math.max(filteredStaff.length, 1)}, 1fr)` }}>
              {filteredStaff.map((staff) => (
                <div key={staff.id} className="p-2.5 flex items-center gap-2.5 border-r border-slate-200 last:border-r-0">
                  <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                    {staff.name?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-slate-900 truncate">{staff.name}</h5>
                    <p className="text-[10px] text-slate-400 truncate font-medium">{staff.role || 'Stylist'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-12">
            {/* Timeline Column (Darkened Hour Separators, Slot Counts Removed) */}
            <div className="col-span-2 border-r border-slate-200 bg-slate-50/40 select-none">
              {TIME_SLOTS.map((slot) => {
                const isHour = slot.endsWith(':00 AM') || slot.endsWith(':00 PM');
                return (
                  <div
                    key={slot}
                    style={{ height: '36px' }}
                    className={`flex items-center px-3 ${isHour ? 'border-t border-slate-300 text-xs font-bold text-slate-700' : 'border-t border-slate-100 text-[10px] text-slate-300'
                      }`}
                  >
                    {isHour ? slot : ''}
                  </div>
                );
              })}
            </div>

            {/* Staff Schedule Columns */}
            <div className="col-span-10 grid" style={{ gridTemplateColumns: `repeat(${Math.max(filteredStaff.length, 1)}, 1fr)` }}>
              {filteredStaff.map((staff) => (
                <StaffColumn
                  key={staff.id}
                  staff={staff}
                  appointments={appointments}
                  onAppointmentClick={(apt) => handleOpenModal(apt)}
                  onNewBooking={(staffId, slot) => handleOpenModal(null, staffId, slot)}
                  onFinish={handleFinishAppointment}
                  onCancel={handleCancelAppointment}
                  isCustomerActive={isCustomerActive}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pending Balance Confirmation Dialog */}
      {pendingPaymentWarning && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="p-2 bg-amber-50 rounded-xl border border-amber-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Unpaid Balance Warning</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This appointment has a pending balance of <strong className="text-slate-900 font-bold">{formatCurrency(pendingPaymentWarning.due)}</strong>. Are you sure you want to complete it without settling full payment?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setPendingPaymentWarning(null)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
  const id = pendingPaymentWarning.id;

  setPendingPaymentWarning(null);

  try {
    await finishAppointment(id);
  } catch (err: any) {
    const apt = appointments.find((appointment) => appointment.id === id);
    if (apt) handleOpenModal(apt);
    setModalBackendError(
      err.message || 'Failed to finish appointment.'
    );
  }
}}
                className="px-4 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 shadow-sm transition-colors"
              >
                Complete Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      <BookingModal
  isOpen={isModalOpen}
  onClose={() => {
    setIsModalOpen(false);
    setEditingAppointmentId(null);
    setModalBackendError(null);
  }}
  onSave={handleSaveAppointment}
  onFinishAppointment={async (id, bookingData) => {
    await finishAppointment(id, bookingData);
  }}
  onCancelAppointment={async (id, reason) => {
    await cancelAppointment(id, reason);
  }}
  appointmentId={editingAppointmentId}
  currentDate={formattedDateString}
  staffId={selectedStaffId}
  slot={selectedStartTime}
  initialError={modalBackendError}
/>
    </div>
  );
}
