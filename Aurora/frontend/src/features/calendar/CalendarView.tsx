import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Filter, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { NewBookingModal } from './components/NewBookingModal';
import { cn, formatCurrency } from '../../lib/utils';
import type { Appointment } from '../../shared/types';
//import { api } from '../services/api';

const TIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
];

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>('all');

  const formattedDateString = currentDate.toISOString().split('T')[0];

  // Fetch staff and schedule on date change
  useEffect(() => {
    fetchScheduleData();
  }, [formattedDateString]);

  const fetchScheduleData = async () => {
    setLoading(true);
    try {
      const [calRes, staffRes] = await Promise.all([
        fetch(`http://localhost:5000/api/calendar?date=${formattedDateString}`).then((r) => r.json()),
        fetch(`http://localhost:5000/api/staff`).then((r) => r.json()),
      ]);

      if (calRes.success) setAppointments(calRes.data);
      if (staffRes.success) setStaffList(staffRes.data);
    } catch (err) {
      console.error('Failed to load schedule from server:', err);
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
      await fetch(`http://localhost:5000/api/calendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...savedApt, date: formattedDateString }),
      });
      fetchScheduleData(); 
    } catch (err) {
      console.error('Failed to save appointment:', err);
    }
  };

  const handleOpenModal = (apt: Appointment | null = null) => {
    setEditingAppointment(apt);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Calendar Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Schedule & Calendar</h1>
          <p className="text-xs text-slate-500 mt-1">Manage staff timetables & daily bookings</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Staff Filter Dropdown */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 shadow-sm">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedStaffFilter}
              onChange={(e) => setSelectedStaffFilter(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="all">All Stylists & Specialists</option>
              {staffList.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Selector Controls */}
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

          {/* Add Booking Button */}
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors shadow-md shadow-purple-900/20"
          >
            <Plus className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>
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
          <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-50/80">
            <div className="col-span-2 p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-r border-slate-200">
              Time Slot
            </div>
            <div className="col-span-10 grid grid-cols-3 divide-x divide-slate-200">
              {filteredStaff.map((staff) => (
                <div key={staff.id} className="p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-600/20 text-purple-600 font-bold flex items-center justify-center text-xs">
                    {staff.name?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{staff.name}</h4>
                    <p className="text-[10px] text-slate-500">{staff.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Slots */}
          <div className="divide-y divide-slate-100">
            {TIME_SLOTS.map((slot) => (
              <div key={slot} className="grid grid-cols-12 min-h-[80px]">
                <div className="col-span-2 p-3 text-xs font-semibold text-slate-500 border-r border-slate-200/80 bg-slate-50/40 flex items-start">
                  {slot}
                </div>

                <div className="col-span-10 grid grid-cols-3 divide-x divide-slate-100 relative">
                  {filteredStaff.map((staff) => {
                    const matchedApt = appointments.find(
                      (a: any) => String(a.staffId) === String(staff.id) && a.startTime === slot
                    );

                    return (
                      <div key={staff.id} className="p-2 relative group hover:bg-slate-50/50 transition-colors cursor-pointer">
                        {matchedApt ? (
                          <div
                            onClick={() => handleOpenModal(matchedApt)}
                            className={cn(
                              'p-2.5 rounded-xl border text-xs h-full flex flex-col justify-between shadow-xs transition-all hover:scale-[1.01] cursor-pointer',
                              matchedApt.status === 'completed' && 'bg-emerald-50/80 border-emerald-200 text-emerald-950',
                              matchedApt.status === 'in_progress' && 'bg-purple-50 border-purple-300 text-purple-950 ring-2 ring-purple-500/20',
                              matchedApt.status === 'confirmed' && 'bg-blue-50/80 border-blue-200 text-blue-950'
                            )}
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900">{matchedApt.customerName}</span>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/80 border border-slate-200/60">
                                  {matchedApt.startTime}
                                </span>
                              </div>
                              <p className="text-[11px] font-medium text-slate-600 mt-0.5">
                                {matchedApt.serviceName || 'Service'}
                              </p>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-[11px] font-semibold border-t border-slate-200/40 pt-1">
                              <span>{formatCurrency(matchedApt.amount || 0)}</span>
                              <span className="capitalize text-[10px] opacity-75">{matchedApt.status}</span>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenModal()}
                            className="w-full h-full min-h-[60px] rounded-xl border border-dashed border-transparent group-hover:border-slate-300 flex items-center justify-center text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-white"
                          >
                            <Plus className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-medium ml-1">Book</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Booking Form Modal */}
      <NewBookingModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingAppointment(null); }}
        onSave={handleSaveAppointment}
        initialData={editingAppointment}
      />
    </div>
  );
}