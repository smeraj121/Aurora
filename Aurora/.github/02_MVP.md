# Aurora — Minimum Viable Product (MVP) Specification

**Version:** 1.0  
**Status:** Living Document  
**Last Updated:** May 2026  

---

## 📋 Table of Contents

- [Executive Summary](#executive-summary)
- [MVP Philosophy](#mvp-philosophy)
- [Core Modules](#core-modules)
- [Detailed Specifications](#detailed-specifications)
- [AI Capabilities](#ai-capabilities)
- [Integration Requirements](#integration-requirements)
- [Excluded Features](#excluded-features)
- [Success Criteria](#success-criteria)
- [Pilot Requirements](#pilot-requirements)
- [Technical Constraints](#technical-constraints)
- [Acceptance Criteria](#acceptance-criteria)

---

## Executive Summary

### What is the Aurora MVP?

The Aurora MVP is a **production-ready Growth Operating System** for appointment-based businesses. It demonstrates the full architecture, design philosophy, and core capabilities of the future Aurora platform while delivering immediate business value.

### MVP Definition

> **"The MVP succeeds when a pilot business can operate an entire working day using Aurora without returning to spreadsheets or paper."**

### Why This Scope

| Inclusion Criteria | Justification |
|-------------------|---------------|
| **Solves real problems** | Addresses no-shows, empty slots, manual admin |
| **Demonstrates value** | Shows immediate ROI (revenue, time saved) |
| **Validates architecture** | Proves the technical approach works |
| **Enables expansion** | Foundation for future features |
| **Delivers delight** | Premium UX builds trust and confidence |

---

## MVP Philosophy

### The "Three Questions" Principle

Every feature in the MVP must help answer at least one of these questions:

| Question | Purpose |
|----------|---------|
| **What needs my attention today?** | Dashboard, AI insights, reminders |
| **Where am I losing money?** | Empty slots, no-shows, retention |
| **What action should I take next?** | AI recommendations, quick actions |

### The "Three Outcomes" Principle

Every feature must deliver at least one of these outcomes:

| Outcome | Description | Example |
|---------|-------------|---------|
| **Save Time** | Reduce manual work | WhatsApp automation, drag-and-drop |
| **Make Money** | Increase revenue | AI opportunity engine, billing |
| **Reduce Stress** | Simplify operations | Dashboard clarity, conflict detection |

### UX Philosophy

```
┌─────────────────────────────────────────────────────────────┐
│  Apple + Linear + Stripe Dashboard + Notion               │
│                                                           │
│  ✅ Large whitespace                                      │
│  ✅ Premium typography                                    │
│  ✅ Rounded corners                                       │
│  ✅ Soft shadows                                          │
│  ✅ Fast animations                                       │
│  ✅ Beautiful empty states                                │
│  ✅ Modern icons                                          │
│  ✅ Responsive                                            │
│  ✅ Accessible                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Modules

### Module Overview

| # | Module | Purpose | Priority |
|---|--------|---------|----------|
| 1 | **Authentication** | Secure access, role-based permissions | Critical |
| 2 | **Dashboard** | Morning briefing, AI insights | Critical |
| 3 | **Calendar** | Visual scheduling, drag-and-drop | Critical |
| 4 | **Appointments** | Complete appointment management | Critical |
| 5 | **Customers** | Customer profiles and history | High |
| 6 | **Staff** | Staff management and scheduling | High |
| 7 | **Billing** | Invoice generation and payments | High |
| 8 | **Reports** | Actionable business insights | Medium |
| 9 | **Online Booking** | Customer self-service booking | Medium |
| 10 | **WhatsApp** | Automated communication | Medium |
| 11 | **AI Opportunities** | Revenue opportunity detection | Medium |

### Module Dependency Map

```
┌─────────────────────────────────────────────────────────────┐
│  Authentication (Foundation)                               │
│  └── All modules depend on Auth                           │
├─────────────────────────────────────────────────────────────┤
│  Staff & Services (Foundation)                             │
│  └── Calendar, Appointments, Billing depend               │
├─────────────────────────────────────────────────────────────┤
│  Customers (Foundation)                                    │
│  └── Appointments, Billing, WhatsApp depend               │
├─────────────────────────────────────────────────────────────┤
│  Calendar → Appointments → Dashboard                       │
│  Appointments → Billing → Reports                          │
│  Customers → WhatsApp → Online Booking                     │
│  Dashboard → AI Opportunities                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Detailed Specifications

### 1. Authentication

**Purpose:** Secure access to the platform with role-based permissions.

#### Features

| Feature | Description | MVP |
|---------|-------------|-----|
| Login | Email + password authentication | ✅ |
| Logout | Session termination | ✅ |
| Registration | New business onboarding | ✅ |
| Password Reset | Forgot password flow | ✅ |
| Role-Based Access | Owner, Manager, Receptionist, Staff | ✅ |
| JWT Tokens | Stateless authentication | ✅ |
| Session Management | 24-hour session expiration | ✅ |

#### Roles & Permissions

| Permission | Owner | Manager | Receptionist | Staff |
|------------|-------|---------|--------------|-------|
| View Dashboard | ✅ | ✅ | ✅ | ❌ |
| Manage Appointments | ✅ | ✅ | ✅ | ❌ |
| View Own Schedule | ✅ | ✅ | ✅ | ✅ |
| Manage Customers | ✅ | ✅ | ✅ | ❌ |
| Manage Staff | ✅ | ✅ | ❌ | ❌ |
| Manage Services | ✅ | ✅ | ❌ | ❌ |
| Manage Billing | ✅ | ✅ | ✅ | ❌ |
| View Reports | ✅ | ✅ | ❌ | ❌ |
| Manage Settings | ✅ | ❌ | ❌ | ❌ |

#### API Endpoints

```
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/register
POST   /api/v1/auth/refresh
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
GET    /api/v1/auth/me
```

#### UI Requirements

```
┌─────────────────────────────────────────────────────────────┐
│  Aurora                                                    │
│  Growth Operating System for Appointment Businesses        │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Email Address                                     │   │
│  │  ┌─────────────────────────────────────────────┐  │   │
│  │  │  saba@glowskinclinic.com                   │  │   │
│  │  └─────────────────────────────────────────────┘  │   │
│  │                                                   │   │
│  │  Password                                         │   │
│  │  ┌─────────────────────────────────────────────┐  │   │
│  │  │  •••••••••••                               │  │   │
│  │  └─────────────────────────────────────────────┘  │   │
│  │                                                   │   │
│  │  [Sign In]  [Forgot Password?]                   │   │
│  │                                                   │   │
│  │  Don't have an account? [Start Free Trial]       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

### 2. Dashboard

**Purpose:** The business owner's morning briefing that answers "What should I do today to make more money?"

#### Core Metrics

| Metric | Description | Calculation |
|--------|-------------|-------------|
| Today's Revenue | Revenue from completed appointments | Sum of today's completed invoices |
| Appointments Today | Total appointments scheduled | Count of today's appointments |
| Occupancy | Staff utilization rate | (Booked hours / Total hours) × 100 |
| New Customers | First-time customers today | Count of unique customers with no prior visits |

#### AI Business Advisor (Hero Section)

**Purpose:** Display actionable opportunities to increase revenue.

| Opportunity Type | Detection Logic | Action |
|-----------------|-----------------|--------|
| Empty Slots | Tomorrow's schedule has availability | Create campaign to fill slots |
| Inactive Customers | No visit in 90+ days | Send re-engagement offers |
| Upcoming Birthdays | Birthdays in next 7 days | Send birthday offers |
| Revenue Decline | Revenue down 10%+ vs. previous period | Investigate and act |

#### Quick Actions

```
┌─────────────────────────────────────────────────────────────┐
│  [New Appointment]  [New Customer]  [Billing]  [Report]    │
└─────────────────────────────────────────────────────────────┘
```

#### UI Requirements

```
┌─────────────────────────────────────────────────────────────┐
│  Good Morning, Saba 🎉                                     │
│  Here's what's happening with Glow Skin Clinic today.      │
├─────────────────────────────────────────────────────────────┤
│  Revenue        Appointments    Occupancy    New Customers │
│  ₹38,500        24             68%          5             │
│  ↑ 18%          ↑ 4            ↑ 12%        ↑ 2           │
├─────────────────────────────────────────────────────────────┤
│  🎯 AI Business Advisor                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ⚡ Fill 7 empty slots tomorrow                     │   │
│  │ Lost revenue: ₹14,200                              │   │
│  │ [Send Campaign]                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 👤 42 customers inactive for 90+ days              │   │
│  │ Potential revenue: ₹1,82,000                       │   │
│  │ [Send Re-engagement]                               │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Today's Schedule                                          │
│  Dr. Arjun ████████░░ 80%    Priya █████████░ 90%        │
│  Neha ██████░░░░ 60%         Riya ████████░░ 80%        │
├─────────────────────────────────────────────────────────────┤
│  Quick Actions                                             │
│  [+ Appointment] [+ Customer] [Billing] [Report]          │
└─────────────────────────────────────────────────────────────┘
```

#### API Endpoints

```
GET    /api/v1/dashboard/metrics
GET    /api/v1/dashboard/insights
GET    /api/v1/dashboard/schedule
GET    /api/v1/dashboard/ai-opportunities
```

---

### 3. Calendar

**Purpose:** The heart of Aurora — beautiful, drag-and-drop scheduling.

#### Views

| View | Description | MVP |
|------|-------------|-----|
| Day View | Hourly timeline, staff columns | ✅ |
| Week View | 7-day grid with staff columns | ✅ |
| Month View | 30-day grid with dots | ✅ |

#### Features

| Feature | Description | MVP |
|---------|-------------|-----|
| Drag & Drop | Reorder appointments | ✅ |
| Resize | Change appointment duration | ✅ |
| Staff Color Coding | Each staff member has a color | ✅ |
| Single Click | Select appointment | ✅ |
| Double Click | Open appointment details | ✅ |
| Right Click | Context menu | ✅ |
| Navigation | Previous/Next, Today, Date picker | ✅ |
| View Toggle | Day/Week/Month | ✅ |
| Buffer Time | Auto-add between appointments | ✅ |
| Past Appointments | Muted appearance | ✅ |
| Cancelled Appointments | Strike-through | ✅ |
| Completed Appointments | Green indicator | ✅ |
| Walk-ins | Show as "available now" | ✅ |
| Waitlist | Priority queue display | ✅ |

#### Appointment Display

```
┌─────────────────────────────────────────────────────────────┐
│  11:00 AM  ┌──────────────────────────────────────────┐   │
│            │ HydraFacial                              │   │
│            │ Anita Singh              │ Status: ✅   │   │
│            │ Staff: Priya             │ 60 min       │   │
│            └──────────────────────────────────────────┘   │
│            ┌──────────────────────────────────────────┐   │
│  12:00 PM  │ Chemical Peel                           │   │
│            │ Neha Sharma              │ Status: ⏳   │   │
│            │ Staff: Neha              │ 45 min       │   │
│            └──────────────────────────────────────────┘   │
│            ┌──────────────────────────────────────────┐   │
│  1:00 PM   │ BREAK                    │ Staff: Priya │   │
│            └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

#### API Endpoints

```
GET    /api/v1/calendar/day?date=2026-05-24
GET    /api/v1/calendar/week?start=2026-05-24
GET    /api/v1/calendar/month?month=2026-05
GET    /api/v1/calendar/availability?date=2026-05-24&staffId=...
```

---

### 4. Appointments

**Purpose:** Complete appointment management with status tracking.

#### Status Flow

```
┌─────────────────────────────────────────────────────────────┐
│  ┌──────────────┐                                         │
│  │  Scheduled   │ (Created, awaiting confirmation)        │
│  └──────────────┘                                         │
│         ↓                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  Confirmed   │  │  Cancelled   │  │   No-Show    │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│         ↓                                                  │
│  ┌──────────────┐                                         │
│  │ In Progress  │ (Service started)                       │
│  └──────────────┘                                         │
│         ↓                                                  │
│  ┌──────────────┐                                         │
│  │  Completed   │ (Service done, ready for billing)       │
│  └──────────────┘                                         │
└─────────────────────────────────────────────────────────────┘
```

#### Creation Flow

```
Step 1: Search/Select Customer
   ↓
Step 2: Select Service
   ↓
Step 3: Select Staff (auto-assign or manual)
   ↓
Step 4: Choose Date/Time (suggest earliest available)
   ↓
Step 5: Confirm Booking
   ↓
Step 6: Send WhatsApp Confirmation (auto)
```

#### Data Model

```typescript
interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  serviceId: string;
  serviceName: string;
  staffId: string;
  staffName: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  isWalkIn: boolean;
  reminderSent: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Validation Rules

| Rule | Description |
|------|-------------|
| Customer Required | Must select an existing customer |
| Service Required | Must select an active service |
| Staff Required | Must select an available staff member |
| Future Time | Start time must be in the future |
| No Conflict | Staff must not be double-booked |
| Within Hours | Within business hours |
| Duration Valid | Between 15-480 minutes |

#### API Endpoints

```
GET    /api/v1/appointments
GET    /api/v1/appointments/today
GET    /api/v1/appointments/upcoming
GET    /api/v1/appointments/{id}
POST   /api/v1/appointments
PUT    /api/v1/appointments/{id}
PATCH  /api/v1/appointments/{id}/status
DELETE /api/v1/appointments/{id}
GET    /api/v1/appointments/search
```

---

### 5. Customers

**Purpose:** Complete customer profiles with visit history.

#### Profile View

```
┌─────────────────────────────────────────────────────────────┐
│  ✨ Anita Singh                      VIP                   │
│  +91 98765 43210  anita.singh@gmail.com                     │
│  Total Visits: 12  Last Visit: 10 May 2025                 │
│  [Message] [Call] [Book Appointment]                       │
├─────────────────────────────────────────────────────────────┤
│  Customer Lifetime Value: ₹28,500                          │
│  Loyalty Tier: Gold (3 more to Platinum)                   │
│  Preferred Expert: Priya                                   │
├─────────────────────────────────────────────────────────────┤
│  Personal Information                                      │
│  Birthday: 14 Feb 1991                                     │
│  Gender: Female                                            │
│  Skin Type: Combination                                    │
│  Allergies: None                                           │
│  Referred By: Pooja Mehta                                  │
├─────────────────────────────────────────────────────────────┤
│  Timeline                                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Today    ⏰ 11:00 AM  HydraFacial                 │   │
│  │ 10 May   ✅ Visit    ₹2,500  HydraFacial          │   │
│  │ 28 Apr   ✅ Visit    ₹3,500  Chemical Peel        │   │
│  │ 15 Apr   ✅ Visit    ₹2,500  HydraFacial          │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Notes: Prefers organic products. Sensitive to fragrances. │
└─────────────────────────────────────────────────────────────┘
```

#### Data Model

```typescript
interface Customer {
  id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone: string; // Required, unique
  gender?: 'male' | 'female' | 'other';
  birthDate?: Date;
  anniversary?: Date;
  skinType?: string;
  allergies?: string;
  preferredStaffId?: string;
  notes?: string;
  totalVisits: number;
  totalSpent: number;
  lastVisitAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

#### CLV Calculation

```
CLV = (Average Visit Value) × (Average Visits/Year) × (Average Retention Years)

Example:
Average Visit Value: ₹2,500
Average Visits/Year: 12
Average Retention: 3 years
CLV = ₹2,500 × 12 × 3 = ₹90,000
```

#### API Endpoints

```
GET    /api/v1/customers
GET    /api/v1/customers/{id}
GET    /api/v1/customers/{id}/timeline
GET    /api/v1/customers/{id}/appointments
GET    /api/v1/customers/search
POST   /api/v1/customers
PUT    /api/v1/customers/{id}
DELETE /api/v1/customers/{id}
```

---

### 6. Staff

**Purpose:** Manage employees, schedules, and availability.

#### Data Model

```typescript
interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'receptionist' | 'staff' | 'therapist';
  services: string[]; // Service IDs
  schedule: WorkSchedule;
  commissionRate: number;
  maxAppointmentsPerDay: number;
  breakTimes: { start: string; end: string }[];
  isActive: boolean;
  metrics: {
    appointments: number;
    revenue: number;
    rating: number;
    retentionRate: number;
    noShowRate: number;
  };
}
```

#### Schedule Configuration

```typescript
interface WorkSchedule {
  monday: WorkDay;
  tuesday: WorkDay;
  wednesday: WorkDay;
  thursday: WorkDay;
  friday: WorkDay;
  saturday: WorkDay;
  sunday: WorkDay;
}

interface WorkDay {
  isWorking: boolean;
  start: string; // "09:00"
  end: string;   // "18:00"
  breaks: { start: string; end: string }[];
}
```

#### API Endpoints

```
GET    /api/v1/staff
GET    /api/v1/staff/{id}
POST   /api/v1/staff
PUT    /api/v1/staff/{id}
GET    /api/v1/staff/{id}/schedule
PUT    /api/v1/staff/{id}/schedule
GET    /api/v1/staff/{id}/performance
```

---

### 7. Billing

**Purpose:** Generate invoices and track payments.

#### Invoice Flow

```
Service Completed
       ↓
Open Billing
       ↓
Select Customer
       ↓
Add Services (auto-populated)
       ↓
Apply Discounts (if any)
       ↓
Calculate Tax
       ↓
Select Payment Method
       ↓
Record Payment
       ↓
Send WhatsApp Invoice
```

#### Data Model

```typescript
interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  staffId?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'upi' | 'other';
  paymentStatus: 'paid' | 'pending' | 'overdue';
  paidAt?: Date;
  notes?: string;
  createdAt: Date;
}

interface InvoiceItem {
  serviceId: string;
  serviceName: string;
  quantity: number;
  price: number;
  total: number;
}
```

#### Features

| Feature | Description | MVP |
|---------|-------------|-----|
| Invoice Generation | From appointment or customer | ✅ |
| Payment Recording | Cash, Card, UPI | ✅ |
| Discounts | Percentage or fixed amount | ✅ |
| Tax Calculation | GST/other taxes | ✅ |
| Invoice History | Customer timeline | ✅ |
| PDF Export | Download invoice | ✅ |
| WhatsApp Sending | Send invoice via WhatsApp | ✅ |

#### API Endpoints

```
GET    /api/v1/invoices
GET    /api/v1/invoices/{id}
POST   /api/v1/invoices
PUT    /api/v1/invoices/{id}
PATCH  /api/v1/invoices/{id}/payment
GET    /api/v1/invoices/{id}/pdf
POST   /api/v1/invoices/{id}/send
```

---

### 8. Reports

**Purpose:** Provide actionable business insights.

#### Report Types

| Report | Data | Visualization |
|--------|------|---------------|
| Revenue Report | Daily/weekly/monthly trends | Line/Bar chart |
| Appointment Report | Volume, status breakdown | Bar chart, pie chart |
| Customer Report | Growth, retention rate | Line chart |
| Staff Report | Utilization, revenue per staff | Bar chart, pie chart |
| Service Report | Popularity, revenue per service | Bar chart |

#### Key Metrics

| Metric | Description |
|--------|-------------|
| Total Revenue | Revenue for selected period |
| Total Appointments | Appointments for selected period |
| New Customers | First-time customers |
| Repeat Customers | Customers with 2+ visits |
| Staff Utilization | (Booked hours / Total hours) × 100 |
| Average Ticket Size | Revenue / Number of appointments |

#### API Endpoints

```
GET    /api/v1/reports/revenue
GET    /api/v1/reports/appointments
GET    /api/v1/reports/customers
GET    /api/v1/reports/staff
GET    /api/v1/reports/services
```

---

### 9. Online Booking

**Purpose:** Allow customers to book appointments without calling.

#### Booking Flow

```
Customer visits: business.aurora.app
         ↓
    Select Service
         ↓
    Select Staff (optional)
         ↓
    Select Date
         ↓
    Select Time
         ↓
    Enter Contact Details
         ↓
    Confirm Booking
         ↓
    WhatsApp Confirmation
```

#### Features

| Feature | Description | MVP |
|---------|-------------|-----|
| Service Selection | Browse available services | ✅ |
| Staff Selection | Optional expert selection | ✅ |
| Date/Time Selection | Live availability display | ✅ |
| Contact Details | Name, phone, email (optional) | ✅ |
| WhatsApp Confirmation | Auto-send confirmation | ✅ |
| Booking Links | business.aurora.app | ✅ |
| Business Branding | Logo, name, colors | ✅ |
| Availability Check | Real-time availability | ✅ |

#### WhatsApp Booking Flow

```
Customer: "Hi, I want to book a HydraFacial tomorrow. 10:30 AM."
         ↓
System: "Hello! We have the following slots available tomorrow:
         - 11:00 AM (Priya)
         - 1:30 PM (Priya)
         - 3:00 PM (Neha)
         Please reply with your preferred time."
         ↓
Customer: "1:30 PM"
         ↓
System: "Great! Your appointment is confirmed for tomorrow at 1:30 PM
         with Priya. We'll send you a reminder before your appointment."
```

#### API Endpoints

```
GET    /api/v1/booking/services
GET    /api/v1/booking/staff
GET    /api/v1/booking/availability
POST   /api/v1/booking/confirm
GET    /api/v1/booking/status/{id}
```

---

### 10. WhatsApp Automation

**Purpose:** Automate communication to reduce no-shows.

#### Notification Types

| Type | Trigger | Template |
|------|---------|----------|
| Booking Confirmation | Appointment created | "Hi {name}, your {service} with {staff} is confirmed for {date} at {time}." |
| Reminder | 24 hours before | "Reminder: Your appointment is tomorrow at {time} with {staff}." |
| Reschedule | Appointment changed | "Your appointment has been rescheduled to {new_date} at {new_time}." |
| Cancellation | Appointment cancelled | "Your appointment has been cancelled. Click to reschedule." |
| No-Show Follow-up | Missed appointment | "We missed you! Click to reschedule." |
| Review Request | After service | "How was your experience? Rate us: {link}" |
| Birthday Wish | Customer birthday | "Happy Birthday! Enjoy 20% off your next service." |
| Payment Receipt | Payment recorded | "Thank you for your payment of ₹{amount}." |

#### API Endpoints

```
GET    /api/v1/whatsapp/templates
PUT    /api/v1/whatsapp/templates/{id}
GET    /api/v1/whatsapp/history
POST   /api/v1/whatsapp/send
```

---

### 11. AI Opportunity Engine

**Purpose:** Help businesses increase revenue through AI-driven suggestions.

#### Opportunity Detection

| Opportunity | Detection | Display |
|-------------|-----------|---------|
| Empty Slots | Tomorrow's schedule gaps | "Fill 7 empty slots tomorrow - Potential revenue: ₹14,200" |
| Inactive Customers | 90+ days no visit | "42 customers haven't visited - Potential: ₹1,82,000" |
| Birthdays | Next 7 days | "8 birthdays this week - Send offers" |

#### Data Model

```typescript
interface Opportunity {
  id: string;
  type: 'empty_slot' | 'inactive' | 'birthday';
  title: string;
  description: string;
  potentialRevenue: number;
  expectedBookings: { min: number; max: number };
  priority: 'high' | 'medium' | 'low';
  action: {
    type: 'send_campaign' | 'send_offer';
    label: string;
    payload: any;
  };
}
```

#### API Endpoints

```
GET    /api/v1/ai/opportunities
POST   /api/v1/ai/opportunities/{id}/execute
POST   /api/v1/ai/opportunities/{id}/dismiss
GET    /api/v1/ai/opportunities/history
```

---

## AI Capabilities

### MVP AI Scope

```
┌─────────────────────────────────────────────────────────────┐
│  ✅ Opportunity Engine (MVP)                               │
│  ├─ Empty Slot Detection                                   │
│  ├─ Inactive Customer Detection                            │
│  ├─ Birthday Detection                                     │
│  └─ Campaign Suggestions                                   │
├─────────────────────────────────────────────────────────────┤
│  ❌ NOT IN MVP                                             │
│  ├─ AI Receptionist                                        │
│  ├─ AI Voice Assistant                                     │
│  ├─ AI Chatbot                                             │
│  ├─ AI Upsell Suggestions                                  │
│  ├─ AI Smart Reports                                       │
│  ├─ AI Revenue Forecasts                                   │
│  └─ AI Demand Forecasting                                  │
└─────────────────────────────────────────────────────────────┘
```

### AI Principles

| Principle | Description |
|-----------|-------------|
| **Assistant, Not Replacement** | AI recommends, user decides |
| **Actionable** | Every recommendation has a clear action |
| **Measurable** | Track success/failure of recommendations |
| **Transparent** | Explain why recommendations are made |
| **Non-Intrusive** | Users can dismiss suggestions |

### Opportunity Scoring

```
Priority = (Potential Revenue × Estimated Conversion) / Effort

High Priority: > ₹50,000 potential
Medium Priority: ₹10,000 - ₹50,000
Low Priority: < ₹10,000
```

---

## Integration Requirements

### WhatsApp (Twilio)

| Requirement | Description |
|-------------|-------------|
| API Provider | Twilio WhatsApp Business API |
| Message Templates | Pre-approved templates |
| Opt-Out | Customer opt-out management |
| Rate Limiting | Respect WhatsApp rate limits |
| Logging | Full message audit trail |

### Online Booking Domain

| Requirement | Description |
|-------------|-------------|
| Subdomain | business.aurora.app |
| SSL | HTTPS required |
| Branding | Custom business branding |
| SEO | Basic SEO for booking pages |

---

## Excluded Features

### Not in MVP

| Feature | Reason | Target |
|---------|--------|--------|
| **Inventory Management** | Adds complexity, limited MVP value | v2 |
| **Payroll** | Legal complexity, varies by region | v2 |
| **Accounting** | Beyond core booking operations | v2 |
| **Mobile Apps** | Web covers MVP, native apps add time | v1.5 |
| **Voice AI** | Requires specialized infrastructure | v3 |
| **Multi-Branch** | Infrastructure complexity | v2 |
| **Advanced Marketing** | Beyond basic campaigns | v2 |
| **Demand Forecasting** | Requires data accumulation | v2 |
| **AI Receptionist** | Complex AI integration | v2.5 |
| **Advanced Analytics** | Beyond basic reports | v2 |

### Why These Are Excluded

```
┌─────────────────────────────────────────────────────────────┐
│  "Does this help businesses save time, make money,         │
│   or reduce stress?"                                      │
│                                                           │
│  If the answer is NO or NOT YET:                         │
│  → Exclude from MVP                                       │
│  → Add to backlog for future                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Success Criteria

### MVP Success Definition

> **"The MVP succeeds when a pilot business can operate an entire working day using Aurora without returning to spreadsheets or paper."**

### MVP Complete Checklist

```
✅ Staff can log in and view their schedule
✅ Customers can be created and searched
✅ Appointments can be booked, modified, cancelled
✅ Services can be configured
✅ Staff can be assigned to appointments
✅ Invoices can be generated
✅ Payments can be recorded
✅ Owner can view daily performance
✅ Online booking is functional
✅ WhatsApp confirmations are sent
✅ AI detects at least one opportunity
✅ No return to spreadsheets or paper
```

### Business KPIs

| Metric | Current (Manual) | Target (Aurora) |
|--------|------------------|-----------------|
| Appointment Utilization | 60% | 80% |
| No-Show Rate | 20% | 8% |
| Customer Retention | 40% | 65% |
| Revenue per Appointment | ₹2,500 | ₹3,200 |
| Repeat Visit Rate | 45% | 70% |
| Staff Admin Hours | 20/week | 5/week |

### Product KPIs

| Metric | Target |
|--------|--------|
| Daily Active Users | 80% of paying users |
| Booking Time | < 30 seconds |
| Dashboard Engagement | > 3 visits/day |
| AI Feature Adoption | > 50% of users |
| NPS Score | > 60 |

### Feature Adoption Targets

| Feature | Target |
|---------|--------|
| Dashboard | 100% |
| Calendar | 100% |
| Customers | 90% |
| WhatsApp Automation | 75% |
| AI Opportunities | 60% |
| Online Booking | 50% |
| Reports | 40% |

---

## Pilot Requirements

### Pilot Business Criteria

| Criteria | Requirement |
|----------|-------------|
| Business Type | Salon, dermatology, aesthetic clinic |
| Staff Size | 2-10 staff |
| Appointments/Day | 10-30 |
| Tech Comfort | Willing to try new software |
| Feedback | Willing to provide regular feedback |
| Commitment | 8-week pilot period |

### Pilot Onboarding

```
┌─────────────────────────────────────────────────────────────┐
│  Week 1: Setup                                             │
│  ├─ Account creation                                       │
│  ├─ Business configuration                                 │
│  ├─ Staff onboarding                                       │
│  └─ Service catalog setup                                  │
├─────────────────────────────────────────────────────────────┤
│  Week 2: Training                                          │
│  ├─ Staff training                                         │
│  ├─ Receptionist training                                  │
│  └─ Owner training                                         │
├─────────────────────────────────────────────────────────────┤
│  Week 3-8: Live Operations                                 │
│  ├─ Daily usage                                            │
│  ├─ Regular feedback                                       │
│  ├─ Bug reports                                            │
│  └─ Feature requests                                       │
├─────────────────────────────────────────────────────────────┤
│  Week 8: Review                                            │
│  ├─ Final feedback                                         │
│  ├─ Success metrics                                        │
│  └─ Go/No-Go decision                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Technical Constraints

### Performance Requirements

| Metric | Target |
|--------|--------|
| Dashboard Load | < 3 seconds |
| Page Navigation | < 1 second |
| Appointment Search | < 500ms |
| Calendar Render | < 2 seconds |
| API Response (p95) | < 200ms |
| Uptime | 99.5% |

### Browser Support

| Browser | Version |
|---------|---------|
| Chrome | 100+ |
| Firefox | 100+ |
| Safari | 15+ |
| Edge | 100+ |

### Device Support

| Device | Support |
|--------|---------|
| Desktop | Full |
| Tablet | Full (touch) |
| Mobile | Full (responsive) |

### Security Requirements

```
✅ JWT Authentication
✅ BCrypt Password Hashing
✅ Role-Based Authorization
✅ Tenant Isolation
✅ HTTPS in Production
✅ Audit Logging
✅ Input Validation (Client + Server)
✅ SQL Injection Prevention (EF Core)
✅ XSS Prevention (React auto-escaping)
```

---

## Acceptance Criteria

### Feature Acceptance

Each feature is complete when:

```
✅ Code compiles without errors
✅ All types are correct
✅ Validation implemented (client + server)
✅ Responsive design works
✅ Accessibility standards met
✅ Loading states shown
✅ Empty states shown
✅ Error states shown
✅ Documentation updated
✅ No TODOs remain
✅ No duplicate code
✅ Tests pass (unit + integration)
✅ Code reviewed
✅ Merged to main branch
```

### User Story Template

```
Title: [Feature] - [Action]

As a [user role]
I want to [action]
So that [benefit]

Acceptance Criteria:
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

Business Rules:
- [ ] Rule 1
- [ ] Rule 2

Design Requirements:
- [ ] Design requirement 1
- [ ] Design requirement 2
```

---

*This document defines the exact scope of the Aurora MVP. Any feature not listed here should not be implemented in the MVP unless explicitly approved by the Product Owner.*