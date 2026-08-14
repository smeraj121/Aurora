import type { AppointmentStatus, PaymentStatus } from "../shared/types/domain";
import type { CustomerPackage } from "./customerpackage.types";

export interface CustomerFormData {
    fullName: string;
    phone: string;
    email: string;
    birthday: string;
    gender: string;
    notes: string;
    emailOptIn: boolean;
}
export interface CustomerListItem {
    id: number;
    fullName: string;
    phone: string;
    avatar?: string | null;
    isVip: boolean;
    totalVisits: number;
    totalSpent: number;
    totalPaid?: number;
    lastVisitDate?: string | null;
}

export interface CustomerView extends CustomerListItem {
    birthday: any;
    gender: string;
    emailOptIn: boolean;
    email?: string | null;
    notes?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface CustomerDetails extends CustomerView {
    averageTicket: number;
    totalPaid: number;
    balanceDue?: number;
    history: CustomerVisit[];
    packages: CustomerPackage[];
    stats?: CustomerStats;
}

export interface CustomerVisit {
    id: number;
    appointmentDate: string;
    startTime: string;
    serviceName: string;
    staffName: string;
    amount: number;
    paidAmount?: number;
    paymentStatus?: PaymentStatus;
    status: AppointmentStatus;
    isPackageAppointment?: boolean;
    customerPackageId?: number | null;
    packageName?: string | null;
    services?: CustomerVisitService[];
    balanceDue?: number;
}

export interface CustomerVisitService {
    serviceId: number;
    serviceName: string;
    price: number;
    isPackage: boolean;
}

// shared/types/domain.ts

export interface CustomerStats {
    totalAppointments: number;
    totalSpent: number;
    totalPaid: number;
    balanceDue: number;
    activePackages: number;
    lastVisitDate?: string | null;
    daysSinceLastVisit?: number;
}

export interface CustomerCreateInput {
    fullName: string;
    phone: string;
    email?: string | null;
    notes?: string | null;
    isVip?: boolean;
}

export interface CustomerUpdateInput {
    fullName?: string;
    phone?: string;
    email?: string | null;
    notes?: string | null;
    isVip?: boolean;
}

export interface CustomersListResponse {
    success: boolean;
    data: CustomerListItem[];
}

export interface CustomerDetailsResponse {
    success: boolean;
    data: CustomerDetails;
}

export interface CustomerHistoryResponse {
    success: boolean;
    data: CustomerVisit[];
}

export interface CustomerPackagesResponse {
    success: boolean;
    data: CustomerPackage[];
}