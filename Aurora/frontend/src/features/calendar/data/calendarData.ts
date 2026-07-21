import type { Staff, Appointment } from "../../../shared/types";


export const CALENDAR_STAFF: Staff[] = [
    {
        id: 's1',
        name: 'Ananya Roy',
        role: 'Senior Hair Stylist',
        color: '#9333EA', // Purple
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    },
    {
        id: 's2',
        name: 'Rahul Kumar',
        role: 'Barber & Stylist',
        color: '#2563EB', // Blue
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    },
    {
        id: 's3',
        name: 'Meera Das',
        role: 'Nail & Skin Specialist',
        color: '#D97706', // Amber
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    },
];

export const CALENDAR_APPOINTMENTS: Appointment[] = [
    {
        id: 'apt-1',
        customerId: 'c1',
        customerName: 'Priya Sharma',
        serviceName: 'Balayage & Hair Spa',
        staffId: 's1',
        staffName: 'Ananya Roy',
        startTime: '10:00 AM',
        endTime: '12:00 PM',
        durationMinutes: 120,
        status: 'completed',
        amount: 4500,
    },
    {
        id: 'apt-2',
        customerId: 'c2',
        customerName: 'Rohan Verma',
        serviceName: 'Beard Trim & Grooming',
        staffId: 's2',
        staffName: 'Rahul Kumar',
        startTime: '10:30 AM',
        endTime: '11:30 AM',
        durationMinutes: 60,
        status: 'completed',
        amount: 1500,
    },
    {
        id: 'apt-3',
        customerId: 'c3',
        customerName: 'Sneha Patel',
        serviceName: 'Gel Manicure',
        staffId: 's3',
        staffName: 'Meera Das',
        startTime: '11:00 AM',
        endTime: '12:00 PM',
        durationMinutes: 60,
        status: 'in_progress',
        amount: 2200,
    },
    {
        id: 'apt-4',
        customerId: 'c4',
        customerName: 'Kavita Iyer',
        serviceName: 'HydraFacial Treatment',
        staffId: 's1',
        staffName: 'Ananya Roy',
        startTime: '01:00 PM',
        endTime: '02:00 PM',
        durationMinutes: 60,
        status: 'confirmed',
        amount: 3800,
    },
    {
        id: 'apt-5',
        customerId: 'c5',
        customerName: 'Aman Deep',
        serviceName: 'Haircut & Styling',
        staffId: 's2',
        staffName: 'Rahul Kumar',
        startTime: '02:30 PM',
        endTime: '03:30 PM',
        durationMinutes: 60,
        status: 'scheduled',
        amount: 1200,
    },
];

export const TIME_SLOTS = [
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '01:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM',
    '06:00 PM',
    '07:00 PM',
    '08:00 PM',
    '09:00 PM',
];