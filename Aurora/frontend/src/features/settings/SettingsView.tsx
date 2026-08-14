import { useEffect, useState } from 'react';
import {
    Users,
    Scissors,
    CalendarCheck,
    Building2,
    Plus,
    Pencil,
    Power,
    Clock,
    CheckCircle2,
    Loader2,
} from 'lucide-react';
import type { DesignationDetails } from '../../types/staff.types';
import type { Service } from '../../types/service.types';
import { api } from '../../services/api';
import { DesignationModal } from '../designation/component/DesignationModal';
import { ServiceModal } from '../services/components/ServiceModal';

type SettingsSection = | 'staff-services' | 'appointments' | 'business';

export function SettingsView() {
    const [section, setSection] = useState<SettingsSection>('staff-services');
    // ---------- Designations ---------
    const [designations, setDesignations] = useState<DesignationDetails[]>([]);
    const [loadingDesignations, setLoadingDesignations] = useState(true);

    // ---------- Services ----------
    const [services, setServices] = useState<Service[]>([]);
    const [loadingServices, setLoadingServices] = useState(true);
    const [categories, setCategories] = useState<string[]>([]);

    // ---------- Appointment settings (local state) ----------
    const [appointmentSettings, setAppointmentSettings] = useState({
        confirmBeforeCancel: true,
        allowStatusChange: true,
        showFinishButton: true,
    });

    // ---------- Modal states ----------
    const [designationModalOpen, setDesignationModalOpen] = useState(false);
    const [editingDesignation, setEditingDesignation] = useState<DesignationDetails | null>(null);

    const [serviceModalOpen, setServiceModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);

    // ---------- Load data ----------
    const loadData = async () => {
        try {
            await Promise.all([loadDesignations(), loadServices()]);
        } catch (error) {
            console.error('Failed to load settings data', error);
        }
    };

    const loadDesignations = async () => {
        setLoadingDesignations(true);
        try {
            const res = await api.getDesignations(true); // include inactive
            if (res.success) {
                setDesignations(res.data);
            }
        } catch (error) {
            console.error('Failed to load designations', error);
        } finally {
            setLoadingDesignations(false);
        }
    };

    const loadServices = async () => {
        setLoadingServices(true);
        try {
            const [servicesRes, categoriesRes] = await Promise.all([
                api.getBookingServices(true), // include inactive
                api.getServiceCategories(),
            ]);
            if (servicesRes.success) {
                setServices(servicesRes.data);
            }
            if (categoriesRes.success) {
                setCategories(categoriesRes.data);
            }
        } catch (error) {
            console.error('Failed to load services', error);
        } finally {
            setLoadingServices(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // ---------- Designation actions ----------
    const handleToggleDesignation = async (id: number) => {
        const designation = designations.find((d) => d.id === id);
        if (!designation) return;
        try {
            await api.toggleDesignationStatus(id, !designation.isActive);
            await loadDesignations();
        } catch (error) {
            console.error('Failed to toggle designation', error);
        }
    };

    const handleAddDesignation = () => {
        setEditingDesignation(null);
        setDesignationModalOpen(true);
    };

    const handleEditDesignation = (designation: DesignationDetails) => {
        setEditingDesignation(designation);
        setDesignationModalOpen(true);
    };

    const handleSaveDesignation = async (data: DesignationDetails) => {
        if (data.id) {
            await api.updateDesignation(data.id, data);
        } else {
            await api.createDesignation(data);
        }
        await loadDesignations();
    };

    // ---------- Service actions ----------
    const handleToggleService = async (id: number) => {
        const service = services.find((s) => s.id === id);
        if (!service) return;
        try {
            await api.toggleServiceStatus?.(id, !service.isActive);
            await loadServices();
        } catch (error) {
            console.error('Failed to toggle service', error);
        }
    };

    const handleAddService = () => {
        setEditingService(null);
        setServiceModalOpen(true);
    };

    const handleEditService = (service: Service) => {
        setEditingService(service);
        setServiceModalOpen(true);
    };

    const handleSaveService = async (data: Service) => {
        if (data.id) {
            await api.updateService(data.id, data);
        } else {
            await api.createService(data);
        }
        await loadServices();
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Manage your business configuration and preferences
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
                {/* Sidebar */}
                <div className="bg-white rounded-2xl border border-slate-200 p-2 h-fit">
                    <SettingsNavItem
                        icon={Users}
                        label="Staff & Services"
                        active={section === 'staff-services'}
                        onClick={() => setSection('staff-services')}
                    />
                    <SettingsNavItem
                        icon={CalendarCheck}
                        label="Appointments"
                        active={section === 'appointments'}
                        onClick={() => setSection('appointments')}
                    />
                    <SettingsNavItem
                        icon={Building2}
                        label="Business"
                        active={section === 'business'}
                        onClick={() => setSection('business')}
                    />
                </div>

                {/* Content */}
                <div>
                    {section === 'staff-services' && (
                        <StaffServicesSettings
                            designations={designations}
                            services={services}
                            loadingDesignations={loadingDesignations}
                            loadingServices={loadingServices}
                            onToggleDesignation={handleToggleDesignation}
                            onToggleService={handleToggleService}
                            onAddDesignation={handleAddDesignation}
                            onEditDesignation={handleEditDesignation}
                            onAddService={handleAddService}
                            onEditService={handleEditService}
                        />
                    )}

                    {section === 'appointments' && (
                        <AppointmentSettings
                            settings={appointmentSettings}
                            onChange={setAppointmentSettings}
                        />
                    )}

                    {section === 'business' && <BusinessSettings />}
                </div>
            </div>

            {/* Modals */}
            <DesignationModal
                isOpen={designationModalOpen}
                onClose={() => setDesignationModalOpen(false)}
                initialData={editingDesignation}
                onSave={handleSaveDesignation}
            />

            <ServiceModal
                isOpen={serviceModalOpen}
                onClose={() => setServiceModalOpen(false)}
                initialData={editingService}
                onSave={handleSaveService}
                categories={categories}
            />
        </div>
    );
}

/* ================================================================
   SETTINGS NAV ITEM
   ================================================================ */

interface SettingsNavItemProps {
    icon: React.ElementType;
    label: string;
    active: boolean;
    onClick: () => void;
}

function SettingsNavItem({
    icon: Icon,
    label,
    active,
    onClick,
}: SettingsNavItemProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-colors ${active
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
        >
            <Icon
                className={`w-4 h-4 ${active
                        ? 'text-purple-600'
                        : 'text-slate-400'
                    }`}
            />

            {label}
        </button>
    );
}

/* ================================================================
   STAFF & SERVICES
   ================================================================ */

function StaffServicesSettings({
  designations,
  services,
  loadingDesignations,
  loadingServices,
  onToggleDesignation,
  onToggleService,
  onAddDesignation,
  onEditDesignation,
  onAddService,
  onEditService,
}: {
  designations: DesignationDetails[];
  services: Service[];
  loadingDesignations: boolean;
  loadingServices: boolean;
  onToggleDesignation: (id: number) => void;
  onToggleService: (id: number) => void;
  onAddDesignation: () => void;
  onEditDesignation: (designation: DesignationDetails) => void;
  onAddService: () => void;
  onEditService: (service: Service) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Designations Card */}
      <SettingsCard
        title="Staff Roles & Positions"
        description="Manage the positions available when adding staff members."
        icon={Users}
        action={
          <button
            type="button"
            onClick={onAddDesignation}
            className="btn-modal-primary flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Role
          </button>
        }
      >
        {loadingDesignations ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {designations.map((designation) => (
              <div key={designation.id} className="py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800">{designation.name}</p>
                    {!designation.isActive && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                        Inactive
                      </span>
                    )}
                  </div>
                  {designation.description && (
                    <p className="text-xs text-slate-500 mt-1">{designation.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onEditDesignation(designation)}
                    className="p-2 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleDesignation(designation.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      designation.isActive
                        ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                        : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                    }`}
                  >
                    {designation.isActive ? (
                      <Power className="w-3.5 h-3.5" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SettingsCard>

      {/* Services Card */}
      <SettingsCard
        title="Services"
        description="Manage your services, pricing and appointment duration."
        icon={Scissors}
        action={
          <button
            type="button"
            onClick={onAddService}
            className="btn-modal-primary flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Service
          </button>
        }
      >
        {loadingServices ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {services.map((service) => (
              <div key={service.id} className="py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800">{service.name}</p>
                    {!service.isActive && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                    {service.category && <span>{service.category}</span>}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {service.durationMinutes} min
                    </span>
                    <span>₹{service.price.toLocaleString('en-IN')}</span>
                    {service.isOnlineBookable && (
                      <span className="text-emerald-600">Online booking</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onEditService(service)}
                    className="p-2 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleService(service.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      service.isActive
                        ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                        : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                    }`}
                  >
                    {service.isActive ? (
                      <Power className="w-3.5 h-3.5" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SettingsCard>
    </div>
  );
}

/* ================================================================
   APPOINTMENT SETTINGS
   ================================================================ */

interface AppointmentSettingsProps {
    settings: {
        confirmBeforeCancel: boolean;
        allowStatusChange: boolean;
        showFinishButton: boolean;
    };
    onChange: React.Dispatch<
        React.SetStateAction<{
            confirmBeforeCancel: boolean;
            allowStatusChange: boolean;
            showFinishButton: boolean;
        }>
    >;
}

function AppointmentSettings({
    settings,
    onChange,
}: AppointmentSettingsProps) {
    return (
        <SettingsCard
            title="Appointment Settings"
            description="Control how appointments are managed by your team."
            icon={CalendarCheck}
        >

            <div className="divide-y divide-slate-100">

                <SettingToggle
                    title="Confirm before cancelling"
                    description="Ask for confirmation before an appointment is cancelled."
                    checked={settings.confirmBeforeCancel}
                    onChange={(checked) =>
                        onChange((current) => ({
                            ...current,
                            confirmBeforeCancel: checked,
                        }))
                    }
                />

                <SettingToggle
                    title="Allow status changes"
                    description="Allow staff to change appointment status."
                    checked={settings.allowStatusChange}
                    onChange={(checked) =>
                        onChange((current) => ({
                            ...current,
                            allowStatusChange: checked,
                        }))
                    }
                />

                <SettingToggle
                    title="Show Finish Appointment button"
                    description="Display the Finish Appointment action for active appointments."
                    checked={settings.showFinishButton}
                    onChange={(checked) =>
                        onChange((current) => ({
                            ...current,
                            showFinishButton: checked,
                        }))
                    }
                />

            </div>
        </SettingsCard>
    );
}

/* ================================================================
   BUSINESS SETTINGS
   ================================================================ */

function BusinessSettings() {
    return (
        <SettingsCard
            title="Business Settings"
            description="Manage your basic business configuration."
            icon={Building2}
        >

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>
                    <label className="modal-label">
                        Business Name
                    </label>

                    <input
                        className="modal-input"
                        placeholder="Business name"
                    />
                </div>

                <div>
                    <label className="modal-label">
                        Timezone
                    </label>

                    <select className="modal-input">
                        <option value="Asia/Kolkata">
                            India Standard Time
                        </option>
                    </select>
                </div>

                <div>
                    <label className="modal-label">
                        Currency
                    </label>

                    <select className="modal-input">
                        <option value="INR">
                            INR (₹)
                        </option>
                    </select>
                </div>

            </div>

            <div className="mt-5 flex justify-end">
                <button
                    type="button"
                    className="btn-modal-primary flex items-center gap-2"
                >
                    <CheckCircle2 className="w-4 h-4" />
                    Save Changes
                </button>
            </div>

        </SettingsCard>
    );
}

/* ================================================================
   GENERIC SETTINGS CARD
   ================================================================ */

function SettingsCard({
    title,
    description,
    icon: Icon,
    action,
    children,
}: {
    title: string;
    description: string;
    icon: React.ElementType;
    action?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">

            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">

                <div className="flex items-center gap-3">

                    <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-purple-600" />
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-slate-800">
                            {title}
                        </h3>

                        <p className="text-xs text-slate-500 mt-0.5">
                            {description}
                        </p>
                    </div>

                </div>

                {action}

            </div>

            <div className="px-5">
                {children}
            </div>

        </div>
    );
}

/* ================================================================
   TOGGLE
   ================================================================ */

function SettingToggle({
    title,
    description,
    checked,
    onChange,
}: {
    title: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    return (
        <div className="py-4 flex items-center justify-between gap-6">

            <div>
                <p className="text-sm font-semibold text-slate-700">
                    {title}
                </p>

                <p className="text-xs text-slate-500 mt-1">
                    {description}
                </p>
            </div>

            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={`relative shrink-0 w-10 h-5.5 rounded-full transition-colors ${checked
                        ? 'bg-purple-600'
                        : 'bg-slate-300'
                    }`}
                aria-pressed={checked}
            >
                <span
                    className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${checked
                            ? 'translate-x-5'
                            : 'translate-x-0.5'
                        }`}
                />
            </button>

        </div>
    );
}