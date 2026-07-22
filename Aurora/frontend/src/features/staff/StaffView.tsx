import { useState } from 'react';
import { UserPlus, Clock, Percent, Phone, Sparkles, CheckCircle2, Pencil } from 'lucide-react';
import { StaffFormDrawer, type StaffMember } from './components/StaffFormDrawer';

const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'staff-1',
    name: 'Aisha Khan',
    role: 'Senior Master Stylist',
    specialization: 'HydraFacial & Keratin Treatments',
    phone: '+91 98112 23344',
    commissionRate: 20,
    workDays: ['M', 'T', 'W', 'T', 'F', 'S'],
    workingHours: '10:00 AM - 07:00 PM',
    status: 'Active',
    avatarColor: 'bg-purple-600',
  },
  {
    id: 'staff-2',
    name: 'Rahul Kumar',
    role: 'Barber & Hair Styling Lead',
    specialization: 'Beard Grooming & Executive Haircuts',
    phone: '+91 97223 34455',
    commissionRate: 15,
    workDays: ['T', 'W', 'T', 'F', 'S', 'S'],
    workingHours: '11:00 AM - 08:00 PM',
    status: 'Active',
    avatarColor: 'bg-blue-600',
  },
  {
    id: 'staff-3',
    name: 'Meera Das',
    role: 'Nail Artist & Esthetician',
    specialization: 'Gel Extensions & Nail Art',
    phone: '+91 96334 45566',
    commissionRate: 15,
    workDays: ['M', 'W', 'T', 'F', 'S', 'S'],
    workingHours: '10:00 AM - 06:30 PM',
    status: 'Active',
    avatarColor: 'bg-pink-600',
  },
];

export function StaffView() {
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  const handleOpenAddDrawer = () => {
    setEditingStaff(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEditDrawer = (staff: StaffMember) => {
    setEditingStaff(staff);
    setIsDrawerOpen(true);
  };

  const handleSaveStaff = (savedStaff: StaffMember) => {
    setStaffList((prev) => {
      const exists = prev.some((item) => item.id === savedStaff.id);
      if (exists) {
        // Edit existing staff member
        return prev.map((item) => (item.id === savedStaff.id ? savedStaff : item));
      }
      // Insert new staff member at top
      return [savedStaff, ...prev];
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Staff & Roster Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage team schedules, commissions, shift timings, and service assignments
          </p>
        </div>

        <button
          onClick={handleOpenAddDrawer}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-900/20 transition-all shrink-0 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Staff</span>
        </button>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {staffList.map((staff) => (
          <div
            key={staff.id}
            className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4 hover:border-purple-200 transition-all relative overflow-hidden group"
          >
            {/* Top Bar / Status & Edit Action */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-full bg-purple-600 text-white flex items-center justify-center font-medium text-sm shadow-xs`}
                >
                  {staff.name.charAt(0)}{staff.name.split(' ')[1]?.charAt(0) || ''}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 text-sm">{staff.name}</h3>
                  <p className="text-xs text-purple-700 font-semibold">{staff.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEditDrawer(staff)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 border border-transparent hover:border-purple-200 transition-all cursor-pointer"
                  title="Edit Staff Member"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                    staff.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                      : 'bg-amber-50 text-amber-700 border-amber-200/80'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  {staff.status}
                </span>
              </div>
            </div>

            {/* Specialization Pill */}
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span className="truncate font-medium">{staff.specialization}</span>
            </div>

            {/* Schedule & Commission Details */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                  <Clock className="w-3.5 h-3.5" /> Shift
                </span>
                <span className="font-bold text-slate-800">{staff.workingHours}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                  <Percent className="w-3.5 h-3.5" /> Commission
                </span>
                <span className="font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                  {staff.commissionRate}% rate
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                  <Phone className="w-3.5 h-3.5" /> Contact
                </span>
                <span className="font-medium text-slate-700">{staff.phone}</span>
              </div>
            </div>

            {/* Working Days Badges */}
            <div className="pt-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">
                Active Workdays
              </span>
              <div className="flex flex-wrap gap-1 justify-center">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day) => {
                  const isActive = staff.workDays.includes(day);
                  return (
                    <span
                      key={day}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        isActive
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-100 text-slate-300'
                      }`}
                    >
                      {day}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reusable Form Drawer */}
      <StaffFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSaveStaff={handleSaveStaff}
        initialData={editingStaff}
      />
    </div>
  );
}